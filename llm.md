# MyRidePartner Application Context

This document provides the core architecture, schemas, and key files for the MyRidePartner application (React Native / Expo frontend + Strapi v5 backend).

## Core Project Structure (Tracked Files)

```text
myRidePartner/
  ├── client/package.json
  ├── client/app.json
  ├── client/app/(tabs)/_layout.tsx
  ├── client/app/(tabs)/index.tsx
  ├── client/app/(tabs)/profile.tsx
  ├── client/app/(tabs)/create.tsx
  ├── client/app/trip/[id].tsx
  ├── client/app/notifications/index.tsx
  ├── client/services/api-client.ts
  ├── client/services/trip-service.ts
  ├── client/services/join-request-service.ts
  ├── client/services/notification-service.ts
  ├── client/types/api.ts
  ├── client/context/auth-context.tsx
  ├── client/store/user-store.ts
  ├── strapi/package.json
  ├── strapi/src/api/trip/content-types/trip/schema.json
  ├── strapi/src/api/trip/content-types/trip/lifecycles.ts
  ├── strapi/src/api/join-request/content-types/join-request/schema.json
  ├── strapi/src/api/join-request/content-types/join-request/lifecycles.ts
  ├── strapi/src/api/user-profile/content-types/user-profile/schema.json
  ├── strapi/src/api/notification/content-types/notification/schema.json
```

## File Contents

### `client/package.json`

```json
{
  "name": "myridepartner",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@gorhom/bottom-sheet": "^5.2.8",
    "@react-native-community/datetimepicker": "8.4.4",
    "@react-native-google-signin/google-signin": "^16.1.1",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "@tanstack/react-query": "^5.90.21",
    "axios": "^1.13.5",
    "date-fns": "^4.1.0",
    "expo": "~54.0.33",
    "expo-blur": "~15.0.8",
    "expo-constants": "~18.0.13",
    "expo-device": "~8.0.10",
    "expo-font": "~14.0.11",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-image-picker": "~17.0.10",
    "expo-linking": "~8.0.11",
    "expo-location": "~19.0.8",
    "expo-notifications": "~0.32.16",
    "expo-router": "~6.0.23",
    "expo-secure-store": "~15.0.8",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-maps": "1.20.1",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-toast-message": "^2.3.3",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.5.1",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "typescript": "~5.9.2"
  },
  "private": true
}

```

### `client/app.json`

```json
{
  "expo": {
    "name": "My Ride Partner",
    "slug": "myridepartner",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myridepartner",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.rohankarankot.myridepartner",
      "googleServicePropertyList": "./GoogleService-Info.plist"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "package": "com.rohankarankot.myridepartner",
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      "expo-secure-store",
      "@react-native-google-signin/google-signin",
      "@react-native-community/datetimepicker",
      "expo-notifications",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow My Ride Partner to use your location to help you find your starting point and destination.",
          "locationWhenInUsePermission": "Allow My Ride Partner to use your location to help you select pickup and drop-off locations."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "1d2748c6-b89b-46e8-bc81-798e8807cb48"
      }
    },
    "owner": "rohankarankot"
  }
}
```

### `client/app/(tabs)/_layout.tsx`

```typescript
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Linking, Platform, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading]);

  React.useEffect(() => {
    if (!isLoading && user) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
        }
      })();
    }
  }, [user, isLoading]);

  const showContent = !isLoading && user;

  if (!showContent) return null;

  if (locationPermission && locationPermission !== 'granted') {
    return (
      <ThemedView style={styles.permissionContainer}>
        <IconSymbol name="location.slash.fill" size={64} color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText type="title" style={styles.permissionTitle}>Location Required</ThemedText>
        <ThemedText style={styles.permissionText}>
          My Ride Partner needs access to your location to find nearby rides and help you set pickup locations.
        </ThemedText>
        <ThemedText style={styles.permissionText}>
          Please enable location services in your device settings to continue using the app.
        </ThemedText>

        <View style={styles.buttonContainer}>
          <ThemedText
            style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => Linking.openSettings()}
          >
            Open Settings
          </ThemedText>
        </View>

        <View style={styles.buttonContainerSecondary}>
          <ThemedText
            style={styles.buttonTextSecondary}
            onPress={async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setLocationPermission(status);
            }}
          >
            Check Again
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Still checking permission
  if (!locationPermission) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Find',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Publish',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'Profile',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,

          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainerSecondary: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonTextSecondary: {
    fontWeight: '600',
    fontSize: 16,
    opacity: 0.6,
  },
});

```

### `client/app/(tabs)/index.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripService } from '@/services/trip-service';
import { Trip } from '@/types/api';
import { useRouter } from 'expo-router';
import { isToday, isTomorrow, format } from 'date-fns';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FilterBottomSheet } from '@/components/FilterBottomSheet';
import { notificationService } from '@/services/notification-service';
import { useQuery } from '@tanstack/react-query';

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const tripDate = new Date(dateStr); // Strapi returns YYYY-MM-DD

  if (isToday(tripDate)) {
    return 'Today';
  } else if (isTomorrow(tripDate)) {
    return 'Tomorrow';
  } else {
    return format(tripDate, 'MMM d');
  }
};

// Reusable component based on the original static design
const TripCard = ({ documentId, from, to, date, time, price, isCalculated, status, onPress }: {
  documentId: string,
  from: string,
  to: string,
  date: string,
  time: string,
  price: string | undefined,
  isCalculated: boolean,
  status: string,
  onPress: (id: string) => void
}) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <TouchableOpacity
      style={[styles.tripCard, { backgroundColor: cardColor }]}
      onPress={() => onPress(documentId)}
    >
      <View style={styles.routeContainer}>
        <View style={styles.dotContainer}>
          <View style={[styles.dot, { backgroundColor: primaryColor }]} />
          <View style={[styles.line, { backgroundColor: borderColor }]} />
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
        </View>
        <View style={styles.addresses}>
          <View style={styles.addressRow}>
            <Text style={[styles.addressText, { color: textColor }]} numberOfLines={1}>{from}</Text>
            {status !== 'PUBLISHED' && (
              <View style={[styles.statusBadge, { backgroundColor: getTripStatusColor(status as any, '#10B981', '#EF4444', '#3B82F6', '#6B7280') }]}>
                <Text style={styles.statusText}>{status}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.addressText, { color: textColor }]} numberOfLines={1}>{to}</Text>
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <IconSymbol name="calendar" size={16} color={subtextColor} />
          <Text style={[styles.footerText, { color: subtextColor }]}>{formatDisplayDate(date)} at {time}</Text>
        </View>
        <Text style={[styles.priceTag, { color: primaryColor, fontSize: isCalculated ? 14 : 18 }]}>
          {isCalculated ? 'Calculated on demand' : `₹${price}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function FindRidesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  // Filter state
  const [gender, setGender] = useState('both');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications-count', user?.id],
    queryFn: () => notificationService.getUnreadCount(user!.id),
    enabled: !!user?.id,
    refetchInterval: 10000, // Poll every 10 seconds while app is open
  });

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['all-trips-paged', gender, date ? format(date, 'yyyy-MM-dd') : 'all'],
    queryFn: ({ pageParam = 1 }) => tripService.getTrips(
      pageParam as number,
      10,
      {
        gender,
        date: date ? format(date, 'yyyy-MM-dd') : undefined
      }
    ),
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
    initialPageParam: 1,
    select: (data) => {
      const todayString = new Date().toISOString().split('T')[0];
      const allFetchedTrips = data.pages.flatMap(page => page.data);

      return allFetchedTrips
        .filter(trip => {
          // Exclude own trips
          const isOwnTrip = user && trip.creator?.id === user.id;
          // Filter for upcoming trips (only if no specific date filter is applied)
          const isUpcoming = date ? true : trip.date >= todayString;

          return !isOwnTrip && isUpcoming;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  });

  const onRefresh = () => {
    refetch();
  };

  const handleOpenFilters = () => {
    bottomSheetModalRef.current?.present();
  };

  const handleApplyFilters = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  const handleOpenNotifications = () => {
    router.push('/notifications');
  };

  const handleResetFilters = () => {
    setGender('both');
    setDate(undefined);
    bottomSheetModalRef.current?.dismiss();
  };

  const trips = data as unknown as Trip[];
  const loading = isLoading && !isRefetching;

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={[styles.title, { color: textColor }]}>Find a Ride</Text>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={handleOpenNotifications}
        >
          <IconSymbol name="bell.fill" size={24} color={textColor} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: primaryColor }]}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={[styles.searchContainer, { backgroundColor: cardColor, borderColor }]}>
        <IconSymbol name="magnifyingglass" size={20} color={subtextColor} />
        <TextInput
          placeholder="Search for a city or area..."
          placeholderTextColor={subtextColor}
          style={[styles.searchInput, { color: textColor }]}
        />
      </View>
      <Text style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}>
        {date ? `Rides for ${format(date, 'MMM d, yyyy')}` : 'Upcoming Rides'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={primaryColor} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="list.bullet" size={48} color={subtextColor} />
        <Text style={[styles.emptyText, { color: subtextColor }]}>No upcoming rides found.</Text>
        {(gender !== 'both' || date !== undefined) && (
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={{ color: primaryColor, fontWeight: '600' }}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['top']}>
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TripCard
              documentId={item.documentId}
              from={item.startingPoint}
              to={item.destination}
              date={item.date}
              time={item.time}
              price={item.pricePerSeat?.toString()}
              isCalculated={item.isPriceCalculated}
              status={item.status}
              onPress={(id) => router.push(`/trip/${id}`)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.container}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          }
        />
      </SafeAreaView>

      {/* Custom FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={handleOpenFilters}
        activeOpacity={0.8}
      >
        <IconSymbol name="slider.horizontal.3" size={24} color="#fff" />
      </TouchableOpacity>

      <FilterBottomSheet
        ref={bottomSheetModalRef}
        gender={gender}
        setGender={setGender}
        date={date}
        setDate={setDate}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </View>
  );
}

const getTripStatusColor = (status: string, success: string, danger: string, primary: string, sub: string) => {
  switch (status) {
    case 'COMPLETED': return success;
    case 'STARTED': return primary;
    case 'CANCELLED': return danger;
    case 'PUBLISHED': return '#10B981';
    default: return sub;
  }
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingTop: 5
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  container: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  tripCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  routeContainer: {
    flexDirection: 'row',
  },
  dotContainer: {
    alignItems: 'center',
    marginRight: 15,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  addresses: {
    flex: 1,
    justifyContent: 'space-between',
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 15,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    marginVertical: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
  },
  priceTag: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 9,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});

```

### `client/app/(tabs)/profile.tsx`

```typescript
import React, { useState, useCallback, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuth } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter, Stack } from 'expo-router';
import { useUserStore } from '@/store/user-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user-service';
import Toast from 'react-native-toast-message';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/theme';

const DUMMY_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

export default function ProfileScreen() {
    const { user: authUser, signOut } = useAuth();
    const { profile: storedProfile, isLoading: isStoreLoading, setProfile } = useUserStore();
    const { data: profileData, isLoading: isQueryLoading, error, refetch } = useUserProfile();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState<'men' | 'women'>('men');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = ['80%'];



    const profile = storedProfile || profileData;
    const isLoading = isStoreLoading || (isQueryLoading && !storedProfile && !error);
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const successColor = useThemeColor({}, 'success');
    const successBgColor = useThemeColor({}, 'successBg');
    const dangerColor = useThemeColor({}, 'danger');
    const dangerBgColor = useThemeColor({}, 'dangerBg');
    const borderColor = useThemeColor({}, 'border');

    const createProfileMutation = useMutation({
        mutationFn: (data: { fullName: string; phoneNumber: string; gender: 'men' | 'women'; userId: number }) =>
            userService.createProfile(data),
        onSuccess: (data) => {
            setProfile(data);
            queryClient.invalidateQueries({ queryKey: ['user-profile', authUser?.id] });
            refetch();
            bottomSheetModalRef.current?.dismiss();
            Toast.show({
                type: 'success',
                text1: 'Profile Created',
                text2: 'Your profile has been successfully set up!'
            });
        },
        onError: (error) => {
            console.error('Create profile error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to create profile. Please try again.'
            });
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: { documentId: string; fullName: string; phoneNumber: string; gender: 'men' | 'women'; avatar?: number }) =>
            userService.updateProfile(data.documentId, {
                fullName: data.fullName,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                avatar: data.avatar,
            }),
        onSuccess: (data) => {
            setProfile(data);
            queryClient.invalidateQueries({ queryKey: ['user-profile', authUser?.id] });
            refetch();
            bottomSheetModalRef.current?.dismiss();
            Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: 'Your profile has been successfully updated!'
            });
        },
        onError: (error) => {
            console.error('Update profile error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update profile. Please try again.'
            });
        }
    });

    const handlePickImage = async () => {
        if (!profile) {
            Toast.show({
                type: 'info',
                text1: 'Complete Profile First',
                text2: 'Please complete your profile before adding an avatar.'
            });
            handlePresentModalPress();
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string) => {
        setIsUploadingAvatar(true);
        try {
            const fileId = await userService.uploadFile(uri);
            updateProfileMutation.mutate({
                documentId: profile!.documentId,
                fullName: profile!.fullName,
                phoneNumber: profile!.phoneNumber,
                gender: profile!.gender!,
                avatar: fileId,
            });
        } catch (error) {
            console.error('Upload avatar error:', error);
            Toast.show({
                type: 'error',
                text1: 'Upload Error',
                text2: 'Failed to upload image. Please try again.'
            });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handlePresentModalPress = useCallback(() => {
        if (profile) {
            setFullName(profile.fullName || '');
            setPhoneNumber(profile.phoneNumber || '');
            setGender(profile.gender || 'men');
        } else {
            setFullName('');
            setPhoneNumber('');
            setGender('men');
        }
        bottomSheetModalRef.current?.present();
    }, [profile]);

    const handleSubmit = () => {
        if (!fullName.trim() || !phoneNumber.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Required Fields',
                text2: 'Please enter both your name and phone number.'
            });
            return;
        }

        if (profile) {
            updateProfileMutation.mutate({
                documentId: profile.documentId,
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                gender,
            });
        } else if (authUser) {
            createProfileMutation.mutate({
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                gender,
                userId: authUser.id,
            });
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ActivityIndicator size="large" color={primaryColor} />
            </View>
        );
    }

    if (error && !profile) {
        return (
            <View style={[styles.errorContainer, { backgroundColor }]}>
                <Text style={[styles.errorText, { color: dangerColor }]}>Failed to load profile</Text>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: primaryColor }]} onPress={() => refetch()}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // fallback info if profile doesn't exist
    const user = profile?.userId || authUser;
    const avatar = profile?.avatar?.formats?.small;
    const name = profile?.fullName || 'No Name Set';
    const phone = profile?.phoneNumber || 'N/A';
    const profileGender = profile?.gender;
    const rating = profile?.rating || 0;
    const completedTripsCount = profile?.completedTripsCount || 0;
    const isVerified = profile?.isVerified || false;

    const handleVerifyNow = () => {
        Alert.alert(
            'Verification Strategy',
            'I am thinking to use either PAN or Aadhar for verification. Will check in next phase...',
            [
                {
                    text: 'OK',
                    style: 'cancel',
                },

            ]
        );
    };

    const isPending = createProfileMutation.isPending || updateProfileMutation.isPending;
    const colorScheme = useColorScheme();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: 'Profile',
                    headerShown: true,
                    headerTransparent: false,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                    headerRight: () =>
                        profile ? (
                            <TouchableOpacity
                                style={{ marginRight: 16 }}
                                onPress={() => router.push('/settings')}
                            >
                                <IconSymbol name="gearshape.fill" size={24} color={primaryColor} />
                            </TouchableOpacity>
                        ) : null,
                }}
            />
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
                {/* Header */}
                <View style={styles.header}>

                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={handlePickImage}
                        disabled={isUploadingAvatar}
                    >
                        <Image
                            source={
                                avatar?.url
                                    ? { uri: avatar.url }
                                    : { uri: DUMMY_AVATAR }
                            }
                            style={styles.avatar}
                        />
                        {isUploadingAvatar ? (
                            <View style={styles.avatarOverlay}>
                                <ActivityIndicator color="#fff" size="small" />
                            </View>
                        ) : (
                            <View style={[styles.avatarEditIcon, { backgroundColor: primaryColor }]}>
                                <IconSymbol name="camera.fill" size={14} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={[styles.name, { color: textColor }]}>{name}</Text>
                    <Text style={[styles.email, { color: subtextColor }]}>{user?.email}</Text>

                    {!profile ? (
                        <TouchableOpacity
                            style={[styles.completePrompt, { backgroundColor: `${primaryColor}15` }]}
                            onPress={handlePresentModalPress}
                        >
                            <Text style={[styles.completePromptText, { color: primaryColor }]}>Complete your profile →</Text>
                        </TouchableOpacity>
                    ) : isVerified ? (
                        <View style={[styles.verifiedBadge, { backgroundColor: successBgColor }]}>
                            <Text style={[styles.verifiedText, { color: successColor }]}>Verified</Text>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.unverifiedBadge, { backgroundColor: dangerBgColor }]}>
                                <Text style={[styles.unverifiedText, { color: dangerColor }]}>Unverified</Text>
                            </View>
                            <TouchableOpacity onPress={handleVerifyNow}>
                                <Text style={[styles.verifyNowText, { color: primaryColor }]}>Verify now?</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Stats Card */}
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>Statistics</Text>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="star.fill" size={14} color="#F59E0B" />
                            <Text style={[styles.label, { color: subtextColor }]}>Rating</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{(rating).toFixed(1)}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="flag.checkered" size={14} color={primaryColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Completed Trips</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{completedTripsCount}</Text>
                    </View>
                </View>

                {/* Account Info Card */}
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>Account Information</Text>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="at" size={14} color={subtextColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Username</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{user?.username}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="phone.fill" size={14} color={subtextColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Phone</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{phone}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="person.fill" size={14} color={subtextColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Gender</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>
                            {profileGender ? (profileGender === 'men' ? 'Male' : 'Female') : 'N/A'}
                        </Text>
                    </View>

                    <View style={[styles.row, { marginBottom: 0 }]}>
                        <View style={styles.labelRow}>
                            <IconSymbol name="envelope.fill" size={14} color={subtextColor} />
                            <Text style={[styles.label, { color: subtextColor }]}>Email</Text>
                        </View>
                        <Text style={[styles.value, { color: textColor }]}>{user?.email}</Text>
                    </View>
                </View>

                {/* Actions Card */}
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={handlePresentModalPress}
                        activeOpacity={0.6}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIcon, { backgroundColor: `${primaryColor}15` }]}>
                                <IconSymbol name="pencil" size={16} color={primaryColor} />
                            </View>
                            <Text style={[styles.actionLabel, { color: textColor }]}>
                                {!profile ? 'Complete Profile' : 'Edit Profile'}
                            </Text>
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={subtextColor} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={() => setShowSignOutModal(true)}
                        activeOpacity={0.6}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIcon, { backgroundColor: `${dangerColor}15` }]}>
                                <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color={dangerColor} />
                            </View>
                            <Text style={[styles.actionLabel, { color: dangerColor }]}>Sign Out</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={16} color={subtextColor} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Sign Out Confirmation Modal */}
            <Modal
                visible={showSignOutModal}
                transparent={true}
                statusBarTranslucent={true}
                animationType="fade"
                onRequestClose={() => setShowSignOutModal(false)}
            >
                <View style={styles.signOutOverlay}>
                    <View style={[styles.signOutModal, { backgroundColor: cardColor }]}>
                        <View style={[styles.signOutIconWrap, { backgroundColor: `${dangerColor}12` }]}>
                            <IconSymbol name="rectangle.portrait.and.arrow.right" size={28} color={dangerColor} />
                        </View>
                        <Text style={[styles.signOutTitle, { color: textColor }]}>Sign Out?</Text>
                        <Text style={[styles.signOutSubtitle, { color: subtextColor }]}>
                            You'll need to log back in to access your account.
                        </Text>
                        <View style={styles.signOutActions}>
                            <TouchableOpacity
                                style={[styles.signOutBtn, { borderColor, borderWidth: 1.5 }]}
                                onPress={() => setShowSignOutModal(false)}
                            >
                                <Text style={[styles.signOutBtnText, { color: textColor }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.signOutBtn, { backgroundColor: dangerColor }]}
                                onPress={() => { setShowSignOutModal(false); signOut(); }}
                            >
                                <Text style={[styles.signOutBtnText, { color: '#fff' }]}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Complete Profile Bottom Sheet */}

            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
                )}
                backgroundStyle={{ backgroundColor: cardColor }}
                handleIndicatorStyle={{ backgroundColor: borderColor }}
                keyboardBehavior="fillParent"
                keyboardBlurBehavior="restore"
            >
                <BottomSheetView style={styles.modalContent}>
                    <View style={styles.modalHeaderRow}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>
                            {profile ? 'Edit Profile' : 'Complete Profile'}
                        </Text>
                        <TouchableOpacity onPress={() => bottomSheetModalRef.current?.dismiss()}>
                            <IconSymbol name="xmark" size={20} color={subtextColor} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.modalLabel, { color: subtextColor }]}>FULL NAME</Text>
                    <BottomSheetTextInput
                        style={[styles.input, { color: textColor, borderColor }]}
                        placeholder="John Doe"
                        placeholderTextColor={subtextColor}
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    <Text style={[styles.modalLabel, { color: subtextColor, marginTop: 16 }]}>PHONE NUMBER</Text>
                    <BottomSheetTextInput
                        style={[styles.input, { color: textColor, borderColor }]}
                        placeholder="+91 9876543210"
                        placeholderTextColor={subtextColor}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />

                    <Text style={[styles.modalLabel, { color: subtextColor, marginTop: 16 }]}>GENDER</Text>
                    <View style={styles.genderRow}>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                { borderColor: borderColor },
                                gender === 'men' && { backgroundColor: primaryColor, borderColor: primaryColor }
                            ]}
                            onPress={() => setGender('men')}
                        >
                            <Text style={[styles.genderButtonText, gender === 'men' ? { color: '#fff' } : { color: textColor }]}>Male</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                { borderColor: borderColor },
                                gender === 'women' && { backgroundColor: primaryColor, borderColor: primaryColor }
                            ]}
                            onPress={() => setGender('women')}
                        >
                            <Text style={[styles.genderButtonText, gender === 'women' ? { color: '#fff' } : { color: textColor }]}>Female</Text>
                        </TouchableOpacity>
                    </View>



                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: primaryColor }]}
                        onPress={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>
                                {profile ? 'Update Profile' : 'Save Profile'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
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
        padding: 20,
    },
    errorText: {
        marginBottom: 16,
        fontSize: 16,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        fontWeight: '600',
        color: '#fff',
    },
    container: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    avatarOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEditIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
    },
    email: {
        fontSize: 14,
        marginTop: 4,
    },
    verifiedBadge: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
    },
    card: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 18,
        // Using light opacity for shadow to work on both modes
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
    },
    primaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '600',
    },
    headerEditBtn: {
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginVertical: 4,
    },
    unverifiedBadge: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    unverifiedText: {
        fontSize: 12,
        fontWeight: '600',
    },
    verifyNowText: {
        paddingTop: 8,
        fontSize: 12,
        fontWeight: '600',
    },

    completePrompt: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    completePromptText: {
        fontSize: 14,
        fontWeight: '600',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        padding: 24,
        paddingBottom: 40,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1,
    },
    input: {
        height: 56,
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    saveButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genderButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    signOutOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    signOutModal: {
        width: '100%',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
    },
    signOutIconWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    signOutTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    signOutSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
    },
    signOutActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    signOutBtn: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signOutBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
```

### `client/app/(tabs)/create.tsx`

```typescript
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { tripService } from '@/services/trip-service';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { LocationSearchModal } from '@/components/LocationSearchModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/user-store';
import { useFocusEffect } from 'expo-router';
import { CustomAlert } from '@/components/CustomAlert';

const FormField = ({ label, placeholder, icon, value, onChangeText, keyboardType = 'default', editable = true, onPress }: {
    label: string,
    placeholder: string,
    icon: any,
    value: string,
    onChangeText?: (text: string) => void,
    keyboardType?: 'default' | 'numeric',
    editable?: boolean,
    onPress?: () => void
}) => {
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const borderColor = useThemeColor({}, 'border');

    return (
        <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            <TouchableOpacity
                activeOpacity={onPress ? 0.7 : 1}
                onPress={onPress}
                style={[styles.inputContainer, { borderColor }]}
            >
                <IconSymbol name={icon} size={18} color={subtextColor} />
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={subtextColor}
                    style={[styles.input, { color: textColor }]}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    editable={editable && !onPress}
                    pointerEvents={onPress ? 'none' : 'auto'}
                />
            </TouchableOpacity>
        </View>
    );
};

export default function CreateScreen() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [seats, setSeats] = useState('');
    const [price, setPrice] = useState('');
    const [isPriceCalculated, setIsPriceCalculated] = useState(true);
    const [genderPreference, setGenderPreference] = useState<'men' | 'women' | 'both'>('both');
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [showProfileAlert, setShowProfileAlert] = useState(false);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(Platform.OS === 'ios');
        setTime(currentTime);
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { profile } = useUserStore();

    const isProfileIncomplete = !profile || !profile.fullName || !profile.phoneNumber || !profile.gender;

    useFocusEffect(
        React.useCallback(() => {
            if (isProfileIncomplete) {
                setShowProfileAlert(true);
            }
        }, [isProfileIncomplete])
    );

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    const publishMutation = useMutation({
        mutationFn: (tripData: any) => tripService.createTrip(tripData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips', user?.id] });
            Toast.show({
                type: 'success',
                text1: 'Ride Published! 🚗',
                text2: 'Your ride has been successfully published.'
            });

            setTimeout(() => {
                router.push('/(tabs)/activity');
            }, 1000);

            resetForm();
        },
        onError: (error) => {
            console.error('Publish error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to publish ride. Please try again.'
            });
        }
    });

    const handlePublish = async () => {
        if (!from || !to || !seats || (!isPriceCalculated && !price)) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all the details to publish your ride.'
            });
            return;
        }

        if (Number(seats) > 4) {
            Toast.show({
                type: 'error',
                text1: 'Too many seats',
                text2: 'You can only publish a ride with up to 4 seats.'
            });
            return;
        }

        if (isProfileIncomplete) {
            Toast.show({
                type: 'error',
                text1: 'Profile Incomplete',
                text2: 'Please update your profile details to publish a ride.'
            });
            router.push('/(tabs)/profile');
            return;
        }

        if (!user) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'You must be logged in to publish a ride.'
            });
            return;
        }

        publishMutation.mutate({
            startingPoint: from,
            destination: to,
            date: formatDate(date),
            time: formatTime(time),
            availableSeats: parseInt(seats),
            pricePerSeat: isPriceCalculated ? undefined : parseFloat(price),
            isPriceCalculated: isPriceCalculated,
            genderPreference: genderPreference,
            creator: user.id
        });
    };

    const resetForm = () => {
        setFrom('');
        setTo('');
        setDate(new Date());
        setTime(new Date());
        setSeats('');
        setPrice('');
        setIsPriceCalculated(false);
        setGenderPreference('both');
    };

    return (
        <>
            <LocationSearchModal
                visible={showFromPicker}
                onClose={() => setShowFromPicker(false)}
                onSelectLocation={(address: string) => setFrom(address)}
                title="Select Starting Point"
            />
            <LocationSearchModal
                visible={showToPicker}
                onClose={() => setShowToPicker(false)}
                onSelectLocation={(address: string) => setTo(address)}
                title="Select Destination"
            />
            <CustomAlert
                visible={showProfileAlert}
                title="Complete Your Profile"
                message="You need to provide your Name, Phone Number, and Gender before you can publish a ride."
                primaryButton={{
                    text: "Go to Profile",
                    onPress: () => {
                        setShowProfileAlert(false);
                        router.push('/(tabs)/profile');
                    }
                }}

                onClose={() => setShowProfileAlert(false)}
                icon="person.crop.circle.badge.exclamationmark"
                dismissible={false}
            />
            <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['top']}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={[styles.title, { color: textColor }]}>Publish Ride</Text>

                    <View style={[styles.card, { backgroundColor: cardColor }]}>
                        <FormField
                            label="Starting Point"
                            placeholder="Search pickup location..."
                            icon="house.fill"
                            value={from}
                            onPress={() => setShowFromPicker(true)}
                        />
                        <FormField
                            label="Destination"
                            placeholder="Search drop location..."
                            icon="location.fill"
                            value={to}
                            onPress={() => setShowToPicker(true)}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <FormField
                                    label="Date"
                                    placeholder="Select Date"
                                    icon="calendar"
                                    value={formatDate(date)}
                                    onPress={() => setShowDatePicker(true)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormField
                                    label="Time"
                                    placeholder="Select Time"
                                    icon="clock.fill"
                                    value={formatTime(time)}
                                    onPress={() => setShowTimePicker(true)}
                                />
                            </View>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onTimeChange}
                            />
                        )}

                        <FormField
                            label="Available Seats"
                            placeholder="Max 4"
                            icon="person.fill"
                            value={seats}
                            onChangeText={setSeats}
                            keyboardType="numeric"
                        />

                        <View style={styles.fieldContainer}>
                            <View style={styles.switchRow}>
                                <Text style={[styles.label, { color: textColor, marginBottom: 0, flex: 1 }]}>
                                    Calculate price on completion
                                </Text>
                                <Switch
                                    value={isPriceCalculated}
                                    onValueChange={setIsPriceCalculated}
                                    trackColor={{ false: borderColor, true: primaryColor }}
                                />
                            </View>
                            {!isPriceCalculated && (
                                <View style={{ marginTop: 10 }}>
                                    <FormField
                                        label="Price per Seat (₹)"
                                        placeholder="e.g. 200"
                                        icon="indianrupeesign.circle.fill"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: textColor }]}>Gender Preference</Text>
                            <View style={styles.genderRow}>
                                {(['men', 'women', 'both'] as const).map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.genderButton,
                                            { borderColor },
                                            genderPreference === option && { backgroundColor: primaryColor, borderColor: primaryColor }
                                        ]}
                                        onPress={() => setGenderPreference(option)}
                                    >
                                        <Text
                                            style={[
                                                styles.genderButtonText,
                                                { color: textColor },
                                                genderPreference === option && { color: '#fff' }
                                            ]}
                                        >
                                            {option === 'men' ? 'Only Men' : option === 'women' ? 'Only Women' : 'Both'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.publishButton, { backgroundColor: primaryColor, opacity: publishMutation.isPending ? 0.7 : 1 }]}
                        onPress={handlePublish}
                        disabled={publishMutation.isPending}
                    >
                        {publishMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.publishButtonText}>Create Trip</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={[styles.disclaimer, { color: subtextColor }]}>
                        By publishing, you agree to share the ride cost fairly with co-passengers.
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </>
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
    card: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
    },
    row: {
        flexDirection: 'row',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 8,
    },
    genderButton: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        paddingVertical: 10,
        justifyContent: 'center',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    genderButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    publishButton: {
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    publishButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    disclaimer: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 12,
        paddingHorizontal: 20,
        lineHeight: 18,
    }
});

```

### `client/app/trip/[id].tsx`

```typescript
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

export default function TripDetailsScreen() {
    const { id: documentId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();



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
        refetchInterval: 10000, // Poll every 10 seconds
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

```

### `client/app/notifications/index.tsx`

```typescript
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { notificationService } from '@/services/notification-service';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/api';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Toast from 'react-native-toast-message';

export default function NotificationsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');

    const [showClearAllModal, setShowClearAllModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

    const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: () => notificationService.getNotifications(user!.id),
        enabled: !!user?.id,
    });

    useEffect(() => {
        if (user?.id) {
            notificationService.markAllAsRead(user.id).then(() => {
                queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user.id] });
            });
        }
    }, [user?.id]);

    // ── Delete single ──────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: (documentId: string) => notificationService.deleteNotification(documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
            Toast.show({ type: 'success', text1: 'Notification deleted' });
        },
        onError: () => Toast.show({ type: 'error', text1: 'Failed to delete notification' }),
    });

    // ── Clear all ──────────────────────────────────────────────────────
    const clearAllMutation = useMutation({
        mutationFn: () => notificationService.deleteAllNotifications(user!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user?.id] });
            Toast.show({ type: 'success', text1: 'All notifications cleared' });
        },
        onError: () => Toast.show({ type: 'error', text1: 'Failed to clear notifications' }),
    });

    const confirmDelete = useCallback((documentId: string) => {
        // Close the swipeable after confirm
        swipeableRefs.current[documentId]?.close();
        setPendingDeleteId(documentId);
    }, []);

    const handleConfirmSingleDelete = () => {
        if (pendingDeleteId) {
            deleteMutation.mutate(pendingDeleteId);
            setPendingDeleteId(null);
        }
    };

    // ── Navigation ─────────────────────────────────────────────────────
    const handleNotificationPress = (notification: Notification) => {
        let data = notification.data || {};
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch { data = {}; }
        }

        const tripId = (data as any).tripId || (notification as any).tripId;
        const relatedId = (data as any).relatedId || (notification as any).relatedId;

        if (tripId) {
            router.push({ pathname: '/trip/[id]', params: { id: tripId } } as any);
            return;
        }
        if (notification.type === 'JOIN_REQUEST' && relatedId) {
            router.push({ pathname: '/requests/[documentId]', params: { documentId: relatedId } } as any);
            return;
        }
        if (notification.type === 'TRIP_COMPLETED' || notification.type === 'TRIP_UPDATE') {
            router.push('/(tabs)/activity');
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'JOIN_REQUEST': return 'person.2.fill';
            case 'TRIP_COMPLETED': return 'checkmark.circle.fill';
            case 'TRIP_UPDATE': return 'car';
            case 'SYSTEM': return 'gearshape.fill';
            default: return 'bell.fill';
        }
    };

    // ── Swipe action (right → left) ────────────────────────────────────
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, _drag: Animated.AnimatedInterpolation<number>, documentId: string) => {
        const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1], extrapolate: 'clamp' });
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => confirmDelete(documentId)}
                activeOpacity={0.8}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <IconSymbol name="xmark.circle.fill" size={28} color="#fff" />
                </Animated.View>
                <Animated.Text style={[styles.deleteActionText, { transform: [{ scale }] }]}>Delete</Animated.Text>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <Swipeable
            ref={ref => { swipeableRefs.current[item.documentId] = ref; }}
            renderRightActions={(prog, drag) => renderRightActions(prog, drag, item.documentId)}
            rightThreshold={60}
            overshootRight={false}
            friction={2}
        >
            <TouchableOpacity
                style={[styles.notificationCard, { backgroundColor: cardColor, borderColor }]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: primaryColor + '15' }]}>
                    <IconSymbol name={getIconForType(item.type)} size={24} color={primaryColor} />
                </View>
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.type, { color: primaryColor }]}>{item.type.replace('_', ' ')}</Text>
                        <Text style={[styles.time, { color: subtextColor }]}>
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </Text>
                    </View>
                    <Text style={[styles.message, { color: textColor }]}>{item.message}</Text>
                </View>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: primaryColor }]} />}
            </TouchableOpacity>
        </Swipeable>
    );

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen options={{
                title: 'Notifications',
                headerShown: true,
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor },
                headerTintColor: textColor,
                headerShadowVisible: false,
                headerRight: () =>
                    notifications.length > 0 ? (
                        <TouchableOpacity
                            style={styles.clearAllBtn}
                            onPress={() => setShowClearAllModal(true)}
                        >
                            <Text style={[styles.clearAllText, { color: dangerColor }]}>Clear All</Text>
                        </TouchableOpacity>
                    ) : null,
            }} />

            {isLoading && !isRefetching ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={primaryColor} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.documentId}
                    renderItem={renderItem}
                    contentContainerStyle={styles.container}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="bell.fill" size={64} color={subtextColor} />
                            <Text style={[styles.emptyTitle, { color: textColor }]}>No notifications yet</Text>
                            <Text style={[styles.emptySubtitle, { color: subtextColor }]}>
                                We'll let you know when something important happens!
                            </Text>
                        </View>
                    }
                />
            )}

            {/* ── Single delete confirmation ── */}
            <Modal
                visible={!!pendingDeleteId}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setPendingDeleteId(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
                        <View style={[styles.modalIconWrap, { backgroundColor: `${dangerColor}12` }]}>
                            <IconSymbol name="xmark.circle.fill" size={28} color={dangerColor} />
                        </View>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Delete Notification?</Text>
                        <Text style={[styles.modalSubtitle, { color: subtextColor }]}>
                            This notification will be permanently removed.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { borderColor, borderWidth: 1.5 }]}
                                onPress={() => { swipeableRefs.current[pendingDeleteId!]?.close(); setPendingDeleteId(null); }}
                            >
                                <Text style={[styles.modalBtnText, { color: textColor }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: dangerColor }]}
                                onPress={handleConfirmSingleDelete}
                            >
                                {deleteMutation.isPending
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Delete</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Clear all confirmation ── */}
            <Modal
                visible={showClearAllModal}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setShowClearAllModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
                        <View style={[styles.modalIconWrap, { backgroundColor: `${dangerColor}12` }]}>
                            <IconSymbol name="xmark.circle.fill" size={28} color={dangerColor} />
                        </View>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Clear All Notifications?</Text>
                        <Text style={[styles.modalSubtitle, { color: subtextColor }]}>
                            All {notifications.length} notification{notifications.length !== 1 ? 's' : ''} will be permanently deleted.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { borderColor, borderWidth: 1.5 }]}
                                onPress={() => setShowClearAllModal(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: textColor }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: dangerColor }]}
                                onPress={() => { setShowClearAllModal(false); clearAllMutation.mutate(); }}
                            >
                                {clearAllMutation.isPending
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Clear All</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    container: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    clearAllBtn: { marginRight: 4, paddingHorizontal: 8, paddingVertical: 4 },
    clearAllText: { fontSize: 14, fontWeight: '600' },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    content: { flex: 1 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    type: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    time: { fontSize: 12 },
    message: { fontSize: 15, lineHeight: 20 },
    unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 12 },
    // Swipe delete
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 16,
        marginBottom: 12,
        gap: 4,
    },
    deleteActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    // Empty
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
    emptySubtitle: { fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalCard: {
        width: '100%',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
    },
    modalIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
    modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
    modalBtn: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnText: { fontSize: 15, fontWeight: '700' },
});

```

### `client/services/api-client.ts`

*(File not found or renamed)*

### `client/services/trip-service.ts`

```typescript
import apiClient from '../api/api-client';
import { Trip, SingleTripResponse, TripResponse } from '../types/api';

class TripService {
    async createTrip(tripData: {
        startingPoint: string;
        destination: string;
        date: string;
        time: string;
        availableSeats: number;
        pricePerSeat?: number;
        isPriceCalculated: boolean;
        genderPreference: string;
        creator: number;
    }): Promise<Trip> {
        const { data } = await apiClient.post<SingleTripResponse>('/api/trips', {
            data: tripData
        });
        return data.data;
    }

    async getTrips(page: number = 1, pageSize: number = 10, filters?: { gender?: string, date?: string }): Promise<TripResponse> {
        let filterQuery = '';
        if (filters?.gender && filters.gender !== 'both') {
            filterQuery += `&filters[genderPreference][$eq]=${filters.gender}`;
        }
        if (filters?.date) {
            filterQuery += `&filters[date][$eq]=${filters.date}`;
        }

        const { data } = await apiClient.get<TripResponse>(
            `/api/trips?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}${filterQuery}`
        );
        return data;
    }

    async getUserTrips(userId: number): Promise<Trip[]> {
        const { data } = await apiClient.get<{ data: Trip[] }>(`/api/trips?filters[creator][id][$eq]=${userId}&populate=*`);
        return data.data;
    }

    async updateTripStatus(documentId: string, status: string): Promise<Trip> {
        const { data } = await apiClient.put<SingleTripResponse>(`/api/trips/${documentId}`, {
            data: { status }
        });
        return data.data;
    }
    async deleteTrip(documentId: string): Promise<Trip> {
        const { data } = await apiClient.delete<SingleTripResponse>(`/api/trips/${documentId}`);
        return data.data;
    }

    async getTripById(documentId: string): Promise<Trip> {
        const { data } = await apiClient.get<SingleTripResponse>(`/api/trips/${documentId}?populate=*`);
        return data.data;
    }
}

export const tripService = new TripService();

```

### `client/services/join-request-service.ts`

```typescript
import apiClient from '../api/api-client';
import { JoinRequest, JoinRequestResponse, SingleJoinRequestResponse, JoinRequestStatus } from '../types/api';

class JoinRequestService {
    async createJoinRequest(data: {
        trip: string; // documentId
        passenger: number; // userId
        requestedSeats: number;
        message?: string;
    }): Promise<JoinRequest> {
        const response = await apiClient.post<SingleJoinRequestResponse>('/api/join-requests', {
            data
        });
        return response.data.data;
    }

    async getJoinRequestsForTrip(tripDocumentId: string): Promise<JoinRequest[]> {
        const response = await apiClient.get<JoinRequestResponse>(
            `/api/join-requests?filters[trip][documentId][$eq]=${tripDocumentId}&populate[passenger][populate]=*`
        );
        return response.data.data;
    }

    async getJoinRequestsForUser(userId: number): Promise<JoinRequest[]> {
        const response = await apiClient.get<JoinRequestResponse>(
            `/api/join-requests?filters[passenger][id][$eq]=${userId}&populate[trip][populate]=*`
        );
        return response.data.data;
    }

    async updateJoinRequestStatus(documentId: string, status: JoinRequestStatus): Promise<JoinRequest> {
        const response = await apiClient.put<SingleJoinRequestResponse>(`/api/join-requests/${documentId}`, {
            data: { status }
        });
        return response.data.data;
    }

    async deleteJoinRequest(documentId: string): Promise<void> {
        await apiClient.delete(`/api/join-requests/${documentId}`);
    }

    async getPendingRequestsForCaptain(userId: number): Promise<JoinRequest[]> {
        const response = await apiClient.get<JoinRequestResponse>(
            `/api/notifications?filters[user][id][$eq]=${userId}&filters[read][$eq]=false`
        );
        // Wait, why did I change this to notifications? That's wrong.
        // Let me restore the correct one.
        const res = await apiClient.get<JoinRequestResponse>(
            `/api/join-requests?filters[trip][creator][id][$eq]=${userId}&filters[status][$eq]=PENDING&populate[trip][populate]=*&populate[passenger][populate]=*`
        );
        return res.data.data;
    }

    async getJoinRequestByDocumentId(documentId: string): Promise<JoinRequest> {
        const response = await apiClient.get<SingleJoinRequestResponse>(
            `/api/join-requests/${documentId}?populate[trip][populate]=*&populate[passenger][populate]=*`
        );
        return response.data.data;
    }
}

export const joinRequestService = new JoinRequestService();

```

### `client/services/notification-service.ts`

```typescript
import apiClient from '../api/api-client';
import { Notification, NotificationResponse, SingleNotificationResponse } from '../types/api';

class NotificationService {
    async getNotifications(userId: number): Promise<Notification[]> {
        const response = await apiClient.get<NotificationResponse>(
            `/api/notifications?filters[user][id][$eq]=${userId}&sort[0]=createdAt:desc&populate=*`
        );
        return response.data.data;
    }

    async getUnreadCount(userId: number): Promise<number> {
        const response = await apiClient.get<NotificationResponse>(
            `/api/notifications?filters[user][id][$eq]=${userId}&filters[read][$eq]=false`
        );
        return response.data.meta.pagination.total;
    }

    async markAsRead(documentId: string): Promise<Notification> {
        const response = await apiClient.put<SingleNotificationResponse>(`/api/notifications/${documentId}`, {
            data: { read: true }
        });
        return response.data.data;
    }

    async markAllAsRead(userId: number): Promise<void> {
        const unread = await this.getNotifications(userId);
        const unreadItems = unread.filter(n => !n.read);

        await Promise.all(
            unreadItems.map(n => this.markAsRead(n.documentId))
        );
    }

    async deleteNotification(documentId: string): Promise<void> {
        await apiClient.delete(`/api/notifications/${documentId}`);
    }

    async deleteAllNotifications(userId: number): Promise<void> {
        const all = await this.getNotifications(userId);
        await Promise.all(all.map(n => this.deleteNotification(n.documentId)));
    }
}

export const notificationService = new NotificationService();

```

### `client/types/api.ts`

```typescript
export interface User {
    id: number;
    documentId: string;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface AuthResponse {
    jwt: string;
    user: User;
}

export interface ApiError {
    message: string;
    status: number;
}

export interface Media {
    id: number;
    url: string;
    formats?: any;
}

export interface UserProfile {
    id: number;
    documentId: string;
    fullName: string;
    phoneNumber: string;
    rating?: number;
    completedTripsCount?: number;
    ratingsCount?: number;
    isVerified?: boolean;
    userId?: User;
    avatar?: Media;
    gender?: 'men' | 'women';
    pushToken?: string;
}

export interface UserProfileResponse {
    data: UserProfile[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export type GenderPreference = 'men' | 'women' | 'both';

export type TripStatus = 'PUBLISHED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
    id: number;
    documentId: string;
    startingPoint: string;
    destination: string;
    date: string;
    time: string;
    availableSeats: number;
    pricePerSeat?: number;
    isPriceCalculated: boolean;
    genderPreference: GenderPreference;
    status: TripStatus;
    creator?: User;
    joinRequests?: JoinRequest[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface TripResponse {
    data: Trip[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface SingleTripResponse {
    data: Trip;
}

export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface JoinRequest {
    id: number;
    documentId: string;
    trip: Trip;
    passenger: User;
    status: JoinRequestStatus;
    requestedSeats: number;
    message?: string;
    createdAt: string;
    updatedAt: string;
}

export interface JoinRequestResponse {
    data: JoinRequest[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface SingleJoinRequestResponse {
    data: JoinRequest;
}

export type NotificationType = 'JOIN_REQUEST' | 'TRIP_UPDATE' | 'SYSTEM' | 'TRIP_COMPLETED';

export interface Notification {
    id: number;
    documentId: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    user: User;
    data?: any;
    relatedId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    data: Notification[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface SingleNotificationResponse {
    data: Notification;
}

export interface Rating {
    id: number;
    documentId: string;
    stars: number;
    comment?: string;
    trip?: Trip;
    rater?: User;
    ratee?: User;
    createdAt: string;
    updatedAt: string;
}

export interface RatingResponse {
    data: Rating[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface SingleRatingResponse {
    data: Rating;
}


```

### `client/context/auth-context.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';
import { userService } from '@/services/user-service';
import { useUserStore } from '@/store/user-store';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const setProfile = useUserStore((state) => state.setProfile);
    const clearStore = useUserStore((state) => state.clearStore);
    const queryClient = useQueryClient();

    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            const storedToken = await SecureStore.getItemAsync('userToken');
            const storedUser = await SecureStore.getItemAsync('userData');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Fetch profile if we have a session
                const userObj = JSON.parse(storedUser);
                fetchAndStoreProfile(userObj.id);
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchAndStoreProfile(userId: number) {
        try {
            const profile = await userService.getUserProfile(userId);
            if (profile) {
                setProfile(profile);
            }
        } catch (e) {
            console.error('Failed to fetch profile', e);
        }
    }

    const signIn = async (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        await SecureStore.setItemAsync('userToken', newToken);
        await SecureStore.setItemAsync('userData', JSON.stringify(newUser));

        // Fetch profile immediately after sign in
        fetchAndStoreProfile(newUser.id);
    };

    const signOut = async () => {
        try {
            await GoogleSignin.signOut();
        } catch (e) {
            console.log('Google SignOut error (expected if not signed in):', e);
        }

        // Clear TanStack Query cache
        queryClient.clear();

        setToken(null);
        setUser(null);
        clearStore();
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

```

### `client/store/user-store.ts`

```typescript
import { create } from 'zustand';
import { UserProfile } from '@/types/api';

interface UserState {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    setProfile: (profile: UserProfile | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearStore: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    profile: null,
    isLoading: false,
    error: null,
    setProfile: (profile) => set({ profile, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearStore: () => set({ profile: null, isLoading: false, error: null }),
}));

```

### `strapi/package.json`

```json
{
  "name": "strapi",
  "version": "0.1.0",
  "private": true,
  "description": "A Strapi application",
  "scripts": {
    "build": "strapi build",
    "console": "strapi console",
    "deploy": "strapi deploy",
    "dev": "strapi develop",
    "develop": "strapi develop",
    "seed:example": "node ./scripts/seed.js",
    "start": "strapi start",
    "strapi": "strapi",
    "upgrade": "npx @strapi/upgrade latest",
    "upgrade:dry": "npx @strapi/upgrade latest --dry"
  },
  "dependencies": {
    "@strapi/plugin-cloud": "5.36.1",
    "@strapi/plugin-users-permissions": "5.36.1",
    "@strapi/provider-upload-cloudinary": "^5.36.1",
    "@strapi/strapi": "5.36.1",
    "expo-server-sdk": "^6.0.0",
    "fs-extra": "^10.0.0",
    "mime-types": "^2.1.27",
    "pg": "8.8.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "styled-components": "^6.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  },
  "engines": {
    "node": ">=20.0.0 <=24.x.x",
    "npm": ">=6.0.0"
  },
  "strapi": {
    "uuid": "745d1740-0074-4042-9a46-309124516a0c",
    "installId": "993d72a0130b3dbfd22ef6f54c2db929afd99d9b36d63abe3b9903188f57b1a0"
  }
}

```

### `strapi/src/api/trip/content-types/trip/schema.json`

```json
{
    "kind": "collectionType",
    "collectionName": "trips",
    "info": {
        "singularName": "trip",
        "pluralName": "trips",
        "displayName": "Trip",
        "description": "Rides published by users"
    },
    "options": {
        "draftAndPublish": true
    },
    "pluginOptions": {},
    "attributes": {
        "startingPoint": {
            "type": "string",
            "required": true
        },
        "destination": {
            "type": "string",
            "required": true
        },
        "date": {
            "type": "date",
            "required": true
        },
        "time": {
            "type": "string",
            "required": true
        },
        "availableSeats": {
            "type": "integer",
            "required": true,
            "min": 1,
            "max": 10
        },
        "pricePerSeat": {
            "type": "decimal"
        },
        "isPriceCalculated": {
            "type": "boolean",
            "default": false
        },
        "genderPreference": {
            "type": "enumeration",
            "enum": [
                "men",
                "women",
                "both"
            ],
            "default": "both",
            "required": true
        },
        "creator": {
            "type": "relation",
            "relation": "manyToOne",
            "target": "plugin::users-permissions.user"
        },
        "status": {
            "type": "enumeration",
            "enum": [
                "PUBLISHED",
                "STARTED",
                "CANCELLED",
                "COMPLETED"
            ],
            "default": "PUBLISHED"
        },
        "joinRequests": {
            "type": "relation",
            "relation": "oneToMany",
            "target": "api::join-request.join-request",
            "mappedBy": "trip"
        },
        "ratings": {
            "type": "relation",
            "relation": "oneToMany",
            "target": "api::rating.rating",
            "mappedBy": "trip"
        }
    }
}
```

### `strapi/src/api/trip/content-types/trip/lifecycles.ts`

```typescript
export default {
    async beforeCreate(event) {
        const { data } = event.params;
        let creatorId = data.creator;

        // Strapi v5 may normalize relations into a { set: [{ id }] } structure
        if (typeof creatorId === 'object' && creatorId?.set?.[0]?.id) {
            console.log('Strapi v5 normalization detected, extracting ID from set:', creatorId.set[0].id);
            creatorId = creatorId.set[0].id;
        }

        if (!creatorId) {
            console.error('Error: Trip creator is missing or invalid format:', data.creator);
            throw new Error('Trip creator is required');
        }

        // Fetch the user profile for the creator
        const userProfiles = await strapi.documents('api::user-profile.user-profile').findMany({
            filters: { userId: { id: creatorId } }
        });

        if (userProfiles.length === 0) {
            console.error('Error: No profile found for creatorId:', creatorId);
            throw new Error('Please complete your profile (Name, Phone, Gender) before creating a trip.');
        }

        const profile = userProfiles[0];
        if (!profile.fullName || !profile.phoneNumber || !profile.gender) {
            console.error('Error: Profile incomplete for creatorId:', creatorId);
            throw new Error('Your profile is incomplete. Please update your Name, Phone, and Gender to create a trip.');
        }
        console.log('Success: Trip creation verified for creatorId:', creatorId);
    },

    async afterUpdate(event) {
        const { result, params } = event;
        const { status, creator, documentId } = result;

        // If trip is marked as COMPLETED, increment captain's completedTripsCount
        // Use params.data.status to check if it WAS changed to COMPLETED in this update
        if (status === 'COMPLETED' && params.data.status === 'COMPLETED') {
            if (!creator || !creator.id) return;

            const userProfiles = await strapi.documents('api::user-profile.user-profile').findMany({
                filters: { userId: { id: creator.id } }
            });

            if (userProfiles.length > 0) {
                const profile = userProfiles[0];
                const currentCount = profile.completedTripsCount || 0;

                await strapi.documents('api::user-profile.user-profile').update({
                    documentId: profile.documentId,
                    data: {
                        completedTripsCount: currentCount + 1
                    }
                });
                console.log(`Incremented completedTripsCount for user ${creator.id} to ${currentCount + 1}`);
            }

            // Also, we could automatically notify passengers here
            const tripWithRequests = await strapi.documents('api::trip.trip').findOne({
                documentId,
                populate: ['joinRequests.passenger']
            });

            if (tripWithRequests && tripWithRequests.joinRequests) {
                const approvedRequests = tripWithRequests.joinRequests.filter(r => r.status === 'APPROVED');

                for (const request of approvedRequests) {
                    if (request.passenger) {
                        await strapi.documents('api::notification.notification').create({
                            data: {
                                title: 'Trip Completed',
                                message: `Your trip from ${tripWithRequests.startingPoint} to ${tripWithRequests.destination} is completed. Please rate your captain!`,
                                type: 'TRIP_COMPLETED',
                                read: false,
                                user: request.passenger.id,
                                data: {
                                    relatedId: documentId,
                                    relatedType: 'trip',
                                    tripId: documentId
                                }
                            }
                        });
                    }
                }
            }
        }
    }
};

```

### `strapi/src/api/join-request/content-types/join-request/schema.json`

```json
{
    "kind": "collectionType",
    "collectionName": "join_requests",
    "info": {
        "singularName": "join-request",
        "pluralName": "join-requests",
        "displayName": "Join Request",
        "description": "Requests from passengers to join a trip"
    },
    "options": {
        "draftAndPublish": false
    },
    "pluginOptions": {},
    "attributes": {
        "trip": {
            "type": "relation",
            "relation": "manyToOne",
            "target": "api::trip.trip",
            "inversedBy": "joinRequests"
        },
        "passenger": {
            "type": "relation",
            "relation": "manyToOne",
            "target": "plugin::users-permissions.user"
        },
        "status": {
            "type": "enumeration",
            "enum": [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "CANCELLED"
            ],
            "default": "PENDING",
            "required": true
        },
        "requestedSeats": {
            "type": "integer",
            "default": 1,
            "min": 1,
            "required": true
        },
        "message": {
            "type": "text"
        }
    }
}
```

### `strapi/src/api/join-request/content-types/join-request/lifecycles.ts`

```typescript
/**
 * join-request lifecycle hooks
 */

export default {
    async afterCreate(event: any) {
        const { result, params } = event;
        console.log('--- afterCreate Join Request ---');
        console.log('Result:', JSON.stringify(result, null, 2));
        console.log('Params Data:', JSON.stringify(params.data, null, 2));

        // In afterCreate, the 'result' often doesn't contain the relation fields
        // We should look into 'params.data' which contains the input
        let tripIdData = result.trip?.documentId || result.trip || params.data?.trip;

        let queryFilter: any = {};

        // Handle Strapi v5 normalization if present in params.data
        if (typeof tripIdData === 'object' && tripIdData?.set?.[0]) {
            const firstItem = tripIdData.set[0];
            if (firstItem.documentId) {
                queryFilter = { documentId: firstItem.documentId };
                console.log('Extracted documentId from set:', firstItem.documentId);
            } else if (firstItem.id) {
                queryFilter = { id: firstItem.id };
                console.log('Extracted numeric ID from set:', firstItem.id);
            }
        } else if (typeof tripIdData === 'object' && tripIdData?.connect?.[0]) {
            const firstItem = tripIdData.connect[0];
            if (firstItem.documentId) {
                queryFilter = { documentId: firstItem.documentId };
                console.log('Extracted documentId from connect:', firstItem.documentId);
            } else if (firstItem.id) {
                queryFilter = { id: firstItem.id };
                console.log('Extracted numeric ID from connect:', firstItem.id);
            }
        } else if (typeof tripIdData === 'string') {
            queryFilter = { documentId: tripIdData };
            console.log('Using string as documentId:', tripIdData);
        } else if (typeof tripIdData === 'number') {
            queryFilter = { id: tripIdData };
            console.log('Using number as numeric ID:', tripIdData);
        }

        if (Object.keys(queryFilter).length === 0) {
            console.warn('Warning: Could not extract trip identifier from result or params.data');
            return;
        }

        try {
            // Use findMany with filters to handle both numeric id and documentId
            const trips = await strapi.documents('api::trip.trip').findMany({
                filters: queryFilter,
                populate: ['creator']
            });

            const trip = trips.length > 0 ? trips[0] : null;

            console.log('Trip found:', !!trip, trip?.documentId);
            if (trip && trip.creator) {
                console.log('Trip creator found:', trip.creator.id);

                await strapi.documents('api::notification.notification').create({
                    data: {
                        title: 'New Join Request',
                        message: `${result.requestedSeats} seat(s) requested for your trip to ${trip.destination}.`,
                        type: 'JOIN_REQUEST',
                        read: false,
                        user: trip.creator.id,
                        data: {
                            relatedId: result.documentId,
                            relatedType: 'join-request',
                            tripId: trip.documentId
                        }
                    }
                });
                console.log(`Created notification for user ${trip.creator.id} for new join request ${result.documentId}`);
            } else {
                console.warn('Trip or trip creator not found for filter:', queryFilter);
            }
        } catch (error) {
            console.error('Failed to create notification in afterCreate:', error);
        }
    },

    async afterUpdate(event: any) {
        const { result } = event;

        // If status was updated, notify the passenger
        if (result.status === 'APPROVED' || result.status === 'REJECTED') {
            try {
                const entry = await strapi.documents('api::join-request.join-request').findOne({
                    documentId: result.documentId,
                    populate: ['trip', 'passenger'],
                });

                if (entry && entry.passenger) {
                    await strapi.documents('api::notification.notification').create({
                        data: {
                            title: `Request ${result.status.toLowerCase()}`,
                            message: `Your request for the trip to ${entry.trip.destination} has been ${result.status.toLowerCase()}.`,
                            type: 'JOIN_REQUEST',
                            read: false,
                            user: entry.passenger.id,
                            data: {
                                relatedId: result.documentId,
                                relatedType: 'join-request',
                                tripId: entry.trip.documentId
                            }
                        }
                    });
                    console.log(`Created status notification for passenger ${entry.passenger.id}`);
                }

                // Seat management if approved
                if (result.status === 'APPROVED') {
                    const tripDocumentId = entry?.trip?.documentId;
                    if (tripDocumentId) {
                        await updateSeats(tripDocumentId, result.requestedSeats);
                    }
                }
            } catch (error) {
                console.error('Failed to process join-request update notification:', error);
            }
        }
    },
};

async function updateSeats(tripDocumentId: string, seatsToSubtract: number) {
    try {
        const trip = await strapi.documents('api::trip.trip').findOne({
            documentId: tripDocumentId
        });

        if (trip && trip.availableSeats >= seatsToSubtract) {
            await strapi.documents('api::trip.trip').update({
                documentId: tripDocumentId,
                data: {
                    availableSeats: trip.availableSeats - seatsToSubtract,
                },
            });

            // In Strapi v5, update() only modifies the draft.
            // We must publish() so the live/published version reflects the new seat count.
            await strapi.documents('api::trip.trip').publish({
                documentId: tripDocumentId,
            });

            console.log(`Updated and published trip ${tripDocumentId} seats: -${seatsToSubtract}`);
        }
    } catch (error) {
        console.error('Failed to update seats:', error);
    }
}

```

### `strapi/src/api/user-profile/content-types/user-profile/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "user_profiles",
  "info": {
    "singularName": "user-profile",
    "pluralName": "user-profiles",
    "displayName": "UserProfile"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "fullName": {
      "type": "string"
    },
    "phoneNumber": {
      "type": "string"
    },
    "avatar": {
      "type": "media",
      "multiple": false,
      "allowedTypes": [
        "images",
        "files",
        "videos",
        "audios"
      ]
    },
    "rating": {
      "type": "decimal"
    },
    "completedTripsCount": {
      "type": "integer"
    },
    "ratingsCount": {
      "type": "integer",
      "default": 0
    },
    "isVerified": {
      "type": "boolean",
      "default": false
    },
    "governmentIdVerified": {
      "type": "boolean",
      "required": false,
      "default": false
    },
    "gender": {
      "type": "enumeration",
      "enum": [
        "men",
        "women"
      ]
    },
    "userId": {
      "type": "relation",
      "relation": "oneToOne",
      "target": "plugin::users-permissions.user"
    },
    "pushToken": {
      "type": "string"
    }
  }
}
```

### `strapi/src/api/notification/content-types/notification/schema.json`

```json
{
    "kind": "collectionType",
    "collectionName": "notifications",
    "info": {
        "singularName": "notification",
        "pluralName": "notifications",
        "displayName": "Notification",
        "description": ""
    },
    "options": {
        "draftAndPublish": false
    },
    "pluginOptions": {},
    "attributes": {
        "title": {
            "type": "string",
            "required": true
        },
        "message": {
            "type": "text",
            "required": true
        },
        "type": {
            "type": "enumeration",
            "enum": [
                "JOIN_REQUEST",
                "TRIP_UPDATE",
                "SYSTEM",
                "TRIP_COMPLETED"
            ],
            "default": "SYSTEM"
        },
        "read": {
            "type": "boolean",
            "default": false
        },
        "user": {
            "type": "relation",
            "relation": "manyToOne",
            "target": "plugin::users-permissions.user"
        },
        "data": {
            "type": "json"
        }
    }
}
```

