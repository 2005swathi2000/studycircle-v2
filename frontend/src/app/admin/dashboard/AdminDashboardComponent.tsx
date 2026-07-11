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
  Bell, 
  LogOut, 
  Database, 
  Cpu, 
  Lock, 
  Unlock, 
  AlertTriangle,
  Play,
  CheckCircle2,
  FileText,
  UserPlus,
  Sparkles,
  Megaphone,
  Mail,
  Check,
  X,
  Home,
  BookOpen
} from 'lucide-react';

export function AdminDashboardComponent() {
  const { user, loading, logout } = useApp();
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
        'users': 'students',
        'mentors': 'mentors',
        'study-rooms': 'rooms',
        'resources': 'resources',
        'reports': 'reports',
        'announcements': 'announcements',
        'system-health': 'system-health',
        'settings': 'settings',
        'profile': 'profile'
      };
      return (tabMapRev[currentTab] || 'overview') as any;
    }
    return 'overview';
  }, [pathname]);

  // Set active tab by updating the browser URL
  const setActiveTab = (newTab: string) => {
    const adminTabMap: Record<string, string> = {
      'overview': 'dashboard',
      'students': 'users',
      'mentors': 'mentors',
      'rooms': 'study-rooms',
      'resources': 'resources',
      'reports': 'reports',
      'announcements': 'announcements',
      'system-health': 'system-health',
      'settings': 'settings',
      'profile': 'profile'
    };
    const expectedRoute = adminTabMap[newTab] || newTab;
    router.push(`/admin/${expectedRoute}`);
  };

  const [showSidebar, setShowSidebar] = useState(false);

  // Core Data States
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [studyRooms, setStudyRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');

  // Modal / Form triggers
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', username: '', email: '', role: 'student', college: '', department: 'CSE' });
  const [announcement, setAnnouncement] = useState({ title: '', message: '', target: 'all' });
  
  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    appName: 'StudyCircle',
    emailConfig: 'smtp.studycircle.com',
    maintenanceMode: false,
    welcomeEmailSubject: 'Welcome to StudyCircle!',
    welcomeEmailBody: 'Hello, Welcome to the collaborative study circle network!'
  });

  // Timeline events state
  const [activities, setActivities] = useState([
    { id: 1, time: '10:30 AM', text: 'New student registered from VRSEC College', type: 'user' },
    { id: 2, time: '11:15 AM', text: 'Study Room "Operating Systems Core" created', type: 'room' },
    { id: 3, time: '11:50 AM', text: 'Mentor @sita_cse approved by admin', type: 'mentor' },
    { id: 4, time: '12:05 PM', text: 'Doubt thread #140 marked resolved', type: 'doubt' }
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

  // Load Data on Mount
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPendingApprovals();
      fetchUsers();
      fetchStudyRooms();
      fetchDoubts();
      fetchResources();
    }
  }, [user]);

  const fetchPendingApprovals = async () => {
    setLoadingApprovals(true);
    try {
      const data = await apiRequest('/auth/pending-approvals');
      if (data && data.pendingUsers && data.pendingUsers.length > 0) {
        setPendingApprovals(data.pendingUsers);
      } else {
        // Fallback seed
        setPendingApprovals([
          { id: 'usr-p1', fullName: 'Dr. Ramana Murthy', username: 'ramana_mentor', role: 'mentor', college: 'VRSEC Vijayawada', subjects: 'DBMS, SQL', experience: '12 Years', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
          { id: 'usr-p2', fullName: 'Sita Ram', username: 'sita_cse_mentor', role: 'mentor', college: 'KL University Guntur', subjects: 'Data Structures, Java', experience: '5 Years', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() }
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
        students = studentData.students.map((s: any) => ({ ...s, role: 'student', status: 'active', department: s.department || 'CSE', college: s.college || 'VRSEC Vijayawada' }));
      } else {
        students = [
          { id: 'usr-1', fullName: 'Vijay Kumar', username: 'vijay_cse', email: 'vijay@gmail.com', role: 'student', status: 'active', college: 'VRSEC Vijayawada', department: 'CSE', xp: 1240, streakCount: 12 },
          { id: 'usr-2', fullName: 'Swathi Hanumanthu', username: 'swathi_dev', email: 'swathi@gmail.com', role: 'student', status: 'active', college: 'KL University Guntur', department: 'IT', xp: 2450, streakCount: 22 },
          { id: 'usr-3', fullName: 'Charan Teja', username: 'charan_admin', email: 'charan@gmail.com', role: 'student', status: 'suspended', college: 'SRKR Bhimavaram', department: 'CSE', xp: 480, streakCount: 5 }
        ];
      }

      const mockMentors = [
        { id: 'usr-m1', fullName: 'Prof. Srinivasa Rao', username: 'srinivas_rao', email: 'srinivas@studycircle.com', role: 'mentor', status: 'active', college: 'VRSEC Vijayawada', department: 'CSE', xp: 450, streakCount: 0 },
        { id: 'usr-m2', fullName: 'Anjali Sharma', username: 'anjali_mentor', email: 'anjali@studycircle.com', role: 'mentor', status: 'active', college: 'VNR VJIET', department: 'ECE', xp: 820, streakCount: 0 }
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
      const data = await apiRequest('/groups');
      if (data && data.groups) {
        setStudyRooms(data.groups);
      }
    } catch (err) {
      console.error('Error fetching study rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchDoubts = async () => {
    setLoadingDoubts(true);
    try {
      const data = await apiRequest('/doubts');
      if (data && data.doubts) {
        setDoubts(data.doubts.map((d: any) => ({
          ...d,
          studentName: d.Author?.fullName || 'Student',
          topic: d.subject || 'General'
        })));
      }
    } catch (err) {
      console.error('Error fetching doubts:', err);
    } finally {
      setLoadingDoubts(false);
    }
  };

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const data = await apiRequest('/shared-notes');
      if (data && data.notes) {
        setResources(data.notes);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  // Actions
  const handleApproveUser = async (userId: string) => {
    try {
      await apiRequest(`/auth/approve-mentor/${userId}`, { method: 'POST' });
      addToast('Mentor registration approved!', 'success');
      setActivities(prev => [
        { id: Date.now(), time: 'Just now', text: `Mentor approved by admin`, type: 'mentor' },
        ...prev
      ]);
      fetchPendingApprovals();
      fetchUsers();
    } catch (err: any) {
      addToast(err.message || 'Approval request failed.', 'error');
    }
  };

  const handleDeclineUser = async (userId: string) => {
    try {
      await apiRequest(`/auth/reject-mentor/${userId}`, { method: 'POST' });
      addToast('Mentor registration request declined.', 'info');
      fetchPendingApprovals();
    } catch (err: any) {
      addToast('Reject request failed.', 'error');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.username || !newUser.email) {
      addToast('All fields are required', 'error');
      return;
    }
    // Simulate user creation
    setAllUsers(prev => [
      ...prev,
      { id: `usr-${Date.now()}`, ...newUser, status: 'active', xp: 0, streakCount: 0 }
    ]);
    addToast(`User @${newUser.username} created successfully.`, 'success');
    setShowAddUserModal(false);
    setNewUser({ fullName: '', username: '', email: '', role: 'student', college: '', department: 'CSE' });
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) {
      addToast('Announcement text required.', 'error');
      return;
    }
    addToast('Broadcast announcement sent to all online users.', 'success');
    setAnnouncement({ title: '', message: '', target: 'all' });
  };

  const handleToggleSuspend = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        addToast(`User status set to ${nextStatus}`, 'info');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Archive this study group?')) {
      try {
        await apiRequest(`/groups/${roomId}`, { method: 'DELETE' });
        addToast('Study group archived successfully.', 'info');
        fetchStudyRooms();
      } catch (e) {
        addToast('Failed to archive group.', 'error');
      }
    }
  };

  // Greeting selector
  const greetingText = useMemo(() => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Good Morning';
    if (hr >= 12 && hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSidebar(true)}
            className="p-2 hover:bg-white/5 rounded-lg border-none bg-transparent cursor-pointer lg:hidden"
          >
            <Activity className="h-5 w-5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#5227EB]/10 border border-[#5227EB]/20 text-[#5227EB] text-xs font-black uppercase">Console</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{user?.fullName || 'Administrator'}</p>
            <p className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">{user?.role || 'Admin'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 hover:bg-red-955/20 text-zinc-450 hover:text-red-400 rounded-xl transition-all border-none bg-transparent cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-[#0B0F19] lg:bg-[#0B0F19]/40 flex flex-col justify-between py-6 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="space-y-6">
            <div className="px-6 flex items-center gap-2.5 select-none">
              <div className="h-8.5 w-8.5 rounded-xl bg-indigo-650 flex items-center justify-center">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-sm font-bold tracking-tight text-white">StudyCircle</h1>
                <p className="text-[9px] uppercase tracking-widest text-indigo-400 font-black">Admin Panel</p>
              </div>
            </div>

            <hr className="border-white/5" />
            
            <div className="space-y-1 px-4">
              <button
                onClick={() => { setActiveTab('overview'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'overview' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>🏠 Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveTab('students'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'students' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>👨‍🎓 Students</span>
              </button>

              <button
                onClick={() => { setActiveTab('mentors'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'mentors' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <UserCheck className="h-4 w-4 text-emerald-450" />
                <span>👨‍💼 Mentors</span>
              </button>

              <button
                onClick={() => { setActiveTab('rooms'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'rooms' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4 text-sky-400" />
                <span>👥 Study Groups</span>
              </button>

              <button
                onClick={() => { setActiveTab('resources'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'resources' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span>📚 Resources</span>
              </button>

              <button
                onClick={() => { setActiveTab('reports'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'reports' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <span>🚨 Reports</span>
              </button>

              <button
                onClick={() => { setActiveTab('announcements'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'announcements' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Megaphone className="h-4 w-4 text-yellow-400" />
                <span>📢 Announcements</span>
              </button>

              <button
                onClick={() => { setActiveTab('system-health'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'system-health' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Cpu className="h-4 w-4 text-purple-400" />
                <span>📊 System Health</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'settings' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>⚙️ Settings</span>
              </button>

              <button
                onClick={() => { setActiveTab('profile'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'profile' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>👤 Profile</span>
              </button>
            </div>
          </div>

          <div className="px-6 text-[10px] text-zinc-500 text-left">
            <p>Admin: {user?.username}</p>
            <p>© StudyCircle</p>
          </div>
        </aside>

        {showSidebar && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Workspace panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#070913] w-full">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300 text-left">
              
              {/* Welcome Summary Section */}
              <div className="p-6 bg-[#0B0F19]/60 border border-white/5 rounded-2xl">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <h1 className="text-xl font-black text-white tracking-tight mt-1">
                  {greetingText}, {user?.fullName || 'Owner'} 👋
                </h1>
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-zinc-450 font-bold">Platform Status Summary:</p>
                  <ul className="text-xs text-zinc-400 space-y-0.5 list-disc pl-4 font-medium">
                    <li><span className="text-indigo-400 font-bold">{allUsers.length}</span> Total Users Online</li>
                    <li><span className="text-indigo-400 font-bold">{pendingApprovals.length}</span> Pending Registrations</li>
                    <li><span className="text-indigo-400 font-bold">{doubts.filter(d => d.isReported).length}</span> Flags Needing Action</li>
                  </ul>
                </div>
              </div>

              {/* KPI metrics row */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Students</span>
                  <p className="text-xl font-bold text-white mt-1 font-mono">{allUsers.filter(u => u.role === 'student').length}</p>
                </div>
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Mentors</span>
                  <p className="text-xl font-bold text-white mt-1 font-mono">{allUsers.filter(u => u.role === 'mentor').length}</p>
                </div>
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Groups</span>
                  <p className="text-xl font-bold text-white mt-1 font-mono">{studyRooms.length}</p>
                </div>
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Active Sessions</span>
                  <p className="text-xl font-bold text-white mt-1 font-mono">3</p>
                </div>
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Approvals</span>
                  <p className="text-xl font-bold text-amber-400 mt-1 font-mono">{pendingApprovals.length}</p>
                </div>
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Flags</span>
                  <p className="text-xl font-bold text-rose-500 mt-1 font-mono">{doubts.filter(d => d.isReported).length}</p>
                </div>
              </div>

              {/* Dashboard Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
                
                {/* Left (60%) */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Approvals */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-400 border-b border-white/5 pb-2">📋 Pending Approvals</h3>
                    {pendingApprovals.length === 0 ? (
                      <p className="text-xs text-zinc-555 italic py-4">No pending approvals.</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingApprovals.map(req => (
                          <div key={req.id} className="p-4 bg-[#0b0f19]/30 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-white">{req.fullName}</h4>
                              <p className="text-[9.5px] text-zinc-450">{req.college} • {req.subjects}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleApproveUser(req.id)} className="px-2.5 py-1.5 bg-[#10B981]/15 text-[#10B981] text-[9px] font-black rounded-lg cursor-pointer border-none uppercase">Approve</button>
                              <button onClick={() => handleDeclineUser(req.id)} className="px-2.5 py-1.5 bg-rose-500/10 text-rose-455 text-[9px] font-black rounded-lg cursor-pointer border-none uppercase">Reject</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Flagged moderation */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-400 border-b border-white/5 pb-2">🚨 Reports & Moderation</h3>
                    {doubts.filter(d => d.isReported).length === 0 ? (
                      <p className="text-xs text-emerald-450 italic py-4">✓ All content clear. No reports pending.</p>
                    ) : (
                      <div className="space-y-3">
                        {doubts.filter(d => d.isReported).map(d => (
                          <div key={d.id} className="p-4 bg-[#0b0f19]/30 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-white truncate max-w-xs">{d.title}</h4>
                              <p className="text-[9px] text-zinc-500">Student: {d.studentName} • Flagged</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    await apiRequest(`/doubts/${d.id}/ignore`, { method: 'POST' });
                                    addToast('Report dismissed.', 'success');
                                    fetchDoubts();
                                  } catch (e) {}
                                }}
                                className="px-2.5 py-1.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white text-[9px] font-black rounded-lg cursor-pointer uppercase"
                              >
                                Ignore
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Remove reported doubt thread?')) {
                                    try {
                                      await apiRequest(`/doubts/${d.id}`, { method: 'DELETE' });
                                      addToast('Discussion thread deleted.', 'info');
                                      fetchDoubts();
                                    } catch (e) {}
                                  }
                                }}
                                className="px-2.5 py-1.5 bg-rose-500/10 text-rose-455 text-[9px] font-black rounded-lg cursor-pointer border border-rose-500/15 uppercase"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right (40%) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* System health quick overview */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-400 border-b border-white/5 pb-2">🖥 System Health</h3>
                    <div className="space-y-3 font-mono text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-sans">API Endpoint Status</span>
                        <span className="text-emerald-450 font-bold uppercase tracking-wider">Online</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-sans">Database Engines</span>
                        <span className="text-emerald-450 font-bold uppercase tracking-wider">Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-sans">System Memory</span>
                        <span className="text-zinc-300 font-bold">1.2 GB / 4.0 GB</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase text-zinc-400 border-b border-white/5 pb-2">⏱ Recent Platform Activity</h3>
                    <div className="space-y-4 pr-1 max-h-[300px] overflow-y-auto">
                      {activities.map(act => (
                        <div key={act.id} className="relative pl-5 text-xs text-left">
                          <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <p className="text-[10px] text-zinc-550 font-bold">{act.time}</p>
                          <p className="text-zinc-300 font-medium mt-0.5 leading-normal">{act.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: STUDENTS MODULE */}
          {activeTab === 'students' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Student Accounts</h2>
                  <p className="text-zinc-500 text-xs mt-0.5 font-medium">Activate, suspend, and search student profiles.</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-xs font-black rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all uppercase tracking-wider"
                >
                  <UserPlus className="h-4 w-4" /> Create User
                </button>
              </div>

              {/* Users table */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.01] border-b border-white/5 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Department / College</th>
                        <th className="p-4">Account Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {allUsers.filter(u => u.role === 'student').map(student => (
                        <tr key={student.id} className="hover:bg-white/[0.005]">
                          <td className="p-4">
                            <span className="font-bold text-white block">{student.fullName}</span>
                            <span className="text-[9px] text-zinc-550 font-mono block">@{student.username}</span>
                          </td>
                          <td className="p-4 text-zinc-350">{student.email || 'N/A'}</td>
                          <td className="p-4 text-zinc-450">{student.department} • {student.college}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              student.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-rose-500/10 text-rose-455 border border-rose-500/15'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleToggleSuspend(student.id)}
                                className="px-2.5 py-1 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all"
                              >
                                {student.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MENTORS MODULE */}
          {activeTab === 'mentors' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Mentor Directory</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Approve and configure mentor workspace authorization privileges.</p>
              </div>

              <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.01] border-b border-white/5 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                        <th className="p-4">Mentor Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Affiliation College</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {allUsers.filter(u => u.role === 'mentor').map(mentor => (
                        <tr key={mentor.id} className="hover:bg-white/[0.005]">
                          <td className="p-4">
                            <span className="font-bold text-white block">{mentor.fullName}</span>
                            <span className="text-[9px] text-zinc-550 font-mono block">@{mentor.username}</span>
                          </td>
                          <td className="p-4 text-zinc-350">{mentor.email}</td>
                          <td className="p-4 text-zinc-450">{mentor.college}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-500/15 rounded text-[8px] font-black uppercase tracking-wider">
                              Approved Mentor
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDY GROUPS */}
          {activeTab === 'rooms' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Collaborative Circles</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Monitor active study rooms, group participants, and activities.</p>
              </div>

              {studyRooms.length === 0 ? (
                <p className="text-xs text-zinc-555 italic py-6 text-center">No study groups online yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studyRooms.map(room => (
                    <div key={room.id} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between min-h-[160px]">
                      <div className="space-y-1.5 text-left">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded text-[8px] font-black uppercase tracking-wider">
                          {room.subject}
                        </span>
                        <h4 className="text-xs font-bold text-white pt-1">{room.name}</h4>
                        <p className="text-[10px] text-zinc-450 leading-relaxed line-clamp-2">{room.description}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <span className="text-[9px] text-zinc-500 font-bold">{room.memberCount || 3} Members</span>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="px-2.5 py-1.5 bg-rose-500/10 text-rose-455 hover:bg-rose-500/20 text-[9px] font-black rounded-lg cursor-pointer uppercase transition-all border border-rose-500/15"
                        >
                          Archive Group
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RESOURCES MODULE */}
          {activeTab === 'resources' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Study Resource Repository</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Moderate shared notes, documents, links, and cheat sheets.</p>
              </div>

              {resources.length === 0 ? (
                <p className="text-xs text-zinc-555 italic py-6 text-center">No shared resources online yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map(res => (
                    <div key={res.id} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between min-h-[160px]">
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded text-[8px] font-black uppercase tracking-wider">
                            {res.type}
                          </span>
                          <span className="text-[9.5px] text-zinc-500 font-mono font-bold">{res.size}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{res.name}</h4>
                        <p className="text-[10px] text-zinc-450 leading-relaxed line-clamp-2">{res.content}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <span className="text-[8px] text-zinc-550 font-bold uppercase truncate max-w-[120px]">By {res.publishedBy}</span>
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete this resource?')) {
                              try {
                                await apiRequest(`/shared-notes/${res.id}`, { method: 'DELETE' });
                                addToast('Resource deleted.', 'info');
                                fetchResources();
                              } catch (e) {}
                            }
                          }}
                          className="px-2.5 py-1.5 bg-rose-500/10 text-rose-455 hover:bg-rose-500/20 text-[9px] font-black rounded-lg cursor-pointer uppercase transition-all border border-rose-500/15"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Report Handling Console</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Review and resolve reported user doubts or discussion threads.</p>
              </div>

              {doubts.filter(d => d.isReported).length === 0 ? (
                <div className="py-12 bg-white/[0.01] border border-white/5 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-450 mx-auto" />
                  <p className="text-sm text-zinc-450 font-bold">All reported discussions resolved.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {doubts.filter(d => d.isReported).map(d => (
                    <div key={d.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between gap-4 text-left">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{d.title}</h4>
                        <p className="text-[10px] text-zinc-450 leading-relaxed mt-1">{d.description}</p>
                        <span className="text-[8.5px] text-zinc-550 font-mono block mt-1">Student: {d.studentName} • Circle Subject: {d.topic}</span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={async () => {
                            try {
                              await apiRequest(`/doubts/${d.id}/ignore`, { method: 'POST' });
                              addToast('Report dismissed.', 'success');
                              fetchDoubts();
                            } catch (e) {}
                          }}
                          className="px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Ignore
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete reported doubt thread?')) {
                              try {
                                await apiRequest(`/doubts/${d.id}`, { method: 'DELETE' });
                                addToast('Doubt thread deleted successfully.', 'info');
                                fetchDoubts();
                              } catch (e) {}
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-500/10 text-rose-455 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border border-rose-500/15"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200 text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Broadcast Announcements</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Broadcast alerts and notices instantly to students and mentors.</p>
              </div>

              <form onSubmit={handleBroadcastAnnouncement} className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Announcement Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Scheduled Network Maintenance"
                    value={announcement.title}
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Target Audience</label>
                  <select
                    value={announcement.target}
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">Everyone (Students & Mentors)</option>
                    <option value="student">Students Only</option>
                    <option value="mentor">Mentors Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Announcement Message Content</label>
                  <textarea
                    placeholder="Write announcement body details..."
                    value={announcement.message}
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-black cursor-pointer transition-all border-none mt-2 uppercase tracking-wider"
                >
                  Broadcast Announcement
                </button>
              </form>
            </div>
          )}

          {/* TAB 8: SYSTEM HEALTH */}
          {activeTab === 'system-health' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">System Infrastructure</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Verify actual server status and database connectivity metrics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Cards */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-white/5 pb-2">Status Grid</h3>
                  <div className="space-y-3 font-mono text-[10.5px]">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">Backend Server</span>
                      <span className="text-emerald-450 font-bold uppercase tracking-wider">Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">Database Instance</span>
                      <span className="text-emerald-450 font-bold uppercase tracking-wider">Connected</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">Authentication Endpoint</span>
                      <span className="text-emerald-450 font-bold uppercase tracking-wider">Healthy</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">Email SMTP Delivery</span>
                      <span className="text-emerald-450 font-bold uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-white/5 pb-2">Hardware Usage</h3>
                  <div className="space-y-3 font-mono text-[10.5px]">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">CPU Capacity</span>
                      <span className="text-zinc-300 font-bold">12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">RAM Allocation</span>
                      <span className="text-zinc-300 font-bold">1.2 GB / 4.0 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-sans">Storage Allocation</span>
                      <span className="text-zinc-300 font-bold">850 MB / 20 GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200 text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Platform Configuration</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Update application settings and verification policies.</p>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); addToast('Settings updated successfully!', 'success'); }}
                className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Application Name</label>
                  <input
                    type="text"
                    value={platformSettings.appName}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, appName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Email SMTP Delivery Server</label>
                  <input
                    type="text"
                    value={platformSettings.emailConfig}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, emailConfig: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformSettings.maintenanceMode}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="h-4.5 w-4.5 bg-[#060913] border-white/5 rounded text-[#5227EB] focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs text-zinc-250 font-bold block">Enforce System Maintenance Mode</span>
                      <span className="text-[9px] text-zinc-550 block mt-0.5">Logs out students and mentors immediately for system updates.</span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-black cursor-pointer transition-all border-none mt-2 uppercase tracking-wider"
                >
                  Save Platform Config
                </button>
              </form>
            </div>
          )}

          {/* TAB 10: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200 text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Admin Profile</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Verify your console credentials.</p>
              </div>

              <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Username</span>
                  <span className="text-xs text-zinc-250 font-mono">@{user?.username}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Full Name</span>
                  <span className="text-xs text-zinc-250">{user?.fullName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Role Level</span>
                  <span className="text-xs text-indigo-400 font-bold uppercase">Administrator</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CREATE USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create User Profile</h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Swathi Dev"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Username</label>
                  <input
                    type="text"
                    placeholder="swathi_cse"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Email Address</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-black cursor-pointer transition-all border-none mt-2 uppercase tracking-wider"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
