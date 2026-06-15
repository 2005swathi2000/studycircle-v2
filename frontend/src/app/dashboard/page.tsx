'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ToastProvider';
import { 
  Users, 
  LogOut, 
  Plus, 
  ChevronRight, 
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
  HelpCircle
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
  | 'bookmarks';

// Helper to determine gender-based profile picture dynamically
const getAvatarByName = (fullName: string | null | undefined): string => {
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

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const dataLoadedRef = useRef(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ streakCount: 0, totalStudyHours: 0.0 });
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

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
    { id: 'g1', text: 'DBMS Unit 3 syllabus overview', completed: true },
    { id: 'g2', text: 'Aptitude Practice Set 5 problems', completed: false },
    { id: 'g3', text: 'Read OS Concurrency section notes', completed: false }
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(4995); // 01:23:15 is 4995 seconds
  const [timerActive, setTimerActive] = useState(false);
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
    if (hoursEarned > 0) {
      setStats(prev => ({
        ...prev,
        totalStudyHours: Number((prev.totalStudyHours + hoursEarned).toFixed(2))
      }));
      showToast(`Stopwatch saved successfully! Added ${hoursEarned} hours to your study log.`, 'success');
    }
    setTimerSeconds(0);
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
        totalStudyHours: statsData.totalStudyHours || 0.0
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
        totalStudyHours: statsData.totalStudyHours || 0.0
      });

      const myGroupsData = await apiRequest('/groups');
      setMyGroups(myGroupsData.groups || []);

      const availData = await apiRequest('/groups/available');
      setAvailableGroups(availData.groups || []);

      if (user?.role === 'admin') {
        const pendingData = await apiRequest('/auth/pending-approvals');
        setPendingApprovals(pendingData.pendingUsers || []);
      }

      const notesData = await apiRequest('/shared-notes');
      setNotesList(notesData.notes || []);

      showToast('Dashboard details synced!', 'success');
    } catch (e: any) {
      showToast('Failed to sync data.', 'error');
    } finally {
      setRefreshing(false);
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
      loadDashboardData(user);
      setActiveTab('groups');
    } catch (err: any) {
      showToast(err.message || 'Failed to join public study circle.', 'error');
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
    const links = [];
    if (user?.role === 'student') {
      links.push(
        { id: 'dashboard', label: 'My Learning Space', icon: LayoutDashboard },
        { id: 'groups', label: 'Study Circles', icon: Users },
        { id: 'rooms', label: 'Live Rooms', icon: Wifi },
        { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
        { id: 'notes', label: 'My Notes', icon: FileText },
        { id: 'sessions', label: 'Sessions', icon: Clock },
        { id: 'progress', label: 'Progress Tracking', icon: TrendingUp },
        { id: 'leaderboard', label: 'Leaderboard', icon: Award },
        { id: 'settings', label: 'Settings', icon: Settings }
      );
    } else if (user?.role === 'mentor') {
      links.push(
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'groups', label: 'Manage Circles', icon: Users },
        { id: 'notes', label: 'Shared Notes', icon: FileText },
        { id: 'sessions', label: 'Class Schedules', icon: Calendar },
        { id: 'progress', label: 'Class Analytics', icon: BarChart2 },
        { id: 'settings', label: 'Settings', icon: Settings }
      );
    } else if (user?.role === 'admin') {
      links.push(
        { id: 'dashboard', label: 'Platform Monitor', icon: LayoutDashboard },
        { id: 'notes', label: 'Platform Shared Notes', icon: FileText },
        { id: 'admin', label: 'Coordinator Approvals', icon: Shield },
        { id: 'settings', label: 'System Settings', icon: Settings }
      );
    }

    return (
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = activeTab === link.id;
          let activeStyles = 'bg-[#5227EB] text-white shadow-sm';
          if (link.id === 'admin') {
            activeStyles = 'bg-rose-600 text-white shadow-sm';
          }
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id as TabType)}
              className={`w-full px-3 py-2.5 rounded-xl text-[11px] font-bold flex items-center gap-3 transition-all cursor-pointer text-left ${
                isActive 
                  ? activeStyles 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" /> {link.label}
            </button>
          );
        })}
      </nav>
    );
  };

  // ==========================================
  // STUDENT DASHBOARD ("MY LEARNING SPACE")
  // ==========================================
  const renderStudentDashboard = () => {
    // Dynamic Goals Checklist calculations
    const totalGoalsCount = goals.length;
    const completedGoalsCount = goals.filter(g => g.completed).length;
    const progressPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;
    
    // Circle dash stroke calculations
    const r = 26;
    const circ = 2 * Math.PI * r; // ~163.36
    const offset = circ - (progressPercent / 100) * circ;

    return (
      <div className="space-y-6">
        {/* Top Header details */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              My Learning Space 🎓
            </h1>
            <p className="text-xs text-slate-500 mt-1">Focus on what matters. Track your streaks and coordinate sessions.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm">
            <Calendar className="h-4 w-4 text-[#5227EB]" />
            <span className="text-[11px] font-extrabold text-slate-700">{formattedDate}</span>
          </div>
        </div>

        {/* 3-Column main student view */}
        <div className="grid lg:grid-cols-10 gap-6">
          
          {/* Main Left/Center column span 7 */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-3 shadow-sm text-left">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-[#5227EB] flex items-center justify-center shrink-0">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block truncate">Classes Joined</span>
                  <div className="text-base font-black text-slate-900 leading-tight mt-0.5">{myGroups.length}</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-3 shadow-sm text-left">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Wifi className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block truncate">Active Rooms</span>
                  <div className="text-base font-black text-slate-900 leading-tight mt-0.5">{activeRoom ? 1 : 0}</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-3 shadow-sm text-left">
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block truncate">Resources Uploaded</span>
                  <div className="text-base font-black text-slate-900 leading-tight mt-0.5">
                    {notesList.filter(n => n.publishedBy === user?.username).length}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Row 1: Hero Card / Focus Session split */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hero & Goals checklist card */}
              <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1F3A35] border border-white/10 rounded-[24px] shadow-lg p-6 flex flex-col justify-between text-left relative overflow-hidden group text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-black text-white leading-tight">{getGreeting()} {user?.fullName ? user.fullName.split(' ')[0] : 'User'} 👋</h2>
                    <p className="text-[10px] text-zinc-450 font-extrabold tracking-wide uppercase mt-1">Today's Goals</p>
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

                {/* Goals Checklist */}
                <div className="space-y-2 mt-4 flex-1">
                  {goals.map(g => (
                    <div key={g.id} className="flex items-center justify-between gap-2 p-2 bg-slate-950/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                      <label className="flex items-center gap-2 cursor-pointer text-left select-none flex-1 min-w-0">
                        <input 
                          type="checkbox" 
                          checked={g.completed}
                          onChange={() => handleToggleGoal(g.id)}
                          className="h-4 w-4 text-teal-500 rounded border-white/10 bg-slate-955 focus:ring-teal-500 focus:ring-offset-slate-900"
                        />
                        <span className={`text-[11px] font-bold truncate ${g.completed ? 'line-through text-zinc-500 font-semibold' : 'text-zinc-200'}`}>
                          {g.text}
                        </span>
                      </label>
                      <button onClick={() => handleDeleteGoal(g.id)} className="p-1 text-zinc-400 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Quick Goal */}
                <form onSubmit={handleAddGoal} className="mt-4 flex gap-2 pt-3 border-t border-white/10 shrink-0">
                  <input 
                    type="text" 
                    placeholder="Add a study goal today..."
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-950/80 border border-white/10 rounded-xl text-[10px] outline-none text-white placeholder-zinc-500 focus:bg-slate-900"
                  />
                  <button type="submit" className="p-2 bg-[#5227EB] hover:bg-[#431cd3] text-white rounded-xl transition-all cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </form>
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

          {/* Sidebar Right Column span 3 */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* User Profile Card */}
            <div className="p-5 bg-gradient-to-b from-[#5227EB] to-[#6366f1] rounded-[24px] text-center text-white flex flex-col justify-center items-center gap-3 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              <div className="h-16 w-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-inner relative overflow-hidden">
                <img src={user?.avatarUrl || getAvatarByName(user?.fullName)} className="absolute inset-0 h-full w-full object-cover" alt="Avatar" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-black truncate max-w-[150px]">{user?.fullName || 'User'}</h3>
                <p className="text-[9px] text-indigo-100 font-bold capitalize mt-0.5">{user?.role === 'mentor' ? 'Mentor' : user?.role === 'admin' ? 'Admin' : 'B.Tech Student'}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 border border-white/15 rounded-full text-[9px] font-bold tracking-wide">
                Level {Math.max(1, Math.floor(stats.totalStudyHours / 15) + 1)} ⭐️
              </span>
              <button 
                onClick={() => setActiveTab('settings')}
                className="mt-1 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[9px] font-extrabold transition-all cursor-pointer flex items-center gap-1 border border-white/10"
              >
                <Settings className="h-3 w-3" /> Edit Profile
              </button>
            </div>

            {/* Overall Content Progress Circle Card */}
            <div className="p-5 bg-gradient-to-br from-[#0F172A] via-[#312E81]/40 to-[#1E293B] border border-white/10 rounded-[24px] shadow-lg text-left text-white">
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-3">Overall Progress</h3>
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="46" 
                      stroke="#38BDF8" 
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
                    <span className="text-[7px] text-zinc-400 font-black uppercase tracking-wide block mt-0.5">Weekly Goal</span>
                  </div>
                </div>
                <div className="text-center mt-3 space-y-1">
                  <p className="text-[10px] font-extrabold text-zinc-200">
                    {stats.totalStudyHours.toFixed(1)} / 20.0 Hours Completed
                  </p>
                  <p className="text-[8px] text-zinc-450 font-bold">
                    Targeting B.Tech placement readiness logs
                  </p>
                </div>
              </div>
            </div>

            {/* Streak card */}
            <div className="p-5 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#312E81]/40 border border-white/10 rounded-[24px] shadow-lg text-left text-white">
              <div className="flex items-center gap-1.5 mb-3">
                <Flame className="h-4.5 w-4.5 text-orange-500 fill-orange-500/10" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Consistency Streak</h3>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-950/20 border border-orange-500/20 rounded-2xl">
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Flame className="h-4.5 w-4.5 fill-orange-500/20" />
                </div>
                <div>
                  <div className="text-sm font-black text-orange-400">{stats.streakCount} Days active</div>
                  <p className="text-[8px] text-zinc-400 font-bold">You are in the top 5% of your cluster!</p>
                </div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="p-5 bg-gradient-to-br from-[#0F172A] via-[#312E81]/40 to-[#1E293B] border border-white/10 rounded-[24px] shadow-lg text-left text-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Leaderboard</h3>
                <button onClick={() => setActiveTab('leaderboard')} className="text-[8px] font-black text-zinc-450 hover:text-indigo-400 uppercase cursor-pointer">
                  Details
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Charan', hours: 18.2, streak: 8, avatar: '/charan-avatar.png' },
                  { name: user?.fullName ? `${user.fullName} (You)` : 'Swathi (You)', hours: 15.5, streak: 7, avatar: user?.avatarUrl || getAvatarByName(user?.fullName || 'Swathi') },
                  { name: 'Bhagya', hours: 12.0, streak: 6, avatar: '/bhagya-avatar.png' }
                ].map((student, rank) => (
                  <div key={rank} className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-black text-zinc-450 w-4">#{rank + 1}</span>
                      <div className="h-7 w-7 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                        <img src={student.avatar} className="h-full w-full object-cover" alt={student.name} />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-200 truncate">{student.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-extrabold text-white">{student.hours}h</div>
                      <div className="text-[8px] text-zinc-450 font-bold">{student.streak} streak</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Quick Widget */}
            <div className="p-5 bg-gradient-to-br from-[#134E4A] via-[#1F3A35] to-[#0F172A] border border-white/10 rounded-[24px] shadow-lg text-left text-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">My Study Notes</h3>
                <button onClick={() => setActiveTab('notes')} className="text-[8px] font-black text-zinc-450 hover:text-teal-400 uppercase cursor-pointer">
                  All Notes
                </button>
              </div>

              <div className="space-y-2">
                {notesList.slice(0, 3).map((note) => (
                  <div key={note.id} className="p-2 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-[10px] font-extrabold text-zinc-200 truncate leading-tight">{note.name}</h4>
                        <span className="text-[8px] text-zinc-450 font-semibold">{note.size}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleToggleNoteBookmark(note.id)} 
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${note.type === 'bookmark' ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-white/10 text-zinc-400 hover:text-white'}`}
                      >
                        <Bookmark className="h-3 w-3 fill-current" />
                      </button>
                      <button 
                        onClick={() => handleDownloadNote(note.id, note.name)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${note.downloaded ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-white/10 text-zinc-400 hover:text-white'}`}
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
  // MENTOR DASHBOARD ("CLASSROOM COMMAND CENTER")
  // ==========================================
  const renderMentorDashboard = () => {


    const managedGroupsCount = myGroups.length;
    const publishedNotesCount = notesList.filter(n => n.publishedBy?.includes(user?.fullName || '')).length;
    const scheduledSessionsCount = mockSessions.length;

    // Dynamic stats that start at 0 and grow
    const healthPercent = isNewMentor ? 0 : Math.min(100, 50 + managedGroupsCount * 10 + publishedNotesCount * 5 + scheduledSessionsCount * 5);
    const attendanceRate = isNewMentor ? 0 : Math.min(100, 65 + scheduledSessionsCount * 4);
    const activeStudentsPercent = isNewMentor ? 0 : Math.min(100, 70 + managedGroupsCount * 5 + publishedNotesCount * 3);
    const activeSessionsPercent = isNewMentor ? 0 : Math.min(100, 60 + scheduledSessionsCount * 5);

    const healthText = healthPercent === 0 ? 'N/A' : healthPercent >= 85 ? 'Excellent' : healthPercent >= 60 ? 'Good' : 'Needs Focus';
    const healthStrokeColor = healthPercent >= 85 ? '#10B981' : healthPercent >= 60 ? '#F59E0B' : healthPercent > 0 ? '#EF4444' : '#64748B';

    // Insights text
    const dynamicObservation = isNewMentor
      ? "Initialize study circles and schedule sessions to gather student attendance benchmarks."
      : `Mid-week active study rooms helped drive student engagement up to ${attendanceRate}%. Operating systems sessions still show minor delays.`;

    // AI recommendations
    const dynamicRecommendations = [];
    if (isNewMentor) {
      dynamicRecommendations.push({
        id: 'rec-1',
        title: 'Initialize Your First Study Circle',
        description: 'You have not created any study circles yet. Get started by initializing a workspace.',
        type: 'primary',
        actionLabel: 'Initialize Circle',
        action: () => setShowCreateModal(true)
      });
      dynamicRecommendations.push({
        id: 'rec-2',
        title: 'Publish Syllabus Reference Notes',
        description: 'New mentors are encouraged to upload lecture summaries or midterm study plans.',
        type: 'info',
        actionLabel: 'Publish Shared Note',
        action: () => setActiveTab('notes')
      });
    } else {
      dynamicRecommendations.push({
        id: 'rec-1',
        title: 'CN study group engagement dropped 12% in the last 3 days.',
        description: 'Schedule a revision session to help students recover focus.',
        type: 'warning',
        actionLabel: 'Schedule revision session',
        action: () => triggerEditSession(mockSessions[1] || mockSessions[0])
      });
      dynamicRecommendations.push({
        id: 'rec-2',
        title: 'DBMS study group completed 100% of weekly goal metrics!',
        description: 'Post congratulations to the group channel to keep motivation high.',
        type: 'success',
        actionLabel: 'Post Congratulations',
        action: () => triggerPrefilledAnnouncement("Outstanding progress, DBMS scholars! Your streak consistency and live study room attendance this week are exemplary. Let's maintain this momentum.")
      });
    }

    const dynamicGroupsPerformance = isNewMentor
      ? []
      : myGroups.map((g, idx) => {
          const percents = [91, 65, 43, 80, 55];
          const colors = ['bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-indigo-500', 'bg-amber-500'];
          return {
            name: g.name,
            percent: percents[idx % percents.length],
            color: colors[idx % colors.length]
          };
        });

    return (
      <div className="space-y-6 text-left">
        {/* Banner greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">Classroom Command Center 👨‍🏫</h1>
            <p className="text-xs text-slate-500 mt-1">Real-time statistics, active syllabus cohorts, and consistency risk monitors.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm">
            <Calendar className="h-4 w-4 text-[#5227EB]" />
            <span className="text-[11px] font-extrabold text-slate-700">{formattedDate}</span>
          </div>
        </div>

        {/* Dashboard layout rows */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Col 1: Community Health Score */}
          <div className="p-6 bg-gradient-to-br from-[#134E4A] via-[#1F3A35] to-[#0F172A] border border-white/10 rounded-[24px] shadow-lg flex flex-col justify-between text-white">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Community Health</h3>
              <p className="text-[10px] text-zinc-450 leading-tight">Average student participation across syllabus groups</p>
            </div>

            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="52" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="52" 
                    stroke={healthStrokeColor} 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray="326.72" 
                    strokeDashoffset={326.72 - (326.72 * (healthPercent / 100))}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white leading-none">{healthPercent}%</span>
                  <span className="text-[8px] font-extrabold uppercase tracking-wide block mt-1" style={{ color: healthStrokeColor }}>{healthText}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2 text-[10px] font-bold text-zinc-350">
              <div className="flex justify-between">
                <span>Active Attendance rate:</span>
                <span className="text-white">{attendanceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Active Students:</span>
                <span className="text-white">{activeStudentsPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span>Shared Syllabus Notes:</span>
                <span className="text-white">{publishedNotesCount} shared</span>
              </div>
              <div className="flex justify-between">
                <span>Session Participation:</span>
                <span className="text-white">{activeSessionsPercent}%</span>
              </div>
            </div>
          </div>

          {/* Col 2: Attendance Insights */}
          <div className="p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1F3A35] border border-white/10 rounded-[24px] shadow-lg flex flex-col justify-between text-white">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Attendance Insights</h3>
              <p className="text-[10px] text-zinc-450 leading-tight">Weekly average session attendance benchmarks</p>
            </div>

            <div className="py-6 flex items-center justify-around gap-4">
              <div className="text-center p-4 bg-slate-955/40 border border-white/5 rounded-2xl flex-1">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block mb-1">Last Week</span>
                <span className="text-xl font-black text-zinc-400">{isNewMentor ? 0 : 72}%</span>
              </div>
              
              <div className="text-center p-4 bg-[#5227EB]/10 border border-[#5227EB]/30 rounded-2xl flex-1 relative">
                <span className="text-[8px] text-indigo-400 font-extrabold uppercase block mb-1">This Week</span>
                <span className="text-xl font-black text-indigo-200">{attendanceRate}%</span>
                {!isNewMentor && (
                  <span className="absolute -top-2 -right-1.5 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                    +13%
                  </span>
                )}
              </div>
            </div>

            <div className="text-[10px] text-zinc-300 font-semibold leading-relaxed bg-slate-955/40 p-3.5 rounded-xl border border-white/5">
              💡 <b>Observation:</b> {dynamicObservation}
            </div>
          </div>

          {/* Col 3: AI Recommendations (Actionable) */}
          <div className="p-6 bg-gradient-to-br from-[#0F172A] via-[#312E81]/40 to-[#1E293B] border border-white/10 rounded-[24px] shadow-lg flex flex-col justify-between text-white">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">AI Recommendations</h3>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {dynamicRecommendations.map((rec) => (
                <div key={rec.id} className={`p-3 rounded-xl space-y-2 border ${
                  rec.type === 'primary' ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-300' :
                  rec.type === 'warning' ? 'bg-red-950/20 border-red-500/20 text-red-300' :
                  rec.type === 'success' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' :
                  'bg-slate-900/40 border-white/10 text-slate-350'
                }`}>
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-extrabold leading-tight text-white">{rec.title}</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5 font-semibold leading-snug">{rec.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={rec.action}
                    className={`w-full py-1 text-[8px] font-extrabold rounded-lg border uppercase tracking-wider cursor-pointer transition-colors ${
                      rec.type === 'primary' ? 'bg-indigo-950/40 hover:bg-indigo-900/40 border-indigo-500/30 text-indigo-300' :
                      rec.type === 'warning' ? 'bg-red-950/40 hover:bg-red-900/40 border-red-500/30 text-red-300' :
                      rec.type === 'success' ? 'bg-emerald-950/40 hover:bg-emerald-900/40 border-emerald-500/30 text-emerald-300' :
                      'bg-slate-900/40 hover:bg-slate-800 border-white/10 text-slate-300'
                    }`}
                  >
                    {rec.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Next Row: At-risk students, Group heatmap & Study trends */}
        <div className="grid lg:grid-cols-10 gap-6">
          
          {/* At-Risk Students card (4 columns span) */}
          <div className="lg:col-span-4 p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1F3A35] border border-white/10 rounded-[24px] shadow-lg flex flex-col justify-between text-white">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-400" /> Students Losing Consistency
                </h3>
                <span className="text-[8px] bg-red-950/40 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wide">
                  Attention required
                </span>
              </div>
              <p className="text-[10px] text-zinc-450 mb-4">Prompt nudge alerts encourage focus recovery</p>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {isNewMentor ? (
                <div className="py-12 text-center text-zinc-450 font-bold border border-dashed border-white/10 rounded-2xl bg-slate-950/20 text-xs">
                  All students are consistent!
                </div>
              ) : (
                atRiskStudents.map((stud) => (
                  <div key={stud.id} className="p-3 bg-slate-955/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 font-semibold">
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{stud.name}</h4>
                      <span className="text-[9px] font-semibold text-zinc-400 block mt-0.5">{stud.detail}</span>
                    </div>
                    
                    {stud.nudged ? (
                      <span className="px-2.5 py-1 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-lg uppercase tracking-wide shrink-0">
                        Nudged ⚡
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleNudgeStudent(stud.id, stud.name)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-750 text-white text-[9px] font-black rounded-lg uppercase tracking-wide shrink-0 transition-colors cursor-pointer"
                      >
                        Nudge Student
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Group Performance Heatmap card (3 columns span) */}
          <div className="lg:col-span-3 p-6 bg-gradient-to-br from-[#1E293B] via-[#134E4A]/50 to-[#0F172A] border border-white/10 rounded-[24px] shadow-lg flex flex-col justify-between text-white">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Group Performance</h3>
              <p className="text-[10px] text-zinc-400 mb-4">Instantly know which study circles are active or failing</p>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {isNewMentor ? (
                <div className="py-12 text-center text-zinc-455 font-bold border border-dashed border-white/10 rounded-2xl bg-slate-950/20 text-xs">
                  No active groups.
                </div>
              ) : (
                dynamicGroupsPerformance.map((grp, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-extrabold text-zinc-300">
                      <span>{grp.name}</span>
                      <span>{grp.percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div className={`h-full ${grp.color} rounded-full transition-all duration-500`} style={{ width: `${grp.percent}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Study Trends Analytics card (3 columns span) */}
          <div className="lg:col-span-3 p-6 bg-gradient-to-br from-[#0F172A] via-[#312E81]/40 to-[#1E293B] border border-white/10 rounded-[24px] shadow-lg flex flex-col justify-between text-white">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Study Trends Analytics</h3>
              <p className="text-[10px] text-zinc-450 mb-4">Aggregated student behavior patterns</p>
            </div>

            {isNewMentor ? (
              <div className="py-12 text-center text-zinc-450 font-bold border border-dashed border-white/10 rounded-2xl bg-slate-950/20 text-xs flex-1 flex items-center justify-center">
                No trend data yet. Insights will accumulate as students study.
              </div>
            ) : (
              <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#6366f1] shrink-0 shadow-sm">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-wide">Most Active Time</span>
                    <div className="text-[11px] font-black text-white">7:00 PM - 10:00 PM</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-wide">Most Studied Subject</span>
                    <div className="text-[11px] font-black text-white">DBMS (Database Mgmt)</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 shrink-0 shadow-sm">
                    <TrendingUp className="h-4.5 w-4.5 rotate-180" />
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-wide">Lowest Engagement</span>
                    <div className="text-[11px] font-black text-red-400">Operating Systems</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Row 3: Actions Panel, Rankings Table */}
        <div className="grid lg:grid-cols-10 gap-6">
          
          {/* Actions Panel (4 columns span) */}
          <div className="lg:col-span-4 p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/10 rounded-[24px] shadow-lg flex flex-col justify-between text-white">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Mentor Actions</h3>
              <p className="text-[10px] text-zinc-450 mb-4">Command panel to dispatch events, notes, and metrics reports</p>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 justify-center">
              <button 
                onClick={() => setShowSessionModal(true)}
                className="p-3 bg-slate-955/40 border border-white/5 hover:border-[#5227EB] rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-indigo-950/40 text-[#6366f1] flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-black text-zinc-200">Create Session</span>
              </button>

              <button 
                onClick={() => setShowAssignmentModal(true)}
                className="p-3 bg-slate-955/40 border border-white/5 hover:border-[#5227EB] rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-purple-955/40 text-purple-400 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-black text-zinc-200">Create Assignment</span>
              </button>

              <button 
                onClick={() => setShowAnnouncementModal(true)}
                className="p-3 bg-slate-955/40 border border-white/5 hover:border-[#5227EB] rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-955/40 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-black text-zinc-200">Post Announcement</span>
              </button>

              <button 
                onClick={() => {
                  showToast('Preparing performance analytics report...', 'info');
                  setTimeout(() => {
                    showToast('Report CSV compiled and downloaded.', 'success');
                  }, 1500);
                }}
                className="p-3 bg-slate-955/40 border border-white/5 hover:border-[#5227EB] rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-pink-955/40 text-pink-400 flex items-center justify-center">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-black text-zinc-200">Generate Report</span>
              </button>
            </div>
          </div>

          {/* Student Ranking Table (6 columns span) */}
          <div className="lg:col-span-6 p-6 bg-gradient-to-br from-[#0F172A] via-[#312E81]/40 to-[#1E293B] border border-white/10 rounded-[24px] shadow-lg flex flex-col justify-between text-white">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mb-2">Student consistency board</h3>
              <p className="text-[10px] text-zinc-450 mb-4">Syllabus trackers and focus hours in Vijayawada cluster</p>
            </div>

            <div className="overflow-x-auto flex-1 flex flex-col justify-center">
              {isNewMentor ? (
                <div className="py-12 text-center text-zinc-450 font-bold border border-dashed border-white/10 rounded-2xl bg-slate-950/20 text-xs">
                  No student logs recorded.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-450 text-[10px] uppercase font-black tracking-wider">
                      <th className="pb-2">Student</th>
                      <th className="pb-2">Study Hours</th>
                      <th className="pb-2 text-right">Streak Count</th>
                    </tr>
                  </thead>
                  <tbody className="font-extrabold text-zinc-300">
                    {[
                      { name: user?.fullName ? `${user.fullName} Vijayawada` : 'Swathi Vijayawada', hours: 18.2, streak: 8, avatar: user?.avatarUrl || getAvatarByName(user?.fullName || 'Swathi') },
                      { name: 'Bhagya Guntur', hours: 15.0, streak: 6, avatar: '/bhagya-avatar.png' },
                      { name: 'Rathna Visakhapatnam', hours: 13.5, streak: 5, avatar: '/rathna-avatar.png' }
                    ].map((student, idx) => (
                      <tr key={idx} className="border-b border-white/5 last:border-0">
                        <td className="py-2.5 flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                            <img src={student.avatar} className="h-full w-full object-cover" alt={student.name} />
                          </div>
                          <span className="text-white truncate">{student.name}</span>
                        </td>
                        <td className="py-2.5">{student.hours}h Logged</td>
                        <td className="py-2.5 text-right font-black text-orange-400">{student.streak} Days 🔥</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

      </div>
    );
  };

  // ==========================================
  // ADMIN DASHBOARD ("PLATFORM MONITOR")
  // ==========================================
  const renderAdminDashboard = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Title greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">Platform Command Console 🛡️</h1>
            <p className="text-xs text-slate-500 mt-1">Platform health diagnostics, active socket streams, and coordinator permissions.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 border border-slate-200 rounded-xl shadow-sm">
            <Calendar className="h-4 w-4 text-[#5227EB]" />
            <span className="text-[11px] font-extrabold text-slate-700">{formattedDate}</span>
          </div>
        </div>

        {/* Row 1: KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users Registered', val: '1,248', change: '+12% this week', bg: 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400' },
            { label: 'Certified Mentors Approved', val: '56', change: '+4 this week', bg: 'bg-purple-955/40 border-purple-500/20 text-purple-400' },
            { label: 'Active Study Circles', val: '84', change: 'Across 3 clusters', bg: 'bg-emerald-955/40 border-emerald-500/20 text-emerald-400' },
            { label: 'Active Video Rooms', val: '12', change: '24 students active', bg: 'bg-orange-955/40 border-orange-500/20 text-orange-400' }
          ].map((card, idx) => (
            <div key={idx} className="p-5 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/10 rounded-[24px] shadow-lg flex items-center gap-4 text-white">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${card.bg.split(' ')[0]} ${card.bg.split(' ')[1]} ${card.bg.split(' ')[2]}`}>
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wide">{card.label}</span>
                <div className="text-lg font-black text-white leading-tight mt-0.5">{card.val}</div>
                <span className="text-[8px] text-zinc-400 font-bold block mt-0.5">{card.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Approvals, real-time Logs terminal */}
        <div className="grid lg:grid-cols-10 gap-6">
          
          {/* Coordinator approvals console span 5 */}
          <div className="lg:col-span-5 p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1F3A35] border border-white/10 rounded-[24px] shadow-lg flex flex-col justify-between text-white">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <UserCheck className="h-4.5 w-4.5 text-rose-400" /> Pending Coordinator Registrations
                </h3>
              </div>
              <p className="text-[10px] text-zinc-400 mb-4">Approved credentials receive full syllabus editing rights</p>
            </div>

            <div className="flex-1 space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {pendingApprovals.length === 0 ? (
                <div className="py-12 border border-dashed border-white/10 rounded-2xl text-center space-y-2 bg-slate-950/20">
                  <UserCheck className="h-7 w-7 text-zinc-400 mx-auto" />
                  <p className="text-xs text-zinc-300 font-bold">All Coordinators verified!</p>
                  <p className="text-[9px] text-zinc-455">No registrations are awaiting approvals.</p>
                </div>
              ) : (
                pendingApprovals.map((pUser) => (
                  <div key={pUser.id} className="p-3 bg-slate-955/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="text-xs font-black text-white leading-none">{pUser.fullName}</h4>
                      <div className="text-[9px] text-zinc-400 flex items-center gap-1.5 mt-1 capitalize">
                        <span className="font-mono text-zinc-400">@{pUser.username}</span>
                        <span>•</span>
                        <span className="text-rose-400 font-bold">{pUser.role}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleApproveUser(pUser.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black rounded-lg uppercase tracking-wide shrink-0 shadow-sm transition-colors cursor-pointer"
                    >
                      Approve Coordinator
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System logs live terminal span 5 */}
          <div className="lg:col-span-5 p-6 bg-slate-950 border border-slate-900 rounded-[24px] text-slate-200 flex flex-col justify-between h-[380px] shadow-2xl relative">
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#5227EB]/10 border border-[#5227EB]/25 px-2 py-0.5 rounded text-[8px] font-black text-[#6366f1] tracking-widest uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live Server Monitoring
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2 font-mono">
                <Terminal className="h-4.5 w-4.5 text-[#5227EB]" /> System Diagnostic Logs
              </h3>
              <p className="text-[8px] text-slate-500 mb-4 font-mono">Real-time platform updates from backend routing modules</p>
            </div>

            {/* Terminal console */}
            <div className="flex-1 bg-black/50 border border-slate-900/50 p-4 rounded-xl font-mono text-[9px] text-[#22c55e] overflow-y-auto space-y-1 text-left scrollbar-thin">
              {adminLogs.map((log, index) => (
                <div key={index} className="leading-normal hover:bg-white/5 px-1 rounded transition-colors whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (notif.groupName) {
      return myGroups.some(g => g.name.trim().toLowerCase() === (notif.groupName || '').trim().toLowerCase());
    }
    return true;
  });

  const unreadCount = filteredNotifications.filter(n => n.unread).length;

  return (
    <div 
      className="min-h-screen text-slate-800 font-sans flex relative overflow-hidden bg-[#D4D4FF]"
    >
      
      {/* 1. Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 z-30">
        
        {/* Branding header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3">
          {/* Unique collaborative ring logo */}
          <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
            {/* Outer gradient ring representing collaborative circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5227EB] via-indigo-400 to-[#E11D48] opacity-90 shadow-md animate-pulse" />
            {/* Inner center */}
            <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center text-white font-bold">
              <BookOpen className="h-4 w-4 text-[#5227EB]" />
            </div>
          </div>
          <div className="text-left leading-none">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 block">
              StudyCircle
            </span>
            <span className="text-[8px] font-semibold text-slate-400">
              Collaborative Learning Workspace
            </span>
          </div>
        </div>

        {/* Profile Card */}
        <div 
          onClick={() => setActiveTab('settings')}
          className="p-4 border-b border-slate-150 bg-slate-50/30 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/50 transition-all group"
          title="Click to Edit Profile"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group-hover:border-indigo-300 transition-colors">
              <img 
                src={user?.avatarUrl || getAvatarByName(user?.fullName)} 
                className="absolute inset-0 h-full w-full object-cover" 
                alt="Avatar" 
              />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-650 transition-colors truncate">{user?.fullName || 'User'}</div>
              <div className="text-[10px] font-bold text-slate-400 capitalize mt-0.5">{user?.role || 'Guest'}</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#5227EB] transition-colors shrink-0" />
        </div>

        {/* Dynamic Sidebar Links */}
        {renderSidebar()}

        {/* Sidebar Bottom illustration */}
        <div className="p-4 border-t border-slate-100 bg-[#F8FAFC]/50 m-4 rounded-[20px] border border-slate-200/60 text-center space-y-3 shadow-sm shrink-0">
          <div className="h-20 w-full rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-indigo-100/50">
            <img src="/students-illustration.png" className="h-16 w-auto object-contain" alt="Study illustration" />
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold text-slate-800">Focus Together.</h4>
            <h4 className="text-[11px] font-extrabold text-slate-800">Achieve More.</h4>
            <p className="text-[9px] text-slate-400 mt-1 leading-snug">StudyCircle makes studying structured and effective.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
          >
            Create Group
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Header toolbar */}
        <header className="w-full h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          
          <div className="relative w-96 text-left">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search groups, notes, sessions..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Interactive Notifications Bell */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative cursor-pointer p-2 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-200"
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
                            notif.type === 'report' ? 'bg-indigo-50/10 text-indigo-400' :
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
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold text-slate-700">{user?.fullName ? user.fullName.split(' ')[0] : 'User'}</span>
            </div>

            <button 
              onClick={handleLogout}
              className="px-3 py-2 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-2"
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
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-[#5227EB]" /> Study Circles Workspace
                </h3>
                {(user?.role === 'admin' || user?.role === 'mentor') && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-150 text-[#5227EB] rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> Initialize Circle
                  </button>
                )}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {myGroups.length === 0 ? (
                    <div className="p-12 bg-white border border-slate-200 rounded-[24px] text-center space-y-3 shadow-sm">
                      <Users className="h-8 w-8 text-slate-350 mx-auto" />
                      <p className="text-xs text-slate-500 font-bold">No workspaces joined.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {myGroups.map((group) => (
                        <div key={group.id} className="p-5 bg-white border border-slate-200 hover:border-indigo-500/20 rounded-[24px] transition-all duration-300 flex flex-col justify-between gap-4 shadow-sm group">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                                {group.subject || 'Engineering'}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 font-bold">Code: {group.inviteCode}</span>
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-650 transition-colors">{group.name}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{group.description || 'No description provided.'}</p>
                          </div>
                          <Link
                            href={`/group/${group.id}`}
                            className="w-full py-2 bg-slate-50 border border-slate-200 hover:border-[#5227EB] hover:bg-[#5227EB] hover:text-white text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all text-center"
                          >
                            Enter Workspace <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-4 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Join a New Group</h3>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Enter an invite code provided by your mentor or classmate to join their group study circle.</p>
                    <form onSubmit={handleJoinCircle} className="space-y-3">
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Invite Code"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs outline-none text-center font-mono tracking-widest text-slate-750"
                      />
                      <button type="submit" className="w-full py-2 bg-[#5227EB] text-white text-xs font-bold rounded-xl shadow-sm">
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
            <div className="space-y-6 text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Wifi className="h-4.5 w-4.5 text-[#5227EB]" /> Live Study Rooms Board
              </h3>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {availableGroups.length === 0 ? (
                    <div className="p-12 bg-white border border-slate-200 rounded-[24px] text-center shadow-sm">
                      <p className="text-xs text-slate-500 font-semibold">No other public study circles are available to join.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {availableGroups.map((g) => (
                        <div key={g.id} className="p-5 bg-white border border-slate-200 rounded-[24px] transition-all duration-300 flex flex-col justify-between gap-4 shadow-sm group">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded">
                                Public Lounge
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 font-bold">Code: {g.inviteCode}</span>
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-650 transition-colors">{g.name}</h4>
                            <p className="text-xs text-slate-500">{g.description || 'No description provided.'}</p>
                          </div>
                          <button
                            onClick={() => handleJoinPublicCircle(g.id)}
                            className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-[#5227EB] hover:text-white text-slate-650 text-xs font-bold rounded-xl transition-all"
                          >
                            Quick Join Public Room
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-3 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Virtual Study Lounge</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Public workspaces do not require private invite codes. B.Tech & degree students from Vijayawada, Guntur, and Vizag clusters can enter directly to co-study.
                    </p>
                  </div>
                </div>
              </div>
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
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
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
                  <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-3 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Structured Study Circles</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Schedules coordinate exam revision timelines and interview prep rounds. Students receive automatic alerts and countdown notifications for booked sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Progress Tracking or Class Analytics */}
          {activeTab === 'progress' && (
            <div className="space-y-6 text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-[#5227EB]" /> 
                {user?.role === 'mentor' ? 'Classroom Analytics Dashboard' : 'My Study Progress'}
              </h3>

              {user?.role === 'mentor' ? (
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                  {/* Class Focus Distribution Card */}
                  <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-4 shadow-sm text-left">
                    <h4 className="text-xs font-black uppercase text-slate-400">Class Focus Distribution</h4>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold">
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
                          <div className="flex justify-between text-[10px] font-extrabold text-slate-750">
                            <span>{item.label}</span>
                            <span>{item.hours}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div className="h-full bg-[#5227EB] rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject Performance Benchmarks Card */}
                  <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-4 shadow-sm flex flex-col justify-between text-left">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Subject Performance Benchmarks</h4>
                      <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                        {isNewMentor ? (
                          <>Syllabus coverage milestones, top performers, and low-engagement alerts will accumulate here once students start desking inside workspaces.</>
                        ) : (
                          <>DBMS student cohorts show excellent syllabus coverage milestones, while Operating Systems groups continue to fall behind the mid-term target margins.</>
                        )}
                      </p>
                    </div>
                    {isNewMentor ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] text-slate-500 font-bold space-y-2">
                        <p>No performance logs recorded yet. Top performers and low engagement alerts will populate as students study.</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[10px] text-indigo-800 font-bold space-y-2">
                        <p>🚀 Top Performer: DBMS (91% Engagement)</p>
                        <p>⚠️ Alert: Operating Systems (65% Engagement - scheduled revision suggested)</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                 <div className="space-y-6 max-w-4xl">
                   {/* Grid 1: Basic Stats */}
                   <div className="grid md:grid-cols-2 gap-6">
                     <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-4 shadow-sm">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-sm">
                           <Flame className="h-5 w-5 fill-orange-500/10" />
                         </div>
                         <div>
                           <h4 className="text-xs font-black text-slate-900">Study Consistency</h4>
                           <p className="text-[10px] text-slate-400">Current day streak logs</p>
                         </div>
                       </div>
                       <div className="text-4xl font-extrabold text-orange-500">{stats.streakCount} Days</div>
                       <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                         You have studied for {stats.streakCount} consecutive days! Keep joining live rooms to maintain your consistency streak and earn placement badges.
                       </p>
                     </div>

                     <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-4 shadow-sm">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                           <Clock className="h-5 w-5" />
                         </div>
                         <div>
                           <h4 className="text-xs font-black text-slate-900">Accumulated Focus</h4>
                           <p className="text-[10px] text-slate-400">Total hours spent desking</p>
                         </div>
                       </div>
                       <div className="text-4xl font-extrabold text-emerald-650">{stats.totalStudyHours.toFixed(2)} Hrs</div>
                       <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                         You spent a total of {stats.totalStudyHours.toFixed(2)} hours desking on note boards and study circles. Check your dashboard leaderboards for batch rankings.
                       </p>
                     </div>
                   </div>

                   {/* Grid 2: Weekly Allocation & Subject Breakdown / Zero-State Check */}
                    {stats.totalStudyHours === 0 ? (
                      <div className="p-8 bg-white border border-slate-200 rounded-[28px] shadow-sm text-center space-y-4 max-w-4xl">
                        <div className="h-16 w-16 bg-indigo-50 text-[#5227EB] rounded-full flex items-center justify-center mx-auto shadow-inner">
                          <TrendingUp className="h-8 w-8" />
                        </div>
                        <h4 className="text-sm font-black text-slate-900">Your Study Progress Tracker is Ready!</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          Since you are a new user, you don't have any study hours logged yet. Start a focus session from your learning space stopwatch or join a live room to begin charting your progress.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-4 text-left pt-2 max-w-xl mx-auto">
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-1">
                            <span className="text-[10px] font-black text-indigo-650 block uppercase tracking-wider">1. Join Circles</span>
                            <span className="text-[9px] text-slate-400 leading-snug">Find study cohorts or enter invite codes to collaborate.</span>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-1">
                            <span className="text-[10px] font-black text-indigo-650 block uppercase tracking-wider">2. Focus Timer</span>
                            <span className="text-[9px] text-slate-400 leading-snug">Log custom study sessions with the Learning Space stopwatch timer.</span>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-1">
                            <span className="text-[10px] font-black text-indigo-650 block uppercase tracking-wider">3. Rank Up</span>
                            <span className="text-[9px] text-slate-400 leading-snug">Level up and rank on placement leaderboards.</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-4 shadow-sm">
                          <h4 className="text-xs font-black uppercase text-slate-400">Weekly Focus Allocation</h4>
                          <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                            Your daily desking hours logged across all desking rooms this week.
                          </p>
                          <div className="flex items-end justify-between gap-2 h-28 pt-4">
                            {[
                              { day: 'M', hours: 2.5, percent: 70 },
                              { day: 'T', hours: 1.5, percent: 42 },
                              { day: 'W', hours: 3.0, percent: 85 },
                              { day: 'T', hours: 2.0, percent: 56 },
                              { day: 'F', hours: 1.0, percent: 28 },
                              { day: 'S', hours: 3.5, percent: 100 },
                              { day: 'S', hours: 0.0, percent: 0 }
                            ].map((d, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                                <span className="text-[8px] font-black text-[#5227EB] opacity-0 group-hover:opacity-100 transition-opacity font-mono">{d.hours}h</span>
                                <div className="w-full bg-slate-100 rounded-md border border-slate-250/20 overflow-hidden flex items-end h-full">
                                  <div className="w-full bg-gradient-to-t from-[#5227EB] to-indigo-400 rounded-md transition-all duration-500" style={{ height: `${d.percent}%` }} />
                                </div>
                                <span className="text-[9px] font-black text-slate-400">{d.day}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-4 shadow-sm">
                          <h4 className="text-xs font-black uppercase text-slate-400">Subject Distribution</h4>
                          <div className="space-y-3">
                            {[
                              { subject: 'Algorithms & DSA', percent: 35, color: 'bg-indigo-650' },
                              { subject: 'Database Systems (DBMS)', percent: 25, color: 'bg-emerald-600' },
                              { subject: 'Computer Networks (CN)', percent: 20, color: 'bg-[#FF8A75]' },
                              { subject: 'Operating Systems (OS)', percent: 20, color: 'bg-amber-500' }
                            ].map((sub, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-extrabold text-slate-750">
                                  <span>{sub.subject}</span>
                                  <span className="font-mono">{sub.percent}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                  <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${sub.percent}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                   {/* AI Recommendations & Report Download Card */}
                   <div className="p-6 bg-gradient-to-r from-indigo-50/50 via-slate-50 to-orange-50/30 border border-slate-200 rounded-[24px] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                     <div className="space-y-2 flex-1 text-center sm:text-left">
                       <h4 className="text-xs font-black uppercase text-[#5227EB] flex items-center justify-center sm:justify-start gap-1">
                         <span>✨</span> AI Tutor Insights
                       </h4>
                       <p className="text-xs text-slate-650 leading-relaxed font-semibold max-w-xl">
                         Your OS consistency logs dropped by 12% this week. We have synthesized customized review sheets, active recall question sheets, and a desking scheduling calendar to help you catch up.
                       </p>
                     </div>
                     <button
                       onClick={handleGenerateStudyReport}
                       className="px-5 py-3 bg-[#5227EB] hover:bg-[#431fd0] text-white text-xs font-black rounded-2xl shadow-lg border border-[#5227EB]/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
                     >
                       <Download className="h-4 w-4" /> Weekly Report
                     </button>
                   </div>
                 </div>
               )}
             </div>
           )}

          {/* Tab 8: Discussions Info */}
          {activeTab === 'discussions' && (
            <div className="space-y-6 text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-[#5227EB]" /> Workspace Discussions
              </h3>
              <div className="p-8 bg-white border border-slate-200 rounded-[24px] text-center space-y-4 shadow-sm max-w-2xl">
                <div className="h-14 w-14 rounded-full bg-indigo-50 text-[#5227EB] flex items-center justify-center mx-auto shadow-sm">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Interactive Message Boards</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Post doubts, share coding tips, and discuss interview questions with peers in real-time. Discussions are managed inside study circle channels.
                </p>
                <button onClick={() => setActiveTab('groups')} className="px-4 py-2 bg-[#5227EB] text-white text-xs font-bold rounded-xl shadow-md">
                  Browse Group Channels
                </button>
              </div>
            </div>
          )}

          {/* Tab 9: Leaderboard info */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6 text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-[#5227EB]" /> Batch Leaderboard
              </h3>
              <div className="p-8 bg-white border border-slate-200 rounded-[24px] text-center space-y-4 shadow-sm max-w-2xl">
                <div className="h-14 w-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900">Study Hours Leaderboard</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Earn points and placement badges by keeping focus streaks alive. Top study groups and individual learners are listed on the batch ranking dashboard.
                </p>
                <button onClick={() => setActiveTab('groups')} className="px-4 py-2 bg-[#5227EB] text-white text-xs font-bold rounded-xl shadow-md">
                  View Leaderboards inside Workspaces
                </button>
              </div>
            </div>
          )}

          {/* Tab 13: Settings info */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-[#5227EB]" /> Portal Settings
              </h3>
              <div className="p-8 bg-white border border-slate-200 rounded-[24px] shadow-sm max-w-2xl space-y-6">
                {!isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-left">Account Settings</h4>
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
                        className="px-3 py-1.5 bg-[#5227EB] hover:bg-[#431cd3] text-white text-[10px] font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                      </button>
                    </div>

                    {/* Profile Presentation */}
                    <div className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-150 rounded-[20px] shadow-inner">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-indigo-100 shadow-sm shrink-0 bg-white relative">
                        <img 
                          src={user?.avatarUrl || getAvatarByName(user?.fullName)} 
                          className="absolute inset-0 h-full w-full object-cover" 
                          alt="Avatar" 
                        />
                      </div>
                      <div className="text-left space-y-1">
                        <h3 className="text-sm font-black text-slate-900">{user?.fullName || 'User'}</h3>
                        <p className="text-[10px] text-slate-400 font-extrabold font-mono">@{user?.username || 'username'}</p>
                        <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-wider rounded-md">
                          {user?.role || 'student'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-left">
                      <div className="space-y-1 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wide">First Name</span>
                        <span className="text-slate-800 font-semibold">{user?.firstName || 'Not Set'}</span>
                      </div>
                      <div className="space-y-1 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wide">Last Name</span>
                        <span className="text-slate-800 font-semibold">{user?.lastName || 'Not Set'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-left">
                      <div className="space-y-1 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wide">Email Address</span>
                        <span className="text-slate-800 font-semibold truncate block">{user?.email || 'Not Set'}</span>
                      </div>
                      <div className="space-y-1 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wide">Phone Number</span>
                        <span className="text-slate-800 font-semibold">{user?.phone || 'Not Set'}</span>
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
                        <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm shrink-0 bg-slate-50">
                          <img 
                            src={previewAvatar || getAvatarByName(user?.fullName)} 
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

        </main>
      </div>

      {/* Create Circle modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-indigo-650" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Initialize Study Circle</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-450 hover:text-slate-600 font-bold text-xs"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-550 rounded-xl text-xs text-slate-850 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject / Area</label>
                <input
                  type="text"
                  value={groupSubject}
                  onChange={(e) => setGroupSubject(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-550 rounded-xl text-xs text-slate-850 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Goals, topics, and schedule details."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-550 rounded-xl text-xs text-slate-855 outline-none resize-none"
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
                  className="h-4 w-4 bg-white border-slate-350 focus:ring-indigo-500 text-indigo-600 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition-all"
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
                      <img src={user?.avatarUrl || getAvatarByName(user?.fullName)} className="absolute inset-0 h-full w-full object-cover" alt="Avatar" />
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

    </div>
  );
}
