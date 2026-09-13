import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Pin, 
  AlertCircle,
  Wand2,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiGenerateSchedule } from '../services/api';
import { TimetableItem } from '../types';
import { formatTime12h, calculateDurationHours } from '../utils/timeUtils';
import { playSuccessChime, triggerConfetti } from '../utils/soundAndFx';

export const GenerateDayModal: React.FC = () => {
  const { 
    openGenerateModal, 
    setOpenGenerateModal, 
    data, 
    setData,
    generateFreshMotivation 
  } = useApp();

  const [prompt, setPrompt] = useState(
    'Today I have college from 9 AM to 4 PM. I need 2 hours of Python, 1 hour for my project, 1 hour for revision, and some free time.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<TimetableItem[] | null>(null);
  const [generationNote, setGenerationNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!openGenerateModal) return null;

  const quickPresets = [
    {
      title: 'College & Python Sprint',
      text: 'Today I have college from 9 AM to 4 PM. I need 2 hours of Python, 1 hour for my project, 1 hour for revision, and some free time.'
    },
    {
      title: 'Full Day Exam Cramming',
      text: 'No college today. I need 6 hours of focused study for my DSA exam with Pomodoro breaks, meal times, and a 45-minute evening workout.'
    },
    {
      title: 'Project Development Sprint',
      text: 'Classes from 10 AM to 1 PM. Afternoon reserved for building my React/Node project (3 hours), 1 hour assignment homework, and dinner.'
    },
    {
      title: 'Balanced Sunday Reset',
      text: 'Waking up at 8 AM. Need 2 hours of light revision, planning next week, gym workout, reading, and personal time.'
    }
  ];

  const handleGenerate = async () => {
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
        setErrorMsg('Could not generate timetable. Please try a different prompt.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to generate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySchedule = () => {
    if (!generatedPreview) return;
    setData(prev => ({
      ...prev,
      timetable: generatedPreview
    }));
    playSuccessChime();
    triggerConfetti();
    generateFreshMotivation();
    setOpenGenerateModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  Generate My Day with AI
                </h3>
                <p className="text-xs text-blue-100">
                  Describe your day in natural language. ChronoSage designs a realistic, balanced timetable.
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpenGenerateModal(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Natural Language Prompt Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Tell AI What You Need To Do Today
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Today I have college from 9 AM to 4 PM. I need 2 hours of Python, 1 hour for my project, 1 hour for revision, and some free time."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Quick Student Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(preset.text)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-slate-800 transition-all text-xs group"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 block mb-0.5">
                    {preset.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {preset.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Constraints Info banner */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
            <Clock className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="font-bold">Honors your routine:</span> Wake up at {data.settings.wakeUpTime || '07:00'}, sleep at {data.settings.sleepTime || '23:00'}. Auto-schedules meals & spaced breaks.
            </div>
          </div>

          {/* Generate Action Button */}
          {!generatedPreview && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Designing your optimal student schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Schedule with AI</span>
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

          {/* Generated Timetable Preview */}
          {generatedPreview && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  AI Timetable Preview ({generatedPreview.length} activities)
                </h4>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Regenerate ↻
                </button>
              </div>

              {generationNote && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Note: {generationNote}
                </p>
              )}

              <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-850">
                {generatedPreview.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-24">
                        {formatTime12h(item.startTime)} - {formatTime12h(item.endTime)}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.activity}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setGeneratedPreview(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Back to Prompt
                </button>
                <button
                  onClick={handleApplySchedule}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply to Today's Timetable</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
