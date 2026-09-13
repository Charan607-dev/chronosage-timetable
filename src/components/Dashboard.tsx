import React from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ListTodo, 
  GraduationCap, 
  MessageSquareQuote, 
  Flame,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CurrentActivityBanner } from './CurrentActivityBanner';
import { DailyMotivationCard } from './DailyMotivationCard';
import { TimetableTimeline } from './TimetableTimeline';
import { TimetableItem } from '../types';

interface DashboardProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (item: TimetableItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenAddModal,
  onOpenEditModal
}) => {
  const { 
    data, 
    timeGreeting, 
    completionPercentage, 
    completedTasksCount, 
    remainingTasksCount, 
    totalStudyHours,
    setOpenGenerateModal,
    setOpenRescheduleModal,
    setIsChatOpen
  } = useApp();

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Quick Actions Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">👋</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {timeGreeting}, {data.settings.name}!
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Let's optimize your study sessions, stay consistent, and accomplish today's targets.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOpenGenerateModal(true)}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Day</span>
          </button>

          <button
            onClick={() => setOpenRescheduleModal(true)}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-orange-500" />
            <span>Reschedule Day</span>
          </button>

          <button
            onClick={() => setIsChatOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Open AI Chat Assistant"
          >
            <Bot className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* 4 Core Quick Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Completion Percentage */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Today's Progress</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {completionPercentage}%
            </span>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Completed Blocks</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {completedTasksCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">
              activities done
            </span>
          </div>
        </div>

        {/* Tasks Remaining */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Remaining Today</span>
            <ListTodo className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {remainingTasksCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">
              blocks left
            </span>
          </div>
        </div>

        {/* Planned Study Hours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Study & Learning</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {totalStudyHours}h
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">
              / {data.settings.dailyStudyTargetHours}h target
            </span>
          </div>
        </div>

      </div>

      {/* Current & Next Activity Live Cards */}
      <CurrentActivityBanner />

      {/* Context-aware Motivation Banner */}
      <DailyMotivationCard />

      {/* Today's Full Timetable Timeline */}
      <TimetableTimeline 
        onOpenAddModal={onOpenAddModal}
        onOpenEditModal={onOpenEditModal}
      />

    </div>
  );
};
