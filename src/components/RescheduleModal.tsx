import React, { useState } from 'react';
import { 
  RotateCw, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiReschedule } from '../services/api';
import { TimetableItem } from '../types';
import { formatTime12h } from '../utils/timeUtils';
import { playSuccessChime, triggerConfetti } from '../utils/soundAndFx';

export const RescheduleModal: React.FC = () => {
  const { 
    openRescheduleModal, 
    setOpenRescheduleModal, 
    data, 
    setData, 
    currentTime,
    generateFreshMotivation 
  } = useApp();

  const [reason, setReason] = useState('I missed my morning study and woke up late. Need to catch up.');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduledItems, setRescheduledItems] = useState<TimetableItem[] | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!openRescheduleModal) return null;

  const quickReasons = [
    'I woke up late today.',
    'I missed my Python coding session.',
    'I have an urgent extra assignment to finish.',
    'Move my coding session to this evening.',
    'I need 30 more minutes for my current task.',
    'Feeling tired, need a 45-minute afternoon power nap.'
  ];

  const handleReschedule = async () => {
    if (!reason.trim()) return;
    setIsRescheduling(true);
    setErrorMsg(null);
    setRescheduledItems(null);
    setExplanation(null);

    try {
      const res = await apiReschedule({
        reason: reason.trim(),
        currentTimetable: data.timetable,
        currentTime,
        sleepTime: data.settings.sleepTime || '23:00'
      });

      if (res.items && res.items.length > 0) {
        setRescheduledItems(res.items);
        setExplanation(res.explanation);
      } else {
        setErrorMsg('Could not reschedule remaining items.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to reschedule with AI. Please try again.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleApply = () => {
    if (!rescheduledItems) return;
    setData(prev => ({
      ...prev,
      timetable: rescheduledItems
    }));
    playSuccessChime();
    triggerConfetti();
    generateFreshMotivation();
    setOpenRescheduleModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
                <RotateCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  Reschedule My Day with AI
                </h3>
                <p className="text-xs text-orange-100">
                  Plans changed? AI shifts remaining tasks without touching completed activities.
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpenRescheduleModal(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          
          {/* Reason Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              What Happened or What Needs to Change?
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. I woke up late, or I need 30 more minutes for this task..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Common Situations:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setReason(preset)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {!rescheduledItems && (
            <button
              onClick={handleReschedule}
              disabled={isRescheduling || !reason.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isRescheduling ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Intelligently adjusting remaining timetable...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Reschedule Remaining Day</span>
                </>
              )}
            </button>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview */}
          {rescheduledItems && (
            <div className="space-y-3 pt-2">
              {explanation && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold block mb-0.5">AI Adjustment Summary:</span>
                  {explanation}
                </div>
              )}

              <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-850">
                {rescheduledItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      item.completed 
                        ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 text-slate-400 line-through' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-24">
                        {formatTime12h(item.startTime)} - {formatTime12h(item.endTime)}
                      </span>
                      <span className="font-medium">{item.activity}</span>
                    </div>
                    {item.completed && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Already Done
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setRescheduledItems(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Adjust Prompt
                </button>
                <button
                  onClick={handleApply}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Rescheduled Timetable</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
