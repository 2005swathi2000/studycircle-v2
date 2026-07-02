"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../components/ToastProvider';
import { 
  Users, 
  Clock, 
  MessageSquare, 
  Calendar, 
  Plus, 
  Search, 
  ChevronRight, 
  Settings, 
  CheckCircle2, 
  Play, 
  Lock, 
  Unlock, 
  BookOpen, 
  LogOut, 
  FileText, 
  Check, 
  X, 
  Trash2,
  AlertTriangle,
  Sliders,
  Sparkles,
  BarChart2,
  RefreshCw,
  UserCheck
} from 'lucide-react';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export default function MentorDashboard() {
  const { user, loading, logout } = useApp();
  const router = useRouter();
  const { showToast: addToast } = useToast();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'rooms' | 'sessions' | 'assignments' | 'analytics' | 'profile'>('dashboard');

  // Toggle mode to switcher between Zero State (new user) and populating an active existing cohort self.
  const [viewMode, setViewMode] = useState<'new' | 'existing'>('new');

  // Core Data States - Managed dynamically based on viewMode
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studyRooms, setStudyRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Interactive Goals State
  const [goals, setGoals] = useState<Goal[]>([
    { id: 'g1', text: 'Solve 18 doubts', completed: false },
    { id: 'g2', text: 'Conduct 2 sessions', completed: false },
    { id: 'g3', text: 'Review 12 assignments', completed: false }
  ]);
  const [newGoalText, setNewGoalText] = useState('');

  // Dashboard Modals
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showAssignChallenge, setShowAssignChallenge] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  
  // Attendance recording checkboxes state mapping student.id -> isPresent
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, boolean>>({});

  // Form Inputs
  const [newRoom, setNewRoom] = useState({ name: '', description: '', subject: '', isPublic: true });
  const [newSession, setNewSession] = useState({ groupId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60, meetingLink: '' });
  const [newAssignment, setNewAssignment] = useState({ title: '', subject: 'Data Structures', deadline: '', totalAssigned: 42 });
  const [announcementText, setAnnouncementText] = useState('');
  const [challengeData, setChallengeData] = useState({ text: '', xpReward: 50, coinReward: 20 });
  
  // Selected student for quick actions
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Global Search state (Searches Students, Rooms, Sessions)
  const [globalSearch, setGlobalSearch] = useState('');

  // Profile Settings
  const [mentorAvailability, setMentorAvailability] = useState<'online' | 'busy' | 'away' | 'vacation'>('online');
  const [mentorSubjects, setMentorSubjects] = useState<string[]>(['Data Structures', 'DBMS']);
  const [teachingSchedule, setTeachingSchedule] = useState({
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
  });
  const [alertPreferences, setAlertPreferences] = useState({
    email: true, app: true, sms: false
  });

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

  // Load Data based on selected view mode switcher
  useEffect(() => {
    if (user && (user.role === 'mentor' || user.role === 'admin')) {
      if (viewMode === 'new') {
        // Flat Zero state
        setStudents([]);
        setStudyRooms([]);
        setSessions([]);
        setDoubts([]);
        setAssignments([]);
        setAttendanceRecords({});
      } else {
        // Load populated existing self data
        loadExistingSelfData();
      }
    }
  }, [user, viewMode]);

  const loadExistingSelfData = () => {
    const mockStudents = [
      { id: 'st-1', fullName: 'Vijay Kumar', username: 'vijay_cse', email: 'vijay@gmail.com', phone: '9848022338', streakCount: 12, totalStudyHours: 42.5, xp: 1240, focusCoins: 310, level: 4, department: 'CSE', college: 'VRSEC Vijayawada', weakTopics: 'Trees, Recursion', learningPath: 'Beginner', lastActive: '1 hour ago', completionRate: 58, attendanceRate: 85 },
      { id: 'st-2', fullName: 'Swathi Hanumanthu', username: 'swathi_dev', email: 'swathi@gmail.com', phone: '9848011223', streakCount: 0, totalStudyHours: 78.2, xp: 2450, focusCoins: 620, level: 7, department: 'IT', college: 'KL University Guntur', weakTopics: 'Trees, Recursion, DBMS Joins', learningPath: 'Intermediate', lastActive: '4 days ago', completionRate: 72, attendanceRate: 38 },
      { id: 'st-3', fullName: 'Charan Teja', username: 'charan_admin', email: 'charan@gmail.com', phone: '9848099887', streakCount: 5, totalStudyHours: 15.4, xp: 480, focusCoins: 90, level: 2, department: 'CSE', college: 'SRKR Bhimavaram', weakTopics: 'DBMS Joins', learningPath: 'Beginner', lastActive: '2 hours ago', completionRate: 24, attendanceRate: 74 }
    ];
    setStudents(mockStudents);
    setStudyRooms([
      { id: 'gr-1', name: 'Database Masterclass', description: 'Group for standard SQL and Schema design discussions', subject: 'DBMS', inviteCode: 'SQL101', memberCount: 15, isLocked: false, activeStudents: 15, mentorAssigned: 'Prof. Srinivasa Rao', pendingDoubts: 0, focusTopic: 'Normalization' },
      { id: 'gr-2', name: 'Placement Coding Hub', description: 'Daily DSA practice and problem solving', subject: 'Data Structures', inviteCode: 'DSA202', memberCount: 42, isLocked: false, activeStudents: 24, mentorAssigned: 'Charan', pendingDoubts: 3, focusTopic: 'Binary Trees' }
    ]);
    setSessions([
      { id: 'se-1', title: 'DSA Trees & Graphs Masterclass', description: 'Live coding on Tree Traversals and BFS/DFS traversal schemas', scheduledAt: new Date(Date.now() + 1800000).toISOString(), durationMinutes: 90, meetingLink: 'https://meet.google.com/abc', groupName: 'Placement Coding Hub', registered: 52, joined: 38, attendanceRate: 73 },
      { id: 'se-2', title: 'DBMS Normalization doubt clearing', description: 'Understanding 1NF, 2NF, 3NF and BCNF with real exam questions', scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), durationMinutes: 60, meetingLink: 'https://meet.google.com/xyz', groupName: 'Database Masterclass', registered: 35, joined: 22, attendanceRate: 62 }
    ]);
    setDoubts([
      { id: 'db-1', title: 'Struggling with recursive DFS tree traversal space complexity', upvotes: 24, isSolved: false, studentName: 'Vijay Kumar', topic: 'DFS Traversals', waitingTime: '2 hours ago' }
    ]);
    setAssignments([
      { id: 'asg-1', title: 'Trees & DFS Practice Set', subject: 'Data Structures', deadline: '2026-07-05', submissionsCount: 14, totalAssigned: 42, status: 'Active' },
      { id: 'asg-2', title: 'DBMS Joins & Normalization Exam Prep', subject: 'DBMS', deadline: '2026-07-08', submissionsCount: 8, totalAssigned: 42, status: 'Active' }
    ]);
    
    // Initialize attendance checklist mapping
    const records: Record<string, boolean> = {};
    mockStudents.forEach(s => {
      records[s.id] = true;
    });
    setAttendanceRecords(records);
  };

  const fetchStudents = async () => {
    // API loading is only triggered to satisfy existing route hooks
    if (viewMode === 'existing') {
      setLoadingStudents(true);
      try {
        const data = await apiRequest('/auth/students');
        if (data && data.students && data.students.length > 0) {
          // Sync with loaded list
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoadingStudents(false);
      }
    }
  };

  const fetchStudyRooms = async () => {
    if (viewMode === 'existing') {
      setLoadingRooms(true);
      try {
        await apiRequest('/progress/global-leaderboards');
      } catch (err) {
        console.error('Error fetching study rooms:', err);
      } finally {
        setLoadingRooms(false);
      }
    }
  };

  const fetchSessions = async () => {};
  const fetchDoubts = async () => {};

  // Goals Widget Handlers
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal: Goal = {
      id: `g-${Date.now()}`,
      text: newGoalText.trim(),
      completed: false
    };
    setGoals(prev => [...prev, newGoal]);
    setNewGoalText('');
    addToast('Goal added successfully!', 'success');
  };

  const handleToggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    addToast('Goal removed', 'info');
  };

  // Actions
  const handleCreateRoom = (e: React.FormEvent) => {
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
      inviteCode: 'CODE' + Math.floor(100 + Math.random() * 900),
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

  const handleScheduleSession = (e: React.FormEvent) => {
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
    addToast(`Assignment published!`, 'success');
    setNewAssignment({ title: '', subject: 'Data Structures', deadline: '', totalAssigned: 42 });
    setShowCreateAssignment(false);
  };

  const handleAssignChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !challengeData.text) return;
    addToast(`Assigned task challenge to ${selectedStudent.fullName}`, 'success');
    setShowAssignChallenge(false);
    setChallengeData({ text: '', xpReward: 50, coinReward: 20 });
  };

  const handleToggleAttendanceCheckbox = (studentId: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Attendance sheet saved and broadcasted to students!', 'success');
    setShowAttendanceModal(false);
  };

  const toggleRoomLock = (roomId: string) => {
    setStudyRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const nextState = !room.isLocked;
        addToast(`Room is now ${nextState ? 'LOCKED' : 'UNLOCKED'}`, 'info');
        return { ...room, isLocked: nextState };
      }
      return room;
    }));
  };

  // Global Search filters
  const filteredStudents = students.filter(s => {
    const term = globalSearch.toLowerCase();
    return s.fullName.toLowerCase().includes(term) || s.weakTopics.toLowerCase().includes(term);
  });

  const filteredRooms = studyRooms.filter(r => {
    const term = globalSearch.toLowerCase();
    return r.name.toLowerCase().includes(term) || r.subject.toLowerCase().includes(term);
  });

  const filteredSessions = sessions.filter(s => {
    const term = globalSearch.toLowerCase();
    return s.title.toLowerCase().includes(term);
  });

  // Calculate struggling students
  const strugglingStudents = students.filter(s => s.attendanceRate < 45 || s.streakCount === 0).slice(0, 5);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col font-sans select-none">
      
      {/* Top Banner Control Bar (Header) */}
      <header className="h-16 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
        
        {/* Minimal Global Search bar */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search students, rooms, topics..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-[#060813] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-all"
          />
        </div>

        {/* View mode toggle switcher (Satisfies "Make state as zero" and "Make an existing self") */}
        <div className="flex bg-[#060813] border border-white/5 rounded-xl p-0.5 select-none shrink-0">
          <button
            onClick={() => setViewMode('new')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none ${
              viewMode === 'new' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-transparent text-zinc-450 hover:text-zinc-200'
            }`}
          >
            New User (Zero State)
          </button>
          <button
            onClick={() => setViewMode('existing')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none ${
              viewMode === 'existing' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-transparent text-zinc-450 hover:text-zinc-200'
            }`}
          >
            Existing Self (Active Cohort)
          </button>
        </div>

        {/* User Profile Widget */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="text-right">
            <p className="text-xs font-bold text-white">{user.fullName}</p>
            <p className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">{user.role}</p>
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
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-white/5 bg-[#0B0F19]/40 flex flex-col justify-between py-6">
          <div className="space-y-6">
            
            {/* Sidebar Logo */}
            <div className="px-6 flex items-center gap-2.5">
              <div className="h-8.5 w-8.5 rounded-xl bg-indigo-650 flex items-center justify-center">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">StudyCircle</h1>
                <p className="text-[9px] uppercase tracking-widest text-indigo-450 font-black">Mentor Hub</p>
              </div>
            </div>

            <hr className="border-white/5 mx-6" />

            <div className="space-y-1 px-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span>Dashboard</span>
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
                <span>Students</span>
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
                <span>Study Rooms</span>
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
                <span>Sessions</span>
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
                <span>Assignments</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'analytics' 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Analytics</span>
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
                <span>Profile</span>
              </button>
            </div>
          </div>

          <div className="px-6 text-[10px] text-zinc-650 space-y-1">
            <p>Logged in as: {user.username}</p>
            <p>© StudyCircle</p>
          </div>
        </aside>

        {/* Core Workspace Panel */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#070913]">
          
          {/* TAB 1: OPERATIONS COMMAND (Linear-style layout) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              
              {/* Section 1 — Welcome */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Good Morning, Mentor 👋</h2>
                  <p className="text-zinc-550 text-xs mt-0.5">Today's overview.</p>
                </div>
              </div>

              {/* 2-Column Split: Left (70%) vs Right (30%) */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
                
                {/* Left Side (70%) */}
                <div className="lg:col-span-7 space-y-7">
                  
                  {/* Section 2 — Quick Stats (Clean KPI Cards) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Students</p>
                      <p className="text-xl font-bold text-white mt-1 font-mono">{students.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Active Study Rooms</p>
                      <p className="text-xl font-bold text-white mt-1 font-mono">{studyRooms.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pending Doubts</p>
                      <p className="text-xl font-bold text-white mt-1 font-mono">{doubts.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Today's Sessions</p>
                      <p className="text-xl font-bold text-white mt-1 font-mono">{sessions.length}</p>
                    </div>
                  </div>

                  {/* Section 3 — Students Needing Attention */}
                  <div className="p-5 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>Students Needing Attention</span>
                    </h3>

                    {strugglingStudents.length === 0 ? (
                      <p className="text-xs text-zinc-550 italic py-2">No students needing attention today.</p>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {strugglingStudents.map(s => (
                          <div key={s.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-white">{s.fullName}</p>
                              <p className="text-[10px] text-zinc-550">
                                Weak Topic: <span className="text-amber-500 font-bold">{s.weakTopics}</span> • Attendance: <span className="font-bold">{s.attendanceRate}%</span>
                              </p>
                              <p className="text-[10px] text-red-400 font-medium">Reason: No study activity for 4 days</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button 
                                onClick={() => { setSelectedStudent(s); setShowAssignChallenge(true); }}
                                className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all border-none cursor-pointer"
                              >
                                Assign
                              </button>
                              <button 
                                onClick={() => addToast(`Direct messaging @${s.username}`, 'info')}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-[10px] font-bold transition-all border-none cursor-pointer"
                              >
                                Message
                              </button>
                              <button 
                                onClick={() => setShowCreateSession(true)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-[10px] font-bold transition-all border-none cursor-pointer"
                              >
                                Schedule Session
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 6 — Pending Doubts */}
                  <div className="p-5 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Pending Doubts</h3>
                    {doubts.length === 0 ? (
                      <div className="py-2 flex items-center gap-2 text-emerald-450 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>✓ All doubts resolved today.</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {doubts.slice(0, 5).map(d => (
                          <div key={d.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div>
                              <p className="text-xs font-bold text-white">{d.title}</p>
                              <p className="text-[10px] text-zinc-550">Student: {d.studentName} • Topic: {d.topic} • Waiting: {d.waitingTime}</p>
                            </div>
                            <button
                              onClick={() => {
                                setDoubts(prev => prev.filter(db => db.id !== d.id));
                                addToast('Doubt marked resolved!', 'success');
                              }}
                              className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all border-none cursor-pointer"
                            >
                              Resolve
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 7 — Analytics (Moved Below; handles Flat Zero-Line Analytics when state is zero) */}
                  <div className="p-5 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Analytics overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-zinc-500">Weekly Study Hours</p>
                        <div className="h-28 bg-[#0B0F19]/40 border border-white/5 rounded-xl p-2 relative">
                          {viewMode === 'new' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[0.5px] rounded-xl">
                              <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-black font-mono">No data logged</span>
                            </div>
                          )}
                          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                            {viewMode === 'new' ? (
                              // Flat baseline graph with no peaks/downs
                              <line x1="0" y1="35" x2="100" y2="35" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" strokeDasharray="3,3" />
                            ) : (
                              <path d="M 0 35 Q 20 15 40 25 T 80 10 T 100 5" fill="none" stroke="#6366F1" strokeWidth="2" />
                            )}
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-zinc-500">Subject Performance</p>
                        <div className="h-28 bg-[#0B0F19]/40 border border-white/5 rounded-xl p-2 flex items-end justify-around gap-2 relative">
                          {viewMode === 'new' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[0.5px] rounded-xl">
                              <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-black font-mono">No score records</span>
                            </div>
                          )}
                          {viewMode === 'new' ? (
                            <>
                              <div className="w-4 bg-zinc-800 rounded-t h-[2px]" />
                              <div className="w-4 bg-zinc-800 rounded-t h-[2px]" />
                              <div className="w-4 bg-zinc-800 rounded-t h-[2px]" />
                            </>
                          ) : (
                            <>
                              <div className="w-4 bg-indigo-650 rounded-t h-4/5" />
                              <div className="w-4 bg-emerald-650 rounded-t h-3/5" />
                              <div className="w-4 bg-amber-500 rounded-t h-2/5" />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-zinc-500">Attendance Ratios</p>
                        <div className="h-28 bg-[#0B0F19]/40 border border-white/5 rounded-xl p-2 flex items-center justify-center">
                          <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center text-[10px] font-bold text-white font-mono ${
                            viewMode === 'new' 
                              ? 'border-zinc-800 text-zinc-550' 
                              : 'border-emerald-500/20 border-t-emerald-500'
                          }`}>
                            {viewMode === 'new' ? '0%' : '84%'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Side (30%) */}
                <div className="lg:col-span-3 space-y-7">
                  
                  {/* Goals Widget Card */}
                  <div className="p-5 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Today's Goals</h3>
                      <span className="text-[9px] text-zinc-550 font-bold font-mono">
                        {goals.filter(g => g.completed).length}/{goals.length}
                      </span>
                    </div>

                    <form onSubmit={handleAddGoal} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new goal..."
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        className="flex-1 bg-[#060813] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
                      >
                        +
                      </button>
                    </form>

                    <div className="space-y-2">
                      {goals.map(g => (
                        <div key={g.id} className="flex items-center justify-between bg-white/[0.005] p-2 rounded-lg border border-white/5 gap-2">
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={g.completed}
                              onChange={() => handleToggleGoal(g.id)}
                              className="h-3.5 w-3.5 bg-transparent border-white/10 rounded text-indigo-500 focus:ring-0"
                            />
                            <span className={`text-xs ${g.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                              {g.text}
                            </span>
                          </label>
                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-1 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 rounded transition-all border-none bg-transparent cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 5 — Quick Actions (Compact Buttons, now includes Mark Attendance shortcut) */}
                  <div className="p-5 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <button
                        onClick={() => setShowCreateRoom(true)}
                        className="p-2.5 bg-[#0B0F19] hover:bg-white/5 border border-white/5 rounded-xl text-zinc-300 font-bold transition-all cursor-pointer"
                      >
                        Create Room
                      </button>
                      <button
                        onClick={() => setShowCreateSession(true)}
                        className="p-2.5 bg-[#0B0F19] hover:bg-white/5 border border-white/5 rounded-xl text-zinc-300 font-bold transition-all cursor-pointer"
                      >
                        Schedule Session
                      </button>
                      <button
                        onClick={() => setShowCreateAssignment(true)}
                        className="p-2.5 bg-[#0B0F19] hover:bg-white/5 border border-white/5 rounded-xl text-zinc-300 font-bold transition-all cursor-pointer"
                      >
                        Assignment
                      </button>
                      <button
                        onClick={() => setShowAnnouncement(true)}
                        className="p-2.5 bg-[#0B0F19] hover:bg-white/5 border border-white/5 rounded-xl text-zinc-300 font-bold transition-all cursor-pointer"
                      >
                        Broadcast
                      </button>
                      
                      {/* Attendance log shortcut button (Satisfies "Make an attendance module in shortcut") */}
                      <button
                        onClick={() => setShowAttendanceModal(true)}
                        className="col-span-2 p-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Track Attendance</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 4 — Upcoming Sessions (Timeline layout) */}
                  <div className="p-5 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Upcoming Sessions</h3>
                    
                    {sessions.length === 0 ? (
                      <p className="text-xs text-zinc-550 italic">No sessions scheduled today.</p>
                    ) : (
                      <div className="relative border-l border-white/5 pl-4 ml-2 space-y-4">
                        {sessions.map((sess, idx) => (
                          <div key={sess.id} className="relative text-xs">
                            <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-[#070913]" />
                            <p className="text-[10px] text-zinc-550 font-bold uppercase">{idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : 'Friday'}</p>
                            <p className="text-[10px] text-zinc-550 font-bold mt-0.5">{new Date(sess.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-zinc-300 font-medium mt-0.5">{sess.title}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: STUDENTS ROSTER */}
          {activeTab === 'students' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Student Roster</h2>
                <p className="text-zinc-550 text-xs mt-0.5 font-medium">Comprehensive cohort list.</p>
              </div>

              {loadingStudents ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : students.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-4">No students registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStudents.map(student => (
                    <div key={student.id} className="p-5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xs font-bold text-white">{student.fullName}</h3>
                            <p className="text-[10px] text-zinc-550 font-mono">@{student.username} • {student.college}</p>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-bold uppercase rounded">
                            {student.learningPath}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 text-center bg-white/[0.005] border border-white/5 rounded-lg text-[10px] font-medium text-zinc-500 font-mono">
                          <div>
                            <p className="font-sans">Study Hours</p>
                            <p className="text-white font-bold mt-0.5">{student.totalStudyHours} hrs</p>
                          </div>
                          <div>
                            <p className="font-sans">Progress</p>
                            <p className="text-white font-bold mt-0.5">{student.completionRate}%</p>
                          </div>
                          <div>
                            <p className="font-sans">Attendance</p>
                            <p className="text-white font-bold mt-0.5">{student.attendanceRate}%</p>
                          </div>
                        </div>

                        <p className="text-[10px] text-zinc-500 font-medium pt-1">
                          Weak Topic: <span className="text-amber-500 font-bold">{student.weakTopics}</span> • Last Active: <span className="text-white font-bold">{student.lastActive}</span>
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => { setSelectedStudent(student); setShowAssignChallenge(true); }}
                          className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer border-none transition-all"
                        >
                          Assign Task
                        </button>
                        <button
                          onClick={() => addToast(`Opening chat with @${student.username}`, 'info')}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-[10px] font-bold cursor-pointer border-none transition-all"
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

          {/* TAB 3: STUDY ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Study Rooms Hub</h2>
                  <p className="text-zinc-550 text-xs mt-0.5 font-medium">Coordinate dynamic rooms.</p>
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
              ) : studyRooms.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-4">No study rooms created yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRooms.map(room => (
                    <div key={room.id} className="p-5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-white flex items-center gap-2">
                              {room.name}
                              {room.isLocked && <Lock className="h-3.5 w-3.5 text-red-500" />}
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-medium">Subject: <span className="text-indigo-400 font-bold">{room.subject}</span> • Code: <span className="text-white font-mono">{room.inviteCode}</span></p>
                          </div>
                          <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${room.isLocked ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {room.isLocked ? 'Locked' : 'Open'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-zinc-400 leading-normal font-medium">{room.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 text-[10px] font-medium text-zinc-500 font-mono">
                          <div>
                            <p className="font-sans">Active Students: <span className="text-white font-bold">{room.activeStudents}</span></p>
                            <p className="font-sans">Mentor Assigned: <span className="text-white font-bold">{room.mentorAssigned}</span></p>
                          </div>
                          <div>
                            <p className="font-sans">Pending Doubts: <span className="text-amber-450 font-bold">{room.pendingDoubts}</span></p>
                            <p className="font-sans">Focus Topic: <span className="text-white font-bold">{room.focusTopic}</span></p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleRoomLock(room.id)}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all border-none flex items-center justify-center gap-1.5 ${
                            room.isLocked 
                              ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20' 
                              : 'bg-red-600/10 text-red-400 hover:bg-red-600/20'
                          }`}
                        >
                          {room.isLocked ? 'Unlock Room' : 'Lock Room'}
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
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Mentoring Sessions</h2>
                  <p className="text-zinc-550 text-xs mt-0.5 font-medium">Schedule and host lectures.</p>
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
              ) : sessions.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-4">No sessions scheduled today.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSessions.map(session => (
                    <div key={session.id} className="p-5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-white">{session.title}</h3>
                            <p className="text-[10px] text-zinc-500 font-medium">Cohort Group: <span className="text-indigo-400 font-bold">{session.groupName}</span></p>
                          </div>
                          <span className="text-[10px] text-zinc-550 font-bold font-mono">
                            {new Date(session.scheduledAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-normal font-medium">{session.description}</p>
                        
                        <div className="grid grid-cols-3 gap-3 text-center py-2 bg-[#0C0F19] rounded-lg border border-white/5 font-mono text-xs text-zinc-550">
                          <div>
                            <p className="font-sans">Registered</p>
                            <p className="font-bold text-white mt-0.5">{session.registered}</p>
                          </div>
                          <div>
                            <p className="font-sans">Joined</p>
                            <p className="font-bold text-white mt-0.5">{session.joined}</p>
                          </div>
                          <div>
                            <p className="font-sans">Attendance</p>
                            <p className="font-bold text-emerald-450 mt-0.5">{session.attendanceRate}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-center text-xs font-bold decoration-none transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer"
                        >
                          <Play className="h-4 w-4" /> Start Session
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Assignments</h2>
                  <p className="text-zinc-550 text-xs mt-0.5 font-medium">Review and assign tasks.</p>
                </div>
                <button
                  onClick={() => setShowCreateAssignment(true)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" /> Create Assignment
                </button>
              </div>

              {assignments.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-4">No assignments created yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {assignments.map(asg => (
                    <div key={asg.id} className="p-5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-white">{asg.title}</h3>
                            <p className="text-[10px] text-indigo-400 font-bold">{asg.subject}</p>
                          </div>
                          <span className="text-[8px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                            {asg.status}
                          </span>
                        </div>

                        <div className="pt-2 flex justify-between text-xs text-zinc-550 font-medium">
                          <span>Deadline: <span className="text-white font-mono">{asg.deadline}</span></span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center py-2 bg-white/[0.005] border border-white/5 rounded-lg font-mono text-xs text-zinc-550">
                          <div>
                            <p className="font-sans">Submissions</p>
                            <p className="font-bold text-white mt-0.5">{asg.submissionsCount}</p>
                          </div>
                          <div>
                            <p className="font-sans">Assigned</p>
                            <p className="font-bold text-white mt-0.5">{asg.totalAssigned}</p>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => addToast('Opening submission lists...', 'info')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
                      >
                        Review Submissions
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Analytics Dashboard</h2>
                <p className="text-zinc-550 text-xs mt-0.5 font-medium">Comprehensive statistical distribution of study parameters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Study Hours Trend</h3>
                  <div className="h-44 bg-[#0C0F19] border border-white/5 rounded-xl p-4 relative">
                    {viewMode === 'new' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[0.5px] rounded-xl">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">No activity logged</span>
                      </div>
                    )}
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                      {viewMode === 'new' ? (
                        <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeDasharray="5,5" />
                      ) : (
                        <path d="M 0 110 Q 80 80 160 95 T 320 40 T 480 30 L 500 30" fill="none" stroke="#6366F1" strokeWidth="2" />
                      )}
                    </svg>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Subject Accuracy</h3>
                  <div className="h-44 bg-[#0C0F19] border border-white/5 rounded-xl p-4 flex items-end justify-around gap-4 relative">
                    {viewMode === 'new' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[0.5px] rounded-xl">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">No quiz scores recorded</span>
                      </div>
                    )}
                    {viewMode === 'new' ? (
                      <>
                        <div className="w-8 bg-zinc-800 rounded-t h-[4px]" />
                        <div className="w-8 bg-zinc-800 rounded-t h-[4px]" />
                        <div className="w-8 bg-zinc-800 rounded-t h-[4px]" />
                      </>
                    ) : (
                      <>
                        <div className="w-8 bg-indigo-650 rounded-t h-4/5 text-center text-[10px] text-white pt-2">80%</div>
                        <div className="w-8 bg-emerald-650 rounded-t h-3/5 text-center text-[10px] text-white pt-2">60%</div>
                        <div className="w-8 bg-amber-500 rounded-t h-2/5 text-center text-[10px] text-white pt-2">40%</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6 bg-[#070913]">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Profile Settings</h2>
                <p className="text-zinc-550 text-xs mt-0.5 font-medium">Manage availability status.</p>
              </div>

              <div className="p-6 rounded-xl bg-white/[0.01] border border-white/5 space-y-6">
                
                {/* Availability status options */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Current Availability Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['online', 'busy', 'away', 'vacation'].map((status) => (
                      <label 
                        key={status} 
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold capitalize cursor-pointer transition-all ${
                          mentorAvailability === status 
                            ? 'bg-indigo-650/10 border-indigo-500 text-white' 
                            : 'bg-[#0B0F19] border-white/5 text-zinc-500 hover:bg-white/5'
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
                        <span className={`h-2 w-2 rounded-full ${
                          status === 'online' ? 'bg-emerald-500' :
                          status === 'busy' ? 'bg-red-500' :
                          status === 'away' ? 'bg-amber-500' : 'bg-zinc-500'
                        }`} />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Teaching Subjects checkbox list */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Teaching Expertise</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Data Structures', 'DBMS', 'OS', 'Computer Networks'].map((subject) => {
                      const checked = mentorSubjects.includes(subject);
                      return (
                        <label 
                          key={subject}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                            checked ? 'bg-indigo-650/5 border-indigo-500/30 text-white' : 'bg-[#0B0F19] border-white/5 text-zinc-555 hover:bg-white/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (checked) setMentorSubjects(prev => prev.filter(s => s !== subject));
                              else setMentorSubjects(prev => [...prev, subject]);
                            }}
                            className="h-4 w-4 bg-[#0B0F19] border-white/5 rounded text-indigo-500 focus:ring-0"
                          />
                          <span>{subject}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly availability days checklist */}
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
                          className={`px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer capitalize transition-all ${
                            isActive ? 'bg-indigo-650/10 border-indigo-500 text-white' : 'bg-[#0B0F19] border-white/5 text-zinc-550'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notification preferences checklist */}
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
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => addToast('Profile updated!', 'success')}
                    className="px-6 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
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

      {/* MODAL 2: SCHEDULE SESSIONS */}
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
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Target Study Room</label>
                  <select
                    value={newSession.groupId}
                    onChange={(e) => setNewSession(prev => ({ ...prev, groupId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
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
                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 font-sans">Scheduled At</label>
                  <input
                    type="datetime-local"
                    value={newSession.scheduledAt}
                    onChange={(e) => setNewSession(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 font-sans">Meeting Link</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/abc"
                    value={newSession.meetingLink}
                    onChange={(e) => setNewSession(prev => ({ ...prev, meetingLink: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
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
                addToast('Announcement broadcasted successfully!', 'success');
                setAnnouncementText('');
                setShowAnnouncement(false);
              }} 
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Announcement Message</label>
                <textarea
                  placeholder="Write message here..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed font-sans"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Broadcast Announcement
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
              <p className="text-xs text-zinc-400">Assigning challenge task to <span className="text-white font-bold">{selectedStudent.fullName}</span>.</p>
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
                  <label className="text-[10px] font-bold uppercase text-zinc-400 font-sans">Focus Coins</label>
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
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Subject Area</label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
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

      {/* MODAL 6: TRACK ATTENDANCE MODAL (Shortcut Attendance Module) */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attendance Log Roll Call</h3>
              </div>
              <button 
                onClick={() => setShowAttendanceModal(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {students.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="text-xs text-zinc-400">No active students rostered.</p>
                <p className="text-[10px] text-zinc-550">Please set the View Mode switcher to <span className="text-indigo-400 font-bold">Existing Self (Active Cohort)</span> to load the student database.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAttendance} className="space-y-4">
                <p className="text-[11px] text-zinc-450">Check/Uncheck to mark presence for today's daily session logs:</p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {students.map(s => (
                    <label 
                      key={s.id}
                      className="flex items-center justify-between p-2.5 bg-[#060913] hover:bg-white/5 border border-white/5 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{s.fullName}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">@{s.username}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!attendanceRecords[s.id]}
                        onChange={() => handleToggleAttendanceCheckbox(s.id)}
                        className="h-4.5 w-4.5 rounded bg-transparent border-white/10 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none"
                >
                  Submit Roll Call
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
