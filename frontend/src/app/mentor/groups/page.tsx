"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MentorGroupsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/mentor/study-rooms');
  }, [router]);

  return null;
}
