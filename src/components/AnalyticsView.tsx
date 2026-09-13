import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  PieChart, 
  Award, 
  Zap,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDurationHours } from '../utils/timeUtils';

export const AnalyticsView: React.FC = () => {
  const { data, completedTasksCount, remainingTasksCount, totalStudyHours, completionPercentage } = useApp();

  // Weekly study data
  const weeklyData = [
    { day: 'Mon', hours: 4.5, target: 4 },
    { day: 'Tue', hours: 5.0, target: 4 },
    { day: 'Wed', hours: 3.5, target: 4 },
    { day: 'Thu', hours: 6.0, target: 4 },
    { day: 'Fri', hours: 4.0, target: 4 },
    { day: 'Sat', hours: 5.5, target: 5 },
    { day: 'Sun', hours: totalStudyHours, target: 4 },
  ];

  const maxHours = Math.max(...weeklyData.map(d => Math.max(d.hours, d.target)), 7);

  // Subject-wise time breakdown
  const categoryBreakdown: Record<string, number> = {};
  data.timetable.forEach(item => {
    const dur = calculateDurationHours(item.startTime, item.endTime);
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + dur;
  });

  const categoryColors: Record<string, string> = {
    study: 'bg-blue-500 text-blue-500',
    lecture: 'bg-indigo-500 text-indigo-500',
    project: 'bg-emerald-500 text-emerald-500',
    revision: 'bg-purple-500 text-purple-500',
    break: 'bg-amber-400 text-amber-500',
    meal: 'bg-orange-500 text-orange-500',
    exercise: 'bg-rose-500 text-rose-500',
    personal: 'bg-teal-500 text-teal-500',
  };

  const totalTrackedHours = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);

  // Habit consistency calculation
  const totalHabits = (data.habits || []).length;
  const avgStreak = totalHabits > 0 
    ? Math.round((data.habits || []).reduce((acc, h) => acc + h.streak, 0) / totalHabits)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Productivity & Academic Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time breakdown of your learning velocity, focus stamina, and discipline
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>Top Focus Window: 9:00 AM – 1:00 PM</span>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Planned vs Completed Hours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Today's Study Load
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {totalStudyHours}h
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              / {data.settings.dailyStudyTargetHours}h target
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalStudyHours >= data.settings.dailyStudyTargetHours ? 'Target met! Excellent.' : 'Scheduled today'}
          </p>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Schedule Completion
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {completionPercentage}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {completedTasksCount} done, {remainingTasksCount} pending
          </p>
        </div>

        {/* Habit Consistency */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Habit Consistency
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400">
              88%
            </span>
            <span className="text-xs text-orange-500 font-bold">High</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Average streak: {avgStreak} days
          </p>
        </div>

        {/* Efficiency Grade */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Productivity Score
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              A+
            </span>
            <span className="text-xs text-indigo-500 font-bold">(94/100)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Optimal balance of work & rest
          </p>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Study Hours Bar Graph */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Study Velocity (Hours)
              </h3>
              <p className="text-xs text-slate-500">
                Comparison of actual hours studied against daily target (4h)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="w-3 h-3 rounded-xs bg-blue-600" />
                Actual
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 bg-slate-400" />
                Target
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between gap-3 h-48 border-b border-slate-200 dark:border-slate-700 px-2">
              {weeklyData.map((d, i) => {
                const heightPercent = Math.round((d.hours / maxHours) * 100);
                const targetPercent = Math.round((d.target / maxHours) * 100);
                const isToday = i === 6;

                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md pointer-events-none z-10 whitespace-nowrap">
                      {d.hours}h ({d.target}h target)
                    </div>

                    {/* Bar container */}
                    <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg relative flex items-end justify-center h-full overflow-hidden">
                      {/* Target reference line */}
                      <div 
                        className="absolute w-full border-t border-dashed border-slate-400/70 z-10"
                        style={{ bottom: `${targetPercent}%` }}
                      />

                      {/* Actual bar fill */}
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isToday 
                            ? 'bg-gradient-to-t from-blue-600 to-indigo-600' 
                            : 'bg-blue-500/80 hover:bg-blue-600'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span className={`text-xs mt-2 font-semibold ${isToday ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Average: 4.8 hrs/day</span>
            <span className="text-emerald-600 font-bold">+12% vs last week</span>
          </div>
        </div>

        {/* Activity & Category Time Distribution */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Hours spent across subjects and activities today
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryBreakdown).map(([cat, hours]) => {
              const percent = totalTrackedHours > 0 ? Math.round((hours / totalTrackedHours) * 100) : 0;
              const colorClass = categoryColors[cat] || 'bg-slate-500 text-slate-500';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="capitalize">{cat}</span>
                    <span>{hours.toFixed(1)}h ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[0]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Top academic category today: <strong className="capitalize text-slate-900 dark:text-white">Study & Lectures</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
};
