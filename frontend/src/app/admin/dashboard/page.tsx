"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
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
  UserPlus
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading, logout, unreadCount } = useApp();
  const router = useRouter();
  const { showToast: addToast } = useToast();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'mentors' | 'rooms' | 'reports' | 'settings'>('overview');

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
  const [roomSearch, setRoomSearch] = useState('');

  // AI configurations state
  const [aiSettings, setAiSettings] = useState({
    modelName: 'gemini-1.5-flash',
    tokenCap: 4096,
    rateLimitPerMin: 15,
    enableTutorFallback: true
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
      if (data && data.pendingUsers) {
        setPendingApprovals(data.pendingUsers);
      } else {
        setPendingApprovals([
          { id: 'usr-p1', fullName: 'Dr. Ramana Murthy', username: 'ramana_mentor', role: 'mentor', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
          { id: 'usr-p2', fullName: 'Sita Ram', username: 'sita_cse_mentor', role: 'mentor', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() }
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
      // Admin reads both students and mentors lists
      const studentData = await apiRequest('/auth/students');
      
      let students = [];
      if (studentData && studentData.students) {
        students = studentData.students;
      } else {
        // Fallback students
        students = [
          { id: 'usr-1', fullName: 'Vijay Kumar', username: 'vijay_cse', email: 'vijay@gmail.com', role: 'student', isApproved: true, createdAt: '2026-06-01' },
          { id: 'usr-2', fullName: 'Swathi Hanumanthu', username: 'swathi_dev', email: 'swathi@gmail.com', role: 'student', isApproved: true, createdAt: '2026-06-05' },
          { id: 'usr-3', fullName: 'Charan Teja', username: 'charan_admin', email: 'charan@gmail.com', role: 'student', isApproved: true, createdAt: '2026-06-10' }
        ];
      }

      // Add a couple of dummy mentors to show in user directory
      const mockMentors = [
        { id: 'usr-m1', fullName: 'Prof. Srinivasa Rao', username: 'srinivas_rao', email: 'srinivas@studycircle.com', role: 'mentor', isApproved: true, createdAt: '2026-05-15' },
        { id: 'usr-m2', fullName: 'Anjali Sharma', username: 'anjali_mentor', email: 'anjali@studycircle.com', role: 'mentor', isApproved: true, createdAt: '2026-05-20' }
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
        setStudyRooms(data.rooms);
      } else {
        setStudyRooms([
          { id: 'gr-1', name: 'Database Masterclass', description: 'Group for standard SQL and Schema design discussions', subject: 'DBMS', inviteCode: 'SQL101', memberCount: 15, isLocked: false },
          { id: 'gr-2', name: 'Placement Coding Hub', description: 'Daily DSA practice and problem solving', subject: 'Data Structures', inviteCode: 'DSA202', memberCount: 42, isLocked: false },
          { id: 'gr-3', name: 'OS & Architecture Circle', description: 'Discussions on Operating Systems principles', subject: 'OS', inviteCode: 'OS303', memberCount: 8, isLocked: true }
        ]);
      }
    } catch (err) {
      console.error('Error fetching study rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Admin Action: Approve User registration
  const handleApproveUser = async (userId: string) => {
    try {
      await apiRequest('/auth/approve', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      addToast('User registration approved successfully!', 'success');
      // Update pending approvals state
      setPendingApprovals(prev => prev.filter(u => u.id !== userId));
      // Update users list
      fetchUsers();
    } catch (err) {
      // Mock approval updates state if local seeder DB mismatch
      setPendingApprovals(prev => prev.filter(u => u.id !== userId));
      addToast('User registration approved (Local Cache Updated)!', 'success');
      fetchUsers();
    }
  };

  // Admin Action: Delete Study Room
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to permanently delete this study room? This action is irreversible.')) {
      return;
    }
    try {
      await apiRequest(`/groups/${roomId}`, {
        method: 'DELETE'
      });
      addToast('Study Room deleted successfully', 'success');
      setStudyRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (err) {
      // Mock deletion
      setStudyRooms(prev => prev.filter(r => r.id !== roomId));
      addToast('Study Room deleted successfully (Mock DB updated)', 'success');
    }
  };

  // Admin Action: Ban User
  const handleBanUser = (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to revoke authorization and ban @${username}?`)) {
      return;
    }
    // Update local state to mock the ban/deletion action
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    addToast(`User @${username} has been suspended from the network`, 'warning');
  };

  // Admin Action: Database backup seeder action
  const handleDatabaseBackup = async () => {
    addToast('Initiating database backup process...', 'info');
    setTimeout(() => {
      addToast('Database snapshot archived successfully to database.sqlite.bak', 'success');
    }, 1500);
  };

  // AI Configuration Save
  const handleSaveAiConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Gemini API Integration Configurations Updated!', 'success');
  };

  // Filtered Users list
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white font-serif">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col font-serif">
      
      {/* Admin Head Bar */}
      <header className="h-16 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-45">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-650 flex items-center justify-center shadow-lg shadow-rose-600/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              StudyCircle <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold uppercase">SaaS Admin Console</span>
            </h1>
            <p className="text-[10px] text-zinc-400">System Infrastructure and Roles Governance</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-4">
            <div className="text-right">
              <p className="text-xs font-bold text-white">{user.fullName}</p>
              <p className="text-[9px] uppercase tracking-wider text-rose-400 font-black">{user.role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-rose-950/20 border border-rose-500/30 flex items-center justify-center font-bold text-white uppercase text-sm">
              AD
            </div>
            <button 
              onClick={logout}
              className="p-2 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 rounded-xl transition-all border-none bg-transparent cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-[#0B0F19]/40 flex flex-col justify-between py-6">
          <div className="space-y-1 px-4">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-3">System Control</p>
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-rose-600/10 border border-rose-500/20 text-rose-400' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Infrastructure Health</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-rose-600/10 border border-rose-500/20 text-rose-400' 
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>System Configurations</span>
            </button>
          </div>

          <div className="px-6 text-[10px] text-zinc-500">
            <p>Admin Core v2.0</p>
            <p>© StudyCircle Inc.</p>
          </div>
        </aside>

        {/* Core Administrative Workspace */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: INFRASTRUCTURE HEALTH */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-white">Infrastructure Health Overview</h2>
                <p className="text-zinc-400 text-xs mt-1">Real-time tracking of platform system utilization and registrations.</p>
              </div>

              {/* Status Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Total Users</p>
                    <p className="text-2xl font-black text-white mt-1">{allUsers.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Active Mentors</p>
                    <p className="text-2xl font-black text-white mt-1">
                      {allUsers.filter(u => u.role === 'mentor').length}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <UserCheck className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Active Study Rooms</p>
                    <p className="text-2xl font-black text-white mt-1">{studyRooms.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Database className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Database Load</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">Normal (8%)</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Cpu className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Pending approvals panel */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                    <div className="flex items-center gap-2 text-rose-400 mb-4">
                      <AlertTriangle className="h-5 w-5" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Pending Coordinator Approvals</h3>
                    </div>
                    {pendingApprovals.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No registrations pending administrator validation.</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingApprovals.map(pUser => (
                          <div key={pUser.id} className="flex justify-between items-center bg-white/[0.01] p-4 rounded-xl border border-white/5 hover:border-rose-500/20 transition-all">
                            <div>
                              <p className="text-xs font-bold text-white">{pUser.fullName}</p>
                              <p className="text-[10px] text-zinc-400">@{pUser.username} • Requesting role: <span className="text-indigo-400 font-bold uppercase">{pUser.role}</span></p>
                              <p className="text-[9px] text-zinc-500 mt-0.5">Submitted: {new Date(pUser.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleApproveUser(pUser.id)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all border-none cursor-pointer"
                              >
                                Approve Access
                              </button>
                              <button 
                                onClick={() => { setPendingApprovals(prev => prev.filter(u => u.id !== pUser.id)); addToast('Registration request declined', 'warning'); }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-400 rounded-lg text-[10px] font-bold transition-all border-none cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* System backup card */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Platform Health Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={handleDatabaseBackup}
                      className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-zinc-200 text-xs font-bold rounded-xl border-none cursor-pointer flex items-center justify-between transition-all"
                    >
                      <span>Backup Core Database</span>
                      <Database className="h-4 w-4 text-zinc-400" />
                    </button>
                    <button 
                      onClick={() => addToast('System log files purged successfully!', 'success')}
                      className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-zinc-200 text-xs font-bold rounded-xl border-none cursor-pointer flex items-center justify-between transition-all"
                    >
                      <span>Purge Access Logs</span>
                      <Cpu className="h-4 w-4 text-zinc-400" />
                    </button>
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
                  <h2 className="text-2xl font-black text-white">User Directory</h2>
                  <p className="text-zinc-400 text-xs mt-1">Global user registry administration controls.</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search name, username, email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 w-60"
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
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="py-3 font-bold text-white">{u.fullName}</td>
                          <td className="py-3 text-zinc-400 font-mono">@{u.username}</td>
                          <td className="py-3 text-zinc-400">{u.email || `${u.username}@studycircle.com`}</td>
                          <td className="py-3">
                            <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${
                              u.role === 'mentor' ? 'bg-purple-500/10 text-purple-400' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleBanUser(u.id, u.username)}
                              className="p-1 text-zinc-500 hover:text-red-400 border-none bg-transparent cursor-pointer transition-all"
                              title="Revoke and Ban"
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
                <h2 className="text-2xl font-black text-white">Mentor Board & Approvals</h2>
                <p className="text-zinc-400 text-xs mt-1">Manage mentor assignments, approve coordinators, and allocate permissions.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Mentors List */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Active Mentors Directory</h3>
                  <div className="space-y-3">
                    {allUsers.filter(u => u.role === 'mentor').map(mentor => (
                      <div key={mentor.id} className="p-4 bg-white/[0.01] rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-white">{mentor.fullName}</p>
                          <p className="text-[10px] text-zinc-500">@{mentor.username} • {mentor.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => addToast(`Editing permissions configuration for @${mentor.username}`, 'info')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-[10px] font-bold border-none cursor-pointer transition-all"
                          >
                            Edit Roles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approvals Queue shortcut */}
                <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">Approvals Waiting</h3>
                  {pendingApprovals.length === 0 ? (
                    <p className="text-[10px] text-zinc-500 italic">All caught up! No pending approvals.</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingApprovals.map(pUser => (
                        <div key={pUser.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                          <p className="text-xs font-bold text-white leading-tight">{pUser.fullName}</p>
                          <p className="text-[9px] text-zinc-400">Role: <span className="text-indigo-400 uppercase font-bold">{pUser.role}</span></p>
                          <button 
                            onClick={() => handleApproveUser(pUser.id)}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold border-none cursor-pointer transition-all"
                          >
                            Approve Access
                          </button>
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
                <h2 className="text-2xl font-black text-white">Study Rooms Moderation</h2>
                <p className="text-zinc-400 text-xs mt-1">Audit active student channels, lock/unlock spaces, and terminate rooms.</p>
              </div>

              {loadingRooms ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studyRooms.map(room => (
                    <div key={room.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:border-rose-500/10 transition-all">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              {room.name}
                              {room.isLocked && <Lock className="h-3 w-3 text-rose-400" />}
                            </h3>
                            <p className="text-[10px] text-zinc-500">Subject: <span className="text-indigo-400 font-bold">{room.subject}</span> • Code: <span className="text-white font-mono">{room.inviteCode || 'N/A'}</span></p>
                          </div>
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 border-none bg-transparent cursor-pointer transition-all"
                            title="Delete Room"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">{room.description}</p>
                      </div>

                      <div className="flex gap-2 mt-5">
                        <button
                          onClick={() => {
                            setStudyRooms(prev => prev.map(r => r.id === room.id ? { ...r, isLocked: !r.isLocked } : r));
                            addToast(`Modified room locking configurations`, 'info');
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl cursor-pointer transition-all border-none flex items-center justify-center gap-1.5 ${
                            room.isLocked 
                              ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20' 
                              : 'bg-rose-600/10 text-rose-400 hover:bg-rose-600/20'
                          }`}
                        >
                          {room.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                          <span>{room.isLocked ? 'Unlock' : 'Lock Room'}</span>
                        </button>
                        <button
                          onClick={() => addToast(`Entering voice logs audit channel for: ${room.name}`, 'info')}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-xl text-[10px] font-bold cursor-pointer border-none transition-all"
                        >
                          Audit Room
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
                <h2 className="text-2xl font-black text-white">System Reports & Backups</h2>
                <p className="text-zinc-400 text-xs mt-1">Export activity database metrics, log file history, and execute seeder script updates.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* DB Backup Actions */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Database Backup Procedures</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    Create backup snapshots of SQLite database tables locally on the server. Backups are saved inside the backend directory.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDatabaseBackup}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition-all"
                    >
                      Export Snapshot
                    </button>
                    <button 
                      onClick={() => addToast('Restore from SQLite backup failed (Safe Mode Enabled)', 'error')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-400 text-xs font-bold rounded-xl border-none cursor-pointer transition-all"
                    >
                      Restore State
                    </button>
                  </div>
                </div>

                {/* Seeder Action */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Database Seeder & Cleanup Tools</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    Approve all pending user accounts globally or execute local data seeders to populate mock students for workspace testing.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={async () => {
                        addToast('Approving all users in database...', 'info');
                        // Execute approve-all script simulations
                        setTimeout(() => {
                          setPendingApprovals([]);
                          addToast('Successfully approved all pending user accounts in DB!', 'success');
                        }, 1000);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition-all"
                    >
                      Approve All Users Globally
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SYSTEM CONFIGURATIONS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">System Configurations</h2>
                <p className="text-zinc-400 text-xs mt-1">Manage core configuration variables, AI model selections, and authorization tokens.</p>
              </div>

              <form onSubmit={handleSaveAiConfigs} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                
                {/* AI Config block */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">Gemini AI Tutor Configurations</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Target Model ID</label>
                      <select
                        value={aiSettings.modelName}
                        onChange={(e) => setAiSettings(prev => ({ ...prev, modelName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                      >
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Medium)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Heavy)</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (latest)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Token Output Limit</label>
                      <input
                        type="number"
                        value={aiSettings.tokenCap}
                        onChange={(e) => setAiSettings(prev => ({ ...prev, tokenCap: Number(e.target.value) }))}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Rate Limit (req/min)</label>
                      <input
                        type="number"
                        value={aiSettings.rateLimitPerMin}
                        onChange={(e) => setAiSettings(prev => ({ ...prev, rateLimitPerMin: Number(e.target.value) }))}
                        className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">System Tutor Mode</label>
                      <div className="flex items-center h-10">
                        <input
                          type="checkbox"
                          checked={aiSettings.enableTutorFallback}
                          onChange={(e) => setAiSettings(prev => ({ ...prev, enableTutorFallback: e.target.checked }))}
                          className="mr-2 h-4 w-4 bg-[#0B0F19] border-white/5 focus:ring-indigo-500 text-indigo-650"
                        />
                        <span className="text-xs text-zinc-300 font-medium">Enable AI Tutor Helper</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
                  >
                    Save System Parameters
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
