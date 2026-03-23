import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { joinRequestService } from '@/services/join-request-service';
import { notificationService } from '@/services/notification-service';
import { JoinRequest } from '@/types/api';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppLoader } from '@/components/app-loader';
import { maskPhoneNumber } from '@/utils/phone';

export default function RequestsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    const { data: requests = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['pending-approvals', user?.id],
        queryFn: () => joinRequestService.getPendingRequestsForCaptain(user!.id),
        enabled: !!user?.id,
    });

    // Mark all notifications for this user as read when they enter this screen
    React.useEffect(() => {
        if (user?.id) {
            notificationService.markAllAsRead(user.id).then(() => {
                queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
            });
        }
    }, [user?.id]);

    const renderItem = ({ item }: { item: JoinRequest }) => (
        <TouchableOpacity
            style={[styles.requestCard, { backgroundColor: cardColor, borderColor }]}
            onPress={() => router.push(`/requests/${item.documentId}`)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: primaryColor + '15' }]}>
                    <Text style={[styles.avatarText, { color: primaryColor }]}>
                        {item.passenger.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.userName, { color: textColor }]}>{item.passenger.username}</Text>
                    <Text style={[styles.tripInfo, { color: subtextColor }]} numberOfLines={1}>
                        Requested {item.requestedSeats} {item.requestedSeats === 1 ? 'seat' : 'seats'}
                    </Text>
                    <Text style={[styles.tripInfo, { color: subtextColor }]} numberOfLines={1}>
                        {item.sharePhoneNumber
                            ? (item.passenger.userProfile?.phoneNumber || 'Phone unavailable')
                            : maskPhoneNumber(item.passenger.userProfile?.phoneNumber)}
                    </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={subtextColor} />
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <View style={styles.cardFooter}>
                <IconSymbol name="car" size={16} color={subtextColor} />
                <Text style={[styles.footerText, { color: subtextColor }]} numberOfLines={1}>
                    {item.trip.startingPoint} → {item.trip.destination}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen options={{
                title: 'Join Requests',
                headerShown: true,
                headerBackTitle: 'Back',
            }} />

            <FlatList
                data={requests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {isLoading ? (
                            <AppLoader />
                        ) : (
                            <>
                                <IconSymbol name="checkmark.circle" size={60} color={subtextColor} />
                                <Text style={[styles.emptyTitle, { color: textColor }]}>No pending requests</Text>
                                <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                                    When people request to join your rides, they will appear here.
                                </Text>
                            </>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    requestCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
    },
    tripInfo: {
        fontSize: 14,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 13,
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
});
