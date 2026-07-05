import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  BookOpen, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
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
  loading = false,
  myGroups,
  availableGroups,
  getGreeting,
  router,
  setActiveTab,
  setStudySubView,
  equippedTheme
}) => {
  const [lastActivity, setLastActivity] = useState<any>(null);

  // Today's goals interactive states
  const [lessonGoalCompleted, setLessonGoalCompleted] = useState(false);
  const [quizGoalCompleted, setQuizGoalCompleted] = useState(true); // default to 1/2 completed for mockup consistency

  // Read last activity session from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem('studycircle_last_activity');
      if (item) {
        try {
          setLastActivity(JSON.parse(item));
        } catch (e) {
          console.error("Error reading last activity: ", e);
        }
      }
    }
  }, []);

  const getThemeConfig = (themeId?: string) => {
    switch (themeId) {
      case 'zengarden': // Emerald
        return {
          primary: 'text-[#10B981]',
          bgPrimary: 'bg-[#10B981]',
          bgPrimaryHover: 'hover:bg-[#0d9488]',
          bgPrimaryLight: 'bg-[#10B981]/10',
          borderPrimary: 'border-[#10B981]',
          borderPrimaryLight: 'border-[#10B981]/20',
          accentColor: '#10B981',
          progressGradient: 'from-emerald-500 to-teal-500',
          resumeBg: 'bg-emerald-400',
          labelColor: 'text-[#10B981]',
          labelBg: 'bg-[#10B981]/10',
        };
      case 'cyberpunk': // Violet
        return {
          primary: 'text-fuchsia-500',
          bgPrimary: 'bg-fuchsia-600',
          bgPrimaryHover: 'hover:bg-fuchsia-700',
          bgPrimaryLight: 'bg-fuchsia-500/10',
          borderPrimary: 'border-fuchsia-500',
          borderPrimaryLight: 'border-fuchsia-500/20',
          accentColor: '#D946EF',
          progressGradient: 'from-fuchsia-500 to-purple-500',
          resumeBg: 'bg-fuchsia-400',
          labelColor: 'text-fuchsia-400',
          labelBg: 'bg-fuchsia-500/10',
        };
      case 'theme_solar_glow': // Sunset
        return {
          primary: 'text-amber-500',
          bgPrimary: 'bg-amber-600',
          bgPrimaryHover: 'hover:bg-amber-700',
          bgPrimaryLight: 'bg-amber-500/10',
          borderPrimary: 'border-amber-500',
          borderPrimaryLight: 'border-amber-500/20',
          accentColor: '#F59E0B',
          progressGradient: 'from-amber-500 to-orange-500',
          resumeBg: 'bg-amber-400',
          labelColor: 'text-amber-400',
          labelBg: 'bg-amber-500/10',
        };
      case 'theme_dark_nebula': // Midnight
        return {
          primary: 'text-indigo-400',
          bgPrimary: 'bg-indigo-600',
          bgPrimaryHover: 'hover:bg-indigo-700',
          bgPrimaryLight: 'bg-indigo-500/10',
          borderPrimary: 'border-indigo-500',
          borderPrimaryLight: 'border-indigo-500/20',
          accentColor: '#6366F1',
          progressGradient: 'from-indigo-500 to-purple-500',
          resumeBg: 'bg-indigo-400',
          labelColor: 'text-indigo-400',
          labelBg: 'bg-indigo-500/10',
        };
      case 'default':
      default: // Ocean (Default)
        return {
          primary: 'text-blue-500',
          bgPrimary: 'bg-blue-600',
          bgPrimaryHover: 'hover:bg-blue-700',
          bgPrimaryLight: 'bg-blue-500/10',
          borderPrimary: 'border-blue-500',
          borderPrimaryLight: 'border-blue-500/20',
          accentColor: '#3B82F6',
          progressGradient: 'from-blue-500 to-indigo-500',
          resumeBg: 'bg-blue-400',
          labelColor: 'text-blue-400',
          labelBg: 'bg-blue-500/10',
        };
    }
  };

  const themeConfig = getThemeConfig(equippedTheme);

  const handleContinueLearning = () => {
    setActiveTab('study');
    setStudySubView('workspaces');
  };

  const handleStartRecommended = () => {
    setActiveTab('study');
    setStudySubView('workspaces');
  };

  // Dynamic values binding
  const currentCourseName = lastActivity?.courseName || 'Advanced DSA';
  const currentLessonName = lastActivity?.lessonName || 'Lesson 8 of 20';
  const currentProgress = lastActivity?.progress !== undefined ? lastActivity.progress : 40;

  const coursesEnrolled = myGroups?.length || 4;
  const completedCourses = stats?.completedCourses !== undefined ? stats.completedCourses : 1;
  const certificatesEarned = stats?.certificatesEarned !== undefined ? stats.certificatesEarned : 1;
  const currentStreak = stats?.streakCount !== undefined ? stats.streakCount : 5;

  const completedGoalsCount = (lessonGoalCompleted ? 1 : 0) + (quizGoalCompleted ? 1 : 0);

  return (
    <div className="space-y-8 text-white text-left font-sans animate-in fade-in duration-300 max-w-5xl mx-auto">
      
      {/* 1. Welcome Header */}
      <div className="pb-4">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Hi, {user?.firstName || user?.fullName?.split(' ')[0] || 'Swathi'} 👋
        </h1>
        <p className="text-sm text-zinc-400 font-bold mt-1">
          Ready to continue your learning today?
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - 70% width */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 2. Continue Learning Card */}
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-[24px] shadow-xl hover:scale-[1.01] transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-wider ${themeConfig.primary}`}>Resume Last Course</span>
                <span className={`text-[10px] font-extrabold ${themeConfig.labelColor} ${themeConfig.labelBg} px-2.5 py-0.5 rounded-full`}>Active</span>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white leading-tight">{currentCourseName}</h2>
                <p className="text-xs text-zinc-400 font-bold">{currentLessonName}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-extrabold text-zinc-300">
                  <span>Progress</span>
                  <span>{currentProgress}% Complete</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full bg-gradient-to-r ${themeConfig.progressGradient} rounded-full transition-all duration-500`} 
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleContinueLearning}
                className={`mt-2 w-full sm:w-auto px-6 py-2.5 ${themeConfig.bgPrimary} ${themeConfig.bgPrimaryHover} text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer border-none flex items-center justify-center gap-2`}
              >
                Continue Learning <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 5. Recommended Course */}
          <div className="p-6 bg-[#0B0F19]/60 border border-white/5 rounded-[24px] shadow-lg hover:scale-[1.01] transition-all duration-300">
            <div className="space-y-4">
              <span className={`text-[10px] font-black uppercase tracking-wider ${themeConfig.primary}`}>Recommended for You</span>
              
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">System Design Basics</h3>
                <p className="text-[10px] text-zinc-500 font-semibold">Master high-availability architectures and microservices.</p>
              </div>

              <button
                onClick={handleStartRecommended}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer border border-white/5"
              >
                Start Learning
              </button>
            </div>
          </div>

          {/* 6. Recent Activity */}
          <div className="p-6 bg-[#0B0F19]/40 border border-white/5 rounded-[24px] shadow-sm text-left">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Recent Activity</h3>
              
              <div className="space-y-2.5">
                {[
                  'Completed Java Quiz',
                  'Earned Java Certificate',
                  'Finished Lesson 10'
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300 font-semibold py-0.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: themeConfig.accentColor }} />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - 30% width */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* 3. Today's Goal */}
          <div className="p-6 bg-[#0B0F19] border border-white/10 rounded-[24px] shadow-lg text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Today's Goal</h3>
                <span className={`text-[10px] font-extrabold ${themeConfig.primary} font-mono uppercase ${themeConfig.labelBg} px-2 py-0.5 rounded`}>
                  {completedGoalsCount} / 2 Completed
                </span>
              </div>

              {/* Interactive checklist */}
              <div className="space-y-3 pt-1">
                {/* Checkbox 1: Complete 1 Lesson */}
                <div 
                  onClick={() => setLessonGoalCompleted(!lessonGoalCompleted)}
                  className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer select-none"
                >
                  <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                    lessonGoalCompleted 
                      ? `${themeConfig.bgPrimary} ${themeConfig.borderPrimary} text-white` 
                      : 'border-slate-700 bg-transparent'
                  }`}>
                    {lessonGoalCompleted && <span className="text-[9px] font-black">✓</span>}
                  </div>
                  <span className={`text-xs font-bold transition-all ${lessonGoalCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    Complete 1 Lesson
                  </span>
                </div>

                {/* Checkbox 2: Attempt 1 Quiz */}
                <div 
                  onClick={() => setQuizGoalCompleted(!quizGoalCompleted)}
                  className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer select-none"
                >
                  <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                    quizGoalCompleted 
                      ? `${themeConfig.bgPrimary} ${themeConfig.borderPrimary} text-white` 
                      : 'border-slate-700 bg-transparent'
                  }`}>
                    {quizGoalCompleted && <span className="text-[9px] font-black">✓</span>}
                  </div>
                  <span className={`text-xs font-bold transition-all ${quizGoalCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    Attempt 1 Quiz
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. My Progress */}
          <div className="p-6 bg-[#0B0F19] border border-white/10 rounded-[24px] shadow-lg text-left">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">My Progress</h3>
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Courses Enrolled */}
                <div className="p-3.5 bg-slate-900/50 border border-white/5 rounded-2xl text-left">
                  <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Courses Enrolled</span>
                  <span className="text-xl font-black text-white block mt-1">{coursesEnrolled}</span>
                </div>

                {/* Completed Courses */}
                <div className="p-3.5 bg-slate-900/50 border border-white/5 rounded-2xl text-left">
                  <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Completed Courses</span>
                  <span className="text-xl font-black text-white block mt-1">{completedCourses}</span>
                </div>

                {/* Certificates Earned */}
                <div className="p-3.5 bg-slate-900/50 border border-white/5 rounded-2xl text-left">
                  <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Certificates</span>
                  <span className="text-xl font-black text-white block mt-1">{certificatesEarned}</span>
                </div>

                {/* Current Streak */}
                <div className="p-3.5 bg-slate-900/50 border border-white/5 rounded-2xl text-left flex flex-col justify-between">
                  <span className="text-[8px] text-zinc-500 font-black uppercase block tracking-wider">Current Streak</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Flame className="h-5 w-5 text-orange-500 shrink-0 fill-orange-500/10" />
                    <span className="text-xl font-black text-white">{currentStreak} Days</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
