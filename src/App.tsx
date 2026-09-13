import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TimetableView } from './components/TimetableView';
import { AIPlannerView } from './components/AIPlannerView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { TasksAndHabitsView } from './components/TasksAndHabitsView';
import { AnalyticsView } from './components/AnalyticsView';
import { MotivationView } from './components/MotivationView';
import { SettingsView } from './components/SettingsView';
import { ActivityModal } from './components/ActivityModal';
import { GenerateDayModal } from './components/GenerateDayModal';
import { RescheduleModal } from './components/RescheduleModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import { TimetableItem } from './types';
import { Sparkles, Bot } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, isChatOpen, setIsChatOpen, addActivity, updateActivity } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableItem | null>(null);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsActivityModalOpen(true);
  };

  const handleOpenEditModal = (item: TimetableItem) => {
    setEditingItem(item);
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = (itemData: any) => {
    if (editingItem) {
      updateActivity(itemData);
    } else {
      addActivity(itemData);
    }
  };

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
          />
        );
      case 'timetable':
        return (
          <TimetableView
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
          />
        );
      case 'ai-planner':
        return <AIPlannerView />;
      case 'study-planner':
        return <StudyPlannerView />;
      case 'habits':
        return <TasksAndHabitsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'motivation':
        return <MotivationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <Dashboard
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header onToggleMobileMenu={() => setIsMobileSidebarOpen(true)} />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen} 
          onCloseMobile={() => setIsMobileSidebarOpen(false)} 
        />

        {/* Dynamic Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full">
          {renderCurrentTab()}
        </main>

      </div>

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Open AI Study Companion"
        >
          <div className="relative">
            <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <span className="hidden sm:inline">Ask AI Study Assistant</span>
          <span className="sm:hidden">AI Assistant</span>
        </button>
      )}

      {/* Modals & Drawers */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSave={handleSaveActivity}
        initialItem={editingItem}
      />

      <GenerateDayModal />
      <RescheduleModal />
      <AIChatDrawer />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
