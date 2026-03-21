import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {
    Bubble,
    GiftedChat,
    IMessage,
    InputToolbar,
    Send,
} from 'react-native-gifted-chat';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripChatService } from '@/services/trip-chat-service';
import { socketService } from '@/services/socket-service';
import { TripChatMessage } from '@/types/api';
import { useAuth } from '@/context/auth-context';

const toGiftedMessage = (message: TripChatMessage): IMessage => ({
    _id: message.documentId,
    text: message.message,
    createdAt: new Date(message.createdAt),
    user: {
        _id: String(message.sender.id),
        name: message.sender.userProfile?.fullName || message.sender.username || 'Rider',
        avatar: typeof message.sender.userProfile?.avatar === 'string'
            ? message.sender.userProfile.avatar
            : message.sender.userProfile?.avatar?.url,
    },
    sent: !message.documentId.startsWith('optimistic-'),
    pending: message.documentId.startsWith('optimistic-'),
});

const fromGiftedMessage = (message: IMessage, fallbackUser: { id: number; username?: string; email?: string }) => ({
    id: -1,
    documentId: String(message._id),
    message: message.text,
    createdAt: new Date(message.createdAt).toISOString(),
    sender: {
        id: fallbackUser.id,
        documentId: String(message._id),
        username: fallbackUser.username || 'You',
        email: fallbackUser.email || '',
        provider: 'local',
        confirmed: true,
        blocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        userProfile: undefined,
    },
});

export default function TripChatScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const [composerText, setComposerText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [typingUsers, setTypingUsers] = useState<Array<{ userId: number; userName: string }>>([]);
    const isTypingRef = useRef(false);
    const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        const handleTypingUpdated = (data: { tripDocumentId: string; typingUsers: Array<{ userId: number; userName: string }> }) => {
            if (data.tripDocumentId !== tripId) return;

            setTypingUsers(
                data.typingUsers.filter((typingUser) => typingUser.userId !== user?.id)
            );
        };

        socketService.joinChat(tripId);
        socketService.on('chat_message_created', handleCreated);
        socketService.on('chat_deleted', handleDeleted);
        socketService.on('chat_typing_updated', handleTypingUpdated);

        return () => {
            if (stopTypingTimeoutRef.current) {
                clearTimeout(stopTypingTimeoutRef.current);
            }
            if (isTypingRef.current) {
                socketService.setChatTyping(tripId, false);
                isTypingRef.current = false;
            }
            socketService.off('chat_message_created', handleCreated);
            socketService.off('chat_deleted', handleDeleted);
            socketService.off('chat_typing_updated', handleTypingUpdated);
            socketService.leaveChat(tripId);
        };
    }, [tripId, queryClient, router, user?.id]);

    useEffect(() => {
        const updateKeyboardHeight = (event: any) => {
            setKeyboardHeight(event?.endCoordinates?.height || 0);
        };

        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const frameEvent = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidChangeFrame';

        const showSubscription = Keyboard.addListener(showEvent, updateKeyboardHeight);
        const frameSubscription = Keyboard.addListener(frameEvent as any, updateKeyboardHeight);
        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            frameSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const giftedMessages = useMemo(
        () =>
            [...messages]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(toGiftedMessage),
        [messages]
    );

    const typingText = useMemo(() => {
        if (typingUsers.length === 0) {
            return '';
        }

        if (typingUsers.length === 1) {
            return `${typingUsers[0].userName} is typing...`;
        }

        if (typingUsers.length === 2) {
            return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
        }

        return `${typingUsers[0].userName} and others are typing...`;
    }, [typingUsers]);

    const emitTypingState = (nextTypingState: boolean) => {
        if (!tripId) {
            return;
        }

        if (isTypingRef.current === nextTypingState) {
            return;
        }

        isTypingRef.current = nextTypingState;
        socketService.setChatTyping(tripId, nextTypingState);
    };

    const scheduleStopTyping = () => {
        if (stopTypingTimeoutRef.current) {
            clearTimeout(stopTypingTimeoutRef.current);
        }

        stopTypingTimeoutRef.current = setTimeout(() => {
            emitTypingState(false);
        }, 1800);
    };

    const handleComposerChange = (value: string) => {
        setComposerText(value);

        if (!tripId || !socketService.isConnected()) {
            return;
        }

        if (value.trim()) {
            emitTypingState(true);
            scheduleStopTyping();
        } else {
            if (stopTypingTimeoutRef.current) {
                clearTimeout(stopTypingTimeoutRef.current);
            }
            emitTypingState(false);
        }
    };

    const handleSend = async (outgoingMessages: IMessage[] = []) => {
        const outgoing = outgoingMessages[0];
        const trimmedMessage = outgoing?.text?.trim();

        if (!tripId || !user || !trimmedMessage || isSending) return;

        if (stopTypingTimeoutRef.current) {
            clearTimeout(stopTypingTimeoutRef.current);
        }
        emitTypingState(false);

        const optimisticMessage = fromGiftedMessage(
            {
                ...outgoing,
                _id: `optimistic-${Date.now()}`,
                text: trimmedMessage,
                createdAt: new Date(),
            },
            user
        );

        queryClient.setQueryData(['trip-chat-messages', tripId], (oldMessages: TripChatMessage[] | undefined) => [
            optimisticMessage,
            ...(oldMessages || []),
        ]);

        setComposerText('');
        setIsSending(true);

        try {
            const createdMessage = await tripChatService.sendMessage(tripId, trimmedMessage);
            queryClient.setQueryData(['trip-chat-messages', tripId], (oldMessages: TripChatMessage[] | undefined) => {
                const reconciled = (oldMessages || []).map((item) =>
                    item.documentId === optimisticMessage.documentId ? createdMessage : item
                );

                return reconciled.filter((item, index, items) =>
                    items.findIndex((candidate) => candidate.documentId === item.documentId) === index
                );
            });
        } catch (error) {
            queryClient.setQueryData(['trip-chat-messages', tripId], (oldMessages: TripChatMessage[] | undefined) =>
                (oldMessages || []).filter((item) => item.documentId !== optimisticMessage.documentId)
            );

            setComposerText(trimmedMessage);
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
    const keyboardLift = Math.max(0, keyboardHeight - insets.bottom);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['left', 'right', 'bottom']}>
            <Stack.Screen
                options={{
                    title: 'Ride Chat',
                    headerShown: true,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.push(`/trip-chat-members/${tripId}`)}
                            style={styles.headerInfoButton}
                        >
                            <IconSymbol name="info.circle.fill" size={22} color={textColor} />
                        </TouchableOpacity>
                    ),
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
                <View style={[styles.chatWrapper, { marginBottom: keyboardLift + 15 }]}>
                    <GiftedChat
                        messages={giftedMessages}
                        onSend={handleSend}
                        user={{
                            _id: String(user?.id || ''),
                            name: user?.username || 'You',
                        }}
                        text={composerText}
                        alwaysShowSend
                        scrollToBottom
                        bottomOffset={0}
                        renderAvatarOnTop
                        keyboardShouldPersistTaps="handled"
                        minInputToolbarHeight={60}
                        keyboardAvoidingViewProps={{ keyboardVerticalOffset: 0 }}
                        timeTextStyle={{
                            right: { color: 'rgba(255,255,255,0.75)' },
                            left: { color: subtextColor },
                        }}
                        messagesContainerStyle={{ backgroundColor }}
                        textInputProps={{
                            onChangeText: handleComposerChange,
                            placeholder: 'Message the group',
                            placeholderTextColor: subtextColor,
                            style: [
                                styles.input,
                                {
                                    color: textColor,
                                    backgroundColor: cardColor,
                                    borderColor,
                                },
                            ],
                        }}
                        listViewProps={{
                            contentContainerStyle: giftedMessages.length === 0 ? styles.emptyList : undefined,
                        }}
                        renderBubble={(props: any) => (
                            <Bubble
                                {...props}
                                wrapperStyle={{
                                    right: { backgroundColor: primaryColor },
                                    left: { backgroundColor: cardColor, borderWidth: 1, borderColor },
                                }}
                                textStyle={{
                                    right: { color: '#FFFFFF' },
                                    left: { color: textColor },
                                }}
                            />
                        )}
                        renderInputToolbar={(props: any) => (
                            <InputToolbar
                                {...props}
                                containerStyle={[
                                    styles.toolbar,
                                    {
                                        backgroundColor,
                                    },
                                ]}
                                primaryStyle={styles.toolbarPrimary}
                            />
                        )}
                        renderSend={(props: any) => (
                            <Send
                                {...props}
                                disabled={!composerText.trim() || isSending}
                                containerStyle={styles.sendContainer}
                            >
                                <View
                                    style={[
                                        styles.sendButton,
                                        {
                                            backgroundColor: composerText.trim() && !isSending ? primaryColor : '#E5E7EB',
                                            borderRadius: 23,
                                        },
                                    ]}>
                                    <IconSymbol
                                        name="paperplane.fill"
                                        size={18}
                                        color={composerText.trim() && !isSending ? '#FFFFFF' : '#9CA3AF'}
                                    />
                                </View>
                            </Send>
                        )}
                        renderChatEmpty={() => (
                            <View style={styles.emptyState}>
                                <Text style={[styles.emptyTitle, { color: textColor }]}>No messages yet</Text>
                                <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                                    Start the conversation with everyone on this ride.
                                </Text>
                            </View>
                        )}
                        renderChatFooter={() => typingText ? (
                            <View style={styles.typingFooter}>
                                <Text style={[styles.typingText, { color: subtextColor }]}>
                                    {typingText}
                                </Text>
                            </View>
                        ) : null}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    chatWrapper: {
        flex: 1,
    },
    headerInfoButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 24,
        transform: [{ rotate: '180deg' }],
    },
    typingFooter: {
        paddingHorizontal: 18,
        paddingBottom: 8,
    },
    typingText: {
        fontSize: 13,
        fontStyle: 'italic',
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
    toolbar: {
        borderTopWidth: 0,
        paddingTop: 6,
        paddingHorizontal: 10,
        paddingBottom: 6,
    },
    toolbarPrimary: {
        alignItems: 'flex-end',
    },
    input: {
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        marginRight: 8,
        minHeight: 48,
        fontSize: 15,
    },
    sendContainer: {
        justifyContent: 'flex-end',
        marginBottom: 0,
        marginRight: 0,
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
