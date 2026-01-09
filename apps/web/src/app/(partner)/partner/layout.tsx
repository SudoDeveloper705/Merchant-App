'use client';

import { ReactNode } from 'react';
import { PartnerAuthProvider } from '@/contexts/PartnerAuthContext';

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <PartnerAuthProvider>{children}</PartnerAuthProvider>;
}

