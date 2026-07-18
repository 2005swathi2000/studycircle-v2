'use client';

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { AdminDashboardComponent } from './dashboard/AdminDashboardComponent';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      } else if (user.role !== 'admin') {
        router.replace(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center text-white">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AdminDashboardComponent />
      <div className="hidden">{children}</div>
    </>
  );
}
