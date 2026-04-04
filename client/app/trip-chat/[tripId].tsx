import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { Swipeable } from 'react-native-gesture-handler';
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

export interface ExtendedMessage extends IMessage {
    replyTo?: {
        documentId: string;
        message: string;
        sender: {
            name: string;
        };
    };
}

const toGiftedMessage = (message: TripChatMessage): ExtendedMessage => ({
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
    replyTo: message.replyTo ? {
        documentId: message.replyTo.documentId,
        message: message.replyTo.message,
        sender: {
            name: message.replyTo.sender.userProfile?.fullName || message.replyTo.sender.username || 'Rider',
        }
    } : undefined,
});

const fromGiftedMessage = (message: ExtendedMessage, fallbackUser: { id: number; username?: string; email?: string }, replyTo?: ExtendedMessage) => ({
    id: -1,
    documentId: String(message._id),
    message: message.text,
    createdAt: new Date(message.createdAt).toISOString(),
    replyTo: replyTo ? {
        documentId: String(replyTo._id),
        message: replyTo.text,
        createdAt: new Date().toISOString(),
        sender: {
            id: Number(replyTo.user._id),
            documentId: String(replyTo.user._id),
            username: replyTo.user.name || '',
            email: '',
            provider: 'local',
            confirmed: true,
            blocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            userProfile: undefined,
        }
    } : null,
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

const SwipeableMessageBubble = ({ 
    props, 
    children, 
    onSwipe 
}: { 
    props: any; 
    children: React.ReactNode;
    onSwipe: (message: ExtendedMessage) => void;
}) => {
    const swipeableRef = useRef<Swipeable>(null);
    const primaryColor = useThemeColor({}, 'primary');

    const renderSwipeAction = () => (
        <View style={{ justifyContent: 'center', alignItems: 'center', width: 50 }}>
            <View style={{ backgroundColor: `${primaryColor}22`, borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }}>
                <IconSymbol name="arrowshape.turn.up.left.fill" size={14} color={primaryColor} />
            </View>
        </View>
    );

    return (
        <Swipeable
            ref={swipeableRef}
            friction={2}
            leftThreshold={30}
            rightThreshold={30}
            containerStyle={{ zIndex: 100, overflow: 'visible' }}
            renderLeftActions={renderSwipeAction}
            renderRightActions={renderSwipeAction}
            onSwipeableWillOpen={() => {
                onSwipe(props.currentMessage);
                swipeableRef.current?.close();
            }}
        >
            {children}
        </Swipeable>
    );
};

export default function TripChatScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const [composerText, setComposerText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<ExtendedMessage | null>(null);
    const [isSendingLocation, setIsSendingLocation] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Array<{ userId: number; userName: string }>>([]);
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

    const handleSend = async (outgoingMessages: IMessage[] = []) => {
        const outgoing = outgoingMessages[0];
        const trimmedMessage = outgoing?.text?.trim();

        if (!tripId || !user || !trimmedMessage || isSending) return;

        if (stopTypingTimeoutRef.current) {
            clearTimeout(stopTypingTimeoutRef.current);
        }
        emitTypingState(false);

        const currentReplyTo = replyingTo;
        setReplyingTo(null);

        const optimisticMessage = fromGiftedMessage(
            {
                ...outgoing,
                _id: `optimistic-${Date.now()}`,
                text: trimmedMessage,
                createdAt: new Date(),
            },
            user,
            currentReplyTo || undefined
        );

        queryClient.setQueryData(['trip-chat-messages', tripId], (oldPages: InfiniteData<PaginatedTripChatMessages, string | null> | undefined) =>
            updatePaginatedMessages(oldPages, (oldMessages) => [
                optimisticMessage,
                ...oldMessages,
            ])
        );

        setComposerText('');
        setIsSending(true);

        try {
            const createdMessage = await tripChatService.sendMessage(tripId, trimmedMessage, {
                replyToDocumentId: currentReplyTo ? String(currentReplyTo._id) : undefined,
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
                },
                user
            );

            queryClient.setQueryData(['trip-chat-messages', tripId], (oldPages: InfiniteData<PaginatedTripChatMessages, string | null> | undefined) =>
                updatePaginatedMessages(oldPages, (oldMessages) => [
                    optimisticMessage,
                    ...oldMessages,
                ])
            );

            const createdMessage = await tripChatService.sendMessage(tripId, locationMessage);

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
            },
        ]);
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
                <View style={[styles.chatWrapper, { paddingTop: headerHeight }]}>
                    <GiftedChat
                        messages={giftedMessages}
                        onSend={handleSend}
                        user={{
                            _id: String(user?.id || ''),
                            name: user?.username || 'You',
                        }}
                        text={composerText}
                        scrollToBottom
                        renderCustomView={(props: any) => {
                            const { currentMessage, position } = props;
                            if (currentMessage?.replyTo) {
                                const isRight = position === 'right';

                                const bubbleBg = isRight ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.06)';
                                const barColor = isRight ? 'rgba(255,255,255,0.7)' : primaryColor;
                                const nameColor = isRight ? '#FFFFFF' : primaryColor;
                                const messageColor = isRight ? 'rgba(255,255,255,0.85)' : subtextColor;

                                return (
                                    <View style={[styles.replyBubbleView, { backgroundColor: bubbleBg }]}>
                                        <View style={[styles.replyBubbleBar, { backgroundColor: barColor }]} />
                                        <View style={styles.replyBubbleContent}>
                                            <Text style={[styles.replyBubbleName, { color: nameColor }]} numberOfLines={1}>
                                                {currentMessage.replyTo.sender.username || currentMessage.replyTo.sender.name}
                                            </Text>
                                            <Text style={[styles.replyBubbleMessage, { color: messageColor }]} numberOfLines={2}>
                                                {currentMessage.replyTo.message}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            }
                            return null;
                        }}
                        bottomOffset={insets.bottom}
                        renderAvatarOnTop
                        keyboardShouldPersistTaps="handled"
                        minInputToolbarHeight={60}
                        keyboardAvoidingViewProps={{ keyboardVerticalOffset: headerHeight }}
                        loadEarlier={Boolean(hasNextPage)}
                        onLoadEarlier={() => {
                            if (!isFetchingNextPage) {
                                void fetchNextPage();
                            }
                        }}
                        isLoadingEarlier={isFetchingNextPage}
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
                            <SwipeableMessageBubble props={props} onSwipe={setReplyingTo}>
                                {(() => {
                                    const locationPayload = parseLocationMessage(props.currentMessage?.text || '');

                                    if (locationPayload) {
                                        const isCurrentUser = String(props.currentMessage?.user?._id) === String(user?.id);

                                        return (
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
                                        );
                                    }

                                    return (
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
                                    );
                                })()}
                            </SwipeableMessageBubble>
                        )}
                        renderInputToolbar={(props: any) => (
                            <View>
                                {replyingTo && (
                                    <View style={[styles.replyPreviewContainer, { backgroundColor: cardColor, borderColor }]}>
                                        <View style={[styles.replyPreviewBar, { backgroundColor: primaryColor }]} />
                                        <View style={styles.replyPreviewContent}>
                                            <Text style={[styles.replyPreviewName, { color: primaryColor }]}>
                                                {replyingTo.user.name}
                                            </Text>
                                            <Text style={[styles.replyPreviewMessage, { color: subtextColor }]} numberOfLines={1}>
                                                {replyingTo.text}
                                            </Text>
                                        </View>
                                        <TouchableOpacity 
                                            onPress={() => setReplyingTo(null)}
                                            style={styles.replyPreviewClose}
                                        >
                                            <IconSymbol name="xmark.circle.fill" size={20} color={subtextColor} />
                                        </TouchableOpacity>
                                    </View>
                                )}
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
                </View>
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
    toolbarRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        gap: 8,
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
    replyPreviewContainer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
    },
    replyPreviewBar: {
        width: 4,
        borderRadius: 2,
        marginRight: 8,
    },
    replyPreviewContent: {
        flex: 1,
        justifyContent: 'center',
    },
    replyPreviewName: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 2,
    },
    replyPreviewMessage: {
        fontSize: 13,
    },
    replyPreviewClose: {
        padding: 4,
        justifyContent: 'center',
    },
    replyBubbleView: {
        flexDirection: 'row',
        borderRadius: 8,
        marginHorizontal: 8,
        marginTop: 6,
        marginBottom: 2,
        paddingRight: 8,
        overflow: 'hidden',
        minWidth: 140,
    },
    replyBubbleBar: {
        width: 4,
        marginRight: 8,
    },
    replyBubbleContent: {
        paddingVertical: 8,
        paddingRight: 6,
        flex: 1,
    },
    replyBubbleName: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    replyBubbleMessage: {
        fontSize: 12,
    },
});
