'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ToastProvider';
import { 
  ArrowRight, 
  ArrowLeft,
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
  const [studentRegisterLoading, setStudentRegisterLoading] = useState(false);
  const [mentorRegisterLoading, setMentorRegisterLoading] = useState(false);
  const [studentOtpLoading, setStudentOtpLoading] = useState(false);
  const [mentorOtpLoading, setMentorOtpLoading] = useState(false);

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

  // OTP Countdown Timers
  const [studentOtpTimeLeft, setStudentOtpTimeLeft] = useState(0);
  const [mentorOtpTimeLeft, setMentorOtpTimeLeft] = useState(0);

  useEffect(() => {
    if (studentOtpTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setStudentOtpTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [studentOtpTimeLeft]);

  useEffect(() => {
    if (mentorOtpTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setMentorOtpTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [mentorOtpTimeLeft]);

  // Password visibility
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [showMentorPass, setShowMentorPass] = useState(false);

  // Terms and conditions modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalContent, setTermsModalContent] = useState<'terms' | 'policy' | null>(null);

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

  const isGmailTypo = (email: string) => {
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    const gmailTypos = [
      'gmaail.com', 'gmaill.com', 'gamil.com', 'gmal.com', 'gmil.com', 
      'gmaile.com', 'gmai.com', 'gmeil.com', 'gmail.con', 'gamail.com',
      'gmaail.co', 'gmaill.co', 'gamil.co', 'gmal.co', 'gmil.co', 
      'gmaile.co', 'gmai.co', 'gmeil.co', 'gamail.co', 'gmaial.com'
    ];
    return gmailTypos.includes(domain);
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
    if (isGmailTypo(contact)) {
      showToast('Invalid email spelling. Check proper and try again!', 'error');
      return;
    }
    if (role === 'student') setStudentOtpLoading(true);
    else setMentorOtpLoading(true);
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
        setStudentOtpTimeLeft(60);
      } else {
        setMentorOtpSent(true);
        setMentorOtpEmail(emailVal);
        setMentorOtp('');
        setMentorOtpTimeLeft(60);
      }
      showToast(data.message || 'Verification code sent!', 'success');
      if (data.isMocked) {
        showToast(`Local Test: Polling mock inbox to autofill...`, 'info');
        setTimeout(fetchMockInbox, 500);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to send verification code.', 'error');
    } finally {
      if (role === 'student') setStudentOtpLoading(false);
      else setMentorOtpLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFirstName.trim() || !studentLastName.trim() || !studentUser.trim() || !studentPass || !studentConfirmPass || !studentContact.trim() || !studentPhone.trim() || !studentOtp || !studentGender) {
      showToast('All fields (including name, username, email, phone, passwords, and gender) are required.', 'error');
      return;
    }
    if (studentPhone.length !== 10) {
      showToast('Phone number must contain exactly 10 digits.', 'error');
      return;
    }
    if (isGmailTypo(studentContact)) {
      showToast('Invalid email spelling. Check proper and try again!', 'error');
      return;
    }
    if (usernameStatus && !usernameStatus.available) {
      showToast('Username is already taken. Please choose another.', 'error');
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
    setStudentRegisterLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: studentFirstName.trim(),
          lastName: studentLastName.trim(),
          username: studentUser.trim().toLowerCase(),
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
      setStudentRegisterLoading(false);
    }
  };

  const handleMentorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorFirstName.trim() || !mentorLastName.trim() || !mentorUser.trim() || !mentorPass || !mentorConfirmPass || !mentorContact.trim() || !mentorPhone.trim() || !mentorInstitution || !mentorOtp || !mentorGender) {
      showToast('All fields (including name, username, email, phone, passwords, role, and college) are required.', 'error');
      return;
    }
    if (mentorPhone.length !== 10) {
      showToast('Phone number must contain exactly 10 digits.', 'error');
      return;
    }
    if (isGmailTypo(mentorContact)) {
      showToast('Invalid email spelling. Check proper and try again!', 'error');
      return;
    }
    if (usernameStatus && !usernameStatus.available) {
      showToast('Username is already taken. Please choose another.', 'error');
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
    setMentorRegisterLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: mentorFirstName.trim(),
          lastName: mentorLastName.trim(),
          username: mentorUser.trim().toLowerCase(),
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
      setMentorRegisterLoading(false);
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

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-3 py-1.5 bg-[#090d1e]/80 border border-white/5 hover:border-white/10 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-all shadow-md backdrop-blur-sm group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </div>

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
      <div className="relative w-full max-w-[1350px] flex items-center justify-center z-10 px-4 mb-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-stretch gap-6 bg-[#080d22]/30 border border-white/5 rounded-3xl p-6 lg:p-8 backdrop-blur-md relative z-10 shadow-2xl">
          
          {/* Left panel: Student Register Card */}
          <div className="flex flex-col gap-6 p-6 border border-[#00b074]/10 rounded-2xl bg-[#090d1e]/40 shadow-xl transition-all duration-300 hover:border-[#00b074]/30">
            {/* Header with image and title */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <img 
                src="/register-student.png" 
                alt="Student Registration" 
                className="w-16 h-18 object-contain rounded-xl border border-white/10 shadow-lg shadow-[#00b074]/5 bg-[#070b19]/40 p-1"
              />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-7 w-7 rounded-full bg-[#00b074]/10 border border-[#00b074]/20 text-[#00b074] flex items-center justify-center">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00b074]">Student Account</span>
                </div>
                <h3 className="text-lg font-bold text-white">Student Register</h3>
                <p className="text-[11px] text-slate-400 leading-normal">Join StudyCircle and connect with peers, share knowledge and grow together.</p>
              </div>
            </div>

            <form onSubmit={handleStudentRegister} className="space-y-5">

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

                {/* Username Field */}
                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Username</label>
                    {studentUser.trim() && usernameStatus && usernameStatus.checked && (
                      <span className={`text-[9px] font-black uppercase ${usernameStatus.available ? 'text-[#00b074]' : 'text-red-400'}`}>
                        {usernameStatus.available ? 'Available ✓' : 'Already taken ⨯'}
                      </span>
                    )}
                    {studentUser.trim() && checkingUsername && (
                      <span className="text-[9px] font-black uppercase text-slate-400">Checking...</span>
                    )}
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Choose a unique username"
                      value={studentUser}
                      onChange={(e) => handleUsernameChange(e.target.value, 'student')}
                      className={`w-full bg-[#070b19]/80 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:bg-[#070b19] outline-none transition-all ${
                        studentUser.trim() && usernameStatus && usernameStatus.checked
                          ? usernameStatus.available 
                            ? 'border-[#00b074]/40 focus:border-[#00b074]' 
                            : 'border-red-500/40 focus:border-red-500'
                          : 'border-white/5 focus:border-[#00b074]/50'
                      }`}
                      required
                    />
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
                        disabled={studentOtpSent && studentOtpTimeLeft > 0}
                        className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#00b074]/50 focus:bg-[#070b19] outline-none transition-all disabled:opacity-50"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => sendRegOtp('student')}
                      disabled={studentOtpLoading || (studentOtpSent && studentOtpTimeLeft > 0)}
                      className="px-4 py-2.5 bg-[#00b074]/10 hover:bg-[#00b074]/20 border border-[#00b074]/30 text-[#00b074] rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {studentOtpLoading 
                        ? 'Sending...' 
                        : studentOtpSent 
                          ? studentOtpTimeLeft > 0 
                            ? `Resend in ${studentOtpTimeLeft}s` 
                            : 'Resend OTP' 
                          : 'Send OTP'}
                    </button>
                  </div>
                  {studentContact && isGmailTypo(studentContact) && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      Check proper and try again
                    </p>
                  )}
                </div>

                {/* OTP Input Field */}
                {studentOtpSent && (
                  <div className="space-y-1 text-left animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Verification Code (OTP)</label>
                      {studentOtpTimeLeft > 0 ? (
                        <span className="text-[9px] text-zinc-400 font-bold">Expires in {studentOtpTimeLeft}s</span>
                      ) : (
                        <span className="text-[9px] text-rose-450 font-bold animate-pulse">OTP Expired!</span>
                      )}
                    </div>
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
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="Enter your phone number"
                      value={studentPhone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setStudentPhone(cleaned);
                      }}
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
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsModalContent('terms'); setShowTermsModal(true); }}
                      className="text-[#00b074] hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer transition-all focus:outline-none"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsModalContent('policy'); setShowTermsModal(true); }}
                      className="text-[#00b074] hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer transition-all focus:outline-none"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={studentRegisterLoading}
                  className="w-full py-3 bg-[#00b074] hover:bg-[#009060] disabled:bg-[#00b074]/50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-[#00b074]/15 transition-all flex items-center justify-center gap-2 mt-5 cursor-pointer"
                >
                  {studentRegisterLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
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
          <div className="flex flex-col gap-6 p-6 border border-[#5046E5]/10 rounded-2xl bg-[#090d1e]/40 shadow-xl transition-all duration-300 hover:border-[#5046E5]/30">
            {/* Header with image and title */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <img 
                src="/register-mentor.png" 
                alt="Mentor Registration" 
                className="w-16 h-18 object-contain rounded-xl border border-white/10 shadow-lg shadow-[#5046e5]/5 bg-[#070b19]/40 p-1"
              />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-7 w-7 rounded-full bg-[#5046E5]/10 border border-[#5046E5]/20 text-[#818CF8] flex items-center justify-center">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#818CF8]">Admin / Mentor</span>
                </div>
                <h3 className="text-lg font-bold text-white">Admin / Mentor Register</h3>
                <p className="text-[11px] text-slate-400 leading-normal">Create an account to manage, mentor and guide learners on StudyCircle.</p>
              </div>
            </div>

            <form onSubmit={handleMentorRegister} className="space-y-5">

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

                {/* Username Field */}
                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Username</label>
                    {mentorUser.trim() && usernameStatus && usernameStatus.checked && (
                      <span className={`text-[9px] font-black uppercase ${usernameStatus.available ? 'text-[#818CF8]' : 'text-red-400'}`}>
                        {usernameStatus.available ? 'Available ✓' : 'Already taken ⨯'}
                      </span>
                    )}
                    {mentorUser.trim() && checkingUsername && (
                      <span className="text-[9px] font-black uppercase text-slate-400">Checking...</span>
                    )}
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Choose a unique username"
                      value={mentorUser}
                      onChange={(e) => handleUsernameChange(e.target.value, 'mentor')}
                      className={`w-full bg-[#070b19]/80 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:bg-[#070b19] outline-none transition-all ${
                        mentorUser.trim() && usernameStatus && usernameStatus.checked
                          ? usernameStatus.available 
                            ? 'border-[#5046E5]/40 focus:border-[#5046E5]' 
                            : 'border-red-500/40 focus:border-red-500'
                          : 'border-white/5 focus:border-[#5046E5]/50'
                      }`}
                      required
                    />
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
                        disabled={mentorOtpSent && mentorOtpTimeLeft > 0}
                        className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#5046E5]/50 focus:bg-[#070b19] outline-none transition-all disabled:opacity-50"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => sendRegOtp('mentor')}
                      disabled={mentorOtpLoading || (mentorOtpSent && mentorOtpTimeLeft > 0)}
                      className="px-4 py-2.5 bg-[#5046E5]/10 hover:bg-[#5046E5]/20 border border-[#5046E5]/30 text-[#818CF8] rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {mentorOtpLoading 
                        ? 'Sending...' 
                        : mentorOtpSent 
                          ? mentorOtpTimeLeft > 0 
                            ? `Resend in ${mentorOtpTimeLeft}s` 
                            : 'Resend OTP' 
                          : 'Send OTP'}
                    </button>
                  </div>
                  {mentorContact && isGmailTypo(mentorContact) && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      Check proper and try again
                    </p>
                  )}
                </div>

                {/* OTP Input Field */}
                {mentorOtpSent && (
                  <div className="space-y-1 text-left animate-in fade-in duration-200">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Verification Code (OTP)</label>
                      {mentorOtpTimeLeft > 0 ? (
                        <span className="text-[9px] text-zinc-400 font-bold">Expires in {mentorOtpTimeLeft}s</span>
                      ) : (
                        <span className="text-[9px] text-rose-450 font-bold animate-pulse">OTP Expired!</span>
                      )}
                    </div>
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
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="Enter your phone number"
                      value={mentorPhone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setMentorPhone(cleaned);
                      }}
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
                      className="absolute right-3 top-3 text-slate-505 hover:text-slate-355 transition-colors"
                    >
                      {showMentorPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Gender radio selectors */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Gender</label>
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
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsModalContent('terms'); setShowTermsModal(true); }}
                      className="text-[#818CF8] hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer transition-all focus:outline-none"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsModalContent('policy'); setShowTermsModal(true); }}
                      className="text-[#818CF8] hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer transition-all focus:outline-none"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={mentorRegisterLoading}
                  className="w-full py-3 bg-[#5046E5] hover:bg-[#4338ca] disabled:bg-[#5046E5]/50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-[#5046e5]/15 transition-all flex items-center justify-center gap-2 mt-5 cursor-pointer"
                >
                  {mentorRegisterLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
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
      <div className="max-w-[1350px] w-full bg-[#080d22]/50 border border-white/5 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 z-10 backdrop-blur-sm shadow-xl">
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

      {/* Terms of Service & Privacy Policy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#090d1e] border border-white/10 max-w-2xl w-full rounded-3xl p-6 md:p-8 text-left space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-100 max-h-[85vh] overflow-y-auto scrollbar-thin">
            
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  {termsModalContent === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                </h3>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide mt-1">
                  StudyCircle Platform Agreements
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-white transition-all bg-transparent border-none p-2 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-semibold">
              {termsModalContent === 'terms' ? (
                <>
                  <p>Welcome to StudyCircle. By accessing or using our collaborative study platform, you agree to comply with and be bound by the following terms:</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-white font-extrabold text-xs uppercase tracking-wide">1. Acceptable Use & Academic Integrity</h4>
                    <p className="text-slate-400 pl-3">StudyCircle is designed strictly for peer-to-peer learning, doubt resolution, and collaborative research. Sharing of plagiarized solutions, copyrighted exam keys, or commercial advertising is strictly prohibited.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-extrabold text-xs uppercase tracking-wide">2. Gamification & System Limits</h4>
                    <p className="text-slate-400 pl-3">Users are rewarded with Experience Points (XP) and Focus Coins for contributing value. Any attempt to abuse or automate points allocation through bots or spam posts will result in permanent account suspension.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-extrabold text-xs uppercase tracking-wide">3. Account Moderation</h4>
                    <p className="text-slate-400 pl-3">Mentors and Administrators reserve the right to flag content, delete inappropriate threads, and restrict account privileges to maintain a safe, high-focus learning workspace for all students.</p>
                  </div>
                </>
              ) : (
                <>
                  <p>StudyCircle is committed to protecting your privacy. This policy describes how we collect, store, and utilize your personal information:</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-white font-extrabold text-xs uppercase tracking-wide">1. Information Collection</h4>
                    <p className="text-slate-400 pl-3">We collect personal registration details including your full name, username, email address, phone number, gender, and academic institution to authenticate your session and link you to local college circles.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-extrabold text-xs uppercase tracking-wide">2. Study Analytics & Progress Data</h4>
                    <p className="text-slate-400 pl-3">We record study logs, coins history, and community interactions (likes, doubts, and replies) purely to generate leaderboards, award streak achievements, and build collaborative analytics panels.</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-extrabold text-xs uppercase tracking-wide">3. Security & Cookies</h4>
                    <p className="text-slate-400 pl-3">We use secure HTTP-only cookies to handle authentication tokens. Your password credentials are encrypted using bcrypt hashing client-to-server and are never exposed to other third parties.</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none shadow-md"
              >
                Accept and Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
