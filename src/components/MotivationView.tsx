import React, { useState } from 'react';
import { 
  Flame, 
  Bookmark, 
  Sparkles, 
  Share2, 
  Check, 
  Heart, 
  Filter, 
  Plus, 
  Target,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiGenerateMotivation } from '../services/api';

export const MotivationView: React.FC = () => {
  const { data, setData, toggleFavoriteQuote } = useApp();
  const [selectedContext, setSelectedContext] = useState('Consistency');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const contextOptions = [
    'Consistency',
    'Before Exam',
    'After Missed Tasks',
    'Before Deep Coding',
    'Overcoming Procrastination',
    'Late Night Study',
    'Stress Relief'
  ];

  const handleGenerate = async (contextTag: string) => {
    setIsGenerating(true);
    try {
      const res = await apiGenerateMotivation({
        context: contextTag,
        studentName: data.settings.name,
        completedTasks: data.timetable.filter(t => t.completed).length,
        missedTasks: data.timetable.filter(t => !t.completed).length,
        favoriteQuotes: data.motivationHistory.filter(q => q.isFavorite).map(q => q.quote)
      });

      const newQuote = {
        id: `q-${Date.now()}`,
        quote: res.quote,
        author: res.author,
        contextTag: res.contextTag || contextTag,
        isFavorite: false
      };

      setData(prev => ({
        ...prev,
        motivationHistory: [newQuote, ...(prev.motivationHistory || [])]
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const quotesToShow = (data.motivationHistory || []).filter(q => {
    if (filterFavorites) return q.isFavorite;
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md mb-2">
              <Flame className="w-3.5 h-3.5 fill-white" />
              Student Mindset & Resilience Coach
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Fuel Your Focus, Reset Without Guilt
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 mt-1 leading-relaxed">
              Every day presents friction. ChronoSage delivers tailored mental cues to re-ignite your flow, tackle difficult subjects, and maintain daily discipline.
            </p>
          </div>

          <button
            onClick={() => handleGenerate(selectedContext)}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm text-orange-950 bg-white hover:bg-orange-50 shadow-lg active:scale-95 transition-all disabled:opacity-60 cursor-pointer self-start md:self-auto"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-orange-600" />
                <span>Brewing Inspiration...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>Motivate Me Now 🔥</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generator Prompt Context Selector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Your Current Mental Situation:
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
            AI adapts to this context
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {contextOptions.map((ctx) => (
            <button
              key={ctx}
              onClick={() => {
                setSelectedContext(ctx);
                handleGenerate(ctx);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedContext === ctx
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {ctx}
            </button>
          ))}
        </div>
      </div>

      {/* Quote Gallery & Favorites Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-orange-500" />
            Inspiration Vault ({quotesToShow.length})
          </h3>

          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              filterFavorites 
                ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-300 text-orange-700 dark:text-orange-300' 
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-orange-500 text-orange-500' : ''}`} />
            <span>{filterFavorites ? 'Showing Favorites Only' : 'Filter by Favorites'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotesToShow.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-orange-300 dark:hover:border-orange-800 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                    {item.contextTag || 'Mindset'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavoriteQuote(item.id)}
                      className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors ${
                        item.isFavorite ? 'text-rose-500 fill-rose-500' : ''
                      }`}
                      title="Favorite"
                    >
                      <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopy(item.id, `"${item.quote}" — ${item.author}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy quote"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 italic leading-relaxed">
                  "{item.quote}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  — {item.author}
                </span>
                <span className="text-[10px] text-slate-400">
                  ChronoSage Mindset
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
