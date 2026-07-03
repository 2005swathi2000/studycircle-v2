'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { apiRequest } from './utils/api';
import { useApp } from './context/AppContext';
import { useToast } from './components/ToastProvider';
import OpeningBook from './components/OpeningBook';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookOpen,
  Sun,
  Sunset,
  Moon,
  Edit3,
  Play,
  MessageSquare,
  Flame,
  Trophy
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

// ─────────────────────────────────────────────
// BUG FIX #2 — Time-based greeting helper
// Returns { label, icon } based on current hour
// ─────────────────────────────────────────────
function getTimeGreeting(): { label: string; icon: 'sun' | 'sunset' | 'moon' } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { label: 'Good Morning', icon: 'sun' };
  if (hour >= 12 && hour < 17) return { label: 'Good Afternoon', icon: 'sunset' };
  return { label: 'Good Evening', icon: 'moon' };
}

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();

  const [showBook, setShowBook] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Animated counters state
  const [sessionsCount, setSessionsCount] = useState(0);
  const [hoursCount, setHoursCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);

  // Onboarding goals checklist state
  const [onboardingTasks, setOnboardingTasks] = useState([true, false, false, false]);
  const getProgressPercentage = () => {
    const checkedCount = onboardingTasks.filter(Boolean).length;
    return Math.round((checkedCount / onboardingTasks.length) * 100);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyOpened = sessionStorage.getItem('studycircle_book_opened');
      if (alreadyOpened === 'true') {
        setShowBook(false);
      }
    }
  }, []);

  // Scope styling classes to reset background variable overrides
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('landing-html');
      document.body.classList.add('landing-body');
      document.documentElement.removeAttribute('data-theme');
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.classList.remove('landing-html');
        document.body.classList.remove('landing-body');
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showBook) return;
    // Count up animation ticker
    const duration = 1500; // 1.5s
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setSessionsCount(Math.min(500, Math.floor((500 / steps) * step)));
      setHoursCount(Math.min(1000, Math.floor((1000 / steps) * step)));
      setStudentsCount(Math.min(100, Math.floor((100 / steps) * step)));
      setGroupsCount(Math.min(50, Math.floor((50 / steps) * step)));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [showBook]);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [shouldHideContent, setShouldHideContent] = useState(false);

  const { user: currentUser, setUser: setCurrentUser, loading: globalLoading } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [activePortal, setActivePortal] = useState<'student' | 'mentor'>('student');
  const [regRole, setRegRole] = useState<'student' | 'mentor'>('student');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOauthDiagnostics, setShowOauthDiagnostics] = useState(false);

  // Google Confirmation Modal states
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [googleProfile, setGoogleProfile] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [showGoogleConfirmModal, setShowGoogleConfirmModal] = useState(false);

  const resolvedClientId = (
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
    process.env.VITE_GOOGLE_CLIENT_ID || 
    ""
  ).trim();

  const isValidGoogleClientId = resolvedClientId !== "" && 
    !resolvedClientId.includes("dummy") && 
    !resolvedClientId.includes("YOUR_REAL_CLIENT_ID") && 
    resolvedClientId.endsWith(".apps.googleusercontent.com");

  const getFrameworkType = () => {
    if (typeof window !== 'undefined') {
      if ((window as any).next || (window as any).__NEXT_DATA__ || document.getElementById('__NEXT_DATA__')) {
        return 'Next.js';
      }
    }
    return 'Next.js';
  };

  // Split name and gender inputs
  const [studentFirstName, setStudentFirstName] = useState('');
  const [studentLastName, setStudentLastName] = useState('');
  const [studentGender, setStudentGender] = useState('male');

  const [mentorFirstName, setMentorFirstName] = useState('');
  const [mentorLastName, setMentorLastName] = useState('');
  const [mentorGender, setMentorGender] = useState('male');

  // Username validation state
  const [usernameToCheck, setUsernameToCheck] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; available: boolean; method?: string } | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

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

  // ─────────────────────────────────────────────
  // BUG FIX #2 — Time-based greeting state
  // Updates every minute so it stays accurate
  // ─────────────────────────────────────────────
  const [greeting, setGreeting] = useState(getTimeGreeting());
  useEffect(() => {
    // Update immediately, then every 60 seconds
    setGreeting(getTimeGreeting());
    const greetInterval = setInterval(() => setGreeting(getTimeGreeting()), 60_000);
    return () => clearInterval(greetInterval);
  }, []);

  const GreetingIcon = () => {
    if (greeting.icon === 'sun') return <Sun className="h-5 w-5 text-amber-500" />;
    if (greeting.icon === 'sunset') return <Sunset className="h-5 w-5 text-orange-500" />;
    return <Moon className="h-5 w-5 text-indigo-500" />;
  };

  // ─────────────────────────────────────────────
  // BUG FIX #3 — Profile Edit modal state
  // ─────────────────────────────────────────────
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Sync profile fields when user changes
  useEffect(() => {
    if (currentUser) {
      setProfileFirstName(currentUser.firstName || '');
      setProfileLastName(currentUser.lastName || '');
    }
  }, [currentUser]);



  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFirstName.trim() || !profileLastName.trim()) {
      showToast('First name and last name are required.', 'error');
      return;
    }
    setProfileSaving(true);
    try {
      const data = await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          firstName: profileFirstName.trim(),
          lastName: profileLastName.trim()
        })
      });
      setCurrentUser(data.user);
      showToast('Profile updated successfully!', 'success');
      setShowProfileEdit(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

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

  const fetchMockInbox = useCallback(async () => {
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
      } else {
        if (lastSeenEmailIdRef.current === null) {
          lastSeenEmailIdRef.current = 'empty';
        }
      }
    } catch (err) {
      console.error('Error fetching mock inbox:', err);
    }
  }, [showToast]);

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

  // ─────────────────────────────────────────────
  // BUG FIX #1 — Glitch fix
  // Don't use a separate `loading` state that
  // mirrors globalLoading. Use globalLoading
  // directly, and separate the redirect effect
  // so it doesn't race with the loading state.
  // ─────────────────────────────────────────────
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (!globalLoading) {
      fetchPublicCircles();

      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('saved_login_user');
        const savedPass = localStorage.getItem('saved_login_pass');
        if (savedUser) setLoginUser(savedUser);
        if (savedPass) setLoginPass(savedPass);

        const params = new URLSearchParams(window.location.search);
        if (params.get('login') === 'true') {
          setAuthMode('login');
          setShowAuthModal(true);
        }
      }

      const isLocal = typeof window !== 'undefined' && 
                      (window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1');
      setIsDevMode(isLocal);

      if (isLocal) {
        console.log("[Google Auth Diagnostics] Development environment status:", {
          nextPublicExists: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          viteExists: !!process.env.VITE_GOOGLE_CLIENT_ID,
          origin: typeof window !== 'undefined' ? window.location.origin : "",
        });
        console.log(" - Detected Framework:", getFrameworkType());
        
        const resolvedId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
        if (!resolvedId) {
          console.error(" - Status: Google Client ID is completely missing!");
        } else if (resolvedId.includes("dummy") || resolvedId.includes("YOUR_REAL_CLIENT_ID")) {
          console.warn(" - Status: Google Client ID is using a placeholder/dummy value:", resolvedId);
        } else if (!resolvedId.endsWith(".apps.googleusercontent.com")) {
          console.error(" - Status: Google Client ID has an invalid format! Expected suffix '.apps.googleusercontent.com', found:", resolvedId);
        } else {
          console.log(" - Status: Active Google Client ID is loaded correctly:", resolvedId);
        }

        fetchMockInbox();
        const interval = setInterval(fetchMockInbox, 2000);
        return () => clearInterval(interval);
      }
    }
  }, [globalLoading, fetchMockInbox]);

  // Auto-send and custom notification banner states


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
        setLastSentStudentEmail(contact.trim().toLowerCase());
        setStudentOtp('');
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

  // Send Forgot Password OTP
  const sendResetOtp = async () => {
    if (!forgotUser.trim()) {
      showToast('Please enter your registered email or phone number first.', 'error');
      return;
    }
    if (!isValidEmailOrPhone(forgotUser)) {
      showToast('Invalid email or phone format, please check and try again!', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ isReset: true, phoneOrEmail: forgotUser, value: forgotUser, username: forgotUser })
      });
      setForgotOtpSent(true);
      setForgotOtpEmail(data.email || '');
      setLastSentForgotUser(forgotUser.trim().toLowerCase());
      setForgotOtp('');
      showToast(data.message || 'Reset code sent to registered contact!', 'success');
      if (data.isMocked) {
        showToast(`Local Test: Polling mock inbox to autofill...`, 'info');
        setTimeout(fetchMockInbox, 500);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to send reset code.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Perform Student Registration
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFirstName.trim() || !studentLastName.trim() || !studentUser.trim() || !studentPass || !studentContact.trim() || !studentOtp || !studentGender) {
      showToast('All fields (including first name, last name, verification code, and gender) are required.', 'error');
      return;
    }
    setFormLoading(true);
    const payload = {
      firstName: studentFirstName.trim(),
      lastName: studentLastName.trim(),
      username: studentUser.trim(),
      password: studentPass,
      role: 'student',
      email: studentContact.includes('@') ? studentContact.trim().toLowerCase() : null,
      phone: !studentContact.includes('@') ? studentContact.trim() : null,
      gender: studentGender,
      otp: studentOtp
    };
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setCurrentUser(data.user, data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('saved_login_user', studentUser.trim());
        localStorage.setItem('saved_login_pass', studentPass);
        localStorage.setItem('studycircle_register_payload', JSON.stringify(payload));
      }
      showToast(data.message || 'Student account created successfully!', 'success');
      setShowAuthModal(false);
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
    if (!mentorFirstName.trim() || !mentorLastName.trim() || !mentorUser.trim() || !mentorPass || !mentorInstitution || !mentorContact.trim() || !mentorOtp || !mentorGender) {
      showToast('All fields (including first name, last name, verification code, and gender) are required.', 'error');
      return;
    }
    setFormLoading(true);
    const payload = {
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
    };
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast(data.message || 'Mentor registered. Awaiting Admin Approval.', 'success');
      if (data.user && data.user.isApproved) {
        setCurrentUser(data.user, data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('saved_login_user', mentorUser.trim());
          localStorage.setItem('saved_login_pass', mentorPass);
          localStorage.setItem('studycircle_register_payload', JSON.stringify(payload));
        }
        showToast('Approved automatically. Redirecting...', 'success');
        setShowAuthModal(false);
        router.push('/dashboard');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('saved_login_user', mentorUser.trim());
          localStorage.setItem('saved_login_pass', mentorPass);
          localStorage.setItem('studycircle_register_payload', JSON.stringify(payload));
        }
        setAuthMode('login');
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
    const payload = {
      fullName: adminName,
      username: adminUser,
      password: adminPass,
      role: 'admin',
      phoneOrEmail: adminContact,
      otp: adminOtp
    };
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast(data.message || 'Admin registered. Awaiting Admin Approval.', 'success');
      if (data.user && data.user.isApproved) {
        setCurrentUser(data.user, data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('saved_login_user', adminUser.trim());
          localStorage.setItem('saved_login_pass', adminPass);
          localStorage.setItem('studycircle_register_payload', JSON.stringify(payload));
        }
        showToast('Approved automatically. Redirecting...', 'success');
        router.push('/dashboard');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('saved_login_user', adminUser.trim());
          localStorage.setItem('saved_login_pass', adminPass);
          localStorage.setItem('studycircle_register_payload', JSON.stringify(payload));
        }
        setAuthMode('login');
        scrollToSection('auth-gates');
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Helper to decode real Google JWT tokens
  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode JWT:", e);
      return null;
    }
  };

  // Google Sign-In Success Initiator
  const handleGoogleInitiate = async (credential: string | undefined) => {
    if (!credential) {
      showToast('Google credential token is missing.', 'error');
      return;
    }

    setFormLoading(true);
    try {
      const data = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential })
      });
      setCurrentUser(data.user, data.token);
      showToast('Welcome to StudyCircle, ' + data.user.fullName + '!', 'success');
      router.push('/student/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Google Login failed.', 'error');
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
          portal: activePortal,
          rememberMe
        })
      });
      setCurrentUser(data.user, data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('saved_login_user', loginUser);
        localStorage.setItem('saved_login_pass', loginPass);
      }
      showToast('Welcome back, ' + data.user.fullName + '!', 'success');
      setShowAuthModal(false);
      router.push('/dashboard');
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        const payloadStr = localStorage.getItem('studycircle_register_payload');
        if (payloadStr) {
          try {
            const payload = JSON.parse(payloadStr);
            if (payload.username && payload.username.trim().toLowerCase() === loginUser.trim().toLowerCase() && payload.password === loginPass) {
              console.log('[Login] Database reset detected. Auto-registering from local payload...');
              const regData = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload)
              });
              if (regData && regData.user) {
                setCurrentUser(regData.user, regData.token);
                localStorage.setItem('saved_login_user', loginUser);
                localStorage.setItem('saved_login_pass', loginPass);
                showToast('Welcome back, ' + regData.user.fullName + ' (session auto-restored)!', 'success');
                setShowAuthModal(false);
                router.push('/dashboard');
                return;
              }
            }
          } catch (restoreErr) {
            console.error('Self-healing login restore failed:', restoreErr);
          }
        }
      }
      showToast(err.message || 'Login failed. Please verify credentials.', 'error');
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
          phoneOrEmail: forgotUser,
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

  // ─────────────────────────────────────────────
  // BUG FIX #4 — "Access Denied" on Workspace join
  // Root cause: context hasn't hydrated when
  // joinPublicGroup runs, so currentUser is null.
  // Fix: if globalLoading is still true, wait for
  // it; also read fresh from context ref.
  // ─────────────────────────────────────────────
  const joinPublicGroup = async (groupId: string) => {
    // If context is still loading, wait — don't flash "Access Denied"
    if (globalLoading) {
      showToast('Please wait, loading your session...', 'info');
      return;
    }

    if (!currentUser) {
      showToast('Please log in or sign up first to join this study circle.', 'warning');
      setAuthMode('login');
      setShowAuthModal(true);
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
    if (id === 'hero-section') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const navbarHeight = 64; // header height is h-16 = 64px
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col relative overflow-hidden font-sans antialiased">
      
      <AnimatePresence>
        {showBook && (
          <OpeningBook onComplete={() => {
            setShowBook(false);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('studycircle_book_opened', 'true');
            }
          }} />
        )}
      </AnimatePresence>
      
      {/* 🔮 Background Ambient Glows & Floating Objects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#4F46E5]/5 rounded-full blur-[120px]" />
        <div className="absolute top-[50%] right-[-10%] w-[600px] h-[600px] bg-[#6366F1]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[450px] h-[450px] bg-[#22C55E]/5 rounded-full blur-[100px]" />

        {/* Floating Framer Motion Elements */}
        <AnimatePresence>
          {!showBook && (
            <>
              {/* Floating Book */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.25, y: [0, -25, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[25%] left-[8%] hidden lg:block text-[#4F46E5]"
              >
                <BookOpen className="h-14 w-14 stroke-[1.2]" />
              </motion.div>

              {/* Floating Graduation Cap */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.2, y: [0, -30, 0], rotate: [0, -12, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-[35%] right-[10%] hidden lg:block text-[#6366F1]"
              >
                <GraduationCap className="h-16 w-16 stroke-[1.2]" />
              </motion.div>

              {/* Floating Streak Flame */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.25, y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-[30%] left-[12%] hidden lg:block text-orange-400"
              >
                <Flame className="h-12 w-12 fill-orange-400/10 stroke-[1.5]" />
              </motion.div>

              {/* Floating Award Trophy */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 0.2, y: [0, -25, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-[20%] right-[15%] hidden lg:block text-amber-500"
              >
                <Trophy className="h-14 w-14 stroke-[1.2]" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 🔔 Sliding Email Notification Banner */}
      {false && isDevMode && activeNotification && (
        <div className="fixed top-24 right-6 z-[10000] max-w-sm w-full bg-white/90 border border-slate-200/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 pointer-events-auto flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-150 text-[#4F46E5] flex items-center justify-center shrink-0 animate-bounce">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-[#4F46E5]">New Email Received</span>
              <button 
                onClick={() => setActiveNotification(null)}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
            <h4 className="text-xs font-black text-[#0F172A]">{activeNotification.subject}</h4>
            <p className="text-[10px] text-[#475569] leading-relaxed font-semibold">
              To: <span className="text-[#4F46E5]">{activeNotification.to}</span>
            </p>
            <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-650 font-bold">OTP Code: <strong className="text-indigo-650 font-extrabold">{activeNotification.otp}</strong></span>
              <span className="text-[9px] font-extrabold uppercase bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded">Auto Filled</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 1. Glassmorphism Sticky Navbar */}
      <header className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-slate-200/50 shadow-sm shadow-slate-100/50 py-3.5' 
          : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
            <div className="relative h-10 w-10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] opacity-90 shadow-[0_4px_15px_rgba(79,70,229,0.25)]" />
              <div className="absolute inset-[2px] rounded-lg bg-white flex items-center justify-center font-bold">
                <BookOpen className="h-4.5 w-4.5 text-[#4F46E5] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <span className="font-black text-xl tracking-tight text-[#0F172A] font-sans">
              StudyCircle
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase text-[#475569] tracking-widest">
            <button onClick={() => scrollToSection('features-section')} className="relative hover:text-[#4F46E5] transition-colors cursor-pointer py-1 group border-none bg-transparent">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#4F46E5] transition-all group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection('gamification-section')} className="relative hover:text-[#4F46E5] transition-colors cursor-pointer py-1 group border-none bg-transparent">
              Rewards
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#4F46E5] transition-all group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection('journey-section')} className="relative hover:text-[#4F46E5] transition-colors cursor-pointer py-1 group border-none bg-transparent">
              How it works
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#4F46E5] transition-all group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection('roadmap-section')} className="relative hover:text-[#4F46E5] transition-colors cursor-pointer py-1 group border-none bg-transparent">
              Roadmap
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#4F46E5] transition-all group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection('team-section')} className="relative hover:text-[#4F46E5] transition-colors cursor-pointer py-1 group border-none bg-transparent">
              Team
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#4F46E5] transition-all group-hover:w-full" />
            </button>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline font-bold">Edit Profile</span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-[#4F46E5]/20 cursor-pointer border-none"
                >
                  Dashboard <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#475569] hover:text-[#0F172A] text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  Log in
                </button>
                <button 
                  onClick={() => router.push('/register')}
                  className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#4F46E5]/25 transition-all cursor-pointer border-none"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col pt-24 z-10 relative">

        {/* ── Time-based greeting banner (visible when logged in) ── */}
        {currentUser && (
          <div className="w-full bg-[#EBF5F1] border-b border-[#22C55E]/10 py-3 mb-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-2.5">
              <GreetingIcon />
              <span className="text-sm font-extrabold text-[#0F172A]">{greeting.label}, {currentUser.firstName || currentUser.fullName}!</span>
              <span className="text-xs text-[#475569] font-medium hidden sm:inline">— Ready to achieve your goals today?</span>
            </div>
          </div>
        )}
        
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-20">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center text-left relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 lg:pr-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-50 border border-indigo-100/50 text-[#4F46E5] rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" /> A premium learning workspace for degree & engineering students
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.08]">
                Study Better <br />
                <span className="text-[#4F46E5] bg-gradient-to-r from-[#4F46E5] to-[#6366F1] bg-clip-text text-transparent">Together.</span>
              </h1>
              
              <p className="text-xs md:text-sm text-[#475569] leading-relaxed font-bold max-w-lg">
                Build consistency, join live study sessions, collaborate on notes, and achieve academic success with accountability. Designed for campus communities in Andhra Pradesh & Telangana.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => router.push('/register')}
                  className="px-7 py-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#4F46E5]/20 flex items-center gap-2 transition-all cursor-pointer border-none hover:-translate-y-0.5"
                >
                  Get Started — It's Free <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollToSection('features-section')}
                  className="px-7 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-[#475569] text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5"
                >
                  Explore Features <Play className="h-3 w-3 text-[#4F46E5] fill-[#4F46E5]" />
                </button>
              </div>

              {/* Ticker Stats Section */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { count: sessionsCount, label: 'Study Sessions', format: (v: number) => `${v}+` },
                  { count: hoursCount, label: 'Hours Logged', format: (v: number) => `${v}+` },
                  { count: studentsCount, label: 'Students Joined', format: (v: number) => `${v}+` },
                  { count: groupsCount, label: 'Study Circles', format: (v: number) => `${v}+` }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-2xl md:text-3xl font-black text-[#0F172A] font-mono leading-none">
                      {stat.format(stat.count)}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#475569] leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Illustration Column */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              {/* Glowing Background Ring */}
              <div className="absolute w-[360px] h-[360px] md:w-[480px] md:h-[480px] bg-gradient-to-tr from-indigo-100 to-indigo-50 rounded-full -z-10 blur-3xl pointer-events-none" />

              {/* SaaS Dashboard Frame Mockup */}
              <div className="relative w-full max-w-[480px] border border-slate-200/80 bg-white p-2.5 rounded-[28px] shadow-2xl z-10 transition-all duration-500 hover:scale-[1.01] hover:shadow-indigo-100/50">
                {/* Mock UI Header */}
                <div className="w-full h-[320px] bg-[#F8FAFC] border border-slate-100 rounded-[20px] overflow-hidden flex flex-col text-slate-800 text-left p-2.5 gap-2.5 font-sans select-none">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">StudyCircle Dashboard</span>
                  </div>

                  <div className="flex-1 flex gap-2.5 text-[8.5px]">
                    {/* Mock Sidebar */}
                    <div className="w-[60px] flex flex-col gap-1.5 shrink-0 bg-white border border-slate-200/80 rounded-xl p-1.5">
                      <div className="h-4 bg-[#EBF5F1] text-[#22C55E] text-[7.5px] font-black rounded flex items-center gap-1 px-1">Lounge</div>
                      <div className="px-1 py-0.5 text-[#4F46E5] font-black bg-indigo-50 rounded">🏠 Dashboard</div>
                      <div className="px-1 py-0.5 text-[#475569] font-bold">📝 Shared Notes</div>
                      <div className="px-1 py-0.5 text-[#475569] font-bold">📅 Meetings</div>
                      <div className="px-1 py-0.5 text-[#475569] font-bold">🏆 Ranks</div>
                    </div>

                    {/* Mock Main Desk */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="p-2 bg-white border border-slate-200/80 rounded-xl shadow-sm flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-black text-slate-850">AP & TG Student Lounge</div>
                          <div className="text-[7.5px] text-[#475569]">Verified Peer Network</div>
                        </div>
                        <span className="text-[8.5px] font-black text-orange-400 bg-orange-50 px-1.5 py-0.5 rounded">🔥 7 Streak</span>
                      </div>

                      {/* Mock widgets */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col justify-between h-[100px]">
                          <div>
                            <span className="text-[6.5px] uppercase font-black text-slate-400 block tracking-wide">Next Live Session</span>
                            <div className="font-extrabold text-[9px] text-[#0F172A] mt-1 leading-snug">Algorithms Review</div>
                            <span className="text-[7px] text-[#4F46E5] font-bold block mt-0.5">Today, 7:30 PM</span>
                          </div>
                          <button className="py-1 px-2.5 bg-[#4F46E5] text-white rounded-lg text-[7px] font-black border-none cursor-pointer self-start shadow-sm shadow-[#4F46E5]/10">Join Room</button>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col justify-between h-[100px]">
                          <div>
                            <span className="text-[6.5px] uppercase font-black text-slate-400 block tracking-wide">Progress Level</span>
                            <span className="text-xs font-black text-[#4F46E5] mt-1 block">Level 5</span>
                          </div>
                          {/* Mini progress bar */}
                          <div className="space-y-1">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#4F46E5] h-full w-[70%]" />
                            </div>
                            <div className="flex justify-between text-[6px] text-slate-400 font-bold">
                              <span>350/500 XP</span>
                              <span>70%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Mini Credit Wallet Overlay */}
              <div className="absolute left-[-20px] bottom-[20px] z-20 w-[140px] bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xl text-left scale-95 select-none hidden sm:block">
                <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-wider block">Wallet Balance</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-base font-black text-amber-500">¢ 1,050</span>
                  <span className="text-[8px] font-extrabold uppercase bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200/50">Focus Coins</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <span className="text-[7px] text-[#475569] font-medium">Ready to redeem visual upgrades in the Shop!</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SaaS Feature Cards Section */}
        <section id="features-section" className="py-20 bg-white border-y border-slate-200/60 relative">
          <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full">Features</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A]">All the tools to scale your studies</h2>
              <p className="text-xs md:text-sm text-[#475569] max-w-lg mx-auto font-bold">Everything you need to collaborate, stay motivated, and build consistency.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                { icon: Users, title: 'Study Groups', desc: 'Create and join custom study communities tailored to your syllabus.', bg: '#EEF2FF', text: '#4F46E5' },
                { icon: Play, title: 'Live Study Rooms', desc: 'Co-study with peer presence tracking and desking logs in real time.', bg: '#ECFDF5', text: '#22C55E' },
                { icon: FileText, title: 'Shared Notes', desc: 'A synchronized document hub to share cheat sheets and notes.', bg: '#EEF2FF', text: '#4F46E5' },
                { icon: Calendar, title: 'Session Schedule', desc: 'Schedule and coordinate exams, quiz reviews, and sessions.', bg: '#F5F3FF', text: '#6366F1' },
                { icon: TrendingUp, title: 'Progress Tracking', desc: 'Keep track of logged focus hours, daily logs, and consistency.', bg: '#ECFDF5', text: '#22C55E' },
                { icon: MessageSquare, title: 'Discussion Boards', desc: 'Ask doubts, accept answers, and review code conceptual feedback.', bg: '#EEF2FF', text: '#4F46E5' },
                { icon: Shield, title: 'Accountability Desk', desc: 'Circle guidelines and participant metrics to avoid group passivity.', bg: '#FFF5F5', text: '#EF4444' },
                { icon: Award, title: 'Weekly Leaderboards', desc: 'Compete in friendly college leagues and earn focus rewards.', bg: '#FFFBEB', text: '#F59E0B' }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={i}
                    className="p-6 bg-white border border-slate-200/80 hover:border-slate-300 rounded-[24px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[180px] group relative overflow-hidden"
                  >
                    {/* Glow element on hover */}
                    <div className="absolute -inset-px bg-gradient-to-tr from-indigo-50/10 to-indigo-100/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[24px] -z-10" />

                    <div className="space-y-3">
                      <div 
                        className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:rotate-12"
                        style={{ backgroundColor: feature.bg }}
                      >
                        <Icon className="h-5 w-5" style={{ color: feature.text }} />
                      </div>
                      <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">{feature.title}</h4>
                      <p className="text-[10px] text-[#475569] leading-relaxed font-bold">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Gamification Features Showcase Section */}
        <section id="gamification-section" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#22C55E] bg-emerald-50 border border-emerald-100 px-3.5 py-1 rounded-full">Gamification</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A]">Gamified Progress Systems</h2>
              <p className="text-xs md:text-sm text-[#475569] max-w-lg mx-auto font-bold">Earn points, level up, maintain streaks, and show off credentials.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              
              {/* Card 1: Streaks */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-[24px] shadow-sm flex flex-col justify-between h-[210px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm">
                      <Flame className="h-5 w-5 fill-orange-500/10" />
                    </span>
                    <span className="text-[9px] font-black uppercase bg-orange-50 text-orange-600 px-2 py-0.5 rounded">Active Streak</span>
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0F172A]">🔥 Daily Streaks</h4>
                  <p className="text-[10px] text-[#475569] leading-relaxed font-semibold">Maintain consistency. Log study hours daily to grow your streak multiplier and lock in bonus multiplier coins.</p>
                </div>
                {/* Visual indicator */}
                <div className="flex gap-1.5 items-center">
                  {[...Array(7)].map((_, i) => (
                    <span key={i} className={`h-2.5 w-6 rounded-full ${i < 5 ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-sm' : 'bg-slate-100'}`} />
                  ))}
                  <span className="text-[9px] font-black text-orange-500 ml-2 font-mono">5/7 Days</span>
                </div>
              </div>

              {/* Card 2: Badges & Showcase */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-[24px] shadow-sm flex flex-col justify-between h-[210px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#4F46E5] shadow-sm">
                      <Award className="h-5 w-5" />
                    </span>
                    <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">Unlocked Shelf</span>
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0F172A]">🏅 Achievement Badges</h4>
                  <p className="text-[10px] text-[#475569] leading-relaxed font-semibold">Unlock digital showcase trophies for milestones like your first co-study room, weekly challenge wins, and note shares.</p>
                </div>
                {/* Visual badge row */}
                <div className="flex gap-2.5 items-center">
                  {['📚', '⚡', '🏆', '💎'].map((emoji, i) => (
                    <div key={i} className="h-7 w-7 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-xs shadow-inner cursor-default" title={`Badge ${i + 1}`}>
                      {emoji}
                    </div>
                  ))}
                  <span className="text-[9px] font-black text-[#4F46E5] font-mono">+8 more</span>
                </div>
              </div>

              {/* Card 3: Experience Levels */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-[24px] shadow-sm flex flex-col justify-between h-[210px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#22C55E] shadow-sm">
                      <TrendingUp className="h-5 w-5" />
                    </span>
                    <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">Level 5</span>
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0F172A]">⭐ Experience Levels</h4>
                  <p className="text-[10px] text-[#475569] leading-relaxed font-semibold">Track your growth mathematically using our custom scaling level curve: 100 × Level^1.3 XP bounds.</p>
                </div>
                {/* Visual XP bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div className="bg-[#22C55E] h-full rounded-full transition-all duration-1000" style={{ width: '70%' }} />
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-400 font-mono">
                    <span>350 / 500 XP</span>
                    <span>70% Complete</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Student Success Journey Section */}
        <section id="journey-section" className="py-20 bg-white border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6 space-y-14 text-center">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6366F1] bg-purple-50 border border-purple-100 px-3.5 py-1 rounded-full">Journey Map</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A]">Your Road to Success</h2>
              <p className="text-xs md:text-sm text-[#475569] max-w-lg mx-auto font-bold">Six structured phases designed to transition solo study into active group excellence.</p>
            </div>

            {/* Horizontal timeline cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
              {[
                { step: '1', title: 'Register', desc: 'Secure your gate verification.' },
                { step: '2', title: 'Join Group', desc: 'Enter a syllabus circle.' },
                { step: '3', title: 'Attend Session', desc: 'Desking quiet zones.' },
                { step: '4', title: 'Track Focus', desc: 'Log study hour logs.' },
                { step: '5', title: 'Earn Coins', desc: 'Redeem visuals in shop.' },
                { step: '6', title: 'Top Leader', desc: 'Maintain peak ranks.' }
              ].map((j, i) => (
                <div key={i} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 relative group hover:border-[#4F46E5]/20 hover:bg-white transition-all text-left">
                  {/* Glowing index ring */}
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 text-[#4F46E5] font-black text-xs flex items-center justify-center shadow-inner">
                    {j.step}
                  </div>
                  <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">{j.title}</h4>
                  <p className="text-[9.5px] text-[#475569] leading-relaxed font-semibold">{j.desc}</p>

                  {/* Flow Arrow (Hidden on mobile, last item) */}
                  {i < 5 && (
                    <div className="hidden lg:block absolute right-[-15px] top-1/2 -translate-y-1/2 z-20 text-[#4F46E5] font-bold text-xs pointer-events-none">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Team Showcase Section */}
        <section id="team-section" className="py-20 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full">Team</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A]">Core Coordinators</h2>
              <p className="text-xs md:text-sm text-[#475569] max-w-lg mx-auto font-bold">Organizers overseeing the StudyCircle workspace development & sync.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { name: 'Hanumanthu Swathi', role: 'Team Lead', avatar: '/swathi-avatar.png', color: 'border-emerald-500' },
                { name: 'Perugu Bhagya Lakshmi', role: 'System Architect', avatar: '/bhagya-avatar.png', color: 'border-indigo-500' },
                { name: 'Manda Rathna Rekha', role: 'Database Coordinator', avatar: '/rathna-avatar.png', color: 'border-amber-500' }
              ].map((member, i) => (
                <div 
                  key={i}
                  className="p-6 bg-white/70 backdrop-blur-md border border-slate-200 rounded-[28px] shadow-sm flex flex-col items-center gap-4 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
                >
                  {/* Photo with dynamic border color */}
                  <div className={`h-24 w-24 rounded-full border-4 ${member.color} overflow-hidden shadow-md shrink-0 bg-slate-50 transition-transform duration-300 group-hover:scale-105`}>
                    <img src={member.avatar} alt={member.name} className="h-full w-full object-cover object-center" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-[#0F172A] leading-tight">{member.name}</h4>
                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-550 border border-slate-200/50 inline-block mt-1">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Roadmap Timeline Section */}
        <section id="roadmap-section" className="py-20 bg-white border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] bg-indigo-50 border border-indigo-100 px-3.5 py-1 rounded-full">Roadmap</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A]">Development Milestones</h2>
              <p className="text-xs md:text-sm text-[#475569] max-w-lg mx-auto font-bold">Planned sync intervals tracking implementation phases.</p>
            </div>

            <div className="max-w-3xl mx-auto relative pl-6 md:pl-0">
              {/* Center vertical indicator line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-200 -translate-x-1/2 z-0" />

              {[
                { week: 'Week 1', title: 'Backend Hardening', desc: 'Secure database models, associations, OTP integrations, and security verification logs.' },
                { week: 'Week 2', title: 'Frontend Foundation', desc: 'Build visual style systems, Tailwind themes, and basic API communication utilities.' },
                { week: 'Week 3', title: 'Core Features', desc: 'Implement live co-study rooms, discussion feeds, shared notes, and weekly leaderboards.' },
                { week: 'Week 4', title: 'Deployment & Launch', desc: 'Deploy production builds to hosting platforms, run verification checklists, and import mock profiles.' }
              ].map((item, index) => {
                return (
                  <div key={index} className={`flex flex-col md:flex-row items-center justify-between mb-8 md:mb-0 relative z-10 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-full md:w-1/2 flex justify-center md:justify-end md:px-8">
                      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl max-w-sm text-left shadow-sm">
                        <span className="text-xs font-black uppercase text-[#4F46E5] tracking-widest">{item.week}</span>
                        <h4 className="text-sm font-black text-[#0F172A] mt-1 mb-2 uppercase tracking-wide">{item.title}</h4>
                        <p className="text-[10px] text-[#475569] leading-relaxed font-bold">{item.desc}</p>
                      </div>
                    </div>
                    
                    <div className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-[#4F46E5] -translate-x-1/2 z-20 flex items-center justify-center font-extrabold text-xs text-[#4F46E5] shadow-md shadow-indigo-100">
                      {index + 1}
                    </div>

                    <div className="w-full md:w-1/2 md:px-8">
                      {/* Spacer */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Onboarding Checklist section removed */}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-left">
          <div>
            © 2026 StudyCircle. Dedicated to learning spaces in Vijayawada, Guntur, Vizag, Hyderabad, and AP/Telangana cluster colleges.
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-slate-700">AP & Telangana Degree Cluster Workspace</span>
          </div>
        </div>
      </footer>

      {/* 🔐 Auth Overlay Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAuthModal(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity cursor-pointer"
          />
          
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl z-10 text-left animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer text-lg p-2 rounded-xl hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex h-10 w-10 rounded-full bg-[#E6F2ED] border border-[#0E3E31]/10 text-[#0E3E31] items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {authMode === 'login' && 'Welcome to StudyCircle'}
                {authMode === 'register' && 'Create Your Account'}
                {authMode === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-550 font-bold">
                {authMode === 'login' && 'Log in to access your student or mentor workspace'}
                {authMode === 'register' && 'Join the AP & Telangana degree cluster lounge'}
                {authMode === 'forgot' && 'Recover your credentials via registered contact'}
              </p>
            </div>

            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setActivePortal('student')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activePortal === 'student' ? 'bg-[#0E3E31] text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Student Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePortal('mentor')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activePortal === 'mentor' ? 'bg-[#0E3E31] text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Mentor / Admin
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email or Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter your email or username"
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0E3E31]/50 focus:bg-white outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showLoginPass ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0E3E31]/50 focus:bg-white outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold"
                      >
                        {showLoginPass ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold">
                  <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-[#0E3E31] border-slate-300 text-[#0E3E31] focus:ring-0 cursor-pointer"
                    />
                    <span>Remember Me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-[#0E3E31] hover:text-[#0B3026] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-[#0E3E31] hover:bg-[#0B3026] disabled:bg-[#0E3E31]/50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-[#0E3E31]/10 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Log In to {activePortal === 'student' ? 'Student' : 'Mentor/Admin'} Desk
                </button>

                <div className="flex items-center my-3 gap-2">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">or</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="flex justify-center w-full mt-2">
                  {isValidGoogleClientId ? (
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        if (credentialResponse.credential) {
                          const decoded = decodeJwt(credentialResponse.credential);
                          if (decoded) {
                            setGoogleCredential(credentialResponse.credential);
                            setGoogleProfile({
                              name: decoded.name || 'Google User',
                              email: decoded.email || '',
                              picture: decoded.picture || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
                            });
                            setShowAuthModal(false);
                            setShowGoogleConfirmModal(true);
                          } else {
                            showToast('Failed to parse Google credentials.', 'error');
                          }
                        }
                      }}
                      onError={() => {
                        showToast('Google Sign-In failed.', 'error');
                      }}
                      theme="outline"
                      size="large"
                      shape="rectangular"
                      width="320px"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        showToast("Google OAuth is not configured correctly. Opening Diagnostics...", "error");
                        setShowOauthDiagnostics(true);
                      }}
                      className="w-[320px] py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] shadow-sm hover:shadow"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.327 2.68 1.486 6.58l3.78 3.185z"
                        />
                        <path
                          fill="#34A853"
                          d="M16.04 15.345c-1.07.72-2.482 1.155-4.04 1.155a7.09 7.09 0 0 1-6.734-4.855L1.48 14.83C3.32 18.738 7.33 21.42 12 21.42c3.055 0 5.89-.982 8.027-2.855l-3.986-3.22z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.82 12.24c0-.77-.07-1.56-.2-2.31H12v4.51h6.633a5.688 5.688 0 0 1-2.466 3.73l3.986 3.22c2.333-2.155 3.667-5.32 3.667-9.15z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.266 11.655a6.853 6.853 0 0 1 0-1.89l-3.78-3.185A11.954 11.954 0 0 0 0 12.24c0 2.01.49 3.91 1.486 5.59l3.78-3.185z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  )}
                </div>
                {isDevMode && !isValidGoogleClientId && (
                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const mockCredential = 'mock_google_credential_token:swathi.hani@studycircle.com:Swathi Hani:female';
                        setGoogleCredential(mockCredential);
                        setGoogleProfile({
                          name: 'Swathi Hani',
                          email: 'swathi.hani@studycircle.com',
                          picture: '/swathi-avatar.png'
                        });
                        setShowAuthModal(false);
                        setShowGoogleConfirmModal(true);
                        showToast('Sandbox: Simulating Google Account Chooser callback...', 'info');
                      }}
                      className="text-[10px] font-black text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-lg font-bold"
                    >
                      🛠️ Sandbox: Test Google Login
                    </button>
                  </div>
                )}
                <div className="text-center pt-2">
                  <span className="text-[10px] text-slate-500">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => { setShowAuthModal(false); router.push('/register'); }}
                    className="text-[10px] font-black text-[#0E3E31] hover:text-[#0B3026] transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            )}

            {authMode === 'forgot' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Username or Contact (Email/Phone)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Registered Email, Phone, or Username"
                        value={forgotUser}
                        onChange={(e) => setForgotUser(e.target.value)}
                        disabled={forgotOtpSent}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0E3E31]/50 focus:bg-white outline-none transition-all disabled:opacity-50"
                        required
                      />
                      <button
                        type="button"
                        onClick={sendResetOtp}
                        disabled={formLoading || forgotOtpSent}
                        className="px-4 py-2.5 bg-[#0E3E31] hover:bg-[#0B3026] disabled:bg-[#0E3E31]/20 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        {forgotOtpSent ? 'Sent ✓' : 'Send Code'}
                      </button>
                    </div>
                  </div>

                  {forgotOtpSent && (
                    <>
                      <div className="space-y-1 animate-in fade-in duration-200">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Verification Code (OTP)</label>
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP code"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value)}
                          className="w-full bg-slate-50 border border-[#0E3E31]/30 rounded-xl px-4 py-2.5 text-xs text-slate-805 font-mono text-center tracking-widest placeholder-slate-400 focus:border-[#0E3E31] outline-none transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1 animate-in fade-in duration-200">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type={showForgotPass ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={forgotNewPass}
                            onChange={(e) => setForgotNewPass(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0E3E31]/50 focus:bg-white outline-none transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowForgotPass(!showForgotPass)}
                            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-850 text-xs font-bold"
                          >
                            {showForgotPass ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={formLoading || !forgotOtpSent}
                  className="w-full py-3 bg-[#0E3E31] hover:bg-[#0B3026] disabled:bg-[#0E3E31]/50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-[#0E3E31]/10 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {formLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Reset Password & Log In
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-[10px] font-black text-[#0E3E31] hover:text-[#0B3026] transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🔐 Google Account Confirmation Modal */}
      <AnimatePresence>
        {showGoogleConfirmModal && googleProfile && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowGoogleConfirmModal(false);
                setShowAuthModal(true);
              }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl z-10 text-center flex flex-col items-center"
            >
              {/* Decorative Subtle Background Glow */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">
                Continue with this account?
              </h3>

              {/* Avatar Circle with Ring */}
              <div className="relative mb-4 group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative h-20 w-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-50">
                  <img
                    src={googleProfile.picture}
                    alt={googleProfile.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                    }}
                  />
                </div>
              </div>

              {/* User details */}
              <div className="space-y-1 mb-6">
                <h4 className="text-sm font-black text-slate-800 leading-snug">
                  {googleProfile.name}
                </h4>
                <p className="text-xs text-[#4F46E5] font-bold">
                  {googleProfile.email}
                </p>
              </div>

              {/* Informative Description */}
              <p className="text-xs text-slate-550 font-bold leading-relaxed mb-8 max-w-xs">
                You are about to sign in to StudyCircle using this Google account.
              </p>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleConfirmModal(false);
                    setShowAuthModal(true);
                    setGoogleCredential(null);
                    setGoogleProfile(null);
                    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
                      (window as any).google.accounts.id.prompt();
                    }
                  }}
                  className="py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#475569] text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.98] font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (googleCredential) {
                      setShowGoogleConfirmModal(false);
                      await handleGoogleInitiate(googleCredential);
                    }
                  }}
                  className="py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[#4F46E5]/20 active:scale-[0.98] border-none font-bold"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── BUG FIX #3 — Profile Edit Modal ── */}
      {showProfileEdit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            onClick={() => setShowProfileEdit(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl z-10 text-left animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowProfileEdit(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer text-lg p-2 rounded-xl hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex h-10 w-10 rounded-full bg-[#E6F2ED] border border-[#0E3E31]/10 text-[#0E3E31] items-center justify-center">
                <Edit3 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-sans">Edit Profile</h3>
              <p className="text-xs text-slate-500 font-semibold">Update your display name</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">First Name</label>
                <input
                  type="text"
                  placeholder="Your first name"
                  value={profileFirstName}
                  onChange={(e) => setProfileFirstName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0E3E31]/50 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                <input
                  type="text"
                  placeholder="Your last name"
                  value={profileLastName}
                  onChange={(e) => setProfileLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-805 placeholder-slate-400 focus:border-[#0E3E31]/50 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div className="p-3 bg-[#E6F2ED]/60 border border-[#0E3E31]/10 rounded-xl text-[10px] text-slate-600 font-semibold">
                Username and contact information cannot be changed here. Contact support if needed.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileEdit(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 py-2.5 bg-[#0E3E31] hover:bg-[#0B3026] disabled:opacity-60 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#0E3E31]/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {profileSaving && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📬 Floating developer Mock Inbox trigger */}
      {false && isDevMode && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <button
            onClick={() => setShowInbox(!showInbox)}
            className="h-14 w-14 rounded-full bg-white hover:bg-slate-50 border-2 border-[#0E3E31]/30 hover:border-[#0E3E31]/65 text-[#0E3E31] flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer relative group animate-bounce"
            title="Open Mock Inbox"
          >
            <Mail className="h-6 w-6 text-[#0E3E31] group-hover:scale-110 transition-transform" />
            {unreadInboxCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-rose-500 border border-white text-[10px] font-black text-white flex items-center justify-center shrink-0 shadow-md">
                {unreadInboxCount}
              </span>
            )}
            <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all duration-150 origin-right bg-white border border-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl whitespace-nowrap shadow-xl">
              Developer Mock Inbox ({unreadInboxCount})
            </span>
          </button>
        </div>
      )}

      {/* 📬 Developer Mock Inbox Side Drawer */}
      {false && showInbox && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div 
            onClick={() => setShowInbox(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />
          
          <div className="relative w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col backdrop-blur-lg animate-in slide-in-from-right duration-300 z-10 text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-[#E6F2ED] border border-[#0E3E31]/10 text-[#0E3E31] flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Developer Mock Inbox</h3>
                  <p className="text-[9px] text-slate-500 font-semibold font-sans">Simulating email receipts for local debugging</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInbox(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer text-sm p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {inboxEmails.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16 opacity-60">
                  <div className="h-12 w-12 rounded-full border border-dashed border-slate-350 flex items-center justify-center text-slate-400 text-lg">
                    📬
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800">No Emails Received Yet</p>
                    <p className="text-[10px] text-slate-500 leading-normal max-w-[200px] font-semibold">Send an OTP from a gate (student, mentor, admin, or reset) to capture email payloads here.</p>
                  </div>
                </div>
              ) : (
                inboxEmails.map((email: any) => (
                  <div 
                    key={email.id}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 shadow-sm hover:border-[#0E3E31]/25 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-[9px] font-black uppercase text-[#0E3E31]">Recipient</span>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[220px]">{email.to}</h4>
                      </div>
                      <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">{email.createdAt}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-[#0E3E31]">Subject</span>
                      <p className="text-xs font-extrabold text-slate-805">{email.subject}</p>
                    </div>

                    <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-2">
                      <span className="text-[9px] font-black uppercase text-[#0E3E31] block">Message Body</span>
                      <p className="text-[10px] text-slate-650 font-mono leading-relaxed whitespace-pre-line">{email.body}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1.5 rounded-xl text-xs font-mono font-black">
                        OTP: {email.otp}
                      </div>
                      <button
                        onClick={() => handleAutofillOtp(email)}
                        className="px-3 py-1.5 bg-[#0E3E31] hover:bg-[#0B3026] text-white border border-[#0E3E31]/10 text-[10px] font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-[#0E3E31]/10"
                      >
                        Autofill OTP
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-slate-150 bg-slate-50 flex items-center justify-between gap-4">
              <button
                onClick={fetchMockInbox}
                className="flex-1 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-xl transition-all cursor-pointer text-center"
              >
                Refresh Inbox
              </button>
              <button
                onClick={async () => {
                  try {
                    await apiRequest('/auth/clear-mock-inbox', { method: 'POST' });
                    setInboxEmails([]);
                    setUnreadInboxCount(0);
                    showToast('Developer Mock Inbox cleared successfully.', 'success');
                  } catch (err) {
                    console.error('Error clearing mock inbox:', err);
                    showToast('Failed to clear inbox on the server.', 'error');
                  }
                }}
                className="py-2 px-4 hover:text-rose-400 text-slate-500 text-[10px] font-bold transition-all cursor-pointer"
              >
                Clear View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ Google OAuth Diagnostics Modal */}
      {showOauthDiagnostics && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            onClick={() => setShowOauthDiagnostics(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />
          
          <div className="relative w-full max-w-2xl bg-[#0B0D13]/95 border border-slate-800 rounded-3xl p-8 shadow-2xl z-10 text-left overflow-y-auto max-h-[90vh] text-zinc-150">
            <button 
              onClick={() => setShowOauthDiagnostics(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer text-lg p-2 rounded-xl hover:bg-slate-900"
            >
              ✕
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Google OAuth Diagnostics Center</h3>
                  <p className="text-[11px] text-zinc-400">Audit environment variables, format requirements, and Authorized Origins</p>
                </div>
              </div>

              {/* Environment Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Environment Details</span>
                  <div className="space-y-1.5 text-xs">
                    <p className="flex justify-between text-zinc-300">
                      <span>Detected Framework:</span>
                      <span className="font-bold text-emerald-400">{getFrameworkType()}</span>
                    </p>
                    <p className="flex justify-between text-zinc-300">
                      <span>Deployment Mode:</span>
                      <span className="font-bold text-indigo-400">{isDevMode ? "Local Development" : "Production / Vercel"}</span>
                    </p>
                    <p className="flex justify-between text-zinc-300">
                      <span>Google Provider Status:</span>
                      <span className="font-bold text-emerald-400">Safe Initialized</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Active JavaScript Origin</span>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-zinc-300 break-all bg-slate-950 p-2 rounded-xl font-mono text-[10px] border border-slate-900/80">
                      {typeof window !== 'undefined' ? window.location.origin : "https://studycircle-v2-frontend-standalone.vercel.app"}
                    </p>
                    <p className="text-[9px] text-zinc-400 italic">
                      This exact origin URL must be added to Google Cloud Console.
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnostic Checklist */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Audit Results</span>
                
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-900/80 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-900/60 pb-2">
                    <span className="text-zinc-400">Framework:</span>
                    <span className="font-bold text-white">{getFrameworkType()}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-900/60 pb-2">
                    <span className="text-zinc-400">NEXT_PUBLIC_GOOGLE_CLIENT_ID:</span>
                    {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                      <span className="font-bold text-emerald-400">Found</span>
                    ) : (
                      <span className="font-bold text-rose-400">Missing</span>
                    )}
                  </div>

                  <div className="flex justify-between border-b border-slate-900/60 pb-2">
                    <span className="text-zinc-400">VITE_GOOGLE_CLIENT_ID:</span>
                    {process.env.VITE_GOOGLE_CLIENT_ID ? (
                      <span className="font-bold text-emerald-400">Found</span>
                    ) : (
                      <span className="font-bold text-zinc-500">Missing (OK)</span>
                    )}
                  </div>

                  <div className="flex justify-between border-b border-slate-900/60 pb-2">
                    <span className="text-zinc-400">Resolved Client ID:</span>
                    {(() => {
                      const resolvedId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
                      if (!resolvedId) {
                        return <span className="font-bold text-rose-400">Missing</span>;
                      }
                      
                      // Mask client ID (e.g. 1234567890-abc...xyz.apps.googleusercontent.com)
                      const parts = resolvedId.split("-");
                      const prefix = parts[0] || "";
                      const suffix = resolvedId.endsWith(".apps.googleusercontent.com") ? "apps.googleusercontent.com" : "";
                      const rest = resolvedId.replace(prefix, "").replace(suffix, "");
                      const maskedRest = rest.length > 6 ? rest.substring(0, 4) + "..." + rest.substring(rest.length - 4) : "...";
                      
                      return (
                        <span className="font-mono text-zinc-300 select-all truncate max-w-[280px]">
                          {prefix}{maskedRest}{suffix ? `-${suffix}` : ""}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex justify-between border-b border-slate-900/60 pb-2">
                    <span className="text-zinc-400">Origin:</span>
                    <span className="font-mono text-zinc-300 break-all truncate max-w-[280px]">
                      {typeof window !== 'undefined' ? window.location.origin : ""}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-400">Format Valid:</span>
                    {(() => {
                      const resolvedId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
                      const isPresent = resolvedId !== "";
                      const isPlaceholder = resolvedId.includes("dummy") || resolvedId.includes("YOUR_REAL_CLIENT_ID") || resolvedId.includes("xxxxxxxx");
                      const isValidSuffix = resolvedId.endsWith(".apps.googleusercontent.com");
                      
                      if (isPresent && !isPlaceholder && isValidSuffix) {
                        return <span className="font-bold text-emerald-400">Yes</span>;
                      }
                      return <span className="font-bold text-rose-400">No</span>;
                    })()}
                  </div>
                </div>
              </div>

              {/* Troubleshooting steps */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Troubleshooting Google Console Setup</span>
                
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl space-y-3.5 text-xs text-zinc-300">
                  <div className="space-y-1">
                    <p className="font-bold text-white flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] font-black text-zinc-300">1</span>
                      Vercel Dashboard Environment Settings
                    </p>
                    <p className="text-[11px] text-zinc-400 pl-6 leading-relaxed">
                      Go to **Vercel → Project Settings → Environment Variables** and add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>. Verify it is set for **Production**, **Preview**, and **Development** scopes. You must redeploy the project for Vercel to inject it.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-white flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] font-black text-zinc-300">2</span>
                      Authorized JavaScript Origins Configuration
                    </p>
                    <div className="text-[11px] text-zinc-400 pl-6 leading-relaxed space-y-1.5">
                      <p>
                        In your **Google Cloud Console**, go to **APIs & Services → Credentials**. Open your Web client ID and verify your deployment URL is listed in **Authorized JavaScript Origins** exactly:
                      </p>
                      <code className="block p-2 bg-slate-950 rounded border border-slate-900 font-mono text-[10px] select-all break-all text-amber-300">
                        {typeof window !== 'undefined' ? window.location.origin : "https://studycircle-v2-frontend-standalone.vercel.app"}
                      </code>
                      <p className="text-[10px] text-zinc-500 font-medium">⚠️ Important: Make sure there is no trailing slash (/) at the end of the origin URL.</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-white flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] font-black text-zinc-300">3</span>
                      OAuth Consent Screen & ID Integrity
                    </p>
                    <p className="text-[11px] text-zinc-400 pl-6 leading-relaxed">
                      - Verify that the **OAuth Consent Screen** app status is either **"In production"** or has your current email registered under **"Test Users"**.
                      <br />- Ensure that the Client ID in Vercel exactly matches the Client ID in the Google Cloud Console and has not been deleted or disabled.
                    </p>
                  </div>
                </div>
              </div>

              {isDevMode && (
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider">Local Sandbox Test Environment</span>
                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl space-y-3.5 text-xs text-zinc-300">
                    <p className="text-[11px] text-zinc-400">
                      You can test the exact two-step Google Authentication experience locally using our OAuth sandbox simulator. This generates a mock JWT token and displays the custom StudyCircle confirmation modal.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOauthDiagnostics(false);
                        const mockCredential = 'mock_google_credential_token:swathi.hani@studycircle.com:Swathi Hani:female';
                        setGoogleCredential(mockCredential);
                        setGoogleProfile({
                          name: 'Swathi Hani',
                          email: 'swathi.hani@studycircle.com',
                          picture: '/swathi-avatar.png'
                        });
                        setShowGoogleConfirmModal(true);
                        showToast('Sandbox mode: Mock Google credentials generated.', 'info');
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-[#0F172A] text-xs font-black rounded-xl cursor-pointer transition-all text-center border-none font-bold"
                    >
                      Launch Sandbox Google Login
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setShowOauthDiagnostics(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-800/80 active:scale-[0.99] text-white text-xs font-black rounded-xl cursor-pointer transition-all text-center font-bold"
                >
                  Close Diagnostics
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
