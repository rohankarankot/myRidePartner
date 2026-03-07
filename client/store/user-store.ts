import { create } from 'zustand';
import { UserProfile } from '@/types/api';

interface UserState {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    setProfile: (profile: UserProfile | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearStore: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    profile: null,
    isLoading: false,
    error: null,
    setProfile: (profile) => set({ profile, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearStore: () => set({ profile: null, isLoading: false, error: null }),
}));
