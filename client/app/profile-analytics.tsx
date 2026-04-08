import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { userService } from '@/features/auth/api/user-service';
import { useAuth } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ProfileAnalyticsCard } from '@/components/profile-analytics-card';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnalyticsPageSkeleton } from '@/components/skeleton/page-skeletons';

export default function ProfileAnalyticsScreen() {
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');

  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['user-analytics', user?.id],
    queryFn: () => userService.getMyAnalytics(),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Box className="flex-1" style={{ backgroundColor }}>
        <Stack.Screen options={{ title: 'Your Analytics', headerTitleStyle: { fontWeight: '800' } }} />
        <AnalyticsPageSkeleton />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box className="flex-1 items-center justify-center px-10" style={{ backgroundColor }}>
        <Stack.Screen options={{ title: 'Your Analytics', headerTitleStyle: { fontWeight: '800' } }} />
        <VStack className="items-center" space="md">
            <Box className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center mb-2">
                <IconSymbol name="chart.bar.fill" size={40} color={subtextColor} />
            </Box>
          <Text className="text-xl font-extrabold text-center" style={{ color: textColor }}>
            Analytics unavailable
          </Text>
          <Text className="text-sm font-medium text-center leading-6" style={{ color: subtextColor }}>
            We could not load your ride insights right now. Pull to refresh and try again.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
      }
    >
      <Stack.Screen options={{ title: 'Your Analytics', headerTitleStyle: { fontWeight: '800' }, headerBackTitle: 'Profile' }} />
      
      <VStack className="px-6 py-8" space="xs">
          <Text className="text-3xl font-extrabold" style={{ color: textColor }}>Ride Insights</Text>
          <Text className="text-sm font-medium" style={{ color: subtextColor }}>Detailed tracking of your contributions and savings.</Text>
      </VStack>

      <Box className="px-6">
        <ProfileAnalyticsCard analytics={data} />
      </Box>
    </ScrollView>
  );
}
