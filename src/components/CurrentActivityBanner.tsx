import React from 'react';
import { 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Coffee, 
  Sparkles, 
  Check,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime12h, timeToMinutes, calculateDurationHours } from '../utils/timeUtils';

export const CurrentActivityBanner: React.FC = () => {
  const { 
    currentActivity, 
    nextActivity, 
    currentTime, 
    toggleActivityCompletion,
    setOpenRescheduleModal 
  } = useApp();

  const nowMin = timeToMinutes(currentTime);

  // Compute progress through current activity
  let progressPercent = 0;
  let minutesLeft = 0;

  if (currentActivity) {
    const startMin = timeToMinutes(currentActivity.startTime);
    const endMin = timeToMinutes(currentActivity.endTime);
    const totalDuration = endMin >= startMin ? endMin - startMin : (1440 - startMin) + endMin;
    const elapsed = nowMin >= startMin ? nowMin - startMin : (1440 - startMin) + nowMin;
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    minutesLeft = Math.max(0, totalDuration - elapsed);
  }

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'study': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'lecture': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'project': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'revision': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'break': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'meal': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'exercise': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      
      {/* Current Activity Card */}
      <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 sm:p-6 shadow-md shadow-blue-500/10 relative overflow-hidden">
        {/* Background accent glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active Right Now
              </span>

              {currentActivity && (
                <span className="text-xs font-medium text-blue-100">
                  {minutesLeft}m remaining
                </span>
              )}
            </div>

            {currentActivity ? (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
                  {currentActivity.activity}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-blue-100/90 mb-3">
                  <span className="flex items-center gap-1 font-mono font-medium">
                    <Clock className="w-4 h-4 text-blue-200" />
                    {formatTime12h(currentActivity.startTime)} – {formatTime12h(currentActivity.endTime)}
                  </span>
                  <span>•</span>
                  <span className="capitalize font-semibold">{currentActivity.category}</span>
                  {currentActivity.isFixed && (
                    <>
                      <span>•</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">Fixed Commitment</span>
                    </>
                  )}
                </div>

                {currentActivity.notes && (
                  <p className="text-xs sm:text-sm text-blue-50/90 bg-black/15 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 mb-4">
                    💡 <span className="font-semibold">Note:</span> {currentActivity.notes}
                  </p>
                )}

                {/* Progress bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs text-blue-100">
                    <span>Block Elapsed</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <h2 className="text-xl font-bold text-white mb-1">
                  No scheduled activity right now
                </h2>
                <p className="text-sm text-blue-100">
                  Enjoy your free time, hydrate, or review notes before your next block.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/15">
            {currentActivity && (
              <button
                onClick={() => toggleActivityCompletion(currentActivity.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 ${
                  currentActivity.completed 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                    : 'bg-white text-blue-900 hover:bg-blue-50'
                }`}
              >
                {currentActivity.completed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Completed!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    <span>Mark as Done</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setOpenRescheduleModal(true)}
              className="text-xs font-semibold text-blue-100 hover:text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all ml-auto"
            >
              Behind schedule? Fix with AI →
            </button>
          </div>
        </div>
      </div>

      {/* Next Upcoming Activity Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-5 sm:p-6 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Next Up
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>

          {nextActivity ? (
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border mb-2 ${getCategoryBadgeClass(nextActivity.category)}`}>
                {nextActivity.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {nextActivity.activity}
              </h3>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Starts at {formatTime12h(nextActivity.startTime)} ({calculateDurationHours(nextActivity.startTime, nextActivity.endTime)}h)
              </p>

              {nextActivity.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                  {nextActivity.notes}
                </p>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 dark:text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/80" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">All planned tasks completed!</p>
              <p className="text-xs text-slate-400 mt-0.5">Great job on today's schedule.</p>
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            Stay hydrated
          </span>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {nextActivity ? `In ${Math.max(0, timeToMinutes(nextActivity.startTime) - nowMin)} min` : 'Free evening'}
          </span>
        </div>
      </div>

    </div>
  );
};
