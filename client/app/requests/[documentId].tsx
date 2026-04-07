import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
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
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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
    },
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
          onPress: () => updateStatusMutation.mutate({ status }),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <Box className="flex-1 items-center justify-center" style={{ backgroundColor }}>
        <Spinner size="large" color={primaryColor} />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box className="flex-1 items-center justify-center px-8" style={{ backgroundColor }}>
        <Text className="text-base text-center" style={{ color: subtextColor }}>
          Request not found or already processed.
        </Text>
        <Pressable onPress={() => router.back()} className="mt-5">
          <Text className="text-base font-bold" style={{ color: primaryColor }}>
            Go Back
          </Text>
        </Pressable>
      </Box>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Request Details',
          headerShown: true,
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Box className="rounded-3xl p-5 mb-5" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
          <Text className="text-xs font-bold uppercase mb-4" style={{ color: subtextColor }}>
            Passenger
          </Text>
          <HStack className="items-center">
            <Box
              className="w-[70px] h-[70px] rounded-full items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Text className="text-[28px] font-bold" style={{ color: primaryColor }}>
                {request.passenger.username.charAt(0).toUpperCase()}
              </Text>
            </Box>
            <VStack className="flex-1 ml-5" space="xs">
              <Text className="text-2xl font-bold" style={{ color: textColor }}>
                {request.passenger.username}
              </Text>
              <Text className="text-sm" style={{ color: subtextColor }}>
                {request.passenger.email}
              </Text>
              <Text className="text-sm" style={{ color: subtextColor }}>
                {request.sharePhoneNumber
                  ? request.passenger.userProfile?.phoneNumber || 'Phone unavailable'
                  : maskPhoneNumber(request.passenger.userProfile?.phoneNumber)}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Box className="rounded-3xl p-5 mb-5" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
          <Text className="text-xs font-bold uppercase mb-4" style={{ color: subtextColor }}>
            Request Details
          </Text>

          <HStack className="justify-between mb-4">
            <VStack className="flex-1" space="xs">
              <Text className="text-xs font-semibold" style={{ color: subtextColor }}>
                Status
              </Text>
              <Box className="self-start px-3 py-1 rounded-xl" style={{ backgroundColor: '#FEF3C7' }}>
                <Text className="text-[11px] font-bold" style={{ color: '#D97706' }}>
                  {request.status}
                </Text>
              </Box>
            </VStack>
            <VStack className="flex-1" space="xs">
              <Text className="text-xs font-semibold" style={{ color: subtextColor }}>
                Seats Requested
              </Text>
              <Text className="text-base font-bold" style={{ color: textColor }}>
                {request.requestedSeats}
              </Text>
            </VStack>
          </HStack>

          {request.message ? (
            <Box className="mt-2 p-4 rounded-2xl" style={{ backgroundColor: `${subtextColor}10` }}>
              <Text className="text-xs font-semibold mb-1" style={{ color: subtextColor }}>
                Message
              </Text>
              <Text className="text-sm italic leading-6" style={{ color: textColor }}>
                &quot;{request.message}&quot;
              </Text>
            </Box>
          ) : null}

          <Box className="mt-2 p-4 rounded-2xl" style={{ backgroundColor: `${subtextColor}10` }}>
            <Text className="text-xs font-semibold mb-1" style={{ color: subtextColor }}>
              Phone visibility
            </Text>
            <Text className="text-sm italic leading-6" style={{ color: textColor }}>
              {request.sharePhoneNumber
                ? 'Shared with captain and riders'
                : 'Masked for captain and riders'}
            </Text>
          </Box>
        </Box>

        <Box className="rounded-3xl p-5 mb-5" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
          <Text className="text-xs font-bold uppercase mb-4" style={{ color: subtextColor }}>
            Trip Info
          </Text>

          <HStack className="mb-5">
            <VStack className="items-center w-5 pt-1">
              <Box className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: primaryColor }} />
              <Box className="w-px h-10 my-1" style={{ backgroundColor: borderColor }} />
              <Box className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: '#10B981' }} />
            </VStack>
            <VStack className="flex-1 ml-4">
              <Text className="text-base font-semibold" style={{ color: textColor }}>
                {request.trip.startingPoint}
              </Text>
              <Text className="text-base font-semibold mt-[30px]" style={{ color: textColor }}>
                {request.trip.destination}
              </Text>
            </VStack>
          </HStack>

          <HStack className="items-center" space="sm">
            <IconSymbol name="calendar" size={16} color={subtextColor} />
            <Text className="text-sm" style={{ color: subtextColor }}>
              {request.trip.date} • {request.trip.time}
            </Text>
          </HStack>
        </Box>

        <VStack space="sm" className="mt-2 mb-5">
          <Pressable
            className="h-14 rounded-2xl items-center justify-center"
            style={{ borderColor: dangerColor, borderWidth: 1.5 }}
            onPress={() => handleAction('REJECTED')}
            disabled={updateStatusMutation.isPending}
          >
            <Text className="text-[17px] font-bold" style={{ color: dangerColor }}>
              Reject Request
            </Text>
          </Pressable>

          <Button
            className="h-14 rounded-2xl"
            style={{ backgroundColor: successColor }}
            onPress={() => handleAction('APPROVED')}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <Spinner size="small" color="#fff" />
            ) : (
              <ButtonText style={{ color: '#ffffff' }}>Approve Request</ButtonText>
            )}
          </Button>
        </VStack>
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
  cardShadow: {
    shadowColor: '#2A120B',
    shadowOpacity: 0.05,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
