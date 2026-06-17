'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { apiRequest } from './utils/api';
import { useApp } from './context/AppContext';
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
  BookOpen,
  Sun,
  Sunset,
  Moon,
  Edit3,
  Play,
  MessageSquare
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [shouldHideContent, setShouldHideContent] = useState(false);

  const { user: currentUser, setUser: setCurrentUser, loading: globalLoading } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [activePortal, setActivePortal] = useState<'student' | 'mentor'>('student');
  const [regRole, setRegRole] = useState<'student' | 'mentor'>('student');
  const [showAuthModal, setShowAuthModal] = useState(false);

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
        fetchMockInbox();
        const interval = setInterval(fetchMockInbox, 2000);
        return () => clearInterval(interval);
      }
    }
  }, [globalLoading, fetchMockInbox]);

  // Keep redirect in its own effect — runs only when user actually
  // exists after context is fully resolved. No flash.
  useEffect(() => {
    if (currentUser) {
      setShouldHideContent(true);
    }
    if (!globalLoading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, globalLoading, router]);

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
      setCurrentUser(data.user, data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('saved_login_user', studentUser.trim());
        localStorage.setItem('saved_login_pass', studentPass);
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
        setCurrentUser(data.user, data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('saved_login_user', mentorUser.trim());
          localStorage.setItem('saved_login_pass', mentorPass);
        }
        showToast('Approved automatically. Redirecting...', 'success');
        setShowAuthModal(false);
        router.push('/dashboard');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('saved_login_user', mentorUser.trim());
          localStorage.setItem('saved_login_pass', mentorPass);
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
        setCurrentUser(data.user, data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('saved_login_user', adminUser.trim());
          localStorage.setItem('saved_login_pass', adminPass);
        }
        showToast('Approved automatically. Redirecting...', 'success');
        router.push('/dashboard');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('saved_login_user', adminUser.trim());
          localStorage.setItem('saved_login_pass', adminPass);
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

  // Google Sign-In Success Handler
  const handleGoogleSuccess = async (credential: string | undefined) => {
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
      setShowAuthModal(false);
      router.push('/dashboard');
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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ─────────────────────────────────────────────
  // BUG FIX #1 — No separate `loading` state
  // Show spinner while globalLoading is true.
  // This avoids the double-render glitch.
  // ─────────────────────────────────────────────
  if (globalLoading || shouldHideContent) {
    return (
      <div className="min-h-screen bg-[#FAFCFB] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-[#0E3E31] animate-spin" />
      </div>
    );
  }

  // Greeting icon component
  const GreetingIcon = () => {
    const size = "h-4 w-4";
    if (greeting.icon === 'sun') return <Sun className={`${size} text-amber-500`} />;
    if (greeting.icon === 'sunset') return <Sunset className={`${size} text-orange-500`} />;
    return <Moon className={`${size} text-[#0E3E31]`} />;
  };

  return (
    <div className="min-h-screen bg-[#FAFCFB] text-slate-850 flex flex-col relative overflow-hidden font-sans antialiased">
      
      {/* 🔔 Sliding Email Notification Banner */}
      {false && isDevMode && activeNotification && (
        <div className="fixed top-20 right-6 z-[10000] max-w-sm w-full bg-white/95 border border-slate-200 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 pointer-events-auto flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-full bg-[#E6F2ED] border border-[#0E3E31]/20 text-[#0E3E31] flex items-center justify-center shrink-0 animate-bounce">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-[#0E3E31]">New Email Received</span>
              <button 
                onClick={() => setActiveNotification(null)}
                className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
            <h4 className="text-xs font-black text-slate-900">{activeNotification.subject}</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              To: <span className="text-[#0E3E31]">{activeNotification.to}</span>
            </p>
            <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-650">OTP Code: <strong className="text-rose-600 font-extrabold">{activeNotification.otp}</strong></span>
              <span className="text-[9px] font-extrabold uppercase bg-emerald-50/80 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded">Auto Filled</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 1. Header Navbar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all duration-300 shadow-sm shadow-slate-100/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => router.push('/')}>
            <div className="relative h-10 w-10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0E3E31] via-[#D5EAE2] to-[#F59E0B] opacity-90 shadow-[0_0_15px_rgba(14,62,49,0.15)] animate-pulse" />
              <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center font-bold">
                <BookOpen className="h-4.5 w-4.5 text-[#0E3E31] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <span className="font-black text-lg tracking-tight text-[#0E3E31] font-sans">
              StudyCircle
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600 tracking-wider">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="relative hover:text-[#0E3E31] transition-colors cursor-pointer py-1 group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0E3E31] transition-all group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection('features-section')} className="relative hover:text-[#0E3E31] transition-colors cursor-pointer py-1 group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0E3E31] transition-all group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection('lobby-section')} className="relative hover:text-[#0E3E31] transition-colors cursor-pointer py-1 group">
              Explore
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0E3E31] transition-all group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection('about-section')} className="relative hover:text-[#0E3E31] transition-colors cursor-pointer py-1 group">
              How it Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0E3E31] transition-all group-hover:w-full" />
            </button>
            <button onClick={() => scrollToSection('faq-section')} className="relative hover:text-[#0E3E31] transition-colors cursor-pointer py-1 group">
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0E3E31] transition-all group-hover:w-full" />
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-[#0E3E31]/40 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-[#0E3E31] hover:bg-[#0B3026] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#0E3E31]/10 cursor-pointer"
                >
                  Dashboard <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold transition-all cursor-pointer rounded-xl hover:bg-slate-50"
                >
                  Log in
                </button>
                <button 
                  onClick={() => router.push('/register')}
                  className="px-4 py-2 bg-[#0E3E31] hover:bg-[#0B3026] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0E3E31]/10 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col bg-[#FAFCFB]">

        {/* ── Time-based greeting banner (visible when logged in) ── */}
        {currentUser && (
          <div className="w-full bg-[#E6F2ED] border-b border-[#0E3E31]/10 py-3">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-2.5">
              <GreetingIcon />
              <span className="text-sm font-extrabold text-slate-800">{greeting.label}, {currentUser.firstName || currentUser.fullName}!</span>
              <span className="text-xs text-slate-650 font-medium hidden sm:inline">— Ready to study today?</span>
            </div>
          </div>
        )}

        {/* ── Time-based greeting also in My Learning Space section ── */}
        {currentUser && (
          <section className="bg-white border-b border-slate-100 py-6">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0E3E31] mb-1">
                    <Sparkles className="h-3 w-3" />
                    My Learning Space
                  </div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <GreetingIcon />
                    {greeting.label}, {currentUser.firstName || currentUser.fullName}!
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Here's your study overview for today.</p>
                </div>
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-[#0E3E31]/40 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              </div>
            </div>
          </section>
        )}
        
        {/* 2. Hero Section */}
        <section className="bg-[#FAFCFB] relative overflow-hidden pt-12 pb-16">
          <style>{`
            @keyframes bounce-subtle {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-bounce-subtle {
              animation: bounce-subtle 4s ease-in-out infinite;
            }
          `}</style>

          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center text-left relative z-10">
            {/* Left Content Column */}
            <div className="md:col-span-6 space-y-6 md:pr-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#E6F2ED] text-[#0E3E31] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#E6F2ED]">
                <Sparkles className="h-3 w-3 text-[#0E3E31]" /> A collaborative learning workspace for every student
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1A2530] tracking-tight leading-[1.12]">
                Study together. <br />
                <span className="text-[#0E3E31]">Achieve together.</span>
              </h1>
              
              <p className="text-xs md:text-sm text-slate-550 leading-relaxed font-bold max-w-lg">
                Join study rooms, share notes, solve doubts, schedule sessions and track your progress — all in one place.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => router.push('/register')}
                  className="px-6 py-3.5 bg-[#0E3E31] hover:bg-[#0B3026] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-[#0E3E31]/10 flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  Get Started — It's Free <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollToSection('features-section')}
                  className="px-6 py-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  Explore Features <Play className="h-3 w-3 text-[#0E3E31] fill-[#0E3E31]" />
                </button>
              </div>

              {/* Loved by stack */}
              <div className="flex items-center gap-3 pt-4 select-none">
                <div className="flex -space-x-2.5 overflow-hidden">
                  {['/charan-avatar.png', '/karthik-avatar.png', '/bhagya-avatar.png', '/rathna-avatar.png', '/swathi-avatar.png'].map((src, i) => (
                    <img 
                      key={i} 
                      className="inline-block h-8.5 w-8.5 rounded-full ring-2 ring-white object-cover object-center bg-slate-100" 
                      src={src} 
                      alt="Student user avatar" 
                    />
                  ))}
                </div>
                
                {/* Hand drawn curvy arrow */}
                <svg className="w-10 h-6 text-slate-400 stroke-current fill-none shrink-0" viewBox="0 0 50 24">
                  <path d="M2,2 C12,18 28,18 42,6" strokeWidth="2" strokeDasharray="3,3" />
                  <path d="M36,5 L44,5 L42,12" strokeWidth="2" />
                </svg>

                <div className="text-left leading-tight">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Loved by 10,000+</div>
                  <div className="text-[10px] font-bold text-slate-400">students across India</div>
                </div>
              </div>
            </div>

            {/* Right Mockup Model Column */}
            <div className="md:col-span-6 relative flex items-center justify-center py-8">
              {/* Back Circle Mint Backdrop */}
              <div className="absolute w-[360px] h-[360px] md:w-[440px] md:h-[440px] bg-[#E6F2ED] rounded-full -z-10" />

              {/* Potted Plant & Stack of Books */}
              <div className="absolute left-[-20px] bottom-[30px] z-10 flex flex-col items-center select-none scale-[0.75] origin-bottom-left">
                {/* Plant leaves */}
                <div className="relative w-24 h-24 flex items-end justify-center">
                  <div className="absolute bottom-1 w-8 h-16 bg-[#0E4A3A] rounded-t-full rotate-[-35deg] origin-bottom shadow-sm" />
                  <div className="absolute bottom-1 w-10 h-18 bg-[#1B5E20] rounded-t-full rotate-[-15deg] origin-bottom shadow-sm" />
                  <div className="absolute bottom-1 w-9 h-20 bg-[#0E3E31] rounded-t-full rotate-[15deg] origin-bottom shadow-sm" />
                  <div className="absolute bottom-1 w-8 h-15 bg-[#2E7D32] rounded-t-full rotate-[40deg] origin-bottom shadow-sm" />
                </div>
                {/* White Pot */}
                <div className="w-16 h-12 bg-white border border-slate-200 rounded-b-2xl rounded-t shadow-md flex items-center justify-center">
                  <div className="w-full h-1 bg-slate-100 rounded-t" />
                </div>
                {/* Books Stack */}
                <div className="w-24 h-4 bg-amber-100 border border-amber-200 rounded shadow-sm mt-1" />
                <div className="w-22 h-4 bg-[#D5EAE2] border border-emerald-200 rounded shadow-sm" />
              </div>

              {/* Laptop Body Container */}
              <div className="flex flex-col items-center relative z-20">
                {/* Screen bezel */}
                <div className="relative border-[8px] border-slate-800 bg-slate-900 rounded-t-2xl shadow-xl w-[320px] md:w-[420px] aspect-[16/10] overflow-hidden flex flex-col text-slate-800 text-left select-none">
                  {/* Laptop OS Content Mockup */}
                  <div className="w-full h-full bg-[#FAFCFB] flex text-[8px] font-semibold p-1 gap-1">
                    {/* Mock sidebar */}
                    <div className="w-[45px] border-r border-slate-200/60 flex flex-col gap-1 py-1 px-0.5 shrink-0 text-left scale-[0.9] origin-left bg-slate-50">
                      <div className="px-1 text-[#0E3E31] font-black uppercase text-[6px] tracking-wide mt-1">Workspace</div>
                      <div className="px-1 py-0.5 text-[#0E3E31] font-bold bg-[#E6F2ED] rounded flex items-center gap-1">🏠 Dashboard</div>
                      <div className="px-1 py-0.5 text-slate-500 rounded flex items-center gap-1">📝 Notes</div>
                      <div className="px-1 py-0.5 text-slate-500 rounded flex items-center gap-1">📅 Schedules</div>
                      <div className="px-1 py-0.5 text-slate-500 rounded flex items-center gap-1">🏆 Leaderboard</div>
                    </div>
                    
                    {/* Mock main dashboard view */}
                    <div className="flex-1 flex flex-col gap-1.5 p-1 text-slate-700">
                      {/* Greeting banner */}
                      <div className="p-2 bg-white border border-slate-150 rounded-lg shadow-sm">
                        <div className="text-[8px] font-extrabold text-slate-800">Welcome back, Swathi! 👋</div>
                        <div className="text-[6px] text-slate-400">Here's what's happening in your circle today.</div>
                      </div>

                      {/* Stats cols */}
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: 'Study Rooms', val: '12 Active' },
                          { label: 'Notes Shared', val: '34 This Wk' },
                          { label: 'Doubts Solved', val: '56 This Wk' },
                          { label: 'Study Streak', val: '7 Days' }
                        ].map((s, idx) => (
                          <div key={idx} className="p-1.5 bg-slate-50 border border-slate-150 rounded text-center">
                            <div className="text-[5px] uppercase font-bold text-slate-400 leading-none">{s.label}</div>
                            <div className="text-[7px] font-black text-[#0E3E31] mt-0.5 leading-none">{s.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Sessions lists */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-1.5 bg-white border border-slate-150 rounded-lg flex flex-col justify-between h-14">
                          <div>
                            <div className="text-[5px] uppercase font-bold text-slate-400 leading-none">Upcoming sessions</div>
                            <div className="font-extrabold text-[7px] text-slate-800 mt-1 truncate">DSA Study Session</div>
                            <div className="text-[5px] text-[#0E3E31] mt-0.5">Today, 7:30 PM</div>
                          </div>
                          <button className="py-0.5 px-1 bg-[#0E3E31] text-white rounded text-[5px] font-extrabold cursor-pointer self-start">Join</button>
                        </div>
                        
                        <div className="p-1.5 bg-white border border-slate-150 rounded-lg h-14 flex flex-col justify-between">
                          <div>
                            <div className="text-[5px] uppercase font-bold text-slate-400 leading-none">Recent Activity</div>
                            <div className="text-slate-650 font-bold text-[6px] mt-0.5 truncate flex items-center gap-0.5">
                              <span className="h-1.5 w-1.5 bg-[#0E3E31] rounded-full shrink-0" /> Rahul shared a note
                            </div>
                            <div className="text-slate-650 font-bold text-[6px] mt-0.5 truncate flex items-center gap-0.5">
                              <span className="h-1.5 w-1.5 bg-[#0E3E31] rounded-full shrink-0" /> Ananya solved doubt
                            </div>
                          </div>
                          <div className="text-[5px] text-slate-400 mt-1">View all activity</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keyboard base */}
                <div className="w-[350px] md:w-[460px] h-3 bg-slate-700 rounded-b-2xl shadow-lg border-t border-slate-600 relative z-30 flex justify-center">
                  <div className="w-20 h-1 bg-slate-950 rounded-b" />
                </div>
              </div>

              {/* Mobile Phone Mockup Overlay */}
              <div className="absolute right-[-10px] bottom-[10px] w-[115px] md:w-[130px] aspect-[9/19] bg-slate-950 border-[5px] border-slate-850 rounded-[28px] shadow-2xl overflow-hidden z-40 text-slate-800 flex flex-col text-left select-none scale-[0.95] origin-bottom-right">
                <div className="w-full h-full bg-[#FAFCFB] p-2 text-[6px] flex flex-col justify-between font-semibold">
                  <div className="space-y-2">
                    <div className="border-b border-slate-200 pb-1 flex justify-between items-center font-bold text-[7px] text-[#0E3E31]">
                      <span>← Doubt Board</span>
                      <span>🔍</span>
                    </div>

                    <div className="space-y-1.5 mt-1">
                      <div className="p-1 bg-white border border-slate-200 rounded-md">
                        <div className="font-extrabold text-[6px] text-slate-800">How to optimize nested loops?</div>
                        <div className="text-[5px] text-slate-400 mt-0.5">2 answers • DSA</div>
                      </div>
                      
                      <div className="p-1 bg-white border border-slate-200 rounded-md">
                        <div className="font-extrabold text-[6px] text-slate-800">Confusion in normalization</div>
                        <div className="text-[5px] text-slate-400 mt-0.5">5 answers • DBMS</div>
                      </div>

                      <div className="p-1 bg-white border border-slate-200 rounded-md">
                        <div className="font-extrabold text-[6px] text-slate-800">Why is state async?</div>
                        <div className="text-[5px] text-slate-400 mt-0.5">3 answers • Web Dev</div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-1 bg-[#0E3E31] text-white text-[6px] font-bold rounded-lg cursor-pointer text-center select-none shadow-sm shadow-[#0E3E31]/10">Ask a Doubt</button>
                </div>
              </div>

              {/* Coffee Mug sitting on desk */}
              <div className="absolute right-[-55px] bottom-[15px] z-30 flex items-end select-none scale-[0.8] origin-bottom-right">
                {/* Handle */}
                <div className="w-5 h-9 border-4 border-[#0E3E31] rounded-l-full rotate-180 translate-x-[4px] self-center" />
                {/* Body */}
                <div className="w-12 h-14 bg-[#0E3E31] rounded-b-xl rounded-t-sm shadow-md flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white/30" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features Grid */}
        <section id="features-section" className="bg-[#FAFCFB] py-12 text-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-md shadow-slate-150/15">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 text-left">
                {[
                  { icon: Users, title: 'Study Rooms', desc: 'Join or create live rooms and study together in real-time.', bg: '#EBF5F1', text: '#0E3E31' },
                  { icon: FileText, title: 'Shared Notes', desc: 'Upload, organize and access notes shared by your circle.', bg: '#EBF5F1', text: '#0E3E31' },
                  { icon: HelpCircle, title: 'Doubt Board', desc: 'Ask questions, get answers and clear your doubts.', bg: '#FFF5F0', text: '#F97316' },
                  { icon: Calendar, title: 'Session Schedule', desc: 'Plan and join study sessions that keep you consistent.', bg: '#EBF5F1', text: '#0E3E31' },
                  { icon: Award, title: 'Leaderboard', desc: 'Track your progress, earn points and stay motivated.', bg: '#FFF9F0', text: '#F59E0B' },
                  { icon: MessageSquare, title: 'Group Chats', desc: 'Chat with your circle and stay connected always.', bg: '#EBF5F1', text: '#0E3E31' }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className={`space-y-3 ${i === 0 ? '' : 'pt-4 lg:pt-0 lg:pl-6'}`}>
                      <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: item.bg }}>
                        <Icon className="h-5 w-5" style={{ color: item.text }} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Services Section */}
        <section id="services-section" className="bg-white py-20 relative overflow-hidden border-b border-slate-100">
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E6F2ED]/40 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center relative z-10 text-left">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0E3E31]">OUR SERVICES</span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                All the tools you need <br />
                to <span className="text-[#0E3E31]">grow together.</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-bold">
                StudyCircle provides a focused and structured environment for students to collaborate, share knowledge, track progress, and achieve their academic goals — together.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => router.push('/register')}
                  className="px-6 py-3 bg-[#0E3E31] hover:bg-[#0B3026] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-[#0E3E31]/10 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  Join StudyCircle <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-500 pt-4 border-t border-slate-100">
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-[#0E3E31]" /> Secure Login</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-[#0E3E31]" /> Role Based Access</span>
                <span className="flex items-center gap-1"><Bell className="h-3.5 w-3.5 text-[#0E3E31]" /> Smart Notifications</span>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-center py-6">
              <div className="relative w-full max-w-[480px]">
                <div className="relative border-[8px] border-slate-200 bg-slate-100 rounded-2xl shadow-2xl overflow-hidden aspect-[16/10] w-[90%] z-10">
                  <div className="w-full h-full bg-[#FAFCFB] text-slate-700 flex text-[9px] font-semibold select-none p-1 gap-1.5 border border-slate-200">
                    <div className="w-[65px] border-r border-slate-250 flex flex-col gap-1 py-1 px-0.5 shrink-0 text-left scale-[0.9] origin-left">
                      <div className="h-4 w-full bg-[#E6F2ED] border border-[#0E3E31]/20 text-[#0E3E31] text-[8px] font-bold rounded flex items-center gap-1 px-1 mb-1">📚 Lounge</div>
                      <div className="px-1 text-slate-400 font-bold uppercase text-[7px] tracking-wide mt-1">Workspace</div>
                      <div className="px-1 py-0.5 text-[#0E3E31] font-bold bg-slate-200/50 rounded flex items-center gap-1">🏠 Dashboard</div>
                      <div className="px-1 py-0.5 text-slate-500 rounded flex items-center gap-1">📝 Notes</div>
                      <div className="px-1 py-0.5 text-slate-500 rounded flex items-center gap-1">📅 Schedules</div>
                      <div className="px-1 py-0.5 text-slate-500 rounded flex items-center gap-1">🏆 Leaderboard</div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2 p-1.5 text-left text-[8px]">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-sm">
                        <div>
                          <div className="text-[9px] font-bold text-slate-800 leading-tight">Welcome, Study Buddies</div>
                          <div className="text-[7px] text-slate-450 leading-tight">AP & Telangana Cluster</div>
                        </div>
                        <div className="text-[9px] text-[#0E3E31] font-bold shrink-0">🔥 5 Day Streak</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex flex-col justify-between h-20 shadow-sm">
                          <div>
                            <div className="text-[7px] uppercase font-bold tracking-wider text-slate-400">Upcoming session</div>
                            <div className="text-slate-800 font-extrabold text-[8px] mt-0.5 truncate leading-tight">Data Structures</div>
                            <div className="text-[7px] text-slate-500 mt-0.5 font-mono">Today, 7:30 PM</div>
                          </div>
                          <button className="py-0.5 px-2 bg-[#0E3E31] text-white rounded text-[7px] font-extrabold cursor-pointer self-start leading-normal">Join Room</button>
                        </div>
                        
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg h-20 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="text-[7px] uppercase font-bold tracking-wider text-slate-400">Study Progress</div>
                            <div className="text-[#0E3E31] font-extrabold text-[9px] mt-0.5">12.5 hrs</div>
                          </div>
                          <div className="flex items-end gap-1 h-8 pb-1">
                            <div className="bg-[#E6F2ED] w-1.5 h-3 rounded-t" />
                            <div className="bg-[#E6F2ED] w-1.5 h-5 rounded-t" />
                            <div className="bg-[#E6F2ED] w-1.5 h-4 rounded-t" />
                            <div className="bg-[#0E3E31] w-1.5 h-7 rounded-t" />
                            <div className="bg-[#0E3E31] w-1.5 h-6 rounded-t" />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1 shadow-sm">
                        <div className="text-[7px] uppercase font-bold tracking-wider text-slate-450">Recent Notes</div>
                        <div className="flex justify-between items-center text-[7px] text-slate-600 border-b border-slate-100 pb-0.5">
                          <span>DBMS - Normalization</span>
                          <span>by Prasad</span>
                        </div>
                        <div className="flex justify-between items-center text-[7px] text-slate-600">
                          <span>Operating Systems</span>
                          <span>by Swathi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute right-0 bottom-[-15px] border-[5px] border-slate-300 bg-white rounded-[24px] shadow-2xl overflow-hidden aspect-[9/19] w-[130px] z-20">
                  <div className="w-full h-full bg-[#FAFCFB] text-slate-800 p-2 text-[7px] select-none flex flex-col justify-between text-left border border-slate-200 rounded-[20px]">
                    <div className="space-y-2">
                      <div className="border-b border-slate-200 pb-1 flex justify-between items-center">
                        <span className="font-bold text-[8px] text-[#0E3E31]">Live Room</span>
                        <span className="text-[6px] text-emerald-600 font-bold uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                          <span className="h-1 w-1 bg-emerald-500 rounded-full" /> Live
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {['Swathi', 'Shreya', 'Sridhar'].map((name) => (
                          <div key={name} className="flex items-center justify-between text-[7px] text-slate-600">
                            <span className="truncate flex items-center gap-1">
                              <span className="h-4 w-4 bg-slate-100 border border-slate-200 rounded-full text-[6px] flex items-center justify-center font-bold text-slate-700">{name[0]}</span> {name}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-[7px] text-slate-600">
                          <span className="truncate flex items-center gap-1"><span className="h-4 w-4 bg-slate-100 border border-slate-200 rounded-full text-[6px] flex items-center justify-center font-bold text-slate-700">C</span> Charan</span>
                          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-1 bg-red-600 hover:bg-red-750 text-white text-[7px] font-bold rounded-lg cursor-pointer text-center select-none shadow-sm shadow-red-900/10">End Session</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Public Workspaces Lobby Section */}
        <section id="lobby-section" className="bg-[#FAFCFB] py-16 w-full text-slate-900 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase bg-[#E6F2ED] border border-[#0E3E31]/10 text-[#0E3E31] px-3 py-1 rounded-full tracking-wider">Public Lobbies</span>
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
                <RefreshCw className="h-6 w-6 text-[#0E3E31] animate-spin" />
              </div>
            ) : publicCircles.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-200/60 rounded-3xl">
                <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">No public study circles available at this moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {publicCircles.map((circle) => (
                  <div 
                    key={circle.id}
                    className="group relative p-6 bg-white border border-slate-200/80 hover:border-[#0E3E31]/30 rounded-[24px] transition-all duration-300 flex flex-col justify-between shadow-sm shadow-slate-100/50"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-extrabold uppercase bg-[#E6F2ED] border border-[#0E3E31]/10 text-[#0E3E31] px-2 py-0.5 rounded">
                          Public Lounge
                        </span>
                        <span className="text-[9px] font-bold text-[#F59E0B] font-mono">
                          Code: {circle.inviteCode}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0E3E31] transition-colors">
                          {circle.name}
                        </h4>
                        <div className="text-[10px] text-[#0E3E31] font-bold uppercase tracking-wide">
                          {circle.subject || 'Engineering'}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-semibold">
                          {circle.description || 'Structured study circles, desking presence indicators, and notes lists.'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                        <Users className="h-3.5 w-3.5 text-[#0E3E31]" />
                        <span>Lounge Desk</span>
                      </div>
                      <button
                        onClick={() => joinPublicGroup(circle.id)}
                        disabled={globalLoading}
                        className="px-4 py-2 bg-[#0E3E31] hover:bg-[#0B3026] disabled:opacity-60 text-[10px] font-bold text-white rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-[#0E3E31]/10"
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

        {/* Bottom Stats Ticker Banner */}
        <section className="bg-[#FAFCFB] py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-[#0E3E31] rounded-[32px] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#E6F2ED]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative z-10 text-center items-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                <div className="space-y-1 md:px-4">
                  <div className="text-4xl md:text-5xl font-black tracking-tight text-white">10,000+</div>
                  <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#E6F2ED]">Active Students</div>
                </div>
                <div className="space-y-1 pt-6 md:pt-0 md:px-4">
                  <div className="text-4xl md:text-5xl font-black tracking-tight text-white">50+</div>
                  <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#E6F2ED]">Colleges Connected</div>
                </div>
                <div className="space-y-1 pt-6 md:pt-0 md:px-4">
                  <div className="text-4xl md:text-5xl font-black tracking-tight text-white">150,000+</div>
                  <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#E6F2ED]">Study Hours Logged</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5.5 About Us Section */}
        <section id="about-section" className="bg-white py-20 text-slate-900 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center text-left">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-extrabold uppercase bg-[#E6F2ED] border border-[#0E3E31]/10 text-[#0E3E31] px-3 py-1 rounded-full tracking-wider">ABOUT US</span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                Empowering college campus <br />
                communities to <span className="text-[#0E3E31]">grow together.</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
                StudyCircle is a dedicated virtual workspace designed specifically for engineering and degree college clusters in Andhra Pradesh and Telangana (including Vijayawada, Guntur, Vizag, and Hyderabad).
              </p>
              <p className="text-xs md:text-sm text-slate-650 leading-relaxed font-semibold">
                Our mission is to bridge the gap between solo self-study and collaborative group learning. We provide secure, distraction-free virtual study desks, synchronized document libraries, and dynamic consistency boards to help students stay motivated, track focus hours, and prepare for placement opportunities together.
              </p>
            </div>
            
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              {[
                { icon: Users, bg: 'mint', title: 'Focused Learning', desc: 'Restoring concentration with dedicated live desks, quiet zones, and presence tracking.', bgCol: '#E6F2ED', borderCol: '#0E3E31', textCol: '#0E3E31' },
                { icon: TrendingUp, bg: 'orange', title: 'Peer Motivation', desc: 'Building consistency with streak counters, target hours, and campus leaderboards.', bgCol: '#FFF5F0', borderCol: '#F97316', textCol: '#F97316' },
                { icon: BookOpen, bg: 'amber', title: 'Open Collaboration', desc: 'Instantly sharing blueprints, notes lists, syllabus trackers, and questions.', bgCol: '#FFF9F0', borderCol: '#F59E0B', textCol: '#F59E0B' },
                { icon: Shield, bg: 'mint', title: 'Campus Verification', desc: 'Securing student gates with dynamic OTP verifications and mentor approvals.', bgCol: '#E6F2ED', borderCol: '#0E3E31', textCol: '#0E3E31' },
              ].map(({ icon: Icon, title, desc, bgCol, borderCol, textCol }) => (
                <div key={title} className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-3 hover:scale-[1.02] transition-all shadow-sm hover:border-[#0E3E31]/20">
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: bgCol, border: `1px solid ${borderCol}20` }}>
                    <Icon className="h-5 w-5" style={{ color: textCol }} />
                  </div>
                  <h4 className="text-xs font-black uppercase text-slate-900">{title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5.6 Interactive FAQ Accordion Section */}
        <section id="faq-section" className="bg-[#FAFCFB] py-20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-[#E6F2ED]/30 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 space-y-10 relative z-10">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0E3E31] bg-[#E6F2ED] border border-[#0E3E31]/10 px-3 py-1 rounded-full">FAQ</span>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900">Frequently Asked Questions</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-semibold">Got questions about StudyCircle? Here is everything you need to know about the platform.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What is StudyCircle?",
                  a: "StudyCircle is a dedicated virtual workspace built specifically for engineering and degree college clusters. It helps students join forces, co-study in distraction-free virtual rooms, share syllabus notes, and maintain consistency streaks together."
                },
                {
                  q: "Is it restricted to specific colleges in Andhra Pradesh & Telangana?",
                  a: "While StudyCircle integrates predefined configurations for leading regional institutions (such as VRSEC, PVPSIT, VIT-AP, KL University, RVR&JC, Gitam, AU, JNTU, CBIT, etc.), any student can register and choose 'Other College / University' to set up their custom study workspace."
                },
                {
                  q: "How do Live Study Rooms work?",
                  a: "Live Study Rooms allow you to study quietly alongside peers. It tracks presence and logs your study duration directly to your consistency board. You can mute/unmute audio or video, manage a focal checklist, and prepare for exams without off-task distractions."
                },
                {
                  q: "What is the role of a Mentor on the platform?",
                  a: "Mentors are verified coordinators (often professors or senior leads) who oversee circles. They manage schedules, publish official study material blueprint files, send alerts/nudges to inactive or low-focus students, and maintain campus-level coordinator approvals."
                },
                {
                  q: "Is my session data secured?",
                  a: "Yes. StudyCircle implements secure JSON Web Tokens (JWT) for user sessions, which are securely persisted and validated across browser tabs. In addition, student registrations require verification to maintain workspace security."
                }
              ].map((item, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div 
                    key={index} 
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left text-xs font-black uppercase tracking-wider text-slate-800 hover:text-[#0E3E31] hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <span>{item.q}</span>
                      <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-[#0E3E31]' : ''}`} />
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 border-t border-slate-100 bg-slate-50/50' : 'max-h-0'}`}
                    >
                      <div className="p-6 text-xs text-slate-600 leading-relaxed font-semibold">
                        {item.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

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

                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                  <div className="w-full flex justify-center">
                    <GoogleLogin
                      onSuccess={(response) => handleGoogleSuccess(response.credential)}
                      onError={() => showToast('Google Sign-In failed.', 'error')}
                      theme="filled_blue"
                      shape="pill"
                      size="large"
                      width="350"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGoogleSuccess('mock_google_credential_token')}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] shadow-sm hover:shadow"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.694 0-8.503-3.809-8.503-8.5s3.81-8.5 8.503-8.5c2.297 0 4.387.873 5.966 2.484l3.056-3.056C19.121 1.129 15.89 0 12.24 0 5.481 0 0 5.48 0 12.24s5.481 12.24 12.24 12.24c7.058 0 11.726-4.958 11.726-11.914 0-.8-.073-1.427-.18-2.281H12.24z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
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

    </div>
  );
}
