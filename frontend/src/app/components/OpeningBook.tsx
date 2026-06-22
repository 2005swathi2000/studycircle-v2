'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Navigation } from 'lucide-react';

interface OpeningBookProps {
  onComplete: () => void;
}

export default function OpeningBook({ onComplete }: OpeningBookProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isOpening) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 35; // Max 10-15px tilt
      const y = (e.clientY - innerHeight / 2) / 35;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpening]);

  const handleOpenBook = () => {
    if (isOpening) return;
    setIsOpening(true);

    // After 2.6 seconds, trigger the landing page transition
    setTimeout(() => {
      onComplete();
    }, 2800);
  };

  // Staggered background floating academic particles
  const floatingParticles = [
    { id: 1, type: 'cap', x: '10%', y: '20%', size: 40, delay: 0, duration: 8 },
    { id: 2, type: 'book', x: '85%', y: '15%', size: 36, delay: 1, duration: 10 },
    { id: 3, type: 'pencil', x: '15%', y: '75%', size: 28, delay: 2, duration: 9 },
    { id: 4, type: 'star', x: '80%', y: '70%', size: 24, delay: 0.5, duration: 7 },
    { id: 5, type: 'glow', x: '50%', y: '30%', size: 150, delay: 0, duration: 12 },
    { id: 6, type: 'cap', x: '75%', y: '80%', size: 32, delay: 3, duration: 11 },
    { id: 7, type: 'book', x: '5%', y: '45%', size: 30, delay: 1.5, duration: 10 }
  ];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#EEF2F6] via-[#F1F5F9] to-[#E2E8F0] overflow-hidden flex flex-col items-center justify-center z-[9999]"
      style={{ perspective: '1600px' }}
    >
      {/* 🚀 Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute top-6 right-6 px-4 py-2 bg-white/70 hover:bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm backdrop-blur-sm z-[10000] cursor-pointer"
      >
        Skip Animation
      </button>

      {/* 1. Ambient Floating Knowledge Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: 0, opacity: 0.15 }}
            animate={{ 
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 10, 0],
              opacity: [0.15, 0.35, 0.15]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut'
            }}
            className="absolute flex items-center justify-center text-indigo-400/30"
            style={{ left: p.x, top: p.y }}
          >
            {p.type === 'glow' && (
              <div 
                className="rounded-full bg-indigo-300/10 blur-[60px] pointer-events-none" 
                style={{ width: p.size, height: p.size }}
              />
            )}
            {p.type === 'cap' && (
              <svg className="fill-current opacity-40" style={{ width: p.size, height: p.size }} viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17L5 13.18z"/>
              </svg>
            )}
            {p.type === 'book' && (
              <svg className="fill-current opacity-40" style={{ width: p.size, height: p.size }} viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            )}
            {p.type === 'pencil' && (
              <svg className="fill-current opacity-40" style={{ width: p.size, height: p.size }} viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            )}
            {p.type === 'star' && <Sparkles className="h-6 w-6 stroke-[1.5]" />}
          </motion.div>
        ))}
      </div>

      {/* 2. Realistic 3D Centerpiece Book */}
      <motion.div
        animate={isOpening ? {
          scale: [1, 1.05, 3.5],
          z: [0, 50, 400],
          y: [0, -10, 0],
          rotateX: [0, 5, 0],
          opacity: [1, 1, 0]
        } : {
          rotateY: mousePos.x,
          rotateX: -mousePos.y,
          y: [0, -10, 0]
        }}
        transition={isOpening ? {
          duration: 2.8,
          ease: [0.645, 0.045, 0.355, 1] // cubic-bezier matching page lift zoom
        } : {
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }}
        onClick={handleOpenBook}
        className="relative w-[340px] h-[450px] cursor-pointer select-none border-none shadow-2xl rounded-r-2xl origin-center preserve-3d"
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: isOpening ? '0 30px 100px rgba(79, 70, 229, 0.2)' : '0 25px 65px rgba(15, 23, 42, 0.15)'
        }}
      >
        {/* Underlay glow from inside */}
        <AnimatePresence>
          {isOpening && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.9, 0], scale: [0.8, 1.4, 2] }}
              transition={{ duration: 2.2, delay: 0.4 }}
              className="absolute inset-0 bg-gradient-to-tr from-amber-300 via-indigo-400 to-indigo-600 blur-[85px] mix-blend-screen -z-20 pointer-events-none rounded-2xl"
            />
          )}
        </AnimatePresence>

        {/* 📚 BOOK PAGES BACKBONE STACK (For realism when closed) */}
        <div className="absolute right-0 top-1 bottom-1 w-3 bg-[#E2E8F0] border-y border-slate-300 rounded-l shadow-inner flex flex-col justify-between py-1 z-0 translate-z-[1px]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[1px] w-full bg-slate-350 opacity-40" />
          ))}
        </div>

        {/* 📚 BACK HARDCOVER COVER CONTAINER */}
        <div 
          className="absolute inset-0 bg-[#3B3399] rounded-r-2xl border-l-[6px] border-[#312a84] z-[-5]"
          style={{
            transform: 'translateZ(-15px)',
            boxShadow: 'inset -5px 0 15px rgba(0,0,0,0.1)'
          }}
        />

        {/* 📚 PAGE 2: RIGHT INNER SIDE OF REAR COVER */}
        <div 
          className="absolute inset-[3px] right-2 bg-[#FAF8F5] rounded-r-xl p-6 border-l border-slate-200 z-[1] select-none text-left flex flex-col justify-between pointer-events-none"
          style={{ transform: 'translateZ(-13px)' }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-1 text-[8px] font-black uppercase text-indigo-500 tracking-wider">
              <Sparkles className="h-3 w-3" /> AP & TG Cluster
            </div>
            <h3 className="text-xl font-black text-slate-850 leading-tight uppercase font-sans tracking-tight">Your Circle</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              Connecting thousands of engineering & degree students under a unified accountability framework.
            </p>
          </div>
          <div className="text-[8px] font-mono text-slate-400 tracking-wider uppercase border-t border-slate-100 pt-2 flex justify-between items-center">
            <span>StudyCircle v2.0</span>
            <span>2026 Edition</span>
          </div>
        </div>

        {/* 📚 PAGE 1: SECOND PAGE SHEET FLIPPING SEQUENCE */}
        <motion.div
          animate={isOpening ? { rotateY: -160, z: -10 } : { rotateY: 0, z: -5 }}
          transition={{ duration: 1.8, delay: 0.35, ease: 'easeOut' }}
          className="absolute inset-[4px] right-2.5 bg-[#FDFBF7] rounded-r-xl p-6 border-l-[3px] border-amber-100/50 shadow-md origin-left preserve-3d"
          style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.02)'
          }}
        >
          <div className="w-full h-full text-left flex flex-col justify-between">
            <div className="space-y-3.5">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Section I • Collaboration</span>
              <h4 className="text-sm font-black text-slate-900 font-sans tracking-tight">Rules of Study</h4>
              <ul className="space-y-2 text-[9px] text-slate-500 font-bold leading-normal pl-4 list-disc">
                <li>Share syllabus guides inside local Study Rooms.</li>
                <li>Earn Focus Coins for study session intervals.</li>
                <li>Stay active on discussion doubt feeds.</li>
                <li>Avoid group stagnation with weekly milestones.</li>
              </ul>
            </div>
            <div className="text-[7px] text-slate-400 flex justify-between border-t border-slate-100 pt-2 font-mono">
              <span>Chapter 1: Foundations</span>
              <span>Page 3</span>
            </div>
          </div>
        </motion.div>

        {/* 📚 PAGE 0: FIRST PAGE SHEET FLIPPING SEQUENCE */}
        <motion.div
          animate={isOpening ? { rotateY: -150, z: -5 } : { rotateY: 0, z: 0 }}
          transition={{ duration: 1.6, delay: 0.15, ease: 'easeOut' }}
          className="absolute inset-[4px] right-2.5 bg-[#FAF9F5] rounded-r-xl p-6 border-l-[3px] border-amber-100 shadow-md origin-left preserve-3d"
          style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.03)'
          }}
        >
          <div className="w-full h-full text-left flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Foreword • Synergy</span>
              <h4 className="text-sm font-black text-[#4F46E5] font-sans tracking-tight">The StudyCircle Manifesto</h4>
              <p className="text-[9.5px] text-slate-600 leading-relaxed font-semibold">
                Traditional group chat networks collapse under silent passivity. StudyCircle establishes absolute structural accountability, providing structured live sessions, shared notes, and gamified progress routines.
              </p>
            </div>
            <div className="text-[7px] text-slate-400 flex justify-between border-t border-slate-100 pt-2 font-mono">
              <span>Introduction</span>
              <span>Page 1</span>
            </div>
          </div>
        </motion.div>

        {/* 📚 FRONT HARDCOVER COVER */}
        <motion.div
          animate={isOpening ? { rotateY: -135, z: 5 } : { rotateY: 0, z: 10 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] via-[#4338CA] to-[#3730A3] rounded-r-2xl border-l-[8px] border-[#312a84] shadow-2xl flex flex-col justify-between p-7 text-center overflow-hidden origin-left preserve-3d"
          style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d',
            boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.05), inset -2px -2px 0 rgba(0,0,0,0.2)'
          }}
        >
          {/* Subtle gold line framing */}
          <div className="absolute inset-2.5 border border-amber-400/20 rounded-xl pointer-events-none" />

          {/* Book spines background texture */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/10 shadow-r" />

          <div className="space-y-4 pt-10 select-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="mx-auto w-12 h-12 rounded-full border-2 border-amber-400/30 flex items-center justify-center text-amber-400 bg-amber-400/5 shadow-inner"
            >
              <BookOpen className="h-6 w-6 stroke-[1.5]" />
            </motion.div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-widest text-white uppercase font-sans drop-shadow-md">
                StudyCircle
              </h1>
              <div className="h-[2px] w-20 bg-amber-400/60 mx-auto rounded" />
            </div>
          </div>

          <div className="space-y-2 pb-6 select-none">
            <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest">
              Learn Together. Grow Together.
            </p>
            <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-widest leading-none">
              AP & Telangana Collaborative Space
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Click Guidance Prompt */}
      <AnimatePresence>
        {!isOpening && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex flex-col items-center gap-3 relative z-10"
          >
            <span className="text-xs font-black uppercase text-[#4F46E5] tracking-widest font-sans drop-shadow-sm select-none">
              Tap To Open Your Learning Journey
            </span>

            {/* Hand Pointer Animation */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 0.9, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="text-[#4F46E5] flex items-center justify-center shrink-0 w-8 h-8 opacity-95 pointer-events-none"
            >
              <Navigation className="h-6 w-6 rotate-[135deg] fill-[#4F46E5]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
