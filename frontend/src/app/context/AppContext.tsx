"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../utils/socket';
import { apiRequest } from '../utils/api';
import { googleLogout } from '@react-oauth/google';

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
  socket: Socket | null;
  loading: boolean;
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
      const data = await apiRequest('/auth/me');
      if (data && data.user) {
        const activeToken = data.token || (typeof window !== 'undefined' ? localStorage.getItem('studycircle_token') : null);
        setUser(data.user, activeToken);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (err: any) {
      // Only clear user session if the API explicitly reports 401 Unauthorized or 403 Forbidden
      if (err.status === 401 || err.status === 403) {
        console.warn('[AppContext] User session invalid or expired. Clearing session.');
        setUser(null);
      } else {
        console.error('[AppContext] Failed to refresh user profile (network or server error):', err);
      }
      return null;
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('explicit_logout', 'true');
      }
      googleLogout();
    } catch (googleErr) {
      console.error('Google logout error:', googleErr);
    }
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API request error:', err);
    } finally {
      setUser(null);
      setNotifications([]);
      setMyGroups([]);
      disconnectSocket();
      setSocket(null);
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
        } else if (e.newValue === 'true') {
          // Logged in in another tab
          refreshUser();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
        socket,
        loading,
        refreshUser,
        logout,
        fetchNotifications,
        markAllNotificationsRead,
        markNotificationRead
      }}
    >
      {children}
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
