import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { userService } from '@/features/auth/api/user-service';
import { useAuth } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ProfileAnalyticsCard } from '@/components/profile-analytics-card';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';

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
      <Box className="flex-1 items-center justify-center" style={{ backgroundColor }}>
        <Spinner size="large" color={primaryColor} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box className="flex-1 items-center justify-center px-6" style={{ backgroundColor }}>
        <Stack.Screen options={{ title: 'Your Analytics', headerBackTitle: 'Profile' }} />
        <Text className="text-xl font-bold text-center" style={{ color: textColor }}>
          Analytics unavailable
        </Text>
        <Text className="text-sm leading-6 text-center mt-2" style={{ color: subtextColor }}>
          We could not load your ride insights right now. Pull to refresh and try again.
        </Text>
      </Box>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
      }
    >
      <Stack.Screen options={{ title: 'Your Analytics', headerBackTitle: 'Profile' }} />
      <ProfileAnalyticsCard analytics={data} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});
