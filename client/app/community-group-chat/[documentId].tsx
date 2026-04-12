import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { CommunityGroupChatScreen } from '@/features/chats/components/CommunityGroupChatScreen';

export default function CommunityGroupChatRoute() {
    const { documentId } = useLocalSearchParams<{ documentId: string }>();

    if (!documentId) return null;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <CommunityGroupChatScreen groupDocumentId={documentId} />
        </>
    );
}
