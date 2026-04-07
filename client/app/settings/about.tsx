import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

type GithubProfile = {
  avatar_url?: string;
  name?: string;
};

const TECH_STACK = [
  'React Native',
  'Expo',
  'NestJS',
  'Prisma',
  'PostgreSQL',
  'Next.js',
  'TypeScript',
  'Zustand',
  'Socket.io',
  'Cloudinary',
];

export default function AboutScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const [githubProfile, setGithubProfile] = useState<GithubProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.github.com/users/rohankarankot')
      .then((res) => res.json())
      .then((data) => {
        setGithubProfile(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const creatorAvatar =
    githubProfile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan';
  const creatorName = githubProfile?.name || 'Rohan Karankot';

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'About' }} />

      <VStack className="items-center mt-8 mb-8" space="sm">
        <Box
          className="h-20 w-20 rounded-2xl items-center justify-center"
          style={[styles.logoShadow, { backgroundColor: primaryColor }]}
        >
          <IconSymbol name="car.fill" size={40} color="#fff" />
        </Box>
        <Text className="text-2xl font-extrabold" style={{ color: textColor }}>
          My Ride Partner
        </Text>
        <Text className="text-sm font-medium" style={{ color: subtextColor }}>
          Version 1.0.0
        </Text>
      </VStack>

      <Box className="rounded-3xl p-6 mb-4" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
        <Text className="text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: subtextColor }}>
          About Us
        </Text>
        <VStack className="mt-3" space="md">
          <Text className="text-sm leading-5" style={{ color: textColor }}>
            My Ride Partner is a ridesharing platform designed and developed to simplify
            daily commutes, reduce travel costs, and foster a trusted community.
          </Text>
          <Text className="text-sm leading-5" style={{ color: textColor }}>
            Developed with a mission to connect people and solve urban transportation
            challenges, the app helps users find reliable ride partners within their city
            or community.
          </Text>
        </VStack>
      </Box>

      <Box className="rounded-3xl p-6 mb-4" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
        <Text className="text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: subtextColor }}>
          Technologies Used
        </Text>
        <HStack className="flex-wrap mt-4" space="sm">
          {TECH_STACK.map((tech) => (
            <Box
              key={tech}
              className="rounded-full px-3 py-2 mb-2"
              style={{ backgroundColor: `${borderColor}40` }}
            >
              <Text className="text-sm font-medium" style={{ color: textColor }}>
                {tech}
              </Text>
            </Box>
          ))}
        </HStack>
      </Box>

      <Box className="rounded-3xl p-6" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
        <Text className="text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: subtextColor }}>
          Developer
        </Text>

        {isLoading ? (
          <Box className="h-24 items-center justify-center">
            <Spinner color={primaryColor} />
          </Box>
        ) : (
          <Pressable
            className="mt-4 rounded-2xl p-4"
            style={[styles.linkedinCard, { borderColor: '#0A66C2' }]}
            onPress={() => openLink('https://linkedin.com/in/rohan-karankot/')}
          >
            <VStack space="md">
              <HStack space="sm" className="items-center">
                <Box className="h-5 w-5 rounded-[4px] items-center justify-center bg-white">
                  <Text className="text-xs font-bold" style={{ color: '#0A66C2' }}>
                    in
                  </Text>
                </Box>
                <Text className="text-sm font-semibold text-white">LinkedIn</Text>
              </HStack>

              <HStack space="md" className="items-center">
                <Avatar size="lg">
                  <AvatarFallbackText>{creatorName}</AvatarFallbackText>
                  <AvatarImage source={{ uri: creatorAvatar }} alt={creatorName} />
                </Avatar>
                <VStack className="flex-1" space="xs">
                  <Text className="text-base font-bold text-white">{creatorName}</Text>
                  <Text className="text-sm text-white/90">Senior Analyst @ Accenture</Text>
                </VStack>
              </HStack>

              <HStack className="items-center justify-between">
                <Text className="text-sm font-semibold text-white">View Profile</Text>
                <IconSymbol name="arrow.up.right" size={16} color="#fff" />
              </HStack>
            </VStack>
          </Pressable>
        )}
      </Box>

      <VStack className="items-center my-8 px-4" space="sm">
        <Text className="text-sm text-center" style={{ color: textColor }}>
          An initiative by MH13 Community
        </Text>
        <Pressable onPress={() => openLink('https://github.com/rohankarankot/myRidePartner')}>
          <Text
            className="text-xs text-center underline"
            style={{ color: primaryColor }}
          >
            Contributions are welcomed
          </Text>
        </Pressable>
        <Text className="text-xs text-center mt-3" style={{ color: subtextColor }}>
          © 2026 My Ride Partner. All rights reserved.
        </Text>
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  logoShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  linkedinCard: {
    backgroundColor: '#0A66C2',
    borderWidth: 1,
  },
});
