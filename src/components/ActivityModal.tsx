import React, { useState, useEffect } from 'react';
import { X, Clock, Tag, Flag, Pin, FileText, Check } from 'lucide-react';
import { TimetableItem, ActivityCategory, Priority } from '../types';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  initialItem?: TimetableItem | null;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem
}) => {
  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<ActivityCategory>('study');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isFixed, setIsFixed] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialItem) {
      setActivity(initialItem.activity);
      setStartTime(initialItem.startTime);
      setEndTime(initialItem.endTime);
      setCategory(initialItem.category);
      setPriority(initialItem.priority);
      setIsFixed(!!initialItem.isFixed);
      setNotes(initialItem.notes || '');
    } else {
      setActivity('');
      setStartTime('09:00');
      setEndTime('10:00');
      setCategory('study');
      setPriority('medium');
      setIsFixed(false);
      setNotes('');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;

    onSave({
      activity: activity.trim(),
      startTime,
      endTime,
      category,
      priority,
      isFixed,
      notes: notes.trim(),
      completed: initialItem ? initialItem.completed : false,
      ...(initialItem ? { id: initialItem.id } : {})
    });
    onClose();
  };

  const categories: { id: ActivityCategory; label: string }[] = [
    { id: 'study', label: 'Study' },
    { id: 'lecture', label: 'College Lecture' },
    { id: 'project', label: 'Project Work' },
    { id: 'revision', label: 'Revision' },
    { id: 'break', label: 'Break' },
    { id: 'meal', label: 'Meal' },
    { id: 'exercise', label: 'Exercise' },
    { id: 'personal', label: 'Personal / Free Time' },
    { id: 'sleep', label: 'Sleep' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {initialItem ? 'Edit Timetable Activity' : 'Add New Activity'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              required
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g. Python DSA Practice, Operating Systems Lab, Lunch..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Fixed Commitment Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="isFixed"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
            />
            <label htmlFor="isFixed" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-amber-500" />
              Fixed Commitment (AI will not move this slot during rescheduling)
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Notes & Tips (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Chapter 4 exercises, bring notebook, use Pomodoro 25/5..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{initialItem ? 'Update Activity' : 'Create Activity'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
