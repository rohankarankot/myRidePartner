import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';
import { userService } from '@/services/user-service';
import { useUserStore } from '@/store/user-store';
import { socketService } from '@/services/socket-service';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const setProfile = useUserStore((state) => state.setProfile);
    const clearStore = useUserStore((state) => state.clearStore);
    const queryClient = useQueryClient();

    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            const storedToken = await SecureStore.getItemAsync('userToken');
            const storedUser = await SecureStore.getItemAsync('userData');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Fetch profile if we have a session
                const userObj = JSON.parse(storedUser);
                fetchAndStoreProfile(userObj.id);

                // Initialize socket connection
                socketService.connect(userObj.id);
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
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
        } catch (e) {
            console.error('Failed to fetch profile', e);
        }
    }

    const signIn = async (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        await SecureStore.setItemAsync('userToken', newToken);
        await SecureStore.setItemAsync('userData', JSON.stringify(newUser));

        // Fetch profile immediately after sign in
        fetchAndStoreProfile(newUser.id);

        // Initialize socket connection
        socketService.connect(newUser.id);
    };

    const signOut = async () => {
        try {
            await GoogleSignin.signOut();
        } catch (e) {
            console.log('Google SignOut error (expected if not signed in):', e);
        }

        // Clear TanStack Query cache
        queryClient.clear();

        setToken(null);
        setUser(null);
        clearStore();
        socketService.disconnect();
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
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
