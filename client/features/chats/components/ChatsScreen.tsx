import React, { useMemo } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
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
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';

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
                    <Pressable
                        className="rounded-3xl border p-4 mb-3"
                        style={[styles.cardShadow, { backgroundColor: cardColor, borderColor }]}
                        onPress={() => router.push(`/trip-chat/${item.tripDocumentId}`)}
                    >
                        <HStack className="items-start" space="md">
                            <Avatar size="lg">
                                <AvatarFallbackText>{item.title}</AvatarFallbackText>
                                {item.avatarUrl ? <AvatarImage source={{ uri: item.avatarUrl }} alt={item.title} /> : null}
                            </Avatar>

                            <VStack className="flex-1">
                                <HStack className="items-center" space="sm">
                                    <Text className="flex-1 text-base font-bold" style={{ color: textColor }} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Box
                                        className="rounded-full px-3 py-1"
                                        style={{ backgroundColor: item.status === 'STARTED' ? `${primaryColor}18` : '#10B98118' }}
                                    >
                                        <Text
                                            className="text-[11px] font-bold"
                                            style={{ color: item.status === 'STARTED' ? primaryColor : '#10B981' }}
                                        >
                                            {item.status}
                                        </Text>
                                    </Box>
                                </HStack>

                                <Text className="text-sm mt-2 leading-5" style={{ color: subtextColor }} numberOfLines={2}>
                                    {item.subtitle}
                                </Text>

                                <HStack className="mt-3 items-center justify-between">
                                    <HStack className="flex-1 items-center mr-2" space="xs">
                                        <IconSymbol
                                            name={item.role === 'captain' ? 'steeringwheel' : 'person.2.fill'}
                                            size={14}
                                            color={subtextColor}
                                        />
                                        <Text className="text-xs font-semibold flex-1" style={{ color: subtextColor }}>
                                            {item.role === 'captain' ? 'You are leading this ride' : 'You are part of this ride'}
                                        </Text>
                                    </HStack>

                                    <IconSymbol name="chevron.right" size={18} color={subtextColor} />
                                </HStack>
                            </VStack>
                        </HStack>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <Box className="items-center px-6">
                        <Box className="w-[72px] h-[72px] rounded-3xl items-center justify-center mb-[18px]" style={{ backgroundColor: `${primaryColor}12` }}>
                            <IconSymbol name="bubble.left.and.bubble.right.fill" size={34} color={primaryColor} />
                        </Box>
                        <Text className="text-2xl font-extrabold mb-2 text-center" style={{ color: textColor }}>No ride chats yet</Text>
                        <Text className="text-sm leading-6 text-center" style={{ color: subtextColor }}>
                            Join a ride or publish one of your own to start coordinating pickup points, timing, and trip updates here.
                        </Text>
                    </Box>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        padding: 16,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    cardShadow: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
});
