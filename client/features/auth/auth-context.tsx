import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useQueryClient } from '@tanstack/react-query';

import { userService } from '@/features/auth/api/user-service';
import { clearStoredSession, getStoredSession, persistSession } from '@/features/auth/session-storage';
import type { AuthContextType, AuthUser } from '@/features/auth/types';
import { socketService } from '@/features/realtime/socket-service';
import { logger } from '@/shared/lib/logger';
import { useUserStore } from '@/store/user-store';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setProfile = useUserStore((state) => state.setProfile);
  const clearStore = useUserStore((state) => state.clearStore);
  const queryClient = useQueryClient();

  useEffect(() => {
    void hydrateSession();
  }, []);

  async function hydrateSession() {
    try {
      const session = await getStoredSession();

      if (!session) {
        return;
      }

      setToken(session.token);
      setUser(session.user);
      void fetchAndStoreProfile(session.user.id);
      socketService.connect(session.user.id, session.token);
    } catch (error) {
      logger.error('Failed to load auth data', { error });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAndStoreProfile(userId: number) {
    try {
      const profile = await userService.getUserProfile(userId);
      if (profile) {
        setProfile(profile);
      }
    } catch (error) {
      logger.error('Failed to fetch profile', { error, userId });
    }
  }

  const signIn = async (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    await persistSession(nextToken, nextUser);
    void fetchAndStoreProfile(nextUser.id);
    socketService.connect(nextUser.id, nextToken);
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      logger.warn('Google SignOut error', { error });
    }

    queryClient.clear();
    setToken(null);
    setUser(null);
    clearStore();
    socketService.disconnect();
    await clearStoredSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
