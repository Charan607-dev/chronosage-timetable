import React, { useState } from 'react';
import { 
  CheckSquare, 
  Flame, 
  Plus, 
  Check, 
  Trash2, 
  Clock, 
  Tag, 
  Calendar, 
  Repeat, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Habit, TaskItem, ActivityCategory, Priority } from '../types';
import { getTodayDateString } from '../utils/timeUtils';

export const TasksAndHabitsView: React.FC = () => {
  const { 
    data, 
    toggleHabitToday, 
    addHabit, 
    deleteHabit, 
    toggleTaskCompletion, 
    addTask, 
    deleteTask 
  } = useApp();

  const [activeSection, setActiveSection] = useState<'habits' | 'tasks'>('habits');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // New Habit form state
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState<ActivityCategory>('study');
  const [habitTargetDays, setHabitTargetDays] = useState(6);

  // New Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<ActivityCategory>('study');
  const [taskPriority, setTaskPriority] = useState<Priority>('high');
  const [taskDueDate, setTaskDueDate] = useState(getTodayDateString());
  const [taskEstMinutes, setTaskEstMinutes] = useState(30);

  const today = getTodayDateString();

  // Generate last 7 days keys
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    last7Days.push(`${yr}-${mo}-${da}`);
  }

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    addHabit({
      title: habitTitle.trim(),
      category: habitCategory,
      targetDaysPerWeek: Number(habitTargetDays) || 6,
      color: '#3b82f6'
    });
    setHabitTitle('');
    setShowAddHabit(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      category: taskCategory,
      priority: taskPriority,
      completed: false,
      dueDate: taskDueDate,
      estimatedMinutes: Number(taskEstMinutes)
    });
    setTaskTitle('');
    setShowAddTask(false);
  };

  const totalHabits = (data.habits || []).length;
  const habitsDoneToday = (data.habits || []).filter(h => h.history[today]).length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((habitsDoneToday / totalHabits) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Daily Habits & Task Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Build discipline, maintain study streaks, and check off milestone tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveSection('habits')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeSection === 'habits' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Habits ({totalHabits})
            </button>
            <button
              onClick={() => setActiveSection('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeSection === 'tasks' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tasks ({(data.tasks || []).length})
            </button>
          </div>

          <button
            onClick={() => activeSection === 'habits' ? setShowAddHabit(true) : setShowAddTask(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{activeSection === 'habits' ? 'New Habit' : 'New Task'}</span>
          </button>
        </div>
      </div>

      {/* SECTION: HABITS */}
      {activeSection === 'habits' && (
        <div className="space-y-4">
          
          {/* Habits Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-900/60">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Today's Habits Completed
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">
                  {habitsDoneToday} / {totalHabits}
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  ({habitCompletionRate}%)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-900/60">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Active Streaks
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-orange-900 dark:text-orange-100">
                  {Math.max(...(data.habits || []).map(h => h.streak), 0)} days
                </span>
                <span className="text-xs text-orange-600 dark:text-orange-400">Top Streak</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-900/60">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Discipline Status
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                  {habitCompletionRate >= 75 ? 'Consistent 🔥' : habitCompletionRate >= 50 ? 'Building Momentum' : 'Needs Focus'}
                </span>
              </div>
            </div>
          </div>

          {/* Habit Cards */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="hidden sm:grid sm:grid-cols-12 text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="sm:col-span-5">Habit</span>
              <span className="sm:col-span-2 text-center">Streak</span>
              <span className="sm:col-span-4 text-center">Last 7 Days</span>
              <span className="sm:col-span-1 text-right">Actions</span>
            </div>

            {data.habits?.map((habit) => {
              const isTodayDone = !!habit.history[today];

              return (
                <div
                  key={habit.id}
                  className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 transition-all"
                >
                  {/* Habit Info & Today Checkbox */}
                  <div className="sm:col-span-5 flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => toggleHabitToday(habit.id)}
                      className={`
                        w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0
                        ${isTodayDone 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 text-transparent bg-white dark:bg-slate-800'
                        }
                      `}
                      title={isTodayDone ? "Done today!" : "Check off for today"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <h4 className={`text-sm font-bold text-slate-900 dark:text-white ${isTodayDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {habit.title}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {habit.category} • Target {habit.targetDaysPerWeek}d/wk
                      </span>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="sm:col-span-2 flex items-center justify-center gap-1 font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    <span>{habit.streak}d streak</span>
                    <span className="text-[10px] text-slate-400 font-normal">({habit.bestStreak} max)</span>
                  </div>

                  {/* 7-Day History Bubbles */}
                  <div className="sm:col-span-4 flex items-center justify-center gap-1.5 w-full sm:w-auto">
                    {last7Days.map((dayStr, idx) => {
                      const wasDone = !!habit.history[dayStr];
                      const isCurrent = dayStr === today;
                      const dayLetter = new Date(dayStr).toLocaleDateString('en-US', { weekday: 'narrow' });

                      return (
                        <div key={idx} className="flex flex-col items-center gap-0.5">
                          <span className="text-[9px] text-slate-400">{dayLetter}</span>
                          <div
                            className={`
                              w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                              ${wasDone 
                                ? 'bg-emerald-500 text-white' 
                                : isCurrent 
                                  ? 'border-2 border-dashed border-slate-400 dark:border-slate-500' 
                                  : 'bg-slate-200 dark:bg-slate-700 text-transparent'
                              }
                            `}
                          >
                            {wasDone ? '✓' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-1 flex justify-end w-full sm:w-auto">
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SECTION: TASKS */}
      {activeSection === 'tasks' && (
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Task Milestones & Assignments
              </h3>
              <p className="text-xs text-slate-500">
                Keep track of academic deliverables and homework
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {data.tasks?.map((task) => (
              <div
                key={task.id}
                className={`
                  flex items-center justify-between p-3.5 rounded-xl border transition-all
                  ${task.completed 
                    ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`
                      w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer
                      ${task.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 text-transparent'
                      }
                    `}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <h4 className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="capitalize">{task.category}</span>
                      {task.estimatedMinutes && (
                        <span>• ~{task.estimatedMinutes} mins</span>
                      )}
                      {task.dueDate && (
                        <span>• Due: {task.dueDate}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    task.priority === 'high' 
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' 
                      : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {task.priority}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create New Recurring Habit
            </h3>

            <form onSubmit={handleCreateHabit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="e.g. Python DSA Coding, Read 20 pages, Gym..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                  >
                    <option value="study">Study</option>
                    <option value="project">Project</option>
                    <option value="revision">Revision</option>
                    <option value="exercise">Exercise</option>
                    <option value="personal">Personal Goal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Days / Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={habitTargetDays}
                    onChange={(e) => setHabitTargetDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddHabit(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Add Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Task or Assignment
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Chapter 3 exercises..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Estimated Mins
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={taskEstMinutes}
                    onChange={(e) => setTaskEstMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
