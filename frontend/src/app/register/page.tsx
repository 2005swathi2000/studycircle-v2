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
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  MessageSquare,
  Eye,
  EyeOff
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

  const [formLoading, setFormLoading] = useState(false);

  // Student inputs
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentGender, setStudentGender] = useState('male');
  const [studentUser, setStudentUser] = useState('');
  const [studentPass, setStudentPass] = useState('');
  const [studentConfirmPass, setStudentConfirmPass] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentOtp, setStudentOtp] = useState('');
  const [studentOtpSent, setStudentOtpSent] = useState(false);
  const [studentOtpEmail, setStudentOtpEmail] = useState('');
  const [studentAgree, setStudentAgree] = useState(false);

  // Mentor inputs
  const [mentorFirstName, setMentorFirstName] = useState('');
  const [mentorLastName, setMentorLastName] = useState('');
  const [mentorGender, setMentorGender] = useState('male');
  const [mentorUser, setMentorUser] = useState('');
  const [mentorPass, setMentorPass] = useState('');
  const [mentorConfirmPass, setMentorConfirmPass] = useState('');
  const [mentorContact, setMentorContact] = useState('');
  const [mentorPhone, setMentorPhone] = useState('');
  const [mentorInstitution, setMentorInstitution] = useState('');
  const [mentorOtp, setMentorOtp] = useState('');
  const [mentorOtpSent, setMentorOtpSent] = useState(false);
  const [mentorOtpEmail, setMentorOtpEmail] = useState('');
  const [mentorRole, setMentorRole] = useState<'mentor' | 'admin'>('mentor');
  const [mentorAgree, setMentorAgree] = useState(false);

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
    if (!studentFirstName.trim() || !studentLastName.trim() || !studentPass || !studentConfirmPass || !studentContact.trim() || !studentPhone.trim() || !studentOtp || !studentGender) {
      showToast('All fields (including name, email, phone, passwords, and gender) are required.', 'error');
      return;
    }
    if (studentPass !== studentConfirmPass) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (!studentAgree) {
      showToast('Please agree to the Terms of Service and Privacy Policy.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const generatedUser = studentContact.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: studentFirstName.trim(),
          lastName: studentLastName.trim(),
          username: generatedUser,
          password: studentPass,
          role: 'student',
          email: studentContact.trim().toLowerCase(),
          phone: studentPhone.trim(),
          gender: studentGender,
          otp: studentOtp
        })
      });
      setCurrentUser(data.user, data.token);
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
    if (!mentorFirstName.trim() || !mentorLastName.trim() || !mentorPass || !mentorConfirmPass || !mentorContact.trim() || !mentorPhone.trim() || !mentorInstitution || !mentorOtp || !mentorGender) {
      showToast('All fields (including name, email, phone, passwords, role, and college) are required.', 'error');
      return;
    }
    if (mentorPass !== mentorConfirmPass) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (!mentorAgree) {
      showToast('Please agree to the Terms of Service and Privacy Policy.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const generatedUser = mentorContact.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: mentorFirstName.trim(),
          lastName: mentorLastName.trim(),
          username: generatedUser,
          password: mentorPass,
          role: mentorRole,
          email: mentorContact.trim().toLowerCase(),
          phone: mentorPhone.trim(),
          gender: mentorGender,
          otp: mentorOtp,
          institution: mentorInstitution
        })
      });
      showToast(data.message || 'Registration successful! Awaiting Admin Approval.', 'success');
      if (data.user && data.user.isApproved) {
        setCurrentUser(data.user, data.token);
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
    <div className="min-h-screen bg-[#03060d] text-slate-100 flex flex-col items-center justify-between py-12 px-4 relative overflow-x-hidden overflow-y-auto w-full font-sans antialiased">
      {/* Background glow elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-20 left-1/3 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px]" />
      </div>

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

      {/* Brand logo header */}
      <div className="flex flex-col items-center text-center mb-10 z-10">
        <div className="flex items-center gap-2.5 mb-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00b074] via-emerald-400 to-[#5046E5] opacity-90 shadow-md animate-pulse" />
            <div className="absolute inset-[3px] rounded-full bg-[#03060d] flex items-center justify-center text-white font-bold">
              <BookOpen className="h-5 w-5 text-[#00b074]" />
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            Study<span className="text-[#00b074]">Circle</span>
          </span>
        </div>
        <p className="text-xs text-slate-400 font-semibold tracking-wide">Collaborate. Learn. Grow Together.</p>
      </div>

      {/* Main Container with side illustrations and central cards grid */}
      <div className="relative w-full max-w-6xl flex items-center justify-center z-10 px-4 mb-10">
        
        {/* Left student illustration (visible on desktop) */}
        <div className="hidden xl:block absolute -left-72 top-1/2 -translate-y-1/2 w-60 z-0 select-none">
          <div className="relative flex flex-col items-center">
            <img 
              src="/hero-student.png" 
              alt="Student Illustration" 
              className="w-full object-contain filter drop-shadow-[0_0_25px_rgba(16,185,129,0.15)] rounded-2xl" 
            />
            {/* Green floating decorative circle elements */}
            <div className="absolute -left-6 top-12 h-10 w-10 rounded-full bg-[#00b074]/15 border border-[#00b074]/30 flex items-center justify-center text-[#00b074] shadow-lg animate-bounce duration-1000">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div className="absolute -right-4 top-24 h-10 w-10 rounded-full bg-[#00b074]/15 border border-[#00b074]/30 flex items-center justify-center text-[#00b074] shadow-lg animate-pulse">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div className="absolute -bottom-4 left-10 h-10 w-10 rounded-full bg-[#00b074]/15 border border-[#00b074]/30 flex items-center justify-center text-[#00b074] shadow-lg animate-bounce delay-150">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

        {/* Right admin/mentor illustration (visible on desktop) */}
        <div className="hidden xl:block absolute -right-72 top-1/2 -translate-y-1/2 w-60 z-0 select-none">
          <div className="relative flex flex-col items-center">
            <img 
              src="/students-illustration.png" 
              alt="Mentor Illustration" 
              className="w-full object-contain filter drop-shadow-[0_0_25px_rgba(99,102,241,0.15)] rounded-2xl" 
            />
            {/* Purple floating decorative circle elements */}
            <div className="absolute -right-6 top-16 h-10 w-10 rounded-full bg-[#5046E5]/15 border border-[#5046E5]/30 flex items-center justify-center text-[#818CF8] shadow-lg animate-bounce duration-1000">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div className="absolute -left-4 top-28 h-10 w-10 rounded-full bg-[#5046E5]/15 border border-[#5046E5]/30 flex items-center justify-center text-[#818CF8] shadow-lg animate-pulse">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div className="absolute -bottom-4 right-10 h-10 w-10 rounded-full bg-[#5046E5]/15 border border-[#5046E5]/30 flex items-center justify-center text-[#818CF8] shadow-lg animate-bounce delay-150">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

        {/* Double Card registration layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-stretch gap-6 bg-[#080d22]/30 border border-white/5 rounded-3xl p-6 lg:p-8 backdrop-blur-md relative z-10 shadow-2xl">
          
          {/* Left panel: Student Register Card */}
          <div className="flex flex-col justify-between p-2 border border-[#00b074]/10 rounded-2xl bg-[#090d1e]/40 p-4">
            <form onSubmit={handleStudentRegister} className="space-y-5">
              <div className="flex flex-col items-start text-left mb-4">
                <div className="h-12 w-12 rounded-full bg-[#00b074]/10 border border-[#00b074]/20 text-[#00b074] flex items-center justify-center mb-3.5">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#00b074] mb-0.5">Student Register</h3>
                <p className="text-[11px] text-slate-400 leading-normal max-w-sm">Join StudyCircle and connect with peers, share knowledge and grow together.</p>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      value={studentFirstName}
                      onChange={(e) => setStudentFirstName(e.target.value)}
                      className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00b074]/50 focus:bg-[#070b19] outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      value={studentLastName}
                      onChange={(e) => setStudentLastName(e.target.value)}
                      className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00b074]/50 focus:bg-[#070b19] outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Address with Send OTP button beside it */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Email Address</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={studentContact}
                      onChange={(e) => setStudentContact(e.target.value)}
                      disabled={studentOtpSent}
                      className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00b074]/50 focus:bg-[#070b19] outline-none transition-all disabled:opacity-50"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => sendRegOtp('student')}
                    disabled={formLoading || studentOtpSent}
                    className="px-4 py-2.5 bg-[#00b074]/10 hover:bg-[#00b074]/20 border border-[#00b074]/30 text-[#00b074] rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {studentOtpSent ? 'Sent ✓' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* OTP Input Field */}
              {studentOtpSent && (
                <div className="space-y-1 text-left animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Verification Code (OTP)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP code"
                      value={studentOtp}
                      onChange={(e) => setStudentOtp(e.target.value)}
                      className="w-full bg-[#070b19]/80 border border-emerald-500/35 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono tracking-widest placeholder-slate-600 focus:border-[#00b074] outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Phone Number */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00b074]/50 focus:bg-[#070b19] outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showStudentPass ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={studentPass}
                    onChange={(e) => setStudentPass(e.target.value)}
                    className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00b074]/50 focus:bg-[#070b19] outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPass(!showStudentPass)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-350 transition-colors"
                  >
                    {showStudentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showStudentPass ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={studentConfirmPass}
                    onChange={(e) => setStudentConfirmPass(e.target.value)}
                    className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00b074]/50 focus:bg-[#070b19] outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPass(!showStudentPass)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-355 transition-colors"
                  >
                    {showStudentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Gender radio selectors */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Gender</label>
                <div className="flex gap-6 items-center py-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="studentGender"
                      value="male"
                      checked={studentGender === 'male'}
                      onChange={() => setStudentGender('male')}
                      className="w-4 h-4 accent-[#00b074] cursor-pointer"
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="studentGender"
                      value="female"
                      checked={studentGender === 'female'}
                      onChange={() => setStudentGender('female')}
                      className="w-4 h-4 accent-[#00b074] cursor-pointer"
                    />
                    Female
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="studentGender"
                      value="other"
                      checked={studentGender === 'other'}
                      onChange={() => setStudentGender('other')}
                      className="w-4 h-4 accent-[#00b074] cursor-pointer"
                    />
                    Others
                  </label>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-slate-450 select-none cursor-pointer mt-2 text-left">
                <input
                  type="checkbox"
                  checked={studentAgree}
                  onChange={(e) => setStudentAgree(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-[#00b074] border-white/5 cursor-pointer bg-[#070b19]"
                />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-[#00b074] hover:underline font-bold transition-all">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#00b074] hover:underline font-bold transition-all">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-[#00b074] hover:bg-[#009060] disabled:bg-[#00b074]/50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-[#00b074]/15 transition-all flex items-center justify-center gap-2 mt-5 cursor-pointer"
              >
                {formLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Register as Student <ArrowRight className="h-4.5 w-4.5" />
              </button>

              <div className="text-center pt-2 text-xs text-slate-400">
                Already have an account?{' '}
                <Link href="/?login=true" className="text-xs font-black text-[#00b074] hover:text-[#00d08a] transition-colors">
                  Login here
                </Link>
              </div>
            </form>
          </div>

          {/* OR divider */}
          <div className="flex flex-row lg:flex-col items-center justify-center my-4 lg:my-0 lg:px-4">
            <div className="h-[1px] lg:h-full w-full lg:w-[1px] bg-white/10" />
            <div className="h-10 w-10 rounded-full bg-[#080d22] border border-white/10 text-xs font-bold text-slate-400 flex items-center justify-center shrink-0 my-2 lg:my-4 shadow-lg">
              OR
            </div>
            <div className="h-[1px] lg:h-full w-full lg:w-[1px] bg-white/10" />
          </div>

          {/* Right panel: Admin / Mentor Register Card */}
          <div className="flex flex-col justify-between p-2 border border-[#5046E5]/10 rounded-2xl bg-[#090d1e]/40 p-4">
            <form onSubmit={handleMentorRegister} className="space-y-5">
              <div className="flex flex-col items-start text-left mb-4">
                <div className="h-12 w-12 rounded-full bg-[#5046E5]/10 border border-[#5046E5]/20 text-[#818CF8] flex items-center justify-center mb-3.5">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#818CF8] mb-0.5">Admin / Mentor Register</h3>
                <p className="text-[11px] text-slate-400 leading-normal max-w-sm">Create an account to manage, mentor and guide learners on StudyCircle.</p>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      value={mentorFirstName}
                      onChange={(e) => setMentorFirstName(e.target.value)}
                      className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#5046E5]/50 focus:bg-[#070b19] outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      value={mentorLastName}
                      onChange={(e) => setMentorLastName(e.target.value)}
                      className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#5046E5]/50 focus:bg-[#070b19] outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Address with Send OTP button beside it */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Email Address</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={mentorContact}
                      onChange={(e) => setMentorContact(e.target.value)}
                      disabled={mentorOtpSent}
                      className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#5046E5]/50 focus:bg-[#070b19] outline-none transition-all disabled:opacity-50"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => sendRegOtp('mentor')}
                    disabled={formLoading || mentorOtpSent}
                    className="px-4 py-2.5 bg-[#5046E5]/10 hover:bg-[#5046E5]/20 border border-[#5046E5]/30 text-[#818CF8] rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {mentorOtpSent ? 'Sent ✓' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* OTP Input Field */}
              {mentorOtpSent && (
                <div className="space-y-1 text-left animate-in fade-in duration-200">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Verification Code (OTP)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP code"
                      value={mentorOtp}
                      onChange={(e) => setMentorOtp(e.target.value)}
                      className="w-full bg-[#070b19]/80 border border-indigo-500/35 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono tracking-widest placeholder-slate-600 focus:border-[#5046E5] outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Phone Number */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={mentorPhone}
                    onChange={(e) => setMentorPhone(e.target.value)}
                    className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#5046E5]/50 focus:bg-[#070b19] outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <select
                    value={mentorRole}
                    onChange={(e) => setMentorRole(e.target.value as 'mentor' | 'admin')}
                    className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:border-[#5046E5]/50 focus:bg-[#070b19] outline-none transition-all cursor-pointer appearance-none"
                    required
                  >
                    <option value="mentor">Mentor</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* College Selector (Mentor / Admin Registration requires this) */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">College / Institution</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <select
                    value={mentorInstitution}
                    onChange={(e) => setMentorInstitution(e.target.value)}
                    className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:border-[#5046E5]/50 focus:bg-[#070b19] outline-none transition-all cursor-pointer appearance-none"
                    required
                  >
                    <option value="">Select College</option>
                    {COLLEGES.map((col) => (
                      <option key={col.code} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showMentorPass ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={mentorPass}
                    onChange={(e) => setMentorPass(e.target.value)}
                    className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#5046E5]/50 focus:bg-[#070b19] outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMentorPass(!showMentorPass)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-350 transition-colors"
                  >
                    {showMentorPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showMentorPass ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={mentorConfirmPass}
                    onChange={(e) => setMentorConfirmPass(e.target.value)}
                    className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#5046E5]/50 focus:bg-[#070b19] outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMentorPass(!showMentorPass)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-355 transition-colors"
                  >
                    {showMentorPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Gender radio selectors */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Gender</label>
                <div className="flex gap-6 items-center py-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mentorGender"
                      value="male"
                      checked={mentorGender === 'male'}
                      onChange={() => setMentorGender('male')}
                      className="w-4 h-4 accent-[#5046E5] cursor-pointer"
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mentorGender"
                      value="female"
                      checked={mentorGender === 'female'}
                      onChange={() => setMentorGender('female')}
                      className="w-4 h-4 accent-[#5046E5] cursor-pointer"
                    />
                    Female
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mentorGender"
                      value="other"
                      checked={mentorGender === 'other'}
                      onChange={() => setMentorGender('other')}
                      className="w-4 h-4 accent-[#5046E5] cursor-pointer"
                    />
                    Others
                  </label>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-slate-455 select-none cursor-pointer mt-2 text-left">
                <input
                  type="checkbox"
                  checked={mentorAgree}
                  onChange={(e) => setMentorAgree(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-[#5046E5] border-white/5 cursor-pointer bg-[#070b19]"
                />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-[#818CF8] hover:underline font-bold transition-all">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#818CF8] hover:underline font-bold transition-all">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-[#5046E5] hover:bg-[#4338ca] disabled:bg-[#5046E5]/50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-[#5046e5]/15 transition-all flex items-center justify-center gap-2 mt-5 cursor-pointer"
              >
                {formLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Register as Admin / Mentor <ArrowRight className="h-4.5 w-4.5" />
              </button>

              <div className="text-center pt-2 text-xs text-slate-400">
                Already have an account?{' '}
                <Link href="/?login=true" className="text-xs font-black text-[#818CF8] hover:text-[#a5b4fc] transition-colors">
                  Login here
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Footer Features Banner */}
      <div className="max-w-6xl w-full bg-[#080d22]/50 border border-white/5 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 z-10 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3.5 text-left">
          <div className="h-10 w-10 rounded-full bg-[#00b074]/10 border border-[#00b074]/20 text-[#00b074] flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">Collaborate</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">Study and work together in real-time.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3.5 text-left border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">Share Knowledge</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">Share notes, resources and ideas.</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 text-left border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#818CF8] flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">Track Progress</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">Monitor your learning and achievements.</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 text-left border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">Achieve More</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">Stay motivated and achieve your goals.</p>
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
                        className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-[#5046e5]/15"
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
            className="h-14 w-14 rounded-full bg-slate-900/95 hover:bg-slate-800 border-2 border-indigo-500/35 hover:border-indigo-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer relative group animate-bounce"
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
