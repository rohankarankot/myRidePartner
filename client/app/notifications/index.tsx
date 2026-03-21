import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { notificationService } from '@/services/notification-service';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/api';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Toast from 'react-native-toast-message';

export default function NotificationsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');

    const [showClearAllModal, setShowClearAllModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

    const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: () => notificationService.getNotifications(user!.id),
        enabled: !!user?.id,
    });

    useEffect(() => {
        if (user?.id) {
            notificationService.markAllAsRead(user.id).then(() => {
                queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user.id] });
            });
        }
    }, [user?.id]);

    // ── Delete single ──────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: (documentId: string) => notificationService.deleteNotification(documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
            Toast.show({ type: 'success', text1: 'Notification deleted' });
        },
        onError: () => Toast.show({ type: 'error', text1: 'Failed to delete notification' }),
    });

    // ── Clear all ──────────────────────────────────────────────────────
    const clearAllMutation = useMutation({
        mutationFn: () => notificationService.deleteAllNotifications(user!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user?.id] });
            Toast.show({ type: 'success', text1: 'All notifications cleared' });
        },
        onError: () => Toast.show({ type: 'error', text1: 'Failed to clear notifications' }),
    });

    const confirmDelete = useCallback((documentId: string) => {
        // Close the swipeable after confirm
        swipeableRefs.current[documentId]?.close();
        setPendingDeleteId(documentId);
    }, []);

    const handleConfirmSingleDelete = () => {
        if (pendingDeleteId) {
            deleteMutation.mutate(pendingDeleteId);
            setPendingDeleteId(null);
        }
    };

    // ── Navigation ─────────────────────────────────────────────────────
    const handleNotificationPress = (notification: Notification) => {
        let data = notification.data || {};
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch { data = {}; }
        }

        const tripId = (data as any).tripId || (notification as any).tripId;
        const relatedId = (data as any).relatedId || (notification as any).relatedId;

        if (tripId) {
            router.push({ pathname: '/trip/[id]', params: { id: tripId } } as any);
            return;
        }
        if (notification.type === 'JOIN_REQUEST' && relatedId) {
            router.push({ pathname: '/requests/[documentId]', params: { documentId: relatedId } } as any);
            return;
        }
        if (notification.type === 'TRIP_COMPLETED' || notification.type === 'TRIP_UPDATE') {
            router.push('/(tabs)/activity');
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'JOIN_REQUEST': return 'person.2.fill';
            case 'TRIP_COMPLETED': return 'checkmark.circle.fill';
            case 'TRIP_UPDATE': return 'car';
            case 'SYSTEM': return 'gearshape.fill';
            default: return 'bell.fill';
        }
    };

    // ── Swipe action (right → left) ────────────────────────────────────
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, _drag: Animated.AnimatedInterpolation<number>, documentId: string) => {
        const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1], extrapolate: 'clamp' });
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => confirmDelete(documentId)}
                activeOpacity={0.8}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <IconSymbol name="xmark.circle.fill" size={28} color="#fff" />
                </Animated.View>
                <Animated.Text style={[styles.deleteActionText, { transform: [{ scale }] }]}>Delete</Animated.Text>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <Swipeable
            ref={ref => { swipeableRefs.current[item.documentId] = ref; }}
            renderRightActions={(prog, drag) => renderRightActions(prog, drag, item.documentId)}
            rightThreshold={60}
            overshootRight={false}
            friction={2}
        >
            <TouchableOpacity
                style={[styles.notificationCard, { backgroundColor: cardColor, borderColor }]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: primaryColor + '15' }]}>
                    <IconSymbol name={getIconForType(item.type)} size={24} color={primaryColor} />
                </View>
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.type, { color: primaryColor }]}>{item.type.replace('_', ' ')}</Text>
                        <Text style={[styles.time, { color: subtextColor }]}>
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </Text>
                    </View>
                    <Text style={[styles.message, { color: textColor }]}>{item.message}</Text>
                </View>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: primaryColor }]} />}
            </TouchableOpacity>
        </Swipeable>
    );

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen options={{
                title: 'Notifications',
                headerShown: true,
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor },
                headerTintColor: textColor,
                headerShadowVisible: false,
                headerRight: () =>
                    notifications.length > 0 ? (
                        <TouchableOpacity
                            style={styles.clearAllBtn}
                            onPress={() => setShowClearAllModal(true)}
                        >
                            <Text style={[styles.clearAllText, { color: dangerColor }]}>Clear All</Text>
                        </TouchableOpacity>
                    ) : null,
            }} />

            {isLoading && !isRefetching ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.documentId}
                    renderItem={renderItem}
                    contentContainerStyle={styles.container}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="bell.fill" size={64} color={subtextColor} />
                            <Text style={[styles.emptyTitle, { color: textColor }]}>No notifications yet</Text>
                            <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                                We'll let you know when something important happens!
                            </Text>
                        </View>
                    }
                />
            )}

            {/* ── Single delete confirmation ── */}
            <Modal
                visible={!!pendingDeleteId}
                transparent
                animationType="fade"
                onRequestClose={() => setPendingDeleteId(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
                        <View style={[styles.modalIconWrap, { backgroundColor: `${dangerColor}12` }]}>
                            <IconSymbol name="xmark.circle.fill" size={28} color={dangerColor} />
                        </View>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Delete Notification?</Text>
                        <Text style={[styles.modalSubtitle, { color: subtextColor }]}>
                            This notification will be permanently removed.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { borderColor, borderWidth: 1.5 }]}
                                onPress={() => { swipeableRefs.current[pendingDeleteId!]?.close(); setPendingDeleteId(null); }}
                            >
                                <Text style={[styles.modalBtnText, { color: textColor }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: dangerColor }]}
                                onPress={handleConfirmSingleDelete}
                            >
                                {deleteMutation.isPending
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Delete</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Clear all confirmation ── */}
            <Modal
                visible={showClearAllModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowClearAllModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
                        <View style={[styles.modalIconWrap, { backgroundColor: `${dangerColor}12` }]}>
                            <IconSymbol name="xmark.circle.fill" size={28} color={dangerColor} />
                        </View>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Clear All Notifications?</Text>
                        <Text style={[styles.modalSubtitle, { color: subtextColor }]}>
                            All {notifications.length} notification{notifications.length !== 1 ? 's' : ''} will be permanently deleted.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { borderColor, borderWidth: 1.5 }]}
                                onPress={() => setShowClearAllModal(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: textColor }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: dangerColor }]}
                                onPress={() => { setShowClearAllModal(false); clearAllMutation.mutate(); }}
                            >
                                {clearAllMutation.isPending
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Clear All</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    container: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    clearAllBtn: { marginRight: 4, paddingHorizontal: 8, paddingVertical: 4 },
    clearAllText: { fontSize: 14, fontWeight: '600' },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    content: { flex: 1 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    type: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    time: { fontSize: 12 },
    message: { fontSize: 15, lineHeight: 20 },
    unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 12 },
    // Swipe delete
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 16,
        marginBottom: 12,
        gap: 4,
    },
    deleteActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    // Empty
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
    emptySubtitle: { fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalCard: {
        width: '100%',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
    },
    modalIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
    modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
    modalBtn: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnText: { fontSize: 15, fontWeight: '700' },
});
