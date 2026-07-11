import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  BookOpen, 
  HelpCircle,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  ChevronRight,
  Pin,
  Lock,
  CornerDownRight,
  User
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../components/ToastProvider';

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  Author: {
    fullName: string;
    username: string;
    role: string;
  };
}

interface Doubt {
  id: string;
  title: string;
  description: string;
  subject: string | null;
  topic: string | null;
  isSolved: boolean;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: string;
  userId: string;
  Author: {
    fullName: string;
    username: string;
    role: string;
  };
  Answers?: any[];
}

interface DiscussionBoardViewProps {
  user: any;
  equippedTheme?: string;
  setActiveTab: (tab: any) => void;
  openAskDoubtOnMount?: boolean;
}

export const DiscussionBoardView: React.FC<DiscussionBoardViewProps> = ({ 
  user, 
  equippedTheme, 
  setActiveTab,
  openAskDoubtOnMount = false
}) => {
  const { showToast } = useToast();
  
  // Data States
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Creation & Edit Form Modal
  const [showAskModal, setShowAskModal] = useState(false);
  const [editingDoubt, setEditingDoubt] = useState<Doubt | null>(null);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [posting, setPosting] = useState(false);

  // Thread Drawer Modal
  const [activeDoubt, setActiveDoubt] = useState<Doubt | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Load all doubts from database
  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/doubts');
      setDoubts(res.doubts || []);
    } catch (err: any) {
      console.error('Error fetching doubts:', err);
      showToast(err.message || 'Failed to retrieve discussion forum doubts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
    if (openAskDoubtOnMount) {
      openAskModalForm();
    }
  }, [openAskDoubtOnMount]);

  // Load replies for the active doubt thread
  const fetchReplies = async (doubtId: string) => {
    try {
      setLoadingReplies(true);
      const res = await apiRequest(`/doubts/${doubtId}`);
      setReplies(res.answers || []);
    } catch (err: any) {
      console.error('Error fetching replies:', err);
      showToast('Failed to fetch replies for this discussion thread.', 'error');
    } finally {
      setLoadingReplies(false);
    }
  };

  // Select a doubt to view thread
  const handleOpenThread = (doubt: Doubt) => {
    setActiveDoubt(doubt);
    fetchReplies(doubt.id);
  };

  // Close thread
  const handleCloseThread = () => {
    setActiveDoubt(null);
    setReplies([]);
    setReplyContent('');
  };

  // Submit reply handler
  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !activeDoubt) return;

    try {
      setSendingReply(true);
      const res = await apiRequest(`/doubts/${activeDoubt.id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ content: replyContent.trim() })
      });
      showToast('Reply posted successfully!', 'success');
      setReplyContent('');
      // Reload replies list
      fetchReplies(activeDoubt.id);
      // Reload main doubts list to sync reply count
      fetchDoubts();
    } catch (err: any) {
      console.error('Error posting reply:', err);
      showToast(err.message || 'Failed to submit reply.', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  // Theme Config styles
  const themeStyles = useMemo(() => {
    switch (equippedTheme) {
      case 'cyberpunk':
        return {
          bg: 'bg-[#0f021e]/80 backdrop-blur-md',
          border: 'border border-fuchsia-500/20 shadow-md shadow-fuchsia-500/5',
          accent: 'text-fuchsia-400',
          hoverBg: 'hover:bg-fuchsia-500/10',
          button: 'bg-fuchsia-600 hover:bg-fuchsia-500',
          badge: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20',
          inputFocus: 'focus:border-fuchsia-500'
        };
      case 'zengarden':
        return {
          bg: 'bg-[#03140a]/80 backdrop-blur-md',
          border: 'border border-emerald-500/20 shadow-md shadow-emerald-500/5',
          accent: 'text-emerald-400',
          hoverBg: 'hover:bg-emerald-500/10',
          button: 'bg-emerald-600 hover:bg-emerald-500',
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          inputFocus: 'focus:border-emerald-500'
        };
      case 'theme_solar_glow':
        return {
          bg: 'bg-[#1c1209]/80 backdrop-blur-md',
          border: 'border border-amber-500/20 shadow-md shadow-amber-500/5',
          accent: 'text-amber-400',
          hoverBg: 'hover:bg-amber-500/10',
          button: 'bg-amber-600 hover:bg-amber-500',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          inputFocus: 'focus:border-amber-500'
        };
      case 'theme_dark_nebula':
        return {
          bg: 'bg-[#120a1c]/80 backdrop-blur-md',
          border: 'border border-purple-500/20 shadow-md shadow-purple-500/5',
          accent: 'text-purple-400',
          hoverBg: 'hover:bg-purple-500/10',
          button: 'bg-indigo-650 hover:bg-indigo-550',
          badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
          inputFocus: 'focus:border-purple-500'
        };
      default:
        return {
          bg: 'bg-[#0B0F19]/60 backdrop-blur-md',
          border: 'border border-white/5 shadow-2xl',
          accent: 'text-indigo-400',
          hoverBg: 'hover:bg-indigo-500/10',
          button: 'bg-indigo-600 hover:bg-indigo-500',
          badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
          inputFocus: 'focus:border-indigo-500'
        };
    }
  }, [equippedTheme]);

  // Extract unique subjects for dropdown filtering
  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    doubts.forEach(d => {
      if (d.subject && d.subject.trim()) {
        set.add(d.subject.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [doubts]);

  // Filter doubts list
  const filteredDoubts = useMemo(() => {
    let result = [...doubts];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        d =>
          d.description.toLowerCase().includes(q) ||
          (d.subject && d.subject.toLowerCase().includes(q)) ||
          (d.topic && d.topic.toLowerCase().includes(q)) ||
          d.Author?.fullName?.toLowerCase().includes(q)
      );
    }

    // Filter by subject
    if (selectedSubject !== 'All') {
      result = result.filter(d => d.subject === selectedSubject);
    }

    return result;
  }, [doubts, searchQuery, selectedSubject]);

  // Open Ask Doubt modal form
  const openAskModalForm = () => {
    setEditingDoubt(null);
    setSubject('');
    setTopic('');
    setQuestion('');
    setShowAskModal(true);
  };

  // Open edit modal form
  const openEditModalForm = (doubt: Doubt) => {
    setEditingDoubt(doubt);
    setSubject(doubt.subject || '');
    setTopic(doubt.topic || '');
    setQuestion(doubt.description);
    setShowAskModal(true);
  };

  // Submit Doubt post
  const handleSaveDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      showToast('Question details are required.', 'error');
      return;
    }

    try {
      setPosting(true);
      const payload = {
        title: subject.trim() || 'General Academic Doubt',
        subject: subject.trim() || null,
        topic: topic.trim() || null,
        description: question.trim()
      };

      if (editingDoubt) {
        await apiRequest(`/doubts/${editingDoubt.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Doubt updated successfully!', 'success');
      } else {
        await apiRequest('/doubts', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Doubt Saved Successfully', 'success');
      }

      setShowAskModal(false);
      fetchDoubts(); // Refresh doubts list immediately
    } catch (err: any) {
      console.error('Error posting doubt:', err);
      showToast(err.message || 'Error posting academic doubt.', 'error');
    } finally {
      setPosting(false);
    }
  };

  // Delete Doubt
  const handleDeleteDoubt = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discussion doubt?')) return;
    try {
      await apiRequest(`/doubts/${id}`, {
        method: 'DELETE'
      });
      showToast('Doubt deleted successfully!', 'success');
      fetchDoubts();
      if (activeDoubt && activeDoubt.id === id) {
        handleCloseThread();
      }
    } catch (err: any) {
      console.error('Error deleting doubt:', err);
      showToast(err.message || 'Error deleting academic doubt.', 'error');
    }
  };

  // Mark as Solved status (Mentor/Admin/Author)
  const handleToggleSolved = async (doubt: Doubt) => {
    try {
      const res = await apiRequest(`/doubts/${doubt.id}/solve`, {
        method: 'PUT'
      });
      showToast(res.message || 'Solved status updated!', 'success');
      fetchDoubts();
      if (activeDoubt && activeDoubt.id === doubt.id) {
        setActiveDoubt({ ...activeDoubt, isSolved: !activeDoubt.isSolved });
      }
    } catch (err: any) {
      console.error('Error toggling solved status:', err);
      showToast('Failed to toggle solved status.', 'error');
    }
  };

  // Toggle Pinned Status (Mentor/Admin only)
  const handleTogglePin = async (doubt: Doubt) => {
    try {
      const res = await apiRequest(`/doubts/${doubt.id}/pin`, {
        method: 'PUT'
      });
      showToast(res.message || 'Pin status updated!', 'success');
      fetchDoubts();
      if (activeDoubt && activeDoubt.id === doubt.id) {
        setActiveDoubt({ ...activeDoubt, isPinned: !activeDoubt.isPinned });
      }
    } catch (err: any) {
      console.error('Error toggling pin:', err);
      showToast('Failed to toggle pin status.', 'error');
    }
  };

  // Toggle Closed Status (Mentor/Admin only)
  const handleToggleClose = async (doubt: Doubt) => {
    try {
      const res = await apiRequest(`/doubts/${doubt.id}/close`, {
        method: 'PUT'
      });
      showToast(res.message || 'Close status updated!', 'success');
      fetchDoubts();
      if (activeDoubt && activeDoubt.id === doubt.id) {
        setActiveDoubt({ ...activeDoubt, isClosed: !activeDoubt.isClosed });
      }
    } catch (err: any) {
      console.error('Error toggling close:', err);
      showToast('Failed to toggle closed status.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-white text-left font-sans animate-in fade-in duration-300 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <MessageSquare className={`h-6 w-6 ${themeStyles.accent}`} />
            Academic Discussion Board
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Resolve your coding blockers, homework tasks, and academic doubts with peers and mentors.
          </p>
        </div>
        <button
          onClick={openAskModalForm}
          className={`px-4 py-2.5 ${themeStyles.button} text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer border-none flex items-center gap-2 shadow-lg`}
        >
          <Plus className="h-4 w-4" /> Ask Doubt
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-8 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions by author name, subject, topics or content..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/40 border border-white/5 focus:border-indigo-500 rounded-xl text-xs text-white outline-none font-medium placeholder-zinc-500"
          />
        </div>

        {/* Filter by Subject */}
        <div className="md:col-span-4 flex items-center gap-2 bg-[#0B0F19]/40 border border-white/5 rounded-xl px-3 py-1">
          <BookOpen className="h-4 w-4 text-zinc-500 shrink-0" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-transparent text-xs text-white font-bold outline-none border-none cursor-pointer w-full py-1.5"
          >
            {uniqueSubjects.map((sub) => (
              <option key={sub} value={sub} className="bg-[#0B0F19] text-white font-medium">
                {sub === 'All' ? 'All Subjects' : sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doubts Board list */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-500 rounded-full" />
          <p className="text-xs text-zinc-500 italic">Retrieving discussions...</p>
        </div>
      ) : filteredDoubts.length === 0 ? (
        <div className="py-24 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-zinc-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white">No doubts posted yet.</h4>
            <p className="text-xs text-zinc-500">Ask your first academic doubt to start collaborating.</p>
          </div>
          <button
            onClick={openAskModalForm}
            className={`px-4 py-2 ${themeStyles.button} text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 border-none cursor-pointer`}
          >
            + Ask Doubt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoubts.map((doubt) => {
            const replyCount = doubt.Answers ? doubt.Answers.length : 0;
            const isOwner = user?.id === doubt.userId;
            const isStaff = user?.role === 'mentor' || user?.role === 'admin';

            return (
              <div 
                key={doubt.id} 
                className={`p-5 ${themeStyles.bg} ${themeStyles.border} rounded-2xl flex flex-col justify-between space-y-4 hover:border-white/20 transition duration-200 relative group`}
              >
                {/* Pin Badge in corner */}
                {doubt.isPinned && (
                  <div className="absolute top-4 right-4 text-amber-400" title="Pinned Discussion">
                    <Pin className="h-4 w-4 fill-current rotate-45" />
                  </div>
                )}

                <div className="space-y-3">
                  {/* Metadata Header */}
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0 font-black text-[10px]">
                      {doubt.Author?.fullName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-white block">{doubt.Author?.fullName || 'Student'}</span>
                      <span className="text-[8px] text-zinc-550 block font-mono">
                        {new Date(doubt.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Subject & Topic tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {doubt.subject && (
                      <span className="text-[8px] font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/15 max-w-[150px] truncate">
                        {doubt.subject}
                      </span>
                    )}
                    {doubt.topic && (
                      <span className="text-[8px] font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/15 max-w-[150px] truncate">
                        {doubt.topic}
                      </span>
                    )}
                    {doubt.isClosed && (
                      <span className="text-[8px] font-bold text-rose-450 px-2 py-0.5 bg-rose-500/10 rounded-md border border-rose-500/15 flex items-center gap-0.5">
                        <Lock className="h-2.5 w-2.5" /> Closed
                      </span>
                    )}
                  </div>

                  {/* Question description content */}
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium line-clamp-3 whitespace-pre-line">
                    {doubt.description}
                  </p>
                </div>

                {/* Footer bar */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  {/* Status, replies count */}
                  <div className="flex items-center gap-3">
                    <span onClick={() => (isOwner || isStaff) && handleToggleSolved(doubt)} className={`text-[9px] font-black uppercase px-2 py-0.5 rounded cursor-pointer ${
                      doubt.isSolved 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {doubt.isSolved ? 'Solved' : 'Open'}
                    </span>

                    <span className="text-[9px] text-zinc-550 font-bold flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {replyCount} replies
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Owner CRUD actions */}
                    {isOwner && !doubt.isClosed && (
                      <>
                        <button
                          onClick={() => openEditModalForm(doubt)}
                          className="p-1.5 bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoubt(doubt.id)}
                          className="p-1.5 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-455 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {/* View replies thread button */}
                    <button
                      onClick={() => handleOpenThread(doubt)}
                      className={`px-3 py-1.5 bg-slate-900 border hover:border-indigo-500/30 text-white text-[9px] font-black rounded-lg cursor-pointer uppercase tracking-wider flex items-center gap-0.5 ${doubt.isClosed ? 'border-white/5' : 'border-white/10'}`}
                    >
                      View discussion <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating ask doubt trigger */}
      <button
        onClick={openAskModalForm}
        className={`fixed bottom-8 right-8 h-12 w-12 rounded-full ${themeStyles.button} text-white flex items-center justify-center shadow-2xl transition duration-300 transform hover:scale-105 cursor-pointer border-none z-40`}
        title="Ask Doubt"
      >
        <Plus className="h-6 w-6 stroke-[3]" />
      </button>

      {/* 1. ASK / EDIT DOUBT MODAL */}
      {showAskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="max-w-[420px] w-full bg-[#0d0f1a] border border-white/5 rounded-2xl p-6 space-y-5 shadow-2xl text-white text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <HelpCircle className={`h-5 w-5 ${themeStyles.accent}`} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {editingDoubt ? 'Edit Doubt Details' : 'Ask Academic Doubt'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAskModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-xs border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoubt} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Core CS"
                    className={`w-full px-3 py-2 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                  />
                </div>

                {/* Topic */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Memory Management"
                    className={`w-full px-3 py-2 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Question *</label>
                <textarea
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Explain details of your academic doubt here, including error messages or specific concepts you are stuck with..."
                  rows={6}
                  className={`w-full px-3 py-2.5 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium resize-none leading-relaxed`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 border border-white/5 hover:bg-white/5 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className={`px-5 py-2 ${themeStyles.button} text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border-none shadow-md`}
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DISCUSSION THREAD DRAWER MODAL */}
      {activeDoubt && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200">
          <div className="max-w-[550px] w-full h-full bg-[#070912] border-l border-white/5 flex flex-col justify-between shadow-2xl text-left text-white animate-in slide-in-from-right duration-300">
            
            {/* Thread Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider">Discussion Thread</h3>
              </div>
              <button 
                onClick={handleCloseThread}
                className="text-zinc-400 hover:text-white font-bold text-base bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Doubt & Replies thread list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Parent Doubt card */}
              <div className="p-5 bg-slate-950/40 border border-white/5 rounded-2xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0">
                      {activeDoubt.Author?.fullName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{activeDoubt.Author?.fullName}</h4>
                      <span className="text-[8px] text-zinc-550 font-mono">
                        {new Date(activeDoubt.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Solved Status */}
                  <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${
                    activeDoubt.isSolved 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {activeDoubt.isSolved ? 'Solved' : 'Open'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[8px] text-indigo-400 font-bold block">Subject: {activeDoubt.subject || 'General'}</span>
                  {activeDoubt.topic && <span className="text-[8px] text-amber-400 font-bold block">Topic: {activeDoubt.topic}</span>}
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium whitespace-pre-line pt-2">
                    {activeDoubt.description}
                  </p>
                </div>

                {/* Mentor Action buttons bar */}
                {(user?.role === 'mentor' || user?.role === 'admin') && (
                  <div className="flex gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => handleTogglePin(activeDoubt)}
                      className={`px-3 py-1.5 border rounded-lg text-[9px] font-black uppercase cursor-pointer transition-all flex items-center gap-1 ${
                        activeDoubt.isPinned 
                          ? 'bg-amber-500/15 border-amber-500/20 text-amber-400' 
                          : 'bg-slate-900 border-white/10 text-zinc-400'
                      }`}
                    >
                      <Pin className="h-3 w-3" /> {activeDoubt.isPinned ? 'Pinned' : 'Pin'}
                    </button>

                    <button
                      onClick={() => handleToggleClose(activeDoubt)}
                      className={`px-3 py-1.5 border rounded-lg text-[9px] font-black uppercase cursor-pointer transition-all flex items-center gap-1 ${
                        activeDoubt.isClosed 
                          ? 'bg-rose-500/15 border-rose-500/20 text-rose-455' 
                          : 'bg-slate-900 border-white/10 text-zinc-400'
                      }`}
                    >
                      <Lock className="h-3 w-3" /> {activeDoubt.isClosed ? 'Closed' : 'Close'}
                    </button>

                    <button
                      onClick={() => handleToggleSolved(activeDoubt)}
                      className={`px-3 py-1.5 border rounded-lg text-[9px] font-black uppercase cursor-pointer transition-all flex items-center gap-1 ${
                        activeDoubt.isSolved 
                          ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-900 border-white/10 text-zinc-400'
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" /> {activeDoubt.isSolved ? 'Mark Open' : 'Mark Solved'}
                    </button>
                  </div>
                )}
              </div>

              {/* Replies Thread Header */}
              <div className="space-y-4 pt-2">
                <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase block">
                  Replies Thread ({replies.length})
                </span>

                {loadingReplies ? (
                  <div className="text-center py-6">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-indigo-500 rounded-full" />
                  </div>
                ) : replies.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic text-center py-6">No answers posted yet. Be the first to answer!</p>
                ) : (
                  <div className="space-y-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="p-4 bg-slate-950/20 border border-white/5 rounded-xl space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <div className="h-6 w-6 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                              {reply.Author?.fullName?.charAt(0) || 'R'}
                            </div>
                            <div>
                              <span className="text-[10px] font-black text-white block">
                                {reply.Author?.fullName}
                                {reply.Author?.role === 'mentor' && (
                                  <span className="ml-1.5 text-[7px] font-black bg-indigo-500/10 text-indigo-400 px-1 py-0.2 rounded border border-indigo-500/15 uppercase">
                                    Mentor
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          <span className="text-[8px] text-zinc-550 font-mono">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-450 leading-relaxed font-medium pl-7 whitespace-pre-line">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Reply Composer */}
            <div className="p-6 border-t border-white/5 bg-slate-950/40">
              {activeDoubt.isClosed ? (
                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center text-xs text-rose-455 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <Lock className="h-4 w-4" /> This discussion is closed.
                </div>
              ) : (
                <form onSubmit={handlePostReply} className="space-y-3">
                  <textarea
                    required
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply or solution code details here..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/5 focus:border-indigo-500 rounded-xl text-xs text-white outline-none font-medium resize-none leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className={`px-4 py-2 ${themeStyles.button} text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-200 border-none cursor-pointer shadow-md`}
                    >
                      {sendingReply ? 'Posting...' : 'Post Reply'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DiscussionBoardView;
