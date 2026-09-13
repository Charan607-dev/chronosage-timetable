import React, { useState } from 'react';
import { Flame, Bookmark, Sparkles, Share2, Check, Quote as QuoteIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DailyMotivationCard: React.FC = () => {
  const { data, generateFreshMotivation, toggleFavoriteQuote } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Latest quote
  const currentQuote = data.motivationHistory?.[0] || {
    id: 'default-quote',
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    contextTag: "Consistency",
    isFavorite: false
  };

  const handleMotivateMe = async () => {
    setIsGenerating(true);
    try {
      await generateFreshMotivation();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${currentQuote.quote}" — ${currentQuote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/30 border border-amber-200/70 dark:border-amber-900/50 p-5 sm:p-6 transition-all shadow-sm">
      {/* Subtle background decoration */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Daily Motivation
            </h3>
            {currentQuote.contextTag && (
              <span className="text-[11px] font-medium text-amber-600/80 dark:text-amber-300/80">
                • {currentQuote.contextTag}
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFavoriteQuote(currentQuote.id)}
            className={`p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 transition-colors ${
              currentQuote.isFavorite ? 'text-amber-600 dark:text-amber-400 fill-amber-500' : ''
            }`}
            title={currentQuote.isFavorite ? "Saved in favorites" : "Save to favorites"}
          >
            <Bookmark className={`w-4 h-4 ${currentQuote.isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 transition-colors"
            title="Copy quote"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quote text */}
      <div className="my-3 pl-3 border-l-2 border-amber-400/80 dark:border-amber-500/80">
        <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 italic leading-relaxed">
          "{currentQuote.quote}"
        </p>
        <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          — {currentQuote.author}
        </p>
      </div>

      {/* Motivate Me Button */}
      <div className="mt-4 flex items-center justify-between pt-2 border-t border-amber-200/50 dark:border-amber-900/30">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Context-aware AI coaching
        </span>

        <button
          onClick={handleMotivateMe}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-100 bg-amber-200/70 hover:bg-amber-300/80 dark:bg-amber-900/60 dark:hover:bg-amber-800/80 transition-all active:scale-95 disabled:opacity-60 shadow-xs cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Inspiring...</span>
            </>
          ) : (
            <>
              <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Motivate Me 🔥</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
