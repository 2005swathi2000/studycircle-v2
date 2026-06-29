'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, MessageSquare, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../utils/api';

export const FloatingAiTutor = () => {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'tutor', text: string }>>([
    { sender: 'tutor', text: "Hello! I am your StudyCircle AI Academic Tutor. 🎓 I can explain complex subjects like DBMS or Operating Systems, outline custom study plans, or help you understand how to navigate the platform. What are you studying today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Register window custom event listener to open from other modules
  useEffect(() => {
    const handleOpenRequest = () => {
      setIsOpen(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('open-ai-tutor', handleOpenRequest);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-ai-tutor', handleOpenRequest);
      }
    };
  }, []);

  // Hide completely for unauthenticated guest users
  if (!user) return null;

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Append user message
    const userMsg = { sender: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await apiRequest('/ai-tutor', {
        method: 'POST',
        body: JSON.stringify({ text })
      });

      if (data && data.response) {
        setMessages(prev => [...prev, { sender: 'tutor' as const, text: data.response }]);
      } else {
        throw new Error(data?.error || 'Invalid response from AI Tutor.');
      }
    } catch (err: any) {
      console.error("AI Tutor response error:", err);
      setMessages(prev => [...prev, { 
        sender: 'tutor' as const, 
        text: `⚠️ **AI Chat Error**: ${err.message || 'The AI Tutor is currently busy. Please try again in a few moments!'}` 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      
      {/* 1. Floating Circular Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-14 w-14 rounded-full flex items-center justify-center text-white shadow-2xl border-none cursor-pointer transform hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Ask AI Study Tutor"
        >
          {/* Glowing pulse outer background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5227EB] via-indigo-500 to-[#E11D48] opacity-90 shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse" />
          {/* Icon container */}
          <div className="absolute inset-[3px] rounded-full bg-[#060a16] flex items-center justify-center">
            <Sparkles className="h-5.5 w-5.5 text-[#818CF8] group-hover:rotate-12 transition-transform" />
          </div>
        </button>
      )}

      {/* 2. AI Tutor Chat Card (Positioned directly above or side of the bubble) */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-h-[500px] bg-[#090d1e] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
          
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0b1026]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles className="h-4.5 w-4.5 fill-indigo-400/20" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">AI Study Tutor</h3>
                <span className="text-[8px] text-[#A78BFA] font-black uppercase flex items-center gap-1 leading-none mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Assistant
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm p-1.5 rounded-lg hover:bg-white/5 border-none bg-transparent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin max-h-[300px] min-h-[220px]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'tutor' && (
                  <div className="h-7 w-7 rounded-full border border-indigo-500/30 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-5 w-5">
                      <rect x="18" y="24" width="64" height="52" fill="#1E1B4B" rx="22" stroke="#818CF8" strokeWidth="2.5" />
                      <circle cx="38" cy="46" r="4.5" fill="#38BDF8" />
                      <circle cx="62" cy="46" r="4.5" fill="#38BDF8" />
                      <path d="M42 54 Q50 59 58 54" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" fill="transparent" />
                    </svg>
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-3 text-[11px] ${
                  msg.sender === 'user' 
                    ? 'bg-[#5227EB] text-white rounded-tr-none' 
                    : 'bg-[#151a30] border border-white/5 text-slate-200 rounded-tl-none space-y-1.5'
                }`}>
                  {msg.sender === 'tutor' ? (
                    <div className="space-y-1.5 leading-relaxed">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => {
                        if (paragraph.startsWith('### ')) {
                          return <h4 key={pIdx} className="text-white font-extrabold text-[10px] uppercase tracking-wide border-b border-white/5 pb-0.5 mt-2">{paragraph.replace('### ', '')}</h4>;
                        }
                        if (paragraph.includes('* ')) {
                          return (
                            <ul key={pIdx} className="list-disc pl-4 space-y-1 font-semibold text-slate-300">
                              {paragraph.split('\n').filter(l => l.trim().startsWith('* ')).map((item, iIdx) => (
                                <li key={iIdx}>{item.replace('* ', '')}</li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p key={pIdx} className="font-semibold text-slate-300">
                            {paragraph.split('**').map((part, partIdx) => 
                              partIdx % 2 === 1 ? <strong key={partIdx} className="text-[#A78BFA] font-extrabold">{part}</strong> : part
                            )}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5 justify-start">
                <div className="h-7 w-7 rounded-full border border-indigo-500/30 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0">
                  <RefreshCw className="h-4.5 w-4.5 text-indigo-400 animate-spin" />
                </div>
                <div className="bg-[#151a30] border border-white/5 text-slate-400 rounded-2xl rounded-tl-none p-3 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Tutor is writing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 border-t border-white/5 bg-[#0b1026]/40 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {[
              { label: 'Explain DBMS', query: 'Can you explain the key concepts of DBMS normalization?' },
              { label: 'Study Plan', query: 'Help me outline a 7-day study plan for Operating Systems.' },
              { label: 'Streaks Help', query: 'How do streaks and XP coins work in StudyCircle?' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className="px-2.5 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-slate-350 hover:text-white rounded-lg text-[9px] font-bold whitespace-nowrap transition-all cursor-pointer border-none"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 border-t border-white/5 bg-[#0b1026] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-950 border border-white/5 focus:border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 bg-indigo-650 hover:bg-indigo-500 disabled:bg-zinc-800 text-white disabled:text-zinc-550 rounded-xl border-none cursor-pointer transition-all shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
