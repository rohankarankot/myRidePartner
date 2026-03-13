import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripService } from '@/services/trip-service';
import { joinRequestService } from '@/services/join-request-service';
import { Trip, JoinRequest, TripStatus, JoinRequestStatus } from '@/types/api';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useQuery } from '@tanstack/react-query';

const TripCard = (props: {
    documentId: string,
    from: string,
    to: string,
    date: string,
    price: string,
    status: TripStatus | JoinRequestStatus,
    isPriceCalculated: boolean | null,
    pendingRequestsCount?: number,
    onPress: (documentId: string) => void
}) => {
    const { documentId, from, to, date, price, status, isPriceCalculated, pendingRequestsCount = 0, onPress } = props;
    console.log(isPriceCalculated, "props");

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
                <Text style={[styles.dateText, { color: subtextColor }]}>{date}</Text>
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
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <View style={styles.cardFooter}>
                <Text style={[styles.price, { color: primaryColor }]}>{!isPriceCalculated ? price : "Calculated on departure"}</Text>
                <IconSymbol name="chevron.right" size={18} color={subtextColor} />
            </View>
        </TouchableOpacity>
    );
};

export default function ActivityScreen() {
    const { user } = useAuth();
    const router = useRouter();
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

    if (isLoading && !isRefetching) {
        return (
            <View style={[styles.center, { backgroundColor }]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
                }
            >

                {trips.length === 0 && requests.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="list.bullet" size={48} color={subtextColor} />
                        <Text style={[styles.emptyText, { color: subtextColor }]}>No activity found yet.</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/')}>
                            <Text style={{ color: primaryColor, fontWeight: '600' }}>Find a ride</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {trips.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: textColor }]}>Trips You're Leading</Text>
                                {trips.map((trip) => (
                                    <TripCard
                                        key={trip.id}
                                        isPriceCalculated={trip.isPriceCalculated}
                                        documentId={trip.documentId}
                                        from={trip.startingPoint}
                                        to={trip.destination}
                                        date={`${trip.date} • ${trip.time}`}
                                        price={`₹${trip.pricePerSeat}`}
                                        status={trip.status}
                                        pendingRequestsCount={trip.joinRequests?.filter(r => r.status === 'PENDING').length}
                                        onPress={(docId) => router.push(`/trip/${docId}`)}
                                    />
                                ))}
                            </>
                        )}

                        {requests.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}>Trips You've Requested</Text>
                                {requests.map((request) => (
                                    <TripCard
                                        key={request.id}
                                        isPriceCalculated={request.trip?.isPriceCalculated}
                                        documentId={request.trip?.documentId}
                                        from={request.trip?.startingPoint}
                                        to={request.trip?.destination}
                                        date={`${request.trip?.date} • ${request.trip?.time}`}
                                        price={`₹${request.trip?.pricePerSeat}`}
                                        status={request.status}
                                        onPress={(docId) => router.push(`/trip/${docId}`)}
                                    />
                                ))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        padding: 20,
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
