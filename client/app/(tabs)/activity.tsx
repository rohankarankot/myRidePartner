import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripService } from '@/services/trip-service';
import { joinRequestService } from '@/services/join-request-service';
import { TripStatus, JoinRequestStatus, GenderPreference } from '@/types/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useQuery } from '@tanstack/react-query';
import { useScrollToTop, useFocusEffect } from '@react-navigation/native';
import { AppLoader } from '@/components/app-loader';

const TripCard = (props: {
    documentId: string,
    from: string,
    to: string,
    date: string,
    price?: number | null,
    status: TripStatus | JoinRequestStatus,
    isPriceCalculated: boolean | null,
    genderPreference: GenderPreference,
    avatarUrl?: string,
    captainName?: string,
    pendingRequestsCount?: number,
    onPress: (documentId: string) => void
}) => {
    const { documentId, from, to, date, price, status, isPriceCalculated, genderPreference, avatarUrl, captainName, pendingRequestsCount = 0, onPress } = props;

    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const successColor = useThemeColor({}, 'success');
    const successBg = useThemeColor({}, 'successBg');
    const dangerColor = useThemeColor({}, 'danger');
    const dangerBg = useThemeColor({}, 'dangerBg');

    const getStatusStyle = () => {
        switch (status) {
            case 'APPROVED': return { bg: successBg, text: successColor };
            case 'PENDING': return { bg: '#FEF3C7', text: '#D97706' };
            case 'REJECTED':
            case 'CANCELLED': return { bg: dangerBg, text: dangerColor };
            case 'COMPLETED': return { bg: successBg, text: successColor };
            case 'STARTED': return { bg: `${primaryColor}15`, text: primaryColor };
            case 'PUBLISHED': return { bg: '#10B98115', text: '#10B981' };
            default: return { bg: borderColor, text: subtextColor };
        }
    };

    const statusStyle = getStatusStyle();

    return (
        <TouchableOpacity
            style={[styles.tripCard, { backgroundColor: cardColor }]}
            onPress={() => onPress(documentId)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatarContainer, { flex: 1 }]}>
                    <Image
                        source={avatarUrl ? { uri: avatarUrl } : { uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' }}
                        style={styles.cardAvatar}
                    />
                    <View style={styles.captainInfo}>
                        <Text style={[styles.captainName, { color: textColor }]}>{captainName || 'Captain'}</Text>
                        <Text style={[styles.dateText, { color: subtextColor }]}>{date}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{status}</Text>
                </View>

                {pendingRequestsCount > 0 ? (
                    <View style={[styles.pendingBadge, { backgroundColor: primaryColor }]}>
                        <Text style={styles.pendingBadgeText}>{pendingRequestsCount} Pending</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.routeRow}>

                <View style={styles.iconColumn}>
                    <View style={[styles.dot, { backgroundColor: primaryColor }]} />
                    <View style={[styles.line, { backgroundColor: borderColor }]} />
                    <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                </View>

                <View style={styles.addressList}>
                    <Text style={[styles.address, { color: textColor }]} numberOfLines={2}>{from}</Text>
                    <Text style={[styles.address, { color: textColor, marginTop: 20 }]} numberOfLines={2}>{to}</Text>
                </View>
                <View style={[styles.genderBadge, { backgroundColor: genderPreference === 'both' ? '#F3F4FB' : genderPreference === 'men' ? '#EBF5FF' : '#FFF1F2' }]}>
                    <IconSymbol
                        name={genderPreference === 'both' ? 'person.2.fill' : genderPreference === 'men' ? 'person.fill' : 'person.fill'}
                        size={10}
                        color={genderPreference === 'both' ? '#6B7280' : genderPreference === 'men' ? '#3B82F6' : '#F43F5E'}
                    />
                    <Text style={[styles.genderText, { color: genderPreference === 'both' ? '#6B7280' : genderPreference === 'men' ? '#3B82F6' : '#F43F5E' }]}>
                        {genderPreference === 'both' ? 'All' : genderPreference === 'men' ? 'Men' : 'Women'}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <View style={styles.cardFooter}>
                <View>

                    <Text style={[styles.price, { color: primaryColor }]}>
                        {typeof price === 'number' ? `₹${price}` : isPriceCalculated ? 'Calculated on departure' : 'Price not set'}
                    </Text>
                </View>
                <IconSymbol name="chevron.right" size={18} color={subtextColor} />
            </View>
        </TouchableOpacity>
    );
};

// Define available tabs
type FilterTab = 'published' | 'in-progress' | 'completed' | 'part-of' | 'leading';
const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: 'published', label: 'Published' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'part-of', label: 'Part Of' },
];

export default function ActivityScreen() {
    const params = useLocalSearchParams<{ tab?: FilterTab }>();
    const [activeTab, setActiveTab] = useState<FilterTab>(params.tab ?? 'published');

    // useFocusEffect runs whenever the screen gains focus, unlike useEffect which only
    // runs when the dep value actually changes in React's eyes — important for bottom tabs
    // that stay mounted in the background.
    useFocusEffect(
        useCallback(() => {
            if (params.tab) {
                setActiveTab(params.tab);
            }
        }, [params.tab])
    );
    const { user } = useAuth();
    const router = useRouter();
    const ref = useRef<ScrollView>(null);
    useScrollToTop(ref);

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');

    const {
        data: trips = [],
        isLoading: isLoadingTrips,
        isRefetching: isRefetchingTrips,
        refetch: refetchTrips
    } = useQuery({
        queryKey: ['trips', user?.id],
        queryFn: () => tripService.getUserTrips(user!.id),
        enabled: !!user?.id,
    });

    const {
        data: requests = [],
        isLoading: isLoadingRequests,
        isRefetching: isRefetchingRequests,
        refetch: refetchRequests
    } = useQuery({
        queryKey: ['join-requests', user?.id],
        queryFn: () => joinRequestService.getJoinRequestsForUser(user!.id),
        enabled: !!user?.id,
    });

    const onRefresh = () => {
        refetchTrips();
        refetchRequests();
    };

    const isLoading = isLoadingTrips || isLoadingRequests;
    const isRefetching = isRefetchingTrips || isRefetchingRequests;

    // Dynamic filtering logic
    const getFilteredData = () => {
        let displayTrips: any[] = [];
        let displayRequests: any[] = [];

        switch (activeTab) {
            case 'leading':
                displayTrips = trips;
                break;
            case 'part-of':
                displayRequests = requests;
                break;
            case 'published':
                displayTrips = trips.filter(t => t.status === 'PUBLISHED');
                break;
            case 'in-progress':
                displayTrips = trips.filter(t => t.status === 'STARTED');
                displayRequests = requests.filter(r => r.trip?.status === 'STARTED' && r.status === 'APPROVED');
                break;
            case 'completed':
                displayTrips = trips.filter(t => t.status === 'COMPLETED');
                displayRequests = requests.filter(r => r.trip?.status === 'COMPLETED' && r.status === 'APPROVED');
                break;
        }

        return { displayTrips, displayRequests };
    };

    const { displayTrips, displayRequests } = getFilteredData();

    if (isLoading && !isRefetching) {
        return (
            <View style={[styles.center, { backgroundColor }]}>
                <AppLoader />
            </View>
        );
    }

    return (
        <View style={[styles.safe, { backgroundColor }]}  >
            {/* Top Tab Navigation */}
            <View style={styles.tabsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScrollContent}
                >
                    {FILTER_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                style={[
                                    styles.tabButton,
                                    isActive ? { backgroundColor: primaryColor, borderColor: primaryColor } : { borderColor: subtextColor + '40', backgroundColor: 'transparent' }
                                ]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    isActive ? { color: '#fff' } : { color: subtextColor }
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView
                ref={ref}
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
                }
            >
                {displayTrips.length === 0 && displayRequests.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="list.bullet" size={48} color={subtextColor} />
                        <Text style={[styles.emptyText, { color: subtextColor }]}>No {activeTab.replace('-', ' ')} activity found.</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/')}>
                            <Text style={{ color: primaryColor, fontWeight: '600' }}>Find a ride</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {displayTrips.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: textColor }]}>Trips You're Leading</Text>
                                {displayTrips.map((trip) => (
                                    <TripCard
                                        key={trip.id}
                                        isPriceCalculated={trip.isPriceCalculated}
                                        documentId={trip.documentId}
                                        from={trip.startingPoint}
                                        to={trip.destination}
                                        date={`${trip.date} • ${trip.time}`}
                                        price={trip.pricePerSeat}
                                        status={trip.status}
                                        genderPreference={trip.genderPreference}
                                        avatarUrl={
                                            typeof trip.creator?.userProfile?.avatar === 'string'
                                                ? trip.creator.userProfile.avatar
                                                : (trip.creator?.userProfile?.avatar as any)?.url
                                        }
                                        captainName={trip.creator?.userProfile?.fullName || trip.creator?.username}
                                        pendingRequestsCount={trip.joinRequests?.filter((r: any) => r.status === 'PENDING').length}
                                        onPress={(docId) => router.push(`/trip/${docId}`)}
                                    />
                                ))}
                            </>
                        )}

                        {displayRequests.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: textColor, marginTop: displayTrips.length > 0 ? 24 : 0 }]}>Trips You've Requested</Text>
                                {displayRequests.map((request) => (
                                    <TripCard
                                        key={request.id}
                                        isPriceCalculated={request.trip?.isPriceCalculated}
                                        documentId={request.trip?.documentId}
                                        from={request.trip?.startingPoint}
                                        to={request.trip?.destination}
                                        date={`${request.trip?.date} • ${request.trip?.time}`}
                                        price={request.trip?.pricePerSeat}
                                        status={request.status}
                                        genderPreference={request.trip?.genderPreference || 'both'}
                                        avatarUrl={
                                            typeof request.trip?.creator?.userProfile?.avatar === 'string'
                                                ? request.trip.creator.userProfile.avatar
                                                : (request.trip?.creator?.userProfile?.avatar as any)?.url
                                        }
                                        captainName={request.trip?.creator?.userProfile?.fullName || request.trip?.creator?.username}
                                        onPress={(docId) => router.push(`/trip/${docId}`)}
                                    />
                                ))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    tabsContainer: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        backgroundColor: 'transparent',
    },
    tabsScrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tripCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    genderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        height: 24,
    },
    genderText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    pendingBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    pendingBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    routeRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    iconColumn: {
        alignItems: 'center',
        marginRight: 12,
        paddingVertical: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    line: {
        width: 1,
        height: 30,
        marginVertical: 2,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    captainInfo: {
        marginLeft: 12,
        justifyContent: 'center',
    },
    captainName: {
        fontSize: 15,
        fontWeight: '700',
    },
    addressList: {
        flex: 1,
        justifyContent: 'space-between',
    },
    address: {
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
        marginBottom: 20,
    },
    emptyButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
    }
});
