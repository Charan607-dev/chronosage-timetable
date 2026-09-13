import { AppData, TimetableItem, MotivationalQuote, StudyTopic, ChatMessage } from '../types';
import { getDefaultAppData } from '../utils/defaultData';

const LOCAL_STORAGE_KEY = 'chronosage_app_data_v1';

// Render backend URL
const API_BASE_URL = 'https://chronosage-timetable.onrender.com';

export async function loadAppData(): Promise<AppData> {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('Error reading localStorage', err);
  }

  const defaultData = getDefaultAppData();

  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(defaultData)
    );
  } catch (err) {
    console.error('Failed to save default data', err);
  }

  return defaultData;
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }
}

export async function apiGenerateSchedule(params: {
  prompt: string;
  wakeUpTime: string;
  sleepTime: string;
  fixedEvents: any[];
  studentTargetHours: number;
}): Promise<{ success: boolean; items: TimetableItem[]; note?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/generate-schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) throw new Error('Failed to generate schedule with AI');

  return res.json();
}

export async function apiReschedule(params: {
  reason: string;
  currentTimetable: TimetableItem[];
  currentTime: string;
  sleepTime: string;
}): Promise<{ success: boolean; items: TimetableItem[]; explanation: string }> {
  const res = await fetch(`${API_BASE_URL}/api/reschedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) throw new Error('Failed to reschedule with AI');

  return res.json();
}

export async function apiAIChat(params: {
  message: string;
  chatHistory: ChatMessage[];
  timetable: TimetableItem[];
  tasks: any[];
  studyPlans: any[];
  settings: any;
  currentTime: string;
}): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE_URL}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) throw new Error('AI Chat response error');

  return res.json();
}

export async function apiGenerateMotivation(context: any): Promise<{
  success: boolean;
  quote: string;
  author: string;
  contextTag: string;
}> {
  const res = await fetch(`${API_BASE_URL}/api/generate-motivation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context })
  });

  if (!res.ok) throw new Error('Failed to generate motivation');

  return res.json();
}

export async function apiGenerateStudyPlan(params: {
  subject: string;
  examDate: string;
  totalChapters: number;
  difficulty: string;
  availableHoursPerDay: number;
  topicsList?: string[];
}): Promise<{ success: boolean; topics: StudyTopic[] }> {
  const res = await fetch(`${API_BASE_URL}/api/generate-study-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) throw new Error('Failed to generate study plan');

  return res.json();
}