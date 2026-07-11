"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
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
  ChevronDown,
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
  UserCheck,
  Menu,
  Eye,
  Edit3,
  Home,
  User,
  Pin
} from 'lucide-react';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export function MentorDashboardComponent() {
  const { user, loading, logout, setUser } = useApp();
  const router = useRouter();
  const { showToast: addToast } = useToast();

  const pathname = usePathname();

  // Derive activeTab directly from the pathname
  const activeTab = useMemo(() => {
    if (!pathname) return 'dashboard';
    const segments = pathname.split('/');
    const currentRole = segments[1];
    const currentTab = segments[2];

    if (currentRole === 'mentor') {
      const tabMapRev: Record<string, string> = {
        'dashboard': 'dashboard',
        'student-roster': 'students',
        'study-rooms': 'rooms',
        'mentoring-sessions': 'sessions',
        'assignments': 'assignments',
        'cohort-analytics': 'analytics',
        'discussions': 'discussions',
        'profile': 'profile',
        'resources': 'resources',
        'messages': 'messages',
        'notifications': 'notifications'
      };
      return (tabMapRev[currentTab] || 'dashboard') as any;
    }
    return 'dashboard';
  }, [pathname]);

  // Set active tab by updating the browser URL
  const setActiveTab = (newTab: string) => {
    const mentorTabMap: Record<string, string> = {
      'dashboard': 'dashboard',
      'students': 'student-roster',
      'rooms': 'study-rooms',
      'sessions': 'mentoring-sessions',
      'assignments': 'assignments',
      'analytics': 'cohort-analytics',
      'discussions': 'discussions',
      'profile': 'profile',
      'resources': 'resources',
      'messages': 'messages',
      'notifications': 'notifications'
    };
    const expectedRoute = mentorTabMap[newTab] || newTab;
    router.push(`/mentor/${expectedRoute}`);
  };
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddGoalInput, setShowAddGoalInput] = useState(false);

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

  // Discussion Board States
  const [selectedDoubt, setSelectedDoubt] = useState<any | null>(null);
  const [doubtAnswers, setDoubtAnswers] = useState<any[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [searchDoubtQuery, setSearchDoubtQuery] = useState('');

  // Student Details Modal State
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);

  // Room Members State
  const [roomParticipants, setRoomParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participantsRoomName, setParticipantsRoomName] = useState('');

  // Edit / Delete Room States
  const [showEditRoom, setShowEditRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [showDeleteRoom, setShowDeleteRoom] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<any | null>(null);

  // Derived real database metrics
  const todaysSessionsCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.scheduledAt && s.scheduledAt.startsWith(todayStr)).length;
  }, [sessions]);

  const pendingAssignmentsCount = useMemo(() => {
    const now = new Date();
    return assignments.filter(a => a.deadline && new Date(a.deadline) > now).length;
  }, [assignments]);

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
  const [mentorActivities, setMentorActivities] = useState<any[]>([]);

  // Form Inputs
  const [newRoom, setNewRoom] = useState({ name: '', description: '', subject: '', isPublic: true });
  const [newSession, setNewSession] = useState({ groupId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60, meetingLink: '' });
  const [newAssignment, setNewAssignment] = useState({ title: '', subject: 'Data Structures', deadline: '', totalAssigned: 42 });
  const [announcementText, setAnnouncementText] = useState('');
  const [challengeData, setChallengeData] = useState({ title: '', text: '', dueDate: '', priority: 'Medium', xpReward: 50, coinReward: 20 });
  
  // Messaging Drawer State
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatStudent, setChatStudent] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  
  // Selected student for quick actions
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Resources, Notifications & Full Messages states
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [showCreateResource, setShowCreateResource] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', type: 'PDF', content: '', size: '' });
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Global Search state (Searches Students, Rooms, Sessions)
  const [globalSearch, setGlobalSearch] = useState('');

  // Assignment Toolbar and Modal States
  const [searchAssignment, setSearchAssignment] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [showEditAssignment, setShowEditAssignment] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<any | null>(null);

  // Profile Settings
  const [mentorAvailability, setMentorAvailability] = useState<'online' | 'busy' | 'away' | 'vacation'>('online');
  const [mentorSubjects, setMentorSubjects] = useState<string[]>(['Data Structures', 'DBMS']);
  const [teachingSchedule, setTeachingSchedule] = useState({
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
  });
  const [alertPreferences, setAlertPreferences] = useState({
    email: true, app: true, sms: false
  });

  // Profile settings redesigned states
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCollege, setProfileCollege] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileAvailability, setProfileAvailability] = useState('Available');
  const [profileExpertise, setProfileExpertise] = useState<string[]>([]);
  const [showExpertiseDropdown, setShowExpertiseDropdown] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfileEmail(user.email || (user.phoneOrEmail && user.phoneOrEmail.includes('@') ? user.phoneOrEmail : ''));
      setProfilePhone(user.phone || (user.phoneOrEmail && !user.phoneOrEmail.includes('@') ? user.phoneOrEmail : ''));
      setProfileCollege(user.college || '');
      setProfileBio(user.bio || '');
      setProfileAvatar(user.avatarUrl || '');
      setProfileAvailability(user.availability || 'Available');
      
      let parsedExpertise: string[] = [];
      try {
        if (user.expertise) {
          parsedExpertise = typeof user.expertise === 'string' ? JSON.parse(user.expertise) : user.expertise;
        }
      } catch (e) {
        if (typeof user.expertise === 'string') {
          parsedExpertise = user.expertise.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      setProfileExpertise(parsedExpertise);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setProfileAvatar(base64);
          addToast('Photo uploaded successfully.', 'success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfileAvatar('');
    addToast('Photo removed.', 'info');
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim() || profileName.trim().length < 3) {
      addToast('Full Name must be at least 3 characters.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileEmail.trim() || !emailRegex.test(profileEmail.trim())) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    if (!profilePhone.trim() || !/^[0-9]{10}$/.test(profilePhone.trim())) {
      addToast('Phone number must contain exactly 10 digits.', 'error');
      return;
    }
    if (profileBio && profileBio.length > 150) {
      addToast('Bio cannot exceed 150 characters.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const response = await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: profileName.trim(),
          email: profileEmail.trim(),
          phone: profilePhone.trim(),
          college: profileCollege.trim(),
          bio: profileBio.trim(),
          expertise: profileExpertise,
          availability: profileAvailability,
          profileImage: profileAvatar
        })
      });

      if (response && response.user) {
        setUser(response.user);
        addToast('✅ Profile updated successfully.', 'success');
        setIsEditingProfile(false);
        // Refresh local dashboard data
        fetchStudyRooms();
        fetchSessions();
        fetchDoubts();
        fetchNotifications();
      } else {
        addToast(response?.error || 'Unable to update profile.', 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Unable to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('All password fields are required.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response && !response.error) {
        addToast('✅ Password changed successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
      } else {
        addToast(response?.error || 'Failed to change password.', 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Error updating password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

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

  // Load live data from database on mount
  useEffect(() => {
    if (user && (user.role === 'mentor' || user.role === 'admin')) {
      fetchStudents();
      fetchStudyRooms();
      fetchSessions();
      fetchDoubts();
      fetchAssignments();
      fetchResources();
      fetchNotifications();
      fetchRecentActivity();
    }
  }, [user]);

  // Load messaging history when selected student changes
  useEffect(() => {
    if (chatStudent) {
      const key = `sc_chat_${chatStudent.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setChatMessages(JSON.parse(saved));
        } catch (e) {
          setChatMessages([]);
        }
      } else {
        setChatMessages([]);
      }
    }
  }, [chatStudent]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const data = await apiRequest('/auth/students');
      if (data && data.students) {
        const mapped = data.students.map((s: any) => ({
          id: s.id,
          fullName: s.fullName || 'Student',
          username: s.username || 'student',
          email: s.email || '',
          phone: s.phone || '',
          streakCount: s.streakCount || 0,
          totalStudyHours: s.totalStudyHours || 0.0,
          xp: s.xp || 0,
          focusCoins: s.focusCoins || 0,
          level: s.level || 1,
          department: s.department || 'CSE',
          college: s.department === 'CSE' ? 'Aditya College of Engineering' : 'Aditya Engineering College',
          weakTopics: s.learningGoal === 'DBMS' ? 'Normalization, Joins' : 'Trees, Graph Traversals',
          learningPath: s.learningLevel ? s.learningLevel.charAt(0).toUpperCase() + s.learningLevel.slice(1) : 'Beginner',
          lastActive: s.lastStudyDate ? `Studied on ${s.lastStudyDate}` : 'No activity logged',
          completionRate: Math.min(100, Math.round(((s.totalStudyHours || 0.0) / 20) * 100)),
          attendanceRate: s.totalStudyHours > 0 ? Math.min(100, Math.round(70 + (s.streakCount * 3) + (s.xp % 11))) : 0
        }));
        setStudents(mapped);
        
        // Initialize attendance checklist mapping
        const records: Record<string, boolean> = {};
        mapped.forEach((st: any) => {
          records[st.id] = true;
        });
        setAttendanceRecords(records);
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
      const data = await apiRequest('/groups');
      if (data && data.groups) {
        setStudyRooms(data.groups.map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description || '',
          subject: g.subject || 'General',
          inviteCode: g.inviteCode || 'INV123',
          memberCount: g.memberCount || 0,
          isLocked: !g.isPublic,
          activeStudents: g.memberCount || 0,
          mentorAssigned: user?.fullName || 'Mentor',
          pendingDoubts: g.pendingDoubts || 0,
          focusTopic: g.subject || 'General Study'
        })));
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
      const data = await apiRequest('/sessions');
      if (data && data.sessions) {
        setSessions(data.sessions.map((se: any) => ({
          id: se.id,
          title: se.title,
          description: se.description || '',
          scheduledAt: se.scheduledAt,
          durationMinutes: se.durationMinutes || 60,
          meetingLink: se.meetingLink || '',
          groupName: se.Group?.name || 'Study Circle',
          groupId: se.groupId,
          registered: se.registered || 0,
          joined: se.joined || 0,
          attendanceRate: se.attendanceRate || 0
        })));
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchDoubts = async () => {
    setLoadingDoubts(true);
    try {
      const data = await apiRequest('/doubts');
      if (data && data.doubts) {
        setDoubts(data.doubts.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description || '',
          upvotes: d.upvotes || 0,
          isSolved: d.isSolved,
          isPinned: d.isPinned || false,
          isClosed: d.isClosed || false,
          studentName: d.Author?.fullName || 'Student',
          topic: d.tags || d.subject || 'General',
          groupName: d.Group?.name || 'Study Circle',
          waitingTime: d.createdAt ? `${Math.round((Date.now() - new Date(d.createdAt).getTime()) / 60000)}m ago` : '1h ago'
        })));
      }
    } catch (err) {
      console.error('Error fetching doubts:', err);
    } finally {
      setLoadingDoubts(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const data = await apiRequest('/assignments');
      if (data && data.assignments) {
        setAssignments(data.assignments);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
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

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await apiRequest('/notifications');
      if (data && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const [loadingActivities, setLoadingActivities] = useState(false);

  const fetchRecentActivity = async () => {
    setLoadingActivities(true);
    try {
      const data = await apiRequest('/auth/recent-activity');
      if (data && data.activities) {
        setMentorActivities(data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const getRelativeTimeString = (dateInput: string | Date) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHr < 24) {
      return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    } else if (diffDay === 1) {
      return 'Yesterday';
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getNextSessionForGroup = (groupId: string) => {
    const now = new Date();
    const groupSessions = sessions.filter(s => s.groupId === groupId && s.scheduledAt && new Date(s.scheduledAt) > now);
    if (groupSessions.length === 0) return 'No upcoming sessions';
    groupSessions.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    const targetDate = new Date(groupSessions[0].scheduledAt);
    return targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + targetDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Custom API clear doubt/room handlers
  const handleSelectDoubt = async (doubtId: string) => {
    const doubt = doubts.find(d => d.id === doubtId);
    if (!doubt) return;
    setSelectedDoubt(doubt);
    setLoadingAnswers(true);
    try {
      const data = await apiRequest(`/doubts/${doubtId}`);
      if (data && data.answers) {
        setDoubtAnswers(data.answers);
      }
    } catch (err) {
      console.error('Error fetching doubt answers:', err);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoubt || !replyText.trim()) return;
    try {
      const data = await apiRequest(`/doubts/${selectedDoubt.id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ content: replyText.trim() })
      });
      if (data && data.answer) {
        setDoubtAnswers(prev => [...prev, data.answer]);
        setReplyText('');
        addToast('Reply posted successfully!', 'success');
        fetchRecentActivity();
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to post reply.', 'error');
    }
  };

  const handleTogglePin = async () => {
    if (!selectedDoubt) return;
    try {
      const data = await apiRequest(`/doubts/${selectedDoubt.id}/pin`, {
        method: 'PUT'
      });
      if (data && data.doubt) {
        setDoubts(prev => prev.map(d => d.id === selectedDoubt.id ? { ...d, isPinned: data.doubt.isPinned } : d));
        setSelectedDoubt(prev => prev ? { ...prev, isPinned: data.doubt.isPinned } : null);
        addToast(data.message || 'Updated pin status', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update pin status.', 'error');
    }
  };

  const handleToggleClose = async () => {
    if (!selectedDoubt) return;
    try {
      const data = await apiRequest(`/doubts/${selectedDoubt.id}/close`, {
        method: 'PUT'
      });
      if (data && data.doubt) {
        setDoubts(prev => prev.map(d => d.id === selectedDoubt.id ? { ...d, isClosed: data.doubt.isClosed } : d));
        setSelectedDoubt(prev => prev ? { ...prev, isClosed: data.doubt.isClosed } : null);
        addToast(data.message || 'Updated close status', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update close status.', 'error');
    }
  };

  const handleToggleSolve = async () => {
    if (!selectedDoubt) return;
    try {
      const data = await apiRequest(`/doubts/${selectedDoubt.id}/solve`, {
        method: 'PUT'
      });
      if (data && data.doubt) {
        setDoubts(prev => prev.map(d => d.id === selectedDoubt.id ? { ...d, isSolved: data.doubt.isSolved } : d));
        setSelectedDoubt(prev => prev ? { ...prev, isSolved: data.doubt.isSolved } : null);
        addToast(data.message || 'Updated solved status', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update solved status.', 'error');
    }
  };

  const handleViewRoomMembers = async (roomId: string, roomName: string) => {
    setLoadingParticipants(true);
    setParticipantsRoomName(roomName);
    setShowParticipantsModal(true);
    try {
      const data = await apiRequest(`/groups/${roomId}/members`);
      if (data && data.members) {
        setRoomParticipants(data.members);
      }
    } catch (err) {
      console.error('Error fetching room members:', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleEditRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name.trim()) return;
    try {
      await apiRequest(`/groups/${editingRoom.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingRoom.name,
          description: editingRoom.description,
          subject: editingRoom.subject,
          isPublic: editingRoom.isPublic
        })
      });
      addToast('Study room updated successfully!', 'success');
      setShowEditRoom(false);
      fetchStudyRooms();
    } catch (err: any) {
      addToast(err.message || 'Failed to update room.', 'error');
    }
  };

  const handleDeleteRoomSubmit = async () => {
    if (!deletingRoom) return;
    try {
      await apiRequest(`/groups/${deletingRoom.id}`, {
        method: 'DELETE'
      });
      addToast('Study room deleted successfully!', 'success');
      setShowDeleteRoom(false);
      fetchStudyRooms();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete room.', 'error');
    }
  };

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

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.title || !newSession.scheduledAt || !newSession.groupId) {
      addToast('Session Title, Date, and Target Group are required', 'error');
      return;
    }
    try {
      const data = await apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          groupId: newSession.groupId,
          title: newSession.title,
          description: newSession.description,
          scheduledAt: newSession.scheduledAt,
          durationMinutes: Number(newSession.durationMinutes),
          meetingLink: newSession.meetingLink
        })
      });
      addToast(data.message || 'Mentoring session scheduled successfully!', 'success');
      setNewSession({ groupId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60, meetingLink: '' });
      setShowCreateSession(false);
      fetchSessions();
      fetchRecentActivity();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to schedule session', 'error');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.deadline) {
      addToast('Assignment Title and Deadline are required', 'error');
      return;
    }
    try {
      const data = await apiRequest('/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: newAssignment.title,
          subject: newAssignment.subject,
          deadline: newAssignment.deadline,
          totalAssigned: newAssignment.totalAssigned,
          details: 'Solve assignment questions'
        })
      });
      if (data && data.assignment) {
        setAssignments(prev => [data.assignment, ...prev]);
        addToast(`Assignment published!`, 'success');
        fetchRecentActivity();
      }
      setNewAssignment({ title: '', subject: 'Data Structures', deadline: '', totalAssigned: 42 });
      setShowCreateAssignment(false);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to publish assignment', 'error');
    }
  };

  const handleEditAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment.title || !editingAssignment.deadline) {
      addToast('Assignment Title and Deadline are required', 'error');
      return;
    }
    try {
      const data = await apiRequest(`/assignments/${editingAssignment.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editingAssignment.title,
          subject: editingAssignment.subject,
          deadline: editingAssignment.deadline,
          totalAssigned: editingAssignment.totalAssigned,
          status: editingAssignment.status,
          details: editingAssignment.details
        })
      });
      if (data && data.assignment) {
        setAssignments(prev => prev.map(asg => asg.id === editingAssignment.id ? data.assignment : asg));
        addToast('Assignment updated successfully!', 'success');
      }
      setShowEditAssignment(false);
      setEditingAssignment(null);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to update assignment', 'error');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await apiRequest(`/assignments/${id}`, { method: 'DELETE' });
        setAssignments(prev => prev.filter(asg => asg.id !== id));
        addToast('Assignment deleted successfully', 'info');
      } catch (err: any) {
        console.error(err);
        addToast(err.message || 'Failed to delete assignment', 'error');
      }
    }
  };

  const getMentorGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Good Morning';
    if (hr >= 12 && hr < 17) return 'Good Afternoon';
    if (hr >= 17 && hr < 21) return 'Good Evening';
    return 'Good Night';
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !chatStudent) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'mentor',
      text: typedMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    localStorage.setItem(`sc_chat_${chatStudent.id}`, JSON.stringify(updated));
    setTypedMessage('');
  };

  const handleAssignChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !challengeData.title || !challengeData.text) {
      addToast('Task Title and Instruction/Description are required', 'error');
      return;
    }
    try {
      const data = await apiRequest('/auth/assign-challenge', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent.id,
          title: challengeData.title,
          description: challengeData.text,
          dueDate: challengeData.dueDate,
          priority: challengeData.priority,
          xpReward: challengeData.xpReward,
          coinReward: challengeData.coinReward
        })
      });
      addToast(data.message || 'Task assigned successfully.', 'success');
      setShowAssignChallenge(false);
      setChallengeData({ title: '', text: '', dueDate: '', priority: 'Medium', xpReward: 50, coinReward: 20 });
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to assign task.', 'error');
    }
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

  // Assignments filters
  const filteredAssignments = assignments.filter(asg => {
    const matchesSearch = asg.title.toLowerCase().includes(searchAssignment.toLowerCase());
    const matchesCourse = filterCourse === 'All' || asg.subject === filterCourse;
    const matchesStatus = filterStatus === 'All' || asg.status === filterStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Calculate struggling students
  const strugglingStudents = useMemo(() => {
    return students.filter(s => {
      const lowAttendance = s.attendanceRate > 0 && s.attendanceRate < 75;
      const noActivity = s.lastActive === 'No activity logged' || s.totalStudyHours === 0;
      const weakPerformance = s.streakCount <= 1 && s.totalStudyHours < 5;
      return lowAttendance || noActivity || weakPerformance;
    }).map(s => {
      let reason = 'Requires consistency check';
      if (s.attendanceRate > 0 && s.attendanceRate < 75) {
        reason = `Low attendance (${s.attendanceRate}%)`;
      } else if (s.totalStudyHours === 0) {
        reason = 'No active study logged';
      } else if (s.streakCount <= 1) {
        reason = 'Losing study streak';
      }
      return {
        ...s,
        attentionReason: reason
      };
    });
  }, [students]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-white">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-zinc-100 flex flex-col font-sans">
      
      {/* Top Banner Control Bar (Header) */}
      <header className="h-16 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 gap-4">
        
        <div className="flex items-center gap-3">
          {/* Hamburger menu button for mobile */}
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-white/5 rounded-xl transition-all border-none bg-transparent cursor-pointer lg:hidden"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5 text-zinc-450" />
          </button>

          {/* Minimal Global Search bar */}
          <div className="relative w-48 sm:w-64 md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search students, rooms, topics..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-[#060813] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-all"
            />
          </div>
        </div>

        {/* View mode toggle switcher (Desktop View - Hidden on Mobile) */}
        <div className="hidden md:flex bg-[#060813] border border-white/5 rounded-xl p-0.5 select-none shrink-0">
          <button
            onClick={() => setViewMode('new')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none ${
              viewMode === 'new' 
                ? 'bg-indigo-650 text-white' 
                : 'bg-transparent text-zinc-450 hover:text-zinc-200'
            }`}
          >
            New User (Zero State)
          </button>
          <button
            onClick={() => setViewMode('existing')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none ${
              viewMode === 'existing' 
                ? 'bg-indigo-650 text-white' 
                : 'bg-transparent text-zinc-450 hover:text-zinc-200'
            }`}
          >
            Existing Self (Active Cohort)
          </button>
        </div>

        {/* User Profile Widget */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all select-none"
            title="View Profile Settings"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{user.fullName}</p>
              <p className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">{user.role}</p>
            </div>
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                className="h-9 w-9 rounded-full object-cover border border-indigo-500/20" 
                alt="Avatar" 
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-indigo-900/60 border border-indigo-500/20 flex items-center justify-center font-bold text-white uppercase text-xs">
                {user.fullName.substring(0, 2)}
              </div>
            )}
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
        
        {/* Sidebar Navigation (With responsive fixed/relative sliding transition drawer) */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-[#0B0F19] lg:bg-[#0B0F19]/40 flex flex-col justify-between py-6 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="space-y-6">
            
            {/* Non-clickable Brand Header */}
            <div className="px-6 flex items-center gap-2.5 select-none">
              <div className="h-8.5 w-8.5 rounded-xl bg-indigo-650 flex items-center justify-center">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">StudyCircle</h1>
                <p className="text-[9px] uppercase tracking-widest text-indigo-400 font-black">Mentor Hub</p>
              </div>
            </div>

            <hr className="border-white/5" />
            <div className="space-y-1 px-4">
              <button
                onClick={() => { setActiveTab('dashboard'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>🏠 Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveTab('students'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'students' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>👨‍🎓 Students</span>
              </button>

              <button
                onClick={() => { setActiveTab('rooms'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'rooms' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4 text-emerald-450" />
                <span>👥 Study Groups</span>
              </button>

              <button
                onClick={() => { setActiveTab('sessions'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'sessions' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>📅 Study Sessions</span>
              </button>

              <button
                onClick={() => { setActiveTab('assignments'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'assignments' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <FileText className="h-4 w-4 text-amber-500" />
                <span>📝 Assignments</span>
              </button>

              <button
                onClick={() => { setActiveTab('discussions'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'discussions' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span>💬 Discussion Board</span>
              </button>

              <button
                onClick={() => { setActiveTab('resources'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'resources' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <BookOpen className="h-4 w-4 text-sky-400" />
                <span>📚 Resources</span>
              </button>

              <button
                onClick={() => { setActiveTab('messages'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'messages' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <MessageSquare className="h-4 w-4 text-purple-400" />
                <span>✉️ Messages</span>
              </button>

              <button
                onClick={() => { setActiveTab('notifications'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'notifications' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span>🔔 Notifications</span>
              </button>

              <button
                onClick={() => { setActiveTab('profile'); setShowSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                  activeTab === 'profile' 
                    ? 'bg-indigo-650/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <User className="h-4 w-4" />
                <span>👤 Profile</span>
              </button>
            </div>
          </div>

          <div className="px-6 space-y-3">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  className="h-8 w-8 rounded-full object-cover border border-white/10" 
                  alt="Avatar" 
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                  {user.fullName.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                <p className="text-[9px] text-zinc-400 truncate">{user.role}</p>
              </div>
            </div>
            <div className="text-[10px] text-zinc-500 space-y-1">
              <p>Logged in as: {user.username}</p>
              <p>© StudyCircle</p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Backdrop Overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Core Workspace Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#070913] w-full">
          
          {/* Mobile View Mode switcher */}
          <div className="flex justify-center md:hidden mb-6">
            <div className="flex bg-[#060813] border border-white/5 rounded-xl p-0.5 select-none">
              <button
                onClick={() => setViewMode('new')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none ${
                  viewMode === 'new' 
                    ? 'bg-indigo-650 text-white' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Zero State
              </button>
              <button
                onClick={() => setViewMode('existing')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none ${
                  viewMode === 'existing' 
                    ? 'bg-indigo-650 text-white' 
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Active Cohort
              </button>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="max-w-[1200px] mx-auto space-y-6">
              
              {/* HERO SECTION */}
              <div className="p-5 bg-[#0B0F19]/40 border border-white/5 rounded-lg text-left space-y-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <h1 className="text-[28px] font-bold text-white tracking-tight mt-1 leading-tight">
                    {getMentorGreeting()}, {user?.fullName || 'User'} 👋
                  </h1>
                  <p className="text-[14px] text-zinc-400 mt-1 font-medium">
                    Welcome back. Here's what's waiting for you today.
                  </p>
                </div>
                <div className="max-w-md space-y-2.5 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-zinc-400 font-medium">Live Sessions</span>
                    <span className="font-bold text-white">{todaysSessionsCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-zinc-400 font-medium">Pending Doubts</span>
                    <span className="font-bold text-white">{doubts.filter(d => !d.isSolved).length}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-zinc-400 font-medium">Students Needing Attention</span>
                    <span className="font-bold text-white">{strugglingStudents.length}</span>
                  </div>
                </div>
              </div>

              {/* Responsive Split Workspace (Desktop 2 Columns, Mobile/Tablet Single Column) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start text-left">
                
                {/* Left Column */}
                <div className="space-y-4">
                  
                  {/* Today's Schedule */}
                  <div className="p-5 rounded-lg bg-[#0B0F19]/40 border border-white/5 space-y-4">
                    <h3 className="text-[18px] font-bold text-white">
                      Today's Schedule
                    </h3>
                    {sessions.filter(s => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      return s.scheduledAt && s.scheduledAt.startsWith(todayStr);
                    }).length === 0 ? (
                      <div className="py-6 text-center space-y-3">
                        <p className="text-[14px] text-zinc-400">No sessions scheduled today.</p>
                        <button
                          onClick={() => setShowCreateSession(true)}
                          className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[12px] font-bold rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                        >
                          Schedule Session
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sessions.filter(s => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          return s.scheduledAt && s.scheduledAt.startsWith(todayStr);
                        }).map(sess => (
                          <div key={sess.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                              <h4 className="text-[14px] font-semibold text-white">{sess.title}</h4>
                              <p className="text-[12px] text-indigo-400">
                                {new Date(sess.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <span className="text-[11px] text-zinc-500 block">Circle: {sess.groupName}</span>
                            </div>
                            {sess.meetingLink && (
                              <a 
                                href={sess.meetingLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-3.5 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[11px] font-bold rounded-lg text-center"
                              >
                                Join
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assigned Study Groups */}
                  <div className="p-5 rounded-lg bg-[#0B0F19]/40 border border-white/5 space-y-4">
                    <h3 className="text-[18px] font-bold text-white">
                      Assigned Study Groups
                    </h3>
                    {studyRooms.length === 0 ? (
                      <div className="py-6 text-center space-y-3">
                        <p className="text-[14px] text-zinc-400">No study groups assigned.</p>
                        <button
                          onClick={() => setActiveTab('rooms')}
                          className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[12px] font-bold rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                        >
                          Browse Groups
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studyRooms.map(group => (
                          <div key={group.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-2 text-left flex flex-col justify-between">
                            <div>
                              <h4 className="text-[14px] font-semibold text-white">{group.name}</h4>
                              <p className="text-[12px] text-zinc-450">{group.memberCount} Students</p>
                            </div>
                            <div className="pt-2 border-t border-white/5 flex justify-between items-center mt-2">
                              <div className="space-y-0.5">
                                <span className="text-[10px] uppercase text-zinc-500 block">Next Session</span>
                                <span className="text-[12px] text-indigo-400 font-semibold">{getNextSessionForGroup(group.id)}</span>
                              </div>
                              <button
                                onClick={() => setActiveTab('rooms')}
                                className="px-3 py-1 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  
                  {/* Students Needing Attention */}
                  <div className="p-5 rounded-lg bg-[#0B0F19]/40 border border-white/5 space-y-4">
                    <h3 className="text-[18px] font-bold text-white">
                      Students Needing Attention
                    </h3>
                    {strugglingStudents.length === 0 ? (
                      <div className="py-6 text-center">
                        <p className="text-[14px] text-zinc-400 font-semibold text-[#10B981]">Great!</p>
                        <p className="text-[12px] text-zinc-500 mt-1">No students currently require attention.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {strugglingStudents.map(s => (
                          <div key={s.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-3">
                            <div className="space-y-1">
                              <h4 className="text-[14px] font-semibold text-white">{s.fullName}</h4>
                              <p className="text-[12px] text-zinc-400">{s.college}</p>
                              <p className="text-[12px] text-rose-400 font-medium">Reason: {s.attentionReason}</p>
                              <p className="text-[11px] text-zinc-500">Last Active: {s.lastActive}</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => { setChatStudent(s); setShowChatDrawer(true); }}
                                className="px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                Message
                              </button>
                              <button
                                onClick={() => {
                                  setNewSession(prev => ({ ...prev, groupId: studyRooms[0]?.id || '' }));
                                  setShowCreateSession(true);
                                }}
                                className="px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-zinc-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                Schedule Session
                              </button>
                              <button
                                onClick={() => setSelectedStudentDetail(s)}
                                className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                View Progress
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className="p-5 rounded-lg bg-[#0B0F19]/40 border border-white/5 space-y-4">
                    <h3 className="text-[18px] font-bold text-white">
                      Recent Activity
                    </h3>
                    {mentorActivities.length === 0 ? (
                      <div className="py-6 text-center space-y-1">
                        <p className="text-[14px] text-zinc-450 italic">No recent activity yet.</p>
                        <p className="text-[12px] text-zinc-500">Start mentoring students to see your activity history.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {mentorActivities.slice(0, 5).map((act, i) => (
                          <div key={i} className="flex justify-between items-start gap-4">
                            <div className="space-y-0.5">
                              <p className="text-[14px] font-semibold text-white">{act.title}</p>
                              <p className="text-[12px] text-zinc-400 leading-normal">{act.description}</p>
                            </div>
                            <span className="text-[12px] text-zinc-500 shrink-0 mt-0.5">{getRelativeTimeString(act.createdAt)}</span>
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
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Comprehensive cohort list.</p>
              </div>

              {loadingStudents ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : students.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-4">No students have registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStudents.map(student => (
                    <div 
                      key={student.id} 
                      onClick={() => setSelectedStudentDetail(student)}
                      className="p-5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between gap-4 cursor-pointer hover:bg-white/[0.03] hover:border-white/10 transition-all text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xs font-bold text-white">{student.fullName}</h3>
                            <p className="text-[10px] text-zinc-500 font-mono">@{student.username} • {student.college}</p>
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
                          onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setShowAssignChallenge(true); }}
                          className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer border-none transition-all"
                        >
                          Assign Task
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setChatStudent(student); setShowChatDrawer(true); }}
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
                  <p className="text-zinc-500 text-xs mt-0.5 font-medium">Coordinate dynamic rooms.</p>
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

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => toggleRoomLock(room.id)}
                          className={`flex-1 min-w-[70px] py-1.5 text-[9px] font-bold rounded-lg cursor-pointer transition-all border-none flex items-center justify-center gap-1 ${
                            room.isLocked 
                              ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20' 
                              : 'bg-red-600/10 text-red-400 hover:bg-red-600/20'
                          }`}
                        >
                          {room.isLocked ? 'Unlock' : 'Lock'}
                        </button>
                        <button
                          onClick={() => { setEditingRoom(room); setShowEditRoom(true); }}
                          className="flex-1 min-w-[50px] py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-[9px] font-bold cursor-pointer border-none transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setDeletingRoom(room); setShowDeleteRoom(true); }}
                          className="flex-1 min-w-[50px] py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg text-[9px] font-bold cursor-pointer border-none transition-all"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(room.inviteCode);
                            addToast('Invite code copied to clipboard!', 'success');
                          }}
                          className="flex-1 min-w-[80px] py-1.5 bg-[#0B0F19] hover:bg-white/5 border border-white/5 text-zinc-300 rounded-lg text-[9px] font-bold cursor-pointer transition-all"
                        >
                          Share Code
                        </button>
                        <button
                          onClick={() => {
                            window.open(room.meetingLink || 'https://meet.google.com/new', '_blank');
                          }}
                          className="flex-1 min-w-[80px] py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold cursor-pointer transition-all border-none"
                        >
                          Start Live
                        </button>
                        <button
                          onClick={() => handleViewRoomMembers(room.id, room.name)}
                          className="flex-1 min-w-[90px] py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-[9px] font-bold cursor-pointer border-none transition-all"
                        >
                          Participants
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
                  <p className="text-zinc-500 text-xs mt-0.5 font-medium">Schedule and host lectures.</p>
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
                          <span className="text-[10px] text-zinc-500 font-bold font-mono">
                            {new Date(session.scheduledAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-normal font-medium">{session.description}</p>
                        
                        <div className="grid grid-cols-3 gap-3 text-center py-2 bg-[#0C0F19] rounded-lg border border-white/5 font-mono text-xs text-zinc-500">
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
                  <p className="text-zinc-500 text-xs mt-0.5 font-medium">Review and assign tasks.</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#0B0F19]/45 border border-white/5 p-4 rounded-2xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search Assignments"
                    value={searchAssignment}
                    onChange={(e) => setSearchAssignment(e.target.value)}
                    className="w-full bg-[#060813] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Course:</span>
                    <select
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className="px-3 py-2 bg-[#060813] border border-white/5 rounded-xl text-xs text-zinc-300 outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="All">All Courses</option>
                      <option value="Data Structures">Data Structures</option>
                      <option value="DBMS">DBMS</option>
                      <option value="OS">OS</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-[#060813] border border-white/5 rounded-xl text-xs text-zinc-300 outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowCreateAssignment(true)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="h-4 w-4" /> Create Assignment
                  </button>
                </div>
              </div>

              {filteredAssignments.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-4">No assignments found matching the criteria.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredAssignments.map(asg => (
                    <div key={asg.id} className="p-5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-white">{asg.title}</h3>
                            <p className="text-[10px] text-indigo-400 font-bold">{asg.subject}</p>
                          </div>
                          <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${
                            asg.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                            asg.status === 'Completed' ? 'bg-indigo-500/10 text-indigo-400' :
                            'bg-zinc-500/10 text-zinc-400'
                          }`}>
                            {asg.status}
                          </span>
                        </div>

                        <div className="pt-2 flex justify-between text-xs text-zinc-500 font-medium">
                          <span>Due Date: <span className="text-white font-mono">{asg.deadline}</span></span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center py-2 bg-white/[0.005] border border-white/5 rounded-lg font-mono text-xs text-zinc-500">
                          <div>
                            <p className="font-sans">Submitted Count</p>
                            <p className="font-bold text-white mt-0.5">{asg.submissionsCount}</p>
                          </div>
                          <div>
                            <p className="font-sans">Total Students</p>
                            <p className="font-bold text-white mt-0.5">{asg.totalAssigned}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setViewingAssignment(asg)}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-[10px] font-bold border-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button 
                            onClick={() => { setEditingAssignment(asg); setShowEditAssignment(true); }}
                            className="flex-1 py-1.5 bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 rounded-lg text-[10px] font-bold border-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteAssignment(asg.id)}
                            className="p-1.5 bg-red-950/40 hover:bg-red-950/60 text-red-400 rounded-lg text-[10px] font-bold border-none cursor-pointer transition-all flex items-center justify-center"
                            title="Delete Assignment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {asg.status !== 'Completed' && (
                          <button
                            onClick={() => {
                              apiRequest(`/assignments/${asg.id}`, {
                                method: 'PUT',
                                body: JSON.stringify({ status: 'Completed' })
                              }).then(() => {
                                addToast('Assignment marked completed!', 'success');
                                fetchAssignments();
                              }).catch(err => addToast(err.message || 'Error updating status', 'error'));
                            }}
                            className="w-full py-1.5 bg-indigo-650/20 hover:bg-indigo-650/40 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
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
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Comprehensive statistical distribution of study parameters.</p>
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
            <div className="max-w-[700px] mx-auto space-y-6">
              
              {/* Header */}
              <div className="text-left">
                <h2 className="text-xl font-bold text-white tracking-tight">Profile Settings</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Manage your personal details and expertise settings.</p>
              </div>

              {/* Main Settings Card Switcher */}
              {!isEditingProfile ? (
                /* Normal Card Read-Only View */
                <div className="p-6 rounded-2xl bg-[#0B0F19]/40 border border-white/5 space-y-6 text-left relative">
                  {/* Edit Button at Top-Right */}
                  <div className="absolute top-6 right-6">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-lg cursor-pointer uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Profile
                    </button>
                  </div>

                  {/* Section 1: Picture & Basic Info */}
                  <div className="flex flex-col md:flex-row gap-6 items-center border-b border-white/5 pb-6">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        className="h-20 w-20 rounded-full object-cover border border-white/10" 
                        alt="Avatar" 
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 font-bold text-2xl uppercase">
                        {user.fullName ? user.fullName.substring(0, 2) : 'M'}
                      </div>
                    )}
                    <div className="space-y-1.5 text-center md:text-left min-w-0 flex-1">
                      <h3 className="text-lg font-black text-white">{user.fullName}</h3>
                      <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{user.role}</p>
                      <p className="text-xs text-zinc-400">@{user.username}</p>
                    </div>
                  </div>

                  {/* Section 2: Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-white/5 pb-6">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold">Email Address</span>
                      <p className="text-xs font-semibold text-white">{user.email || 'Not specified'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold">Phone Number</span>
                      <p className="text-xs font-semibold text-white">{user.phone || 'Not specified'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold">College / Organization</span>
                      <p className="text-xs font-semibold text-white">{user.college || 'Not specified'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold">Availability Status</span>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={`h-2 w-2 rounded-full ${
                          user.availability === 'Available' ? 'bg-[#10B981]' :
                          user.availability === 'Away' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className={`text-xs font-semibold ${
                          user.availability === 'Available' ? 'text-[#10B981]' :
                          user.availability === 'Away' ? 'text-yellow-500' : 'text-red-500'
                        }`}>{user.availability || 'Available'}</span>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold">Short Bio</span>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed italic">
                        "{user.bio || 'No bio written yet.'}"
                      </p>
                    </div>
                  </div>

                  {/* Section 3: Expertise */}
                  <div className="border-b border-white/5 pb-6 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold">Teaching Expertise</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profileExpertise.length === 0 ? (
                        <span className="text-xs text-zinc-500 italic">No subjects selected yet.</span>
                      ) : (
                        profileExpertise.map((subject) => (
                          <span 
                            key={subject}
                            className="px-2.5 py-1 rounded bg-[#7C4DFF]/10 border border-[#7C4DFF]/25 text-[#B39DFF] text-[9.5px] font-bold"
                          >
                            {subject}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Section 4: Security */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-450 font-bold block">Security & Account</span>
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-[#7C4DFF]/30 text-white text-[10px] font-black rounded-lg cursor-pointer uppercase tracking-wider transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              ) : (
                /* Editable Form Mode */
                <div className="p-6 rounded-2xl bg-[#0B0F19]/40 border border-white/5 space-y-6 text-left relative">
                  {/* Top Close Button */}
                  <div className="absolute top-6 right-6">
                    <button
                      type="button"
                      onClick={() => {
                        // Reset and close
                        if (user) {
                          setProfileName(user.fullName || '');
                          setProfileEmail(user.email || '');
                          setProfilePhone(user.phone || '');
                          setProfileCollege(user.college || '');
                          setProfileBio(user.bio || '');
                          setProfileAvatar(user.avatarUrl || '');
                          setProfileAvailability(user.availability || 'Available');
                          
                          let parsedExpertise: string[] = [];
                          try {
                            if (user.expertise) {
                              parsedExpertise = typeof user.expertise === 'string' ? JSON.parse(user.expertise) : user.expertise;
                            }
                          } catch (e) {
                            if (typeof user.expertise === 'string') {
                              parsedExpertise = user.expertise.split(',').map(s => s.trim()).filter(Boolean);
                            }
                          }
                          setProfileExpertise(parsedExpertise);
                        }
                        setIsEditingProfile(false);
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 border border-white/10 hover:border-red-500/30 text-zinc-300 hover:text-red-400 text-[10px] font-black rounded-lg cursor-pointer transition-colors uppercase tracking-wider"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* SECTION 1: PROFILE PICTURE */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C4DFF]">1. Profile Information</h3>
                    
                    {/* Photo row */}
                    <div className="flex items-center gap-5 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                      <div className="relative">
                        {profileAvatar ? (
                          <img 
                            src={profileAvatar} 
                            className="h-16 w-16 rounded-full object-cover border border-white/10" 
                            alt="Avatar preview" 
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 font-bold text-xl">
                            {profileName ? profileName.charAt(0).toUpperCase() : 'M'}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-zinc-400 font-medium">Recommended: JPG or PNG, max 1MB</p>
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors uppercase tracking-wider">
                            Upload Image
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleAvatarChange} 
                              className="hidden" 
                            />
                          </label>
                          {profileAvatar && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-red-500/30 text-zinc-300 hover:text-red-400 text-[10px] font-black rounded-lg cursor-pointer transition-colors uppercase tracking-wider"
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Input fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Full Name *</label>
                        <input 
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Swathi Kumar"
                          className="w-full bg-[#070b13] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]/50 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Username (Read Only)</label>
                        <input 
                          type="text"
                          value={user?.username ? `@${user.username}` : ''}
                          disabled
                          className="w-full bg-[#070b13]/50 border border-white/5 text-zinc-500 rounded-lg px-3.5 py-2 text-xs cursor-not-allowed select-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Email Address *</label>
                        <input 
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          placeholder="mentor@gmail.com"
                          className="w-full bg-[#070b13] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]/50 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Phone Number (10 Digits)</label>
                        <input 
                          type="text"
                          maxLength={10}
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full bg-[#070b13] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]/50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">College / Organization</label>
                        <input 
                          type="text"
                          value={profileCollege}
                          onChange={(e) => setProfileCollege(e.target.value)}
                          placeholder="Aditya College of Engineering"
                          className="w-full bg-[#070b13] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]/50 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Short Bio</label>
                          <span className="text-[8px] text-zinc-500 font-bold">{150 - profileBio.length} characters left</span>
                        </div>
                        <textarea 
                          maxLength={150}
                          rows={2.5}
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          placeholder="Helping students prepare for placements."
                          className="w-full bg-[#070b13] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]/50 transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: EXPERTISE */}
                  <div className="space-y-3 pt-6 border-t border-white/5 relative">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C4DFF]">2. Expertise</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Teaching Expertise</label>
                      
                      {/* Select Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowExpertiseDropdown(!showExpertiseDropdown)}
                          className="w-full bg-[#070b13] border border-white/5 hover:border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white flex justify-between items-center cursor-pointer transition-colors"
                        >
                          <span className="truncate select-none">
                            {profileExpertise.length === 0 
                              ? 'Select subjects...' 
                              : `${profileExpertise.length} subject(s) selected`}
                          </span>
                          <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform duration-200" />
                        </button>

                        {/* Dropdown overlay */}
                        {showExpertiseDropdown && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setShowExpertiseDropdown(false)} 
                            />
                            <div className="absolute left-0 right-0 mt-1 bg-[#090d16] border border-white/10 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto p-2.5 space-y-1">
                              {['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Aptitude', 'Java', 'Python'].map((subject) => {
                                const checked = profileExpertise.includes(subject);
                                return (
                                  <button
                                    key={subject}
                                    type="button"
                                    onClick={() => {
                                      if (checked) {
                                        setProfileExpertise(prev => prev.filter(s => s !== subject));
                                      } else {
                                        setProfileExpertise(prev => [...prev, subject]);
                                      }
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] rounded-lg text-left text-xs text-slate-200 transition-colors"
                                  >
                                    <span>{subject}</span>
                                    <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                      checked 
                                        ? 'bg-[#7C4DFF] border-[#7C4DFF] text-white' 
                                        : 'border-white/10 bg-slate-950/40'
                                    }`}>
                                      {checked && <Check className="h-3 w-3 stroke-[3]" />}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Selected pills list */}
                      {profileExpertise.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {profileExpertise.map((subject) => (
                            <span 
                              key={subject}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#7C4DFF]/10 border border-[#7C4DFF]/25 text-[#B39DFF] text-[9.5px] font-bold"
                            >
                              {subject}
                              <button
                                type="button"
                                onClick={() => setProfileExpertise(prev => prev.filter(s => s !== subject))}
                                className="text-[#B39DFF]/60 hover:text-white transition-colors cursor-pointer"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 3: AVAILABILITY */}
                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C4DFF]">3. Availability</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex-1 min-w-[200px] space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Status</label>
                        <select
                          value={profileAvailability}
                          onChange={(e) => setProfileAvailability(e.target.value)}
                          className="w-full bg-[#070b13] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]/50 transition-colors"
                        >
                          <option value="Available">Available</option>
                          <option value="Busy">Busy</option>
                          <option value="Away">Away</option>
                        </select>
                      </div>

                      {/* Colored Badge */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">Current Status</span>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.01] border border-white/5 text-xs font-bold">
                          <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                            profileAvailability === 'Available' ? 'bg-[#10B981]' :
                            profileAvailability === 'Away' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className={
                            profileAvailability === 'Available' ? 'text-[#10B981]' :
                            profileAvailability === 'Away' ? 'text-yellow-500' : 'text-red-500'
                          }>
                            {profileAvailability}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: SECURITY */}
                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C4DFF]">4. Security & Account</h3>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-[#7C4DFF]/30 text-white text-[10px] font-black rounded-lg cursor-pointer uppercase tracking-wider transition-colors"
                      >
                        Change Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logout().then(() => router.push('/'));
                        }}
                        className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-red-500/30 text-red-400 text-[10px] font-black rounded-lg cursor-pointer uppercase tracking-wider transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>

                  {/* BOTTOM SAVE & CLOSE BUTTONS */}
                  <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        // Discard changes and close
                        if (user) {
                          setProfileName(user.fullName || '');
                          setProfileEmail(user.email || '');
                          setProfilePhone(user.phone || '');
                          setProfileCollege(user.college || '');
                          setProfileBio(user.bio || '');
                          setProfileAvatar(user.avatarUrl || '');
                          setProfileAvailability(user.availability || 'Available');
                          
                          let parsedExpertise: string[] = [];
                          try {
                            if (user.expertise) {
                              parsedExpertise = typeof user.expertise === 'string' ? JSON.parse(user.expertise) : user.expertise;
                            }
                          } catch (e) {
                            if (typeof user.expertise === 'string') {
                              parsedExpertise = user.expertise.split(',').map(s => s.trim()).filter(Boolean);
                            }
                          }
                          setProfileExpertise(parsedExpertise);
                        }
                        setIsEditingProfile(false);
                      }}
                      className="px-5 py-2.5 bg-slate-900 border border-white/10 hover:border-zinc-700 text-zinc-300 text-[11px] font-black rounded-lg cursor-pointer uppercase tracking-widest transition-all"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={savingProfile}
                      onClick={handleSaveProfile}
                      className="px-6 py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[11px] font-black rounded-lg cursor-pointer uppercase tracking-widest disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {savingProfile && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Password Change Modal */}
              {showPasswordModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="w-full max-w-sm bg-[#090d16] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">Change Password</h3>
                      <button 
                        type="button"
                        onClick={() => {
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setShowPasswordModal(false);
                        }}
                        className="text-zinc-500 hover:text-white transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Current Password</label>
                        <input 
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#070b13] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]/50 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">New Password</label>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#070b13] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]/50 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Confirm New Password</label>
                        <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#070b13] border border-white/5 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C4DFF]/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setShowPasswordModal(false);
                        }}
                        className="px-3.5 py-2 bg-slate-900 border border-white/10 text-zinc-400 hover:text-white text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={changingPassword}
                        onClick={handleChangePassword}
                        className="px-3.5 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider disabled:opacity-50 transition-colors"
                      >
                        {changingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: DISCUSSION BOARD (Piazza Style) */}
          {activeTab === 'discussions' && (
            <div className="space-y-6 max-w-7xl mx-auto h-[75vh] flex flex-col">
              {/* Header */}
              <div className="shrink-0 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">💬 Discussion Board</h2>
                  <p className="text-zinc-500 text-xs mt-0.5 font-medium">Academic doubt clearance feed.</p>
                </div>
              </div>

              {/* Dual-Pane Layout */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-6 overflow-hidden">
                {/* Left Pane: Doubt List (40%) */}
                <div className="lg:col-span-4 bg-[#0B0F19]/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
                  {/* Search Bar */}
                  <div className="p-4 border-b border-white/5 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search student doubts..."
                        value={searchDoubtQuery}
                        onChange={(e) => setSearchDoubtQuery(e.target.value)}
                        className="w-full bg-[#060813] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Doubt list feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loadingDoubts ? (
                      <div className="flex justify-center py-12">
                        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                      </div>
                    ) : doubts.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic py-4 text-center">No doubts posted yet.</p>
                    ) : (
                      doubts
                        .filter(d => d.title.toLowerCase().includes(searchDoubtQuery.toLowerCase()) || d.topic.toLowerCase().includes(searchDoubtQuery.toLowerCase()))
                        .map(d => {
                          const isSelected = selectedDoubt && selectedDoubt.id === d.id;
                          return (
                            <div 
                              key={d.id}
                              onClick={() => handleSelectDoubt(d.id)}
                              className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2 select-none ${
                                isSelected 
                                  ? 'bg-indigo-650/10 border-indigo-500' 
                                  : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-xs font-bold text-white leading-snug line-clamp-1 flex-1">
                                  {d.title}
                                </h4>
                                <div className="flex gap-1 shrink-0">
                                  {d.isPinned && (
                                    <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/10 text-amber-450 rounded font-bold uppercase">
                                      Pinned
                                    </span>
                                  )}
                                  {d.isClosed && (
                                    <span className="text-[8px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded font-bold uppercase">
                                      Closed
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-medium">
                                Student: <span className="text-white font-bold">{d.studentName}</span> • Group: <span className="text-indigo-400 font-bold">{d.groupName}</span>
                              </p>
                              <div className="flex justify-between items-center text-[9px] pt-1">
                                <span className="text-zinc-500 font-mono">{d.waitingTime}</span>
                                <span className={`font-bold uppercase ${d.isSolved ? 'text-emerald-450' : 'text-amber-500'}`}>
                                  {d.isSolved ? 'Solved ✓' : 'Unresolved ⨯'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Right Pane: Thread Details (60%) */}
                <div className="lg:col-span-6 bg-[#0B0F19]/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden text-left">
                  {!selectedDoubt ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
                      <MessageSquare className="h-10 w-10 text-zinc-650" />
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">No Discussion Selected</h4>
                      <p className="text-[10px] text-zinc-500 max-w-xs">
                        Select an academic doubt or question from the left sidebar feed to load full discussion details, answers, and moderator actions.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Doubt Header + Actions */}
                      <div className="p-5 border-b border-white/5 shrink-0 bg-white/[0.005] space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold block">
                              Question Thread • {selectedDoubt.topic}
                            </span>
                            <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                              {selectedDoubt.title}
                            </h3>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleTogglePin}
                              className={`px-3 py-1 bg-[#060913] border hover:border-indigo-500 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                                selectedDoubt.isPinned ? 'border-amber-500/30 text-amber-450' : 'border-white/5 text-zinc-400'
                              }`}
                            >
                              {selectedDoubt.isPinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button
                              onClick={handleToggleClose}
                              className={`px-3 py-1 bg-[#060913] border hover:border-indigo-500 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                                selectedDoubt.isClosed ? 'border-zinc-800 text-zinc-405' : 'border-white/5 text-zinc-400'
                              }`}
                            >
                              {selectedDoubt.isClosed ? 'Reopen' : 'Close'}
                            </button>
                            <button
                              onClick={handleToggleSolve}
                              className={`px-3 py-1 bg-[#060913] border hover:border-indigo-500 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                                selectedDoubt.isSolved ? 'border-emerald-500/20 text-emerald-450' : 'border-white/5 text-zinc-400'
                              }`}
                            >
                              {selectedDoubt.isSolved ? 'Solved ✓' : 'Unresolved ⨯'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                          <span>Posted by <span className="text-zinc-300 font-bold">{selectedDoubt.studentName}</span></span>
                          <span>•</span>
                          <span>In Group <span className="text-zinc-300 font-bold">{selectedDoubt.groupName}</span></span>
                          <span>•</span>
                          <span className="font-mono">{selectedDoubt.waitingTime}</span>
                        </div>
                      </div>

                      {/* Thread Messages List */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        {/* Parent Doubt Body */}
                        <div className="space-y-2 pb-4 border-b border-white/5">
                          <p className="text-xs text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap font-sans">
                            {selectedDoubt.description}
                          </p>
                        </div>

                        {/* Answers/Replies header */}
                        <div className="space-y-4 pt-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Replies ({doubtAnswers.length})
                          </h4>

                          {loadingAnswers ? (
                            <div className="flex justify-center py-6">
                              <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
                            </div>
                          ) : doubtAnswers.length === 0 ? (
                            <p className="text-xs text-zinc-500 italic py-2">No replies posted yet. Be the first to answer this doubt!</p>
                          ) : (
                            <div className="space-y-3">
                              {doubtAnswers.map((ans) => (
                                <div key={ans.id} className={`p-4 rounded-xl border space-y-2 transition-all ${
                                  ans.isAccepted 
                                    ? 'bg-emerald-500/[0.02] border-emerald-500/20' 
                                    : 'bg-white/[0.005] border-white/5'
                                }`}>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-white">
                                        {ans.Author?.fullName || 'Anonymous'}
                                      </span>
                                      <span className="text-[9px] text-zinc-500 font-bold uppercase px-1.5 py-0.5 bg-white/5 rounded">
                                        {ans.Author?.role || 'user'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {ans.isAccepted && (
                                        <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-450 rounded font-bold uppercase">
                                          Best Answer ✓
                                        </span>
                                      )}
                                      <span className="text-[9px] text-zinc-500 font-mono">
                                        {new Date(ans.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-zinc-300 font-medium leading-relaxed font-sans">
                                    {ans.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reply Editor Form */}
                      <div className="p-4 border-t border-white/5 shrink-0 bg-white/[0.005]">
                        {selectedDoubt.isClosed ? (
                          <div className="p-3 bg-zinc-800/40 border border-zinc-700/20 rounded-xl text-center">
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                              🔒 This discussion thread has been closed by a moderator.
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handlePostReply} className="flex gap-3">
                            <textarea
                              placeholder="Write a helpful academic response or reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={2}
                              className="flex-1 bg-[#060813] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500/50 resize-none font-medium leading-normal"
                              required
                            />
                            <button
                              type="submit"
                              className="px-5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none shrink-0"
                            >
                              Post Reply
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: RESOURCES MODULE */}
          {activeTab === 'resources' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Shared Study Resources</h2>
                  <p className="text-zinc-500 text-xs mt-0.5 font-medium">Upload study materials, PPTs, YouTube links, and practice sheets.</p>
                </div>
                <button
                  onClick={() => {
                    setNewResource({ name: '', type: 'PDF', content: '', size: '' });
                    setShowCreateResource(true);
                  }}
                  className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-xs font-black rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all uppercase tracking-wider"
                >
                  <Plus className="h-4 w-4" /> Share Resource
                </button>
              </div>

              {loadingResources ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : resources.length === 0 ? (
                <div className="py-12 text-center bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                  <p className="text-sm text-zinc-500 italic">No study materials shared yet.</p>
                  <p className="text-xs text-zinc-600">Share your first PPT, PDF, or YouTube guide with students.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((res) => (
                    <div key={res.id} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between min-h-[160px] text-left">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                            res.type === 'PDF' ? 'bg-red-500/10 text-red-400 border-red-500/15' :
                            res.type === 'PPT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' :
                            res.type === 'YouTube' ? 'bg-rose-500/10 text-rose-455 border-rose-500/15' :
                            'bg-sky-500/10 text-sky-400 border-sky-500/15'
                          }`}>
                            {res.type}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono font-bold">{res.size || '0 KB'}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white leading-snug">{res.name}</h4>
                        <p className="text-[10px] text-zinc-450 leading-relaxed line-clamp-2">{res.content}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <span className="text-[8px] text-zinc-550 font-bold uppercase">By {res.publishedBy}</span>
                        <div className="flex gap-2">
                          {res.content && res.content.startsWith('http') && (
                            <a
                              href={res.content}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white text-[9px] font-black rounded-md cursor-pointer uppercase tracking-wider text-center decoration-none"
                            >
                              Open Link
                            </a>
                          )}
                          <button
                            onClick={async () => {
                              if (window.confirm('Delete this resource?')) {
                                try {
                                  await apiRequest(`/shared-notes/${res.id}`, { method: 'DELETE' });
                                  addToast('Resource deleted successfully.', 'info');
                                  fetchResources();
                                } catch (e) {
                                  addToast('Failed to delete resource.', 'error');
                                }
                              }
                            }}
                            className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded border-none bg-transparent cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-6 max-w-7xl mx-auto h-[75vh] flex flex-col animate-in fade-in duration-200">
              <div className="text-left">
                <h2 className="text-xl font-bold text-white tracking-tight">Private Messages</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-medium">Chat directly with students or send group announcements.</p>
              </div>

              <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden flex divide-x divide-white/5 min-h-0">
                {/* Students roster column */}
                <div className="w-1/3 flex flex-col min-h-0 bg-[#070b13]/30">
                  <div className="p-4 border-b border-white/5">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-550" />
                      <input
                        type="text"
                        placeholder="Search student chat..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#060813] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 placeholder-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {students
                      .filter(s => s.fullName.toLowerCase().includes(globalSearch.toLowerCase()))
                      .map((st) => (
                        <button
                          key={st.id}
                          onClick={() => setChatStudent(st)}
                          className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all border-none text-left cursor-pointer ${
                            chatStudent?.id === st.id ? 'bg-[#5227EB]/10 text-white border border-[#5227EB]/25' : 'bg-transparent text-zinc-400 hover:bg-white/5'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {st.fullName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{st.fullName}</h4>
                            <p className="text-[9.5px] text-zinc-500 truncate mt-0.5">Click to host chat thread</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Private thread workspace */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#070b13]/10">
                  {chatStudent ? (
                    <>
                      {/* Thread header */}
                      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#070b13]/40">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
                            {chatStudent.fullName.charAt(0)}
                          </div>
                          <div className="text-left">
                            <h3 className="text-xs font-bold text-white">{chatStudent.fullName}</h3>
                            <p className="text-[9.5px] text-zinc-500 font-mono">@{chatStudent.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setNewSession(prev => ({ ...prev, groupId: studyRooms[0]?.id || '' }));
                            setShowCreateSession(true);
                          }}
                          className="px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white text-[9px] font-black rounded-lg uppercase tracking-wider cursor-pointer"
                        >
                          Schedule Study Session
                        </button>
                      </div>

                      {/* Chat Messages Log */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-end bg-[#070b13]/5">
                        {chatMessages.length === 0 ? (
                          <div className="my-auto text-center space-y-1.5">
                            <p className="text-xs text-zinc-500 italic">No messages exchanged yet.</p>
                            <p className="text-[10px] text-zinc-600">Send advice or assignments review notes to start.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 overflow-y-auto pr-1">
                            {chatMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex flex-col max-w-[80%] ${msg.sender === 'mentor' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                              >
                                <div className={`p-3 rounded-2xl text-xs leading-relaxed text-left ${
                                  msg.sender === 'mentor'
                                    ? 'bg-[#5227EB] text-white rounded-tr-none'
                                    : 'bg-white/5 text-zinc-200 rounded-tl-none border border-white/5'
                                }`}>
                                  {msg.text}
                                </div>
                                <span className="text-[8px] text-zinc-600 font-mono mt-1">{msg.timestamp}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Send bar */}
                      <form onSubmit={handleSendMessage} className="p-4 bg-[#070b13]/80 border-t border-white/5 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type academic message or announcement..."
                          value={typedMessage}
                          onChange={(e) => setTypedMessage(e.target.value)}
                          className="flex-1 bg-[#060813] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 placeholder-zinc-600"
                        />
                        <button
                          type="submit"
                          className="px-5 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-all uppercase tracking-wider"
                        >
                          Send Message
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="m-auto text-center space-y-2 select-none">
                      <div className="h-12 w-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-zinc-650">✉️</div>
                      <p className="text-xs text-zinc-500 italic">Select a student from the sidebar roster to start guidance chats.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Activity Alerts</h2>
                  <p className="text-zinc-500 text-xs mt-0.5 font-medium">Real-time alerts triggered by student workspace operations.</p>
                </div>
                {notifications.filter(n => n.unread).length > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        await apiRequest('/notifications/mark-read', { method: 'POST' });
                        addToast('All notifications marked as read.', 'success');
                        fetchNotifications();
                      } catch (e) {
                        addToast('Failed to mark read.', 'error');
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-white text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider"
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              {loadingNotifications ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center bg-white/[0.01] border border-white/5 rounded-2xl">
                  <p className="text-xs text-zinc-500 italic">No notifications logs recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={async () => {
                        if (notif.unread) {
                          try {
                            await apiRequest(`/notifications/${notif.id}/read`, { method: 'POST' });
                            fetchNotifications();
                          } catch (e) {}
                        }
                        if (notif.actionTab) {
                          setActiveTab(notif.actionTab);
                        }
                      }}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all cursor-pointer ${
                        notif.unread
                          ? 'bg-[#5227EB]/5 border-[#5227EB]/20 text-white font-bold'
                          : 'bg-white/[0.005] border-white/5 text-zinc-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${notif.unread ? 'bg-indigo-500 animate-pulse' : 'bg-transparent'}`} />
                        <p className="text-xs">{notif.message}</p>
                      </div>
                      <span className="text-[8px] text-zinc-600 font-mono font-medium shrink-0">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
                <label className="text-[10px] font-bold uppercase text-zinc-400">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Trees and Graphs homework"
                  value={challengeData.title}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Description / Instruction</label>
                <textarea
                  placeholder="e.g. Complete 5 DFS questions on LeetCode"
                  value={challengeData.text}
                  onChange={(e) => setChallengeData(prev => ({ ...prev, text: e.target.value }))}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 font-sans">Due Date</label>
                  <input
                    type="date"
                    value={challengeData.dueDate}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Priority</label>
                  <select
                    value={challengeData.priority}
                    onChange={(e) => setChallengeData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
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
                Assign Task
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

      {/* MODAL 5B: EDIT ASSIGNMENT */}
      {showEditAssignment && editingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Assignment</h3>
              <button 
                onClick={() => { setShowEditAssignment(false); setEditingAssignment(null); }}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEditAssignment} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Assignment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Graph Algorithms Homework Set"
                  value={editingAssignment.title}
                  onChange={(e) => setEditingAssignment((prev: any) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Subject Area</label>
                  <select
                    value={editingAssignment.subject}
                    onChange={(e) => setEditingAssignment((prev: any) => ({ ...prev, subject: e.target.value }))}
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
                    value={editingAssignment.deadline}
                    onChange={(e) => setEditingAssignment((prev: any) => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Status</label>
                  <select
                    value={editingAssignment.status}
                    onChange={(e) => setEditingAssignment((prev: any) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Total Students</label>
                  <input
                    type="number"
                    value={editingAssignment.totalAssigned}
                    onChange={(e) => setEditingAssignment((prev: any) => ({ ...prev, totalAssigned: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5C: VIEW ASSIGNMENT SUBMISSIONS */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{viewingAssignment.title}</h3>
                <p className="text-[10px] text-indigo-400 font-bold">{viewingAssignment.subject}</p>
              </div>
              <button 
                onClick={() => setViewingAssignment(null)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center py-3 bg-white/[0.005] border border-white/5 rounded-xl text-xs text-zinc-400 font-medium">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Status</p>
                <span className={`text-[10px] font-bold uppercase inline-block mt-1 ${
                  viewingAssignment.status === 'Active' ? 'text-emerald-400' :
                  viewingAssignment.status === 'Completed' ? 'text-indigo-400' :
                  'text-zinc-400'
                }`}>
                  {viewingAssignment.status}
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Due Date</p>
                <p className="text-white font-bold font-mono mt-1">{viewingAssignment.deadline}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Submission Rate</p>
                <p className="text-white font-bold font-mono mt-1">
                  {viewingAssignment.submissionsCount} / {viewingAssignment.totalAssigned}
                  <span className="text-[10px] text-zinc-500 font-sans ml-1">
                    ({viewingAssignment.totalAssigned > 0 ? Math.round((viewingAssignment.submissionsCount / viewingAssignment.totalAssigned) * 100) : 0}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Student Submission Roster</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {students.length === 0 ? (
                  <div className="py-6 text-center space-y-1">
                    <p className="text-xs text-zinc-500 italic">No students active in current view mode.</p>
                    <p className="text-[9px] text-zinc-650">Switch view mode to "Existing Self" to see active students roster.</p>
                  </div>
                ) : (
                  students.map((student, idx) => {
                    const isSubmitted = idx < (viewingAssignment.submissionsCount || 0);
                    const grade = isSubmitted ? (idx % 2 === 0 ? "9/10" : "8/10") : null;
                    const statusText = isSubmitted ? (idx % 3 === 0 ? "Graded" : "Submitted") : "Not Submitted";
                    
                    return (
                      <div 
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-[#060913] border border-white/5 rounded-xl hover:bg-white/[0.02] transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{student.fullName}</span>
                          <span className="text-[9px] text-zinc-500 font-mono">@{student.username}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            statusText === 'Graded' ? 'bg-emerald-500/10 text-emerald-400' :
                            statusText === 'Submitted' ? 'bg-indigo-500/10 text-indigo-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {statusText}
                          </span>
                          {grade && (
                            <span className="block text-[9px] text-zinc-400 font-mono mt-1 font-bold">Grade: {grade}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewingAssignment(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
              >
                Close Details
              </button>
            </div>
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
                <p className="text-[10px] text-zinc-500">Please set the View Mode switcher to <span className="text-indigo-400 font-bold">Existing Self (Active Cohort)</span> to load the student database.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAttendance} className="space-y-4">
                <p className="text-[11px] text-zinc-400">Check/Uncheck to mark presence for today's daily session logs:</p>
                
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

      {/* MODAL: SCHEDULE SESSION */}
      {showCreateSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Schedule Mentoring Session</h3>
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
                  placeholder="e.g. Active Recall Doubt Solving Session"
                  value={newSession.title}
                  onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Target Study Room / Group</label>
                <select
                  value={newSession.groupId}
                  onChange={(e) => setNewSession(prev => ({ ...prev, groupId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                  required
                >
                  <option value="">Select a study room...</option>
                  {studyRooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newSession.scheduledAt}
                    onChange={(e) => setNewSession(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={newSession.durationMinutes}
                    onChange={(e) => setNewSession(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Meeting Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={newSession.meetingLink}
                  onChange={(e) => setNewSession(prev => ({ ...prev, meetingLink: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Description / Notes</label>
                <textarea
                  placeholder="Session description or pre-reads..."
                  value={newSession.description}
                  onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                />
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

      {/* RIGHT CHAT DRAWER */}
      {showChatDrawer && chatStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowChatDrawer(false)}
          />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#0B0F19] border-l border-white/10 shadow-2xl flex flex-col">
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {chatStudent.fullName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-black text-white">{chatStudent.fullName}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">@{chatStudent.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChatDrawer(false)}
                  className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat Message Window */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-end min-h-0 bg-[#070b13]/40">
                {chatMessages.length === 0 ? (
                  <div className="my-auto text-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-zinc-500 text-lg">💬</div>
                    <p className="text-xs text-zinc-500 font-medium">Start a conversation with this student.</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto pr-1">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[80%] ${msg.sender === 'mentor' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'mentor' 
                            ? 'bg-[#5227EB] text-white rounded-tr-none' 
                            : 'bg-white/5 text-zinc-200 rounded-tl-none border border-white/5'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-zinc-650 font-mono mt-1">{msg.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Alert */}
              <div className="px-6 py-2 bg-indigo-950/20 border-t border-b border-white/5 text-[9px] text-indigo-400 font-bold text-left flex items-center gap-1.5">
                <span>⚡</span>
                <span>Messages will be delivered when the student comes online.</span>
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#070b13] border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#0d1222] border border-white/5 rounded-xl text-xs text-white placeholder-zinc-600 outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold border-none transition-all cursor-pointer shadow-md"
                >
                  Send
                </button>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedStudentDetail.fullName}</h3>
                <p className="text-[10px] text-zinc-500 font-mono">@{selectedStudentDetail.username}</p>
              </div>
              <button 
                onClick={() => setSelectedStudentDetail(null)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-left">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Email Address</span>
                <span className="text-zinc-300 font-medium">{selectedStudentDetail.email || 'N/A'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Phone Number</span>
                <span className="text-zinc-300 font-medium">{selectedStudentDetail.phone || 'N/A'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Study Interest / Level</span>
                <span className="text-indigo-400 font-bold">{selectedStudentDetail.learningPath} Level</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Department / College</span>
                <span className="text-zinc-300 font-medium">{selectedStudentDetail.department} • {selectedStudentDetail.college}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3.5 text-center bg-white/[0.005] border border-white/5 rounded-xl text-[10px] font-medium text-zinc-500 font-mono">
              <div>
                <p className="font-sans">Study Hours</p>
                <p className="text-white text-base font-bold mt-1">{selectedStudentDetail.totalStudyHours} hrs</p>
              </div>
              <div>
                <p className="font-sans">Performance</p>
                <p className="text-white text-base font-bold mt-1">{selectedStudentDetail.completionRate}%</p>
              </div>
              <div>
                <p className="font-sans">Attendance</p>
                <p className="text-white text-base font-bold mt-1">{selectedStudentDetail.attendanceRate}%</p>
              </div>
            </div>

            <div className="space-y-2 text-left text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Weak Topics</span>
                <span className="text-amber-500 font-bold bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10 block">{selectedStudentDetail.weakTopics}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Recent Activity</span>
                <span className="text-zinc-300 font-medium block">{selectedStudentDetail.lastActive}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/5">
              <button
                onClick={() => {
                  setSelectedStudent(selectedStudentDetail);
                  setSelectedStudentDetail(null);
                  setShowAssignChallenge(true);
                }}
                className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer border-none transition-all"
              >
                Assign Task
              </button>
              <button
                onClick={() => {
                  setChatStudent(selectedStudentDetail);
                  setSelectedStudentDetail(null);
                  setShowChatDrawer(true);
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-xs font-bold cursor-pointer border-none transition-all"
              >
                Message Student
              </button>
              <button
                onClick={() => {
                  setSelectedStudentDetail(null);
                  setShowCreateSession(true);
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-xs font-bold cursor-pointer border-none transition-all"
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ROOM MODAL */}
      {showEditRoom && editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edit Study Room</h3>
              <button onClick={() => setShowEditRoom(false)} className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEditRoomSubmit} className="space-y-3 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Room Name</label>
                <input
                  type="text"
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Subject Category</label>
                <input
                  type="text"
                  value={editingRoom.subject}
                  onChange={(e) => setEditingRoom(prev => prev ? { ...prev, subject: e.target.value } : null)}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Room Description</label>
                <textarea
                  value={editingRoom.description}
                  onChange={(e) => setEditingRoom(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                />
              </div>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRoom.isPublic}
                    onChange={(e) => setEditingRoom(prev => prev ? { ...prev, isPublic: e.target.checked } : null)}
                    className="h-4 w-4 bg-[#0B0F19] border-white/5 rounded text-indigo-500 focus:ring-0"
                  />
                  Public Room (Anyone can search and join)
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none mt-2"
              >
                Save Room Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ROOM CONFIRMATION */}
      {showDeleteRoom && deletingRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4 text-left">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Delete Study Room?</h3>
            <p className="text-xs text-zinc-400 leading-normal">
              Are you sure you want to delete **{deletingRoom.name}**? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteRoom(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoomSubmit}
                className="flex-1 py-2 bg-red-650 hover:bg-red-500 text-white rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PARTICIPANTS MODAL */}
      {showParticipantsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5 text-left">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{participantsRoomName}</h3>
                <p className="text-[10px] text-zinc-500 font-bold">Room Participants List</p>
              </div>
              <button onClick={() => setShowParticipantsModal(false)} className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs">
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingParticipants ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
              </div>
            ) : roomParticipants.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4 text-center">No participants joined yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {roomParticipants.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-[#060913] border border-white/5 rounded-xl text-left">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{m.User?.fullName || 'Student'}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">@{m.User?.username}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-bold uppercase rounded">
                      {m.role || 'Member'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHARE STUDY RESOURCE MODAL */}
      {showCreateResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center text-left">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Share Study Resource</h3>
              <button 
                onClick={() => setShowCreateResource(false)}
                className="text-zinc-500 hover:text-white border-none bg-transparent cursor-pointer text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newResource.name.trim() || !newResource.content.trim()) {
                  addToast('Resource Title and URL/Content are required.', 'error');
                  return;
                }
                try {
                  const res = await apiRequest('/shared-notes', {
                    method: 'POST',
                    body: JSON.stringify({
                      name: newResource.name.trim(),
                      type: newResource.type,
                      content: newResource.content.trim(),
                      size: newResource.size || '250 KB'
                    })
                  });
                  addToast(res.message || 'Resource shared successfully!', 'success');
                  setShowCreateResource(false);
                  fetchResources();
                  setMentorActivities(prev => [
                    { title: 'Uploaded study material', desc: `Uploaded resource "${newResource.name}"`, date: 'Just now' },
                    ...prev
                  ]);
                } catch (err: any) {
                  addToast(err.message || 'Failed to share resource.', 'error');
                }
              }} 
              className="space-y-3 text-left"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Resource Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master-Method-Cheat-Sheet"
                  value={newResource.name}
                  onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Resource Type</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="PDF">📄 PDF Document</option>
                    <option value="PPT">📊 PPT Slide Deck</option>
                    <option value="Link">🔗 External Link</option>
                    <option value="YouTube">🎥 YouTube Guide</option>
                    <option value="Practice Sheet">📝 Practice Sheet</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Resource Size / Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.2 MB"
                    value={newResource.size}
                    onChange={(e) => setNewResource(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Document URL / Description content</label>
                <textarea
                  placeholder="Paste resource link URL (e.g. https://...) or descriptive note content..."
                  value={newResource.content}
                  onChange={(e) => setNewResource(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-[#060913] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-black cursor-pointer transition-all border-none mt-2 uppercase tracking-wider"
              >
                Share with Cohort
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


