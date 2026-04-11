import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { analyticsService } from '@/services/analytics-service';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    eyebrow: 'Welcome',
    title: 'Ride sharing made simple',
    text:
      'My Ride Partner helps you find people going to a similar destination so you can share Ola or Uber ride costs in a simpler way.',
    icon: 'car.fill',
    colors: ['#1D4ED8', '#3B82F6'],
    points: [
      'Browse rides city-wise from the Find tab.',
      'Publish your own ride if you have empty seats.',
      'Track requests, chats, and completed rides in one place.',
    ],
  },
  {
    key: '2',
    eyebrow: 'Step 1',
    title: 'Complete your profile first',
    text:
      'Add your name, phone number, gender, and city so other riders know who they are traveling with.',
    icon: 'person.crop.circle.badge.checkmark',
    colors: ['#0F766E', '#14B8A6'],
    points: [
      'Your city becomes the default ride city on Find.',
      'A complete profile makes join requests smoother.',
      'You can also verify your government ID for extra trust.',
    ],
  },
  {
    key: '3',
    eyebrow: 'Step 2',
    title: 'Find and join the right ride',
    text:
      'Use the Find page to explore available rides, open ride details, and request the seats you need.',
    icon: 'magnifyingglass',
    colors: ['#B45309', '#F59E0B'],
    points: [
      'Filter by city, date, and ride details that match your plan.',
      'Open a ride to check captain info, timing, seats, and price.',
      'Send a join request and wait for the captain to approve it.',
    ],
  },
  {
    key: '4',
    eyebrow: 'Step 3',
    title: 'Publish rides and manage your ride',
    text:
      'If you are driving, create a ride, approve requests, start the ride, and complete it once the ride is done.',
    icon: 'plus.circle.fill',
    colors: ['#7C3AED', '#A855F7'],
    points: [
      'Set pickup, destination, time, seats, and pricing.',
      'If price is calculated later, enter the final amount on completion.',
      'Your ride analytics update from completed rides and approvals.',
    ],
  },
  {
    key: '5',
    eyebrow: 'Safety',
    title: 'Travel with more confidence',
    text:
      'Use ratings, reports, blocks, and verification tools to keep your ride sharing experience safer and more comfortable.',
    icon: 'checkmark.shield.fill',
    colors: ['#BE123C', '#F43F5E'],
    points: [
      'Rate riders and captains after completed rides.',
      'Block or report anyone who makes you uncomfortable.',
      'Your trusted profile and ride history help build credibility.',
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  const finishOnboarding = async (action: 'completed' | 'skipped') => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      await analyticsService.trackEvent('onboarding_complete', {
        action,
      });
      router.replace('/login');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      router.replace('/login');
    }
  };

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => (
    <Box className="flex-1 px-6 pt-6 pb-8" style={{ backgroundColor }}>
      <Box className="flex-[0.4] items-center justify-center">
        <Box 
          className="absolute rounded-full" 
          style={{ width: width * 0.72, height: width * 0.72, backgroundColor: `${item.colors[0]}10` }} 
        />
        <Animated.View
          style={[
            {
              width: 144,
              height: 144,
              borderRadius: 72,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              backgroundColor: `${item.colors[0]}16`,
              borderColor: `${item.colors[0]}28`,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <IconSymbol name={item.icon as any} size={58} color={item.colors[0]} />
        </Animated.View>
      </Box>

      <VStack className="flex-[0.6] pb-5" space="md">
        <Box 
          className="self-start px-3 py-1.5 rounded-full" 
          style={{ backgroundColor: `${item.colors[0]}14` }}
        >
          <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: item.colors[0] }}>
            {item.eyebrow}
          </Text>
        </Box>

        <Text className="text-3xl font-extrabold leading-9" style={{ color: textColor }}>
          {item.title}
        </Text>
        <Text className="text-base leading-6 mb-2" style={{ color: subtextColor }}>
          {item.text}
        </Text>

        <Box 
          className="border rounded-[22px] p-4 gap-3.5" 
          style={{ backgroundColor: cardColor, borderColor }}
        >
          {item.points.map((point) => (
            <HStack key={point} className="items-start" space="sm">
              <Box 
                className="w-5 h-5 rounded-full items-center justify-center mt-0.5" 
                style={{ backgroundColor: `${item.colors[0]}14` }}
              >
                <IconSymbol name="checkmark" size={10} color={item.colors[0]} />
              </Box>
              <Text className="flex-1 text-sm font-medium leading-5" style={{ color: textColor }}>
                {point}
              </Text>
            </HStack>
          ))}
        </Box>
      </VStack>
    </Box>
  );

  const renderDoneButton = () => (
    <Box 
      className="w-12 h-12 rounded-full items-center justify-center shadow-md" 
      style={{ backgroundColor: primaryColor }}
    >
      <IconSymbol name="checkmark" color="rgba(255, 255, 255, 0.95)" size={22} />
    </Box>
  );

  const renderNextButton = () => (
    <Box 
      className="w-12 h-12 rounded-full items-center justify-center shadow-sm" 
      style={{ backgroundColor: `${primaryColor}12` }}
    >
      <IconSymbol name="chevron.right" color={primaryColor} size={22} />
    </Box>
  );

  const renderSkipButton = () => (
    <Box className="h-12 justify-center px-2">
      <Text className="text-base font-semibold" style={{ color: subtextColor }}>Skip</Text>
    </Box>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <AppIntroSlider
        data={slides}
        renderItem={renderItem}
        onDone={() => {
          void finishOnboarding('completed');
        }}
        onSkip={() => {
          void finishOnboarding('skipped');
        }}
        showSkipButton
        renderDoneButton={renderDoneButton}
        renderNextButton={renderNextButton}
        renderSkipButton={renderSkipButton}
        activeDotStyle={{ backgroundColor: primaryColor, width: 26 }}
        dotStyle={{ backgroundColor: `${primaryColor}26` }}
        bottomButton={false}
      />
    </SafeAreaView>
  );
}
