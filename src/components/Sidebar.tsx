import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Sparkles, 
  GraduationCap, 
  CheckSquare, 
  BarChart3, 
  Flame, 
  Sliders,
  Compass,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, completionPercentage, completedTasksCount, remainingTasksCount } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'My Timetable', icon: CalendarClock },
    { id: 'ai-planner', label: 'AI Planner', icon: Sparkles, badge: 'AI' },
    { id: 'study-planner', label: 'Study Planner', icon: GraduationCap },
    { id: 'habits', label: 'Tasks & Habits', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'motivation', label: 'Motivation', icon: Flame },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col justify-between
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  ChronoSage
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  Student Companion
                </span>
              </div>
            </div>

            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Mini Progress Card */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800/80 dark:to-slate-800/30 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Today's Target</span>
            <span className="text-blue-600 dark:text-blue-400">{completionPercentage}%</span>
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{completedTasksCount} Done</span>
            <span>{remainingTasksCount} Remaining</span>
          </div>
        </div>
      </aside>
    </>
  );
};
