'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ToastProvider';
import { practiceQuestionsPool } from './practiceData';
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
  Unlock
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
  | 'resources';

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

  // AI Tutor Chat State
  const [showAiTutorChat, setShowAiTutorChat] = useState(false);
  const [aiTutorInput, setAiTutorInput] = useState('');
  const [aiTutorMessages, setAiTutorMessages] = useState<Array<{ sender: 'user' | 'tutor', text: string }>>([
    { sender: 'tutor', text: "Hello! I am your StudyCircle AI Academic Tutor. 🎓 I can explain complex subjects like DBMS or Operating Systems, outline custom study plans, or help you understand how to navigate the platform. What are you studying today?" }
  ]);
  const [isAiTutorTyping, setIsAiTutorTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiTutorMessages, isAiTutorTyping]);

  const handleSendAiTutorMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg = { sender: 'user' as const, text };
    setAiTutorMessages(prev => [...prev, userMsg]);
    setAiTutorInput('');
    setIsAiTutorTyping(true);
    
    try {
      const data = await apiRequest('/ai-tutor', {
        method: 'POST',
        body: JSON.stringify({ text })
      });

      if (data && data.response) {
        setAiTutorMessages(prev => [...prev, { sender: 'tutor' as const, text: data.response }]);
      } else {
        throw new Error(data?.error || 'Invalid response from AI Tutor.');
      }
    } catch (err: any) {
      console.error("AI Tutor response error:", err);
      setAiTutorMessages(prev => [...prev, { 
        sender: 'tutor' as const, 
        text: `⚠️ **AI Chat Error**: ${err.message || 'The AI Tutor is currently busy. Please try again in a few moments!'}` 
      }]);
    } finally {
      setIsAiTutorTyping(false);
    }
  };

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

  // Navigation tab state matching sidebar clicks
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

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
        setPracticeQuizFeedback('correct');
        setPracticeQuizErrorMessage(null);
        setPracticeSessionScore(prev => prev + 1);
        completeMission('quiz');
      } catch (err: any) {
        setPracticeQuizErrorMessage('❌ Error saving practice progress: ' + (err.message || err));
      }
    } else {
      setPracticeQuizFeedback('wrong');
      setPracticeQuizErrorMessage('❌ Wrong answer! Re-check the logic and try again.');
    }
  };

  const handleNextQuestion = () => {
    setPracticeQuizAnswer(null);
    setPracticeQuizFeedback(null);
    setPracticeQuizErrorMessage(null);
    
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
    if (activeTab === 'leaderboard') {
      fetchGlobalLeaderboards();
    }
  }, [activeTab]);

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
      setActiveTab('groups');
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
      setActiveTab('groups');
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

  if (globalLoading || (loading && user)) {
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
      const studentLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'rooms', label: 'Study Rooms', icon: Wifi },
        { id: 'groups', label: 'Workspaces', icon: GraduationCap },
        { id: 'notes', label: 'Notes', icon: FileText },
        { id: 'doubts', label: 'Doubts', icon: HelpCircle },
        { id: 'sessions', label: 'Schedule', icon: Calendar },
        { id: 'progress', label: 'Progress', icon: TrendingUp },
        { id: 'leaderboard', label: 'Leaderboard', icon: Award },
        { id: 'messages', label: 'Community Hub', icon: Users },
        { id: 'resources', label: 'Resources', icon: BookOpen },
        { id: 'settings', label: 'Settings', icon: Settings }
      ];
      
      return (
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-left">
          {studentLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            const activeStyles = 'bg-[#10B981]/10 text-[#10B981] border-l-4 border-[#10B981] shadow-sm';
            return (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === 'doubts') {
                    setActiveTab('discussions');
                  } else {
                    setActiveTab(link.id as TabType);
                  }
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-[11px] font-bold flex items-center gap-3 transition-all cursor-pointer text-left ${
                  isActive || (link.id === 'doubts' && activeTab === 'discussions')
                    ? activeStyles 
                    : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" /> {link.label}
              </button>
            );
          })}
        </nav>
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

  // ==========================================
  // STUDENT DASHBOARD ("MY LEARNING SPACE")
  // ==========================================
  const renderStudentDashboard = () => {
    // Dynamic Daily Missions checklist calculations
    const completedMissionsCount = dailyMissions.filter(m => m.completed).length;
    const progressPercent = dailyMissions.length > 0 ? Math.round((completedMissionsCount / dailyMissions.length) * 100) : 0;
    
    // Circle dash stroke calculations
    const r = 26;
    const circ = 2 * Math.PI * r; // ~163.36
    const offset = circ - (progressPercent / 100) * circ;

    return (
      <div className="space-y-6 text-white">
        {/* Top Header details */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              My Learning Space 🎓
            </h1>
            <p className="text-xs text-slate-400 mt-1">Focus on what matters. Track your streaks and coordinate sessions.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#0B0F19] px-3.5 py-2 border border-white/5 rounded-xl shadow-md">
            <Calendar className="h-4 w-4 text-[#10B981]" />
            <span className="text-[11px] font-extrabold text-slate-300">{formattedDate}</span>
          </div>
        </div>

        {/* 3-Column main student view */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Main Left/Center column span 8 */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="bg-[#0B0F19] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 shadow-lg text-left">
                <div className="h-9 w-9 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wide block truncate">Joined Rooms</span>
                  <div className="text-base font-black text-white leading-tight mt-0.5">{myGroups.length}</div>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">+0 this week</span>
                </div>
              </div>

              <div className="bg-[#0B0F19] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 shadow-lg text-left">
                <div className="h-9 w-9 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-455 font-extrabold uppercase tracking-wide block truncate">Shared Notes</span>
                  <div className="text-base font-black text-white leading-tight mt-0.5">
                    {notesList.filter(n => n.publishedBy === user?.username).length}
                  </div>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">+0 this week</span>
                </div>
              </div>

              <div className="bg-[#0B0F19] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 shadow-lg text-left">
                <div className="h-9 w-9 rounded-xl bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center shrink-0">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wide block truncate">Solved Doubts</span>
                  <div className="text-base font-black text-white leading-tight mt-0.5">0</div>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">+0 this week</span>
                </div>
              </div>

              <div className="bg-[#0B0F19] border border-white/5 rounded-[20px] p-4 flex items-center gap-3 shadow-lg text-left">
                <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                  <Flame className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wide block truncate">Study Streak</span>
                  <div className="text-base font-black text-white leading-tight mt-0.5">{stats.streakCount} Days</div>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">Keep desking!</span>
                </div>
              </div>
            </div>
            
            {/* Row 1: Hero Card / Focus Session split */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hero & Goals checklist card */}
              <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1F3A35] border border-white/10 rounded-[24px] shadow-lg p-6 flex flex-col justify-between text-left relative overflow-hidden group text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-black text-white leading-tight">{getGreeting()} 👋</h2>
                    <p className="text-[10px] text-zinc-450 font-extrabold tracking-wide uppercase mt-1">🎯 Daily Mission</p>
                  </div>
                  {/* Overall progress ring */}
                  <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="26" 
                        stroke="#5227EB" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={circ} 
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-white">{progressPercent}%</span>
                  </div>
                </div>

                {/* Daily Missions Checklist */}
                <div className="space-y-2 mt-4 flex-1">
                  {dailyMissions.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-955/40 rounded-xl border border-white/5 hover:border-white/10 transition-all text-left">
                      <div className={`h-4 w-4 rounded border flex items-center justify-center ${m.completed ? 'bg-emerald-500/25 border-emerald-500 text-emerald-400' : 'border-slate-650 text-transparent'}`}>
                        {m.completed && '✓'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[11px] font-black block truncate ${m.completed ? 'line-through text-zinc-550' : 'text-slate-205 font-bold'}`}>
                          {m.text}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-indigo-400 font-mono">+{m.xp} XP</span>
                    </div>
                  ))}
                </div>

                {progressPercent === 100 && !claimedDailyReward && (
                  <button
                    onClick={handleClaimDailyReward}
                    className="w-full mt-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all cursor-pointer border-none"
                  >
                    Claim +100 XP & 20 Coins!
                  </button>
                )}
                {progressPercent === 100 && claimedDailyReward && (
                  <div className="w-full mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-xl text-center">
                    ✓ Missions Claimed
                  </div>
                )}

                {/* Track Progress & Continue Learning */}
                {user?.learningGoal && (
                  <div className="mt-4 pt-3 border-t border-white/10 shrink-0 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-extrabold text-slate-350">{user.learningGoal} Path</span>
                      <span className="font-black text-indigo-400">80% Complete</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="h-2 bg-slate-950/80 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: '80%' }} />
                    </div>
                    <button
                      onClick={() => {
                        const targetSlug = user.learningGoal === 'Become Full Stack Developer' ? 'web-development' :
                                           user.learningGoal === 'Prepare for GATE' ? 'gate' :
                                           user.learningGoal === 'Improve Aptitude' ? 'aptitude' :
                                           user.learningGoal === 'Learn DSA' ? 'programming-dsa' : 'programming-dsa';
                        router.push(`/workspace/${targetSlug}`);
                      }}
                      className="w-full mt-1.5 py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-colors flex items-center justify-center gap-1 cursor-pointer border-none"
                    >
                      Continue Learning →
                    </button>
                  </div>
                )}
              </div>

              {/* Study Timer Stopwatch Widget */}
              <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#134E4A] border border-white/10 rounded-[24px] shadow-lg p-6 flex flex-col justify-between text-center relative overflow-hidden group text-white">
                <div className="text-left">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Study Timer</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-2 w-2 rounded-full ${timerActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-650'}`} />
                    <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wide">
                      {timerActive ? 'Focus Session Running' : 'Focus Timer Ready'}
                    </span>
                  </div>
                </div>

                <div className="py-6 flex items-center justify-center">
                  <span className="font-mono text-4xl font-black tracking-widest text-teal-400 bg-slate-955 px-5 py-3 rounded-2xl border border-white/10 shadow-inner">
                    {formatSeconds(timerSeconds)}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 pt-3 border-t border-white/10">
                  {timerActive ? (
                    <button 
                      type="button"
                      onClick={() => setTimerActive(false)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setTimerActive(true)}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" /> Start Focus
                    </button>
                  )}
                  
                  <button 
                    type="button"
                    onClick={handleSaveTimerSession}
                    disabled={timerSeconds === 0}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-zinc-300 rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Square className="h-3.5 w-3.5" /> Stop & Log
                  </button>
                </div>
              </div>

            </div>

            {/* Row 2: Live study rooms */}
            <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#134E4A] border border-white/10 rounded-[24px] shadow-lg p-6 text-left text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Wifi className="h-4.5 w-4.5 text-teal-400" /> Live Study Rooms
                  </h3>
                  <p className="text-[10px] text-zinc-300 font-semibold mt-0.5">🔥 12 students studying right now</p>
                </div>
                <button onClick={() => setActiveTab('rooms')} className="text-[10px] font-black text-teal-400 hover:text-teal-300 hover:underline cursor-pointer">
                  View Lounges
                </button>
              </div>

              {/* Rooms grid */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { name: 'DBMS Room', active: 5, topic: 'Schema designs & unit 3 doubts' },
                  { name: 'OS Room', active: 4, topic: 'Semaphore problems practice' },
                  { name: 'Java Room', active: 3, topic: 'Interface inheritance details' }
                ].map((room, idx) => (
                  <div key={idx} className="p-4 bg-slate-955/50 border border-white/5 rounded-2xl hover:border-teal-500/25 transition-all flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-white">{room.name}</span>
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-955/50 px-1.5 py-0.5 rounded border border-emerald-500/20 animate-pulse">
                          ● {room.active} live
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-1.5 leading-tight">{room.topic}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setActiveRoom(room.name);
                        setRoomSeconds(0);
                        completeMission('attend_session');
                        handleAwardCredits('join_session');
                      }}
                      className="w-full py-1.5 bg-teal-650 hover:bg-teal-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Video className="h-3 w-3" /> Join Lounge
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: Upcoming sessions */}
            <div className="bg-gradient-to-br from-[#1E293B] via-[#134E4A]/50 to-[#0F172A] border border-white/10 rounded-[24px] shadow-lg p-6 text-left text-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Upcoming Live Sessions</h3>
                <button onClick={() => setActiveTab('sessions')} className="text-[10px] font-black text-teal-400 hover:text-teal-300 hover:underline cursor-pointer">
                  All Schedules
                </button>
              </div>

              <div className="space-y-2.5">
                {mockSessions.slice(0, 3).map((sess) => (
                  <div key={sess.id} className="p-3 bg-slate-955/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-300 shrink-0 font-bold text-xs uppercase">
                        {sess.subject.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-white truncate">{sess.title}</h4>
                        <p className="text-[9px] text-zinc-400 font-bold mt-0.5">{sess.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wide shrink-0 ${sess.status === 'Live Now' ? 'bg-emerald-955/50 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-zinc-400 border border-white/5'}`}>
                      {sess.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Right Column span 4 */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* User Profile Card */}
            <div className="p-5 bg-gradient-to-b from-[#0B0F19] to-[#0d1629] border border-white/5 rounded-[24px] text-center text-white flex flex-col justify-center items-center gap-3 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-full blur-xl pointer-events-none" />
              <div className={`h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-white shadow-inner relative overflow-hidden transition-all ${avatarRingClass}`}>
                <img src={user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender)} className="absolute inset-0 h-full w-full object-cover" alt="Avatar" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-black truncate max-w-[150px]">{user?.fullName || 'User'}</h3>
                {user?.bio ? (
                  <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wide mt-0.5">🎖️ {user.bio}</p>
                ) : (
                  <p className="text-[9px] text-[#10B981] font-bold capitalize mt-0.5">{user?.role === 'mentor' ? 'Mentor' : user?.role === 'admin' ? 'Admin' : 'B.Tech Student'}</p>
                )}
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] rounded-full text-[9px] font-bold tracking-wide">
                Level {Math.max(1, Math.floor(stats.totalStudyHours / 15) + 1)} ⭐️
              </span>
              <Link 
                href="/profile"
                className="mt-1 px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-xl text-[9px] font-extrabold transition-all cursor-pointer flex items-center gap-1 border border-white/5"
              >
                <Settings className="h-3 w-3 text-[#10B981]" /> Edit Profile
              </Link>
            </div>

            {/* Overall Content Progress Circle Card */}
            <div className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-white/10 rounded-[24px] shadow-lg text-left text-white">
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-3">Overall Progress</h3>
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="46" 
                      stroke="#10B981" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="289.02" 
                      strokeDashoffset={289.02 - (289.02 * (Math.min(stats.totalStudyHours, 20) / 20))}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-base font-black text-white leading-none">
                      {Math.round((Math.min(stats.totalStudyHours, 20) / 20) * 100)}%
                    </span>
                    <span className="text-[7px] text-zinc-450 font-black uppercase tracking-wide block mt-0.5">Weekly Goal</span>
                  </div>
                </div>
                <div className="text-center mt-3 space-y-1">
                  <p className="text-[10px] font-extrabold text-zinc-200">
                    {stats.totalStudyHours.toFixed(1)} / 20.0 Hours Completed
                  </p>
                  <p className="text-[8px] text-zinc-500 font-bold">
                    Targeting B.Tech placement readiness logs
                  </p>
                </div>
              </div>
            </div>

            {/* Streak card */}
            <div className="p-5 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#0B0F19] border border-white/10 rounded-[24px] shadow-lg text-left text-white">
              <div className="flex items-center gap-1.5 mb-3">
                <Flame className="h-4.5 w-4.5 text-orange-500 fill-orange-500/10" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Consistency Streak</h3>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-950/25 border border-orange-500/20 rounded-2xl">
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Flame className="h-4.5 w-4.5 fill-orange-500/20" />
                </div>
                <div>
                  <div className="text-sm font-black text-orange-400">{stats.streakCount} Days active</div>
                  <p className="text-[8px] text-zinc-450 font-bold">You are in the top 5% of your cluster!</p>
                </div>
              </div>
            </div>

            {/* Calendar Card */}
            <div className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-white/10 rounded-[24px] shadow-lg text-left text-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">June 2026</h3>
                <span className="text-[9px] font-black text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 uppercase">Cohort Calendar</span>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d} className="text-zinc-500 font-black">{d}</span>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold">
                <span />
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const isToday = new Date().getDate() === day && new Date().getMonth() === 5;
                  const isSelected = day === selectedCalendarDate;
                  return (
                    <button 
                      key={day} 
                      type="button"
                      onClick={() => setSelectedCalendarDate(day)}
                      className={`py-1 rounded-md transition-all border-none font-bold text-[9px] cursor-pointer ${
                        isToday 
                          ? 'bg-[#10B981] text-white font-black shadow-lg shadow-[#10B981]/25 scale-105' 
                          : isSelected
                            ? 'bg-indigo-600/40 text-white font-black border border-indigo-500/30'
                            : 'text-zinc-300 hover:bg-white/5 bg-transparent'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Sessions for Selected Calendar Date */}
            <div className="p-5 bg-gradient-to-br from-[#0F172A] to-[#0B0F19] border border-white/10 rounded-[24px] shadow-lg text-left text-white space-y-3.5">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  Agenda: June {selectedCalendarDate}, 2026
                </h4>
                <span className="text-[8px] font-black text-zinc-400">
                  {selectedCalendarDate === new Date().getDate() ? 'Today' : selectedCalendarDate === new Date().getDate() + 1 ? 'Tomorrow' : 'Scheduled'}
                </span>
              </div>
              
              <div className="space-y-2">
                {getCalendarSessions(selectedCalendarDate).length === 0 ? (
                  <p className="text-[9px] text-zinc-500 italic">No study sessions scheduled for this date.</p>
                ) : (
                  getCalendarSessions(selectedCalendarDate).map((sess) => (
                    <div key={sess.id} className="p-2.5 bg-slate-900/50 border border-white/5 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-black text-white block leading-snug">{sess.title}</span>
                        <span className="text-[8px] text-zinc-400 font-mono block mt-0.5">{sess.time}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[7px] font-bold rounded uppercase ${
                        sess.status === 'Live Now' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {sess.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>


            {/* Notes Quick Widget */}
            <div className="p-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-white/10 rounded-[24px] shadow-lg text-left text-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">My Study Notes</h3>
                <button onClick={() => setActiveTab('notes')} className="text-[8px] font-black text-[#10B981] hover:text-[#10B981] uppercase cursor-pointer">
                  All Notes
                </button>
              </div>

              <div className="space-y-2">
                {notesList.slice(0, 3).map((note) => (
                  <div key={note.id} className="p-2 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-[10px] font-extrabold text-zinc-250 truncate leading-tight">{note.name}</h4>
                        <span className="text-[8px] text-zinc-500 font-semibold">{note.size}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleToggleNoteBookmark(note.id)} 
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${note.type === 'bookmark' ? 'bg-[#10B981]/10 border-[#10B981]/25 text-[#10B981]' : 'bg-slate-900 border-white/10 text-zinc-400 hover:text-white'}`}
                      >
                        <Bookmark className="h-3 w-3 fill-current" />
                      </button>
                      <button 
                        onClick={() => handleDownloadNote(note.id, note.name)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${note.downloaded ? 'bg-[#10B981]/10 border-[#10B981]/25 text-[#10B981]' : 'bg-slate-900 border-white/10 text-zinc-400 hover:text-white'}`}
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
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
              placeholder="Search groups, notes, sessions..." 
              className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] border border-white/5 rounded-xl text-xs outline-none focus:border-[#10B981]/50 focus:bg-[#0B0F19]/90 transition-all text-white placeholder-slate-500 font-medium font-sans"
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
                      filteredNotifications.map(notif => (
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
                            <span className="text-[8px] text-zinc-555 font-mono block">{new Date(notif.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
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
          
          {/* Tab 1: Dashboard Routing */}
          {activeTab === 'dashboard' && (
            user?.role === 'student' ? renderStudentDashboard() :
            user?.role === 'mentor' ? renderMentorDashboard() :
            user?.role === 'admin' ? renderAdminDashboard() : null
          )}

          {/* Tab 2: Groups */}
          {activeTab === 'groups' && (
            <div className="space-y-6 text-left text-white animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-[#5227EB]" /> Study Circles Workspace
                </h3>
                {(user?.role === 'admin' || user?.role === 'mentor') && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-[#818CF8] rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> Initialize Circle
                  </button>
                )}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {myGroups.length === 0 ? (
                    <div className="p-12 bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-[24px] text-center space-y-3 shadow-md">
                      <Users className="h-8 w-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">No workspaces joined.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {myGroups.map((group) => (
                        <div key={group.id} className="p-5 bg-[#0B0F19]/60 border border-white/5 hover:border-indigo-500/30 backdrop-blur-md rounded-[24px] transition-all duration-300 flex flex-col justify-between gap-4 shadow-lg group text-left">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded">
                                {group.subject || 'Engineering'}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500 font-bold">Code: {group.inviteCode}</span>
                            </div>
                            <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{group.name}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{group.description || 'No description provided.'}</p>
                          </div>
                          <Link
                            href={`/workspace/${getSlugByGroup(group)}`}
                            className="w-full py-2.5 bg-slate-900/60 border border-white/10 hover:border-[#5227EB] hover:bg-[#5227EB] hover:text-white text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all text-center"
                          >
                            Enter Workspace <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="p-6 bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-[24px] space-y-4 shadow-lg text-left">
                    <h3 className="text-xs font-black uppercase tracking-wider text-white font-sans">Join a New Group</h3>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Enter an invite code provided by your mentor or classmate to join their group study circle.</p>
                    <form onSubmit={handleJoinCircle} className="space-y-3">
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Invite Code"
                        className="w-full px-3 py-2.5 bg-slate-950/80 border border-white/10 focus:border-indigo-500 rounded-xl text-xs outline-none text-center font-mono tracking-widest text-white placeholder-slate-600"
                      />
                      <button type="submit" className="w-full py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer border-none uppercase tracking-wide">
                        Submit Code
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Rooms */}
          {activeTab === 'rooms' && (
            <div className="space-y-6 text-left animate-in fade-in duration-350 text-white">
              {/* Header and Toggle */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Wifi className="h-4.5 w-4.5 text-indigo-400 animate-pulse" /> Live Study Worlds Board
                </h3>
                {/* Premium view mode selector */}
                {stats.totalStudyHours > 0 && (
                  <div className="bg-[#1E293B]/60 border border-white/5 p-1 rounded-xl flex items-center gap-1">
                    <button
                      onClick={() => setRoomViewMode('first-time')}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer border-none ${
                        roomViewMode === 'first-time'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-transparent text-slate-455 hover:text-slate-200'
                      }`}
                    >
                      First-Time View
                    </button>
                    <button
                      onClick={() => setRoomViewMode('returning')}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer border-none ${
                        roomViewMode === 'returning'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-transparent text-slate-455 hover:text-slate-200'
                      }`}
                    >
                      Returning View
                    </button>
                  </div>
                )}
              </div>

              {/* ──────────────────────────────────────────────────────── */}
              {/* 1. FIRST-TIME USER VIEW                                 */}
              {/* ──────────────────────────────────────────────────────── */}
              {roomViewMode === 'first-time' && (
                <div className="space-y-12 animate-in fade-in duration-300">
                  {/* Hero Section */}
                  <div className="relative rounded-[28px] overflow-hidden p-8 md:p-12 text-center bg-gradient-to-br from-[#0b1224] via-[#070b16] to-[#120b24] border border-white/5 shadow-2xl">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative max-w-2xl mx-auto space-y-6">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                        🚀 Welcome to StudyCircle
                      </span>
                      
                      <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                        Welcome to StudyCircle
                      </h1>
                      
                      <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-semibold max-w-lg mx-auto">
                        Find your study community and start learning with students who share your goals.
                      </p>
                      
                      {/* Hero CTAs */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <button
                          onClick={() => {
                            router.push('/workspace/programming-dsa');
                          }}
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-650/15 cursor-pointer border-none uppercase tracking-wider active:scale-[0.98]"
                        >
                          Join Your First Study Room
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Choose Your Interest Section */}
                  <div className="space-y-6">
                    <div className="text-center md:text-left space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Choose Your Interest</h3>
                      <p className="text-[10px] text-slate-500 font-bold">Select a topic below to instantly customize your recommended study spaces.</p>
                    </div>
                    
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
                            className={`p-5 rounded-[22px] border text-left transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-[0.98] flex flex-col justify-between h-28 group ${
                              isSelected
                                ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
                                : 'bg-[#0B0F19]/60 backdrop-blur-md border-white/5 text-slate-400 hover:bg-[#121829]/85 hover:border-white/15 hover:text-white'
                            }`}
                          >
                            <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-[22px] pointer-events-none" />
                            <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]">{interest.icon}</span>
                            <span className="text-[11px] font-black tracking-wide">{interest.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Practice & Solver Panel */}
                  {selectedInterest && (
                    <div id="practice-playground-section" className="relative rounded-[28px] overflow-hidden p-6 md:p-8 bg-gradient-to-br from-[#0B0F19]/90 via-[#070b16]/98 to-[#150D2A]/90 border border-white/5 shadow-2xl space-y-6">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                      {questionsCountLimit === null ? (
                        /* Choose Limit Selector */
                        <div className="text-center py-6 space-y-5 animate-in fade-in duration-300">
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest">
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
                                  // Shuffle pool and select N questions
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
                      ) : practiceSessionCompleted ? (
                        /* Summary Screen */
                        <div className="text-center py-6 space-y-5 animate-in scale-in duration-300">
                          <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-xl filter drop-shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                            🏆
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-extrabold text-white">Practice Session Completed!</h4>
                            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                              You solved <span className="text-emerald-400 font-extrabold">{practiceSessionScore}</span> out of <span className="text-white font-bold">{questionsCountLimit}</span> questions correctly in <strong className="text-indigo-400">{selectedInterest}</strong>.
                            </p>
                          </div>
                          <div className="pt-2">
                            <button
                              onClick={handleRestartPracticeSession}
                              className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl border-none uppercase tracking-widest cursor-pointer shadow-md shadow-indigo-650/15 active:scale-[0.98] transition-all"
                            >
                              Restart Session
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Active Question Display */
                        <div className="space-y-6 animate-in fade-in duration-200">
                          {/* Header block with question index and score */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                ⚡ Question {activeQuestionIndex + 1} of {questionsCountLimit}
                              </span>
                              <h4 className="text-xs font-extrabold text-white mt-1.5">
                                {practiceSessionQuestions[activeQuestionIndex]?.title}
                              </h4>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400">
                              Score: <span className="text-emerald-400 font-black">{practiceSessionScore}</span> / {questionsCountLimit}
                            </div>
                          </div>

                          <div className="space-y-4 text-left">
                            <p className="text-xs text-slate-300 font-semibold leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 border border-white/5 rounded-xl">
                              {practiceSessionQuestions[activeQuestionIndex]?.question}
                            </p>

                            <div className="grid gap-3 pt-2">
                              {practiceSessionQuestions[activeQuestionIndex]?.options?.map((option: any, idx: number) => {
                                const isCorrect = idx === practiceSessionQuestions[activeQuestionIndex]?.correctOptionIndex;
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

                              {/* Errors & validations displayed below the options only */}
                              {practiceQuizErrorMessage && (
                                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
                                  {practiceQuizErrorMessage}
                                </div>
                              )}

                              {practiceQuizFeedback === 'correct' && (
                                <div className="mt-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl space-y-2 text-xs font-semibold leading-relaxed animate-in slide-in-from-bottom-2 duration-300">
                                  <p className="font-extrabold text-white">🎉 Correct Answer!</p>
                                  <p className="font-extrabold text-slate-350">💡 Explanation:</p>
                                  <p className="text-slate-300">{practiceSessionQuestions[activeQuestionIndex]?.explanation}</p>
                                </div>
                              )}

                              {/* Controls */}
                              <div className="pt-2 flex gap-3 justify-start">
                                {practiceQuizFeedback === null ? (
                                  <button
                                    onClick={handleVerifyQuizAnswer}
                                    className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl border-none uppercase tracking-widest cursor-pointer shadow-md shadow-indigo-650/10 active:scale-[0.98] transition-all"
                                  >
                                    Verify Answer
                                  </button>
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
                      )}
                    </div>
                  )}

                  {/* Recommended Study Rooms */}
                  <div className="space-y-6" id="explore-rooms-section">
                    <div className="text-center md:text-left space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Recommended Study Rooms</h3>
                      <p className="text-[10px] text-slate-500 font-bold">Hop directly into one of our high-activity beginner workspaces.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        {
                          id: 'coding-room',
                          title: '🚀 Coding Room',
                          desc: 'Perfect for beginners',
                          learners: 120,
                          color: 'from-blue-600/10 to-indigo-600/10 border-blue-500/20',
                          illustration: (
                            <div className="w-full h-24 rounded-xl bg-slate-950/80 border border-white/10 p-3 font-mono text-[8px] overflow-hidden flex flex-col gap-1.5 shadow-inner">
                              <div className="flex gap-1 mb-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </div>
                              <div className="flex items-center gap-1 text-[#818CF8]"><span className="text-[#34D399]">&gt;</span> npm run study</div>
                              <div className="h-1.5 w-3/4 rounded bg-slate-800 animate-pulse mt-0.5" />
                              <div className="h-1.5 w-1/2 rounded bg-indigo-500/30" />
                              <div className="h-1.5 w-5/6 rounded bg-slate-800" />
                            </div>
                          )
                        },
                        {
                          id: 'dsa-room',
                          title: '🧠 DSA Room',
                          desc: 'Practice coding and problem solving',
                          learners: 95,
                          color: 'from-purple-600/10 to-pink-600/10 border-purple-500/20',
                          illustration: (
                            <div className="w-full h-24 rounded-xl bg-slate-950/80 border border-white/10 relative overflow-hidden shadow-inner flex items-center justify-center">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_100%)]" />
                              <svg className="w-full h-full p-2 opacity-80" viewBox="0 0 120 60">
                                <line x1="20" y1="30" x2="50" y2="15" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                                <line x1="20" y1="30" x2="50" y2="45" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                                <line x1="50" y1="15" x2="90" y2="15" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                                <line x1="50" y1="45" x2="90" y2="45" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                                <line x1="90" y1="15" x2="110" y2="30" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                                <line x1="90" y1="45" x2="110" y2="30" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                                
                                <circle cx="20" cy="30" r="4.5" fill="#6366F1" />
                                <circle cx="50" cy="15" r="4.5" fill="#3B82F6" />
                                <circle cx="50" cy="45" r="4.5" fill="#10B981" />
                                <circle cx="90" cy="15" r="4.5" fill="#8B5CF6" />
                                <circle cx="90" cy="45" r="4.5" fill="#EC4899" />
                                <circle cx="110" cy="30" r="4.5" fill="#14B8A6" />
                              </svg>
                            </div>
                          )
                        },
                        {
                          id: 'ai-room',
                          title: '🤖 AI Room',
                          desc: 'Explore AI concepts and projects',
                          learners: 80,
                          color: 'from-emerald-600/10 to-teal-600/10 border-emerald-500/20',
                          illustration: (
                            <div className="w-full h-24 rounded-xl bg-slate-950/80 border border-white/10 relative overflow-hidden shadow-inner flex items-center justify-center">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.15)_0,transparent_100%)]" />
                              <svg className="w-full h-full p-2 opacity-80" viewBox="0 0 120 60">
                                <line x1="15" y1="15" x2="45" y2="15" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="15" y1="15" x2="45" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="15" y1="15" x2="45" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="15" y1="30" x2="45" y2="15" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="15" y1="30" x2="45" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="15" y1="30" x2="45" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="15" y1="45" x2="45" y2="15" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="15" y1="45" x2="45" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="15" y1="45" x2="45" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                
                                <line x1="45" y1="15" x2="75" y2="15" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="45" y1="15" x2="75" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="45" y1="30" x2="75" y2="15" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="45" y1="30" x2="75" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="45" y1="45" x2="75" y2="15" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="45" y1="45" x2="75" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                
                                <line x1="75" y1="15" x2="105" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                <line x1="75" y1="45" x2="105" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                
                                <circle cx="15" cy="15" r="3.5" fill="#A78BFA" />
                                <circle cx="15" cy="30" r="3.5" fill="#A78BFA" />
                                <circle cx="15" cy="45" r="3.5" fill="#A78BFA" />
                                
                                <circle cx="45" cy="15" r="3.5" fill="#F472B6" />
                                <circle cx="45" cy="30" r="3.5" fill="#F472B6" />
                                <circle cx="45" cy="45" r="3.5" fill="#F472B6" />
                                
                                <circle cx="75" cy="15" r="3.5" fill="#FB7185" />
                                <circle cx="75" cy="45" r="3.5" fill="#FB7185" />
                                
                                <circle cx="105" cy="30" r="5" fill="#F43F5E" className="animate-pulse" />
                              </svg>
                            </div>
                          )
                        }
                      ].map((room) => (
                        <div 
                          key={room.id}
                          className={`bg-gradient-to-br ${room.color} border rounded-[24px] p-6 shadow-lg flex flex-col justify-between gap-5 transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/30 text-left relative overflow-hidden`}
                        >
                          <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                              </span>
                            </div>
                            
                            {/* SVG Illustration Container */}
                            {room.illustration}

                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-white">{room.title}</h4>
                              <p className="text-[10px] text-slate-450 font-bold leading-normal">{room.desc}</p>
                            </div>
                            
                            {/* Member Avatars simulation */}
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /> Active Co-Study Space
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-white/5 mt-1 relative z-10">
                            <button
                              onClick={() => {
                                const slug = room.id === 'ai-room' ? 'ai-ml' : 'programming-dsa';
                                router.push(`/workspace/${slug}`);
                              }}
                              className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[10px] font-black rounded-xl transition-all cursor-pointer border-none uppercase tracking-widest shadow-md shadow-indigo-650/15 active:scale-[0.98]"
                            >
                              Start Learning
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Beginner Journey Section */}
                  <div className="space-y-6">
                    <div className="text-center md:text-left space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-350">Beginner Journey</h3>
                      <p className="text-[10px] text-slate-500 font-bold">Follow this roadmap to unlock the full potential of StudyCircle.</p>
                    </div>

                    <div className="relative p-8 bg-slate-900/20 border border-white/5 rounded-[28px] overflow-hidden backdrop-blur-md">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 relative z-10 text-center sm:text-left">
                        {[
                          { 
                            step: 1, 
                            title: 'Join Your First Study Room', 
                            desc: 'Find a community and claim your focus desk.',
                            onClick: () => {
                              document.getElementById('explore-rooms-section')?.scrollIntoView({ behavior: 'smooth' });
                              showToast('Scroll down to recommended study rooms below!', 'info');
                            }
                          },
                          { 
                            step: 2, 
                            title: 'Attend One Study Session', 
                            desc: 'Study quietly or chat with your peers.',
                            onClick: () => {
                              setActiveTab('sessions');
                              showToast('Redirected to the Sessions & Schedule tab.', 'success');
                            }
                          },
                          { 
                            step: 3, 
                            title: 'Unlock Resources', 
                            desc: 'Gain access to notes, cheat sheets, and guidelines.',
                            onClick: () => {
                              setActiveTab('resources');
                              showToast('Redirected to the Resources & Cheatsheets tab.', 'success');
                            }
                          },
                          { 
                            step: 4, 
                            title: 'Build Your Study Streak', 
                            desc: 'Desk consistently every day to establish habits.',
                            onClick: () => {
                              setActiveTab('progress');
                              showToast('Redirected to the Streak & Progress Analytics tab.', 'success');
                            }
                          }
                        ].map((journey, idx) => (
                          <div 
                            key={journey.step} 
                            onClick={journey.onClick}
                            className="space-y-3 relative p-4 rounded-2xl cursor-pointer hover:bg-white/[0.03] active:scale-[0.98] transition-all group"
                          >
                            {/* Visual connector line between steps (only on desktop) */}
                            {idx < 3 && (
                              <div className="hidden sm:block absolute top-8 left-[75%] right-[-30%] h-0.5 bg-gradient-to-r from-indigo-500/30 to-indigo-500/10 pointer-events-none z-0" />
                            )}
                            <div className="inline-flex h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-400 border border-indigo-500/20 group-hover:border-indigo-400 group-hover:text-white items-center justify-center font-black text-xs relative z-10 shadow-sm transition-all">
                              {journey.step}
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-[11px] font-black text-slate-200 group-hover:text-indigo-400 transition-all">{journey.title}</h4>
                              <p className="text-[9px] text-slate-455 leading-relaxed font-semibold">{journey.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Motivational Banner */}
                  <div className="bg-gradient-to-r from-indigo-500/10 via-[#0a0f1d] to-purple-500/10 border border-indigo-500/25 rounded-[28px] p-8 text-center space-y-5 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative space-y-2">
                      <p className="text-sm font-black text-slate-200">"Every expert was once a beginner."</p>
                    </div>
                    <button
                      onClick={() => {
                        const practiceSection = document.getElementById('practice-playground-section');
                        practiceSection?.scrollIntoView({ behavior: 'smooth' });
                        showToast('Practice interest-based questions directly below Choose Your Interest!', 'info');
                      }}
                      className="relative px-8 py-2.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[10px] font-black rounded-xl transition-all cursor-pointer border-none uppercase tracking-widest shadow-md shadow-indigo-650/20 active:scale-[0.98]"
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────── */}
              {/* 2. RETURNING USER VIEW                                   */}
              {/* ──────────────────────────────────────────────────────── */}
              {roomViewMode === 'returning' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* Hero Section */}
                  <div className="relative rounded-[28px] overflow-hidden p-8 md:p-10 text-left bg-gradient-to-br from-[#060913] via-[#0F172A] to-[#1E1B4B] border border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="grid md:grid-cols-3 gap-6 items-center">
                      <div className="md:col-span-2 space-y-4">
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-wider">
                          Study Worlds Directory
                        </span>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                          Explore Study Worlds
                        </h1>
                        <p className="text-xs text-slate-400 leading-normal font-semibold max-w-lg">
                          Join focused learners, build streaks, unlock achievements, and grow together.
                        </p>
                      </div>
                      
                      {/* Live counters box */}
                      <div className="bg-[#0B0F19]/80 border border-white/5 rounded-2xl p-4.5 space-y-3.5 shadow-sm text-left">
                        <div>
                          <p className="text-base font-black text-white">4,281</p>
                          <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">🟢 Students Studying Now</p>
                        </div>
                        <div>
                          <p className="text-base font-black text-white">183</p>
                          <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">🌐 Active Worlds</p>
                        </div>
                        <div>
                          <p className="text-base font-black text-white">12,450</p>
                          <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">⚡ Hours Focused This Week</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Featured Worlds Grid */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Featured Study Worlds</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Real database circles listed dynamically if they exist */}
                      {availableGroups.length > 0 && (
                        availableGroups.map((g) => (
                          <div 
                            key={g.id}
                            className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/5 hover:border-[#5227EB]/30 rounded-[24px] p-5 shadow-lg flex flex-col justify-between gap-4 transition-all duration-300 hover:scale-[1.01]"
                          >
                            <div className="space-y-3.5 text-left">
                              <div className="flex justify-between items-start">
                                <span className="h-10 w-10 bg-[#0B0F19] border border-white/5 rounded-2xl flex items-center justify-center text-xl shrink-0">
                                  🌐
                                </span>
                                <span className="text-[8px] font-black uppercase bg-[#5227EB]/10 border border-[#5227EB]/10 text-indigo-400 px-2 py-0.5 rounded">
                                  Lvl 12
                                </span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-black text-white">{g.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold leading-normal">{g.description || 'Database study group world.'}</p>
                              </div>
                              
                              <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-2.5 space-y-1 text-[9px] font-black text-slate-400">
                                <div className="flex justify-between">
                                  <span>Invite Code:</span>
                                  <span className="text-[#818CF8]">{g.inviteCode}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-1">
                              <span className="text-[9px] font-extrabold text-slate-400 flex items-center gap-1">
                                🟢 Peer World
                              </span>
                              <button
                                onClick={() => handleJoinPublicCircle(g.id)}
                                className="px-4 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[9px] font-black rounded-xl transition-all cursor-pointer border-none uppercase tracking-wide shadow-md"
                              >
                                Join World
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Mock community rooms to ensure visually complete gaming-inspired experience */}
                      {[
                        {
                          id: 'coding-galaxy',
                          title: '🚀 Coding Galaxy',
                          learners: 1248,
                          level: 23,
                          focusScore: 92,
                          streak: 12,
                          desc: 'Algorithms and systems dev logs.',
                          illustration: '🌌'
                        },
                        {
                          id: 'dsa-arena',
                          title: '🧠 DSA Arena',
                          learners: 850,
                          level: 19,
                          focusScore: 89,
                          streak: 9,
                          desc: 'Competitive coding challenges and battles.',
                          illustration: '🤺'
                        },
                        {
                          id: 'ai-universe',
                          title: '🤖 AI Universe',
                          learners: 620,
                          level: 15,
                          focusScore: 85,
                          streak: 5,
                          desc: 'Machine learning & AI concepts.',
                          illustration: '👾'
                        },
                        {
                          id: 'interview-battleground',
                          title: '⚡ Interview Battleground',
                          learners: 450,
                          level: 12,
                          focusScore: 94,
                          streak: 7,
                          desc: 'Mock interviews and resume reviews.',
                          illustration: '💥'
                        },
                        {
                          id: 'focus-temple',
                          title: '🎯 Focus Temple',
                          learners: 710,
                          level: 8,
                          focusScore: 97,
                          streak: 15,
                          desc: 'Deep work and productivity sessions.',
                          illustration: '⛩️'
                        }
                      ].map((world) => (
                        <div 
                          key={world.id}
                          className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/5 hover:border-[#5227EB]/30 rounded-[24px] p-5 shadow-lg flex flex-col justify-between gap-4 transition-all duration-300 hover:scale-[1.01]"
                        >
                          <div className="space-y-3.5 text-left">
                            <div className="flex justify-between items-start">
                              <span className="h-10 w-10 bg-[#0B0F19] border border-white/5 rounded-2xl flex items-center justify-center text-xl shrink-0">
                                {world.illustration}
                              </span>
                              <span className="text-[8px] font-black uppercase bg-[#5227EB]/10 border border-[#5227EB]/10 text-indigo-400 px-2 py-0.5 rounded">
                                Lvl {world.level}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-white">{world.title}</h4>
                              <p className="text-[10px] text-slate-400 font-bold leading-normal">{world.desc}</p>
                            </div>
                            
                            {/* Stats block */}
                            <div className="bg-[#0B0F19]/60 border border-white/5 rounded-xl p-2.5 space-y-1 text-[9px] font-black text-slate-400">
                              <div className="flex justify-between">
                                <span>Focus Score:</span>
                                <span className="text-emerald-400">{world.focusScore}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Active Streak:</span>
                                <span className="text-orange-500">{world.streak} Days 🔥</span>
                              </div>
                            </div>

                            {/* Avatars simulation */}
                            <div className="flex items-center gap-1 pt-1">
                              <div className="flex -space-x-2.5 overflow-hidden">
                                <img className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-[#0F172A]" src="/swathi-avatar.png" alt="" />
                                <img className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-[#0F172A]" src="/bhagya-avatar.png" alt="" />
                                <img className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-[#0F172A]" src="/rathna-avatar.png" alt="" />
                              </div>
                              <span className="text-[8px] font-bold text-slate-455 ml-1.5">+{world.learners - 3} studying</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-1">
                            <span className="text-[9px] font-extrabold text-slate-400 flex items-center gap-1">
                              🟢 {world.learners} Online
                            </span>
                            <button
                              onClick={() => showToast(`Welcome back to ${world.title}! Entering room...`, "success")}
                              className="px-4 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[9px] font-black rounded-xl transition-all cursor-pointer border-none uppercase tracking-wide shadow-md shadow-indigo-650/10 active:scale-95"
                            >
                              Join World
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Quests, Progress & Live Activity Sidebars */}
                  <div className="grid md:grid-cols-3 gap-6">
                    
                    {/* 1. Daily Quest Panel */}
                    <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-6 space-y-4 text-left">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Daily Quests</h4>
                        <span className="text-[9px] text-[#10B981] font-black uppercase">Active</span>
                      </div>
                      
                      <div className="space-y-2.5">
                        {[
                          { text: 'Study 60 Minutes', comp: true },
                          { text: 'Join 1 Study World', comp: true },
                          { text: 'Complete 3 Tasks', comp: false },
                          { text: 'Help a Student', comp: false }
                        ].map((q, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-[#0B0F19]/40 border border-white/5 rounded-xl">
                            <span className={`text-[10px] font-bold ${q.comp ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{q.text}</span>
                            <span className="text-[8px] font-black">{q.comp ? '✓ Done' : '⏳ Pending'}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] font-black">
                        <span className="text-slate-455">Reward Package:</span>
                        <span className="text-[#10B981]">+100 XP • +50 Coins</span>
                      </div>
                    </div>

                    {/* 2. User Progress Widget */}
                    <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-6 space-y-4 text-left flex flex-col justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Student Progress</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user?.avatarUrl || getAvatarByName(user?.fullName, user?.gender)}
                            className={`h-9 w-9 rounded-full object-cover transition-all ${avatarRingClass}`}
                            alt=""
                          />
                          <div>
                            <h4 className="text-xs font-black text-slate-100">{user?.fullName || 'User'}</h4>
                            <p className="text-[9px] text-slate-455 font-bold">Level {stats.level} Scholar</p>
                          </div>
                        </div>
                        
                        {/* XP Progress */}
                        {(() => {
                          const { min: currentLevelMin, max: nextLevelMin } = getXpRangeForLevel(stats.level || 1);
                          const xpRange = nextLevelMin - currentLevelMin;
                          const progressPercent = xpRange > 0
                            ? Math.min(100, Math.max(0, Math.round(((stats.xp - currentLevelMin) / xpRange) * 100)))
                            : 0;
                          return (
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-black text-slate-455">
                                <span>XP Progress</span>
                                <span>{stats.xp} / {nextLevelMin} XP</span>
                              </div>
                              <div className="w-full bg-[#0B0F19] h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-black mt-2 pt-2 border-t border-white/5 text-slate-300">
                        <div className="p-2 bg-[#0B0F19]/40 rounded-xl">
                          <p className="text-orange-500">{stats.streakCount} Days 🔥</p>
                          <p className="text-[8px] text-slate-500 uppercase mt-0.5">Streak</p>
                        </div>
                        <div className="p-2 bg-[#0B0F19]/40 rounded-xl">
                          <p className="text-amber-500">{stats.focusCoins} 🪙</p>
                          <p className="text-[8px] text-slate-500 uppercase mt-0.5">Coins</p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Live Activity Feed */}
                    <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-6 space-y-4 text-left">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Live Activity Feed</h4>
                      
                      <div className="space-y-2">
                        {[
                          { text: 'Priya completed a 2-hour focus session', time: '2m ago' },
                          { text: 'Rahul unlocked Elite Room access', time: '10m ago' },
                          { text: 'Charan reached a 21-day streak', time: '25m ago' },
                          { text: 'AI Universe reached Level 18', time: '1h ago' }
                        ].map((feed, idx) => (
                          <div key={idx} className="text-[9px] font-semibold text-slate-350 p-2 bg-[#0B0F19]/20 border border-white/5 rounded-xl flex justify-between items-center">
                            <span className="truncate pr-2">⚡ {feed.text}</span>
                            <span className="text-[8px] text-slate-500 shrink-0">{feed.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Study Battle and AI Suggestions */}
                  <div className="grid md:grid-cols-3 gap-6">
                    
                    {/* Study Battle (Competitive gamification) */}
                    <div className="md:col-span-2 bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-6 space-y-4 text-left">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          ⚔️ Study Battle
                        </h4>
                        <span className="text-[8px] text-rose-500 font-black uppercase bg-rose-500/10 px-2 py-0.5 border border-rose-500/10 rounded">LIVE WEEKLY MATCH</span>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] border border-white/5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center text-xs font-black text-white">
                          <span>🚀 Coding Galaxy</span>
                          <span className="text-rose-500">VS</span>
                          <span>🤖 AI Universe</span>
                        </div>
                        
                        {/* Animated Progress Bars for battle */}
                        <div className="space-y-1.5">
                          <div className="w-full bg-[#0B0F19] h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-indigo-500 h-full" style={{ width: '62%' }} />
                            <div className="bg-emerald-500 h-full" style={{ width: '38%' }} />
                          </div>
                          <div className="flex justify-between text-[8px] text-slate-455 font-extrabold">
                            <span>62% Focus Strength</span>
                            <span>38% Focus Strength</span>
                          </div>
                        </div>
                        
                        <p className="text-[9px] text-slate-450 leading-relaxed font-bold text-center">
                          The winning study community gains an exclusive +25% StudyCoin multiplier next week. Log study hours inside these rooms to contribute!
                        </p>
                      </div>
                    </div>

                    {/* AI Smart Suggestions */}
                    <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-6 space-y-4 text-left flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">AI Smart Suggestions</h4>
                        <p className="text-[9px] text-slate-550 font-bold">Based on your recent workspace logs:</p>
                      </div>
                      
                      <div className="space-y-2.5 my-auto">
                        {[
                          { name: '🌐 React Mastery World', code: 'react' },
                          { name: '🧠 DSA Arena', code: 'dsa' },
                          { name: '🏛 System Design Kingdom', code: 'sys' }
                        ].map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => showToast(`Entering suggested room: ${sug.name}`, "info")}
                            className="w-full p-2 bg-[#0B0F19]/40 border border-white/5 hover:border-indigo-500/30 text-left text-[10px] font-black text-slate-350 hover:text-white rounded-xl transition-all flex items-center justify-between cursor-pointer"
                          >
                            <span>✨ {sug.name}</span>
                            <ChevronRight className="h-3 w-3 text-slate-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Locked Worlds & Bottom Stats */}
                  <div className="grid md:grid-cols-2 gap-6">
                    
                    {/* Locked Worlds */}
                    <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-6 space-y-4 text-left">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Locked Premium Realms</h4>
                      <div className="space-y-2.5">
                        {[
                          { id: 'lw1', title: '🔒 Elite Coders Realm', req: 'Requires 50 completed study hours' },
                          { id: 'lw2', title: '🔒 FAANG Prep Kingdom', req: 'Requires Level 15 Scholar' },
                          { id: 'lw3', title: '🔒 Mentor Mastermind Circle', req: 'Requires 30-day consistency streak' }
                        ].map((world) => (
                          <div key={world.id} className="p-3 bg-[#0B0F19]/40 border border-white/5 rounded-xl flex items-center justify-between opacity-75">
                            <span className="text-xs font-black text-slate-300">{world.title}</span>
                            <span className="text-[8px] font-black bg-white/5 text-slate-500 px-2 py-0.5 rounded border border-white/5">
                              {world.req}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Global Statistics */}
                    <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-6 space-y-4 text-left">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Global Focus Stats</h4>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="p-3 bg-[#0B0F19]/50 border border-white/5 rounded-2xl text-left">
                          <p className="text-base font-black text-indigo-400">1,24,560 hr</p>
                          <p className="text-[8px] text-slate-500 font-extrabold uppercase mt-0.5">Total Community Hours</p>
                        </div>
                        <div className="p-3 bg-[#0B0F19]/50 border border-white/5 rounded-2xl text-left">
                          <p className="text-base font-black text-emerald-400">92.4%</p>
                          <p className="text-[8px] text-slate-500 font-extrabold uppercase mt-0.5">Global Focus Score</p>
                        </div>
                        <div className="p-3 bg-[#0B0F19]/50 border border-white/5 rounded-2xl text-left">
                          <p className="text-base font-black text-orange-400">895 Worlds</p>
                          <p className="text-[8px] text-slate-500 font-extrabold uppercase mt-0.5">Resources Unlocked</p>
                        </div>
                        <div className="p-3 bg-[#0B0F19]/50 border border-white/5 rounded-2xl text-left">
                          <p className="text-base font-black text-amber-500">12,500+</p>
                          <p className="text-[8px] text-slate-500 font-extrabold uppercase mt-0.5">Active Learners Today</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
          {activeTab === 'resources' && (
            <div className="space-y-6 text-left animate-in fade-in duration-350 text-white">
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

              {/* Bottom Row - Contributors and community impact */}
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                {/* Top Contributors */}
                <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-5 space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Top Contributors</h4>
                    <button 
                      onClick={() => setActiveTab('leaderboard')}
                      className="text-[9px] font-extrabold text-[#818CF8] hover:text-indigo-300 transition-colors uppercase tracking-wider bg-transparent border-none cursor-pointer"
                    >
                      View Leaderboard
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: 'Rohan', coins: 12450, avatar: '/avatar-rohan.png' },
                      { rank: 2, name: 'Ananya', coins: 9870, avatar: '/avatar-ananya.png' },
                      { rank: 3, name: 'Vikram', coins: 8230, avatar: '/avatar-vikram.png' }
                    ].map((leader) => (
                      <div key={leader.rank} className="flex items-center justify-between p-2.5 bg-[#0B0F19]/60 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                            leader.rank === 1 ? 'bg-amber-500/25 text-amber-400 border border-amber-500/20' :
                            leader.rank === 2 ? 'bg-slate-400/25 text-slate-300 border border-slate-400/20' :
                            'bg-amber-800/25 text-amber-600 border border-amber-800/20'
                          }`}>{leader.rank}</span>
                          <span className="text-xs font-black text-slate-200">{leader.name}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-300 flex items-center gap-1">
                          🪙 {leader.coins.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community impact card */}
                <div className="bg-[#1E293B]/40 border border-white/5 rounded-[24px] p-5 space-y-4 text-left flex flex-col justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Community Impact</h4>
                  <div className="p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1F3A35] border border-white/10 rounded-2xl flex items-center gap-5 my-auto">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-[#5227EB]/20 flex items-center justify-center text-[#818CF8] shrink-0 text-xl font-bold">
                      👥
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-100">1,24,560</p>
                      <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">Minutes Studied Together</p>
                      <span className="text-[9px] text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/10 rounded px-1.5 py-0.5 inline-block mt-1.5">+12% this week</span>
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
                          <div className="w-full h-2 bg-[#161B33] rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-[#5227EB] rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject Performance Benchmarks Card */}
                  <div className="p-6 bg-[#0D1225]/70 border border-[#1E293B]/50 rounded-[24px] space-y-4 shadow-sm flex flex-col justify-between text-left backdrop-blur-md">
                    <div>
                      <h4 className="text-xs font-black uppercase text-zinc-400 mb-2">Subject Performance Benchmarks</h4>
                      <p className="text-xs text-zinc-350 leading-relaxed font-semibold">
                        {isNewMentor ? (
                          <>Syllabus coverage milestones, top performers, and low-engagement alerts will accumulate here once students start desking inside workspaces.</>
                        ) : (
                          <>DBMS student cohorts show excellent syllabus coverage milestones, while Operating Systems groups continue to fall behind the mid-term target margins.</>
                        )}
                      </p>
                    </div>
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

                  {/* AI Recommendations Card (Exactly matching mockup layout & assets) */}
                  <div className="p-6 bg-gradient-to-r from-[#0B0F19]/90 to-[#0A0E1A]/80 border border-slate-800 rounded-[28px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-left">
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <h4 className="text-xs font-black uppercase text-[#8B5CF6] flex items-center justify-center md:justify-start gap-1 font-mono tracking-wider">
                        ✨ AI TUTOR INSIGHTS
                      </h4>
                      <p className="text-xs text-zinc-350 leading-relaxed font-semibold max-w-xl">
                        Your AI academic assistant is ready to help you with learning, study tips, concept explanations and much more.
                      </p>
                    </div>

                    {/* Cute blue robot head illustration */}
                    <div className="flex justify-center items-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-20 w-20 select-none animate-bounce" style={{ animationDuration: '6s' }}>
                        <defs>
                          <radialGradient id="robotGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="url(#robotGlow)" />
                        <rect x="47" y="12" width="6" height="12" fill="#818CF8" rx="3" />
                        <circle cx="50" cy="10" r="6" fill="#A78BFA" />
                        <rect x="12" y="42" width="10" height="16" fill="#4F46E5" rx="5" />
                        <rect x="78" y="42" width="10" height="16" fill="#4F46E5" rx="5" />
                        <rect x="18" y="24" width="64" height="52" fill="#1E1B4B" rx="22" stroke="#818CF8" strokeWidth="2.5" />
                        <rect x="25" y="32" width="50" height="34" fill="#0B0F19" rx="14" stroke="#4F46E5" strokeWidth="1.5" />
                        <circle cx="38" cy="46" r="4.5" fill="#38BDF8" className="animate-pulse" />
                        <circle cx="38" cy="46" r="1.5" fill="#FFFFFF" />
                        <circle cx="62" cy="46" r="4.5" fill="#38BDF8" className="animate-pulse" />
                        <circle cx="62" cy="46" r="1.5" fill="#FFFFFF" />
                        <path d="M42 54 Q50 59 58 54" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" fill="transparent" />
                      </svg>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => setShowAiTutorChat(true)}
                        className="px-6 py-3.5 bg-[#5227EB] hover:bg-[#431fd0] text-white text-xs font-black rounded-2xl shadow-lg border border-indigo-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shadow-indigo-950/30 font-mono tracking-wide"
                      >
                        <Sparkles className="h-4 w-4 fill-white/20" /> Ask AI Tutor
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 8: Discussions Info */}
          {activeTab === 'discussions' && (
            <div className="space-y-6 text-left animate-in fade-in duration-350">
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
                <button onClick={() => setActiveTab('groups')} className="px-4 py-2 bg-[#10B981] hover:bg-[#0d9488] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
                  Browse Group Channels
                </button>
              </div>
            </div>
          )}

          {/* Tab 9: Leaderboard info */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6 text-left animate-in fade-in duration-350">
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
                                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                  isMe 
                                    ? 'bg-[#10B981]/5 border-[#10B981]/25 hover:border-[#10B981]/40' 
                                    : 'bg-slate-955/20 border-white/5 hover:border-white/10'
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
                                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                  isMe 
                                    ? 'bg-[#10B981]/5 border-[#10B981]/25 hover:border-[#10B981]/40' 
                                    : 'bg-slate-955/20 border-white/5 hover:border-white/10'
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
          {activeTab === 'messages' && (
            <div className="space-y-6 text-left animate-in fade-in duration-350 relative min-h-[750px]">
              
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
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-550" />
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
                            className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs outline-none text-white placeholder-zinc-650 focus:bg-slate-900/60 focus:border-[#10B981]/40 font-medium"
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
                          <p className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider text-left">
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
                    <span className="text-[9px] font-black uppercase text-zinc-450 tracking-wider block text-left">
                      📊 Daily Cohort Insights
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <p className="text-sm font-black text-[#10B981]">{dailyMetrics.studentsActive}</p>
                        <p className="text-[8px] text-zinc-555 uppercase font-black">Active</p>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <p className="text-sm font-black text-amber-505">{dailyMetrics.doubtsResolved}</p>
                        <p className="text-[8px] text-zinc-555 uppercase font-black">Solved</p>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <p className="text-sm font-black text-indigo-400">{dailyMetrics.resourcesShared}</p>
                        <p className="text-[8px] text-zinc-555 uppercase font-black">Files Shared</p>
                      </div>
                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5">
                        <p className="text-sm font-black text-rose-455">{dailyMetrics.liveStudySessions}</p>
                        <p className="text-[8px] text-zinc-555 uppercase font-black">Live Lounges</p>
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
                                <p className="text-[9px] text-zinc-550 font-mono font-bold">
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
                              <p className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider">
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
                            <p className="text-[8px] text-zinc-550 font-semibold mt-0.5">By {s.mentor}</p>
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
                            <p className="text-[8px] text-zinc-550 font-mono">{selectedDoubtForThread.time}</p>
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
                          <div className="p-6 text-center text-zinc-550 font-bold text-[11px] bg-slate-950/20 rounded-xl border border-white/5">
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
                                    <span className="text-[8px] text-zinc-550 font-mono block mt-0.5">{ans.time}</span>
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
                        className="w-full px-3 py-2 bg-slate-955 border border-white/10 rounded-xl text-xs outline-none text-white focus:border-[#10B981]/40 font-medium resize-none placeholder-zinc-650"
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
                        <p className="text-[10px] text-zinc-450 uppercase font-black tracking-widest animate-pulse">
                          Generating Custom Content...
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 py-4 text-left">
                        {activeAiTool === 'flashcard' && (
                          <div className="space-y-6">
                            <p className="text-[10px] text-zinc-450 text-center font-extrabold uppercase tracking-wide">
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
                                  <p className="text-[9px] text-zinc-550 uppercase font-black tracking-wider pt-2">
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
                                  <p className="text-[9px] text-zinc-550 uppercase font-black tracking-wider pt-2">
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
                                          optStyles = 'border-white/5 bg-slate-950/10 text-zinc-650 opacity-60';
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
                          className="w-full px-4 py-2.5 bg-slate-955 border border-white/10 rounded-xl text-xs outline-none text-white placeholder-zinc-650 focus:border-amber-500/40 font-semibold"
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
                          className="w-full px-4 py-2.5 bg-slate-955 border border-white/10 rounded-xl text-xs outline-none text-white placeholder-zinc-650 focus:border-amber-500/40 font-medium resize-none"
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

          {/* Tab 13: Settings info */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-left animate-in fade-in duration-350">
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

      {/* 🤖 AI Tutor Chat Drawer */}
      {showAiTutorChat && (
        <div className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200">
          <div 
            onClick={() => setShowAiTutorChat(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />
          <div className="relative w-full max-w-md bg-[#090d1e] border-l border-white/10 h-full flex flex-col shadow-2xl z-10 text-left animate-in slide-in-from-right duration-350">
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0b1026]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles className="h-5 w-5 fill-indigo-400/20" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">AI Study Tutor</h3>
                  <span className="text-[9px] text-[#A78BFA] font-black uppercase flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online Academic Assistant
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowAiTutorChat(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg p-2 rounded-xl hover:bg-white/5"
              >
                ✕
              </button>
            </div>
            
            {/* Messages Log */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {aiTutorMessages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'tutor' && (
                    <div className="h-8 w-8 rounded-full border border-indigo-500/30 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-6 w-6">
                        <rect x="18" y="24" width="64" height="52" fill="#1E1B4B" rx="22" stroke="#818CF8" strokeWidth="2.5" />
                        <circle cx="38" cy="46" r="4.5" fill="#38BDF8" />
                        <circle cx="62" cy="46" r="4.5" fill="#38BDF8" />
                        <path d="M42 54 Q50 59 58 54" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" fill="transparent" />
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-4 text-xs ${
                    msg.sender === 'user' 
                      ? 'bg-[#5227EB] text-white rounded-tr-none' 
                      : 'bg-[#151a30] border border-white/5 text-slate-200 rounded-tl-none space-y-2'
                  }`}>
                    {msg.sender === 'tutor' ? (
                      <div className="space-y-2 leading-relaxed">
                        {msg.text.split('\n\n').map((paragraph, pIdx) => {
                          if (paragraph.startsWith('### ')) {
                            return <h4 key={pIdx} className="text-white font-extrabold text-xs uppercase tracking-wide border-b border-white/5 pb-1 mt-3">{paragraph.replace('### ', '')}</h4>;
                          }
                          if (paragraph.startsWith('|')) {
                            const rows = paragraph.split('\n').filter(Boolean);
                            return (
                              <div key={pIdx} className="overflow-x-auto my-2 border border-white/5 rounded-xl bg-slate-950/40 p-2">
                                <table className="min-w-full text-[10px] text-slate-350">
                                  <thead>
                                    <tr>
                                      {rows[0].split('|').map(r => r.trim()).filter(Boolean).map((cell, cIdx) => (
                                        <th key={cIdx} className="text-left font-black text-white p-1 border-b border-white/10 uppercase tracking-wide">{cell}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.slice(2).map((row, rIdx) => (
                                      <tr key={rIdx} className="border-b border-white/5 last:border-0">
                                        {row.split('|').map(r => r.trim()).filter(Boolean).map((cell, cIdx) => (
                                          <td key={cIdx} className="p-1 font-semibold text-slate-400">{cell}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }
                          if (paragraph.includes('* ')) {
                            return (
                              <ul key={pIdx} className="list-disc pl-4 space-y-1 mt-1 font-semibold text-slate-350">
                                {paragraph.split('\n').filter(l => l.trim().startsWith('* ')).map((item, iIdx) => (
                                  <li key={iIdx}>{item.replace('* ', '')}</li>
                                ))}
                              </ul>
                            );
                          }
                          const parts = paragraph.split('**');
                          return (
                            <p key={pIdx} className="font-semibold text-slate-300 text-xs">
                              {parts.map((part, partIdx) => partIdx % 2 === 1 ? <strong key={partIdx} className="text-white font-black">{part}</strong> : part)}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="font-bold leading-normal text-xs">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))}
              {isAiTutorTyping && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="h-8 w-8 rounded-full border border-indigo-500/30 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-6 w-6">
                      <rect x="18" y="24" width="64" height="52" fill="#1E1B4B" rx="22" stroke="#818CF8" strokeWidth="2.5" />
                      <circle cx="38" cy="46" r="4.5" fill="#38BDF8" />
                      <circle cx="62" cy="46" r="4.5" fill="#38BDF8" />
                      <path d="M42 54 Q50 59 58 54" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" fill="transparent" />
                    </svg>
                  </div>
                  <div className="bg-[#151a30] border border-white/5 rounded-2xl rounded-tl-none p-3 flex items-center gap-1 shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            {/* Suggestions Zone */}
            <div className="p-4 border-t border-white/5 bg-[#090d1e] space-y-2">
              <span className="text-[9px] font-black uppercase text-zinc-500 block text-left">Quick Study Prompts</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { text: "Explain DBMS Normalization", label: "📊 Normalization" },
                  { text: "Difference between Process and Thread in OS", label: "🧠 Processes vs Threads" },
                  { text: "How do I earn XP and Focus Coins?", label: "🪙 Rewards Guide" },
                  { text: "Give me study tips to avoid distractions", label: "⚡ Focus Tips" }
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    disabled={isAiTutorTyping}
                    onClick={() => handleSendAiTutorMessage(prompt.text)}
                    className="px-2.5 py-1.5 rounded-lg border border-white/5 bg-[#12172f] hover:border-indigo-500/25 hover:bg-[#1a203f] transition-all text-[10px] font-bold text-slate-350 hover:text-white shrink-0 cursor-pointer"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiTutorMessage(aiTutorInput);
              }}
              className="p-4 border-t border-white/5 bg-[#0b1026] flex gap-2"
            >
              <input 
                type="text" 
                value={aiTutorInput}
                onChange={(e) => setAiTutorInput(e.target.value)}
                disabled={isAiTutorTyping}
                placeholder="Ask AI Tutor a question..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!aiTutorInput.trim() || isAiTutorTyping}
                className="px-4 py-2 bg-[#5227EB] hover:bg-[#431fd0] disabled:bg-[#5227EB]/40 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center shrink-0 cursor-pointer border-none"
              >
                Send
              </button>
            </form>
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
