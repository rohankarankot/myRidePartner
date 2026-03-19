'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext<{
  isLoading: boolean;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthPage = pathname?.startsWith('/auth');
    const isDashboardPage = pathname?.startsWith('/dashboard');

    if (!token && isDashboardPage) {
      router.replace('/auth/sign-in');
    } else if (token && isAuthPage) {
      router.replace('/dashboard/overview');
    } else if (token && user?.role !== 'SUPER_ADMIN' && isDashboardPage) {
      // In a real app, you'd show an unauthorized page
      router.replace('/auth/sign-in');
    }
    
    setIsLoading(false);
  }, [token, user, pathname, router]);

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
