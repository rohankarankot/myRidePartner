import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { joinRequestService } from '@/services/join-request-service';
import { useAuth } from '@/context/auth-context';
import { maskPhoneNumber } from '@/utils/phone';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { CustomAlert } from '@/components/CustomAlert';
import { DetailPageSkeleton } from '@/components/skeleton/page-skeletons';

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

  const [showAlert, setShowAlert] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);

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
    },
  });

  const handleAction = (status: 'APPROVED' | 'REJECTED') => {
    setPendingStatus(status);
    setShowAlert(true);
  };

  const confirmAction = () => {
    if (pendingStatus) {
      updateStatusMutation.mutate({ status: pendingStatus });
    }
    setShowAlert(false);
  };

  if (isLoading) {
    return (
      <DetailPageSkeleton />
    );
  }

  if (!request) {
    return (
      <Box className="flex-1 items-center justify-center px-8" style={{ backgroundColor }}>
        <Text className="text-base text-center font-medium" style={{ color: subtextColor }}>
          Request not found or already processed.
        </Text>
        <Button variant="link" className="mt-4" onPress={() => router.back()}>
          <ButtonText style={{ color: primaryColor }}>Go Back</ButtonText>
        </Button>
      </Box>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Request Details',
          headerTitleStyle: { fontWeight: '800' },
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Passenger Info */}
        <Box className="rounded-[32px] p-6 mb-6 shadow-sm" style={{ backgroundColor: cardColor }}>
          <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-5" style={{ color: subtextColor }}>
            Passenger
          </Text>
          <HStack className="items-center" space="xl">
            <Box
              className="w-20 h-20 rounded-full items-center justify-center shadow-inner"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <Text className="text-3xl font-extrabold" style={{ color: primaryColor }}>
                {request.passenger.username.charAt(0).toUpperCase()}
              </Text>
            </Box>
            <VStack className="flex-1" space="xs">
              <Text className="text-2xl font-extrabold" style={{ color: textColor }}>
                {request.passenger.username}
              </Text>
              <Text className="text-xs font-medium" style={{ color: subtextColor }}>
                {request.passenger.email}
              </Text>
              <HStack className="items-center mt-1" space="xs">
                <IconSymbol name="phone.fill" size={12} color={subtextColor} />
                <Text className="text-xs font-bold" style={{ color: subtextColor }}>
                  {request.sharePhoneNumber
                    ? request.passenger.userProfile?.phoneNumber || 'Phone unavailable'
                    : maskPhoneNumber(request.passenger.userProfile?.phoneNumber)}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </Box>

        {/* Request Details */}
        <Box className="rounded-[32px] p-6 mb-6 shadow-sm" style={{ backgroundColor: cardColor }}>
          <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-5" style={{ color: subtextColor }}>
            Request Details
          </Text>

          <HStack className="justify-between items-center mb-6">
            <VStack space="xs">
              <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
                Status
              </Text>
              <Box className="px-3 py-1 rounded-full bg-amber-50 self-start">
                <Text className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">
                  {request.status}
                </Text>
              </Box>
            </VStack>
            <VStack className="items-end" space="xs">
              <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
                Seats
              </Text>
              <Text className="text-2xl font-extrabold" style={{ color: textColor }}>
                {request.requestedSeats}
              </Text>
            </VStack>
          </HStack>

          {request.message && (
            <VStack space="xs" className="mb-4">
              <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
                Message
              </Text>
              <Box className="p-4 rounded-2xl border" style={{ backgroundColor: `${subtextColor}05`, borderColor }}>
                <Text className="text-sm font-medium italic leading-6" style={{ color: textColor }}>
                  &quot;{request.message}&quot;
                </Text>
              </Box>
            </VStack>
          )}

          <HStack className="items-center mt-2" space="sm">
            <IconSymbol name="eye.fill" size={14} color={subtextColor} />
            <Text className="text-[11px] font-bold" style={{ color: subtextColor }}>
              Phone: {request.sharePhoneNumber ? 'Shared with ride members' : 'Masked for security'}
            </Text>
          </HStack>
        </Box>

        {/* Trip Summary */}
        <Box className="rounded-[32px] p-6 mb-6 shadow-sm" style={{ backgroundColor: cardColor }}>
          <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-5" style={{ color: subtextColor }}>
            Ride Route
          </Text>

          <HStack space="md" className="mb-6">
            <VStack className="items-center pt-1" space="xs">
              <Box className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <Box className="w-0.5 h-10" style={{ backgroundColor: borderColor }} />
              <Box className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: successColor }} />
            </VStack>
            <VStack className="flex-1 justify-between">
              <Text className="text-sm font-bold truncate" style={{ color: textColor }}>
                {request.trip.startingPoint}
              </Text>
              <Text className="text-sm font-bold truncate" style={{ color: textColor }}>
                {request.trip.destination}
              </Text>
            </VStack>
          </HStack>

          <HStack className="items-center" space="sm">
            <IconSymbol name="calendar" size={16} color={subtextColor} />
            <Text className="text-xs font-bold" style={{ color: subtextColor }}>
              {request.trip.date} • {request.trip.time}
            </Text>
          </HStack>
        </Box>

        {/* Actions */}
        <VStack space="md" className="mb-8">
            <Button
                className="h-14 rounded-2xl"
                style={{ backgroundColor: successColor }}
                onPress={() => handleAction('APPROVED')}
                disabled={updateStatusMutation.isPending}
            >
                {updateStatusMutation.isPending && pendingStatus === 'APPROVED' ? (
                <ButtonSpinner color="#fff" />
                ) : (
                <ButtonText className="text-white font-extrabold uppercase tracking-widest">Approve Request</ButtonText>
                )}
            </Button>

            <Button
                className="h-14 rounded-2xl"
                style={{ borderColor: dangerColor, borderWidth: 2 }}
                variant="outline"
                onPress={() => handleAction('REJECTED')}
                disabled={updateStatusMutation.isPending}
            >
                {updateStatusMutation.isPending && pendingStatus === 'REJECTED' ? (
                <ButtonSpinner color={dangerColor} />
                ) : (
                <ButtonText className="font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>Decline Request</ButtonText>
                )}
            </Button>
        </VStack>
      </ScrollView>

      <CustomAlert 
        visible={showAlert} 
        title={`${pendingStatus === 'APPROVED' ? 'Approve' : 'Decline'} Request`}
        message={`Are you sure you want to ${pendingStatus?.toLowerCase()} this request from ${request.passenger.username}?`}
        onClose={() => setShowAlert(false)}
        primaryButton={{
            text: pendingStatus === 'APPROVED' ? 'Approve' : 'Decline',
            onPress: confirmAction
        }}
        secondaryButton={{
            text: 'Cancel',
            onPress: () => setShowAlert(false)
        }}
      />
    </SafeAreaView>
  );
}
