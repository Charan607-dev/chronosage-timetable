import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  MessageSquare, 
  Sun, 
  Moon, 
  Bell, 
  Clock, 
  Calendar as CalendarIcon,
  Menu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGreeting, getDayAndDateFormatted } from '../utils/timeUtils';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { 
    data, 
    currentTime, 
    currentDate, 
    setOpenGenerateModal, 
    setOpenRescheduleModal, 
    isChatOpen, 
    setIsChatOpen,
    updateSettings,
    notifications,
    dismissNotification
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const isDark = document.documentElement.classList.contains('dark');

  const toggleTheme = () => {
    const nextTheme = data.settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Mobile trigger & Greeting */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {getGreeting(data.settings.name)}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Student Mode
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  {getDayAndDateFormatted(currentDate)}
                </span>
                <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1 font-mono font-medium text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {currentTime}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick AI actions & controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Generate My Day button */}
            <button
              onClick={() => setOpenGenerateModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all shadow-blue-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Day</span>
            </button>

            {/* Reschedule button */}
            <button
              onClick={() => setOpenRescheduleModal(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Reschedule remainder of the day"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Reschedule</span>
            </button>

            {/* AI Assistant Chat Toggle */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative ${
                isChatOpen ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : ''
              }`}
              title="Open AI Companion Chat"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications dropdown menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Notifications & Reminders
                    </span>
                    <span className="text-xs text-slate-400">
                      {notifications.length} new
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No pending notifications right now.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-start gap-2.5">
                          {notif.type === 'reminder' ? (
                            <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          ) : notif.type === 'missed' ? (
                            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{notif.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-block">{notif.timestamp}</span>
                          </div>
                          <button
                            onClick={() => dismissNotification(notif.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
