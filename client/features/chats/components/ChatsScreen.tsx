import React, { useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { communityGroupService } from '@/services/community-group-service';
import { CommunityGroup, CommunityGroupStatus } from '@/types/api';
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

type ChatsTab = 'rides' | 'groups';

function ChatsTabs({
    activeTab,
    borderColor,
    onTabChange,
    primaryColor,
    subtextColor,
}: {
    activeTab: ChatsTab;
    borderColor: string;
    onTabChange: (tab: ChatsTab) => void;
    primaryColor: string;
    subtextColor: string;
}) {
    return (
        <Box style={{ borderBottomColor: borderColor }} className="border-b">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}
            >
                {(['rides', 'groups'] as const).map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <Pressable
                            key={tab}
                            className="rounded-full border px-5 py-2 mr-3"
                            style={{
                                backgroundColor: isActive ? primaryColor : 'transparent',
                                borderColor: isActive ? primaryColor : borderColor,
                            }}
                            onPress={() => onTabChange(tab)}
                        >
                            <Text
                                className="text-xs font-extrabold uppercase tracking-widest"
                                style={{ color: isActive ? '#fff' : subtextColor }}
                            >
                                {tab === 'rides' ? 'Ride Chats' : 'Community Groups'}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </Box>
    );
}

const STATUS_CONFIG: Record<CommunityGroupStatus, { label: string; color: string }> = {
    PENDING: { label: 'Pending', color: '#F59E0B' },
    APPROVED: { label: 'Approved', color: '#18A957' },
    REJECTED: { label: 'Rejected', color: '#DC2626' },
};

export function ChatsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ChatsTab>('rides');

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

    const {
        data: groups = [],
        isLoading: isLoadingGroups,
        refetch: refetchGroups,
        isRefetching: isRefetchingGroups,
    } = useQuery({
        queryKey: ['my-community-groups'],
        queryFn: () => communityGroupService.getMyGroups(),
        enabled: activeTab === 'groups',
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

    const isLoadingRides = isLoadingTrips || isLoadingRequests;
    const isRefetchingRides = isRefetchingTrips || isRefetchingRequests;

    const isLoading = activeTab === 'rides' ? isLoadingRides : isLoadingGroups;
    const isRefetching = activeTab === 'rides' ? isRefetchingRides : isRefetchingGroups;

    if (isLoading && !isRefetching) {
        return (
            <Box className="flex-1" style={{ backgroundColor }}>
                <ChatsTabs
                    activeTab={activeTab}
                    borderColor={borderColor}
                    onTabChange={setActiveTab}
                    primaryColor={primaryColor}
                    subtextColor={subtextColor}
                />
                <ChatsTabSkeleton />
            </Box>
        );
    }

    const renderGroupItem = ({ item }: { item: CommunityGroup }) => {
        const statusConfig = STATUS_CONFIG[item.status];
        return (
            <Pressable
                className="rounded-[32px] border p-5 mb-4"
                style={{ backgroundColor: cardColor, borderColor }}
                onPress={() => router.push(`/community-group-chat/${item.documentId}`)}
            >
                <HStack className="items-center justify-between">
                    <Box
                        className="h-12 w-12 rounded-[20px] items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}10` }}
                    >
                        <IconSymbol name="person.3.fill" size={22} color={primaryColor} />
                    </Box>

                    <VStack className="flex-1 mx-4" space="xs">
                        <HStack className="items-center" space="sm">
                            <Text className="text-base font-bold flex-1" numberOfLines={1} style={{ color: textColor }}>
                                {item.name}
                            </Text>
                            <Box
                                className="rounded-full px-2.5 py-1 border"
                                style={{
                                    backgroundColor: `${statusConfig.color}12`,
                                    borderColor: `${statusConfig.color}25`,
                                }}
                            >
                                <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: statusConfig.color }}>
                                    {statusConfig.label}
                                </Text>
                            </Box>
                        </HStack>
                        <HStack className="items-center" space="xs">
                            <IconSymbol name="person.2.fill" size={12} color={subtextColor} />
                            <Text className="text-xs font-medium" style={{ color: subtextColor }}>
                                {item.memberCount ?? 0} member{(item.memberCount ?? 0) !== 1 ? 's' : ''}
                            </Text>
                        </HStack>
                    </VStack>

                    <Box className="w-7 h-7 rounded-full items-center justify-center bg-gray-50 border" style={{ borderColor }}>
                        <IconSymbol name="chevron.right" size={14} color={subtextColor} />
                    </Box>
                </HStack>
            </Pressable>
        );
    };

    return (
        <Box className="flex-1" style={{ backgroundColor }}>
            <ChatsTabs
                activeTab={activeTab}
                borderColor={borderColor}
                onTabChange={setActiveTab}
                primaryColor={primaryColor}
                subtextColor={subtextColor}
            />
            {activeTab === 'rides' ? (
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
            ) : (
                <FlatList
                    data={groups}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{
                        padding: 20,
                        paddingBottom: 40,
                        flexGrow: groups.length === 0 ? 1 : 0,
                        justifyContent: groups.length === 0 ? 'center' : 'flex-start',
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetchGroups}
                            tintColor={primaryColor}
                        />
                    }
                    renderItem={renderGroupItem}
                    ListEmptyComponent={
                        <VStack className="items-center px-10" space="lg">
                            <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3">
                                <IconSymbol name="person.3.fill" size={34} color={primaryColor} />
                            </Box>
                            <VStack className="items-center" space="xs">
                                <Text className="text-2xl font-extrabold text-center" style={{ color: textColor }}>No Communities</Text>
                                <Text className="text-sm font-medium leading-6 text-center" style={{ color: subtextColor }}>
                                    You don't have any community groups yet.
                                </Text>
                            </VStack>
                            <Pressable 
                                className="mt-4 rounded-2xl px-8 py-3.5 border"
                                style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor }}
                                onPress={() => router.push('/create-community-group')}
                            >
                                <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                                    Create a Group
                                </Text>
                            </Pressable>
                        </VStack>
                    }
                />
            )}
        </Box>
    );
}
