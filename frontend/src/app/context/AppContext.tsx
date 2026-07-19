"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../utils/socket';
import { apiRequest } from '../utils/api';
import { googleLogout } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: 'student' | 'mentor' | 'admin';
  isApproved: boolean;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  streakCount?: number;
  totalStudyHours?: number;
  learningGoal?: string;
  learningLevel?: 'beginner' | 'intermediate' | 'advanced';
  dailyTarget?: number;
  xp?: number;
  focusCoins?: number;
  level?: number;
  badges?: string;
  bio?: string;
  token?: string;
  dailyMissions?: any;
  dailyMissionDate?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  message: string;
  type: 'doubt' | 'report' | 'system' | 'announcement' | 'session' | 'assignment';
  unread: boolean;
  actionTab?: string;
  groupName?: string;
  createdAt: string;
}

export interface AppContextType {
  user: User | null;
  setUser: (user: User | null, token?: string | null) => void;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  unreadCount: number;
  myGroups: any[];
  setMyGroups: (groups: any[]) => void;
  stats: { 
    streakCount: number; 
    totalStudyHours: number; 
    xp: number; 
    focusCoins: number; 
    level: number; 
    department: string; 
    badges: string; 
  };
  setStats: React.Dispatch<React.SetStateAction<{ 
    streakCount: number; 
    totalStudyHours: number; 
    xp: number; 
    focusCoins: number; 
    level: number; 
    department: string; 
    badges: string; 
  }>>;
  availableGroups: any[];
  setAvailableGroups: React.Dispatch<React.SetStateAction<any[]>>;
  pendingApprovals: any[];
  setPendingApprovals: React.Dispatch<React.SetStateAction<any[]>>;
  studentsList: any[];
  setStudentsList: React.Dispatch<React.SetStateAction<any[]>>;
  notesList: any[];
  setNotesList: React.Dispatch<React.SetStateAction<any[]>>;
  dashboardDataLoaded: boolean;
  setDashboardDataLoaded: (loaded: boolean) => void;
  
  // Tab/Sub-view states
  studySubView: null | 'workspaces' | 'rooms' | 'resources';
  setStudySubView: React.Dispatch<React.SetStateAction<null | 'workspaces' | 'rooms' | 'resources'>>;
  practiceSubView: null | 'questions' | 'mock' | 'review-mistakes';
  setPracticeSubView: React.Dispatch<React.SetStateAction<null | 'questions' | 'mock' | 'review-mistakes'>>;
  progressSubView: null | 'analytics' | 'xp' | 'certificates';
  setProgressSubView: React.Dispatch<React.SetStateAction<null | 'analytics' | 'xp' | 'certificates'>>;
  communitySubView: null | 'forum' | 'leaderboard' | 'chat';
  setCommunitySubView: React.Dispatch<React.SetStateAction<null | 'forum' | 'leaderboard' | 'chat'>>;
  profileSubView: null | 'details' | 'settings';
  setProfileSubView: React.Dispatch<React.SetStateAction<null | 'details' | 'settings'>>;

  // Mentor caching states
  mentorStudents: any[];
  setMentorStudents: React.Dispatch<React.SetStateAction<any[]>>;
  mentorRooms: any[];
  setMentorRooms: React.Dispatch<React.SetStateAction<any[]>>;
  mentorSessions: any[];
  setMentorSessions: React.Dispatch<React.SetStateAction<any[]>>;
  mentorDoubts: any[];
  setMentorDoubts: React.Dispatch<React.SetStateAction<any[]>>;
  mentorAssignments: any[];
  setMentorAssignments: React.Dispatch<React.SetStateAction<any[]>>;
  mentorDataLoaded: boolean;
  setMentorDataLoaded: (loaded: boolean) => void;

  // Admin caching states
  adminUsers: any[];
  setAdminUsers: React.Dispatch<React.SetStateAction<any[]>>;
  adminRooms: any[];
  setAdminRooms: React.Dispatch<React.SetStateAction<any[]>>;
  adminApprovals: any[];
  setAdminApprovals: React.Dispatch<React.SetStateAction<any[]>>;
  adminDataLoaded: boolean;
  setAdminDataLoaded: (loaded: boolean) => void;

  socket: Socket | null;
  loading: boolean;
  isLoggingOut: boolean;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Stats, lists, loaded status
  const [stats, setStats] = useState({ 
    streakCount: 0, 
    totalStudyHours: 0.0, 
    xp: 0, 
    focusCoins: 0, 
    level: 1, 
    department: 'CSE', 
    badges: '[]' 
  });
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false);

  // Tab subviews
  const [studySubView, setStudySubView] = useState<null | 'workspaces' | 'rooms' | 'resources'>(null);
  const [practiceSubView, setPracticeSubView] = useState<null | 'questions' | 'mock' | 'review-mistakes'>(null);
  const [progressSubView, setProgressSubView] = useState<null | 'analytics' | 'xp' | 'certificates'>(null);
  const [communitySubView, setCommunitySubView] = useState<null | 'forum' | 'leaderboard' | 'chat'>(null);
  const [profileSubView, setProfileSubView] = useState<null | 'details' | 'settings'>(null);

  // Mentor data states
  const [mentorStudents, setMentorStudents] = useState<any[]>([]);
  const [mentorRooms, setMentorRooms] = useState<any[]>([]);
  const [mentorSessions, setMentorSessions] = useState<any[]>([]);
  const [mentorDoubts, setMentorDoubts] = useState<any[]>([]);
  const [mentorAssignments, setMentorAssignments] = useState<any[]>([]);
  const [mentorDataLoaded, setMentorDataLoaded] = useState(false);

  // Admin data states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminRooms, setAdminRooms] = useState<any[]>([]);
  const [adminApprovals, setAdminApprovals] = useState<any[]>([]);
  const [adminDataLoaded, setAdminDataLoaded] = useState(false);

  const router = useRouter();

  // Prefetch navigation routes immediately after login
  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === 'student') {
        router.prefetch('/student/dashboard');
        router.prefetch('/student/study');
        router.prefetch('/student/practice');
        router.prefetch('/student/progress');
        router.prefetch('/student/community');
        router.prefetch('/student/profile');
      } else if (role === 'mentor') {
        router.prefetch('/mentor/dashboard');
        router.prefetch('/mentor/student-roster');
        router.prefetch('/mentor/study-rooms');
        router.prefetch('/mentor/mentoring-sessions');
        router.prefetch('/mentor/cohort-analytics');
        router.prefetch('/mentor/profile');
      } else if (role === 'admin') {
        router.prefetch('/admin/dashboard');
        router.prefetch('/admin/users');
        router.prefetch('/admin/mentors');
        router.prefetch('/admin/study-rooms');
        router.prefetch('/admin/system-health');
        router.prefetch('/admin/settings');
      }
    }
  }, [user, router]);

  // Preload commonly used assets
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const assets = [
        '/bhagya-avatar.png',
        '/charan-avatar.png',
        '/karthik-avatar.png',
        '/rathna-avatar.png',
        '/swathi-avatar.png',
        '/students-studying.png',
        '/welcome.png'
      ];
      assets.forEach(src => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, [user]);

  const setUser = (newUser: User | null, token?: string | null) => {
    setUserState(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('studycircle_user', JSON.stringify(newUser));
        localStorage.setItem('auth_session_active', 'true');
        if (token) {
          localStorage.setItem('studycircle_token', token);
        } else if (newUser.token) {
          localStorage.setItem('studycircle_token', newUser.token);
        }
      } else {
        localStorage.removeItem('studycircle_user');
        localStorage.removeItem('studycircle_token');
        localStorage.setItem('auth_session_active', 'false');
      }
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const data = await apiRequest('/auth/me?_ts=' + Date.now());
      if (data && data.user) {
        const activeToken = data.token || (typeof window !== 'undefined' ? localStorage.getItem('studycircle_token') : null);
        setUser(data.user, activeToken);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (err: any) {
      if (err.status === 401 || err.status === 403 || err.status === 404) {
        console.warn('[AppContext] User session invalid or database reset. Checking for local self-healing credentials...');
        if (typeof window !== 'undefined') {
          const payloadStr = localStorage.getItem('studycircle_register_payload');
          if (payloadStr) {
            try {
              const payload = JSON.parse(payloadStr);
              console.log('[AppContext] Auto-registering user in background to heal session...');
              const regData = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload)
              });
              if (regData && regData.user) {
                setUser(regData.user, regData.token);
                console.log('[AppContext] Self-healing restoration successful!');
                return regData.user;
              }
            } catch (regErr) {
              console.error('[AppContext] Background auto-registration restore failed:', regErr);
            }
          }
        }
        console.warn('[AppContext] User session invalid or expired. Clearing session.');
        setUser(null);
      } else {
        console.error('[AppContext] Failed to refresh user profile (network or server error):', err);
      }
      return null;
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Call backend logout API
      await apiRequest('/auth/logout', { method: 'POST' });

      // 2. Clear all authentication storage state on success
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('explicit_logout', 'true');
        localStorage.removeItem('studycircle_user');
        localStorage.removeItem('studycircle_token');
        localStorage.removeItem('studycircle_register_payload');
        localStorage.removeItem('saved_login_user');
        localStorage.removeItem('saved_login_pass');
        localStorage.setItem('auth_session_active', 'false');
        sessionStorage.removeItem('auth_session_active');
      }

      try {
        googleLogout();
      } catch (googleErr) {
        console.error('Google logout error:', googleErr);
      }

      // 3. Clear memory and context variables
      setUser(null);
      setNotifications([]);
      setMyGroups([]);
      disconnectSocket();
      setSocket(null);

      // Show success toast via window event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show_toast', {
          detail: { message: '✅ Logged out successfully.', type: 'success' }
        }));
      }
    } catch (err: any) {
      console.error('Logout API request error:', err);
      // Show error toast via window event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show_toast', {
          detail: { message: '❌ Unable to logout. Please try again.', type: 'error' }
        }));
      }
      throw err;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest('/notifications');
      if (data && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiRequest('/notifications/mark-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  // 1. Initial restoration
  useEffect(() => {
    const initialize = async () => {
      let hasStoredUser = false;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('studycircle_user');
        if (stored) {
          try {
            setUserState(JSON.parse(stored));
            hasStoredUser = true;
          } catch (_) {}
        }
      }
      
      // If we have a cached user, resolve the loading spinner immediately
      // so the dashboard renders instantly without waiting for the network check.
      if (hasStoredUser) {
        setLoading(false);
      }
      
      await refreshUser();
      setLoading(false);
    };
    initialize();
  }, []);

  // 2. Fetch notifications and manage socket connection when user logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      const sk = getSocket();
      if (!sk.connected) {
        sk.connect();
      }
      
      sk.emit('join-user', { userId: user.id });
      setSocket(sk);

      const handleNewNotification = (notif: NotificationItem) => {
        setNotifications(prev => [notif, ...prev]);
        
        // Show browser notification if permitted
        if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
          new window.Notification("StudyCircle Support", {
            body: notif.message,
            icon: '/icon.svg'
          });
        }
      };

      sk.on('new-notification', handleNewNotification);

      return () => {
        sk.off('new-notification', handleNewNotification);
      };
    } else {
      setSocket(null);
      disconnectSocket();
    }
  }, [user]);

  // Request browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (window.Notification.permission === 'default') {
        window.Notification.requestPermission();
      }
    }
  }, []);

  // 3. Cross-tab synchronization via storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session_active') {
        if (e.newValue === 'false') {
          // Logged out in another tab
          setUserState(null);
          setNotifications([]);
          setMyGroups([]);
          disconnectSocket();
          setSocket(null);
          // Redirect immediately to clear all memory
          window.location.replace('/?login=true');
        } else if (e.newValue === 'true') {
          // Logged in in another tab
          refreshUser();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 4. Listen for API 401 session expiration events
  useEffect(() => {
    const handleSessionExpired = () => {
      setUserState(null);
      setNotifications([]);
      setMyGroups([]);
      disconnectSocket();
      setSocket(null);
    };
    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => window.removeEventListener('auth_session_expired', handleSessionExpired);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        notifications,
        setNotifications,
        unreadCount,
        myGroups,
        setMyGroups,
        stats,
        setStats,
        availableGroups,
        setAvailableGroups,
        pendingApprovals,
        setPendingApprovals,
        studentsList,
        setStudentsList,
        notesList,
        setNotesList,
        dashboardDataLoaded,
        setDashboardDataLoaded,
        studySubView,
        setStudySubView,
        practiceSubView,
        setPracticeSubView,
        progressSubView,
        setProgressSubView,
        communitySubView,
        setCommunitySubView,
        profileSubView,
        setProfileSubView,
        mentorStudents,
        setMentorStudents,
        mentorRooms,
        setMentorRooms,
        mentorSessions,
        setMentorSessions,
        mentorDoubts,
        setMentorDoubts,
        mentorAssignments,
        setMentorAssignments,
        mentorDataLoaded,
        setMentorDataLoaded,
        adminUsers,
        setAdminUsers,
        adminRooms,
        setAdminRooms,
        adminApprovals,
        setAdminApprovals,
        adminDataLoaded,
        setAdminDataLoaded,
        socket,
        loading,
        isLoggingOut,
        refreshUser,
        logout,
        fetchNotifications,
        markAllNotificationsRead,
        markNotificationRead
      }}
    >
      {children}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md pointer-events-auto">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#0F111A]/90 border border-white/5 shadow-2xl">
            <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-sm font-bold text-white tracking-wider">Logging out...</p>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
