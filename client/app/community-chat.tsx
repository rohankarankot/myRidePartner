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
                    title: 'Community Chat',
                    headerShown: true,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                    headerBackTitle: 'Community',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.push('/community-info')}
                            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <IconSymbol name="info.circle.fill" size={20} color={primaryColor} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <CommunityChatScreen />
        </>
    );
}
