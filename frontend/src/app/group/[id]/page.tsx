'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest, getUserInfo } from '../../utils/api';
import { getSocket } from '../../utils/socket';
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
  RefreshCw
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

interface ActiveLoungeUser {
  id: string;
  fullName: string;
  username: string;
  role: string;
  deskIndex: number | null;
  socketId: string;
}

export default function GroupPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const groupId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [myRole, setMyRole] = useState<'admin' | 'mentor' | 'student'>('student');
  const [loading, setLoading] = useState(true);

  // Tabs state: 'notes' | 'sessions' | 'doubts'
  const [activeTab, setActiveTab] = useState<'notes' | 'sessions' | 'doubts'>('notes');

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

  // WebSockets Map state for note viewers, typing, and cursors
  const [noteViewersMap, setNoteViewersMap] = useState<any>({});
  const [noteTypingMap, setNoteTypingMap] = useState<any>({});

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionLink, setSessionLink] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Desking & Socket state
  const [activeUsers, setActiveUsers] = useState<ActiveLoungeUser[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Progress Logging state
  const [studyMinutes, setStudyMinutes] = useState(60);
  const [notesCreated, setNotesCreated] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [loggingProgress, setLoggingProgress] = useState(false);

  // Group Stats & Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const info = getUserInfo();
    if (!info) {
      showToast('Session expired. Please sign in.', 'error');
      router.push('/');
      return;
    }
    setCurrentUser(info);
    loadGroupData(info);
    
    // Connect Socket.io
    const socket = getSocket();
    socketRef.current = socket;

    socket.connect();
    
    socket.on('connect', () => {
      setSocketConnected(true);
      // Join Room
      socket.emit('join-room', { groupId, user: info });
    });

    socket.on('room-presence-update', (usersList: ActiveLoungeUser[]) => {
      setActiveUsers(usersList);
    });

    socket.on('note-viewers-update', ({ noteId, viewers }: any) => {
      setNoteViewersMap((prev: any) => ({ ...prev, [noteId]: viewers }));
    });

    socket.on('note-typing-update', ({ noteId, typingUsers }: any) => {
      setNoteTypingMap((prev: any) => ({ ...prev, [noteId]: typingUsers }));
    });

    socket.on('new-doubt-alert', ({ doubtTitle, authorName, authorUsername }: any) => {
      showToast(`❓ Doubt Alert: @${authorUsername} posted "${doubtTitle}"`, 'info');
      // Fetch fresh doubts
      apiRequest(`/doubts/group/${groupId}`).then(data => {
        setDoubts(data.doubts || []);
      }).catch(() => {});
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-room');
        socketRef.current.off('room-presence-update');
        socketRef.current.off('note-viewers-update');
        socketRef.current.off('note-typing-update');
        socketRef.current.off('new-doubt-alert');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.disconnect();
      }
    };
  }, [groupId]);

  useEffect(() => {
    if (!socketRef.current || !socketConnected || !currentUser) return;
    
    if (activeNote) {
      socketRef.current.emit('view-note-start', { groupId, noteId: activeNote.id, user: currentUser });
    }
    
    return () => {
      if (activeNote) {
        socketRef.current.emit('view-note-stop', { groupId, noteId: activeNote.id, user: currentUser });
      }
    };
  }, [activeNote?.id, socketConnected, currentUser]);

  const loadGroupData = async (info: any) => {
    setLoading(true);
    try {
      // 1. Fetch group members to find my role
      const membersData = await apiRequest(`/groups/${groupId}/members`);
      const me = membersData.members.find((m: any) => m.User.id === info.id);
      if (me) {
        setMyRole(me.role);
      } else {
        // Fallback or preview modes
        setMyRole(info.role);
      }

      // 2. Fetch group detail from the preview list or available lists
      const groupsData = await apiRequest('/groups');
      const gDetail = groupsData.groups.find((g: any) => g.id === groupId);
      if (gDetail) {
        setGroup(gDetail);
      } else {
        // Try preview query
        const previewData = await apiRequest(`/groups/preview/${groupId}`);
        setGroup(previewData.group);
      }

      // 3. Fetch notes
      const notesData = await apiRequest(`/notes/group/${groupId}`);
      setNotes(notesData.notes || []);

      // 4. Fetch sessions
      const sessionsData = await apiRequest(`/sessions/group/${groupId}`);
      setSessions(sessionsData.sessions || []);

      // 5. Fetch leaderboard & logs
      const lbData = await apiRequest(`/progress/group/${groupId}/leaderboard`);
      setLeaderboard(lbData.leaderboard || []);

      const logsData = await apiRequest(`/progress/group/${groupId}/logs`);
      setRecentLogs(logsData.logs || []);

      // 6. Fetch doubts
      const doubtsData = await apiRequest(`/doubts/group/${groupId}`);
      setDoubts(doubtsData.doubts || []);

    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Access denied or error loading workspace.', 'error');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Sync Note List
  const refreshNotes = async () => {
    try {
      const data = await apiRequest(`/notes/group/${groupId}`);
      setNotes(data.notes || []);
    } catch (e) {}
  };

  // Sync Leaderboard & Logs
  const refreshStats = async () => {
    try {
      const lbData = await apiRequest(`/progress/group/${groupId}/leaderboard`);
      setLeaderboard(lbData.leaderboard || []);
      const logsData = await apiRequest(`/progress/group/${groupId}/logs`);
      setRecentLogs(logsData.logs || []);
    } catch (e) {}
  };

  // Fetch doubts
  const loadDoubts = async () => {
    try {
      const data = await apiRequest(`/doubts/group/${groupId}`);
      setDoubts(data.doubts || []);
    } catch (e) {
      console.error(e);
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

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubtTitle.trim() || !newDoubtDesc.trim()) {
      showToast('Title and description are required.', 'error');
      return;
    }
    setSubmittingDoubt(true);
    try {
      const data = await apiRequest('/doubts', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          title: newDoubtTitle,
          description: newDoubtDesc,
          tags: newDoubtTags
        })
      });
      showToast('Doubt posted successfully!', 'success');

      // Socket broadcast
      if (socketRef.current && socketConnected) {
        socketRef.current.emit('new-doubt-posted', {
          groupId,
          user: currentUser,
          doubtTitle: newDoubtTitle
        });
      }

      setNewDoubtTitle('');
      setNewDoubtDesc('');
      setNewDoubtTags('');
      setShowDoubtForm(false);
      loadDoubts();
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
      const data = await apiRequest(`/doubts/${activeDoubt.id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ content: newAnswerContent })
      });
      showToast('Answer posted!', 'success');
      setNewAnswerContent('');
      loadDoubtDetail(activeDoubt.id);
      loadDoubts();
    } catch (err: any) {
      showToast(err.message || 'Error posting answer.', 'error');
    } finally {
      setSubmittingAnswer(false);
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
      loadDoubts();
    } catch (err: any) {
      showToast(err.message || 'Error accepting answer.', 'error');
    }
  };

  // AI Summarization
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
    if (!aiSummary || !activeNote) return;
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
      
      const data = await apiRequest('/notes', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          title: `[AI Guide] ${activeNote.title}`,
          content: compiledText,
          isPinned: false
        })
      });
      
      showToast('AI summary saved as a new shared note!', 'success');
      setAiSummary(null);
      refreshNotes();
    } catch (err: any) {
      showToast(err.message || 'Error saving summary.', 'error');
    }
  };

  const handleDownloadAiSummary = () => {
    if (!aiSummary || !activeNote) return;
    let compiledText = `# AI Study Guide: ${activeNote.title}\n\n`;
    compiledText += `## Executive Summary\n${aiSummary.summary}\n\n`;
    compiledText += `## Key Definitions\n`;
    aiSummary.keyTerms.forEach((kt: any) => {
      compiledText += `* **${kt.term}**: ${kt.definition}\n`;
    });
    compiledText += `\n## Review Questions\n`;
    aiSummary.practiceQuestions.forEach((q: string, i: number) => {
      compiledText += `${i + 1}. ${q}\n`;
    });

    const element = document.createElement("a");
    const file = new Blob([compiledText], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `AI_Summary_${activeNote.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('AI Study Guide downloaded as markdown!', 'success');
  };

  // Copy Group Code
  const copyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      showToast('Invite code copied to clipboard!', 'success');
    }
  };

  // Sit at Desk Action
  const handleSitDesk = (deskIndex: number) => {
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('sit-at-desk', { groupId, deskIndex });
      showToast(`You sat down at Desk #${deskIndex + 1}!`, 'success');
    }
  };

  // Stand Up Action
  const handleStandUp = () => {
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('stand-up', { groupId });
      showToast('You stood up from your desk.', 'info');
    }
  };

  // Create or Update Note
  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showToast('Note title is required.', 'error');
      return;
    }

    try {
      if (activeNote && isEditingNote) {
        // Edit Mode
        const data = await apiRequest(`/notes/${activeNote.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            isPinned: noteIsPinned
          })
        });
        showToast('Note saved!', 'success');
        setIsEditingNote(false);
        setActiveNote(data.note);
      } else {
        // Create Mode
        const data = await apiRequest('/notes', {
          method: 'POST',
          body: JSON.stringify({
            groupId,
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
      refreshNotes();
    } catch (err: any) {
      showToast(err.message || 'Error saving note.', 'error');
    }
  };

  // Delete Note Trigger
  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId);
  };

  // Actual Delete Action
  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
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
      refreshNotes();
    } catch (err: any) {
      showToast(err.message || 'Delete note failed.', 'error');
    }
  };

  // Schedule Session
  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim() || !sessionTime) {
      showToast('Session Title and Scheduled Time are required.', 'error');
      return;
    }
    setScheduling(true);
    try {
      await apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
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
      
      // Reload sessions
      const data = await apiRequest(`/sessions/group/${groupId}`);
      setSessions(data.sessions || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule session.', 'error');
    } finally {
      setScheduling(false);
    }
  };

  // Log Progress Session
  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyMinutes || studyMinutes <= 0) {
      showToast('Please enter valid study minutes.', 'error');
      return;
    }
    setLoggingProgress(true);
    try {
      const data = await apiRequest('/progress/log', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          studyMinutes,
          notesCreated,
          tasksCompleted
        })
      });
      showToast(data.message || 'Progress logged successfully!', 'success');
      setStudyMinutes(60);
      setNotesCreated(0);
      setTasksCompleted(0);
      refreshStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to log study progress.', 'error');
    } finally {
      setLoggingProgress(false);
    }
  };

  if (loading || !group) {
    return (
      <div className="min-h-screen bg-[#D4D4FF] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Desks configuration (8 desks)
  const DESK_COUNT = 8;
  const deskMap: Record<number, ActiveLoungeUser | undefined> = {};
  activeUsers.forEach(u => {
    if (u.deskIndex !== null && u.deskIndex !== undefined) {
      deskMap[u.deskIndex] = u;
    }
  });

  const myActiveSeat = activeUsers.find(u => u.id === currentUser?.id);
  const myDeskIndex = myActiveSeat ? myActiveSeat.deskIndex : null;

  return (
    <div className="min-h-screen bg-[#D4D4FF] text-zinc-150 font-sans relative pb-12 overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5227EB]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#30A4D3]/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 border border-white/5 hover:border-white/10 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">{group.subject}</span>
              <h1 className="text-sm font-extrabold text-white leading-tight">{group.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div 
              onClick={copyInviteCode}
              className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-900 rounded-xl text-xs font-semibold cursor-pointer hover:border-indigo-500/30 flex items-center gap-1.5 transition-all text-zinc-400 hover:text-zinc-200"
            >
              <span className="font-mono text-[10px] font-bold">Invite Code: {group.inviteCode}</span>
              <Copy className="h-3 w-3" />
            </div>
          </div>
        </div>
      </header>

      {/* Main workspace layout */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Workspace Operations (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Desking visual arena */}
          <section className="bg-gradient-to-br from-[#2D1612] via-[#1F100E] to-[#160B0A] border border-[#FF8A75]/25 rounded-3xl shadow-lg p-6 space-y-5 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                  <Coffee className="h-4 w-4 text-[#FF8A75]" /> Live desking lobby
                </div>
                <p className="text-[10px] text-zinc-300 font-semibold">Pick a desk to sit and study together with your peer group.</p>
              </div>

              {myDeskIndex !== null && myDeskIndex !== undefined && (
                <button
                  onClick={handleStandUp}
                  className="px-3 py-1 bg-[#FF8A75]/15 hover:bg-[#FF8A75]/25 border border-[#FF8A75]/20 text-[#FF8A75] hover:text-[#FFA07A] text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                >
                  Stand Up
                </button>
              )}
            </div>

            {/* Interactive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: DESK_COUNT }).map((_, idx) => {
                const seatedUser = deskMap[idx];
                const isMe = seatedUser?.id === currentUser?.id;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!seatedUser) {
                        handleSitDesk(idx);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-between h-28 transition-all ${
                      seatedUser 
                        ? isMe
                          ? 'bg-[#FF8A75]/30 border-[#FF8A75] shadow-md text-white'
                          : 'bg-[#120A08] border-[#FF8A75]/10 text-zinc-150 hover:bg-[#1F100E]'
                        : 'bg-white/5 border-dashed border-white/10 text-zinc-400 hover:bg-[#FF8A75]/10 hover:text-[#FF8A75] cursor-pointer'
                    }`}
                  >
                    <div className={`w-full flex justify-between items-center text-[9px] ${
                      seatedUser ? 'text-zinc-400' : 'text-zinc-550'
                    }`}>
                      <span className="font-mono">Desk #{idx + 1}</span>
                      {seatedUser && (
                        <span className={`h-1.5 w-1.5 rounded-full ${isMe ? 'bg-[#FF8A75] animate-ping' : 'bg-[#FFA07A] animate-pulse'}`} />
                      )}
                    </div>

                    {seatedUser ? (
                      <div className="flex flex-col items-center gap-1 text-center w-full min-w-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                          isMe 
                            ? 'bg-[#FF8A75]/25 border border-[#FF8A75] text-white' 
                            : 'bg-zinc-800 border border-zinc-700 text-zinc-350'
                        }`}>
                          {seatedUser.fullName.charAt(0)}
                        </div>
                        <div className="text-[10px] font-bold text-zinc-200 truncate w-full">{seatedUser.fullName}</div>
                        <div className="text-[8px] text-zinc-400 font-semibold uppercase">{seatedUser.role}</div>
                      </div>
                    ) : (
                      <div className="text-center py-2 flex flex-col items-center gap-1 text-zinc-450">
                        <span className="text-xs">🛋️</span>
                        <span className="text-[9px] font-bold uppercase tracking-wide">Sit Here</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Collaborative Workspace Tabs */}
          <section className="space-y-4">
            <div className="border-b border-zinc-900 flex gap-2">
              <button
                onClick={() => { setActiveTab('notes'); setActiveNote(null); setIsEditingNote(false); }}
                className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'notes' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                📝 Shared Notes
              </button>
              <button
                onClick={() => { setActiveTab('sessions'); }}
                className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'sessions' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                📅 Session Schedules
              </button>
              <button
                onClick={() => { setActiveTab('doubts'); loadDoubts(); setActiveDoubt(null); }}
                className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'doubts' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                ❓ Doubt Board
              </button>
            </div>

            {/* TAB: NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {activeNote ? (
                  /* Note Reader / Editor */
                  <div className="bg-gradient-to-br from-[#134E4A] via-[#1F3A35] to-[#0F172A] border border-white/10 rounded-3xl shadow-lg p-6 space-y-4 relative">
                    <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                      <div>
                        {isEditingNote ? (
                          <input
                            type="text"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            className="bg-[#0E0F15] border border-zinc-800 text-sm font-extrabold text-white px-3 py-1.5 rounded-xl outline-none focus:border-indigo-500 w-full"
                          />
                        ) : (
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                            {activeNote.isPinned && <Pin className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400/20 shrink-0" />}
                            {activeNote.title}
                          </h4>
                        )}
                        <p className="text-[9px] text-zinc-500 mt-1">
                          Published by @{activeNote.Creator?.username || 'anonymous'} • Last edited {new Date(activeNote.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {isEditingNote ? (
                          <>
                            <button
                              onClick={saveNote}
                              className="p-1.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="h-3.5 w-3.5" /> Save
                            </button>
                            <button
                              onClick={() => setIsEditingNote(false)}
                              className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Edit check: all members can edit or let's say only coordinator/creator can edit? Let's say all members can edit collaborative notes */}
                            <button
                              onClick={() => {
                                setNoteTitle(activeNote.title);
                                setNoteContent(activeNote.content);
                                setNoteIsPinned(activeNote.isPinned);
                                setIsEditingNote(true);
                              }}
                              className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Edit Note
                            </button>

                            {/* DELETE NOTE SECURITY: Only note creator, group coordinators (admin/mentor), or system admins can delete */}
                            {(activeNote.createdBy === currentUser?.id || myRole === 'admin' || myRole === 'mentor' || currentUser?.role === 'admin') && (
                              <button
                                onClick={() => handleDeleteNote(activeNote.id)}
                                className="p-1.5 bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                             <button
                               onClick={handleAiSummarize}
                               className="p-1.5 bg-gradient-to-r from-amber-600 to-[#FF8A75] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer hover:brightness-110 transition-all border border-amber-500/20"
                             >
                               ✨ AI Summarize
                             </button>

                             <button
                               onClick={() => {
                                 const element = document.createElement("a");
                                 const file = new Blob([activeNote.content], {type: 'text/plain'});
                                 element.href = URL.createObjectURL(file);
                                 element.download = `${activeNote.title}.md`;
                                 document.body.appendChild(element);
                                 element.click();
                                 document.body.removeChild(element);
                                 showToast(`Downloaded "${activeNote.title}" as markdown!`, 'success');
                               }}
                               className="p-1.5 bg-indigo-650 border border-indigo-500/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                             >
                               <Download className="h-3.5 w-3.5" /> Download
                             </button>

                             <button
                               onClick={() => setActiveNote(null)}
                               className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer"
                             >
                              Close
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Active note viewers */}
                      {noteViewersMap[activeNote.id] && noteViewersMap[activeNote.id].length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-550 animate-pulse"></span>
                          <span>Active on this note:</span>
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {noteViewersMap[activeNote.id].map((v: any) => (
                              <span
                                key={v.socketId || v.id}
                                title={v.fullName}
                                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 text-[8px] font-bold text-white uppercase ring-1 ring-zinc-950 cursor-default"
                              >
                                {v.fullName.charAt(0)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Note typing indicator */}
                      {noteTypingMap[activeNote.id] && noteTypingMap[activeNote.id].filter((name: string) => name !== currentUser?.fullName).length > 0 && (
                        <p className="text-[10px] text-indigo-400 font-semibold italic flex items-center gap-1.5 animate-pulse">
                          <span className="h-1 w-1 rounded-full bg-indigo-400 animate-ping"></span>
                          <span>{noteTypingMap[activeNote.id].filter((name: string) => name !== currentUser?.fullName).join(', ')} is typing...</span>
                        </p>
                      )}

                      {isEditingNote ? (
                        <>
                          <textarea
                            value={noteContent}
                            onChange={(e) => {
                              setNoteContent(e.target.value);
                              if (socketRef.current && socketConnected) {
                                socketRef.current.emit('typing-start', { groupId, noteId: activeNote.id, user: currentUser });
                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                typingTimeoutRef.current = setTimeout(() => {
                                  socketRef.current.emit('typing-stop', { groupId, noteId: activeNote.id, user: currentUser });
                                }, 2000);
                              }
                            }}
                            placeholder="Write collaborative notes in markdown..."
                            rows={10}
                            className="w-full p-4 bg-[#0E0F15] border border-zinc-800 focus:border-indigo-500 rounded-2xl text-xs outline-none text-zinc-150 resize-none font-mono"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={noteIsPinned}
                              onChange={(e) => setNoteIsPinned(e.target.checked)}
                              className="h-4 w-4 bg-zinc-950 border-zinc-800 focus:ring-indigo-500 text-indigo-650 rounded-lg"
                            />
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pin note to top</label>
                          </div>
                        </>
                      ) : (
                        <div className="bg-[#0E0F15]/40 border border-white/[0.02] p-5 rounded-2xl text-xs leading-relaxed text-zinc-300 font-mono whitespace-pre-wrap min-h-[150px]">
                          {activeNote.content || 'This note has no content.'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Note List */
                  <div className="space-y-4">
                    {/* Add note card */}
                    <div className="bg-gradient-to-br from-[#134E4A] via-[#1F3A35] to-[#0F172A] border border-white/10 rounded-3xl shadow-lg p-4 relative">
                      <form onSubmit={saveNote} className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={noteTitle}
                            required
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder="Title of new note..."
                            className="flex-1 px-3.5 py-2 bg-[#0E0F15] border border-zinc-850 focus:border-indigo-500 rounded-xl text-xs outline-none text-zinc-150"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border border-indigo-500/20 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Plus className="h-4 w-4" /> Publish Note
                          </button>
                        </div>
                        <textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="Write collaborative notes here. Code snippets, exam keynotes, or formulas."
                          rows={3}
                          className="w-full px-3.5 py-2.5 bg-[#0E0F15] border border-zinc-850 focus:border-indigo-500 rounded-xl text-xs outline-none text-zinc-150 resize-none font-mono"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={noteIsPinned}
                            onChange={(e) => setNoteIsPinned(e.target.checked)}
                            className="h-3.5 w-3.5 bg-zinc-950 border-zinc-800 focus:ring-indigo-500 text-indigo-650 rounded"
                          />
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Pin this note</label>
                        </div>
                      </form>
                    </div>

                    {/* Notes grid */}
                    {notes.length === 0 ? (
                      <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[28px] text-center space-y-2">
                        <FileText className="h-8 w-8 text-zinc-700 mx-auto" />
                        <p className="text-xs text-zinc-500 font-semibold">No notes published in this study circle yet.</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {notes.map((note) => (
                          <div 
                            key={note.id}
                            className="p-5 bg-zinc-950/60 border border-white/5 hover:border-indigo-500/20 rounded-[28px] transition-all duration-300 flex flex-col justify-between gap-4 group cursor-pointer"
                            onClick={() => {
                              setActiveNote(note);
                              setIsEditingNote(false);
                            }}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-extrabold uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                                  by @{note.Creator?.username || 'anonymous'}
                                </span>
                                {note.isPinned && (
                                  <span className="text-[8px] font-extrabold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Pin className="h-2.5 w-2.5" /> Pinned
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{note.title}</h4>
                              <p className="text-[11px] text-zinc-400 font-mono line-clamp-3 leading-relaxed">{note.content}</p>
                            </div>

                            <div className="pt-3 border-t border-zinc-900/60 flex justify-between items-center text-[9px] text-zinc-500">
                              <span>Last edit {new Date(note.updatedAt).toLocaleDateString()}</span>
                              <span className="text-indigo-400 font-bold group-hover:underline">Read Note →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SESSIONS */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Scheduled Study Sessions</h4>
                  
                  {/* Coordinator only scheduling */}
                  {(myRole === 'admin' || myRole === 'mentor' || currentUser?.role === 'admin') && (
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 hover:text-white rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Schedule Session
                    </button>
                  )}
                </div>

                {sessions.length === 0 ? (
                  <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[28px] text-center space-y-2">
                    <Calendar className="h-8 w-8 text-zinc-700 mx-auto" />
                    <p className="text-xs text-zinc-500 font-semibold">No study sessions scheduled yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((s) => (
                      <div key={s.id} className="bg-gradient-to-br from-[#1E293B] via-[#134E4A]/50 to-[#0F172A] border border-white/10 rounded-3xl shadow-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-extrabold uppercase bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 px-2 py-0.5 rounded-md">
                              {s.durationMinutes} Minutes
                            </span>
                            <span className="text-[9px] text-zinc-500">Scheduled by Dr./Prof. @{s.Creator?.username || 'mentor'}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-white">{s.title}</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed">{s.description || 'No description provided.'}</p>
                          <div className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-indigo-400" />
                            <span>{new Date(s.scheduledAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {s.meetingLink && (
                          <a
                            href={s.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-4 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border border-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all self-start sm:self-center whitespace-nowrap"
                          >
                            <Video className="h-4 w-4" /> Enter Session
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: DOUBT BOARD */}
            {activeTab === 'doubts' && (
              <div className="space-y-4 text-white">
                {activeDoubt ? (
                  /* DOUBT DETAILS THREAD */
                  <div className="bg-gradient-to-br from-[#1F100E] via-[#2A1713] to-[#120A08] border border-[#FF8A75]/25 rounded-3xl shadow-lg p-6 space-y-5 relative">
                    <div className="flex justify-between items-start border-b border-zinc-900 pb-3.5">
                      <div>
                        <button
                          onClick={() => setActiveDoubt(null)}
                          className="text-xs text-[#FF8A75] hover:underline font-bold mb-2 flex items-center gap-1 cursor-pointer"
                        >
                          ← Back to Doubts List
                        </button>
                        <h4 className="text-base font-extrabold text-white">{activeDoubt.title}</h4>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            activeDoubt.isSolved ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-rose-950/40 text-rose-400 border border-rose-500/20'
                          }`}>
                            {activeDoubt.isSolved ? 'Solved' : 'Open Doubt'}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono">Posted by @{activeDoubt.Author?.username}</span>
                          {activeDoubt.tags && activeDoubt.tags.split(',').map((t: string) => (
                            <span key={t} className="text-[8px] font-black uppercase bg-zinc-800 text-zinc-355 px-1.5 py-0.5 rounded">
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleUpvoteDoubt(activeDoubt.id, e)}
                        className="px-3 py-1.5 bg-[#FF8A75]/10 border border-[#FF8A75]/20 hover:bg-[#FF8A75]/20 text-[#FF8A75] text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
                      >
                        ▲ Upvote ({activeDoubt.upvotes})
                      </button>
                    </div>

                    <div className="bg-[#120A08]/40 border border-white/[0.02] p-5 rounded-2xl text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap">
                      {activeDoubt.description}
                    </div>

                    {/* ANSWERS LIST */}
                    <div className="space-y-4 pt-2 border-t border-zinc-900">
                      <h5 className="text-xs font-black uppercase tracking-wider text-zinc-400">Answers ({answers.length})</h5>

                      {answers.length === 0 ? (
                        <div className="p-8 bg-[#120A08]/20 border border-white/5 rounded-2xl text-center">
                          <p className="text-xs text-zinc-500 font-semibold">No answers posted yet. Be the first to help out!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {answers.map((ans) => {
                            const isDoubtAuthor = activeDoubt.userId === currentUser?.id;
                            return (
                              <div 
                                key={ans.id} 
                                className={`p-4 rounded-2xl border transition-all ${
                                  ans.isAccepted 
                                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                                    : 'bg-[#120A08]/60 border-white/5'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-zinc-400">@{ans.Author?.username} ({ans.Author?.fullName})</span>
                                    {ans.isAccepted && (
                                      <span className="text-[8px] font-black uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        ✓ Solution Accepted
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpvoteAnswer(ans.id)}
                                      className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-zinc-300 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-0.5"
                                    >
                                      ▲ {ans.upvotes}
                                    </button>

                                    {/* Accept answer button: visible only to doubt author, if this answer is not already accepted */}
                                    {isDoubtAuthor && !ans.isAccepted && (
                                      <button
                                        onClick={() => handleAcceptAnswer(ans.id)}
                                        className="px-2.5 py-1 bg-emerald-900/40 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg cursor-pointer"
                                      >
                                        Accept Solution
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{ans.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* POST AN ANSWER FORM */}
                    <form onSubmit={handlePostAnswer} className="space-y-3.5 pt-4 border-t border-zinc-900">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Your Answer</label>
                        <textarea
                          value={newAnswerContent}
                          onChange={(e) => setNewAnswerContent(e.target.value)}
                          placeholder="Provide a step-by-step solution, explain the logic, or paste helpful code snippets..."
                          rows={4}
                          required
                          className="w-full p-3.5 bg-[#120A08] border border-white/10 rounded-2xl text-xs text-white outline-none focus:border-[#FF8A75]/50 resize-none font-sans"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingAnswer}
                        className="px-4 py-2 bg-[#FF8A75] hover:bg-[#E07662] text-white text-xs font-bold rounded-xl border border-[#FF8A75]/20 cursor-pointer shadow-md transition-all flex items-center gap-1"
                      >
                        {submittingAnswer ? 'Posting...' : 'Post Solution'}
                      </button>
                    </form>
                  </div>
                ) : showDoubtForm ? (
                  /* ASK A DOUBT FORM */
                  <div className="bg-gradient-to-br from-[#1F100E] via-[#2A1713] to-[#120A08] border border-[#FF8A75]/25 rounded-3xl shadow-lg p-6 space-y-4 text-white">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                      <h4 className="text-sm font-extrabold uppercase tracking-wider">Post Academic Doubt</h4>
                      <button
                        type="button"
                        onClick={() => setShowDoubtForm(false)}
                        className="text-zinc-500 hover:text-zinc-350 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCreateDoubt} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Title / Question</label>
                        <input
                          type="text"
                          value={newDoubtTitle}
                          onChange={(e) => setNewDoubtTitle(e.target.value)}
                          required
                          placeholder="e.g. How to resolve dirty reads anomaly in MySQL transaction isolation?"
                          className="w-full px-3.5 py-2.5 bg-[#120A08] border border-white/10 focus:border-[#FF8A75]/50 rounded-xl text-xs text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Elaborate your Doubt</label>
                        <textarea
                          value={newDoubtDesc}
                          onChange={(e) => setNewDoubtDesc(e.target.value)}
                          required
                          rows={6}
                          placeholder="Describe what you are trying to understand, paste your code block or output traces, and clarify where you are stuck."
                          className="w-full px-3.5 py-2.5 bg-[#120A08] border border-white/10 focus:border-[#FF8A75]/50 rounded-xl text-xs text-white outline-none resize-none font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Subject Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={newDoubtTags}
                          onChange={(e) => setNewDoubtTags(e.target.value)}
                          placeholder="e.g. dbms, normalization, unit3"
                          className="w-full px-3.5 py-2.5 bg-[#120A08] border border-white/10 focus:border-[#FF8A75]/50 rounded-xl text-xs text-white outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowDoubtForm(false)}
                          className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingDoubt}
                          className="px-4 py-2 bg-[#FF8A75] hover:bg-[#E07662] text-white text-xs font-bold rounded-xl border border-[#FF8A75]/20 cursor-pointer shadow-md"
                        >
                          {submittingDoubt ? 'Posting Doubt...' : 'Publish Doubt'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* DOUBTS LIST */
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="relative flex-1 w-full">
                        <input
                          type="text"
                          value={doubtSearchQuery}
                          onChange={(e) => setDoubtSearchQuery(e.target.value)}
                          placeholder="Search doubts by title, description, or tag..."
                          className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-xs text-zinc-100 outline-none pr-8"
                        />
                        {doubtSearchQuery && (
                          <button
                            onClick={() => setDoubtSearchQuery('')}
                            className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setShowDoubtForm(true)}
                        className="px-4 py-2 bg-[#FF8A75] hover:bg-[#E07662] text-white text-xs font-bold rounded-xl border border-[#FF8A75]/20 flex items-center gap-1 cursor-pointer transition-all self-stretch sm:self-auto text-center justify-center"
                      >
                        <Plus className="h-4 w-4" /> Ask Doubt
                      </button>
                    </div>

                    {/* Doubts list cards */}
                    {doubts.length === 0 ? (
                      <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[28px] text-center space-y-2">
                        <HelpCircle className="h-8 w-8 text-zinc-700 mx-auto" />
                        <p className="text-xs text-zinc-500 font-semibold">No academic doubts posted yet in this study circle.</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {doubts
                          .filter(d => 
                            d.title.toLowerCase().includes(doubtSearchQuery.toLowerCase()) ||
                            d.description.toLowerCase().includes(doubtSearchQuery.toLowerCase()) ||
                            d.tags.toLowerCase().includes(doubtSearchQuery.toLowerCase())
                          )
                          .map((d) => (
                            <div
                              key={d.id}
                              onClick={() => loadDoubtDetail(d.id)}
                              className="p-5 bg-zinc-950/60 border border-white/5 hover:border-[#FF8A75]/30 rounded-[28px] transition-all duration-300 flex flex-col justify-between gap-3 group cursor-pointer"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[8px] font-extrabold uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                                      by @{d.Author?.username}
                                    </span>
                                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                      d.isSolved ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-rose-950/40 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      {d.isSolved ? 'Solved' : 'Open'}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => handleUpvoteDoubt(d.id, e)}
                                    className="px-2 py-0.5 bg-zinc-900 border border-white/5 text-[9px] font-black text-zinc-350 hover:text-[#FF8A75] hover:border-[#FF8A75]/30 rounded flex items-center gap-0.5 cursor-pointer transition-all"
                                  >
                                    ▲ {d.upvotes || 0}
                                  </button>
                                </div>
                                <h4 className="text-xs font-black text-white group-hover:text-[#FF8A75] transition-colors leading-snug">
                                  {d.title}
                                </h4>
                                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                                  {d.description}
                                </p>
                              </div>

                              <div className="flex justify-between items-center text-[9px] text-zinc-550 pt-2 border-t border-white/5">
                                <div className="flex gap-1.5 flex-wrap">
                                  {d.tags && d.tags.split(',').map((t: string) => (
                                    <span key={t} className="text-[8px] font-bold text-zinc-500 uppercase">
                                      #{t.trim()}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1 text-[#FF8A75] font-bold">
                                  <span>💬 {d.Answers ? d.Answers.length : 0} answer{d.Answers?.length === 1 ? '' : 's'}</span>
                                  <span>•</span>
                                  <span className="group-hover:underline">View Thread →</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar panels (Right 1/3) */}
        <div className="space-y-6">
          
          {/* Study Progress logger */}
          <section className="bg-gradient-to-br from-[#1F100E] via-[#2A1713] to-[#120A08] border border-[#FF8A75]/25 rounded-3xl shadow-lg p-6 space-y-4 relative text-white">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Log Study Session</h3>
              <p className="text-[10px] text-zinc-350 font-semibold font-sans">Record minutes studied in this workspace to update stats.</p>
            </div>

            <form onSubmit={handleLogProgress} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">Minutes Studied</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="240"
                    step="15"
                    value={studyMinutes}
                    onChange={(e) => setStudyMinutes(parseInt(e.target.value))}
                    className="flex-1 accent-[#FF8A75] bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-black text-[#FF8A75] font-mono w-14 text-right shrink-0">{studyMinutes} min</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">Notes Created</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={notesCreated}
                    onChange={(e) => setNotesCreated(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#120A08] border border-white/10 rounded-xl text-xs text-white outline-none text-center font-mono focus:border-[#FF8A75]/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">Tasks Done</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={tasksCompleted}
                    onChange={(e) => setTasksCompleted(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#120A08] border border-white/10 rounded-xl text-xs text-white outline-none text-center font-mono focus:border-[#FF8A75]/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingProgress}
                className="w-full py-2.5 bg-[#FF8A75] hover:bg-[#E07662] text-white text-xs font-bold rounded-xl border border-[#FF8A75]/20 cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {loggingProgress ? 'Saving Session...' : 'Log Study Session'}
              </button>
            </form>
          </section>

          {/* Group Leaderboard */}
          <section className="bg-gradient-to-br from-[#2D1612] via-[#FF8A75]/10 to-[#160B0A] border border-[#FF8A75]/25 rounded-3xl shadow-lg p-6 space-y-3 relative">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#FF8A75]" /> Circle Leaderboard
            </h3>
            
            {leaderboard.length === 0 ? (
              <div className="p-4 bg-[#120A08]/40 border border-white/5 rounded-2xl text-center">
                <p className="text-[10px] text-zinc-400 font-semibold">No study logs registered yet.</p>
              </div>
            ) : (
              <div className="bg-[#120A08]/60 border border-white/5 rounded-[24px] overflow-hidden divide-y divide-white/5 shadow-sm">
                {leaderboard.map((lbUser, index) => (
                  <div key={lbUser.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`font-mono font-black text-[10px] w-4 text-center shrink-0 ${
                        index === 0 ? 'text-[#FF8A75]' : index === 1 ? 'text-[#FFA07A]' : index === 2 ? 'text-amber-600' : 'text-zinc-550'
                      }`}>
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate leading-snug">{lbUser.fullName}</div>
                        <div className="text-[9px] text-zinc-400 font-mono truncate">@{lbUser.username}</div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <span className="text-[9px] font-black text-[#FF8A75] font-mono flex items-center gap-0.5">🔥 {lbUser.streakCount}</span>
                      <span className="text-[10px] font-black text-indigo-300 font-mono">{lbUser.totalStudyHours.toFixed(1)}h</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Lounge Activities */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-indigo-400" /> Lounge Activity Stream
            </h3>

            {recentLogs.length === 0 ? (
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl text-center">
                <p className="text-[10px] text-zinc-500">No recent logs.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-1">
                    <div className="flex justify-between items-start text-[8px] text-zinc-500 font-mono">
                      <span>@{log.User?.username}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-zinc-300 leading-snug">
                      Studied for <span className="text-indigo-400 font-extrabold font-mono">{log.studyMinutes} mins</span>
                      {log.notesCreated > 0 && ` • published ${log.notesCreated} note${log.notesCreated > 1 ? 's' : ''}`}
                      {log.tasksCompleted > 0 && ` • completed ${log.tasksCompleted} task${log.tasksCompleted > 1 ? 's' : ''}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0E0F15] border border-white/10 rounded-[32px] p-6 space-y-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Schedule Study Session</h3>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-zinc-500 hover:text-zinc-300 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSession} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Session Title</label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Exam Analysis"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-xs text-zinc-100 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
                  placeholder="Topics, agenda, and targets."
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-xs text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Scheduled Time</label>
                  <input
                    type="datetime-local"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-xs text-zinc-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-xs text-zinc-100 outline-none text-center font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Meeting Link (VC/Google Meet/Zoom)</label>
                <input
                  type="url"
                  value={sessionLink}
                  onChange={(e) => setSessionLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-xs text-zinc-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border border-indigo-500/20 cursor-pointer shadow-md"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Note Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="max-w-sm w-full bg-[#0E0F15] border border-white/10 rounded-[32px] p-6 space-y-5 shadow-2xl animate-scaleIn text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Delete Note?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Are you sure you want to delete this note? This action is permanent and cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteNote}
                className="px-4 py-2 bg-red-650 hover:bg-red-500 text-white text-xs font-bold rounded-xl border border-red-500/20 shadow-md transition-all cursor-pointer"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal Overlay */}
      {(isSummarizing || aiSummary || summarizingStep) && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn text-white">
          <div className="max-w-xl w-full bg-[#0E0F15] border border-amber-500/20 rounded-[32px] p-6 space-y-6 shadow-2xl animate-scaleIn relative overflow-hidden">
            {/* Shimmer backdrop */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-[#FF8A75]/5 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 font-sans">AI Study Assistant</h3>
              </div>
              {!isSummarizing && (
                <button 
                  onClick={() => { setAiSummary(null); setIsSummarizing(false); setSummarizingStep(''); }}
                  className="text-zinc-505 hover:text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 relative z-10">
              {isSummarizing ? (
                /* LOADING SHIMMER STATE */
                <div className="p-12 text-center space-y-4">
                  <div className="h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-350">{summarizingStep}</p>
                    <p className="text-[10px] text-zinc-500 italic">Distilling core engineering concepts...</p>
                  </div>
                </div>
              ) : aiSummary ? (
                /* RESULTS DISPLAY STATE */
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#FF8A75] font-sans">Executive Summary</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-4 rounded-2xl border border-white/[0.02]">
                      {aiSummary.summary}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#FF8A75] font-sans">Key Definitions</h4>
                    <div className="grid gap-2">
                      {aiSummary.keyTerms && aiSummary.keyTerms.map((kt: any, idx: number) => (
                        <div key={idx} className="p-3.5 bg-zinc-950/40 rounded-xl border border-white/[0.01]">
                          <strong className="text-xs text-white block mb-0.5">{kt.term}</strong>
                          <span className="text-xs text-zinc-400 leading-normal">{kt.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#FF8A75] font-sans">Active Recall / Practice Questions</h4>
                    <div className="bg-[#120A08]/40 border border-[#FF8A75]/10 p-4.5 rounded-2xl space-y-2">
                      {aiSummary.practiceQuestions && aiSummary.practiceQuestions.map((q: string, idx: number) => (
                        <div key={idx} className="flex gap-2 text-xs text-zinc-300 leading-relaxed">
                          <span className="font-mono text-[#FF8A75] font-black shrink-0">{idx + 1}.</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* ACTION PANEL */}
            {aiSummary && !isSummarizing && (
              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900 relative z-10 flex-wrap">
                <button
                  onClick={handleSaveAiSummaryAsNote}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-black rounded-xl cursor-pointer transition-all"
                >
                  Save as Study Note
                </button>
                <button
                  onClick={handleDownloadAiSummary}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-[#FF8A75] text-white text-xs font-black rounded-xl hover:brightness-110 shadow-md transition-all cursor-pointer border border-amber-500/20"
                >
                  Download Guide (.md)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}