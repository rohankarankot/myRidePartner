import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Bubble,
    GiftedChat,
    IMessage,
    InputToolbar,
} from 'react-native-gifted-chat';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useThemeColor } from '@/hooks/use-theme-color';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { communityGroupService } from '@/services/community-group-service';
import { analyticsService } from '@/services/analytics-service';
import { socketService } from '@/services/socket-service';
import { PaginatedCommunityGroupMessages, CommunityGroupMessage } from '@/types/api';
import { useAuth } from '@/context/auth-context';
import { ReportModal, ReportPayload } from '@/features/safety/components/ReportModal';
import { saveReport } from '@/features/safety/report-service';
import { Box } from '@/components/ui/box';
import { Text as GSText } from '@/components/ui/text';
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

const MESSAGE_PAGE_SIZE = 40;

interface ExtendedMessage extends IMessage {
    replyTo?: {
        documentId: string;
        message: string;
        createdAt: string;
        sender: {
            id: number;
            username: string;
            name: string;
            avatar?: string;
        };
    } | null;
}

const toGiftedMessage = (message: CommunityGroupMessage): ExtendedMessage => ({
    _id: message.documentId,
    text: message.message,
    createdAt: new Date(message.createdAt),
    user: {
        _id: String(message.sender.id),
        name: message.sender.userProfile?.fullName || message.sender.username || 'Member',
        avatar: typeof message.sender.userProfile?.avatar === 'string'
            ? message.sender.userProfile.avatar
            : message.sender.userProfile?.avatar?.url,
    },
    sent: !message.documentId.startsWith('optimistic-'),
    pending: message.documentId.startsWith('optimistic-'),
    replyTo: message.replyTo ? {
        documentId: message.replyTo.documentId,
        message: message.replyTo.message,
        createdAt: message.replyTo.createdAt,
        sender: {
            id: message.replyTo.sender.id,
            username: message.replyTo.sender.username,
            name: message.replyTo.sender.userProfile?.fullName || message.replyTo.sender.username || 'Member',
            avatar: typeof message.replyTo.sender.userProfile?.avatar === 'string'
                ? message.replyTo.sender.userProfile?.avatar
                : message.replyTo.sender.userProfile?.avatar?.url,
        }
    } : null,
});

const fromGiftedMessage = (message: ExtendedMessage, fallbackUser: { id: number; username?: string; email?: string }): CommunityGroupMessage => ({
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
    replyTo: message.replyTo ? {
        documentId: message.replyTo.documentId,
        message: message.replyTo.message,
        createdAt: message.replyTo.createdAt,
        sender: {
            ...fallbackUser,
            provider: 'local',
            confirmed: true,
            blocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            userProfile: undefined,
        } as any
    } : undefined,
});

const SwipeableMessageBubble = ({
    props,
    children,
    onSwipe
}: {
    props: any;
    children: React.ReactNode;
    onSwipe: (message: ExtendedMessage) => void;
}) => {
    const swipeableRef = useRef<any>(null);
    const primaryColor = useThemeColor({}, 'primary');

    const renderSwipeAction = () => (
        <Box className="w-12 h-full items-center justify-center">
            <Box className="w-8 h-8 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: `${primaryColor}20` }}>
                <IconSymbol name="arrowshape.turn.up.left.fill" size={12} color={primaryColor} />
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

const mergeUniqueMessages = (messages: CommunityGroupMessage[]) =>
    messages.filter((item, index, items) =>
        items.findIndex((candidate) => candidate.documentId === item.documentId) === index
    );

const updatePaginatedMessages = (
    existing: InfiniteData<PaginatedCommunityGroupMessages, string | null> | undefined,
    updater: (messages: CommunityGroupMessage[]) => CommunityGroupMessage[]
): InfiniteData<PaginatedCommunityGroupMessages, string | null> | undefined => {
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

export function CommunityGroupChatScreen({ groupDocumentId }: { groupDocumentId: string }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const headerHeight = insets.top + 70;
    const [composerText, setComposerText] = useState('');
    const composerTextRef = useRef('');
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
    const flatListRef = useRef<FlatList<any>>(null);
    const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');
    const dangerColor = useThemeColor({}, 'danger');
    const surfaceContainerLow = useThemeColor({}, 'surfaceContainerLow');
    const surfaceContainerHigh = useThemeColor({}, 'surfaceContainerHigh');

    const { data: groupDetail } = useQuery({
        queryKey: ['community-group', groupDocumentId],
        queryFn: () => communityGroupService.getGroupDetail(groupDocumentId),
        enabled: Boolean(groupDocumentId),
    });

    const groupName = groupDetail?.name || 'Group Chat';

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
            (typeof list.scrollToIndex === 'function' ? list : null) ||
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
        } else {
            Toast.show({
                type: 'error',
                text1: 'Scroll Error',
                text2: 'Could not scroll to message.',
            });
        }
    };

    const {
        data: paginatedMessages,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['group-chat-messages', groupDocumentId],
        queryFn: ({ pageParam }) => communityGroupService.getMessages(groupDocumentId, {
            cursor: pageParam,
            limit: MESSAGE_PAGE_SIZE,
        }),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
        enabled: Boolean(groupDocumentId),
    });

    const messages = useMemo(
        () => mergeUniqueMessages(paginatedMessages?.pages.flatMap((page) => page.messages) ?? []),
        [paginatedMessages]
    );

    useEffect(() => {
        if (!groupDocumentId) {
            return;
        }

        const handleCreated = (message: CommunityGroupMessage) => {
            queryClient.setQueryData(['group-chat-messages', groupDocumentId], (oldPages: InfiniteData<PaginatedCommunityGroupMessages, string | null> | undefined) =>
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

        socketService.joinGroupChat(groupDocumentId);
        socketService.on('group_chat_message_created', handleCreated);

        return () => {
            socketService.off('group_chat_message_created', handleCreated);
            socketService.leaveGroupChat(groupDocumentId);
        };
    }, [queryClient, groupDocumentId]);

    useEffect(() => () => {
        if (highlightTimeoutRef.current) {
            clearTimeout(highlightTimeoutRef.current);
        }
    }, []);

    const giftedMessages = useMemo(
        () =>
            [...messages]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(toGiftedMessage),
        [messages]
    );

    const handleSend = async (outgoingMessages: IMessage[] = []) => {
        const outgoing = outgoingMessages[0];
        const trimmedMessage = outgoing?.text?.trim();

        if (!user || !trimmedMessage || isSending) {
            return;
        }

        if (!groupDocumentId) {
            Toast.show({
                type: 'info',
                text1: 'Group Chat',
                text2: 'Room context missing.',
            });
            return;
        }

        const currentReplyState = replyingTo;

        const optimisticMessage = fromGiftedMessage(
            {
                ...outgoing,
                _id: `optimistic-${Date.now()}`,
                text: trimmedMessage,
                createdAt: new Date(),
                replyTo: currentReplyState ? {
                    documentId: String(currentReplyState._id),
                    message: currentReplyState.text,
                    createdAt: currentReplyState.createdAt.toString(),
                    sender: {
                        id: Number(currentReplyState.user._id),
                        username: 'User',
                        name: currentReplyState.user.name || 'Member',
                    }
                } : null,
            } as ExtendedMessage,
            user
        );

        setReplyingTo(null);
        setActiveMessageMenuId(null);

        queryClient.setQueryData(['group-chat-messages', groupDocumentId], (oldPages: InfiniteData<PaginatedCommunityGroupMessages, string | null> | undefined) =>
            updatePaginatedMessages(oldPages, (oldMessages) => [
                optimisticMessage,
                ...oldMessages,
            ])
        );
        scrollToBottom();

        composerTextRef.current = '';
        setComposerText('');
        setIsSending(true);

        try {
            const createdMessage = await communityGroupService.sendMessage(groupDocumentId, trimmedMessage, {
                replyToDocumentId: currentReplyState ? String(currentReplyState._id) : undefined,
            });
            void analyticsService.trackEvent('message_sent', {
                chat_type: 'community_group',
                group_id: groupDocumentId,
                has_reply_target: Boolean(currentReplyState),
            });
            queryClient.setQueryData(['group-chat-messages', groupDocumentId], (oldPages: InfiniteData<PaginatedCommunityGroupMessages, string | null> | undefined) =>
                updatePaginatedMessages(oldPages, (oldMessages) =>
                    oldMessages.map((item) =>
                        item.documentId === optimisticMessage.documentId ? createdMessage : item
                    )
                )
            );
        } catch {
            queryClient.setQueryData(['group-chat-messages', groupDocumentId], (oldPages: InfiniteData<PaginatedCommunityGroupMessages, string | null> | undefined) =>
                updatePaginatedMessages(oldPages, (oldMessages) =>
                    oldMessages.filter((item) => item.documentId !== optimisticMessage.documentId)
                )
            );

            composerTextRef.current = trimmedMessage;
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

    const handlePressSend = () => {
        const trimmedMessage = composerTextRef.current.trim();
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

    const handleOpenReport = (message: ExtendedMessage) => {
        const senderId = Number(message.user._id);
        if (!senderId || senderId === user?.id) {
            return;
        }

        setReportTarget({
            userId: senderId,
            userName: message.user.name || 'Member',
            messageDocumentId: String(message._id),
            messagePreview: message.text,
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
        <Box className="flex-1" style={{ backgroundColor }}>
            <SafeAreaView className="flex-1" edges={['left', 'right', 'bottom']}>
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
                        source="community_group_chat"
                        context="message"
                        targetType="MESSAGE"
                        messageDocumentId={reportTarget.messageDocumentId}
                        messagePreview={reportTarget.messagePreview}
                    />
                ) : null}

                {/* Custom Header */}
                <Box
                    className="absolute top-0 left-0 right-0 z-20 border-b shadow-sm"
                    style={{
                        backgroundColor,
                        borderBottomColor: borderColor,
                        paddingTop: insets.top + 10,
                        height: headerHeight,
                    }}
                >
                    <HStack className="items-center px-6 pb-4" space="md">
                        <Pressable
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center flex-row"
                        >
                            <IconSymbol name="chevron.left" size={20} color={textColor} />
                        </Pressable>

                        <Pressable
                            className="flex-1 items-center"
                            onPress={() => router.push(`/community-group/${groupDocumentId}`)}
                        >
                            <GSText className="text-[10px] font-extrabold uppercase tracking-widest opacity-60" style={{ color: textColor }}>
                                Group Chat
                            </GSText>
                            <HStack
                                className="items-center mt-1 px-3 py-1.5 rounded-full"
                                space="xs"
                                style={{ backgroundColor: `${primaryColor}12` }}
                            >
                                <Box
                                    className="w-5 h-5 rounded-full items-center justify-center"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <IconSymbol name="person.3.fill" size={10} color="#FFFFFF" />
                                </Box>
                                <GSText className="text-base font-extrabold uppercase tracking-tight" style={{ color: textColor }} numberOfLines={1}>
                                    {groupName}
                                </GSText>
                            </HStack>
                        </Pressable>

                        <Pressable
                            onPress={() => router.push(`/community-group/${groupDocumentId}`)}
                            className="w-10 h-10 rounded-full items-center justify-center border shadow-xs"
                            style={{ backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}24` }}
                        >
                            <IconSymbol name="info.circle.fill" size={20} color={textColor} />
                        </Pressable>
                    </HStack>
                </Box>

                {isLoading ? (
                    <Box className="flex-1" style={{ paddingTop: headerHeight }}>
                        <ListPageSkeleton showHeader={false} />
                    </Box>
                ) : !groupDocumentId ? (
                    <Box className="flex-1 items-center justify-center px-10" style={{ paddingTop: headerHeight }}>
                        <Box className="w-24 h-24 rounded-[36px] bg-primary-500/10 items-center justify-center mb-10 rotate-6 shadow-xl">
                            <IconSymbol name="person.3.fill" size={40} color={primaryColor} />
                        </Box>
                        <GSText className="text-2xl font-extrabold text-center uppercase tracking-widest mb-4" style={{ color: textColor }}>
                            Wait up
                        </GSText>
                        <GSText className="text-sm font-medium leading-6 text-center opacity-70 mb-12 px-2" style={{ color: subtextColor }}>
                            You need a valid group Document ID to view group chats!
                        </GSText>
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
                            messagesContainerRef={flatListRef as any}
                            bottomOffset={insets.bottom}
                            keyboardAvoidingViewProps={{ keyboardVerticalOffset: headerHeight }}
                            messagesContainerStyle={{ backgroundColor }}
                            renderAvatarOnTop
                            keyboardShouldPersistTaps="handled"
                            minInputToolbarHeight={70}
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
                            textInputProps={{
                                onChangeText: (value: string) => {
                                    composerTextRef.current = value;
                                    setComposerText(value);
                                },
                                placeholder: 'Post a thought or query...',
                                editable: Boolean(groupDocumentId),
                                placeholderTextColor: subtextColor,
                                className: "flex-1 text-[15px] px-4 py-2 rounded-[24px] border-2",
                                style: {
                                    color: textColor,
                                    backgroundColor: cardColor,
                                    borderColor,
                                    minHeight: 44,
                                    maxHeight: 120,
                                    textAlignVertical: 'center',
                                },
                                multiline: true,
                            }}
                            listProps={{
                                ref: (r: any) => {
                                    if (r) {
                                        flatListRef.current = r;
                                    }
                                },
                                contentContainerStyle: giftedMessages.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : undefined,
                                onScrollToIndexFailed: (info: any) => {
                                    const offset = info.averageItemLength * info.index;
                                    if (flatListRef.current && typeof flatListRef.current.scrollToOffset === 'function') {
                                        flatListRef.current.scrollToOffset({ offset, animated: true });
                                        setTimeout(() => {
                                            if (flatListRef.current && typeof flatListRef.current.scrollToIndex === 'function') {
                                                flatListRef.current.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
                                            }
                                        }, 100);
                                    }
                                }
                            }}
                            renderBubble={(props: any) => {
                                const currentMessage = props.currentMessage as ExtendedMessage;
                                const messageId = String(currentMessage?._id);
                                const isCurrentUser = String(currentMessage?.user?._id) === String(user?.id);
                                const isHighlighted = messageId === highlightedMessageId;
                                const isMenuOpen = messageId === activeMessageMenuId;

                                return (
                                    <SwipeableMessageBubble props={props} onSwipe={setReplyingTo}>
                                        <Box className="w-full" style={{ alignItems: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                                            {isMenuOpen && (
                                                <Box
                                                    className="rounded-[24px] border-2 shadow-2xl p-2 mb-3 w-44"
                                                    style={{ backgroundColor: cardColor, borderColor, alignSelf: isCurrentUser ? 'flex-end' : 'flex-start' }}
                                                >
                                                    <Pressable
                                                        className="flex-row items-center p-3 rounded-2xl"
                                                        onPress={() => {
                                                            setReplyingTo(currentMessage);
                                                            setActiveMessageMenuId(null);
                                                        }}
                                                    >
                                                        <IconSymbol name="arrowshape.turn.up.left.fill" size={16} color={primaryColor} />
                                                        <GSText className="ml-3 text-xs font-extrabold uppercase tracking-widest" style={{ color: textColor }}>Reply</GSText>
                                                    </Pressable>
                                                    {!isCurrentUser && (
                                                        <Pressable
                                                            className="flex-row items-center p-3 rounded-2xl"
                                                            onPress={() => handleOpenReport(currentMessage)}
                                                        >
                                                            <IconSymbol name="exclamationmark.bubble.fill" size={16} color={dangerColor} />
                                                            <GSText className="ml-3 text-xs font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>Report</GSText>
                                                        </Pressable>
                                                    )}
                                                    <Pressable
                                                        className="flex-row items-center p-3 rounded-2xl mt-1"
                                                        style={{ backgroundColor: surfaceContainerHigh }}
                                                        onPress={() => setActiveMessageMenuId(null)}
                                                    >
                                                        <IconSymbol name="xmark" size={16} color={subtextColor} />
                                                        <GSText className="ml-3 text-xs font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Cancel</GSText>
                                                    </Pressable>
                                                </Box>
                                            )}
                                            <Bubble
                                                {...props}
                                                wrapperStyle={{
                                                    right: {
                                                        backgroundColor: isHighlighted ? '#2FBF71' : primaryColor,
                                                        borderWidth: isHighlighted ? 2 : 0,
                                                        borderColor: '#DCF8C6',
                                                        borderRadius: 24,
                                                        padding: 4,
                                                    },
                                                    left: {
                                                        backgroundColor: isHighlighted ? `${primaryColor}14` : cardColor,
                                                        borderWidth: isHighlighted ? 2 : 1.5,
                                                        borderColor: isHighlighted ? primaryColor : borderColor,
                                                        borderRadius: 24,
                                                        padding: 4,
                                                    },
                                                }}
                                                textStyle={{
                                                    right: { color: '#FFFFFF', fontWeight: '500' },
                                                    left: { color: textColor, fontWeight: '500' },
                                                }}
                                            />
                                        </Box>
                                    </SwipeableMessageBubble>
                                );
                            }}
                            onLongPressMessage={(_: any, message: ExtendedMessage) => handleOpenMessageActions(message)}
                            renderCustomView={(props: any) => {
                                const { currentMessage, position } = props;
                                if (currentMessage?.replyTo) {
                                    const isRight = position === 'right';
                                    const bubbleBg = isRight ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.06)';
                                    const barColor = isRight ? 'rgba(255,255,255,0.7)' : primaryColor;
                                    const nameColor = isRight ? '#FFFFFF' : primaryColor;
                                    const messageColor = isRight ? 'rgba(255,255,255,0.85)' : subtextColor;

                                    return (
                                        <Pressable
                                            onPress={() => scrollToMessage(currentMessage.replyTo.documentId)}
                                            className="mx-2 mt-2 mb-1 p-3 rounded-[20px] flex-row overflow-hidden"
                                            style={{ backgroundColor: bubbleBg, minWidth: 160 }}
                                        >
                                            <Box className="w-1.5 h-full rounded-full mr-3" style={{ backgroundColor: barColor }} />
                                            <VStack className="flex-1">
                                                <GSText className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: nameColor }} numberOfLines={1}>
                                                    {currentMessage.replyTo.sender.username || currentMessage.replyTo.sender.name}
                                                </GSText>
                                                <GSText className="text-xs font-medium mt-0.5" style={{ color: messageColor }} numberOfLines={2}>
                                                    {summarizeMessageContent(currentMessage.replyTo.message)}
                                                </GSText>
                                            </VStack>
                                        </Pressable>
                                    );
                                }
                                return null;
                            }}
                            renderInputToolbar={(props: any) => (
                                <Box className="border-t" style={{ backgroundColor, borderTopColor: borderColor }}>
                                    {replyingTo && (
                                        <Box
                                            className="flex-row items-center px-4 py-2 border-b"
                                            style={{ backgroundColor: surfaceContainerHigh, borderBottomColor: borderColor }}
                                        >
                                            <Box className="w-1 h-8 rounded-full mr-3" style={{ backgroundColor: primaryColor }} />
                                            <VStack className="flex-1">
                                                <GSText className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                                                    Replying to {replyingTo.user.name || (replyingTo.user as any).username || 'Member'}
                                                </GSText>
                                                <GSText className="text-xs font-semibold opacity-70" style={{ color: subtextColor }} numberOfLines={1}>
                                                    {summarizeMessageContent(replyingTo.text)}
                                                </GSText>
                                            </VStack>
                                            <Pressable
                                                onPress={() => setReplyingTo(null)}
                                                className="w-7 h-7 rounded-full items-center justify-center"
                                                style={{ backgroundColor: surfaceContainerLow }}
                                            >
                                                <IconSymbol name="xmark" size={12} color={subtextColor} />
                                            </Pressable>
                                        </Box>
                                    )}
                                    <HStack className="items-end px-4 py-2.5" space="sm">
                                        <InputToolbar
                                            {...props}
                                            containerStyle={{
                                                borderTopWidth: 0,
                                                paddingHorizontal: 0,
                                                backgroundColor: 'transparent',
                                                flex: 1,
                                                justifyContent: 'flex-end',
                                            }}
                                            primaryStyle={{ alignItems: 'flex-end' }}
                                        />
                                        <Pressable
                                            onPress={handlePressSend}
                                            disabled={!composerText.trim() || isSending}
                                            className="w-11 h-11 rounded-full items-center justify-center shadow-sm mb-0.5"
                                            style={{
                                                backgroundColor: composerText.trim() && !isSending ? primaryColor : `${subtextColor}20`,
                                            }}
                                        >
                                            <IconSymbol
                                                name="paperplane.fill"
                                                size={18}
                                                color={composerText.trim() && !isSending ? '#FFFFFF' : subtextColor}
                                            />
                                        </Pressable>
                                    </HStack>
                                </Box>
                            )}
                            renderSend={() => null}
                            renderChatEmpty={() => (
                                <Box className="items-center px-10 py-20" style={{ transform: [{ rotate: '180deg' }] } as any}>
                                    <Box className="w-20 h-20 rounded-[32px] bg-primary-500/10 items-center justify-center mb-6 shadow-sm">
                                        <IconSymbol name="person.3.fill" size={32} color={primaryColor} />
                                    </Box>
                                    <GSText className="text-xl font-extrabold uppercase tracking-widest text-center" style={{ color: textColor }}>{groupName}</GSText>
                                    <GSText className="text-sm font-medium leading-6 text-center opacity-60 mt-4 px-4" style={{ color: subtextColor }}>
                                        Welcome to the group chat! Start by saying hello to the community.
                                    </GSText>
                                </Box>
                            )}
                        />
                    </Box>
                )}
            </SafeAreaView>
        </Box>
    );
}
