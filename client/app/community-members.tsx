import React, { useMemo, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AppLoader } from '@/components/app-loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import { userService } from '@/services/user-service';
import { CommunityMember } from '@/types/api';
import { useUserStore } from '@/store/user-store';

const PAGE_SIZE = 20;

export default function CommunityMembersScreen() {
    const { profile } = useUserStore();
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');
    const [selectedCity, setSelectedCity] = useState<string | null>(profile?.city || null);

    const { data: cities = [] } = useQuery({
        queryKey: ['community-member-cities'],
        queryFn: () => userService.getCommunityMemberCities(),
    });

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['community-members', selectedCity],
        queryFn: ({ pageParam }) => userService.getCommunityMembers({
            page: pageParam,
            pageSize: PAGE_SIZE,
            city: selectedCity || undefined,
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, pageCount } = lastPage.meta.pagination;
            return page < pageCount ? page + 1 : undefined;
        },
    });

    const members = data?.pages.flatMap((page) => page.data) ?? [];
    const cityFilters = useMemo(
        () => ['All cities', ...cities],
        [cities]
    );

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor }]}>
                <AppLoader />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: 'Members',
                    headerShown: true,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                }}
            />

            <FlatList
                data={members}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.container}
                onEndReachedThreshold={0.4}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        void fetchNextPage();
                    }
                }}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                        {getAvatarUrl(item) ? (
                            <Image source={{ uri: getAvatarUrl(item)! }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarFallback, { backgroundColor: `${primaryColor}18` }]}>
                                <Text style={[styles.avatarFallbackText, { color: primaryColor }]}>
                                    {getMemberName(item).charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View style={styles.content}>
                            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
                                {getMemberName(item)}
                            </Text>
                            <Text style={[styles.subtitle, { color: subtextColor }]} numberOfLines={1}>
                                {item.userProfile?.city || item.email}
                            </Text>
                        </View>
                    </View>
                )}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: textColor }]}>Community members</Text>
                        <Text style={[styles.headerSubtitle, { color: subtextColor }]}>
                            Members are filtered city-wise, and users without an updated city are hidden.
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterRow}
                        >
                            {cityFilters.map((city) => {
                                const isSelected = city === 'All cities'
                                    ? selectedCity === null
                                    : selectedCity === city;

                                return (
                                    <TouchableOpacity
                                        key={city}
                                        onPress={() => setSelectedCity(city === 'All cities' ? null : city)}
                                        style={[
                                            styles.filterChip,
                                            {
                                                backgroundColor: isSelected ? primaryColor : cardColor,
                                                borderColor: isSelected ? primaryColor : borderColor,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                { color: isSelected ? '#FFFFFF' : textColor },
                                            ]}
                                        >
                                            {city}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                }
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={styles.footerLoader}>
                            <AppLoader />
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const getMemberName = (member: CommunityMember) =>
    member.userProfile?.fullName || member.username || 'Member';

const getAvatarUrl = (member: CommunityMember) =>
    typeof member.userProfile?.avatar === 'string'
        ? member.userProfile.avatar
        : member.userProfile?.avatar?.url;

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
    header: {
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
    },
    headerSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 14,
    },
    filterRow: {
        gap: 8,
        paddingRight: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
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
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarFallback: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarFallbackText: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
    },
    footerLoader: {
        paddingVertical: 16,
    },
});
