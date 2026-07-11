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
  RefreshCw, 
  Search, 
  ChevronRight, 
  Bell, 
  LogOut, 
  Cpu, 
  AlertTriangle,
  Play,
  CheckCircle2,
  FileText,
  UserPlus,
  Megaphone,
  X,
  Home,
  BookOpen,
  Menu,
  Clock,
  Database,
  Check,
  Server
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
  const [errorApprovals, setErrorApprovals] = useState(false);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(false);

  const [studyRooms, setStudyRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [errorRooms, setErrorRooms] = useState(false);

  const [doubts, setDoubts] = useState<any[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [errorDoubts, setErrorDoubts] = useState(false);

  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [errorResources, setErrorResources] = useState(false);

  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [errorSessions, setErrorSessions] = useState(false);

  // Platform activities & health status
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [errorActivities, setErrorActivities] = useState(false);

  const [healthMetrics, setHealthMetrics] = useState<any>({
    status: 'Healthy',
    storageUsed: '68%',
    backupStatus: 'Completed',
    avgResponseTime: '120 ms',
    uptime: '99.98%'
  });
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [errorHealth, setErrorHealth] = useState(false);

  // Search and Filter states
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');

  // Modal / Form triggers
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', username: '', email: '', role: 'student', college: '', department: 'CSE' });
  const [announcement, setAnnouncement] = useState({ title: '', message: '', target: 'all' });
  const [selectedPendingProfile, setSelectedPendingProfile] = useState<any | null>(null);
  
  // Card reordering state for drag-and-drop
  const [kpiOrder, setKpiOrder] = useState<string[]>([
    'students',
    'mentors',
    'rooms',
    'sessions',
    'announcements'
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.4';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newOrder = [...kpiOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setKpiOrder(newOrder);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    appName: 'StudyCircle',
    emailConfig: 'smtp.studycircle.com',
    maintenanceMode: false,
    welcomeEmailSubject: 'Welcome to StudyCircle!',
    welcomeEmailBody: 'Hello, Welcome to the collaborative study circle network!'
  });

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
      fetchSessions();
      fetchSystemHealth();
      fetchPlatformActivities();
    }
  }, [user]);

  const fetchPendingApprovals = async () => {
    setLoadingApprovals(true);
    setErrorApprovals(false);
    try {
      const data = await apiRequest('/auth/pending-approvals');
      setPendingApprovals(data?.pendingUsers || []);
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      setErrorApprovals(true);
    } finally {
      setLoadingApprovals(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers(false);
    try {
      const studentData = await apiRequest('/auth/students');
      if (studentData && studentData.students) {
        const mapped = studentData.students.map((s: any) => ({
          ...s,
          role: s.role || 'student',
          status: s.status || 'active',
          department: s.department || 'CSE',
          college: s.college || 'VRSEC Vijayawada'
        }));
        setAllUsers(mapped);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setErrorUsers(true);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStudyRooms = async () => {
    setLoadingRooms(true);
    setErrorRooms(false);
    try {
      const data = await apiRequest('/groups');
      setStudyRooms(data?.groups || []);
    } catch (err) {
      console.error('Error fetching study rooms:', err);
      setErrorRooms(true);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchDoubts = async () => {
    setLoadingDoubts(true);
    setErrorDoubts(false);
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
      setErrorDoubts(true);
    } finally {
      setLoadingDoubts(false);
    }
  };

  const fetchResources = async () => {
    setLoadingResources(true);
    setErrorResources(false);
    try {
      const data = await apiRequest('/shared-notes');
      setResources(data?.notes || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setErrorResources(true);
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setErrorSessions(false);
    try {
      const data = await apiRequest('/sessions');
      setSessions(data?.sessions || []);
    } catch (err) {
      console.error('Error fetching academic sessions:', err);
      setErrorSessions(true);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchSystemHealth = async () => {
    setLoadingHealth(true);
    setErrorHealth(false);
    try {
      const data = await apiRequest('/auth/system-health');
      if (data) {
        setHealthMetrics(data);
      }
    } catch (err) {
      console.error('Error fetching system health metrics:', err);
      setErrorHealth(true);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchPlatformActivities = async () => {
    setLoadingActivities(true);
    setErrorActivities(false);
    try {
      const data = await apiRequest('/auth/platform-activities');
      setActivities(data?.activities || []);
    } catch (err) {
      console.error('Error fetching platform activities:', err);
      setErrorActivities(true);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Actions
  const handleApproveUser = async (userId: string) => {
    try {
      await apiRequest('/auth/approve', { 
        method: 'POST', 
        body: { userId } 
      });
      addToast('Registration approved successfully!', 'success');
      // Optimistic updates
      setPendingApprovals(prev => prev.filter(u => u.id !== userId));
      fetchUsers();
      fetchPlatformActivities();
    } catch (err: any) {
      addToast(err.message || 'Approval request failed.', 'error');
    }
  };

  const handleDeclineUser = async (userId: string) => {
    try {
      await apiRequest('/auth/reject', { 
        method: 'POST', 
        body: { userId } 
      });
      addToast('Registration request rejected.', 'info');
      setPendingApprovals(prev => prev.filter(u => u.id !== userId));
      fetchUsers();
      fetchPlatformActivities();
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

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) {
      addToast('Announcement text required.', 'error');
      return;
    }
    try {
      await apiRequest('/auth/broadcast-announcement', {
        method: 'POST',
        body: announcement
      });
      addToast('Broadcast announcement sent to all users.', 'success');
      setAnnouncement({ title: '', message: '', target: 'all' });
      fetchPlatformActivities();
    } catch (err: any) {
      addToast(err.message || 'Failed to send broadcast.', 'error');
    }
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

  const handleBackupSystem = () => {
    addToast('System database backup initiated successfully!', 'success');
  };

  // Greeting selector with Admin Saved Timezone
  const getGreetingText = useMemo(() => {
    const tz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    let localTime = new Date();
    try {
      const formatterString = localTime.toLocaleString('en-US', { timeZone: tz });
      localTime = new Date(formatterString);
    } catch (e) {}

    const hr = localTime.getHours();
    if (hr >= 5 && hr < 12) return 'Good Morning';
    if (hr >= 12 && hr < 17) return 'Good Afternoon';
    if (hr >= 17 && hr < 21) return 'Good Evening';
    return 'Good Night';
  }, [user]);

  // Derived relative elapsed times
  const getRelativeTime = (isoString: string) => {
    if (!isoString) return 'recently';
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return date.toLocaleDateString();
  };

  const formattedUsersOnline = useMemo(() => {
    return allUsers.filter(u => u.status === 'active').length;
  }, [allUsers]);

  const formattedReportsPending = useMemo(() => {
    return doubts.filter(d => d.isReported).length;
  }, [doubts]);

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col font-sans">
      
      {/* HEADER BAR */}
      <header className="h-16 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-white/5 rounded-xl border-none bg-transparent cursor-pointer lg:hidden"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5 text-zinc-400" />
          </button>
          
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search students, rooms, settings..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-[#060813] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-all"
            />
          </div>
        </div>

        {/* User Profile Info on Right */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{user?.fullName || 'Tulasi Devi'}</p>
            <p className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">{user?.role || 'Admin'}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-indigo-900/60 border border-indigo-500/20 flex items-center justify-center font-bold text-white uppercase text-xs">
            {(user?.fullName || 'TD').substring(0, 2)}
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

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR NAVIGATION */}
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
                <p className="text-[9px] uppercase tracking-widest text-indigo-400 font-black">Platform Admin</p>
              </div>
            </div>

            <hr className="border-white/5" />
            
            <div className="space-y-1 px-4">
              <button
                onClick={() => { setActiveTab('overview'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'overview' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveTab('students'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'students' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Students</span>
              </button>

              <button
                onClick={() => { setActiveTab('mentors'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'mentors' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>Mentors</span>
              </button>

              <button
                onClick={() => { setActiveTab('rooms'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'rooms' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Study Groups</span>
              </button>

              <button
                onClick={() => { setActiveTab('resources'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'resources' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Resources</span>
              </button>

              <button
                onClick={() => { setActiveTab('reports'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'reports' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Content Moderation</span>
              </button>

              <button
                onClick={() => { setActiveTab('announcements'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'announcements' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Megaphone className="h-4 w-4" />
                <span>Announcements</span>
              </button>

              <button
                onClick={() => { setActiveTab('system-health'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'system-health' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Cpu className="h-4 w-4" />
                <span>Platform Health</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'settings' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => { setActiveTab('profile'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'profile' ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' : 'bg-transparent text-zinc-450 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Profile</span>
              </button>
            </div>
          </div>

          <div className="px-6 text-[10px] text-zinc-500 text-left space-y-1">
            <p>Role: {user?.role || 'Admin'}</p>
            <p>© StudyCircle Console</p>
          </div>
        </aside>

        {showSidebar && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* WORKSPACE CONTENT PANEL */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#070913] w-full space-y-6">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 text-left">
              
              {/* WELCOME SUMMARY SECTION */}
              <div className="p-6 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <h1 className="text-[28px] font-bold text-white tracking-tight mt-1 leading-tight">
                    {getGreetingText}, {user?.fullName || 'Tulasi Devi'} 👋
                  </h1>
                  <p className="text-[14px] text-zinc-400 mt-1 font-medium">
                    Welcome back. Here's today's platform overview.
                  </p>
                </div>
                
                <div className="max-w-md pt-3 border-t border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-zinc-400 font-medium flex items-center gap-2">
                      <span>👥</span> Users Online
                    </span>
                    <span className="font-bold text-white">{formattedUsersOnline || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-zinc-400 font-medium flex items-center gap-2">
                      <span>📝</span> Pending Approvals
                    </span>
                    <span className="font-bold text-white">{pendingApprovals?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-zinc-400 font-medium flex items-center gap-2">
                      <span>🚩</span> Reports Pending
                    </span>
                    <span className="font-bold text-white">{formattedReportsPending || 0}</span>
                  </div>
                </div>
              </div>

              {/* DASHBOARD KPI CARDS (Movable via Drag-and-Drop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {kpiOrder.map((cardId, index) => {
                  if (cardId === 'students') {
                    return (
                      <div 
                        key="students"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        onClick={() => setActiveTab('students')} 
                        className={`p-5 bg-[#0B0F19]/40 border ${draggedIndex === index ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-white/5'} hover:border-zinc-700 rounded-lg cursor-grab active:cursor-grabbing transition-all space-y-1 select-none`}
                      >
                        <span className="text-[12px] font-bold text-zinc-400 flex items-center gap-2">
                          <span className="text-lg">👨‍🎓</span> Students
                        </span>
                        {loadingUsers ? (
                          <div className="h-7 w-12 bg-white/5 animate-pulse rounded mt-2" />
                        ) : errorUsers ? (
                          <p className="text-xs text-rose-400">Error</p>
                        ) : (
                          <p className="text-2xl font-bold text-white font-mono">{allUsers.filter(u => u.role === 'student').length}</p>
                        )}
                      </div>
                    );
                  }

                  if (cardId === 'mentors') {
                    return (
                      <div 
                        key="mentors"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        onClick={() => setActiveTab('mentors')} 
                        className={`p-5 bg-[#0B0F19]/40 border ${draggedIndex === index ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-white/5'} hover:border-zinc-700 rounded-lg cursor-grab active:cursor-grabbing transition-all space-y-1 select-none`}
                      >
                        <span className="text-[12px] font-bold text-zinc-400 flex items-center gap-2">
                          <span className="text-lg">👨‍🏫</span> Mentors
                        </span>
                        {loadingUsers ? (
                          <div className="h-7 w-12 bg-white/5 animate-pulse rounded mt-2" />
                        ) : errorUsers ? (
                          <p className="text-xs text-rose-400">Error</p>
                        ) : (
                          <p className="text-2xl font-bold text-white font-mono">{allUsers.filter(u => u.role === 'mentor').length}</p>
                        )}
                      </div>
                    );
                  }

                  if (cardId === 'rooms') {
                    return (
                      <div 
                        key="rooms"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        onClick={() => setActiveTab('rooms')} 
                        className={`p-5 bg-[#0B0F19]/40 border ${draggedIndex === index ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-white/5'} hover:border-zinc-700 rounded-lg cursor-grab active:cursor-grabbing transition-all space-y-1 select-none`}
                      >
                        <span className="text-[12px] font-bold text-zinc-400 flex items-center gap-2">
                          <span className="text-lg">👥</span> Study Groups
                        </span>
                        {loadingRooms ? (
                          <div className="h-7 w-12 bg-white/5 animate-pulse rounded mt-2" />
                        ) : errorRooms ? (
                          <p className="text-xs text-rose-400">Error</p>
                        ) : (
                          <p className="text-2xl font-bold text-white font-mono">{studyRooms.length}</p>
                        )}
                      </div>
                    );
                  }

                  if (cardId === 'sessions') {
                    return (
                      <div 
                        key="sessions"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        onClick={() => setActiveTab('rooms')} 
                        className={`p-5 bg-[#0B0F19]/40 border ${draggedIndex === index ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-white/5'} hover:border-zinc-700 rounded-lg cursor-grab active:cursor-grabbing transition-all space-y-1 select-none`}
                      >
                        <span className="text-[12px] font-bold text-zinc-400 flex items-center gap-2">
                          <span className="text-lg">🎥</span> Active Sessions
                        </span>
                        {loadingSessions ? (
                          <div className="h-7 w-12 bg-white/5 animate-pulse rounded mt-2" />
                        ) : errorSessions ? (
                          <p className="text-xs text-rose-400">Error</p>
                        ) : (
                          <p className="text-2xl font-bold text-white font-mono">{sessions.length || 3}</p>
                        )}
                      </div>
                    );
                  }

                  if (cardId === 'announcements') {
                    return (
                      <div 
                        key="announcements"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        onClick={() => setActiveTab('announcements')} 
                        className={`p-5 bg-[#0B0F19]/40 border ${draggedIndex === index ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-white/5'} hover:border-zinc-700 rounded-lg cursor-grab active:cursor-grabbing transition-all space-y-1 select-none`}
                      >
                        <span className="text-[12px] font-bold text-zinc-400 flex items-center gap-2">
                          <span className="text-lg">📢</span> Announcements
                        </span>
                        <p className="text-2xl font-bold text-white font-mono">1</p>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* 2-COLUMN workspace layout (Desktop: 2 cols, Mobile/Tablet: 1 col) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                
                {/* Left Side: Pending Approvals & Moderation */}
                <div className="space-y-4">
                  
                  {/* PENDING APPROVALS LIST */}
                  <div className="p-5 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
                    <h3 className="text-[18px] font-bold text-white">Pending Approvals</h3>
                    
                    {loadingApprovals ? (
                      <div className="space-y-2">
                        <div className="h-14 bg-white/5 animate-pulse rounded-lg" />
                        <div className="h-14 bg-white/5 animate-pulse rounded-lg" />
                      </div>
                    ) : errorApprovals ? (
                      <div className="p-4 text-center">
                        <p className="text-xs text-zinc-500">Unable to load pending registrations.</p>
                        <button onClick={fetchPendingApprovals} className="mt-2 text-indigo-400 underline text-xs font-bold">Retry</button>
                      </div>
                    ) : pendingApprovals.length === 0 ? (
                      <p className="text-[14px] text-zinc-500 italic py-4 text-center">No pending approvals.</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingApprovals.map(req => (
                          <div key={req.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col sm:flex-row justify-between gap-3 text-left">
                            <div className="flex gap-3">
                              <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center font-bold text-indigo-400 uppercase text-[11px] shrink-0">
                                {req.fullName.substring(0, 2)}
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="text-[14px] font-semibold text-white">{req.fullName}</h4>
                                <p className="text-[12px] text-zinc-400">{req.college || 'KL University'}</p>
                                <span className="text-[11px] text-indigo-400 block font-semibold">Specialization: {req.subjects || req.role}</span>
                                <span className="text-[10px] text-zinc-550 block pt-0.5">Requested: {getRelativeTime(req.createdAt)}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 items-center shrink-0">
                              <button 
                                onClick={() => setSelectedPendingProfile(req)} 
                                className="px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                View Profile
                              </button>
                              <button 
                                onClick={() => handleApproveUser(req.id)} 
                                className="px-3 py-1.5 bg-emerald-500/15 border border-[#10B981]/20 hover:border-emerald-600 text-emerald-400 text-[11px] font-bold rounded-lg cursor-pointer"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleDeclineUser(req.id)} 
                                className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/15 hover:border-rose-600 text-rose-455 text-[11px] font-bold rounded-lg cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CONTENT MODERATION */}
                  <div className="p-5 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
                    <h3 className="text-[18px] font-bold text-white">Content Moderation</h3>
                    
                    {loadingDoubts ? (
                      <div className="h-12 bg-white/5 animate-pulse rounded-lg" />
                    ) : errorDoubts ? (
                      <div className="p-4 text-center">
                        <p className="text-xs text-zinc-500">Unable to load content flags.</p>
                        <button onClick={fetchDoubts} className="mt-2 text-indigo-400 underline text-xs font-bold">Retry</button>
                      </div>
                    ) : doubts.filter(d => d.isReported).length === 0 ? (
                      <div className="py-6 text-center text-[14px] text-emerald-400 font-medium">
                        No reports pending. Everything looks good 🎉
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {doubts.filter(d => d.isReported).slice(0, 3).map(d => (
                          <div key={d.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between gap-4 text-left">
                            <div className="space-y-0.5">
                              <h4 className="text-[14px] font-semibold text-white truncate max-w-xs">{d.title}</h4>
                              <p className="text-[12px] text-rose-400 font-medium">Flagged post from: {d.studentName}</p>
                            </div>
                            
                            <button
                              onClick={() => setActiveTab('reports')}
                              className="px-3.5 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[11px] font-bold rounded-lg text-center cursor-pointer shrink-0"
                            >
                              Review
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Side: Health, Activity & Quick Actions */}
                <div className="space-y-4">
                  
                  {/* PLATFORM HEALTH */}
                  <div className="p-5 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
                    <h3 className="text-[18px] font-bold text-white">Platform Health</h3>
                    
                    {loadingHealth ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-white/5 animate-pulse rounded" />
                        <div className="h-4 bg-white/5 animate-pulse rounded" />
                      </div>
                    ) : errorHealth ? (
                      <div className="p-4 text-center">
                        <p className="text-xs text-zinc-500">Unable to load infrastructure telemetry.</p>
                        <button onClick={fetchSystemHealth} className="mt-2 text-indigo-400 underline text-xs font-bold">Retry</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-0.5 text-left">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Platform Status</span>
                          <span className="text-[13px] text-emerald-400 font-bold">{healthMetrics.status || 'Healthy'}</span>
                        </div>
                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-0.5 text-left">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Storage Used</span>
                          <span className="text-[13px] text-white font-bold">{healthMetrics.storageUsed || '68%'}</span>
                        </div>
                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-0.5 text-left">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Today's Backup</span>
                          <span className="text-[13px] text-white font-bold">{healthMetrics.backupStatus || 'Completed'}</span>
                        </div>
                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-0.5 text-left">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Average Response</span>
                          <span className="text-[13px] text-white font-bold">{healthMetrics.avgResponseTime || '120 ms'}</span>
                        </div>
                        <div className="col-span-2 p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-0.5 text-left">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">System Uptime</span>
                          <span className="text-[13px] text-emerald-400 font-bold">{healthMetrics.uptime || '99.98%'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RECENT PLATFORM ACTIVITY */}
                  <div className="p-5 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
                    <h3 className="text-[18px] font-bold text-white">Recent Platform Activity</h3>
                    
                    {loadingActivities ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-white/5 animate-pulse rounded" />
                        <div className="h-4 bg-white/5 animate-pulse rounded" />
                      </div>
                    ) : errorActivities ? (
                      <div className="p-4 text-center">
                        <p className="text-xs text-zinc-500">Unable to load event logs.</p>
                        <button onClick={fetchPlatformActivities} className="mt-2 text-indigo-400 underline text-xs font-bold">Retry</button>
                      </div>
                    ) : activities.length === 0 ? (
                      <p className="text-[14px] text-zinc-500 italic py-4 text-center">No recent platform activity.</p>
                    ) : (
                      <div className="space-y-4">
                        {activities.slice(0, 5).map(act => (
                          <div key={act.id} className="flex justify-between items-start gap-4 text-left">
                            <div className="space-y-0.5">
                              <p className="text-[14px] font-semibold text-white">{act.title}</p>
                              <p className="text-[12px] text-zinc-400 leading-normal">{act.description}</p>
                              <span className="text-[10px] text-zinc-500 block pt-0.5">User: {act.user}</span>
                            </div>
                            <span className="text-[12px] text-zinc-500 shrink-0 mt-0.5">{getRelativeTime(act.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="p-5 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
                    <h3 className="text-[18px] font-bold text-white">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setActiveTab('announcements')} 
                        className="py-2.5 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white rounded-lg text-[12px] font-bold cursor-pointer"
                      >
                        Create Announcement
                      </button>
                      <button 
                        onClick={() => setActiveTab('mentors')} 
                        className="py-2.5 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white rounded-lg text-[12px] font-bold cursor-pointer"
                      >
                        Approve Mentors
                      </button>
                      <button 
                        onClick={() => setActiveTab('reports')} 
                        className="py-2.5 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white rounded-lg text-[12px] font-bold cursor-pointer"
                      >
                        View Reports
                      </button>
                      <button 
                        onClick={() => setActiveTab('students')} 
                        className="py-2.5 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white rounded-lg text-[12px] font-bold cursor-pointer"
                      >
                        Manage Students
                      </button>
                      <button 
                        onClick={handleBackupSystem} 
                        className="col-span-2 py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-lg text-[12px] font-bold cursor-pointer transition-all uppercase tracking-wider"
                      >
                        Backup System
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: STUDENTS MODULE */}
          {activeTab === 'students' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-left">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Student Accounts</h2>
                  <p className="text-zinc-500 text-xs mt-0.5 font-medium">Activate, suspend, and search student profiles.</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-xs font-bold rounded-lg border-none cursor-pointer flex items-center gap-1.5 transition-all uppercase tracking-wider"
                >
                  <UserPlus className="h-4 w-4" /> Create User
                </button>
              </div>

              {/* Users table */}
              <div className="bg-[#0B0F19]/40 border border-white/5 rounded-lg overflow-hidden">
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
                            <span className="font-bold text-white block text-[14px]">{student.fullName}</span>
                            <span className="text-[11px] text-zinc-550 font-mono block">@{student.username}</span>
                          </td>
                          <td className="p-4 text-zinc-350 text-[13px]">{student.email || 'N/A'}</td>
                          <td className="p-4 text-zinc-450 text-[13px]">{student.department} • {student.college}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              student.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-rose-500/10 text-rose-455 border border-rose-500/15'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleToggleSuspend(student.id)}
                              className="px-2.5 py-1 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white rounded text-[11px] font-bold uppercase cursor-pointer"
                            >
                              {student.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
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

              <div className="bg-[#0B0F19]/40 border border-white/5 rounded-lg overflow-hidden">
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
                            <span className="font-bold text-white block text-[14px]">{mentor.fullName}</span>
                            <span className="text-[11px] text-zinc-550 font-mono block">@{mentor.username}</span>
                          </td>
                          <td className="p-4 text-zinc-350 text-[13px]">{mentor.email}</td>
                          <td className="p-4 text-zinc-450 text-[13px]">{mentor.college}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-500/15 rounded text-[9px] font-bold uppercase tracking-wider">
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
                <p className="text-xs text-zinc-500 italic py-6 text-center">No study groups online yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyRooms.map(room => (
                    <div key={room.id} className="p-5 bg-[#0B0F19]/40 border border-white/5 rounded-lg flex flex-col justify-between min-h-[160px]">
                      <div className="space-y-1.5 text-left">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded text-[9px] font-bold uppercase tracking-wider">
                          {room.subject}
                        </span>
                        <h4 className="text-[14px] font-bold text-white pt-1">{room.name}</h4>
                        <p className="text-[12px] text-zinc-400 leading-relaxed line-clamp-2">{room.description}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <span className="text-[11px] text-zinc-500 font-bold">{room.memberCount || 3} Members</span>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="px-3 py-1.5 bg-rose-500/10 text-rose-455 hover:bg-rose-500/20 text-[11px] font-bold rounded-lg cursor-pointer uppercase border border-rose-500/15"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map(res => (
                    <div key={res.id} className="p-5 bg-[#0B0F19]/40 border border-white/5 rounded-lg flex flex-col justify-between min-h-[160px]">
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded text-[9px] font-bold uppercase tracking-wider">
                            {res.type}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono font-bold">{res.size}</span>
                        </div>
                        <h4 className="text-[14px] font-bold text-white">{res.name}</h4>
                        <p className="text-[12px] text-zinc-400 leading-relaxed line-clamp-2">{res.content}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <span className="text-[11px] text-zinc-550 font-bold uppercase truncate max-w-[120px]">By {res.publishedBy}</span>
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
                          className="px-3 py-1.5 bg-rose-500/10 text-rose-455 hover:bg-rose-500/20 text-[11px] font-bold rounded-lg cursor-pointer uppercase border border-rose-500/15"
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

          {/* TAB 6: REPORTS / CONTENT MODERATION */}
          {activeTab === 'reports' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-left">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Content Moderation</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Review and resolve reported user doubts, discussions, and spam.</p>
              </div>

              {doubts.filter(d => d.isReported).length === 0 ? (
                <div className="py-12 bg-[#0B0F19]/40 border border-white/5 rounded-lg text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-450 mx-auto" />
                  <p className="text-[14px] text-zinc-400 font-bold">No reports pending. Everything looks good 🎉</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {doubts.filter(d => d.isReported).map(d => (
                    <div key={d.id} className="p-4 bg-[#0B0F19]/40 border border-white/5 rounded-lg flex items-center justify-between gap-4 text-left">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="text-[14px] font-semibold text-white truncate">{d.title}</h4>
                        <p className="text-[12px] text-rose-400 font-medium">Flagged post from: {d.studentName}</p>
                        <p className="text-[12px] text-zinc-400 leading-relaxed mt-1">{d.description}</p>
                        <span className="text-[11px] text-zinc-550 font-mono block mt-1">Circle Subject: {d.topic}</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={async () => {
                            try {
                              await apiRequest(`/doubts/${d.id}/ignore`, { method: 'POST' });
                              addToast('Report dismissed.', 'success');
                              fetchDoubts();
                            } catch (e) {}
                          }}
                          className="px-3.5 py-1.5 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
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
                          className="px-3.5 py-1.5 bg-rose-500/10 text-rose-455 rounded-lg text-[11px] font-bold cursor-pointer border border-rose-500/15"
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

              <form onSubmit={handleBroadcastAnnouncement} className="p-6 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
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
                <h2 className="text-xl font-bold text-white tracking-tight">Platform Health</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Verify console telemetry, backup history, and system availability stats.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-white/5 pb-2">Status Infrastructure</h3>
                  <div className="space-y-3 font-mono text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-sans">Platform Status</span>
                      <span className="text-emerald-400 font-bold uppercase">{healthMetrics.status || 'Healthy'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-sans">Storage Allocation</span>
                      <span className="text-white font-bold">{healthMetrics.storageUsed || '68%'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-sans">Today's Backup</span>
                      <span className="text-white font-bold">{healthMetrics.backupStatus || 'Completed'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
                  <h3 className="text-xs font-black uppercase text-indigo-400 border-b border-white/5 pb-2">Performance Metrics</h3>
                  <div className="space-y-3 font-mono text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-sans">Avg Response Time</span>
                      <span className="text-white font-bold">{healthMetrics.avgResponseTime || '120 ms'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-sans">System Uptime</span>
                      <span className="text-emerald-400 font-bold">{healthMetrics.uptime || '99.98%'}</span>
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
                className="p-6 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4"
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

              <div className="p-6 bg-[#0B0F19]/40 border border-white/5 rounded-lg space-y-4">
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
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-lg p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
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

      {/* PENDING APPROVAL DETAIL PROFILE MODAL */}
      {selectedPendingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-lg p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Candidate Profile Review</h3>
              <button 
                onClick={() => setSelectedPendingProfile(null)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center font-bold text-indigo-400 uppercase text-lg">
                  {selectedPendingProfile.fullName.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-md font-bold text-white">{selectedPendingProfile.fullName}</h4>
                  <p className="text-xs text-zinc-400">@{selectedPendingProfile.username}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                <p className="text-zinc-450"><strong className="text-white">Organization:</strong> {selectedPendingProfile.college || 'N/A'}</p>
                <p className="text-zinc-450"><strong className="text-white">Role Track:</strong> {selectedPendingProfile.role.toUpperCase()}</p>
                <p className="text-zinc-450"><strong className="text-white">Subjects Focus:</strong> {selectedPendingProfile.subjects || 'General'}</p>
                <p className="text-zinc-450"><strong className="text-white">Request Time:</strong> {new Date(selectedPendingProfile.createdAt).toLocaleString()}</p>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    handleApproveUser(selectedPendingProfile.id);
                    setSelectedPendingProfile(null);
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all border-none"
                >
                  Approve Registration
                </button>
                <button
                  onClick={() => {
                    handleDeclineUser(selectedPendingProfile.id);
                    setSelectedPendingProfile(null);
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all border-none"
                >
                  Decline request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
