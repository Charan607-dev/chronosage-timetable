import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle,
  RotateCw,
  Clock,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiAIChat } from '../services/api';
import { ChatMessage } from '../types';

export const AIChatDrawer: React.FC = () => {
  const { 
    isChatOpen, 
    setIsChatOpen, 
    data, 
    currentTime, 
    setOpenRescheduleModal, 
    setOpenGenerateModal 
  } = useApp();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${data.settings.name}! I am your ChronoSage AI study companion. I have full context of your timetable, habits, and exams. How can I help optimize your productivity today?`,
      timestamp: currentTime
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  if (!isChatOpen) return null;

  const quickQuestions = [
    'What should I do right now?',
    'What is my next activity?',
    'Show me my free time today.',
    'Give me two hours for Python.',
    'I have an exam next week. Help me plan.',
    'I am behind schedule. Fix my remaining timetable.'
  ];

  const handleSend = async (userMsgText?: string) => {
    const textToSend = userMsgText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: currentTime
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiAIChat({
        message: textToSend.trim(),
        chatHistory: messages,
        timetable: data.timetable,
        tasks: data.tasks,
        studyPlans: data.studyPlans,
        settings: data.settings,
        currentTime
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: currentTime
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "I'm having a brief connection delay, but you can keep executing your schedule! Focus on your immediate priority block.",
          timestamp: currentTime
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              AI Study Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active schedule context aware
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsChatOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
            <span>Consulting your schedule & reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Ask ChronoSage:
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your day, tasks, or study..."
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
