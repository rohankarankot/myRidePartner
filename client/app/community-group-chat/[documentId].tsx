import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { CommunityGroupChatScreen } from '@/features/chats/components/CommunityGroupChatScreen';
import { useEffect } from 'react';
import { notifeeService } from '@/services/notifee-service';

export default function CommunityGroupChatRoute() {
    const { documentId } = useLocalSearchParams<{ documentId: string }>();

    useEffect(() => {
        if (!documentId) {
            return;
        }

        void notifeeService.clearCommunityGroupChatNotifications(documentId);
    }, [documentId]);

    if (!documentId) return null;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <CommunityGroupChatScreen groupDocumentId={documentId} />
        </>
    );
}
