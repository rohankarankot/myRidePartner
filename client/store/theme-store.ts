import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { ThemePalette } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: ThemeMode;
    palette: ThemePalette;
    setTheme: (theme: ThemeMode) => void;
    setPalette: (palette: ThemePalette) => void;
}

// Custom storage for Expo SecureStore
const secureStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return await SecureStore.getItemAsync(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await SecureStore.deleteItemAsync(name);
    },
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'system',
            palette: 'ember',
            setTheme: (theme) => set({ theme }),
            setPalette: (palette) => set({ palette }),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => secureStorage),
        }
    )
);
