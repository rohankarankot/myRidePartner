import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

function CommunityInfoAction({
  icon,
  title,
  subtitle,
  primaryColor,
  subtextColor,
  textColor,
  borderColor,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  primaryColor: string;
  subtextColor: string;
  textColor: string;
  borderColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="rounded-[28px] border p-5 mb-4"
      style={{ backgroundColor: 'transparent', borderColor }}
      onPress={onPress}
    >
      <HStack className="items-center" space="xl">
        <Box
          className="h-12 w-12 rounded-full items-center justify-center shadow-inner"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <IconSymbol name={icon as any} size={22} color={primaryColor} />
        </Box>
        <VStack className="flex-1" space="xs">
          <Text className="text-base font-bold" style={{ color: textColor }}>
            {title}
          </Text>
          <Text className="text-xs font-medium leading-5" style={{ color: subtextColor }}>
            {subtitle}
          </Text>
        </VStack>
        <IconSymbol name="chevron.right" size={18} color={subtextColor} />
      </HStack>
    </Pressable>
  );
}

export default function CommunityInfoScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Community Info',
          headerTitleStyle: { fontWeight: '800' },
          headerShown: true,
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      <VStack className="p-6" space="xl">
        <VStack space="sm">
          <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
            Community options
          </Text>
          <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
            Explore the shared public group and see everyone who is part of it. Join discussions, share rides, and connect with other travelers.
          </Text>
        </VStack>

        <VStack space="xs" className="mt-4">
          <CommunityInfoAction
            icon="message.fill"
            title="Chat Room"
            subtitle="Open the public community chat in a dedicated screen."
            primaryColor={primaryColor}
            subtextColor={subtextColor}
            textColor={textColor}
            borderColor={borderColor}
            onPress={() => router.push('/community-chat')}
          />

          <CommunityInfoAction
            icon="person.2.fill"
            title="Members"
            subtitle="See all users who are part of the public community chat."
            primaryColor={primaryColor}
            subtextColor={subtextColor}
            textColor={textColor}
            borderColor={borderColor}
            onPress={() => router.push('/community-members')}
          />
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
