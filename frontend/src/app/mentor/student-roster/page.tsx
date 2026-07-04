"use client";

import React, { useEffect } from 'react';
import MentorDashboard from '../dashboard/page';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function MentorStudentRosterPage() {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/?login=true');
      } else if (user.role !== 'mentor') {
        router.push(`/${user.role}/dashboard`);
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

  return <MentorDashboard />;
}
