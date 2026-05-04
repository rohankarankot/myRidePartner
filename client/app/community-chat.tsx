import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { CommunityChatScreen } from '@/features/chats/components/CommunityChatScreen';
import { useEffect } from 'react';
import { notifeeService } from '@/services/notifee-service';

export default function CommunityChatRoute() {
    const { city } = useLocalSearchParams<{ city?: string }>();

    useEffect(() => {
        if (!city) {
            return;
        }

        void notifeeService.clearCommunityChatNotifications(city);
    }, [city]);

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
