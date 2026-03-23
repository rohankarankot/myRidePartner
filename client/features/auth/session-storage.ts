import * as SecureStore from 'expo-secure-store';

import type { AuthUser } from '@/features/auth/types';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

export interface StoredSession {
  token: string;
  user: AuthUser;
}

export async function getStoredSession(): Promise<StoredSession | null> {
  const [token, serializedUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  if (!token || !serializedUser) {
    return null;
  }

  return {
    token,
    user: JSON.parse(serializedUser) as AuthUser,
  };
}

export async function persistSession(token: string, user: AuthUser) {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function clearStoredSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
