import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { joinRequestService } from '@/services/join-request-service';
import { JoinRequest } from '@/types/api';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export default function RequestDetailsScreen() {
    const { documentId } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const successColor = useThemeColor({}, 'success');
    const dangerColor = useThemeColor({}, 'danger');

    const { data: request, isLoading } = useQuery({
        queryKey: ['join-request', documentId],
        queryFn: () => joinRequestService.getJoinRequestByDocumentId(documentId as string),
        enabled: !!user?.id && !!documentId,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ status }: { status: 'APPROVED' | 'REJECTED' }) =>
            joinRequestService.updateJoinRequestStatus(documentId as string, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['pending-approvals-count'] });
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            queryClient.invalidateQueries({ queryKey: ['all-trips-paged'] });

            Toast.show({
                type: 'success',
                text1: variables.status === 'APPROVED' ? 'Request Approved' : 'Request Rejected',
            });
            router.back();
        },
        onError: () => {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update request status.',
            });
        }
    });

    const handleAction = (status: 'APPROVED' | 'REJECTED') => {
        const name = request?.passenger.username || 'this user';
        Alert.alert(
            `${status === 'APPROVED' ? 'Approve' : 'Reject'} Request`,
            `Are you sure you want to ${status.toLowerCase()} ${name}'s request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: status === 'APPROVED' ? 'Approve' : 'Reject',
                    style: status === 'REJECTED' ? 'destructive' : 'default',
                    onPress: () => updateStatusMutation.mutate({ status })
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor }]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        );
    }

    if (!request) {
        return (
            <View style={[styles.center, { backgroundColor }]}>
                <Text style={{ color: subtextColor }}>Request not found or already processed.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: primaryColor, fontWeight: 'bold' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen options={{
                title: 'Request Details',
                headerShown: true,
                headerBackTitle: 'Back',
            }} />

            <ScrollView contentContainerStyle={styles.container}>
                {/* Passenger Info Section */}
                <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
                    <Text style={[styles.sectionTitle, { color: subtextColor }]}>PASSENGER</Text>
                    <View style={styles.passengerHeader}>
                        <View style={[styles.avatarLarge, { backgroundColor: primaryColor + '15' }]}>
                            <Text style={[styles.avatarTextLarge, { color: primaryColor }]}>
                                {request.passenger.username.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.passengerInfo}>
                            <Text style={[styles.userNameLarge, { color: textColor }]}>{request.passenger.username}</Text>
                            <Text style={[styles.userEmail, { color: subtextColor }]}>{request.passenger.email}</Text>
                        </View>
                    </View>
                </View>

                {/* Request Info Section */}
                <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
                    <Text style={[styles.sectionTitle, { color: subtextColor }]}>REQUEST DETAILS</Text>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Text style={[styles.detailLabel, { color: subtextColor }]}>Status</Text>
                            <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                                <Text style={[styles.badgeText, { color: '#D97706' }]}>{request.status}</Text>
                            </View>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={[styles.detailLabel, { color: subtextColor }]}>Seats Requested</Text>
                            <Text style={[styles.detailValue, { color: textColor }]}>{request.requestedSeats}</Text>
                        </View>
                    </View>

                    {request.message ? (
                        <View style={styles.messageContainer}>
                            <Text style={[styles.detailLabel, { color: subtextColor }]}>Message</Text>
                            <Text style={[styles.messageText, { color: textColor }]}>"{request.message}"</Text>
                        </View>
                    ) : null}
                </View>

                {/* Trip Info Section */}
                <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
                    <Text style={[styles.sectionTitle, { color: subtextColor }]}>TRIP INFO</Text>
                    <View style={styles.tripRoute}>
                        <View style={styles.routeIcon}>
                            <View style={[styles.dot, { backgroundColor: primaryColor }]} />
                            <View style={[styles.line, { backgroundColor: borderColor }]} />
                            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                        </View>
                        <View style={styles.routeText}>
                            <Text style={[styles.address, { color: textColor }]}>{request.trip.startingPoint}</Text>
                            <View style={{ height: 30 }} />
                            <Text style={[styles.address, { color: textColor }]}>{request.trip.destination}</Text>
                        </View>
                    </View>
                    <View style={styles.tripMeta}>
                        <IconSymbol name="calendar" size={16} color={subtextColor} />
                        <Text style={[styles.metaText, { color: subtextColor }]}>{request.trip.date} • {request.trip.time}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.rejectButton, { borderColor: dangerColor }]}
                        onPress={() => handleAction('REJECTED')}
                        disabled={updateStatusMutation.isPending}
                    >
                        <Text style={[styles.buttonText, { color: dangerColor }]}>Reject Request</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.approveButton, { backgroundColor: successColor }]}
                        onPress={() => handleAction('APPROVED')}
                        disabled={updateStatusMutation.isPending}
                    >
                        {updateStatusMutation.isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={[styles.buttonText, { color: '#ffffff' }]}>Approve Request</Text>
                        )}
                    </TouchableOpacity>
                </View>
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
        gap: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 16,
    },
    passengerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarLarge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarTextLarge: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    passengerInfo: {
        marginLeft: 20,
        flex: 1,
    },
    userNameLarge: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
        marginTop: 4,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    messageContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 12,
    },
    messageText: {
        fontSize: 15,
        fontStyle: 'italic',
        lineHeight: 22,
    },
    tripRoute: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    routeIcon: {
        alignItems: 'center',
        width: 20,
        paddingVertical: 6,
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
    routeText: {
        marginLeft: 16,
        flex: 1,
    },
    address: {
        fontSize: 16,
        fontWeight: '600',
    },
    tripMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 14,
    },
    actionsContainer: {
        flexDirection: 'column',
        gap: 12,
        marginTop: 10,
        marginBottom: 20,
    },
    button: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approveButton: {
        // bg set dynamically
    },
    rejectButton: {
        borderWidth: 1.5,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: 'bold',
    },
});
