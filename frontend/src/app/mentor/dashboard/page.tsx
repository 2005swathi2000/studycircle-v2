"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../components/ToastProvider';
import { 
  Users, 
  Clock, 
  Flame, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Search, 
  ChevronRight, 
  Settings, 
  CheckCircle2, 
  Play, 
  Lock, 
  Unlock, 
  BookOpen, 
  ArrowRight,
  LogOut,
  UserCheck,
  RefreshCw,
  Sparkles,
  BarChart2,
  Bell,
  Activity,
  FileText,
  Mail,
  Sliders,
  Check,
  Send,
  X,
  PhoneCall,
  UserPlus
} from 'lucide-react';

export default function MentorDashboard() {
  const { user, loading, logout, unreadCount } = useApp();
  const router = useRouter();
  const { showToast: addToast } = useToast();

  // Navigation tab state (dashboard = Operations Command)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'rooms' | 'sessions' | 'assignments' | 'analytics' | 'profile'>('dashboard');

  // Core Data States
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studyRooms, setStudyRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);

  // New Assignments State
  const [assignments, setAssignments] = useState<any[]>([
    { id: 'asg-1', title: 'Trees & DFS Practice Set', subject: 'Data Structures', deadline: '2026-07-05', submissionsCount: 14, totalAssigned: 42, status: 'Active' },
    { id: 'asg-2', title: 'DBMS Joins & Normalization Exam Prep', subject: 'DBMS', deadline: '2026-07-08', submissionsCount: 8, totalAssigned: 42, status: 'Active' },
    { id: 'asg-3', title: 'OS Processes & Deadlocks Homework', subject: 'OS', deadline: '2026-06-28', submissionsCount: 39, totalAssigned: 39, status: 'Graded' }
  ]);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', subject: 'Data Structures', deadline: '', totalAssigned: 42 });

  // Dashboard Modal Action States
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showAssignChallenge, setShowAssignChallenge] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Form Inputs
  const [newRoom, setNewRoom] = useState({ name: '', description: '', subject: '', isPublic: true });
  const [newSession, setNewSession] = useState({ groupId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60, meetingLink: '' });
  const [announcementText, setAnnouncementText] = useState('');
  const [challengeData, setChallengeData] = useState({ text: '', xpReward: 50, coinReward: 20 });
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Custom Global Search state (Searches Students, Rooms, Sessions)
  const [globalSearch, setGlobalSearch] = useState('');

  // AI Suggestions and Insights
  const [aiInsight, setAiInsight] = useState<string>('');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Profile Roster Options & Availability settings
  const [mentorAvailability, setMentorAvailability] = useState<'online' | 'busy' | 'away' | 'vacation'>('online');
  const [mentorSubjects, setMentorSubjects] = useState<string[]>(['Data Structures', 'DBMS', 'OS']);
  const [teachingSchedule, setTeachingSchedule] = useState({
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
  });
  const [alertPreferences, setAlertPreferences] = useState({
    email: true, app: true, sms: false
  });

  // Rich Notification Feed
  const [mentorAlerts, setMentorAlerts] = useState([
    { id: 1, text: 'Vijay Kumar raised a new doubt in placement coding', type: 'doubt', time: '5m ago' },
    { id: 2, text: 'System check: "Trees & DFS Practice Set" has 14 submissions', type: 'task', time: '12m ago' },
    { id: 3, text: 'Live Session "DSA Trees & Graphs Masterclass" starts in 20 mins', type: 'session', time: '20m ago' },
    { id: 4, text: 'Student Swathi Hani completed her focus goal', type: 'goal', time: '1h ago' }
  ]);

  // Authentication check
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/?login=true');
      } else if (user.role !== 'mentor' && user.role !== 'admin') {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, router]);

  // Load Data
  useEffect(() => {
    if (user && (user.role === 'mentor' || user.role === 'admin')) {
      fetchStudents();
      fetchStudyRooms();
      fetchSessions();
      fetchDoubts();
    }
  }, [user]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const data = await apiRequest('/auth/students');
      if (data && data.students) {
        // Enforce detailed roster schema
        setStudents(data.students.map((s: any) => ({
          ...s,
          learningPath: s.id === 'st-2' ? 'Advanced' : 'Beginner',
          lastActive: s.id === 'st-1' ? '1 hour ago' : '4 days ago',
          completionRate: s.id === 'st-2' ? 72 : 24,
          attendanceRate: s.id === 'st-2' ? 90 : 38,
          weakTopics: s.id === 'st-2' ? 'Graphs, Recursion' : 'Trees, DBMS Joins'
        })));
      } else {
        setStudents([
          { id: 'st-1', fullName: 'Vijay Kumar', username: 'vijay_cse', email: 'vijay@gmail.com', phone: '9848022338', streakCount: 12, totalStudyHours: 42.5, xp: 1240, focusCoins: 310, level: 4, department: 'CSE', college: 'VRSEC Vijayawada', weakTopics: 'Trees, Recursion', learningPath: 'Beginner', lastActive: '1 hour ago', completionRate: 58, attendanceRate: 85 },
          { id: 'st-2', fullName: 'Swathi Hanumanthu', username: 'swathi_dev', email: 'swathi@gmail.com', phone: '9848011223', streakCount: 0, totalStudyHours: 78.2, xp: 2450, focusCoins: 620, level: 7, department: 'IT', college: 'KL University Guntur', weakTopics: 'Trees, Recursion, DBMS Joins', learningPath: 'Intermediate', lastActive: '4 days ago', completionRate: 72, attendanceRate: 38 },
          { id: 'st-3', fullName: 'Charan Teja', username: 'charan_admin', email: 'charan@gmail.com', phone: '9848099887', streakCount: 5, totalStudyHours: 15.4, xp: 480, focusCoins: 90, level: 2, department: 'CSE', college: 'SRKR Bhimavaram', weakTopics: 'DBMS Joins', learningPath: 'Beginner', lastActive: '2 hours ago', completionRate: 24, attendanceRate: 74 }
        ]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudyRooms = async () => {
    setLoadingRooms(true);
    try {
      const data = await apiRequest('/progress/global-leaderboards');
      if (data && data.rooms) {
        setStudyRooms(data.rooms.map((r: any) => ({
          ...r,
          activeStudents: r.memberCount || 12,
          mentorAssigned: r.id === 'gr-1' ? 'Charan' : 'Prof. Srinivasa Rao',
          pendingDoubts: r.id === 'gr-3' ? 3 : 0,
          focusTopic: r.id === 'gr-2' ? 'Binary Trees' : 'Normalization'
        })));
      } else {
        setStudyRooms([
          { id: 'gr-1', name: 'Database Masterclass', description: 'Group for standard SQL and Schema design discussions', subject: 'DBMS', inviteCode: 'SQL101', memberCount: 15, isLocked: false, activeStudents: 15, mentorAssigned: 'Prof. Srinivasa Rao', pendingDoubts: 0, focusTopic: 'Normalization' },
          { id: 'gr-2', name: 'Placement Coding Hub', description: 'Daily DSA practice and problem solving', subject: 'Data Structures', inviteCode: 'DSA202', memberCount: 42, isLocked: false, activeStudents: 24, mentorAssigned: 'Charan', pendingDoubts: 3, focusTopic: 'Binary Trees' },
          { id: 'gr-3', name: 'OS & Architecture Circle', description: 'Discussions on Operating Systems principles', subject: 'OS', inviteCode: 'OS303', memberCount: 8, isLocked: true, activeStudents: 8, mentorAssigned: 'Anjali Sharma', pendingDoubts: 0, focusTopic: 'Semaphores' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching study rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      setSessions([
        { id: 'se-1', title: 'DSA Trees & Graphs Masterclass', description: 'Live coding on Tree Traversals and BFS/DFS traversal schemas', scheduledAt: new Date(Date.now() + 900000).toISOString(), durationMinutes: 90, meetingLink: 'https://meet.google.com/abc-defg-hij', groupName: 'Placement Coding Hub', registered: 52, joined: 38, attendanceRate: 73 },
        { id: 'se-2', title: 'DBMS Normalization doubt clearing', description: 'Understanding 1NF, 2NF, 3NF and BCNF with real exam questions', scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), durationMinutes: 60, meetingLink: 'https://meet.google.com/xyz-qprs-tuv', groupName: 'Database Masterclass', registered: 35, joined: 22, attendanceRate: 62 }
      ]);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchDoubts = async () => {
    setLoadingDoubts(true);
    try {
      // Empty mock doubts queue to show correct empty state verification
      setDoubts([]);
    } catch (err) {
      console.error('Error fetching doubts:', err);
    } finally {
      setLoadingDoubts(false);
    }
  };

  // Actions
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name || !newRoom.subject) {
      addToast('Room Name and Subject are required', 'error');
      return;
    }
    const mockCreated = {
      id: `gr-${Date.now()}`,
      name: newRoom.name,
      description: newRoom.description,
      subject: newRoom.subject,
      inviteCode: 'MOCK' + Math.floor(100 + Math.random() * 900),
      memberCount: 1,
      isLocked: false,
      activeStudents: 1,
      mentorAssigned: user?.fullName || 'Mentor',
      pendingDoubts: 0,
      focusTopic: 'Introduction'
    };
    setStudyRooms(prev => [mockCreated, ...prev]);
    addToast('Study Room created successfully!', 'success');
    setNewRoom({ name: '', description: '', subject: '', isPublic: true });
    setShowCreateRoom(false);
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.title || !newSession.scheduledAt || !newSession.groupId) {
      addToast('Session Title, Date, and Target Group are required', 'error');
      return;
    }
    const targetGroup = studyRooms.find(r => r.id === newSession.groupId);
    const mockSess = {
      id: `se-${Date.now()}`,
      title: newSession.title,
      description: newSession.description,
      scheduledAt: newSession.scheduledAt,
      durationMinutes: Number(newSession.durationMinutes),
      meetingLink: newSession.meetingLink || 'https://meet.google.com/mock-link',
      groupName: targetGroup ? targetGroup.name : 'All Cohort',
      registered: 20,
      joined: 0,
      attendanceRate: 0
    };
    setSessions(prev => [mockSess, ...prev]);
    addToast('Mentoring session scheduled successfully!', 'success');
    setNewSession({ groupId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60, meetingLink: '' });
    setShowCreateSession(false);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.deadline) {
      addToast('Assignment Title and Deadline are required', 'error');
      return;
    }
    const created = {
      id: `asg-${Date.now()}`,
      title: newAssignment.title,
      subject: newAssignment.subject,
      deadline: newAssignment.deadline,
      submissionsCount: 0,
      totalAssigned: newAssignment.totalAssigned,
      status: 'Active'
    };
    setAssignments(prev => [created, ...prev]);
    addToast(`New assignment "${newAssignment.title}" published!`, 'success');
    setNewAssignment({ title: '', subject: 'Data Structures', deadline: '', totalAssigned: 42 });
    setShowCreateAssignment(false);
  };

  const handleAssignChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !challengeData.text) return;
    addToast(`Assigned target challenge to ${selectedStudent.fullName}`, 'success');
    setShowAssignChallenge(false);
    setChallengeData({ text: '', xpReward: 50, coinReward: 20 });
  };

  const handleGenerateAiInsights = async () => {
    setGeneratingAi(true);
    setAiInsight('');
    setTimeout(() => {
      setAiInsight("• DBMS doubts increased by 28% this week regarding Joins and Normalization algorithms.\n• Students studying after 10PM perform 15% better in overall practice set scores.\n• Trees & DFS topic has the lowest completion percentage (only 34%) across all cohorts.\n• Recommend conducting one live revision session on Recursion and Tree traversals.");
      setGeneratingAi(false);
    }, 1200);
  };

  const toggleRoomLock = (roomId: string) => {
    setStudyRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const nextState = !room.isLocked;
        addToast(`Room "${room.name}" is now ${nextState ? 'LOCKED' : 'UNLOCKED'}`, 'info');
        return { ...room, isLocked: nextState };
      }
      return room;
    }));
  };

  // Global Search & filters
  const filteredStudents = students.filter(s => {
    const term = globalSearch.toLowerCase();
    const matchesSearch = s.fullName.toLowerCase().includes(term) ||
                          s.username.toLowerCase().includes(term) ||
                          s.college.toLowerCase().includes(term) ||
                          s.weakTopics.toLowerCase().includes(term) ||
                          s.learningPath.toLowerCase().includes(term);
    return matchesSearch;
  });

  const filteredRooms = studyRooms.filter(r => {
    const term = globalSearch.toLowerCase();
    return r.name.toLowerCase().includes(term) || r.subject.toLowerCase().includes(term);
  });

  const filteredSessions = sessions.filter(s => {
    const term = globalSearch.toLowerCase();
    return s.title.toLowerCase().includes(term) || s.groupName.toLowerCase().includes(term);
  });

  // Calculate semantic "Students At Risk" count
  const atRiskStudents = students.filter(s => s.attendanceRate < 45 || s.streakCount === 0);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col font-sans select-none">
      
      {/* Top Banner Control Bar */}
      <header className="h-16 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        
        {/* Global search bar */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search students, rooms, sessions, topics..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-[#060813] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-all font-sans"
          />
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 hover:bg-white/5 rounded-xl transition-all border-none bg-transparent cursor-pointer relative"
            >
              <Bell className="h-5 w-5 text-zinc-400 hover:text-white" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-indigo-500 rounded-full" />
            </button>
            
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0B0F19] border border-white/5 rounded-2xl p-4 shadow-xl z-50 space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Alert Feed</h4>
                  <span className="text-[9px] text-zinc-500 font-bold font-mono">4 Alerts</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mentorAlerts.map(alert => (
                    <div key={alert.id} className="text-xs p-2 bg-white/[0.01] rounded-lg border border-white/5 flex flex-col">
                      <span className="text-zinc-300 font-medium">{alert.text}</span>
                      <span className="text-[9px] text-indigo-400 font-bold font-mono mt-1">{alert.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Widget */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/5">
            <div className="text-right">
              <p className="text-xs font-bold text-white">{user.fullName}</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">{user.role}</span>
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-900/60 border border-indigo-500/20 flex items-center justify-center font-bold text-white uppercase text-xs">
              {user.fullName.substring(0, 2)}
            </div>
            <button 
              onClick={logout}
              className="p-2 hover:bg-red-950/20 text-zinc-450 hover:text-red-400 rounded-xl transition-all border-none bg-transparent cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-white/5 bg-[#0B0F19]/40 flex flex-col justify-between py-6">
          <div className="space-y-6">
            
            {/* Redesigned Sidebar Top Logo */}
            <div className="px-6 flex items-center gap-2.5">
              <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-indigo-650 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-650/15">
                <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">StudyCircle</h1>
                <p className="text-[9px] uppercase tracking-widest text-indigo-400 font-black">Mentor Hub</p>
              </div>
            </div>

            <hr className="border-white/5 mx-6" />

            <div className="space-y-1 px-4">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-3">Operations</p>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Operations Command</span>
              </button>

              <button
                onClick={() => setActiveTab('students')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'students' 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Student Roster</span>
              </button>

              <button
                onClick={() => setActiveTab('rooms')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'rooms' 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Study Rooms Hub</span>
              </button>

              <button
                onClick={() => setActiveTab('sessions')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'sessions' 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Mentoring Sessions</span>
              </button>

              <button
                onClick={() => setActiveTab('assignments')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'assignments' 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Assignments Module</span>
              </button>

              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 pt-6 mb-3">Insights & Info</p>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'analytics' 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Cohort Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'profile' 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Profile Settings</span>
              </button>
            </div>
          </div>

          {/* Sidebar Bottom Status */}
          <div className="px-6 text-[10px] text-zinc-500 space-y-1">
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="capitalize font-bold text-zinc-300">Availability: {mentorAvailability}</span>
            </div>
            <p>Admin Core v2.0</p>
            <p>© StudyCircle Platform</p>
          </div>
        </aside>

        {/* Core Main Panel */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: OPERATIONS COMMAND (Dashboard Home) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Header Greeting with Daily Goals */}
              <div className="p-6 bg-gradient-to-r from-[#111827] to-[#0b0f19] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Good Morning, Swathi! 👋</h2>
                  <p className="text-zinc-400 text-xs mt-0.5">Here is what is happening in your learning ecosystem today.</p>
                </div>
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-1.5 min-w-[200px]">
                  <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Today's Goals</p>
                  <ul className="text-[10px] text-zinc-300 space-y-1 font-medium">
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-400" /> Solve 18 doubts</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-400" /> Conduct 2 sessions</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-400" /> Review 12 assignments</li>
                  </ul>
                </div>
              </div>

              {/* Status Stats Grid (Colors Limited to Semantic Palette) */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Total Students</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{students.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Active Rooms</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{studyRooms.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Pending Doubts</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">{doubts.filter(d => !d.isSolved).length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Today's Sessions</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{sessions.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#991B1B]/5 border border-[#991B1B]/15 flex items-center justify-between col-span-2 lg:col-span-1">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-red-400">Students At Risk</p>
                    <p className="text-2xl font-bold text-red-500 mt-1 font-mono">{atRiskStudents.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Grid split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Columns */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Alert Panel: Students Needing Attention */}
                  <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Students Needing Attention</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {students.filter(s => s.attendanceRate < 45 || s.streakCount === 0).map(stud => (
                        <div key={stud.id} className="bg-white/[0.01] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white">{stud.fullName} ({stud.learningPath})</h4>
                            <p className="text-[10px] text-zinc-500 font-medium">College: {stud.college}</p>
                            
                            <div className="pt-2 text-[10px] font-medium space-y-1">
                              <p className="text-red-400">Reason: <span className="font-bold">No study activity for {stud.streakCount === 0 ? '4 days' : '3+ days'} • Attendance: {stud.attendanceRate}%</span></p>
                              <p className="text-zinc-400">Weak Topics: <span className="text-amber-400 font-bold">{stud.weakTopics}</span></p>
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => { setSelectedStudent(stud); setShowAssignChallenge(true); }}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-all border-none cursor-pointer"
                            >
                              Assign Task
                            </button>
                            <button 
                              onClick={() => { setSelectedStudent(stud); setShowMessageModal(true); }}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded text-[10px] font-bold transition-all border-none cursor-pointer"
                            >
                              Message
                            </button>
                            <button 
                              onClick={() => { setSelectedStudent(stud); setShowCallModal(true); }}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-350 rounded text-[10px] font-bold transition-all border-none cursor-pointer"
                            >
                              Schedule Call
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doubt Resolution Queue (Verified Empty State layout) */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Pending Doubt Resolution Queue</h3>
                    {doubts.length === 0 ? (
                      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center space-y-1.5">
                        <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-emerald-400">🎉 Great! No pending doubts.</p>
                        <p className="text-[10px] text-zinc-500 font-medium">All doubts have been resolved. Last doubt solved: 2 hours ago.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {doubts.map(d => (
                          <div key={d.id} className="p-3 bg-white/[0.01] rounded-xl border border-white/5 flex justify-between items-center">
                            <p className="text-xs font-bold text-white">{d.title}</p>
                            <button className="px-3 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">Resolve</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Columns */}
                <div className="space-y-6">
                  
                  {/* Quick Operations Hub (Includes Assign Task) */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-indigo-400" />
                      <span>Quick Operations Hub</span>
                    </h3>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => setShowCreateRoom(true)}
                        className="w-full text-left bg-white/[0.01] hover:bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-zinc-350 font-medium flex justify-between items-center cursor-pointer transition-all"
                      >
                        <span>Create Study Room</span>
                        <Plus className="h-3.5 w-3.5 text-zinc-500" />
                      </button>
                      <button 
                        onClick={() => setShowCreateSession(true)}
                        className="w-full text-left bg-white/[0.01] hover:bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-zinc-350 font-medium flex justify-between items-center cursor-pointer transition-all"
                      >
                        <span>Schedule Live Session</span>
                        <Plus className="h-3.5 w-3.5 text-zinc-500" />
                      </button>
                      <button 
                        onClick={() => setShowCreateAssignment(true)}
                        className="w-full text-left bg-white/[0.01] hover:bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-zinc-350 font-medium flex justify-between items-center cursor-pointer transition-all"
                      >
                        <span>Create Assignment</span>
                        <Plus className="h-3.5 w-3.5 text-zinc-500" />
                      </button>
                      <button 
                        onClick={() => {
                          if (students.length === 0) return;
                          setSelectedStudent(students[0]);
                          setShowAssignChallenge(true);
                        }}
                        className="w-full text-left bg-white/[0.01] hover:bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-zinc-350 font-medium flex justify-between items-center cursor-pointer transition-all"
                      >
                        <span>Assign Task to Student</span>
                        <Plus className="h-3.5 w-3.5 text-zinc-500" />
                      </button>
                      <button 
                        onClick={() => setShowAnnouncement(true)}
                        className="w-full text-left bg-white/[0.01] hover:bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-zinc-350 font-medium flex justify-between items-center cursor-pointer transition-all"
                      >
                        <span>Broadcast Announcement</span>
                        <Plus className="h-3.5 w-3.5 text-zinc-500" />
                      </button>
                    </div>
                  </div>

                  {/* AI insights & suggestions card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/30 to-[#12001A]/30 border border-indigo-500/15 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        <span>AI Suggestion & Guidance</span>
                      </h4>
                      <button 
                        onClick={handleGenerateAiInsights}
                        disabled={generatingAi}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold border-none cursor-pointer transition-all disabled:opacity-50 font-mono"
                      >
                        {generatingAi ? 'Generating...' : 'Refresh Insights'}
                      </button>
                    </div>

                    {aiInsight ? (
                      <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4 leading-relaxed font-medium">
                        {aiInsight.split('\n').map((line, idx) => (
                          <li key={idx}>{line.replace(/^•\s*/, '')}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-zinc-500 italic">No generated cohort insights. Click generate button.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT ROSTER */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Student Roster</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Comprehensive view of student metrics, goals, and learning progress.</p>
              </div>

              {loadingStudents ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStudents.map(student => (
                    <div key={student.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-indigo-500/20 transition-all flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-white flex items-center gap-2">
                              {student.fullName}
                              <span className="text-[8px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider">
                                {student.learningPath}
                              </span>
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-mono">@{student.username} • {student.college}</p>
                          </div>
                          <span className="text-[9px] font-bold text-zinc-500 font-mono">Last Active: {student.lastActive}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center py-2 bg-white/[0.01] rounded-xl border border-white/5">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-zinc-500">Study Hours</p>
                            <p className="text-xs font-bold text-white font-mono mt-0.5">{student.totalStudyHours} hrs</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-zinc-500">Progress</p>
                            <p className="text-xs font-bold text-emerald-450 font-mono mt-0.5">{student.completionRate}%</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-zinc-500">Attendance</p>
                            <p className="text-xs font-bold text-indigo-400 font-mono mt-0.5">{student.attendanceRate}%</p>
                          </div>
                        </div>

                        <div className="text-[10px] font-medium pt-1">
                          <p className="text-zinc-400">Weak Topics: <span className="text-amber-400 font-bold">{student.weakTopics}</span></p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-white/5">
                        <button
                          onClick={() => { setSelectedStudent(student); setShowAssignChallenge(true); }}
                          className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition-all border-none cursor-pointer"
                        >
                          Assign Task
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(student); setShowMessageModal(true); }}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-350 rounded-xl text-[10px] font-bold transition-all border-none cursor-pointer"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDY ROOMS HUB */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Study Rooms Hub</h2>
                  <p className="text-zinc-400 text-xs mt-0.5">Moderate learning groups, verify session lock states, and audit doubt status.</p>
                </div>
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" /> Create Room
                </button>
              </div>

              {loadingRooms ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRooms.map(room => (
                    <div key={room.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:border-indigo-500/10 transition-all">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-white flex items-center gap-2">
                              {room.name}
                              {room.isLocked && <Lock className="h-3.5 w-3.5 text-red-400" />}
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-medium">Subject: <span className="text-indigo-400 font-bold">{room.subject}</span> • Code: <span className="text-white font-mono">{room.inviteCode}</span></p>
                          </div>
                          <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${room.isLocked ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {room.isLocked ? 'Locked' : 'Open'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-zinc-400 leading-normal font-medium">{room.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 text-[10px] font-medium text-zinc-500">
                          <div>
                            <p>Active Students: <span className="text-white font-mono">{room.activeStudents}</span></p>
                            <p>Assigned Mentor: <span className="text-white">{room.mentorAssigned}</span></p>
                          </div>
                          <div>
                            <p>Pending Doubts: <span className="text-amber-400 font-mono font-bold">{room.pendingDoubts}</span></p>
                            <p>Focus Topic: <span className="text-white">{room.focusTopic}</span></p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-5">
                        <button
                          onClick={() => toggleRoomLock(room.id)}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl cursor-pointer transition-all border-none flex items-center justify-center gap-1.5 ${
                            room.isLocked 
                              ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20' 
                              : 'bg-red-600/10 text-red-400 hover:bg-red-600/20'
                          }`}
                        >
                          {room.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                          <span>{room.isLocked ? 'Unlock Room' : 'Lock Room'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MENTORING SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Mentoring Sessions</h2>
                  <p className="text-zinc-400 text-xs mt-0.5">Schedule webinars, interactive lectures, and resolve doubts live.</p>
                </div>
                <button
                  onClick={() => setShowCreateSession(true)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" /> Schedule Session
                </button>
              </div>

              {loadingSessions ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSessions.map(session => {
                    const timeLeft = Math.max(0, Math.floor((new Date(session.scheduledAt).getTime() - Date.now()) / 60000));
                    return (
                      <div key={session.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-indigo-500/20 transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-xs font-bold text-white">{session.title}</h3>
                              <p className="text-[10px] text-zinc-500 font-medium">Cohort Group: <span className="text-indigo-400 font-bold">{session.groupName}</span></p>
                            </div>
                            <span className="text-[10px] text-indigo-400 font-bold font-mono">
                              {timeLeft <= 20 ? (
                                <span className="text-red-400 animate-pulse font-black">Starts in {timeLeft} mins</span>
                              ) : (
                                <span>{new Date(session.scheduledAt).toLocaleDateString()}</span>
                              )}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 leading-normal font-medium">{session.description}</p>
                          
                          <div className="grid grid-cols-3 gap-3 text-center py-2 bg-[#0C0F19] rounded-xl border border-white/5 font-mono text-xs">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-zinc-500 font-sans">Registered</p>
                              <p className="font-bold text-white mt-0.5">{session.registered}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-zinc-500 font-sans">Joined</p>
                              <p className="font-bold text-white mt-0.5">{session.joined}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-zinc-500 font-sans">Attendance</p>
                              <p className="font-bold text-emerald-450 mt-0.5">{session.attendanceRate}%</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-center text-xs font-bold decoration-none transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer"
                          >
                            <Play className="h-4 w-4" /> Start Session
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ASSIGNMENTS MODULE (NEW) */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Assignments Module</h2>
                  <p className="text-zinc-400 text-xs mt-0.5">Publish weekly tasks, coordinate practice sets, and review submissions.</p>
                </div>
                <button
                  onClick={() => setShowCreateAssignment(true)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" /> Create Assignment
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {assignments.map(asg => (
                  <div key={asg.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-indigo-500/20 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-xs font-bold text-white">{asg.title}</h3>
                          <p className="text-[10px] text-indigo-400 font-bold">{asg.subject}</p>
                        </div>
                        <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${asg.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                          {asg.status}
                        </span>
                      </div>

                      <div className="pt-2 flex justify-between text-xs text-zinc-400 font-medium">
                        <span>Deadline: <span className="text-white font-mono">{asg.deadline}</span></span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center py-2 bg-white/[0.01] rounded-xl border border-white/5 font-mono text-xs">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-zinc-500 font-sans">Submissions</p>
                          <p className="font-bold text-white mt-0.5">{asg.submissionsCount}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-zinc-500 font-sans">Total Assigned</p>
                          <p className="font-bold text-white mt-0.5">{asg.totalAssigned}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button 
                        onClick={() => addToast(`Opening grading panel for: "${asg.title}"`, 'info')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
                      >
                        Review Submissions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COHORT ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white">Cohort Analytics</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Statistical distributions of study parameters and exam scores.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* SVG 1: Study Hours Trend */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Study Hours Trend</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Average weekly focus hours logged by students.</p>
                  </div>
                  <div className="h-44 w-full pt-4">
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="25" x2="500" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="125" x2="500" y2="125" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <path d="M 0 150 L 0 110 Q 80 80 160 95 T 320 40 T 480 30 L 500 30 L 500 150 Z" fill="url(#hoursGrad)" />
                      <path d="M 0 110 Q 80 80 160 95 T 320 40 T 480 30 L 500 30" fill="none" stroke="#6366F1" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>

                {/* SVG 2: Quiz Accuracy & completion */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Quiz Performance</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Average accuracy scores across subject categories.</p>
                  </div>
                  <div className="h-44 w-full pt-4">
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                      <line x1="0" y1="25" x2="500" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="125" x2="500" y2="125" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      {/* Bar 1 */}
                      <rect x="50" y="30" width="30" height="120" rx="4" fill="#6366F1" />
                      <text x="65" y="20" fill="white" fontSize="10" textAnchor="middle">80%</text>
                      {/* Bar 2 */}
                      <rect x="180" y="45" width="30" height="105" rx="4" fill="#10B981" />
                      <text x="195" y="35" fill="white" fontSize="10" textAnchor="middle">70%</text>
                      {/* Bar 3 */}
                      <rect x="310" y="75" width="30" height="75" rx="4" fill="#F59E0B" />
                      <text x="325" y="65" fill="white" fontSize="10" textAnchor="middle">50%</text>
                      {/* Bar 4 */}
                      <rect x="420" y="105" width="30" height="45" rx="4" fill="#EF4444" />
                      <text x="435" y="95" fill="white" fontSize="10" textAnchor="middle">30%</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Manage availability states, subjects specs, and schedule options.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                
                {/* Availability status radio selectors */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Current Availability Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['online', 'busy', 'away', 'vacation'].map((status) => (
                      <label 
                        key={status} 
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold capitalize cursor-pointer transition-all ${
                          mentorAvailability === status 
                            ? 'bg-indigo-650/10 border-indigo-500 text-white' 
                            : 'bg-[#0B0F19] border-white/5 text-zinc-450 hover:bg-white/5'
                        }`}
                      >
                        <input
                          type="radio"
                          name="availability"
                          checked={mentorAvailability === status}
                          onChange={() => {
                            setMentorAvailability(status as any);
                            addToast(`Status set to ${status}`, 'success');
                          }}
                          className="hidden"
                        />
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          status === 'online' ? 'bg-emerald-500' :
                          status === 'busy' ? 'bg-red-500' :
                          status === 'away' ? 'bg-amber-500' : 'bg-zinc-500'
                        }`} />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Teaching Subjects specs */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Teaching Expertise</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Data Structures', 'DBMS', 'OS', 'Computer Networks', 'Java Programming', 'Theory of Computation'].map((subject) => {
                      const checked = mentorSubjects.includes(subject);
                      return (
                        <label 
                          key={subject}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                            checked ? 'bg-indigo-650/5 border-indigo-500/30 text-white' : 'bg-[#0B0F19] border-white/5 text-zinc-450 hover:bg-white/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (checked) setMentorSubjects(prev => prev.filter(s => s !== subject));
                              else setMentorSubjects(prev => [...prev, subject]);
                            }}
                            className="h-4 w-4 bg-[#0B0F19] border-white/5 rounded text-indigo-500 focus:ring-0 focus:ring-offset-0"
                          />
                          <span>{subject}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly availability days */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Weekly Schedule</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(teachingSchedule).map((day) => {
                      const isActive = (teachingSchedule as any)[day];
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setTeachingSchedule(prev => ({ ...prev, [day]: !isActive }))}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer capitalize transition-all ${
                            isActive ? 'bg-indigo-650/10 border-indigo-500 text-white' : 'bg-[#0B0F19] border-white/5 text-zinc-550'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notification preferences */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Notification Alerts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertPreferences.email}
                        onChange={(e) => setAlertPreferences(prev => ({ ...prev, email: e.target.checked }))}
                        className="h-4 w-4 bg-[#0B0F19] border-white/5 rounded text-indigo-500 focus:ring-0"
                      />
                      <span className="text-xs text-zinc-300">Email Alerts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertPreferences.app}
                        onChange={(e) => setAlertPreferences(prev => ({ ...prev, app: e.target.checked }))}
                        className="h-4 w-4 bg-[#0B0F19] border-white/5 rounded text-indigo-500 focus:ring-0"
                      />
                      <span className="text-xs text-zinc-300">App Push Alerts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertPreferences.sms}
                        onChange={(e) => setAlertPreferences(prev => ({ ...prev, sms: e.target.checked }))}
                        className="h-4 w-4 bg-[#0B0F19] border-white/5 rounded text-indigo-500 focus:ring-0"
                      />
                      <span className="text-xs text-zinc-300">SMS Critical Alerts</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => addToast('Profile configurations updated successfully!', 'success')}
                    className="px-6 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
                  >
                    Save Options
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: CREATE ROOM MODAL */}
      {showCreateRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create Study Room</h3>
              <button 
                onClick={() => setShowCreateRoom(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. Trees Traversals Circle"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Subject Category</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures"
                  value={newRoom.subject}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Room Description</label>
                <textarea
                  placeholder="Write description of the room..."
                  value={newRoom.description}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Create Circle Room
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE MENTORING SESSION */}
      {showCreateSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Schedule Session</h3>
              <button 
                onClick={() => setShowCreateSession(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleScheduleSession} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. DBMS Joins Mastery"
                  value={newSession.title}
                  onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Target Study Room</label>
                  <select
                    value={newSession.groupId}
                    onChange={(e) => setNewSession(prev => ({ ...prev, groupId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Room</option>
                    {studyRooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newSession.durationMinutes}
                    onChange={(e) => setNewSession(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Scheduled At</label>
                  <input
                    type="datetime-local"
                    value={newSession.scheduledAt}
                    onChange={(e) => setNewSession(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Meeting Link</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/abc"
                    value={newSession.meetingLink}
                    onChange={(e) => setNewSession(prev => ({ ...prev, meetingLink: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Schedule Session
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BROADCAST ANNOUNCEMENT */}
      {showAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Broadcast Announcement</h3>
              <button 
                onClick={() => setShowAnnouncement(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                addToast('Announcement posted successfully!', 'success');
                setAnnouncementText('');
                setShowAnnouncement(false);
              }} 
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Announcement Text</label>
                <textarea
                  placeholder="Write announcement text..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Broadcast Alert
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ASSIGN TASK CHALLENGE */}
      {showAssignChallenge && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assign Task Challenge</h3>
              <button 
                onClick={() => setShowAssignChallenge(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAssignChallenge} className="space-y-3">
              <p className="text-xs text-zinc-400">Assigning target practice task to <span className="text-white font-bold">{selectedStudent.fullName}</span>.</p>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Task Instruction</label>
                <input
                  type="text"
                  placeholder="e.g. Complete 5 DFS questions on LeetCode"
                  value={challengeData.text}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 font-sans">XP Reward</label>
                  <input
                    type="number"
                    value={challengeData.xpReward}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, xpReward: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 font-sans">Focus Coins Reward</label>
                  <input
                    type="number"
                    value={challengeData.coinReward}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, coinReward: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Send Challenge Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CREATE ASSIGNMENT */}
      {showCreateAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Publish New Assignment</h3>
              <button 
                onClick={() => setShowCreateAssignment(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Assignment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Graph Algorithms Homework Set"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Subject Area</label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Data Structures">Data Structures</option>
                    <option value="DBMS">DBMS</option>
                    <option value="OS">OS</option>
                  </select>
                </div>
                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 font-sans">Deadline Date</label>
                  <input
                    type="date"
                    value={newAssignment.deadline}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Publish Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: MESSAGE MODAL */}
      {showMessageModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Direct Message</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                addToast(`Message dispatched to @${selectedStudent.username}!`, 'success');
                setShowMessageModal(false);
              }}
              className="space-y-3"
            >
              <p className="text-xs text-zinc-450">Send message to <span className="text-white font-bold">{selectedStudent.fullName}</span>.</p>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Message Content</label>
                <textarea
                  placeholder="Type message text..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed font-sans"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: SCHEDULE CALL */}
      {showCallModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Schedule 1-on-1 Call</h3>
              <button 
                onClick={() => setShowCallModal(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                addToast(`1-on-1 mentoring call scheduled with ${selectedStudent.fullName}! Link sent.`, 'success');
                setShowCallModal(false);
              }}
              className="space-y-3"
            >
              <div className="space-y-1 font-mono">
                <label className="text-[10px] font-bold uppercase text-zinc-400 font-sans">Pick Time & Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none"
              >
                Confirm Call
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
