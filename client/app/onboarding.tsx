import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
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
    title: 'Find Your Perfect Ride',
    text: 'Share your journey with amazing people. Save money, reduce carbon footprint, and make new connections.',
    icon: 'car.fill',
    colors: ['#3B82F6', '#2563EB'], // primary/blue vibe
  },
  {
    key: '2',
    title: 'Publish and Earn',
    text: 'Got empty seats? Offer them to others heading your way and share the travel costs effortlessly.',
    icon: 'plus.circle.fill',
    colors: ['#10B981', '#059669'], // success/green vibe
  },
  {
    key: '3',
    title: 'Safe Community',
    text: 'Join a trusted network. Use our verified profiles and real-time ratings to travel with peace of mind.',
    icon: 'person.2.fill',
    colors: ['#8B5CF6', '#7C3AED'], // purple vibe
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');

  const onDone = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      // Fallback navigation even if save fails
      router.replace('/login');
    }
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={[styles.slide, { backgroundColor }]}>
        <View style={styles.iconWrapper}>
          <View style={[styles.iconCircle, { backgroundColor: `${item.colors[0]}15` }]}>
            <IconSymbol name={item.icon as any} size={80} color={item.colors[0]} />
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
          <Text style={[styles.text, { color: subtextColor }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const renderDoneButton = () => {
    return (
      <View style={[styles.buttonCircle, { backgroundColor: primaryColor }]}>
        <IconSymbol name="checkmark" color="rgba(255, 255, 255, .9)" size={24} />
      </View>
    );
  };

  const renderNextButton = () => {
    return (
      <View style={[styles.buttonCircle, { backgroundColor: 'rgba(0, 0, 0, .05)' }]}>
        <IconSymbol name="chevron.right" color={primaryColor} size={24} />
      </View>
    );
  };

  const renderSkipButton = () => {
    return (
      <View style={styles.skipButton}>
         <Text style={[styles.skipText, { color: subtextColor }]}>Skip</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <AppIntroSlider
        renderItem={renderItem}
        data={slides}
        onDone={onDone}
        onSkip={onDone}
        showSkipButton
        renderDoneButton={renderDoneButton}
        renderNextButton={renderNextButton}
        renderSkipButton={renderSkipButton}
        activeDotStyle={{ backgroundColor: primaryColor, width: 24 }}
        dotStyle={{ backgroundColor: `${primaryColor}30` }}
        bottomButton={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  iconWrapper: {
    flex: 0.6,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
    paddingBottom: 60,
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  buttonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  }
});
