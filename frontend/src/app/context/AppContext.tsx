"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../utils/socket';
import { apiRequest } from '../utils/api';

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
  bio?: string;
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
  setUser: (user: User | null) => void;
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

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('studycircle_user', JSON.stringify(newUser));
        localStorage.setItem('auth_session_active', 'true');
      } else {
        localStorage.removeItem('studycircle_user');
        localStorage.setItem('auth_session_active', 'false');
      }
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const data = await apiRequest('/auth/me');
      if (data && data.user) {
        setUser(data.user);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      setUser(null);
      return null;
    }
  };

  const logout = async () => {
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
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('studycircle_user');
        if (stored) {
          try {
            setUserState(JSON.parse(stored));
          } catch (_) {}
        }
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
