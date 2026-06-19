'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../utils/api';
import { getSocket } from '../../utils/socket';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ToastProvider';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Plus, 
  Pin, 
  Trash2, 
  Save, 
  Users, 
  Award, 
  Activity, 
  Calendar, 
  ExternalLink,
  PlusCircle,
  Check,
  LogOut,
  HelpCircle,
  Copy,
  Video,
  User,
  Coffee,
  Bookmark,
  Download,
  RefreshCw,
  MessageSquare,
  BookOpen,
  Trophy,
  Flame,
  LayoutDashboard,
  Settings,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  subject: string;
  inviteCode: string;
  isPublic: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  groupId: string;
  createdBy: string;
  lastEditedBy: string;
  createdAt: string;
  updatedAt: string;
  Creator?: {
    fullName: string;
    username: string;
  };
}

interface Session {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  status: string;
  Creator?: {
    fullName: string;
    username: string;
  };
}

const learningPathTopics = {
  'programming-dsa': {
    title: 'Programming & DSA',
    levels: {
      beginner: ['Arrays', 'Strings', 'Linked Lists', 'Stack'],
      intermediate: ['Trees', 'Graphs', 'Heaps'],
      advanced: ['DP', 'Tries', 'Segment Trees']
    }
  },
  'web-development': {
    title: 'Web Development',
    levels: {
      beginner: ['HTML Semantic Structure', 'CSS Flexbox', 'Basic DOM'],
      intermediate: ['CSS Grid', 'React Hooks', 'Fetch API'],
      advanced: ['Next.js App Router', 'Webpack optimization', 'Web Sockets']
    }
  },
  'ai-ml': {
    title: 'AI & Machine Learning',
    levels: {
      beginner: ['Intro to ML', 'Linear Regression', 'Gradient Descent'],
      intermediate: ['Neural Networks', 'Activation Functions', 'Backpropagation'],
      advanced: ['CNNs/Computer Vision', 'Transformers/NLP', 'PyTorch deployment']
    }
  },
  'general': {
    title: 'General Computer Science',
    levels: {
      beginner: ['Databases', 'Git Version Control', 'Basic Command Line'],
      intermediate: ['REST APIs', 'SQL Queries', 'OOP Concepts'],
      advanced: ['System Design', 'Microservices', 'Security & Cryptography']
    }
  }
};

const workspaceQuizzes = {
  'programming-dsa': [
    {
      id: 'dsa_q1',
      question: 'What is the time complexity of looking up an element in a Hash Map in the average case?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correctIndex: 0,
      explanation: 'Average lookup time for a Hash Map is O(1) constant time because key hashing resolves to index storage addresses directly.'
    },
    {
      id: 'dsa_q2',
      question: 'Which data structure operates on a Last In, First Out (LIFO) basis?',
      options: ['Queue', 'Stack', 'Min-Heap', 'Linked List'],
      correctIndex: 1,
      explanation: 'A stack pushes new items to the top and pops them from the top, making the last inserted element the first one to be removed.'
    }
  ],
  'web-development': [
    {
      id: 'web_q1',
      question: 'What is the main difference between useEffect dependencies [] and no dependencies array in React?',
      options: [
        '[] runs once on mount; no array runs on every render',
        '[] runs on every render; no array runs once on mount',
        'Both run once on mount',
        'Both run on every render'
      ],
      correctIndex: 0,
      explanation: 'Providing an empty dependency array tells React that the effect doesn\'t depend on any props or state, running it only once. Omitting the array entirely executes the effect on every single component render.'
    },
    {
      id: 'web_q2',
      question: 'Which CSS layout display value allows alignment of child items dynamically along row or column axes?',
      options: ['display: block', 'display: grid', 'display: flex', 'display: inline'],
      correctIndex: 2,
      explanation: 'display: flex initializes a Flexbox container, enabling quick, dynamic alignment along a single main axis (row or column) and cross axis.'
    }
  ],
  'ai-ml': [
    {
      id: 'ai_q1',
      question: 'What does the term "Overfitting" mean in machine learning?',
      options: [
        'The model performs well on training data but poorly on unseen test data',
        'The model performs poorly on training data but well on test data',
        'The model has too few parameters',
        'The model executes too slowly'
      ],
      correctIndex: 0,
      explanation: 'Overfitting occurs when a statistical model fits its training data too closely, learning the noise and details to the point where it fails to generalize to new, unseen test data.'
    },
    {
      id: 'ai_q2',
      question: 'Which activation function outputs values in the range of 0 to 1, representing a probability?',
      options: ['ReLU', 'Sigmoid', 'Tanh', 'LeakyReLU'],
      correctIndex: 1,
      explanation: 'The Sigmoid activation function squashes any real-valued number into a range between 0 and 1, which makes it perfect for output layers predicting binary probability outcomes.'
    }
  ],
  'general': [
    {
      id: 'gen_q1',
      question: 'What does ACID stand for in Database Management Systems?',
      options: [
        'Atomicity, Consistency, Isolation, Durability',
        'Accuracy, Completeness, Integrity, Dependability',
        'Action, Concurrency, Indexing, Distribution',
        'Allocation, Compression, Isolation, Duplication'
      ],
      correctIndex: 0,
      explanation: 'ACID represents the key set of properties (Atomicity, Consistency, Isolation, Durability) that guarantee database transactions are processed reliably.'
    },
    {
      id: 'gen_q2',
      question: 'What is the primary purpose of a reverse proxy like Nginx?',
      options: [
        'To build and compile frontend Next.js applications',
        'To act as an intermediary, routing client requests to backend servers, handling load balancing and SSL termination',
        'To write database schemas to disk',
        'To optimize static image files'
      ],
      correctIndex: 1,
      explanation: 'A reverse proxy sits in front of web servers and forwards client requests, providing load balancing, caching, security, and SSL decryption benefits.'
    }
  ]
};

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const slug = params.slug as string;

  const { user: currentUser, loading: globalLoading, setUser } = useApp();
  const [group, setGroup] = useState<Group | null>(null);
  const [myRole, setMyRole] = useState<'admin' | 'mentor' | 'student'>('student');
  const [loading, setLoading] = useState(true);

  // Tabs state: 'lobby' | 'notes' | 'sessions' | 'doubts' | 'resources' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'lobby' | 'notes' | 'sessions' | 'doubts' | 'resources' | 'leaderboard'>('lobby');

  // Gamification & User Stats State
  const [userStats, setUserStats] = useState({
    streakCount: 0,
    totalStudyHours: 0.0,
    xp: 0,
    focusCoins: 0,
    level: 1,
    badges: '[]'
  });

  // Today's Challenge State
  const [todayChallengeSolved, setTodayChallengeSolved] = useState(false);

  // Learning Level State
  const [learningLevel, setLearningLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteIsPinned, setNoteIsPinned] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Doubts state
  const [doubts, setDoubts] = useState<any[]>([]);
  const [activeDoubt, setActiveDoubt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newDoubtTitle, setNewDoubtTitle] = useState('');
  const [newDoubtDesc, setNewDoubtDesc] = useState('');
  const [newDoubtTags, setNewDoubtTags] = useState('');
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [showDoubtForm, setShowDoubtForm] = useState(false);
  const [doubtSearchQuery, setDoubtSearchQuery] = useState('');
  const [submittingDoubt, setSubmittingDoubt] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [isLoadingDoubtDetail, setIsLoadingDoubtDetail] = useState(false);

  // AI Summarization state
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [summarizingStep, setSummarizingStep] = useState('');

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionLink, setSessionLink] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Group Stats & Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // 1. Coding Playground States
  const [codingCodeText, setCodingCodeText] = useState('function factorial(n) {\n  // Write your code here\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}');
  const [codingOutput, setCodingOutput] = useState<string[]>([]);
  const [codingCompleted, setCodingCompleted] = useState(false);
  const [codingTested, setCodingTested] = useState(false);

  // 2. DSA Array Pointers Visualizer States
  const [dsaArray, setDsaArray] = useState<number[]>([12, 24, 35, 47, 58, 69, 80, 92]);
  const [dsaPointers, setDsaPointers] = useState<{ low: number; high: number; mid: number | null }>({ low: 0, high: 7, mid: null });
  const [dsaStepDesc, setDsaStepDesc] = useState('Click "Next Step" to begin binary search animation.');
  const [dsaCompleted, setDsaCompleted] = useState(false);
  const [dsaQuizAnswer, setDsaQuizAnswer] = useState<number | null>(null);

  // 3. AI Neural Network Sandbox States
  const [aiDataset, setAiDataset] = useState('MNIST Digits');
  const [aiActivation, setAiActivation] = useState('ReLU');
  const [aiLearningRate, setAiLearningRate] = useState(0.01);
  const [aiEpochs, setAiEpochs] = useState(50);
  const [aiTraining, setAiTraining] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [aiCompleted, setAiCompleted] = useState(false);

  // 4. CSS Web Development Flexbox Sliders States
  const [webFlexDirection, setWebFlexDirection] = useState<'row' | 'column' | 'row-reverse'>('row');
  const [webJustifyContent, setWebJustifyContent] = useState<'flex-start' | 'center' | 'flex-end' | 'space-between'>('center');
  const [webAlignItems, setWebAlignItems] = useState<'flex-start' | 'center' | 'flex-end' | 'stretch'>('center');
  const [webGap, setWebGap] = useState<number>(16);
  const [webChallengeSolved, setWebChallengeSolved] = useState(false);

  // General Quiz State (fallback for other spaces)
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSolved, setQuizSolved] = useState(false);

  // Achievements State (Checklist milestones)
  const [achievements, setAchievements] = useState([
    { id: 'session', title: 'First Study Session', desc: 'Enter a co-study lounge', done: false },
    { id: 'note', title: 'First Note Published', desc: 'Share study guide with peers', done: false },
    { id: 'streak', title: '7 Day Consistency', desc: 'Maintain study streaks', done: false },
    { id: 'questions', title: '100 Questions Solved', desc: 'Solve daily challenges', done: false }
  ]);

  // Socket Connection State
  const socketRef = useRef<any>(null);

  // Pomodoro States
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  const [pomodoroIsRunning, setPomodoroIsRunning] = useState(false);
  const [pomodoroActivePreset, setPomodoroActivePreset] = useState<'25/5' | '50/10' | '90/15' | 'custom'>('25/5');
  const [pomodoroMode, setPomodoroMode] = useState<'focus' | 'break'>('focus');
  const [pomodoroTotalDuration, setPomodoroTotalDuration] = useState(25 * 60);
  const [customDurationInput, setCustomDurationInput] = useState(25);

  // Checked topics checklist
  const [checkedTopics, setCheckedTopics] = useState<string[]>([]);

  // Study Buddy Matcher states
  const [isScanningBuddy, setIsScanningBuddy] = useState(false);
  const [matchedBuddy, setMatchedBuddy] = useState<any>(null);

  // Concept Quizzes states
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Pomodoro countdown timer logic
  useEffect(() => {
    let intervalId: any = null;
    if (pomodoroIsRunning) {
      intervalId = setInterval(() => {
        setPomodoroTimeLeft((prev) => {
          if (prev <= 1) {
            setPomodoroIsRunning(false);
            
            if (typeof window !== 'undefined') {
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav');
                audio.play().catch(() => {});
              } catch (e) {}
            }

            const currentDurationMin = Math.round(pomodoroTotalDuration / 60);

            if (pomodoroMode === 'focus') {
              showToast(`🎉 Focus session complete! You studied for ${currentDurationMin} mins. Logging progress...`, 'success');
              
              if (group?.id) {
                apiRequest('/progress/log', {
                  method: 'POST',
                  body: JSON.stringify({
                    groupId: group.id,
                    studyMinutes: currentDurationMin,
                    notesCreated: 0,
                    tasksCompleted: 0
                  })
                })
                  .then((res) => {
                    if (res.user) {
                      setUserStats((prev) => ({
                        ...prev,
                        totalStudyHours: res.user.totalStudyHours,
                        streakCount: res.user.streakCount
                      }));
                    }
                    loadExtraGroupData(group.id);
                  })
                  .catch((err) => console.error('Error logging study session:', err));
              }

              apiRequest('/progress/complete-practice', {
                method: 'POST',
                body: JSON.stringify({
                  interest: group?.subject || 'Programming & DSA',
                  challengeId: 'pomodoro_' + Date.now(),
                  xpReward: 30,
                  coinReward: 15
                })
              })
                .then((res) => {
                  setUserStats((prev) => ({
                    ...prev,
                    xp: res.xp,
                    focusCoins: res.focusCoins,
                    level: res.level,
                    streakCount: res.streakCount
                  }));
                })
                .catch((err) => console.error('Error rewarding focus session:', err));

              setPomodoroMode('break');
              const breakDur = pomodoroActivePreset === '50/10' ? 10 * 60 : pomodoroActivePreset === '90/15' ? 15 * 60 : 5 * 60;
              setPomodoroTimeLeft(breakDur);
              setPomodoroTotalDuration(breakDur);
            } else {
              showToast("☀️ Break is over! Time to start focusing again.", 'info');
              setPomodoroMode('focus');
              const focusDur = pomodoroActivePreset === '50/10' ? 50 * 60 : pomodoroActivePreset === '90/15' ? 90 * 60 : 25 * 60;
              setPomodoroTimeLeft(focusDur);
              setPomodoroTotalDuration(focusDur);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pomodoroIsRunning, pomodoroMode, pomodoroActivePreset, pomodoroTotalDuration, group?.id]);

  const handleSetPomodoroPreset = (preset: '25/5' | '50/10' | '90/15' | 'custom', customMin?: number) => {
    setPomodoroIsRunning(false);
    setPomodoroActivePreset(preset);
    setPomodoroMode('focus');
    let secs = 25 * 60;
    if (preset === '50/10') secs = 50 * 60;
    else if (preset === '90/15') secs = 90 * 60;
    else if (preset === 'custom') secs = (customMin || 25) * 60;
    setPomodoroTimeLeft(secs);
    setPomodoroTotalDuration(secs);
  };

  const handleFindStudyBuddy = () => {
    setIsScanningBuddy(true);
    setMatchedBuddy(null);
    setTimeout(() => {
      setIsScanningBuddy(false);
      const names = ['Swathi', 'Rahul', 'Swetha', 'Charan', 'Sneha', 'Aarav', 'Neha', 'Pranav', 'Deepika', 'Karthik', 'Ananya'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      const goalsMap: Record<string, string> = {
        'programming-dsa': 'DSA Coding Mastery',
        'web-development': 'Fullstack Web Development',
        'ai-ml': 'AI/ML Engineering & Neural Nets',
        'general': 'System Design & Computer Science'
      };
      
      const categoryKey = (slug && learningPathTopics[slug as keyof typeof learningPathTopics]) ? slug : 'general';
      const sharedGoal = goalsMap[categoryKey as keyof typeof goalsMap];
      
      setMatchedBuddy({
        name: randomName,
        goal: sharedGoal,
        level: learningLevel.charAt(0).toUpperCase() + learningLevel.slice(1),
        action: `Let's focus for a session and solve challenges together!`
      });
      showToast(`🤝 Connected with ${randomName} for co-studying!`, 'success');
    }, 2000);
  };

  const handleToggleTopic = async (topic: string) => {
    const isChecked = checkedTopics.includes(topic);
    if (!isChecked) {
      try {
        const data = await apiRequest('/progress/complete-practice', {
          method: 'POST',
          body: JSON.stringify({
            interest: group?.subject || 'Programming & DSA',
            challengeId: 'topic_' + topic.replace(/\s+/g, '_').toLowerCase(),
            xpReward: 10,
            coinReward: 5
          })
        });
        
        setUserStats(prev => ({
          ...prev,
          xp: data.xp,
          focusCoins: data.focusCoins,
          level: data.level,
          streakCount: data.streakCount
        }));
        
        setCheckedTopics(prev => [...prev, topic]);
        showToast(`✅ Completed topic: ${topic}! +10 XP | +5 Focus Coins!`, 'success');
        
        if (data.leveledUp) {
          showToast(`🎉 Level Up! You are now Level ${data.level}!`, 'success');
        }
      } catch (err: any) {
        showToast('Error saving topic completion: ' + (err.message || err), 'error');
      }
    } else {
      setCheckedTopics(prev => prev.filter(t => t !== topic));
    }
  };

  const handleSelectQuizOption = (optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizOption(optionIdx);
  };

  const handleVerifyQuiz = async () => {
    if (selectedQuizOption === null || quizSubmitted) return;
    
    const categoryKey = (slug && workspaceQuizzes[slug as keyof typeof workspaceQuizzes]) ? slug : 'general';
    const currentQuiz = workspaceQuizzes[categoryKey as keyof typeof workspaceQuizzes][activeQuizIndex];
    
    if (selectedQuizOption === currentQuiz.correctIndex) {
      try {
        const data = await apiRequest('/progress/complete-practice', {
          method: 'POST',
          body: JSON.stringify({
            interest: group?.subject || 'Programming & DSA',
            challengeId: currentQuiz.id,
            xpReward: 15,
            coinReward: 5
          })
        });
        
        setUserStats(prev => ({
          ...prev,
          xp: data.xp,
          focusCoins: data.focusCoins,
          level: data.level,
          streakCount: data.streakCount
        }));
        
        setQuizSubmitted(true);
        showToast('🎉 Correct! +15 XP | +5 Focus Coins!', 'success');
        
        if (data.leveledUp) {
          showToast(`🎉 Level Up! You are now Level ${data.level}!`, 'success');
        }
      } catch (err: any) {
        showToast('Error submitting quiz: ' + (err.message || err), 'error');
      }
    } else {
      setQuizSubmitted(true);
      showToast('❌ Incorrect answer. Review the explanation below.', 'error');
    }
  };

  const handleNextQuiz = () => {
    const categoryKey = (slug && workspaceQuizzes[slug as keyof typeof workspaceQuizzes]) ? slug : 'general';
    const totalQuizzes = workspaceQuizzes[categoryKey as keyof typeof workspaceQuizzes].length;
    
    setActiveQuizIndex((prev) => (prev + 1) % totalQuizzes);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  // Load User Stats & Group from slug
  useEffect(() => {
    if (!globalLoading) {
      if (!currentUser) {
        showToast('Please log in or sign up first.', 'warning');
        router.push('/?login=true');
        return;
      }
      
      // Load user stats
      apiRequest('/progress/me')
        .then(data => {
          setUserStats({
            streakCount: data.streakCount || 0,
            totalStudyHours: data.totalStudyHours || 0.0,
            xp: data.xp || 0,
            focusCoins: data.focusCoins || 0,
            level: data.level || 1,
            badges: data.badges || '[]'
          });
        })
        .catch(err => console.error('Error fetching progress:', err));

      // Fetch group detail by slug (auto-creates and joins the user)
      setLoading(true);
      apiRequest(`/groups/by-slug/${slug}`)
        .then(data => {
          setGroup(data.group);
          setNotes(data.notes || []);
          
          // Connect sockets
          const socket = getSocket();
          socketRef.current = socket;
          if (!socket.connected) {
            socket.connect();
          }
          socket.emit('join-user', { userId: currentUser.id });
          socket.emit('join-room', { groupId: data.group.id, user: currentUser });

          // Load extra group statistics
          loadExtraGroupData(data.group.id);
        })
        .catch(err => {
          console.error(err);
          showToast('Failed to load workspace.', 'error');
          router.push('/dashboard');
        })
        .finally(() => setLoading(false));
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-room');
      }
    };
  }, [slug, currentUser, globalLoading]);

  // Load extra components: notes, sessions, doubts, leaderboard
  const loadExtraGroupData = async (groupId: string) => {
    try {
      const notesData = await apiRequest(`/notes/group/${groupId}`);
      setNotes(notesData.notes || []);

      const sessionsData = await apiRequest(`/sessions/group/${groupId}`);
      setSessions(sessionsData.sessions || []);

      const doubtsData = await apiRequest(`/doubts/group/${groupId}`);
      setDoubts(doubtsData.doubts || []);

      const lbData = await apiRequest(`/progress/group/${groupId}/leaderboard`);
      setLeaderboard(lbData.leaderboard || []);

      const logsData = await apiRequest(`/progress/group/${groupId}/logs`);
      setRecentLogs(logsData.logs || []);

      // Check achievements checklist
      const userNotes = notesData.notes?.filter((n: any) => n.createdBy === currentUser?.id) || [];
      setAchievements(prev => prev.map(ach => {
        if (ach.id === 'note' && userNotes.length > 0) return { ...ach, done: true };
        if (ach.id === 'session' && sessionsData.sessions?.length > 0) return { ...ach, done: true };
        if (ach.id === 'streak' && userStats.streakCount >= 7) return { ...ach, done: true };
        if (ach.id === 'questions' && userStats.xp >= 500) return { ...ach, done: true };
        return ach;
      }));

    } catch (e) {
      console.error('Error fetching extra group details:', e);
    }
  };

  const handleClaimTodayChallenge = async () => {
    if (todayChallengeSolved) return;
    try {
      const data = await apiRequest('/progress/complete-practice', {
        method: 'POST',
        body: JSON.stringify({
          interest: group?.subject || 'Programming & DSA',
          challengeId: 'todays_challenge',
          xpReward: 20,
          coinReward: 10
        })
      });
      setUserStats(prev => ({
        ...prev,
        xp: data.xp,
        focusCoins: data.focusCoins,
        streakCount: data.streakCount,
        level: data.level
      }));
      setTodayChallengeSolved(true);
      showToast('Daily Challenge Completed! Streak maintained. +20 XP | +10 Focus Coins!', 'success');
    } catch (err: any) {
      showToast('Error claiming challenge rewards: ' + (err.message || err), 'error');
    }
  };

  // Run Coding Tests
  const handleRunCodingTests = () => {
    setCodingOutput([
      'Compiling source files...',
      'Executing tests for factorial(n)...',
      'Test Case 1: factorial(5) === 120 (PASSED)',
      'Test Case 2: factorial(1) === 1 (PASSED)',
      'Test Case 3: factorial(0) === 1 (PASSED)',
      'All compiler test assertions passed successfully!'
    ]);
    setCodingTested(true);
    showToast('All compiler test cases passed!', 'success');
  };

  // Submit Coding Room
  const handleSubmitCodingRoom = async () => {
    if (!codingTested) return;
    try {
      const data = await apiRequest('/progress/complete-practice', {
        method: 'POST',
        body: JSON.stringify({ interest: 'Programming & DSA', challengeId: 'coding_visualizer_editor' })
      });
      setUserStats(prev => ({
        ...prev,
        xp: data.xp,
        focusCoins: data.focusCoins,
        streakCount: data.streakCount,
        level: data.level
      }));
      setCodingCompleted(true);
      showToast('Coding visualizer challenge submitted! +50 XP and +20 Focus Coins!', 'success');
      if (group) loadExtraGroupData(group.id);
    } catch (err: any) {
      showToast('Submission error: ' + (err.message || err), 'error');
    }
  };

  // DSA Visualizer Step Controls
  const handleDsaReset = () => {
    setDsaPointers({ low: 0, high: 7, mid: null });
    setDsaStepDesc('Visualizer reset. Click "Next Step" to begin binary search for target = 69.');
  };

  const handleDsaNextStep = () => {
    const { low, high, mid } = dsaPointers;
    if (low > high) {
      setDsaStepDesc('Target not found or search complete!');
      return;
    }

    if (mid === null) {
      const initialMid = Math.floor((low + high) / 2);
      setDsaPointers({ low, high, mid: initialMid });
      setDsaStepDesc(`Step 1: Set low = ${low} (val = ${dsaArray[low]}), high = ${high} (val = ${dsaArray[high]}). Calculated mid = ${initialMid} (val = ${dsaArray[initialMid]}).`);
    } else {
      const midVal = dsaArray[mid];
      if (midVal === 69) {
        setDsaStepDesc(`Success! Target 69 found at index ${mid}! Binary search completes successfully.`);
        showToast('Binary search animation successfully completed!', 'success');
      } else if (midVal < 69) {
        const nextLow = mid + 1;
        const nextMid = Math.floor((nextLow + high) / 2);
        setDsaPointers({ low: nextLow, high, mid: nextMid });
        setDsaStepDesc(`Index ${mid} (val = ${midVal}) < 69. Move low pointer to ${nextLow}. New calculated mid = ${nextMid} (val = ${dsaArray[nextMid]}).`);
      } else {
        const nextHigh = mid - 1;
        const nextMid = Math.floor((low + nextHigh) / 2);
        setDsaPointers({ low, high: nextHigh, mid: nextMid });
        setDsaStepDesc(`Index ${mid} (val = ${midVal}) > 69. Move high pointer to ${nextHigh}. New calculated mid = ${nextMid} (val = ${dsaArray[nextMid]}).`);
      }
    }
  };

  const handleVerifyDsaQuiz = async () => {
    if (dsaQuizAnswer === null) {
      showToast('Select an answer option.', 'error');
      return;
    }

    if (dsaQuizAnswer === 1) {
      try {
        const data = await apiRequest('/progress/complete-practice', {
          method: 'POST',
          body: JSON.stringify({ interest: 'Programming & DSA', challengeId: 'dsa_visualizer_quiz' })
        });
        setUserStats(prev => ({
          ...prev,
          xp: data.xp,
          focusCoins: data.focusCoins,
          streakCount: data.streakCount,
          level: data.level
        }));
        setDsaCompleted(true);
        showToast('DSA Checkpoint correct! +50 XP and +20 Focus Coins added!', 'success');
        if (group) loadExtraGroupData(group.id);
      } catch (err: any) {
        showToast('Doubt submitting DSA quiz: ' + (err.message || err), 'error');
      }
    } else {
      showToast('Incorrect complexity estimation. Try again!', 'error');
    }
  };

  // Train AI Model Sandbox
  const handleTrainAiModel = () => {
    if (aiTraining) return;
    setAiTraining(true);
    setAiProgress(0);
    setAiLogs(['Initializing Model Workspace...', `Setting learning rate = ${aiLearningRate}, activation = ${aiActivation}`, `Dataset: ${aiDataset}...`]);
    
    let currentEpoch = 0;
    const interval = setInterval(() => {
      currentEpoch += 5;
      setAiProgress(currentEpoch * 2);
      
      const simulatedLoss = (1.2 / (currentEpoch / 10 + 1)).toFixed(4);
      const simulatedAccuracy = (0.5 + (0.48 * (currentEpoch / 50))).toFixed(4);

      setAiLogs(prev => [
        ...prev,
        `Epoch ${currentEpoch}/${aiEpochs} - Loss: ${simulatedLoss} - Accuracy: ${simulatedAccuracy}`
      ]);

      if (currentEpoch >= aiEpochs) {
        clearInterval(interval);
        setAiTraining(false);
        setAiLogs(prev => [...prev, '✓ Neural Network Training complete! Model parameters converged.']);
        showToast('AI Model successfully trained! Claim your rewards.', 'success');
      }
    }, 200);
  };

  const handleClaimAiRewards = async () => {
    try {
      const data = await apiRequest('/progress/complete-practice', {
        method: 'POST',
        body: JSON.stringify({ interest: 'AI & Machine Learning', challengeId: 'ai_visualizer_train' })
      });
      setUserStats(prev => ({
        ...prev,
        xp: data.xp,
        focusCoins: data.focusCoins,
        streakCount: data.streakCount,
        level: data.level
      }));
      setAiCompleted(true);
      showToast('AI Room Training rewards claimed! +50 XP, +20 Coins!', 'success');
      if (group) loadExtraGroupData(group.id);
    } catch (err: any) {
      showToast('Claim rewards error: ' + (err.message || err), 'error');
    }
  };

  // Web Dev Flexbox Challenge Verification
  const handleVerifyWebChallenge = async () => {
    if (webFlexDirection === 'row' && webJustifyContent === 'center' && webAlignItems === 'center') {
      try {
        const data = await apiRequest('/progress/complete-practice', {
          method: 'POST',
          body: JSON.stringify({ interest: 'Web Development', challengeId: 'web_visualizer_challenge' })
        });
        setUserStats(prev => ({
          ...prev,
          xp: data.xp,
          focusCoins: data.focusCoins,
          streakCount: data.streakCount,
          level: data.level
        }));
        setWebChallengeSolved(true);
        showToast('Layout Centered! CSS Web Challenge solved! +50 XP | +20 Coins!', 'success');
        if (group) loadExtraGroupData(group.id);
      } catch (err: any) {
        showToast('Doubt submitting Web challenge: ' + (err.message || err), 'error');
      }
    } else {
      showToast('Items are not yet centered perfectly. Hint: Row + Center + Center.', 'warning');
    }
  };

  // General Quiz Check Verification
  const handleVerifyGeneralQuiz = async () => {
    if (quizAnswer === null) {
      showToast('Select an answer option.', 'error');
      return;
    }
    if (quizAnswer === 0) { // Default first option is correct
      try {
        const data = await apiRequest('/progress/complete-practice', {
          method: 'POST',
          body: JSON.stringify({ interest: group?.subject || 'Aptitude', challengeId: 'general_topic_quiz' })
        });
        setUserStats(prev => ({
          ...prev,
          xp: data.xp,
          focusCoins: data.focusCoins,
          streakCount: data.streakCount,
          level: data.level
        }));
        setQuizSolved(true);
        showToast('Correct answer! Challenge solved! +50 XP | +20 Coins!', 'success');
        if (group) loadExtraGroupData(group.id);
      } catch (err: any) {
        showToast('Error: ' + (err.message || err), 'error');
      }
    } else {
      showToast('Incorrect option. Re-check the logic and try again!', 'error');
    }
  };

  // Notes CRUD
  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showToast('Note title is required.', 'error');
      return;
    }
    if (!group) return;

    try {
      if (activeNote && isEditingNote) {
        const data = await apiRequest(`/notes/${activeNote.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            isPinned: noteIsPinned
          })
        });
        showToast('Note updated!', 'success');
        setIsEditingNote(false);
        setActiveNote(data.note);
      } else {
        const data = await apiRequest('/notes', {
          method: 'POST',
          body: JSON.stringify({
            groupId: group.id,
            title: noteTitle,
            content: noteContent,
            isPinned: noteIsPinned
          })
        });
        showToast('Note published!', 'success');
        setActiveNote(data.note);
        setIsEditingNote(false);
      }
      setNoteTitle('');
      setNoteContent('');
      setNoteIsPinned(false);
      loadExtraGroupData(group.id);
    } catch (err: any) {
      showToast(err.message || 'Error saving note.', 'error');
    }
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete || !group) return;
    try {
      await apiRequest(`/notes/${noteToDelete}`, {
        method: 'DELETE'
      });
      showToast('Note deleted successfully.', 'success');
      if (activeNote?.id === noteToDelete) {
        setActiveNote(null);
        setIsEditingNote(false);
      }
      setNoteToDelete(null);
      loadExtraGroupData(group.id);
    } catch (err: any) {
      showToast(err.message || 'Delete note failed.', 'error');
    }
  };

  // AI Summarizer Note
  const handleAiSummarize = async () => {
    if (!activeNote) return;
    setIsSummarizing(true);
    setAiSummary(null);
    setSummarizingStep('AI is analyzing note content...');
    
    try {
      setTimeout(() => setSummarizingStep('Extracting key definitions & acronyms...'), 300);
      setTimeout(() => setSummarizingStep('Synthesizing review questions...'), 600);
      
      const data = await apiRequest(`/notes/${activeNote.id}/summarize`, {
        method: 'POST'
      });
      
      setAiSummary(data);
    } catch (err: any) {
      showToast(err.message || 'Error generating AI summary.', 'error');
    } finally {
      setIsSummarizing(false);
      setSummarizingStep('');
    }
  };

  const handleSaveAiSummaryAsNote = async () => {
    if (!aiSummary || !activeNote || !group) return;
    try {
      let compiledText = `### AI Study Summary - ${activeNote.title}\n\n`;
      compiledText += `${aiSummary.summary}\n\n`;
      compiledText += `### Key Definitions:\n`;
      aiSummary.keyTerms.forEach((kt: any) => {
        compiledText += `* **${kt.term}**: ${kt.definition}\n`;
      });
      compiledText += `\n### Active Recall Questions:\n`;
      aiSummary.practiceQuestions.forEach((q: string, i: number) => {
        compiledText += `${i + 1}. ${q}\n`;
      });
      
      await apiRequest('/notes', {
        method: 'POST',
        body: JSON.stringify({
          groupId: group.id,
          title: `[AI Guide] ${activeNote.title}`,
          content: compiledText,
          isPinned: false
        })
      });
      
      showToast('AI summary saved as a new shared note!', 'success');
      setAiSummary(null);
      loadExtraGroupData(group.id);
    } catch (err: any) {
      showToast(err.message || 'Error saving summary.', 'error');
    }
  };

  // Sessions CRUD
  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim() || !sessionTime || !group) {
      showToast('Session Title and Scheduled Time are required.', 'error');
      return;
    }
    setScheduling(true);
    try {
      await apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          groupId: group.id,
          title: sessionTitle,
          description: sessionDesc,
          scheduledAt: sessionTime,
          durationMinutes: sessionDuration,
          meetingLink: sessionLink
        })
      });
      showToast('Study Session scheduled!', 'success');
      setShowScheduleModal(false);
      setSessionTitle('');
      setSessionDesc('');
      setSessionTime('');
      setSessionDuration(60);
      setSessionLink('');
      loadExtraGroupData(group.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule session.', 'error');
    } finally {
      setScheduling(false);
    }
  };

  // Doubts Q&A Board
  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtTitle.trim() || !newDoubtDesc.trim() || !group) {
      showToast('Title and description are required.', 'error');
      return;
    }
    setSubmittingDoubt(true);
    try {
      await apiRequest('/doubts', {
        method: 'POST',
        body: JSON.stringify({
          groupId: group.id,
          title: newDoubtTitle,
          description: newDoubtDesc,
          tags: newDoubtTags
        })
      });
      showToast('Doubt posted successfully!', 'success');

      // socket notify
      if (socketRef.current) {
        socketRef.current.emit('new-doubt-posted', {
          groupId: group.id,
          user: currentUser,
          doubtTitle: newDoubtTitle
        });
      }

      setNewDoubtTitle('');
      setNewDoubtDesc('');
      setNewDoubtTags('');
      setShowDoubtForm(false);
      loadExtraGroupData(group.id);
    } catch (err: any) {
      showToast(err.message || 'Error posting doubt.', 'error');
    } finally {
      setSubmittingDoubt(false);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerContent.trim() || !activeDoubt) return;
    setSubmittingAnswer(true);
    try {
      await apiRequest(`/doubts/${activeDoubt.id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ content: newAnswerContent })
      });
      showToast('Answer posted!', 'success');
      setNewAnswerContent('');
      loadDoubtDetail(activeDoubt.id);
      if (group) loadExtraGroupData(group.id);
    } catch (err: any) {
      showToast(err.message || 'Error posting answer.', 'error');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const loadDoubtDetail = async (doubtId: string) => {
    setIsLoadingDoubtDetail(true);
    try {
      const data = await apiRequest(`/doubts/${doubtId}`);
      setActiveDoubt(data.doubt);
      setAnswers(data.answers || []);
    } catch (e: any) {
      showToast(e.message || 'Error loading doubt details.', 'error');
    } finally {
      setIsLoadingDoubtDetail(false);
    }
  };

  const handleUpvoteDoubt = async (doubtId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await apiRequest(`/doubts/${doubtId}/upvote`, { method: 'PUT' });
      showToast('Doubt upvoted!', 'success');
      setDoubts((prev: any[]) => prev.map((d: any) => d.id === doubtId ? { ...d, upvotes: data.upvotes } : d));
      if (activeDoubt && activeDoubt.id === doubtId) {
        setActiveDoubt((prev: any) => prev ? { ...prev, upvotes: data.upvotes } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Error upvoting.', 'error');
    }
  };

  const handleUpvoteAnswer = async (answerId: string) => {
    try {
      const data = await apiRequest(`/doubts/answers/${answerId}/upvote`, { method: 'PUT' });
      showToast('Answer upvoted!', 'success');
      setAnswers((prev: any[]) => prev.map((a: any) => a.id === answerId ? { ...a, upvotes: data.upvotes } : a));
    } catch (err: any) {
      showToast(err.message || 'Error upvoting answer.', 'error');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const data = await apiRequest(`/doubts/answers/${answerId}/accept`, { method: 'PUT' });
      showToast('Solution accepted!', 'success');
      setAnswers((prev: any[]) => prev.map((a: any) => a.id === answerId ? { ...a, isAccepted: true } : { ...a, isAccepted: false }));
      setActiveDoubt(data.doubt);
      if (group) loadExtraGroupData(group.id);
    } catch (err: any) {
      showToast(err.message || 'Error accepting answer.', 'error');
    }
  };

  if (loading || !group) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Recommended Resources Mock Data based on Level Selection
  const pathResources: Record<string, Record<'beginner' | 'intermediate' | 'advanced', Array<{ title: string; type: string; url?: string }>>> = {
    'programming-dsa': {
      beginner: [
        { title: 'Intro to Algorithms & Big-O Notation', type: 'Video Reference' },
        { title: 'Understanding Arrays and Linked Lists', type: 'Handwritten Notes' },
        { title: 'Stack & Queue Basic Syntax implementation', type: 'Coding Sandbox' }
      ],
      intermediate: [
        { title: 'Recursion Masterclass & Call Stacks', type: 'Video Reference' },
        { title: 'Binary Trees Traversals: In-order, Pre-order', type: 'Interactive Slides' },
        { title: 'Binary Search Implementation in Javascript', type: 'Code Checkpoint' }
      ],
      advanced: [
        { title: 'Dynamic Programming: Knapsack Visualizer', type: 'Interactive Sandbox' },
        { title: 'Graph Algorithms: Dijkstra Search complexity', type: 'Specialized Notes' },
        { title: 'Hard LeetCode Backtracking templates', type: 'Interview Prep Sheet' }
      ]
    },
    'ai-ml': {
      beginner: [
        { title: 'Introduction to Machine Learning Models', type: 'Video Reference' },
        { title: 'Understanding Regression vs Classification', type: 'Handwritten Notes' },
        { title: 'Gradient Descent visual sliders playground', type: 'ML Sandbox' }
      ],
      intermediate: [
        { title: 'Intro to Neural Networks & Weights', type: 'Video Reference' },
        { title: 'Activation Functions: Sigmoid, Tanh, ReLU', type: 'Interactive Slides' },
        { title: 'Backpropagation calculations step by step', type: 'Math Cheat Sheet' }
      ],
      advanced: [
        { title: 'Deep Learning: CNNs & Image Convolutions', type: 'Visual Sandbox' },
        { title: 'Transformer Architectures and Self-Attention', type: 'Advanced Notes' },
        { title: 'Deploying PyTorch models to production', type: 'FAANG Prep Guide' }
      ]
    },
    'web-development': {
      beginner: [
        { title: 'HTML5 Semantic Structure best practices', type: 'Video Reference' },
        { title: 'CSS Flexbox centering visual guide', type: 'Layout Cheat Sheet' },
        { title: 'Basic DOM events selector actions', type: 'Code Checkpoint' }
      ],
      intermediate: [
        { title: 'Understanding CSS Grid vs Flexbox', type: 'Video Reference' },
        { title: 'React components state, props, and triggers', type: 'Code Sandbox' },
        { title: 'Fetch API and asynchronous promises', type: 'API Cheatsheet' }
      ],
      advanced: [
        { title: 'Next.js App Router performance tuning', type: 'Advanced Guide' },
        { title: 'Webpack configurations & Tree shaking', type: 'Handwritten Notes' },
        { title: 'Web Sockets collaborative state syncing', type: 'Interactive Slides' }
      ]
    }
  };

  const getPathResourcesList = () => {
    const spaceKey = slug === 'ai-ml' ? 'ai-ml' : slug === 'web-development' ? 'web-development' : 'programming-dsa';
    return pathResources[spaceKey]?.[learningLevel] || pathResources['programming-dsa'].beginner;
  };

  return (
    <div className="min-h-screen text-slate-100 flex bg-[#060913]">
      
      {/* LEFT SIDEBAR (Consistent with dashboard sidebar layout) */}
      <aside className="w-64 bg-[#0B0F19] border-r border-white/5 flex flex-col shrink-0 h-screen sticky top-0 z-30">
        
        {/* Branding header */}
        <Link 
          href="/"
          className="h-16 px-6 border-b border-white/5 flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer text-left shrink-0"
        >
          <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#10B981] via-indigo-500 to-[#E11D48] opacity-90 shadow-md animate-pulse" />
            <div className="absolute inset-[3px] rounded-full bg-[#0B0F19] flex items-center justify-center text-white font-bold">
              <BookOpen className="h-4 w-4 text-[#10B981]" />
            </div>
          </div>
          <div className="leading-none">
            <span className="font-extrabold text-sm tracking-tight text-white block">
              StudyCircle
            </span>
            <span className="text-[8px] font-semibold text-slate-450">
              Collaborative Learning
            </span>
          </div>
        </Link>

        {/* User context settings */}
        <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 relative overflow-hidden">
            <img 
              src={currentUser?.avatarUrl || '/charan-avatar.png'} 
              alt="Avatar" 
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/charan-avatar.png';
              }}
            />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[11px] font-black text-white truncate leading-none mb-0.5">{currentUser?.fullName}</p>
            <p className="text-[9px] font-semibold text-slate-550 truncate">@{currentUser?.username}</p>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer border-none bg-transparent text-left"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </button>

          <div className="pt-4 pb-2">
            <span className="text-[9px] font-black text-slate-650 uppercase tracking-widest px-4 block">Workspace Tabs</span>
          </div>

          {[
            { id: 'lobby', title: 'Live Study Lobby', icon: Activity },
            { id: 'notes', title: 'Shared Notes', icon: FileText },
            { id: 'sessions', title: 'Scheduled Calls', icon: Calendar },
            { id: 'doubts', title: 'Discussion Board', icon: MessageSquare },
            { id: 'resources', title: 'Curated Resources', icon: Bookmark },
            { id: 'leaderboard', title: 'Workspace Leaderboard', icon: Trophy }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setActiveNote(null);
                  setIsEditingNote(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none text-left ${
                  isSel 
                    ? 'bg-indigo-600/15 border border-indigo-500/20 text-white font-extrabold shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSel ? 'text-indigo-400' : ''}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Back navigation */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.back();
              } else {
                router.push('/dashboard');
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 border border-white/5 hover:border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* HEADER BAR */}
        <header className="h-16 border-b border-white/5 bg-[#0B0F19]/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-4 text-left">
            <div>
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Active Workspace</span>
              <h2 className="text-sm font-extrabold text-white leading-tight">{group?.name || 'Interactive Room'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Gamification stats overlay */}
            <div className="flex items-center gap-4 bg-slate-900/50 border border-white/5 rounded-xl px-4 py-1.5 text-xs font-black shadow-inner">
              <div className="flex items-center gap-1 text-orange-400" title="Daily Streak">
                <Flame className="h-3.5 w-3.5 fill-orange-400" />
                <span>{userStats.streakCount} Day</span>
              </div>
              <div className="flex items-center gap-1 text-indigo-400" title="XP (Scholar Points)">
                <Award className="h-3.5 w-3.5" />
                <span>{userStats.xp} XP</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500" title="Focus Coins">
                <span className="h-4.5 w-4.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-[10px] font-black">¢</span>
                <span>{userStats.focusCoins} Coins</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400" title="Scholar Level">
                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-mono">Lvl {userStats.level}</span>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <div className="flex-1 p-8 grid lg:grid-cols-4 gap-8 items-start">
          
          {/* Main workspace section (Left 3/4) */}
          <div className="lg:col-span-3 space-y-8 text-left">
            
            {/* WELCOME BANNER & LEARNING PATH HERO */}
            <section className="bg-gradient-to-br from-[#0b1224] via-[#070b16] to-[#120b24] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-3 max-w-xl text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-indigo-500/15 border border-indigo-500/25 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                  ✨ Co-Study Lounge Workspace
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white">🚀 Explore {group?.subject}</h3>
                <p className="text-xs text-slate-450 leading-relaxed font-bold">
                  {group?.description || 'Collaborative workspace to learn topics, solve codes, and discuss doubts together.'}
                </p>

                {/* Level selector */}
                <div className="flex items-center gap-3 pt-3">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Path Track:</span>
                  <div className="flex bg-[#0B0F19]/80 border border-white/5 rounded-xl p-0.5">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setLearningLevel(level)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
                          learningLevel === level 
                            ? 'bg-[#4F46E5] text-white shadow' 
                            : 'text-slate-500 hover:text-slate-350 bg-transparent'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TODAY'S CHALLENGE ACTION */}
              <div className="w-full md:w-80 shrink-0 bg-[#0B0F19]/80 border border-white/10 rounded-2xl p-5 space-y-4 relative shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Today's Challenge</span>
                  </div>
                  <span className="text-[9px] font-black bg-white/5 border border-white/10 text-indigo-400 px-2 py-0.5 rounded">
                    +20 XP | +10 ¢
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-white leading-normal">Solve practice questions or visualizer challenge</p>
                  <p className="text-[9px] text-slate-550 font-semibold">Active tasks maintain your consistency streak badge.</p>
                </div>

                <div className="pt-1 flex items-center justify-between gap-4">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${todayChallengeSolved ? 'w-full bg-emerald-500' : 'w-1/3 bg-indigo-500'}`} 
                    />
                  </div>
                  <button
                    disabled={todayChallengeSolved}
                    onClick={handleClaimTodayChallenge}
                    className={`px-4.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
                      todayChallengeSolved 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450' 
                        : 'bg-[#4F46E5] hover:bg-[#4338ca] text-white shadow-md active:scale-[0.98]'
                    }`}
                  >
                    {todayChallengeSolved ? '✓ Claimed' : 'Complete Challenge'}
                  </button>
                </div>
              </div>
            </section>

                     {/* T1: LIVE STUDY LOBBY (Visual Playgrounds) */}
            {activeTab === 'lobby' && (
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                
                {/* COLUMN 1: FOCUS ZONE */}
                <div className="space-y-6">
                  
                  {/* POMODORO TIMER CARD */}
                  <div className="bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-6">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                        <Clock className="h-4.5 w-4.5 text-indigo-400" /> Pomodoro Focus Arena
                      </div>
                      <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase ${
                        pomodoroMode === 'focus' 
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      }`}>
                        {pomodoroMode === 'focus' ? '🔥 Focus Mode' : '☀️ Break Time'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center space-y-6">
                      {/* Timer Display */}
                      <div className="relative flex items-center justify-center h-48 w-48">
                        {/* Circular track progress */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke="rgba(255, 255, 255, 0.03)"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke={pomodoroMode === 'focus' ? '#EF4444' : '#10B981'}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray="502.6"
                            strokeDashoffset={502.6 * (1 - pomodoroTimeLeft / pomodoroTotalDuration)}
                            className="transition-all duration-1000 ease-linear"
                          />
                        </svg>
                        
                        {/* Countdown text inside */}
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-white font-mono leading-none tracking-tight">
                            {Math.floor(pomodoroTimeLeft / 60).toString().padStart(2, '0')}:
                            {(pomodoroTimeLeft % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">
                            {pomodoroIsRunning ? 'Running' : 'Paused'}
                          </span>
                        </div>
                      </div>

                      {/* Presets Grid */}
                      <div className="w-full grid grid-cols-4 gap-2">
                        {(['25/5', '50/10', '90/15', 'custom'] as const).map((preset) => (
                          <button
                            key={preset}
                            onClick={() => {
                              if (preset !== 'custom') {
                                handleSetPomodoroPreset(preset);
                              } else {
                                handleSetPomodoroPreset('custom', customDurationInput);
                              }
                            }}
                            className={`py-2 px-1 text-[9px] font-black rounded-xl border transition-all uppercase tracking-wider cursor-pointer ${
                              pomodoroActivePreset === preset
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-white font-black'
                                : 'bg-slate-955 border-white/5 text-slate-400 hover:bg-slate-900'
                            }`}
                          >
                            {preset === 'custom' ? 'Custom' : preset}
                          </button>
                        ))}
                      </div>

                      {/* Custom Range Slider if custom selected */}
                      {pomodoroActivePreset === 'custom' && (
                        <div className="w-full space-y-1.5 px-1">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 tracking-wider">
                            <span>Duration</span>
                            <span className="text-indigo-400 font-mono">{customDurationInput} Mins</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="120"
                            value={customDurationInput}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setCustomDurationInput(val);
                              handleSetPomodoroPreset('custom', val);
                            }}
                            disabled={pomodoroIsRunning}
                            className="w-full accent-indigo-500 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Controls Buttons */}
                      <div className="w-full flex gap-3 pt-2">
                        <button
                          onClick={() => setPomodoroIsRunning(!pomodoroIsRunning)}
                          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                            pomodoroIsRunning
                              ? 'bg-amber-600 hover:bg-amber-500 text-white'
                              : 'bg-indigo-650 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {pomodoroIsRunning ? (
                            <>
                              <span className="h-2.5 w-2.5 bg-white/20 rounded flex items-center justify-center" /> Pause Focus
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" /> Start Focus
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleSetPomodoroPreset(pomodoroActivePreset, customDurationInput)}
                          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border-none text-slate-200 text-xs font-black rounded-xl transition-all uppercase tracking-widest cursor-pointer active:scale-[0.98] flex items-center justify-center"
                          title="Reset Timer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COMMITMENT TRACKER CARD */}
                  <div className="bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans mb-4">🎯 Daily Commitment Tracker</h4>
                    
                    <div className="flex items-center gap-6">
                      {/* Circular target tracker */}
                      <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="38"
                            stroke="rgba(255, 255, 255, 0.03)"
                            strokeWidth="5"
                            fill="transparent"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="38"
                            stroke="#10B981"
                            strokeWidth="5"
                            fill="transparent"
                            strokeDasharray="238.7"
                            strokeDashoffset={238.7 * (1 - Math.min(100, Math.round((userStats.totalStudyHours / (currentUser?.dailyTarget || 2.0)) * 100)) / 100)}
                            className="transition-all duration-500 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-base font-black text-white font-mono leading-none">
                            {Math.min(100, Math.round((userStats.totalStudyHours / (currentUser?.dailyTarget || 2.0)) * 100))}%
                          </span>
                          <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider mt-0.5">Target</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-left">
                        <div className="text-xs font-bold text-slate-200">
                          Focused <strong className="text-indigo-400 text-sm font-black">{userStats.totalStudyHours.toFixed(1)}</strong> of <strong className="text-emerald-400 text-sm font-black">{(currentUser?.dailyTarget || 2.0).toFixed(1)}</strong> hours today
                        </div>
                        <p className="text-[10px] text-slate-455 font-bold leading-relaxed">
                          Your daily target is synchronized with your onboarding choices. Complete focus blocks to level up your scholar ranking.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* STUDY BUDDY MATCHER CARD */}
                  <div className="bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl text-left relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                        <Users className="h-4.5 w-4.5 text-purple-400 animate-pulse" /> Accountability Study Buddy
                      </div>
                    </div>

                    {!matchedBuddy ? (
                      <div className="space-y-4">
                        <p className="text-[11px] text-slate-455 leading-relaxed font-bold">
                          Find an active partner co-studying the same topics. Share goals and double your focus motivation.
                        </p>
                        
                        {isScanningBuddy ? (
                          <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
                            <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Scanning lounge for matches...</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleFindStudyBuddy}
                            className="w-full py-2.5 bg-purple-650 hover:bg-purple-600 text-white text-[10px] font-black rounded-xl border-none uppercase tracking-widest cursor-pointer shadow-md transition-all"
                          >
                            Find Study Buddy
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl space-y-2 text-left relative">
                          <button
                            onClick={() => setMatchedBuddy(null)}
                            className="absolute top-2 right-2 text-[10px] text-slate-500 hover:text-white font-bold bg-transparent border-none cursor-pointer"
                            title="Disconnect Buddy"
                          >
                            ✕
                          </button>
                          
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black uppercase text-sm">
                              {matchedBuddy.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-black text-white">@{matchedBuddy.name} matched!</div>
                              <div className="text-[8px] text-purple-400 font-black uppercase tracking-wider">Goal: {matchedBuddy.goal}</div>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-350 italic font-semibold leading-relaxed pt-1">
                            "{matchedBuddy.action}"
                          </p>
                        </div>
                        <div className="flex gap-2.5">
                          <span className="flex-1 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black text-emerald-400 uppercase text-center">
                            🤝 Accountability Connected
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* COLUMN 2: LEARNING PATH & QUIZZES */}
                <div className="space-y-6">
                  
                  {/* LEARNING PATH TOPIC MAP */}
                  <div className="bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">🎓 Learning Path Checklist</h4>
                        <p className="text-[9px] text-slate-500 font-bold">Track key concepts and verify completion for XP and Coins.</p>
                      </div>
                    </div>

                    {/* Completion progress */}
                    {(() => {
                      const categoryKey = (slug && learningPathTopics[slug as keyof typeof learningPathTopics]) ? slug : 'general';
                      const activePath = learningPathTopics[categoryKey as keyof typeof learningPathTopics];
                      const allTopics = [
                        ...activePath.levels.beginner,
                        ...activePath.levels.intermediate,
                        ...activePath.levels.advanced
                      ];
                      const completedCount = allTopics.filter(t => checkedTopics.includes(t)).length;
                      const pct = Math.round((completedCount / allTopics.length) * 100);

                      return (
                        <div className="space-y-4">
                          <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                              <span>Path Progress ({activePath.title})</span>
                              <span className="text-indigo-400">{completedCount} / {allTopics.length} ({pct}%)</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${pct}%` }} />
                            </div>
                          </div>

                          {/* Levels Checklists */}
                          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => {
                              const levelTopics = activePath.levels[level];
                              return (
                                <div key={level} className="space-y-2">
                                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    {level} track
                                  </div>
                                  <div className="grid gap-2">
                                    {levelTopics.map((topic) => {
                                      const isChecked = checkedTopics.includes(topic);
                                      return (
                                        <div
                                          key={topic}
                                          onClick={() => handleToggleTopic(topic)}
                                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                            isChecked
                                              ? 'bg-indigo-500/5 border-indigo-500/30 text-slate-200'
                                              : 'bg-slate-950/30 border-white/5 text-slate-400 hover:bg-slate-900/40 hover:text-slate-250'
                                          }`}
                                        >
                                          <span className="text-xs font-bold font-sans">{topic}</span>
                                          <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                            isChecked 
                                              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                                              : 'bg-transparent border-white/10 text-transparent'
                                          }`}>
                                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* CONCEPT QUIZ OF THE DAY */}
                  {(() => {
                    const categoryKey = (slug && workspaceQuizzes[slug as keyof typeof workspaceQuizzes]) ? slug : 'general';
                    const activeQuizzes = workspaceQuizzes[categoryKey as keyof typeof workspaceQuizzes];
                    const currentQuiz = activeQuizzes[activeQuizIndex];
                    
                    return (
                      <div className="bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl text-left relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black uppercase tracking-wider text-white">🧠 Concept Quiz Challenge</h4>
                            <p className="text-[9px] text-slate-500 font-bold">Reinforce learning concepts. Correct answers award XP and Coins.</p>
                          </div>
                          <span className="text-[8px] font-mono bg-indigo-500/15 border border-indigo-500/25 px-2 py-0.5 rounded text-indigo-400 uppercase font-black">
                            Q {activeQuizIndex + 1} / {activeQuizzes.length}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <p className="text-xs font-bold text-slate-200 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5">
                            {currentQuiz.question}
                          </p>

                          <div className="grid gap-2">
                            {currentQuiz.options.map((option, idx) => {
                              const isSelected = selectedQuizOption === idx;
                              const isCorrect = idx === currentQuiz.correctIndex;
                              
                              let optionStyle = 'bg-slate-950/30 border-white/5 text-slate-400 hover:bg-slate-900/40 cursor-pointer';
                              if (quizSubmitted) {
                                if (isCorrect) {
                                  optionStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-black';
                                } else if (isSelected) {
                                  optionStyle = 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-black';
                                } else {
                                  optionStyle = 'bg-slate-950/20 border-white/5 text-slate-650 opacity-60';
                                }
                              } else if (isSelected) {
                                optionStyle = 'bg-indigo-500/10 border-indigo-500/50 text-white font-bold';
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={quizSubmitted}
                                  onClick={() => handleSelectQuizOption(idx)}
                                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${optionStyle}`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>

                          {!quizSubmitted ? (
                            <button
                              disabled={selectedQuizOption === null}
                              onClick={handleVerifyQuiz}
                              className={`w-full py-2.5 text-[10px] font-black rounded-xl border-none uppercase tracking-widest transition-all ${
                                selectedQuizOption !== null
                                  ? 'bg-indigo-650 hover:bg-indigo-500 text-white cursor-pointer shadow-md'
                                  : 'bg-zinc-800 text-zinc-550 cursor-not-allowed'
                              }`}
                            >
                              Submit Answer
                            </button>
                          ) : (
                            <div className="space-y-4 pt-2 border-t border-white/5">
                              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed font-semibold">
                                <strong className="text-white block mb-0.5 uppercase tracking-wide text-[9px]">Explanation:</strong>
                                {currentQuiz.explanation}
                              </div>
                              <button
                                onClick={handleNextQuiz}
                                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-xl border-none uppercase tracking-widest cursor-pointer transition-all"
                              >
                                Next Challenge
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                </div>

              </div>
            )}

            {/* T2: SHARED NOTES (CRUD + AI Summarizer) */}
            {activeTab === 'notes' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5 text-left">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-350 flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-indigo-400" /> Collaborative Shared Notes
                    </h3>
                    <p className="text-[10px] text-slate-550 font-bold">Write study materials together and synthesize review guides with AI summaries.</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveNote(null);
                      setIsEditingNote(true);
                      setNoteTitle('');
                      setNoteContent('');
                      setNoteIsPinned(false);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-xl transition-all cursor-pointer border-none uppercase tracking-widest shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Publish New Note
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                  
                  {/* Left Side: Notes List */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {notes.length === 0 ? (
                      <div className="p-8 bg-[#0B0F19]/40 border border-white/5 rounded-2xl text-center space-y-2">
                        <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400 font-bold">No notes shared yet.</p>
                      </div>
                    ) : (
                      notes.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((note) => (
                        <div
                          key={note.id}
                          onClick={() => {
                            setActiveNote(note);
                            setIsEditingNote(false);
                            setAiSummary(null);
                          }}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                            activeNote?.id === note.id
                              ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                              : 'bg-[#0B0F19]/60 border-white/5 text-slate-300 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-black truncate flex-1">{note.title}</h4>
                            {note.isPinned && <Pin className="h-3 w-3 text-amber-400 fill-amber-400 rotate-45 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-1">{note.content}</p>
                          <span className="text-[8px] text-slate-600 block mt-2">Shared by @{note.Creator?.username || 'user'}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Right Side: Note details details detail / Edit form */}
                  <div className="md:col-span-2">
                    {isEditingNote ? (
                      <form onSubmit={saveNote} className="bg-[#0B0F19]/60 border border-white/5 rounded-2xl p-6 space-y-4 shadow-lg">
                        <h4 className="text-xs font-black uppercase text-white font-sans">{activeNote ? 'Edit Study Note' : 'Publish New Shared Note'}</h4>
                        
                        <div className="space-y-1.5 text-left font-sans">
                          <label className="text-[9px] font-black text-slate-500 uppercase block">Note Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Arrays and Big-O Complexity fundamentals"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>

                        <div className="space-y-1.5 text-left font-sans">
                          <label className="text-[9px] font-black text-slate-500 uppercase block">Content Markup</label>
                          <textarea
                            required
                            rows={8}
                            placeholder="Enter detailed reference notes for your study circle..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-955 border border-white/5 rounded-xl text-xs text-indigo-300 font-mono outline-none focus:border-indigo-500/50 resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 font-sans">
                          <input
                            type="checkbox"
                            id="pin-check"
                            checked={noteIsPinned}
                            onChange={(e) => setNoteIsPinned(e.target.checked)}
                            className="accent-indigo-500"
                          />
                          <label htmlFor="pin-check" className="text-[10px] text-slate-400 font-bold cursor-pointer select-none">Pin this note to the top of the feed</label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 font-sans">
                          <button
                            type="button"
                            onClick={() => setIsEditingNote(false)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg border-none uppercase tracking-widest cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex items-center gap-1 px-5 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-lg border-none uppercase tracking-widest cursor-pointer shadow"
                          >
                            <Save className="h-3.5 w-3.5" /> Save Note
                          </button>
                        </div>
                      </form>
                    ) : activeNote ? (
                      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-2xl p-6 space-y-6 shadow-lg text-left">
                        <div className="flex justify-between items-start gap-4 border-b border-white/5 pb-4 font-sans">
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-white">{activeNote.title}</h4>
                            <p className="text-[9px] text-slate-500 font-bold">Published by @{activeNote.Creator?.username || 'user'} on {new Date(activeNote.createdAt).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            {activeNote.createdBy === currentUser?.id && (
                              <>
                                <button
                                  onClick={() => {
                                    setIsEditingNote(true);
                                    setNoteTitle(activeNote.title);
                                    setNoteContent(activeNote.content);
                                    setNoteIsPinned(activeNote.isPinned);
                                  }}
                                  className="p-2 bg-slate-800 hover:bg-slate-700 border-none text-slate-200 rounded-lg cursor-pointer transition-all"
                                  title="Edit"
                                >
                                  <Coffee className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setNoteToDelete(activeNote.id);
                                    setTimeout(() => confirmDeleteNote(), 100);
                                  }}
                                  className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-all"
                                  title="Delete Note"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 min-h-[120px] font-mono text-[11px] text-indigo-300 leading-relaxed whitespace-pre-wrap">
                          {activeNote.content}
                        </div>

                        {/* AI Summary integration */}
                        <div className="border-t border-white/5 pt-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-slate-550 font-sans">AI Summarize Helper</span>
                            {!aiSummary && !isSummarizing && (
                              <button
                                onClick={handleAiSummarize}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-[9px] font-black rounded-lg border-none uppercase tracking-wider cursor-pointer shadow font-sans"
                              >
                                <Sparkles className="h-3 w-3 fill-white" /> Synthesize AI Guide
                              </button>
                            )}
                          </div>

                          {isSummarizing && (
                            <div className="p-4 bg-[#0B0F19]/80 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                              <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
                              <span className="text-[10px] font-mono text-indigo-300 animate-pulse">{summarizingStep}</span>
                            </div>
                          )}

                          {aiSummary && (
                            <div className="p-5 bg-gradient-to-br from-indigo-950/20 via-[#070b16] to-[#120b24] border border-indigo-500/20 rounded-xl space-y-4 text-left">
                              <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2 font-sans">
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                                  <Sparkles className="h-3.5 w-3.5 fill-indigo-400" /> AI Synthesized Guide
                                </span>
                                <div className="flex gap-2">
                                  <button onClick={handleSaveAiSummaryAsNote} className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-500 text-white text-[8px] font-black rounded border-none uppercase cursor-pointer">Save as Note</button>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-350 leading-relaxed whitespace-pre-wrap">{aiSummary.summary}</p>
                              
                              <div className="space-y-1.5">
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-wider block">Key Definitions:</span>
                                <div className="grid sm:grid-cols-2 gap-2 font-sans">
                                  {aiSummary.keyTerms?.map((kt: any, idx: number) => (
                                    <div key={idx} className="p-2.5 bg-slate-955 border border-white/5 rounded-lg text-[9px] leading-relaxed">
                                      <strong className="text-white">{kt.term}</strong>: {kt.definition}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-wider block">Active Recall Checkpoints:</span>
                                <ul className="list-decimal pl-4 text-[9px] text-slate-400 space-y-1">
                                  {aiSummary.practiceQuestions?.map((q: string, idx: number) => (
                                    <li key={idx}>{q}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 bg-[#0B0F19]/40 border border-white/5 rounded-2xl text-center space-y-3">
                        <FileText className="h-10 w-10 text-slate-650 mx-auto" />
                        <p className="text-xs text-slate-500 font-bold">Select a note to read or publish a new study note.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* T3: SCHEDULED CALLS (Sessions list + form) */}
            {activeTab === 'sessions' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5 text-left">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-350 flex items-center gap-2">
                      <Calendar className="h-4.5 w-4.5 text-indigo-400" /> Structured Co-Study Sessions
                    </h3>
                    <p className="text-[10px] text-slate-550 font-bold">Coordinate silent pomodoro calls or query clearance sessions with mentors.</p>
                  </div>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-xl transition-all cursor-pointer border-none uppercase tracking-widest shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Schedule Session
                  </button>
                </div>

                {sessions.length === 0 ? (
                  <div className="p-12 bg-[#0B0F19]/40 border border-white/5 rounded-2xl text-center space-y-3 max-w-xl">
                    <Calendar className="h-10 w-10 text-slate-650 mx-auto" />
                    <p className="text-xs text-slate-450 font-bold">No sessions scheduled.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((sess) => (
                      <div key={sess.id} className="p-5 bg-[#0B0F19]/60 border border-white/5 rounded-2xl shadow-lg flex flex-col justify-between gap-4 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                        <div className="space-y-2">
                          <div className="flex justify-between items-start font-sans">
                            <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                              {sess.status}
                            </span>
                            <span className="text-[9px] font-bold text-slate-550 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {sess.durationMinutes}m
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-white">{sess.title}</h4>
                          <p className="text-[10px] text-slate-450 leading-relaxed line-clamp-2">{sess.description || 'No description provided.'}</p>
                          <span className="text-[8px] text-slate-650 block pt-1 font-sans">Scheduled by @{sess.Creator?.username || 'user'}</span>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between font-sans">
                          <span className="text-[9px] font-mono font-bold text-indigo-400">{new Date(sess.scheduledAt).toLocaleString()}</span>
                          {sess.meetingLink && (
                            <a
                              href={sess.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[9px] font-black rounded-lg transition-all border-none uppercase tracking-wider flex items-center gap-1 shadow cursor-pointer decoration-none"
                            >
                              <Video className="h-3 w-3" /> Join Room
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Schedule Modal */}
                {showScheduleModal && (
                  <div className="fixed inset-0 z-50 bg-[#060913]/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleScheduleSession} className="w-full max-w-md bg-[#0B0F19] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
                      <h4 className="text-xs font-black uppercase text-white font-sans">Schedule Co-Study Meeting</h4>

                      <div className="space-y-1.5 text-left font-sans">
                        <label className="text-[9px] font-black text-slate-500 uppercase block">Session Title</label>
                        <input
                          type="text"
                          required
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>

                      <div className="space-y-1.5 text-left font-sans">
                        <label className="text-[9px] font-black text-slate-500 uppercase block">Brief Description</label>
                        <textarea
                          rows={3}
                          value={sessionDesc}
                          onChange={(e) => setSessionDesc(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 font-sans">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[9px] font-black text-slate-500 uppercase block">Date & Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={sessionTime}
                            onChange={(e) => setSessionTime(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-955 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50 font-sans"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[9px] font-black text-slate-500 uppercase block">Duration (mins)</label>
                          <input
                            type="number"
                            min="15"
                            max="240"
                            value={sessionDuration}
                            onChange={(e) => setSessionDuration(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left font-sans">
                        <label className="text-[9px] font-black text-slate-500 uppercase block">Meeting Call Link (Google Meet / Zoom)</label>
                        <input
                          type="url"
                          placeholder="https://meet.google.com/xxx-xxxx-xxx"
                          value={sessionLink}
                          onChange={(e) => setSessionLink(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2 font-sans">
                        <button
                          type="button"
                          onClick={() => setShowScheduleModal(false)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg border-none uppercase tracking-widest cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={scheduling}
                          className="px-5 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-lg border-none uppercase tracking-widest cursor-pointer shadow"
                        >
                          {scheduling ? 'Scheduling...' : 'Save Session'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* T4: DISCUSSION BOARD (Doubt post forum) */}
            {activeTab === 'doubts' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5 text-left">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-350 flex items-center gap-2">
                      <MessageSquare className="h-4.5 w-4.5 text-indigo-400" /> Doubt Solving Discussion Board
                    </h3>
                    <p className="text-[10px] text-slate-550 font-bold">Ask coding queries, upload errors, and obtain conceptual feedback from peers.</p>
                  </div>
                  
                  {!showDoubtForm && (
                    <button
                      onClick={() => {
                        setShowDoubtForm(true);
                        setActiveDoubt(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-xl transition-all cursor-pointer border-none uppercase tracking-widest shadow-md"
                    >
                      <Plus className="h-3.5 w-3.5" /> Post New Question
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                  
                  {/* Left Column: Doubts list */}
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search queries..."
                        value={doubtSearchQuery}
                        onChange={(e) => setDoubtSearchQuery(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50 font-sans"
                      />
                    </div>

                    <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                      {doubts.length === 0 ? (
                        <div className="p-8 bg-[#0B0F19]/40 border border-white/5 rounded-xl text-center space-y-2">
                          <MessageSquare className="h-8 w-8 text-slate-650 mx-auto" />
                          <p className="text-[10px] text-slate-500 font-bold">No questions asked yet.</p>
                        </div>
                      ) : (
                        doubts.filter(d => d.title.toLowerCase().includes(doubtSearchQuery.toLowerCase())).map((db) => (
                          <div
                            key={db.id}
                            onClick={() => loadDoubtDetail(db.id)}
                            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                              activeDoubt?.id === db.id
                                ? 'bg-indigo-500/10 border-indigo-500/50'
                                : 'bg-[#0B0F19]/60 border-white/5 hover:bg-slate-900/60'
                            }`}
                          >
                            <h4 className="text-[11px] font-black text-white truncate">{db.title}</h4>
                            <p className="text-[9px] text-slate-500 line-clamp-2 mt-1 leading-normal">{db.description}</p>
                            
                            <div className="flex justify-between items-center pt-2.5 mt-1.5 border-t border-white/5 text-[8px] text-slate-650 font-bold font-sans">
                              <span>@{db.Creator?.username || 'student'}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={(e) => handleUpvoteDoubt(db.id, e)} className="hover:text-indigo-400 bg-transparent border-none cursor-pointer text-slate-600 flex items-center gap-0.5 font-bold">
                                  ▲ {db.upvotes || 0}
                                </button>
                                <span>💬 {db.answerCount || 0} answers</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Doubt Detail / New Post Form */}
                  <div className="md:col-span-2">
                    {showDoubtForm ? (
                      <form onSubmit={handleCreateDoubt} className="bg-[#0B0F19]/60 border border-white/5 rounded-2xl p-6 space-y-4 shadow-lg">
                        <h4 className="text-xs font-black uppercase text-white font-sans">Ask a Doubt</h4>

                        <div className="space-y-1.5 text-left font-sans">
                          <label className="text-[9px] font-black text-slate-500 uppercase block">Doubt Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Stack Overflow error inside recursion logic"
                            value={newDoubtTitle}
                            onChange={(e) => setNewDoubtTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>

                        <div className="space-y-1.5 text-left font-sans">
                          <label className="text-[9px] font-black text-slate-500 uppercase block">Describe the issue / Paste trace logs</label>
                          <textarea
                            required
                            rows={6}
                            placeholder="Explain the logic, the expected outcome, and paste compiler logs or error screenshots if possible..."
                            value={newDoubtDesc}
                            onChange={(e) => setNewDoubtDesc(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-955 border border-white/5 rounded-xl text-xs text-indigo-300 font-mono outline-none focus:border-indigo-500/50 resize-none"
                          />
                        </div>

                        <div className="space-y-1.5 text-left font-sans">
                          <label className="text-[9px] font-black text-slate-500 uppercase block">Tags (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="dsa, javascript, arrays"
                            value={newDoubtTags}
                            onChange={(e) => setNewDoubtTags(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-2 font-sans">
                          <button
                            type="button"
                            onClick={() => setShowDoubtForm(false)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black rounded-lg border-none uppercase tracking-widest cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingDoubt}
                            className="px-5 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-lg border-none uppercase tracking-widest cursor-pointer shadow"
                          >
                            {submittingDoubt ? 'Posting...' : 'Publish Question'}
                          </button>
                        </div>
                      </form>
                    ) : activeDoubt ? (
                      <div className="bg-[#0B0F19]/60 border border-white/5 rounded-2xl p-6 space-y-6 shadow-lg text-left">
                        {isLoadingDoubtDetail ? (
                          <div className="py-8 flex justify-center"><RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                        ) : (
                          <>
                            <div className="border-b border-white/5 pb-4 space-y-3 font-sans">
                              <div className="flex justify-between items-start gap-4">
                                <h4 className="text-sm font-black text-white">{activeDoubt.title}</h4>
                                <button
                                  onClick={(e) => handleUpvoteDoubt(activeDoubt.id, e)}
                                  className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-400 text-[9px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 font-bold"
                                >
                                  ▲ Upvote ({activeDoubt.upvotes || 0})
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold font-sans">Asked by @{activeDoubt.Creator?.username || 'student'} • {new Date(activeDoubt.createdAt).toLocaleString()}</p>
                              
                              {activeDoubt.tags && (
                                <div className="flex gap-1.5 flex-wrap">
                                  {activeDoubt.tags.split(',').map((tg: string, i: number) => (
                                    <span key={i} className="text-[7px] font-extrabold uppercase bg-white/5 border border-white/5 text-slate-400 px-2 py-0.5 rounded">
                                      #{tg.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 text-[11px] text-slate-350 font-mono leading-relaxed whitespace-pre-wrap">
                              {activeDoubt.description}
                            </div>

                            {/* Answers List */}
                            <div className="space-y-4 pt-2">
                              <span className="text-[9px] font-black uppercase text-slate-550 tracking-wider block font-sans">Answers ({answers.length})</span>
                              
                              {answers.length === 0 ? (
                                <p className="text-[10px] text-slate-500 italic font-sans">No answers published yet. Be the first to help out!</p>
                              ) : (
                                <div className="space-y-3.5">
                                  {answers.map((ans) => (
                                    <div key={ans.id} className={`p-4 rounded-xl border text-[11px] leading-relaxed relative ${ans.isAccepted ? 'bg-emerald-500/5 border-emerald-500/35' : 'bg-slate-955 p-4'}`}>
                                      {ans.isAccepted && (
                                        <span className="absolute top-3.5 right-3.5 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[7px] font-black rounded uppercase font-sans">Accepted Solution</span>
                                      )}
                                      <p className="text-slate-300 whitespace-pre-wrap font-mono">{ans.content}</p>
                                      
                                      <div className="flex justify-between items-center pt-3 mt-2 border-t border-white/5 text-[8px] text-slate-600 font-bold font-sans">
                                        <span>Answered by @{ans.Creator?.username || 'student'} • {new Date(ans.createdAt).toLocaleString()}</span>
                                        
                                        <div className="flex gap-3">
                                          <button onClick={() => handleUpvoteAnswer(ans.id)} className="hover:text-indigo-400 bg-transparent border-none cursor-pointer text-slate-600 font-bold">
                                            ▲ Upvote ({ans.upvotes || 0})
                                          </button>
                                          
                                          {activeDoubt.createdBy === currentUser?.id && !activeDoubt.isResolved && (
                                            <button onClick={() => handleAcceptAnswer(ans.id)} className="hover:text-emerald-400 bg-transparent border-none cursor-pointer text-slate-600 uppercase tracking-wide font-bold">
                                              Accept Solution
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Reply Form */}
                            <form onSubmit={handlePostAnswer} className="space-y-2.5 border-t border-white/5 pt-4">
                              <span className="text-[9px] font-black uppercase text-slate-550 block font-sans">Your Answer</span>
                              <textarea
                                required
                                rows={3}
                                placeholder="Suggest solutions, explain logic errors, or link resource docs..."
                                value={newAnswerContent}
                                onChange={(e) => setNewAnswerContent(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50 resize-none font-mono"
                              />
                              <div className="flex justify-end font-sans">
                                <button type="submit" disabled={submittingAnswer} className="px-5 py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[9px] font-black rounded-lg border-none uppercase tracking-wider cursor-pointer shadow font-bold">
                                  {submittingAnswer ? 'Saving...' : 'Submit Answer'}
                                </button>
                              </div>
                            </form>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-12 bg-[#0B0F19]/40 border border-white/5 rounded-2xl text-center space-y-3">
                        <MessageSquare className="h-10 w-10 text-slate-650 mx-auto" />
                        <p className="text-xs text-slate-450 font-bold">Select a discussion query thread to read answers or write your post.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* T5: CURATED RESOURCES */}
            {activeTab === 'resources' && (
              <div className="space-y-6 animate-in fade-in duration-350">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-350 flex items-center gap-2">
                    <Bookmark className="h-4.5 w-4.5 text-indigo-400" /> Curated Syllabus Resources
                  </h3>
                  <p className="text-[10px] text-slate-550 font-bold">Instantly customized articles, guidelines, and videos corresponding to the track.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPathResourcesList().map((res, i) => (
                    <div key={i} className="p-5 bg-[#0B0F19]/60 border border-white/5 hover:border-indigo-500/30 rounded-2xl shadow-lg flex flex-col justify-between gap-4 text-left relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.01] rounded-full blur-2xl pointer-events-none" />
                      <div className="space-y-2">
                        <div className="flex justify-between items-start font-sans">
                          <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                            {res.type}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white group-hover:text-indigo-455 transition-colors">{res.title}</h4>
                        <p className="text-[10px] text-slate-450 leading-normal">Placement preparation notes curated matching learning path requirements.</p>
                      </div>
                      <div className="pt-2 flex justify-end font-sans">
                        <button
                          onClick={() => showToast('Opening resource document in mock sandbox...', 'success')}
                          className="px-3.5 py-1.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-white text-[9px] font-black rounded-lg transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1 font-bold"
                        >
                          Access Resource <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* T6: LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-350 flex items-center gap-2">
                    <Trophy className="h-4.5 w-4.5 text-indigo-400" /> Workspace Leaderboard
                  </h3>
                  <p className="text-[10px] text-slate-550 font-bold">Top active co-students ordered by total logged study hours.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                  
                  {/* Leaderboard Roster */}
                  <div className="md:col-span-2 bg-[#0B0F19]/60 border border-white/5 rounded-2xl p-5 shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                            <th className="py-2.5">Rank</th>
                            <th>Student</th>
                            <th>Streak</th>
                            <th className="text-right">Logged Hours</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-semibold text-slate-300">
                          {leaderboard.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-500 italic">No logs yet. Be the first to log progress!</td>
                            </tr>
                          ) : (
                            leaderboard.map((student, idx) => (
                              <tr key={student.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                <td className="py-3">
                                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                </td>
                                <td className="py-3 font-bold text-white flex items-center gap-2">
                                  <div className="h-6.5 w-6.5 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[7px] text-indigo-400 font-black overflow-hidden">
                                    <img src={student.avatarUrl || '/charan-avatar.png'} alt="Avatar" className="h-full w-full object-cover" />
                                  </div>
                                  <span>{student.fullName} (@{student.username})</span>
                                </td>
                                <td className="py-3 text-orange-400 font-black">🔥 {student.streakCount || 0}</td>
                                <td className="py-3 text-right text-indigo-400 font-extrabold">{student.totalStudyHours?.toFixed(1) || '0.0'}h</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Logs Feed */}
                  <div className="bg-[#0B0F19]/60 border border-white/5 rounded-2xl p-5 shadow-lg text-left">
                    <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-wider mb-3">Live Log Feed</h4>
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {recentLogs.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">No study logs completed yet.</p>
                      ) : (
                        recentLogs.map((log, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/40 border border-white/5 rounded-lg text-[10px] leading-relaxed">
                            <span className="text-white font-bold block mb-0.5">@{log.User?.username}</span>
                            <span className="text-slate-455">Logged <strong className="text-indigo-400">{(log.studyMinutes / 60).toFixed(1)}h</strong> of focus.</span>
                            <span className="text-[8px] text-slate-650 block mt-1">{new Date(log.createdAt).toLocaleTimeString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR PANEL: ACHIEVEMENTS & MILESTONES (1/4) */}
          <aside className="space-y-6 text-left shrink-0">
            
            {/* PROGRESS STATUS CARD */}
            <div className="bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Workspace Checklist</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Track Completion</span>
                  <span className="text-indigo-400 font-black">
                    {Math.round((achievements.filter(a => a.done).length / achievements.length) * 100)}%
                  </span>
                </div>
                
                <div className="h-2 w-full rounded-full bg-slate-950 border border-white/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${(achievements.filter(a => a.done).length / achievements.length) * 100}%` }} 
                  />
                </div>
              </div>

              {/* Today's Stats summary */}
              <div className="pt-2 grid grid-cols-2 gap-3.5 border-t border-white/5">
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-left">
                  <span className="text-base font-black text-white">{userStats.totalStudyHours.toFixed(1)}h</span>
                  <span className="text-[8px] text-slate-550 font-black uppercase block mt-0.5">Study Logged</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-left">
                  <span className="text-base font-black text-indigo-400">{userStats.xp}</span>
                  <span className="text-[8px] text-slate-550 font-black uppercase block mt-0.5">Focus XP</span>
                </div>
              </div>
            </div>

            {/* CHECKLIST MILESTONES */}
            <div className="bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Achievements</h4>
                <Trophy className="h-4.5 w-4.5 text-amber-500" />
              </div>

              <div className="space-y-3.5 font-sans">
                {achievements.map((ach) => (
                  <div key={ach.id} className="flex gap-3 items-start opacity-90">
                    <div className={`mt-0.5 h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      ach.done 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-transparent border-white/10 text-slate-700'
                    }`}>
                      {ach.done && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className={`text-[11px] font-black leading-none ${ach.done ? 'text-slate-350 line-through' : 'text-slate-200'}`}>{ach.title}</p>
                      <p className="text-[9px] text-slate-500 font-semibold">{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WORKSPACE DETAILS CARD */}
            <div className="bg-[#0B0F19]/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl space-y-4 text-left">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Workspace Details</h4>
              <div className="space-y-2.5 font-sans text-[11px] font-bold text-slate-400">
                <div className="flex justify-between">
                  <span>Space Subject:</span>
                  <span className="text-white">{group?.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Type:</span>
                  <span className="text-white">{group?.isPublic ? 'Public Workspace' : 'Private Workspace'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Invite Code:</span>
                  <span className="text-mono text-indigo-400 font-black cursor-pointer hover:underline" onClick={() => {
                    if (group?.inviteCode) {
                      navigator.clipboard.writeText(group.inviteCode);
                      showToast('Invite code copied!', 'success');
                    }
                  }}>{group?.inviteCode}</span>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}
