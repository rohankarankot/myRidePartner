import { Tabs, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HeaderRight } from '@/components/ui/HeaderRight';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import { useAuth } from '@/context/auth-context';
import { getThemeColors } from '@/constants/theme';
import { tripService } from '@/services/trip-service';
import { joinRequestService } from '@/services/join-request-service';
import { useInterstitialAd } from '@/features/ads/hooks/use-interstitial-ad';

import PublishOutlineIcon from '@/assets/tab-icons/publish-outline.svg';
import PublishFilledIcon from '@/assets/tab-icons/publish-filled.svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const ACTIVE_TRIP_STATUSES = ['PUBLISHED', 'STARTED'] as const;

type TabsShellProps = {
  currentColors: ReturnType<typeof getThemeColors>['light'];
  tabBarHeight: number;
  tabBarBottomPadding: number;
  profileAvatarUrl?: string;
  profileInitial: string;
};

export function TabsShell({
  currentColors,
  tabBarHeight,
  tabBarBottomPadding,
  profileAvatarUrl,
  profileInitial,
}: TabsShellProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isRideMenuOpen, setIsRideMenuOpen] = useState(false);
  const menuProgress = useSharedValue(0);
  const { showAdWithCallback } = useInterstitialAd(1);

  const { data: trips = [] } = useQuery({
    queryKey: ['trips', user?.id],
    queryFn: () => tripService.getUserTrips(user!.id),
    enabled: !!user?.id,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['join-requests', user?.id],
    queryFn: () => joinRequestService.getJoinRequestsForUser(user!.id),
    enabled: !!user?.id,
  });

  const currentRide = useMemo(() => {
    const rides = [
      ...trips
        .filter((trip) => ACTIVE_TRIP_STATUSES.includes(trip.status as typeof ACTIVE_TRIP_STATUSES[number]))
        .map((trip) => ({
          tripId: trip.documentId,
          status: trip.status,
          title: `${trip.startingPoint} → ${trip.destination}`,
        })),
      ...requests
        .filter(
          (request) =>
            request.status === 'APPROVED' &&
            request.trip &&
            ACTIVE_TRIP_STATUSES.includes(request.trip.status as typeof ACTIVE_TRIP_STATUSES[number])
        )
        .map((request) => ({
          tripId: request.trip!.documentId,
          status: request.trip!.status,
          title: `${request.trip!.startingPoint} → ${request.trip!.destination}`,
        })),
    ];

    return rides.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'STARTED' ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    })[0];
  }, [requests, trips]);

  const bottomOffset = tabBarHeight + 12;

  const openTrip = (path: string) => {
    setIsRideMenuOpen(false);
    menuProgress.value = withSpring(0, { damping: 18, stiffness: 180 });
    showAdWithCallback(() => router.push(path as any));
  };

  const floatingButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + menuProgress.value * 0.04 }],
  }));

  const menuStyle = useAnimatedStyle(() => ({
    opacity: menuProgress.value,
    transform: [
      { translateY: (1 - menuProgress.value) * 14 },
      { scale: 0.92 + menuProgress.value * 0.08 },
    ],
  }));

  const toggleRideMenu = () => {
    setIsRideMenuOpen((value) => {
      const next = !value;
      menuProgress.value = withSpring(next ? 1 : 0, {
        damping: 18,
        stiffness: 180,
        mass: 0.9,
      });
      return next;
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Box style={{ flex: 1 }}>
        <Tabs
          screenOptions={() => ({
            tabBarActiveTintColor: currentColors.tint,
            tabBarInactiveTintColor: currentColors.subtext,
            tabBarShowLabel: true,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
              marginTop: 4,
              marginBottom: Platform.OS === 'ios' ? 0 : 4,
            },
            tabBarItemStyle: {
              paddingVertical: 2,
            },
            tabBarHideOnKeyboard: true,
            headerShown: true,
            headerStyle: {
              backgroundColor: currentColors.card,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: currentColors.border,
            },
            headerTitleStyle: {
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontSize: 16,
              fontFamily: 'Plus Jakarta Sans',
            },
            headerTintColor: currentColors.text,
            tabBarButton: HapticTab,
            headerTitleAlign: 'center',
            headerRight: () => <HeaderRight type="notifications" />,
            headerBackTitleVisible: false,
            headerLeft: () => null,
            tabBarStyle: {
              backgroundColor: currentColors.card,
              borderTopWidth: 1,
              borderTopColor: currentColors.border,
              height: tabBarHeight,
              paddingTop: Platform.OS === 'ios' ? 10 : 2,
              paddingBottom: tabBarBottomPadding,
            },
          })}
        >
          <Tabs.Screen
            name="index"
            options={{
              headerTitle: 'FIND RIDES',
              title: 'Explore',
              tabBarIcon: ({ color, focused }) =>
                focused ? <MaterialIcons name="route" size={26} color={color} /> : <MaterialIcons name="route" size={26} color={color} />,
            }}
          />
          <Tabs.Screen
            name="activity"
            options={{
              headerTitle: 'ACTIVITY',
              title: 'Activity',
              headerRight: () => <HeaderRight type="chats" />,
              tabBarIcon: ({ color }) => <IconSymbol name="list.bullet" size={26} color={color} />,
            }}
          />
          <Tabs.Screen
            name="create"
            options={{
              headerTitle: 'PUBLISH',
              title: 'Publish',
              tabBarIcon: ({ color, focused }) =>
                focused ? <PublishFilledIcon width={28} height={28} color={color} /> : <PublishOutlineIcon width={28} height={28} color={color} />,
            }}
          />
          <Tabs.Screen
            name="community"
            options={{
              headerTitle: 'COMMUNITY',
              title: 'Community',
              tabBarIcon: ({ color }) => <IconSymbol name="person.2.fill" size={26} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              headerShown: true,
              headerTitle: 'PROFILE',
              headerRight: () => <HeaderRight type="settings" />,
              tabBarIcon: ({ focused, color }) =>
                profileAvatarUrl ? (
                  <Box
                    className="w-8 h-8 rounded-full border-2 overflow-hidden shadow-sm"
                    style={{ borderColor: focused ? currentColors.tint : `${currentColors.border}` }}
                  >
                    <Image source={{ uri: profileAvatarUrl }} className="w-full h-full" />
                  </Box>
                ) : (
                  <Box
                    className="w-8 h-8 rounded-full items-center justify-center border shadow-sm"
                    style={{
                      backgroundColor: focused ? currentColors.tint : currentColors.background,
                      borderColor: focused ? currentColors.tint : `${currentColors.border}`,
                    }}
                  >
                    <Text className="text-[10px] font-extrabold uppercase" style={{ color: focused ? '#fff' : color }}>
                      {profileInitial}
                    </Text>
                  </Box>
                ),
            }}
          />
        </Tabs>

        {currentRide ? (
          <Box className="absolute left-0 right-0" style={{ bottom: bottomOffset, zIndex: 50, alignItems: 'center' }}>
            <Animated.View pointerEvents={isRideMenuOpen ? 'auto' : 'none'} style={[{ marginBottom: 12 }, menuStyle]}>
              <VStack className="items-center" space="sm">
                <Animated.View entering={FadeInDown.duration(180)} exiting={FadeOutDown.duration(120)}>
                  <RideActionButton
                    label="Current Ride"
                    icon="route"
                    color={currentColors.tint}
                    backgroundColor={currentColors.card}
                    borderColor={currentColors.border}
                    onPress={() => openTrip(`/trip/${currentRide.tripId}`)}
                  />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(40).duration(180)} exiting={FadeOutDown.duration(120)}>
                  <RideActionButton
                    label="Ride Chat"
                    icon="bubble.left.and.bubble.right.fill"
                    color={currentColors.tint}
                    backgroundColor={currentColors.card}
                    borderColor={currentColors.border}
                    onPress={() => openTrip(`/trip-chat/${currentRide.tripId}`)}
                  />
                </Animated.View>
              </VStack>
            </Animated.View>

            <Animated.View style={floatingButtonStyle}>
              <Pressable
                className="rounded-full px-5 py-3 shadow-2xl border flex-row items-center"
                style={{
                  backgroundColor: currentColors.tint,
                  borderColor: currentColors.tint,
                }}
                onPress={toggleRideMenu}
              >
                <IconSymbol name={isRideMenuOpen ? 'xmark' : 'car.fill'} size={18} color="#fff" />
                <Text className="ml-2 text-sm font-extrabold uppercase tracking-widest" style={{ color: '#fff' }}>
                  Active Ride
                </Text>
              </Pressable>
            </Animated.View>
          </Box>
        ) : null}
      </Box>
    </GestureHandlerRootView>
  );
}

function RideActionButton({
  label,
  icon,
  color,
  backgroundColor,
  borderColor,
  onPress,
}: {
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="min-w-[190px] rounded-full border px-4 py-3 flex-row items-center justify-center shadow-xl"
      style={{ backgroundColor, borderColor }}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={16} color={color} />
      <Text className="ml-2 text-xs font-extrabold uppercase tracking-widest" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}
