'use client';

import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Client wrapper for AuthProvider
 * This allows AuthProvider (which uses client hooks) to be used in server components
 */
export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

