'use client';

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { MentorDashboardComponent } from './dashboard/MentorDashboardComponent';

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (typeof window !== 'undefined' && sessionStorage.getItem('explicit_logout') === 'true') {
          sessionStorage.removeItem('explicit_logout');
          router.replace('/');
        } else {
          router.replace('/?login=true');
        }
      } else if (user.role !== 'mentor') {
        router.replace(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'mentor') {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center text-white">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <MentorDashboardComponent />
      <div className="hidden">{children}</div>
    </>
  );
}
