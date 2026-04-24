import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Dimensions,
    Platform,
    Linking,
    BackHandler,
    Share,
    Keyboard,
    RefreshControl,
    ScrollView,
    Modal,
    Switch,
    TextInput,
    LayoutChangeEvent,
    View,
} from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetTextInput, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripService } from '@/services/trip-service';
import { userService } from '@/services/user-service';
import { joinRequestService } from '@/services/join-request-service';
import { analyticsService } from '@/services/analytics-service';
import { Trip, JoinRequest, TripStatus } from '@/types/api';
import { useAuth } from '@/context/auth-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { ratingService } from '@/services/rating-service';
import { socketService } from '@/services/socket-service';
import { useUserStore } from '@/store/user-store';
import { CustomAlert } from '@/components/CustomAlert';
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation';
import { tripChatService } from '@/services/trip-chat-service';
import { maskPhoneNumber } from '@/utils/phone';
import { useBlockedUsers } from '@/features/safety/hooks/use-blocked-users';
import { saveReport } from '@/features/safety/report-service';
import { ReportModal, ReportPayload } from '@/features/safety/components/ReportModal';
import { TripDetailsSkeleton } from '@/features/trips/components/TripDetailsSkeleton';
import { buildTripStartDateTime, canCaptainEditTrip, hasApprovedPassengers } from '@/features/trips/utils/trip-editability';
import { buildTripShareMessage } from '@/features/trips/utils/trip-share';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';
import { Button, ButtonText } from '@/components/ui/button';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Input, InputField } from '@/components/ui/input';

const { width } = Dimensions.get('window');

export default function TripDetailsScreen() {
    const { id: documentId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { profile } = useUserStore();
    const { isBlocked, blockUser, unblockUser, isBlocking, isUnblocking } = useBlockedUsers();

    const isProfileIncomplete = !profile || !profile.fullName || !profile.phoneNumber || !profile.gender || !profile.city;

    useEffect(() => {
        if (documentId) {
            socketService.joinTrip(documentId as string);
            const handleTripUpdate = (data: any) => {
                queryClient.invalidateQueries({ queryKey: ['trip-details', documentId, user?.id] });
                queryClient.invalidateQueries({ queryKey: ['trips'] });
            };
            socketService.on('trip_updated', handleTripUpdate);
            return () => {
                socketService.off('trip_updated', handleTripUpdate);
                socketService.leaveTrip(documentId as string);
            };
        }
    }, [documentId, queryClient, user?.id]);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompletionPriceModal, setShowCompletionPriceModal] = useState(false);
    const [showBlockAlert, setShowBlockAlert] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [agreeToCancel, setAgreeToCancel] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [showProfileAlert, setShowProfileAlert] = useState(false);
    const [showGenderAlert, setShowGenderAlert] = useState(false);
    const [showNoSeatsAlert, setShowNoSeatsAlert] = useState(false);
    const [showStartAlert, setShowStartAlert] = useState(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState(false);
    const [updatingJoinRequestId, setUpdatingJoinRequestId] = useState<string | null>(null);
    const [isUpdatingPickupStatus, setIsUpdatingPickupStatus] = useState(false);
    const [selectedJoinRequest, setSelectedJoinRequest] = useState<JoinRequest | null>(null);
    const [showJoinRequestAlert, setShowJoinRequestAlert] = useState(false);
    const updatingJoinRequestIdRef = useRef<string | null>(null);

    const joinSheetRef = useRef<BottomSheetModal>(null);
    const [sheetIndex, setSheetIndex] = useState(-1);
    const handleSheetChanges = useCallback((index: number) => {
        setSheetIndex(index);
    }, []);

    useEffect(() => {
        const handleBackPress = () => {
            if (sheetIndex >= 0) {
                joinSheetRef.current?.dismiss();
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, [sheetIndex]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
        ),
        []
    );

    const [selectedSeats, setSelectedSeats] = useState(1);
    const [requestMessage, setRequestMessage] = useState('');
    const [sharePhoneNumber, setSharePhoneNumber] = useState(false);

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedStars, setSelectedStars] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [completionPriceInput, setCompletionPriceInput] = useState('');
    const [isCompletingTrip, setIsCompletingTrip] = useState(false);
    const [startRowHeight, setStartRowHeight] = useState(0);
    const [destinationRowHeight, setDestinationRowHeight] = useState(0);

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');
    const successColor = useThemeColor({}, 'success');
    const routeDotSize = 12;
    const routeDotRadius = routeDotSize / 2;
    const routeLineTop = Math.max(startRowHeight / 2, routeDotRadius);
    const routeLineBottom = Math.max(destinationRowHeight / 2, routeDotRadius);

    const handleStartRowLayout = useCallback((event: LayoutChangeEvent) => {
        setStartRowHeight(event.nativeEvent.layout.height);
    }, []);

    const handleDestinationRowLayout = useCallback((event: LayoutChangeEvent) => {
        setDestinationRowHeight(event.nativeEvent.layout.height);
    }, []);

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
        refetchInterval: 5000,
    });

    const { data: chatAccess } = useQuery({
        queryKey: ['trip-chat-access', documentId],
        queryFn: () => tripChatService.getChatAccess(documentId as string),
        enabled: !!documentId && !!user,
    });

    const { data: userRating, refetch: refetchRating, isLoading: isUserRatingLoading } = useQuery({
        queryKey: ['user-rating', documentId, user?.id],
        queryFn: () => ratingService.getRatingForTripByUser(documentId as string, user!.id),
        enabled: !!documentId && !!user && tripDetails?.trip?.status === 'COMPLETED',
    });

    const [isRefreshing, setIsRefreshing] = useState(false);
    const lastTrackedViewedTripRef = useRef<string | null>(null);
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    const approvedJoinRequest = user ? tripDetails?.requests?.find(r => r.passenger.id === user.id && r.status === 'APPROVED') : null;
    const isPassenger = Boolean(approvedJoinRequest);

    useEffect(() => {
        const viewedTrip = tripDetails?.trip;
        if (!viewedTrip?.documentId || lastTrackedViewedTripRef.current === viewedTrip.documentId) {
            return;
        }

        lastTrackedViewedTripRef.current = viewedTrip.documentId;
        void analyticsService.trackEvent('ride_viewed', {
            destination: viewedTrip.destination,
            has_price: viewedTrip.pricePerSeat !== undefined,
            is_creator: user?.id === viewedTrip.creator?.id,
            status: viewedTrip.status.toLowerCase(),
        });
    }, [tripDetails?.trip, user?.id]);

    useEffect(() => {
        if (
            tripDetails?.trip?.status === 'COMPLETED' &&
            isPassenger &&
            !userRating &&
            !loading &&
            !isUserRatingLoading &&
            !isSubmittingRating
        ) {
            setShowRatingModal(true);
        }
    }, [tripDetails?.trip?.status, isPassenger, userRating, loading, isUserRatingLoading, isSubmittingRating]);

    const trip = tripDetails?.trip || null;
    const creatorProfile = tripDetails?.creatorProfile || null;
    const joinRequests = tripDetails?.requests || [];
    const approvedJoinRequests = joinRequests.filter((request) => request.status === 'APPROVED');
    const approvedPassengerCount = joinRequests.filter((request) => request.status === 'APPROVED').length;
    const userJoinRequest = user ? joinRequests.find(r => r.passenger.id === user.id) || null : null;
    const isApprovedPassengerReady = Boolean(approvedJoinRequest?.arrivedAtPickupAt);
    const allApprovedPassengersReady = approvedJoinRequests.every((request) => Boolean(request.arrivedAtPickupAt));
    const pendingPickupConfirmationsCount = approvedJoinRequests.filter((request) => !request.arrivedAtPickupAt).length;
    const isCreatorBlocked = isBlocked(trip?.creator?.id);
    const canOpenChat = Boolean(user && trip && !isCreatorBlocked && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && chatAccess?.canAccess);
    const canRateTrip = Boolean(user && trip && trip.status === 'COMPLETED' && isPassenger && !userRating);
    const tripStartDateTime = trip ? buildTripStartDateTime(trip.date, trip.time) : null;
    const hasTripStartedByTime = tripStartDateTime ? tripStartDateTime.getTime() <= Date.now() : false;
    const canEditTrip = canCaptainEditTrip({
        trip,
        joinRequests,
        currentUserId: user?.id,
    });

    const getEditTripBlockedReason = () => {
        if (!trip || user?.id !== trip.creator?.id) return '';
        if (trip.status !== 'PUBLISHED') return 'Editing is only available while the ride is still published.';
        if (hasApprovedPassengers(joinRequests)) return `Editing is locked once passengers have been approved for this ride.`;
        if (hasTripStartedByTime) return 'Editing is no longer available after the scheduled start time.';
        return '';
    };

    const getAvatarUrl = (profile: any) => {
        if (!profile?.avatar) return null;
        if (typeof profile.avatar === 'string') return profile.avatar;
        return profile.avatar.url;
    };

    const handleInitiateJoin = () => {
        if (!user || !documentId || !trip) return;
        if (isCreatorBlocked) {
            Toast.show({ type: 'error', text1: 'Captain blocked', text2: 'Unblock this captain to request joining the ride.' });
            return;
        }
        if (isProfileIncomplete) {
            setShowProfileAlert(true);
            return;
        }
        if (trip.genderPreference !== 'both' && trip.genderPreference !== profile?.gender) {
            setShowGenderAlert(true);
            return;
        }
        if (trip.availableSeats <= 0) {
            setShowNoSeatsAlert(true);
            return;
        }
        setSelectedSeats(1);
        setRequestMessage('');
        setSharePhoneNumber(false);
        joinSheetRef.current?.present();
    };

    const confirmJoinRequest = async () => {
        if (!user || !documentId || !trip) return;
        joinSheetRef.current?.dismiss();
        Keyboard.dismiss();
        setIsJoining(true);
        try {
            await joinRequestService.createJoinRequest({
                trip: documentId as string,
                passenger: user.id,
                requestedSeats: selectedSeats,
                message: requestMessage.trim(),
                sharePhoneNumber,
            });
            void analyticsService.trackEvent('join_request_created', {
                requested_seats: selectedSeats,
                share_phone_number: sharePhoneNumber,
                trip_destination: trip.destination,
            });
            refetch();
            Toast.show({ type: 'success', text1: 'Request Sent', text2: `Requested ${selectedSeats} seats.` });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to send request.' });
        } finally {
            setIsJoining(false);
        }
    };

    const handleConfirmPickupArrival = async () => {
        if (!approvedJoinRequest || isUpdatingPickupStatus) return;
        setIsUpdatingPickupStatus(true);
        try {
            const updatedRequest = await joinRequestService.updatePickupStatus(approvedJoinRequest.documentId, true);

            queryClient.setQueryData(['trip-details', documentId, user?.id], (oldData: any) => {
                if (!oldData?.requests) return oldData;
                return {
                    ...oldData,
                    requests: oldData.requests.map((request: JoinRequest) =>
                        request.documentId === updatedRequest.documentId ? updatedRequest : request
                    ),
                };
            });

            await refetch();
            Toast.show({ type: 'success', text1: 'Pickup confirmed', text2: 'Captain can now see that you reached the pickup point.' });
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error?.message ||
                'Failed to update pickup status.';
            Toast.show({ type: 'error', text1: 'Error', text2: Array.isArray(message) ? message[0] : message });
        } finally {
            setIsUpdatingPickupStatus(false);
        }
    };

    const closeJoinRequestAlert = () => {
        setShowJoinRequestAlert(false);
        setSelectedJoinRequest(null);
    };

    const openJoinRequestAlert = (request: JoinRequest) => {
        setSelectedJoinRequest(request);
        setShowJoinRequestAlert(true);
    };

    const handleUpdateJoinStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
        if (updatingJoinRequestIdRef.current) return;
        updatingJoinRequestIdRef.current = requestId;
        setUpdatingJoinRequestId(requestId);
        try {
            await joinRequestService.updateJoinRequestStatus(requestId, status);
            void analyticsService.trackEvent('join_request_status_updated', {
                status: status.toLowerCase(),
                trip_destination: trip?.destination,
            });
            await queryClient.invalidateQueries({ queryKey: ['trip-details', documentId] });
            Toast.show({ type: 'success', text1: `Request ${status.toLowerCase()}` });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update request.' });
        } finally {
            updatingJoinRequestIdRef.current = null;
            setUpdatingJoinRequestId(null);
        }
    };

    const confirmJoinRequestAction = (status: 'APPROVED' | 'REJECTED') => {
        if (!selectedJoinRequest) return;
        const requestId = selectedJoinRequest.documentId;
        closeJoinRequestAlert();
        void handleUpdateJoinStatus(requestId, status);
    };

    const handleCancelTrip = async () => {
        if (!agreeToCancel || !documentId) return;
        setIsCancelling(true);
        try {
            await tripService.updateTripStatus(documentId as string, { status: 'CANCELLED' });
            void analyticsService.trackEvent('ride_cancelled', {
                destination: trip?.destination,
                was_creator: true,
            });
            Toast.show({ type: 'success', text1: 'Trip Cancelled' });
            setShowCancelModal(false);
            router.push('/(tabs)/activity');
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to cancel.' });
        } finally {
            setIsCancelling(false);
        }
    };

    const updateTripStatusMutation = useOptimisticMutation({
        mutationFn: ({ status, pricePerSeat }: { status: TripStatus; pricePerSeat?: number }) =>
            tripService.updateTripStatus(documentId as string, { status, pricePerSeat }),
        queryKeys: [['trip-details', documentId, user?.id], ['trips', user?.id]],
        optimisticUpdateFn: ({ status, pricePerSeat }, currentQueryClient) => {
            if (!user) return;
            currentQueryClient.setQueryData(['trip-details', documentId, user.id], (oldData: any) => {
                if (!oldData) return oldData;
                return { ...oldData, trip: { ...oldData.trip, status, ...(pricePerSeat !== undefined ? { pricePerSeat } : {}) } };
            });
        },
        successMessage: { title: 'Status Updated' },
        onSuccess: (_data, variables) => {
            if (variables.status === 'COMPLETED') {
                void analyticsService.trackEvent('ride_completed', {
                    destination: trip?.destination,
                    has_final_price: typeof variables.pricePerSeat === 'number' || Boolean(trip?.pricePerSeat),
                    was_creator: user?.id === trip?.creator?.id,
                });
            }
        },
    });

    const handleUpdateTripStatus = (status: TripStatus) => {
        if (!documentId) return;
        updateTripStatusMutation.mutate({ status });
    };

    const handleCompleteTrip = () => {
        if (!trip) return;
        if (trip.isPriceCalculated && !trip.pricePerSeat) {
            setCompletionPriceInput('');
            setShowCompletionPriceModal(true);
            return;
        }
        handleUpdateTripStatus('COMPLETED');
    };

    const handleConfirmCompletionPrice = async () => {
        if (!documentId) return;
        const parsedPrice = parseFloat(completionPriceInput.trim());
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            Toast.show({ type: 'error', text1: 'Invalid amount' });
            return;
        }
        setIsCompletingTrip(true);
        try {
            await updateTripStatusMutation.mutateAsync({ status: 'COMPLETED', pricePerSeat: parsedPrice });
            setShowCompletionPriceModal(false);
        } finally {
            setIsCompletingTrip(false);
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
            setSelectedStars(0);
            setRatingComment('');
            Toast.show({ type: 'success', text1: 'Rating submitted', text2: 'Thanks for sharing your trip experience.' });
            await refetchRating();
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleOpenChat = () => {
        if (!documentId || !canOpenChat) return;
        router.push(`/trip-chat/${documentId}`);
    };

    const handleEditTrip = () => {
        if (!trip || !canEditTrip) return;
        router.push({ pathname: '/(tabs)/create', params: { editTripId: trip.documentId } });
    };

    const handleShareTrip = async () => {
        if (!trip) return;
        try {
            await Share.share({ message: buildTripShareMessage(trip) });
            void analyticsService.trackEvent('ride_shared', {
                channel: 'system_share',
                destination: trip.destination,
                trip_status: trip.status.toLowerCase(),
            });
        } catch (error) {
            console.error('Share failed', error);
        }
    };

    const handleShareViaWhatsApp = async () => {
        if (!trip) return;

        const message = buildTripShareMessage(trip);
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

        try {
            const canOpen = await Linking.canOpenURL(whatsappUrl);
            if (canOpen) {
                await Linking.openURL(whatsappUrl);
            } else {
                await Share.share({ message });
                Toast.show({
                    type: 'info',
                    text1: 'WhatsApp not available',
                    text2: 'Opened the regular share sheet instead.',
                });
            }
            void analyticsService.trackEvent('ride_shared', {
                channel: canOpen ? 'whatsapp' : 'system_share',
                destination: trip.destination,
                trip_status: trip.status.toLowerCase(),
            });
        } catch (error) {
            console.error('WhatsApp share failed', error);
            Toast.show({
                type: 'error',
                text1: 'Share failed',
                text2: 'Unable to open WhatsApp right now.',
            });
        }
    };

    const handleShareViaText = async () => {
        if (!trip) return;

        const message = buildTripShareMessage(trip);
        const smsSeparator = Platform.OS === 'ios' ? '&' : '?';
        const smsUrl = `sms:${smsSeparator}body=${encodeURIComponent(message)}`;

        try {
            await Linking.openURL(smsUrl);
            void analyticsService.trackEvent('ride_shared', {
                channel: 'sms',
                destination: trip.destination,
                trip_status: trip.status.toLowerCase(),
            });
        } catch (error) {
            console.error('Text share failed', error);
            Toast.show({
                type: 'error',
                text1: 'Share failed',
                text2: 'Unable to open your messaging app right now.',
            });
        }
    };

    if (loading) return <TripDetailsSkeleton />;
    if (!trip) return (
        <Box className="flex-1 items-center justify-center" style={{ backgroundColor }}>
            <Text style={{ color: subtextColor }}>Trip not found.</Text>
        </Box>
    );

    const isCreator = user?.id === trip.creator?.id;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: loading ? 'Trip loading...' : 'Trip Details',
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerRight: () => isCreator ? (
                        <Pressable onPress={handleShareTrip} className="p-2">
                            <IconSymbol name="square.and.arrow.up" size={20} color={primaryColor} />
                        </Pressable>
                    ) : null
                }}
            />

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={primaryColor} />}
            >
                {/* Route Header */}
                <Box className="rounded-3xl p-5 mb-4 shadow-sm" style={{ backgroundColor: cardColor }}>
                    <Box className="relative">
                        <Box
                            className="absolute w-px left-[5.5px]"
                            style={{
                                backgroundColor: borderColor,
                                top: routeLineTop,
                                bottom: routeLineBottom,
                            }}
                        />
                        <VStack space="xl">
                            <View onLayout={handleStartRowLayout}>
                                <HStack className="items-center" space="md">
                                    <Box className="h-3 w-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                                    <HStack className="flex-1 justify-between items-center">
                                        <Text className="flex-1 text-lg font-bold" style={{ color: textColor }}>{trip.startingPoint}</Text>
                                        <Box className="px-2 py-1 rounded-lg" style={{ backgroundColor: getTripStatusColor(trip.status, successColor, dangerColor, primaryColor, subtextColor) }}>
                                            <Text className="text-[10px] font-bold text-white uppercase">{trip.status}</Text>
                                        </Box>
                                    </HStack>
                                </HStack>
                            </View>
                            <View onLayout={handleDestinationRowLayout}>
                                <HStack className="items-center" space="md">
                                    <Box className="h-3 w-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
                                    <Text className="flex-1 text-lg font-bold" style={{ color: textColor }}>{trip.destination}</Text>
                                </HStack>
                            </View>
                        </VStack>
                    </Box>
                </Box>

                <Box className="rounded-3xl p-5 mb-4 shadow-sm" style={{ backgroundColor: cardColor }}>
                    <VStack space="sm">
                        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                            Share Ride
                        </Text>
                        <HStack space="sm">
                            <Pressable
                                className="flex-1 h-12 rounded-2xl items-center justify-center border"
                                style={{ borderColor }}
                                onPress={handleShareViaWhatsApp}
                            >
                                <Text className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                                    WhatsApp
                                </Text>
                            </Pressable>
                            <Pressable
                                className="flex-1 h-12 rounded-2xl items-center justify-center border"
                                style={{ borderColor }}
                                onPress={handleShareViaText}
                            >
                                <Text className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                                    Text
                                </Text>
                            </Pressable>
                        </HStack>
                    </VStack>
                </Box>

                {!isCreator && isPassenger && trip.status === 'PUBLISHED' && (
                    <Box className="rounded-3xl p-5 mb-4 shadow-sm" style={{ backgroundColor: cardColor }}>
                        <VStack space="md">
                            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                                Pickup Status
                            </Text>
                            <VStack space="xs">
                                <Text className="text-lg font-bold" style={{ color: textColor }}>
                                    Came to pickup point
                                </Text>
                                <Text className="text-sm leading-6" style={{ color: subtextColor }}>
                                    Mark yourself ready when you reach the pickup point.
                                </Text>
                            </VStack>
                            <Button
                                className="h-12 rounded-2xl"
                                style={{ backgroundColor: isApprovedPassengerReady ? `${successColor}30` : successColor }}
                                onPress={handleConfirmPickupArrival}
                                disabled={isApprovedPassengerReady || isUpdatingPickupStatus}
                            >
                                {isUpdatingPickupStatus ? (
                                    <Spinner color="#fff" />
                                ) : (
                                    <ButtonText className="text-white font-bold">
                                        {isApprovedPassengerReady ? 'Marked at Pickup Point' : 'Came to Pickup Point'}
                                    </ButtonText>
                                )}
                            </Button>
                        </VStack>
                    </Box>
                )}

                {/* Info Grid */}
                <Box className="rounded-3xl p-5 mb-4 shadow-sm" style={{ backgroundColor: cardColor }}>
                    <HStack className="justify-between">
                        <InfoItem icon="calendar" label="Date" value={trip.date} textColor={textColor} subtextColor={subtextColor} />
                        <InfoItem icon="clock" label="Time" value={trip.time} textColor={textColor} subtextColor={subtextColor} />
                    </HStack>
                    <Divider className="my-4" style={{ backgroundColor: borderColor }} />
                    <HStack className="justify-between">
                        <InfoItem icon="users" label="Seats" value={`${trip.availableSeats}`} textColor={textColor} subtextColor={subtextColor} />
                        <InfoItem
                            icon="credit-card"
                            label="Price per seat"
                            value={trip.pricePerSeat ? `₹${trip.pricePerSeat}` : trip.isPriceCalculated ? 'Later' : 'Free'}
                            textColor={textColor}
                            subtextColor={subtextColor}
                        />
                    </HStack>
                    <Divider className="my-4" style={{ backgroundColor: borderColor }} />
                    <HStack className="justify-between">
                        <InfoItem
                            icon="person.2.fill"
                            label="Gender"
                            value={trip.genderPreference === 'both' ? 'Everyone' : trip.genderPreference === 'men' ? 'Men only' : 'Women only'}
                            textColor={textColor}
                            subtextColor={subtextColor}
                        />
                        <Box className="flex-1" />
                    </HStack>
                </Box>

                {/* Chat Action */}
                {canOpenChat && (
                    <Button onPress={handleOpenChat} className="rounded-2xl h-14 mb-4" style={{ backgroundColor: primaryColor }}>
                        <HStack space="sm" className="items-center">
                            <IconSymbol name="bubble.left.fill" size={20} color="#fff" />
                            <ButtonText className="font-bold text-white">Open Ride Chat</ButtonText>
                        </HStack>
                    </Button>
                )}

                {canRateTrip && !showRatingModal && (
                    <Box className="rounded-3xl p-5 mb-4 border shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
                        <VStack space="md">
                            <VStack space="xs">
                                <Text className="text-lg font-bold" style={{ color: textColor }}>
                                    Rate this trip
                                </Text>
                                <Text className="text-sm leading-6" style={{ color: subtextColor }}>
                                    Your ride is completed. Share a quick rating for the captain to help other riders.
                                </Text>
                            </VStack>
                            <Button className="h-14 rounded-2xl" style={{ backgroundColor: primaryColor }} onPress={() => setShowRatingModal(true)}>
                                <HStack space="sm" className="items-center">
                                    <IconSymbol name="star.fill" size={18} color="#fff" />
                                    <ButtonText className="font-bold text-white">Rate This Trip</ButtonText>
                                </HStack>
                            </Button>
                        </VStack>
                    </Box>
                )}

                {!canRateTrip && trip.status === 'COMPLETED' && isPassenger && userRating && (
                    <Box className="rounded-3xl p-5 mb-4 border shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
                        <HStack className="items-center justify-between" space="md">
                            <VStack className="flex-1" space="xs">
                                <Text className="text-lg font-bold" style={{ color: textColor }}>
                                    Rating submitted
                                </Text>
                                <Text className="text-sm leading-6" style={{ color: subtextColor }}>
                                    You rated this trip with {userRating.stars} star{userRating.stars === 1 ? '' : 's'}.
                                </Text>
                            </VStack>
                            <Box className="rounded-full px-4 py-2" style={{ backgroundColor: `${primaryColor}10` }}>
                                <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                                    Thank you
                                </Text>
                            </Box>
                        </HStack>
                    </Box>
                )}

                {/* Description */}
                {trip.description && (
                    <Box className="rounded-3xl p-5 mb-4 shadow-sm" style={{ backgroundColor: cardColor }}>
                        <Text className="text-lg font-bold mb-2" style={{ color: textColor }}>Note</Text>
                        <Text style={{ color: subtextColor }}>{trip.description}</Text>
                    </Box>
                )}

                {/* Captain Card */}
                <Pressable
                    onPress={() => router.push(`/user/${trip.creator?.id}`)}
                    className="rounded-3xl p-5 mb-4 shadow-sm"
                    style={{ backgroundColor: cardColor }}
                >
                    <Text className="text-lg font-bold mb-4" style={{ color: textColor }}>Captain</Text>
                    <HStack className="items-center" space="md">
                        <Avatar size="lg">
                            <AvatarFallbackText>{creatorProfile?.fullName}</AvatarFallbackText>
                            {getAvatarUrl(creatorProfile) && <AvatarImage source={{ uri: getAvatarUrl(creatorProfile) }} alt="Avatar" />}
                        </Avatar>
                        <VStack>
                            <Text className="font-bold" style={{ color: textColor }}>{creatorProfile?.fullName}</Text>
                            <Text className="text-xs" style={{ color: subtextColor }}>{creatorProfile?.rating || 'New'}</Text>
                        </VStack>
                    </HStack>
                </Pressable>

                {/* Creator Management Actions */}
                {isCreator && (
                    <VStack space="md" className="mb-6">
                        <Text className="text-lg font-bold" style={{ color: textColor }}>Manage Ride</Text>
                        {approvedJoinRequests.length > 0 && trip.status === 'PUBLISHED' && (
                            <Box className="rounded-2xl p-4 border" style={{ backgroundColor: cardColor, borderColor }}>
                                <VStack space="sm">
                                    <Text className="font-bold" style={{ color: textColor }}>
                                        Pickup confirmations
                                    </Text>
                                    <Text className="text-sm" style={{ color: subtextColor }}>
                                        {allApprovedPassengersReady
                                            ? 'All approved riders have reached the pickup point.'
                                            : `Waiting for ${pendingPickupConfirmationsCount} rider${pendingPickupConfirmationsCount === 1 ? '' : 's'} to reach the pickup point.`}
                                    </Text>
                                    {approvedJoinRequests.map((request) => (
                                        <HStack key={request.documentId} className="items-center justify-between">
                                            <Text className="text-sm" style={{ color: textColor }}>
                                                {request.passenger.userProfile?.fullName || request.passenger.username || request.passenger.email}
                                            </Text>
                                            <Box
                                                className="px-2 py-1 rounded-lg"
                                                style={{ backgroundColor: request.arrivedAtPickupAt ? successColor : `${subtextColor}60` }}
                                            >
                                                <Text className="text-[10px] font-bold text-white uppercase">
                                                    {request.arrivedAtPickupAt ? 'Ready' : 'Waiting'}
                                                </Text>
                                            </Box>
                                        </HStack>
                                    ))}
                                </VStack>
                            </Box>
                        )}
                        <HStack space="md">
                            {trip.status === 'PUBLISHED' && (
                                <Button
                                    className="flex-1 h-12 rounded-xl"
                                    style={{ backgroundColor: primaryColor, opacity: canEditTrip ? 1 : 0.5 }}
                                    onPress={handleEditTrip}
                                >
                                    <HStack space="xs" className="items-center">
                                        <IconSymbol name="pencil" size={16} color="#fff" />
                                        <ButtonText className="text-white font-bold">Edit</ButtonText>
                                    </HStack>
                                </Button>
                            )}

                            {trip.status === 'PUBLISHED' && (
                                <Button
                                    className="flex-1 h-12 rounded-xl"
                                    style={{ backgroundColor: successColor, opacity: allApprovedPassengersReady ? 1 : 0.5 }}
                                    onPress={() => setShowStartAlert(true)}
                                    disabled={!allApprovedPassengersReady}
                                >
                                    <HStack space="xs" className="items-center">
                                        <IconSymbol name="play.fill" size={16} color="#fff" />
                                        <ButtonText className="text-white font-bold">Start</ButtonText>
                                    </HStack>
                                </Button>
                            )}

                            {trip.status === 'STARTED' && (
                                <Button
                                    className="flex-1 h-12 rounded-xl"
                                    style={{ backgroundColor: successColor }}
                                    onPress={handleCompleteTrip}
                                >
                                    <HStack space="xs" className="items-center">
                                        <IconSymbol name="checkmark.circle.fill" size={16} color="#fff" />
                                        <ButtonText className="text-white font-bold">Complete</ButtonText>
                                    </HStack>
                                </Button>
                            )}

                            {(trip.status === 'PUBLISHED' || trip.status === 'STARTED') && (
                                <Button
                                    className="flex-1 h-12 rounded-xl"
                                    style={{ backgroundColor: dangerColor }}
                                    onPress={() => setShowCancelModal(true)}
                                >
                                    <HStack space="xs" className="items-center">
                                        <IconSymbol name="xmark.circle.fill" size={16} color="#fff" />
                                        <ButtonText className="text-white font-bold">Cancel</ButtonText>
                                    </HStack>
                                </Button>
                            )}
                        </HStack>

                        {!canEditTrip && trip.status === 'PUBLISHED' && (
                            <Text className="text-xs italic" style={{ color: subtextColor }}>
                                {getEditTripBlockedReason()}
                            </Text>
                        )}
                        {trip.status === 'PUBLISHED' && approvedJoinRequests.length > 0 && !allApprovedPassengersReady && (
                            <Text className="text-xs italic" style={{ color: subtextColor }}>
                                Start is enabled only after all approved riders mark that they reached the pickup point.
                            </Text>
                        )}
                    </VStack>
                )}

                {/* Join Requests for Creator */}
                {isCreator && (
                    <VStack space="md" className="mb-6">
                        <Text className="text-lg font-bold" style={{ color: textColor }}>Requests ({joinRequests.length})</Text>
                        {joinRequests.map(req => (
                            <Box key={req.id} className="rounded-2xl p-4 border" style={{ backgroundColor: cardColor, borderColor }}>
                                <HStack className="justify-between items-center mb-3">
                                    <HStack space="sm" className="items-center">
                                        <Avatar size="sm">
                                            <AvatarFallbackText>{req.passenger.userProfile?.fullName || req.passenger.username}</AvatarFallbackText>
                                            {getAvatarUrl(req.passenger.userProfile) && (
                                                <AvatarImage
                                                    source={{ uri: getAvatarUrl(req.passenger.userProfile) }}
                                                    alt={req.passenger.userProfile?.fullName || req.passenger.username}
                                                />
                                            )}
                                        </Avatar>
                                        <VStack>
                                            <HStack space="xs" className="items-center">
                                                <Text className="font-bold" style={{ color: textColor }}>
                                                    {req.passenger.userProfile?.fullName || req.passenger.username}
                                                </Text>
                                                {req.status === 'APPROVED' && req.arrivedAtPickupAt && (
                                                    <IconSymbol name="checkmark.circle.fill" size={14} color={successColor} />
                                                )}
                                            </HStack>
                                            <Text className="text-xs" style={{ color: subtextColor }}>{req.requestedSeats} seats</Text>
                                        </VStack>
                                    </HStack>
                                    <Box className="px-2 py-0.5 rounded-md" style={{ backgroundColor: getStatusColor(req.status, successColor, dangerColor, subtextColor) }}>
                                        <Text className="text-[10px] text-white font-bold">{req.status}</Text>
                                    </Box>
                                </HStack>
                                {req.status === 'PENDING' && (
                                    <HStack space="md">
                                        <Button
                                            className="flex-1 bg-red-500 rounded-lg"
                                            disabled={updatingJoinRequestId === req.documentId}
                                            onPress={() => openJoinRequestAlert(req)}
                                        >
                                            <ButtonText className="text-white">
                                                {updatingJoinRequestId === req.documentId ? 'Processing...' : 'Reject'}
                                            </ButtonText>
                                        </Button>
                                        <Button
                                            className="flex-1 bg-green-500 rounded-lg"
                                            disabled={updatingJoinRequestId === req.documentId}
                                            onPress={() => openJoinRequestAlert(req)}
                                        >
                                            {updatingJoinRequestId === req.documentId ? (
                                                <Spinner color="#fff" />
                                            ) : (
                                                <ButtonText className="text-white">Approve</ButtonText>
                                            )}
                                        </Button>
                                    </HStack>
                                )}
                            </Box>
                        ))}
                    </VStack>
                )}

                {/* Bottom Actions */}
                {!isCreator && !userJoinRequest && (
                    <Button onPress={handleInitiateJoin} className="rounded-2xl h-14" style={{ backgroundColor: primaryColor }}>
                        <ButtonText className="font-bold text-white">Join Ride</ButtonText>
                    </Button>
                )}
            </ScrollView>

            {/* Custom Modals & Alerts */}
            <ReportModal visible={showReportModal} onClose={() => setShowReportModal(false)} onSubmit={saveReport} reportedUserId={trip.creator?.id ?? 0} reportedUserName={creatorProfile?.fullName} tripDocumentId={trip.documentId} source="trip" />
            <CustomAlert visible={showProfileAlert} title="Profile Incomplete" message="Please update your profile details first." primaryButton={{ text: "Go to Profile", onPress: () => { setShowProfileAlert(false); router.push({ pathname: '/(tabs)/profile', params: { openEditor: 'true' } }); } }} onClose={() => setShowProfileAlert(false)} />
            <CustomAlert visible={showGenderAlert} title="Gender Mismatch" message="This ride matches a different gender preference." primaryButton={{ text: "OK", onPress: () => setShowGenderAlert(false) }} onClose={() => setShowGenderAlert(false)} />
            <CustomAlert
                visible={showNoSeatsAlert}
                title="No Seats Available"
                message="This trip is already full."
                primaryButton={{ text: "OK", onPress: () => setShowNoSeatsAlert(false) }}
                onClose={() => setShowNoSeatsAlert(false)}
            />

            <CustomAlert
                visible={showStartAlert}
                title="Start Ride?"
                message="Are you sure you want to start this ride now?"
                primaryButton={{
                    text: "Start Ride",
                    onPress: () => {
                        setShowStartAlert(false);
                        handleUpdateTripStatus('STARTED');
                    }
                }}
                secondaryButton={{
                    text: "Cancel",
                    onPress: () => setShowStartAlert(false)
                }}
                onClose={() => setShowStartAlert(false)}
            />

            <CustomAlert
                visible={showCancelModal}
                title="Cancel Ride?"
                message="Are you sure you want to cancel this ride? This action cannot be undone."
                primaryButton={{
                    text: "Yes, Cancel",
                    onPress: () => {
                        setAgreeToCancel(true);
                        // Trigger the actual cancellation in the next frame to avoid state sync issues
                        setTimeout(() => handleCancelTrip(), 100);
                    },
                    style: { backgroundColor: dangerColor }
                }}
                onClose={() => setShowCancelModal(false)}
                secondaryButton={{
                    text: "Go back",
                    onPress: () => setShowCancelModal(false)
                }}
            />

            <CustomAlert
                visible={showJoinRequestAlert}
                title="Review Request"
                message={
                    selectedJoinRequest
                        ? `Check ${selectedJoinRequest.passenger.userProfile?.fullName || selectedJoinRequest.passenger.username || 'this rider'} before updating this join request.`
                        : ''
                }
                primaryButton={{
                    text: "Approve",
                    onPress: () => confirmJoinRequestAction('APPROVED'),
                    style: { backgroundColor: successColor }
                }}
                secondaryButton={{
                    text: "Reject",
                    onPress: () => confirmJoinRequestAction('REJECTED')
                }}
                tertiaryButton={{
                    text: "Cancel",
                    onPress: closeJoinRequestAlert
                }}
                onClose={closeJoinRequestAlert}
                icon="person.crop.circle.badge.checkmark"
            >
                {selectedJoinRequest ? (
                    <VStack space="md">
                        <Box
                            className="rounded-2xl border p-4"
                            style={{ backgroundColor: `${primaryColor}08`, borderColor }}
                        >
                            <Text
                                className="text-[10px] font-extrabold uppercase tracking-widest mb-2"
                                style={{ color: subtextColor }}
                            >
                                Joiner
                            </Text>
                            <Text className="text-base font-bold" style={{ color: textColor }}>
                                {selectedJoinRequest.passenger.userProfile?.fullName ||
                                    selectedJoinRequest.passenger.username ||
                                    selectedJoinRequest.passenger.email}
                            </Text>
                            <Text className="text-xs mt-1" style={{ color: subtextColor }}>
                                {selectedJoinRequest.requestedSeats} seat
                                {selectedJoinRequest.requestedSeats > 1 ? 's' : ''} requested
                            </Text>
                        </Box>

                        <Box
                            className="rounded-2xl border p-4"
                            style={{ backgroundColor: cardColor, borderColor }}
                        >
                            <Text
                                className="text-[10px] font-extrabold uppercase tracking-widest mb-2"
                                style={{ color: subtextColor }}
                            >
                                Description
                            </Text>
                            <Text className="text-sm leading-6" style={{ color: textColor }}>
                                {selectedJoinRequest.message?.trim() || 'No description added.'}
                            </Text>
                        </Box>
                    </VStack>
                ) : null}
            </CustomAlert>

            {/* Price Completion Modal */}
            <Modal
                visible={showRatingModal}
                transparent
                animationType="fade"
                onRequestClose={() => !isSubmittingRating && setShowRatingModal(false)}
            >
                <Box className="flex-1 bg-black/60 items-center justify-center p-5">
                    <Box className="w-full rounded-[32px] border p-6 shadow-2xl" style={{ backgroundColor: cardColor, borderColor }}>
                        <VStack space="lg">
                            <HStack className="items-start justify-between">
                                <HStack className="flex-1 items-center" space="md">
                                    <Box
                                        className="h-12 w-12 rounded-2xl items-center justify-center"
                                        style={{ backgroundColor: `${primaryColor}12` }}
                                    >
                                        <IconSymbol name="star.fill" size={20} color="#F59E0B" />
                                    </Box>
                                    <VStack className="flex-1" space="xs">
                                        <Text className="text-xl font-extrabold" style={{ color: textColor }}>
                                            Rate your trip
                                        </Text>
                                        <Text className="leading-6" style={{ color: subtextColor }}>
                                            How was your ride with {creatorProfile?.fullName || 'the captain'}?
                                        </Text>
                                    </VStack>
                                </HStack>
                                <Pressable
                                    onPress={() => !isSubmittingRating && setShowRatingModal(false)}
                                    className="h-10 w-10 rounded-full items-center justify-center border"
                                    style={{ backgroundColor: backgroundColor, borderColor }}
                                >
                                    <IconSymbol name="xmark" size={16} color={subtextColor} />
                                </Pressable>
                            </HStack>

                            <Box className="rounded-[24px] border px-4 py-5" style={{ backgroundColor: backgroundColor, borderColor }}>
                                <HStack className="justify-between" space="sm">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const active = star <= selectedStars;
                                        return (
                                            <Pressable
                                                key={star}
                                                onPress={() => setSelectedStars(star)}
                                                className="h-12 w-12 rounded-2xl items-center justify-center border"
                                                style={{
                                                    backgroundColor: active ? `${primaryColor}12` : 'transparent',
                                                    borderColor: active ? `${primaryColor}40` : borderColor,
                                                }}
                                            >
                                                <IconSymbol
                                                    name={active ? 'star.fill' : 'star'}
                                                    size={22}
                                                    color={active ? '#F59E0B' : subtextColor}
                                                />
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            </Box>

                            <Box className="rounded-[24px] border px-4 py-4" style={{ borderColor, backgroundColor }}>
                                <TextInput
                                    placeholder="Share a few words about the trip (optional)"
                                    placeholderTextColor={subtextColor}
                                    value={ratingComment}
                                    onChangeText={setRatingComment}
                                    multiline
                                    textAlignVertical="top"
                                    style={{ color: textColor, minHeight: 90, fontSize: 15 }}
                                />
                            </Box>

                            <HStack space="md" className="mt-1">
                                <Pressable
                                    className="flex-1 h-12 rounded-2xl items-center justify-center border"
                                    style={{ backgroundColor, borderColor }}
                                    onPress={() => setShowRatingModal(false)}
                                    disabled={isSubmittingRating}
                                >
                                    <Text className="text-sm font-bold" style={{ color: textColor }}>
                                        Later
                                    </Text>
                                </Pressable>
                                <Pressable
                                    className="flex-1 h-12 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: selectedStars > 0 ? primaryColor : `${subtextColor}20` }}
                                    onPress={handleSubmitRating}
                                    disabled={selectedStars === 0 || isSubmittingRating}
                                >
                                    {isSubmittingRating ? (
                                        <Spinner color="#fff" />
                                    ) : (
                                        <Text className="text-sm font-extrabold uppercase tracking-wide text-white">
                                            Submit
                                        </Text>
                                    )}
                                </Pressable>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            </Modal>

            <Modal
                visible={showCompletionPriceModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCompletionPriceModal(false)}
            >
                <Box className="flex-1 bg-black/50 items-center justify-center p-6">
                    <Box className="w-full rounded-3xl p-6" style={{ backgroundColor: cardColor }}>
                        <Text className="text-xl font-bold mb-2" style={{ color: textColor }}>Final Price</Text>
                        <Text className="mb-6" style={{ color: subtextColor }}>Enter the final price per seat for this ride.</Text>

                        <Input className="h-14 rounded-2xl mb-6" style={{ borderColor }}>
                            <InputField
                                placeholder="e.g. 150"
                                value={completionPriceInput}
                                onChangeText={setCompletionPriceInput}
                                keyboardType="numeric"
                                style={{ color: textColor }}
                            />
                        </Input>

                        <HStack space="md">
                            <Button className="flex-1 h-12 rounded-xl border" style={{ borderColor }} variant="outline" onPress={() => setShowCompletionPriceModal(false)}>
                                <ButtonText style={{ color: textColor }}>Back</ButtonText>
                            </Button>
                            <Button className="flex-1 h-12 rounded-xl" style={{ backgroundColor: successColor }} onPress={handleConfirmCompletionPrice} disabled={isCompletingTrip}>
                                {isCompletingTrip ? <Spinner color="#fff" /> : <ButtonText className="text-white font-bold">Complete</ButtonText>}
                            </Button>
                        </HStack>
                    </Box>
                </Box>
            </Modal>

            <BottomSheetModal
                ref={joinSheetRef}
                index={0}
                snapPoints={['90%']}
                backdropComponent={renderBackdrop}
                onChange={handleSheetChanges}
                backgroundStyle={{ backgroundColor: cardColor, borderRadius: 32 }}
                handleIndicatorStyle={{ backgroundColor: borderColor, width: 40 }}
                enablePanDownToClose
                keyboardBehavior="fillParent"
                keyboardBlurBehavior="restore"
            >
                <BottomSheetView style={{ padding: 24 }}>
                    <Text className="text-xl font-bold mb-4" style={{ color: textColor }}>Join Ride</Text>
                    <VStack space="lg">
                        <HStack className="justify-between items-center">
                            <Text style={{ color: textColor }}>Seats</Text>
                            <HStack space="md" className="items-center">
                                <Pressable
                                    onPress={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                                    className="w-10 h-10 rounded-full items-center justify-center"
                                    style={{ backgroundColor }}
                                >
                                    <Text style={{ color: textColor }}>-</Text>
                                </Pressable>
                                <Text className="text-xl font-extrabold" style={{ color: textColor }}>
                                    {selectedSeats}
                                </Text>
                                <Pressable
                                    onPress={() => setSelectedSeats(Math.min(trip.availableSeats, selectedSeats + 1))}
                                    className="w-10 h-10 rounded-full items-center justify-center"
                                    style={{ backgroundColor }}
                                >
                                    <Text style={{ color: textColor }}>+</Text>
                                </Pressable>
                            </HStack>
                        </HStack>

                        <Box className="rounded-2xl border px-4 py-4" style={{ backgroundColor: cardColor, borderColor }}>
                            <VStack space="md">
                                <HStack className="items-center justify-between" space="md">
                                    <VStack className="flex-1" space="xs">
                                        <Text className="text-sm font-bold" style={{ color: textColor }}>
                                            Share mobile number
                                        </Text>
                                        <Text className="text-xs leading-5" style={{ color: subtextColor }}>
                                            Let the captain see your phone number in this join request.
                                        </Text>
                                    </VStack>
                                    <Switch
                                        value={sharePhoneNumber}
                                        onValueChange={setSharePhoneNumber}
                                        trackColor={{ false: borderColor, true: primaryColor }}
                                    />
                                </HStack>

                                <Box
                                    className="rounded-xl px-3 py-3"
                                    style={{ backgroundColor: backgroundColor, borderColor, borderWidth: 1 }}
                                >
                                    <HStack className="items-center" space="sm">
                                        <IconSymbol name="phone.fill" size={14} color={subtextColor} />
                                        <Text className="text-xs font-medium" style={{ color: subtextColor }}>
                                            {sharePhoneNumber
                                                ? profile?.phoneNumber || 'Phone unavailable'
                                                : maskPhoneNumber(profile?.phoneNumber)}
                                        </Text>
                                    </HStack>
                                </Box>
                            </VStack>
                        </Box>

                        <Box className="rounded-2xl border px-4 py-4" style={{ backgroundColor: cardColor, borderColor }}>
                            <VStack space="sm">
                                <Text className="text-sm font-bold" style={{ color: textColor }}>
                                    Message to captain
                                </Text>
                                <Text className="text-xs leading-5" style={{ color: subtextColor }}>
                                    Add a quick note if you want to mention pickup timing or anything important.
                                </Text>
                                <BottomSheetTextInput
                                    placeholder="Optional message"
                                    placeholderTextColor={subtextColor}
                                    value={requestMessage}
                                    onChangeText={setRequestMessage}
                                    multiline
                                    textAlignVertical="top"
                                    style={{
                                        backgroundColor,
                                        borderColor,
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        color: textColor,
                                        minHeight: 84,
                                        fontSize: 15,
                                        paddingHorizontal: 14,
                                        paddingVertical: 12,
                                    }}
                                />
                            </VStack>
                        </Box>

                        <Button className="h-14 rounded-xl" style={{ backgroundColor: primaryColor }} onPress={confirmJoinRequest} disabled={isJoining}>
                            {isJoining ? <Spinner color="#fff" /> : <ButtonText className="text-white font-bold">Request to Join</ButtonText>}
                        </Button>
                    </VStack>
                </BottomSheetView>
            </BottomSheetModal>
        </SafeAreaView>
    );
}

const getTripStatusColor = (status: TripStatus, success: string, danger: string, primary: string, sub: string) => {
    switch (status) {
        case 'COMPLETED': return success;
        case 'STARTED': return primary;
        case 'CANCELLED': return danger;
        case 'PUBLISHED': return '#10B981';
        default: return sub;
    }
};

const getStatusColor = (status: string, success: string, danger: string, sub: string) => {
    switch (status) {
        case 'APPROVED': return success;
        case 'REJECTED': return danger;
        case 'CANCELLED': return sub;
        default: return '#F59E0B';
    }
};

const InfoItem = ({ icon, label, value, textColor, subtextColor }: any) => (
    <VStack className="flex-1" space="xs">
        <HStack className="items-center" space="xs">
            <IconSymbol name={icon as any} size={16} color={subtextColor} />
            <Text className="text-xs font-medium uppercase" style={{ color: subtextColor }}>{label}</Text>
        </HStack>
        <Text className="text-base font-bold" style={{ color: textColor }}>{value}</Text>
    </VStack>
);
