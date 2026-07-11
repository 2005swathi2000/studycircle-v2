import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  FileText,
  MessageSquare,
  Calendar,
  Video,
  Trophy,
  HelpCircle,
  Plus,
  Check,
  Play,
  Clock,
  BookOpen,
  ChevronRight,
  User
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { apiRequest } from '../utils/api';

interface SimpleDashboardProps {
  user: any;
  stats: {
    totalStudyHours: number;
    streakCount: number;
    totalStudySessions?: number;
    focusCoins?: number;
    xp?: number;
    level?: number;
    coursesEnrolled?: number;
    completedCourses?: number;
    certificatesEarned?: number;
  };
  loading?: boolean;
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
  equippedTheme?: string;
  sessions?: any[];
  onCreateGroup?: () => void;
  onCreateNote?: () => void;
  onAskDoubt?: () => void;
  onScheduleSession?: () => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  user,
  stats,
  loading = false,
  myGroups = [],
  router,
  setActiveTab,
  setStudySubView,
  setPracticeSubView,
  equippedTheme,
  sessions = [],
  onCreateGroup,
  onCreateNote,
  onAskDoubt,
  onScheduleSession
}) => {
  const { showToast } = useToast();

  // Load practice quiz history from localStorage for real activity log
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const atts = parseInt(localStorage.getItem('studycircle_practice_attempts') || '0', 10);
      const corrects = parseInt(localStorage.getItem('studycircle_practice_correct') || '0', 10);
      setPracticeAttempts(atts);
      setPracticeCorrect(corrects);
    }
  }, []);

  // Theme Styles mapping
  const cardStyle = useMemo(() => {
    switch (equippedTheme) {
      case 'cyberpunk':
        return {
          bg: 'bg-[#0f021e]/80 backdrop-blur-md',
          border: 'border border-fuchsia-500/20 shadow-md shadow-fuchsia-500/5',
          accent: 'text-fuchsia-400',
          button: 'bg-fuchsia-600 hover:bg-fuchsia-500',
          checkbox: 'bg-fuchsia-600 border-fuchsia-500'
        };
      case 'zengarden':
        return {
          bg: 'bg-[#03140a]/80 backdrop-blur-md',
          border: 'border border-emerald-500/20 shadow-md shadow-emerald-500/5',
          accent: 'text-emerald-400',
          button: 'bg-emerald-600 hover:bg-emerald-500',
          checkbox: 'bg-emerald-600 border-emerald-500'
        };
      case 'theme_solar_glow':
        return {
          bg: 'bg-[#1c1209]/80 backdrop-blur-md',
          border: 'border border-amber-500/20 shadow-md shadow-amber-500/5',
          accent: 'text-amber-400',
          button: 'bg-amber-600 hover:bg-amber-500',
          checkbox: 'bg-amber-600 border-amber-500'
        };
      case 'theme_dark_nebula':
        return {
          bg: 'bg-[#120a1c]/80 backdrop-blur-md',
          border: 'border border-purple-500/20 shadow-md shadow-purple-500/5',
          accent: 'text-purple-400',
          button: 'bg-indigo-650 hover:bg-indigo-550',
          checkbox: 'bg-indigo-650 border-indigo-550'
        };
      default:
        return {
          bg: 'bg-[#0B0F19]/60 backdrop-blur-md',
          border: 'border border-white/5 shadow-2xl',
          accent: 'text-indigo-400',
          button: 'bg-indigo-600 hover:bg-indigo-500',
          checkbox: 'bg-indigo-650 border-indigo-550'
        };
    }
  }, [equippedTheme]);

  // Greeting text selector
  const greetingText = useMemo(() => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Good Morning';
    if (hr >= 12 && hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Today Date formatted string
  const todayDateString = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Static daily-rotated quote
  const motivationalQuote = useMemo(() => {
    const day = new Date().getDate();
    const quotes = [
      "Consistency is the secret key to engineering mastery.",
      "Small progress every day beats occasional perfection.",
      "Your study circle is waiting for you to practice today.",
      "Focus on the study topic, not the statistics.",
      "Master the basics first. Build, break, refactor, and learn."
    ];
    return quotes[day % quotes.length];
  }, []);

  // Continue Learning path logic
  const activeCourse = myGroups && myGroups.length > 0 ? myGroups[0] : null;
  const progressPercent = useMemo(() => {
    if (!activeCourse) return 0;
    const slug = activeCourse.subject ? activeCourse.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'programming-dsa';
    let completedIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        completedIds = JSON.parse(localStorage.getItem('sc_completed_' + slug) || '[]');
      } catch (e) {}
    }
    const totalLessons = slug.includes('dsa') || slug.includes('programming') ? 20 : slug.includes('ai') ? 15 : 10;
    return Math.min(100, Math.round((completedIds.length / totalLessons) * 100));
  }, [activeCourse]);

  // Toggle assigned task status (real DB toggle)
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      const updated = user.assignedTasks.map((t: any) => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      await apiRequest('/auth/update-tasks', {
        method: 'POST',
        body: JSON.stringify({ assignedTasks: updated })
      });
      showToast(newStatus === 'Completed' ? 'Task marked as completed!' : 'Task marked as pending', 'success');
      // Simple location reload to sync task state changes cleanly
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
      showToast('Failed to update task status.', 'error');
    }
  };

  // Build 100% real activity list
  const realActivities = useMemo(() => {
    const actList = [];
    
    // Add real group registrations
    myGroups.forEach((group) => {
      actList.push({
        title: `Joined ${group.name} Circle`,
        desc: `Enrolled in ${group.subject || 'Core CS'} workspace study circle.`,
        date: new Date(group.createdAt || Date.now()).toLocaleDateString()
      });
    });

    // Add practice question events
    if (practiceAttempts > 0) {
      actList.push({
        title: 'Solved Practice Questions',
        desc: `Attempted ${practiceAttempts} practice coding challenges and solved ${practiceCorrect} correctly.`,
        date: 'Recent'
      });
    }

    return actList;
  }, [myGroups, practiceAttempts, practiceCorrect]);

  // SKELETON LOADER
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0 text-left animate-pulse">
        {/* Welcome Card & Quick Actions Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-6 p-6 bg-slate-900/40 border border-white/5 rounded-2xl h-[160px]" />
          <div className="lg:col-span-4 p-6 bg-slate-900/40 border border-white/5 rounded-2xl h-[160px]" />
        </div>
        
        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl h-[200px]" />
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl h-[200px]" />
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl h-[200px]" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl h-[250px]" />
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl h-[250px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white text-left font-sans animate-in fade-in duration-300 max-w-7xl mx-auto px-4 md:px-0 pb-16">
      
      {/* 1. WELCOME CARD & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Welcome Card (6 cols) */}
        <div className={`lg:col-span-6 p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl flex flex-col justify-between min-h-[160px]`}>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">{todayDateString}</span>
            <h1 className="text-xl font-black text-white tracking-tight mt-1">
              {greetingText}, {user?.firstName || user?.fullName?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed mt-2 italic">
              "{motivationalQuote}"
            </p>
          </div>
        </div>

        {/* Quick Actions (4 cols) */}
        <div className={`lg:col-span-4 p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl flex flex-col justify-between min-h-[160px]`}>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">⚡ Quick Actions</h3>
            <p className="text-[9px] text-zinc-550 font-semibold mt-0.5">Direct navigations to study modules.</p>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4">
            <button 
              onClick={onCreateGroup}
              className="p-3 bg-[#0c101d] hover:bg-white/[0.02] border border-white/5 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="Create Study Room"
            >
              <Video className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider">Rooms</span>
            </button>
            <button 
              onClick={() => { setActiveTab('practice'); setPracticeSubView('questions'); }}
              className="p-3 bg-[#0c101d] hover:bg-white/[0.02] border border-white/5 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="Practice Questions"
            >
              <Trophy className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider">Practice</span>
            </button>
            <button 
              onClick={onCreateNote}
              className="p-3 bg-[#0c101d] hover:bg-white/[0.02] border border-white/5 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="Create Note"
            >
              <FileText className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider">Notes</span>
            </button>
            <button 
              onClick={onAskDoubt}
              className="p-3 bg-[#0c101d] hover:bg-white/[0.02] border border-white/5 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="Discussion Board"
            >
              <MessageSquare className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider">Doubts</span>
            </button>
            <button 
              onClick={onScheduleSession}
              className="p-3 bg-[#0c101d] hover:bg-white/[0.02] border border-white/5 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="Schedule Study"
            >
              <Calendar className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider">Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* LEFT COLUMN: Study Tasks & Sessions */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* 2. CONTINUE LEARNING */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pb-2 border-b border-white/5 flex items-center gap-1.5">
              📖 Continue Learning
            </h3>
            
            {!activeCourse ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-zinc-550 italic">No active learning.</p>
                <button
                  onClick={() => { setActiveTab('study'); setStudySubView('workspaces'); }}
                  className={`px-4 py-2 ${cardStyle.button} text-white text-xs font-black uppercase rounded-xl border-none cursor-pointer`}
                >
                  Start Learning
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-white leading-normal">{activeCourse.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Subject Path: {activeCourse.subject}</p>
                  </div>
                  <span className="text-[8px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded font-black uppercase tracking-wide border border-indigo-500/15">
                    Active
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                    <span>{progressPercent}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { setActiveTab('study'); setStudySubView('workspaces'); }}
                    className={`px-4 py-2 ${cardStyle.button} text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer border-none flex items-center gap-1`}
                  >
                    Resume learning <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. TODAY'S TASKS */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pb-2 border-b border-white/5">
              📋 Today's Tasks
            </h3>
            
            <div className="space-y-3">
              {!user?.assignedTasks || user.assignedTasks.filter((t: any) => t.status !== 'Completed').length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-zinc-555 italic">No tasks for today.</p>
                </div>
              ) : (
                user.assignedTasks
                  .filter((task: any) => task.status !== 'Completed')
                  .map((task: any) => (
                    <div 
                      key={task.id} 
                      className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className={`h-5 w-5 rounded-lg border border-zinc-700 hover:border-indigo-500 bg-transparent flex items-center justify-center transition-all cursor-pointer`}
                        >
                          <Check className="h-3.5 w-3.5 opacity-0 hover:opacity-100 transition-opacity" />
                        </button>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {task.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{task.description}</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        task.priority === 'High' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' :
                        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-455 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/10'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* 4. UPCOMING STUDY SESSIONS */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pb-2 border-b border-white/5">
              🗓 Upcoming Study Sessions
            </h3>

            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="py-6 text-center space-y-3">
                  <p className="text-xs text-zinc-555 italic">No sessions scheduled.</p>
                  <button
                    onClick={onScheduleSession}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-zinc-300 text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider"
                  >
                    Schedule Session
                  </button>
                </div>
              ) : (
                sessions.map((sess) => (
                  <div key={sess.id} className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white leading-snug">{sess.title}</h4>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3 text-indigo-400" />
                        {sess.time}
                      </p>
                      <p className="text-[9px] text-indigo-400 font-bold">Subject: {sess.subject}</p>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('study'); setStudySubView('rooms'); }}
                      className="px-3.5 py-1.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider transition-all"
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Study Groups & Activity */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 5. STUDY GROUPS */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                👥 Study Groups
              </h3>
            </div>

            <div className="space-y-3">
              {myGroups.length === 0 ? (
                <div className="py-6 text-center space-y-3">
                  <p className="text-xs text-zinc-555 italic">No study groups joined.</p>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => { setActiveTab('groups'); }}
                      className="px-5 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-xl cursor-pointer uppercase tracking-wider border-none"
                    >
                      Join Group
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {myGroups.map((group) => {
                      const session = sessions.find(s => s.groupId === group.id || s.subject === group.subject);
                      return (
                        <div key={group.id} className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-left">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{group.name}</h4>
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block mt-0.5">Subject: {group.subject}</span>
                            <span className="text-[8px] text-zinc-450 block mt-0.5">👥 3 active members</span>
                            {session ? (
                              <span className="text-[8px] text-emerald-400 font-bold block mt-1 truncate">
                                📅 Session: {session.title} ({session.time})
                              </span>
                            ) : (
                              <span className="text-[8px] text-zinc-550 block mt-1">No upcoming sessions</span>
                            )}
                          </div>
                          <button
                            onClick={() => { setActiveTab('groups'); }}
                            className="px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider transition-all shrink-0"
                          >
                            Open Group
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <button 
                      onClick={() => { setActiveTab('groups'); }}
                      className="w-full py-2 bg-slate-900 border border-white/10 hover:border-[#5227EB]/30 text-white text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider text-center"
                    >
                      Join Group
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 6. RECENT ACTIVITY */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pb-2 border-b border-white/5">
              ⏱ Recent Activity
            </h3>

            <div className="space-y-3">
              {realActivities.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-zinc-555 italic">No recent activity.</p>
                </div>
              ) : (
                realActivities.map((act, i) => (
                  <div key={i} className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl flex items-start gap-3 text-left">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{act.title}</h4>
                      <p className="text-[9px] text-zinc-450 leading-normal">{act.desc}</p>
                      <span className="text-[8px] text-zinc-500 font-mono block mt-1">{act.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SimpleDashboard;
