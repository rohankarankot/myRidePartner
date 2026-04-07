import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { tripService } from '@/services/trip-service';
import { socketService } from '@/services/socket-service';
import { userService } from '@/services/user-service';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { maskPhoneNumber } from '@/utils/phone';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

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
                        (request.sharePhoneNumber
                            ? passengerProfile?.phoneNumber
                            : maskPhoneNumber(passengerProfile?.phoneNumber)) ||
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
            onlineUsers?: { userId: number; userName: string }[];
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
                <Box className="flex-1 items-center justify-center" style={{ backgroundColor }}>
                    <Spinner size="large" color={primaryColor} />
                </Box>
            ) : (
                <FlatList
                    data={members}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.container}
                    ListHeaderComponent={
                        <Box style={styles.headerCopy}>
                            <Text className="text-2xl font-extrabold mb-1" style={{ color: textColor }}>
                                Everyone in this ride
                            </Text>
                            <Text className="text-sm leading-5" style={{ color: subtextColor }}>
                                {titleText}
                            </Text>
                            <Pressable
                                className="mt-4 rounded-3xl border px-4 py-4 flex-row items-center"
                                style={[styles.cardShadow, { backgroundColor: cardColor, borderColor: `${primaryColor}28` }]}
                                onPress={() => router.push(`/trip/${tripId}`)}
                            >
                                <Box className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: `${primaryColor}14` }}>
                                    <IconSymbol name="car.fill" size={18} color={primaryColor} />
                                </Box>
                                <VStack className="flex-1 ml-3">
                                    <Text className="text-[11px] font-extrabold uppercase mb-1" style={{ color: primaryColor }}>
                                        Ride Overview
                                    </Text>
                                    <Text className="text-base font-extrabold mb-0.5" style={{ color: textColor }}>
                                        View trip details
                                    </Text>
                                    <Text className="text-sm leading-5" style={{ color: subtextColor }}>
                                        Check route, timing, seats, and ride status
                                    </Text>
                                </VStack>
                                <Box className="w-[34px] h-[34px] rounded-full items-center justify-center ml-3" style={{ backgroundColor: `${primaryColor}10` }}>
                                    <IconSymbol name="chevron.right" size={16} color={primaryColor} />
                                </Box>
                            </Pressable>
                        </Box>
                    }
                    renderItem={({ item }) => (
                        <Pressable
                            className="rounded-3xl border p-4 mb-3 flex-row items-center"
                            style={[styles.cardShadow, { backgroundColor: cardColor, borderColor }]}
                            onPress={() => router.push(`/user/${item.id}`)}
                        >
                            <Avatar size="lg">
                                <AvatarFallbackText>{item.name}</AvatarFallbackText>
                                {item.avatarUrl ? <AvatarImage source={{ uri: item.avatarUrl }} alt={item.name} /> : null}
                            </Avatar>

                            <VStack className="flex-1 ml-3">
                                <HStack className="items-center" space="sm">
                                    <Text className="flex-1 text-base font-bold" style={{ color: textColor }} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <HStack className="items-center" space="xs">
                                        <Box
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                                backgroundColor: onlineUserIds.includes(item.id)
                                                    ? successColor
                                                    : offlineColor,
                                            }}
                                        />
                                        <Text
                                            className="text-xs font-semibold"
                                            style={{
                                                color: onlineUserIds.includes(item.id)
                                                    ? successColor
                                                    : subtextColor,
                                            }}
                                        >
                                            {onlineUserIds.includes(item.id) ? 'Online' : 'Offline'}
                                        </Text>
                                    </HStack>
                                    <Box
                                        className="rounded-full px-3 py-1"
                                        style={{
                                            backgroundColor:
                                                item.role === 'Captain'
                                                    ? `${primaryColor}15`
                                                    : `${subtextColor}14`,
                                        }}
                                    >
                                        <Text
                                            className="text-[11px] font-bold"
                                            style={{
                                                color:
                                                    item.role === 'Captain'
                                                        ? primaryColor
                                                        : subtextColor,
                                            }}
                                        >
                                            {item.role}
                                        </Text>
                                    </Box>
                                </HStack>
                                <Text className="text-sm mt-1" style={{ color: subtextColor }} numberOfLines={1}>
                                    {item.subtitle}
                                </Text>
                            </VStack>

                            <IconSymbol name="chevron.right" size={18} color={subtextColor} />
                        </Pressable>
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
    cardShadow: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    container: {
        padding: 16,
    },
    headerCopy: {
        marginBottom: 10,
    },
});
