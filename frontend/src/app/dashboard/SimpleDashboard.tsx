import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Activity, 
  CheckSquare, 
  Flame, 
  FileText, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Plus, 
  UserPlus, 
  Award,
  Upload,
  X,
  Edit3,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../components/ToastProvider';

interface SimpleDashboardProps {
  user: any;
  stats: {
    totalStudyHours: number;
    streakCount: number;
    totalStudySessions?: number;
    focusCoins?: number;
    xp?: number;
    level?: number;
  };
  myGroups: any[];
  availableGroups: any[];
  dailyMissions: any[];
  getGreeting: () => string;
  router: any;
  setActiveTab: (tab: any) => void;
  setStudySubView: (view: any) => void;
  setPracticeSubView: (view: any) => void;
  setProgressSubView: (view: any) => void;
  setCommunitySubView: (view: any) => void;
  setProfileSubView: (view: any) => void;
  setSelectedInterest: (interest: any) => void;
  completedGoals: string[];
  setCompletedGoals: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  user,
  stats,
  myGroups,
  availableGroups,
  dailyMissions,
  getGreeting,
  router,
  setActiveTab,
  setStudySubView,
  setPracticeSubView,
  setProgressSubView,
  setCommunitySubView,
  setProfileSubView,
  setSelectedInterest,
  completedGoals,
  setCompletedGoals
}) => {
  const { showToast } = useToast();
  const [lastActivity, setLastActivity] = useState<any>(null);

  // Today's Focus Goals State
  const [focusGoals, setFocusGoals] = useState<any[]>([
    { id: 'challenge', label: 'Complete Daily Challenge' },
    { id: 'pomodoro', label: 'Run 2 Pomodoro Sessions' },
    { id: 'dsa', label: 'Solve 5 DSA Problems' }
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [showAddGoalInput, setShowAddGoalInput] = useState(false);

  // Quick Action Modal States
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [showUploadNotesModal, setShowUploadNotesModal] = useState(false);

  // create note fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteGroupId, setNoteGroupId] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // upload notes fields
  const [uploadGroupId, setUploadGroupId] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim() || !noteGroupId) {
      showToast("All fields are required.", "error");
      return;
    }
    setSavingNote(true);
    try {
      await apiRequest('/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          groupId: noteGroupId
        })
      });
      showToast('Note created successfully! +20 XP earned.', 'success');
      setShowCreateNoteModal(false);
      setNoteTitle('');
      setNoteContent('');
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('studycircle-data-refresh'));
    } catch (e: any) {
      showToast(e.message || 'Failed to create note.', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleSimulatedUpload = async () => {
    if (!uploadGroupId || !uploadDesc || !selectedFile) {
      showToast("Please fill all fields and select a file.", "error");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(async () => {
      try {
        await apiRequest('/notes', {
          method: 'POST',
          body: JSON.stringify({
            title: selectedFile.name || 'document.pdf',
            content: `[Uploaded Note Reference: ${uploadDesc}]`,
            groupId: uploadGroupId
          })
        });
        showToast('Notes file uploaded successfully! +20 XP earned.', 'success');
        setShowUploadNotesModal(false);
        setUploadDesc('');
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('studycircle-data-refresh'));
      } catch (e: any) {
        showToast(e.message || 'Upload failed.', 'error');
        setIsUploading(false);
      }
    }, 1200);
  };

  const handleJoinPublicCircle = async (groupId: string) => {
    try {
      const data = await apiRequest(`/groups/${groupId}/join-public`, {
        method: 'POST'
      });
      showToast(data.message || 'Successfully joined study circle! +10 XP earned.', 'success');
      setShowJoinRoomModal(false);
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('studycircle-data-refresh'));
    } catch (err: any) {
      showToast(err.message || 'Failed to join study circle.', 'error');
    }
  };

  // Read dynamic Continue Learning last activity from localStorage on mount
  useEffect(() => {
    const checkActivity = () => {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem('studycircle_last_activity');
        if (item) {
          try {
            setLastActivity(JSON.parse(item));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
    checkActivity();
    window.addEventListener('studycircle-activity-update', checkActivity);
    return () => {
      window.removeEventListener('studycircle-activity-update', checkActivity);
    };
  }, []);

  const studyHours = stats.totalStudyHours || 0.0;
  const hoursInt = Math.floor(studyHours);
  const minsInt = Math.round((studyHours % 1) * 60);
  const studyHoursFormatted = `${hoursInt}h ${String(minsInt).padStart(2, '0')}m`;
  const streakDays = stats.streakCount || 12; // CEO defaults to 12

  // Toggle Daily Goal checklists
  const toggleGoal = (goalId: string) => {
    if (completedGoals.includes(goalId)) {
      setCompletedGoals(prev => prev.filter(g => g !== goalId));
    } else {
      setCompletedGoals(prev => [...prev, goalId]);
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newId = `g-${Date.now()}`;
    setFocusGoals(prev => [...prev, { id: newId, label: newGoalText.trim() }]);
    setNewGoalText('');
    setShowAddGoalInput(false);
    showToast('Focus goal added!', 'success');
  };

  const handleDeleteGoal = (id: string) => {
    setFocusGoals(prev => prev.filter(g => g.id !== id));
    setCompletedGoals(prev => prev.filter(g => g !== id));
    showToast('Focus goal deleted', 'info');
  };

  return (
    <div className="space-y-8 text-white text-left font-sans animate-in fade-in duration-300">
      
      {/* ================= HERO AREA ================= */}
      <div className="relative overflow-hidden p-8 bg-gradient-to-r from-[#1E293B]/70 via-[#0F172A]/80 to-[#1e1b4b]/30 border border-white/5 rounded-[32px] shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="text-left space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {getGreeting()}! 👋
            </h1>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">Let's coordinate focus desking to keep your placement ready milestones accelerating.</p>
          </div>

          {/* Streak Indicator Removed */}
        </div>

        {/* Continue Learning Widget */}
        <div className="pt-6">
          {lastActivity ? (
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 font-mono">CONTINUE LEARNING</span>
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-xl flex items-center justify-center text-lg shrink-0">
                    💻
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] text-slate-450 font-black uppercase tracking-wider block">Resume Last Session</span>
                    <h4 className="text-xs font-black text-white mt-0.5">{lastActivity.courseName}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">{lastActivity.lessonName}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab(lastActivity.tab);
                    if (lastActivity.subView === 'questions') {
                      setSelectedInterest(lastActivity.courseName);
                      setPracticeSubView('questions');
                    } else if (lastActivity.subView === 'rooms') {
                      setStudySubView('rooms');
                    }
                  }}
                  className="px-5 py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer border-none flex items-center gap-1.5 shadow-md active:scale-[0.98]"
                >
                  <Play className="h-3 w-3 fill-white" /> Resume &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* New User Onboarding On-Journey State */
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#10B981] font-mono">START YOUR LEARNING JOURNEY</span>
              <div className="p-4 bg-emerald-950/15 border border-emerald-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left space-y-1">
                  <h4 className="text-xs font-black text-white">Unlock Placement Preparedness</h4>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Set up your primary study interest to unlock guided DSA questions, group revision sessions, and mock assessment metrics.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('practice');
                    setPracticeSubView('questions');
                  }}
                  className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer border-none shrink-0"
                >
                  Choose Interest &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="bg-[#0B0F19]/45 border border-white/5 p-6 rounded-[28px] backdrop-blur-md shadow-xl text-left space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-350">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Action 1: Create Note */}
          <button 
            onClick={() => {
              if (myGroups.length > 0) setNoteGroupId(myGroups[0].id);
              setShowCreateNoteModal(true);
            }}
            className="p-5 bg-[#1E293B]/40 hover:bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 rounded-2xl text-left flex flex-col justify-between h-28 group transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm group-hover:scale-110 transition duration-200">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Create Note</h4>
              <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Jot down instant notes</p>
            </div>
          </button>

          {/* Action 2: Ask Doubt */}
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-ai-tutor', { 
                detail: { prefill: 'I need help with...' } 
              }));
            }}
            className="p-5 bg-[#1E293B]/40 hover:bg-white/[0.03] border border-white/5 hover:border-rose-500/30 rounded-2xl text-left flex flex-col justify-between h-28 group transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-455 flex items-center justify-center text-sm group-hover:scale-110 transition duration-200">
              <HelpCircle className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Ask Doubt</h4>
              <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Query AI tutor instantly</p>
            </div>
          </button>

          {/* Action 3: Join Room */}
          <button 
            onClick={() => setShowJoinRoomModal(true)}
            className="p-5 bg-[#1E293B]/40 hover:bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 rounded-2xl text-left flex flex-col justify-between h-28 group transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-455 flex items-center justify-center text-sm group-hover:scale-110 transition duration-200">
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Join Room</h4>
              <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Enter a learning circle</p>
            </div>
          </button>

          {/* Action 4: Upload Notes */}
          <button 
            onClick={() => {
              if (myGroups.length > 0) setUploadGroupId(myGroups[0].id);
              setShowUploadNotesModal(true);
            }}
            className="p-5 bg-[#1E293B]/40 hover:bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 rounded-2xl text-left flex flex-col justify-between h-28 group transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-455 flex items-center justify-center text-sm group-hover:scale-110 transition duration-200">
              <Upload className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Upload Notes</h4>
              <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Share files with peers</p>
            </div>
          </button>

        </div>
      </div>

      {/* ================= TODAY'S FOCUS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Daily Goals Checklist */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[28px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-indigo-400" /> Today's Focus Goals
              </h3>
              <span className="text-[10px] font-extrabold text-indigo-400 font-mono uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                {completedGoals.filter(g => focusGoals.some(fg => fg.id === g)).length} / {focusGoals.length} Done
              </span>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {focusGoals.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic py-2 text-center">No focus tasks listed.</p>
              ) : (
                focusGoals.map(goal => {
                  const isChecked = completedGoals.includes(goal.id);
                  return (
                    <div 
                      key={goal.id}
                      className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => toggleGoal(goal.id)}
                          className="rounded border-white/10 text-indigo-650 focus:ring-indigo-500/40 bg-slate-950 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span className={`text-[11px] font-semibold transition-all ${isChecked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {goal.label}
                        </span>
                      </label>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 rounded transition-all border-none bg-transparent cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Goal Input Area */}
            {!showAddGoalInput ? (
              <button
                onClick={() => setShowAddGoalInput(true)}
                className="w-full py-2.5 bg-white/[0.01] hover:bg-white/5 border border-white/5 rounded-xl text-[10px] text-zinc-300 font-bold transition-all cursor-pointer mt-2"
              >
                + Add Custom Goal
              </button>
            ) : (
              <form onSubmit={handleAddGoal} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Enter focus task..."
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="flex-1 bg-[#060813] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 placeholder-zinc-600"
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddGoalInput(false); setNewGoalText(''); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="pt-4 mt-4 border-t border-white/5">
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((completedGoals.filter(g => focusGoals.some(fg => fg.id === g)).length / Math.max(1, focusGoals.length)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Widget 2: Today's Challenge Teaser */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[28px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Daily Concept Challenge</h3>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-350 border border-rose-500/20 text-[8px] font-black uppercase shrink-0 tracking-wider">Quiz</span>
            </div>
            
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl text-left space-y-3">
              <p className="text-[11px] font-extrabold text-slate-200 leading-relaxed">
                Test your skills today: "Estimate the runtime complexity of Binary Search on a sorted array of N."
              </p>
              <button 
                onClick={() => {
                  setActiveTab('practice');
                  setPracticeSubView('challenge');
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl border-none uppercase tracking-widest cursor-pointer transition-all shadow-md active:scale-[0.98]"
              >
                Solve Challenge &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Widget 3: Upcoming Deadlines & Tasks (Segmented by date) */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[28px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-350">Upcoming Milestones</h3>
            
            <div className="space-y-3 text-[10px] font-semibold leading-snug max-h-48 overflow-y-auto scrollbar-none pr-1">
              
              {/* Today list */}
              <div className="space-y-1.5 text-left">
                <span className="text-[8px] font-extrabold text-indigo-400 uppercase tracking-widest block font-mono">📅 TODAY</span>
                <div className="p-2 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-200">OS Cluster Live revision session</span>
                  <span className="text-indigo-400 font-bold shrink-0">05:00 PM</span>
                </div>
              </div>

              {/* This Week list */}
              <div className="space-y-1.5 text-left pt-1">
                <span className="text-[8px] font-extrabold text-amber-500 uppercase tracking-widest block font-mono">⏳ THIS WEEK</span>
                <div className="space-y-1">
                  <div className="p-2 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-slate-200">Submit DBMS Schema homework</span>
                    <span className="text-slate-500 font-bold shrink-0">Wed</span>
                  </div>
                  <div className="p-2 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-slate-200">Mock Assessment 1: Full-Stack</span>
                    <span className="text-slate-500 font-bold shrink-0">Sat</span>
                  </div>
                </div>
              </div>

              {/* Completed Recently list */}
              <div className="space-y-1.5 text-left pt-1">
                <span className="text-[8px] font-extrabold text-[#10B981] uppercase tracking-widest block font-mono">✅ COMPLETED RECENTLY</span>
                <div className="p-2 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between opacity-60">
                  <span className="text-slate-450 line-through">Complete profile details</span>
                  <span className="text-[#10B981] font-bold shrink-0 font-mono">100%</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ================= PROGRESS SNAPSHOT & INSIGHTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Weekly Insights AI Coach (Conversational Insights) */}
        <div className="lg:col-span-2 bg-[#0B0F19] border border-white/5 rounded-[28px] p-5 shadow-lg flex flex-col justify-between text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Weekly Insights AI Coach
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-1 flex flex-col justify-between min-h-[90px]">
                <span className="text-[9px] text-[#A78BFA] font-black uppercase tracking-wider font-mono">Focus Summary</span>
                <p className="text-[11px] font-semibold text-slate-200 leading-normal">
                  "Great work! You studied **5.2 focus hours** more this week than last week."
                </p>
              </div>
              
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-1 flex flex-col justify-between min-h-[90px]">
                <span className="text-[9px] text-[#10B981] font-black uppercase tracking-wider font-mono">Concept Path</span>
                <p className="text-[11px] font-semibold text-slate-200 leading-normal">
                  "You are consistently improving in DSA. We recommend learning **Graphs** next!"
                </p>
              </div>
              
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-1 flex flex-col justify-between min-h-[90px]">
                <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider font-mono">Streak Insight</span>
                <p className="text-[11px] font-semibold text-slate-200 leading-normal">
                  "You keep maintaining your consistency. You are just **1 challenge away** from reaching Level 6."
                </p>
              </div>

              <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl flex items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[8px] text-slate-500 font-black block">WANT DETAILED HELP?</span>
                  <span className="text-[11px] font-black text-white block mt-0.5">Talk to AI Coach</span>
                </div>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-ai-tutor'))}
                  className="px-3.5 py-2 bg-indigo-600/30 hover:bg-[#5227EB] hover:text-white border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                >
                  Consult AI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: XP Snapshot */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[28px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-350">Academic Progress</h3>
            
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-black block leading-none">CURRENT LEVEL</span>
                  <span className="text-sm font-black text-white block mt-0.5">Level {stats.level || 5}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black font-mono tracking-wide text-slate-400">
                  <span>Level progress</span>
                  <span>{stats.xp || 480} XP</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }} />
                </div>
                <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">Solve practice queries to earn another 120 XP to rank up.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= SOCIAL & COMMUNITY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Action-Oriented Study Rooms */}
        <div className="lg:col-span-2 bg-[#0B0F19] border border-white/5 rounded-[28px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-400" /> Active Study Rooms
              </h3>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider font-mono">
                {availableGroups.length > 0 ? `${availableGroups.length} Rooms Active` : '0 Rooms Active'}
              </span>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button 
                onClick={() => {
                  setActiveTab('study');
                  setStudySubView('rooms');
                }}
                className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition border-none cursor-pointer"
              >
                Join Live Room
              </button>
              <button 
                onClick={() => {
                  setActiveTab('study');
                  setStudySubView('rooms');
                  setTimeout(() => {
                    const btn = document.getElementById('create-circle-btn-trigger');
                    if (btn) btn.click();
                  }, 100);
                }}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition border border-white/5 cursor-pointer"
              >
                + Create Room
              </button>
              <button 
                onClick={() => {
                  setActiveTab('community');
                  setCommunitySubView('chat');
                }}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition border border-white/5 cursor-pointer"
              >
                Invite Friends
              </button>
            </div>

            {availableGroups.length === 0 ? (
              /* CEO Friendly Empty State */
              <div className="p-6 bg-slate-950/20 border border-dashed border-white/5 rounded-2xl text-center space-y-2">
                <span className="text-xl block">🏫</span>
                <p className="text-xs font-black text-slate-400">No active study rooms right now.</p>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Be the first to start a room and invite your batchmates to desk together!</p>
              </div>
            ) : (
              /* Live Presence Updates */
              <div className="grid md:grid-cols-2 gap-4">
                {availableGroups.slice(0, 2).map((room, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col justify-between min-h-[110px]">
                    <div className="text-left space-y-1">
                      <span className="text-[8px] text-emerald-450 font-black uppercase tracking-wider block font-mono">
                        🔥 Live Presence
                      </span>
                      <h4 className="text-xs font-black text-white leading-tight">{room.name}</h4>
                      <p className="text-[9px] text-slate-450 leading-relaxed font-semibold">
                        {idx === 0 ? "Rahul is solving Arrays, Rahul joined 2m ago." : "3 students discussing DBMS normalization."}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const slug = room.id === 'ai-room' ? 'ai-ml' : 'programming-dsa';
                        router.push(`/workspace/${slug}`);
                      }}
                      className="px-3 py-1.5 bg-[#5227EB]/20 hover:bg-[#5227EB] text-indigo-300 hover:text-white border border-[#5227EB]/30 text-[9px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer mt-3 self-start"
                    >
                      Join Circle &rarr;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Widget 2: Social Leaderboard Teaser */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[28px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-350">Academic Standings</h3>
            
            <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-3">
              <div className="text-left">
                <span className="text-[8px] text-slate-500 font-black block">YOUR CURRENT STANDING</span>
                <span className="text-base font-black text-white block mt-0.5">Top 10% of Batch</span>
                <p className="text-[9px] text-emerald-500 font-semibold leading-relaxed mt-1">Consistency rating improved by 20% compared to last week.</p>
              </div>
              
              <button
                onClick={() => {
                  setActiveTab('community');
                  setCommunitySubView('leaderboard');
                }}
                className="w-full py-2 bg-indigo-650/20 hover:bg-[#5227EB] hover:text-white text-indigo-300 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer text-center"
              >
                Open Leaderboard &rarr;
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ================= ACADEMIC JOURNEY OVERVIEW ================= */}
      <div className="bg-[#0B0F19]/40 border border-white/5 p-6 rounded-[28px] backdrop-blur-md shadow-xl text-left">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 mb-5 flex items-center gap-1.5">
          <span>🛡️ Your Academic Placement Journey</span>
        </h3>
        
        {/* Linear Progress Road Map */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { step: 1, name: "Beginner", desc: "Syllabus onboarding", active: true, done: true },
            { step: 2, name: "Learning", desc: "Notes & resources", active: true, done: true },
            { step: 3, name: "Practicing", desc: "Daily challenges", active: true, done: false },
            { step: 4, name: "Consistency", desc: "Keep streaks hot", active: false, done: false },
            { step: 5, name: "Achievements", desc: "Badges & certificates", active: false, done: false },
            { step: 6, name: "Placement Ready", desc: "Mock test benchmark", active: false, done: false }
          ].map((item, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between min-h-[90px] transition-all ${
                item.done 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-white' 
                  : item.active 
                    ? 'bg-indigo-500/5 border-indigo-500/25 text-white shadow-md shadow-indigo-500/5' 
                    : 'bg-[#0B0F19]/60 border-white/5 text-slate-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black font-mono">STEP {item.step}</span>
                {item.done && <span className="text-emerald-450 text-xs font-black">✓</span>}
                {!item.done && item.active && <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-ping" />}
              </div>
              <div className="space-y-0.5 mt-2">
                <h4 className="text-xs font-black leading-tight">{item.name}</h4>
                <p className={`text-[8px] font-semibold leading-normal ${item.done ? 'text-slate-400' : item.active ? 'text-slate-350' : 'text-slate-600'}`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODALS & DRAWERS FOR QUICK ACTIONS ================= */}
      
      {/* 1. Create Note Modal */}
      {showCreateNoteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-[32px] w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Create Note</h3>
              <button 
                onClick={() => setShowCreateNoteModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/5 border-none bg-transparent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Select Study Circle / Room</label>
                <select 
                  value={noteGroupId}
                  onChange={(e) => setNoteGroupId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {myGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.subject})</option>
                  ))}
                  {myGroups.length === 0 && <option value="">No rooms joined yet</option>}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Note Title</label>
                <input 
                  type="text" 
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Notes content</label>
                <textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type your notes here..."
                  rows={6}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setShowCreateNoteModal(false)}
                className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNote}
                disabled={savingNote || myGroups.length === 0}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer border-none"
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Join Room Popup Modal */}
      {showJoinRoomModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-[32px] w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Join Recommended Rooms</h3>
              <button 
                onClick={() => setShowJoinRoomModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/5 border-none bg-transparent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {availableGroups.map((room) => (
                <div key={room.id} className="p-3.5 bg-slate-900 border border-white/5 rounded-2xl flex justify-between items-center gap-3">
                  <div className="text-left">
                    <span className="text-[8px] text-indigo-400 font-mono font-black uppercase">{room.subject}</span>
                    <h4 className="text-xs font-black text-white mt-0.5">{room.name}</h4>
                    <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{room.description || 'Database study group.'}</p>
                  </div>
                  <button
                    onClick={() => handleJoinPublicCircle(room.id)}
                    className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white text-[9px] font-black uppercase rounded-xl transition border-none cursor-pointer shrink-0"
                  >
                    Join
                  </button>
                </div>
              ))}
              {availableGroups.length === 0 && (
                <p className="text-xs text-slate-450 text-center py-4">No available public rooms found.</p>
              )}
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setShowJoinRoomModal(false)}
                className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Upload Notes Modal */}
      {showUploadNotesModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-[32px] w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Upload Notes File</h3>
              <button 
                onClick={() => setShowUploadNotesModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/5 border-none bg-transparent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Select Target Room</label>
                <select 
                  value={uploadGroupId}
                  onChange={(e) => setUploadGroupId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {myGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.subject})</option>
                  ))}
                  {myGroups.length === 0 && <option value="">No rooms joined yet</option>}
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onClick={() => document.getElementById('notes-file-picker')?.click()}
                className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl p-6 text-center hover:bg-white/[0.01] transition-all cursor-pointer space-y-2"
              >
                <input 
                  id="notes-file-picker"
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
                <span className="text-2xl block">📂</span>
                <p className="text-xs font-black text-slate-200">
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag & Drop your file or click to browse'}
                </p>
                <p className="text-[9px] text-slate-500">Supports PDF, DOCX, TXT, PPTX (Max 15MB)</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">File Description</label>
                <input 
                  type="text" 
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Add file description (e.g. Chapter 3 Normalization study guide)..."
                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {isUploading && (
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex justify-between text-[9px] font-black text-slate-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setShowUploadNotesModal(false)}
                className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSimulatedUpload}
                disabled={isUploading || myGroups.length === 0 || !selectedFile}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer border-none"
              >
                {isUploading ? 'Uploading...' : 'Upload notes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
