import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, FlatList, Image, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, TextInput, useWindowDimensions } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import Zoom from 'react-native-zoom-reanimated';
import {
    Bubble,
    GiftedChat,
    IMessage,
    InputToolbar,
} from 'react-native-gifted-chat';
import { Swipeable } from 'react-native-gesture-handler';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripChatService } from '@/services/trip-chat-service';
import { socketService } from '@/services/socket-service';
import { userService } from '@/services/user-service';
import { PaginatedTripChatMessages, TripChatMessage } from '@/types/api';
import { useAuth } from '@/context/auth-context';
import { ReportModal, ReportPayload } from '@/components/ReportModal';
import { saveReport } from '@/features/safety/report-service';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { ListPageSkeleton } from '@/components/skeleton/page-skeletons';

const LOCATION_MESSAGE_PREFIX = '__ride_location__::';
const MEDIA_MESSAGE_PREFIX = '__ride_media__::';

type ParsedLocationMessage = {
    latitude: number;
    longitude: number;
    label: string;
};

type ParsedMediaMessage = {
    url: string;
    caption: string;
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

const parseMediaMessage = (value: string): ParsedMediaMessage | null => {
    if (!value.startsWith(MEDIA_MESSAGE_PREFIX)) {
        return null;
    }

    try {
        const parsed = JSON.parse(value.slice(MEDIA_MESSAGE_PREFIX.length));
        if (typeof parsed.url !== 'string' || !parsed.url.trim()) {
            return null;
        }

        return {
            url: parsed.url,
            caption: typeof parsed.caption === 'string' ? parsed.caption : '',
        };
    } catch {
        return null;
    }
};

const buildLocationMessage = (payload: ParsedLocationMessage) =>
    `${LOCATION_MESSAGE_PREFIX}${JSON.stringify(payload)}`;

const buildMediaMessage = (payload: ParsedMediaMessage) =>
    `${MEDIA_MESSAGE_PREFIX}${JSON.stringify(payload)}`;

const summarizeMessageContent = (value: string) => {
    const mediaPayload = parseMediaMessage(value);
    if (mediaPayload) {
        return mediaPayload.caption.trim() || 'Photo';
    }

    const locationPayload = parseLocationMessage(value);
    if (locationPayload) {
        return locationPayload.label || 'Shared location';
    }

    return value;
};

export interface ExtendedMessage extends IMessage {
    replyTo?: {
        documentId: string;
        message: string;
        sender: {
            name: string;
        };
    };
    media?: ParsedMediaMessage;
}

type PendingMediaDraft = {
    localUri: string;
    caption: string;
    replyTo?: ExtendedMessage;
};

const toGiftedMessage = (message: TripChatMessage): ExtendedMessage => {
    const media = parseMediaMessage(message.message);

    return {
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
        media: media || undefined,
    };
};

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
        <Box className="w-[50px] items-center justify-center">
            <Box className="w-[30px] h-[30px] rounded-xl items-center justify-center" style={{ backgroundColor: `${primaryColor}22` }}>
                <IconSymbol name="arrowshape.turn.up.left.fill" size={14} color={primaryColor} />
            </Box>
        </Box>
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
    const [composerHeight, setComposerHeight] = useState(48);
    const [isSending, setIsSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<ExtendedMessage | null>(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    const [activeMessageMenuId, setActiveMessageMenuId] = useState<string | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState<{
        userId: number;
        userName: string;
        messageDocumentId?: string | null;
        messagePreview?: string | null;
    } | null>(null);
    const [isSendingLocation, setIsSendingLocation] = useState(false);
    const [isSendingMedia, setIsSendingMedia] = useState(false);
    const [previewMedia, setPreviewMedia] = useState<ParsedMediaMessage | null>(null);
    const [pendingMediaDraft, setPendingMediaDraft] = useState<PendingMediaDraft | null>(null);
    const [typingUsers, setTypingUsers] = useState<{ userId: number; userName: string }[]>([]);
    const isTypingRef = useRef(false);
    const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isChatScreenActiveRef = useRef(false);
    const flatListRef = useRef<FlatList<any>>(null);
    const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mediaSheetRef = useRef<BottomSheetModal>(null);
    const keyboardHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const onShow = (e: any) => {
            Animated.timing(keyboardHeight, {
                toValue: e.endCoordinates.height,
                duration: Platform.OS === 'ios' ? e.duration : 200,
                useNativeDriver: false,
            }).start();
        };

        const onHide = (e: any) => {
            Animated.timing(keyboardHeight, {
                toValue: 0,
                duration: Platform.OS === 'ios' ? (e?.duration ?? 200) : 200,
                useNativeDriver: false,
            }).start();
        };

        const showSub = Keyboard.addListener(showEvent, onShow);
        const hideSub = Keyboard.addListener(hideEvent, onHide);

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [keyboardHeight]);

    const flashMessageHighlight = (messageId: string) => {
        if (highlightTimeoutRef.current) {
            clearTimeout(highlightTimeoutRef.current);
        }

        setHighlightedMessageId(messageId);
        highlightTimeoutRef.current = setTimeout(() => {
            setHighlightedMessageId((current) => current === messageId ? null : current);
            highlightTimeoutRef.current = null;
        }, 1500);
    };

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            flatListRef.current?.scrollToOffset?.({
                offset: 0,
                animated: true,
            });
        });
    };

    const scrollToMessage = (messageId: string) => {
        const index = giftedMessages.findIndex((m) => String(m._id) === String(messageId));

        if (index === -1) {
            Toast.show({
                type: 'info',
                text1: 'Message not found',
                text2: "The original message might be too old or deleted.",
            });
            return;
        }

        const list: any = flatListRef.current;
        if (!list) {
            Toast.show({
                type: 'error',
                text1: 'Scroll Error',
                text2: "The chat list surface could not be found.",
            });
            return;
        }

        const actualList =
            (list.scrollToIndex && typeof list.scrollToIndex === 'function' ? list : null) ||
            (list.flatListRef?.current && typeof list.flatListRef.current.scrollToIndex === 'function' ? list.flatListRef.current : null) ||
            (list.getNode && typeof list.getNode().scrollToIndex === 'function' ? list.getNode() : null) ||
            (list._listRef && typeof list._listRef.scrollToIndex === 'function' ? list._listRef : null);

        if (actualList) {
            try {
                actualList.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
                flashMessageHighlight(String(messageId));
            } catch (e) {
                console.log('Failed to scroll:', e);
                Toast.show({ type: 'error', text1: 'Scroll Error', text2: 'Item is not measured yet.' });
            }
        }
    };

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');
    const dangerColor = useThemeColor({}, 'danger');
    const headerHeight = insets.top + 64;
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const previewViewportWidth = Math.max(windowWidth - 32, 1);
    const previewViewportHeight = Math.max(windowHeight - 180, 1);
    const modalTopInset = Math.max(insets.top, 12);

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
            if (highlightTimeoutRef.current) {
                clearTimeout(highlightTimeoutRef.current);
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

    const openSharedMedia = (payload: ParsedMediaMessage) => {
        setPreviewMedia(payload);
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

    const handleComposerContentSizeChange = (event: any) => {
        const nextHeight = Math.min(160, Math.max(48, event.nativeEvent.contentSize.height + 8));
        setComposerHeight(nextHeight);
    };

    const renderMediaSheetBackdrop = (props: any) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} />
    );

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
        setActiveMessageMenuId(null);
        setComposerHeight(48);

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
        scrollToBottom();

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
            setComposerHeight(48);
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

    const setSelectedMediaDraft = (localUri?: string | null) => {
        if (!localUri) {
            return;
        }

        setPendingMediaDraft({
            localUri,
            caption: '',
            replyTo: replyingTo || undefined,
        });
    };

    const handleOpenGallery = async () => {
        if (!tripId || !user || isSending || isSendingMedia) {
            return;
        }

        try {
            mediaSheetRef.current?.dismiss();
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.status !== 'granted') {
                Toast.show({
                    type: 'info',
                    text1: 'Photos Permission Needed',
                    text2: 'Allow photo access to share images in the ride chat.',
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.6,
            });

            if (!result.canceled) {
                setSelectedMediaDraft(result.assets?.[0]?.uri);
            }
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Image Failed',
                text2: 'Unable to open your gallery right now.',
            });
        }
    };

    const handleOpenCamera = async () => {
        if (!tripId || !user || isSending || isSendingMedia) {
            return;
        }

        try {
            mediaSheetRef.current?.dismiss();
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.status !== 'granted') {
                Toast.show({
                    type: 'info',
                    text1: 'Camera Permission Needed',
                    text2: 'Allow camera access to take a photo in the ride chat.',
                });
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedMediaDraft(result.assets?.[0]?.uri);
            }
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Image Failed',
                text2: 'Unable to open your camera right now.',
            });
        }
    };

    const handlePickAndSendMedia = () => {
        if (!tripId || !user || isSending || isSendingMedia) {
            return;
        }

        mediaSheetRef.current?.present();
    };

    const handleSendPendingMedia = async () => {
        if (!tripId || !user || !pendingMediaDraft || isSendingMedia) {
            return;
        }

        const currentReplyTo = pendingMediaDraft.replyTo;
        const mediaCaption = pendingMediaDraft.caption.trim();
        let optimisticDocumentId: string | null = null;

        setIsSendingMedia(true);

        try {
            const uploadedUrl = await userService.uploadFile(pendingMediaDraft.localUri);
            const mediaMessage = buildMediaMessage({
                url: uploadedUrl,
                caption: mediaCaption,
            });

            setReplyingTo(null);
            setActiveMessageMenuId(null);
            setPendingMediaDraft(null);

            optimisticDocumentId = `optimistic-media-${Date.now()}`;
            const optimisticMessage = fromGiftedMessage(
                {
                    _id: optimisticDocumentId,
                    text: mediaMessage,
                    createdAt: new Date(),
                    user: {
                        _id: String(user.id),
                        name: user.username || 'You',
                    },
                    media: {
                        url: uploadedUrl,
                        caption: mediaCaption,
                    },
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
            scrollToBottom();

            const createdMessage = await tripChatService.sendMessage(tripId, mediaMessage, {
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
            if (optimisticDocumentId) {
                queryClient.setQueryData(['trip-chat-messages', tripId], (oldPages: InfiniteData<PaginatedTripChatMessages, string | null> | undefined) =>
                    updatePaginatedMessages(oldPages, (oldMessages) =>
                        oldMessages.filter((item) => item.documentId !== optimisticDocumentId)
                    )
                );
            }

            Toast.show({
                type: 'error',
                text1: 'Image Failed',
                text2: 'Unable to share your image right now.',
            });
        } finally {
            setIsSendingMedia(false);
        }
    };

    const handlePressSend = () => {
        const trimmedMessage = composerText.trim();
        if (!trimmedMessage || isSending || isSendingMedia) {
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

    const handleOpenReport = (message: ExtendedMessage) => {
        const senderId = Number(message.user._id);
        if (!senderId || senderId === user?.id) {
            return;
        }

        setReportTarget({
            userId: senderId,
            userName: message.user.name || 'Rider',
            messageDocumentId: String(message._id),
            messagePreview: summarizeMessageContent(message.text),
        });
        setActiveMessageMenuId(null);
        setShowReportModal(true);
    };

    const handleSubmitReport = async (payload: ReportPayload) => {
        await saveReport(payload);
    };

    const handleOpenMessageActions = (message: ExtendedMessage) => {
        const messageId = String(message._id);
        setActiveMessageMenuId((current) => current === messageId ? null : messageId);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['left', 'right', 'bottom']}>
            <Modal
                visible={!!pendingMediaDraft}
                transparent={false}
                animationType="slide"
                onRequestClose={() => !isSendingMedia && setPendingMediaDraft(null)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor }}>
                    {/* Header */}
                    <HStack
                        className="items-center justify-between px-5 py-3 border-b"
                        style={{ borderBottomColor: borderColor }}
                    >
                        <Pressable
                            onPress={() => setPendingMediaDraft(null)}
                            disabled={isSendingMedia}
                            className="w-10 h-10 rounded-full items-center justify-center border"
                            style={{ borderColor, backgroundColor: cardColor }}
                        >
                            <IconSymbol name="xmark" size={18} color={textColor} />
                        </Pressable>
                        <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                            Send photo
                        </Text>
                        <Box className="w-10" />
                    </HStack>

                    {pendingMediaDraft ? (
                        <Box className="flex-1">
                            {/* Image — vertically centered, 45% of screen */}
                            <Box className="flex-1 items-center justify-center px-4">
                                <Box
                                    className="w-full rounded-[24px] overflow-hidden items-center justify-center"
                                    style={{
                                        backgroundColor: '#000',
                                        height: windowHeight * 0.45,
                                    }}
                                >
                                    <Image
                                        source={{ uri: pendingMediaDraft.localUri }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="contain"
                                    />
                                </Box>
                            </Box>

                            {/* Floating bottom bar — moves up with keyboard */}
                            <Animated.View
                                style={{
                                    paddingHorizontal: 16,
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    backgroundColor,
                                    borderTopWidth: 1,
                                    borderTopColor: borderColor,
                                    marginBottom: keyboardHeight,
                                }}
                            >
                                {/* Reply preview */}
                                {pendingMediaDraft.replyTo ? (
                                    <HStack className="border rounded-2xl px-4 py-3 items-center mb-3" style={{ backgroundColor: cardColor, borderColor }} space="sm">
                                        <Box className="w-1 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
                                        <VStack className="flex-1">
                                            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                                                Replying to {pendingMediaDraft.replyTo.user.name}
                                            </Text>
                                            <Text className="text-xs font-medium" style={{ color: subtextColor }} numberOfLines={1}>
                                                {summarizeMessageContent(pendingMediaDraft.replyTo.text)}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                ) : null}

                                {/* Caption input + Send button */}
                                <HStack className="items-end" space="sm">
                                    <TextInput
                                        value={pendingMediaDraft.caption}
                                        onChangeText={(caption) =>
                                            setPendingMediaDraft((current) => current ? { ...current, caption } : current)
                                        }
                                        placeholder="Add a caption..."
                                        placeholderTextColor={subtextColor}
                                        multiline
                                        maxLength={300}
                                        style={{
                                            flex: 1,
                                            color: textColor,
                                            backgroundColor: cardColor,
                                            borderColor,
                                            borderWidth: 2,
                                            borderRadius: 24,
                                            paddingHorizontal: 16,
                                            paddingTop: 12,
                                            paddingBottom: 12,
                                            fontSize: 15,
                                            minHeight: 48,
                                            maxHeight: 100,
                                            textAlignVertical: 'top',
                                        }}
                                    />
                                    <Pressable
                                        onPress={handleSendPendingMedia}
                                        disabled={isSendingMedia}
                                        className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
                                        style={{ backgroundColor: isSendingMedia ? `${subtextColor}33` : primaryColor }}
                                    >
                                        {isSendingMedia ? (
                                            <IconSymbol name="hourglass" size={18} color="#FFFFFF" />
                                        ) : (
                                            <IconSymbol name="paperplane.fill" size={18} color="#FFFFFF" />
                                        )}
                                    </Pressable>
                                </HStack>
                            </Animated.View>
                        </Box>
                    ) : null}
                </SafeAreaView>
            </Modal>

            <Modal
                visible={!!previewMedia}
                transparent
                animationType="fade"
                onRequestClose={() => setPreviewMedia(null)}
            >
                <Box className="flex-1 bg-black/95">
                    <SafeAreaView style={{ flex: 1 }}>
                        <Pressable
                            className="absolute inset-0"
                            onPress={() => setPreviewMedia(null)}
                        />

                        {/* Header */}
                        <HStack className="justify-between items-center px-4 py-2">
                            <Pressable
                                onPress={() => setPreviewMedia(null)}
                                className="w-10 h-10 rounded-full items-center justify-center bg-white/10"
                            >
                                <IconSymbol name="xmark" size={22} color="#FFFFFF" />
                            </Pressable>
                        </HStack>

                        {previewMedia ? (
                            <>
                                {/* Zoomable image — centered */}
                                <Box className="flex-1 justify-center items-center px-4">
                                    <Zoom
                                        style={{ flex: 1, width: '100%' }}
                                        contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' } as any}
                                        minScale={1}
                                        maxScale={5}
                                        doubleTapConfig={{ defaultScale: 2.5, maxZoomScale: 5 }}
                                    >
                                        <Image
                                            source={{ uri: previewMedia.url }}
                                            style={{
                                                width: previewViewportWidth,
                                                height: previewViewportHeight,
                                            }}
                                            resizeMode="contain"
                                        />
                                    </Zoom>
                                </Box>

                                {/* Caption — pinned at bottom, inside safe area */}
                                {previewMedia.caption ? (
                                    <Box className="px-6 pb-3 pt-2">
                                        <Text className="text-white text-[15px] font-medium text-center leading-[22px]">
                                            {previewMedia.caption}
                                        </Text>
                                    </Box>
                                ) : null}
                            </>
                        ) : null}
                    </SafeAreaView>
                </Box>
            </Modal>

            {reportTarget ? (
                <ReportModal
                    visible={showReportModal}
                    onClose={() => {
                        setShowReportModal(false);
                        setReportTarget(null);
                    }}
                    onSubmit={handleSubmitReport}
                    reportedUserId={reportTarget.userId}
                    reportedUserName={reportTarget.userName}
                    reporterUserId={user?.id}
                    tripDocumentId={tripId}
                    source="trip_chat"
                    context="message"
                    targetType="MESSAGE"
                    messageDocumentId={reportTarget.messageDocumentId}
                    messagePreview={reportTarget.messagePreview}
                />
            ) : null}

            <BottomSheetModal
                ref={mediaSheetRef}
                index={0}
                snapPoints={['50%']}
                backdropComponent={renderMediaSheetBackdrop}
                backgroundStyle={{ backgroundColor: cardColor }}
                handleIndicatorStyle={{ backgroundColor: subtextColor }}
            >
                <BottomSheetView style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 70 }}>
                    <VStack space="lg">
                        <VStack space="xs" className="items-center">
                            <Text className="text-lg font-extrabold" style={{ color: textColor }}>
                                Share Image
                            </Text>

                        </VStack>

                        <HStack space="md">
                            <Pressable
                                onPress={() => void handleOpenCamera()}
                                className="flex-1 rounded-[28px] border px-4 py-5 items-center"
                                style={{ backgroundColor: backgroundColor, borderColor }}
                            >
                                <Box
                                    className="w-14 h-14 rounded-full items-center justify-center mb-3"
                                    style={{ backgroundColor: `${primaryColor}14` }}
                                >
                                    <IconSymbol name="camera.fill" size={22} color={primaryColor} />
                                </Box>
                                <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                                    Camera
                                </Text>
                                <Text className="text-xs text-center mt-2 leading-5" style={{ color: subtextColor }}>
                                    Take a new photo
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => void handleOpenGallery()}
                                className="flex-1 rounded-[28px] border px-4 py-5 items-center"
                                style={{ backgroundColor: backgroundColor, borderColor }}
                            >
                                <Box
                                    className="w-14 h-14 rounded-full items-center justify-center mb-3"
                                    style={{ backgroundColor: `${primaryColor}14` }}
                                >
                                    <IconSymbol name="photo.fill" size={22} color={primaryColor} />
                                </Box>
                                <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                                    Gallery
                                </Text>
                                <Text className="text-xs text-center mt-2 leading-5" style={{ color: subtextColor }}>
                                    Choose from photos
                                </Text>
                            </Pressable>
                        </HStack>

                        <Pressable
                            onPress={() => mediaSheetRef.current?.dismiss()}
                            className="rounded-2xl border py-4 items-center"
                            style={{ borderColor, backgroundColor }}
                        >
                            <Text className="text-sm font-bold" style={{ color: textColor }}>
                                Cancel
                            </Text>
                        </Pressable>
                    </VStack>
                </BottomSheetView>
            </BottomSheetModal>

            <Box
                className="absolute top-0 left-0 right-0 z-20 border-b flex-row items-center px-4"
                style={{
                    backgroundColor,
                    borderBottomColor: borderColor,
                    paddingTop: insets.top + 8,
                    height: headerHeight,
                }}
            >
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full items-center justify-center"
                >
                    <IconSymbol name="chevron.left" size={22} color={textColor} />
                </Pressable>

                <VStack className="flex-1 items-center px-3">
                    <Text className="text-[17px] font-extrabold uppercase tracking-widest" style={{ color: textColor }}>Ride Chat</Text>
                    <Text className="text-[10px] font-bold uppercase mt-0.5" style={{ color: subtextColor }}>
                        Approved Riders only
                    </Text>
                </VStack>

                <Pressable
                    onPress={() => router.push(`/trip-chat-members/${tripId}`)}
                    className="w-10 h-10 rounded-full items-center justify-center"
                >
                    <IconSymbol name="info.circle.fill" size={22} color={textColor} />
                </Pressable>
            </Box>

            {isLoadingAccess || isLoadingMessages ? (
                <Box className="flex-1" style={{ backgroundColor, paddingTop: headerHeight }}>
                    <ListPageSkeleton showHeader={false} />
                </Box>
            ) : isBlocked ? (
                <Box className="flex-1 items-center justify-center px-8" style={{ backgroundColor, paddingTop: headerHeight }}>
                    <Box className="w-20 h-20 rounded-[32px] items-center justify-center mb-6 bg-gray-50 shadow-xl rotate-3">
                        <IconSymbol name="bubble.left.and.bubble.right.fill" size={34} color={primaryColor} />
                    </Box>
                    <Text className="text-2xl font-extrabold mb-2 text-center" style={{ color: textColor }}>
                        Access Restricted
                    </Text>
                    <Text className="text-sm font-medium leading-6 text-center" style={{ color: subtextColor }}>
                        This exclusive ride chat is only available for the captain and approved riders while the trip is live.
                    </Text>
                </Box>
            ) : (
                <Box className="flex-1" style={{ paddingTop: headerHeight }}>
                    <GiftedChat
                        messages={giftedMessages}
                        onSend={handleSend}
                        user={{
                            _id: String(user?.id || ''),
                            name: user?.username || 'You',
                        }}
                        text={composerText}
                        scrollToBottom
                        onLongPressMessage={(_: any, message: ExtendedMessage) => handleOpenMessageActions(message)}
                        renderCustomView={(props: any) => {
                            const { currentMessage, position } = props;
                            if (currentMessage?.replyTo) {
                                const isRight = position === 'right';

                                const bubbleBg = isRight ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.06)';
                                const barColor = isRight ? 'rgba(255,255,255,0.7)' : primaryColor;
                                const nameColor = isRight ? '#FFFFFF' : primaryColor;
                                const messageColor = isRight ? 'rgba(255,255,255,0.85)' : subtextColor;

                                return (
                                    <Pressable
                                        onPress={() => scrollToMessage(currentMessage.replyTo.documentId)}
                                        className="flex-row rounded-lg mx-2 mt-1.5 mb-1 pr-2 overflow-hidden min-w-[140px]"
                                        style={{ backgroundColor: bubbleBg }}
                                    >
                                        <Box className="w-1" style={{ backgroundColor: barColor }} />
                                        <VStack className="py-2 pr-1.5 flex-1 ml-2">
                                            <Text className="text-[11px] font-extrabold uppercase tracking-tight" style={{ color: nameColor }} numberOfLines={1}>
                                                {currentMessage.replyTo.sender.username || currentMessage.replyTo.sender.name}
                                            </Text>
                                            <Text className="text-[11px] font-medium mt-0.5" style={{ color: messageColor }} numberOfLines={2}>
                                                {summarizeMessageContent(currentMessage.replyTo.message)}
                                            </Text>
                                        </VStack>
                                    </Pressable>
                                );
                            }
                            return null;
                        }}
                        bottomOffset={insets.bottom}
                        renderAvatarOnTop
                        keyboardShouldPersistTaps="handled"
                        minInputToolbarHeight={64}
                        minComposerHeight={48}
                        maxComposerHeight={160}
                        keyboardAvoidingViewProps={{ keyboardVerticalOffset: headerHeight }}
                        loadEarlier={Boolean(hasNextPage)}
                        onLoadEarlier={() => {
                            if (!isFetchingNextPage) {
                                void fetchNextPage();
                            }
                        }}
                        isLoadingEarlier={isFetchingNextPage}
                        timeTextStyle={{
                            right: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700' },
                            left: { color: subtextColor, fontSize: 10, fontWeight: '700' },
                        }}
                        messagesContainerStyle={{ backgroundColor }}
                        textInputProps={{
                            onChangeText: handleComposerChange,
                            placeholder: 'Message group...',
                            placeholderTextColor: subtextColor,
                            multiline: true,
                        }}
                        messagesContainerRef={flatListRef as any}
                        listProps={{
                            ref: (r: any) => {
                                if (r) {
                                    flatListRef.current = r;
                                }
                            },
                            contentContainerStyle: giftedMessages.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : undefined,
                            onScrollToIndexFailed: (info: any) => {
                                const offset = info.averageItemLength * info.index;
                                if (flatListRef.current && typeof (flatListRef.current as any).scrollToOffset === 'function') {
                                    (flatListRef.current as any).scrollToOffset({ offset, animated: true });
                                    setTimeout(() => {
                                        if (flatListRef.current && typeof (flatListRef.current as any).scrollToIndex === 'function') {
                                            (flatListRef.current as any).scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
                                        }
                                    }, 100);
                                }
                            }
                        }}
                        renderBubble={(props: any) => {
                            const currentMessage = props.currentMessage as ExtendedMessage;
                            const messageId = String(currentMessage?._id);
                            const locationPayload = parseLocationMessage(currentMessage?.text || '');
                            const mediaPayload = currentMessage?.media || parseMediaMessage(currentMessage?.text || '');
                            const isCurrentUser = String(currentMessage?.user?._id) === String(user?.id);
                            const isHighlighted = messageId === highlightedMessageId;
                            const isMenuOpen = messageId === activeMessageMenuId;

                            return (
                                <SwipeableMessageBubble props={props} onSwipe={setReplyingTo}>
                                    <Box className="max-w-full" style={{ alignItems: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                                        {isMenuOpen ? (
                                            <VStack
                                                className="border-2 rounded-2xl py-2 min-w-[150px] mb-2 shadow-xl"
                                                style={{
                                                    backgroundColor: cardColor,
                                                    borderColor: primaryColor + '40',
                                                    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                                                }}
                                            >
                                                <Pressable
                                                    className="flex-row items-center gap-2.5 px-4 py-2.5"
                                                    onPress={() => {
                                                        setReplyingTo(currentMessage);
                                                        setActiveMessageMenuId(null);
                                                    }}
                                                >
                                                    <IconSymbol name="arrowshape.turn.up.left.fill" size={16} color={primaryColor} />
                                                    <Text className="text-[13px] font-extrabold uppercase tracking-widest" style={{ color: textColor }}>Reply</Text>
                                                </Pressable>
                                                {!isCurrentUser ? (
                                                    <Pressable
                                                        className="flex-row items-center gap-2.5 px-4 py-2.5"
                                                        onPress={() => handleOpenReport(currentMessage)}
                                                    >
                                                        <IconSymbol name="exclamationmark.bubble.fill" size={16} color={dangerColor} />
                                                        <Text className="text-[13px] font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>Report user</Text>
                                                    </Pressable>
                                                ) : null}
                                                <Pressable
                                                    className="flex-row items-center gap-2.5 px-4 py-2.5 border-t"
                                                    style={{ borderTopColor: borderColor }}
                                                    onPress={() => setActiveMessageMenuId(null)}
                                                >
                                                    <IconSymbol name="xmark" size={14} color={subtextColor} />
                                                    <Text className="text-[11px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Dismiss</Text>
                                                </Pressable>
                                            </VStack>
                                        ) : null}
                                        {locationPayload ? (
                                            <Pressable
                                                onPress={() => openSharedLocation(locationPayload)}
                                                className="max-w-[270px] rounded-[24px] px-4 py-4 border-2 mb-1 shadow-sm"
                                                style={{
                                                    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                                                    backgroundColor: isHighlighted
                                                        ? (isCurrentUser ? '#2FBF71' : `${primaryColor}14`)
                                                        : (isCurrentUser ? primaryColor : cardColor),
                                                    borderColor: isHighlighted ? primaryColor : (isCurrentUser ? primaryColor + '40' : borderColor),
                                                }}
                                            >
                                                <HStack className="items-center mb-2" space="sm">
                                                    <Box className="w-8 h-8 rounded-full items-center justify-center bg-white/20">
                                                        <IconSymbol
                                                            name="location.fill"
                                                            size={16}
                                                            color={isCurrentUser ? '#FFFFFF' : primaryColor}
                                                        />
                                                    </Box>
                                                    <Text
                                                        className="flex-1 text-[15px] font-extrabold"
                                                        style={{ color: isCurrentUser ? '#FFFFFF' : textColor }}
                                                    >
                                                        {locationPayload.label}
                                                    </Text>
                                                </HStack>
                                                <Text
                                                    className="text-[11px] font-bold uppercase tracking-tight"
                                                    style={{ color: isCurrentUser ? 'rgba(255,255,255,0.85)' : subtextColor }}
                                                >
                                                    Open in Google Maps
                                                </Text>
                                            </Pressable>
                                        ) : mediaPayload ? (
                                            <Pressable
                                                onPress={() => openSharedMedia(mediaPayload)}
                                                className="max-w-[270px] rounded-[24px] p-2.5 border-2 mb-1 shadow-sm overflow-hidden"
                                                style={{
                                                    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                                                    backgroundColor: isCurrentUser ? primaryColor : cardColor,
                                                    borderColor: isHighlighted ? primaryColor : (isCurrentUser ? primaryColor + '40' : borderColor),
                                                }}
                                            >
                                                <Image
                                                    source={{ uri: mediaPayload.url }}
                                                    className="w-[245px] h-[220px] rounded-[18px] bg-gray-100"
                                                    resizeMode="cover"
                                                />
                                                {mediaPayload.caption ? (
                                                    <Text
                                                        className="text-sm font-medium mt-3 mx-1 leading-5"
                                                        style={{ color: isCurrentUser ? '#FFFFFF' : textColor }}
                                                    >
                                                        {mediaPayload.caption}
                                                    </Text>
                                                ) : null}

                                            </Pressable>
                                        ) : (
                                            <Bubble
                                                {...props}
                                                wrapperStyle={{
                                                    right: {
                                                        backgroundColor: isHighlighted ? '#2FBF71' : primaryColor,
                                                        borderWidth: isHighlighted ? 2 : 0,
                                                        borderColor: '#fff',
                                                        borderRadius: 24,
                                                        padding: 2,
                                                    },
                                                    left: {
                                                        backgroundColor: isHighlighted ? `${primaryColor}14` : cardColor,
                                                        borderWidth: isHighlighted ? 2 : 2,
                                                        borderColor: isHighlighted ? primaryColor : borderColor,
                                                        borderRadius: 24,
                                                        padding: 2,
                                                    },
                                                }}
                                                textStyle={{
                                                    right: { color: '#FFFFFF', fontSize: 14, lineHeight: 20, fontWeight: '500' },
                                                    left: { color: textColor, fontSize: 14, lineHeight: 20, fontWeight: '500' },
                                                }}
                                            />
                                        )}
                                    </Box>
                                </SwipeableMessageBubble>
                            );
                        }}
                        renderInputToolbar={(props: any) => (
                            <Box>
                                {replyingTo && (
                                    <HStack className="px-4 py-3 border-t items-center" style={{ backgroundColor: cardColor, borderTopColor: borderColor }} space="md">
                                        <Box className="w-1 h-10 rounded-full" style={{ backgroundColor: primaryColor }} />
                                        <VStack className="flex-1">
                                            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                                                {replyingTo.user.name}
                                            </Text>
                                            <Text className="text-[13px] font-medium" style={{ color: subtextColor }} numberOfLines={1}>
                                                {replyingTo.text}
                                            </Text>
                                        </VStack>
                                        <Pressable
                                            onPress={() => setReplyingTo(null)}
                                            className="p-1.5"
                                        >
                                            <IconSymbol name="xmark.circle.fill" size={20} color={subtextColor} />
                                        </Pressable>
                                    </HStack>
                                )}
                                <HStack className="items-end px-3 pb-3 pt-1 gap-2.5" style={{ backgroundColor }}>
                                    <Pressable
                                        onPress={handlePickAndSendMedia}
                                        disabled={isSendingMedia || isSending}
                                        className="w-12 h-12 rounded-full items-center justify-center border shadow-sm"
                                        style={{
                                            backgroundColor: isSendingMedia ? `${subtextColor}22` : `${primaryColor}10`,
                                            borderColor: isSendingMedia ? borderColor : primaryColor + '20'
                                        }}
                                    >
                                        <IconSymbol
                                            name="camera.fill"
                                            size={18}
                                            color={isSendingMedia ? subtextColor : primaryColor}
                                        />
                                    </Pressable>
                                    {chatAccess?.isCaptain ? (
                                        <Pressable
                                            onPress={handleShareCurrentLocation}
                                            disabled={isSendingLocation || isSendingMedia}
                                            className="w-12 h-12 rounded-full items-center justify-center border shadow-sm"
                                            style={{
                                                backgroundColor: isSendingLocation ? `${subtextColor}22` : `${primaryColor}10`,
                                                borderColor: isSendingLocation ? borderColor : primaryColor + '20'
                                            }}
                                        >
                                            <IconSymbol
                                                name="location.fill"
                                                size={18}
                                                color={isSendingLocation ? subtextColor : primaryColor}
                                            />
                                        </Pressable>
                                    ) : null}
                                    <InputToolbar
                                        {...props}
                                        containerStyle={{
                                            borderTopWidth: 0,
                                            paddingTop: 0,
                                            paddingHorizontal: 0,
                                            paddingBottom: 0,
                                            flex: 1,
                                            backgroundColor: 'transparent',
                                        }}
                                        primaryStyle={{ alignItems: 'flex-end', alignSelf: 'stretch' }}
                                    />
                                    <Pressable
                                        onPress={handlePressSend}
                                        disabled={!composerText.trim() || isSending || isSendingMedia}
                                        className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
                                        style={{
                                            backgroundColor: composerText.trim() && !isSending && !isSendingMedia ? primaryColor : '#E5E7EB',
                                        }}
                                    >
                                        <IconSymbol
                                            name="paperplane.fill"
                                            size={18}
                                            color={composerText.trim() && !isSending && !isSendingMedia ? '#FFFFFF' : '#9CA3AF'}
                                        />
                                    </Pressable>
                                </HStack>
                            </Box>
                        )}
                        renderComposer={(props: any) => (
                            <TextInput
                                value={composerText}
                                onChangeText={handleComposerChange}
                                onContentSizeChange={handleComposerContentSizeChange}
                                placeholder={props.placeholder || 'Message group...'}
                                placeholderTextColor={subtextColor}
                                multiline
                                scrollEnabled={composerHeight >= 160}
                                textAlignVertical="top"
                                style={{
                                    flex: 1,
                                    color: textColor,
                                    backgroundColor: cardColor,
                                    borderColor,
                                    borderWidth: 2,
                                    borderRadius: 24,
                                    paddingHorizontal: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    fontSize: 15,
                                    minHeight: 48,
                                    height: composerHeight,
                                    maxHeight: 160,
                                }}
                            />
                        )}
                        renderSend={() => null}
                        renderChatEmpty={() => (
                            <Box className="items-center px-10 py-10" style={{ transform: [{ rotate: '180deg' }] }}>
                                <Text className="text-xl font-extrabold text-center uppercase tracking-widest" style={{ color: textColor }}>
                                    Launch Pad
                                </Text>
                                <Text className="text-sm font-medium leading-6 text-center mt-2" style={{ color: subtextColor }}>
                                    This is the start of your ride community. coordinate and ride safely!
                                </Text>
                            </Box>
                        )}
                        renderChatFooter={() => (typingText ? (
                            <Box className="px-5 pb-3">
                                <Text className="text-[11px] font-bold italic uppercase tracking-tight" style={{ color: subtextColor }}>
                                    {typingText}
                                </Text>
                            </Box>
                        ) : null)}
                    />
                </Box>
            )}
        </SafeAreaView>
    );
}
