import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppData, TimetableItem, Habit, TaskItem, StudyPlan, MotivationalQuote, UserSettings } from '../types';
import { getDefaultAppData } from '../utils/defaultData';
import { loadAppData, saveAppData, apiGenerateMotivation } from '../services/api';
import { getCurrentTimeString, getTodayDateString, timeToMinutes } from '../utils/timeUtils';
import { playSuccessChime, triggerConfetti, playReminderPing } from '../utils/soundAndFx';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'current' | 'missed' | 'success';
  timestamp: string;
}

interface AppContextType {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTime: string;
  currentDate: Date;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  openGenerateModal: boolean;
  setOpenGenerateModal: (open: boolean) => void;
  openRescheduleModal: boolean;
  setOpenRescheduleModal: (open: boolean) => void;
  notifications: AppNotification[];
  dismissNotification: (id: string) => void;
  currentActivity: TimetableItem | null;
  nextActivity: TimetableItem | null;
  completionPercentage: number;
  completedTasksCount: number;
  remainingTasksCount: number;
  totalStudyHours: number;
  toggleActivityCompletion: (id: string) => void;
  addActivity: (item: Omit<TimetableItem, 'id'>) => void;
  updateActivity: (item: TimetableItem) => void;
  deleteActivity: (id: string) => void;
  reorderActivities: (startIndex: number, endIndex: number) => void;
  toggleHabitToday: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'history'>) => void;
  deleteHabit: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  deleteTask: (id: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  dailyReset: () => Promise<void>;
  generateFreshMotivation: () => Promise<void>;
  toggleFavoriteQuote: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(getDefaultAppData());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeString());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [openGenerateModal, setOpenGenerateModal] = useState<boolean>(false);
  const [openRescheduleModal, setOpenRescheduleModal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hasNotifiedUpcoming, setHasNotifiedUpcoming] = useState<Set<string>>(new Set());

  // Load saved data on boot
  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
    });
  }, []);

  // Save whenever data updates
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Handle Theme
  useEffect(() => {
    const root = document.documentElement;
    const theme = data.settings?.theme || 'system';
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [data.settings?.theme]);

  // Live timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
      setCurrentTime(getCurrentTimeString(now));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate current & next activity
  const nowMinutes = timeToMinutes(currentTime);
  
  // Sorted items
  const sortedTimetable = [...(data.timetable || [])].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const currentActivity = sortedTimetable.find(item => {
    const s = timeToMinutes(item.startTime);
    const e = timeToMinutes(item.endTime);
    if (e >= s) {
      return nowMinutes >= s && nowMinutes < e;
    }
    return nowMinutes >= s || nowMinutes < e;
  }) || null;

  const nextActivity = sortedTimetable.find(item => {
    const s = timeToMinutes(item.startTime);
    return s > nowMinutes;
  }) || null;

  // Reminders for upcoming activities
  useEffect(() => {
    if (!data.settings?.remindersEnabled || !nextActivity) return;

    const nextStart = timeToMinutes(nextActivity.startTime);
    const minutesUntilNext = nextStart - nowMinutes;
    const alertWindow = data.settings.reminderMinutesBefore || 15;

    if (minutesUntilNext <= alertWindow && minutesUntilNext > 0) {
      if (!hasNotifiedUpcoming.has(nextActivity.id)) {
        setHasNotifiedUpcoming(prev => new Set(prev).add(nextActivity.id));
        
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          title: 'Upcoming Activity Reminder',
          message: `"${nextActivity.activity}" begins in ${minutesUntilNext} minutes (${nextActivity.startTime}).`,
          type: 'reminder',
          timestamp: currentTime
        };
        setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);

        if (data.settings.soundEnabled) {
          playReminderPing();
        }
      }
    }
  }, [currentTime, nextActivity, data.settings, hasNotifiedUpcoming, nowMinutes]);

  // Metrics
  const totalItemsCount = (data.timetable || []).length;
  const completedTasksCount = (data.timetable || []).filter(t => t.completed).length;
  const remainingTasksCount = totalItemsCount - completedTasksCount;
  const completionPercentage = totalItemsCount > 0 
    ? Math.round((completedTasksCount / totalItemsCount) * 100) 
    : 0;

  // Total planned study/productive hours (categories: study, lecture, project, revision)
  const productiveCategories = new Set(['study', 'lecture', 'project', 'revision']);
  const totalStudyHours = (data.timetable || []).reduce((acc, curr) => {
    if (productiveCategories.has(curr.category)) {
      const s = timeToMinutes(curr.startTime);
      const e = timeToMinutes(curr.endTime);
      const duration = e >= s ? e - s : (1440 - s) + e;
      return acc + (duration / 60);
    }
    return acc;
  }, 0);

  // Toggle activity completion
  const toggleActivityCompletion = useCallback((id: string) => {
    setData(prev => {
      const updated = prev.timetable.map(item => {
        if (item.id === id) {
          const nextState = !item.completed;
          if (nextState) {
            if (prev.settings.soundEnabled) playSuccessChime();
            triggerConfetti();
          }
          return { ...item, completed: nextState };
        }
        return item;
      });
      return { ...prev, timetable: updated };
    });
  }, []);

  // Add activity
  const addActivity = useCallback((item: Omit<TimetableItem, 'id'>) => {
    const newItem: TimetableItem = {
      ...item,
      id: `tt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    setData(prev => {
      const updated = [...prev.timetable, newItem].sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      return { ...prev, timetable: updated };
    });
  }, []);

  // Update activity
  const updateActivity = useCallback((item: TimetableItem) => {
    setData(prev => {
      const updated = prev.timetable.map(t => t.id === item.id ? item : t).sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      return { ...prev, timetable: updated };
    });
  }, []);

  // Delete activity
  const deleteActivity = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      timetable: prev.timetable.filter(t => t.id !== id)
    }));
  }, []);

  // Reorder activities
  const reorderActivities = useCallback((startIndex: number, endIndex: number) => {
    setData(prev => {
      const list = [...prev.timetable];
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);
      return { ...prev, timetable: list };
    });
  }, []);

  // Toggle habit today
  const toggleHabitToday = useCallback((id: string) => {
    const today = getTodayDateString();
    setData(prev => {
      const updated = prev.habits.map(habit => {
        if (habit.id === id) {
          const wasCompleted = !!habit.history[today];
          const newHistory = { ...habit.history, [today]: !wasCompleted };
          const newStreak = !wasCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);
          const newBest = Math.max(habit.bestStreak, newStreak);
          if (!wasCompleted) {
            if (prev.settings.soundEnabled) playSuccessChime();
            triggerConfetti();
          }
          return {
            ...habit,
            history: newHistory,
            streak: newStreak,
            bestStreak: newBest
          };
        }
        return habit;
      });
      return { ...prev, habits: updated };
    });
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'history'>) => {
    const today = getTodayDateString();
    const newHabit: Habit = {
      ...habit,
      id: `habit-${Date.now()}`,
      streak: 0,
      bestStreak: 0,
      history: { [today]: false }
    };
    setData(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setData(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== id) }));
  }, []);

  // Tasks
  const toggleTaskCompletion = useCallback((id: string) => {
    setData(prev => {
      const updated = prev.tasks.map(t => {
        if (t.id === id) {
          const next = !t.completed;
          if (next) {
            if (prev.settings.soundEnabled) playSuccessChime();
            triggerConfetti();
          }
          return { ...t, completed: next };
        }
        return t;
      });
      return { ...prev, tasks: updated };
    });
  }, []);

  const addTask = useCallback((task: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const today = getTodayDateString();
    const newTask: TaskItem = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: today
    };
    setData(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Motivation Quote generator
  const generateFreshMotivation = useCallback(async () => {
    try {
      const res = await apiGenerateMotivation({
        name: data.settings.name,
        completedCount: completedTasksCount,
        totalCount: totalItemsCount,
        studyHours: Math.round(totalStudyHours * 10) / 10,
        currentActivity: currentActivity?.activity || 'Study Session',
        missedCount: remainingTasksCount,
        timeOfDay: new Date().getHours() < 12 ? 'morning' : (new Date().getHours() < 17 ? 'afternoon' : 'evening')
      });
      
      const newQuote: MotivationalQuote = {
        id: `quote-${Date.now()}`,
        quote: res.quote,
        author: res.author,
        contextTag: res.contextTag,
        date: getTodayDateString(),
        isFavorite: false
      };

      setData(prev => ({
        ...prev,
        motivationHistory: [newQuote, ...(prev.motivationHistory || [])]
      }));
    } catch (e) {
      console.error(e);
    }
  }, [data.settings.name, completedTasksCount, totalItemsCount, totalStudyHours, currentActivity, remainingTasksCount]);

  const toggleFavoriteQuote = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      motivationHistory: prev.motivationHistory.map(q => 
        q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
      )
    }));
  }, []);

  // Daily Reset implementation
  const dailyReset = useCallback(async () => {
    const today = getTodayDateString();
    // Save yesterday's stats in productivity history
    const yesterdayRecord = {
      date: data.lastResetDate || today,
      completedCount: completedTasksCount,
      totalCount: totalItemsCount,
      studyHours: Math.round(totalStudyHours * 10) / 10,
      habitsCompleted: data.habits.filter(h => h.history[data.lastResetDate]).length
    };

    // Reset timetable completion
    const refreshedTimetable = data.timetable.map(item => ({
      ...item,
      completed: false
    }));

    // Update habits for new day
    const refreshedHabits = data.habits.map(habit => ({
      ...habit,
      history: {
        ...habit.history,
        [today]: false
      }
    }));

    setData(prev => ({
      ...prev,
      timetable: refreshedTimetable,
      habits: refreshedHabits,
      productivityHistory: [yesterdayRecord, ...(prev.productivityHistory || []).slice(0, 30)],
      lastResetDate: today
    }));

    await generateFreshMotivation();
  }, [data, completedTasksCount, totalItemsCount, totalStudyHours, generateFreshMotivation]);

  return (
    <AppContext.Provider
      value={{
        data,
        setData,
        activeTab,
        setActiveTab,
        currentTime,
        currentDate,
        isChatOpen,
        setIsChatOpen,
        openGenerateModal,
        setOpenGenerateModal,
        openRescheduleModal,
        setOpenRescheduleModal,
        notifications,
        dismissNotification,
        currentActivity,
        nextActivity,
        completionPercentage,
        completedTasksCount,
        remainingTasksCount,
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
        toggleActivityCompletion,
        addActivity,
        updateActivity,
        deleteActivity,
        reorderActivities,
        toggleHabitToday,
        addHabit,
        deleteHabit,
        toggleTaskCompletion,
        addTask,
        deleteTask,
        updateSettings,
        dailyReset,
        generateFreshMotivation,
        toggleFavoriteQuote
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
