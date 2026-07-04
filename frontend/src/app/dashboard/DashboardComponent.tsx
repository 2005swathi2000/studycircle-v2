'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ToastProvider';
import { practiceQuestionsPool } from './practiceData';
import { SimpleDashboard } from './SimpleDashboard';
import { 
  Users, 
  LogOut, 
  Plus, 
  ChevronRight, 
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  GraduationCap,
  Shield,
  Clock,
  Flame,
  PlusCircle,
  RefreshCw,
  UserCheck,
  Search,
  FileText,
  Calendar,
  TrendingUp,
  Wifi,
  BookOpen,
  ChevronDown,
  Bell,
  MessageSquare,
  Award,
  Trophy,
  Mail,
  BarChart2,
  Settings,
  Edit3,
  Video,
  CheckCircle2,
  Trash2,
  Play,
  Pause,
  Square,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Terminal,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  ChevronUp,
  Download,
  Bookmark,
  HelpCircle,
  Lock,
  Unlock,
  X
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  subject: string;
  inviteCode: string;
  isPublic: boolean;
  GroupMember?: {
    role: 'admin' | 'mentor' | 'student';
  };
}

type TabType = 
  | 'dashboard' 
  | 'groups' 
  | 'rooms' 
  | 'notes' 
  | 'sessions' 
  | 'calendar' 
  | 'progress' 
  | 'discussions' 
  | 'leaderboard' 
  | 'members' 
  | 'invites' 
  | 'reports' 
  | 'settings' 
  | 'admin'
  | 'bookmarks'
  | 'messages'
  | 'users'
  | 'announcements'
  | 'feedback'
  | 'roles'
  | 'profile'
  | 'resources'
  | 'study'
  | 'practice'
  | 'community';

const todayChallenges = {
  'general': {
    question: 'Which of the following is a non-volatile memory type?',
    options: ['RAM', 'ROM', 'Cache Memory', 'CPU Registers'],
    correctIndex: 1,
    explanation: 'ROM (Read-Only Memory) retains its data even after the device is powered off, making it non-volatile.'
  }
};

// Helper to determine gender-based profile picture dynamically
const getAvatarByName = (fullName: string | null | undefined, gender?: string): string => {
  if (gender === 'female') return '/swathi-avatar.png';
  if (gender === 'male') return '/charan-avatar.png';
  if (gender === 'other' || gender === 'neutral') {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
  }

  if (!fullName) return '/charan-avatar.png'; // default
  
  const firstName = fullName.trim().split(' ')[0].toLowerCase();
  
  // Specific name lists for StudyCircle
  const femaleNames = ['swathi', 'bhagya', 'rathna', 'rathnamma', 'swetha', 'priya', 'geetha', 'divya', 'kavya', 'lakshmi', 'anusha', 'saritha', 'radha', 'sravani', 'bindu', 'anoohya', 'kavitha', 'lavanya', 'swarna', 'siri', 'sneha', 'jyothi'];
  const maleNames = ['charan', 'karthik', 'prasad', 'ramesh', 'kalyan', 'sai', 'rahul', 'amit', 'vijay', 'kumar', 'sanjay', 'anil', 'suresh', 'harish', 'rajesh', 'kiran', 'ravi', 'vivek', 'arjun', 'vikram', 'hanumanthu'];

  if (femaleNames.includes(firstName)) {
    if (firstName === 'bhagya') return '/bhagya-avatar.png';
    if (firstName === 'rathna' || firstName === 'rathnamma') return '/rathna-avatar.png';
    return '/swathi-avatar.png';
  }
  
  if (maleNames.includes(firstName)) {
    if (firstName === 'karthik') return '/karthik-avatar.png';
    return '/charan-avatar.png';
  }

  // Heuristics for typical Indian/Western name endings
  const commonMaleSuffixes = ['kumar', 'prasad', 'raj', 'rao', 'babu', 'nath', 'singh', 'dev', 'lal', 'sen', 'paul'];
  if (commonMaleSuffixes.some(suffix => firstName.endsWith(suffix))) {
    return '/charan-avatar.png';
  }
  
  // Standard female name endings (e.g., -a, -i, -ee, -ya, -na, -ma, -thi, -tha, -ha)
  const femaleEndings = ['a', 'i', 'ee', 'ya', 'na', 'ma', 'thi', 'tha', 'ha', 'shri', 'mathi'];
  if (femaleEndings.some(ending => firstName.endsWith(ending))) {
    // Distribute female names across the 3 female avatars consistently using a simple hash
    const charCodeSum = firstName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const mod = charCodeSum % 3;
    if (mod === 0) return '/swathi-avatar.png';
    if (mod === 1) return '/bhagya-avatar.png';
    return '/rathna-avatar.png';
  }

  return '/charan-avatar.png'; // Fallback default male
};

const getSlugByGroup = (group: { name: string; subject: string }) => {
  const name = (group.name || '').toLowerCase();
  const subject = (group.subject || '').toLowerCase();
  if (name.includes('dsa') || subject.includes('dsa') || name.includes('programming') || subject.includes('programming') || name.includes('coding')) {
    return 'programming-dsa';
  }
  if (name.includes('machine') || name.includes('ai') || subject.includes('machine') || subject.includes('ai')) {
    return 'ai-ml';
  }
  if (name.includes('web') || subject.includes('web')) {
    return 'web-development';
  }
  if (name.includes('aptitude') || subject.includes('aptitude')) {
    return 'aptitude';
  }
  if (name.includes('interview') || subject.includes('interview')) {
    return 'interview-preparation';
  }
  if (name.includes('gate') || subject.includes('gate')) {
    return 'gate';
  }
  if (name.includes('upsc') || subject.includes('upsc')) {
    return 'upsc';
  }
  if (name.includes('math') || subject.includes('math')) {
    return 'mathematics';
  }
  return group.subject ? group.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'programming-dsa';
};


export function DashboardComponent({ bypassRedirect = false }: { bypassRedirect?: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const dataLoadedRef = useRef(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'User';
    
    if (hour >= 5 && hour < 12) {
      return `Good Morning, ${firstName} ☀️`;
    } else if (hour >= 12 && hour < 17) {
      return `Good Afternoon, ${firstName} 🌤️`;
    } else if (hour >= 17 && hour < 22) {
      return `Good Evening, ${firstName} 🌙`;
    } else {
      return `Good Night, ${firstName} 🌌`;
    }
  };
  
  const { 
    user, 
    setUser, 
    notifications, 
    setNotifications, 
    myGroups, 
    setMyGroups, 
    logout, 
    loading: globalLoading,
    markAllNotificationsRead,
    markNotificationRead 
  } = useApp();

  useEffect(() => {
    if (!globalLoading && !bypassRedirect) {
      if (!user) {
        if (typeof window !== 'undefined' && sessionStorage.getItem('explicit_logout') === 'true') {
          sessionStorage.removeItem('explicit_logout');
          router.push('/');
        } else {
          router.push('/?login=true');
        }
      } else {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, globalLoading, bypassRedirect, router]);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    streakCount: 0, 
    totalStudyHours: 0.0, 
    xp: 0, 
    focusCoins: 0, 
    level: 1, 
    department: 'CSE', 
    badges: '[]' 
  });

  // Onboarding Wizard States
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [wizardGoal, setWizardGoal] = useState('');
  const [wizardLevel, setWizardLevel] = useState('beginner');
  const [wizardTarget, setWizardTarget] = useState(2.0);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [equippedTheme, setEquippedTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studycircle_equipped_theme') || 'midnight';
    }
    return 'midnight';
  });
  const [resourcesSubTab, setResourcesSubTab] = useState<'vault' | 'shop'>('vault');

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studycircle_theme') || 'default';
    }
    return 'default';
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('studycircle_theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleRefresh = () => {
      if (user) loadDashboardData(user);
    };
    window.addEventListener('studycircle-data-refresh', handleRefresh);
    return () => {
      window.removeEventListener('studycircle-data-refresh', handleRefresh);
    };
  }, [user]);

  const getXpThresholdForLevel = (level: number) => {
    let totalXp = 0;
    for (let l = 1; l < level; l++) {
      totalXp += Math.floor(100 * Math.pow(l, 1.3));
    }
    return totalXp;
  };

  const getXpRangeForLevel = (level: number) => {
    const min = getXpThresholdForLevel(level);
    const max = getXpThresholdForLevel(level + 1);
    return { min, max };
  };

  // Dynamic Daily Missions States
  const [dailyMissions, setDailyMissions] = useState<any[]>([
    { id: 'join_circle', text: 'Join Study Circle', completed: false, xp: 30 },
    { id: 'attend_session', text: 'Attend Session', completed: false, xp: 30 },
    { id: 'upload_notes', text: 'Upload Notes', completed: false, xp: 40 },
    { id: 'complete_session', text: 'Complete Session', completed: false, xp: 50 }
  ]);
  const [claimedDailyReward, setClaimedDailyReward] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedMissionAlert, setCompletedMissionAlert] = useState<{ text: string; xp: number } | null>(null);
  const missionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSyncMissions = useRef<((updated: any[]) => void) | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    debouncedSyncMissions.current = (updated: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const data = await apiRequest('/progress/update-missions', {
            method: 'POST',
            body: JSON.stringify({ dailyMissions: updated })
          });
          if (user) setUser({ ...user, dailyMissions: data.user.dailyMissions });
        } catch (err) {
          console.error("Error saving missions to DB:", err);
        }
      }, 1000);
    };
    return () => clearTimeout(timeoutId);
  }, [setUser]);

  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  // Roster Management States
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [studentsSearch, setStudentsSearch] = useState('');
  const [selectedStudentForChallenge, setSelectedStudentForChallenge] = useState<any>(null);
  const [challengeText, setChallengeText] = useState('');
  const [challengeXp, setChallengeXp] = useState(150);
  const [challengeCoins, setChallengeCoins] = useState(50);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [assigningChallenge, setAssigningChallenge] = useState(false);

  // Interactive Gamification States
  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);
  const [completedMissions, setCompletedMissions] = useState<{ [key: string]: boolean }>({
    study_1h: false,
    join_room: false,
    solve_doubts: false,
    share_note: false
  });
  const [selectedDept, setSelectedDept] = useState<'CSE' | 'IT' | 'ECE' | 'EEE'>('CSE');
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);

  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const isNewMentor = true; // Forced zero state for new mentor dashboard

  // Profile details states
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');

  // Edit Note State
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteName, setEditNoteName] = useState('');
  const [editNoteSize, setEditNoteSize] = useState('');
  const [editNoteCategory, setEditNoteCategory] = useState('syllabus');
  const [editingNote, setEditingNote] = useState(false);

  // Edit Session State
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessTitle, setEditSessTitle] = useState('');
  const [editSessTime, setEditSessTime] = useState('');
  const [editSessSubject, setEditSessSubject] = useState('');
  const [editSessStatus, setEditSessStatus] = useState('Upcoming');

  // Helper to dynamically update student last activity (Netflix/Coursera style)
  const updateLastActivity = (courseName: string, lessonName: string, tab: string, subView: string) => {
    if (typeof window !== 'undefined') {
      const activity = { courseName, lessonName, tab, subView, timestamp: Date.now() };
      localStorage.setItem('studycircle_last_activity', JSON.stringify(activity));
      window.dispatchEvent(new CustomEvent('studycircle-activity-update'));
    }
  };

  // Search Palette State
  const [showSearchPalette, setShowSearchPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResourcesModal, setShowResourcesModal] = useState(false);

  // Daily Goals State
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);

  // Study Rooms 2.0 States
  const [searchRoomsQuery, setSearchRoomsQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterVisibility, setFilterVisibility] = useState('All');
  const [filterSort, setFilterSort] = useState('Newest');

  // Create Room Form States
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [createRoomName, setCreateRoomName] = useState('');
  const [createRoomSubject, setCreateRoomSubject] = useState('Programming & DSA');
  const [createRoomTopic, setCreateRoomTopic] = useState('');
  const [createRoomDesc, setCreateRoomDesc] = useState('');
  const [createRoomDiff, setCreateRoomDiff] = useState('Beginner');
  const [createRoomIsPublic, setCreateRoomIsPublic] = useState(true);
  const [createRoomMax, setCreateRoomMax] = useState('25');
  const [createRoomCover, setCreateRoomCover] = useState('/images/dsa-cover.jpg');
  const [createRoomIcon, setCreateRoomIcon] = useState('📚');
  const [createRoomTags, setCreateRoomTags] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Preview Drawer States
  const [previewRoom, setPreviewRoom] = useState<any | null>(null);
  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);

  const parseGroupMeta = (group: any) => {
    try {
      const parsed = JSON.parse(group.description);
      if (parsed && typeof parsed === 'object' && 'text' in parsed) {
        return {
          text: parsed.text || '',
          difficulty: parsed.difficulty || 'Intermediate',
          maxParticipants: parsed.maxParticipants || 25,
          topic: parsed.topic || 'General',
          tags: parsed.tags || '',
          icon: parsed.icon || '📚',
          coverImage: parsed.coverImage || ''
        };
      }
    } catch (e) {
      // ignore
    }
    return {
      text: group.description || '',
      difficulty: 'Intermediate',
      maxParticipants: 25,
      topic: 'General',
      tags: '',
      icon: '📚',
      coverImage: ''
    };
  };

  const filteredAvailableGroups = useMemo(() => {
    return availableGroups.filter((room) => {
      const meta = parseGroupMeta(room);
      const matchesSearch = 
        room.name.toLowerCase().includes(searchRoomsQuery.toLowerCase()) ||
        meta.topic.toLowerCase().includes(searchRoomsQuery.toLowerCase()) ||
        meta.text.toLowerCase().includes(searchRoomsQuery.toLowerCase());
      const matchesSubject = filterSubject === 'All' || room.subject === filterSubject;
      const matchesDifficulty = filterDifficulty === 'All' || meta.difficulty === filterDifficulty;
      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [availableGroups, searchRoomsQuery, filterSubject, filterDifficulty]);

  const filteredMyGroups = useMemo(() => {
    return myGroups.filter((room) => {
      const meta = parseGroupMeta(room);
      const matchesSearch = 
        room.name.toLowerCase().includes(searchRoomsQuery.toLowerCase()) ||
        meta.topic.toLowerCase().includes(searchRoomsQuery.toLowerCase()) ||
        meta.text.toLowerCase().includes(searchRoomsQuery.toLowerCase());
      const matchesSubject = filterSubject === 'All' || room.subject === filterSubject;
      const matchesDifficulty = filterDifficulty === 'All' || meta.difficulty === filterDifficulty;
      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [myGroups, searchRoomsQuery, filterSubject, filterDifficulty]);

  const handleCreateStudyRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createRoomName.trim() || !createRoomDesc.trim()) {
      showToast('Room name and description are required.', 'error');
      return;
    }
    setCreatingRoom(true);
    try {
      const metaDescription = JSON.stringify({
        text: createRoomDesc,
        difficulty: createRoomDiff,
        maxParticipants: Number(createRoomMax),
        topic: createRoomTopic || 'General Study',
        tags: createRoomTags,
        icon: createRoomIcon,
        coverImage: createRoomCover
      });

      const data = await apiRequest('/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: createRoomName,
          description: metaDescription,
          subject: createRoomSubject,
          isPublic: createRoomIsPublic
        })
      });

      showToast('Study Room created successfully! +25 XP earned.', 'success');
      
      // Award XP
      setStats(prev => ({
        ...prev,
        xp: prev.xp + 25,
        focusCoins: prev.focusCoins + 5
      }));

      setShowCreateRoomModal(false);
      
      // Reset form
      setCreateRoomName('');
      setCreateRoomTopic('');
      setCreateRoomDesc('');
      setCreateRoomTags('');

      await loadDashboardData(user);

      // Auto enter room
      const roomSlug = createRoomName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      router.push(`/workspace/${roomSlug}`);

    } catch (err: any) {
      showToast(err.message || 'Failed to create study room.', 'error');
    } finally {
      setCreatingRoom(false);
    }
  };

  // Notifications Bell dropdown State
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, text: "💬 Neha replied to your doubt in the DBMS Workspace.", time: "5m ago", read: false },
    { id: 2, text: "📅 Live OS revision session is scheduled today at 5 PM.", time: "1h ago", read: false },
    { id: 3, text: "🏆 You unlocked the Streak Master badge!", time: "2h ago", read: false },
    { id: 4, text: "📂 New reference guide uploaded in Java DSA.", time: "1d ago", read: true },
    { id: 5, text: "🎓 Mock Test Certificate is ready to download.", time: "3d ago", read: true }
  ]);

  // Student Dashboard Consolidated Sub-views
  const [studySubView, setStudySubView] = useState<null | 'workspaces' | 'rooms' | 'resources'>(null);
  const [practiceSubView, setPracticeSubView] = useState<null | 'roadmap' | 'questions' | 'mock'>(null);
  const [progressSubView, setProgressSubView] = useState<null | 'analytics' | 'xp' | 'certificates'>(null);
  const [communitySubView, setCommunitySubView] = useState<null | 'forum' | 'leaderboard' | 'chat'>(null);
  const [profileSubView, setProfileSubView] = useState<null | 'details' | 'settings'>(null);

  // Login states for dashboard Auth Guard Overlay
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginPortal, setLoginPortal] = useState<'student' | 'mentor'>('student');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleDashboardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) {
      showToast('Username and password are required.', 'error');
      return;
    }
    setLoginLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: loginUser.trim(),
          password: loginPass,
          portal: loginPortal
        })
      });
      setUser(data.user, data.token);
      showToast('Welcome back, ' + data.user.fullName + '!', 'success');
      loadDashboardData(data.user);
    } catch (err: any) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setPreviewAvatar(base64);
          showToast('Photo selected and compressed!', 'success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const pathname = usePathname();

  // Derive activeTab directly from the pathname
  const activeTab = useMemo<TabType>(() => {
    if (!pathname) return 'dashboard';
    const segments = pathname.split('/');
    const currentRole = segments[1]; // student, mentor, admin
    const currentTab = segments[2]; // dashboard, study, practice, etc.

    if (currentRole === 'student') {
      if (currentTab === 'study') return 'study';
      if (currentTab === 'practice') return 'practice';
      if (currentTab === 'progress') return 'progress';
      if (currentTab === 'community') return 'community';
      if (currentTab === 'profile') return 'profile';
      return 'dashboard';
    } else if (currentRole === 'mentor') {
      const tabMapRev: Record<string, string> = {
        'dashboard': 'dashboard',
        'student-roster': 'students',
        'study-rooms': 'groups',
        'mentoring-sessions': 'sessions',
        'cohort-analytics': 'analytics',
        'profile': 'profile'
      };
      return (tabMapRev[currentTab] || 'dashboard') as TabType;
    } else if (currentRole === 'admin') {
      const tabMapRev: Record<string, string> = {
        'dashboard': 'overview',
        'users': 'users',
        'mentors': 'mentors',
        'study-rooms': 'rooms',
        'analytics': 'overview',
        'system-health': 'reports',
        'settings': 'settings'
      };
      return (tabMapRev[currentTab] || 'overview') as TabType;
    }
    return 'dashboard';
  }, [pathname]);

  // Set active tab by updating the browser URL
  const setActiveTab = (newTab: string) => {
    const role = user?.role || 'student';
    let path = `/${role}/dashboard`;
    if (newTab !== 'dashboard') {
      if (role === 'student') {
        path = `/student/${newTab}`;
      } else if (role === 'mentor') {
        const mentorTabMap: Record<string, string> = {
          'students': 'student-roster',
          'groups': 'study-rooms',
          'sessions': 'mentoring-sessions',
          'analytics': 'cohort-analytics',
          'profile': 'profile'
        };
        path = `/mentor/${mentorTabMap[newTab] || newTab}`;
      } else if (role === 'admin') {
        const adminTabMap: Record<string, string> = {
          'overview': 'dashboard',
          'users': 'users',
          'mentors': 'mentors',
          'rooms': 'study-rooms',
          'reports': 'system-health',
          'settings': 'settings'
        };
        path = `/admin/${adminTabMap[newTab] || newTab}`;
      }
    }
    router.push(path);
  };

  // Global Leaderboard States
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(false);
  const [leaderboardSubTab, setLeaderboardSubTab] = useState<'learners' | 'mentors' | 'notes' | 'rooms'>('learners');

  // Resources States
  const [resourcesSearch, setResourcesSearch] = useState('');
  const [resourcesFilter, setResourcesFilter] = useState('All');

  // Study Rooms View States
  const [roomViewMode, setRoomViewMode] = useState<'first-time' | 'returning'>(() => {
    return stats.totalStudyHours === 0 ? 'first-time' : 'returning';
  });
  const [selectedInterest, setSelectedInterest] = useState<string>('Programming & DSA');
  const [completedPracticeChallenges, setCompletedPracticeChallenges] = useState<string[]>([]);
  const [practiceQuizAnswer, setPracticeQuizAnswer] = useState<number | null>(null);
  const [practiceQuizFeedback, setPracticeQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [practiceCodeText, setPracticeCodeText] = useState<string | null>(null);
  const [practiceConsoleLogs, setPracticeConsoleLogs] = useState<string[]>([]);
  const [practiceTested, setPracticeTested] = useState<boolean>(false);
  const [questionsCountLimit, setQuestionsCountLimit] = useState<number | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<any[]>([]);
  const [practiceSessionCompleted, setPracticeSessionCompleted] = useState<boolean>(false);
  const [practiceSessionScore, setPracticeSessionScore] = useState<number>(0);
  const [practiceQuizErrorMessage, setPracticeQuizErrorMessage] = useState<string | null>(null);
  const [practiceQuizAttempts, setPracticeQuizAttempts] = useState<number>(0);
  const [showQuizHint, setShowQuizHint] = useState<boolean>(false);

  // --- COMMUNITY HUB STATES & MOCK DATA ---
  const [activeFeedType, setActiveFeedType] = useState<'all' | 'discussions' | 'doubts' | 'announcements' | 'resources' | 'polls'>('all');
  const [activeChannel, setActiveChannel] = useState<string>('#general-lobby');
  const [searchChannelQuery, setSearchChannelQuery] = useState<string>('');
  const [searchMessageQuery, setSearchMessageQuery] = useState<string>('');
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [replyMessageText, setReplyMessageText] = useState<string>('');
  const [isPinnedOnly, setIsPinnedOnly] = useState<boolean>(false);
  const [selectedDoubtForThread, setSelectedDoubtForThread] = useState<any | null>(null);
  const [newDoubtModalOpen, setNewDoubtModalOpen] = useState<boolean>(false);
  const [activeAiTool, setActiveAiTool] = useState<'flashcard' | 'quiz' | null>(null);
  const [aiQuizAnswers, setAiQuizAnswers] = useState<Record<string, string>>({});
  const [aiQuizSubmitted, setAiQuizSubmitted] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [xpRewards, setXpRewards] = useState<Array<{ id: number; amount: number; text: string; x: number; y: number }>>([]);
  const [joinedVoiceId, setJoinedVoiceId] = useState<number | null>(null);
  
  // Local UI states for Community Hub controls
  const [composerPostType, setComposerPostType] = useState<'chat' | 'doubt' | 'poll'>('chat');
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  
  // Custom dialog or input fields for new doubt
  const [newDoubtTitle, setNewDoubtTitle] = useState<string>('');
  const [newDoubtDescription, setNewDoubtDescription] = useState<string>('');

  const [voiceDesks, setVoiceDesks] = useState([
    { id: 1, name: '🎙 DBMS Study Lounge', activeCount: 0, joined: false },
    { id: 2, name: '🎙 OS Exam Prep Desk', activeCount: 0, joined: false },
    { id: 3, name: '🎙 Placement Sprint Lounge', activeCount: 0, joined: false }
  ]);

  const dailyMetrics = {
    studentsActive: 0,
    doubtsResolved: 0,
    resourcesShared: 0,
    liveStudySessions: 0
  };

  const aiChannelSummaries: Record<string, string> = {
    '#general-lobby': 'Students are currently preparing for placement season. Key discussed topics: Resume styling, basic arrays vs linked lists, and upcoming company patterns.',
    '#dbms-circle': 'Active discussion on Database Normalization (1NF, 2NF, 3NF, BCNF) and SQL query optimizations. 12 doubts resolved today.',
    '#operating-systems': 'Focusing on process synchronization, semaphores, deadlock prevention, and page replacement algorithms.',
    '#computer-networks': 'Reviewing TCP vs UDP handshakes, IP addressing subnetting masks, and routing protocols.',
    '#aptitude': 'Discussing probability, time & work shortcuts, and logic puzzles. 4 resources shared.',
    '#interview-prep': 'Sharing coding rounds experiences, mock feedback, and behavioral interview questions.',
    '#coding-rounds': 'Solving hard dynamic programming questions, tree traversals, and complexity optimizations.',
    '#project-discussion': 'Grouping for semester projects. Front-end frameworks vs Back-end databases selections.',
    '#team-collaboration': 'Coordinating meetings, GitHub branching policies, and deployment strategies.'
  };

  const aiQuizQuestions = [
    {
      id: 'q1',
      question: 'Which normal form addresses transitively dependent attributes?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      answer: '3NF',
      explanation: '3NF states that there should be no transitive dependency (non-prime attributes depending on other non-prime attributes).'
    },
    {
      id: 'q2',
      question: 'What is the main purpose of BCNF?',
      options: ['Remove multi-valued dependencies', 'Remove partial dependencies', 'Handle cases where candidate keys overlap', 'Ensure atomic values'],
      answer: 'Handle cases where candidate keys overlap',
      explanation: 'BCNF is a stronger version of 3NF, dealing with anomalies arising from overlapping candidate keys.'
    }
  ];

  const aiFlashcards = [
    { front: '1NF (First Normal Form)', back: 'All attributes must be atomic (indivisible) values. No repeating groups.' },
    { front: '2NF (Second Normal Form)', back: 'Must be in 1NF, and all non-key attributes must be fully functionally dependent on the primary key (no partial dependencies).' },
    { front: '3NF (Third Normal Form)', back: 'Must be in 2NF, and no transitive dependency exists between non-prime attributes.' },
    { front: 'BCNF (Boyce-Codd Normal Form)', back: 'For every functional dependency X -> Y, X must be a super key.' }
  ];

  const topContributors: any[] = [];

  const upcomingCommunitySessions: any[] = [];

  const [communityMessages, setCommunityMessages] = useState<any[]>([]);

  const triggerXpReward = (amount: number, text: string) => {
    const id = Date.now() + Math.random();
    const newReward = {
      id,
      amount,
      text,
      x: typeof window !== 'undefined' ? window.innerWidth / 2 + (Math.random() * 100 - 50) : 500,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 300
    };
    setXpRewards((prev) => [...prev, newReward]);
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + amount,
      focusCoins: prev.focusCoins + Math.floor(amount / 5)
    }));
    setTimeout(() => {
      setXpRewards((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  const handleUpvoteMessage = (msgId: string) => {
    setCommunityMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const userName = user?.fullName || 'Anonymous';
          const alreadyUpvoted = msg.upvotedBy?.includes(userName);
          const upvotedBy = alreadyUpvoted
            ? msg.upvotedBy.filter((name: string) => name !== userName)
            : [...(msg.upvotedBy || []), userName];
          const newUpvotes = alreadyUpvoted ? msg.upvotes - 1 : msg.upvotes + 1;
          
          if (!alreadyUpvoted) {
            triggerXpReward(5, 'Upvoted Post! +5 XP');
            showToast('Post upvoted! You earned +5 XP.', 'success');
          } else {
            showToast('Upvote removed.', 'info');
          }
          
          const updatedMsg = { ...msg, upvotes: newUpvotes, upvotedBy };
          if (selectedDoubtForThread && selectedDoubtForThread.id === msgId) {
            setSelectedDoubtForThread(updatedMsg);
          }
          return updatedMsg;
        }
        return msg;
      })
    );
  };

  const handleUpvoteAnswer = (msgId: string, answerId: string) => {
    setCommunityMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const updatedAnswers = msg.answers?.map((ans: any) => {
            if (ans.id === answerId) {
              triggerXpReward(5, 'Upvoted Answer! +5 XP');
              return { ...ans, upvotes: ans.upvotes + 1 };
            }
            return ans;
          });
          const updatedMsg = { ...msg, answers: updatedAnswers };
          if (selectedDoubtForThread && selectedDoubtForThread.id === msgId) {
            setSelectedDoubtForThread(updatedMsg);
          }
          return updatedMsg;
        }
        return msg;
      })
    );
  };

  const handleAcceptSolution = (msgId: string, answerId: string) => {
    setCommunityMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const updatedAnswers = msg.answers?.map((ans: any) => {
            if (ans.id === answerId) {
              return { ...ans, isAccepted: true };
            }
            return ans;
          });
          
          triggerXpReward(20, 'Solution Accepted! +20 XP');
          showToast('Answer marked as accepted solution! +20 XP awarded.', 'success');
          
          const updatedMsg = {
            ...msg,
            status: 'resolved',
            answers: updatedAnswers
          };
          
          if (selectedDoubtForThread && selectedDoubtForThread.id === msgId) {
            setSelectedDoubtForThread(updatedMsg);
          }
          return updatedMsg;
        }
        return msg;
      })
    );
  };

  const handleToggleVoiceChannel = (roomId: number) => {
    if (joinedVoiceId === roomId) {
      setJoinedVoiceId(null);
      setVoiceDesks((prev) =>
        prev.map((desk) =>
          desk.id === roomId
            ? { ...desk, activeCount: Math.max(0, desk.activeCount - 1), joined: false }
            : desk
        )
      );
      showToast('Left study desk.', 'info');
    } else {
      setVoiceDesks((prev) =>
        prev.map((desk) => {
          if (desk.id === joinedVoiceId) {
            return { ...desk, activeCount: Math.max(0, desk.activeCount - 1), joined: false };
          }
          if (desk.id === roomId) {
            return { ...desk, activeCount: desk.activeCount + 1, joined: true };
          }
          return desk;
        })
      );
      setJoinedVoiceId(roomId);
      showToast(`Joined Voice Study Desk! Mic connected.`, 'success');
    }
  };

  const handleAskDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtTitle.trim() || !newDoubtDescription.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }
    
    const newDoubt = {
      id: 'm_' + Date.now(),
      type: 'doubt',
      channel: activeChannel,
      user: user?.fullName || 'Swathi Hani',
      role: user?.role || 'student',
      title: newDoubtTitle,
      description: newDoubtDescription,
      time: 'Just now',
      avatar: user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender),
      upvotes: 0,
      upvotedBy: [],
      status: 'unresolved',
      isPinned: false,
      answers: []
    };

    setCommunityMessages((prev) => [newDoubt, ...prev]);
    setNewDoubtTitle('');
    setNewDoubtDescription('');
    setNewDoubtModalOpen(false);
    triggerXpReward(10, 'Doubt Asked! +10 XP');
    showToast('Your academic doubt has been posted! +10 XP earned.', 'success');
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    let postType = 'discussion';
    let title = 'Discussion Post';
    let desc = newMessageText;
    
    if (newMessageText.startsWith('?')) {
      postType = 'doubt';
      title = 'Quick Academic Question';
      desc = newMessageText.substring(1).trim();
    } else if (newMessageText.startsWith('/poll')) {
      postType = 'poll';
      title = 'Quick Community Poll';
      const parts = newMessageText.replace('/poll', '').split(';');
      title = parts[0]?.trim() || 'Community Poll';
      const opts = parts.slice(1).map(o => ({ label: o.trim(), votes: 0 })) || [{ label: 'Yes', votes: 0 }, { label: 'No', votes: 0 }];
      const newPoll = {
        id: 'm_' + Date.now(),
        type: 'poll',
        channel: activeChannel,
        user: user?.fullName || 'Swathi Hani',
        role: user?.role || 'student',
        title: title,
        description: 'Voted by community members',
        time: 'Just now',
        avatar: user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender),
        pollOptions: opts,
        totalVotes: 0,
        votedOption: null,
        upvotes: 0,
        upvotedBy: []
      };
      setCommunityMessages((prev) => [newPoll, ...prev]);
      setNewMessageText('');
      showToast('Poll created successfully!', 'success');
      return;
    }

    const newMsg = {
      id: 'm_' + Date.now(),
      type: postType,
      channel: activeChannel,
      user: user?.fullName || 'Swathi Hani',
      role: user?.role || 'student',
      title: title,
      description: desc,
      time: 'Just now',
      avatar: user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender),
      upvotes: 0,
      upvotedBy: [],
      answers: [],
      replies: []
    };

    setCommunityMessages((prev) => [newMsg, ...prev]);
    setNewMessageText('');
    triggerXpReward(5, 'Message Posted! +5 XP');
    showToast('Post added to channel! +5 XP earned.', 'success');
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessageText.trim() || !selectedDoubtForThread) return;

    const newReply = {
      id: 'ans_' + Date.now(),
      user: user?.fullName || 'Swathi Hani',
      role: user?.role || 'student',
      avatar: user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender),
      text: replyMessageText,
      time: 'Just now',
      upvotes: 0,
      isAccepted: false
    };

    setCommunityMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === selectedDoubtForThread.id) {
          const updatedAnswers = [...(msg.answers || []), newReply];
          const updatedMsg = { ...msg, answers: updatedAnswers };
          setSelectedDoubtForThread(updatedMsg);
          return updatedMsg;
        }
        return msg;
      })
    );

    setReplyMessageText('');
    triggerXpReward(5, 'Replied! +5 XP');
    showToast('Reply added to discussion thread. +5 XP earned.', 'success');
  };

  const handleVotePoll = (msgId: string, optIndex: number) => {
    setCommunityMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          if (msg.votedOption !== null) {
            showToast('You have already voted in this poll.', 'error');
            return msg;
          }
          const updatedOptions = msg.pollOptions.map((opt: any, idx: number) => {
            if (idx === optIndex) {
              return { ...opt, votes: opt.votes + 1 };
            }
            return opt;
          });
          triggerXpReward(5, 'Voted in Poll! +5 XP');
          showToast('Vote recorded! +5 XP earned.', 'success');
          return {
            ...msg,
            pollOptions: updatedOptions,
            totalVotes: msg.totalVotes + 1,
            votedOption: optIndex
          };
        }
        return msg;
      })
    );
  };
  // --- END COMMUNITY HUB STATES & MOCK DATA ---

  const [unlockedResources, setUnlockedResources] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studycircle_unlocked_resources');
      return saved ? JSON.parse(saved) : ['dsa-notes'];
    }
    return ['dsa-notes'];
  });

  const [claimedTodayReward, setClaimedTodayReward] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studycircle_claimed_today_reward') === 'true';
    }
    return false;
  });

  const resourcesList = [
    {
      id: 'dsa-notes',
      title: 'DSA Complete Notes',
      category: 'Notes',
      description: 'Comprehensive Data Structures and Algorithms lecture reference notes.',
      coinsReq: 150,
      streakReq: 7,
      hoursReq: 0,
      levelReq: 1
    },
    {
      id: 'dsa-cheatsheet',
      title: 'DSA Cheat Sheet',
      category: 'Cheatsheets',
      description: 'Quick reference cheat sheet for standard algorithms and complexities.',
      coinsReq: 50,
      streakReq: 0,
      hoursReq: 0,
      levelReq: 1
    },
    {
      id: 'interview-quest-bank',
      title: 'Interview Question Bank',
      category: 'Practice',
      description: 'Frequently asked interview coding questions, logic tests, and solutions.',
      coinsReq: 350,
      streakReq: 0,
      hoursReq: 0,
      levelReq: 1
    },
    {
      id: 'system-design',
      title: 'System Design Basics',
      category: 'Videos',
      description: 'Beginner to advanced system design video lectures and architectures.',
      coinsReq: 200,
      streakReq: 0,
      hoursReq: 5,
      levelReq: 3
    },
    {
      id: 'leetcode-patterns',
      title: 'LeetCode Patterns',
      category: 'Practice',
      description: 'Top coding patterns with curated problems, explanations and solutions.',
      coinsReq: 250,
      streakReq: 0,
      hoursReq: 10,
      levelReq: 5
    },
    {
      id: 'clean-code',
      title: 'Clean Code (PDF)',
      category: 'Books',
      description: 'A handbook of agile software craftsmanship, code styling and readability.',
      coinsReq: 300,
      streakReq: 5,
      hoursReq: 12,
      levelReq: 5
    },
    {
      id: 'aptitude-guide',
      title: 'Aptitude Master Guide',
      category: 'Practice',
      description: 'Complete quantitative and logical aptitude preparation with tips.',
      coinsReq: 500,
      streakReq: 0,
      hoursReq: 20,
      levelReq: 6
    },
    {
      id: 'interview-kit',
      title: 'Interview Preparation Kit',
      category: 'Practice',
      description: 'Comprehensive HR, technical, coding interview guide with answers.',
      coinsReq: 700,
      streakReq: 15,
      hoursReq: 25,
      levelReq: 8
    },
    {
      id: 'cs-fundamentals',
      title: 'CS Fundamentals',
      category: 'Notes',
      description: 'Crucial Operating Systems, DBMS and Computer Networks concepts.',
      coinsReq: 800,
      streakReq: 0,
      hoursReq: 30,
      levelReq: 10
    },
    {
      id: 'faang-pack',
      title: 'FAANG Resource Pack',
      category: 'Courses',
      description: 'Mock interviews, resume templates and coding sheets from FAANG engineers.',
      coinsReq: 1000,
      streakReq: 30,
      hoursReq: 50,
      levelReq: 12
    }
  ];

  const handleUnlockResource = (id: string, coinsReq: number) => {
    if (typeof window !== 'undefined') {
      const updated = [...unlockedResources, id];
      setUnlockedResources(updated);
      localStorage.setItem('studycircle_unlocked_resources', JSON.stringify(updated));
      showToast('Resource unlocked successfully!', 'success');
    }
  };

  const handleClaimTodayReward = () => {
    setClaimedTodayReward(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('studycircle_claimed_today_reward', 'true');
    }
    if (!unlockedResources.includes('dsa-cheatsheet')) {
      const updated = [...unlockedResources, 'dsa-cheatsheet'];
      setUnlockedResources(updated);
      localStorage.setItem('studycircle_unlocked_resources', JSON.stringify(updated));
    }
    showToast('Success! DSA Cheat Sheet has been added to your unlocked resources.', 'success');
  };

  const getNextUnlockProgress = (res: any) => {
    const reqs = [];
    if (res.coinsReq > 0) reqs.push(Math.min(100, (stats.focusCoins / res.coinsReq) * 100));
    if (res.streakReq > 0) reqs.push(Math.min(100, (stats.streakCount / res.streakReq) * 100));
    if (res.hoursReq > 0) reqs.push(Math.min(100, (stats.totalStudyHours / res.hoursReq) * 100));
    if (res.levelReq > 1) reqs.push(Math.min(100, (stats.level / res.levelReq) * 100));
    
    if (reqs.length === 0) return 100;
    const sum = reqs.reduce((a, b) => a + b, 0);
    return Math.round(sum / reqs.length);
  };

  const getNextUnlockNudge = (res: any) => {
    const missing = [];
    if (stats.focusCoins < res.coinsReq) {
      missing.push(`${res.coinsReq - stats.focusCoins} more coins`);
    }
    if (res.streakReq > 0 && stats.streakCount < res.streakReq) {
      missing.push(`${res.streakReq - stats.streakCount} more streak days`);
    }
    if (res.hoursReq > 0 && stats.totalStudyHours < res.hoursReq) {
      missing.push(`${(res.hoursReq - stats.totalStudyHours).toFixed(1)} more study hours`);
    }
    if (res.levelReq > 1 && stats.level < res.levelReq) {
      missing.push(`Level ${res.levelReq} (currently Level ${stats.level})`);
    }
    
    if (missing.length === 0) return "Ready to unlock!";
    return `Need: ${missing.join(', ')}`;
  };

  // Join Circle States
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  // Create Circle States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupSubject, setGroupSubject] = useState('');
  const [groupIsPublic, setGroupIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  // Loading stats indicator
  const [refreshing, setRefreshing] = useState(false);

  // Live date display state (to prevent Next hydration warning)
  const [formattedDate, setFormattedDate] = useState('Saturday, June 11, 2026');

  // Notifications states
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // STUDENT SPECIFIC STATES & HANDLERS
  // ==========================================
  const [goals, setGoals] = useState([
    { id: 'g1', text: 'DBMS Unit 3 syllabus overview', completed: false },
    { id: 'g2', text: 'Aptitude Practice Set 5 problems', completed: false },
    { id: 'g3', text: 'Read OS Concurrency section notes', completed: false }
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(new Date().getDate());
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [roomMuted, setRoomMuted] = useState(false);
  const [roomCamOff, setRoomCamOff] = useState(false);
  const [roomSeconds, setRoomSeconds] = useState(0);

  const [notesList, setNotesList] = useState<any[]>([]);

  const [newNoteName, setNewNoteName] = useState('');
  const [newNoteSize, setNewNoteSize] = useState('1.5 MB');
  const [newNoteCategory, setNewNoteCategory] = useState('syllabus');

  // Ticking logic for study timer
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Ticking logic for video room session
  useEffect(() => {
    let interval: any = null;
    if (activeRoom) {
      interval = setInterval(() => {
        setRoomSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRoomSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRoom]);

  // Handle saving stopwatch session hours to student progress
  const handleSaveTimerSession = () => {
    setTimerActive(false);
    const hoursEarned = Number((timerSeconds / 3600).toFixed(2));
    if (timerSeconds > 0) {
      if (hoursEarned > 0) {
        setStats(prev => ({
          ...prev,
          totalStudyHours: Number((prev.totalStudyHours + hoursEarned).toFixed(2))
        }));
      }
      showToast(`Stopwatch saved successfully! Added ${hoursEarned} hours to your study log.`, 'success');
      completeMission('complete_session');
    }
    setTimerSeconds(0);
  };

  // Onboarding Wizard Save
  const handleSaveOnboardingWizard = async () => {
    if (!wizardGoal) {
      showToast('Please select a goal target.', 'error');
      return;
    }
    setSavingOnboarding(true);
    try {
      const data = await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          learningGoal: wizardGoal,
          learningLevel: wizardLevel,
          dailyTarget: wizardTarget
        })
      });
      setUser(data.user);
      setShowOnboardingWizard(false);
      showToast('Curriculum personalized successfully! Welcome onboard.', 'success');
      loadDashboardData(data.user);
    } catch (err: any) {
      showToast('Error saving personalization goal: ' + (err.message || err), 'error');
    } finally {
      setSavingOnboarding(false);
    }
  };

  // Buy Shop Item
  const handleBuyShopItem = async (itemId: string, cost: number, itemLabel: string, itemType: string = 'badge') => {
    if (stats.focusCoins < cost) {
      showToast('Insufficient Focus Coins!', 'error');
      return;
    }
    try {
      const data = await apiRequest('/progress/purchase-reward', {
        method: 'POST',
        body: JSON.stringify({
          rewardId: itemId,
          cost,
          type: itemType,
          value: itemLabel
        })
      });

      setStats(prev => ({
        ...prev,
        focusCoins: data.focusCoins,
        badges: data.badges
      }));

      // Update local user state as well if there's any cache
      if (user) setUser({ ...user, focusCoins: data.focusCoins, badges: data.badges });

      showToast(`Successfully unlocked ${itemLabel}!`, 'success');
    } catch (err: any) {
      showToast('Error unlocking item: ' + (err.message || err), 'error');
    }
  };

  // Equip Title
  const handleEquipTitle = async (title: string) => {
    try {
      const cleanTitle = title.replace(/"/g, '');
      const data = await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          bio: cleanTitle
        })
      });
      setUser(data.user);
      showToast(`Equipped title: ${cleanTitle}!`, 'success');
    } catch (err: any) {
      showToast('Error equipping title: ' + (err.message || err), 'error');
    }
  };

  // Complete Mission Item
  const completeMission = (missionId: string) => {
    setDailyMissions(prev => {
      const mission = prev.find(m => m.id === missionId);
      if (mission && !mission.completed) {
        const updated = prev.map(m => m.id === missionId ? { ...m, completed: true } : m);
        
        // Save to DB (debounced)
        if (debouncedSyncMissions.current) {
          debouncedSyncMissions.current(updated);
        }

        // Show gamification alerts
        setCompletedMissionAlert({ text: mission.text, xp: mission.xp });
        setShowConfetti(true);

        // Clear and set timeout to hide alerts
        if (missionsTimeoutRef.current) clearTimeout(missionsTimeoutRef.current);
        missionsTimeoutRef.current = setTimeout(() => {
          setCompletedMissionAlert(null);
          setShowConfetti(false);
        }, 4000);

        return updated;
      }
      return prev;
    });
  };

  const handleClaimDailyReward = async () => {
    if (claimedDailyReward) return;
    try {
      const data = await apiRequest('/progress/complete-practice', {
        method: 'POST',
        body: JSON.stringify({ interest: 'Daily Mission', challengeId: 'daily_mission', xpReward: 100, coinReward: 20 })
      });
      setStats(prev => ({
        ...prev,
        xp: data.xp,
        focusCoins: data.focusCoins,
        streakCount: data.streakCount,
        level: data.level
      }));
      setClaimedDailyReward(true);
      showToast('Daily Missions complete! +100 XP and +20 Focus Coins claimed.', 'success');
    } catch (err: any) {
      showToast('Error claiming mission reward: ' + (err.message || err), 'error');
    }
  };

  const getQuestionHint = (q: any) => {
    if (!q) return 'Think about the core concept and eliminate incorrect options.';
    const title = (q.title || '').toLowerCase();
    const text = (q.question || '').toLowerCase();
    
    if (title.includes('complexity') || text.includes('complexity') || text.includes('time complexity')) {
      return 'Analyze how the number of operations scales with the size of the input (n).';
    }
    if (title.includes('stack') || text.includes('stack')) {
      return 'Think about a stack of plates: the last plate placed is the first one removed.';
    }
    if (title.includes('queue') || text.includes('queue')) {
      return 'Think about a standing queue line: the first person to enter is the first to leave.';
    }
    if (title.includes('binary search') || text.includes('binary search') || title.includes('bst')) {
      return 'Consider how cutting the search space in half at each step affects the path.';
    }
    if (title.includes('http') || text.includes('http')) {
      return 'Remember HTTP status categories: 1xx Info, 2xx Success, 3xx Redirect, 4xx Client Error, 5xx Server Error.';
    }
    if (title.includes('react') || text.includes('react') || text.includes('hook')) {
      return 'Think about React functional components, state preservation, and rendering cycles.';
    }
    if (title.includes('closure') || text.includes('closure')) {
      return 'Consider lexical scope and how inner functions retain access to outer variables.';
    }
    
    return 'Review the core terminology and check how each option aligns with the scenario.';
  };

  const handleVerifyQuizAnswer = async () => {
    if (practiceQuizAnswer === null) {
      setPracticeQuizErrorMessage('❌ Please select an option before verifying.');
      return;
    }
    const q = practiceSessionQuestions[activeQuestionIndex];
    if (!q) return;

    if (practiceQuizAnswer === q.correctOptionIndex) {
      try {
        const data = await apiRequest('/progress/complete-practice', {
          method: 'POST',
          body: JSON.stringify({ interest: selectedInterest, challengeId: `${selectedInterest}_q${activeQuestionIndex}` })
        });
        setStats(prev => ({
          ...prev,
          xp: data.xp,
          focusCoins: data.focusCoins,
          streakCount: data.streakCount,
          level: data.level
        }));
        
        const successMsgs = ['✔ Excellent!', '🎉 Great job!', '🚀 Correct! Keep going.', '⭐ Well done!', "💯 That's the right answer."];
        const randomSuccess = successMsgs[Math.floor(Math.random() * successMsgs.length)];
        
        setPracticeQuizFeedback('correct');
        setPracticeQuizErrorMessage(randomSuccess);
        setPracticeQuizAttempts(0);
        setShowQuizHint(false);
        setPracticeSessionScore(prev => prev + 1);
        completeMission('quiz');
      } catch (err: any) {
        setPracticeQuizErrorMessage('❌ Error saving practice progress: ' + (err.message || err));
      }
    } else {
      const nextAttempts = practiceQuizAttempts + 1;
      setPracticeQuizAttempts(nextAttempts);
      
      const encouragingMsgs = [
        '🤔 Not quite. Take another look.',
        '💡 Good attempt! Think once more.',
        "🔍 You're very close. Read the question carefully.",
        '🌟 Keep trying—you can solve this.',
        '🧠 Recheck the options before choosing again.',
        '🚀 Nice effort! Give it another shot.'
      ];
      const randomEncouraging = encouragingMsgs[Math.floor(Math.random() * encouragingMsgs.length)];
      
      if (nextAttempts >= 3) {
        setPracticeQuizFeedback('wrong');
        setPracticeQuizErrorMessage(`❌ Incorrect after 3 attempts. Correct option: ${String.fromCharCode(65 + q.correctOptionIndex)}`);
        setShowQuizHint(false);
      } else {
        setPracticeQuizFeedback(null);
        setPracticeQuizErrorMessage(randomEncouraging);
        if (nextAttempts >= 2) {
          setShowQuizHint(true);
        }
      }
    }
  };

  const handleNextQuestion = () => {
    setPracticeQuizAnswer(null);
    setPracticeQuizFeedback(null);
    setPracticeQuizErrorMessage(null);
    setPracticeQuizAttempts(0);
    setShowQuizHint(false);
    
    if (activeQuestionIndex + 1 < practiceSessionQuestions.length) {
      setActiveQuestionIndex(prev => prev + 1);
    } else {
      setPracticeSessionCompleted(true);
    }
  };

  const handleRestartPracticeSession = () => {
    setQuestionsCountLimit(null);
    setActiveQuestionIndex(0);
    setPracticeSessionQuestions([]);
    setPracticeSessionCompleted(false);
    setPracticeSessionScore(0);
    setPracticeQuizAnswer(null);
    setPracticeQuizFeedback(null);
    setPracticeQuizErrorMessage(null);
    setPracticeQuizAttempts(0);
    setShowQuizHint(false);
  };

  const handleRunCodeTests = () => {
    setPracticeConsoleLogs([
      'Compiling code...',
      'Executing main() test script...',
      '> factorial(5) === 120 (PASSED)',
      '> factorial(1) === 1 (PASSED)',
      '> factorial(0) === 1 (PASSED)',
      'All test assertions passed successfully!'
    ]);
    setPracticeTested(true);
    showToast('All compiler test cases passed! Submit your validation now.', 'success');
  };

  const handleSubmitPracticeCode = async () => {
    if (!practiceTested) return;
    try {
      const data = await apiRequest('/progress/complete-practice', {
        method: 'POST',
        body: JSON.stringify({ interest: selectedInterest, challengeId: selectedInterest })
      });
      setStats(prev => ({
        ...prev,
        xp: data.xp,
        focusCoins: data.focusCoins,
        streakCount: data.streakCount,
        level: data.level
      }));
      setCompletedPracticeChallenges(prev => [...prev, selectedInterest]);
      showToast('Challenge solved! Streak updated. +50 XP and +20 Focus Coins added!', 'success');
    } catch (err: any) {
      showToast('Error submitting code: ' + (err.message || err), 'error');
    }
  };


  const handleToggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoals(prev => [...prev, { id: 'g-' + Date.now(), text: newGoalText.trim(), completed: false }]);
    setNewGoalText('');
    showToast('Goal added to checklist!', 'success');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast('Goal removed.', 'info');
  };

  const handleToggleNoteBookmark = async (id: string) => {
    try {
      const data = await apiRequest(`/shared-notes/${id}/bookmark`, {
        method: 'POST'
      });
      showToast(data.message || 'Bookmark updated!', 'success');
      setNotesList(prev => prev.map(n => {
        if (n.id === id) {
          return { ...n, isBookmarked: data.bookmarked };
        }
        return n;
      }));
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle bookmark.', 'error');
    }
  };

  const handlePublishSharedNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteName.trim()) return;

    try {
      const response = await apiRequest('/shared-notes', {
        method: 'POST',
        body: JSON.stringify({
          name: newNoteName.trim(),
          size: newNoteSize.trim() || '1.5 MB',
          type: newNoteCategory
        })
      });

      showToast(response.message || `Shared note "${newNoteName}" published successfully!`, 'success');
      completeMission('upload_notes');
      handleAwardCredits('upload_notes');

      // Refresh shared notes list
      const notesData = await apiRequest('/shared-notes');
      setNotesList(notesData.notes || []);

      setNewNoteName('');
      setNewNoteSize('1.5 MB');
      setNewNoteCategory('syllabus');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish shared note.', 'error');
    }
  };

  const handleGenerateStudyReport = () => {
    const totalGoalsCount = goals.length;
    const completedGoalsCount = goals.filter(g => g.completed).length;

    const reportText = `# StudyCircle Weekly Analytics Report
Generated on: ${new Date().toLocaleDateString()}
Student Profile: ${user?.fullName || 'User'} (@${user?.username || ''})

## 📊 Consistency & Focus metrics
- **Current Day Streak**: ${stats.streakCount} Days desking
- **Total Hours Studied**: ${stats.totalStudyHours.toFixed(2)} Hours desking
- **Completed Study Goals**: ${completedGoalsCount} of ${totalGoalsCount} daily targets met

## 🕒 Weekly Desking Hours Allocation
- Monday: 2.5 Hrs (DBMS)
- Tuesday: 1.5 Hrs (OS)
- Wednesday: 3.0 Hrs (DSA Placement Prep)
- Thursday: 2.0 Hrs (Computer Networks)
- Friday: 1.0 Hrs (OS)
- Saturday: 3.5 Hrs (Practice Lab)
- Sunday: Rest / Review

## 🎓 Subject Focus Breakdown
- **Algorithms / DSA placement**: 35% (Core priority)
- **Database Management Systems**: 25% (High consistency)
- **Computer Networks**: 20% (Main cohort session)
- **Operating Systems**: 20% (Target improvement)

## 💡 AI Study Plan & Recommendations
Based on your desking logs and consistency, the AI tutor recommends:
1. **Operating Systems Revision**: Your engagement in OS desking rooms dropped by 12% this week. Schedule a 45-minute active recall session on Concurrency Control and Semaphores.
2. **DSA Streaks**: Maintain the algorithm desking streak. Continue practice with graph algorithms (BFS/DFS) to earn the batch solver badge.
3. **Mock Exam Booking**: The next cohort session for Computer Networks is scheduled in 2 days. Bookmark the lecture summary before entering.

*Tip: Join the desking rooms in the evening (7 PM - 10 PM) when student desking activity peaks for peer doubts-solving.*
`;

    const element = document.createElement("a");
    const file = new Blob([reportText], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `StudyCircle_Weekly_Report_${(user?.fullName || 'User').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Weekly progress report generated and downloaded as Markdown!', 'success');
  };

  const handleDownloadNote = (id: string, name: string) => {
    setNotesList(prev => prev.map(n => n.id === id ? { ...n, downloaded: true } : n));
    
    const element = document.createElement("a");
    const studyContent = `StudyCircle Premium Resource: ${name}\n\nThis is a placement preparation syllabus reference notes document compiled for study circles.\nLogged focus time: ${stats.totalStudyHours}h\nConsistency streak: ${stats.streakCount} days\n\nEnjoy co-studying!\nStudyCircle Team.`;
    const file = new Blob([studyContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = name.endsWith('.pdf') ? name.replace('.pdf', '.txt') : `${name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`Downloading: ${name}`, 'success');
  };

  // ==========================================
  // MENTOR SPECIFIC STATES & HANDLERS
  // ==========================================
  const [atRiskStudents, setAtRiskStudents] = useState([
    { id: 's1', name: 'Ravi', detail: 'Inactive 5 days', status: 'critical', nudged: false },
    { id: 's2', name: 'Karthik', detail: 'Missed 3 sessions', status: 'critical', nudged: false },
    { id: 's3', name: 'Anjali', detail: 'Study hours dropped 40%', status: 'warning', nudged: false }
  ]);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [nudgeStudentName, setNudgeStudentName] = useState('');
  const [showNudgeModal, setShowNudgeModal] = useState(false);

  // Mentor Modals
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessTitle, setSessTitle] = useState('');
  const [sessTime, setSessTime] = useState('');
  const [sessSubject, setSessSubject] = useState('');

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState('');

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  const [mockSessions, setMockSessions] = useState([
    { id: 'sess-1', title: 'DBMS Study Session', time: 'Today, 06:00 PM - 07:30 PM', status: 'Live Now', subject: 'DBMS' },
    { id: 'sess-2', title: 'Operating Systems', time: 'Today, 08:00 PM - 09:00 PM', status: 'Upcoming', subject: 'OS' },
    { id: 'sess-3', title: 'Data Structures Practicum', time: 'Tomorrow, 06:00 PM - 07:30 PM', status: 'Upcoming', subject: 'Algorithms' },
  ]);

  const handleNudgeStudent = (id: string, name: string) => {
    setNudgeStudentName(name);
    setNudgeMessage(`Hi ${name}, just wanted to remind you to keep up your focus streak! Let me know if you need any resources or study logs.`);
    setShowNudgeModal(true);
  };

  const submitNudge = () => {
    setAtRiskStudents(prev => prev.map(s => s.name === nudgeStudentName ? { ...s, nudged: true } : s));
    showToast(`Nudge alert successfully delivered to ${nudgeStudentName}!`, 'success');
    setShowNudgeModal(false);
  };

  const getCalendarSessions = (day: number) => {
    const today = new Date().getDate();
    if (day === today) {
      return [
        { id: 'cal-sess-1', title: 'DBMS Study Session', time: '06:00 PM - 07:30 PM', status: 'Live Now', subject: 'DBMS' },
        { id: 'cal-sess-2', title: 'Operating Systems Revision', time: '08:00 PM - 09:00 PM', status: 'Upcoming', subject: 'OS' },
      ];
    } else if (day === today + 1) {
      return [
        { id: 'cal-sess-3', title: 'Data Structures Practicum', time: '06:00 PM - 07:30 PM', status: 'Upcoming', subject: 'Algorithms' }
      ];
    } else if (day === today + 2) {
      return [
        { id: 'cal-sess-4', title: 'Computer Networks Quiz', time: '04:00 PM - 05:00 PM', status: 'Upcoming', subject: 'Networks' }
      ];
    } else if (day === today - 1) {
      return [
        { id: 'cal-sess-prev', title: 'DBMS Normalization Review', time: '03:00 PM - 04:30 PM', status: 'Completed', subject: 'DBMS' }
      ];
    }
    return [];
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessTitle || !sessTime) {
      showToast('Title and Time are required.', 'error');
      return;
    }
    const newSession = {
      id: 'sess-' + Date.now(),
      title: sessTitle,
      time: sessTime,
      status: 'Upcoming',
      subject: sessSubject || 'General'
    };
    setMockSessions(prev => [newSession, ...prev]);
    showToast(`Study Session "${sessTitle}" created & students alerted!`, 'success');
    setShowSessionModal(false);
    setSessTitle('');
    setSessTime('');
    setSessSubject('');
  };

  const triggerEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setEditNoteName(note.name);
    setEditNoteSize(note.size);
    setEditNoteCategory(note.type || 'syllabus');
    setShowEditNoteModal(true);
  };

  const handleEditSharedNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteId || !editNoteName.trim()) return;
    setEditingNote(true);
    try {
      const response = await apiRequest(`/shared-notes/${editingNoteId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editNoteName.trim(),
          size: editNoteSize.trim() || '1.5 MB',
          type: editNoteCategory
        })
      });

      showToast(response.message || 'Shared note updated successfully!', 'success');
      setShowEditNoteModal(false);

      // Refresh shared notes list
      const notesData = await apiRequest('/shared-notes');
      setNotesList(notesData.notes || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to update shared note.', 'error');
    } finally {
      setEditingNote(false);
    }
  };

  const triggerEditSession = (sess: any) => {
    setEditingSessionId(sess.id);
    setEditSessTitle(sess.title);
    setEditSessTime(sess.time);
    setEditSessSubject(sess.subject);
    setEditSessStatus(sess.status || 'Upcoming');
    setShowEditSessionModal(true);
  };

  const handleEditSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSessionId || !editSessTitle.trim() || !editSessTime.trim()) {
      showToast('Title and Time are required.', 'error');
      return;
    }
    setMockSessions(prev => prev.map(s => s.id === editingSessionId ? {
      ...s,
      title: editSessTitle,
      time: editSessTime,
      subject: editSessSubject || 'General',
      status: editSessStatus
    } : s));
    showToast(`Study Session updated successfully!`, 'success');
    setShowEditSessionModal(false);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;
    showToast('Announcement posted to class announcement channel!', 'success');
    setShowAnnouncementModal(false);
    setAnnouncementMsg('');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle) return;
    showToast(`Assignment "${assignTitle}" published successfully.`, 'success');
    setShowAssignmentModal(false);
    setAssignTitle('');
    setAssignDueDate('');
  };

  // Prefill modals from AI suggestions
  const triggerPrefilledSession = (subjectName: string) => {
    setSessSubject(subjectName);
    setSessTitle(`${subjectName} Revision & Doubts Clearing`);
    setSessTime('Saturday, 05:00 PM - 06:30 PM');
    setShowSessionModal(true);
  };

  const triggerPrefilledAnnouncement = (msg: string) => {
    setAnnouncementMsg(msg);
    setShowAnnouncementModal(true);
  };

  // ==========================================
  // ADMIN SPECIFIC STATES & TICKERS
  // ==========================================
  const [adminLogs, setAdminLogs] = useState<string[]>([
    '[SYSTEM] Bootstrapping StudyCircle platform metrics API...',
    '[AUTH] SECURE VERIFICATION CORE: Active',
    '[SQLITE] Connected to database: CWD/database.sqlite',
    '[ROUTING] Live websocket session router connected.'
  ]);

  // System logs simulation ticker
  useEffect(() => {
    if (!user || user.role !== 'admin' || activeTab !== 'dashboard') return;

    const logMessages = [
      '[SOCKET] Peer connected from Vizag cluster node - 172.24.8.4',
      '[ROOM] Room "DBMS Prep Session" initialized for active video streams.',
      '[AUTH] User verification token approved for student @swathi.vijayawada.',
      '[SQLITE] SELECT * FROM Users WHERE role="mentor" AND isApproved=0',
      '[API] GET /groups/available 200 OK - 8ms',
      '[SYSTEM] CPU load: 4.2%, RAM utilization: 58%',
      '[ROOM] student Charan entered live room OS Room',
      '[SQLITE] UPDATE Users SET totalStudyHours = totalStudyHours + 1.2 WHERE id=1',
      '[INFO] Garbage collection sync completed. Saved 14.8MB memory.'
    ];

    const interval = setInterval(() => {
      const randomMsg = logMessages[Math.floor(Math.random() * logMessages.length)];
      const stamp = new Date().toLocaleTimeString();
      setAdminLogs(prev => [...prev.slice(-15), `[${stamp}] ${randomMsg}`]);
    }, 4500);

    return () => clearInterval(interval);
  }, [user, activeTab]);

  // ==========================================
  // INITIALIZATION AND SYNC
  // ==========================================
  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle Mark All Read
  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    showToast('All notifications marked as read', 'success');
  };

  // Handle click on notification item
  const handleNotificationClick = async (notif: any) => {
    await markNotificationRead(notif.id);
    setShowNotifications(false);
    if (notif.actionTab) {
      setActiveTab(notif.actionTab as TabType);
    }
    showToast('Viewing notification details', 'info');
  };

  useEffect(() => {
    if (!globalLoading) {
      if (!user) {
        setLoading(false);
        dataLoadedRef.current = false;
        return;
      }
      setEditFullName(user.fullName || '');
      setEditFirstName(user.firstName || '');
      setEditLastName(user.lastName || '');
      setEditEmail(user.email || '');
      setEditPhone(user.phone || '');
      setPreviewAvatar(user.avatarUrl || '');
      setEditBio(user.bio || '');

      // Trigger Onboarding Questionnaire if learningGoal is unset
      if (user.role === 'student' && !user.learningGoal) {
        setShowOnboardingWizard(true);
      }

      // Hydrate daily missions from database/user profile
      if (user.dailyMissions) {
        try {
          const parsed = typeof user.dailyMissions === 'string' ? JSON.parse(user.dailyMissions) : user.dailyMissions;
          setDailyMissions(parsed);
        } catch (e) {
          console.error("Error parsing user.dailyMissions", e);
        }
      } else {
        const fresh = [
          { id: 'join_circle', text: 'Join Study Circle', completed: false, xp: 30 },
          { id: 'attend_session', text: 'Attend Session', completed: false, xp: 30 },
          { id: 'upload_notes', text: 'Upload Notes', completed: false, xp: 40 },
          { id: 'complete_session', text: 'Complete Session', completed: false, xp: 50 }
        ];
        setDailyMissions(fresh);
      }
      
      if (!dataLoadedRef.current) {
        dataLoadedRef.current = true;
        loadDashboardData(user);
      }

      // Set current date on client side
      const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      setFormattedDate(dateStr);
    }
  }, [user, globalLoading]);

  const checkUserGoldenFrame = (userObj: any) => {
    if (!userObj || !userObj.badges) return false;
    try {
      const badgesArr = typeof userObj.badges === 'string' ? JSON.parse(userObj.badges) : userObj.badges;
      return Array.isArray(badgesArr) && badgesArr.some((b: any) => b === 'avatar_frame_exclusive' || (b && b.id === 'avatar_frame_exclusive'));
    } catch (e) {
      return false;
    }
  };

  const fetchGlobalLeaderboards = async () => {
    setLeaderboardLoading(true);
    try {
      const data = await apiRequest('/progress/global-leaderboards');
      setLeaderboardData(data);
    } catch (e: any) {
      console.error('Error fetching global leaderboards:', e);
      showToast('Error loading global leaderboards.', 'error');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleAwardCredits = async (action: 'join_session' | 'upload_notes' | 'help_doubts' | 'daily_login') => {
    try {
      const data = await apiRequest('/progress/award-credits', {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      setStats(prev => ({
        ...prev,
        focusCoins: data.focusCoins,
        xp: data.xp,
        level: data.level
      }));
      if (data.leveledUp) {
        showToast(`🎉 Level Up! You reached Level ${data.level}!`, 'success');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else if (data.actualXpAwarded > 0) {
        showToast(`${data.message} (+${data.actualXpAwarded} XP, +${action === 'join_session' ? 10 : action === 'upload_notes' ? 20 : action === 'help_doubts' ? 30 : 5} Coins)`, 'success');
      } else {
        showToast(data.message, 'info');
      }
    } catch (err: any) {
      console.error('Error awarding credits:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard' || (activeTab === 'community' && communitySubView === 'leaderboard')) {
      fetchGlobalLeaderboards();
    }
  }, [activeTab, communitySubView]);

  // Context-Aware AI Tutor Context Sync Effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let context = 'Student Dashboard Overview';
      if (activeTab === 'study') {
        if (studySubView === 'workspaces') context = 'My Workspace (Collaborative Peer Groups)';
        else if (studySubView === 'rooms') context = 'Study Rooms (Live Co-Study Desks studying DBMS)';
        else if (studySubView === 'resources') context = 'Study Resources Vault';
        else context = 'Study Directory';
      } else if (activeTab === 'practice') {
        if (practiceSubView === 'roadmap') context = 'Interactive Placement Preparation Roadmap';
        else if (practiceSubView === 'questions') context = 'DSA & Practice Questions (solving Arrays)';
        else if (practiceSubView === 'mock') context = 'Mock Timed Test Exams';
        else context = 'Practice Playground';
      } else if (activeTab === 'progress') {
        if (progressSubView === 'analytics') context = 'Study Duration Analytics & Consistency Streaks';
        else if (progressSubView === 'xp') context = 'XP Growth Milestones & Badges';
        else if (progressSubView === 'certificates') context = 'Verified Course Checkpoint Certificates';
        else context = 'Student Progress Dashboard';
      } else if (activeTab === 'community') {
        if (communitySubView === 'forum') context = 'Doubts Discussion Forum';
        else if (communitySubView === 'leaderboard') context = 'Global XP Leaderboard';
        else if (communitySubView === 'chat') context = 'Study Lounge Real-Time Chat';
        else context = 'Community Portal';
      } else if (activeTab === 'profile') {
        if (profileSubView === 'details') context = 'My Public Profile';
        else if (profileSubView === 'settings') context = 'Account Settings Configuration';
        else context = 'Profile Dashboard';
      } else if (activeTab === 'settings') {
        context = 'Account Settings Configuration';
      }
      (window as any).aiTutorContext = context;
    }
  }, [activeTab, studySubView, practiceSubView, progressSubView, communitySubView, profileSubView]);

  const loadDashboardData = async (info: any) => {
    setLoading(true);
    try {
      // 0. Fetch latest user details
      try {
        const meData = await apiRequest('/auth/me');
        if (meData.user) {
          setUser(meData.user, meData.token || (typeof window !== 'undefined' ? localStorage.getItem('studycircle_token') : null));
          setEditFullName(meData.user.fullName || '');
          setEditFirstName(meData.user.firstName || '');
          setEditLastName(meData.user.lastName || '');
          setEditEmail(meData.user.email || '');
          setEditPhone(meData.user.phone || '');
          setPreviewAvatar(meData.user.avatarUrl || '');
          setEditBio(meData.user.bio || '');
        }
      } catch (meErr) {
        console.error('Error fetching latest user details:', meErr);
      }

      // 1. Fetch user stats
      const statsData = await apiRequest('/progress/me');
      setStats({
        streakCount: statsData.streakCount || 0,
        totalStudyHours: statsData.totalStudyHours || 0.0,
        xp: statsData.xp || 0,
        focusCoins: statsData.focusCoins || 0,
        level: statsData.level || 1,
        department: statsData.department || 'CSE',
        badges: statsData.badges || '[]'
      });

      // 2. Fetch my groups
      const myGroupsData = await apiRequest('/groups');
      setMyGroups(myGroupsData.groups || []);

      // 3. Fetch available public groups
      const availData = await apiRequest('/groups/available');
      setAvailableGroups(availData.groups || []);

      // 4. Fetch pending approvals if Admin
      if (info.role === 'admin') {
        const pendingData = await apiRequest('/auth/pending-approvals');
        setPendingApprovals(pendingData.pendingUsers || []);
      }

      // Fetch students list if mentor or admin
      if (info.role === 'mentor' || info.role === 'admin') {
        try {
          const studentsData = await apiRequest('/auth/students');
          setStudentsList(studentsData.students || []);
        } catch (studErr) {
          console.error('Error fetching students list:', studErr);
        }
      }

      // 5. Fetch Shared Notes
      const notesData = await apiRequest('/shared-notes');
      setNotesList(notesData.notes || []);
    } catch (e: any) {
      console.error('Error fetching dashboard data:', e);
      showToast(e.message || 'Error loading dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      try {
        const meData = await apiRequest('/auth/me');
        if (meData.user) {
          setUser(meData.user, meData.token || (typeof window !== 'undefined' ? localStorage.getItem('studycircle_token') : null));
          setEditFullName(meData.user.fullName || '');
          setEditFirstName(meData.user.firstName || '');
          setEditLastName(meData.user.lastName || '');
          setEditEmail(meData.user.email || '');
          setEditPhone(meData.user.phone || '');
          setPreviewAvatar(meData.user.avatarUrl || '');
          setEditBio(meData.user.bio || '');
        }
      } catch (meErr) {
        console.error('Error refreshing user details:', meErr);
      }

      const statsData = await apiRequest('/progress/me');
      setStats({
        streakCount: statsData.streakCount || 0,
        totalStudyHours: statsData.totalStudyHours || 0.0,
        xp: statsData.xp || 0,
        focusCoins: statsData.focusCoins || 0,
        level: statsData.level || 1,
        department: statsData.department || 'CSE',
        badges: statsData.badges || '[]'
      });

      const myGroupsData = await apiRequest('/groups');
      setMyGroups(myGroupsData.groups || []);

      const availData = await apiRequest('/groups/available');
      setAvailableGroups(availData.groups || []);

      if (user?.role === 'admin') {
        const pendingData = await apiRequest('/auth/pending-approvals');
        setPendingApprovals(pendingData.pendingUsers || []);
      }

      if (user?.role === 'mentor' || user?.role === 'admin') {
        try {
          const studentsData = await apiRequest('/auth/students');
          setStudentsList(studentsData.students || []);
        } catch (studErr) {
          console.error('Error refreshing students list:', studErr);
        }
      }

      const notesData = await apiRequest('/shared-notes');
      setNotesList(notesData.notes || []);

      if (activeTab === 'leaderboard') {
        try {
          const lbData = await apiRequest('/progress/global-leaderboards');
          setLeaderboardData(lbData);
        } catch (lbErr) {
          console.error('Error refreshing global leaderboards:', lbErr);
        }
      }

      showToast('Dashboard details synced!', 'success');
    } catch (e: any) {
      showToast('Failed to sync data.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const getPlacementReadiness = (student: any) => {
    // Deterministic placement readiness score from study metrics
    const base = 50;
    const hoursBonus = Math.min(25, Math.floor((student.totalStudyHours || 0) * 1.5));
    const levelBonus = Math.min(15, (student.level || 1) * 2);
    const streakBonus = Math.min(10, (student.streakCount || 0) * 0.5);
    return Math.min(99, base + hoursBonus + levelBonus + streakBonus);
  };

  const handleAssignChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForChallenge) return;
    if (!challengeText.trim()) {
      showToast('Challenge description is required.', 'error');
      return;
    }
    setAssigningChallenge(true);
    try {
      const res = await apiRequest('/auth/assign-challenge', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentForChallenge.id,
          challengeText: challengeText.trim(),
          xpReward: challengeXp,
          coinReward: challengeCoins
        })
      });
      showToast(res.message || 'Challenge assigned successfully!', 'success');
      setShowChallengeModal(false);
      setChallengeText('');
      setChallengeXp(150);
      setChallengeCoins(50);
      setSelectedStudentForChallenge(null);
      
      if (user) {
        loadDashboardData(user);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to assign challenge.', 'error');
    } finally {
      setAssigningChallenge(false);
    }
  };

  const handleToggleAmbassador = async (studentId: string) => {
    try {
      const res = await apiRequest('/auth/toggle-ambassador', {
        method: 'POST',
        body: JSON.stringify({ studentId })
      });
      showToast(res.message || 'Ambassador status toggled!', 'success');
      // Update local state instantly
      setStudentsList(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            badges: JSON.stringify(res.badges)
          };
        }
        return s;
      }));
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle Ambassador status.', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim()) {
      showToast('First name and last name are required.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          email: editEmail.trim() || null,
          phone: editPhone.trim() || null,
          avatarUrl: previewAvatar || null,
          bio: editBio.trim()
        })
      });
      
      setUser(res.user, res.token || (typeof window !== 'undefined' ? localStorage.getItem('studycircle_token') : null));
      showToast('Profile updated successfully!', 'success');
      setIsEditingProfile(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleJoinCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      showToast('Please enter an invite code.', 'error');
      return;
    }
    setJoining(true);
    try {
      const data = await apiRequest('/groups/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: inviteCode.trim() })
      });
      showToast(data.message || 'Successfully joined circle!', 'success');
      setInviteCode('');
      completeMission('join_circle');
      loadDashboardData(user);
      setActiveTab('study');
      setStudySubView('workspaces');
    } catch (err: any) {
      showToast(err.message || 'Failed to join group.', 'error');
    } finally {
      setJoining(false);
    }
  };

  const handleJoinPublicCircle = async (groupId: string) => {
    try {
      const data = await apiRequest(`/groups/${groupId}/join-public`, {
        method: 'POST'
      });
      showToast(data.message || 'Successfully joined study circle!', 'success');
      completeMission('join_circle');
      loadDashboardData(user);
      const slug = getSlugByGroup(data.group || { id: groupId, name: data.group?.name || '', subject: data.group?.subject || '' });
      router.push(`/workspace/${slug}`);
    } catch (err: any) {
      if (err.message && (err.message.includes('already') || err.message.includes('Already'))) {
        const matched = availableGroups.find(g => g.id === groupId) || myGroups.find(g => g.id === groupId);
        const slug = matched ? getSlugByGroup(matched) : 'programming-dsa';
        router.push(`/workspace/${slug}`);
      } else {
        showToast(err.message || 'Failed to join public study circle.', 'error');
      }
    }
  };

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !groupSubject.trim()) {
      showToast('Circle Name and Subject are required.', 'error');
      return;
    }
    setCreating(true);
    try {
      const data = await apiRequest('/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: groupName,
          description: groupDesc,
          subject: groupSubject,
          isPublic: groupIsPublic
        })
      });
      showToast(data.message || 'Study Circle initialized!', 'success');
      setShowCreateModal(false);
      setGroupName('');
      setGroupDesc('');
      setGroupSubject('');
      setGroupIsPublic(true);
      loadDashboardData(user);
      if (user?.role === 'student') {
        setActiveTab('study');
        setStudySubView('workspaces');
      } else {
        setActiveTab('groups');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create study circle.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const data = await apiRequest('/auth/approve', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      showToast(data.message || 'Coordinator approved successfully!', 'success');
      setPendingApprovals(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      showToast(err.message || 'Failed to approve account.', 'error');
    }
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('explicit_logout', 'true');
    }
    await logout();
    showToast('Logged out successfully!', 'success');
    router.push('/');
  };

  // Time formatter helpers
  const formatSeconds = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  if (globalLoading || (loading && user) || (!bypassRedirect && user?.role !== 'student')) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-[#D4D4FF]"
      >
        <RefreshCw className="h-8 w-8 text-[#5227EB] animate-spin" />
      </div>
    );
  }

  // ==========================================
  // DYNAMIC SIDEBAR RENDER
  // ==========================================
  const renderSidebar = () => {
    if (user?.role === 'student') {
      return (
        <div className="flex-1 p-4 flex flex-col justify-between text-left relative">
          <div className="space-y-6">
            <span className="text-[9px] font-black text-slate-550 uppercase tracking-widest px-3 block">Appearance Panel</span>
            
            {/* Hanging Lamp theme switcher */}
            <div className="relative flex flex-col items-center pt-2 pb-6 border-b border-white/5 select-none">
              <div 
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="group relative cursor-pointer flex flex-col items-center animate-swing hover:animate-swing-active"
                title="Click the lamp to toggle theme selector"
              >
                {/* Braided Rope */}
                <div className="w-[3px] h-16 bg-[repeating-linear-gradient(45deg,#3A281E,#3A281E_2px,#5C3C24_2px,#5C3C24_4px)] rounded-full shadow-md group-hover:brightness-110 transition-all" />
                
                {/* Metallic loop (ring) */}
                <div className="w-4 h-4 rounded-full border-2 border-slate-600 bg-transparent -mt-1 flex items-center justify-center z-10 shadow-sm" />

                {/* Cylindrical Socket Cap */}
                <div className="w-5 h-2.5 bg-slate-800 border-t border-slate-700 rounded-sm -mt-0.5 z-10 shadow-inner" />
                
                {/* Flared dome lamp shade */}
                <div className="w-14 h-7 bg-slate-900 border border-slate-700 rounded-[50%_50%_15%_15%] shadow-lg relative -mt-0.5 z-10 flex items-center justify-center">
                  <div className="absolute inset-x-0.5 bottom-0 h-[2px] bg-amber-500/20" />
                </div>

                {/* Glowing Lightbulb */}
                <div className="w-6.5 h-6.5 bg-gradient-to-b from-amber-300/30 to-amber-400/10 border border-amber-300/40 rounded-full -mt-1 flex items-center justify-center relative shadow-[0_4px_15px_rgba(245,158,11,0.4)] z-20">
                  <div className="absolute inset-0.5 rounded-full bg-amber-400/5 group-hover:bg-amber-400/20 animate-pulse transition-all" />
                  {/* Filament */}
                  <div className="w-1.5 h-2.5 rounded-t-full bg-white shadow-[0_0_8px_#FFF,0_0_3px_#F59E0B]" />
                </div>
                
                {/* Glowing cone backdrop */}
                <div className="absolute top-24 w-16 h-16 bg-amber-400/5 group-hover:bg-amber-400/15 blur-lg rounded-full pointer-events-none transition-all duration-300" />
                
                {/* Spark particles */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-16 left-[-10px] w-1 h-1 rounded-full bg-amber-400/70 blur-[0.5px] animate-pulse" />
                  <div className="absolute top-20 right-[-8px] w-1.5 h-1.5 rounded-full bg-amber-400/60 blur-[0.5px] animate-pulse delay-75" />
                  <div className="absolute top-24 left-[8px] w-1 h-1 rounded-full bg-amber-300/50 blur-[0.5px] animate-pulse delay-150" />
                </div>
              </div>

              <div className="text-center mt-3.5 space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-350 tracking-wider block font-mono">Appearance</span>
                <span className="text-[8px] font-semibold text-slate-450 block">Click the lamp to change theme</span>
              </div>
            </div>

            {/* Floating theme selection dropdown/popup */}
            {showThemeSelector && (
              <div className="absolute left-4 right-4 bg-slate-950/95 border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 space-y-1 animate-in zoom-in-95 duration-150">
                <div className="text-[8px] font-black uppercase text-slate-555 tracking-wider mb-1 px-2">Theme Selector</div>
                {[
                  { id: 'default', label: '🎨 Default' },
                  { id: 'dark', label: '🌙 Charcoal Dark' },
                  { id: 'light', label: '☀️ Clean Light' },
                  { id: 'midnight', label: '🌌 Midnight Blue' },
                  { id: 'emerald', label: '🌿 Cosmic Emerald' },
                  { id: 'purple', label: '💜 Mystic Purple' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeSelector(false);
                    }}
                    className={`w-full px-2.5 py-1.5 text-left rounded-xl text-[10px] font-bold transition-all border-none flex items-center justify-between cursor-pointer ${
                      theme === t.id 
                        ? 'bg-indigo-650 text-white font-extrabold shadow-sm' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white bg-transparent'
                    }`}
                  >
                    <span>{t.label}</span>
                    {theme === t.id && <span className="text-[9px] text-emerald-450">✓</span>}
                  </button>
                ))}
              </div>
            )}
            
          </div>
        </div>
      );
    }

    // Mentor / Admin Sidebar Groupings
    const groups = [
      {
        title: null,
        links: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }]
      },
      {
        title: 'MANAGE',
        links: [
          { id: 'users', label: 'Users', icon: Users },
          { id: 'groups', label: 'Study Rooms', icon: BookOpen },
          { id: 'sessions', label: 'Sessions', icon: Calendar },
          { id: 'notes', label: 'Notes & Resources', icon: FileText },
          { id: 'reports', label: 'Reports', icon: BarChart2 }
        ]
      },
      {
        title: 'COMMUNITY',
        links: [
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'messages', label: 'Community Hub', icon: Users },
          { id: 'feedback', label: 'Feedback', icon: HelpCircle }
        ]
      },
      {
        title: 'SETTINGS',
        links: [
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'roles', label: 'Roles & Permissions', icon: Shield },
          { id: 'profile', label: 'Profile Settings', icon: UserCheck }
        ]
      }
    ];

    return (
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto text-left scrollbar-thin">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            {group.title && (
              <h5 className="px-3 text-[9px] font-black tracking-widest text-zinc-500 uppercase">
                {group.title}
              </h5>
            )}
            <div className="space-y-0.5">
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                // Soft neon/indigo accent styling for Admin/Mentor active tab
                const activeStyles = 'bg-[#5227EB]/10 text-indigo-400 border-l-4 border-indigo-500 shadow-sm';
                
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (link.id === 'profile') {
                        router.push('/profile');
                      } else {
                        setActiveTab(link.id as TabType);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-3 transition-all cursor-pointer text-left ${
                      isActive 
                        ? activeStyles 
                        : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" /> {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    );
  };

  const renderPracticeQuestionArea = () => {
    if (questionsCountLimit === null) {
      return (
        <div className="text-center py-6 space-y-5 animate-in fade-in duration-300">
          <div className="space-y-1.5 text-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest mx-auto">
              ⚡ Customize Practice
            </span>
            <h4 className="text-sm font-extrabold text-white">How many questions would you like to solve in {selectedInterest}?</h4>
            <p className="text-[10px] text-slate-400 font-bold">Select a limit to custom-tailor your learning challenge.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto pt-2">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                onClick={() => {
                  const pool = practiceQuestionsPool[selectedInterest] || [];
                  const shuffled = [...pool].sort(() => 0.5 - Math.random());
                  const selected = shuffled.slice(0, num);
                  setPracticeSessionQuestions(selected);
                  setQuestionsCountLimit(num);
                  setActiveQuestionIndex(0);
                  setPracticeSessionCompleted(false);
                  setPracticeSessionScore(0);
                  setPracticeQuizAnswer(null);
                  setPracticeQuizFeedback(null);
                  setPracticeQuizErrorMessage(null);
                }}
                className="p-4 bg-slate-900/60 hover:bg-[#121829]/90 border border-white/5 hover:border-indigo-500/30 rounded-2xl text-center space-y-1 transition-all hover:scale-[1.02] cursor-pointer text-white flex flex-col items-center justify-center active:scale-[0.98]"
              >
                <span className="text-xl font-black text-indigo-400">{num}</span>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Questions</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (practiceSessionCompleted) {
      return (
        <div className="text-center py-6 space-y-5 animate-in scale-in duration-300">
          <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-xl filter drop-shadow-[0_0_8px_rgba(16,185,129,0.25)]">
            🏆
          </div>
          <div className="space-y-1.5 text-center">
            <h4 className="text-sm font-extrabold text-white">Practice Session Completed!</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              You solved <span className="text-emerald-400 font-extrabold">{practiceSessionScore}</span> out of <span className="text-white font-bold">{questionsCountLimit}</span> questions correctly in <strong className="text-indigo-400">{selectedInterest}</strong>.
            </p>
          </div>
          <div className="pt-2 text-center">
            <button
              onClick={handleRestartPracticeSession}
              className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl border-none uppercase tracking-widest cursor-pointer shadow-md shadow-indigo-650/15 active:scale-[0.98] transition-all mx-auto"
            >
              Restart Session
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = practiceSessionQuestions[activeQuestionIndex];
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest">
              ⚡ Question {activeQuestionIndex + 1} of {questionsCountLimit}
            </span>
            <h4 className="text-xs font-extrabold text-white mt-1.5">
              {currentQuestion?.title}
            </h4>
          </div>
          <div className="text-[10px] font-bold text-slate-400">
            Score: <span className="text-emerald-400 font-black">{practiceSessionScore}</span> / {questionsCountLimit}
          </div>
        </div>

        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-300 font-semibold leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 border border-white/5 rounded-xl">
            {currentQuestion?.question}
          </p>

          <div className="grid gap-3 pt-2">
            {currentQuestion?.options?.map((option: any, idx: number) => {
              const isCorrect = idx === currentQuestion?.correctOptionIndex;
              const isSelected = practiceQuizAnswer === idx;
              const isVerified = practiceQuizFeedback !== null;

              return (
                <button
                  key={idx}
                  disabled={isVerified}
                  onClick={() => {
                    setPracticeQuizAnswer(idx);
                    setPracticeQuizFeedback(null);
                    setPracticeQuizErrorMessage(null);
                  }}
                  className={`p-4 rounded-xl border text-left text-xs font-bold transition-all ${
                    isVerified
                      ? isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isSelected
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-[#0B0F19]/40 border-white/5 text-slate-500'
                      : isSelected
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-white shadow-sm'
                        : 'bg-[#0B0F19]/60 border-white/5 text-slate-400 hover:bg-[#121829]/90 hover:text-white cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] font-black shrink-0 ${
                      isSelected ? 'border-indigo-400 text-indigo-400 bg-indigo-500/10' : 'border-slate-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}

            {practiceQuizErrorMessage && (
              <div className={`mt-2 p-3 border rounded-xl text-xs font-semibold animate-in fade-in duration-200 ${
                practiceQuizErrorMessage.startsWith('❌') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
              }`}>
                {practiceQuizErrorMessage}
              </div>
            )}

            {showQuizHint && (
              <div className="mt-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl space-y-2 text-xs font-semibold leading-relaxed animate-in slide-in-from-bottom-2 duration-200">
                <p className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1">💡 Need a Hint?</p>
                <p className="text-slate-300 font-medium">
                  {getQuestionHint(currentQuestion)}
                </p>
              </div>
            )}

            {practiceQuizFeedback !== null && (
              <div className={`mt-3 p-4 border rounded-2xl space-y-3.5 text-xs font-semibold leading-relaxed animate-in slide-in-from-bottom-2 duration-300 ${
                practiceQuizFeedback === 'correct' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450' 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }`}>
                <p className="font-extrabold text-white flex items-center gap-1.5 text-sm">
                  {practiceQuizFeedback === 'correct' ? '🎉 Correct Answer!' : '💡 Concept Revealed'}
                </p>
                
                <div className="space-y-2.5 text-slate-300 font-medium text-left">
                  <p>
                    <strong className="text-white block mb-0.5 uppercase tracking-wide text-[9px] text-[#818CF8]">Why the Correct Option is Correct:</strong>
                    {currentQuestion?.explanation}
                  </p>
                  
                  <p>
                    <strong className="text-white block mb-0.5 uppercase tracking-wide text-[9px] text-[#818CF8]">Why the Other Options are Incorrect:</strong>
                    The other choices are either non-optimal complexities, violate structure guidelines, or lack appropriate context conditions described in the problem.
                  </p>
                  
                  <p>
                    <strong className="text-white block mb-0.5 uppercase tracking-wide text-[9px] text-[#818CF8]">Concept Explanation:</strong>
                    Focusing on these foundational constructs is key for coding exams, technical screenings, and solving runtime constraints during interviews.
                  </p>
                  
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-slate-350 text-[11px] leading-normal">
                    <strong className="text-[#818CF8] block mb-0.5 font-bold uppercase tracking-wider text-[8px]">💡 Quick Tip:</strong>
                    Always run manual simulations on small arrays or single elements first to easily verify base cases and loops!
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-3 justify-start">
              {practiceQuizFeedback === null ? (
                <>
                  <button
                    onClick={handleVerifyQuizAnswer}
                    className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl border-none uppercase tracking-widest cursor-pointer shadow-md shadow-indigo-650/10 active:scale-[0.98] transition-all"
                  >
                    Verify Answer
                  </button>
                  {practiceQuizAttempts >= 1 && (
                    <button
                      onClick={() => {
                        setPracticeQuizFeedback('wrong');
                        setPracticeQuizErrorMessage(`💡 Explanation revealed. Correct option is: ${String.fromCharCode(65 + currentQuestion.correctOptionIndex)}`);
                        setShowQuizHint(false);
                      }}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black rounded-xl border border-white/5 uppercase tracking-widest cursor-pointer transition-all"
                    >
                      Show Answer
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-xl border-none uppercase tracking-widest cursor-pointer shadow-md shadow-emerald-600/10 active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  {activeQuestionIndex + 1 < practiceSessionQuestions.length ? 'Next Question' : 'Finish Session'}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // STUDENT DASHBOARD ("MY LEARNING SPACE")
  // ==========================================
  const renderStudentDashboard = () => {
    return (
      <SimpleDashboard 
        user={user}
        stats={stats}
        myGroups={myGroups}
        availableGroups={availableGroups}
        dailyMissions={dailyMissions}
        getGreeting={getGreeting}
        router={router}
        setActiveTab={setActiveTab}
        setStudySubView={setStudySubView}
        setPracticeSubView={setPracticeSubView}
        setProgressSubView={setProgressSubView}
        setCommunitySubView={setCommunitySubView}
        setProfileSubView={setProfileSubView}
        setSelectedInterest={setSelectedInterest}
        completedGoals={completedGoals}
        setCompletedGoals={setCompletedGoals}
      />
    );
  };

  // ==========================================
  // UNIFIED ADMIN/MENTOR DASHBOARD (ZERO-STATE)
  // ==========================================
  const renderAdminMentorDashboard = () => {
    // Dynamic onboarding checks
    const hasBio = !!user?.bio || !!user?.phone;
    const hasGroups = myGroups.length > 0;
    const hasSessions = mockSessions.length > 0;
    const hasNotes = notesList.length > 0;

    const onboardingSteps = [
      { id: 1, label: 'Complete your profile details', desc: 'Fill out your bio and contact details in settings.', checked: hasBio, action: () => router.push('/profile') },
      { id: 2, label: 'Create your first study room', desc: 'Set up a workspace circle for student cohorts.', checked: hasGroups, action: () => setShowCreateModal(true) },
      { id: 3, label: 'Invite students to join', desc: 'Share circle invite codes with your batch students.', checked: hasGroups, action: () => { setActiveTab('groups'); } },
      { id: 4, label: 'Schedule your first live session', desc: 'Book a virtual room for active recall review.', checked: hasSessions, action: () => setShowSessionModal(true) },
      { id: 5, label: 'Share learning resources', desc: 'Publish syllabus reference notes or study files.', checked: hasNotes, action: () => { setActiveTab('notes'); } }
    ];

    const completedCount = onboardingSteps.filter(s => s.checked).length;
    const progressPercent = Math.round((completedCount / onboardingSteps.length) * 100);

    return (
      <div className="space-y-6 text-white text-left animate-in fade-in duration-350">
        
        {/* Banner greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              {getGreeting()} 👋
            </h1>
            <p className="text-xs text-slate-400 mt-1">Here's what's happening in your StudyCircle workspace.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#0B0F19] px-3.5 py-2 border border-white/5 rounded-xl shadow-sm self-start sm:self-auto shrink-0">
            <Calendar className="h-4 w-4 text-[#818CF8]" />
            <span className="text-[11px] font-extrabold text-slate-300">{formattedDate}</span>
          </div>
        </div>

        {/* Welcome Onboarding Checklist (Glassmorphism card) */}
        <div className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1F3A35]/30 border border-white/5 rounded-[24px] shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/5">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>Welcome to StudyCircle! 🚀</span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-semibold">Complete these steps to get started with your workspace coordinator console:</p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-xs font-black text-white block">{completedCount} / 5 Completed</span>
                <span className="text-[9px] text-[#10B981] font-bold block mt-0.5">{progressPercent}% Progress</span>
              </div>
              <div className="relative h-14 w-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="transparent" />
                  <circle 
                    cx="28" 
                    cy="28" 
                    r="22" 
                    stroke="#10B981" 
                    strokeWidth="5" 
                    fill="transparent" 
                    strokeDasharray="138.23" 
                    strokeDashoffset={138.23 - (138.23 * (progressPercent / 100))}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-white">{progressPercent}%</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-4 pt-4 text-left">
            {onboardingSteps.map((step, idx) => (
              <div 
                key={step.id} 
                onClick={step.action}
                className={`p-3 border rounded-2xl flex flex-col justify-between gap-3 transition-all cursor-pointer group hover:scale-[1.02] ${
                  step.checked 
                    ? 'bg-[#10B981]/5 border-[#10B981]/20' 
                    : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-zinc-500">STEP 0{step.id}</span>
                    {step.checked ? (
                      <span className="h-4.5 w-4.5 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center text-[10px] font-black shadow-sm">✓</span>
                    ) : (
                      <span className="h-4.5 w-4.5 rounded-full border border-white/20 group-hover:border-white/40 transition-colors" />
                    )}
                  </div>
                  <h4 className="text-[11px] font-black text-white leading-tight mt-1 group-hover:text-indigo-300 transition-colors">{step.label}</h4>
                  <p className="text-[9px] text-zinc-500 font-semibold leading-snug">{step.desc}</p>
                </div>
                
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 group-hover:underline mt-2 inline-flex items-center gap-1">
                  Configure <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 1: KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', val: '0', change: '+0 this week', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10 border-[#10B981]/20', icon: Users },
            { label: 'Active Study Rooms', val: '0', change: '+0 this week', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10 border-[#3B82F6]/20', icon: BookOpen },
            { label: 'Sessions Conducted', val: '0', change: '+0 this week', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20', icon: Calendar },
            { label: 'Total Notes Shared', val: '0', change: '+0 this week', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20', icon: FileText }
          ].map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <div key={idx} className="p-5 bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A] to-[#1E293B]/80 border border-white/5 rounded-[24px] shadow-lg flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] rounded-full blur-xl pointer-events-none" />
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${card.bg}`}>
                  <CardIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wide">{card.label}</span>
                  <div className="text-2xl font-black text-white leading-none mt-1">{card.val}</div>
                  <span className="text-[8px] text-zinc-500 font-bold block mt-1">{card.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: Analytics Grid */}
        <div className="grid lg:grid-cols-10 gap-6">
          
          {/* User Overview donut card (4 columns span) */}
          <div className="lg:col-span-4 p-6 bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A] to-[#1E293B]/80 border border-white/5 rounded-[24px] shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">User Overview</h3>
              <p className="text-[10px] text-zinc-500 leading-tight">Registered user roles and activity distribution</p>
            </div>

            <div className="py-6 flex flex-col items-center justify-center relative">
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="58" stroke="rgba(255,255,255,0.02)" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="58" 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray="364.42" 
                    strokeDashoffset="364.42"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white leading-none">0</span>
                  <span className="text-[8px] text-zinc-500 font-extrabold uppercase tracking-wide block mt-1">Total Users</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-400">
              <div className="flex items-center gap-1.5 justify-start">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/50 shrink-0" />
                <span>Students (0%)</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]/50 shrink-0" />
                <span>Mentors (0%)</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]/50 shrink-0" />
                <span>Admins (0%)</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-500/50 shrink-0" />
                <span>Inactive (0%)</span>
              </div>
            </div>
          </div>

          {/* User Growth line card (6 columns span) */}
          <div className="lg:col-span-6 p-6 bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A] to-[#1E293B]/80 border border-white/5 rounded-[24px] shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">User Growth</h3>
                <p className="text-[10px] text-zinc-500 leading-tight">Weekly registrations across cohort clusters</p>
              </div>
              <span className="text-[9px] bg-slate-900 border border-white/5 text-zinc-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                This Month
              </span>
            </div>

            {/* Dotted empty chart grid */}
            <div className="h-48 border border-dashed border-white/5 rounded-xl bg-slate-950/20 my-4 flex flex-col items-center justify-center relative p-6">
              <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-30">
                <div className="border-b border-white/5 w-full h-px" />
                <div className="border-b border-white/5 w-full h-px" />
                <div className="border-b border-white/5 w-full h-px" />
                <div className="border-b border-white/5 w-full h-px" />
              </div>
              <TrendingUp className="h-7 w-7 text-zinc-500 mb-2" />
              <h4 className="text-[11px] font-black text-white">Empty State: No growth data</h4>
              <p className="text-[9px] text-zinc-500 font-semibold text-center mt-1 max-w-xs leading-normal">
                User registration metrics will graph here dynamically as student and coordinator cohorts join.
              </p>
            </div>

            <div className="flex justify-between text-[8px] font-mono text-zinc-500 font-extrabold uppercase px-1">
              <span>May 1</span>
              <span>May 8</span>
              <span>May 15</span>
              <span>May 22</span>
              <span>May 29</span>
            </div>
          </div>

        </div>

        {/* Row 3: Study Rooms & Top Mentors tables */}
        <div className="grid lg:grid-cols-10 gap-6">
          
          {/* Active Study Rooms (6 columns span) */}
          <div className="lg:col-span-6 p-6 bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A] to-[#1E293B]/80 border border-white/5 rounded-[24px] shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-indigo-400" /> Active Study Rooms
                </h3>
                <button 
                  onClick={() => setShowCreateModal(true)} 
                  className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wide hover:underline cursor-pointer"
                >
                  Create Room
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mb-4">Real-time engagement within cohort circles</p>
            </div>

            <div className="flex-1 flex flex-col justify-center py-6 border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
              <div className="text-center space-y-1.5 p-4">
                <BookOpen className="h-7 w-7 text-zinc-500 mx-auto" />
                <h4 className="text-[11px] font-black text-white">No rooms available yet</h4>
                <p className="text-[9px] text-zinc-500 font-semibold max-w-xs mx-auto leading-normal">
                  Initialize a study circle and add subject categories to launch your first workspace.
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-3.5 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[9px] font-black rounded-lg uppercase tracking-wide transition-colors cursor-pointer mt-2 inline-block"
                >
                  Create First Circle
                </button>
              </div>
            </div>
          </div>

          {/* Top Mentors card (4 columns span) */}
          <div className="lg:col-span-4 p-6 bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A] to-[#1E293B]/80 border border-white/5 rounded-[24px] shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Top Mentors</h3>
              <p className="text-[10px] text-zinc-500 mb-4">Highly active workspace facilitators</p>
            </div>

            <div className="flex-1 flex flex-col justify-center py-6 border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
              <div className="text-center space-y-1.5 p-4">
                <Award className="h-7 w-7 text-zinc-500 mx-auto" />
                <h4 className="text-[11px] font-black text-white">No mentors available yet</h4>
                <p className="text-[9px] text-zinc-500 font-semibold max-w-xs mx-auto leading-normal">
                  Mentors will rank here based on the hours of live review sessions conducted.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Row 4: Recent Activity & Announcements */}
        <div className="grid lg:grid-cols-10 gap-6">
          
          {/* Recent Activity card (6 columns span) */}
          <div className="lg:col-span-6 p-6 bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A] to-[#1E293B]/80 border border-white/5 rounded-[24px] shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Recent Activity</h3>
              <p className="text-[10px] text-zinc-500 mb-4">Audit log of coordinator and user interactions</p>
            </div>

            <div className="flex-1 flex flex-col justify-center py-6 border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
              <div className="text-center space-y-1.5 p-4">
                <Clock className="h-7 w-7 text-zinc-500 mx-auto" />
                <h4 className="text-[11px] font-black text-white">No activity yet</h4>
                <p className="text-[9px] text-zinc-500 font-semibold max-w-xs mx-auto leading-normal">
                  Activity logs will populate here dynamically as students and mentors interact.
                </p>
              </div>
            </div>
          </div>

          {/* Announcements card (4 columns span) */}
          <div className="lg:col-span-4 p-6 bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A] to-[#1E293B]/80 border border-white/5 rounded-[24px] shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Announcements</h3>
                <button 
                  onClick={() => setShowAnnouncementModal(true)}
                  className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wide hover:underline cursor-pointer"
                >
                  Post
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mb-4">Platform broadcasts and maintenance bulletins</p>
            </div>

            <div className="flex-1 flex flex-col justify-center py-6 border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
              <div className="text-center space-y-1.5 p-4">
                <Bell className="h-7 w-7 text-zinc-500 mx-auto" />
                <h4 className="text-[11px] font-black text-white">No announcements yet</h4>
                <p className="text-[9px] text-zinc-500 font-semibold max-w-xs mx-auto leading-normal">
                  Announcements published by platform administrators will broadcast here.
                </p>
                <button 
                  onClick={() => setShowAnnouncementModal(true)}
                  className="px-3.5 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[9px] font-black rounded-lg uppercase tracking-wide transition-colors cursor-pointer mt-2 inline-block"
                >
                  Post Announcement
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Row 5: Platform Analytics panel */}
        <div className="p-6 bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A] to-[#1E293B]/80 border border-white/5 rounded-[24px] shadow-lg text-white">
          <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">Platform Analytics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {[
              { label: 'Page Views', val: '0', change: '+0%' },
              { label: 'Engagement Rate', val: '0%', change: '+0%' },
              { label: 'Avg. Session Duration', val: '0 mins', change: '+0%' },
              { label: 'Bounce Rate', val: '0%', change: '+0%' }
            ].map((stat, idx) => (
              <div key={idx} className="p-4 bg-slate-955/40 border border-white/5 rounded-2xl">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wide block">{stat.label}</span>
                <div className="text-xl font-black text-white mt-1 leading-none">{stat.val}</div>
                <span className="text-[8px] text-zinc-500 font-bold block mt-1">{stat.change}</span>
              </div>
            ))}
          </div>

          <div className="h-32 border border-dashed border-white/5 rounded-xl bg-slate-950/20 flex flex-col items-center justify-center relative p-4">
            <div className="absolute inset-0 flex items-end justify-between p-4 pointer-events-none opacity-20">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(i => (
                <div key={i} className="w-2.5 bg-white/10 rounded-sm h-1" />
              ))}
            </div>
            <BarChart2 className="h-6 w-6 text-zinc-500 mb-1" />
            <h4 className="text-[10px] font-black text-zinc-400">Empty State: No traffic analytics logged</h4>
          </div>
        </div>

      </div>
    );
  };

  const renderMentorDashboard = () => renderAdminMentorDashboard();
  const renderAdminDashboard = () => renderAdminMentorDashboard();

  const filteredNotifications = notifications.filter(notif => {
    if (notif.groupName) {
      return myGroups.some(g => g.name.trim().toLowerCase() === (notif.groupName || '').trim().toLowerCase());
    }
    return true;
  });

  const unreadCount = filteredNotifications.filter(n => n.unread).length;

  const parsedBadges = (() => {
    try {
      return JSON.parse(stats.badges || '[]');
    } catch (e) {
      return [];
    }
  })();
  const hasNeonCyanFrame = parsedBadges.some((b: any) => 
    b === 'frame_neon_cyan' || (b && b.id === 'frame_neon_cyan')
  );
  const hasGoldFrame = parsedBadges.some((b: any) => 
    b === 'frame_gold_shine' || (b && b.id === 'frame_gold_shine') ||
    b === 'avatar_frame_exclusive' || (b && b.id === 'avatar_frame_exclusive')
  );

  const avatarRingClass = hasGoldFrame 
    ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.8)] border-amber-400' 
    : hasNeonCyanFrame
      ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.8)] border-cyan-400'
      : 'border-2 border-[#10B981]/25 group-hover:border-[#10B981]/50';

  const headerAvatarRingClass = hasGoldFrame
    ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.6)] border-amber-400'
    : hasNeonCyanFrame
      ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_8px_rgba(34,211,238,0.6)] border-cyan-400'
      : 'border border-[#10B981]/30';

  const sidebarFooterAvatarRingClass = hasGoldFrame
    ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.6)] border-amber-400'
    : hasNeonCyanFrame
      ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_8px_rgba(34,211,238,0.6)] border-cyan-400'
      : 'border border-white/10 group-hover:border-[#10B981]/50';

  return (
    <div 
      className={`min-h-screen text-slate-100 font-sans flex relative overflow-hidden transition-colors duration-500 ${
        equippedTheme === 'cyberpunk' ? 'bg-[#0b0114] border-fuchsia-500/10' :
        equippedTheme === 'zengarden' ? 'bg-[#020d06] border-emerald-500/10' :
        equippedTheme === 'theme_emerald_cosmic' ? 'bg-gradient-to-br from-[#061510] to-[#04090b]' :
        equippedTheme === 'theme_solar_glow' ? 'bg-gradient-to-br from-[#1c1209] to-[#090604]' :
        equippedTheme === 'theme_dark_nebula' ? 'bg-gradient-to-br from-[#120a1c] to-[#06040a]' :
        'bg-[#060913]'
      }`}
    >
      
      {/* 1. Left Sidebar */}
      <aside className={`w-64 flex flex-col shrink-0 h-screen sticky top-0 z-30 border-r transition-colors duration-500 ${
        equippedTheme === 'cyberpunk' ? 'bg-[#0b0114] border-fuchsia-500/10' :
        equippedTheme === 'zengarden' ? 'bg-[#020d06] border-emerald-500/10' :
        equippedTheme === 'theme_emerald_cosmic' ? 'bg-[#061510]/95 border-emerald-500/10 shadow-lg shadow-emerald-550/5' :
        equippedTheme === 'theme_solar_glow' ? 'bg-[#1c1209]/95 border-amber-500/10 shadow-lg shadow-amber-550/5' :
        equippedTheme === 'theme_dark_nebula' ? 'bg-[#120a1c]/95 border-purple-500/10 shadow-lg shadow-purple-550/5' :
        'bg-[#0B0F19] border-white/5'
      }`}>
        
        {/* Branding header */}
        <Link 
          href="/"
          className="h-16 px-6 border-b border-white/5 flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer text-left shrink-0"
        >
          {/* Unique collaborative ring logo */}
          <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
            {/* Outer gradient ring representing collaborative circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#10B981] via-indigo-500 to-[#E11D48] opacity-90 shadow-md animate-pulse" />
            {/* Inner center */}
            <div className="absolute inset-[3px] rounded-full bg-[#0B0F19] flex items-center justify-center text-white font-bold">
              <BookOpen className="h-4 w-4 text-[#10B981]" />
            </div>
          </div>
          <div className="leading-none">
            <span className="font-extrabold text-sm tracking-tight text-white block">
              StudyCircle
            </span>
            <span className="text-[8px] font-semibold text-slate-450">
              Collaborative Learning Workspace
            </span>
          </div>
        </Link>

        {/* Profile Card */}
        <div 
          onClick={() => setActiveTab('settings')}
          className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.04] transition-all group"
          title="Click to Edit Profile"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden transition-all ${sidebarFooterAvatarRingClass}`}>
              <img 
                src={user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender)} 
                className="absolute inset-0 h-full w-full object-cover" 
                alt="Avatar" 
              />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-extrabold text-white group-hover:text-[#10B981] transition-colors truncate">{user?.fullName || 'User'}</div>
              <div className="text-[10px] font-bold text-slate-400 capitalize mt-0.5">{user?.role || 'Guest'}</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#10B981] transition-colors shrink-0" />
        </div>

        {/* Dynamic Sidebar Links */}
        {renderSidebar()}

        {/* Sidebar Bottom illustration */}
        <div className="p-4 bg-white/[0.01] m-4 rounded-[20px] border border-white/5 text-center space-y-3 shadow-md shrink-0">
          <div className="h-20 w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950/40 flex items-center justify-center border border-white/5">
            <img src="/students-illustration.png" className="h-16 w-auto object-contain" alt="Study illustration" />
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold text-slate-200">Focus Together.</h4>
            <h4 className="text-[11px] font-extrabold text-slate-200">Achieve More.</h4>
            <p className="text-[9px] text-slate-450 mt-1 leading-snug">StudyCircle makes studying structured and effective.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2 bg-[#10B981] hover:bg-[#0d9488] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
          >
            Create Group
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto transition-colors duration-500 ${
        equippedTheme === 'cyberpunk' ? 'bg-[#0e021a]' :
        equippedTheme === 'zengarden' ? 'bg-[#03140a]' :
        'bg-[#060913]'
      }`}>
        
        {/* Header toolbar */}
        <header className={`w-full h-16 border-b backdrop-blur-md flex items-center justify-between px-8 shrink-0 sticky top-0 z-20 transition-colors duration-500 ${
          equippedTheme === 'cyberpunk' ? 'bg-[#0e021a]/80 border-fuchsia-500/10' :
          equippedTheme === 'zengarden' ? 'bg-[#03140a]/80 border-emerald-500/10' :
          'bg-[#060913]/80 border-white/5'
        }`}>
          
          <div className="relative w-96 text-left">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              readOnly
              onClick={() => setShowSearchPalette(true)}
              placeholder="Press here to search everything..." 
              className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] border border-white/5 rounded-xl text-xs outline-none focus:border-[#10B981]/50 focus:bg-[#0B0F19]/90 transition-all text-white placeholder-slate-500 font-medium font-sans cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 border border-white/5 hover:border-white/10 bg-[#0B0F19] hover:bg-white/[0.02] rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Interactive Notifications Bell */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative cursor-pointer p-2 hover:bg-white/[0.02] rounded-xl text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/5"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-fadeIn text-left text-white">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-350 font-sans">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead} 
                        className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase hover:underline cursor-pointer bg-transparent border-0 outline-none"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredNotifications.length === 0 ? (
                      <p className="text-[10px] text-zinc-500 py-4 text-center font-medium">No new notifications</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredNotifications.slice(0, 5).map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                              notif.unread 
                                ? 'bg-slate-950/60 border-indigo-500/20 hover:border-indigo-500/45' 
                                : 'bg-transparent border-transparent hover:bg-white/5'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg shrink-0 ${
                              notif.type === 'doubt' ? 'bg-rose-500/10 text-rose-400' :
                              notif.type === 'report' ? 'bg-[#10B981]/10 text-[#10B981]' :
                              notif.type === 'system' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {notif.type === 'doubt' ? <HelpCircle className="h-3.5 w-3.5" /> :
                               notif.type === 'report' ? <TrendingUp className="h-3.5 w-3.5" /> :
                               notif.type === 'system' ? <AlertCircle className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <p className={`text-[10px] leading-tight ${notif.unread ? 'font-bold text-white' : 'text-zinc-400'}`}>
                                {notif.message}
                              </p>
                              <span className="text-[8px] text-zinc-500 font-mono block">{new Date(notif.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}

                        {filteredNotifications.length > 5 && (
                          <div className="pt-2 border-t border-white/5 text-center">
                            <button
                              onClick={() => {
                                setShowNotifications(false);
                                setActiveTab('community');
                                setCommunitySubView('chat');
                              }}
                              className="text-[9px] font-black text-indigo-400 hover:underline uppercase bg-transparent border-none cursor-pointer"
                            >
                              View All ({filteredNotifications.length}) &rarr;
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link 
              href="/profile"
              className="flex items-center gap-2 pl-2 border-l border-white/10 hover:opacity-80 transition-opacity cursor-pointer group"
            >
              <div className={`h-8 w-8 rounded-full bg-[#10B981]/15 flex items-center justify-center font-black text-xs text-[#10B981] overflow-hidden relative transition-all ${headerAvatarRingClass}`}>
                <img 
                  src={user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender)} 
                  className="absolute inset-0 h-full w-full object-cover" 
                  alt="Avatar" 
                />
              </div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{user?.fullName || 'User'}</span>
            </Link>

            <button 
              onClick={handleLogout}
              className="px-3 py-2 border border-red-500/20 hover:border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-2 shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8 space-y-6 flex-1 w-full max-w-[1400px] mx-auto">
          
          {/* Horizontal Navigation for Student Users */}
          {user?.role === 'student' && (
            <div className="flex border-b border-white/5 pb-3 overflow-x-auto gap-2 scrollbar-none mb-6">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'study', label: 'Study', icon: GraduationCap },
                { id: 'practice', label: 'Practice', icon: Sparkles },
                { id: 'progress', label: 'Progress', icon: TrendingUp },
                { id: 'community', label: 'Community', icon: Users },
                { id: 'profile', label: 'Profile', icon: UserCheck }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setStudySubView(null);
                      setPracticeSubView(null);
                      setProgressSubView(null);
                      setCommunitySubView(null);
                      setProfileSubView(null);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 border border-transparent ${
                      isActive
                        ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 1: Dashboard Routing */}
          {activeTab === 'dashboard' && (
            user?.role === 'student' ? renderStudentDashboard() :
            user?.role === 'mentor' ? renderMentorDashboard() :
            user?.role === 'admin' ? renderAdminDashboard() : null
          )}

          {/* Consolidated Tab: Study Directory */}
          {activeTab === 'study' && studySubView === null && (
            <div className="space-y-6 text-left text-white animate-in fade-in duration-300">
              <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-indigo-400" /> Study Directory
                </h1>
                <p className="text-xs text-slate-400 mt-1">Select an environment below to continue your learning journey.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 pt-4">
                
                {/* Card 1: My Workspace */}
                <div 
                  onClick={() => setStudySubView('workspaces')}
                  className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                      📚
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">My Workspace</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">Join or initialize collaborative peer study circles, share documents, and track goals.</p>
                  </div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-4 block">Open Workspace &rarr;</span>
                </div>

                {/* Card 2: Study Rooms */}
                <div 
                  onClick={() => setStudySubView('rooms')}
                  className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                      ⏱
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">Study Rooms</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">Join virtual co-study desks with live video connections, Pomodoro focus timers, and logs.</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 block">Enter Study Rooms &rarr;</span>
                </div>

                {/* Card 3: Resources */}
                <div 
                  onClick={() => setStudySubView('resources')}
                  className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                      📂
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">Resources</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">Access curated subject learning materials, reference sheets, and document guides.</p>
                  </div>
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-4 block">Browse Resources &rarr;</span>
                </div>

              </div>
            </div>
          )}

          {/* Consolidated Tab: Practice Directory */}
          {activeTab === 'practice' && (
            <div className="space-y-6 text-left text-white animate-in fade-in duration-300">
              
              {/* Back to Practice directory breadcrumb */}
              {practiceSubView ? (
                <div className="flex items-center gap-2 mb-4">
                  <button 
                    onClick={() => setPracticeSubView(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                  >
                    &larr; Back to Practice
                  </button>
                  <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">
                    Practice &gt; {practiceSubView === 'roadmap' ? 'Placement Roadmap' : practiceSubView === 'questions' ? 'Practice Questions' : 'Mock Tests'}
                  </span>
                </div>
              ) : null}

              {/* Sub-view Rendering */}
              {practiceSubView === 'roadmap' ? (
                /* Placement Roadmap sub-view */
                <div className="space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <button 
                      onClick={() => setPracticeSubView(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                    >
                      &larr; Back to Practice
                    </button>
                    <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Practice &gt; Placement Roadmap</span>
                  </div>

                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      🗺️ Placement Preparation Roadmap
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Track your syllabus milestones across foundational coding, core Computer Science, advanced concepts, and final HR interview readiness.</p>
                  </div>

                  <div className="relative border-l-2 border-indigo-500/20 ml-4 pl-6 space-y-8 py-4">
                    {[
                      {
                        phase: "Phase 1",
                        title: "Foundation & Programming Basics",
                        duration: "Weeks 1-4",
                        status: "Completed",
                        color: "emerald",
                        interest: "Programming & DSA",
                        topics: [
                          "Language Fundamentals (Java/C++)",
                          "Object Oriented Programming (OOPs)",
                          "Time & Space Complexity Analysis",
                          "Basic Data Structures (Arrays, Linked Lists, Stacks, Queues)"
                        ]
                      },
                      {
                        phase: "Phase 2",
                        title: "Core Computer Science Concepts",
                        duration: "Weeks 5-8",
                        status: "In Progress",
                        color: "indigo",
                        interest: "Programming & DSA",
                        topics: [
                          "Database Management Systems & SQL Joins",
                          "Operating Systems (Process, Threads & Deadlocks)",
                          "Computer Networks (OSI Model & TCP/IP handshake)"
                        ]
                      },
                      {
                        phase: "Phase 3",
                        title: "Advanced Data Structures & Algorithms",
                        duration: "Weeks 9-12",
                        status: "Locked",
                        color: "violet",
                        interest: "Programming & DSA",
                        topics: [
                          "Trees & Binary Search Trees (BST)",
                          "Graph Algorithms (BFS, DFS, Dijkstra)",
                          "Dynamic Programming (DP) Optimization"
                        ]
                      },
                      {
                        phase: "Phase 4",
                        title: "Aptitude & Quantitative Reasoning",
                        duration: "Weeks 13-14",
                        status: "Locked",
                        color: "cyan",
                        interest: "Aptitude",
                        topics: [
                          "Permutations, Combinations & Probability",
                          "Time, Speed, Distance & Work Equations",
                          "Logical Puzzles & Pattern Matching"
                        ]
                      },
                      {
                        phase: "Phase 5",
                        title: "Interview Mastery & System Design",
                        duration: "Weeks 15-16",
                        status: "Locked",
                        color: "rose",
                        interest: "Interview Preparation",
                        topics: [
                          "Low-Level (LLD) & High-Level (HLD) System Design",
                          "Resume Project Architectures & Showcase",
                          "HR Behavioral Questions & STAR Method Response"
                        ]
                      }
                    ].map((p, idx) => {
                      const isCompleted = p.status === "Completed";
                      const isInProgress = p.status === "In Progress";
                      const isLocked = p.status === "Locked";
                      
                      return (
                        <div key={idx} className="relative group">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 bg-[#0B0F19] transition-all ${
                            isCompleted ? 'border-emerald-500 bg-emerald-500/20' :
                            isInProgress ? 'border-indigo-500 bg-indigo-500/20 animate-pulse' :
                            'border-slate-800 bg-slate-900'
                          }`} />

                          <div className="p-5 bg-[#0B0F19]/60 border border-white/5 hover:border-white/10 rounded-2xl space-y-4 shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                  isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  isInProgress ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                  'bg-slate-800/50 text-slate-500 border border-white/5'
                                }`}>
                                  {p.phase} &bull; {p.duration}
                                </span>
                                <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors mt-1">{p.title}</h4>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                  isCompleted ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                  isInProgress ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
                                  'bg-slate-900 text-slate-600 border border-white/5'
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3 pt-2">
                              <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Key Syllabus Topics</span>
                                <ul className="space-y-1.5">
                                  {p.topics.map((t, tIdx) => (
                                    <li key={tIdx} className="text-xs text-slate-355 flex items-start gap-2 font-semibold">
                                      <span className={isCompleted ? 'text-emerald-400' : isInProgress ? 'text-indigo-400' : 'text-slate-600'}>
                                        {isCompleted ? '✓' : isInProgress ? '•' : '🔒'}
                                      </span>
                                      <span>{t}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex flex-col justify-end items-end gap-2">
                                {!isLocked && (
                                  <button
                                    onClick={() => {
                                      setSelectedInterest(p.interest);
                                      setPracticeSubView('questions');
                                      updateLastActivity(p.interest, 'Solve Practice Questions', 'practice', 'questions');
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-[#5227EB] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none"
                                  >
                                    Start Practicing &rarr;
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : practiceSubView === 'questions' ? (
                /* Practice Questions sub-view */
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Select Interest */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: 'Programming & DSA', name: 'Programming & DSA', icon: '💻' },
                      { id: 'Web Development', name: 'Web Development', icon: '🌐' },
                      { id: 'AI & Machine Learning', name: 'AI & Machine Learning', icon: '🤖' },
                      { id: 'Aptitude', name: 'Aptitude', icon: '📊' },
                      { id: 'Interview Preparation', name: 'Interview Preparation', icon: '🎯' },
                      { id: 'GATE', name: 'GATE', icon: '📖' },
                      { id: 'UPSC', name: 'UPSC', icon: '🏛' },
                      { id: 'Mathematics', name: 'Mathematics', icon: '🧮' }
                    ].map((interest) => {
                      const isSelected = selectedInterest === interest.id;
                      return (
                        <button
                          key={interest.id}
                          onClick={() => {
                            setSelectedInterest(interest.id);
                            updateLastActivity(interest.id, 'Solve Practice Questions', 'practice', 'questions');
                            setQuestionsCountLimit(null);
                            setActiveQuestionIndex(0);
                            setPracticeSessionQuestions([]);
                            setPracticeSessionCompleted(false);
                            setPracticeSessionScore(0);
                            setPracticeQuizAnswer(null);
                            setPracticeQuizFeedback(null);
                            setPracticeQuizErrorMessage(null);
                            setPracticeCodeText(null);
                            setPracticeConsoleLogs([]);
                            setPracticeTested(false);
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-[0.98] flex items-center gap-3 group ${
                            isSelected
                              ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10 font-bold'
                              : 'bg-[#0B0F19]/60 backdrop-blur-md border-white/5 text-slate-400 hover:bg-[#121829]/85 hover:border-white/15 hover:text-white'
                          }`}
                        >
                          <span className="text-xl filter drop-shadow-[0_0_8px_rgba(99,102,241,0.2)] shrink-0">{interest.icon}</span>
                          <span className="text-[11px] font-black tracking-wide truncate">{interest.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedInterest && (
                    <div className="space-y-6 text-left">
                      <div className="relative rounded-[28px] overflow-hidden p-6 md:p-8 bg-[#0B0F19]/60 backdrop-blur-md border border-white/5 shadow-2xl space-y-6">
                        {renderPracticeQuestionArea()}
                      </div>
                      
                      {/* Related Resources card in Practice Questions */}
                      <div className="p-6 bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-[24px] space-y-4 shadow-lg text-left">
                        <h3 className="text-xs font-black uppercase tracking-wider text-white font-sans flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-indigo-400" /> Related Resources
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Download references, cheat sheets, and blueprints directly linked to your practice questions.</p>
                        <div className="grid md:grid-cols-2 gap-4 pt-1 font-sans">
                          <a href="/Java Arrays & DSA Cheat Sheet.pdf" download="Java Arrays & DSA Cheat Sheet.pdf" className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between text-[10px] font-bold text-slate-200 cursor-pointer">
                            <span>📄 Java Arrays & DSA Cheat Sheet.pdf</span>
                            <span className="text-indigo-300 text-[9px] font-black uppercase">Download &darr;</span>
                          </a>
                          <a href="/Complexity Quick Reference Card.pdf" download="Complexity Quick Reference Card.pdf" className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between text-[10px] font-bold text-slate-200 cursor-pointer">
                            <span>📄 Complexity Quick Reference Card.pdf</span>
                            <span className="text-indigo-300 text-[9px] font-black uppercase">Download &darr;</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : practiceSubView === 'mock' ? (
                /* Mock Tests sub-view */
                <div className="grid md:grid-cols-2 gap-6 pt-2 animate-in fade-in duration-300">
                  <div className="p-6 bg-[#0B0F19]/60 border border-white/5 rounded-[24px] shadow-lg space-y-4 text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-extrabold uppercase bg-rose-500/15 text-rose-350 border border-rose-500/20 px-2 py-0.5 rounded">Mock Test 1</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Unattempted</span>
                    </div>
                    <h3 className="text-sm font-black text-white">Full-Stack Web Engineering Challenge</h3>
                    <p className="text-xs text-slate-450 font-semibold leading-relaxed">Assess your knowledge in React rendering, database queries, and architectural designs under a 45-minute countdown timer.</p>
                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-white/5 mt-4">
                      <span>45 Mins | 25 Questions</span>
                      <button className="px-4 py-2 bg-indigo-600/20 hover:bg-[#5227EB] border border-indigo-500/30 hover:border-[#5227EB] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer">Start Exam</button>
                    </div>
                  </div>

                  <div className="p-6 bg-[#0B0F19]/60 border border-white/5 rounded-[24px] shadow-lg space-y-4 text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-extrabold uppercase bg-rose-500/15 text-rose-350 border border-rose-500/20 px-2 py-0.5 rounded">Mock Test 2</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Unattempted</span>
                    </div>
                    <h3 className="text-sm font-black text-white">Algorithms & Data Structures Pro Checkpoint</h3>
                    <p className="text-xs text-slate-455 font-semibold leading-relaxed">Practice advanced algorithmic patterns, Dynamic Programming constraints, and graphs traversal questions.</p>
                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-white/5 mt-4">
                      <span>60 Mins | 30 Questions</span>
                      <button className="px-4 py-2 bg-indigo-600/20 hover:bg-[#5227EB] border border-indigo-500/30 hover:border-[#5227EB] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer">Start Exam</button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Directory cards */
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  
                  {/* Card 2: Practice Questions */}
                  <div 
                    onClick={() => setPracticeSubView('questions')}
                    className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                  >
                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                        💻
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">Practice Questions</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">Access an interactive sandbox environment to write code, execute test cases, and solve DSA problems.</p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 block">Start Practicing &rarr;</span>
                  </div>

                  {/* Card 3: Mock Tests */}
                  <div 
                    onClick={() => setPracticeSubView('mock')}
                    className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                  >
                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                        📝
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">Mock Tests</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">Simulate actual company assessment conditions with timed practice exams and milestones.</p>
                    </div>
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-4 block">Take Test &rarr;</span>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Tab 2: Groups */}
          {(activeTab === 'groups' || (activeTab === 'study' && studySubView === 'workspaces')) && (
            <div className="space-y-6 text-left text-white animate-in fade-in duration-300">
              {activeTab === 'study' && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setStudySubView(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                  >
                    &larr; Back to Study
                  </button>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Study &gt; My Workspace</span>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6 w-full text-white items-stretch">
                
                {/* Left Column (70%) */}
                <div className="w-full lg:w-[70%] flex flex-col gap-6">
                  
                  {/* Title and Subtitle */}
                  <div className="space-y-1 text-left">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                      <Users className="h-5.5 w-5.5 text-[#7C4DFF]" /> Study Circles Workspace
                    </h2>
                    <p className="text-xs text-slate-400 font-normal leading-relaxed">
                      Collaborate, discuss and grow together in your study circles.
                    </p>
                  </div>

                  {/* Main Workspace Card */}
                  <div className="w-full h-[420px] bg-[#131722] border border-[rgba(255,255,255,0.08)] rounded-[20px] flex flex-col p-6 shadow-sm relative overflow-hidden">
                    {myGroups.length === 0 ? (
                      <div className="flex flex-col items-center justify-center space-y-4 my-auto select-none">
                        {/* Large glowing workspace icon */}
                        <div className="relative h-20 w-20 rounded-full bg-[#7C4DFF]/10 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(124,77,255,0.15)] border border-[#7C4DFF]/20">
                          <Users className="h-10 w-10 text-[#7C4DFF]" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-white tracking-tight">No Workspaces Joined</h3>
                          <p className="text-xs text-slate-405 font-normal leading-relaxed max-w-xs mx-auto">
                            You haven't joined any study circle yet. Join one using an invite code from your mentor.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full overflow-y-auto pr-1 grid sm:grid-cols-2 gap-4 text-left p-1 scrollbar-thin">
                        {myGroups.map((group) => (
                          <div key={group.id} className="p-5 bg-slate-900/40 border border-white/5 hover:border-[#7C4DFF]/50 rounded-[20px] transition-all duration-300 flex flex-col justify-between gap-4 shadow-md group">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <span className="text-[8px] font-extrabold uppercase bg-[#7C4DFF]/15 text-[#7C4DFF] border border-[#7C4DFF]/30 px-2.5 py-0.5 rounded-md">
                                  {group.subject || 'Engineering'}
                                </span>
                                <span className="text-[9px] font-mono text-slate-500 font-bold">Code: {group.inviteCode}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white group-hover:text-[#7C4DFF] transition-colors">{group.name}</h4>
                              <p className="text-[10px] text-slate-400 font-normal leading-relaxed line-clamp-3">{group.description || 'No description provided.'}</p>
                            </div>
                            <Link
                              href={`/workspace/${getSlugByGroup(group)}`}
                              className="w-full py-2.5 bg-[#131722] border border-white/10 hover:border-[#7C4DFF] hover:bg-[#7C4DFF] hover:text-white text-slate-350 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all text-center no-underline"
                            >
                              Enter Workspace <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (30%) */}
                <div className="w-full lg:w-[30%] flex flex-col gap-6 justify-between">
                  
                  {/* Card 1: Join Study Circle */}
                  <div className="p-6 bg-[#131722] border border-[rgba(255,255,255,0.08)] rounded-[20px] space-y-4 shadow-sm text-left">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-sans flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-[#7C4DFF]" /> Join Study Circle
                      </h3>
                      <p className="text-[10px] text-slate-400 font-normal leading-relaxed">
                        Enter the invite code shared by your mentor or classmates.
                      </p>
                    </div>
                    <form onSubmit={handleJoinCircle} className="space-y-3">
                      <input
                        type="text"
                        id="invite-code-input"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Enter invite code"
                        className="w-full px-4 py-3 bg-[#090B14] border border-[rgba(255,255,255,0.08)] focus:border-[#7C4DFF] rounded-xl text-xs outline-none text-center font-mono tracking-widest text-white placeholder-slate-600 transition-all font-semibold"
                      />
                      <button 
                        type="submit" 
                        className="w-full py-3 bg-[#7C4DFF] hover:bg-[#6C3DFF] text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer border-none uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        Submit Code <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                  {/* Card 2: Shared Resources */}
                  <div className="p-6 bg-[#131722] border border-[rgba(255,255,255,0.08)] rounded-[20px] space-y-4 shadow-sm text-left flex flex-col justify-between flex-1">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-sans flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#7C4DFF]" /> Shared Resources
                      </h3>
                      <p className="text-[10px] text-slate-400 font-normal leading-relaxed">
                        Download syllabus reference documents and study guide resources linked to this workspace.
                      </p>
                    </div>
                    
                    {myGroups.length === 0 ? (
                      <div className="p-4 bg-[#090B14] border border-dashed border-white/10 rounded-xl text-center py-6">
                        <p className="text-[10px] text-slate-400 font-normal leading-relaxed italic">
                          No resources shared yet. Resources will appear after you join a study circle.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2 font-sans">
                        {/* Attachment 1 */}
                        <div className="p-3 bg-[#090B14] border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/10">
                              <span className="text-[9px] font-bold text-red-400">PDF</span>
                            </div>
                            <div className="min-w-0 text-left">
                              <h4 className="text-[11px] font-bold text-white truncate max-w-[110px] sm:max-w-[140px]" title="DBMS Schema Design Cheat Sheet.pdf">
                                DBMS Schema Design Cheat Sheet.pdf
                              </h4>
                              <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">1.2 MB</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              showToast('Downloading DBMS Schema cheat sheet.txt...', 'success'); 
                              const content = `StudyCircle Placement Preparation: DBMS Schema Design Cheat Sheet\n----------------------------------------------------------------\n1. Keys:\n   - Primary Key: Unique, non-null identifier for a record.\n   - Foreign Key: Field referencing primary key of another table.\n2. Normalization Rules:\n   - 1NF: Atomic values, unique column names.\n   - 2NF: In 1NF and no partial dependencies.\n   - 3NF: In 2NF and no transitive dependencies.\n   - BCNF: For any dependency A -> B, A must be a super key.\n3. Joins:\n   - INNER JOIN: Returns matches in both tables.\n   - LEFT JOIN: Returns all records from left table and matches from right table.`;
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = 'dbms_schema_cheat_sheet.txt';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            }}
                            className="px-2 py-1 bg-[#7C4DFF]/10 hover:bg-[#7C4DFF] hover:text-white border border-[#7C4DFF]/30 text-[#7C4DFF] text-[9px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Download &darr;
                          </button>
                        </div>

                        {/* Attachment 2 */}
                        <div className="p-3 bg-[#090B14] border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/10">
                              <span className="text-[9px] font-bold text-red-400">PDF</span>
                            </div>
                            <div className="min-w-0 text-left">
                              <h4 className="text-[11px] font-bold text-white truncate max-w-[110px] sm:max-w-[140px]" title="Syllabus Reference Notes.pdf">
                                Syllabus Reference Notes.pdf
                              </h4>
                              <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">2.4 MB</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => { 
                              e.preventDefault(); 
                              showToast('Downloading Syllabus Reference Notes.txt...', 'success'); 
                              const content = `StudyCircle Placement Preparation: Syllabus Reference Notes\n----------------------------------------------------------\nRecommended placement preparation track subjects:\n1. Data Structures & Algorithms (Trees, Graphs, Recursion, DFS, BFS)\n2. Database Management Systems (SQL, Normalization, ACID Properties)\n3. Web Development (Next.js, TailwindCSS, State Management, APIs)\n\nStudy Circle Rules:\n- Schedule dynamic focus logs daily.\n- Participate in peer reviews during live audio study rooms.\n- Verify doubt statuses with allocated mentors.`;
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = 'syllabus_reference_notes.txt';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            }}
                            className="px-2 py-1 bg-[#7C4DFF]/10 hover:bg-[#7C4DFF] hover:text-white border border-[#7C4DFF]/30 text-[#7C4DFF] text-[9px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Download &darr;
                          </button>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setShowResourcesModal(true)}
                      className="text-[10px] font-semibold text-[#7C4DFF] hover:text-[#6C3DFF] flex items-center gap-1 mt-3 bg-transparent border-none cursor-pointer self-start transition-colors"
                    >
                      View all resources &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Info Banner */}
              <div className="w-full h-[60px] bg-[#131722] border border-[rgba(255,255,255,0.08)] rounded-[20px] flex items-center px-6 gap-3 shadow-sm select-none">
                <div className="flex items-center gap-2.5 text-xs text-slate-350">
                  <span className="text-sm">💡</span>
                  <span className="font-normal text-slate-400">
                    Need an invite code? <span className="font-semibold text-slate-200">Contact your mentor or classmates</span> to receive a valid study circle invite.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Rooms */}
          {(activeTab === 'rooms' || (activeTab === 'study' && studySubView === 'rooms')) && (
            <div className="space-y-6 text-left animate-in fade-in duration-350 text-white">
              
              {/* Back breadcrumb */}
              {activeTab === 'study' && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setStudySubView(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                  >
                    &larr; Back to Study
                  </button>
                  <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Study &gt; Study Rooms</span>
                </div>
              )}

              {/* Title & Actions Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" /> Collaborative Study Rooms
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Create, join, and manage custom workspaces to study with peers.</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreateRoomModal(true)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition border-none cursor-pointer flex items-center gap-1.5"
                  >
                    ➕ Create Study Room
                  </button>
                  <button
                    onClick={() => {
                      setFilterSort('Newest');
                      document.getElementById('explore-rooms-header')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-xl border border-white/5 transition cursor-pointer flex items-center gap-1.5"
                  >
                    🚀 Explore Rooms
                  </button>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-[#0B0F19]/45 border border-white/5 rounded-2xl p-4.5 space-y-3.5 shadow-sm text-left">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input 
                      type="text"
                      value={searchRoomsQuery}
                      onChange={(e) => setSearchRoomsQuery(e.target.value)}
                      placeholder="Search Study Rooms..."
                      className="w-full bg-slate-900 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="All">All Subjects</option>
                      <option value="Programming & DSA">Programming & DSA</option>
                      <option value="Web Development">Web Development</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Aptitude">Aptitude</option>
                      <option value="Interview Preparation">Interview Preparation</option>
                      <option value="GATE">GATE</option>
                      <option value="UPSC">UPSC</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="All">All Difficulties</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* My Study Rooms section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-350">My Study Rooms</h3>
                
                {filteredMyGroups.length === 0 ? (
                  <div className="p-8 bg-[#1E293B]/40 border border-dashed border-white/5 rounded-[24px] text-center space-y-4 max-w-xl mx-auto">
                    <span className="text-3xl block">🏫</span>
                    <p className="text-xs font-black text-slate-400">You haven't joined or created any study rooms yet.</p>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      Collaborative study spaces are the core of StudyCircle. Start a private or public study room, set goals, and study together.
                    </p>
                    <div className="flex gap-3 justify-center pt-2">
                      <button 
                        onClick={() => setShowCreateRoomModal(true)}
                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer border-none"
                      >
                        Create Room
                      </button>
                      <button 
                        onClick={() => {
                          setFilterSubject('All');
                          setSearchRoomsQuery('');
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-black uppercase rounded-xl border border-white/5 transition cursor-pointer"
                      >
                        Explore Rooms
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {filteredMyGroups.map((room) => {
                      const meta = parseGroupMeta(room);
                      return (
                        <div 
                          key={room.id}
                          className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/5 hover:border-indigo-500/20 rounded-[28px] p-5 shadow-lg flex flex-col justify-between gap-4 transition-all duration-300 hover:scale-[1.01]"
                        >
                          <div className="space-y-3.5">
                            <div className="flex justify-between items-start">
                              <span className="h-10 w-10 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center justify-center text-xl shrink-0">
                                {meta.icon || '📚'}
                              </span>
                              <div className="flex gap-1.5">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                  meta.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                                  meta.difficulty === 'Advanced' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' :
                                  'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                }`}>
                                  {meta.difficulty}
                                </span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                  room.isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-455'
                                }`}>
                                  {room.isPublic ? '🌍 Public' : '🔒 Private'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-white">{room.name}</h4>
                              <span className="text-[9px] text-[#818CF8] font-black uppercase block">{room.subject}</span>
                              <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 mt-1">{meta.text || 'Co-study learning workspace.'}</p>
                            </div>

                            <div className="bg-[#0B0F19]/40 border border-white/5 rounded-xl p-2.5 space-y-1 text-[9px] font-black text-slate-400">
                              <div className="flex justify-between">
                                <span>Topic:</span>
                                <span className="text-white">{meta.topic}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Members Online:</span>
                                <span className="text-emerald-450">🟢 3 online</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Members:</span>
                                <span>15 members</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Last Active:</span>
                                <span className="text-slate-500 font-semibold font-mono">Active 5m ago</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => {
                                const slug = getSlugByGroup(room);
                                router.push(`/workspace/${slug}`);
                              }}
                              className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer border-none text-center"
                            >
                              Continue Studying
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Explore / Recommended Study Rooms */}
              <div id="explore-rooms-header" className="space-y-4 pt-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-350">Recommended Study Rooms</h3>
                
                {filteredAvailableGroups.length === 0 ? (
                  <div className="p-8 bg-[#1E293B]/40 border border-dashed border-white/5 rounded-[24px] text-center space-y-4 max-w-xl mx-auto">
                    <span className="text-3xl block">🪐</span>
                    <p className="text-xs font-black text-slate-400">No active study rooms available.</p>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      Be the first to start a room and invite your friends.
                    </p>
                    <div className="flex gap-3 justify-center pt-2">
                      <button 
                        onClick={() => setShowCreateRoomModal(true)}
                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer border-none"
                      >
                        Create Room
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {filteredAvailableGroups.map((room) => {
                      const meta = parseGroupMeta(room);
                      return (
                        <div 
                          key={room.id}
                          className="bg-[#0B0F19] border border-white/5 hover:border-indigo-500/20 rounded-[28px] p-5 shadow-lg flex flex-col justify-between gap-4 transition-all duration-300 hover:scale-[1.01]"
                        >
                          <div className="space-y-3.5">
                            <div className="flex justify-between items-start">
                              <span className="h-10 w-10 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-xl shrink-0">
                                {meta.icon || '📚'}
                              </span>
                              <div className="flex gap-1.5">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                  meta.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                                  meta.difficulty === 'Advanced' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/10' :
                                  'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                }`}>
                                  {meta.difficulty}
                                </span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                  room.isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-455'
                                }`}>
                                  {room.isPublic ? '🌍 Public' : '🔒 Private'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-white truncate">{room.name}</h4>
                              <span className="text-[9px] text-[#818CF8] font-black uppercase block">{room.subject}</span>
                              <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 mt-1">{meta.text || 'Co-study learning workspace.'}</p>
                            </div>

                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400">
                              <span>🟢 5 online</span>
                              <span>•</span>
                              <span>24 members</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => {
                                setPreviewRoom(room);
                                setShowPreviewDrawer(true);
                              }}
                              className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/5 text-slate-350 hover:text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer text-center"
                            >
                              Preview
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await apiRequest(`/groups/${room.id}/join-public`, { method: 'POST' });
                                  showToast('Joined study room successfully! +10 XP earned.', 'success');
                                  setStats(prev => ({ ...prev, xp: prev.xp + 10 }));
                                  await loadDashboardData(user);
                                  const roomSlug = getSlugByGroup(room);
                                  router.push(`/workspace/${roomSlug}`);
                                } catch (e: any) {
                                  showToast(e.message || 'Failed to join group.', 'error');
                                }
                              }}
                              className="flex-grow py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer border-none text-center"
                            >
                              Join Room
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Create Room Modal Form */}
              {showCreateRoomModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                  <div className="bg-[#0b0f19] border border-white/10 rounded-[32px] w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-left overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h3 className="text-sm font-black uppercase tracking-wider text-white">Create Custom Study Room</h3>
                      <button 
                        onClick={() => setShowCreateRoomModal(false)}
                        className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/5 border-none bg-transparent"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateStudyRoom} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Room Name</label>
                          <input 
                            type="text"
                            required
                            value={createRoomName}
                            onChange={(e) => setCreateRoomName(e.target.value)}
                            placeholder="e.g. Swathi's DBMS Masterclass"
                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Subject Category</label>
                          <select
                            value={createRoomSubject}
                            onChange={(e) => setCreateRoomSubject(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          >
                            <option value="Programming & DSA">Programming & DSA</option>
                            <option value="Web Development">Web Development</option>
                            <option value="AI & Machine Learning">AI & Machine Learning</option>
                            <option value="Aptitude">Aptitude</option>
                            <option value="Interview Preparation">Interview Preparation</option>
                            <option value="GATE">GATE</option>
                            <option value="UPSC">UPSC</option>
                            <option value="Mathematics">Mathematics</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Focus Topic</label>
                          <input 
                            type="text"
                            value={createRoomTopic}
                            onChange={(e) => setCreateRoomTopic(e.target.value)}
                            placeholder="e.g. Relational Calculus"
                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tags (comma-separated)</label>
                          <input 
                            type="text"
                            value={createRoomTags}
                            onChange={(e) => setCreateRoomTags(e.target.value)}
                            placeholder="dbms, normal-form, exam"
                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Difficulty</label>
                          <select
                            value={createRoomDiff}
                            onChange={(e) => setCreateRoomDiff(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Visibility</label>
                          <select
                            value={createRoomIsPublic ? 'public' : 'private'}
                            onChange={(e) => setCreateRoomIsPublic(e.target.value === 'public')}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          >
                            <option value="public">🌍 Public</option>
                            <option value="private">🔒 Private</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Max Participants</label>
                          <select
                            value={createRoomMax}
                            onChange={(e) => setCreateRoomMax(e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                          >
                            <option value="10">10 Members</option>
                            <option value="25">25 Members</option>
                            <option value="50">50 Members</option>
                            <option value="100">100 Members</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Description</label>
                        <textarea 
                          required
                          value={createRoomDesc}
                          onChange={(e) => setCreateRoomDesc(e.target.value)}
                          placeholder="Provide study goals, workspace description, and guidelines..."
                          rows={3}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Room Emoji Icon</label>
                          <div className="flex gap-2">
                            {['📚', '💻', '🤖', '🔐', '🎯', '🏛', '🧮'].map((emoji) => (
                              <button
                                type="button"
                                key={emoji}
                                onClick={() => setCreateRoomIcon(emoji)}
                                className={`text-base p-1.5 rounded-lg border transition ${
                                  createRoomIcon === emoji ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'border-white/5 bg-transparent'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Cover Preset</label>
                          <div className="flex gap-2">
                            {['/images/dsa-cover.jpg', '/images/web-cover.jpg', '/images/ai-cover.jpg'].map((cover, idx) => (
                              <button
                                type="button"
                                key={cover}
                                onClick={() => setCreateRoomCover(cover)}
                                className={`text-[10px] font-mono p-1 rounded-lg border transition ${
                                  createRoomCover === cover ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'border-white/5 bg-transparent'
                                }`}
                              >
                                Cover {idx + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <button 
                          type="button"
                          onClick={() => setShowCreateRoomModal(false)}
                          className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={creatingRoom}
                          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer border-none"
                        >
                          {creatingRoom ? 'Creating...' : 'Create Room'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Study Room Preview Drawer */}
              {showPreviewDrawer && previewRoom && (
                (() => {
                  const meta = parseGroupMeta(previewRoom);
                  return (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex justify-end">
                      <div className="bg-[#0b0f19] border-l border-white/10 w-full max-w-md h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between text-left animate-in slide-in-from-right duration-250">
                        <div className="space-y-5 flex-1 overflow-y-auto pr-1">
                          <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{meta.icon || '📚'}</span>
                              <h3 className="text-sm font-black uppercase tracking-wider text-white">Room Preview</h3>
                            </div>
                            <button 
                              onClick={() => setShowPreviewDrawer(false)}
                              className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/5 border-none bg-transparent"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] text-[#818CF8] font-black uppercase tracking-wider">{previewRoom.subject}</span>
                              <h2 className="text-base font-black text-white mt-0.5">{previewRoom.name}</h2>
                              <p className="text-[9px] text-slate-455 font-mono uppercase tracking-widest mt-1">Invite Code: {previewRoom.inviteCode}</p>
                            </div>

                            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-3">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Description</h4>
                              <p className="text-xs text-slate-350 leading-relaxed font-semibold">{meta.text || 'Join focused peers in this study room.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                                <span className="text-[8px] text-slate-505 font-black block uppercase">Difficulty</span>
                                <span className="text-xs font-black text-white block mt-0.5">{meta.difficulty}</span>
                              </div>
                              <div className="p-3 bg-slate-900 border border-white/5 rounded-xl">
                                <span className="text-[8px] text-slate-505 font-black block uppercase">Capacity</span>
                                <span className="text-xs font-black text-white block mt-0.5">{meta.maxParticipants} Members max</span>
                              </div>
                            </div>

                            <div className="space-y-2.5">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Simulated Room State</h4>
                              <div className="bg-slate-900 border border-white/5 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-400 font-bold">
                                <div className="flex justify-between">
                                  <span>🟢 Members Online:</span>
                                  <span className="text-white">3 students active</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>📂 Notes Shared:</span>
                                  <span className="text-white">6 files published</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>💬 Discussion Count:</span>
                                  <span className="text-white">12 doubts posted</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>📞 Active Calls:</span>
                                  <span className="text-white">1 live call session</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Study Rules</h4>
                              <ul className="list-decimal pl-4.5 text-[10px] text-slate-400 font-semibold space-y-1">
                                <li>Be respectful and collaborative.</li>
                                <li>Focus on study goals and academic recall.</li>
                                <li>Share notes and verify conceptual solutions.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/5 shrink-0">
                          <button 
                            type="button"
                            onClick={() => setShowPreviewDrawer(false)}
                            className="flex-1 py-2.5 bg-transparent hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase rounded-xl transition cursor-pointer"
                          >
                            Close Preview
                          </button>
                          <button 
                            type="button"
                            onClick={async () => {
                              try {
                                await apiRequest(`/groups/${previewRoom.id}/join-public`, { method: 'POST' });
                                showToast('Joined study room successfully! +10 XP earned.', 'success');
                                setStats(prev => ({ ...prev, xp: prev.xp + 10 }));
                                await loadDashboardData(user);
                                setShowPreviewDrawer(false);
                                const roomSlug = getSlugByGroup(previewRoom);
                                router.push(`/workspace/${roomSlug}`);
                              } catch (e: any) {
                                showToast(e.message || 'Failed to join group.', 'error');
                              }
                            }}
                            className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition border-none cursor-pointer"
                          >
                            Join Room
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          )}

          {/* Tab: Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-6 text-left animate-in fade-in duration-350">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Bookmark className="h-4.5 w-4.5 text-[#5227EB]" /> Bookmarked Resources
              </h3>

              {notesList.filter(n => n.isBookmarked).length === 0 ? (
                <div className="p-12 bg-white border border-slate-200 rounded-[24px] text-center space-y-3 shadow-sm max-w-2xl">
                  <Bookmark className="h-8 w-8 text-slate-350 mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">No bookmarks saved yet.</p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Click the bookmark button on any shared note to save it here for quick access.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                  {notesList.filter(n => n.isBookmarked).map((note) => (
                    <div key={note.id} className="p-5 bg-white border border-slate-200 rounded-[24px] shadow-sm flex flex-col justify-between gap-4">
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-550/10 text-[#5227EB] border border-indigo-500/10">
                            {note.type}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">{note.size}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900">{note.name}</h4>
                        {note.publishedBy && (
                          <div className="text-[9px] text-slate-500 font-bold bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 inline-flex items-center gap-1 mt-1">
                            <span>👤 Published by:</span>
                            <span className="text-[#5227EB]">{note.publishedBy}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleNoteBookmark(note.id)}
                          className="flex-1 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleDownloadNote(note.id, note.name)}
                          className="flex-1 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Resources (Gamified progression vault) */}
          {(activeTab === 'resources' || (activeTab === 'study' && studySubView === 'resources')) && (
            <div className="space-y-6 text-left animate-in fade-in duration-350 text-white">
              {activeTab === 'study' && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setStudySubView(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                  >
                    &larr; Back to Study
                  </button>
                  <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Study &gt; Resources</span>
                </div>
              )}
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1F3A35] border border-white/10 rounded-[24px] shadow-lg p-6 relative overflow-hidden">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-xl font-black text-white">Resources</h2>
                  </div>
                  <p className="text-xs text-slate-350">Learn. Earn. Unlock. Grow. ✨</p>
                </div>
                
                {/* Stats Panel matching the top bar header of mockup */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* StudyCoins */}
                  <div className="flex items-center gap-2 bg-[#0B0F19] border border-white/5 rounded-2xl px-4 py-2.5 shadow-sm">
                    <span className="text-amber-500 font-extrabold text-sm flex items-center justify-center bg-amber-500/10 h-7 w-7 rounded-lg">🪙</span>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Balance</p>
                      <p className="text-xs font-black text-slate-200">{stats.focusCoins.toLocaleString()} StudyCoins</p>
                    </div>
                  </div>
                  {/* Streak */}
                  <div className="flex items-center gap-2 bg-[#0B0F19] border border-white/5 rounded-2xl px-4 py-2.5 shadow-sm">
                    <Flame className="h-4.5 w-4.5 text-orange-500" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Streak</p>
                      <p className="text-xs font-black text-slate-200">{stats.streakCount} Day Streak</p>
                    </div>
                  </div>
                  {/* Level */}
                  <div className="flex items-center gap-2 bg-[#0B0F19] border border-white/5 rounded-2xl px-4 py-2.5 shadow-sm">
                    <img 
                      src={user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender)}
                      className={`h-8 w-8 rounded-full ${headerAvatarRingClass}`}
                      alt="Avatar"
                    />
                    <div>
                      <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">{user?.fullName?.split(' ')[0] || 'User'}</p>
                      <p className="text-xs font-black text-slate-200">Level {stats.level}</p>
                    </div>
                  </div>
                </div>
              </div>

              
              {/* Sub-tab Toggle */}
              <div className="flex gap-2 border-b border-white/5 pb-2 mb-6">
                <button 
                  onClick={() => setResourcesSubTab('vault')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    resourcesSubTab === 'vault' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-white/[0.02] border border-white/5 text-slate-455 hover:text-white'
                  }`}
                >
                  Academic Vault
                </button>
                <button 
                  onClick={() => setResourcesSubTab('shop')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    resourcesSubTab === 'shop' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-white/[0.02] border border-white/5 text-slate-455 hover:text-white'
                  }`}
                >
                  Cosmetic Shop
                </button>
              </div>

              {resourcesSubTab === 'vault' ? (
                <>
{/* Engagement Cards (Interactive Next Unlock, Daily Reward, Study Quest) */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* 1. Next Unlock */}
                {(() => {
                  const nextResource = resourcesList.find(res => !unlockedResources.includes(res.id)) || null;
                  if (!nextResource) {
                    return (
                      <div className="bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A]/90 to-[#312E81]/30 border border-indigo-500/25 rounded-[24px] p-5 space-y-4 shadow-lg text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            🔥 Next Unlock
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-slate-100">All Unlocked!</h4>
                          <p className="text-[10px] text-slate-400 leading-normal font-bold">You have unlocked all premium resources. Great work! 🏆</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black text-slate-350">
                            <span>Progress</span>
                            <span>100%</span>
                          </div>
                          <div className="w-full bg-[#0B0F19] h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }} />
                          </div>
                        </div>
                      </div>
                    );
                  }
                  const progress = getNextUnlockProgress(nextResource);
                  const nudge = getNextUnlockNudge(nextResource);
                  return (
                    <div className="bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A]/90 to-[#312E81]/30 border border-[#818CF8]/25 rounded-[24px] p-5 space-y-4 shadow-lg text-left flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            🔥 Next Unlock
                          </span>
                          <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">In Progress</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-slate-100">{nextResource.title}</h4>
                          <p className="text-[10px] text-[#818CF8] font-black">{nudge}</p>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-350">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-[#0B0F19] h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Today's Reward */}
                {(() => {
                  const studyMins = Math.floor(timerSeconds / 60);
                  const studyPercent = Math.min(100, Math.round((timerSeconds / 3600) * 100));
                  const isCompleted = studyPercent >= 100;
                  
                  return (
                    <div className="bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A]/90 to-[#064E3B]/30 border border-[#10B981]/25 rounded-[24px] p-5 space-y-4 shadow-lg text-left flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            🎁 Today's Reward
                          </span>
                          {claimedTodayReward ? (
                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 rounded px-1.5 py-0.5">Claimed ✓</span>
                          ) : isCompleted ? (
                            <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/10 rounded px-1.5 py-0.5 animate-pulse">Ready!</span>
                          ) : (
                            <span className="text-[9px] font-black text-slate-455 uppercase tracking-wider">Daily Goal</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-slate-100">Study 60 mins</h4>
                          <p className="text-[10px] text-emerald-450 font-black">Reward: DSA Cheat Sheet</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-350">
                          <span>Progress</span>
                          <span>{studyMins} / 60 mins</span>
                        </div>
                        <div className="w-full bg-[#0B0F19] h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${studyPercent}%` }} />
                        </div>
                        
                        {!claimedTodayReward && isCompleted ? (
                          <button
                            onClick={handleClaimTodayReward}
                            className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer border-none text-center shadow-md shadow-emerald-500/20 active:scale-95 mt-1"
                          >
                            Claim Cheat Sheet
                          </button>
                        ) : claimedTodayReward ? (
                          <button
                            disabled
                            className="w-full py-1.5 bg-white/5 border border-white/5 text-slate-500 text-[10px] font-black rounded-xl text-center mt-1 cursor-not-allowed opacity-60"
                          >
                            Claimed Successfully
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveTab('dashboard');
                              showToast('Start the focus timer to log study sessions and complete this goal!', 'info');
                            }}
                            className="w-full py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-black rounded-xl transition-all cursor-pointer text-center mt-1"
                          >
                            Start Focus Timer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Study Quest */}
                {(() => {
                  const questPercent = 80;
                  return (
                    <div className="bg-gradient-to-br from-[#1E293B]/80 via-[#0F172A]/90 to-[#78350F]/30 border border-amber-500/25 rounded-[24px] p-5 space-y-4 shadow-lg text-left flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-450 uppercase tracking-wider flex items-center gap-1.5">
                            🏆 Weekly Quest
                          </span>
                          <span className="text-[9px] font-black text-slate-455 uppercase tracking-wider">Active</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-slate-100">Complete 5 sessions this week</h4>
                          <p className="text-[10px] text-amber-500 font-black">Reward: Interview Question Bank</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-350">
                          <span>Quest Progress</span>
                          <span>4 / 5 sessions</span>
                        </div>
                        <div className="w-full bg-[#0B0F19] h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${questPercent}%` }} />
                        </div>
                        
                        <button
                          onClick={() => {
                            setActiveTab('rooms');
                            showToast('Join study rooms or log focus sessions to complete the weekly quest!', 'info');
                          }}
                          className="w-full py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-xl transition-all cursor-pointer text-center border-none shadow-md shadow-indigo-650/15"
                        >
                          Join Study Room
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Main Content Area */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left Area (70%): Filters & Grid */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Filters and Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    {/* Category Filter Chips */}
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Notes', 'Courses', 'Videos', 'Practice', 'Books', 'Cheatsheets'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setResourcesFilter(cat)}
                          className={`px-3.5 py-1.5 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer ${
                            resourcesFilter === cat
                              ? 'bg-[#5227EB] border-[#5227EB] text-white shadow-md shadow-[#5227EB]/20'
                              : 'bg-[#1E293B]/40 border-white/5 text-slate-450 hover:bg-[#1E293B]/80 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {/* Search */}
                    <div className="relative flex-1 sm:max-w-xs">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search resources..."
                        value={resourcesSearch}
                        onChange={(e) => setResourcesSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#1E293B]/40 border border-white/5 rounded-xl text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-[#5227EB]/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Explore Grid */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" /> Explore Resources
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {resourcesList
                        .filter(res => {
                          const matchesFilter = resourcesFilter === 'All' || res.category === resourcesFilter;
                          const matchesSearch = res.title.toLowerCase().includes(resourcesSearch.toLowerCase()) ||
                                                res.description.toLowerCase().includes(resourcesSearch.toLowerCase());
                          return matchesFilter && matchesSearch;
                        })
                        .map((resource) => {
                          const isUnlocked = unlockedResources.includes(resource.id);
                          const isEligible = 
                            stats.focusCoins >= resource.coinsReq && 
                            stats.streakCount >= resource.streakReq && 
                            stats.totalStudyHours >= resource.hoursReq && 
                            stats.level >= resource.levelReq;
                          
                          return (
                            <div 
                              key={resource.id} 
                              className={`bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border rounded-[24px] shadow-lg p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-xl ${
                                isUnlocked 
                                  ? 'border-emerald-500/35 hover:border-emerald-500/50' 
                                  : isEligible
                                    ? 'border-indigo-500/35 hover:border-[#5227EB]/50'
                                    : 'border-white/5 hover:border-white/10 opacity-80'
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                    resource.category === 'Notes' ? 'bg-indigo-500/15 border-indigo-400/20 text-indigo-400' :
                                    resource.category === 'Videos' ? 'bg-emerald-500/15 border-emerald-400/20 text-emerald-400' :
                                    resource.category === 'Practice' ? 'bg-amber-500/15 border-amber-400/20 text-amber-500' :
                                    'bg-sky-500/15 border-sky-400/20 text-sky-400'
                                  }`}>
                                    {resource.category}
                                  </span>
                                  
                                  {isUnlocked ? (
                                    <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/15">
                                      Unlocked
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/15 text-rose-450 border border-rose-500/15 flex items-center gap-1">
                                      <Lock className="h-2.5 w-2.5" /> Locked
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-white">{resource.title}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold leading-normal">{resource.description}</p>
                                </div>
                                
                                {/* Lock Requirements Overview */}
                                {!isUnlocked && (
                                  <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-2.5 space-y-1.5 text-[9px] font-bold">
                                    <p className="text-slate-400 uppercase tracking-wide text-[8px] font-black">Requirements to Unlock:</p>
                                    <div className="grid grid-cols-2 gap-1.5 text-slate-350">
                                      <div className={`flex items-center gap-1 ${stats.focusCoins >= resource.coinsReq ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <span>🪙</span> {resource.coinsReq} Coins
                                      </div>
                                      {resource.streakReq > 0 && (
                                        <div className={`flex items-center gap-1 ${stats.streakCount >= resource.streakReq ? 'text-emerald-400' : 'text-slate-500'}`}>
                                          <Flame className="h-2.5 w-2.5" /> {resource.streakReq} Day Streak
                                        </div>
                                      )}
                                      {resource.hoursReq > 0 && (
                                        <div className={`flex items-center gap-1 ${stats.totalStudyHours >= resource.hoursReq ? 'text-emerald-400' : 'text-slate-500'}`}>
                                          <Clock className="h-2.5 w-2.5" /> {resource.hoursReq} Study Hours
                                        </div>
                                      )}
                                      {resource.levelReq > 1 && (
                                        <div className={`flex items-center gap-1 ${stats.level >= resource.levelReq ? 'text-emerald-400' : 'text-slate-500'}`}>
                                          <Shield className="h-2.5 w-2.5" /> Level {resource.levelReq}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="pt-2 border-t border-white/5">
                                {isUnlocked ? (
                                  <button
                                    onClick={() => showToast(`Accessing ${resource.title}...`, 'success')}
                                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/10"
                                  >
                                    <Download className="h-3 w-3" /> Access Resource
                                  </button>
                                ) : isEligible ? (
                                  <button
                                    onClick={() => handleUnlockResource(resource.id, resource.coinsReq)}
                                    className="w-full py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-650/10 hover:shadow-indigo-600/20 active:scale-[0.98]"
                                  >
                                    <Unlock className="h-3 w-3" /> Unlock Resource
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="w-full py-1.5 bg-white/5 border border-white/5 text-slate-500 text-[10px] font-black rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 opacity-60"
                                  >
                                    <Lock className="h-3 w-3" /> Locked (Inconsistent)
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Right Area (30%): Sidebar */}
                <div className="space-y-6">
                  {/* Balance details */}
                  <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-5 space-y-4 text-left">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Your Balance</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-[#0B0F19] border border-white/5 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-[14px] font-black text-slate-100">{stats.focusCoins.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">StudyCoins</p>
                        </div>
                        <span className="text-xl">🪙</span>
                      </div>
                      <button
                        onClick={() => showToast('Transaction history is empty.', 'info')}
                        className="w-full py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-350 text-[10px] font-extrabold rounded-xl transition-all cursor-pointer text-center"
                      >
                        View Transaction History
                      </button>
                    </div>
                  </div>

                  {/* Rules of consistency */}
                  <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-5 space-y-4 text-left">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Unlock Rules</h4>
                    <div className="space-y-3.5 text-[10px] font-bold text-slate-300">
                      <div className="flex gap-2.5 items-start">
                        <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 font-extrabold text-xs">🪙</div>
                        <div>
                          <p className="text-slate-100 font-extrabold text-[11px]">Study & earn coins</p>
                          <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Log focus sessions and complete goals to earn currency.</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="h-6 w-6 rounded-lg bg-orange-500/10 border border-orange-500/10 flex items-center justify-center text-orange-400 shrink-0 font-extrabold text-xs">🔥</div>
                        <div>
                          <p className="text-slate-100 font-extrabold text-[11px]">Maintain streak</p>
                          <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Daily study consistency unlocks badge rewards and bonus multipliers.</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <div className="h-6 w-6 rounded-lg bg-[#5227EB]/10 border border-[#5227EB]/10 flex items-center justify-center text-[#5227EB] shrink-0 font-extrabold text-xs">🔒</div>
                        <div>
                          <p className="text-slate-100 font-extrabold text-[11px]">Unlock resources</p>
                          <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Access advanced notes and mentor resources by maintaining study logs.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('rooms')}
                        className="w-full py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-xl transition-all cursor-pointer text-center border-none"
                      >
                        Earn More Coins
                      </button>
                    </div>
                  </div>

                  {/* Daily Reward Box */}
                  <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-5 space-y-4 text-left">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Daily Reward</h4>
                    <div className="p-4 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1F3A35] border border-white/10 rounded-2xl flex flex-col items-center text-center space-y-3">
                      <div className="h-16 w-16 bg-[#5227EB]/10 border border-[#5227EB]/20 rounded-2xl flex items-center justify-center text-3xl animate-bounce duration-1000">
                        🎁
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-200">Daily Treasure Box</p>
                        <p className="text-[9px] text-slate-450 leading-normal">Complete today's goals to open the treasure box!</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="w-full py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-black rounded-xl transition-all cursor-pointer text-center border-none"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>

                </div>

              </div>



            
                </>
              ) : (
                <div className="space-y-6">
                  {/* Shop Header */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-405 flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" /> Focus Coins Cosmetic Marketplace
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Unlock themes, badges, spotlights, and frames to display your profile premium styles.</p>
                  </div>

                  {/* Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        id: 'theme_emerald_cosmic',
                        name: 'Emerald Cosmic Theme',
                        cost: 100,
                        description: 'Gives your dashboard a glowing emerald gradient skin.',
                        type: 'theme',
                        icon: '🟢'
                      },
                      {
                        id: 'theme_solar_glow',
                        name: 'Solar Glow Theme',
                        cost: 100,
                        description: 'Gives your dashboard an amber-to-orange solar gradient skin.',
                        type: 'theme',
                        icon: '🟡'
                      },
                      {
                        id: 'theme_dark_nebula',
                        name: 'Midnight Nebula Theme',
                        cost: 100,
                        description: 'Gives your dashboard a deep cosmic purple skin.',
                        type: 'theme',
                        icon: '🟣'
                      },
                      {
                        id: 'badge_elite_scholar',
                        name: 'Elite Scholar Badge',
                        cost: 250,
                        description: 'Unlocks a premium golden Scholar badge on your public profile shelf.',
                        type: 'badge',
                        icon: '🏆'
                      },
                      {
                        id: 'badge_code_ninja',
                        name: 'Code Ninja Badge',
                        cost: 250,
                        description: 'Unlocks a premium dark shadow Ninja badge on your public profile shelf.',
                        type: 'badge',
                        icon: '🥷'
                      },
                      {
                        id: 'mentor_spotlight',
                        name: 'Mentor Spotlight Status',
                        cost: 500,
                        description: 'Highlights your profile card on leaderboards and search results.',
                        type: 'spotlight',
                        icon: '✨'
                      },
                      {
                        id: 'frame_neon_cyan',
                        name: 'Neon Cyan Frame',
                        cost: 1000,
                        description: 'Surrounds your avatar with a glowing cyan cyber aura border.',
                        type: 'frame',
                        icon: '🖼️'
                      },
                      {
                        id: 'frame_gold_shine',
                        name: 'Golden Radiance Frame',
                        cost: 1000,
                        description: 'Surrounds your avatar with a glowing golden champion border.',
                        type: 'frame',
                        icon: '👑'
                      }
                    ].map((item) => {
                      const isUnlocked = parsedBadges.some((b: any) => b.id === item.id);
                      const isTheme = item.type === 'theme';
                      const isEquipped = isTheme && equippedTheme === item.id;
                      
                      const canBuy = stats.focusCoins >= item.cost;
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/5 hover:border-white/10 rounded-[24px] shadow-lg p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-xl`}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-black uppercase px-2.5 py-1 rounded-full border bg-indigo-500/15 border-indigo-400/20 text-indigo-400">
                                {item.type}
                              </span>
                              
                              {isUnlocked ? (
                                <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/15">
                                  Unlocked
                                </span>
                              ) : (
                                <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/15 text-rose-455 border border-rose-500/15 flex items-center gap-1">
                                  <Lock className="h-2.5 w-2.5" /> Locked
                                </span>
                              )}
                            </div>
                            
                            <div className="flex gap-2.5 items-start">
                              <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-amber-500 shrink-0 font-black text-lg">
                                {item.icon}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-slate-200">{item.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-1">{item.description}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                            <span className="text-[10px] font-extrabold text-slate-350 flex items-center gap-1">
                              🪙 {item.cost} Coins
                            </span>

                            {isUnlocked ? (
                              isTheme ? (
                                <button
                                  onClick={() => {
                                    setEquippedTheme(item.id);
                                    localStorage.setItem('studycircle_equipped_theme', item.id);
                                    showToast(`${item.name} equipped successfully!`, 'success');
                                  }}
                                  disabled={isEquipped}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                                    isEquipped 
                                      ? 'bg-emerald-600/35 border border-emerald-500/25 text-emerald-300' 
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  }`}
                                >
                                  {isEquipped ? 'Equipped ✓' : 'Equip Theme'}
                                </button>
                              ) : (
                                <span className="text-[9px] text-slate-450 font-bold">Unlocked ✓</span>
                              )
                            ) : (
                              <button
                                onClick={() => handleBuyShopItem(item.id, item.cost, item.name, item.type)}
                                disabled={!canBuy}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                                  canBuy 
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md' 
                                    : 'bg-white/[0.02] border border-white/5 text-slate-500'
                                }`}
                              >
                                {canBuy ? 'Unlock Item' : 'Insufficient Coins'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
</div>
          )}
          {activeTab === 'notes' && (
            <div className="space-y-6 text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-[#5227EB]" /> Notes Workspace
              </h3>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {notesList.map((note) => (
                      <div key={note.id} className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/10 rounded-[24px] shadow-lg p-5 flex flex-col justify-between gap-4 text-white hover:border-[#5227EB]/40 hover:shadow-indigo-900/10 transition-all duration-300 group">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border ${
                              note.type === 'exam' ? 'bg-rose-500/15 border-rose-400/20 text-rose-450' :
                              note.type === 'lecture' ? 'bg-emerald-500/15 border-emerald-400/20 text-emerald-400' :
                              'bg-indigo-500/15 border-indigo-400/20 text-indigo-400'
                            }`}>
                              {note.type || 'syllabus'}
                            </span>
                            <span className="text-[10px] text-zinc-455 font-bold">{note.size}</span>
                          </div>
                          
                          <div className="flex gap-2.5 items-start">
                            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 shrink-0 font-black">
                              <FileText className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors truncate">{note.name}</h4>
                              {note.publishedBy && (
                                <p className="text-[9px] text-zinc-500 font-bold mt-1">
                                  by <span className="text-indigo-400 font-black">{note.publishedBy}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
                          <button
                            onClick={() => handleToggleNoteBookmark(note.id)}
                            className={`p-2 rounded-xl border text-[10px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${note.isBookmarked ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-white/10 text-zinc-400 hover:text-white'}`}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${note.isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button
                            onClick={() => handleDownloadNote(note.id, note.name)}
                            className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" /> {note.downloaded ? 'Saved' : 'Download'}
                          </button>
                          
                          {(user?.role === 'mentor' || user?.role === 'admin') && (
                            <button
                              onClick={() => triggerEditNote(note)}
                              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-zinc-350 hover:text-white text-[10px] font-black rounded-xl transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-3 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Syllabus Repository</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Shared note boards let students download pdf cheat-sheets, midterm reviews, and interview prep guidelines. Note additions log active focus stats.
                    </p>
                  </div>

                  {(user?.role === 'admin' || user?.role === 'mentor') && (
                    <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-4 shadow-sm mt-6">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#5227EB] flex items-center gap-1.5">
                        <PlusCircle className="h-4 w-4" /> Publish Shared Note
                      </h3>
                      <p className="text-[9px] text-slate-400 font-semibold">Publish study modules directly to all student dashboards</p>
                      
                      <form onSubmit={handlePublishSharedNote} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Note Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. DBMS Normalization.pdf"
                            value={newNoteName}
                            onChange={(e) => setNewNoteName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">File Size</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. 1.8 MB"
                              value={newNoteSize}
                              onChange={(e) => setNewNoteSize(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none text-slate-700 focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                            <select 
                              value={newNoteCategory}
                              onChange={(e) => setNewNoteCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none text-slate-650 focus:border-indigo-500"
                            >
                              <option value="syllabus">Syllabus</option>
                              <option value="lecture">Lecture</option>
                              <option value="exam">Exam Prep</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          className="w-full py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                          Publish Shared Note
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-[#5227EB]" /> Study Session Schedule
                </h3>
                {(user?.role === 'mentor' || user?.role === 'admin') && (
                  <button 
                    onClick={() => setShowSessionModal(true)}
                    className="px-3 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-bold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Schedule Session
                  </button>
                )}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {mockSessions.map((sess) => (
                    <div key={sess.id} className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/10 rounded-[24px] shadow-lg p-5 flex items-center justify-between gap-4 text-white hover:border-indigo-500/20 transition-all duration-300">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/5 text-[#5227EB] flex items-center justify-center font-black text-xs shrink-0 uppercase tracking-widest bg-gradient-to-tr from-indigo-500/10 to-indigo-400/5">
                          {sess.subject.substring(0, 2)}
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-white truncate">{sess.title}</h4>
                            <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wide shrink-0 ${
                              sess.status === 'Live Now' ? 'bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 animate-pulse' : 'bg-indigo-500/15 border border-indigo-400/20 text-indigo-400'
                            }`}>
                              {sess.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-bold mt-1 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-indigo-400" /> {sess.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {(user?.role === 'mentor' || user?.role === 'admin') && (
                          <button
                            onClick={() => triggerEditSession(sess)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-zinc-350 hover:text-white text-[10px] font-black rounded-xl transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                        <a
                          href={sess.status === 'Live Now' ? '#rooms' : '#'}
                          onClick={(e) => {
                            if (sess.status === 'Live Now') {
                              e.preventDefault();
                              setActiveRoom(sess.title);
                              setRoomSeconds(0);
                              setActiveTab('dashboard');
                            }
                          }}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                            sess.status === 'Live Now'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                              : 'bg-slate-800 text-zinc-400 cursor-not-allowed'
                          }`}
                        >
                          {sess.status === 'Live Now' ? 'Join Lounge' : 'Booked'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="p-6 bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-[24px] space-y-3 shadow-lg text-left text-white">
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Structured Study Circles</h3>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                      Schedules coordinate exam revision timelines and interview prep rounds. Students receive automatic alerts and countdown notifications for booked sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Progress Tracking or Class Analytics */}
          {activeTab === 'progress' && (
            <div className="space-y-8 text-left animate-in fade-in duration-350 bg-[#060913] p-8 rounded-[32px] border border-white/5 shadow-2xl">
              {/* Back to Progress directory breadcrumb for student users */}
              {user?.role === 'student' && progressSubView !== null && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setProgressSubView(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                  >
                    &larr; Back to Progress
                  </button>
                  <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">
                    Progress &gt; {progressSubView === 'analytics' ? 'Analytics' : progressSubView === 'xp' ? 'XP & Badges' : 'Certificates'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-[#5227EB]" />
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 font-mono">
                  {user?.role === 'mentor' ? 'Classroom Analytics Dashboard' : 'MY STUDY PROGRESS'}
                </h3>
              </div>

              {user?.role === 'mentor' ? (
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl text-white">
                  {/* Class Focus Distribution Card */}
                  <div className="p-6 bg-[#0D1225]/70 border border-[#1E293B]/50 rounded-[24px] space-y-4 shadow-sm text-left backdrop-blur-md">
                    <h4 className="text-xs font-black uppercase text-zinc-400">Class Focus Distribution</h4>
                    <p className="text-xs text-zinc-350 leading-relaxed font-semibold">
                      {isNewMentor ? (
                        <>Students have logged a combined total of <b>0.0 focus hours</b> this week. Classroom activity insights will accumulate as students log focus sessions.</>
                      ) : (
                        <>Students in the Vijayawada cluster logged a combined total of <b>340.5 focus hours</b> this week. Peak classroom activity concentrates in the evenings.</>
                      )}
                    </p>
                    <div className="space-y-3 pt-2">
                      {[
                        { label: 'Vijayawada Cluster (VR Siddhartha)', progress: isNewMentor ? 0 : 85, hours: isNewMentor ? '0h' : '180h' },
                        { label: 'Guntur Cluster (RVR Siddhartha)', progress: isNewMentor ? 0 : 62, hours: isNewMentor ? '0h' : '110h' },
                        { label: 'Visakhapatnam Cluster (AU Campus)', progress: isNewMentor ? 0 : 40, hours: isNewMentor ? '0h' : '50.5h' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-extrabold text-zinc-300">
                            <span>{item.label}</span>
                            <span>{item.hours}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-[#5227EB] rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Alert Feed Card */}
                  <div className="p-6 bg-[#0D1225]/70 border border-[#1E293B]/50 rounded-[24px] space-y-4 shadow-sm text-left backdrop-blur-md">
                    <h4 className="text-xs font-black uppercase text-zinc-400">Activity Alert Feed</h4>
                    <p className="text-xs text-zinc-355 leading-relaxed font-semibold">
                      {isNewMentor ? (
                        <>Top performing topics and student completion velocity will display here once active group sessions commence.</>
                      ) : (
                        <>Overall batch focus velocity metrics report positive acceleration. AI recommender flags low active hours in OS room.</>
                      )}
                    </p>
                    {isNewMentor ? (
                      <div className="p-4 bg-[#161B33] border border-white/5 rounded-2xl text-[10px] text-zinc-400 font-bold space-y-2">
                        <p>No performance logs recorded yet. Top performers and low engagement alerts will populate as students study.</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-indigo-950/40 border border-indigo-900/40 rounded-2xl text-[10px] text-indigo-400 font-bold space-y-2">
                        <p>🚀 Top Performer: DBMS (91% Engagement)</p>
                        <p>⚠️ Alert: Operating Systems (65% Engagement - scheduled revision suggested)</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : progressSubView === null ? (
                /* Student Progress Directory Cards */
                <div className="grid md:grid-cols-3 gap-6 pt-4 text-white">
                  {/* Card 1: Analytics */}
                  <div 
                    onClick={() => setProgressSubView('analytics')}
                    className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                  >
                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                        📊
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">Analytics</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">Monitor study durations, daily consistency streaks, and subject activity meters.</p>
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-4 block">View Analytics &rarr;</span>
                  </div>

                  {/* Card 2: XP & Badges */}
                  <div 
                    onClick={() => setProgressSubView('xp')}
                    className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                  >
                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                        🏅
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">XP & Badges</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">Claim achievement badges, review levels progression, and view accumulated XP points.</p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 block">View Achievements &rarr;</span>
                  </div>

                  {/* Card 3: Certificates */}
                  <div 
                    onClick={() => setProgressSubView('certificates')}
                    className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                  >
                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                        🎓
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">Certificates</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">Unlock and print certificates validating your successful mock tests and checkpoints.</p>
                    </div>
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-4 block">View Certificates &rarr;</span>
                  </div>
                </div>
              ) : progressSubView === 'xp' ? (
                /* XP & Badges sub-view */
                <div className="grid md:grid-cols-2 gap-6 pt-2 text-left">
                  <div className="p-6 bg-[#0B0F19]/60 border border-white/5 rounded-[24px] shadow-lg space-y-4">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">🏅 Unlocked Badges</h3>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3">
                        <span className="text-xl">🔥</span>
                        <div>
                          <span className="text-[10px] font-black text-white block">Streak Master</span>
                          <span className="text-[8px] text-slate-500 font-bold block">Studied 7 days in a row</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3">
                        <span className="text-xl">🎯</span>
                        <div>
                          <span className="text-[10px] font-black text-white block">Perfect Score</span>
                          <span className="text-[8px] text-slate-500 font-bold block">100% on Mock Test 1</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#0B0F19]/60 border border-white/5 rounded-[24px] shadow-lg space-y-4">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">📈 XP Growth Milestone</h3>
                    <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Level {stats.level || 1}</span>
                        <span>{stats.xp || 0} XP Total</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }} />
                      </div>
                      <p className="text-[9px] text-slate-550 font-bold">Earn another 120 XP to advance to Level {(stats.level || 1) + 1}.</p>
                    </div>
                  </div>
                </div>
              ) : progressSubView === 'certificates' ? (
                /* Certificates sub-view */
                <div className="grid md:grid-cols-2 gap-6 pt-2 text-left">
                  <div className="p-6 bg-[#0B0F19]/60 border border-white/5 rounded-[24px] shadow-lg space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded">Verified</span>
                    <h3 className="text-sm font-black text-white">Advanced DSA & Complexity Mastery</h3>
                    <p className="text-xs text-slate-450 font-semibold leading-relaxed">Issued upon scoring above 80% on mock recursion, graph traversal, and complexity analysis tests.</p>
                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 font-bold mt-4 border-t border-white/5">
                      <span>Completed 3 days ago</span>
                      <button className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-[#5227EB] hover:text-white rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer">Download PDF</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl text-white">
                  {/* Grid 1: Basic Stats (Exactly matching screenshot layout, colors, and content) */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-[#0B1528]/40 border border-[#1e293b]/50 rounded-[24px] space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#1e293b]/80 transition-all duration-300 min-h-[200px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shadow-inner">
                            <Flame className="h-5 w-5 fill-orange-500/10" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-[13px] font-extrabold text-zinc-100">Study Consistency</h4>
                            <p className="text-[10px] text-zinc-400">Current day streak logs</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-4xl font-extrabold text-[#E07A10] tracking-tight text-left mt-2">0 Days</div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-semibold text-left">
                        You have studied for 0 consecutive days! Keep joining live rooms to maintain your consistency streak and earn placement badges.
                      </p>
                      <Calendar className="h-16 w-16 text-white/5 absolute right-6 bottom-6 select-none stroke-[1] pointer-events-none" />
                    </div>

                    <div className="p-6 bg-[#0B1528]/40 border border-[#1e293b]/50 rounded-[24px] space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#1e293b]/80 transition-all duration-300 min-h-[200px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h4 className="text-[13px] font-extrabold text-zinc-100">Accumulated Focus</h4>
                            <p className="text-[10px] text-zinc-400">Total hours spent desking</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-4xl font-extrabold text-[#00D49E] tracking-tight text-left mt-2">0.00 Hrs</div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-semibold text-left">
                        You spent a total of 0.00 hours desking on note boards and study circles. Check your dashboard leaderboards for batch rankings.
                      </p>
                      <Clock className="h-16 w-16 text-white/5 absolute right-6 bottom-6 select-none stroke-[1] pointer-events-none" />
                    </div>
                  </div>

                  {/* Grid 2: Onboarding Progress (Zero-State exactly matching screenshot layout) */}
                  <div className="p-8 bg-[#0B1528]/30 border border-[#1e293b]/40 rounded-[28px] shadow-2xl text-center space-y-6 max-w-4xl relative overflow-hidden">
                    <div className="h-14 w-14 bg-[#5227EB]/10 border border-[#5227EB]/20 text-[#5227EB] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-indigo-950/20">
                      <TrendingUp className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-base font-extrabold text-white tracking-wide">Your Study Progress Tracker is Ready!</h4>
                      <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed font-semibold">
                        Since you are a new user, you don't have any study hours logged yet. Start a focus session from your learning space stopwatch or join a live room to begin charting your progress.
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 text-left pt-2 max-w-3xl mx-auto">
                      <div className="p-4 bg-[#0A0D1A]/80 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-indigo-500/20 transition-colors duration-300">
                        <div className="h-12 w-12 rounded-xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-[#5227EB] shrink-0">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center mb-0.5">
                            <span className="h-4.5 w-4.5 rounded-full bg-[#5227EB]/25 border border-[#5227EB]/40 flex items-center justify-center text-[9px] font-black text-indigo-400 mr-1.5 shrink-0">1</span>
                            <span className="text-[10px] font-black text-indigo-400 block uppercase tracking-wider">JOIN CIRCLES</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 leading-snug font-semibold block">Find study cohorts or enter invite codes to collaborate.</span>
                        </div>
                      </div>

                      <div className="p-4 bg-[#0A0D1A]/80 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-emerald-500/20 transition-colors duration-300">
                        <div className="h-12 w-12 rounded-xl bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center mb-0.5">
                            <span className="h-4.5 w-4.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-[9px] font-black text-emerald-400 mr-1.5 shrink-0">2</span>
                            <span className="text-[10px] font-black text-emerald-400 block uppercase tracking-wider">FOCUS TIMER</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 leading-snug font-semibold block">Log custom study sessions with the Learning Space stopwatch timer.</span>
                        </div>
                      </div>

                      <div className="p-4 bg-[#0A0D1A]/80 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-amber-500/20 transition-colors duration-300">
                        <div className="h-12 w-12 rounded-xl bg-amber-950/50 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center mb-0.5">
                            <span className="h-4.5 w-4.5 rounded-full bg-amber-500/25 border border-amber-500/40 flex items-center justify-center text-[9px] font-black text-amber-400 mr-1.5 shrink-0">3</span>
                            <span className="text-[10px] font-black text-amber-400 block uppercase tracking-wider">RANK UP</span>
                          </div>
                          <span className="text-[9px] text-zinc-500 leading-snug font-semibold block">Level up and rank on placement leaderboards.</span>
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              )}
            </div>
          )}

          {/* Consolidated Tab: Community Directory */}
          {activeTab === 'community' && communitySubView === null && (
            <div className="space-y-6 text-left text-white animate-in fade-in duration-300">
              <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" /> Community Portal
                </h1>
                <p className="text-xs text-slate-400 mt-1">Engage, collaborate, and compete with other learners across your department.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 pt-4">
                
                {/* Card 1: Discussion Forum */}
                <div 
                  onClick={() => setCommunitySubView('forum')}
                  className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                      💬
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">Discussion Forum</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">Post doubts, answer academic questions, and discuss coding concepts with fellow students.</p>
                  </div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-4 block">Open Forum &rarr;</span>
                </div>

                {/* Card 2: Leaderboard */}
                <div 
                  onClick={() => setCommunitySubView('leaderboard')}
                  className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                      🏆
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">Leaderboard</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">Compete on the global student XP leaderboard, track rankings, and compare progress.</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 block">Open Leaderboard &rarr;</span>
                </div>

                {/* Card 3: Lounge Chat */}
                <div 
                  onClick={() => setCommunitySubView('chat')}
                  className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                      📣
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">Lounge Chat</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">Engage in real-time instant messaging, form study groups, and hang out in the student lounge.</p>
                  </div>
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-4 block">Enter Chat Lounge &rarr;</span>
                </div>

              </div>
            </div>
          )}

          {/* Tab 8: Discussions Info */}
          {(activeTab === 'discussions' || (activeTab === 'community' && communitySubView === 'forum')) && (
            <div className="space-y-6 text-left animate-in fade-in duration-350">
              {activeTab === 'community' && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setCommunitySubView(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                  >
                    &larr; Back to Community
                  </button>
                  <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Community &gt; Discussion Forum</span>
                </div>
              )}
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-[#10B981]" /> Workspace Discussions
              </h3>
              <div className="p-8 bg-[#0B0F19] border border-white/5 rounded-[24px] text-center space-y-4 shadow-lg max-w-2xl text-white">
                <div className="h-14 w-14 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto shadow-sm">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-white">Interactive Message Boards</h4>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto font-medium">
                  Post doubts, share coding tips, and discuss interview questions with peers in real-time. Discussions are managed inside study circle channels.
                </p>
                <button 
                  onClick={() => {
                    setActiveTab('study');
                    setStudySubView('workspaces');
                  }} 
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#0d9488] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Browse Group Channels
                </button>
              </div>
            </div>
          )}

          {/* Tab 9: Leaderboard info */}
          {(activeTab === 'leaderboard' || (activeTab === 'community' && communitySubView === 'leaderboard')) && (
            <div className="space-y-6 text-left animate-in fade-in duration-350">
              {activeTab === 'community' && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setCommunitySubView(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                  >
                    &larr; Back to Community
                  </button>
                  <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Community &gt; Leaderboard</span>
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-[#10B981]" /> Batch Leaderboard
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Track focus hours, top mentors, helpful notes, and active study rooms across the campus.</p>
                </div>
                
                {/* Global stats summary */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-1">
                    🏆 Your Level: {stats.level}
                  </span>
                </div>
              </div>

              {/* Sub-tabs Selection */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'learners', label: '🎓 Top Learners', desc: 'Sort by Study Hours' },
                  { id: 'mentors', label: '🎖️ Top Mentors', desc: 'Sort by XP & Answers' },
                  { id: 'notes', label: '📄 Helpful Notes', desc: 'Sort by Shared Notes' },
                  { id: 'rooms', label: '🏫 Active Circles', desc: 'Sort by Member Count' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setLeaderboardSubTab(sub.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all text-left flex flex-col justify-center cursor-pointer ${
                      leaderboardSubTab === sub.id
                        ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 shadow-md shadow-[#10B981]/5'
                        : 'bg-[#0B0F19] border border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <span>{sub.label}</span>
                    <span className="text-[8px] opacity-70 mt-0.5 font-normal">{sub.desc}</span>
                  </button>
                ))}
              </div>

              {/* Leaderboard content */}
              {leaderboardLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">Compiling global rankings...</p>
                </div>
              ) : !leaderboardData ? (
                <div className="p-8 bg-[#0B0F19] border border-white/5 rounded-[24px] text-center space-y-3 shadow-lg">
                  <p className="text-xs text-slate-450 font-bold">No ranking records compiled yet.</p>
                  <button onClick={fetchGlobalLeaderboards} className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
                    Retry Fetching
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-[#0B0F19] border border-white/5 rounded-[24px] shadow-lg text-white space-y-4">
                  {leaderboardSubTab === 'learners' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-500 tracking-wider px-4">
                        <div className="flex items-center gap-6">
                          <span className="w-6 text-center">Rank</span>
                          <span>Learner Details</span>
                        </div>
                        <span>Study Hours</span>
                      </div>
                      
                      <div className="space-y-2">
                        {(!leaderboardData.learners || leaderboardData.learners.length === 0) ? (
                          <p className="text-xs text-zinc-500 py-6 text-center font-medium">No students ranked yet.</p>
                        ) : (
                          leaderboardData.learners.map((student: any, idx: number) => {
                            const isMe = student.username === user?.username;
                            const isGolden = checkUserGoldenFrame(student);
                            return (
                              <div
                                key={student.id}
                                onClick={() => router.push(`/profile/${student.username}`)}
                                title="Click to view profile"
                                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-lg ${
                                  isMe 
                                    ? 'bg-[#10B981]/10 border-[#10B981]/45 hover:border-[#10B981]/60' 
                                    : 'bg-slate-955/20 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/40'
                                }`}
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <span className={`w-6 text-center text-xs font-black font-mono ${
                                    idx === 0 ? 'text-amber-400 text-sm' :
                                    idx === 1 ? 'text-slate-300 text-sm' :
                                    idx === 2 ? 'text-amber-600 text-sm' : 'text-slate-500'
                                  }`}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                  </span>
                                  
                                  <div className={`h-9.5 w-9.5 rounded-full shrink-0 relative overflow-hidden transition-all ${
                                    isGolden 
                                      ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_6px_rgba(245,158,11,0.6)] border-amber-400' 
                                      : 'border border-white/10'
                                  }`}>
                                    <img 
                                      src={student.avatarUrl || getAvatarByName(student.fullName, student.gender)} 
                                      className="absolute inset-0 h-full w-full object-cover" 
                                      alt="Avatar" 
                                    />
                                  </div>
                                  
                                  <div className="text-left min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className={`text-xs font-black truncate max-w-[150px] ${isMe ? 'text-[#10B981]' : 'text-slate-100'}`}>
                                        {student.fullName}
                                      </h4>
                                      <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[8px] font-black uppercase">
                                        Lvl {student.level || 1}
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-slate-550 font-bold mt-0.5">@{student.username}</p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <span className="text-xs font-black text-slate-200">
                                    {(student.totalStudyHours || 0).toFixed(2)}h
                                  </span>
                                  <span className="text-[8px] text-slate-500 block font-bold mt-0.5">
                                    🔥 {student.streakCount || 0}d streak
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {leaderboardSubTab === 'mentors' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-500 tracking-wider px-4">
                        <div className="flex items-center gap-6">
                          <span className="w-6 text-center">Rank</span>
                          <span>Mentor Details</span>
                        </div>
                        <span>XP Score</span>
                      </div>
                      
                      <div className="space-y-2">
                        {(!leaderboardData.mentors || leaderboardData.mentors.length === 0) ? (
                          <p className="text-xs text-zinc-500 py-6 text-center font-medium">No mentors ranked yet.</p>
                        ) : (
                          leaderboardData.mentors.map((mentor: any, idx: number) => {
                            const isMe = mentor.username === user?.username;
                            const isGolden = checkUserGoldenFrame(mentor);
                            return (
                              <div
                                key={mentor.id}
                                onClick={() => router.push(`/profile/${mentor.username}`)}
                                title="Click to view profile & rate mentor"
                                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-lg ${
                                  isMe 
                                    ? 'bg-[#10B981]/10 border-[#10B981]/45 hover:border-[#10B981]/60' 
                                    : 'bg-slate-955/20 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/40'
                                }`}
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <span className={`w-6 text-center text-xs font-black font-mono ${
                                    idx === 0 ? 'text-amber-400 text-sm' :
                                    idx === 1 ? 'text-slate-300 text-sm' :
                                    idx === 2 ? 'text-amber-600 text-sm' : 'text-slate-500'
                                  }`}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                  </span>
                                  
                                  <div className={`h-9.5 w-9.5 rounded-full shrink-0 relative overflow-hidden transition-all ${
                                    isGolden 
                                      ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 shadow-[0_0_6px_rgba(245,158,11,0.6)] border-amber-400' 
                                      : 'border border-white/10'
                                  }`}>
                                    <img 
                                      src={mentor.avatarUrl || getAvatarByName(mentor.fullName, mentor.gender)} 
                                      className="absolute inset-0 h-full w-full object-cover" 
                                      alt="Avatar" 
                                    />
                                  </div>
                                  
                                  <div className="text-left min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className={`text-xs font-black truncate max-w-[150px] ${isMe ? 'text-[#10B981]' : 'text-slate-100'}`}>
                                        {mentor.fullName}
                                      </h4>
                                      <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[8px] font-black uppercase">
                                        Mentor
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-slate-550 font-bold mt-0.5">@{mentor.username}</p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <span className="text-xs font-black text-slate-200">
                                    {(mentor.xp || 0).toLocaleString()} XP
                                  </span>
                                  <span className="text-[8px] text-slate-550 block font-bold mt-0.5">
                                    🕒 {mentor.totalStudyHours.toFixed(1)}h logged
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {leaderboardSubTab === 'notes' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-500 tracking-wider px-4">
                        <div className="flex items-center gap-6">
                          <span className="w-6 text-center">No.</span>
                          <span>Shared Notes Material</span>
                        </div>
                        <span>Date Shared</span>
                      </div>
                      
                      <div className="space-y-2">
                        {(!leaderboardData.notes || leaderboardData.notes.length === 0) ? (
                          <p className="text-xs text-zinc-500 py-6 text-center font-medium">No files shared yet.</p>
                        ) : (
                          leaderboardData.notes.map((note: any, idx: number) => {
                            return (
                              <div
                                key={note.id}
                                className="flex items-center justify-between p-3.5 rounded-2xl border bg-slate-955/20 border-white/5 hover:border-white/10 transition-all"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <span className="w-6 text-center text-xs font-black text-slate-500 font-mono">
                                    {idx + 1}
                                  </span>
                                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                    <FileText className="h-4.5 w-4.5" />
                                  </div>
                                  <div className="text-left min-w-0">
                                    <h4 className="text-xs font-black truncate max-w-[200px] text-slate-200">
                                      {note.name}
                                    </h4>
                                    <p className="text-[9px] text-indigo-400 font-extrabold uppercase mt-0.5 font-mono">
                                      {note.type.toUpperCase()} • {note.size}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <span className="text-[10px] font-extrabold text-slate-400">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="text-[8px] text-slate-500 block font-bold mt-0.5">
                                    Published by @{note.publishedBy || 'admin'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {leaderboardSubTab === 'rooms' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-500 tracking-wider px-4">
                        <div className="flex items-center gap-6">
                          <span className="w-6 text-center">No.</span>
                          <span>Study Room Description</span>
                        </div>
                        <span>Members</span>
                      </div>
                      
                      <div className="space-y-2">
                        {(!leaderboardData.rooms || leaderboardData.rooms.length === 0) ? (
                          <p className="text-xs text-zinc-500 py-6 text-center font-medium">No study rooms created yet.</p>
                        ) : (
                          leaderboardData.rooms.map((room: any, idx: number) => {
                            return (
                              <div
                                key={room.id}
                                className="flex items-center justify-between p-3.5 rounded-2xl border bg-slate-955/20 border-white/5 hover:border-white/10 transition-all"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <span className="w-6 text-center text-xs font-black text-slate-500 font-mono">
                                    {idx + 1}
                                  </span>
                                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Users className="h-4.5 w-4.5" />
                                  </div>
                                  <div className="text-left min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-xs font-black truncate max-w-[200px] text-slate-200">
                                        {room.name}
                                      </h4>
                                      <span className="px-1.5 py-0.5 bg-[#10B981]/15 text-[#10B981] rounded text-[8px] font-black uppercase">
                                        {room.subject}
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-slate-550 font-bold truncate max-w-[200px] mt-0.5">
                                      {room.description || 'No description provided.'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <span className="text-xs font-black text-[#10B981] flex items-center justify-end gap-1">
                                    👤 {room.memberCount || 0} members
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-500 font-mono block mt-0.5 uppercase">
                                    Code: {room.inviteCode || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 10: Messages / Community Hub */}
          {(activeTab === 'messages' || (activeTab === 'community' && communitySubView === 'chat')) && (
            <div className="space-y-6 text-left animate-in fade-in duration-350 relative min-h-[750px]">
              {activeTab === 'community' && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setCommunitySubView(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                  >
                    &larr; Back to Community
                  </button>
                  <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Community &gt; Lounge Chat</span>
                </div>
              )}
              {/* Header and Floating ask doubt button */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Users className="h-5.5 w-5.5 text-[#10B981]" /> Community Hub
                  </h3>
                  <p className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wide">
                    Academic Collaboration, Q&A doubts, and Study circles
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search messages/doubts..."
                      value={searchMessageQuery}
                      onChange={(e) => setSearchMessageQuery(e.target.value)}
                      className="w-full md:w-60 pl-9 pr-4 py-2 bg-slate-950/45 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-[#10B981]/50 placeholder-zinc-500 font-medium"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setIsPinnedOnly(!isPinnedOnly);
                    }}
                    className={`p-2 rounded-xl border transition-all ${isPinnedOnly ? 'bg-amber-500/10 text-amber-500 border-amber-500/25' : 'bg-slate-950/45 text-zinc-400 border-white/10 hover:text-white'}`}
                    title="Toggle Pinned Posts"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setNewDoubtTitle('');
                      setNewDoubtDescription('');
                      setNewDoubtModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-955 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer border-none uppercase"
                  >
                    <HelpCircle className="h-4 w-4" /> Ask Doubt
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMN 1: LEFT SIDEBAR (Channels & Categories) */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="p-4 bg-[#0B0F19] border border-white/5 rounded-[24px] shadow-lg text-white space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search channels..."
                        value={searchChannelQuery}
                        onChange={(e) => setSearchChannelQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-950/60 border border-white/5 rounded-xl text-[10px] outline-none text-white placeholder-zinc-600 focus:border-[#10B981]/30 font-semibold"
                      />
                    </div>

                    {/* Channels Sections */}
                    <div className="space-y-4">
                      {[
                        {
                          title: '📚 SUBJECT COHORTS',
                          channels: ['#general-lobby', '#dbms-circle', '#operating-systems', '#computer-networks']
                        },
                        {
                          title: '💼 PLACEMENT SQUAD',
                          channels: ['#aptitude', '#interview-prep', '#coding-rounds']
                        },
                        {
                          title: '🚀 PROJECT LOUNGE',
                          channels: ['#project-discussion', '#team-collaboration']
                        }
                      ].map((sec, secIdx) => {
                        const filteredChans = sec.channels.filter(c => 
                          c.toLowerCase().includes(searchChannelQuery.toLowerCase())
                        );
                        if (filteredChans.length === 0) return null;
                        return (
                          <div key={secIdx} className="space-y-1">
                            <span className="text-[9px] font-black tracking-wider text-slate-500 block">
                              {sec.title}
                            </span>
                            <div className="space-y-0.5">
                              {filteredChans.map((chan, idx) => {
                                const isActive = activeChannel === chan;
                                const doubtCount = communityMessages.filter(
                                  m => m.channel === chan && m.type === 'doubt' && m.status === 'unresolved'
                                ).length;

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setActiveChannel(chan);
                                      setSelectedDoubtForThread(null);
                                    }}
                                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors text-xs font-extrabold ${isActive ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20' : 'hover:bg-white/[0.02] text-slate-400 hover:text-white'}`}
                                  >
                                    <span className="flex items-center gap-1.5 font-mono">
                                      <span>#</span>
                                      <span className="truncate max-w-[140px]">{chan.replace('#', '')}</span>
                                    </span>
                                    {doubtCount > 0 && (
                                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black border border-amber-500/25">
                                        {doubtCount}?
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: CENTER FEED (Q&A Feed & Composer) */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Feed Filters */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-white/5">
                    {[
                      { id: 'all', label: 'All Feed' },
                      { id: 'discussions', label: '💬 Chats' },
                      { id: 'doubts', label: '❓ Doubts' },
                      { id: 'announcements', label: '📢 Alerts' },
                      { id: 'resources', label: '📚 Files' },
                      { id: 'polls', label: '🗳️ Polls' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFeedType(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${activeFeedType === tab.id ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25' : 'bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Feed Stream */}
                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
                    {(() => {
                      const filteredMessages = communityMessages.filter((msg) => {
                        if (msg.channel !== activeChannel) return false;
                        if (isPinnedOnly && !msg.isPinned) return false;
                        if (activeFeedType !== 'all') {
                          const mappedType = activeFeedType === 'discussions' ? 'discussion' 
                                           : activeFeedType === 'doubts' ? 'doubt'
                                           : activeFeedType === 'announcements' ? 'announcement'
                                           : activeFeedType === 'resources' ? 'resource'
                                           : activeFeedType === 'polls' ? 'poll' : '';
                          if (msg.type !== mappedType) return false;
                        }
                        if (searchMessageQuery.trim() !== '') {
                          const query = searchMessageQuery.toLowerCase();
                          const titleMatch = msg.title?.toLowerCase().includes(query) || false;
                          const descMatch = msg.description?.toLowerCase().includes(query) || false;
                          const userMatch = msg.user?.toLowerCase().includes(query) || false;
                          return titleMatch || descMatch || userMatch;
                        }
                        return true;
                      });

                      if (filteredMessages.length === 0) {
                        return (
                          <div className="p-12 text-center bg-[#0B0F19] border border-white/5 rounded-[24px] text-zinc-500 font-extrabold text-xs">
                            No active posts in {activeChannel} matching the filters.
                          </div>
                        );
                      }

                      return filteredMessages.map((msg) => {
                        const hasVoted = msg.votedOption !== null;
                        return (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-[24px] border transition-all text-white space-y-3 shadow-md ${msg.type === 'doubt' ? 'border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/35' : msg.type === 'announcement' ? 'border-indigo-500/20 bg-indigo-500/[0.02] hover:border-indigo-500/35' : 'border-white/5 bg-[#0B0F19] hover:border-white/10'}`}
                          >
                            
                            {/* Card Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                                  <img src={msg.avatar || '/charan-avatar.png'} className="h-full w-full object-cover" alt={msg.user} />
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-white">{msg.user}</span>
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${msg.role === 'mentor' ? 'bg-[#5227EB]/10 text-indigo-400 border border-[#5227EB]/20' : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20'}`}>
                                      {msg.role}
                                    </span>
                                  </div>
                                  <span className="text-[8px] text-zinc-500 font-mono font-bold">{msg.time}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {msg.isPinned && (
                                  <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/25 rounded text-[8px] font-black uppercase tracking-wide">
                                    Pinned
                                  </span>
                                )}
                                {msg.type === 'doubt' && (
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${msg.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    {msg.status === 'resolved' ? '✓ Resolved' : '❓ Unresolved'}
                                  </span>
                                )}
                                {msg.type === 'announcement' && msg.priority === 'high' && (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-rose-500/10 text-rose-455 border border-rose-500/20 animate-pulse">
                                    Priority Alert
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="space-y-1.5 text-left">
                              {msg.title && (
                                <h4 className="text-xs font-black text-white leading-snug">
                                  {msg.title}
                                </h4>
                              )}
                              <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                                {msg.description}
                              </p>
                            </div>

                            {/* Custom Visual Elements Based on Type */}
                            {msg.type === 'resource' && (
                              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between text-xs gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 font-black">
                                    PDF
                                  </div>
                                  <div className="text-left">
                                    <p className="font-extrabold text-white text-[11px] truncate max-w-[200px]">{msg.resourceName}</p>
                                    <p className="text-[9px] text-zinc-500 font-mono font-bold">{msg.resourceSize} • {msg.downloads} downloads</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Downloading file: ${msg.resourceName}...`, 'success');
                                    setCommunityMessages(prev => prev.map(m => m.id === msg.id ? { ...m, downloads: m.downloads + 1 } : m));
                                  }}
                                  className="p-2 bg-white/5 hover:bg-[#10B981]/20 hover:text-[#10B981] hover:border-[#10B981]/30 border border-white/10 rounded-xl transition-all cursor-pointer animate-none"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            {msg.type === 'poll' && (
                              <div className="space-y-2">
                                {msg.pollOptions.map((opt: any, optIdx: number) => {
                                  const pct = msg.totalVotes > 0 ? Math.round((opt.votes / msg.totalVotes) * 100) : 0;
                                  const isUserChoice = msg.votedOption === optIdx;
                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      disabled={hasVoted}
                                      onClick={() => handleVotePoll(msg.id, optIdx)}
                                      className={`w-full text-left p-2.5 rounded-xl border relative overflow-hidden transition-all text-xs font-extrabold flex justify-between items-center ${hasVoted ? 'cursor-default border-white/5 bg-slate-950/15' : 'hover:bg-white/[0.02] border-white/10 bg-slate-950/30'}`}
                                    >
                                      {/* Progress Bar Background */}
                                      <div
                                        className={`absolute inset-y-0 left-0 transition-all duration-550 ${isUserChoice ? 'bg-[#10B981]/15' : 'bg-white/5'}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                      <span className="relative z-10 flex items-center gap-2 truncate max-w-[280px]">
                                        {isUserChoice && <span className="text-[#10B981] font-bold">✓</span>}
                                        {opt.label}
                                      </span>
                                      <span className="relative z-10 text-[10px] text-zinc-400 font-mono font-bold">
                                        {opt.votes} votes ({pct}%)
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Card Footer Actions */}
                            <div className="flex items-center gap-4 pt-1 border-t border-white/5">
                              <button
                                type="button"
                                onClick={() => handleUpvoteMessage(msg.id)}
                                className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-colors ${msg.upvotedBy?.includes(user?.fullName || '') ? 'text-[#10B981]' : 'text-zinc-500 hover:text-white'}`}
                              >
                                ▲ Upvote ({msg.upvotes})
                              </button>

                              {msg.type === 'doubt' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedDoubtForThread(msg)}
                                  className="flex items-center gap-1 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-wider transition-colors"
                                >
                                  💬 Answers ({msg.answers?.length || 0})
                                </button>
                              )}

                              {msg.type === 'discussion' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDoubtForThread(msg);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-wider transition-colors"
                                >
                                  💬 Replies ({msg.answers?.length || 0})
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Message Composer Area */}
                  <div className="p-4 bg-[#0B0F19] border border-white/5 rounded-[24px] shadow-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        Composer Mode
                      </span>
                      <div className="flex gap-1.5">
                        {[
                          { id: 'chat', label: 'Chat' },
                          { id: 'doubt', label: 'Academic Doubt' },
                          { id: 'poll', label: 'Create Poll' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setComposerPostType(t.id as any)}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all ${composerPostType === t.id ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handlePostMessage} className="space-y-3">
                      {composerPostType === 'chat' && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`Message in ${activeChannel}... (Use ? prefix for doubts, /poll ; opt1 ; opt2 for polls)`}
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs outline-none text-white placeholder-zinc-600 focus:bg-slate-900/60 focus:border-[#10B981]/40 font-medium"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#10B981] hover:bg-[#0d9488] text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors cursor-pointer border-none"
                          >
                            Send
                          </button>
                        </div>
                      )}

                      {composerPostType === 'doubt' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Doubt Topic (e.g. Normalization problem)"
                            value={newDoubtTitle}
                            onChange={(e) => setNewDoubtTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs outline-none text-white placeholder-zinc-600 focus:border-amber-500/40 font-semibold"
                          />
                          <textarea
                            placeholder="Detail description of your doubt. Be specific so cohorts or mentors can answer..."
                            value={newDoubtDescription}
                            onChange={(e) => setNewDoubtDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-955 border border-white/10 rounded-xl text-xs outline-none text-white placeholder-zinc-600 focus:border-amber-500/40 font-medium resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!newDoubtTitle.trim() || !newDoubtDescription.trim()) {
                                  showToast('Please fill out the doubt title and description.', 'error');
                                  return;
                                }
                                const mockEvent = { preventDefault: () => {} } as any;
                                handleAskDoubt(mockEvent);
                              }}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider transition-colors cursor-pointer border-none"
                            >
                              Post Doubt (+10 XP)
                            </button>
                          </div>
                        </div>
                      )}

                      {composerPostType === 'poll' && (
                        <div className="space-y-2 text-xs">
                          <input
                            type="text"
                            placeholder="Poll question (e.g. Do you prefer SQL or NoSQL?)"
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-955 border border-white/10 rounded-xl text-xs outline-none text-white placeholder-zinc-600 focus:border-[#10B981]/40 font-semibold"
                          />
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider text-left">
                            ℹ️ Form: Prefix option strings with `/poll Question; option1; option2` in chat, or submit chat above.
                          </p>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* COLUMN 3: RIGHT PANEL (AI tools, voice rooms, leaderboard) */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* Daily Insights */}
                  <div className="p-4 bg-[#0B0F19] border border-white/5 rounded-[24px] shadow-lg text-white space-y-3">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block text-left">
                      📊 Daily Cohort Insights
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <p className="text-sm font-black text-[#10B981]">{dailyMetrics.studentsActive}</p>
                        <p className="text-[8px] text-zinc-500 uppercase font-black">Active</p>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <p className="text-sm font-black text-amber-505">{dailyMetrics.doubtsResolved}</p>
                        <p className="text-[8px] text-zinc-500 uppercase font-black">Solved</p>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <p className="text-sm font-black text-indigo-400">{dailyMetrics.resourcesShared}</p>
                        <p className="text-[8px] text-zinc-500 uppercase font-black">Files Shared</p>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <p className="text-sm font-black text-rose-455">{dailyMetrics.liveStudySessions}</p>
                        <p className="text-[8px] text-zinc-500 uppercase font-black">Live Lounges</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant summary tool */}
                  <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/25 rounded-[24px] shadow-lg text-white space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                      <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">
                        AI Hub Assistant
                      </span>
                    </div>

                    <div className="text-left space-y-2.5">
                      <p className="text-[10px] text-zinc-300 leading-relaxed font-semibold italic">
                        "{aiChannelSummaries[activeChannel] || 'Active learning and networking lobby.'}"
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase">
                        <button
                          type="button"
                          onClick={() => {
                            setAiLoading(true);
                            setActiveAiTool('flashcard');
                            setCurrentFlashcardIdx(0);
                            setIsCardFlipped(false);
                            setTimeout(() => setAiLoading(false), 800);
                          }}
                          className="py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg cursor-pointer transition-all uppercase font-bold"
                        >
                          📚 Flashcards
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAiLoading(true);
                            setActiveAiTool('quiz');
                            setAiQuizAnswers({});
                            setAiQuizSubmitted(false);
                            setTimeout(() => setAiLoading(false), 800);
                          }}
                          className="py-2 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/20 rounded-lg cursor-pointer transition-all uppercase font-bold"
                        >
                          ⚡ Practice Quiz
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Voice Study Desks */}
                  <div className="p-4 bg-[#0B0F19] border border-white/5 rounded-[24px] shadow-lg text-white space-y-3">
                    <span className="text-[9px] font-black uppercase text-zinc-405 tracking-wider block text-left">
                      🎙️ Live Voice Desks
                    </span>
                    <div className="space-y-2">
                      {voiceDesks.map((desk) => {
                        const isJoined = joinedVoiceId === desk.id;
                        return (
                          <div
                            key={desk.id}
                            className={`p-3 bg-slate-950/40 rounded-xl border flex items-center justify-between text-xs transition-all ${isJoined ? 'border-[#10B981]/30 bg-[#10B981]/5' : 'border-white/5'}`}
                          >
                            <div className="text-left flex items-center gap-2">
                              <div>
                                <p className="font-extrabold text-white text-[11px]">{desk.name}</p>
                                <p className="text-[9px] text-zinc-500 font-mono font-bold">
                                  {desk.activeCount} joined
                                </p>
                              </div>
                              {isJoined && (
                                <div className="flex items-center gap-0.5 px-1 animate-pulse">
                                  <span className="w-0.5 h-3 bg-[#10B981] rounded animate-bounce" />
                                  <span className="w-0.5 h-4 bg-[#10B981] rounded animate-bounce" />
                                  <span className="w-0.5 h-2 bg-[#10B981] rounded animate-bounce" />
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleVoiceChannel(desk.id)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border cursor-pointer ${isJoined ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20' : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 hover:bg-[#10B981]/20'}`}
                            >
                              {isJoined ? 'Disconnect' : 'Join'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Leaderboard Top Contributors */}
                  <div className="p-4 bg-[#0B0F19] border border-white/5 rounded-[24px] shadow-lg text-white space-y-3">
                    <span className="text-[9px] font-black uppercase text-zinc-405 tracking-wider block text-left">
                      🏆 Weekly Contributors
                    </span>
                    <div className="space-y-2 text-xs">
                      {topContributors.map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-950/30 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                              <img src={c.avatar} className="h-full w-full object-cover" alt={c.name} />
                            </div>
                            <div className="text-left">
                              <p className="font-extrabold text-white text-[10px]">{c.name}</p>
                              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                                {c.doubtsSolved} doubts solved
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-black text-amber-500">
                            +{c.xp} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming sessions */}
                  <div className="p-4 bg-[#0B0F19] border border-white/5 rounded-[24px] shadow-lg text-white space-y-3">
                    <span className="text-[9px] font-black uppercase text-zinc-405 tracking-wider block text-left">
                      📅 Upcoming Live Sessions
                    </span>
                    <div className="space-y-2">
                      {upcomingCommunitySessions.map((s, idx) => (
                        <div key={idx} className="p-3 bg-slate-955/40 rounded-xl border border-white/5 text-left text-xs space-y-2">
                          <div>
                            <p className="font-extrabold text-white text-[11px] leading-snug">{s.title}</p>
                            <p className="text-[9px] text-[#10B981] font-mono font-bold">{s.time}</p>
                            <p className="text-[8px] text-zinc-500 font-semibold mt-0.5">By {s.mentor}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => showToast('Session reminder set. You will be notified when live.', 'info')}
                            className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border border-white/5"
                          >
                            Set Reminder
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* OVERLAYS / DRAWERS / MODALS */}

              {/* Thread detail sliding drawer overlay */}
              {selectedDoubtForThread && (
                <>
                  <div
                    className="fixed inset-0 bg-black/60 z-40 transition-opacity"
                    onClick={() => setSelectedDoubtForThread(null)}
                  />
                  <div className="fixed inset-y-0 right-0 w-full md:w-[460px] bg-[#090D1A] border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col animate-in slide-in-from-right duration-350 text-white">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
                      <div className="text-left">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-500">
                          {selectedDoubtForThread.type === 'doubt' ? 'Doubt Thread Detail' : 'Discussion Thread'}
                        </span>
                        <h4 className="text-sm font-black text-white truncate max-w-[320px]">
                          {selectedDoubtForThread.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDoubtForThread(null)}
                        className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer font-bold border-none"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin text-left">
                      {/* Main original doubt card */}
                      <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full overflow-hidden bg-slate-800 border border-white/10">
                            <img src={selectedDoubtForThread.avatar} className="h-full w-full object-cover" alt="avatar" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white">{selectedDoubtForThread.user}</p>
                            <p className="text-[8px] text-zinc-500 font-mono">{selectedDoubtForThread.time}</p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-300 font-semibold leading-relaxed">
                          {selectedDoubtForThread.description}
                        </p>
                      </div>

                      {/* Answers Section */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block">
                          Replies ({selectedDoubtForThread.answers?.length || 0})
                        </span>
                        
                        {(selectedDoubtForThread.answers || []).length === 0 ? (
                          <div className="p-6 text-center text-zinc-500 font-bold text-[11px] bg-slate-950/20 rounded-xl border border-white/5">
                            No answers yet. Be the first to help out!
                          </div>
                        ) : (
                          (selectedDoubtForThread.answers || []).map((ans: any) => (
                            <div
                              key={ans.id}
                              className={`p-3.5 rounded-xl border text-xs space-y-2 relative transition-all ${ans.isAccepted ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : 'border-white/5 bg-slate-950/25'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-6.5 w-6.5 rounded-full overflow-hidden bg-slate-800 border border-white/10">
                                    <img src={ans.avatar} className="h-full w-full object-cover" alt="avatar" />
                                  </div>
                                  <div>
                                    <span className="font-extrabold text-[11px] text-white flex items-center gap-1.5">
                                      {ans.user}
                                      <span className={`text-[7px] font-black uppercase px-1 py-0.25 rounded ${ans.role === 'mentor' ? 'bg-[#5227EB]/10 text-indigo-400 border border-[#5227EB]/20' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {ans.role}
                                      </span>
                                    </span>
                                    <span className="text-[8px] text-zinc-500 font-mono block mt-0.5">{ans.time}</span>
                                  </div>
                                </div>
                                {ans.isAccepted && (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[7px] font-black uppercase tracking-wider">
                                    ✓ Accepted Solution
                                  </span>
                                )}
                              </div>

                              <p className="text-zinc-300 font-semibold text-[11px] leading-relaxed text-left">
                                {ans.text}
                              </p>

                              <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                                <button
                                  type="button"
                                  onClick={() => handleUpvoteAnswer(selectedDoubtForThread.id, ans.id)}
                                  className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-wider flex items-center gap-1"
                                >
                                  ▲ Upvote ({ans.upvotes || 0})
                                </button>
                                
                                {selectedDoubtForThread.type === 'doubt' && !ans.isAccepted && (user?.role === 'mentor' || selectedDoubtForThread.user === user?.fullName) && (
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptSolution(selectedDoubtForThread.id, ans.id)}
                                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border-none font-bold"
                                  >
                                    Accept Solution (+20 XP)
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Compose Answer Form */}
                    <form onSubmit={handlePostReply} className="pt-4 border-t border-white/5 shrink-0 space-y-2">
                      <textarea
                        placeholder="Write a helpful answer or reply..."
                        value={replyMessageText}
                        onChange={(e) => setReplyMessageText(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-955 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-[#10B981]/40 font-medium resize-none placeholder-zinc-600"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#10B981] hover:bg-[#0d9488] text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors cursor-pointer border-none"
                        >
                          Submit Reply (+5 XP)
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}

              {/* AI Tools Modals (Flashcard / Quiz) */}
              {activeAiTool && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0B0F19] border border-white/10 rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col p-6 animate-in zoom-in-95 duration-200 text-white relative">
                    
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                      <div className="flex items-center gap-1.5 text-left">
                        <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                        <h4 className="text-xs font-black uppercase text-white tracking-wider">
                          {activeAiTool === 'flashcard' ? 'AI Generated Revision Flashcards' : 'AI Academic Practice Quiz'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveAiTool(null)}
                        className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all font-bold cursor-pointer border-none"
                      >
                        ✕
                      </button>
                    </div>

                    {aiLoading ? (
                      <div className="py-16 flex flex-col items-center justify-center space-y-3">
                        <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                        <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest animate-pulse">
                          Generating Custom Content...
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 py-4 text-left">
                        {activeAiTool === 'flashcard' && (
                          <div className="space-y-6">
                            <p className="text-[10px] text-zinc-400 text-center font-extrabold uppercase tracking-wide">
                              Flashcard {currentFlashcardIdx + 1} of {aiFlashcards.length} • Click Card to Flip
                            </p>

                            {/* Flipped Card Component */}
                            <div
                              onClick={() => setIsCardFlipped(!isCardFlipped)}
                              className="h-48 w-full bg-slate-900/60 border border-indigo-500/20 rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-slate-900/80 active:scale-[0.99] select-none"
                            >
                              {!isCardFlipped ? (
                                <div className="space-y-2">
                                  <span className="text-[8px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-black uppercase tracking-wider animate-none">
                                    Concept / Term
                                  </span>
                                  <h3 className="text-sm font-black text-white leading-relaxed">
                                    {aiFlashcards[currentFlashcardIdx]?.front}
                                  </h3>
                                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider pt-2">
                                    Click card to show definition
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                  <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-black uppercase tracking-wider animate-none">
                                    Explanation
                                  </span>
                                  <p className="text-xs font-semibold text-zinc-300 leading-relaxed">
                                    {aiFlashcards[currentFlashcardIdx]?.back}
                                  </p>
                                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider pt-2">
                                    Click card to show term
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Carousel controls */}
                            <div className="flex justify-between items-center">
                              <button
                                type="button"
                                disabled={currentFlashcardIdx === 0}
                                onClick={() => {
                                  setCurrentFlashcardIdx(currentFlashcardIdx - 1);
                                  setIsCardFlipped(false);
                                }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                              >
                                ◀ Previous
                              </button>
                              <button
                                type="button"
                                disabled={currentFlashcardIdx === aiFlashcards.length - 1}
                                onClick={() => {
                                  setCurrentFlashcardIdx(currentFlashcardIdx + 1);
                                  setIsCardFlipped(false);
                                }}
                                className="px-4 py-2 bg-[#10B981] hover:bg-[#0d9488] text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all border-none cursor-pointer"
                              >
                                Next ▶
                              </button>
                            </div>
                          </div>
                        )}

                        {activeAiTool === 'quiz' && (
                          <div className="space-y-6 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                            {aiQuizQuestions.map((q, qIdx) => {
                              const selectedOpt = aiQuizAnswers[q.id];
                              const isCorrect = selectedOpt === q.answer;
                              return (
                                <div key={q.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-3 text-left">
                                  <p className="text-xs font-black text-white">
                                    Q{qIdx + 1}. {q.question}
                                  </p>

                                  <div className="grid grid-cols-1 gap-2">
                                    {q.options.map((opt, oIdx) => {
                                      const isOptSelected = selectedOpt === opt;
                                      let optStyles = 'border-white/10 bg-slate-950/40 text-zinc-400 hover:text-white hover:bg-slate-955/70';
                                      if (aiQuizSubmitted) {
                                        if (opt === q.answer) {
                                          optStyles = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
                                        } else if (isOptSelected) {
                                          optStyles = 'border-rose-500/40 bg-rose-500/10 text-rose-455';
                                        } else {
                                          optStyles = 'border-white/5 bg-slate-950/10 text-zinc-600 opacity-60';
                                        }
                                      } else if (isOptSelected) {
                                        optStyles = 'border-indigo-500/40 bg-indigo-500/10 text-indigo-450';
                                      }

                                      return (
                                        <button
                                          key={oIdx}
                                          type="button"
                                          disabled={aiQuizSubmitted}
                                          onClick={() => {
                                            setAiQuizAnswers({
                                              ...aiQuizAnswers,
                                              [q.id]: opt
                                            });
                                          }}
                                          className={`w-full text-left p-2.5 rounded-xl border text-xs font-extrabold transition-all ${optStyles}`}
                                        >
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {aiQuizSubmitted && (
                                    <div className="p-3 bg-slate-955/60 rounded-xl text-[10px] text-zinc-400 leading-relaxed border border-white/5 text-left">
                                      <p className={`font-black uppercase mb-0.5 ${isCorrect ? 'text-emerald-400' : 'text-rose-455'}`}>
                                        {isCorrect ? '✓ Correct Answer' : `✗ Incorrect (Correct: ${q.answer})`}
                                      </p>
                                      <p>{q.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            <div className="flex justify-between items-center pt-2">
                              {!aiQuizSubmitted ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (Object.keys(aiQuizAnswers).length < aiQuizQuestions.length) {
                                      showToast('Please answer all questions first.', 'error');
                                      return;
                                    }
                                    setAiQuizSubmitted(true);
                                    let score = 0;
                                    aiQuizQuestions.forEach(q => {
                                      if (aiQuizAnswers[q.id] === q.answer) score++;
                                    });
                                    triggerXpReward(score * 15, `Quiz Completed! Correct: ${score}/${aiQuizQuestions.length}. +${score * 15} XP`);
                                    showToast(`Quiz completed! Score: ${score}/${aiQuizQuestions.length}`, 'success');
                                  }}
                                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all border-none cursor-pointer font-bold"
                                >
                                  Submit Answers
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAiQuizAnswers({});
                                    setAiQuizSubmitted(false);
                                  }}
                                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all border border-white/10 cursor-pointer font-bold"
                                >
                                  Retake Quiz
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Floating XP Rewards overlay */}
              <div className="fixed inset-0 pointer-events-none z-55 overflow-hidden">
                {xpRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="absolute text-sm font-black text-amber-400 bg-slate-950/80 border border-amber-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xl animate-bounce"
                    style={{
                      left: reward.x,
                      top: reward.y,
                      transform: 'translate(-50%, -50%)',
                      transition: 'all 2s ease'
                    }}
                  >
                    <span>🔥</span> {reward.text} (+{reward.amount} XP)
                  </div>
                ))}
              </div>

              {/* Create Academic Doubt Floating Action Dialog */}
              {newDoubtModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0B0F19] border border-white/10 rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl flex flex-col p-6 animate-in zoom-in-95 duration-205 text-white relative text-left">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="h-4.5 w-4.5 text-amber-500" /> Ask Academic Doubt
                      </h4>
                      <button
                        type="button"
                        onClick={() => setNewDoubtModalOpen(false)}
                        className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all font-bold cursor-pointer border-none"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleAskDoubt} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                          Channel / subject
                        </label>
                        <select
                          value={activeChannel}
                          onChange={(e) => setActiveChannel(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-[#10B981]/40 font-semibold"
                        >
                          <option value="#general-lobby">#general-lobby</option>
                          <option value="#dbms-circle">#dbms-circle</option>
                          <option value="#operating-systems">#operating-systems</option>
                          <option value="#computer-networks">#computer-networks</option>
                          <option value="#aptitude">#aptitude</option>
                          <option value="#interview-prep">#interview-prep</option>
                          <option value="#coding-rounds">#coding-rounds</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                          Doubt Title
                        </label>
                        <input
                          type="text"
                          placeholder="Summarize your doubt in one short sentence..."
                          value={newDoubtTitle}
                          onChange={(e) => setNewDoubtTitle(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-955 border border-white/10 rounded-xl text-xs outline-none text-white placeholder-zinc-600 focus:border-amber-500/40 font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                          Detail Description
                        </label>
                        <textarea
                          placeholder="Describe your issue, paste compiler logs, explain what you tried, etc. Mentors will review this..."
                          value={newDoubtDescription}
                          onChange={(e) => setNewDoubtDescription(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2.5 bg-slate-955 border border-white/10 rounded-xl text-xs outline-none text-white placeholder-zinc-600 focus:border-amber-500/40 font-medium resize-none"
                        />
                      </div>

                      <div className="flex gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setNewDoubtModalOpen(false)}
                          className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer text-center uppercase border border-white/10 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer text-center uppercase border-none font-bold"
                        >
                          Post Doubt (+10 XP)
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Consolidated Tab: Profile Directory */}
          {activeTab === 'profile' && profileSubView === null && (
            <div className="space-y-6 text-left text-white animate-in fade-in duration-300">
              <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-400" /> Profile Dashboard
                </h1>
                <p className="text-xs text-slate-400 mt-1">Manage your public academic presence and configuration settings.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                
                {/* Card 1: My Profile */}
                <div 
                  onClick={() => setProfileSubView('details')}
                  className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[180px] text-left group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                      👤
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">My Profile</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">View your public study card, verified certifications, level history, and student stats.</p>
                  </div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-4 block">View Profile &rarr;</span>
                </div>

                {/* Card 2: Settings */}
                <div 
                  onClick={() => setProfileSubView('settings')}
                  className="p-6 bg-gradient-to-br from-[#1E293B]/60 via-[#0F172A]/70 to-[#1e1b4b]/30 border border-white/5 hover:border-indigo-500/40 rounded-[28px] shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[180px] text-left group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-xl font-bold group-hover:scale-105 transition duration-200">
                      ⚙
                    </div>
                    <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">Settings</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">Edit your personal information, choose avatar, write bio description, or sign out.</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4 block">Account Settings &rarr;</span>
                </div>

              </div>
            </div>
          )}

          {/* Tab: My Profile representation details */}
          {activeTab === 'profile' && profileSubView === 'details' && (
            <div className="space-y-6 text-left text-white animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setProfileSubView(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                >
                  &larr; Back to Profile
                </button>
                <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Profile &gt; My Profile</span>
              </div>

              <div className="p-8 bg-[#0B0F19]/60 border border-white/5 rounded-[28px] shadow-xl max-w-2xl space-y-6">
                <div className="flex items-center gap-6 p-4 bg-slate-955/40 border border-white/5 rounded-[20px] shadow-inner">
                  <div className={`w-16 h-16 rounded-full overflow-hidden shrink-0 bg-slate-900 relative transition-all ${avatarRingClass}`}>
                    <img 
                      src={user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender)} 
                      className="absolute inset-0 h-full w-full object-cover" 
                      alt="Avatar" 
                    />
                  </div>
                  <div className="text-left space-y-1">
                    <h3 className="text-sm font-black text-white">{user?.fullName || 'User'}</h3>
                    <p className="text-[10px] text-slate-400 font-extrabold font-mono">@{user?.username || 'username'}</p>
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[8px] font-black uppercase tracking-wider rounded-md">
                      {user?.role || 'student'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 font-semibold text-xs text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Academic Standing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 p-3 bg-slate-955/20 border border-white/5 rounded-xl">
                      <span className="text-slate-500 block text-[8px] uppercase tracking-wide">Level Status</span>
                      <span className="text-indigo-400 font-black">Level {stats.level || 1}</span>
                    </div>
                    <div className="space-y-1 p-3 bg-slate-955/20 border border-white/5 rounded-xl">
                      <span className="text-slate-500 block text-[8px] uppercase tracking-wide">Accumulated XP</span>
                      <span className="text-emerald-400 font-black">{stats.xp || 0} XP</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 p-4 bg-[#0B0F19] border border-white/5 rounded-xl text-xs font-bold text-left">
                  <span className="text-slate-500 block text-[8px] uppercase tracking-wide">About Bio</span>
                  <p className="text-slate-200 font-medium whitespace-pre-wrap leading-relaxed mt-1">
                    {user?.bio || 'No bio provided yet.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 13: Settings info */}
          {(activeTab === 'settings' || (activeTab === 'profile' && profileSubView === 'settings')) && (
            <div className="space-y-6 text-left animate-in fade-in duration-350">
              {activeTab === 'profile' && (
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setProfileSubView(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-355 hover:text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest cursor-pointer border-none"
                  >
                    &larr; Back to Profile
                  </button>
                  <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Profile &gt; Settings</span>
                </div>
              )}
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-[#10B981]" /> Portal Settings
              </h3>
              <div className="p-8 bg-[#0B0F19] border border-white/5 rounded-[24px] shadow-lg max-w-2xl space-y-6 text-white">
                {!isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider text-left">Account Settings</h4>
                        <p className="text-[10px] text-slate-400 text-left">View and manage your profile details</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditFirstName(user?.firstName || '');
                          setEditLastName(user?.lastName || '');
                          setEditEmail(user?.email || '');
                          setEditPhone(user?.phone || '');
                          setPreviewAvatar(user?.avatarUrl || '');
                          setEditBio(user?.bio || '');
                          setIsEditingProfile(true);
                        }}
                        className="px-3 py-1.5 bg-[#10B981] hover:bg-[#0d9488] text-white text-[10px] font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                      </button>
                    </div>

                    {/* Profile Presentation */}
                    <div className="flex items-center gap-6 p-4 bg-slate-955/40 border border-white/5 rounded-[20px] shadow-inner">
                      <div className={`w-16 h-16 rounded-full overflow-hidden shrink-0 bg-slate-900 relative transition-all ${avatarRingClass}`}>
                        <img 
                          src={user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender)} 
                          className="absolute inset-0 h-full w-full object-cover" 
                          alt="Avatar" 
                        />
                      </div>
                      <div className="text-left space-y-1">
                        <h3 className="text-sm font-black text-white">{user?.fullName || 'User'}</h3>
                        <p className="text-[10px] text-slate-400 font-extrabold font-mono">@{user?.username || 'username'}</p>
                        <span className="inline-flex items-center px-2 py-0.5 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[8px] font-black uppercase tracking-wider rounded-md">
                          {user?.role || 'student'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-left">
                      <div className="space-y-1 p-3 bg-slate-950/20 border border-white/5 rounded-xl">
                        <span className="text-slate-500 block text-[8px] uppercase tracking-wide">First Name</span>
                        <span className="text-slate-200 font-semibold">{user?.firstName || 'Not Set'}</span>
                      </div>
                      <div className="space-y-1 p-3 bg-slate-950/20 border border-white/5 rounded-xl">
                        <span className="text-slate-500 block text-[8px] uppercase tracking-wide">Last Name</span>
                        <span className="text-slate-200 font-semibold">{user?.lastName || 'Not Set'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-left">
                      <div className="space-y-1 p-3 bg-slate-950/20 border border-white/5 rounded-xl">
                        <span className="text-slate-500 block text-[8px] uppercase tracking-wide">Email Address</span>
                        <span className="text-slate-200 font-semibold truncate block">{user?.email || 'Not Set'}</span>
                      </div>
                      <div className="space-y-1 p-3 bg-slate-950/20 border border-white/5 rounded-xl">
                        <span className="text-slate-500 block text-[8px] uppercase tracking-wide">Phone Number</span>
                        <span className="text-slate-200 font-semibold">{user?.phone || 'Not Set'}</span>
                      </div>
                    </div>

                    <div className="space-y-1 p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-left">
                      <span className="text-slate-400 block text-[8px] uppercase tracking-wide">About Bio</span>
                      <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                        {user?.bio || 'No bio provided yet.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-left">Account Settings</h4>
                      <p className="text-[10px] text-slate-400 text-left">Manage profile data and avatar details</p>

                      {/* WhatsApp-style photo upload preview */}
                      <div className="flex items-center gap-5 mt-4">
                        <div className={`relative group w-20 h-20 rounded-full overflow-hidden shadow-sm shrink-0 bg-slate-50 transition-all ${avatarRingClass}`}>
                          <img 
                            src={previewAvatar || getAvatarByName(user?.fullName, user?.gender)} 
                            className="h-full w-full object-cover animate-fade-in" 
                            alt="Avatar Preview" 
                          />
                          <label 
                            htmlFor="settings-avatar-input" 
                            className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Camera className="h-5 w-5 text-white" />
                          </label>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            id="settings-avatar-input" 
                            onChange={handleFileChange} 
                          />
                        </div>
                        <div className="text-left">
                          <label htmlFor="settings-avatar-input" className="text-xs font-black text-[#5227EB] hover:underline cursor-pointer block">
                            Change Profile Photo
                          </label>
                          <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                            Choose an image from your device.<br />It will be compressed and saved as your profile picture.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6 text-xs font-bold text-left">
                        <div className="space-y-1">
                          <label className="text-slate-400 block text-[9px] uppercase tracking-wide">First Name</label>
                          <input 
                            type="text" 
                            value={editFirstName} 
                            onChange={(e) => setEditFirstName(e.target.value)}
                            required
                            className="w-full bg-white border border-slate-250 hover:border-slate-350 focus:border-indigo-500 p-2.5 rounded-xl outline-none transition-all text-slate-800 font-semibold" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 block text-[9px] uppercase tracking-wide">Last Name</label>
                          <input 
                            type="text" 
                            value={editLastName} 
                            onChange={(e) => setEditLastName(e.target.value)}
                            required
                            className="w-full bg-white border border-slate-250 hover:border-slate-350 focus:border-indigo-500 p-2.5 rounded-xl outline-none transition-all text-slate-800 font-semibold" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-bold text-left">
                        <div className="space-y-1">
                          <label className="text-slate-400 block text-[9px] uppercase tracking-wide">Email Address</label>
                          <input 
                            type="email" 
                            value={editEmail} 
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="e.g. email@domain.com"
                            className="w-full bg-white border border-slate-250 hover:border-slate-350 focus:border-indigo-500 p-2.5 rounded-xl outline-none transition-all text-slate-800 font-semibold" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 block text-[9px] uppercase tracking-wide">Phone Number</label>
                          <input 
                            type="text" 
                            value={editPhone} 
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full bg-white border border-slate-250 hover:border-slate-350 focus:border-indigo-500 p-2.5 rounded-xl outline-none transition-all text-slate-800 font-semibold" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1 mt-4 text-xs font-bold text-left">
                        <label className="text-slate-400 block text-[9px] uppercase tracking-wide">Username</label>
                        <input 
                          type="text" 
                          value={user?.username || ''} 
                          readOnly 
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none text-slate-450 cursor-not-allowed font-medium" 
                        />
                      </div>
                      
                      <div className="space-y-1 mt-4 text-xs font-bold text-left">
                        <label className="text-slate-400 block text-[9px] uppercase tracking-wide">About Bio</label>
                        <textarea
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="Write a brief bio about your study goals, or interests..."
                          rows={3}
                          className="w-full bg-white border border-slate-250 hover:border-slate-350 focus:border-indigo-500 p-2.5 rounded-xl outline-none resize-none transition-all text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-5 py-2.5 bg-[#5227EB] hover:bg-[#431cd3] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {savingProfile ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving Changes...
                          </>
                        ) : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Security Settings</h4>
                  <p className="text-[10px] text-slate-400">Portal credentials and API sessions</p>
                  <div className="mt-3 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-800">Session Status</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wide ml-2">Active</span>
                      </div>
                      <button onClick={handleLogout} className="px-3 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 rounded-lg font-bold">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 14: Admin approvals panel */}
          {user?.role === 'admin' && activeTab === 'admin' && (
            <section id="admin-approvals-section" className="p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1F3A35] border border-white/10 rounded-[24px] shadow-lg space-y-4 text-left text-white">
              <div className="flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-rose-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Admin Console: Coordinator Approvals</h3>
              </div>
              
              {pendingApprovals.length === 0 ? (
                <div className="p-10 border border-dashed border-white/10 rounded-2xl text-center space-y-2 bg-slate-950/20">
                  <UserCheck className="h-8 w-8 text-zinc-400 mx-auto" />
                  <p className="text-xs text-zinc-200 font-bold">All Registered Coordinators are Approved</p>
                  <p className="text-[10px] text-zinc-400">No pending registrations are awaiting approval at the moment.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingApprovals.map((pUser) => (
                    <div key={pUser.id} className="p-4 bg-slate-955/40 border border-white/5 rounded-2xl flex flex-col justify-between gap-3 shadow-sm">
                      <div>
                        <h4 className="text-xs font-black text-white leading-tight">{pUser.fullName}</h4>
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 capitalize">
                          <span className="font-mono text-zinc-400">@{pUser.username}</span>
                          <span>•</span>
                          <span className="text-rose-400 font-bold">{pUser.role}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleApproveUser(pUser.id)}
                        className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                      >
                        <UserCheck className="h-3 w-3" /> Approve Registration
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Tab 15: Users panel */}
          {activeTab === 'users' && (
            <section id="users-management-section" className="p-6 bg-gradient-to-br from-[#0B0F19] to-[#0d1629] border border-white/5 rounded-[24px] shadow-lg space-y-6 text-left text-white animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" /> Roster Management
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Manage and audit student users registered in this workspace.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search name, username, dept..." 
                      value={studentsSearch}
                      onChange={(e) => setStudentsSearch(e.target.value)}
                      className="pl-8.5 pr-4 py-1.5 bg-slate-950/80 border border-white/5 rounded-xl text-[10px] outline-none text-white focus:border-indigo-500 w-48 transition-all"
                    />
                  </div>
                </div>
              </div>

              {(() => {
                const term = studentsSearch.toLowerCase();
                const filtered = studentsList.filter(student => {
                  return (
                    (student.fullName || '').toLowerCase().includes(term) ||
                    (student.username || '').toLowerCase().includes(term) ||
                    (student.email || '').toLowerCase().includes(term) ||
                    (student.department || '').toLowerCase().includes(term)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-slate-950/20">
                      <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mx-auto">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-200 font-bold">No students found</p>
                        <p className="text-[10px] text-zinc-400 max-w-sm mx-auto">
                          {studentsList.length === 0 
                            ? "Once students register using your workspace invite codes or join study lounges, their profile details and study statistics will appear here."
                            : "Try checking your search criteria. No registered students match your query."}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map((student) => {
                      let badgeArr = [];
                      try {
                        badgeArr = JSON.parse(student.badges || '[]');
                      } catch (e) {
                        badgeArr = [];
                      }
                      const isAmbassador = badgeArr.includes('Campus Ambassador');
                      const placementReadiness = getPlacementReadiness(student);

                      return (
                        <div 
                          key={student.id} 
                          className="bg-[#0f1424] border border-white/5 hover:border-indigo-500/30 rounded-[20px] p-5 shadow-md hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            {/* Student Info Header */}
                            <div className="flex items-center gap-3.5">
                              <div className="relative">
                                <img 
                                  src={getAvatarByName(student.fullName, student.gender)} 
                                  alt={student.fullName} 
                                  className="w-12 h-12 rounded-full border-2 border-indigo-500/20"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/charan-avatar.png';
                                  }}
                                />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 h-3 w-3 rounded-full border-2 border-[#0f1424]" title="Active" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                                  {student.fullName}
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                    {student.department || 'CSE'}
                                  </span>
                                </h4>
                                <p className="text-[10px] text-zinc-400 truncate">@{student.username}</p>
                                {student.email && (
                                  <p className="text-[9px] text-zinc-500 truncate mt-0.5">{student.email}</p>
                                )}
                              </div>
                            </div>

                            {/* Badges list */}
                            <div className="flex flex-wrap gap-1.5 mt-3.5">
                              <span className="text-[9px] font-extrabold bg-[#5227EB]/10 border border-[#5227EB]/20 text-[#8B5CF6] px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Trophy className="w-2.5 h-2.5" /> Level {student.level || 1}
                              </span>
                              {isAmbassador && (
                                <span className="text-[9px] font-extrabold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                                  <Award className="w-2.5 h-2.5" /> Campus Ambassador
                                </span>
                              )}
                              {badgeArr.map((badgeName: string, idx: number) => {
                                if (badgeName === 'Campus Ambassador') return null;
                                return (
                                  <span key={idx} className="text-[9px] font-semibold bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded-md">
                                    {badgeName}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mt-4.5 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                                <div>
                                  <p className="text-[8px] text-zinc-500 uppercase font-extrabold">Streak</p>
                                  <p className="text-[10px] text-white font-bold">{student.streakCount || 0} Days</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#38BDF8] shrink-0" />
                                <div>
                                  <p className="text-[8px] text-zinc-500 uppercase font-extrabold">Study Hours</p>
                                  <p className="text-[10px] text-white font-bold">{(student.totalStudyHours || 0).toFixed(1)} hrs</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                                <div>
                                  <p className="text-[8px] text-zinc-500 uppercase font-extrabold">Focus Coins</p>
                                  <p className="text-[10px] text-white font-bold">{student.focusCoins || 0} Coins</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div>
                                  <p className="text-[8px] text-zinc-500 uppercase font-extrabold">XP Points</p>
                                  <p className="text-[10px] text-white font-bold">{student.xp || 0} XP</p>
                                </div>
                              </div>
                            </div>

                            {/* Placement Readiness Score */}
                            <div className="mt-4 space-y-1">
                              <div className="flex justify-between text-[9px]">
                                <span className="text-zinc-400 font-bold">Placement Readiness Score</span>
                                <span className="text-emerald-400 font-extrabold">{placementReadiness}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                  style={{ width: `${placementReadiness}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-white/5">
                            <button
                              onClick={() => {
                                setSelectedStudentForChallenge(student);
                                setChallengeText('');
                                setChallengeXp(150);
                                setChallengeCoins(50);
                                setShowChallengeModal(true);
                              }}
                              className="flex-1 py-1.5 bg-[#5227EB]/10 border border-[#5227EB]/30 hover:bg-[#5227EB]/20 text-[#8B5CF6] rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              🎯 Assign Challenge
                            </button>
                            <button
                              onClick={() => handleToggleAmbassador(student.id)}
                              className={`flex-1 py-1.5 border rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isAmbassador
                                  ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400'
                                  : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              👑 {isAmbassador ? 'Revoke Ambassador' : 'Make Ambassador'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </section>
          )}

          {/* Tab 16: Reports panel */}
          {activeTab === 'reports' && (
            <section id="reports-analytics-section" className="p-6 bg-gradient-to-br from-[#0B0F19] to-[#0d1629] border border-white/5 rounded-[24px] shadow-lg space-y-6 text-left text-white animate-in fade-in duration-300">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-[#38BDF8]" /> Workspace Analytics & Reports
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Export study records, active hours audit logs, and performance metrics.</p>
              </div>

              <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-slate-950/20">
                <div className="h-10 w-10 bg-[#38BDF8]/10 text-[#38BDF8] rounded-xl flex items-center justify-center mx-auto">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-200 font-bold">No reports generated yet</p>
                  <p className="text-[10px] text-zinc-400 max-w-sm mx-auto">Analytics logs compile study circle metrics on a weekly schedule. Reports will generate automatically once workspace activities start logging.</p>
                </div>
              </div>
            </section>
          )}

          {/* Tab 17: Announcements panel */}
          {activeTab === 'announcements' && (
            <section id="announcements-section" className="p-6 bg-gradient-to-br from-[#0B0F19] to-[#0d1629] border border-white/5 rounded-[24px] shadow-lg space-y-6 text-left text-white animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-amber-400" /> Broadcaster Announcement Board
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Publish alerts, syllabus schedules, or study milestones to all circles.</p>
                </div>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="px-3.5 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" /> Post Announcement
                </button>
              </div>

              <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-slate-950/20">
                <div className="h-10 w-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mx-auto">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-200 font-bold">No announcements posted yet</p>
                  <p className="text-[10px] text-zinc-400 max-w-sm mx-auto">Create and broadcast announcements to notify students instantly on their notification headers and dashboards.</p>
                </div>
              </div>
            </section>
          )}

          {/* Tab 18: Feedback panel */}
          {activeTab === 'feedback' && (
            <section id="feedback-section" className="p-6 bg-gradient-to-br from-[#0B0F19] to-[#0d1629] border border-white/5 rounded-[24px] shadow-lg space-y-6 text-left text-white animate-in fade-in duration-300">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-emerald-400" /> Doubt Feedback Review
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Audit feedback forms, doubt reports, and study circle quality reviews.</p>
              </div>

              <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-slate-950/20">
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-200 font-bold">No feedback received yet</p>
                  <p className="text-[10px] text-zinc-400 max-w-sm mx-auto">Student feedback forms and reviews submitted in your workspace lounges will show up here to monitor engagement.</p>
                </div>
              </div>
            </section>
          )}

          {/* Tab 19: Roles panel */}
          {activeTab === 'roles' && (
            <section id="roles-section" className="p-6 bg-gradient-to-br from-[#0B0F19] to-[#0d1629] border border-white/5 rounded-[24px] shadow-lg space-y-6 text-left text-white animate-in fade-in duration-300">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-rose-400" /> System Roles & Access Controls
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Audit user types and manage circle creation access privileges.</p>
              </div>

              <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-slate-950/20">
                <div className="h-10 w-10 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mx-auto">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-200 font-bold">Roles configuration at baseline</p>
                  <p className="text-[10px] text-zinc-400 max-w-sm mx-auto">Default access roles (Student, Mentor, Administrator) are active. Role-level privilege modifiers can be configured as your workspace size scales.</p>
                </div>
              </div>
            </section>
          )}

        </main>
      </div>

      {/* Create Circle modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Initialize Study Circle</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCircle} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Circle Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. AP-Telangana B.Tech Prep"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject / Area</label>
                <input
                  type="text"
                  value={groupSubject}
                  onChange={(e) => setGroupSubject(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Goals, topics, and schedule details."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-slate-900 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-700">Public Workspace Lounge</div>
                  <div className="text-[9px] text-slate-400 leading-snug">Allow guests to view and join without invite codes.</div>
                </div>
                <input
                  type="checkbox"
                  checked={groupIsPublic}
                  onChange={(e) => setGroupIsPublic(e.target.checked)}
                  className="h-4 w-4 bg-white border-slate-300 focus:ring-indigo-500 text-indigo-600 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  {creating ? 'Creating...' : 'Initialize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Nudge Student Modal (Mentor) */}
      {showNudgeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Send Nudge Reminders</h3>
              </div>
              <button onClick={() => setShowNudgeModal(false)} className="text-slate-450 font-bold text-xs">✕</button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recipient Student</label>
                <input type="text" value={nudgeStudentName} readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-750" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alert Notification Message</label>
                <textarea
                  value={nudgeMessage}
                  onChange={(e) => setNudgeMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-550 rounded-xl text-xs text-slate-800 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowNudgeModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitNudge}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Dispatch Nudge Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Action: Create Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-650" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Schedule Class Session</h3>
              </div>
              <button onClick={() => setShowSessionModal(false)} className="text-slate-450 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject / Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Networks"
                  value={sessSubject}
                  onChange={(e) => setSessSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-550 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3 Core Concepts Review"
                  value={sessTitle}
                  onChange={(e) => setSessTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-550 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Date & Time Description</label>
                <input
                  type="text"
                  placeholder="e.g. Today, 07:00 PM - 08:30 PM"
                  value={sessTime}
                  onChange={(e) => setSessTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-550 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-bold"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditNoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-650" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Edit Shared Note</h3>
              </div>
              <button onClick={() => setShowEditNoteModal(false)} className="text-slate-450 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleEditSharedNote} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Note Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. DBMS Normalization.pdf"
                  value={editNoteName}
                  onChange={(e) => setEditNoteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">File Size</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 1.8 MB"
                    value={editNoteSize}
                    onChange={(e) => setEditNoteSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select 
                    value={editNoteCategory}
                    onChange={(e) => setEditNoteCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-700 outline-none"
                  >
                    <option value="syllabus">Syllabus</option>
                    <option value="lecture">Lecture</option>
                    <option value="exam">Exam Prep</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditNoteModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingNote}
                  className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  {editingNote ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" /> Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditSessionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-650" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Edit Scheduled Session</h3>
              </div>
              <button onClick={() => setShowEditSessionModal(false)} className="text-slate-450 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleEditSessionSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject / Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Networks"
                  value={editSessSubject}
                  onChange={(e) => setEditSessSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3 Core Concepts Review"
                  value={editSessTitle}
                  onChange={(e) => setEditSessTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Date & Time Description</label>
                <input
                  type="text"
                  placeholder="e.g. Today, 07:00 PM - 08:30 PM"
                  value={editSessTime}
                  onChange={(e) => setEditSessTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <select
                  value={editSessStatus}
                  onChange={(e) => setEditSessStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-800 outline-none"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Live Now">Live Now</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditSessionModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentor Action: Post Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#5227EB]" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Post Platform Announcement</h3>
              </div>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-slate-450 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Announcement Content</label>
                <textarea
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="Post reminders, cluster links or study recommendations..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-800 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl text-xs font-bold"
                >
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentor Action: Create Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Publish Assignment</h3>
              </div>
              <button onClick={() => setShowAssignmentModal(false)} className="text-slate-450 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assignment Title</label>
                <input
                  type="text"
                  placeholder="e.g. DBMS Normalization Practice Problems"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-550 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submission Due Date</label>
                <input
                  type="text"
                  placeholder="e.g. Sunday, June 14, 2026 - 11:59 PM"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-550 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-650 hover:bg-purple-755 text-white rounded-xl text-xs font-bold"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentor Action: Assign Challenge Modal */}
      {showChallengeModal && selectedStudentForChallenge && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B0F19] border border-white/10 rounded-[28px] max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200 text-left text-white">
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
              <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                🎯 Assign Study Challenge
              </h3>
              <button 
                onClick={() => {
                  setShowChallengeModal(false);
                  setSelectedStudentForChallenge(null);
                }} 
                className="text-zinc-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAssignChallengeSubmit} className="mt-4 space-y-4.5">
              <div>
                <p className="text-[10px] text-zinc-400">Assigning challenge to:</p>
                <div className="flex items-center gap-2 mt-1 bg-slate-950/40 p-2 rounded-xl border border-white/5">
                  <img 
                    src={getAvatarByName(selectedStudentForChallenge.fullName, selectedStudentForChallenge.gender)} 
                    alt={selectedStudentForChallenge.fullName} 
                    className="w-7 h-7 rounded-full" 
                  />
                  <div>
                    <p className="text-xs font-bold">{selectedStudentForChallenge.fullName}</p>
                    <p className="text-[9px] text-zinc-500">@{selectedStudentForChallenge.username}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Challenge Description</label>
                <textarea
                  value={challengeText}
                  onChange={(e) => setChallengeText(e.target.value)}
                  placeholder="e.g. Complete 20 LeetCode Questions on Binary Search, or Finish DBMS Chapter 4 revision"
                  className="w-full h-24 px-3 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-xs outline-none text-white focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">XP Reward</label>
                  <input
                    type="number"
                    value={challengeXp}
                    onChange={(e) => setChallengeXp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-xs outline-none text-white focus:border-indigo-500"
                    min="10"
                    max="1000"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Focus Coins Reward</label>
                  <input
                    type="number"
                    value={challengeCoins}
                    onChange={(e) => setChallengeCoins(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-xs outline-none text-white focus:border-indigo-500"
                    min="5"
                    max="500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setShowChallengeModal(false);
                    setSelectedStudentForChallenge(null);
                  }}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-zinc-300 rounded-xl text-[11px] font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningChallenge}
                  className="px-4 py-2 bg-[#5227EB] hover:bg-[#431cd3] disabled:opacity-50 text-white rounded-xl text-[11px] font-bold transition-all"
                >
                  {assigningChallenge ? 'Assigning...' : 'Assign Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Video Room Mock Session Overlay */}
      {activeRoom && (
        <div className="fixed inset-0 bg-slate-950 flex flex-col justify-between p-6 z-50 animate-fade-in text-white font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full bg-red-500 animate-pulse" />
              <div>
                <h3 className="text-sm font-black text-white">{activeRoom} - Video Study Lounge</h3>
                <span className="text-[10px] text-slate-400 font-extrabold font-mono mt-0.5 block">
                  Time in room: {formatSeconds(roomSeconds)}
                </span>
              </div>
            </div>
            
            <div className="bg-[#5227EB] px-3.5 py-1 border border-indigo-500/30 rounded-full text-[9px] font-black uppercase tracking-wider">
              Secure Study Feed
            </div>
          </div>

          {/* Grid feeds */}
          <div className="flex-1 my-6 grid sm:grid-cols-3 gap-6 items-center justify-center max-w-5xl mx-auto w-full">
            {/* Feed 1: Current user */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl h-[260px] flex flex-col justify-between p-4 relative overflow-hidden">
              {roomCamOff ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-550 text-xs font-bold font-mono">
                  CAMERA DISABLED
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-slate-900 flex items-center justify-center">
                  <div className="text-center space-y-2 relative z-10">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-white/10 border border-white/20 mx-auto shadow-inner relative">
                      <img src={user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender)} className="absolute inset-0 h-full w-full object-cover" alt="Avatar" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-200">{user?.fullName || 'Swathi'} (You)</span>
                  </div>
                </div>
              )}
              <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[8px] font-bold z-10">
                Vijayawada node
              </span>
            </div>

            {/* Feed 2: Study Partner 1 */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl h-[260px] flex flex-col justify-between p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-2 relative z-10 animate-pulse">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-white/10 border border-white/20 mx-auto shadow-inner relative">
                    <img src="/charan-avatar.png" className="absolute inset-0 h-full w-full object-cover" alt="Charan" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-200">Charan</span>
                </div>
              </div>
              <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[8px] font-bold z-10">
                Vizag node
              </span>
            </div>

            {/* Feed 3: Study Partner 2 */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl h-[260px] flex flex-col justify-between p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-2 relative z-10">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-white/10 border border-white/20 mx-auto shadow-inner relative">
                    <img src="/bhagya-avatar.png" className="absolute inset-0 h-full w-full object-cover" alt="Bhagya" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-250">Bhagya</span>
                </div>
              </div>
              <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[8px] font-bold z-10">
                Guntur node
              </span>
            </div>
          </div>

          {/* Controls toolbar */}
          <div className="border-t border-white/10 pt-4 flex justify-between items-center max-w-lg mx-auto w-full">
            <button 
              onClick={() => setRoomMuted(prev => !prev)}
              className={`p-3 rounded-2xl border transition-all ${roomMuted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'}`}
            >
              {roomMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            
            <button 
              onClick={() => setRoomCamOff(prev => !prev)}
              className={`p-3 rounded-2xl border transition-all ${roomCamOff ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'}`}
            >
              {roomCamOff ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
            </button>

            <button 
              onClick={() => {
                const hoursLogged = Number((roomSeconds / 3600).toFixed(2));
                if (hoursLogged > 0) {
                  setStats(prev => ({
                    ...prev,
                    totalStudyHours: Number((prev.totalStudyHours + hoursLogged).toFixed(2))
                  }));
                  showToast(`Session log successfully tracked! Added ${hoursLogged} study hours.`, 'success');
                }
                completeMission('complete_session');
                setActiveRoom(null);
              }}
              className="px-6 py-2.5 bg-red-650 hover:bg-red-750 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-red-900/30"
            >
              Leave Room
            </button>
          </div>
        </div>
      )}

      {/* Auth Guard Login Overlay */}
      {!user && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        >
          <div 
            className="max-w-md w-full bg-white border border-slate-250 rounded-[32px] p-6 space-y-6 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-250"
            style={{ background: 'linear-gradient(135deg, #ffd2fc 0%, #e8dbfc 50%, #bde3ff 100%)' }}
          >
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-[#5227EB]">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Access Restricted</h3>
              <p className="text-[10px] text-slate-400">Please sign in to access your StudyCircle dashboard workspace.</p>
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1 text-[10px] font-bold">
              <button 
                type="button" 
                onClick={() => setLoginPortal('student')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${loginPortal === 'student' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Student Portal
              </button>
              <button 
                type="button" 
                onClick={() => setLoginPortal('mentor')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${loginPortal === 'mentor' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Mentor / Admin
              </button>
            </div>

            <form onSubmit={handleDashboardLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Username</label>
                <input 
                  type="text" 
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="e.g. swathi"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                <input 
                  type="password" 
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#5227EB] rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={loginLoading}
                className="w-full py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loginLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                Enter Workspace Dashboard
              </button>
            </form>
            <div className="text-center pt-2">
              <Link href="/" className="text-[10px] font-black text-indigo-650 hover:underline">
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Wizard Overlay Modal */}
      {showOnboardingWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060913]/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_100%)] pointer-events-none" />
          
          <div className="bg-[#0B0F19]/90 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 max-w-md w-full relative space-y-6 text-left transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">
                  Onboarding Wizard • Step {onboardingStep} of 3
                </span>
              </div>
              <h2 className="text-xl font-black text-white leading-tight">Welcome to StudyCircle!</h2>
              <p className="text-xs text-slate-450 font-bold">Let's personalize your learning dashboard in 30 seconds.</p>
            </div>

            {/* STEP 1: Goal Milestone */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-455 tracking-wide block">1. What is your target milestone?</label>
                <div className="grid gap-2.5">
                  {[
                    { id: 'Crack Placements', title: '🎯 Crack Placements', desc: 'Prepare for technical interviews, DSA, and aptitude tests.' },
                    { id: 'Become Full Stack Developer', title: '💻 Become Full Stack Developer', desc: 'Master HTML, CSS, React, Next.js, and API design.' },
                    { id: 'Learn DSA', title: '🧠 Learn DSA', desc: 'Dive deep into sorting, trees, graphs, and algorithms.' },
                    { id: 'Prepare for GATE', title: '📖 Prepare for GATE', desc: 'Study core computer engineering subjects for the GATE exam.' },
                    { id: 'Improve Aptitude', title: '📊 Improve Aptitude', desc: 'Practice logical reasoning, math rates, and puzzle solving.' }
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => setWizardGoal(g.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        wizardGoal === g.id
                          ? 'bg-indigo-500/10 border-indigo-500 text-white shadow shadow-indigo-500/10 font-bold'
                          : 'bg-[#070b16] border-white/5 text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-black">{g.title}</div>
                      <div className="text-[9px] text-slate-500 mt-1 font-bold">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Learning Level */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-455 tracking-wide block">2. What is your experience level?</label>
                <div className="grid gap-2.5">
                  {[
                    { id: 'beginner', title: '🐣 Beginner Path', desc: 'Starting from scratch. Focus on fundamental logic and structures.' },
                    { id: 'intermediate', title: '🚀 Intermediate Path', desc: 'Know some code. Solve complex algorithms and build projects.' },
                    { id: 'advanced', title: '🏆 Advanced Path', desc: 'Proficient. Deep dive into system optimizations and hard limits.' }
                  ].map(l => (
                    <button
                      key={l.id}
                      onClick={() => setWizardLevel(l.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        wizardLevel === l.id
                          ? 'bg-indigo-500/10 border-indigo-500 text-white shadow shadow-indigo-500/10 font-bold'
                          : 'bg-[#070b16] border-white/5 text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-black">{l.title}</div>
                      <div className="text-[9px] text-slate-500 mt-1 font-bold">{l.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Commitment Hours */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-455 tracking-wide block">3. How many hours can you study daily?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 1.0, label: '⏱️ 1 Hour' },
                    { val: 2.0, label: '🔥 2 Hours' },
                    { val: 3.0, label: '⚡ 3 Hours' },
                    { val: 4.0, label: '🚀 4+ Hours' }
                  ].map(h => (
                    <button
                      key={h.val}
                      onClick={() => setWizardTarget(h.val)}
                      className={`p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                        wizardTarget === h.val
                          ? 'bg-indigo-500/10 border-indigo-500 text-white shadow shadow-indigo-500/10 font-bold'
                          : 'bg-[#070b16] border-white/5 text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-black">{h.label}</div>
                      <div className="text-[9px] text-slate-500 mt-1 font-bold">per day target</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              {onboardingStep > 1 ? (
                <button
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {onboardingStep < 3 ? (
                <button
                  disabled={onboardingStep === 1 && !wizardGoal}
                  onClick={() => setOnboardingStep(prev => prev + 1)}
                  className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-650 text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all cursor-pointer"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSaveOnboardingWizard}
                  disabled={savingOnboarding}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all cursor-pointer"
                >
                  {savingOnboarding ? 'Saving...' : 'Finish & Personalize'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🎉 Gamification: Confetti particle shower */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {Array.from({ length: 80 }).map((_, i) => {
            const randomLeft = Math.random() * 100; // %
            const randomDelay = Math.random() * 1.5; // seconds
            const randomDuration = 2.5 + Math.random() * 2.5; // seconds
            const randomSize = 6 + Math.random() * 8; // px
            const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const randomRotation = Math.random() * 360;

            return (
              <div
                key={i}
                className="absolute rounded-sm animate-confetti-fall"
                style={{
                  left: `${randomLeft}%`,
                  width: `${randomSize}px`,
                  height: `${randomSize}px`,
                  backgroundColor: randomColor,
                  top: `-20px`,
                  opacity: 0.8,
                  transform: `rotate(${randomRotation}deg)`,
                  animationDelay: `${randomDelay}s`,
                  animationDuration: `${randomDuration}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'linear'
                }}
              />
            );
          })}
          <style>{`
            @keyframes confettiFall {
              0% {
                top: -20px;
                transform: rotate(0deg) translateX(0);
                opacity: 1;
              }
              55% {
                transform: rotate(180deg) translateX(15px);
              }
              100% {
                top: 105vh;
                transform: rotate(360deg) translateX(-15px);
                opacity: 0;
              }
            }
            .animate-confetti-fall {
              animation-name: confettiFall;
            }
          `}</style>
        </div>
      )}

      {/* 🔍 Global Spotlight Search Command Center */}
      {showSearchPalette && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090d1e] border border-white/10 rounded-[28px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="p-4 border-b border-white/5 bg-[#0b1026] flex items-center gap-3">
              <Search className="h-5 w-5 text-indigo-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search resources, questions, study desks, discussions, AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-slate-500 font-semibold"
              />
              <button
                onClick={() => {
                  setShowSearchPalette(false);
                  setSearchQuery('');
                }}
                className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest bg-white/5 border-none px-3 py-1.5 rounded-lg cursor-pointer transition-all"
              >
                ESC
              </button>
            </div>

            <div className="p-4 max-h-[350px] overflow-y-auto space-y-4 scrollbar-thin">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-6 text-slate-500 space-y-2">
                  <span className="text-2xl block">💡</span>
                  <p className="text-xs font-semibold">Try searching "Arrays", "DBMS", "Notes", or "Study".</p>
                  <p className="text-[10px] font-bold">One search reaches your entire StudyCircle universe.</p>
                </div>
              ) : (
                (() => {
                  const query = searchQuery.toLowerCase();
                  
                  // Filter items
                  const filteredQuestions = (practiceQuestionsPool['Programming & DSA'] || [])
                    .concat(practiceQuestionsPool['Web Development'] || [])
                    .filter((q: any) => q.title.toLowerCase().includes(query) || q.question.toLowerCase().includes(query));
                  
                  const filteredRooms = [
                    { title: "🚀 DBMS Desks", desc: "Active study group circle", tab: "study", subView: "rooms" },
                    { title: "🧠 Programming & DSA Room", desc: "Data structures coding desks", tab: "study", subView: "rooms" },
                    { title: "🌐 Web Development Room", desc: "Fullstack projects review", tab: "study", subView: "rooms" }
                  ].filter(r => r.title.toLowerCase().includes(query));

                  const filteredResources = [
                    { title: "DBMS Normalization Cheat Sheet", type: "PDF Guide", tab: "study", subView: "resources" },
                    { title: "Operating Systems Processes Overview", type: "Reference Doc", tab: "study", subView: "resources" },
                    { title: "Java Binary Search Trees Guide", type: "Syllabus Notes", tab: "study", subView: "resources" }
                  ].filter(r => r.title.toLowerCase().includes(query));

                  const totalResults = filteredQuestions.length + filteredRooms.length + filteredResources.length;

                  if (totalResults === 0) {
                    return (
                      <div className="text-center py-6 text-slate-500 space-y-1">
                        <span className="text-xl block">🔍</span>
                        <p className="text-xs font-bold">No matches found for "{searchQuery}"</p>
                        <p className="text-[9px] font-semibold text-slate-600">Double check spelling or try a different subject key.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {/* Questions */}
                      {filteredQuestions.length > 0 && (
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Practice Questions</span>
                          <div className="space-y-1">
                            {filteredQuestions.slice(0, 3).map((q: any, idx: number) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedInterest('Programming & DSA');
                                  setPracticeSubView('questions');
                                  setActiveTab('practice');
                                  setShowSearchPalette(false);
                                  setSearchQuery('');
                                }}
                                className="p-2.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                              >
                                <div className="text-left min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">{q.title}</span>
                                  <span className="text-[9px] text-slate-450 block font-semibold truncate">{q.question.substring(0, 60)}...</span>
                                </div>
                                <span className="text-[9px] text-indigo-400 font-extrabold shrink-0">Solve &rarr;</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rooms */}
                      {filteredRooms.length > 0 && (
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Active Study Rooms</span>
                          <div className="space-y-1">
                            {filteredRooms.map((room, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setActiveTab(room.tab as any);
                                  setStudySubView(room.subView as any);
                                  setShowSearchPalette(false);
                                  setSearchQuery('');
                                }}
                                className="p-2.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                              >
                                <div className="text-left">
                                  <span className="text-xs font-bold text-white block">{room.title}</span>
                                  <span className="text-[9px] text-slate-450 block font-semibold">{room.desc}</span>
                                </div>
                                <span className="text-[9px] text-emerald-450 font-extrabold">Enter &rarr;</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resources */}
                      {filteredResources.length > 0 && (
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Resources & Docs</span>
                          <div className="space-y-1">
                            {filteredResources.map((res, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setActiveTab(res.tab as any);
                                  setStudySubView(res.subView as any);
                                  setShowSearchPalette(false);
                                  setSearchQuery('');
                                }}
                                className="p-2.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                              >
                                <div className="text-left">
                                  <span className="text-xs font-bold text-white block">{res.title}</span>
                                  <span className="text-[9px] text-slate-450 block font-semibold">{res.type}</span>
                                </div>
                                <span className="text-[9px] text-cyan-400 font-extrabold">Download &rarr;</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Search shortcut */}
                      <div
                        onClick={() => {
                          setShowSearchPalette(false);
                          window.dispatchEvent(new CustomEvent('open-ai-tutor'));
                          setSearchQuery('');
                        }}
                        className="p-3 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/25 rounded-2xl flex items-center justify-between cursor-pointer transition-all mt-2"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                          <span className="text-xs font-bold text-slate-200">Ask AI Tutor about "{searchQuery}"</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">Launch Chat</span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📂 Shared Resources Modal */}
      {showResourcesModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowResourcesModal(false)}>
          <div 
            className="w-full max-w-2xl bg-[#131722] border border-[rgba(255,255,255,0.08)] rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center bg-[#090B14]/40">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#7C4DFF]/10 flex items-center justify-center border border-[#7C4DFF]/20">
                  <FileText className="h-5 w-5 text-[#7C4DFF]" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workspace Shared Resources</h3>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">Access syllabus cheat sheets, reference notes, and materials.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowResourcesModal(false)}
                className="text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
              {myGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
                  <div className="h-14 w-14 rounded-full bg-slate-800/40 flex items-center justify-center text-2xl text-slate-500 border border-white/5">
                    📂
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">No Resources Available</h4>
                    <p className="text-[11px] text-slate-400 font-normal leading-relaxed max-w-sm">
                      Your mentor hasn't shared any study materials yet. Resources will appear here once they are uploaded.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  
                  {/* Item 1 */}
                  <div className="p-4 bg-[#090B14] border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/10">
                        <span className="text-[9px] font-bold text-red-400">PDF</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[220px] sm:max-w-[280px]" title="DBMS Schema Design Cheat Sheet.pdf">
                          DBMS Schema Design Cheat Sheet.pdf
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-550 font-semibold">
                          <span>1.2 MB</span>
                          <span>•</span>
                          <span>Uploaded by Swathi Hanumanthu (Mentor)</span>
                          <span>•</span>
                          <span>July 1, 2026</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        showToast('Downloading DBMS Schema cheat sheet.txt...', 'success'); 
                        const content = `StudyCircle Placement Preparation: DBMS Schema Design Cheat Sheet\n----------------------------------------------------------------\n1. Keys:\n   - Primary Key: Unique, non-null identifier for a record.\n   - Foreign Key: Field referencing primary key of another table.\n2. Normalization Rules:\n   - 1NF: Atomic values, unique column names.\n   - 2NF: In 1NF and no partial dependencies.\n   - 3NF: In 2NF and no transitive dependencies.\n   - BCNF: For any dependency A -> B, A must be a super key.\n3. Joins:\n   - INNER JOIN: Returns matches in both tables.\n   - LEFT JOIN: Returns all records from left table and matches from right table.`;
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'dbms_schema_cheat_sheet.txt';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 bg-[#7C4DFF] hover:bg-[#6C3DFF] text-white text-[10px] font-bold rounded-lg transition-all border-none cursor-pointer"
                    >
                      Download &darr;
                    </button>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 bg-[#090B14] border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/10">
                        <span className="text-[9px] font-bold text-red-400">PDF</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[220px] sm:max-w-[280px]" title="Syllabus Reference Notes.pdf">
                          Syllabus Reference Notes.pdf
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-550 font-semibold">
                          <span>2.4 MB</span>
                          <span>•</span>
                          <span>Uploaded by Charan Teja (Admin)</span>
                          <span>•</span>
                          <span>June 28, 2026</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        showToast('Downloading Syllabus Reference Notes.txt...', 'success'); 
                        const content = `StudyCircle Placement Preparation: Syllabus Reference Notes\n----------------------------------------------------------\nRecommended placement preparation track subjects:\n1. Data Structures & Algorithms (Trees, Graphs, Recursion, DFS, BFS)\n2. Database Management Systems (SQL, Normalization, ACID Properties)\n3. Web Development (Next.js, TailwindCSS, State Management, APIs)\n\nStudy Circle Rules:\n- Schedule dynamic focus logs daily.\n- Participate in peer reviews during live audio study rooms.\n- Verify doubt statuses with allocated mentors.`;
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'syllabus_reference_notes.txt';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 bg-[#7C4DFF] hover:bg-[#6C3DFF] text-white text-[10px] font-bold rounded-lg transition-all border-none cursor-pointer"
                    >
                      Download &darr;
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#090B14]/40 border-t border-[rgba(255,255,255,0.08)] flex justify-end">
              <button 
                onClick={() => setShowResourcesModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition-all border-none cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 🎖️ Gamification: Completed Mission Alert Popup */}
      {completedMissionAlert && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[9999] max-w-sm w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#0B0F19] border-2 border-emerald-500/35 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 backdrop-blur-md">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 animate-bounce">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">🎉 Mission Completed!</span>
              <h4 className="text-xs font-black text-white truncate mt-0.5">{completedMissionAlert.text}</h4>
              <p className="text-[9px] text-zinc-400 font-bold mt-0.5">You earned <span className="text-indigo-400 font-extrabold font-mono">+{completedMissionAlert.xp} XP</span> towards your goal!</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return <DashboardComponent bypassRedirect={false} />;
}
