import React, { useState } from 'react';
import { 
  Sliders, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Save, 
  Check, 
  User, 
  Clock, 
  Target, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDefaultAppData } from '../utils/defaultData';
import { playSuccessChime, triggerConfetti } from '../utils/soundAndFx';

export const SettingsView: React.FC = () => {
  const { data, setData, updateSettings } = useApp();

  const [name, setName] = useState(data.settings.name);
  const [wakeUpTime, setWakeUpTime] = useState(data.settings.wakeUpTime);
  const [sleepTime, setSleepTime] = useState(data.settings.sleepTime);
  const [dailyTargetHours, setDailyTargetHours] = useState(data.settings.dailyStudyTargetHours);
  const [theme, setTheme] = useState<'light' | 'dark'>(data.settings.theme);
  const [soundEnabled, setSoundEnabled] = useState(data.settings.soundEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: name.trim() || 'Student',
      wakeUpTime,
      sleepTime,
      dailyStudyTargetHours: Number(dailyTargetHours),
      theme,
      soundEnabled
    });

    setSavedSuccess(true);
    if (soundEnabled) playSuccessChime();
    triggerConfetti();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all timetable, tasks, and study data to default? This cannot be undone.')) {
      setData(getDefaultAppData());
      playSuccessChime();
      alert('ChronoSage data reset to defaults.');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-600" />
          Settings & Student Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your sleep schedule, study target goals, theme, and audio feedback
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Student Identity
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Your Name / Nickname
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Routine & Schedule Bounds */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Daily Routine Boundaries
          </h2>
          <p className="text-xs text-slate-500">
            The AI timetable generator uses these hours to safely wrap your schedule and guarantee adequate rest.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Typical Wake Up Time
              </label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Typical Sleep Time
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Daily Target Study Hours: <span className="text-blue-600 dark:text-blue-400">{dailyTargetHours} hours</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={dailyTargetHours}
              onChange={(e) => setDailyTargetHours(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>1 hr</span>
              <span>4 hrs (Recommended)</span>
              <span>10 hrs</span>
            </div>
          </div>
        </div>

        {/* Appearance & Sound */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Appearance & Audio Feedback
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Theme Toggle Button */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">Theme Mode</span>
                <span className="text-xs text-slate-500 capitalize">{theme} mode active</span>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-400'}`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-xs' : 'text-slate-400'}`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">Success Chimes</span>
                <span className="text-xs text-slate-500">Play audio on task completion</span>
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  soundEnabled 
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-600 dark:text-blue-400' 
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {savedSuccess ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4" />
              Settings saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Changes sync automatically to your student profile
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>

      {/* Danger Zone: Reset Data */}
      <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2">
        <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
          Reset Data & Timetable
        </h3>
        <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
          Restore sample college schedule, study plans, habits, and motivational quotes to fresh defaults.
        </p>
        <button
          type="button"
          onClick={handleResetData}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/70 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default Student Schedule</span>
        </button>
      </div>

    </div>
  );
};
