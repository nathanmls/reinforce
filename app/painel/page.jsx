'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PainelRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/painel/dashboard');
  }, [router]);

  return null;
}
