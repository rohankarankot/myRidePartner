import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useThemeColor } from '@/hooks/use-theme-color';
import { tripChatService } from '@/services/trip-chat-service';
import { socketService } from '@/services/socket-service';
import { TripChatMessage } from '@/types/api';
import { useAuth } from '@/context/auth-context';

function MessageRow({
    item,
    isCurrentUser,
    cardColor,
    primaryColor,
    textColor,
    subtextColor,
    borderColor,
}: {
    item: TripChatMessage;
    isCurrentUser: boolean;
    cardColor: string;
    primaryColor: string;
    textColor: string;
    subtextColor: string;
    borderColor: string;
}) {
    return (
        <View style={[styles.messageRow, isCurrentUser ? styles.messageRowRight : styles.messageRowLeft]}>
            <View
                style={[
                    styles.messageBubble,
                    {
                        backgroundColor: isCurrentUser ? primaryColor : cardColor,
                        borderColor: isCurrentUser ? primaryColor : borderColor,
                    },
                ]}>
                <Text
                    style={[
                        styles.messageSender,
                        { color: isCurrentUser ? 'rgba(255,255,255,0.82)' : subtextColor },
                    ]}>
                    {item.sender.userProfile?.fullName || item.sender.username || 'Rider'}
                </Text>
                <Text style={[styles.messageText, { color: isCurrentUser ? '#FFFFFF' : textColor }]}>
                    {item.message}
                </Text>
            </View>
        </View>
    );
}

export default function TripChatScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [draftMessage, setDraftMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    const { data: chatAccess, isLoading: isLoadingAccess } = useQuery({
        queryKey: ['trip-chat-access', tripId],
        queryFn: () => tripChatService.getChatAccess(tripId!),
        enabled: !!tripId,
    });

    const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
        queryKey: ['trip-chat-messages', tripId],
        queryFn: () => tripChatService.getMessages(tripId!),
        enabled: !!tripId && !!chatAccess?.canAccess,
    });

    useEffect(() => {
        if (!tripId) return;

        const handleCreated = (message: TripChatMessage) => {
            queryClient.setQueryData(['trip-chat-messages', tripId], (oldMessages: TripChatMessage[] | undefined) => {
                if (!oldMessages) {
                    return [message];
                }

                if (oldMessages.some((item) => item.documentId === message.documentId)) {
                    return oldMessages;
                }

                const optimisticIndex = oldMessages.findIndex(
                    (item) =>
                        item.documentId.startsWith('optimistic-') &&
                        item.sender.id === message.sender.id &&
                        item.message === message.message
                );

                if (optimisticIndex >= 0) {
                    return oldMessages.map((item, index) => index === optimisticIndex ? message : item);
                }

                return [...oldMessages, message];
            });
        };

        const handleDeleted = (data: { tripDocumentId: string }) => {
            if (data.tripDocumentId !== tripId) return;

            Toast.show({
                type: 'info',
                text1: 'Ride Chat Removed',
                text2: 'This chat was deleted because the trip ended.',
            });

            queryClient.removeQueries({ queryKey: ['trip-chat-messages', tripId] });
            router.replace(`/trip/${tripId}`);
        };

        socketService.joinChat(tripId);
        socketService.on('chat_message_created', handleCreated);
        socketService.on('chat_deleted', handleDeleted);

        return () => {
            socketService.off('chat_message_created', handleCreated);
            socketService.off('chat_deleted', handleDeleted);
            socketService.leaveChat(tripId);
        };
    }, [tripId, queryClient, router]);

    const sortedMessages = useMemo(
        () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        [messages]
    );

    const handleSend = async () => {
        const trimmedMessage = draftMessage.trim();
        if (!tripId || !trimmedMessage || isSending) return;

        const optimisticId = `optimistic-${Date.now()}`;
        const optimisticMessage: TripChatMessage = {
            id: -1,
            documentId: optimisticId,
            message: trimmedMessage,
            createdAt: new Date().toISOString(),
            sender: {
                id: user?.id || 0,
                documentId: optimisticId,
                username: user?.username || 'You',
                email: user?.email || '',
                provider: 'local',
                confirmed: true,
                blocked: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                publishedAt: new Date().toISOString(),
                userProfile: undefined,
            },
        };

        queryClient.setQueryData(['trip-chat-messages', tripId], (oldMessages: TripChatMessage[] | undefined) => [
            ...(oldMessages || []),
            optimisticMessage,
        ]);

        setDraftMessage('');
        setIsSending(true);

        try {
            const createdMessage = await tripChatService.sendMessage(tripId, trimmedMessage);
            queryClient.setQueryData(['trip-chat-messages', tripId], (oldMessages: TripChatMessage[] | undefined) => {
                const reconciled = (oldMessages || []).map((item) =>
                    item.documentId === optimisticId ? createdMessage : item
                );

                return reconciled.filter((item, index, items) =>
                    items.findIndex((candidate) => candidate.documentId === item.documentId) === index
                );
            });
        } catch (error) {
            queryClient.setQueryData(['trip-chat-messages', tripId], (oldMessages: TripChatMessage[] | undefined) =>
                (oldMessages || []).filter((item) => item.documentId !== optimisticId)
            );

            Toast.show({
                type: 'error',
                text1: 'Message Failed',
                text2: 'Unable to send your message right now.',
            });
        } finally {
            setIsSending(false);
        }
    };

    const isBlocked = !isLoadingAccess && (!chatAccess?.canAccess || chatAccess.tripStatus === 'COMPLETED' || chatAccess.tripStatus === 'CANCELLED');

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: 'Ride Chat',
                    headerShown: true,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                }}
            />

            {isLoadingAccess || isLoadingMessages ? (
                <View style={[styles.center, { backgroundColor }]}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            ) : isBlocked ? (
                <View style={[styles.center, { backgroundColor, paddingHorizontal: 24 }]}>
                    <Text style={[styles.emptyTitle, { color: textColor }]}>Chat unavailable</Text>
                    <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                        This ride chat is only available for the captain and approved riders while the trip is active.
                    </Text>
                </View>
            ) : (
                <KeyboardAvoidingView
                    style={styles.safe}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
                    <FlatList
                        data={sortedMessages}
                        keyExtractor={(item) => item.documentId}
                        contentContainerStyle={[
                            styles.listContent,
                            sortedMessages.length === 0 && styles.listContentEmpty,
                        ]}
                        renderItem={({ item }) => (
                            <MessageRow
                                item={item}
                                isCurrentUser={item.sender.id === user?.id}
                                cardColor={cardColor}
                                primaryColor={primaryColor}
                                textColor={textColor}
                                subtextColor={subtextColor}
                                borderColor={borderColor}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={[styles.emptyTitle, { color: textColor }]}>No messages yet</Text>
                                <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                                    Start the conversation with everyone on this ride.
                                </Text>
                            </View>
                        }
                    />

                    <View style={[styles.composer, { backgroundColor, borderTopColor: borderColor }]}>
                        <TextInput
                            style={[styles.input, { backgroundColor: cardColor, color: textColor, borderColor }]}
                            placeholder="Message the group"
                            placeholderTextColor={subtextColor}
                            value={draftMessage}
                            onChangeText={setDraftMessage}
                            multiline
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                { backgroundColor: draftMessage.trim() ? primaryColor : `${primaryColor}55` },
                            ]}
                            onPress={handleSend}
                            disabled={!draftMessage.trim() || isSending}>
                            <Text style={styles.sendButtonText}>{isSending ? '...' : 'Send'}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    listContentEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    messageRow: {
        width: '100%',
    },
    messageRowLeft: {
        alignItems: 'flex-start',
    },
    messageRowRight: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '84%',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
    },
    messageSender: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 21,
    },
    composer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 48,
        maxHeight: 120,
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    sendButton: {
        minWidth: 72,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});
