import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  BookOpen, 
  Tag, 
  ArrowUpDown,
  X,
  FileEdit
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../components/ToastProvider';

interface PersonalNote {
  id: string;
  title: string;
  subject: string | null;
  topic: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface PersonalNotesViewProps {
  equippedTheme?: string;
  setActiveTab: (tab: any) => void;
}

export const PersonalNotesView: React.FC<PersonalNotesViewProps> = ({ equippedTheme, setActiveTab }) => {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Load notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/personal-notes');
      setNotes(res.notes || []);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      showToast(err.message || 'Failed to fetch personal notes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Theme styling configurations
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

  // Extract unique subjects from notes for filtering dropdown
  const uniqueSubjects = useMemo(() => {
    const subjectsSet = new Set<string>();
    notes.forEach(note => {
      if (note.subject && note.subject.trim()) {
        subjectsSet.add(note.subject.trim());
      }
    });
    return ['All', ...Array.from(subjectsSet)];
  }, [notes]);

  // Filter and Sort logic
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        note =>
          note.title.toLowerCase().includes(q) ||
          (note.subject && note.subject.toLowerCase().includes(q)) ||
          (note.topic && note.topic.toLowerCase().includes(q)) ||
          note.content.toLowerCase().includes(q)
      );
    }

    // Filter by subject
    if (selectedSubject !== 'All') {
      result = result.filter(note => note.subject === selectedSubject);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [notes, searchQuery, selectedSubject, sortBy]);

  // Open creation modal
  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setSubject('');
    setTopic('');
    setContent('');
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (note: PersonalNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setSubject(note.subject || '');
    setTopic(note.topic || '');
    setContent(note.content);
    setShowModal(true);
  };

  // Form submit handler
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        subject: subject.trim() || null,
        topic: topic.trim() || null,
        content
      };

      if (editingNote) {
        // Edit flow
        await apiRequest(`/personal-notes/${editingNote.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Note Saved Successfully', 'success');
      } else {
        // Create flow
        await apiRequest('/personal-notes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Note Saved Successfully', 'success');
      }

      setShowModal(false);
      fetchNotes(); // Reload notes list directly, no page reload
    } catch (err: any) {
      console.error('Error saving note:', err);
      showToast(err.message || 'Error saving personal note.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete handler
  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      await apiRequest(`/personal-notes/${id}`, {
        method: 'DELETE'
      });
      showToast('Note deleted successfully!', 'success');
      fetchNotes(); // Reload notes list directly
    } catch (err: any) {
      console.error('Error deleting note:', err);
      showToast(err.message || 'Error deleting personal note.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-white text-left font-sans animate-in fade-in duration-300 relative pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className={`h-6 w-6 ${themeStyles.accent}`} />
            Personal Study Notes
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Organize, revise, and revisit your private study materials and semester notes.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className={`px-4 py-2.5 ${themeStyles.button} text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer border-none flex items-center gap-2 shadow-lg`}
        >
          <Plus className="h-4 w-4" /> Create Note
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, subject, content..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19]/40 border border-white/5 focus:border-indigo-500 rounded-xl text-xs text-white outline-none font-medium placeholder-zinc-500"
          />
        </div>

        {/* Filter by Subject */}
        <div className="md:col-span-3 flex items-center gap-2 bg-[#0B0F19]/40 border border-white/5 rounded-xl px-3 py-1">
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

        {/* Sort Order */}
        <div className="md:col-span-3 flex items-center gap-2 bg-[#0B0F19]/40 border border-white/5 rounded-xl px-3 py-1">
          <ArrowUpDown className="h-4 w-4 text-zinc-500 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs text-white font-bold outline-none border-none cursor-pointer w-full py-1.5"
          >
            <option value="latest" className="bg-[#0B0F19] text-white font-medium">Latest Updated</option>
            <option value="oldest" className="bg-[#0B0F19] text-white font-medium">Oldest Created</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-500 rounded-full" />
          <p className="text-xs text-zinc-500 italic">Loading study notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        // Empty State
        <div className="py-24 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-zinc-400">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white">No notes created yet.</h4>
            <p className="text-xs text-zinc-500">Create your first study note.</p>
          </div>
          <button
            onClick={openCreateModal}
            className={`px-4 py-2 ${themeStyles.button} text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 border-none cursor-pointer`}
          >
            + New Note
          </button>
        </div>
      ) : (
        // Card Layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div 
              key={note.id} 
              className={`p-5 ${themeStyles.bg} ${themeStyles.border} rounded-2xl flex flex-col justify-between space-y-4 hover:border-white/20 transition duration-200 group`}
            >
              <div className="space-y-3">
                {/* Subject & Topic Badges */}
                <div className="flex flex-wrap gap-2">
                  {note.subject && (
                    <span className="text-[9px] font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/15 max-w-[150px] truncate">
                      {note.subject}
                    </span>
                  )}
                  {note.topic && (
                    <span className="text-[9px] font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/15 max-w-[150px] truncate">
                      {note.topic}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-black text-white leading-snug group-hover:text-indigo-300 transition-colors">
                  {note.title}
                </h3>

                {/* Rich Content View */}
                <p className="text-xs text-zinc-400 leading-relaxed font-medium line-clamp-4 whitespace-pre-line">
                  {note.content}
                </p>
              </div>

              {/* Card Footer: Metadata & Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-[9px] text-zinc-550 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(note.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                
                <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-2 bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    title="Edit Note"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-455 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Create Button */}
      <button
        onClick={openCreateModal}
        className={`fixed bottom-8 right-8 h-12 w-12 rounded-full ${themeStyles.button} text-white flex items-center justify-center shadow-2xl transition duration-300 transform hover:scale-105 cursor-pointer border-none z-40`}
        title="Create Note"
      >
        <Plus className="h-6 w-6 stroke-[3]" />
      </button>

      {/* Create/Edit Note Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="max-w-[420px] w-full bg-[#0d0f1a] border border-white/5 rounded-2xl p-6 space-y-5 shadow-2xl text-white text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <FileEdit className={`h-5 w-5 ${themeStyles.accent}`} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {editingNote ? 'Edit Study Note' : 'Create Study Note'}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-xs border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DBMS Normal Forms"
                  className={`w-full px-3 py-2.5 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                />
              </div>

              {/* Subject & Topic inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Core CS"
                    className={`w-full px-3 py-2 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. 3NF & BCNF"
                    className={`w-full px-3 py-2 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                  />
                </div>
              </div>

              {/* Rich Content Area */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Rich Text Note</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your study notes details, references, equations, or cheat sheet references here..."
                  rows={6}
                  className={`w-full px-3 py-2.5 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium resize-none leading-relaxed`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-white/5 hover:bg-white/5 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-5 py-2 ${themeStyles.button} text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border-none shadow-md`}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PersonalNotesView;
