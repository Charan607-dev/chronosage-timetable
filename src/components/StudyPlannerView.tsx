import React, { useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  Trash2, 
  Check, 
  Target,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyPlan, StudyTopic } from '../types';
import { apiGenerateStudyPlan } from '../services/api';
import { playSuccessChime, triggerConfetti } from '../utils/soundAndFx';

export const StudyPlannerView: React.FC = () => {
  const { data, setData } = useApp();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(data.studyPlans?.[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add plan form state
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [totalChapters, setTotalChapters] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [availableHours, setAvailableHours] = useState(2.5);
  const [topicsInput, setTopicsInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedPlan = data.studyPlans?.find(p => p.id === selectedPlanId) || data.studyPlans?.[0];

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !examDate) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const topicList = topicsInput
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

      const res = await apiGenerateStudyPlan({
        subject: subject.trim(),
        examDate,
        totalChapters: Number(totalChapters) || 5,
        difficulty,
        availableHoursPerDay: Number(availableHours) || 2.5,
        topicsList: topicList
      });

      const newPlan: StudyPlan = {
        id: `sp-${Date.now()}`,
        subject: subject.trim(),
        examDate,
        difficulty,
        availableHoursPerDay: Number(availableHours),
        totalChapters: Number(totalChapters),
        topics: res.topics || [],
        createdAt: new Date().toISOString().split('T')[0]
      };

      setData(prev => ({
        ...prev,
        studyPlans: [newPlan, ...(prev.studyPlans || [])]
      }));

      setSelectedPlanId(newPlan.id);
      playSuccessChime();
      triggerConfetti();
      setShowAddModal(false);
      
      // Reset form
      setSubject('');
      setExamDate('');
      setTopicsInput('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to generate study plan. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTopicCompletion = (planId: string, topicId: string) => {
    setData(prev => {
      const updated = prev.studyPlans.map(plan => {
        if (plan.id === planId) {
          const updatedTopics = plan.topics.map(t => {
            if (t.id === topicId) {
              const next = !t.completed;
              if (next) {
                if (prev.settings.soundEnabled) playSuccessChime();
                triggerConfetti();
              }
              return { ...t, completed: next };
            }
            return t;
          });
          return { ...plan, topics: updatedTopics };
        }
        return plan;
      });
      return { ...prev, studyPlans: updated };
    });
  };

  const deletePlan = (id: string) => {
    setData(prev => {
      const remaining = prev.studyPlans.filter(p => p.id !== id);
      if (selectedPlanId === id && remaining.length > 0) {
        setSelectedPlanId(remaining[0].id);
      }
      return { ...prev, studyPlans: remaining };
    });
  };

  const getDaysUntilExam = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-200" />
            <h1 className="text-xl sm:text-2xl font-bold">
              AI Student Study Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Distribute complex exam syllabi across your available study days using spaced repetition and smart chapter breakdown.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-blue-900 hover:bg-blue-50 shadow-sm transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>New AI Study Plan</span>
        </button>
      </div>

      {/* Subject Tabs */}
      {data.studyPlans && data.studyPlans.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left: List of Plans */}
          <div className="lg:col-span-1 space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Upcoming Subjects ({data.studyPlans.length})
            </span>

            {data.studyPlans.map(plan => {
              const daysLeft = getDaysUntilExam(plan.examDate);
              const totalTopics = plan.topics.length;
              const doneTopics = plan.topics.filter(t => t.completed).length;
              const progress = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;
              const isSelected = selectedPlan?.id === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`
                    p-4 rounded-xl border transition-all cursor-pointer relative group
                    ${isSelected 
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm' 
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {plan.subject}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlan(plan.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-500 transition-opacity"
                      title="Delete plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {daysLeft > 0 ? `${daysLeft} days until exam` : daysLeft === 0 ? 'Exam Today!' : 'Exam Passed'}
                    </span>
                  </div>

                  {/* Mini Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                      <span>{doneTopics}/{totalTopics} topics</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Plan View */}
          {selectedPlan && (
            <div className="lg:col-span-3 space-y-5">
              
              {/* Plan Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Subject Overview
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedPlan.subject}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">Exam Date</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedPlan.examDate}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-900 text-center">
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Countdown</span>
                      <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">
                        {Math.max(0, getDaysUntilExam(selectedPlan.examDate))}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Topics</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedPlan.topics.length}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Completed</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedPlan.topics.filter(t => t.completed).length}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Remaining</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {selectedPlan.topics.filter(t => !t.completed).length}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Target Daily</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedPlan.availableHoursPerDay}h</span>
                  </div>
                </div>
              </div>

              {/* Topics Breakdown List */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Distributed Syllabus Checklist
                  </h3>
                  <span className="text-xs text-slate-500">
                    Click checkbox when revised
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedPlan.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`
                        flex items-center justify-between p-3.5 rounded-xl border transition-all
                        ${topic.completed 
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-85' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTopicCompletion(selectedPlan.id, topic.id)}
                          className={`
                            w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer
                            ${topic.completed 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 text-transparent'
                            }
                          `}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <div>
                          <p className={`text-sm font-semibold ${topic.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                            {topic.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {topic.estimatedHours}h estimated
                            </span>
                            {topic.difficulty && (
                              <span className="capitalize px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {topic.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {topic.scheduledDate && (
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Date</span>
                          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {topic.scheduledDate}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-blue-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No active study plans yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Add an upcoming exam or subject to have ChronoSage AI automatically distribute chapters across your available calendar days.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Study Plan</span>
          </button>
        </div>
      )}

      {/* Add Study Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold">Generate AI Study Plan</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Machine Learning, Operating Systems, Organic Chemistry..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Number of Chapters
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={totalChapters}
                    onChange={(e) => setTotalChapters(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Available Study Hrs / Day
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Specific Topics / Chapters (Optional, one per line)
                </label>
                <textarea
                  rows={3}
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  placeholder="e.g.&#10;Arrays and Strings&#10;Tree Traversals&#10;Dynamic Programming"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Generating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
