import React, { useMemo } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { tripService } from '@/services/trip-service';
import { joinRequestService } from '@/services/join-request-service';
import { ChatsTabSkeleton } from '@/features/chats/components/ChatsTabSkeleton';

type ChatRide = {
    tripDocumentId: string;
    title: string;
    subtitle: string;
    status: string;
    role: 'captain' | 'passenger';
    avatarUrl?: string | null;
};

const ACTIVE_STATUSES = ['PUBLISHED', 'STARTED'] as const;

export default function ChatsTabScreen() {
    const { user } = useAuth();
    const router = useRouter();

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    const {
        data: trips = [],
        isLoading: isLoadingTrips,
        refetch: refetchTrips,
        isRefetching: isRefetchingTrips,
    } = useQuery({
        queryKey: ['trips', user?.id],
        queryFn: () => tripService.getUserTrips(user!.id),
        enabled: !!user?.id,
    });

    const {
        data: requests = [],
        isLoading: isLoadingRequests,
        refetch: refetchRequests,
        isRefetching: isRefetchingRequests,
    } = useQuery({
        queryKey: ['join-requests', user?.id],
        queryFn: () => joinRequestService.getJoinRequestsForUser(user!.id),
        enabled: !!user?.id,
    });

    const chatRides = useMemo(() => {
        const byTrip = new Map<string, ChatRide>();

        trips
            .filter((trip) => ACTIVE_STATUSES.includes(trip.status as typeof ACTIVE_STATUSES[number]))
            .forEach((trip) => {
                byTrip.set(trip.documentId, {
                    tripDocumentId: trip.documentId,
                    title: `${trip.startingPoint} to ${trip.destination}`,
                    subtitle: trip.status === 'STARTED' ? 'Your ride is live. Chat with your group.' : 'Coordinate pickup details with your riders.',
                    status: trip.status,
                    role: 'captain',
                    avatarUrl: typeof trip.creator?.userProfile?.avatar === 'string'
                        ? trip.creator.userProfile.avatar
                        : trip.creator?.userProfile?.avatar?.url,
                });
            });

        requests
            .filter((request) =>
                request.status === 'APPROVED' &&
                request.trip &&
                ACTIVE_STATUSES.includes(request.trip.status as typeof ACTIVE_STATUSES[number])
            )
            .forEach((request) => {
                if (!request.trip) return;

                byTrip.set(request.trip.documentId, {
                    tripDocumentId: request.trip.documentId,
                    title: `${request.trip.startingPoint} to ${request.trip.destination}`,
                    subtitle: request.trip.status === 'STARTED'
                        ? 'Your ride is in progress. Stay in sync with the group.'
                        : 'You are approved for this ride. Use chat to coordinate before departure.',
                    status: request.trip.status,
                    role: 'passenger',
                    avatarUrl: typeof request.trip.creator?.userProfile?.avatar === 'string'
                        ? request.trip.creator.userProfile.avatar
                        : request.trip.creator?.userProfile?.avatar?.url,
                });
            });

        return Array.from(byTrip.values());
    }, [requests, trips]);

    const isLoading = isLoadingTrips || isLoadingRequests;
    const isRefetching = isRefetchingTrips || isRefetchingRequests;

    if (isLoading && !isRefetching) {
        return <ChatsTabSkeleton />;
    }

    return (
        <View style={[styles.safe, { backgroundColor }]}>
            <FlatList
                data={chatRides}
                keyExtractor={(item) => item.tripDocumentId}
                contentContainerStyle={[
                    styles.container,
                    chatRides.length === 0 && styles.emptyList,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={() => {
                            refetchTrips();
                            refetchRequests();
                        }}
                    />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: cardColor, borderColor }]}
                        onPress={() => router.push(`/trip-chat/${item.tripDocumentId}`)}
                    >
                        <Image
                            source={item.avatarUrl
                                ? { uri: item.avatarUrl }
                                : { uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RideChat' }}
                            style={styles.avatar}
                        />

                        <View style={styles.content}>
                            <View style={styles.row}>
                                <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <View style={[
                                    styles.badge,
                                    { backgroundColor: item.status === 'STARTED' ? `${primaryColor}18` : '#10B98118' },
                                ]}>
                                    <Text style={[
                                        styles.badgeText,
                                        { color: item.status === 'STARTED' ? primaryColor : '#10B981' },
                                    ]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>

                            <Text style={[styles.subtitle, { color: subtextColor }]} numberOfLines={2}>
                                {item.subtitle}
                            </Text>

                            <View style={styles.footer}>
                                <View style={styles.roleRow}>
                                    <IconSymbol
                                        name={item.role === 'captain' ? 'steeringwheel' : 'person.2.fill'}
                                        size={14}
                                        color={subtextColor}
                                    />
                                    <Text style={[styles.roleText, { color: subtextColor }]}>
                                        {item.role === 'captain' ? 'You are leading this ride' : 'You are part of this ride'}
                                    </Text>
                                </View>

                                <IconSymbol name="chevron.right" size={18} color={subtextColor} />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconWrap, { backgroundColor: `${primaryColor}12` }]}>
                            <IconSymbol name="bubble.left.and.bubble.right.fill" size={34} color={primaryColor} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: textColor }]}>No ride chats yet</Text>
                        <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                            Join a ride or publish one of your own to start coordinating pickup points, timing, and trip updates here.
                        </Text>
                    </View>
                }
            />
        </View>
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
    container: {
        padding: 16,
        gap: 12,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    card: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 14,
        flexDirection: 'row',
        gap: 12,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    subtitle: {
        marginTop: 6,
        fontSize: 13,
        lineHeight: 19,
    },
    footer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyIconWrap: {
        width: 74,
        height: 74,
        borderRadius: 37,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: 320,
    },
});
