import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
