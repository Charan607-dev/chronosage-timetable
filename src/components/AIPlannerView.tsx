import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Wand2, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle2,
  BrainCircuit,
  Zap,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiGenerateSchedule, apiReschedule } from '../services/api';
import { TimetableItem } from '../types';
import { formatTime12h } from '../utils/timeUtils';
import { playSuccessChime, triggerConfetti } from '../utils/soundAndFx';

export const AIPlannerView: React.FC = () => {
  const { 
    data, 
    setData, 
    currentTime, 
    setOpenGenerateModal, 
    setOpenRescheduleModal, 
    generateFreshMotivation 
  } = useApp();

  const [prompt, setPrompt] = useState(
    'College classes from 9 AM to 3:30 PM. Then need 2 hours for Python Data Structures, 1 hour for web project, and 45 mins evening gym.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<TimetableItem[] | null>(null);
  const [generationNote, setGenerationNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    {
      title: 'College & Coding Sprint',
      desc: 'Fixed 9am-4pm lectures, 2h evening coding, 1h revision, healthy dinner & sleep.',
      prompt: 'College from 9 AM to 4 PM. In the evening I need 2 hours of Python coding, 1 hour of math revision, dinner, and free time before 11 PM.'
    },
    {
      title: 'All-Day Exam Prep',
      desc: 'No classes. 6 hours spaced deep work with 10-minute breaks and lunch.',
      prompt: 'Free day dedicated to upcoming semester exams. Need 6 hours of high focus study broken into 90-minute blocks with breaks.'
    },
    {
      title: 'Assignment Deadline Crunch',
      desc: 'Afternoon classes, 3h urgent assignment submission, review session.',
      prompt: 'Morning classes from 10 AM to 1 PM. Urgent assignment due tomorrow: need 3 hours research & writing, plus 1 hour project.'
    },
    {
      title: 'Balanced Weekend Reset',
      desc: 'Morning workout, 3h study, cleaning, relaxation, planning next week.',
      prompt: 'Weekend routine: wake up at 8 AM, morning workout, 3 hours of study/projects, leisure personal time, sleep by 11 PM.'
    }
  ];

  const handleRunGenerator = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedPreview(null);
    setGenerationNote(null);

    try {
      const fixedEvents = data.timetable.filter(t => t.isFixed);
      const res = await apiGenerateSchedule({
        prompt: prompt.trim(),
        wakeUpTime: data.settings.wakeUpTime || '07:00',
        sleepTime: data.settings.sleepTime || '23:00',
        fixedEvents,
        studentTargetHours: data.settings.dailyStudyTargetHours || 4
      });

      if (res.items && res.items.length > 0) {
        setGeneratedPreview(res.items);
        if (res.note) setGenerationNote(res.note);
      } else {
        setErrorMsg('Could not parse schedule. Please try a different wording.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to generate timetable with AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedPreview) return;
    setData(prev => ({
      ...prev,
      timetable: generatedPreview
    }));
    playSuccessChime();
    triggerConfetti();
    generateFreshMotivation();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-md relative overflow-hidden">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            AI Algorithmic Scheduler
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Design a Balanced, High-Yield Day
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
            Tell ChronoSage your commitments in plain English. The AI ensures no overlapping activities, preserves fixed lectures, and schedules necessary breaks.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setOpenRescheduleModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-orange-300" />
            <span>Behind Schedule? Reschedule Day</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Prompt Input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Describe Your Day (Tasks, Hours, Fixed Classes)
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. College 9am-4pm. 2h Python, 1h assignment, dinner and relax..."
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>

            <button
              onClick={handleRunGenerator}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing student timetable...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Schedule Now</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Preset Cards */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              One-Click Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setPrompt(preset.prompt)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all shadow-xs"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {preset.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {preset.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preview / Active Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Generated Preview
                </h3>
                {generatedPreview && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Ready to Apply
                  </span>
                )}
              </div>

              {generatedPreview ? (
                <div className="mt-3 space-y-2 max-h-[380px] overflow-y-auto">
                  {generationNote && (
                    <p className="text-xs text-slate-500 italic mb-2">
                      💡 {generationNote}
                    </p>
                  )}
                  {generatedPreview.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 mr-2">
                          {formatTime12h(item.startTime)}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.activity}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
                  <BrainCircuit className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-semibold">No schedule generated yet</p>
                  <p className="text-[11px] max-w-xs mx-auto">
                    Type your tasks or pick a preset on the left, then click Generate.
                  </p>
                </div>
              )}
            </div>

            {generatedPreview && (
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleApply}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply to Today's Timetable</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
