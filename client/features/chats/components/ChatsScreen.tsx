import React, { useMemo } from 'react';
import {
    FlatList,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { tripService } from '@/services/trip-service';
import { joinRequestService } from '@/services/join-request-service';
import { ChatsTabSkeleton } from '@/features/chats/components/ChatsTabSkeleton';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Divider } from '@/components/ui/divider';

type ChatRide = {
    tripDocumentId: string;
    title: string;
    subtitle: string;
    status: string;
    role: 'captain' | 'passenger';
    avatarUrl?: string | null;
};

const ACTIVE_STATUSES = ['PUBLISHED', 'STARTED'] as const;

export function ChatsScreen() {
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
                const avatar = trip.creator?.userProfile?.avatar;
                const avatarUrl = typeof avatar === 'string' ? avatar : avatar?.url;

                byTrip.set(trip.documentId, {
                    tripDocumentId: trip.documentId,
                    title: `${trip.startingPoint} to ${trip.destination}`,
                    subtitle: trip.status === 'STARTED' ? 'Your ride is live. Chat with your group.' : 'Coordinate pickup details with your riders.',
                    status: trip.status,
                    role: 'captain',
                    avatarUrl: avatarUrl || null,
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

                const avatar = request.trip.creator?.userProfile?.avatar;
                const avatarUrl = typeof avatar === 'string' ? avatar : avatar?.url;

                byTrip.set(request.trip.documentId, {
                    tripDocumentId: request.trip.documentId,
                    title: `${request.trip.startingPoint} to ${request.trip.destination}`,
                    subtitle: request.trip.status === 'STARTED'
                        ? 'Your ride is in progress. Stay in sync with the group.'
                        : 'You are approved for this ride. Use chat to coordinate before departure.',
                    status: request.trip.status,
                    role: 'passenger',
                    avatarUrl: avatarUrl || null,
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
        <Box className="flex-1" style={{ backgroundColor }}>
            <FlatList
                data={chatRides}
                keyExtractor={(item) => item.tripDocumentId}
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 40,
                    flexGrow: chatRides.length === 0 ? 1 : 0,
                    justifyContent: chatRides.length === 0 ? 'center' : 'flex-start',
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={() => {
                            refetchTrips();
                            refetchRequests();
                        }}
                        tintColor={primaryColor}
                    />
                }
                renderItem={({ item }) => (
                    <Pressable
                        className="rounded-[32px] border p-5 mb-4"
                        style={{ backgroundColor: cardColor, borderColor }}
                        onPress={() => router.push(`/trip-chat/${item.tripDocumentId}`)}
                    >
                        <HStack className="items-start" space="md">
                            <Avatar size="lg" className="border" style={{ borderColor }}>
                                <AvatarFallbackText>{item.title}</AvatarFallbackText>
                                {item.avatarUrl ? <AvatarImage source={{ uri: item.avatarUrl }} alt={item.title} /> : null}
                            </Avatar>

                            <VStack className="flex-1">
                                <HStack className="items-center justify-between" space="sm">
                                    <Text className="flex-1 text-base font-extrabold" style={{ color: textColor }} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Box
                                        className="rounded-full px-3 py-1 border"
                                        style={{ 
                                            backgroundColor: item.status === 'STARTED' ? `${primaryColor}10` : '#10B98110',
                                            borderColor: item.status === 'STARTED' ? primaryColor + '20' : '#10B98120'
                                        }}
                                    >
                                        <Text
                                            className="text-[9px] font-extrabold uppercase tracking-widest"
                                            style={{ color: item.status === 'STARTED' ? primaryColor : '#10B981' }}
                                        >
                                            {item.status}
                                        </Text>
                                    </Box>
                                </HStack>

                                <Text className="text-[13px] font-medium mt-1 leading-5" style={{ color: subtextColor }} numberOfLines={2}>
                                    {item.subtitle}
                                </Text>

                                <Divider className="my-3" style={{ backgroundColor: borderColor }} />

                                <HStack className="items-center justify-between">
                                    <HStack className="flex-1 items-center" space="xs">
                                        <Box className="w-6 h-6 rounded-lg items-center justify-center bg-gray-50 border" style={{ borderColor }}>
                                            <IconSymbol
                                                name={item.role === 'captain' ? 'steeringwheel' : 'person.2.fill'}
                                                size={12}
                                                color={subtextColor}
                                            />
                                        </Box>
                                        <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
                                            {item.role === 'captain' ? 'Captain' : 'Passenger'}
                                        </Text>
                                    </HStack>

                                    <Box className="w-7 h-7 rounded-full items-center justify-center bg-gray-50 border" style={{ borderColor }}>
                                        <IconSymbol name="chevron.right" size={14} color={subtextColor} />
                                    </Box>
                                </HStack>
                            </VStack>
                        </HStack>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <VStack className="items-center px-10" space="lg">
                        <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3">
                            <IconSymbol name="bubble.left.and.bubble.right.fill" size={34} color={primaryColor} />
                        </Box>
                        <VStack className="items-center" space="xs">
                            <Text className="text-2xl font-extrabold text-center" style={{ color: textColor }}>Silence is golden</Text>
                            <Text className="text-sm font-medium leading-6 text-center" style={{ color: subtextColor }}>
                                Join a ride or publish one to start coordinating your journey.
                            </Text>
                        </VStack>
                        <Pressable 
                            className="mt-4 rounded-2xl px-8 py-3.5 border"
                            style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor }}
                            onPress={() => router.push('/')}
                        >
                            <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                                Discover Rides
                            </Text>
                        </Pressable>
                    </VStack>
                }
            />
        </Box>
    );
}
