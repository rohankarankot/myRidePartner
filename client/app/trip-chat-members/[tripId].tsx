import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
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
import { Divider } from '@/components/ui/divider';

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

    const { data: members = [], isLoading, refetch, isRefetching } = useQuery({
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
            return 'Just the captain for now';
        }
        return `${riderCount} approved rider${riderCount > 1 ? 's' : ''} in this group`;
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
        <Box className="flex-1" style={{ backgroundColor }}>
            <Stack.Screen
                options={{
                    title: 'Group Members',
                    headerShown: true,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                    headerTitleStyle: { fontWeight: '800' },
                }}
            />

            {isLoading && !isRefetching ? (
                <Box className="flex-1 items-center justify-center">
                    <Spinner size="large" color={primaryColor} />
                    <Text className="mt-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Scanning group…</Text>
                </Box>
            ) : (
                <FlatList
                    data={members}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
                    }
                    ListHeaderComponent={
                        <Box className="mb-6">
                            <Text className="text-3xl font-extrabold mb-1" style={{ color: textColor }}>
                                The Squad
                            </Text>
                            <Text className="text-sm font-medium leading-5" style={{ color: subtextColor }}>
                                {titleText}
                            </Text>
                            
                            <Pressable
                                className="mt-6 rounded-[32px] border-2 p-5 flex-row items-center shadow-xl"
                                style={{ backgroundColor: cardColor, borderColor: `${primaryColor}30` }}
                                onPress={() => router.push(`/trip/${tripId}`)}
                            >
                                <Box className="w-12 h-12 rounded-2xl items-center justify-center border shadow-sm" style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor + '20' }}>
                                    <IconSymbol name="car.fill" size={20} color={primaryColor} />
                                </Box>
                                <VStack className="flex-1 ml-4" >
                                    <Text className="text-[9px] font-extrabold uppercase tracking-widest mb-1" style={{ color: primaryColor }}>
                                        Full Trip Logistics
                                    </Text>
                                    <Text className="text-base font-extrabold" style={{ color: textColor }}>
                                        Explore ride details
                                    </Text>
                                    <Text className="text-xs font-medium leading-5" style={{ color: subtextColor }}>
                                        Route, timing, and policies
                                    </Text>
                                </VStack>
                                <Box className="w-8 h-8 rounded-full items-center justify-center border shadow-xs" style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor + '10' }}>
                                    <IconSymbol name="chevron.right" size={14} color={primaryColor} />
                                </Box>
                            </Pressable>

                            <Divider className="my-8" style={{ backgroundColor: borderColor }} />
                            
                            <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1 mb-4" style={{ color: subtextColor }}>
                                Active Members
                            </Text>
                        </Box>
                    }
                    renderItem={({ item }) => (
                        <Pressable
                            className="rounded-[28px] border p-5 mb-4 flex-row items-center shadow-sm"
                            style={{ backgroundColor: cardColor, borderColor }}
                            onPress={() => router.push(`/user/${item.id}`)}
                        >
                            <Avatar size="lg" className="border shadow-sm" style={{ borderColor }}>
                                <AvatarFallbackText>{item.name}</AvatarFallbackText>
                                {item.avatarUrl ? <AvatarImage source={{ uri: item.avatarUrl }} alt={item.name} /> : null}
                            </Avatar>

                            <VStack className="flex-1 ml-4">
                                <HStack className="items-center justify-between mb-1" space="xs">
                                    <Text className="flex-1 text-base font-extrabold" style={{ color: textColor }} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Box
                                        className="rounded-full px-3 py-1 border shadow-xs"
                                        style={{
                                            backgroundColor:
                                                item.role === 'Captain'
                                                    ? `${primaryColor}10`
                                                    : `#11182708`,
                                            borderColor: item.role === 'Captain' ? primaryColor + '20' : borderColor
                                        }}
                                    >
                                        <Text
                                            className="text-[9px] font-extrabold uppercase tracking-widest"
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
                                
                                <HStack className="items-center mb-1.5" space="xs">
                                    <Box
                                        className="w-2 h-2 rounded-full border border-white"
                                        style={{
                                            backgroundColor: onlineUserIds.includes(item.id)
                                                ? successColor
                                                : offlineColor,
                                        }}
                                    />
                                    <Text
                                        className="text-[10px] font-extrabold uppercase tracking-tight"
                                        style={{
                                            color: onlineUserIds.includes(item.id)
                                                ? successColor
                                                : subtextColor,
                                        }}
                                    >
                                        {onlineUserIds.includes(item.id) ? 'Online' : 'Away'}
                                    </Text>
                                </HStack>

                                <Text className="text-[13px] font-medium leading-5" style={{ color: subtextColor }} numberOfLines={1}>
                                    {item.subtitle}
                                </Text>
                            </VStack>

                            <Box className="ml-3 w-7 h-7 rounded-full items-center justify-center border bg-gray-50/50 shadow-xs" style={{ borderColor }}>
                                <IconSymbol name="chevron.right" size={12} color={subtextColor} />
                            </Box>
                        </Pressable>
                    )}
                />
            )}
        </Box>
    );
}
