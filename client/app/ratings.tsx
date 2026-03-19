import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ratingService } from '@/services/rating-service';
import { useAuth } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

const DUMMY_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
const PAGE_SIZE = 10;

function StarRow({ stars }: { stars: number }) {
    return (
        <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((i) => (
                <IconSymbol
                    key={i}
                    name={i <= stars ? 'star.fill' : 'star'}
                    size={14}
                    color={i <= stars ? '#F59E0B' : '#D1D5DB'}
                />
            ))}
        </View>
    );
}

export default function RatingsScreen() {
    const { user } = useAuth();
    const { userId } = useLocalSearchParams();

    const targetUserId = userId ? Number(userId) : user?.id;
    const isCurrentUser = targetUserId === user?.id;

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');

    const {
        data,
        isLoading,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['ratings', 'user', targetUserId],
        queryFn: ({ pageParam }: { pageParam: number }) =>
            ratingService.getRatingsByUser(targetUserId!, pageParam, PAGE_SIZE),
        getNextPageParam: (lastPage: any) => {
            const pagination = lastPage?.meta?.pagination;
            if (!pagination) return undefined;
            return pagination.page < pagination.pageCount ? pagination.page + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: !!targetUserId,
    });

    // Flatten pages into a single array
    const ratings = data?.pages.flatMap((page) => page.data) ?? [];

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const totalCount = data?.pages[0]?.meta?.pagination?.total ?? 0;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: isCurrentUser ? 'My Ratings' : 'Ratings & Reviews',
                    headerShown: true,
                    headerStyle: { backgroundColor: cardColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                    headerBackTitle: 'Profile',
                }}
            />

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={[styles.errorText, { color: subtextColor }]}>Failed to load ratings</Text>
                    <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: primaryColor }]}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : ratings.length === 0 ? (
                <View style={styles.centered}>
                    <IconSymbol name="star" size={48} color={borderColor} />
                    <Text style={[styles.emptyTitle, { color: textColor }]}>No Ratings Yet</Text>
                    <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                        {isCurrentUser 
                            ? 'Your ratings from passengers will appear here after completed trips.'
                            : 'This user has not received any ratings yet.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={ratings}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <Text style={[styles.totalText, { color: subtextColor }]}>
                            {totalCount} rating{totalCount !== 1 ? 's' : ''} received
                        </Text>
                    }
                    ItemSeparatorComponent={() => <View style={styles.gap} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View style={styles.footer}>
                                <ActivityIndicator color={primaryColor} size="small" />
                            </View>
                        ) : !hasNextPage && ratings.length > 0 ? (
                            <Text style={[styles.footerText, { color: subtextColor }]}>
                                All ratings loaded
                            </Text>
                        ) : null
                    }
                    renderItem={({ item }) => {
                        const raterAvatar = item.rater?.userProfile?.avatar;
                        const raterName = item.rater?.userProfile?.fullName || item.rater?.username || 'Unknown';
                        const tripRoute = item.trip
                            ? `${item.trip.startingPoint} → ${item.trip.destination}`
                            : null;
                        const ratingDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        });

                        return (
                            <View style={[styles.card, { backgroundColor: cardColor }]}>
                                <View style={styles.cardHeader}>
                                    <Image
                                        source={{ uri: raterAvatar || DUMMY_AVATAR }}
                                        style={styles.avatar}
                                    />
                                    <View style={styles.headerInfo}>
                                        <Text style={[styles.raterName, { color: textColor }]}>{raterName}</Text>
                                        <StarRow stars={item.stars} />
                                    </View>
                                    <Text style={[styles.date, { color: subtextColor }]}>{ratingDate}</Text>
                                </View>

                                {item.comment ? (
                                    <Text style={[styles.comment, { color: textColor }]}>"{item.comment}"</Text>
                                ) : null}

                                {tripRoute ? (
                                    <View style={[styles.tripBadge, { backgroundColor: `${primaryColor}12` }]}>
                                        <IconSymbol name="car.fill" size={12} color={primaryColor} />
                                        <Text style={[styles.tripRoute, { color: primaryColor }]} numberOfLines={1}>
                                            {tripRoute}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 12,
    },
    errorText: { fontSize: 15, textAlign: 'center' },
    retryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 8,
    },
    retryText: { color: '#fff', fontWeight: '600' },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 4 },
    list: { padding: 16, paddingBottom: 32 },
    totalText: { fontSize: 13, marginBottom: 12 },
    gap: { height: 12 },
    footer: { paddingVertical: 20, alignItems: 'center' },
    footerText: { textAlign: 'center', fontSize: 12, paddingVertical: 20 },
    card: {
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        gap: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    headerInfo: { flex: 1, gap: 4 },
    raterName: { fontSize: 15, fontWeight: '600' },
    starRow: { flexDirection: 'row', gap: 2 },
    date: { fontSize: 12 },
    comment: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
    tripBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    tripRoute: { fontSize: 12, fontWeight: '600' },
});
