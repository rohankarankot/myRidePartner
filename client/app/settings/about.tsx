import React, { useEffect, useState } from 'react';
import { Linking, ScrollView } from 'react-native';
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
import { Divider } from '@/components/ui/divider';

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
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'About', headerTitleStyle: { fontWeight: '800' } }} />

      <VStack className="items-center mt-12 mb-10" space="md">
        <Box
          className="h-24 w-24 rounded-[32px] items-center justify-center shadow-xl rotate-3"
          style={{ backgroundColor: primaryColor }}
        >
          <IconSymbol name="car.fill" size={48} color="#fff" />
        </Box>
        <VStack className="items-center" space="xs">
            <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
            My Ride Partner
            </Text>
            <Box className="px-3 py-1 rounded-full border border-dashed" style={{ borderColor: primaryColor }}>
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                Version 1.0.0
                </Text>
            </Box>
        </VStack>
      </VStack>

      <Box className="mx-6 rounded-[32px] p-6 mb-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-4" style={{ color: subtextColor }}>
          About Us
        </Text>
        <VStack space="md">
          <Text className="text-sm font-medium leading-7" style={{ color: textColor }}>
            My Ride Partner is a ridesharing platform designed and developed to simplify
            daily commutes, reduce travel costs, and foster a trusted community.
          </Text>
          <Divider style={{ backgroundColor: borderColor }} />
          <Text className="text-sm font-medium leading-7" style={{ color: textColor }}>
            Developed with a mission to connect people and solve urban transportation
            challenges, the app helps users find reliable ride partners within their city
            or community.
          </Text>
        </VStack>
      </Box>

      <Box className="mx-6 rounded-[32px] p-6 mb-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-5" style={{ color: subtextColor }}>
          Technologies Used
        </Text>
        <HStack className="flex-wrap" space="sm">
          {TECH_STACK.map((tech) => (
            <Box
              key={tech}
              className="rounded-full px-4 py-2 mb-2 border"
              style={{ backgroundColor: `${subtextColor}05`, borderColor }}
            >
              <Text className="text-xs font-bold" style={{ color: textColor }}>
                {tech}
              </Text>
            </Box>
          ))}
        </HStack>
      </Box>

      <Box className="mx-6 rounded-[32px] p-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-5" style={{ color: subtextColor }}>
          Developed By
        </Text>

        {isLoading ? (
          <Box className="h-32 items-center justify-center">
            <Spinner color={primaryColor} />
          </Box>
        ) : (
          <Pressable
            className="rounded-[24px] p-5 shadow-sm border-2 overflow-hidden"
            style={{ backgroundColor: '#0A66C2', borderColor: '#084e96' }}
            onPress={() => openLink('https://linkedin.com/in/rohan-karankot/')}
          >
            <VStack space="lg">
              <HStack space="md" className="items-center">
                <Avatar size="lg" className="border-2 border-white shadow-sm">
                  <AvatarFallbackText>{creatorName}</AvatarFallbackText>
                  <AvatarImage source={{ uri: creatorAvatar }} alt={creatorName} />
                </Avatar>
                <VStack className="flex-1" space="xs">
                  <Text className="text-lg font-bold text-white">{creatorName}</Text>
                  <Text className="text-xs font-semibold text-white/90 uppercase tracking-widest">Analyst @ Accenture</Text>
                </VStack>
              </HStack>

              <HStack className="items-center justify-between mt-2 pt-4 border-t border-white/20">
                <HStack space="sm" className="items-center">
                    <Box className="w-5 h-5 bg-white rounded-sm items-center justify-center">
                        <Text className="text-[10px] font-extrabold" style={{ color: '#0A66C2' }}>in</Text>
                    </Box>
                    <Text className="text-xs font-bold text-white uppercase tracking-widest">Connect on LinkedIn</Text>
                </HStack>
                <IconSymbol name="arrow.up.right" size={16} color="#fff" />
              </HStack>
            </VStack>
          </Pressable>
        )}
      </Box>

      <VStack className="items-center mt-12 px-10" space="md">
        <Text className="text-xs font-bold text-center leading-5 uppercase tracking-tighter" style={{ color: textColor }}>
          An initiative by Solapur MH13 Community
        </Text>
        <Pressable onPress={() => openLink('https://github.com/rohankarankot/myRidePartner')}>
            <Box className="px-5 py-2 rounded-full border border-dashed" style={{ borderColor: primaryColor }}>
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                    Contributions are welcomed
                </Text>
            </Box>
        </Pressable>
        <Divider className="w-12 mt-4" style={{ backgroundColor: borderColor }} />
        <Text className="text-[8px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          © 2026 My Ride Partner. All rights reserved.
        </Text>
      </VStack>
    </ScrollView>
  );
}
