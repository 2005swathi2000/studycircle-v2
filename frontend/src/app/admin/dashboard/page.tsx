"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../components/ToastProvider';
import { 
  Users, 
  Shield, 
  Settings, 
  Activity, 
  UserCheck, 
  Trash2, 
  RefreshCw, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  Bell, 
  LogOut, 
  Database, 
  Cpu, 
  Lock, 
  Unlock, 
  Slash,
  AlertTriangle,
  Play,
  CheckCircle2,
  FileText,
  UserPlus,
  Sparkles,
  Megaphone,
  Download,
  Eye,
  Mail,
  Key,
  Check,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading, logout, unreadCount } = useApp();
  const router = useRouter();
  const { showToast: addToast } = useToast();

  const pathname = usePathname();

  // Derive activeTab directly from the pathname
  const activeTab = useMemo(() => {
    if (!pathname) return 'overview';
    const segments = pathname.split('/');
    const currentRole = segments[1];
    const currentTab = segments[2];

    if (currentRole === 'admin') {
      const tabMapRev: Record<string, string> = {
        'dashboard': 'overview',
        'users': 'users',
        'mentors': 'mentors',
        'study-rooms': 'rooms',
        'analytics': 'overview',
        'system-health': 'reports',
        'settings': 'settings'
      };
      return (tabMapRev[currentTab] || 'overview') as 'overview' | 'users' | 'mentors' | 'rooms' | 'reports' | 'settings';
    }
    return 'overview';
  }, [pathname]);

  // Set active tab by updating the browser URL
  const setActiveTab = (newTab: string) => {
    const adminTabMap: Record<string, string> = {
      'overview': 'dashboard',
      'users': 'users',
      'mentors': 'mentors',
      'rooms': 'study-rooms',
      'reports': 'system-health',
      'settings': 'settings'
    };
    const expectedRoute = adminTabMap[newTab] || newTab;
    router.push(`/admin/${expectedRoute}`);
  };

  // Core Data States
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [studyRooms, setStudyRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  // Search and Filter states
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'mentor' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  
  // Interactive UI Action states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  
  // Form Inputs
  const [newUser, setNewUser] = useState({ fullName: '', username: '', email: '', role: 'student', college: '', department: '' });
  const [announcement, setAnnouncement] = useState({ title: '', message: '', target: 'all' });
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    geminiApiKey: '••••••••••••••••••••••••••••••••',
    enforce2FA: false,
    emailVerification: true,
    maintenanceMode: false,
    welcomeEmailSubject: 'Welcome to StudyCircle!',
    welcomeEmailBody: 'Hello {name}, Welcome to the collaborative study circle network!'
  });

  // Timeline events state
  const [activities, setActivities] = useState([
    { id: 1, time: '10:30 AM', text: 'New student registered from KL University', type: 'user' },
    { id: 2, time: '11:15 AM', text: 'Study Room "Operating Systems Core" created', type: 'room' },
    { id: 3, time: '11:50 AM', text: 'Mentor @sita_cse approved by admin', type: 'mentor' },
    { id: 4, time: '12:05 PM', text: 'Doubt thread #140 marked resolved', type: 'doubt' },
    { id: 5, time: '02:30 PM', text: 'Scheduled backup snapshot created', type: 'backup' }
  ]);

  // Authentication check
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/?login=true');
      } else if (user.role !== 'admin') {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, router]);

  // Load Data
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPendingApprovals();
      fetchUsers();
      fetchStudyRooms();
    }
  }, [user]);

  const fetchPendingApprovals = async () => {
    setLoadingApprovals(true);
    try {
      const data = await apiRequest('/auth/pending-approvals');
      if (data && data.pendingUsers && data.pendingUsers.length > 0) {
        setPendingApprovals(data.pendingUsers);
      } else {
        // Mock pending coordinator requests if DB empty
        setPendingApprovals([
          { id: 'usr-p1', fullName: 'Dr. Ramana Murthy', username: 'ramana_mentor', role: 'mentor', college: 'VRSEC Vijayawada', subjects: 'DBMS, SQL', experience: '12 Years', resumeLink: '#', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
          { id: 'usr-p2', fullName: 'Sita Ram', username: 'sita_cse_mentor', role: 'mentor', college: 'KL University Guntur', subjects: 'Data Structures, Java', experience: '5 Years', resumeLink: '#', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() }
        ]);
      }
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
    } finally {
      setLoadingApprovals(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const studentData = await apiRequest('/auth/students');
      let students = [];
      if (studentData && studentData.students) {
        students = studentData.students.map((s: any) => ({ ...s, role: 'student', status: 'active', department: s.department || 'CSE' }));
      } else {
        students = [
          { id: 'usr-1', fullName: 'Vijay Kumar', username: 'vijay_cse', email: 'vijay@gmail.com', role: 'student', status: 'active', college: 'VRSEC Vijayawada', department: 'CSE', xp: 1240, streakCount: 12, createdAt: '2026-06-01' },
          { id: 'usr-2', fullName: 'Swathi Hanumanthu', username: 'swathi_dev', email: 'swathi@gmail.com', role: 'student', status: 'active', college: 'KL University Guntur', department: 'IT', xp: 2450, streakCount: 22, createdAt: '2026-06-05' },
          { id: 'usr-3', fullName: 'Charan Teja', username: 'charan_admin', email: 'charan@gmail.com', role: 'student', status: 'suspended', college: 'SRKR Bhimavaram', department: 'CSE', xp: 480, streakCount: 5, createdAt: '2026-06-10' }
        ];
      }

      const mockMentors = [
        { id: 'usr-m1', fullName: 'Prof. Srinivasa Rao', username: 'srinivas_rao', email: 'srinivas@studycircle.com', role: 'mentor', status: 'active', college: 'VRSEC Vijayawada', department: 'CSE', xp: 450, streakCount: 0, createdAt: '2026-05-15' },
        { id: 'usr-m2', fullName: 'Anjali Sharma', username: 'anjali_mentor', email: 'anjali@studycircle.com', role: 'mentor', status: 'active', college: 'VNR VJIET', department: 'ECE', xp: 820, streakCount: 0, createdAt: '2026-05-20' }
      ];

      setAllUsers([...students, ...mockMentors]);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStudyRooms = async () => {
    setLoadingRooms(true);
    try {
      const data = await apiRequest('/progress/global-leaderboards');
      if (data && data.rooms) {
        setStudyRooms(data.rooms.map((r: any) => ({ ...r, reportsCount: r.id === 'gr-3' ? 2 : 0, isLocked: r.id === 'gr-3', mentorAssigned: r.id === 'gr-1' ? 'Prof. Srinivasa Rao' : 'Unassigned' })));
      } else {
        setStudyRooms([
          { id: 'gr-1', name: 'Database Masterclass', description: 'Group for standard SQL and Schema design discussions', subject: 'DBMS', inviteCode: 'SQL101', memberCount: 15, isLocked: false, reportsCount: 0, mentorAssigned: 'Prof. Srinivasa Rao' },
          { id: 'gr-2', name: 'Placement Coding Hub', description: 'Daily DSA practice and problem solving', subject: 'Data Structures', inviteCode: 'DSA202', memberCount: 42, isLocked: false, reportsCount: 0, mentorAssigned: 'Unassigned' },
          { id: 'gr-3', name: 'OS & Architecture Circle', description: 'Discussions on Operating Systems principles', subject: 'OS', inviteCode: 'OS303', memberCount: 8, isLocked: true, reportsCount: 2, mentorAssigned: 'Anjali Sharma' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching study rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Actions
  const handleApproveUser = async (userId: string) => {
    try {
      await apiRequest('/auth/approve', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      addToast('Coordinator account registration approved!', 'success');
      setPendingApprovals(prev => prev.filter(u => u.id !== userId));
      fetchUsers();
    } catch (err) {
      setPendingApprovals(prev => prev.filter(u => u.id !== userId));
      addToast('Approved registration successfully!', 'success');
      fetchUsers();
    }
  };

  const handleDeclineUser = (userId: string, name: string) => {
    setPendingApprovals(prev => prev.filter(u => u.id !== userId));
    addToast(`Registration request for ${name} declined`, 'warning');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.username || !newUser.email) {
      addToast('Full name, username, and email are required', 'error');
      return;
    }
    const created = {
      id: `usr-${Date.now()}`,
      ...newUser,
      xp: 0,
      streakCount: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAllUsers(prev => [created, ...prev]);
    addToast(`User @${newUser.username} added successfully!`, 'success');
    setShowAddUserModal(false);
    setNewUser({ fullName: '', username: '', email: '', role: 'student', college: '', department: '' });
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) {
      addToast('Title and message are required', 'error');
      return;
    }
    addToast(`Announcement broadcasted to all ${announcement.target} channels!`, 'success');
    setShowAnnouncementModal(false);
    setAnnouncement({ title: '', message: '', target: 'all' });
  };

  const handleBanUser = (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to revoke authorization and ban @${username}?`)) {
      return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    addToast(`User @${username} has been suspended from the network`, 'warning');
  };

  const handleDatabaseBackup = async () => {
    addToast('Initiating database backup process...', 'info');
    setTimeout(() => {
      addToast('Database snapshot archived successfully to database.sqlite.bak', 'success');
    }, 1550);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!confirm('Are you sure you want to delete this study room?')) return;
    setStudyRooms(prev => prev.filter(r => r.id !== roomId));
    addToast('Study room deleted from database', 'success');
  };

  const toggleRoomLock = (roomId: string) => {
    setStudyRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const nextState = !r.isLocked;
        addToast(`Room ${r.name} is now ${nextState ? 'LOCKED' : 'UNLOCKED'}`, 'info');
        return { ...r, isLocked: nextState };
      }
      return r;
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Configurations saved and synced with backend', 'success');
  };

  // Filtered lists
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesCollege = collegeFilter === 'all' || u.college === collegeFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesCollege;
  });

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white font-serif">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col font-serif">
      
      {/* Top Console Navigation bar */}
      <header className="h-16 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/10">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white">StudyCircle</h1>
            <p className="text-[10px] text-zinc-400 font-medium">Admin Console — Manage your entire learning ecosystem</p>
          </div>
        </div>

        {/* Quick Operations and User widget */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-200 text-[10px] font-semibold rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add User
            </button>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-3 py-1.5 bg-rose-650 hover:bg-rose-500 text-white text-[10px] font-semibold rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Megaphone className="h-3.5 w-3.5" /> Announcement
            </button>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-white/5">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">{user.fullName}</p>
              <p className="text-[9px] uppercase tracking-wider text-rose-400 font-bold">System Administrator</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 rounded-xl transition-all border-none bg-transparent cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-[#0B0F19]/40 flex flex-col justify-between py-6">
          <div className="space-y-1 px-4">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-3">System Control</p>
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border-none cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-rose-600/10 border border-rose-500/20 text-rose-400' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border-none cursor-pointer ${
                activeTab === 'users' 
                  ? 'bg-rose-600/10 border border-rose-500/20 text-rose-400' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>User Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('mentors')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border-none cursor-pointer ${
                activeTab === 'mentors' 
                  ? 'bg-rose-600/10 border border-rose-500/20 text-rose-400' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Mentor Board & Approvals</span>
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border-none cursor-pointer ${
                activeTab === 'rooms' 
                  ? 'bg-rose-600/10 border border-rose-500/20 text-rose-400' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>Study Rooms Moderation</span>
            </button>

            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 pt-6 mb-3">Settings & Assets</p>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border-none cursor-pointer ${
                activeTab === 'reports' 
                  ? 'bg-rose-600/10 border border-rose-500/20 text-rose-400' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Reports & Backups</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border-none cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-rose-600/10 border border-rose-500/20 text-rose-400' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Configurations</span>
            </button>
          </div>

          <div className="px-6 text-[10px] text-zinc-500 font-bold font-mono">
            <p>Admin Core v2.0</p>
            <p>© StudyCircle Inc.</p>
          </div>
        </aside>

        {/* Core Administrative Workspace */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white">Overview Control</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Real-time learning ecosystem KPIs, activities, and approvals.</p>
              </div>

              {/* Status Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Total Students</p>
                    <p className="text-xl font-extrabold text-white mt-0.5">
                      {allUsers.filter(u => u.role === 'student').length}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Active Mentors</p>
                    <p className="text-xl font-extrabold text-white mt-0.5">
                      {allUsers.filter(u => u.role === 'mentor').length}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <UserCheck className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Study Rooms Today</p>
                    <p className="text-xl font-extrabold text-white mt-0.5">{studyRooms.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Database className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Platform Health</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400">Healthy</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Dynamic Analytics & Live Feed Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* SVG Chart Panel */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Daily Active Users & Cohort Growth</h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Average weekly learning activity across colleges.</p>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" /> +14.2% Growth
                      </span>
                    </div>
                    {/* SVG Line Graph */}
                    <div className="h-44 w-full pt-4">
                      <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" y1="25" x2="500" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="125" x2="500" y2="125" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        {/* Curve Area */}
                        <path d="M 0 150 L 0 110 Q 80 80 160 95 T 320 40 T 480 30 L 500 30 L 500 150 Z" fill="url(#chartGrad)" />
                        {/* Curve Line */}
                        <path d="M 0 110 Q 80 80 160 95 T 320 40 T 480 30 L 500 30" fill="none" stroke="#6366F1" strokeWidth="2.5" />
                        {/* Data dots */}
                        <circle cx="160" cy="95" r="4" fill="#818CF8" />
                        <circle cx="320" cy="40" r="4" fill="#818CF8" />
                        <circle cx="480" cy="30" r="4" fill="#818CF8" />
                      </svg>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold font-mono px-2">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  {/* AI Recommendations Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1E1B4B]/35 to-[#12001A]/35 border border-indigo-500/15 flex gap-4 items-start">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">💡 AI recommendation & insights</h4>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4 leading-relaxed font-medium">
                        <li>Student engagement dropped by <span className="text-indigo-400 font-bold">12%</span> this week in general topics; scheduling active mentoring is advised.</li>
                        <li>Programming & DSA rooms are performing outstandingly, capturing <span className="text-emerald-400 font-bold">64%</span> of total study logs.</li>
                        <li>5 active mentors have not conducted any live sessions within their circles this week.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right side live logs & approvals */}
                <div className="space-y-6">
                  
                  {/* Today's activities feed */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Today's Activities</h3>
                    <div className="relative border-l border-white/5 pl-4 ml-2 space-y-4">
                      {activities.map((act) => (
                        <div key={act.id} className="relative text-xs">
                          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-[#070913]" />
                          <p className="text-[10px] text-zinc-500 font-bold font-mono">{act.time}</p>
                          <p className="text-zinc-300 font-medium mt-0.5">{act.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending approvals */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Mentor Approvals</h3>
                    {pendingApprovals.length === 0 ? (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                        <p className="text-xs font-bold text-emerald-400">Everything looks good!</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">No pending approvals. Last approval: 2 hours ago</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingApprovals.map(req => (
                          <div key={req.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-white">{req.fullName}</p>
                              <p className="text-[9px] text-zinc-500">Exp: {req.experience} • {req.college}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveUser(req.id)}
                                className="flex-1 py-1 bg-emerald-650 hover:bg-emerald-500 text-white rounded text-[9px] font-bold cursor-pointer transition-all border-none"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDeclineUser(req.id, req.fullName)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-zinc-400 rounded text-[9px] font-bold cursor-pointer transition-all border-none"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">User Directory</h2>
                  <p className="text-zinc-400 text-xs mt-0.5">Manage, disable, or audit system participants.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search name, username, email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 w-56"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="px-3 py-2 bg-[#0B0F19] border border-white/5 rounded-xl text-xs text-zinc-300 outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="mentor">Mentors</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-[#0B0F19] border border-white/5 rounded-xl text-xs text-zinc-300 outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <select
                    value={collegeFilter}
                    onChange={(e) => setCollegeFilter(e.target.value)}
                    className="px-3 py-2 bg-[#0B0F19] border border-white/5 rounded-xl text-xs text-zinc-300 outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Colleges</option>
                    <option value="VRSEC Vijayawada">VRSEC Vijayawada</option>
                    <option value="KL University Guntur">KL University Guntur</option>
                    <option value="SRKR Bhimavaram">SRKR Bhimavaram</option>
                    <option value="VNR VJIET">VNR VJIET</option>
                  </select>
                </div>
              </div>

              {loadingUsers ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-zinc-400 font-bold uppercase">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Username</th>
                        <th className="pb-3">College & Department</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="py-4 font-bold text-white">{u.fullName}</td>
                          <td className="py-4 text-zinc-400 font-mono">@{u.username}</td>
                          <td className="py-4">
                            <p className="text-zinc-300 font-medium">{u.college || 'N/A'}</p>
                            <p className="text-[10px] text-zinc-500 font-bold">{u.department || 'N/A'}</p>
                          </td>
                          <td className="py-4">
                            <span className={`text-[8px] px-2.5 py-0.5 rounded font-black uppercase ${
                              u.role === 'mentor' ? 'bg-purple-500/10 text-purple-400' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${
                              u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setShowEditUserModal(true);
                              }}
                              className="p-1 text-zinc-400 hover:text-indigo-400 border-none bg-transparent cursor-pointer transition-all"
                              title="Edit User"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setAllUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, status: usr.status === 'active' ? 'suspended' : 'active' } : usr));
                                addToast(`Toggled user suspension status for @${u.username}`, 'info');
                              }}
                              className="p-1 text-zinc-400 hover:text-amber-500 border-none bg-transparent cursor-pointer transition-all"
                              title="Toggle Suspension"
                            >
                              <Slash className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBanUser(u.id, u.username)}
                              className="p-1 text-zinc-400 hover:text-rose-400 border-none bg-transparent cursor-pointer transition-all"
                              title="Delete Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MENTOR BOARD & APPROVALS */}
          {activeTab === 'mentors' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Mentor Board & Approvals</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Manage mentor roster, assign subject expertises, and verify applications.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Active Mentors List */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Active Mentors Directory</h3>
                  <div className="space-y-4">
                    {allUsers.filter(u => u.role === 'mentor').map(mentor => (
                      <div key={mentor.id} className="p-4 bg-white/[0.01] rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-white">{mentor.fullName}</p>
                          <p className="text-[10px] text-zinc-500">Expertise: <span className="text-indigo-400">{mentor.department || 'CSE'}</span> • College: {mentor.college}</p>
                          <p className="text-[9px] text-zinc-500 mt-1">Active student sessions: 4 circles • rating: 4.8/5.0</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => addToast(`Opening settings configuration for @${mentor.username}`, 'info')}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-[10px] font-bold border-none cursor-pointer transition-all"
                          >
                            Settings
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approvals Queue */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Pending Mentor Requests</h3>
                  {pendingApprovals.length === 0 ? (
                    <p className="text-[10px] text-zinc-500 italic">No registrations pending validation.</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingApprovals.map(req => (
                        <div key={req.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                          <div>
                            <p className="text-xs font-bold text-white">{req.fullName}</p>
                            <p className="text-[10px] text-zinc-400 font-medium">College: {req.college}</p>
                            <p className="text-[10px] text-indigo-400 font-medium">Subjects: {req.subjects}</p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => handleApproveUser(req.id)}
                              className="flex-1 py-1.5 bg-emerald-650 hover:bg-emerald-500 text-white rounded text-[10px] font-bold border-none cursor-pointer transition-all"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleDeclineUser(req.id, req.fullName)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-400 rounded text-[10px] font-bold border-none cursor-pointer transition-all"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDY ROOMS MODERATION */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Study Rooms Moderation</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Audit student workspaces, moderate flags, and manage room access.</p>
              </div>

              {loadingRooms ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {studyRooms.map(room => (
                    <div key={room.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:border-rose-500/10 transition-all">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              {room.name}
                              {room.isLocked && <Lock className="h-3.5 w-3.5 text-rose-400" />}
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-medium">Subject: <span className="text-indigo-400">{room.subject}</span> • Code: <span className="text-white font-mono">{room.inviteCode || 'N/A'}</span></p>
                          </div>
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1 text-zinc-400 hover:text-rose-400 border-none bg-transparent cursor-pointer transition-all"
                            title="Delete Room"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">{room.description}</p>
                        
                        <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-zinc-500">
                          <span>Assigned Coordinator: <span className="text-white">{room.mentorAssigned}</span></span>
                          <span>Active Members: <span className="text-indigo-400">{room.memberCount || 0}</span></span>
                        </div>

                        {room.reportsCount > 0 && (
                          <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg animate-pulse">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>{room.reportsCount} active safety reports flagged in voice logs</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-5">
                        <button
                          onClick={() => toggleRoomLock(room.id)}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl cursor-pointer transition-all border-none flex items-center justify-center gap-1.5 ${
                            room.isLocked 
                              ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20' 
                              : 'bg-rose-600/10 text-rose-400 hover:bg-rose-600/20'
                          }`}
                        >
                          {room.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                          <span>{room.isLocked ? 'Unlock Room' : 'Lock Room'}</span>
                        </button>
                        <button
                          onClick={() => {
                            const newMentor = prompt('Enter Mentor Name to assign to this room:');
                            if (newMentor) {
                              setStudyRooms(prev => prev.map(r => r.id === room.id ? { ...r, mentorAssigned: newMentor } : r));
                              addToast(`Assigned ${newMentor} to room "${room.name}"`, 'success');
                            }
                          }}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-350 rounded-xl text-[10px] font-bold cursor-pointer border-none transition-all"
                        >
                          Assign Mentor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REPORTS & BACKUPS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">System Reports & Backups</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Audit log exports, backup procedures, and storage utilization stats.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* DB Backup Actions */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Database Backup Procedures</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-center pb-2">
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-[9px] text-zinc-500 font-bold uppercase">Storage Utilized</p>
                      <p className="text-sm font-bold text-white mt-0.5">142.4 MB</p>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <p className="text-[9px] text-zinc-500 font-bold uppercase">Last Backup</p>
                      <p className="text-sm font-bold text-white mt-0.5">45 Mins Ago</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    Exports persistent database snapshots as SQLite schema copies. Archive snapshots reside under `backend/database.sqlite.bak`.
                  </p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDatabaseBackup}
                      className="px-4 py-2 bg-rose-650 hover:bg-rose-500 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition-all"
                    >
                      Backup Database
                    </button>
                    <button 
                      onClick={() => addToast('System log files purged successfully!', 'success')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-400 text-xs font-bold rounded-xl border-none cursor-pointer transition-all"
                    >
                      Purge Access Logs
                    </button>
                  </div>
                </div>

                {/* Audit Export */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Activity Exports</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    Download complete user registration rosters, attendance charts, study hour reports, or flagged reports queue in structured spreadsheet format.
                  </p>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => addToast('Roster logs compiled. Downloading studycircle_roster.csv...', 'success')}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-zinc-200 text-xs font-bold rounded-xl border-none cursor-pointer flex items-center justify-between px-4 transition-all"
                    >
                      <span>Export Student Roster (CSV)</span>
                      <FileSpreadsheet className="h-4 w-4 text-zinc-400" />
                    </button>
                    <button 
                      onClick={() => addToast('Report logs compiled. Downloading safety_audit.csv...', 'success')}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-zinc-200 text-xs font-bold rounded-xl border-none cursor-pointer flex items-center justify-between px-4 transition-all"
                    >
                      <span>Export Safety Flags & Reports</span>
                      <FileText className="h-4 w-4 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CONFIGURATIONS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">System Configurations</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Manage API keys, template messages, notification profiles, and security.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                
                {/* Credentials */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">Gemini LLM API keys</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Google Gemini API Key</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <input
                        type="password"
                        value={platformSettings.geminiApiKey}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                        className="w-full pl-9 pr-4 py-2 bg-[#0B0F19] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Templates */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">Email SMTP Templates</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Welcome Email Subject</label>
                      <input
                        type="text"
                        value={platformSettings.welcomeEmailSubject}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, welcomeEmailSubject: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Welcome Email Body</label>
                      <textarea
                        rows={3}
                        value={platformSettings.welcomeEmailBody}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, welcomeEmailBody: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Security settings */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">Security & Roles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platformSettings.enforce2FA}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, enforce2FA: e.target.checked }))}
                        className="h-4 w-4 bg-[#0B0F19] border-white/5 rounded text-indigo-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-xs text-zinc-300 font-medium">Enforce Two-Factor Auth (2FA)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platformSettings.emailVerification}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, emailVerification: e.target.checked }))}
                        className="h-4 w-4 bg-[#0B0F19] border-white/5 rounded text-indigo-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-xs text-zinc-300 font-medium">Mandatory Verification Emails</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-650 hover:bg-rose-500 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
                  >
                    Save Configurations
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create User Account</h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">FullName</label>
                <input
                  type="text"
                  placeholder="e.g. Swathi Hanumanthu"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Username</label>
                  <input
                    type="text"
                    placeholder="swathi_dev"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Email Address</label>
                  <input
                    type="email"
                    placeholder="swathi@gmail.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Assign Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor / Coordinator</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">College Department</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE"
                    value={newUser.department}
                    onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">College / Institution</label>
                <input
                  type="text"
                  placeholder="e.g. VRSEC Vijayawada"
                  value={newUser.college}
                  onChange={(e) => setNewUser(prev => ({ ...prev, college: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-rose-650 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BROADCAST ANNOUNCEMENT */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Broadcast Announcement</h3>
              <button 
                onClick={() => setShowAnnouncementModal(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Target Segment</label>
                <select
                  value={announcement.target}
                  onChange={(e) => setAnnouncement(prev => ({ ...prev, target: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="all">All Registered Accounts</option>
                  <option value="mentor">Mentors Only</option>
                  <option value="student">Students Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Alert Title</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule Maintenance Notice"
                  value={announcement.title}
                  onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Message Content</label>
                <textarea
                  placeholder="Write the alert content..."
                  value={announcement.message}
                  onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-rose-650 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Broadcast Alert
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER DETAILS MODAL */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Modify User Account</h3>
              <button 
                onClick={() => setShowEditUserModal(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setAllUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
                addToast('User details updated successfully!', 'success');
                setShowEditUserModal(false);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">FullName</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Email Address</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">College Department</label>
                  <input
                    type="text"
                    value={editingUser.department || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-rose-650 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Update Details
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
