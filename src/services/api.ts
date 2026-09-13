import { AppData, TimetableItem, MotivationalQuote, StudyTopic, ChatMessage } from '../types';
import { getDefaultAppData } from '../utils/defaultData';

const LOCAL_STORAGE_KEY = 'chronosage_app_data_v1';

export async function loadAppData(): Promise<AppData> {
  // First try server
  try {
    const res = await fetch('/api/storage');
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && serverData.timetable) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData));
        return serverData;
      }
    }
  } catch (err) {
    console.warn('Could not fetch data from server, trying local cache', err);
  }

  // Next try localStorage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Sync to server silently in background
      saveAppData(parsed).catch(() => {});
      return parsed;
    }
  } catch (err) {
    console.error('Error reading localStorage', err);
  }

  // Fallback to initial seed data
  const defaultData = getDefaultAppData();
  saveAppData(defaultData).catch(() => {});
  return defaultData;
}

export async function saveAppData(data: AppData): Promise<void> {
  // Always save locally immediately for zero latency
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }

  // Sync to backend file store
  try {
    await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn('Failed to sync data to backend server', err);
  }
}

export async function apiGenerateSchedule(params: {
  prompt: string;
  wakeUpTime: string;
  sleepTime: string;
  fixedEvents: any[];
  studentTargetHours: number;
}): Promise<{ success: boolean; items: TimetableItem[]; note?: string }> {
  const res = await fetch('/api/generate-schedule', {
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
  const res = await fetch('/api/reschedule', {
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
  const res = await fetch('/api/ai-chat', {
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
  const res = await fetch('/api/generate-motivation', {
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
  const res = await fetch('/api/generate-study-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to generate study plan');
  return res.json();
}
