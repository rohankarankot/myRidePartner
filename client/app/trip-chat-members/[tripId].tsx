import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { tripService } from '@/services/trip-service';
import { socketService } from '@/services/socket-service';
import { userService } from '@/services/user-service';
import { IconSymbol } from '@/components/ui/icon-symbol';

type MemberRow = {
    id: number;
    name: string;
    subtitle: string;
    role: 'Captain' | 'Rider';
    avatarUrl?: string | null;
};

export default function TripChatMembersScreen() {
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const router = useRouter();

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');
    const successColor = '#22c55e';
    const offlineColor = useMemo(() => `${subtextColor}55`, [subtextColor]);
    const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);

    const { data: members = [], isLoading } = useQuery({
        queryKey: ['trip-chat-members', tripId],
        queryFn: async () => {
            const trip = await tripService.getTripById(tripId!);

            const approvedPassengers = (trip.joinRequests || []).filter(
                (request) => request.status === 'APPROVED'
            );

            const memberIds = Array.from(
                new Set([
                    trip.creator?.id,
                    ...approvedPassengers.map((request) => request.passenger.id),
                ].filter(Boolean) as number[])
            );

            const profiles = await Promise.all(
                memberIds.map(async (userId) => ({
                    userId,
                    profile: await userService.getUserProfile(userId),
                }))
            );

            const profileMap = new Map(
                profiles.map((entry) => [entry.userId, entry.profile])
            );

            const rows: MemberRow[] = [];

            if (trip.creator?.id) {
                const captainProfile = profileMap.get(trip.creator.id);
                rows.push({
                    id: trip.creator.id,
                    name:
                        captainProfile?.fullName ||
                        trip.creator.username ||
                        'Captain',
                    subtitle:
                        captainProfile?.phoneNumber ||
                        captainProfile?.city ||
                        'Ride captain',
                    role: 'Captain',
                    avatarUrl:
                        typeof captainProfile?.avatar === 'string'
                            ? captainProfile.avatar
                            : captainProfile?.avatar?.url,
                });
            }

            for (const request of approvedPassengers) {
                const passengerProfile = profileMap.get(request.passenger.id);
                rows.push({
                    id: request.passenger.id,
                    name:
                        passengerProfile?.fullName ||
                        request.passenger.username ||
                        'Rider',
                    subtitle:
                        passengerProfile?.phoneNumber ||
                        passengerProfile?.city ||
                        `${request.requestedSeats} seat${request.requestedSeats > 1 ? 's' : ''} booked`,
                    role: 'Rider',
                    avatarUrl:
                        typeof passengerProfile?.avatar === 'string'
                            ? passengerProfile.avatar
                            : passengerProfile?.avatar?.url,
                });
            }

            return rows;
        },
        enabled: !!tripId,
    });

    const titleText = useMemo(() => {
        const riderCount = Math.max(0, members.length - 1);
        if (riderCount === 0) {
            return 'Captain only for now';
        }
        return `${riderCount} rider${riderCount > 1 ? 's' : ''} in this ride`;
    }, [members.length]);

    useEffect(() => {
        if (!tripId) {
            return;
        }

        const handlePresenceUpdated = (payload?: {
            tripDocumentId?: string;
            onlineUsers?: Array<{ userId: number; userName: string }>;
        }) => {
            if (payload?.tripDocumentId !== tripId) {
                return;
            }

            setOnlineUserIds((payload.onlineUsers || []).map((user) => user.userId));
        };

        socketService.joinChat(tripId);
        socketService.on('chat_presence_updated', handlePresenceUpdated);

        return () => {
            socketService.off('chat_presence_updated', handlePresenceUpdated);
            socketService.leaveChat(tripId);
        };
    }, [tripId]);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: 'Ride Members',
                    headerShown: true,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                }}
            />

            {isLoading ? (
                <View style={[styles.center, { backgroundColor }]}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            ) : (
                <FlatList
                    data={members}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.container}
                    ListHeaderComponent={
                        <View style={styles.headerCopy}>
                            <Text style={[styles.headerTitle, { color: textColor }]}>
                                Everyone in this ride
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: subtextColor }]}>
                                {titleText}
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: cardColor, borderColor }]}
                            onPress={() => router.push(`/user/${item.id}`)}
                        >
                            {item.avatarUrl ? (
                                <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarFallback, { backgroundColor: `${primaryColor}20` }]}>
                                    <Text style={[styles.avatarFallbackText, { color: primaryColor }]}>
                                        {item.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.content}>
                                <View style={styles.row}>
                                    <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <View style={styles.statusRow}>
                                        <View
                                            style={[
                                                styles.statusDot,
                                                {
                                                    backgroundColor: onlineUserIds.includes(item.id)
                                                        ? successColor
                                                        : offlineColor,
                                                },
                                            ]}
                                        />
                                        <Text
                                            style={[
                                                styles.statusText,
                                                {
                                                    color: onlineUserIds.includes(item.id)
                                                        ? successColor
                                                        : subtextColor,
                                                },
                                            ]}
                                        >
                                            {onlineUserIds.includes(item.id) ? 'Online' : 'Offline'}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.badge,
                                            {
                                                backgroundColor:
                                                    item.role === 'Captain'
                                                        ? `${primaryColor}15`
                                                        : `${subtextColor}14`,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.badgeText,
                                                {
                                                    color:
                                                        item.role === 'Captain'
                                                            ? primaryColor
                                                            : subtextColor,
                                                },
                                            ]}
                                        >
                                            {item.role}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.subtitle, { color: subtextColor }]} numberOfLines={1}>
                                    {item.subtitle}
                                </Text>
                            </View>

                            <IconSymbol name="chevron.right" size={18} color={subtextColor} />
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
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
    headerCopy: {
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    card: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarFallback: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarFallbackText: {
        fontSize: 18,
        fontWeight: '800',
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    subtitle: {
        marginTop: 4,
        fontSize: 13,
    },
});
