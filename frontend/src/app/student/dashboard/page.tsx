"use client";

import React, { useEffect } from 'react';
import { DashboardComponent } from '../../dashboard/DashboardComponent';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function StudentDashboard() {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (typeof window !== 'undefined' && sessionStorage.getItem('explicit_logout') === 'true') {
          sessionStorage.removeItem('explicit_logout');
          router.push('/');
        } else {
          router.push('/?login=true');
        }
      } else if (user.role !== 'student') {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'student') {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center text-white">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return <DashboardComponent bypassRedirect={true} />;
}
