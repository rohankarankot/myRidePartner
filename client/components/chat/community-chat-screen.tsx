import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
    Bubble,
    GiftedChat,
    IMessage,
    InputToolbar,
} from 'react-native-gifted-chat';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppLoader } from '@/components/app-loader';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { publicChatService } from '@/services/public-chat-service';
import { socketService } from '@/services/socket-service';
import { PaginatedPublicChatMessages, PublicChatMessage } from '@/types/api';
import { useAuth } from '@/context/auth-context';

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

const toGiftedMessage = (message: PublicChatMessage): ExtendedMessage => ({
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

const fromGiftedMessage = (message: ExtendedMessage, fallbackUser: { id: number; username?: string; email?: string }): PublicChatMessage => ({
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

const mergeUniqueMessages = (messages: PublicChatMessage[]) =>
    messages.filter((item, index, items) =>
        items.findIndex((candidate) => candidate.documentId === item.documentId) === index
    );

const updatePaginatedMessages = (
    existing: InfiniteData<PaginatedPublicChatMessages, string | null> | undefined,
    updater: (messages: PublicChatMessage[]) => PublicChatMessage[]
): InfiniteData<PaginatedPublicChatMessages, string | null> | undefined => {
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

export function CommunityChatScreen() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const headerHeight = insets.top + 60;
    const [composerText, setComposerText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<ExtendedMessage | null>(null);
    const flatListRef = useRef<FlatList<any>>(null);

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
            } catch (e) {
                console.log('Failed to scroll:', e);
                Toast.show({ type: 'error', text1: 'Scroll Error', text2: 'Item is not measured yet.' });
            }
        } else {
            const keys = Object.keys(list).slice(0, 5).join(', ');
            Toast.show({
                type: 'error',
                text1: 'Scroll Error',
                text2: `Underlying method missing. Available keys: ${keys}`,
            });
        }
    };

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    const {
        data: paginatedMessages,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['public-chat-messages'],
        queryFn: ({ pageParam }) => publicChatService.getMessages({ cursor: pageParam, limit: MESSAGE_PAGE_SIZE }),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    });

    const messages = useMemo(
        () => mergeUniqueMessages(paginatedMessages?.pages.flatMap((page) => page.messages) ?? []),
        [paginatedMessages]
    );

    useEffect(() => {
        const handleCreated = (message: PublicChatMessage) => {
            queryClient.setQueryData(['public-chat-messages'], (oldPages: InfiniteData<PaginatedPublicChatMessages, string | null> | undefined) =>
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

        socketService.joinPublicChat();
        socketService.on('public_chat_message_created', handleCreated);

        return () => {
            socketService.off('public_chat_message_created', handleCreated);
            socketService.leavePublicChat();
        };
    }, [queryClient]);

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

        queryClient.setQueryData(['public-chat-messages'], (oldPages: InfiniteData<PaginatedPublicChatMessages, string | null> | undefined) =>
            updatePaginatedMessages(oldPages, (oldMessages) => [
                optimisticMessage,
                ...oldMessages,
            ])
        );

        setComposerText('');
        setIsSending(true);

        try {
            const createdMessage = await publicChatService.sendMessage(trimmedMessage, {
                replyToDocumentId: currentReplyState ? String(currentReplyState._id) : undefined,
            });
            queryClient.setQueryData(['public-chat-messages'], (oldPages: InfiniteData<PaginatedPublicChatMessages, string | null> | undefined) =>
                updatePaginatedMessages(oldPages, (oldMessages) =>
                    oldMessages.map((item) =>
                        item.documentId === optimisticMessage.documentId ? createdMessage : item
                    )
                )
            );
        } catch {
            queryClient.setQueryData(['public-chat-messages'], (oldPages: InfiniteData<PaginatedPublicChatMessages, string | null> | undefined) =>
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
                    <Text style={[styles.headerTitle, { color: textColor }]}>Community Chat</Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/community-info')}
                    style={styles.headerIconButton}
                >
                    <IconSymbol name="info.circle.fill" size={22} color={primaryColor} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={[styles.center, { backgroundColor, paddingTop: headerHeight }]}>
                    <AppLoader />
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
                        bottomOffset={insets.bottom}
                        keyboardAvoidingViewProps={{ keyboardVerticalOffset: headerHeight }}
                        messagesContainerStyle={{ backgroundColor }}
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
                        timeTextStyle={{
                            right: { color: 'rgba(255,255,255,0.75)' },
                            left: { color: subtextColor },
                        }}
                        textInputProps={{
                            onChangeText: setComposerText,
                            placeholder: 'Say something to the community',
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
                            ref: (r: any) => {
                                if (r) {
                                    flatListRef.current = r;
                                }
                            },
                            contentContainerStyle: giftedMessages.length === 0 ? styles.emptyList : undefined,
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
                        renderBubble={(props: any) => (
                            <SwipeableMessageBubble props={props} onSwipe={setReplyingTo}>
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
                            </SwipeableMessageBubble>
                        )}
                        renderCustomView={(props: any) => {
                            const { currentMessage, position } = props;
                            if (currentMessage?.replyTo) {
                                const isRight = position === 'right';

                                const bubbleBg = isRight ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.06)';
                                const barColor = isRight ? 'rgba(255,255,255,0.7)' : primaryColor;
                                const nameColor = isRight ? '#FFFFFF' : primaryColor;
                                const messageColor = isRight ? 'rgba(255,255,255,0.85)' : subtextColor;

                                return (
                                    <TouchableOpacity 
                                        activeOpacity={0.8} 
                                        onPress={() => scrollToMessage(currentMessage.replyTo.documentId)}
                                        style={[styles.replyBubbleView, { backgroundColor: bubbleBg }]}
                                    >
                                        <View style={[styles.replyBubbleBar, { backgroundColor: barColor }]} />
                                        <View style={styles.replyBubbleContent}>
                                            <Text style={[styles.replyBubbleName, { color: nameColor }]} numberOfLines={1}>
                                                {currentMessage.replyTo.sender.username || currentMessage.replyTo.sender.name}
                                            </Text>
                                            <Text style={[styles.replyBubbleMessage, { color: messageColor }]} numberOfLines={2}>
                                                {currentMessage.replyTo.message}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }
                            return null;
                        }}
                        renderInputToolbar={(props: any) => (
                            <View style={{ backgroundColor }}>
                                {replyingTo && (
                                    <View style={[styles.replyPreviewContainer, { borderColor, backgroundColor: cardColor }]}>
                                        <View style={[styles.replyPreviewBar, { backgroundColor: primaryColor }]} />
                                        <View style={styles.replyPreviewContent}>
                                            <Text style={[styles.replyPreviewName, { color: primaryColor }]}>
                                                Replying to {replyingTo.user.name || (replyingTo.user as any).username || 'Member'}
                                            </Text>
                                            <Text style={[styles.replyPreviewMessage, { color: subtextColor }]} numberOfLines={1}>
                                                {replyingTo.text}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.replyPreviewClose}>
                                            <IconSymbol name="xmark" size={20} color={subtextColor} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <View style={styles.toolbarRow}>
                                    <InputToolbar
                                        {...props}
                                        containerStyle={[styles.toolbar, { backgroundColor }]}
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
                                <View style={[styles.emptyIconWrap, { backgroundColor: `${primaryColor}14` }]}>
                                    <IconSymbol name="person.2.fill" size={34} color={primaryColor} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: textColor }]}>Community chat is open</Text>
                                <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                                    Introduce yourself, ask about routes, and chat with other riders across the app.
                                </Text>
                            </View>
                        )}
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
    chatWrapper: {
        flex: 1,
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
    emptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
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
    toolbarRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        gap: 8,
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
        fontSize: 13,
        lineHeight: 18,
    },
});


