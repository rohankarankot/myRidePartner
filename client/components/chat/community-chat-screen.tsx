import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { IconSymbol } from '@/components/ui/icon-symbol';
import { publicChatService } from '@/services/public-chat-service';
import { socketService } from '@/services/socket-service';
import { PaginatedPublicChatMessages, PublicChatMessage } from '@/types/api';
import { useAuth } from '@/context/auth-context';

const MESSAGE_PAGE_SIZE = 40;

const toGiftedMessage = (message: PublicChatMessage): IMessage => ({
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
});

const fromGiftedMessage = (message: IMessage, fallbackUser: { id: number; username?: string; email?: string }): PublicChatMessage => ({
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

        const optimisticMessage = fromGiftedMessage(
            {
                ...outgoing,
                _id: `optimistic-${Date.now()}`,
                text: trimmedMessage,
                createdAt: new Date(),
            },
            user
        );

        queryClient.setQueryData(['public-chat-messages'], (oldPages: InfiniteData<PaginatedPublicChatMessages, string | null> | undefined) =>
            updatePaginatedMessages(oldPages, (oldMessages) => [
                optimisticMessage,
                ...oldMessages,
            ])
        );

        setComposerText('');
        setIsSending(true);

        try {
            const createdMessage = await publicChatService.sendMessage(trimmedMessage);
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
                            <View style={[styles.toolbarRow, { backgroundColor }]}>
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
});
