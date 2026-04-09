import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { CommunityChatScreen } from '@/features/chats/components/CommunityChatScreen';

export default function CommunityChatRoute() {
    const { city } = useLocalSearchParams<{ city?: string }>();

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <CommunityChatScreen initialCity={city} />
        </>
    );
}
