import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

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

  const onDone = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      router.replace('/login');
    }
  };

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={[styles.slide, { backgroundColor }]}>
      <View style={styles.heroSection}>
        <View style={[styles.heroGlow, { backgroundColor: `${item.colors[0]}10` }]} />
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: `${item.colors[0]}16`,
              borderColor: `${item.colors[0]}28`,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <IconSymbol name={item.icon as any} size={58} color={item.colors[0]} />
        </Animated.View>
      </View>

      <View style={styles.contentSection}>
        <View style={[styles.eyebrowPill, { backgroundColor: `${item.colors[0]}14` }]}>
          <Text style={[styles.eyebrowText, { color: item.colors[0] }]}>{item.eyebrow}</Text>
        </View>

        <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
        <Text style={[styles.text, { color: subtextColor }]}>{item.text}</Text>

        <View style={[styles.pointsCard, { backgroundColor: cardColor, borderColor }]}>
          {item.points.map((point) => (
            <View key={point} style={styles.pointRow}>
              <View style={[styles.pointIcon, { backgroundColor: `${item.colors[0]}14` }]}>
                <IconSymbol name="checkmark" size={12} color={item.colors[0]} />
              </View>
              <Text style={[styles.pointText, { color: textColor }]}>{point}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderDoneButton = () => (
    <View style={[styles.buttonCircle, { backgroundColor: primaryColor }]}>
      <IconSymbol name="checkmark" color="rgba(255, 255, 255, 0.95)" size={22} />
    </View>
  );

  const renderNextButton = () => (
    <View style={[styles.buttonCircle, { backgroundColor: `${primaryColor}12` }]}>
      <IconSymbol name="chevron.right" color={primaryColor} size={22} />
    </View>
  );

  const renderSkipButton = () => (
    <View style={styles.skipButton}>
      <Text style={[styles.skipText, { color: subtextColor }]}>Skip</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <AppIntroSlider
        data={slides}
        renderItem={renderItem}
        onDone={onDone}
        onSkip={onDone}
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

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  heroSection: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGlow: {
    position: 'absolute',
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width,
  },
  iconCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  contentSection: {
    flex: 0.6,
    paddingBottom: 20,
  },
  eyebrowPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 14,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 22,
  },
  pointsCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pointIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 12,
  },
  pointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  buttonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
