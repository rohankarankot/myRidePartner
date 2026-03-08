import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripService } from '@/services/trip-service';
import { userService } from '@/services/user-service';
import { joinRequestService } from '@/services/join-request-service';
import { Trip, UserProfile, JoinRequest, TripStatus, Rating } from '@/types/api';
import { useAuth } from '@/context/auth-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { ratingService } from '@/services/rating-service';
import { socketService } from '@/services/socket-service';

export default function TripDetailsScreen() {
    const { id: documentId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // ── Socket Room Management ────────────────────────────────────────
    useEffect(() => {
        if (documentId) {
            console.log(`[Socket] Joining trip room: ${documentId}`);
            socketService.emit('join_trip', documentId);
            return () => {
                console.log(`[Socket] Leaving trip room: ${documentId}`);
                socketService.emit('leave_trip', documentId);
            };
        }
    }, [documentId]);



    const [showCancelModal, setShowCancelModal] = useState(false);
    const [agreeToCancel, setAgreeToCancel] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // Rating State
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedStars, setSelectedStars] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');
    const successColor = useThemeColor({}, 'success');

    const { data: tripDetails, isLoading: loading, refetch } = useQuery({
        queryKey: ['trip-details', documentId, user?.id],
        queryFn: async () => {
            if (!documentId) return null;
            const tripData = await tripService.getTripById(documentId as string);

            let creatorProfile = null;
            if (tripData.creator?.id) {
                creatorProfile = await userService.getUserProfile(tripData.creator.id);
            }

            let requests: JoinRequest[] = [];
            if (user) {
                requests = await joinRequestService.getJoinRequestsForTrip(documentId as string);
            }

            return { trip: tripData, creatorProfile, requests };
        },
        enabled: !!documentId,
    });

    // Check if user has already rated this trip
    const { data: userRating, refetch: refetchRating } = useQuery({
        queryKey: ['user-rating', documentId, user?.id],
        queryFn: () => ratingService.getRatingForTripByUser(documentId as string, user!.id),
        enabled: !!documentId && !!user && tripDetails?.trip?.status === 'COMPLETED',
    });

    const [isRefreshing, setIsRefreshing] = useState(false);
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    const isPassenger = user ? tripDetails?.requests?.find(r => r.passenger.id === user.id && r.status === 'APPROVED') : false;

    // Show rating modal if trip is completed and user is a passenger and hasn't rated yet
    useEffect(() => {
        if (tripDetails?.trip?.status === 'COMPLETED' && isPassenger && !userRating && !loading) {
            setShowRatingModal(true);
        }
    }, [tripDetails?.trip?.status, isPassenger, userRating, loading]);

    const trip = tripDetails?.trip || null;
    console.log(trip);
    const creatorProfile = tripDetails?.creatorProfile || null;
    const joinRequests = tripDetails?.requests || [];
    const userJoinRequest = user ? joinRequests.find(r => r.passenger.id === user.id) || null : null;

    const handleJoinRequest = async () => {
        if (!user || !documentId || !trip) return;

        if (trip.availableSeats <= 0) {
            Alert.alert('No Seats Available', 'This trip is already full.');
            return;
        }

        setIsJoining(true);
        try {
            await joinRequestService.createJoinRequest({
                trip: documentId as string,
                passenger: user.id,
                requestedSeats: 1, // Defaulting to 1 for now
                message: ''
            });
            refetch();
            Toast.show({
                type: 'success',
                text1: 'Request Sent',
                text2: 'Your request to join has been sent to the captain.'
            });
        } catch (error) {
            console.error('Join request error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to send join request.'
            });
        } finally {
            setIsJoining(false);
        }
    };

    const handleUpdateJoinStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await joinRequestService.updateJoinRequestStatus(requestId, status);

            // Invalidate the trip-details query so React Query refetches fresh data
            // This is more reliable than a timeout – it waits for the query to re-run
            await queryClient.invalidateQueries({ queryKey: ['trip-details', documentId] });

            Toast.show({
                type: 'success',
                text1: `Request ${status.toLowerCase()}`,
                text2: `You have ${status.toLowerCase()} the join request.`
            });
        } catch (error) {
            console.error('Update status error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update request status.'
            });
        }
    };

    const handleCancelTrip = async () => {
        if (!agreeToCancel || !documentId) return;

        setIsCancelling(true);
        try {
            await tripService.updateTripStatus(documentId as string, 'CANCELLED');
            Toast.show({
                type: 'success',
                text1: 'Trip Cancelled',
                text2: 'The trip has been successfully cancelled.'
            });
            setShowCancelModal(false);
            router.push('/(tabs)/activity');
        } catch (error) {
            console.error('Cancel trip error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to cancel trip. Please try again.'
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const handleUpdateTripStatus = async (status: TripStatus) => {
        if (!documentId) return;
        try {
            await tripService.updateTripStatus(documentId as string, status);
            refetch();
            Toast.show({
                type: 'success',
                text1: 'Status Updated',
                text2: `Trip is now ${status.toLowerCase()}.`
            });
        } catch (error) {
            console.error('Update trip status error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update trip status.'
            });
        }
    };

    const handleSubmitRating = async () => {
        if (!user || !documentId || !trip || selectedStars === 0) return;

        setIsSubmittingRating(true);
        try {
            await ratingService.createRating({
                stars: selectedStars,
                comment: ratingComment,
                trip: documentId as string,
                rater: user.id,
                ratee: trip.creator!.id
            });
            setShowRatingModal(false);
            refetchRating();
            Toast.show({
                type: 'success',
                text1: 'Rating Submitted',
                text2: 'Thank you for your feedback!'
            });
        } catch (error) {
            console.error('Rating submission error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to submit rating.'
            });
        } finally {
            setIsSubmittingRating(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: loading ? 'Loading details...' : 'Trip Details',
                    headerShown: true,
                    headerTransparent: false,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                    headerBackTitle: 'Back',
                }}
            />

            {loading ? (
                <View style={[styles.center, { backgroundColor }]}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            ) : !trip ? (
                <View style={[styles.center, { backgroundColor }]}>
                    <Text style={{ color: subtextColor }}>Trip not found.</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={primaryColor}
                            colors={[primaryColor]}
                        />
                    }
                >
                    {(() => {
                        const isCreator = user?.id === trip.creator?.id;
                        return (
                            <>
                                {/* Route Header */}
                                <View style={[styles.card, { backgroundColor: cardColor }]}>
                                    <View style={styles.requestHeader}>
                                        <View style={styles.routeRow}>
                                            <View style={styles.iconColumn}>
                                                <View style={[styles.dot, { backgroundColor: primaryColor }]} />
                                                <View style={[styles.line, { backgroundColor: borderColor }]} />
                                                <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.addressRow}>
                                                    <Text style={[styles.address, { color: textColor }]}>{trip.startingPoint}</Text>
                                                    <View style={[styles.statusBadge, { backgroundColor: getTripStatusColor(trip.status, successColor, dangerColor, primaryColor, subtextColor) }]}>
                                                        <Text style={styles.statusText}>{trip.status}</Text>
                                                    </View>
                                                </View>
                                                <Text style={[styles.address, { color: textColor, marginTop: 24 }]}>{trip.destination}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Trip Info */}
                                <View style={[styles.card, { backgroundColor: cardColor }]}>
                                    <View style={styles.infoRow}>
                                        <InfoItem icon="house.fill" label="Date" value={trip.date} textColor={textColor} subtextColor={subtextColor} />
                                        <InfoItem icon="clock.fill" label="Time" value={trip.time} textColor={textColor} subtextColor={subtextColor} />
                                    </View>
                                    <View style={[styles.divider, { backgroundColor: borderColor }]} />
                                    <View style={styles.infoRow}>
                                        <InfoItem icon="person.2.fill" label="Available Seats" value={`${trip.availableSeats}`} textColor={textColor} subtextColor={subtextColor} />
                                        <InfoItem icon="indianrupeesign.circle.fill" label="Price per seat" value={trip.isPriceCalculated ? "Calculated on completion" : `₹${trip.pricePerSeat}`} textColor={textColor} subtextColor={subtextColor} />
                                    </View>
                                    <View style={[styles.divider, { backgroundColor: borderColor }]} />
                                    <View style={styles.infoRow}>
                                        <InfoItem icon="person.fill" label="Gender Preference" value={trip.genderPreference === 'men' ? 'Only Men' : trip.genderPreference === 'women' ? 'Only Women' : 'Any'} textColor={textColor} subtextColor={subtextColor} />
                                    </View>
                                </View>

                                {/* Captain Info */}
                                <View style={[styles.card, { backgroundColor: cardColor }]}>
                                    <Text style={[styles.sectionTitle, { color: textColor }]}>Captain</Text>
                                    <View style={styles.creatorRow}>
                                        <View style={[styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
                                            <Text style={styles.avatarText}>
                                                {(creatorProfile?.fullName || trip.creator?.username)?.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.creatorDetails}>
                                            <Text style={[styles.creatorName, { color: textColor }]}>
                                                {creatorProfile?.fullName || trip.creator?.username}
                                            </Text>
                                            <Text style={[styles.creatorSub, { color: subtextColor }]}>4.8 ★ Driver</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Actions */}
                                {isCreator ? (
                                    <View style={styles.creatorActions}>
                                        <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 12 }]}>
                                            Join Requests {joinRequests.length > 0 ? `(${joinRequests.length})` : ''}
                                        </Text>

                                        {joinRequests.length === 0 ? (
                                            <View style={[styles.requestCard, { backgroundColor: cardColor, borderColor, borderStyle: 'dashed' }]}>
                                                <Text style={[styles.requestSub, { color: subtextColor, textAlign: 'center' }]}>No requests yet.</Text>
                                            </View>
                                        ) : (
                                            joinRequests.map((request) => (
                                                <View key={request.id} style={[styles.requestCard, { backgroundColor: cardColor, borderColor }]}>
                                                    <View style={styles.requestHeader}>
                                                        <View style={[styles.tinyAvatar, { backgroundColor: primaryColor }]}>
                                                            <Text style={styles.tinyAvatarText}>
                                                                {request.passenger.username?.charAt(0).toUpperCase()}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.requestInfo}>
                                                            <Text style={[styles.requestName, { color: textColor }]}>{request.passenger.username}</Text>
                                                            <Text style={[styles.requestSub, { color: subtextColor }]}>
                                                                {request.requestedSeats} {request.requestedSeats === 1 ? 'seat' : 'seats'} requested
                                                            </Text>
                                                        </View>
                                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status, successColor, dangerColor, subtextColor) }]}>
                                                            <Text style={styles.statusText}>{request.status}</Text>
                                                        </View>
                                                    </View>

                                                    {request.status === 'PENDING' && (
                                                        <View style={styles.requestActions}>
                                                            <TouchableOpacity
                                                                style={[styles.actionButton, styles.rejectButton, { borderColor: dangerColor }]}
                                                                onPress={() => handleUpdateJoinStatus(request.documentId, 'REJECTED')}
                                                            >
                                                                <Text style={{ color: dangerColor, fontWeight: '600' }}>Decline</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={[styles.actionButton, styles.approveButton, { backgroundColor: '#10B981' }]}
                                                                onPress={() => handleUpdateJoinStatus(request.documentId, 'APPROVED')}
                                                            >
                                                                <Text style={{ color: '#fff', fontWeight: '600' }}>Approve</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                            ))
                                        )}

                                        {trip.status === 'PUBLISHED' && (
                                            <TouchableOpacity
                                                style={[styles.startTripButton, { backgroundColor: primaryColor }]}
                                                onPress={() => handleUpdateTripStatus('STARTED')}
                                            >
                                                <Text style={styles.lifecycleButtonText}>Start Trip</Text>
                                            </TouchableOpacity>
                                        )}

                                        {trip.status === 'STARTED' && (
                                            <TouchableOpacity
                                                style={[styles.completeTripButton, { backgroundColor: successColor }]}
                                                onPress={() => handleUpdateTripStatus('COMPLETED')}
                                            >
                                                <Text style={styles.lifecycleButtonText}>Complete Trip</Text>
                                            </TouchableOpacity>
                                        )}

                                        {(trip.status === 'PUBLISHED' || trip.status === 'STARTED') && (
                                            <TouchableOpacity
                                                style={[styles.cancelButton, { borderColor: dangerColor }]}
                                                onPress={() => setShowCancelModal(true)}
                                            >
                                                <Text style={[styles.cancelButtonText, { color: dangerColor }]}>Cancel Trip</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ) : (
                                    <View>
                                        {trip.status !== 'PUBLISHED' && !userJoinRequest && (
                                            <View style={[styles.statusBanner, { backgroundColor: `${subtextColor}15` }]}>
                                                <IconSymbol name="info.circle.fill" size={24} color={subtextColor} />
                                                <View style={styles.statusContent}>
                                                    <Text style={[styles.statusTitle, { color: textColor }]}>Riding Booking Closed</Text>
                                                    <Text style={[styles.statusDesc, { color: subtextColor }]}>
                                                        This trip is currently {trip.status.toLowerCase()} and is no longer accepting requests.
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                        {userJoinRequest ? (
                                            <View style={[styles.statusBanner, {
                                                backgroundColor: userJoinRequest.status === 'APPROVED' ? `${successColor}15` :
                                                    userJoinRequest.status === 'REJECTED' ? `${dangerColor}15` : `${primaryColor}15`
                                            }]}>
                                                <IconSymbol
                                                    name={userJoinRequest.status === 'APPROVED' ? 'checkmark.circle.fill' :
                                                        userJoinRequest.status === 'REJECTED' ? 'xmark.circle.fill' : 'clock.fill'}
                                                    size={24}
                                                    color={userJoinRequest.status === 'APPROVED' ? successColor :
                                                        userJoinRequest.status === 'REJECTED' ? dangerColor : primaryColor}
                                                />
                                                <View style={styles.statusContent}>
                                                    <Text style={[styles.statusTitle, {
                                                        color: userJoinRequest.status === 'APPROVED' ? successColor :
                                                            userJoinRequest.status === 'REJECTED' ? dangerColor : primaryColor
                                                    }]}>
                                                        Request {userJoinRequest.status.charAt(0) + userJoinRequest.status.slice(1).toLowerCase()}
                                                    </Text>
                                                    <Text style={[styles.statusDesc, { color: subtextColor }]}>
                                                        {userJoinRequest.status === 'APPROVED' ? 'You are part of this trip! See you there.' :
                                                            userJoinRequest.status === 'REJECTED' ? 'The captain has declined your request.' :
                                                                'Waiting for captain to approve your request.'}
                                                    </Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={[
                                                    styles.joinButton,
                                                    {
                                                        backgroundColor: primaryColor,
                                                        opacity: (trip.availableSeats === 0 || trip.status !== 'PUBLISHED') ? 0.6 : 1
                                                    }
                                                ]}
                                                onPress={handleJoinRequest}
                                                disabled={isJoining || trip.availableSeats === 0 || trip.status !== 'PUBLISHED'}
                                            >
                                                {isJoining ? (
                                                    <ActivityIndicator color="#fff" />
                                                ) : (
                                                    <Text style={styles.joinButtonText}>
                                                        {trip.status !== 'PUBLISHED' ? 'Ride Unavailable' :
                                                            trip.availableSeats === 0 ? 'Fully Booked' : 'Request to Join'}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </>
                        );
                    })()}
                </ScrollView>
            )}

            {/* Cancellation Modal */}
            <Modal
                visible={showCancelModal}
                transparent={true}
                statusBarTranslucent={true}
                animationType="fade"
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.warningIcon, { backgroundColor: `${dangerColor}18` }]}>
                                <IconSymbol name="exclamationmark.triangle" size={24} color={dangerColor} />
                            </View>
                            <Text style={[styles.modalTitle, { color: textColor }]}>Cancel Trip?</Text>
                        </View>

                        <Text style={[styles.modalDescription, { color: subtextColor }]}>
                            Are you sure you want to cancel this trip? This action cannot be undone and will notify all joined members.
                        </Text>

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setAgreeToCancel(!agreeToCancel)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.checkbox,
                                { borderColor: agreeToCancel ? primaryColor : borderColor, backgroundColor: agreeToCancel ? primaryColor : 'transparent' }
                            ]}>
                                {agreeToCancel && <IconSymbol name="checkmark" size={12} color="#fff" />}
                            </View>
                            <Text style={[styles.checkboxLabel, { color: textColor }]}>
                                I understand that this trip will be permanently removed.
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.secondaryButton, { borderColor }]}
                                onPress={() => setShowCancelModal(false)}
                                disabled={isCancelling}
                            >
                                <Text style={[styles.secondaryButtonText, { color: textColor }]}>Keep Trip</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.confirmCancelButton,
                                    { backgroundColor: agreeToCancel ? dangerColor : `${dangerColor}40` }
                                ]}
                                onPress={handleCancelTrip}
                                disabled={!agreeToCancel || isCancelling}
                            >
                                {isCancelling ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.confirmCancelButtonText}>Confirm Cancel</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Rating Modal */}
            <Modal
                visible={showRatingModal}
                transparent={true}
                statusBarTranslucent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardColor, paddingBottom: 32 }]}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.starCircle, { backgroundColor: `${primaryColor}18` }]}>
                                <IconSymbol name="star.fill" size={32} color={primaryColor} />
                            </View>
                            <Text style={[styles.modalTitle, { color: textColor }]}>Rate your Captain</Text>
                            <Text style={[styles.modalSubtitle, { color: subtextColor }]}>
                                How was your ride with {creatorProfile?.fullName || trip?.creator?.username}?
                            </Text>
                        </View>

                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setSelectedStars(star)}
                                    activeOpacity={0.7}
                                    style={styles.starButton}
                                >
                                    <IconSymbol
                                        name={star <= selectedStars ? "star.fill" : "star"}
                                        size={40}
                                        color={star <= selectedStars ? "#F59E0B" : borderColor}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={[styles.commentBox, { borderColor, backgroundColor: `${subtextColor}05` }]}>
                            <TextInput
                                style={[styles.commentInput, { color: textColor }]}
                                placeholder="Add a comment (optional)..."
                                placeholderTextColor={subtextColor}
                                multiline
                                numberOfLines={3}
                                value={ratingComment}
                                onChangeText={setRatingComment}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.secondaryButton, { borderColor }]}
                                onPress={() => setShowRatingModal(false)}
                                disabled={isSubmittingRating}
                            >
                                <Text style={[styles.secondaryButtonText, { color: textColor }]}>Maybe Later</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    { backgroundColor: selectedStars > 0 ? primaryColor : `${primaryColor}40` }
                                ]}
                                onPress={handleSubmitRating}
                                disabled={selectedStars === 0 || isSubmittingRating}
                            >
                                {isSubmittingRating ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={{ color: '#fff', fontWeight: '700' }}>Submit Rating</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const getTripStatusColor = (status: TripStatus, success: string, danger: string, primary: string, sub: string) => {
    switch (status) {
        case 'COMPLETED': return success;
        case 'STARTED': return primary;
        case 'CANCELLED': return danger;
        case 'PUBLISHED': return '#10B981'; // Green for active listing
        default: return sub;
    }
};

const getStatusColor = (status: string, success: string, danger: string, sub: string) => {
    switch (status) {
        case 'APPROVED': return success;
        case 'REJECTED': return danger;
        case 'CANCELLED': return sub;
        default: return '#F59E0B'; // Amber for PENDING
    }
};

const InfoItem = ({ icon, label, value, textColor, subtextColor }: any) => (
    <View style={styles.infoItem}>
        <View style={styles.infoIconLabel}>
            <IconSymbol name={icon} size={16} color={subtextColor} />
            <Text style={[styles.infoLabel, { color: subtextColor }]}>{label}</Text>
        </View>
        <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    routeRow: {
        flexDirection: 'row',
    },
    iconColumn: {
        alignItems: 'center',
        marginRight: 16,
        paddingVertical: 4,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    line: {
        width: 2,
        height: 40,
        marginVertical: 4,
    },
    addressList: {
        flex: 1,
        justifyContent: 'space-between',
    },
    addressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    address: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    infoItem: {
        flex: 1,
    },
    infoIconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    divider: {
        height: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    creatorDetails: {
        flex: 1,
    },
    creatorName: {
        fontSize: 16,
        fontWeight: '600',
    },
    creatorSub: {
        fontSize: 13,
    },
    joinButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 30,
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    creatorActions: {
        marginTop: 8,
    },
    requestCard: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 12,
    },
    requestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tinyAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    tinyAvatarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    requestInfo: {
        flex: 1,
    },
    requestName: {
        fontSize: 15,
        fontWeight: '600',
    },
    requestSub: {
        fontSize: 12,
    },
    requestActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approveButton: {
        backgroundColor: '#10B981',
    },
    rejectButton: {
        borderWidth: 1,
    },
    startTripButton: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    completeTripButton: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    lifecycleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    cancelButton: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    warningIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    modalDescription: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    confirmCancelButton: {
        // backgroundColor set dynamically
    },
    confirmCancelButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 16,
        marginTop: 12,
        marginBottom: 30,
    },
    statusContent: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    statusDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    starCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 8,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginVertical: 24,
    },
    starButton: {
        padding: 4,
    },
    commentBox: {
        width: '100%',
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        marginBottom: 24,
    },
    commentInput: {
        fontSize: 15,
        height: 80,
        textAlignVertical: 'top',
    },
});
