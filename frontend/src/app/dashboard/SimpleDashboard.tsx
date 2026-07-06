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
  MoreVertical,
  Calendar,
  Sparkles,
  Trash2
} from 'lucide-react';

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
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  user,
  stats,
  myGroups,
  setActiveTab,
  setStudySubView,
  setPracticeSubView,
  setCommunitySubView,
  equippedTheme
}) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);
  
  // Local storage values for quizzes/practice questions
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [practiceXP, setPracticeXP] = useState(0);

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
        return 'bg-blue-600 border-blue-500';
    }
  }, [equippedTheme]);

  const badgeStyle = useMemo(() => {
    switch (equippedTheme) {
      case 'cyberpunk':
        return 'bg-fuchsia-500/15 text-fuchsia-400';
      case 'zengarden':
        return 'bg-emerald-500/15 text-emerald-400';
      case 'theme_solar_glow':
        return 'bg-amber-500/15 text-amber-400';
      case 'theme_dark_nebula':
        return 'bg-indigo-500/15 text-indigo-400';
      case 'default':
      default:
        return 'bg-blue-500/15 text-blue-400';
    }
  }, [equippedTheme]);

  const progressBarColor = useMemo(() => {
    switch (equippedTheme) {
      case 'cyberpunk':
        return 'bg-fuchsia-500';
      case 'zengarden':
        return 'bg-emerald-500';
      case 'theme_solar_glow':
        return 'bg-amber-500';
      case 'theme_dark_nebula':
        return 'bg-indigo-500';
      case 'default':
      default:
        return 'bg-blue-500';
    }
  }, [equippedTheme]);

  const iconBoxStyle = useMemo(() => {
    switch (equippedTheme) {
      case 'cyberpunk':
        return 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400';
      case 'zengarden':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'theme_solar_glow':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'theme_dark_nebula':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'default':
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  }, [equippedTheme]);

  const progressGradientColors = useMemo(() => {
    switch (equippedTheme) {
      case 'cyberpunk':
        return { start: '#d946ef', end: '#a855f7' };
      case 'zengarden':
        return { start: '#10b981', end: '#14b8a6' };
      case 'theme_solar_glow':
        return { start: '#f59e0b', end: '#f97316' };
      case 'theme_dark_nebula':
        return { start: '#6366f1', end: '#a855f7' };
      case 'default':
      default:
        return { start: '#3b82f6', end: '#6366f1' };
    }
  }, [equippedTheme]);

  const handleToggleGoal = (id: string) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
      localStorage.setItem('studycircle_student_goals', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      localStorage.setItem('studycircle_student_goals', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal = {
      id: `g-${Date.now()}`,
      text: newGoalText.trim(),
      completed: false
    };
    setGoals(prev => {
      const updated = [...prev, newGoal];
      localStorage.setItem('studycircle_student_goals', JSON.stringify(updated));
      return updated;
    });
    setNewGoalText('');
    setShowAddGoal(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const atts = parseInt(localStorage.getItem('studycircle_practice_attempts') || '0', 10);
      const corrects = parseInt(localStorage.getItem('studycircle_practice_correct') || '0', 10);
      const pxp = parseInt(localStorage.getItem('studycircle_practice_xp') || '0', 10);
      setPracticeAttempts(atts);
      setPracticeCorrect(corrects);
      setPracticeXP(pxp);
    }
  }, []);

  // Determine if it's a completely new user with zero state
  const isZeroState = 
    (myGroups?.length || 0) === 0 && 
    (stats?.xp || 0) === 0 && 
    (stats?.totalStudyHours || 0) === 0 && 
    (stats?.streakCount || 0) === 0 && 
    practiceAttempts === 0;

  // 1. Calculate active course & completion percentage
  const activeCourse = myGroups && myGroups.length > 0 ? myGroups[0] : null;
  
  let currentCourseName = 'Start your learning journey.';
  let currentLessonName = 'Choose an interest to begin learning.';
  let currentProgress = 0;
  let remainingLessons = 0;
  let lastAccessedDate = 'Never accessed';

  if (activeCourse) {
    const slug = activeCourse.subject ? activeCourse.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'programming-dsa';
    
    // Check completed lessons in local storage
    let completedLessonIds: string[] = [];
    let lastLessonId = '';
    
    if (typeof window !== 'undefined') {
      try {
        completedLessonIds = JSON.parse(localStorage.getItem('sc_completed_' + slug) || '[]');
        lastLessonId = localStorage.getItem('sc_lesson_' + slug) || '';
      } catch (e) {
        completedLessonIds = [];
      }
    }
    
    // Total lessons mapped per course category
    let totalLessons = 10;
    if (slug.includes('dsa') || slug.includes('programming')) {
      totalLessons = 20;
    } else if (slug.includes('ai') || slug.includes('machine')) {
      totalLessons = 15;
    }

    currentCourseName = activeCourse.name || 'Programming & DSA';
    currentLessonName = lastLessonId ? `Resuming: Lesson ID ${lastLessonId}` : 'Solve Practice Questions';
    currentProgress = totalLessons > 0 ? Math.min(100, Math.round((completedLessonIds.length / totalLessons) * 100)) : 0;
    remainingLessons = Math.max(0, totalLessons - completedLessonIds.length);
    lastAccessedDate = completedLessonIds.length > 0 ? 'Today' : 'Just joined';
  }

  // 2. Today's Goals persistent loader/seeder
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studycircle_student_goals');
      if (saved) {
        try {
          setGoals(JSON.parse(saved));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      
      // Seed default goals if none exist
      const defaultGoals = [];
      if (isZeroState) {
        defaultGoals.push({ id: `g-${Date.now()}-1`, text: "Choose an interest to begin", completed: false });
        defaultGoals.push({ id: `g-${Date.now()}-2`, text: "Join a Study Circle", completed: false });
        defaultGoals.push({ id: `g-${Date.now()}-3`, text: "Complete Lesson 1", completed: false });
      } else {
        defaultGoals.push({ id: `g-${Date.now()}-1`, text: `Complete Lesson ${activeCourse ? Math.min(20, Math.round((currentProgress / 100) * 20) + 1) : 1}`, completed: false });
        defaultGoals.push({ id: `g-${Date.now()}-2`, text: "Attempt 1 Quiz", completed: false });
        defaultGoals.push({ id: `g-${Date.now()}-3`, text: "Solve 5 Practice Questions", completed: false });
      }
      setGoals(defaultGoals);
      localStorage.setItem('studycircle_student_goals', JSON.stringify(defaultGoals));
    }
  }, [isZeroState]);

  // 3. Dynamic Recent Activity list
  useEffect(() => {
    const actList = [];
    if (isZeroState) {
      // Zero state activity
    } else {
      if (practiceAttempts > 0) {
        actList.push({
          type: 'quiz',
          title: `Completed practice quiz session`,
          subtext: `Solved ${practiceCorrect} correctly`,
          time: 'Just now'
        });
      }
      if (stats?.totalStudyHours > 0) {
        actList.push({
          type: 'study',
          title: `Studied in Circle Voice Room`,
          subtext: `Logged ${stats.totalStudyHours} hours`,
          time: '1h ago'
        });
      }
      if (activeCourse && currentProgress > 0) {
        actList.push({
          type: 'lesson',
          title: `Finished Lesson in ${activeCourse.name}`,
          subtext: `${currentProgress}% Complete`,
          time: '2h ago'
        });
      }
    }
    setActivities(actList);
  }, [isZeroState, activeCourse, currentProgress, stats, practiceAttempts, practiceCorrect]);

  // 4. Progress calculations
  const enrolledCount = isZeroState ? 0 : (myGroups?.length || 0);
  const completedCount = isZeroState ? 0 : (activeCourse && currentProgress >= 100 ? 1 : 0);
  const certificatesCount = isZeroState ? 0 : (activeCourse && currentProgress >= 100 && practiceAttempts > 0 ? 1 : 0);
  const averageQuizScore = isZeroState ? 0 : (practiceAttempts > 0 ? Math.round((practiceCorrect / practiceAttempts) * 100) : 0);
  const overallProgressPercent = isZeroState ? 0 : (activeCourse ? currentProgress : 0);

  // Recommendations generated dynamically based on actual user activity (Zero State for new users)
  const recommendations = useMemo(() => {
    if (isZeroState) return [];

    const interest = (activeCourse?.subject || user?.learningGoal || '').toLowerCase();
    
    if (interest.includes('db') || interest.includes('sql') || interest.includes('data')) {
      if (interest.includes('structure') || interest.includes('dsa') || interest.includes('graph') || interest.includes('tree')) {
        return [
          { id: 'rec-dsa-1', title: 'Advanced Graph Theory', desc: 'BFS, DFS, Dijkstra, Kruskal, and graph traversal patterns.', progress: 0 },
          { id: 'rec-dsa-2', title: 'Tree Data Structures', desc: 'Binary search trees, AVL trees, and segment tree implementations.', progress: 0 }
        ];
      }
      return [
        { id: 'rec-sql-1', title: 'SQL Joins & Indexing', desc: 'Master advanced SQL queries, joins, indices, and query optimization.', progress: 0 },
        { id: 'rec-sql-2', title: 'Relational Database Schema Design', desc: 'Learn normal forms, keys, and relational models.', progress: 0 }
      ];
    }
    
    if (interest.includes('java') || interest.includes('oop') || interest.includes('object') || interest.includes('cpp') || interest.includes('c++')) {
      return [
        { id: 'rec-oop-1', title: 'Object-Oriented Programming Deep Dive', desc: 'Polymorphism, Inheritance, Encapsulation, and Design Patterns.', progress: 0 },
        { id: 'rec-oop-2', title: 'Collections & Generics', desc: 'Master collection frameworks and advanced generics.', progress: 0 }
      ];
    }
    
    return [
      { id: 'rec-gen-1', title: 'Programming & DSA Foundational Track', desc: 'Basic logic building, loops, arrays, and complexity analysis.', progress: 0 }
    ];
  }, [isZeroState, activeCourse, user]);

  // Theme helper
  const getThemeColor = () => {
    switch (equippedTheme) {
      case 'zengarden': return 'from-emerald-500 to-teal-500';
      case 'cyberpunk': return 'from-fuchsia-500 to-purple-500';
      case 'theme_solar_glow': return 'from-amber-500 to-orange-500';
      case 'theme_dark_nebula': return 'from-indigo-500 to-purple-600';
      default: return 'from-indigo-500 to-blue-600';
    }
  };

  const themeGradient = getThemeColor();

  return (
    <div className="space-y-6 text-white text-left font-sans animate-in fade-in duration-300 max-w-7xl mx-auto px-4 md:px-0">
      
      {/* Welcome Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/5 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Hi, {user?.firstName || user?.fullName?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            {isZeroState ? "Start your learning journey." : "Track your daily study consistency and progress."}
          </p>
        </div>
      </div>

      {/* Responsive Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* LEFT COLUMN (60% width on Desktop) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* CONTINUE LEARNING */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-[20px] relative overflow-hidden group min-h-[220px] flex flex-col justify-between`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Continue Learning</span>
              <MoreVertical className="h-4 w-4 text-zinc-500 cursor-pointer" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center py-4">
              {/* Left Side: Tech Image representation */}
              <div className="sm:col-span-1 h-28 bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <BookOpen className="h-10 w-10 text-indigo-500/80" />
                <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${themeGradient}`} style={{ width: `${currentProgress}%` }} />
                </div>
              </div>

              {/* Right Side: Info & Actions */}
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-white tracking-tight">
                      {currentCourseName}
                    </h3>
                    {activeCourse && (
                      <span className={`text-[8px] ${badgeStyle} font-black px-1.5 py-0.5 rounded uppercase`}>
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-semibold mt-1">
                    {currentLessonName}
                  </p>
                </div>

                {activeCourse && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                      <span>{currentProgress}% Complete</span>
                      <span>{remainingLessons} lessons remaining</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full bg-gradient-to-r ${themeGradient} rounded-full transition-all duration-500`} style={{ width: `${currentProgress}%` }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setActiveTab('study');
                    setStudySubView('workspaces');
                  }}
                  className={`px-4 py-2 ${buttonStyle} text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer border-none flex items-center gap-1.5`}
                >
                  Continue Learning <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RECOMMENDED FOR YOU */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-[20px] space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Recommended For You</span>
            </div>

            {recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <p className="text-xs text-zinc-450 leading-relaxed max-w-md">
                  We don't have enough learning activity yet to recommend courses.
                  <br /><br />
                  Start your first learning module or complete a few practice questions to receive personalized recommendations.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('practice');
                  }}
                  className={`px-4 py-2 ${buttonStyle} text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer border-none flex items-center gap-1.5`}
                >
                  Explore Practice <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className={`p-4 bg-white/[0.01] ${cardStyle.hoverBg} border border-white/5 rounded-xl flex flex-col justify-between min-h-28 transition-all duration-200`}>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-white line-clamp-1">{rec.title}</span>
                      <p className="text-[10px] text-zinc-500 font-semibold line-clamp-2 leading-relaxed mt-1">
                        {rec.desc}
                      </p>
                    </div>
                    
                    {rec.progress > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[8px] font-bold text-zinc-400">
                          <span>Course Progress</span>
                          <span>{rec.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${progressBarColor} rounded-full`} style={{ width: `${rec.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-[20px] space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Recent Activity</span>
              <span className="text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer" onClick={() => setActiveTab('progress')}>View all</span>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-zinc-500 gap-2">
                <Calendar className="h-6 w-6 text-zinc-600" />
                <span className="text-xs italic font-medium">No activity yet.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((act, i) => (
                  <div key={i} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg ${iconBoxStyle} flex items-center justify-center`}>
                        {act.type === 'quiz' ? <Trophy className="h-4 w-4" /> : act.type === 'study' ? <Clock className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-white">{act.title}</p>
                        <p className="text-[10px] text-zinc-500 font-semibold">{act.subtext}</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono shrink-0">{act.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (40% width on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TODAY'S GOALS */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-[20px] space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Today's Goals</span>
              <span className={`text-[10px] ${badgeStyle} font-mono px-2 py-0.5 rounded font-black`}>
                {goals.filter(g => g.completed).length} / {goals.length} Completed
              </span>
            </div>

            {/* Goals List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {goals.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2 text-center">No goals set for today.</p>
              ) : (
                goals.map((goal) => (
                  <div 
                    key={goal.id}
                    className={`p-3 bg-white/[0.01] ${cardStyle.hoverBg} border border-white/5 rounded-xl flex items-center justify-between gap-3 transition-all duration-150`}
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                      onClick={() => handleToggleGoal(goal.id)}
                    >
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                        goal.completed 
                          ? `${checkboxStyle} text-white` 
                          : 'border-zinc-700 bg-transparent'
                      }`}>
                        {goal.completed && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className={`text-xs font-bold ${goal.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {goal.text}
                      </span>
                    </div>
                    {goal.progress && (
                      <span className="text-[9px] text-zinc-500 font-mono font-bold">{goal.progress}</span>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 rounded transition-all border-none bg-transparent cursor-pointer shrink-0"
                      title="Delete Goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Goal Button / Form */}
            {!showAddGoal ? (
              <button
                onClick={() => setShowAddGoal(true)}
                className={`w-full py-2 bg-white/[0.01] ${cardStyle.hoverBg} border border-white/5 rounded-xl text-[10px] text-zinc-350 font-bold transition-all cursor-pointer`}
              >
                + Add Goal
              </button>
            ) : (
              <form onSubmit={handleAddGoal} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter goal..."
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="flex-1 bg-[#060813]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 placeholder-zinc-650"
                  autoFocus
                />
                <div className="flex gap-1 shrink-0">
                  <button
                    type="submit"
                    className={`px-3 py-2 ${buttonStyle} text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-all`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddGoal(false); setNewGoalText(''); }}
                    className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* MY PROGRESS */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-[20px] space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">My Progress</span>
              <span className="text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer" onClick={() => setPracticeSubView('mock')}>View Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Radial Progress Chart */}
              <div className="flex flex-col items-center justify-center relative py-2">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="38" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="38" 
                    stroke="url(#progressGradient)" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={238.76} 
                    strokeDashoffset={238.76 - (238.76 * overallProgressPercent) / 100} 
                    strokeLinecap="round" 
                    className="transition-all duration-500" 
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={progressGradientColors.start} />
                      <stop offset="100%" stopColor={progressGradientColors.end} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white font-mono">{overallProgressPercent}%</span>
                  <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider">Overall</span>
                </div>
              </div>

              {/* Stats List */}
              <div className="space-y-2 text-xs font-semibold text-zinc-400">
                <div className="flex justify-between py-1 border-b border-white/[0.02]">
                  <span>Courses Enrolled</span>
                  <span className="text-white font-mono">{enrolledCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.02]">
                  <span>Completed Courses</span>
                  <span className="text-white font-mono">{completedCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.02]">
                  <span>Certificates Earned</span>
                  <span className="text-white font-mono">{certificatesCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Average Score</span>
                  <span className="text-white font-mono">{averageQuizScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* STUDY STREAK */}
          <div className={`p-6 ${cardStyle.bg} ${cardStyle.border} rounded-[20px] space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Study Streak</span>
              <span className="text-[10px] text-zinc-500 font-bold font-sans uppercase">This Week</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Grid representation */}
              <div className="sm:col-span-2 flex flex-col gap-2">
                <div className="flex justify-between text-[8px] font-black text-zinc-500 px-0.5">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 14 }).map((_, idx) => {
                    // Highlight blocks representing streak count
                    const hasStudied = !isZeroState && idx >= 14 - Math.max(1, stats?.streakCount || 0);
                    return (
                      <div 
                        key={idx}
                        className={`h-4.5 rounded-sm transition-all duration-300 ${
                          hasStudied 
                            ? `${progressBarColor}/80 shadow-md shadow-indigo-500/10 border border-indigo-400/20` 
                            : 'bg-white/[0.02] border border-white/5'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Flame display */}
              <div className="sm:col-span-1 flex flex-col items-center justify-center p-3 bg-white/[0.01] border border-white/5 rounded-xl shrink-0">
                <Flame className={`h-8 w-8 transition-colors ${isZeroState ? 'text-zinc-600 shrink-0' : 'text-orange-500 fill-orange-500/10'}`} />
                <span className="text-base font-black text-white font-mono mt-1.5">{isZeroState ? 0 : stats?.streakCount || 0} Days</span>
                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5 text-center">
                  Best: {isZeroState ? 0 : Math.max(6, stats?.streakCount || 0)} Days
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
