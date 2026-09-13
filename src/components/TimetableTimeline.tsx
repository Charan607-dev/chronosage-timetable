import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Trash2, 
  Edit3, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Pin, 
  Sparkles, 
  AlertCircle,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimetableItem, ActivityCategory } from '../types';
import { formatTime12h, timeToMinutes, calculateDurationHours } from '../utils/timeUtils';

interface TimetableTimelineProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (item: TimetableItem) => void;
}

export const TimetableTimeline: React.FC<TimetableTimelineProps> = ({ 
  onOpenAddModal, 
  onOpenEditModal 
}) => {
  const { 
    data, 
    currentTime, 
    toggleActivityCompletion, 
    deleteActivity, 
    reorderActivities,
    setOpenRescheduleModal
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const nowMin = timeToMinutes(currentTime);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'study', label: 'Study' },
    { id: 'lecture', label: 'Lectures' },
    { id: 'project', label: 'Projects' },
    { id: 'revision', label: 'Revision' },
    { id: 'break', label: 'Breaks & Meals' },
  ];

  const filteredItems = (data.timetable || []).filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'break') return item.category === 'break' || item.category === 'meal';
    return item.category === selectedCategory;
  });

  const getCategoryBadgeClass = (category: ActivityCategory) => {
    switch (category) {
      case 'study': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'lecture': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'project': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'revision': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'break': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'meal': return 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'exercise': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900';
      case 'medium': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Today's Schedule & Timeline
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {data.timetable?.length || 0} scheduled blocks • Track progress and adjust dynamically
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenRescheduleModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>AI Reschedule</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Vertical Timeline List */}
      <div className="mt-4 relative">
        {/* Continuous timeline line */}
        <div className="absolute left-[38px] sm:left-[55px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />

        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold">No activities found in this filter</p>
            <p className="text-xs mt-1">Add a new block or use the AI Generator to plan your day.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              const startMin = timeToMinutes(item.startTime);
              const endMin = timeToMinutes(item.endTime);
              const isCurrent = (endMin >= startMin) 
                ? (nowMin >= startMin && nowMin < endMin)
                : (nowMin >= startMin || nowMin < endMin);
              const isPast = nowMin >= endMin;
              const isMissed = isPast && !item.completed;

              return (
                <div
                  key={item.id}
                  className={`
                    relative z-10 flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border transition-all
                    ${isCurrent 
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 shadow-sm ring-1 ring-blue-400/50' 
                      : item.completed
                        ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                        : isMissed
                          ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                  `}
                >
                  {/* Start / End Time Column */}
                  <div className="w-16 sm:w-20 shrink-0 text-right font-mono">
                    <span className={`text-xs sm:text-sm font-bold block ${isCurrent ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.startTime}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      {item.endTime}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {calculateDurationHours(item.startTime, item.endTime)}h
                    </span>
                  </div>

                  {/* Completion Checkbox Button */}
                  <div className="pt-0.5 shrink-0">
                    <button
                      onClick={() => toggleActivityCompletion(item.id)}
                      className={`
                        w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer
                        ${item.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800 text-transparent hover:text-slate-300'
                        }
                      `}
                      title={item.completed ? "Mark as incomplete" : "Mark as completed"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(item.category)}`}>
                        {item.category}
                      </span>
                      
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${getPriorityBadgeClass(item.priority)}`}>
                        {item.priority}
                      </span>

                      {item.isFixed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                          <Pin className="w-2.5 h-2.5" />
                          Fixed
                        </span>
                      )}

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white animate-pulse">
                          Now
                        </span>
                      )}

                      {isMissed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/80 px-1.5 py-0.5 rounded">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Missed / Needs Rescheduling
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                      {item.activity}
                    </h3>

                    {item.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Item Actions (Reorder, Edit, Delete) */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    {/* Move Up */}
                    {index > 0 && (
                      <button
                        onClick={() => reorderActivities(index, index - 1)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Move earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Move Down */}
                    {index < filteredItems.length - 1 && (
                      <button
                        onClick={() => reorderActivities(index, index + 1)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Move later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => onOpenEditModal(item)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                      title="Edit activity"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteActivity(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors"
                      title="Delete activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
