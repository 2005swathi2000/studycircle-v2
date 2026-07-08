'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ToastProvider';
import { apiRequest } from '../utils/api';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Camera, 
  RefreshCw, 
  Shield 
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, setUser, loading: globalLoading } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync inputs with user context
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Auth Guard
  useEffect(() => {
    if (!globalLoading && !user) {
      showToast('Please sign in to access your profile.', 'error');
      router.push('/');
    }
  }, [user, globalLoading]);

  // Get gender-based fallback avatar
  const getAvatarByName = (fullName: string | null | undefined, gender?: string): string => {
    if (gender === 'female') return '/swathi-avatar.png';
    if (gender === 'male') return '/charan-avatar.png';
    if (gender === 'other' || gender === 'neutral') {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
    }
    if (!fullName) return '/charan-avatar.png';
    const firstName = fullName.trim().split(' ')[0].toLowerCase();
    const femaleNames = ['swathi', 'bhagya', 'rathna', 'rathnamma', 'swetha', 'priya', 'geetha', 'divya', 'kavya', 'lakshmi', 'anusha'];
    if (femaleNames.includes(firstName)) return '/swathi-avatar.png';
    return '/charan-avatar.png';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setAvatarUrl(base64);
          showToast('Photo selected and compressed successfully!', 'success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showToast('First name, Last name, and Email are required.', 'error');
      return;
    }
    if (phone && phone.length !== 10) {
      showToast('Phone number must contain exactly 10 digits.', 'error');
      return;
    }

    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const res = await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName,
          email: email.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          avatarUrl
        })
      });

      // Update AppContext
      setUser(res.user, typeof window !== 'undefined' ? localStorage.getItem('studycircle_token') : null);
      showToast('Profile updated successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (globalLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060913]">
        <RefreshCw className="h-8 w-8 text-[#10B981] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans relative flex flex-col items-center justify-center p-6 overflow-x-hidden">
      
      {/* Decorative stars / glows */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#10B981]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0B0F19] border border-white/5 hover:border-white/10 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-all shadow-md backdrop-blur-sm group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="max-w-xl w-full bg-[#0B0F19] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 mt-10">
        
        {/* Header */}
        <div className="text-left border-b border-white/5 pb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
            Account Profile Settings
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Manage your student profile card, avatar, and system metadata.</p>
        </div>

        {/* Profile presentation */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          
          {/* Avatar selector */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border border-white/10 bg-slate-900 group shadow-md flex items-center justify-center">
              <img 
                src={avatarUrl || getAvatarByName(user?.fullName, user?.gender)} 
                className="absolute inset-0 h-full w-full object-cover" 
                alt="Avatar Preview" 
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="text-center sm:text-left">
              <span className="text-xs font-black text-white block mb-1">Change Profile Photo</span>
              <span className="text-[9px] text-slate-400 font-medium leading-relaxed block max-w-xs mb-3">
                Upload a JPEG/PNG image. It will be automatically compressed to optimize speed.
              </span>
              <label className="px-3 py-1.5 bg-white/[0.04] border border-white/5 hover:border-white/10 hover:bg-white/[0.08] text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer inline-block">
                Choose Image
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">First Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-500" />
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#10B981]/50 outline-none transition-all font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Last Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-500" />
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#10B981]/50 outline-none transition-all font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#10B981]/50 outline-none transition-all font-semibold"
                required
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-500" />
              <input 
                type="tel" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(cleaned);
                }}
                placeholder="Phone number"
                className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#10B981]/50 outline-none transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Biography / Status</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-500" />
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                className="w-full bg-[#070b19]/80 border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-[#10B981]/50 outline-none transition-all font-semibold resize-none"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#10B981] hover:bg-[#0d9488] disabled:bg-[#10B981]/50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-[#10b981]/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving Changes...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
