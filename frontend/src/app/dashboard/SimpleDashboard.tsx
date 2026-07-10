import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Award,
  Trophy,
  Clock,
  Check,
  Calendar,
  Sparkles,
  Search,
  PlusCircle,
  MessageSquare,
  FileText,
  Video,
  ChevronRight,
  HelpCircle,
  Plus,
  Play
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
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  user,
  stats,
  myGroups,
  setActiveTab,
  setStudySubView,
  setPracticeSubView,
  equippedTheme,
  sessions = [],
  onCreateGroup
}) => {
  const { showToast } = useToast();
  
  // Local storage values for quizzes/practice questions
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [practiceXP, setPracticeXP] = useState(0);
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const atts = parseInt(localStorage.getItem('studycircle_practice_attempts') || '0', 10);
      const corrects = parseInt(localStorage.getItem('studycircle_practice_correct') || '0', 10);
      const pxp = parseInt(localStorage.getItem('studycircle_practice_xp') || '0', 10);
      setPracticeAttempts(atts);
      setPracticeCorrect(corrects);
      setPracticeXP(pxp);

      // Sum completed lessons
      let count = 0;
      myGroups.forEach(group => {
        const slug = group.subject ? group.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'programming-dsa';
        try {
          const ids = JSON.parse(localStorage.getItem('sc_completed_' + slug) || '[]');
          count += ids.length;
        } catch (e) {}
      });
      setCompletedLessonsCount(count);
    }
  }, [myGroups]);

  // Dynamic theme config mapping
  const cardStyle = useMemo(() => {
    switch (equippedTheme) {
      case 'cyberpunk':
        return {
          bg: 'bg-[#0f021e]/80 backdrop-blur-md',
          border: 'border border-fuchsia-500/20 shadow-md shadow-fuchsia-500/5',
          accent: 'text-fuchsia-400',
          hoverBg: 'hover:bg-fuchsia-500/5',
          badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
        };
      case 'zengarden':
        return {
          bg: 'bg-[#03140a]/80 backdrop-blur-md',
          border: 'border border-emerald-500/20 shadow-md shadow-emerald-500/5',
          accent: 'text-emerald-400',
          hoverBg: 'hover:bg-emerald-500/5',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'theme_solar_glow':
        return {
          bg: 'bg-[#1c1209]/80 backdrop-blur-md',
          border: 'border border-amber-500/20 shadow-md shadow-amber-500/5',
          accent: 'text-amber-400',
          hoverBg: 'hover:bg-amber-500/5',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'theme_dark_nebula':
        return {
          bg: 'bg-[#120a1c]/80 backdrop-blur-md',
          border: 'border border-purple-500/20 shadow-md shadow-purple-500/5',
          accent: 'text-purple-400',
          hoverBg: 'hover:bg-purple-500/5',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        };
      case 'theme_emerald_cosmic':
        return {
          bg: 'bg-[#061510]/80 backdrop-blur-md',
          border: 'border border-emerald-500/20 shadow-md shadow-emerald-550/5',
          accent: 'text-emerald-400',
          hoverBg: 'hover:bg-emerald-500/5',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'default':
      default:
        return {
          bg: 'bg-[#0B0F19]/60 backdrop-blur-md',
          border: 'border border-white/5 shadow-2xl',
          accent: 'text-indigo-400',
          hoverBg: 'hover:bg-indigo-500/5',
          badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        };
    }
  }, [equippedTheme]);

  const buttonStyle = useMemo(() => {
    switch (equippedTheme) {
      case 'cyberpunk':
        return 'bg-fuchsia-600 hover:bg-fuchsia-500';
      case 'zengarden':
        return 'bg-emerald-600 hover:bg-emerald-500';
      case 'theme_solar_glow':
        return 'bg-amber-600 hover:bg-amber-500';
      case 'theme_dark_nebula':
        return 'bg-indigo-650 hover:bg-indigo-550';
      case 'default':
      default:
        return 'bg-blue-650 hover:bg-blue-550';
    }
  }, [equippedTheme]);

  const checkboxStyle = useMemo(() => {
    switch (equippedTheme) {
      case 'cyberpunk':
        return 'bg-fuchsia-600 border-fuchsia-500';
      case 'zengarden':
        return 'bg-emerald-600 border-emerald-500';
      case 'theme_solar_glow':
        return 'bg-amber-600 border-amber-500';
      case 'theme_dark_nebula':
        return 'bg-indigo-650 border-indigo-550';
      case 'default':
      default:
        return 'bg-blue-650 border-blue-550';
    }
  }, [equippedTheme]);

  const themeGradient = useMemo(() => {
    switch (equippedTheme) {
      case 'zengarden': return 'from-emerald-500 to-teal-500';
      case 'cyberpunk': return 'from-fuchsia-500 to-purple-500';
      case 'theme_solar_glow': return 'from-amber-500 to-orange-500';
      case 'theme_dark_nebula': return 'from-indigo-500 to-purple-600';
      default: return 'from-indigo-500 to-blue-600';
    }
  }, [equippedTheme]);

  // Active course progress calculation
  const activeCourse = myGroups && myGroups.length > 0 ? myGroups[0] : null;
  let activeSlug = 'programming-dsa';
  let completedIds: string[] = [];
  let totalLessons = 10;
  let progressPercent = 0;

  if (activeCourse) {
    activeSlug = activeCourse.subject ? activeCourse.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'programming-dsa';
    if (typeof window !== 'undefined') {
      try {
        completedIds = JSON.parse(localStorage.getItem('sc_completed_' + activeSlug) || '[]');
      } catch (e) {}
    }
    totalLessons = activeSlug.includes('dsa') || activeSlug.includes('programming') ? 20 : activeSlug.includes('ai') ? 15 : 10;
    progressPercent = Math.min(100, Math.round((completedIds.length / totalLessons) * 100));
  }

  // Greeting logic
  const getGreetingText = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Good Morning';
    if (hr >= 12 && hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayDateString = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Toggle assigned task status
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
      showToast(newStatus === 'Completed' ? 'Task marked as completed! (+50 XP)' : 'Task marked as pending', 'success');
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
      showToast('Failed to update task status.', 'error');
    }
  };

  // Build real activities feed
  const realActivities = useMemo(() => {
    const actList = [];
    if (stats?.totalStudyHours > 0) {
      actList.push({
        icon: Clock,
        title: 'Logged focus study session',
        desc: `Studied in study circle voice room for ${stats.totalStudyHours} hours.`,
        time: 'Today'
      });
    }
    myGroups.forEach((group) => {
      actList.push({
        icon: BookOpen,
        title: 'Joined Study Circle',
        desc: `Enrolled in ${group.name} (${group.subject}) circle workspace.`,
        time: 'Recently'
      });
    });
    if (completedLessonsCount > 0) {
      actList.push({
        icon: CheckCircle2,
        title: 'Completed topic lessons',
        desc: `Successfully finished ${completedLessonsCount} academic topics.`,
        time: 'This week'
      });
    }
    if (practiceAttempts > 0) {
      actList.push({
        icon: Trophy,
        title: 'Solved practice quiz questions',
        desc: `Completed practice session with ${practiceCorrect} correct answers.`,
        time: 'This week'
      });
    }
    return actList;
  }, [stats, myGroups, completedLessonsCount, practiceAttempts, practiceCorrect]);

  return (
    <div className="space-y-6 text-white text-left font-sans animate-in fade-in duration-300 max-w-7xl mx-auto px-4 md:px-0">
      
      {/* 1. WELCOME CARD & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Welcome Card (6 columns span) */}
        <div className={`lg:col-span-6 p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[160px]`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">{todayDateString}</span>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              {getGreetingText()}, {user?.firstName || user?.fullName?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed mt-2 italic">
              "Small progress every day beats occasional perfection."
            </p>
          </div>
        </div>

        {/* Quick Actions (4 columns span) */}
        <div className={`lg:col-span-4 p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl flex flex-col justify-between min-h-[160px]`}>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">⚡ Quick Actions</h3>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Quick navigations to build learning consistency.</p>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4">
            <button 
              onClick={() => { setActiveTab('study'); setStudySubView('rooms'); }}
              className="p-3 bg-[#0c101d] hover:bg-indigo-650/15 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="Join Study Room"
            >
              <Video className="h-4.5 w-4.5 text-indigo-400" />
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide">Live Room</span>
            </button>
            <button 
              onClick={() => { setActiveTab('practice'); setPracticeSubView('questions'); }}
              className="p-3 bg-[#0c101d] hover:bg-indigo-650/15 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="Practice Questions"
            >
              <Trophy className="h-4.5 w-4.5 text-emerald-400" />
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide">Practice</span>
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className="p-3 bg-[#0c101d] hover:bg-indigo-650/15 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="Create Notes"
            >
              <FileText className="h-4.5 w-4.5 text-amber-400" />
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide">Notes</span>
            </button>
            <button 
              onClick={() => setActiveTab('discussions')}
              className="p-3 bg-[#0c101d] hover:bg-indigo-650/15 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="Ask Doubt"
            >
              <HelpCircle className="h-4.5 w-4.5 text-purple-400" />
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide">Ask Doubt</span>
            </button>
            <button 
              onClick={() => setActiveTab('sessions')}
              className="p-3 bg-[#0c101d] hover:bg-indigo-650/15 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
              title="View Schedule"
            >
              <Calendar className="h-4.5 w-4.5 text-blue-400" />
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wide">Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* LEFT COLUMN (6 columns span) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* 2. TODAY'S STUDY PLAN */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                📋 Today's Study Plan
              </h3>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {!user?.assignedTasks || user.assignedTasks.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-zinc-500 italic">No tasks for today.</p>
                </div>
              ) : (
                user.assignedTasks.map((task: any) => {
                  const isCompleted = task.status === 'Completed';
                  return (
                    <div 
                      key={task.id} 
                      className={`p-3 bg-[#0B0F19]/40 border rounded-xl flex items-center justify-between gap-3 text-left transition-all ${
                        isCompleted ? 'border-emerald-500/10 opacity-70' : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            isCompleted ? `${checkboxStyle} text-white` : 'border-zinc-700 bg-transparent'
                          }`}
                        >
                          {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>
                        <div>
                          <h4 className={`text-xs font-bold ${isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
                            {task.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{task.description}</p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        task.priority === 'High' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' :
                        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-455 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/10'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. CONTINUE LEARNING */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                📖 Continue Learning
              </h3>
            </div>
            
            {!activeCourse ? (
              <div className="py-4 text-center">
                <p className="text-xs text-zinc-500 italic">No active course.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-sm font-black text-white">{activeCourse.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Syllabus Path: {activeCourse.subject}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded font-bold uppercase">
                    Active
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                    <span>{progressPercent}% Complete</span>
                    <span>{totalLessons - completedIds.length} topics left</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full bg-gradient-to-r ${themeGradient} rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { setActiveTab('study'); setStudySubView('workspaces'); }}
                    className={`px-4 py-2 ${buttonStyle} text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer border-none flex items-center gap-1.5`}
                  >
                    Resume Learning <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. UPCOMING STUDY SESSIONS */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                📅 Upcoming Study Sessions
              </h3>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-zinc-500 italic">No sessions scheduled.</p>
                </div>
              ) : (
                sessions.map((sess) => (
                  <div key={sess.id} className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white leading-snug">{sess.title}</h4>
                      <p className="text-[10px] text-zinc-400">{sess.time}</p>
                      <p className="text-[9px] text-indigo-400 font-semibold">{sess.subject}</p>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('study'); setStudySubView('rooms'); }}
                      className="px-3.5 py-1.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider font-bold transition-all"
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. STUDY GROUPS */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                👥 Study Groups
              </h3>
              <button 
                onClick={onCreateGroup}
                className="text-[10px] text-indigo-400 font-bold uppercase hover:underline cursor-pointer"
              >
                + Create Group
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {myGroups.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-zinc-500 italic">Not joined any group yet.</p>
                </div>
              ) : (
                myGroups.map((group) => (
                  <div key={group.id} className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-left">
                    <div>
                      <h4 className="text-xs font-bold text-white">{group.name}</h4>
                      <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider block mt-0.5">Subject: {group.subject}</span>
                    </div>
                    <button
                      onClick={() => { setActiveTab('study'); setStudySubView('workspaces'); }}
                      className="px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider transition-all"
                    >
                      Quick Join
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (4 columns span) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 8. PROGRESS SUMMARY */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                📊 Progress Summary
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl">
                <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Study Hours</span>
                <span className="text-sm font-black text-white block mt-1 leading-none">{stats?.totalStudyHours || 0} hrs</span>
              </div>
              <div className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl">
                <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Current Streak</span>
                <span className="text-sm font-black text-white block mt-1 leading-none">{stats?.streakCount || 0} Days</span>
              </div>
              <div className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl">
                <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">XP Earned</span>
                <span className="text-sm font-black text-white block mt-1 leading-none">{stats?.xp || 0} XP</span>
              </div>
              <div className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl">
                <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Topics Completed</span>
                <span className="text-sm font-black text-white block mt-1 leading-none">{completedLessonsCount}</span>
              </div>
              <div className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl">
                <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Practice Solved</span>
                <span className="text-sm font-black text-white block mt-1 leading-none">{practiceCorrect}</span>
              </div>
              <div className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl">
                <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Sessions Attended</span>
                <span className="text-sm font-black text-white block mt-1 leading-none">{stats?.totalStudySessions || 0}</span>
              </div>
              <div className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl col-span-2">
                <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Certificates</span>
                <span className="text-sm font-black text-white block mt-1 leading-none">{stats?.certificatesEarned || 0}</span>
              </div>
            </div>
          </div>

          {/* 6. RECENT ACTIVITY */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                ⏱ Recent Activity
              </h3>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {realActivities.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs text-zinc-500 italic">No recent activity.</p>
                </div>
              ) : (
                realActivities.map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <div key={i} className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl flex items-start gap-3 text-left">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{act.title}</h4>
                        <p className="text-[9px] text-zinc-450 leading-normal">{act.desc}</p>
                        <span className="text-[8px] text-zinc-500 font-mono block mt-1">{act.time}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SimpleDashboard;
