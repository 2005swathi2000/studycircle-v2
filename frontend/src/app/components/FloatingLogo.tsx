'use client';

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export const FloatingLogo = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="fixed top-6 left-6 z-[1000] flex items-center gap-3 group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-14 left-0 bg-[#0E1017]/95 border border-indigo-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 w-56 font-sans">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Workspace Dev Node</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h4 className="text-[11px] font-bold text-white">StudyCircle Workspace</h4>
            <p className="text-[9px] text-slate-450 leading-relaxed font-semibold">
              All systems online. AP & Telangana degree cluster node active.
            </p>
          </div>
        </div>
      )}

      {/* Floating Logo Badge wrapped in a Link */}
      <Link href="/" className="no-underline">
        <div className="relative h-10 w-10 flex items-center justify-center shrink-0 shadow-lg cursor-pointer transform hover:scale-110 active:scale-95 transition-all duration-300">
          {/* Outer glowing border ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5227EB] via-indigo-400 to-[#E11D48] opacity-90 shadow-[0_0_15px_rgba(99,102,241,0.4)] animate-pulse" />
          {/* Inner dark circle */}
          <div className="absolute inset-[3px] rounded-full bg-[#060a16] flex items-center justify-center text-white font-bold">
            <BookOpen className="h-4.5 w-4.5 text-[#818CF8]" />
          </div>
        </div>
      </Link>
    </div>
  );
};
