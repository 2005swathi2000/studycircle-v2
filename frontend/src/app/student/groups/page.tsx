"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentGroupsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/student/study');
  }, [router]);

  return null;
}
