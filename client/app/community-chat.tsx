import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CommunityChatScreen } from '@/components/chat/community-chat-screen';

export default function CommunityChatRoute() {
    const router = useRouter();
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const primaryColor = useThemeColor({}, 'primary');

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <CommunityChatScreen />
        </>
    );
}
