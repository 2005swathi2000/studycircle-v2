import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  BookOpen, 
  List, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../components/ToastProvider';

interface Schedule {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StudyScheduleViewProps {
  equippedTheme?: string;
  setActiveTab: (tab: any) => void;
}

export const StudyScheduleView: React.FC<StudyScheduleViewProps> = ({ equippedTheme, setActiveTab }) => {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout View Switcher: 'list' | 'calendar'
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  
  // Form Fields State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Monthly Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch all schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/student-schedules');
      setSchedules(res.schedules || []);
    } catch (err: any) {
      console.error('Error fetching schedules:', err);
      showToast(err.message || 'Failed to retrieve study schedules.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Theme Styling Map
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
          inputFocus: 'focus:border-fuchsia-500',
          calActive: 'bg-fuchsia-650 border border-fuchsia-500 text-white font-bold'
        };
      case 'zengarden':
        return {
          bg: 'bg-[#03140a]/80 backdrop-blur-md',
          border: 'border border-emerald-500/20 shadow-md shadow-emerald-500/5',
          accent: 'text-emerald-400',
          hoverBg: 'hover:bg-emerald-500/10',
          button: 'bg-emerald-600 hover:bg-emerald-500',
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          inputFocus: 'focus:border-emerald-500',
          calActive: 'bg-emerald-650 border border-emerald-500 text-white font-bold'
        };
      case 'theme_solar_glow':
        return {
          bg: 'bg-[#1c1209]/80 backdrop-blur-md',
          border: 'border border-amber-500/20 shadow-md shadow-amber-500/5',
          accent: 'text-amber-400',
          hoverBg: 'hover:bg-amber-500/10',
          button: 'bg-amber-600 hover:bg-amber-500',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          inputFocus: 'focus:border-amber-500',
          calActive: 'bg-amber-650 border border-amber-500 text-white font-bold'
        };
      case 'theme_dark_nebula':
        return {
          bg: 'bg-[#120a1c]/80 backdrop-blur-md',
          border: 'border border-purple-500/20 shadow-md shadow-purple-500/5',
          accent: 'text-purple-400',
          hoverBg: 'hover:bg-purple-500/10',
          button: 'bg-indigo-650 hover:bg-indigo-550',
          badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
          inputFocus: 'focus:border-purple-500',
          calActive: 'bg-indigo-650 border border-indigo-500 text-white font-bold'
        };
      default:
        return {
          bg: 'bg-[#0B0F19]/60 backdrop-blur-md',
          border: 'border border-white/5 shadow-2xl',
          accent: 'text-indigo-400',
          hoverBg: 'hover:bg-indigo-500/10',
          button: 'bg-indigo-600 hover:bg-indigo-500',
          badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
          inputFocus: 'focus:border-indigo-500',
          calActive: 'bg-indigo-600 border border-indigo-500 text-white font-bold'
        };
    }
  }, [equippedTheme]);

  // Today / Upcoming classifications (for List View)
  const sortedSchedules = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const todaySess: Schedule[] = [];
    const upcomingSess: Schedule[] = [];

    schedules.forEach(item => {
      if (item.date === todayStr) {
        todaySess.push(item);
      } else if (item.date > todayStr) {
        upcomingSess.push(item);
      }
    });

    return { todaySess, upcomingSess };
  }, [schedules]);

  // Calendar Day Grid Generator
  const calendarCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1).getDay();
    // Total days in month
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells = [];
    // Empty prefix cells for days of week padding
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    // Days cells
    for (let day = 1; day <= totalDays; day++) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [currentDate]);

  // Change Month Nav
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Open creation modal form
  const openCreateModal = () => {
    setEditingSchedule(null);
    setTitle('');
    setSubject('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setShowModal(true);
  };

  // Open edit modal form
  const openEditModal = (sched: Schedule) => {
    setEditingSchedule(sched);
    setTitle(sched.title);
    setSubject(sched.subject);
    setDate(sched.date);
    setStartTime(sched.startTime);
    setEndTime(sched.endTime);
    setDescription(sched.description || '');
    setShowModal(true);
  };

  // Form Submit Save Handler
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !date || !startTime || !endTime) {
      showToast('All fields marked * are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        subject: subject.trim(),
        date,
        startTime,
        endTime,
        description: description.trim() || null
      };

      if (editingSchedule) {
        await apiRequest(`/student-schedules/${editingSchedule.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Schedule Saved Successfully', 'success');
      } else {
        await apiRequest('/student-schedules', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Schedule Saved Successfully', 'success');
      }

      setShowModal(false);
      fetchSchedules(); // Dynamic list refresh without page reload
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      showToast(err.message || 'Error saving study schedule.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled session?')) return;
    try {
      await apiRequest(`/student-schedules/${id}`, {
        method: 'DELETE'
      });
      showToast('Schedule deleted successfully!', 'success');
      fetchSchedules(); // Dynamic refresh
    } catch (err: any) {
      console.error('Error deleting schedule:', err);
      showToast('Error deleting study schedule.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-white text-left font-sans animate-in fade-in duration-300 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarIcon className={`h-6 w-6 ${themeStyles.accent}`} />
            Study Schedule
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Schedule study cycles, track revisions, and set reminders for upcoming placement exams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Views */}
          <div className="flex bg-[#0B0F19]/60 border border-white/5 rounded-xl p-1">
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none flex items-center gap-1 ${
                currentView === 'calendar' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white bg-transparent'
              }`}
            >
              <CalendarIcon className="h-3 w-3" /> Calendar
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none flex items-center gap-1 ${
                currentView === 'list' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white bg-transparent'
              }`}
            >
              <List className="h-3 w-3" /> List View
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className={`px-4 py-2.5 ${themeStyles.button} text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer border-none flex items-center gap-2 shadow-lg`}
          >
            <Plus className="h-4 w-4" /> Schedule Session
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-500 rounded-full" />
          <p className="text-xs text-zinc-500 italic">Retrieving schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        // Empty State
        <div className="py-24 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-zinc-400">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white">No study sessions scheduled.</h4>
            <p className="text-xs text-zinc-500">Plan out your academic studies to stay accountable.</p>
          </div>
          <button
            onClick={openCreateModal}
            className={`px-4 py-2 ${themeStyles.button} text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 border-none cursor-pointer`}
          >
            + Create Schedule
          </button>
        </div>
      ) : currentView === 'list' ? (
        // 1. LIST VIEW
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Today's Schedule */}
          <div className={`p-6 ${themeStyles.bg} ${themeStyles.border} rounded-2xl space-y-4`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 border-b border-white/5 pb-2">
              🗓 Today's Schedule
            </h3>
            
            {sortedSchedules.todaySess.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-left py-4">No study sessions scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {sortedSchedules.todaySess.map((sess) => (
                  <div key={sess.id} className="p-4 bg-slate-950/20 border border-white/5 rounded-xl flex justify-between items-start gap-4">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-white leading-snug">{sess.title}</h4>
                      <p className="text-[10px] text-zinc-450 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        {sess.startTime} - {sess.endTime}
                      </p>
                      <span className="text-[9px] font-bold text-indigo-400 block pt-1">Subject: {sess.subject}</span>
                      {sess.description && <p className="text-[10px] text-zinc-500 italic leading-relaxed pt-1.5">{sess.description}</p>}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(sess)}
                        className="p-1.5 bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(sess.id)}
                        className="p-1.5 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-455 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className={`p-6 ${themeStyles.bg} ${themeStyles.border} rounded-2xl space-y-4`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 border-b border-white/5 pb-2">
              🚀 Upcoming Sessions
            </h3>
            
            {sortedSchedules.upcomingSess.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-left py-4">No upcoming study sessions planned.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {sortedSchedules.upcomingSess.map((sess) => (
                  <div key={sess.id} className="p-4 bg-slate-950/20 border border-white/5 rounded-xl flex justify-between items-start gap-4">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-white leading-snug">{sess.title}</h4>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        {sess.date} @ {sess.startTime} - {sess.endTime}
                      </p>
                      <span className="text-[9px] font-bold text-indigo-400 block pt-1">Subject: {sess.subject}</span>
                      {sess.description && <p className="text-[10px] text-zinc-500 italic leading-relaxed pt-1.5">{sess.description}</p>}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(sess)}
                        className="p-1.5 bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(sess.id)}
                        className="p-1.5 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-455 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // 2. CALENDAR VIEW
        <div className={`p-6 ${themeStyles.bg} ${themeStyles.border} rounded-2xl space-y-6`}>
          {/* Calendar Header with navigation */}
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <CalendarIcon className={`h-4.5 w-4.5 ${themeStyles.accent}`} />
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="p-2 border border-white/10 hover:bg-white/5 text-white rounded-lg cursor-pointer bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 border border-white/10 hover:bg-white/5 text-white rounded-lg cursor-pointer bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div>
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest pb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((day, cellIdx) => {
                if (!day) {
                  return <div key={`empty-${cellIdx}`} className="bg-transparent aspect-square" />;
                }

                // Check for schedules on this day
                const dayStr = day.toISOString().split('T')[0];
                const daySess = schedules.filter(s => s.date === dayStr);
                const hasSess = daySess.length > 0;
                
                const isToday = new Date().toISOString().split('T')[0] === dayStr;

                return (
                  <div 
                    key={dayStr} 
                    className={`p-2 bg-[#0B0F19]/40 border rounded-xl flex flex-col justify-between min-h-[75px] aspect-square transition text-left relative ${
                      isToday ? 'border-indigo-500/50' : 'border-white/5'
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-400 font-extrabold' : 'text-slate-400'}`}>
                      {day.getDate()}
                    </span>

                    {/* render miniature schedules list inside day block */}
                    {hasSess && (
                      <div className="space-y-1 mt-1 overflow-y-auto max-h-12 scrollbar-none">
                        {daySess.slice(0, 2).map((s) => (
                          <div 
                            key={s.id} 
                            onClick={() => openEditModal(s)}
                            className="px-1.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 rounded text-[7px] text-indigo-400 font-bold truncate cursor-pointer hover:bg-indigo-500/20"
                            title={`${s.title} (${s.startTime})`}
                          >
                            {s.title}
                          </div>
                        ))}
                        {daySess.length > 2 && (
                          <span className="text-[6.5px] text-zinc-550 font-black tracking-wide block">
                            +{daySess.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SCHEDULE FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="max-w-[420px] w-full bg-[#0d0f1a] border border-white/5 rounded-2xl p-6 space-y-5 shadow-2xl text-white text-left animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className={`h-5 w-5 ${themeStyles.accent}`} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {editingSchedule ? 'Edit Study Session' : 'Schedule Study Session'}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-xs border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Session Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DSA Graphs Mock Practice"
                  className={`w-full px-3 py-2.5 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                />
              </div>

              {/* Subject Dropdown/input */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Programming & DSA"
                  className={`w-full px-3 py-2.5 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                />
              </div>

              {/* Date & Time Picker */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-2 py-2 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full px-2 py-2 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">End Time *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full px-2 py-2 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium`}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional study details or syllabus topics to cover during focus session..."
                  rows={3}
                  className={`w-full px-3 py-2 bg-slate-950/50 border border-white/5 ${themeStyles.inputFocus} rounded-xl text-xs text-white outline-none font-medium resize-none leading-relaxed`}
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

export default StudyScheduleView;
