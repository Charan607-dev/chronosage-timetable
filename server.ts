import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = process.cwd();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Persistence directory
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Lazy Gemini AI helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ================= API ROUTES =================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'ChronoSage' });
});

// 1. Storage API
app.get('/api/storage', (req, res) => {
  try {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return res.json(JSON.parse(data));
    }
    return res.json(null);
  } catch (error) {
    console.error('Error reading storage:', error);
    return res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/storage', (req, res) => {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    return res.json({ success: true });
  } catch (error) {
    console.error('Error saving storage:', error);
    return res.status(500).json({ error: 'Failed to persist data' });
  }
});

// 2. Generate Schedule with AI
app.post('/api/generate-schedule', async (req, res) => {
  const { prompt, wakeUpTime = '07:00', sleepTime = '23:00', fixedEvents = [], studentTargetHours = 4 } = req.body;
  
  const ai = getAIClient();
  if (!ai) {
    // High-quality smart fallback schedule
    return res.json({
      success: true,
      items: getFallbackSchedule(prompt, wakeUpTime, sleepTime, fixedEvents),
      note: 'Generated with built-in student scheduling template'
    });
  }

  try {
    const systemPrompt = `You are ChronoSage, an expert student timetable and daily productivity planner.
The user is a student requesting a realistic, balanced, and non-overlapping daily timetable.
Parameters:
- Wake up time: ${wakeUpTime}
- Sleep time: ${sleepTime}
- Fixed commitments (DO NOT overlap with these): ${JSON.stringify(fixedEvents)}
- Student target study hours: ${studentTargetHours} hours

Rules:
1. Never create overlapping timetable slots.
2. Respect fixed events strictly (e.g. college lectures, labs, work).
3. Include realistic breaks (15-30 min) between intense study blocks (Pomodoro style).
4. Include meal times (breakfast, lunch, dinner).
5. Start time and End time must be in 24-hour format "HH:MM" (e.g. "09:00", "14:30").
6. Activity category must be one of: "study", "lecture", "project", "revision", "break", "meal", "exercise", "personal", "sleep".
7. Priority must be one of: "low", "medium", "high".
8. Include optional helpful notes for study and project sessions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Student instruction: "${prompt}"\nCreate the complete day's schedule from wake up until sleep. Return a structured JSON array of activities.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'List of timetable activities for the day',
          items: {
            type: Type.OBJECT,
            properties: {
              startTime: { type: Type.STRING, description: '24-hour format HH:MM' },
              endTime: { type: Type.STRING, description: '24-hour format HH:MM' },
              activity: { type: Type.STRING, description: 'Title of the activity' },
              category: { 
                type: Type.STRING, 
                description: 'study, lecture, project, revision, break, meal, exercise, personal, sleep'
              },
              priority: { type: Type.STRING, description: 'low, medium, high' },
              isFixed: { type: Type.BOOLEAN, description: 'True if fixed commitment' },
              notes: { type: Type.STRING, description: 'Optional practical tip or notes' }
            },
            required: ['startTime', 'endTime', 'activity', 'category', 'priority']
          }
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    const items = parsed.map((item: any, idx: number) => ({
      id: `ai-${Date.now()}-${idx}`,
      startTime: item.startTime,
      endTime: item.endTime,
      activity: item.activity,
      category: item.category || 'study',
      priority: item.priority || 'medium',
      isFixed: !!item.isFixed,
      completed: false,
      notes: item.notes || ''
    }));

    return res.json({ success: true, items });
  } catch (error) {
    console.error('Error generating AI schedule:', error);
    return res.json({
      success: true,
      items: getFallbackSchedule(prompt, wakeUpTime, sleepTime, fixedEvents),
      note: 'Fallback generated schedule applied.'
    });
  }
});

// 3. Smart Rescheduling
app.post('/api/reschedule', async (req, res) => {
  const { reason, currentTimetable = [], currentTime = '14:00', sleepTime = '23:00' } = req.body;

  const ai = getAIClient();
  if (!ai) {
    return res.json({
      success: true,
      items: fallbackReschedule(currentTimetable, currentTime, reason),
      explanation: `Adjusted remaining activities to accommodate: "${reason}"`
    });
  }

  try {
    const prompt = `Current time is ${currentTime}.
Sleep time is ${sleepTime}.
User's situation / rescheduling reason: "${reason}".

Existing timetable:
${JSON.stringify(currentTimetable, null, 2)}

Instructions:
1. Do NOT modify activities that are already marked completed (completed: true).
2. Do NOT move or delete fixed activities (isFixed: true) unless the user's prompt specifically mentions missing that fixed activity.
3. Intelligently rearrange the remaining uncompleted activities starting from ${currentTime} or the end of the current block.
4. Compress or shift slots so the user can still achieve their most important goals without burning out.
5. Provide the updated complete list of timetable items for the entire day.
6. Provide a short encouraging 1-2 sentence explanation of what was changed and why.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an intelligent rescheduling engine for students. Keep schedules realistic and avoid overlapping slots.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING, description: 'Short summary of the rescheduling' },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  category: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  isFixed: { type: Type.BOOLEAN },
                  completed: { type: Type.BOOLEAN },
                  notes: { type: Type.STRING }
                },
                required: ['startTime', 'endTime', 'activity', 'category', 'priority', 'completed']
              }
            }
          },
          required: ['explanation', 'items']
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      success: true,
      explanation: parsed.explanation || 'Rescheduled your day smoothly!',
      items: parsed.items || currentTimetable
    });
  } catch (error) {
    console.error('Error during AI rescheduling:', error);
    return res.json({
      success: true,
      items: fallbackReschedule(currentTimetable, currentTime, reason),
      explanation: `Adjusted your schedule smoothly based on your update: "${reason}"`
    });
  }
});

// 4. AI Chat Assistant
app.post('/api/ai-chat', async (req, res) => {
  const { message, chatHistory = [], timetable = [], tasks = [], studyPlans = [], settings = {}, currentTime = '12:00' } = req.body;

  const ai = getAIClient();
  if (!ai) {
    return res.json({
      reply: `I'm here to support your study goals! Right now, your schedule shows ${timetable.length} planned activities today. Keep up the great momentum! (Configure your GEMINI_API_KEY in Settings > Secrets for deep conversational reasoning).`
    });
  }

  try {
    const contextPrompt = `You are ChronoSage AI, a personal study companion and daily timetable architect for student "${settings.name || 'Student'}".
Current local time is ${currentTime}.
Student Settings:
- Target daily study: ${settings.dailyStudyTargetHours || 4} hours
- Wake up: ${settings.wakeUpTime || '07:00'}, Sleep: ${settings.sleepTime || '23:00'}

Today's Timetable:
${JSON.stringify(timetable.map(t => `${t.startTime}-${t.endTime}: ${t.activity} (${t.category}, ${t.completed ? 'Done' : 'Pending'})`))}

Pending Tasks:
${JSON.stringify(tasks.filter(t => !t.completed).map(t => `${t.title} [Priority: ${t.priority}]`))}

Active Study Plans:
${JSON.stringify(studyPlans.map(s => `${s.subject} (Exam: ${s.examDate})`))}

Guidelines:
- Give concise, direct, helpful, and student-focused answers.
- If asked "What should I do now?" or "What's my next activity?", calculate against ${currentTime} and tell them directly with practical focus advice.
- If asked to add or move a task, offer a suggested timetable slot.
- Keep the tone encouraging, structured, and pragmatic.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...chatHistory.slice(-6).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: contextPrompt
      }
    });

    return res.json({ reply: response.text?.trim() || "I'm reviewing your timetable. Let's tackle the next priority!" });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return res.json({
      reply: `You're currently on track! Focus on your next immediate milestone, take deep breaths, and tackle one priority at a time.`
    });
  }
});

// 5. Context-Aware Motivation Generator
app.post('/api/generate-motivation', async (req, res) => {
  const { context = {} } = req.body;
  const ai = getAIClient();

  if (!ai) {
    const fallbackQuotes = [
      { quote: "Every single hour of focused effort compounds into effortless mastery.", author: "James Clear", contextTag: "Consistency" },
      { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", contextTag: "Discipline" },
      { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", contextTag: "Persistence" }
    ];
    const picked = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    return res.json({ success: true, ...picked });
  }

  try {
    const prompt = `Generate a powerful, fresh, context-aware motivational message for student "${context.name || 'Student'}".
Context:
- Completed activities today: ${context.completedCount || 0} / ${context.totalCount || 0}
- Study hours completed: ${context.studyHours || 0} hrs
- Current time/context: ${context.timeOfDay || 'daytime'}
- Current / upcoming focus: ${context.currentActivity || 'General Study'}
- Missed tasks: ${context.missedCount || 0}

Requirements:
- If many tasks are completed: praise their momentum and encourage finishing strong.
- If tasks are missed or behind: be compassionate, eliminate guilt, and focus on resetting right now.
- If coding or deep STEM task: emphasize problem-solving grit and learning through iteration.
- Keep it concise (1-2 sentences), genuine, and punchy. No cliché boilerplate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an inspiring mentor for students. Craft unique, impactful wisdom.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING, description: 'The motivational advice or quote' },
            author: { type: Type.STRING, description: 'Author or Mentor persona' },
            contextTag: { type: Type.STRING, description: 'Category tag e.g. Focus, Resilience, Momentum' }
          },
          required: ['quote', 'author', 'contextTag']
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      success: true,
      quote: parsed.quote || "Focus on the process, and the results will take care of themselves.",
      author: parsed.author || "ChronoSage Mentor",
      contextTag: parsed.contextTag || "Focus & Grit"
    });
  } catch (error) {
    console.error('Error generating motivation:', error);
    return res.json({
      success: true,
      quote: "Do what you can, with what you have, right where you are.",
      author: "Theodore Roosevelt",
      contextTag: "Momentum"
    });
  }
});

// 6. Generate Study Plan with AI
app.post('/api/generate-study-plan', async (req, res) => {
  const { subject, examDate, totalChapters, difficulty, availableHoursPerDay, topicsList = [] } = req.body;
  const ai = getAIClient();

  if (!ai) {
    return res.json({
      success: true,
      topics: generateFallbackStudyPlan(subject, totalChapters || 5, examDate)
    });
  }

  try {
    const prompt = `Create an intelligent study breakdown for subject: "${subject}".
Exam date: ${examDate}.
Difficulty: ${difficulty}.
Available study hours per day: ${availableHoursPerDay} hrs.
Total chapters: ${totalChapters}.
Specific topics mentioned: ${JSON.stringify(topicsList)}.

Instructions:
1. Divide the syllabus into logical topics/modules.
2. Estimate realistic study hours for each (1 to 6 hours depending on difficulty).
3. Distribute scheduled review dates between today and the exam date.
4. Include a final revision and mock test topic before the exam date.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic advisor creating optimal study schedules using spaced learning principles.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Topic or chapter title' },
              estimatedHours: { type: Type.NUMBER, description: 'Estimated study hours needed' },
              difficulty: { type: Type.STRING, description: 'easy, medium, hard' },
              scheduledDate: { type: Type.STRING, description: 'YYYY-MM-DD target date' }
            },
            required: ['name', 'estimatedHours', 'difficulty']
          }
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    const topics = parsed.map((t: any, idx: number) => ({
      id: `topic-${Date.now()}-${idx}`,
      name: t.name,
      estimatedHours: t.estimatedHours || 2,
      difficulty: t.difficulty || 'medium',
      scheduledDate: t.scheduledDate || examDate,
      completed: false
    }));

    return res.json({ success: true, topics });
  } catch (error) {
    console.error('Error generating study plan:', error);
    return res.json({
      success: true,
      topics: generateFallbackStudyPlan(subject, totalChapters || 5, examDate)
    });
  }
});

// Fallback generators
function getFallbackSchedule(prompt: string, wake: string, sleep: string, fixed: any[]) {
  const lower = (prompt || '').toLowerCase();
  const hasPython = lower.includes('python') || lower.includes('coding') || lower.includes('program');
  const hasCollege = lower.includes('college') || lower.includes('class') || lower.includes('university');

  return [
    { id: 'f-1', startTime: wake, endTime: '08:00', activity: 'Morning Routine & Healthy Breakfast', category: 'meal', priority: 'medium', completed: false },
    { id: 'f-2', startTime: '08:15', endTime: '09:00', activity: 'Daily Planning & Key Concept Review', category: 'study', priority: 'medium', completed: false },
    ...(hasCollege ? [
      { id: 'f-3', startTime: '09:00', endTime: '12:30', activity: 'College Lectures & Academic Session', category: 'lecture', priority: 'high', isFixed: true, completed: false },
      { id: 'f-4', startTime: '12:30', endTime: '13:30', activity: 'Nutritious Lunch & Relaxing Break', category: 'meal', priority: 'medium', completed: false },
      { id: 'f-5', startTime: '13:30', endTime: '16:00', activity: 'College Afternoon Labs & Projects', category: 'lecture', priority: 'high', isFixed: true, completed: false },
    ] : [
      { id: 'f-3', startTime: '09:00', endTime: '11:00', activity: 'Deep Work: Core Subject Focus', category: 'study', priority: 'high', completed: false },
      { id: 'f-4', startTime: '11:00', endTime: '11:30', activity: 'Hydration & Mindful Break', category: 'break', priority: 'low', completed: false },
      { id: 'f-5', startTime: '11:30', endTime: '13:00', activity: 'Problem Solving & Exercises', category: 'study', priority: 'high', completed: false },
      { id: 'f-6', startTime: '13:00', endTime: '14:00', activity: 'Lunch & Fresh Air Break', category: 'meal', priority: 'medium', completed: false },
      { id: 'f-7', startTime: '14:00', endTime: '16:00', activity: 'Academic Projects & Assignments', category: 'project', priority: 'high', completed: false },
    ]),
    { id: 'f-8', startTime: '16:30', endTime: '18:30', activity: hasPython ? 'Python Programming & Problem Solving' : 'Dedicated Study Block', category: 'study', priority: 'high', completed: false, notes: 'Write code, test logic, solve DSA problems' },
    { id: 'f-9', startTime: '18:30', endTime: '19:15', activity: 'Physical Activity & Refreshing Walk', category: 'exercise', priority: 'medium', completed: false },
    { id: 'f-10', startTime: '19:30', endTime: '20:30', activity: 'Evening Project Work / Homework', category: 'project', priority: 'high', completed: false },
    { id: 'f-11', startTime: '20:30', endTime: '21:15', activity: 'Dinner & Leisure Free Time', category: 'meal', priority: 'medium', completed: false },
    { id: 'f-12', startTime: '21:15', endTime: '22:15', activity: 'Topic Revision & Flashcards', category: 'revision', priority: 'medium', completed: false },
    { id: 'f-13', startTime: '22:15', endTime: sleep, activity: 'Wind Down & Digital Detox', category: 'personal', priority: 'low', completed: false }
  ];
}

function fallbackReschedule(timetable: any[], currentTime: string, reason: string) {
  // Simple time shift forward for pending activities
  const [currH, currM] = currentTime.split(':').map(Number);
  let nextStartMin = Math.max((currH * 60 + currM), 0);

  return timetable.map(item => {
    if (item.completed || item.isFixed) {
      return item;
    }
    const [sH, sM] = item.startTime.split(':').map(Number);
    const [eH, eM] = item.endTime.split(':').map(Number);
    const duration = Math.max(15, (eH * 60 + eM) - (sH * 60 + sM));

    const sHStr = String(Math.floor(nextStartMin / 60) % 24).padStart(2, '0');
    const sMStr = String(nextStartMin % 60).padStart(2, '0');
    const endMin = Math.min(1439, nextStartMin + duration);
    const eHStr = String(Math.floor(endMin / 60) % 24).padStart(2, '0');
    const eMStr = String(endMin % 60).padStart(2, '0');

    nextStartMin = endMin + 10; // 10 min break buffer

    return {
      ...item,
      startTime: `${sHStr}:${sMStr}`,
      endTime: `${eHStr}:${eMStr}`,
      notes: `${item.notes ? item.notes + ' | ' : ''}Rescheduled for: ${reason}`
    };
  });
}

function generateFallbackStudyPlan(subject: string, count: number, examDate: string) {
  const topics = [];
  for (let i = 1; i <= count; i++) {
    topics.push({
      id: `topic-${Date.now()}-${i}`,
      name: `${subject} - Module ${i}: Core Principles & Practice`,
      estimatedHours: 2.5,
      difficulty: i <= 2 ? 'easy' : (i <= 4 ? 'medium' : 'hard'),
      scheduledDate: examDate,
      completed: false
    });
  }
  topics.push({
    id: `topic-${Date.now()}-rev`,
    name: `${subject} - Comprehensive Revision & Practice Exam`,
    estimatedHours: 3.5,
    difficulty: 'medium',
    scheduledDate: examDate,
    completed: false
  });
  return topics;
}

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChronoSage server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
