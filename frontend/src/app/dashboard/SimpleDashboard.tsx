import React from 'react';
import { 
  Clock, 
  Activity, 
  CheckSquare, 
  Upload, 
  Flame, 
  FileText, 
  Users, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface SimpleDashboardProps {
  user: any;
  stats: {
    totalStudyHours: number;
    streakCount: number;
    totalStudySessions?: number;
  };
  myGroups: any[];
  dailyMissions: any[];
  getGreeting: () => string;
  router: any;
  setActiveTab: (tab: any) => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  user,
  stats,
  myGroups,
  dailyMissions,
  getGreeting,
  router,
  setActiveTab
}) => {
  const studyHours = stats.totalStudyHours || 0.0;
  const hoursInt = Math.floor(studyHours);
  const minsInt = Math.round((studyHours % 1) * 60);
  const studyHoursFormatted = `${hoursInt}h ${String(minsInt).padStart(2, '0')}m`;
  
  const studySessions = myGroups.length;
  const completedTasksCount = dailyMissions.filter(m => m.completed).length;
  const totalTasks = dailyMissions.length;
  const streakDays = stats.streakCount || 0;

  return (
    <div className="space-y-6 text-white text-left">
      {/* Top Header Row with Greeting & Quote */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <h1 className="text-2xl font-black text-white leading-tight flex items-center gap-2">
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Swathi'}! 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">Let's make today a productive one.</p>
        </div>
        
        {/* Quote Card */}
        <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/5 bg-white/[0.01] max-w-md text-left flex items-start gap-2.5 shadow-md">
          <span className="text-xl text-indigo-400 font-serif leading-none select-none">“</span>
          <div>
            <p className="text-[11px] font-semibold text-slate-200 italic leading-snug">
              The expert in anything was once a beginner.
            </p>
            <span className="text-[9px] text-[#10B981] font-bold block mt-1">&mdash; Helen Hayes</span>
          </div>
        </div>
      </div>

      {/* Stats Row (State Zero Optimized) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
        
        {/* Stat 1: Study Hours */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 shadow-lg text-left">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wide block">Study Hours</span>
            <p className="text-[8px] text-slate-500 font-bold leading-none mt-0.5">Today</p>
            <div className="text-base font-black text-white leading-tight mt-1">{studyHoursFormatted}</div>
            <span className="text-[8px] text-emerald-500 font-extrabold block mt-1">
              ↑ 0% <span className="text-slate-500 font-medium">from yesterday</span>
            </span>
          </div>
        </div>

        {/* Stat 2: Study Sessions */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 shadow-lg text-left">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wide block">Study Sessions</span>
            <p className="text-[8px] text-slate-500 font-bold leading-none mt-0.5">Today</p>
            <div className="text-base font-black text-white leading-tight mt-1">{studySessions}</div>
            <span className="text-[8px] text-emerald-500 font-extrabold block mt-1">
              ↑ 0 <span className="text-slate-500 font-medium">from yesterday</span>
            </span>
          </div>
        </div>

        {/* Stat 3: Tasks Completed */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 shadow-lg text-left flex-1 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
            <CheckSquare className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] text-slate-455 font-extrabold uppercase tracking-wide block truncate">Tasks Completed</span>
            <p className="text-[8px] text-slate-500 font-bold leading-none mt-0.5">Today</p>
            <div className="text-base font-black text-white leading-tight mt-1">
              {totalTasks > 0 ? `${completedTasksCount} / ${totalTasks}` : '0 / 0'}
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5 border border-white/5">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stat 4: Streak */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 shadow-lg text-left">
          <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wide block">Current Streak</span>
            <p className="text-[8px] text-slate-500 font-bold leading-none mt-0.5">Days</p>
            <div className="text-base font-black text-white leading-tight mt-1">{streakDays}</div>
            <span className="text-[8px] text-orange-400 font-extrabold block mt-1">
              Keep it up! 🔥
            </span>
          </div>
        </div>

      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Continue Learning Card */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[24px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">Continue Learning</h3>
            <div className="space-y-3">
              
              {/* Module 1: AI Workspace */}
              <div className="flex items-center justify-between gap-3 p-2 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 text-sm">
                    💻
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-extrabold text-white truncate">AI Workspace</h4>
                    <p className="text-[9px] text-slate-450 mt-0.5 truncate">Build & code with AI assistance</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/workspace/ai-ml')} 
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase rounded-lg transition cursor-pointer select-none border-none shrink-0"
                >
                  Continue
                </button>
              </div>

              {/* Module 2: Data Structures Notes */}
              <div className="flex items-center justify-between gap-3 p-2 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-sm">
                    📄
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-extrabold text-white truncate">Data Structures Notes</h4>
                    <p className="text-[9px] text-slate-450 mt-0.5 truncate">Last opened 2h ago</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('notes')} 
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase rounded-lg transition cursor-pointer select-none border-none shrink-0"
                >
                  Continue
                </button>
              </div>

              {/* Module 3: DSA Study Group */}
              <div className="flex items-center justify-between gap-3 p-2 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0 text-sm">
                    👥
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-extrabold text-white truncate">DSA Study Group</h4>
                    <p className="text-[9px] text-slate-450 mt-0.5 truncate">5 members online</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/workspace/programming-dsa')} 
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase rounded-lg transition cursor-pointer select-none border-none shrink-0"
                >
                  Join Room
                </button>
              </div>

              {/* Module 4: System Design Notes */}
              <div className="flex items-center justify-between gap-3 p-2 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 text-sm">
                    📄
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-extrabold text-white truncate">System Design Notes</h4>
                    <p className="text-[9px] text-slate-450 mt-0.5 truncate">Last opened 1d ago</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('notes')} 
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase rounded-lg transition cursor-pointer select-none border-none shrink-0"
                >
                  Continue
                </button>
              </div>

            </div>
          </div>
          
          <div className="border-t border-white/5 pt-3.5 text-center mt-3">
            <button 
              onClick={() => router.push('/workspace/programming-dsa')} 
              className="text-[10px] font-black text-indigo-400 hover:underline cursor-pointer bg-transparent border-none"
            >
              View all &rarr;
            </button>
          </div>
        </div>

        {/* Today's Schedule Card */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[24px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Today's Schedule</h3>
              <button 
                onClick={() => setActiveTab('sessions')} 
                className="text-[9px] font-extrabold text-indigo-400 hover:underline cursor-pointer bg-transparent border-none"
              >
                View Calendar
              </button>
            </div>

            <div className="space-y-3">
              
              <div className="flex items-start gap-3 p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                <span className="text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded shrink-0">06:00 PM</span>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Data Structures</h4>
                  <p className="text-[9px] text-slate-450 mt-0.5">Array & Linked List</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                <span className="text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded shrink-0">07:30 PM</span>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Operating Systems</h4>
                  <p className="text-[9px] text-slate-450 mt-0.5">Process Synchronization</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                <span className="text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded shrink-0">09:00 PM</span>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Aptitude Practice</h4>
                  <p className="text-[9px] text-slate-450 mt-0.5">Quantitative Aptitude</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                <span className="text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded shrink-0">10:00 PM</span>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white">Group Discussion</h4>
                  <p className="text-[9px] text-slate-450 mt-0.5">System Design Topics</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Quick Actions (2x2 Grid) */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[24px] p-5 shadow-lg text-left flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              
              {/* Note creation */}
              <button 
                onClick={() => setActiveTab('notes')} 
                className="p-4 bg-white/[0.01] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition select-none h-28 group border-none"
              >
                <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition duration-200">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-200">Create Note</span>
              </button>

              {/* Doubt asking */}
              <button 
                onClick={() => setActiveTab('doubts')} 
                className="p-4 bg-white/[0.01] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition select-none h-28 group border-none"
              >
                <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition duration-200">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-200">Ask Doubt</span>
              </button>

              {/* Join study room */}
              <button 
                onClick={() => router.push('/workspace/programming-dsa')} 
                className="p-4 bg-white/[0.01] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition select-none h-28 group border-none"
              >
                <div className="h-9 w-9 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition duration-200">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-200">Join Room</span>
              </button>

              {/* Upload notes */}
              <button 
                onClick={() => setActiveTab('notes')} 
                className="p-4 bg-white/[0.01] hover:bg-white/[0.05] border border-white/5 hover:border-orange-500/30 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition select-none h-28 group border-none"
              >
                <div className="h-9 w-9 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-105 transition duration-200">
                  <Upload className="h-4.5 w-4.5" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-200">Upload Notes</span>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Notes Card */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[24px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Recent Notes</h3>
              <button 
                onClick={() => setActiveTab('notes')} 
                className="text-[9px] font-extrabold text-indigo-400 hover:underline cursor-pointer bg-transparent border-none"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              
              <div 
                onClick={() => setActiveTab('notes')}
                className="flex items-center justify-between p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-2xl transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-bold text-white truncate">Dynamic Programming - Patterns</h4>
                    <p className="text-[9px] text-slate-450 mt-0.5">Updated 2h ago</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-[8px] font-black uppercase shrink-0">DSA</span>
              </div>

              <div 
                onClick={() => setActiveTab('notes')}
                className="flex items-center justify-between p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-2xl transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4.5 w-4.5 text-[#38BDF8] shrink-0" />
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-bold text-white truncate">React Hooks Complete Guide</h4>
                    <p className="text-[9px] text-slate-450 mt-0.5">Updated 5h ago</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/20 text-[8px] font-black uppercase shrink-0">Web Dev</span>
              </div>

            </div>
          </div>
        </div>

        {/* Activity Feed Card */}
        <div className="bg-[#0B0F19] border border-white/5 rounded-[24px] p-5 shadow-lg flex flex-col justify-between text-left">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Activity Feed</h3>
              <button 
                onClick={() => setActiveTab('lobby')} 
                className="text-[9px] font-extrabold text-indigo-400 hover:underline cursor-pointer bg-transparent border-none"
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5">
              
              <div className="flex items-center gap-3 text-xs">
                <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
                  👥
                </div>
                <div className="min-w-0 flex-1 flex justify-between items-center gap-2">
                  <p className="text-slate-200 truncate font-semibold text-left"><span className="text-white font-bold">Rahul</span> joined DSA Mastery</p>
                  <span className="text-[9px] text-slate-500 shrink-0 font-medium font-mono">2m ago</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="h-7 w-7 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 text-xs font-bold">
                  📄
                </div>
                <div className="min-w-0 flex-1 flex justify-between items-center gap-2">
                  <p className="text-slate-200 truncate font-semibold text-left"><span className="text-white font-bold">Neha</span> uploaded a new note in <span className="text-indigo-400 font-bold">DSA Mastery</span></p>
                  <span className="text-[9px] text-slate-500 shrink-0 font-medium font-mono">16m ago</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="h-7 w-7 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">
                  ✓
                </div>
                <div className="min-w-0 flex-1 flex justify-between items-center gap-2">
                  <p className="text-slate-200 truncate font-semibold text-left">You completed your daily goal</p>
                  <span className="text-[9px] text-slate-500 shrink-0 font-medium font-mono">1h ago</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
