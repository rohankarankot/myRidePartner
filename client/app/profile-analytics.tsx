import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { userService } from '@/features/auth/api/user-service';
import { useAuth } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppLoader } from '@/components/app-loader';
import { ProfileAnalyticsCard } from '@/components/profile-analytics-card';

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
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <AppLoader />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Stack.Screen options={{ title: 'Your Analytics', headerBackTitle: 'Profile' }} />
        <Text style={[styles.errorTitle, { color: textColor }]}>Analytics unavailable</Text>
        <Text style={[styles.errorCopy, { color: subtextColor }]}>
          We could not load your ride insights right now. Pull to refresh and try again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={primaryColor}
          colors={[primaryColor]}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  errorCopy: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
