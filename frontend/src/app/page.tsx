'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, setUserInfo, getUserInfo, clearUserInfo } from './utils/api';
import { useToast } from './components/ToastProvider';
import { 
  ArrowRight, 
  Check, 
  Users, 
  GraduationCap, 
  Lock,
  Award,
  Key,
  User,
  AlertCircle,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Mail,
  Phone,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  HelpCircle,
  TrendingUp,
  Wifi,
  Calendar,
  Layers,
  Sparkles,
  Bell,
  BookOpen
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

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [activePortal, setActivePortal] = useState<'student' | 'mentor'>('student');

  // Username validation state
  const [usernameToCheck, setUsernameToCheck] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; available: boolean; method?: string } | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Student Register States
  const [studentName, setStudentName] = useState('');
  const [studentUser, setStudentUser] = useState('');
  const [studentPass, setStudentPass] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [studentOtp, setStudentOtp] = useState('');
  const [studentOtpSent, setStudentOtpSent] = useState(false);

  // Mentor Register States
  const [mentorName, setMentorName] = useState('');
  const [mentorUser, setMentorUser] = useState('');
  const [mentorPass, setMentorPass] = useState('');
  const [mentorContact, setMentorContact] = useState('');
  const [mentorInstitution, setMentorInstitution] = useState('');
  const [mentorOtp, setMentorOtp] = useState('');
  const [mentorOtpSent, setMentorOtpSent] = useState(false);
  const [mentorOtpEmail, setMentorOtpEmail] = useState('');

  // Admin Register States
  const [adminName, setAdminName] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminContact, setAdminContact] = useState('');
  const [adminInstitution, setAdminInstitution] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  const [adminOtpEmail, setAdminOtpEmail] = useState('');

  // Forgot Password States
  const [forgotUser, setForgotUser] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [showMentorPass, setShowMentorPass] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);

  // Public Lobby Circles
  const [publicCircles, setPublicCircles] = useState<any[]>([]);
  const [loadingLobby, setLoadingLobby] = useState(false);

  // Mock Inbox States
  const [showInbox, setShowInbox] = useState(false);
  const [inboxEmails, setInboxEmails] = useState<any[]>([]);
  const [unreadInboxCount, setUnreadInboxCount] = useState(0);

  const [studentOtpEmail, setStudentOtpEmail] = useState('');
  const [forgotOtpEmail, setForgotOtpEmail] = useState('');
  const autofilledEmailsRef = useRef<Set<string>>(new Set());

  const studentOtpSentRef = useRef(false);
  const studentOtpRef = useRef('');
  const studentOtpEmailRef = useRef('');

  const mentorOtpSentRef = useRef(false);
  const mentorOtpRef = useRef('');
  const mentorOtpEmailRef = useRef('');

  const adminOtpSentRef = useRef(false);
  const adminOtpRef = useRef('');
  const adminOtpEmailRef = useRef('');
  
  const forgotOtpSentRef = useRef(false);
  const forgotOtpRef = useRef('');
  const forgotOtpEmailRef = useRef('');

  // Auto-send and custom notification banner states
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [lastSentStudentEmail, setLastSentStudentEmail] = useState('');
  const [lastSentMentorEmail, setLastSentMentorEmail] = useState('');
  const [lastSentAdminEmail, setLastSentAdminEmail] = useState('');
  const [lastSentForgotUser, setLastSentForgotUser] = useState('');
  const lastSeenEmailIdRef = useRef<string | null>(null);

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

  useEffect(() => {
    adminOtpSentRef.current = adminOtpSent;
  }, [adminOtpSent]);
  
  useEffect(() => {
    adminOtpRef.current = adminOtp;
  }, [adminOtp]);

  useEffect(() => {
    adminOtpEmailRef.current = adminOtpEmail;
  }, [adminOtpEmail]);

  useEffect(() => {
    forgotOtpSentRef.current = forgotOtpSent;
  }, [forgotOtpSent]);

  useEffect(() => {
    forgotOtpRef.current = forgotOtp;
  }, [forgotOtp]);

  useEffect(() => {
    forgotOtpEmailRef.current = forgotOtpEmail;
  }, [forgotOtpEmail]);

  const fetchMockInbox = async () => {
    try {
      const data = await apiRequest('/auth/mock-inbox');
      const emails = data.inbox || [];
      setInboxEmails(emails);
      setUnreadInboxCount(emails.length);

      if (emails.length > 0) {
        const latestEmail = emails[0];
        
        // Initialize or detect new email arrival
        if (lastSeenEmailIdRef.current === null) {
          // First poll, just record the latest email ID so we don't notify on startup
          lastSeenEmailIdRef.current = latestEmail.id;
        } else if (latestEmail.id !== lastSeenEmailIdRef.current) {
          // New email detected!
          lastSeenEmailIdRef.current = latestEmail.id;
          setActiveNotification(latestEmail);
          // Auto hide notification after 6 seconds
          setTimeout(() => {
            setActiveNotification((curr: any) => curr?.id === latestEmail.id ? null : curr);
          }, 6000);
        }

        // 1. Student Registration OTP autofill
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

        // 1b. Mentor Registration OTP autofill
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

        // 1c. Admin Registration OTP autofill
        if (adminOtpSentRef.current && !adminOtpRef.current && adminOtpEmailRef.current) {
          const matchingEmail = emails.find((email: any) => 
            email.to.trim().toLowerCase() === adminOtpEmailRef.current.trim().toLowerCase() && 
            !email.subject.includes('Reset')
          );
          if (matchingEmail && !autofilledEmailsRef.current.has(matchingEmail.id)) {
            autofilledEmailsRef.current.add(matchingEmail.id);
            setAdminOtp(matchingEmail.otp);
            showToast(`📬 Inbox Sync: Verification email received! OTP (${matchingEmail.otp}) automatically filled.`, 'success');
          }
        }
        
        // 2. Forgot Password OTP autofill
        if (forgotOtpSentRef.current && !forgotOtpRef.current && forgotOtpEmailRef.current) {
          const matchingEmail = emails.find((email: any) => 
            email.to.trim().toLowerCase() === forgotOtpEmailRef.current.trim().toLowerCase() && 
            email.subject.includes('Reset')
          );
          if (matchingEmail && !autofilledEmailsRef.current.has(matchingEmail.id)) {
            autofilledEmailsRef.current.add(matchingEmail.id);
            setForgotOtp(matchingEmail.otp);
            showToast(`📬 Inbox Sync: Password reset email received! OTP (${matchingEmail.otp}) automatically filled.`, 'success');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching mock inbox:', err);
    }
  };

  const handleAutofillOtp = (email: any) => {
    if (email.subject.includes('Reset') || email.subject.toLowerCase().includes('password')) {
      setForgotOtp(email.otp);
      showToast(`Autofilled Password Reset OTP: ${email.otp}`, 'success');
    } else {
      setStudentOtp(email.otp);
      setMentorOtp(email.otp);
      setAdminOtp(email.otp);
      showToast(`Autofilled Registration Verification OTP: ${email.otp}`, 'success');
    }
  };

  useEffect(() => {
    const user = getUserInfo();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
    fetchPublicCircles();
    fetchMockInbox();

    const interval = setInterval(fetchMockInbox, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchPublicCircles = async () => {
    setLoadingLobby(true);
    try {
      const data = await apiRequest('/groups/public-list');
      setPublicCircles(data.groups || []);
    } catch (e: any) {
      console.error('Error fetching public groups:', e);
    } finally {
      setLoadingLobby(false);
    }
  };

  // Debounced Username check
  const handleUsernameChange = (val: string, role: string) => {
    if (role === 'student') setStudentUser(val);
    else if (role === 'mentor') setMentorUser(val);
    else if (role === 'admin') setAdminUser(val);

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

  // Validation helper
  const isValidEmailOrPhone = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    const trimmed = val.trim();
    return emailRegex.test(trimmed) || phoneRegex.test(trimmed);
  };

  // Send Registration OTP
  const sendRegOtp = async (role: 'student' | 'mentor' | 'admin') => {
    const contact = role === 'student' ? studentContact : role === 'mentor' ? mentorContact : adminContact;
    if (!contact.trim()) {
      showToast('Please enter an email or phone number first.', 'error');
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
        setLastSentStudentEmail(contact.trim().toLowerCase());
        setStudentOtp(''); // Reset to ensure the user sees the autofill happen
      } else if (role === 'mentor') {
        setMentorOtpSent(true);
        setMentorOtpEmail(emailVal);
        setLastSentMentorEmail(contact.trim().toLowerCase());
        setMentorOtp('');
      } else {
        setAdminOtpSent(true);
        setAdminOtpEmail(emailVal);
        setLastSentAdminEmail(contact.trim().toLowerCase());
        setAdminOtp('');
      }
      showToast(data.message || 'Verification code sent!', 'success');
      showToast(`Local Test: Polling mock inbox to autofill...`, 'info');
      // Trigger inbox fetch immediately to make autofill feel instant
      setTimeout(fetchMockInbox, 500);
    } catch (e: any) {
      showToast(e.message || 'Failed to send verification code.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Send Forgot Password OTP
  const sendResetOtp = async () => {
    if (!forgotUser.trim()) {
      showToast('Please enter your username first.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ isReset: true, username: forgotUser })
      });
      setForgotOtpSent(true);
      setForgotOtpEmail(data.email || '');
      setLastSentForgotUser(forgotUser.trim().toLowerCase());
      setForgotOtp(''); // Reset to ensure the user sees the autofill happen
      showToast(data.message || 'Reset code sent to registered contact!', 'success');
      showToast(`Local Test: Polling mock inbox to autofill...`, 'info');
      // Trigger inbox fetch immediately to make autofill feel instant
      setTimeout(fetchMockInbox, 500);
    } catch (e: any) {
      showToast(e.message || 'Failed to send reset code.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Perform Student Registration
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentUser || !studentPass || !studentContact || !studentOtp) {
      showToast('All student fields including verification code are required.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: studentName,
          username: studentUser,
          password: studentPass,
          role: 'student',
          phoneOrEmail: studentContact,
          otp: studentOtp
        })
      });
      setUserInfo(data.user);
      showToast(data.message || 'Student account created successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Perform Mentor Registration
  const handleMentorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorName || !mentorUser || !mentorPass || !mentorInstitution || !mentorContact || !mentorOtp) {
      showToast('All fields including verification code are required.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: mentorName,
          username: mentorUser,
          password: mentorPass,
          role: 'mentor',
          phoneOrEmail: mentorContact,
          otp: mentorOtp
        })
      });
      showToast(data.message || 'Mentor registered. Awaiting Admin Approval.', 'success');
      if (data.user && data.user.isApproved) {
        setUserInfo(data.user);
        showToast('Approved automatically. Redirecting...', 'success');
        router.push('/dashboard');
      } else {
        setAuthMode('login');
        scrollToSection('auth-gates');
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Perform Admin Registration
  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminUser || !adminPass || !adminInstitution || !adminContact || !adminOtp) {
      showToast('All fields including verification code are required.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: adminName,
          username: adminUser,
          password: adminPass,
          role: 'admin',
          phoneOrEmail: adminContact,
          otp: adminOtp
        })
      });
      showToast(data.message || 'Admin registered. Awaiting Admin Approval.', 'success');
      if (data.user && data.user.isApproved) {
        setUserInfo(data.user);
        showToast('Approved automatically. Redirecting...', 'success');
        router.push('/dashboard');
      } else {
        setAuthMode('login');
        scrollToSection('auth-gates');
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser || !loginPass) {
      showToast('Username and password are required.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: loginUser,
          password: loginPass,
          portal: activePortal
        })
      });
      setUserInfo(data.user);
      showToast('Welcome back, ' + data.user.fullName + '!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUser || !forgotNewPass || !forgotOtp) {
      showToast('All fields are required.', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          username: forgotUser,
          newPassword: forgotNewPass,
          otp: forgotOtp
        })
      });
      showToast(data.message || 'Password reset successfully! Log in now.', 'success');
      setAuthMode('login');
    } catch (err: any) {
      showToast(err.message || 'Password reset failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Join a Public Circle from Lobby
  const joinPublicGroup = async (groupId: string) => {
    const user = getUserInfo();
    if (!user) {
      showToast('Please log in or sign up first to join this study circle.', 'warning');
      setAuthMode('login');
      scrollToSection('auth-gates');
      return;
    }

    try {
      const data = await apiRequest(`/groups/${groupId}/join-public`, {
        method: 'POST'
      });
      showToast(data.message || 'Successfully joined the study circle!', 'success');
      router.push(`/group/${groupId}`);
    } catch (e: any) {
      if (e.message.includes('already a member')) {
        router.push(`/group/${groupId}`);
      } else {
        showToast(e.message || 'Failed to join group.', 'error');
      }
    }
  };

  // Scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100 flex flex-col relative overflow-hidden font-sans antialiased">
      
      {/* 🔔 Sliding Email Notification Banner */}
      {activeNotification && (
        <div className="fixed top-20 right-6 z-[10000] max-w-sm w-full bg-[#0E1017]/95 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 pointer-events-auto flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#818CF8] flex items-center justify-center shrink-0 animate-bounce">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
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
            <div className="p-2 bg-slate-950 border border-white/5 rounded-xl mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-300">OTP Code: <strong className="text-rose-400 font-extrabold">{activeNotification.otp}</strong></span>
              <span className="text-[9px] font-extrabold uppercase bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded">Auto Filled</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 1. Header Navbar (Deep Navy / Violet button) */}
      <header className="w-full bg-[#060a16]/90 backdrop-blur-md border-b border-white/[0.04] sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
            {/* Unique collaborative ring logo */}
            <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
              {/* Outer gradient ring representing collaborative circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5227EB] via-indigo-400 to-[#E11D48] opacity-90 shadow-md animate-pulse" />
              {/* Inner dark center */}
              <div className="absolute inset-[3px] rounded-full bg-[#060a16] flex items-center justify-center text-white font-bold">
                <BookOpen className="h-4 w-4 text-[#818CF8]" />
              </div>
            </div>
            <span className="font-extrabold text-base tracking-tight text-white font-sans">
              StudyCircle
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-350 tracking-wider">
            <button onClick={() => router.push('/')} className="hover:text-white transition-colors cursor-pointer">Home</button>
            <button onClick={() => scrollToSection('features-section')} className="hover:text-white transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('services-section')} className="hover:text-white transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('lobby-section')} className="hover:text-white transition-colors cursor-pointer">About Us</button>
          </nav>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Dashboard <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => { setAuthMode('login'); scrollToSection('auth-gates'); }}
                  className="text-slate-350 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); scrollToSection('auth-gates'); }}
                  className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  Join Now
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        
        {/* 2. Hero Section (Navy blue theme with three-student visual & focus overlay card) */}
        <section className="bg-[#060a16] relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center py-16 md:py-24 text-left relative z-10">
            {/* Left Hero Column */}
            <div className="md:col-span-6 space-y-6 md:pr-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                StudyCircle – <br />
                <span className="text-indigo-400">Collaborative <br />Learning Workspace</span>
              </h1>
              <p className="text-sm md:text-base text-slate-350 leading-relaxed font-semibold max-w-lg">
                A structured group study platform for engineering and degree students in Andhra Pradesh and Telangana.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => { setAuthMode('register'); scrollToSection('auth-gates'); }}
                  className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338ca] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollToSection('lobby-section')}
                  className="px-6 py-3 border border-white/20 hover:border-white/35 hover:bg-white/5 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  Explore Groups
                </button>
              </div>

              {/* Secure, Collaborative, Productive row */}
              <div className="flex items-center gap-6 pt-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-400" /> Secure</span>
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-indigo-400" /> Collaborative</span>
                <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> Productive</span>
              </div>
            </div>

            {/* Right Hero Column: Students photo with absolute focus card overlay */}
            <div className="md:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-[440px] aspect-[4/3] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center bg-slate-900">
                {/* Main students studying image */}
                <img 
                  src="/students-studying.png" 
                  alt="Three South Asian students studying together" 
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Absolute Glassmorphic focus card matching mockup overlay */}
                <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl max-w-[210px]">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-white leading-tight uppercase tracking-wider">Focus Together.</div>
                    <div className="text-[10px] font-bold text-slate-400 leading-tight">Achieve More.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Everything You Need features grid (White Background, 5 circular icon columns) */}
        <section id="features-section" className="bg-white py-16 text-slate-900 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
            <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
              Everything you need to <span className="text-[#4F46E5]">study better, together.</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              
              {/* Feature 1: Study Groups */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-pink-50 border border-pink-100/80 rounded-[24px] hover:scale-[1.02] transition-transform text-left">
                <div className="h-12 w-12 rounded-full bg-white text-pink-500 flex items-center justify-center shadow-sm shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-xs font-black text-pink-950">Study Groups</h3>
                  <p className="text-[10px] text-pink-700/80 leading-relaxed">Create or join groups, invite your friends, and start learning together.</p>
                </div>
              </div>

              {/* Feature 2: Live Study Rooms */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-blue-50 border border-blue-100/80 rounded-[24px] hover:scale-[1.02] transition-transform text-left">
                <div className="h-12 w-12 rounded-full bg-white text-blue-400 flex items-center justify-center shadow-sm shrink-0">
                  <Wifi className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-xs font-black text-blue-950">Live Study Rooms</h3>
                  <p className="text-[10px] text-blue-700/80 leading-relaxed">Real-time study sessions with live presence and distraction-free focus.</p>
                </div>
              </div>

              {/* Feature 3: Shared Notes */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-pink-50 border border-pink-100/80 rounded-[24px] hover:scale-[1.02] transition-transform text-left">
                <div className="h-12 w-12 rounded-full bg-white text-pink-500 flex items-center justify-center shadow-sm shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-xs font-black text-pink-950">Shared Notes</h3>
                  <p className="text-[10px] text-pink-700/80 leading-relaxed">Create, edit and share rich notes with your group in one place.</p>
                </div>
              </div>

              {/* Feature 4: Session Scheduling */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-sky-50 border border-sky-100/80 rounded-[24px] hover:scale-[1.02] transition-transform text-left">
                <div className="h-12 w-12 rounded-full bg-white text-sky-500 flex items-center justify-center shadow-sm shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-xs font-black text-sky-950">Session Scheduling</h3>
                  <p className="text-[10px] text-sky-700/80 leading-relaxed">Plan upcoming sessions and get reminders so you never miss out.</p>
                </div>
              </div>

              {/* Feature 5: Track Progress */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-pink-50 border border-pink-100/80 rounded-[24px] hover:scale-[1.02] transition-transform text-left">
                <div className="h-12 w-12 rounded-full bg-white text-pink-500 flex items-center justify-center shadow-sm shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-xs font-black text-pink-950">Track Progress</h3>
                  <p className="text-[10px] text-pink-700/80 leading-relaxed">Track your study hours, streaks and stay consistent with your goals.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Services Section (Dark Navy Background, left info column, right CSS device mockups) */}
        <section id="services-section" className="bg-[#060a16] py-20 relative overflow-hidden border-b border-white/[0.04]">
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center relative z-10 text-left">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">OUR SERVICES</span>
              <h2 className="text-3xl font-black text-white leading-tight">
                All the tools you need <br />
                to <span className="text-indigo-400">grow together.</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-350 leading-relaxed font-semibold">
                StudyCircle provides a focused and structured environment for students to collaborate, share knowledge, track progress, and achieve their academic goals — together.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => { setAuthMode('register'); scrollToSection('auth-gates'); }}
                  className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338ca] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  Join StudyCircle <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom security markers */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-450 pt-4 border-t border-white/5">
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-indigo-400" /> Secure Login</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-indigo-400" /> Role Based Access</span>
                <span className="flex items-center gap-1"><Bell className="h-3.5 w-3.5 text-indigo-400" /> Smart Notifications</span>
              </div>
            </div>

            {/* Right Mockup Column: CSS Laptop & Mobile frames rendering dashboards */}
            <div className="lg:col-span-7 flex justify-center py-6">
              <div className="relative w-full max-w-[480px]">
                
                {/* CSS Laptop Device mockup */}
                <div className="relative border-[8px] border-slate-700 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden aspect-[16/10] w-[90%] z-10">
                  {/* Laptop screen mock StudyCircle Dashboard layout */}
                  <div className="w-full h-full bg-[#0E1017] text-slate-100 flex text-[9px] font-semibold select-none p-1 gap-1.5">
                    {/* Mock Sidebar */}
                    <div className="w-[65px] border-r border-white/5 flex flex-col gap-1 py-1 px-0.5 shrink-0 text-left scale-[0.9] origin-left">
                      <div className="h-4 w-full bg-indigo-600/20 border border-indigo-600/20 text-[#818CF8] text-[8px] font-bold rounded flex items-center gap-1 px-1 mb-1">📚 Lounge</div>
                      <div className="px-1 text-slate-550 font-bold uppercase text-[7px] tracking-wide mt-1">Workspace</div>
                      <div className="px-1 py-0.5 text-indigo-300 font-bold bg-white/5 rounded flex items-center gap-1">🏠 Dashboard</div>
                      <div className="px-1 py-0.5 text-slate-500 rounded flex items-center gap-1">📝 Notes</div>
                      <div className="px-1 py-0.5 text-slate-500 rounded flex items-center gap-1">📅 Schedules</div>
                      <div className="px-1 py-0.5 text-slate-500 rounded flex items-center gap-1">🏆 Leaderboard</div>
                    </div>
                    
                    {/* Mock Dashboard Contents */}
                    <div className="flex-1 flex flex-col gap-2 p-1.5 text-left text-[8px]">
                      {/* Top Welcome banner */}
                      <div className="p-2.5 bg-slate-900 border border-white/5 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-bold text-white leading-tight">Welcome, Study Buddies</div>
                          <div className="text-[7px] text-slate-450 leading-tight">AP & Telangana Cluster</div>
                        </div>
                        <div className="text-[9px] text-[#E11D48] font-bold shrink-0">🔥 5 Day Streak</div>
                      </div>

                      {/* Main widgets Row */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Upcoming assessments */}
                        <div className="p-2.5 bg-slate-900 border border-white/5 rounded-lg flex flex-col justify-between h-20">
                          <div>
                            <div className="text-[7px] uppercase font-bold tracking-wider text-slate-500">Upcoming session</div>
                            <div className="text-white font-extrabold text-[8px] mt-0.5 truncate leading-tight">Data Structures</div>
                            <div className="text-[7px] text-slate-400 mt-0.5 font-mono">Today, 7:30 PM</div>
                          </div>
                          <button className="py-0.5 px-2 bg-indigo-650 text-white rounded text-[7px] font-extrabold cursor-pointer self-start leading-normal">Join Room</button>
                        </div>
                        
                        {/* Weekly study hours */}
                        <div className="p-2.5 bg-slate-900 border border-white/5 rounded-lg h-20 flex flex-col justify-between">
                          <div>
                            <div className="text-[7px] uppercase font-bold tracking-wider text-slate-500">Study Progress</div>
                            <div className="text-white font-extrabold text-[9px] mt-0.5">12.5 hrs</div>
                          </div>
                          {/* Mini visual chart bar */}
                          <div className="flex items-end gap-1 h-8 pb-1">
                            <div className="bg-indigo-650/40 w-1.5 h-3 rounded-t" />
                            <div className="bg-indigo-650/40 w-1.5 h-5 rounded-t" />
                            <div className="bg-indigo-650/40 w-1.5 h-4 rounded-t" />
                            <div className="bg-indigo-650 w-1.5 h-7 rounded-t" />
                            <div className="bg-indigo-650 w-1.5 h-6 rounded-t" />
                          </div>
                        </div>
                      </div>

                      {/* Recent note listings */}
                      <div className="p-2.5 bg-slate-900 border border-white/5 rounded-lg space-y-1">
                        <div className="text-[7px] uppercase font-bold tracking-wider text-slate-500">Recent Notes</div>
                        <div className="flex justify-between items-center text-[7px] text-slate-400 border-b border-white/5 pb-0.5">
                          <span>DBMS - Normalization</span>
                          <span>by Prasad</span>
                        </div>
                        <div className="flex justify-between items-center text-[7px] text-slate-400">
                          <span>Operating Systems</span>
                          <span>by Swathi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CSS Mobile Phone mockup overlaid on bottom right */}
                <div className="absolute right-0 bottom-[-15px] border-[5px] border-slate-800 bg-[#0E0F15] rounded-[24px] shadow-2xl overflow-hidden aspect-[9/19] w-[130px] z-20">
                  {/* Phone screen live desking lobby view */}
                  <div className="w-full h-full bg-[#0E1017] text-white p-2 text-[7px] select-none flex flex-col justify-between text-left">
                    <div className="space-y-2">
                      <div className="border-b border-white/5 pb-1 flex justify-between items-center">
                        <span className="font-bold text-[8px] text-indigo-400">Live Room</span>
                        <span className="text-[6px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                          <span className="h-1 w-1 bg-emerald-500 rounded-full" /> Live
                        </span>
                      </div>

                      {/* Member lists */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[7px] text-slate-350">
                          <span className="truncate flex items-center gap-1"><span className="h-4 w-4 bg-slate-800 rounded-full text-[6px] flex items-center justify-center font-bold text-white">S</span> Swathi</span>
                          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between text-[7px] text-slate-350">
                          <span className="truncate flex items-center gap-1"><span className="h-4 w-4 bg-slate-800 rounded-full text-[6px] flex items-center justify-center font-bold text-white">S</span> Shreya</span>
                          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between text-[7px] text-slate-350">
                          <span className="truncate flex items-center gap-1"><span className="h-4 w-4 bg-slate-800 rounded-full text-[6px] flex items-center justify-center font-bold text-white">S</span> Sridhar</span>
                          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between text-[7px] text-slate-350">
                          <span className="truncate flex items-center gap-1"><span className="h-4 w-4 bg-[#E11D48] rounded-full text-[6px] flex items-center justify-center font-bold text-white text-[5px]">C</span> Charan</span>
                          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-1 bg-[#E11D48] text-white text-[7px] font-bold rounded-lg cursor-pointer text-center select-none shadow-sm shadow-rose-900/10">End Session</button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 5. Public Workspaces Lobby Section */}
        <section id="lobby-section" className="bg-white py-16 w-full text-slate-900 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 px-3 py-1 rounded-full tracking-wider">Public Lobbies</span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Public Circles Board</h2>
                <p className="text-xs text-slate-500">Browse and join active study lounges from engineering college clusters without invite codes.</p>
              </div>
              <button 
                onClick={fetchPublicCircles}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                Sync Circles <RefreshCw className={`h-3 w-3 ${loadingLobby ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingLobby && publicCircles.length === 0 ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
              </div>
            ) : publicCircles.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-slate-200/60 rounded-3xl">
                <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">No public study circles available at this moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {publicCircles.map((circle) => (
                  <div 
                    key={circle.id}
                    className="group relative p-6 bg-slate-50 border border-slate-200/60 hover:border-[#4F46E5]/30 rounded-[24px] transition-all duration-300 flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded">
                          Public Lounge
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 font-mono">
                          Code: {circle.inviteCode}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#4F46E5] transition-colors">
                          {circle.name}
                        </h4>
                        <div className="text-[10px] text-[#4F46E5] font-bold uppercase tracking-wide">
                          {circle.subject || 'Engineering'}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {circle.description || 'Structured study circles, desking presence indicators, and notes lists.'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                        <Users className="h-3.5 w-3.5 text-indigo-650" />
                        <span>Lounge Desk</span>
                      </div>
                      <button
                        onClick={() => joinPublicGroup(circle.id)}
                        className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338ca] text-[10px] font-bold text-white rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-indigo-600/10"
                      >
                        Join Circle <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6. Auth Gates Section (Side-by-side student/mentor logins and 3 signup partitions) */}
        <section id="auth-gates" className="w-full bg-[#03060d] py-20 border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            
            {/* Login Gates */}
            {authMode === 'login' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full tracking-wider">Lobby entrance</span>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Active Portal Access</h3>
                  <p className="text-xs text-slate-450 font-sans">Students log in on the left Student Gate; mentors & administrators log in on the right Mentor Gate.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 text-left">
                  {/* Student Login Gate */}
                  <div className={`p-8 bg-slate-900 border ${activePortal === 'student' ? 'border-[#E11D48]/35 shadow-2xl bg-[#E11D48]/5' : 'border-white/5 shadow-sm'} rounded-[32px] transition-all duration-300 relative`}>
                    {activePortal === 'student' && <div className="absolute top-5 right-5 text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-lg">Active Desk</div>}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="inline-flex p-2.5 bg-slate-950 border border-white/5 rounded-2xl text-[#E11D48]">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-black uppercase text-white">Student Gate</h3>
                        <p className="text-xs text-slate-400 leading-normal">Enter to virtually co-work at live desks and collaborate on note boards.</p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        {activePortal === 'student' && (
                          <>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</label>
                              <input
                                type="text"
                                value={loginUser}
                                onChange={(e) => setLoginUser(e.target.value)}
                                placeholder="e.g. charan_stud"
                                className="w-full px-4 py-3 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-2xl text-xs text-white outline-none"
                              />
                            </div>
                             <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                              <div className="relative">
                                <input
                                  type={showLoginPass ? "text" : "password"}
                                  value={loginPass}
                                  onChange={(e) => setLoginPass(e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-2xl text-xs text-white outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowLoginPass(!showLoginPass)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm bg-transparent border-0 cursor-pointer select-none"
                                >
                                  {showLoginPass ? '🙈' : '👁️'}
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {activePortal === 'student' ? (
                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-2xl cursor-pointer shadow-lg tracking-widest uppercase transition-all"
                          >
                            {formLoading ? 'Verifying Student...' : 'Access Student Desk'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setActivePortal('student'); setLoginUser(''); setLoginPass(''); }}
                            className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-350 text-xs font-bold rounded-2xl cursor-pointer transition-all"
                          >
                            Activate Student Gate
                          </button>
                        )}
                      </form>
                    </div>
                  </div>

                  {/* Mentor / Admin Gate */}
                  <div className={`p-8 bg-slate-900 border ${activePortal === 'mentor' ? 'border-[#E11D48]/35 shadow-2xl bg-[#E11D48]/5' : 'border-white/5 shadow-sm'} rounded-[32px] transition-all duration-300 relative`}>
                    {activePortal === 'mentor' && <div className="absolute top-5 right-5 text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-lg">Active Coordinator</div>}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="inline-flex p-2.5 bg-slate-950 border border-white/5 rounded-2xl text-[#E11D48]">
                          <Shield className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-black uppercase text-white">Mentor & Admin Gate</h3>
                        <p className="text-xs text-slate-400 leading-normal">Coordinators and group directors console gate. Approved status check.</p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        {activePortal === 'mentor' && (
                          <>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</label>
                              <input
                                type="text"
                                value={loginUser}
                                onChange={(e) => setLoginUser(e.target.value)}
                                placeholder="e.g. klu_admin"
                                className="w-full px-4 py-3 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-2xl text-xs text-white outline-none"
                              />
                            </div>
                             <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                              <div className="relative">
                                <input
                                  type={showLoginPass ? "text" : "password"}
                                  value={loginPass}
                                  onChange={(e) => setLoginPass(e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-2xl text-xs text-white outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowLoginPass(!showLoginPass)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm bg-transparent border-0 cursor-pointer select-none"
                                >
                                  {showLoginPass ? '🙈' : '👁️'}
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {activePortal === 'mentor' ? (
                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-2xl cursor-pointer shadow-lg tracking-widest uppercase transition-all"
                          >
                            {formLoading ? 'Verifying Coordinator...' : 'Access Admin Console'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setActivePortal('mentor'); setLoginUser(''); setLoginPass(''); }}
                            className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-350 text-xs font-bold rounded-2xl cursor-pointer transition-all"
                          >
                            Activate Coordinator Gate
                          </button>
                        )}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Three-Partition Signup Columns */}
            {authMode === 'register' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 border border-indigo-500/20 text-[#4F46E5] px-3 py-1 rounded-full tracking-wider">Registration Gates</span>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Three-Partition Workspace Entrance</h3>
                  <p className="text-xs text-slate-400">Select your gate, input details, and verify dynamic OTPs to gain access.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 text-left">
                  
                  {/* Student Gate Partition */}
                  <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-5 shadow-sm">
                    <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase text-white">Student Gate</h4>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase">Verification OTP required</p>
                      </div>
                      <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 font-mono">Student</span>
                    </div>

                    <form onSubmit={handleStudentRegister} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="e.g. Sai Charan"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Username</label>
                        <input
                          type="text"
                          value={studentUser}
                          onChange={(e) => handleUsernameChange(e.target.value, 'student')}
                          placeholder="e.g. charan_stud"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                        />
                        {usernameToCheck === studentUser && usernameToCheck && (
                          <div className="text-[9px] font-semibold flex items-center gap-1 mt-1">
                            {checkingUsername ? (
                              <span className="text-slate-500 animate-pulse">Checking...</span>
                            ) : usernameStatus?.available ? (
                              <span className="text-emerald-400">✓ Available ({usernameStatus.method})</span>
                            ) : (
                              <span className="text-red-400">✗ Username taken</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Phone / Email</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={studentContact}
                            onChange={(e) => setStudentContact(e.target.value)}
                            placeholder="e.g. student@gmail.com"
                            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                          />
                          <button
                            type="button"
                            onClick={() => sendRegOtp('student')}
                            className="px-3 bg-slate-800 hover:bg-slate-750 border border-white/5 text-[9px] font-extrabold text-[#E11D48] rounded-xl cursor-pointer"
                          >
                            Send OTP
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wider">Verification OTP Code</label>
                        <input
                          type="text"
                          value={studentOtp}
                          onChange={(e) => setStudentOtp(e.target.value)}
                          placeholder="6-digit code"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white font-mono tracking-widest text-center"
                        />
                      </div>

                       <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Password</label>
                        <div className="relative">
                          <input
                            type={showStudentPass ? "text" : "password"}
                            value={studentPass}
                            onChange={(e) => setStudentPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowStudentPass(!showStudentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm bg-transparent border-0 cursor-pointer select-none"
                          >
                            {showStudentPass ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                      >
                        {formLoading ? 'Verifying Student...' : 'Register Student Gate'}
                      </button>
                    </form>
                  </div>

                  {/* Mentor Gate Partition */}
                  <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-5 shadow-sm">
                    <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase text-white">Mentor Gate</h4>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase">Admin approval required</p>
                      </div>
                      <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#FCD34D]/20 border border-[#FCD34D]/30 text-[#FCD34D] font-mono">Mentor</span>
                    </div>

                    <form onSubmit={handleMentorRegister} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={mentorName}
                          onChange={(e) => setMentorName(e.target.value)}
                          placeholder="e.g. Dr. Prasad"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Username</label>
                        <input
                          type="text"
                          value={mentorUser}
                          onChange={(e) => handleUsernameChange(e.target.value, 'mentor')}
                          placeholder="e.g. prasad_mentor"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                        />
                        {usernameToCheck === mentorUser && usernameToCheck && (
                          <div className="text-[9px] font-semibold flex items-center gap-1 mt-1">
                            {checkingUsername ? (
                              <span className="text-slate-500">Checking...</span>
                            ) : usernameStatus?.available ? (
                              <span className="text-emerald-400">✓ Available ({usernameStatus.method})</span>
                            ) : (
                              <span className="text-red-400">✗ Username taken</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Phone / Email</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={mentorContact}
                            onChange={(e) => setMentorContact(e.target.value)}
                            placeholder="e.g. mentor@vrsec.ac.in"
                            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                          />
                          <button
                            type="button"
                            onClick={() => sendRegOtp('mentor')}
                            className="px-3 bg-slate-800 hover:bg-slate-750 border border-white/5 text-[9px] font-extrabold text-[#E11D48] rounded-xl cursor-pointer"
                          >
                            Send OTP
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wider">Verification OTP Code</label>
                        <input
                          type="text"
                          value={mentorOtp}
                          onChange={(e) => setMentorOtp(e.target.value)}
                          placeholder="6-digit code"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white font-mono tracking-widest text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Institution / College</label>
                        <select
                          value={mentorInstitution}
                          onChange={(e) => setMentorInstitution(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-slate-300"
                        >
                          <option value="">Select College</option>
                          {COLLEGES.map((c) => (
                            <option key={c.code} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                       <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Password</label>
                        <div className="relative">
                          <input
                            type={showMentorPass ? "text" : "password"}
                            value={mentorPass}
                            onChange={(e) => setMentorPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowMentorPass(!showMentorPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm bg-transparent border-0 cursor-pointer select-none"
                          >
                            {showMentorPass ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full py-2.5 bg-slate-850 hover:bg-slate-750 text-[#E11D48] border border-slate-700 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                      >
                        {formLoading ? 'Awaiting Approval...' : 'Register Mentor Gate'}
                      </button>
                    </form>
                  </div>

                  {/* Admin Gate Partition */}
                  <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-5 shadow-sm">
                    <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase text-white">Admin Gate</h4>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase">Admin approval required</p>
                      </div>
                      <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-400/20 text-[#E11D48] font-mono">Admin</span>
                    </div>

                    <form onSubmit={handleAdminRegister} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="e.g. Ramesh Babu"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Username</label>
                        <input
                          type="text"
                          value={adminUser}
                          onChange={(e) => handleUsernameChange(e.target.value, 'admin')}
                          placeholder="e.g. ramesh_admin"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                        />
                        {usernameToCheck === adminUser && usernameToCheck && (
                          <div className="text-[9px] font-semibold flex items-center gap-1 mt-1">
                            {checkingUsername ? (
                              <span className="text-slate-500">Checking...</span>
                            ) : usernameStatus?.available ? (
                              <span className="text-emerald-400">✓ Available ({usernameStatus.method})</span>
                            ) : (
                              <span className="text-red-400">✗ Username taken</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Phone / Email</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={adminContact}
                            onChange={(e) => setAdminContact(e.target.value)}
                            placeholder="e.g. admin@gitam.edu"
                            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                          />
                          <button
                            type="button"
                            onClick={() => sendRegOtp('admin')}
                            className="px-3 bg-slate-800 hover:bg-slate-750 border border-white/5 text-[9px] font-extrabold text-[#E11D48] rounded-xl cursor-pointer"
                          >
                            Send OTP
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wider">Verification OTP Code</label>
                        <input
                          type="text"
                          value={adminOtp}
                          onChange={(e) => setAdminOtp(e.target.value)}
                          placeholder="6-digit code"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white font-mono tracking-widest text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Institution / College</label>
                        <select
                          value={adminInstitution}
                          onChange={(e) => setAdminInstitution(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-slate-300"
                        >
                          <option value="">Select College</option>
                          {COLLEGES.map((c) => (
                            <option key={c.code} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                       <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Password</label>
                        <div className="relative">
                          <input
                            type={showAdminPass ? "text" : "password"}
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-xl text-xs outline-none text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPass(!showAdminPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm bg-transparent border-0 cursor-pointer select-none"
                          >
                            {showAdminPass ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                      >
                        {formLoading ? 'Awaiting Approval...' : 'Register Admin Gate'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Forgot Credentials Flow */}
            {authMode === 'forgot' && (
              <div className="max-w-md mx-auto p-8 bg-slate-900 border border-white/5 rounded-[32px] space-y-6 text-left shadow-lg">
                <div className="space-y-2 text-center">
                  <Key className="h-8 w-8 text-[#E11D48] mx-auto" />
                  <h3 className="text-sm font-black uppercase text-white">Reset Credentials Gate</h3>
                  <p className="text-xs text-slate-455 leading-relaxed">Input your username and verify dynamic OTP code to reset password.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={forgotUser}
                        onChange={(e) => setForgotUser(e.target.value)}
                        placeholder="e.g. charan_stud"
                        className="flex-1 px-4 py-3 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-2xl text-xs text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={sendResetOtp}
                        className="px-3 bg-slate-850 hover:bg-slate-750 border border-white/5 text-[10px] font-bold text-[#E11D48] rounded-xl cursor-pointer"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification OTP Code</label>
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="w-full px-4 py-3 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-2xl text-xs text-white outline-none font-mono tracking-widest text-center"
                    />
                  </div>

                   <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <input
                        type={showForgotPass ? "text" : "password"}
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-white/5 focus:border-[#E11D48] rounded-2xl text-xs text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPass(!showForgotPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm bg-transparent border-0 cursor-pointer select-none"
                      >
                        {showForgotPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-2xl cursor-pointer shadow-md tracking-wider uppercase transition-all"
                  >
                    {formLoading ? 'Resetting...' : 'Update Password & Enter'}
                  </button>
                </form>
              </div>
            )}

            {/* Auth Navigation Links */}
            <div className="flex justify-center gap-6 text-xs text-slate-400 font-semibold">
              {authMode === 'login' && (
                <>
                  <button onClick={() => setAuthMode('register')} className="hover:text-[#E11D48] transition-colors cursor-pointer font-bold">
                    Create Study Account
                  </button>
                  <span>•</span>
                  <button onClick={() => setAuthMode('forgot')} className="hover:text-[#E11D48] transition-colors cursor-pointer font-bold">
                    Forgot Password?
                  </button>
                </>
              )}
              {authMode === 'register' && (
                <button onClick={() => setAuthMode('login')} className="hover:text-[#E11D48] transition-colors cursor-pointer font-bold">
                  Already have an account? Sign In
                </button>
              )}
              {authMode === 'forgot' && (
                <button onClick={() => setAuthMode('login')} className="hover:text-[#E11D48] transition-colors cursor-pointer font-bold">
                  Return to Login Gate
                </button>
              )}
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#03060d] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-left">
          <div>
            © 2026 StudyCircle. Dedicated to learning spaces in Vijayawada, Guntur, Vizag, Hyderabad, and AP/Telangana cluster colleges.
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-slate-400">AP & Telangana Degree Cluster Workspace</span>
          </div>
        </div>
      </footer>

    </div>
  );
}