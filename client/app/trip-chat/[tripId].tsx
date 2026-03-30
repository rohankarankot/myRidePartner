import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Linking, PanResponder, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import {
    Bubble,
    GiftedChat,
    IMessage,
    InputToolbar,
} from 'react-native-gifted-chat';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppLoader } from '@/components/app-loader';
import { tripChatService } from '@/services/trip-chat-service';
import { socketService } from '@/services/socket-service';
import { PaginatedTripChatMessages, TripChatMessage } from '@/types/api';
import { useAuth } from '@/context/auth-context';

const LOCATION_MESSAGE_PREFIX = '__ride_location__::';

type ParsedLocationMessage = {
    latitude: number;
    longitude: number;
    label: string;
};

const parseLocationMessage = (value: string): ParsedLocationMessage | null => {
    if (!value.startsWith(LOCATION_MESSAGE_PREFIX)) {
        return null;
    }

    try {
        const parsed = JSON.parse(value.slice(LOCATION_MESSAGE_PREFIX.length));
        if (typeof parsed.latitude !== 'number' || typeof parsed.longitude !== 'number') {
            return null;
        }

        return {
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            label: typeof parsed.label === 'string' ? parsed.label : 'Shared current location',
        };
    } catch {
        return null;
    }
};

const buildLocationMessage = (payload: ParsedLocationMessage) =>
    `${LOCATION_MESSAGE_PREFIX}${JSON.stringify(payload)}`;

type ReplyPreview = NonNullable<TripChatMessage['replyTo']>;

type ChatGiftedMessage = IMessage & {
    replyTo?: ReplyPreview | null;
};

const getSenderDisplayName = (sender?: TripChatMessage['sender'] | ReplyPreview['sender']) =>
    sender?.userProfile?.fullName || sender?.username || 'Rider';

const getReplyPreviewText = (message?: string) => {
    const locationPayload = message ? parseLocationMessage(message) : null;
    if (locationPayload) {
        return 'Shared a location';
    }

    return message || '';
};

const toReplyPreview = (message: TripChatMessage): ReplyPreview => ({
    documentId: message.documentId,
    message: message.message,
    createdAt: message.createdAt,
    sender: message.sender,
});

const toGiftedMessage = (message: TripChatMessage): ChatGiftedMessage => ({
    _id: message.documentId,
    text: message.message,
    createdAt: new Date(message.createdAt),
    user: {
        _id: String(message.sender.id),
        name: getSenderDisplayName(message.sender),
        avatar: typeof message.sender.userProfile?.avatar === 'string'
            ? message.sender.userProfile.avatar
            : message.sender.userProfile?.avatar?.url,
    },
    replyTo: message.replyTo ?? null,
    sent: !message.documentId.startsWith('optimistic-'),
    pending: message.documentId.startsWith('optimistic-'),
});

const fromGiftedMessage = (
    message: ChatGiftedMessage,
    fallbackUser: { id: number; username?: string; email?: string }
): TripChatMessage => ({
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
    replyTo: message.replyTo ?? null,
});

const MESSAGE_PAGE_SIZE = 40;

const mergeUniqueMessages = (messages: TripChatMessage[]) =>
    messages.filter((item, index, items) =>
        items.findIndex((candidate) => candidate.documentId === item.documentId) === index
    );

const updatePaginatedMessages = (
    existing: InfiniteData<PaginatedTripChatMessages, string | null> | undefined,
    updater: (messages: TripChatMessage[]) => TripChatMessage[]
): InfiniteData<PaginatedTripChatMessages, string | null> | undefined => {
    if (!existing) {
        return existing;
    }

    const flattenedMessages = existing.pages.flatMap((page) => page.messages);
    const nextMessages = mergeUniqueMessages(updater(flattenedMessages));
    const rebuiltPages = existing.pages.map((page, index) => {
        if (index === 0) {
            return {
                ...page,
                messages: nextMessages,
                hasMore: page.hasMore,
                nextCursor: nextMessages[0]?.documentId ?? page.nextCursor,
            };
        }

        return {
            ...page,
            messages: [],
        };
    });

    return {
        ...existing,
        pages: rebuiltPages,
    };
};

type MessageSwipeReplyProps = {
    children: React.ReactNode;
    isCurrentUser: boolean;
    primaryColor: string;
    onReply: () => void;
};

function MessageSwipeReply({ children, isCurrentUser, primaryColor, onReply }: MessageSwipeReplyProps) {
    const translateX = useRef(new Animated.Value(0)).current;
    const hasTriggeredReplyRef = useRef(false);
    const swipeDistance = 72;
    const replyThreshold = 44;

    const resetPosition = () => {
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 140,
            friction: 12,
        }).start(() => {
            hasTriggeredReplyRef.current = false;
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_event, gestureState) => {
                const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.4;
                const isReplyDirection = isCurrentUser ? gestureState.dx < -12 : gestureState.dx > 12;
                return isHorizontalSwipe && isReplyDirection;
            },
            onPanResponderMove: (_event, gestureState) => {
                const rawDx = isCurrentUser ? -gestureState.dx : gestureState.dx;
                const nextTranslate = Math.max(0, Math.min(rawDx, swipeDistance));
                translateX.setValue(isCurrentUser ? -nextTranslate : nextTranslate);

                if (!hasTriggeredReplyRef.current && nextTranslate >= replyThreshold) {
                    hasTriggeredReplyRef.current = true;
                    void Haptics.selectionAsync();
                }
            },
            onPanResponderRelease: (_event, gestureState) => {
                const rawDx = isCurrentUser ? -gestureState.dx : gestureState.dx;
                if (rawDx >= replyThreshold) {
                    onReply();
                }
                resetPosition();
            },
            onPanResponderTerminate: resetPosition,
        })
    ).current;

    const iconTranslate = translateX.interpolate({
        inputRange: isCurrentUser ? [-swipeDistance, 0] : [0, swipeDistance],
        outputRange: isCurrentUser ? [0, 12] : [-12, 0],
        extrapolate: 'clamp',
    });

    const iconOpacity = translateX.interpolate({
        inputRange: isCurrentUser ? [-swipeDistance, -10, 0] : [0, 10, swipeDistance],
        outputRange: [0, 0.65, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.swipeRow}>
            {!isCurrentUser ? (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.replyCue,
                        styles.replyCueLeft,
                        {
                            opacity: iconOpacity,
                            transform: [{ translateX: iconTranslate }],
                        },
                    ]}
                >
                    <View style={[styles.replyCueIcon, { backgroundColor: `${primaryColor}16` }]}>
                        <IconSymbol name="arrowshape.turn.up.left.fill" size={15} color={primaryColor} />
                    </View>
                </Animated.View>
            ) : null}
            <Animated.View
                {...panResponder.panHandlers}
                style={{
                    transform: [{ translateX }],
                }}
            >
                {children}
            </Animated.View>
            {isCurrentUser ? (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.replyCue,
                        styles.replyCueRight,
                        {
                            opacity: iconOpacity,
                            transform: [{ translateX: iconTranslate }],
                        },
                    ]}
                >
                    <View style={[styles.replyCueIcon, { backgroundColor: `${primaryColor}16` }]}>
                        <IconSymbol name="arrowshape.turn.up.left.fill" size={15} color={primaryColor} />
                    </View>
                </Animated.View>
            ) : null}
        </View>
    );
}

export default function TripChatScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const [composerText, setComposerText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSendingLocation, setIsSendingLocation] = useState(false);
    const [replyingTo, setReplyingTo] = useState<TripChatMessage | null>(null);
    const [typingUsers, setTypingUsers] = useState<{ userId: number; userName: string }[]>([]);
    const isTypingRef = useRef(false);
    const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isChatScreenActiveRef = useRef(false);

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');
    const headerHeight = insets.top + 60;

    const { data: chatAccess, isLoading: isLoadingAccess } = useQuery({
        queryKey: ['trip-chat-access', tripId],
        queryFn: () => tripChatService.getChatAccess(tripId!),
        enabled: !!tripId,
    });

    const {
        data: paginatedMessages,
        isLoading: isLoadingMessages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['trip-chat-messages', tripId],
        queryFn: ({ pageParam }) => tripChatService.getMessages(tripId!, { cursor: pageParam, limit: MESSAGE_PAGE_SIZE }),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
        enabled: !!tripId && !!chatAccess?.canAccess,
    });

    const messages = useMemo(
        () => mergeUniqueMessages(paginatedMessages?.pages.flatMap((page) => page.messages) ?? []),
        [paginatedMessages]
    );

    useEffect(() => {
        if (!tripId) return;

        const handleCreated = (message: TripChatMessage) => {
            queryClient.setQueryData(['trip-chat-messages', tripId], (oldPages: InfiniteData<PaginatedTripChatMessages, string | null> | undefined) =>
                updatePaginatedMessages(oldPages, (oldMessages) => {
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
                })
            );
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

        const handleTypingUpdated = (data: { tripDocumentId: string; typingUsers: { userId: number; userName: string }[] }) => {
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
        const chatUnavailable =
            !chatAccess?.canAccess ||
            chatAccess?.tripStatus === 'COMPLETED' ||
            chatAccess?.tripStatus === 'CANCELLED';

        if (!tripId || chatUnavailable) {
            return;
        }

        const setActiveState = (nextState: boolean) => {
            if (!socketService.isConnected() || isChatScreenActiveRef.current === nextState) {
                return;
            }

            isChatScreenActiveRef.current = nextState;
            socketService.setChatScreenState(tripId, nextState);
        };

        setActiveState(true);

        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            setActiveState(nextAppState === 'active');
        });

        return () => {
            appStateSubscription.remove();
            setActiveState(false);
            isChatScreenActiveRef.current = false;
        };
    }, [chatAccess?.canAccess, chatAccess?.tripStatus, tripId]);

    const giftedMessages = useMemo(
        () =>
            [...messages]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(toGiftedMessage),
        [messages]
    );

    const openSharedLocation = async (payload: ParsedLocationMessage) => {
        const latLng = `${payload.latitude},${payload.longitude}`;
        const mapUrl = Platform.OS === 'ios'
            ? `comgooglemaps://?daddr=${latLng}&directionsmode=driving`
            : `google.navigation:q=${latLng}`;
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;

        try {
            const supported = await Linking.canOpenURL(mapUrl);
            await Linking.openURL(supported ? mapUrl : fallbackUrl);
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Unable to open Maps',
                text2: 'Please try again in a moment.',
            });
        }
    };

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

    const isBlocked = !isLoadingAccess && (!chatAccess?.canAccess || chatAccess.tripStatus === 'COMPLETED' || chatAccess.tripStatus === 'CANCELLED');

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

    const triggerReply = (message: ChatGiftedMessage) => {
        const sourceMessage = messages.find((item) => item.documentId === String(message._id));
        if (!sourceMessage) {
            return;
        }

        setReplyingTo(sourceMessage);
        void Haptics.selectionAsync();
    };

    const handleSend = async (outgoingMessages: ChatGiftedMessage[] = []) => {
        const outgoing = outgoingMessages[0];
        const trimmedMessage = outgoing?.text?.trim();
        const activeReply = replyingTo;

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
                replyTo: activeReply ? toReplyPreview(activeReply) : null,
            },
            user
        );

        queryClient.setQueryData(['trip-chat-messages', tripId], (oldPages: InfiniteData<PaginatedTripChatMessages, string | null> | undefined) =>
            updatePaginatedMessages(oldPages, (oldMessages) => [
                optimisticMessage,
                ...oldMessages,
            ])
        );

        setComposerText('');
        setReplyingTo(null);
        setIsSending(true);

        try {
            const createdMessage = await tripChatService.sendMessage(tripId, trimmedMessage, {
                replyToDocumentId: activeReply?.documentId,
            });
            queryClient.setQueryData(['trip-chat-messages', tripId], (oldPages: InfiniteData<PaginatedTripChatMessages, string | null> | undefined) =>
                updatePaginatedMessages(oldPages, (oldMessages) =>
                    oldMessages.map((item) =>
                        item.documentId === optimisticMessage.documentId ? createdMessage : item
                    )
                )
            );
        } catch {
            queryClient.setQueryData(['trip-chat-messages', tripId], (oldPages: InfiniteData<PaginatedTripChatMessages, string | null> | undefined) =>
                updatePaginatedMessages(oldPages, (oldMessages) =>
                    oldMessages.filter((item) => item.documentId !== optimisticMessage.documentId)
                )
            );

            setComposerText(trimmedMessage);
            setReplyingTo(activeReply ?? null);
            Toast.show({
                type: 'error',
                text1: 'Message Failed',
                text2: 'Unable to send your message right now.',
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleShareCurrentLocation = async () => {
        if (!tripId || !user || isSendingLocation || !chatAccess?.isCaptain) {
            return;
        }

        const activeReply = replyingTo;
        setIsSendingLocation(true);

        try {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted') {
                Toast.show({
                    type: 'info',
                    text1: 'Location Permission Needed',
                    text2: 'Allow location access to share your current spot with riders.',
                });
                return;
            }

            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const label = `${user.username || 'Captain'}'s current location`;
            const locationMessage = buildLocationMessage({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                label,
            });

            const optimisticMessage = fromGiftedMessage(
                {
                    _id: `optimistic-location-${Date.now()}`,
                    text: locationMessage,
                    createdAt: new Date(),
                    user: {
                        _id: String(user.id),
                        name: user.username || 'You',
                    },
                    replyTo: activeReply ? toReplyPreview(activeReply) : null,
                },
                user
            );

            queryClient.setQueryData(['trip-chat-messages', tripId], (oldPages: InfiniteData<PaginatedTripChatMessages, string | null> | undefined) =>
                updatePaginatedMessages(oldPages, (oldMessages) => [
                    optimisticMessage,
                    ...oldMessages,
                ])
            );

            setReplyingTo(null);

            const createdMessage = await tripChatService.sendMessage(tripId, locationMessage, {
                replyToDocumentId: activeReply?.documentId,
            });

            queryClient.setQueryData(['trip-chat-messages', tripId], (oldPages: InfiniteData<PaginatedTripChatMessages, string | null> | undefined) =>
                updatePaginatedMessages(oldPages, (oldMessages) =>
                    oldMessages.map((item) =>
                        item.documentId === optimisticMessage.documentId ? createdMessage : item
                    )
                )
            );

            Toast.show({
                type: 'success',
                text1: 'Location Shared',
                text2: 'Riders can now open your location in Google Maps.',
            });
        } catch {
            setReplyingTo(activeReply ?? null);
            Toast.show({
                type: 'error',
                text1: 'Location Share Failed',
                text2: 'Unable to share your current location right now.',
            });
        } finally {
            setIsSendingLocation(false);
        }
    };

    const handlePressSend = () => {
        const trimmedMessage = composerText.trim();
        if (!trimmedMessage || isSending) {
            return;
        }

        void handleSend([
            {
                _id: `local-${Date.now()}`,
                text: trimmedMessage,
                createdAt: new Date(),
                user: {
                    _id: String(user?.id || ''),
                    name: user?.username || 'You',
                },
                replyTo: replyingTo
                    ? toReplyPreview(replyingTo)
                    : null,
            },
        ]);
    };

    const renderReplySnippet = (replyTo?: ReplyPreview | null, isCurrentUser?: boolean) => {
        if (!replyTo) {
            return null;
        }

        return (
            <View
                style={[
                    styles.replySnippet,
                    {
                        backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.14)' : `${primaryColor}14`,
                        borderLeftColor: isCurrentUser ? 'rgba(255,255,255,0.78)' : primaryColor,
                    },
                ]}
            >
                <Text
                    numberOfLines={1}
                    style={[
                        styles.replySnippetAuthor,
                        { color: isCurrentUser ? '#FFFFFF' : primaryColor },
                    ]}
                >
                    {getSenderDisplayName(replyTo.sender)}
                </Text>
                <Text
                    numberOfLines={2}
                    style={[
                        styles.replySnippetText,
                        { color: isCurrentUser ? 'rgba(255,255,255,0.86)' : subtextColor },
                    ]}
                >
                    {getReplyPreviewText(replyTo.message)}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['left', 'right', 'bottom']}>
            <View
                style={[
                    styles.customHeader,
                    {
                        backgroundColor,
                        borderBottomColor: borderColor,
                        paddingTop: insets.top + 8,
                        height: headerHeight,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.headerIconButton}
                >
                    <IconSymbol name="chevron.left" size={22} color={textColor} />
                </TouchableOpacity>

                <View style={styles.headerTitleWrap}>
                    <Text style={[styles.headerTitle, { color: textColor }]}>Ride Chat</Text>
                    <Text style={[styles.headerSubtitle, { color: subtextColor }]}>
                        Chat with approved riders
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push(`/trip-chat-members/${tripId}`)}
                    style={styles.headerIconButton}
                >
                    <IconSymbol name="info.circle.fill" size={22} color={textColor} />
                </TouchableOpacity>
            </View>

            {isLoadingAccess || isLoadingMessages ? (
                <View style={[styles.center, { backgroundColor, paddingTop: headerHeight }]}>
                    <AppLoader />
                </View>
            ) : isBlocked ? (
                <View style={[styles.center, { backgroundColor, paddingHorizontal: 24, paddingTop: headerHeight }]}>
                    <Text style={[styles.emptyTitle, { color: textColor }]}>Chat unavailable</Text>
                    <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                        This ride chat is only available for the captain and approved riders while the trip is active.
                    </Text>
                </View>
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'translate-with-padding'}
                    keyboardVerticalOffset={0}
                    style={[styles.chatWrapper, { paddingTop: headerHeight }]}
                >
                    <GiftedChat
                        messages={giftedMessages}
                        onSend={handleSend}
                        user={{
                            _id: String(user?.id || ''),
                            name: user?.username || 'You',
                        }}
                        text={composerText}
                        scrollToBottom
                        bottomOffset={insets.bottom}
                        renderAvatarOnTop
                        keyboardShouldPersistTaps="handled"
                        minInputToolbarHeight={60}
                        loadEarlier={Boolean(hasNextPage)}
                        onLoadEarlier={() => {
                            if (!isFetchingNextPage) {
                                void fetchNextPage();
                            }
                        }}
                        isLoadingEarlier={isFetchingNextPage}
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
                            (() => {
                                const currentMessage = props.currentMessage as ChatGiftedMessage | undefined;
                                const locationPayload = parseLocationMessage(currentMessage?.text || '');
                                const isCurrentUser = String(currentMessage?.user?._id) === String(user?.id);

                                const bubbleContent = locationPayload ? (
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => openSharedLocation(locationPayload)}
                                        style={[
                                            styles.locationBubble,
                                            {
                                                alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                                                backgroundColor: isCurrentUser ? primaryColor : cardColor,
                                                borderColor,
                                            },
                                        ]}
                                    >
                                        {renderReplySnippet(currentMessage?.replyTo, isCurrentUser)}
                                        <View style={styles.locationBubbleHeader}>
                                            <IconSymbol
                                                name="location.fill"
                                                size={18}
                                                color={isCurrentUser ? '#FFFFFF' : primaryColor}
                                            />
                                            <Text
                                                style={[
                                                    styles.locationBubbleTitle,
                                                    { color: isCurrentUser ? '#FFFFFF' : textColor },
                                                ]}
                                            >
                                                {locationPayload.label}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[
                                                styles.locationBubbleSubtitle,
                                                { color: isCurrentUser ? 'rgba(255,255,255,0.82)' : subtextColor },
                                            ]}
                                        >
                                            Tap to open in Google Maps
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
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
                                        renderCustomView={() => renderReplySnippet(currentMessage?.replyTo, isCurrentUser)}
                                        customViewPosition="top"
                                    />
                                );

                                return currentMessage ? (
                                    <MessageSwipeReply
                                        isCurrentUser={isCurrentUser}
                                        primaryColor={primaryColor}
                                        onReply={() => triggerReply(currentMessage)}
                                    >
                                        {bubbleContent}
                                    </MessageSwipeReply>
                                ) : bubbleContent;
                            })()
                        )}
                        renderInputToolbar={(props: any) => (
                            <View style={[styles.toolbarRow, { backgroundColor }]}>
                                {chatAccess?.isCaptain ? (
                                    <TouchableOpacity
                                        onPress={handleShareCurrentLocation}
                                        disabled={isSendingLocation}
                                        style={[
                                            styles.locationActionButton,
                                            {
                                                backgroundColor: isSendingLocation ? `${subtextColor}22` : `${primaryColor}14`,
                                            },
                                        ]}
                                    >
                                        <IconSymbol
                                            name="location.fill"
                                            size={20}
                                            color={isSendingLocation ? subtextColor : primaryColor}
                                        />
                                    </TouchableOpacity>
                                ) : null}
                                <View style={styles.toolbarStack}>
                                    {replyingTo ? (
                                        <View style={[styles.replyComposerCard, { backgroundColor: cardColor, borderColor }]}>
                                            <View style={styles.replyComposerContent}>
                                                <Text style={[styles.replyComposerTitle, { color: primaryColor }]}>
                                                    Replying to {getSenderDisplayName(replyingTo.sender)}
                                                </Text>
                                                <Text numberOfLines={2} style={[styles.replyComposerText, { color: subtextColor }]}>
                                                    {getReplyPreviewText(replyingTo.message)}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => setReplyingTo(null)}
                                                style={styles.replyComposerClose}
                                            >
                                                <IconSymbol name="xmark" size={16} color={subtextColor} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null}
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
                                </View>
                                <TouchableOpacity
                                    onPress={handlePressSend}
                                    disabled={!composerText.trim() || isSending}
                                    style={[
                                        styles.sendButton,
                                        {
                                            backgroundColor: composerText.trim() && !isSending ? primaryColor : '#E5E7EB',
                                        },
                                    ]}
                                >
                                    <IconSymbol
                                        name="paperplane.fill"
                                        size={18}
                                        color={composerText.trim() && !isSending ? '#FFFFFF' : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        renderSend={() => null}
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
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    customHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    chatWrapper: {
        flex: 1,
    },
    headerIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleWrap: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 2,
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
    swipeRow: {
        position: 'relative',
        overflow: 'visible',
    },
    replyCue: {
        position: 'absolute',
        top: '50%',
        marginTop: -17,
    },
    replyCueLeft: {
        left: 6,
    },
    replyCueRight: {
        right: 6,
    },
    replyCueIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolbarRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        gap: 8,
    },
    toolbarStack: {
        flex: 1,
        overflow: 'visible',
    },
    locationActionButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationBubble: {
        maxWidth: 270,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        marginBottom: 4,
    },
    replySnippet: {
        borderLeftWidth: 3,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 8,
    },
    replySnippetAuthor: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    replySnippetText: {
        fontSize: 12,
        lineHeight: 16,
    },
    locationBubbleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    locationBubbleTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
    },
    locationBubbleSubtitle: {
        fontSize: 13,
        lineHeight: 18,
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
        paddingHorizontal: 0,
        paddingBottom: 6,
        flex: 1,
        zIndex: 1,
    },
    replyComposerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 18,
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 10,
        marginTop: 0,
        marginBottom: 6,
        zIndex: 2,
        elevation: 2,
    },
    replyComposerContent: {
        flex: 1,
        paddingRight: 8,
    },
    replyComposerTitle: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 3,
    },
    replyComposerText: {
        fontSize: 13,
        lineHeight: 18,
    },
    replyComposerClose: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
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
        minHeight: 48,
        fontSize: 15,
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
});
