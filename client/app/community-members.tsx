import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { AppLoader } from '@/components/app-loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import { userService } from '@/services/user-service';
import { CommunityMember } from '@/types/api';
import { useUserStore } from '@/store/user-store';
import { IconSymbol } from '@/components/ui/icon-symbol';

const PAGE_SIZE = 20;

const CommunityCitySheetHeader = React.memo(({
    citySearch,
    setCitySearch,
    textColor,
    subtextColor,
}: {
    citySearch: string;
    setCitySearch: (value: string) => void;
    textColor: string;
    subtextColor: string;
}) => (
    <View style={styles.sheetHeader}>
        <View style={styles.sheetHeaderCopy}>
            <Text style={[styles.sheetTitle, { color: textColor }]}>Select City</Text>
            <Text style={[styles.sheetSubtitle, { color: subtextColor }]}>
                Filter community members by city
            </Text>
        </View>
        <View style={[styles.sheetSearchBox, { backgroundColor: `${subtextColor}10` }]}>
            <IconSymbol name="magnifyingglass" size={18} color={subtextColor} />
            <BottomSheetTextInput
                placeholder="Search city..."
                placeholderTextColor={subtextColor}
                style={[styles.sheetSearchInput, { color: textColor }]}
                value={citySearch}
                onChangeText={setCitySearch}
                autoCorrect={false}
                autoCapitalize="words"
            />
        </View>
    </View>
));

export default function CommunityMembersScreen() {
    const { city } = useLocalSearchParams<{ city?: string }>();
    const { profile } = useUserStore();
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');
    const citySheetRef = useRef<BottomSheetModal>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(city || profile?.city || null);
    const [citySearch, setCitySearch] = useState('');

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
    const activeCityLabel = selectedCity || 'All cities';
    const filteredCities = useMemo(
        () => cityFilters.filter((city) => city.toLowerCase().includes(citySearch.toLowerCase())),
        [cityFilters, citySearch]
    );
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
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
                        <View style={styles.filterSummaryRow}>
                            <Text style={[styles.filterSummaryLabel, { color: subtextColor }]}>Current city filter</Text>
                            <View style={[styles.filterSummaryBadge, { backgroundColor: `${primaryColor}14` }]}>
                                <Text style={[styles.filterSummaryBadgeText, { color: primaryColor }]} numberOfLines={1}>
                                    {activeCityLabel}
                                </Text>
                            </View>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={[styles.emptyCard, { backgroundColor: cardColor, borderColor }]}>
                        <Text style={[styles.emptyCardTitle, { color: textColor }]}>No members found</Text>
                        <Text style={[styles.emptyCardSubtitle, { color: subtextColor }]}>
                            Try another city filter to see more community members.
                        </Text>
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

            <TouchableOpacity
                onPress={() => citySheetRef.current?.present()}
                activeOpacity={0.88}
                style={[styles.floatingFilterButton, { backgroundColor: primaryColor }]}
            >
                <IconSymbol name="slider.horizontal.3" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <BottomSheetModal
                ref={citySheetRef}
                snapPoints={['78%']}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: cardColor }}
                handleIndicatorStyle={{ backgroundColor: subtextColor }}
                enablePanDownToClose
                keyboardBehavior="fillParent"
                keyboardBlurBehavior="restore"
                onDismiss={() => setCitySearch('')}
            >
                <BottomSheetFlatList
                    data={filteredCities}
                    keyExtractor={(item: string) => item}
                    ListHeaderComponent={
                        <CommunityCitySheetHeader
                            citySearch={citySearch}
                            setCitySearch={setCitySearch}
                            textColor={textColor}
                            subtextColor={subtextColor}
                        />
                    }
                    renderItem={({ item }: { item: string }) => {
                        const isActive = item === 'All cities'
                            ? selectedCity === null
                            : selectedCity === item;

                        return (
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[
                                    styles.cityRow,
                                    {
                                        backgroundColor: isActive ? `${primaryColor}10` : 'transparent',
                                        borderColor: isActive ? primaryColor : 'transparent',
                                    },
                                ]}
                                onPress={() => {
                                    setSelectedCity(item === 'All cities' ? null : item);
                                    setCitySearch('');
                                    citySheetRef.current?.dismiss();
                                }}
                            >
                                <View style={styles.cityRowLeft}>
                                    <View
                                        style={[
                                            styles.cityRowIcon,
                                            { backgroundColor: isActive ? primaryColor : `${subtextColor}15` },
                                        ]}
                                    >
                                        <IconSymbol
                                            name={item === 'All cities' ? 'globe' : 'mappin.circle.fill'}
                                            size={20}
                                            color={isActive ? '#FFFFFF' : subtextColor}
                                        />
                                    </View>
                                    <View style={styles.cityRowCopy}>
                                        <Text
                                            style={[
                                                styles.cityRowTitle,
                                                { color: isActive ? primaryColor : textColor },
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                    </View>
                                </View>
                                {isActive ? (
                                    <View style={[styles.cityRowCheck, { backgroundColor: primaryColor }]}>
                                        <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                                    </View>
                                ) : null}
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <BottomSheetView style={styles.sheetEmptyState}>
                            <Text style={[styles.sheetEmptyTitle, { color: textColor }]}>No matching city</Text>
                            <Text style={[styles.sheetEmptySubtitle, { color: subtextColor }]}>
                                Try a different search keyword.
                            </Text>
                        </BottomSheetView>
                    }
                    contentContainerStyle={styles.sheetListContent}
                    showsVerticalScrollIndicator={false}
                />
            </BottomSheetModal>
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
    filterSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    filterSummaryLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    filterSummaryBadge: {
        maxWidth: 220,
        minHeight: 28,
        borderRadius: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterSummaryBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    floatingFilterButton: {
        position: 'absolute',
        right: 18,
        bottom: 24,
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
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
    emptyCard: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 20,
        alignItems: 'center',
        marginTop: 4,
    },
    emptyCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptyCardSubtitle: {
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
    },
    sheetHeader: {
        padding: 24,
        paddingBottom: 16,
    },
    sheetHeaderCopy: {
        marginBottom: 18,
    },
    sheetTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    sheetSubtitle: {
        fontSize: 14,
    },
    sheetSearchBox: {
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    sheetSearchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
    },
    sheetListContent: {
        paddingBottom: 40,
    },
    cityRow: {
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRadius: 18,
        marginBottom: 10,
        marginHorizontal: 20,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    cityRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    cityRowIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cityRowCopy: {
        flex: 1,
    },
    cityRowTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    cityRowCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetEmptyState: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    sheetEmptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    sheetEmptySubtitle: {
        fontSize: 13,
        textAlign: 'center',
    },
});
