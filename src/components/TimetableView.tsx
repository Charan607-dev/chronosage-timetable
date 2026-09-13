import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Sparkles, 
  RotateCw, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Clock,
  Pin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimetableTimeline } from './TimetableTimeline';
import { TimetableItem } from '../types';
import { formatTime12h, calculateDurationHours } from '../utils/timeUtils';

interface TimetableViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (item: TimetableItem) => void;
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  onOpenAddModal,
  onOpenEditModal
}) => {
  const { data, setOpenGenerateModal, setOpenRescheduleModal, totalStudyHours } = useApp();
  const [copied, setCopied] = useState(false);

  const handleExportText = () => {
    const text = data.timetable.map(t => 
      `${t.startTime} - ${t.endTime}: ${t.activity} (${t.category.toUpperCase()}) [${t.completed ? 'DONE' : 'PENDING'}]`
    ).join('\n');

    navigator.clipboard.writeText(`ChronoSage Timetable for Today:\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Full Daily Timetable
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Structured chronological schedule with flexible reordering and completion tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={() => setOpenGenerateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Generator</span>
          </button>
        </div>
      </div>

      {/* Main Timeline Card */}
      <TimetableTimeline 
        onOpenAddModal={onOpenAddModal} 
        onOpenEditModal={onOpenEditModal} 
      />

    </div>
  );
};
