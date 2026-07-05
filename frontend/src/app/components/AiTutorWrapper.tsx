'use client';

import dynamic from 'next/dynamic';

const FloatingAiTutor = dynamic(
  () => import('./FloatingAiTutor').then((mod) => mod.FloatingAiTutor),
  { ssr: false }
);

export default function AiTutorWrapper() {
  return <FloatingAiTutor />;
}
