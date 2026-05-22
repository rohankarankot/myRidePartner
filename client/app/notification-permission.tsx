import React from 'react';
import { useRouter } from 'expo-router';

import { NotificationPermissionGate } from '@/components/notification-permission-gate';

export default function NotificationPermissionScreen() {
  const router = useRouter();

  return (
    <NotificationPermissionGate
      title="Notifications Locked"
      description="My Ride Partner needs notification permissions to alert you when a ride is joined, updated, or when you receive chat messages."
      onGranted={() => router.replace('/(tabs)')}
    />
  );
}
