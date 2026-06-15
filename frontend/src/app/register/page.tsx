'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ToastProvider';
import { 
  ArrowRight, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  RefreshCw, 
  AlertCircle, 
  Shield, 
  Clock, 
  BookOpen, 
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';

const COLLEGES = [
  { code: 'VRSEC', name: 'VR Siddhartha Engineering College, Vijayawada' },
  { code: 'PVPSIT', name: 'PVPSIT, Vijayawada' },
  { code: 'RVRJC', name: 'RVR & JC College of Engineering, Guntur' },
  { code: 'VITAP', name: 'VIT-AP University, Amaravati' },
  { code: 'KLU', name: 'KL University, Vaddeswaram' },
  { code: 'GITAM', name: 'GITAM University, Visakhapatnam' },
  { code: 'SRKR', name: 'SRKR Engineering College, Bhimavaram' },
  { code: 'JNTUK', name: 'JNTU Kakinada (JNTUK)' },
  { code: 'JNTUA', name: 'JNTU Anantapur (JNTUA)' },
  { code: 'AU', name: 'Andhra University, Vizag' },
  { code: 'CBIT', name: 'CBIT, Hyderabad' },
  { code: 'ADITYA_UNI', name: 'Aditya University' },
  { code: 'OTHER', name: 'Other College / University' }
];

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user: currentUser, setUser: setCurrentUser, loading: globalLoading } = useApp();

  const [regRole, setRegRole] = useState<'student' | 'mentor'>('student');
  const [formLoading, setFormLoading] = useState(false);

  // Student inputs
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentGender, setStudentGender] = useState('male');
  const [studentUser, setStudentUser] = useState('');
  const [studentPass, setStudentPass] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [studentOtp, setStudentOtp] = useState('');
  const [studentOtpSent, setStudentOtpSent] = useState(false);
  const [studentOtpEmail, setStudentOtpEmail] = useState('');

  // Mentor inputs
  const [mentorFirstName, setMentorFirstName] = useState('');
  const [mentorLastName, setMentorLastName] = useState('');
  const [mentorGender, setMentorGender] = useState('male');
  const [mentorUser, setMentorUser] = useState('');
  const [mentorPass, setMentorPass] = useState('');
  const [mentorContact, setMentorContact] = useState('');
  const [mentorInstitution, setMentorInstitution] = useState('');
  const [mentorOtp, setMentorOtp] = useState('');
  const [mentorOtpSent, setMentorOtpSent] = useState(false);
  const [mentorOtpEmail, setMentorOtpEmail] = useState('');

  // Password visibility
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [showMentorPass, setShowMentorPass] = useState(false);

  // Username validation state
  const [usernameToCheck, setUsernameToCheck] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; available: boolean; method?: string } | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock Inbox States
  const [showInbox, setShowInbox] = useState(false);
  const [inboxEmails, setInboxEmails] = useState<any[]>([]);
  const [unreadInboxCount, setUnreadInboxCount] = useState(0);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [isDevMode, setIsDevMode] = useState(false);

  const lastSeenEmailIdRef = useRef<string | null>(null);
  const studentOtpSentRef = useRef(false);
  const studentOtpRef = useRef('');
  const studentOtpEmailRef = useRef('');

  const mentorOtpSentRef = useRef(false);
  const mentorOtpRef = useRef('');
  const mentorOtpEmailRef = useRef('');
  const autofilledEmailsRef = useRef<Set<string>>(new Set());

  // Keep refs in sync for the mock inbox polling loop
  useEffect(() => {
    studentOtpSentRef.current = studentOtpSent;
  }, [studentOtpSent]);
  
  useEffect(() => {
    studentOtpRef.current = studentOtp;
  }, [studentOtp]);

  useEffect(() => {
    studentOtpEmailRef.current = studentOtpEmail;
  }, [studentOtpEmail]);

  useEffect(() => {
    mentorOtpSentRef.current = mentorOtpSent;
  }, [mentorOtpSent]);
  
  useEffect(() => {
    mentorOtpRef.current = mentorOtp;
  }, [mentorOtp]);

  useEffect(() => {
    mentorOtpEmailRef.current = mentorOtpEmail;
  }, [mentorOtpEmail]);

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (!globalLoading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, globalLoading, router]);

  // Dev mode and mock inbox polling
  useEffect(() => {
    const isLocal = typeof window !== 'undefined' && 
                    (window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1');
    setIsDevMode(isLocal);

    if (isLocal) {
      fetchMockInbox();
      const interval = setInterval(fetchMockInbox, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchMockInbox = async () => {
    try {
      const data = await apiRequest('/auth/mock-inbox');
      const emails = data.inbox || [];
      setInboxEmails(emails);
      setUnreadInboxCount(emails.length);

      if (emails.length > 0) {
        const latestEmail = emails[0];
        
        if (lastSeenEmailIdRef.current === null) {
          lastSeenEmailIdRef.current = latestEmail.id;
        } else if (lastSeenEmailIdRef.current === 'empty') {
          lastSeenEmailIdRef.current = latestEmail.id;
          setActiveNotification(latestEmail);
          setTimeout(() => {
            setActiveNotification((curr: any) => curr?.id === latestEmail.id ? null : curr);
          }, 6000);
        } else if (latestEmail.id !== lastSeenEmailIdRef.current) {
          lastSeenEmailIdRef.current = latestEmail.id;
          setActiveNotification(latestEmail);
          setTimeout(() => {
            setActiveNotification((curr: any) => curr?.id === latestEmail.id ? null : curr);
          }, 6000);
        }

        // Student OTP autofill
        if (studentOtpSentRef.current && !studentOtpRef.current && studentOtpEmailRef.current) {
          const matchingEmail = emails.find((email: any) => 
            email.to.trim().toLowerCase() === studentOtpEmailRef.current.trim().toLowerCase() && 
            !email.subject.includes('Reset')
          );
          if (matchingEmail && !autofilledEmailsRef.current.has(matchingEmail.id)) {
            autofilledEmailsRef.current.add(matchingEmail.id);
            setStudentOtp(matchingEmail.otp);
            showToast(`📬 Inbox Sync: Verification email received! OTP (${matchingEmail.otp}) automatically filled.`, 'success');
          }
        }

        // Mentor OTP autofill
        if (mentorOtpSentRef.current && !mentorOtpRef.current && mentorOtpEmailRef.current) {
          const matchingEmail = emails.find((email: any) => 
            email.to.trim().toLowerCase() === mentorOtpEmailRef.current.trim().toLowerCase() && 
            !email.subject.includes('Reset')
          );
          if (matchingEmail && !autofilledEmailsRef.current.has(matchingEmail.id)) {
            autofilledEmailsRef.current.add(matchingEmail.id);
            setMentorOtp(matchingEmail.otp);
            showToast(`📬 Inbox Sync: Verification email received! OTP (${matchingEmail.otp}) automatically filled.`, 'success');
          }
        }
      } else {
        if (lastSeenEmailIdRef.current === null) {
          lastSeenEmailIdRef.current = 'empty';
        }
      }
    } catch (err) {
      console.error('Error fetching mock inbox:', err);
    }
  };

  const handleAutofillOtp = (email: any) => {
    setStudentOtp(email.otp);
    setMentorOtp(email.otp);
    showToast(`Autofilled Registration Verification OTP: ${email.otp}`, 'success');
  };

  const handleUsernameChange = (val: string, role: string) => {
    if (role === 'student') setStudentUser(val);
    else if (role === 'mentor') setMentorUser(val);

    setUsernameToCheck(val);
    setUsernameStatus(null);

    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);

    if (!val.trim()) return;

    setCheckingUsername(true);
    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await apiRequest(`/auth/validate-username?username=${encodeURIComponent(val)}`);
        setUsernameStatus({
          checked: true,
          available: data.available,
          method: data.checkMethod
        });
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);
  };

  const isValidEmailOrPhone = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    const trimmed = val.trim();
    return emailRegex.test(trimmed) || phoneRegex.test(trimmed);
  };

  const sendRegOtp = async (role: 'student' | 'mentor') => {
    const contact = role === 'student' ? studentContact : mentorContact;
    if (!contact.trim()) {
      showToast('Please enter an email or phone number first.', 'error');
      return;
    }
    if (!isValidEmailOrPhone(contact)) {
      showToast('Invalid email, please check and try again!', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ type: 'Verification', value: contact })
      });
      const emailVal = data.email || contact.trim().toLowerCase();
      if (role === 'student') {
        setStudentOtpSent(true);
        setStudentOtpEmail(emailVal);
        setStudentOtp('');
      } else {
        setMentorOtpSent(true);
        setMentorOtpEmail(emailVal);
        setMentorOtp('');
      }
      showToast(data.message || 'Verification code sent!', 'success');
      if (data.isMocked) {
        showToast(`Local Test: Polling mock inbox to autofill...`, 'info');
        setTimeout(fetchMockInbox, 500);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to send verification code.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFirstName.trim() || !studentLastName.trim() || !studentUser.trim() || !studentPass || !studentContact.trim() || !studentOtp || !studentGender) {
      showToast('All fields (including name, username, verification, and gender) are required.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: studentFirstName.trim(),
          lastName: studentLastName.trim(),
          username: studentUser.trim(),
          password: studentPass,
          role: 'student',
          email: studentContact.includes('@') ? studentContact.trim().toLowerCase() : null,
          phone: !studentContact.includes('@') ? studentContact.trim() : null,
          gender: studentGender,
          otp: studentOtp
        })
      });
      setCurrentUser(data.user);
      showToast(data.message || 'Student account created successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleMentorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorFirstName.trim() || !mentorLastName.trim() || !mentorUser.trim() || !mentorPass || !mentorInstitution || !mentorContact.trim() || !mentorOtp || !mentorGender) {
      showToast('All fields (including name, username, college, verification, and gender) are required.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: mentorFirstName.trim(),
          lastName: mentorLastName.trim(),
          username: mentorUser.trim(),
          password: mentorPass,
          role: 'mentor',
          email: mentorContact.includes('@') ? mentorContact.trim().toLowerCase() : null,
          phone: !mentorContact.includes('@') ? mentorContact.trim() : null,
          gender: mentorGender,
          otp: mentorOtp,
          institution: mentorInstitution
        })
      });
      showToast(data.message || 'Mentor registered. Awaiting Admin Approval.', 'success');
      if (data.user && data.user.isApproved) {
        setCurrentUser(data.user);
        showToast('Approved automatically. Redirecting...', 'success');
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  if (globalLoading) {
    return (
      <div className="min-h-screen bg-[#060a16] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100 flex flex-col md:flex-row relative overflow-hidden font-sans antialiased">
      {/* 🔔 Sliding Email Notification Banner */}
      {isDevMode && activeNotification && (
        <div className="fixed top-6 right-6 z-[10000] max-w-sm w-full bg-[#0E1017]/95 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 pointer-events-auto flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#818CF8] flex items-center justify-center shrink-0 animate-bounce">
            <Mail className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1 text-left">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-indigo-400">New Email Received</span>
              <button 
                onClick={() => setActiveNotification(null)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
            <h4 className="text-xs font-black text-white">{activeNotification.subject}</h4>
            <p className="text-[10px] text-slate-350 leading-relaxed font-semibold">
              To: <span className="text-indigo-300">{activeNotification.to}</span>
            </p>
            <div className="p-2 bg-slate-950 border border-white/5 rounded-xl mt-1.5 flex items-center justify-between gap-2 text-left">
              <span className="text-[10px] font-mono text-slate-300">OTP Code: <strong className="text-rose-400 font-extrabold">{activeNotification.otp}</strong></span>
              <span className="text-[9px] font-extrabold uppercase bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded">Auto Filled</span>
            </div>
          </div>
        </div>
      )}

      {/* Left panel - Decorative Branding */}
      <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1F3A35] relative p-12 flex-col justify-between items-start text-left border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-80 pointer-events-none" />
        
        <div className="flex items-center gap-2.5 z-10 cursor-pointer" onClick={() => router.push('/')}>
          <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5227EB] via-indigo-400 to-[#E11D48] opacity-90 shadow-md animate-pulse" />
            <div className="absolute inset-[3px] rounded-full bg-[#060a16] flex items-center justify-center text-white font-bold">
              <BookOpen className="h-4.5 w-4.5 text-[#818CF8]" />
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            StudyCircle
          </span>
        </div>

        <div className="space-y-6 z-10 my-auto">
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
            Join the Collaborative <br />
            <span className="text-indigo-400">Learning Workspace</span>
          </h2>
          <p className="text-xs lg:text-sm text-slate-300 leading-relaxed font-semibold max-w-md">
            Get your dedicated virtual desk, collaborate with college peers on syllabus doubts, download shared study notes, and boost your desking consistency benchmarks.
          </p>

          <div className="space-y-4 pt-6 text-xs text-slate-300 font-semibold">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs">Collaborative Lounges</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Focus rooms with real-time seating checklists.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs">Campus Gates</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Secure OTP credentials and coordinator verification flow.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs">Streak Badges</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Rank up on local placement leaderboards.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-450 z-10 leading-normal">
          © 2026 StudyCircle. Active in Vijayawada, Guntur, Vizag, and Hyderabad clusters.
        </div>
      </div>

      {/* Right panel - Registration Form */}
      <div className="flex-1 w-full md:w-7/12 flex items-center justify-center p-6 md:p-12 overflow-y-auto max-h-screen">
        <div className="max-w-md w-full space-y-6 text-left py-8">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">Create Your Account</h3>
            <p className="text-xs text-slate-400">Join the AP & Telangana college cluster lobby workspaces.</p>
          </div>

          {/* Role selector tabs */}
          <div className="flex bg-[#0e1428] p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setRegRole('student')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${regRole === 'student' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Student Workspace
            </button>
            <button
              type="button"
              onClick={() => setRegRole('mentor')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${regRole === 'mentor' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Mentor Workspace
            </button>
          </div>

          {/* Form */}
          {regRole === 'student' ? (
            <form onSubmit={handleStudentRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Swathi"
                    value={studentFirstName}
                    onChange={(e) => setStudentFirstName(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. V"
                    value={studentLastName}
                    onChange={(e) => setStudentLastName(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                <select
                  value={studentGender}
                  onChange={(e) => setStudentGender(e.target.value)}
                  className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500/50 outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Others</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Choose unique username"
                    value={studentUser}
                    onChange={(e) => handleUsernameChange(e.target.value, 'student')}
                    className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    required
                  />
                </div>
                {checkingUsername && <p className="text-[9px] text-slate-500">Checking availability...</p>}
                {usernameStatus && usernameStatus.checked && (
                  <p className={`text-[9px] font-bold ${usernameStatus.available ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {usernameStatus.available ? `✓ Available (${usernameStatus.method})` : `✗ Username already taken`}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showStudentPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={studentPass}
                    onChange={(e) => setStudentPass(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPass(!showStudentPass)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-bold"
                  >
                    {showStudentPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Email / Phone</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="email@college.edu or +91..."
                    value={studentContact}
                    onChange={(e) => setStudentContact(e.target.value)}
                    disabled={studentOtpSent}
                    className="flex-1 bg-[#0a0e1c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => sendRegOtp('student')}
                    disabled={formLoading || studentOtpSent}
                    className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-550 disabled:bg-indigo-700/30 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    {studentOtpSent ? 'Sent ✓' : 'Verify'}
                  </button>
                </div>
              </div>

              {studentOtpSent && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification Code (OTP)</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP code"
                    value={studentOtp}
                    onChange={(e) => setStudentOtp(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-indigo-500/30 rounded-xl px-4 py-2.5 text-xs text-white font-mono text-center tracking-widest placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading || usernameStatus?.available === false}
                className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338ca] disabled:bg-indigo-650/50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {formLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                Register & Join StudyCircle
              </button>
            </form>
          ) : (
            <form onSubmit={handleMentorRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Swetha"
                    value={mentorFirstName}
                    onChange={(e) => setMentorFirstName(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. R"
                    value={mentorLastName}
                    onChange={(e) => setMentorLastName(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                <select
                  value={mentorGender}
                  onChange={(e) => setMentorGender(e.target.value)}
                  className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500/50 outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Others</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Choose unique username"
                    value={mentorUser}
                    onChange={(e) => handleUsernameChange(e.target.value, 'mentor')}
                    className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    required
                  />
                </div>
                {checkingUsername && <p className="text-[9px] text-slate-500">Checking availability...</p>}
                {usernameStatus && usernameStatus.checked && (
                  <p className={`text-[9px] font-bold ${usernameStatus.available ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {usernameStatus.available ? `✓ Available (${usernameStatus.method})` : `✗ Username already taken`}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showMentorPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={mentorPass}
                    onChange={(e) => setMentorPass(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMentorPass(!showMentorPass)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs font-bold"
                  >
                    {showMentorPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">College / Institution</label>
                <select
                  value={mentorInstitution}
                  onChange={(e) => setMentorInstitution(e.target.value)}
                  className="w-full bg-[#0a0e1c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500/50 outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Select College</option>
                  {COLLEGES.map((col) => (
                    <option key={col.code} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Email / Phone</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="email@college.edu or +91..."
                    value={mentorContact}
                    onChange={(e) => setMentorContact(e.target.value)}
                    disabled={mentorOtpSent}
                    className="flex-1 bg-[#0a0e1c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500/50 outline-none transition-all disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => sendRegOtp('mentor')}
                    disabled={formLoading || mentorOtpSent}
                    className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-550 disabled:bg-indigo-700/30 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    {mentorOtpSent ? 'Sent ✓' : 'Verify'}
                  </button>
                </div>
              </div>

              {mentorOtpSent && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification Code (OTP)</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP code"
                    value={mentorOtp}
                    onChange={(e) => setMentorOtp(e.target.value)}
                    className="w-full bg-[#0a0e1c] border border-indigo-500/30 rounded-xl px-4 py-2.5 text-xs text-white font-mono text-center tracking-widest placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading || usernameStatus?.available === false}
                className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338ca] disabled:bg-indigo-650/50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {formLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                Register & Await Approval
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Already have an account? </span>
            <Link href="/?login=true" className="text-xs font-black text-[#818CF8] hover:text-indigo-300 transition-colors">
              Log In Here
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Developer Mock Inbox Drawer */}
      {isDevMode && showInbox && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div onClick={() => setShowInbox(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer" />
          <div className="relative w-full max-w-md bg-[#090D1A]/95 border-l border-white/10 h-full shadow-2xl flex flex-col backdrop-blur-lg animate-in slide-in-from-right duration-300 z-10 text-left">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#818CF8] flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Developer Mock Inbox</h3>
                  <p className="text-[9px] text-slate-450 font-semibold">Simulating email receipts for local debugging</p>
                </div>
              </div>
              <button onClick={() => setShowInbox(false)} className="text-slate-450 hover:text-white transition-colors cursor-pointer text-sm p-1.5 rounded-lg hover:bg-white/5">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {inboxEmails.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16 opacity-60">
                  <div className="h-12 w-12 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-500">📬</div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">No Emails Received Yet</p>
                    <p className="text-[10px] text-slate-500 leading-normal max-w-[200px]">Send an OTP from the verify button to capture email payloads here.</p>
                  </div>
                </div>
              ) : (
                inboxEmails.map((email: any) => (
                  <div key={email.id} className="p-4 bg-slate-900/80 border border-white/5 rounded-2xl space-y-3 shadow-md">
                    <div className="flex justify-between items-start border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[9px] font-black uppercase text-indigo-400">Recipient</span>
                        <h4 className="text-xs font-bold text-white truncate max-w-[220px]">{email.to}</h4>
                      </div>
                      <span className="text-[9px] font-medium text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-white/5">{email.createdAt}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-indigo-400">Subject</span>
                      <p className="text-xs font-extrabold text-slate-200">{email.subject}</p>
                    </div>

                    <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[9px] font-black uppercase text-indigo-400 block">Message Body</span>
                      <p className="text-[10px] text-slate-450 font-mono leading-relaxed whitespace-pre-line">{email.body}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-mono font-black">
                        OTP: {email.otp}
                      </div>
                      <button
                        onClick={() => handleAutofillOtp(email)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/15"
                      >
                        Autofill OTP
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-slate-950 flex items-center justify-between gap-4">
              <button
                onClick={fetchMockInbox}
                className="flex-1 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white text-[10px] font-extrabold rounded-xl transition-all cursor-pointer text-center"
              >
                Refresh Inbox
              </button>
              <button
                onClick={async () => {
                  try {
                    await apiRequest('/auth/clear-mock-inbox', { method: 'POST' });
                    setInboxEmails([]);
                    setUnreadInboxCount(0);
                    showToast('Developer Mock Inbox cleared.', 'success');
                  } catch (err) {
                    console.error('Error clearing mock inbox:', err);
                  }
                }}
                className="py-2 px-4 hover:text-rose-400 text-slate-500 text-[10px] font-bold cursor-pointer"
              >
                Clear View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Mock Inbox Button */}
      {isDevMode && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <button
            onClick={() => setShowInbox(!showInbox)}
            className="h-14 w-14 rounded-full bg-slate-900/95 hover:bg-slate-800 border-2 border-indigo-500/35 hover:border-indigo-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer relative group animate-bounce animate-pulse"
            title="Open Mock Inbox"
          >
            <Mail className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            {unreadInboxCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-rose-500 border border-slate-950 text-[10px] font-black text-white flex items-center justify-center shrink-0 shadow-md">
                {unreadInboxCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
