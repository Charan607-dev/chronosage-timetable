export type Priority = 'low' | 'medium' | 'high';

export type ActivityCategory = 
  | 'study'
  | 'lecture'
  | 'project'
  | 'revision'
  | 'break'
  | 'meal'
  | 'exercise'
  | 'personal'
  | 'sleep';

export interface TimetableItem {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  activity: string;
  category: ActivityCategory;
  priority: Priority;
  completed: boolean;
  isFixed?: boolean;
  notes?: string;
  date?: string; // "YYYY-MM-DD"
}

export interface Habit {
  id: string;
  title: string;
  category: ActivityCategory;
  targetDaysPerWeek: number;
  history: Record<string, boolean>; // "YYYY-MM-DD" -> boolean
  streak: number;
  bestStreak: number;
  color?: string;
  icon?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  category: ActivityCategory;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
  estimatedMinutes?: number;
  notes?: string;
  createdAt: string;
}

export interface StudyTopic {
  id: string;
  name: string;
  estimatedHours: number;
  completed: boolean;
  scheduledDate?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface StudyPlan {
  id: string;
  subject: string;
  examDate: string;
  difficulty: 'easy' | 'medium' | 'hard';
  availableHoursPerDay: number;
  totalChapters: number;
  topics: StudyTopic[];
  createdAt: string;
  notes?: string;
}

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  contextTag?: string;
  date: string;
  isFavorite: boolean;
}

export interface UserSettings {
  name: string;
  theme: 'light' | 'dark' | 'system';
  wakeUpTime: string; // "07:00"
  sleepTime: string;  // "23:00"
  collegeHours: string; // e.g. "09:00 - 16:00"
  dailyStudyTargetHours: number; // e.g. 4
  preferredBreakMinutes: number; // e.g. 15
  soundEnabled: boolean;
  remindersEnabled: boolean;
  reminderMinutesBefore: number; // e.g. 15
}

export interface ProductivityHistoryRecord {
  date: string; // "YYYY-MM-DD"
  completedCount: number;
  totalCount: number;
  studyHours: number;
  habitsCompleted: number;
}

export interface AppData {
  settings: UserSettings;
  timetable: TimetableItem[];
  habits: Habit[];
  tasks: TaskItem[];
  studyPlans: StudyPlan[];
  motivationHistory: MotivationalQuote[];
  productivityHistory: ProductivityHistoryRecord[];
  lastResetDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'apply_schedule' | 'reschedule' | 'add_task';
    payload?: any;
    label?: string;
  };
}
