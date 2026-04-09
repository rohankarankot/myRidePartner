import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { userService } from '@/services/user-service';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';

export default function CommunityRoomScreen() {
  const router = useRouter();
  const { city } = useLocalSearchParams<{ city?: string }>();
  const selectedCity = city?.trim() || null;
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const { data: roomMembersMeta } = useQuery({
    queryKey: ['community-room-members-summary', selectedCity],
    queryFn: () =>
      userService.getCommunityMembers({
        page: 1,
        pageSize: 1,
        city: selectedCity || undefined,
      }),
    enabled: Boolean(selectedCity),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: selectedCity ? `${selectedCity} Room` : 'Community Room',
          headerTitleStyle: { fontWeight: '800' },
          headerShown: true,
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      <VStack className="p-6" space="xl">
        <Box
          className="rounded-[32px] border items-center p-8"
          style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}20` }}
        >
          <Box
            className="h-16 w-16 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: primaryColor }}
          >
            <IconSymbol name="message.fill" size={28} color="#FFFFFF" />
          </Box>
          <Text className="text-2xl font-extrabold text-center mb-2" style={{ color: textColor }}>
            {selectedCity ? `${selectedCity} Room` : 'Community Room'}
          </Text>
          <Text className="text-sm font-medium leading-6 text-center" style={{ color: subtextColor }}>
            Connect with travelers in your area. Share updates, ask questions, and help others in the {selectedCity || 'local'} community.
          </Text>
        </Box>

        <HStack space="md">
          <VStack className="flex-1 rounded-[24px] border p-5 items-center justify-center" style={{ backgroundColor: cardColor, borderColor }}>
            <Text className="text-2xl font-extrabold mb-1" style={{ color: primaryColor }}>
              {roomMembersMeta?.meta.pagination.total ?? 0}
            </Text>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
              members
            </Text>
          </VStack>
          <VStack className="flex-1 rounded-[24px] border p-5 items-center justify-center" style={{ backgroundColor: cardColor, borderColor }}>
            <Text className="text-2xl font-extrabold mb-1" style={{ color: primaryColor }}>
              Local
            </Text>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
              Vibe
            </Text>
          </VStack>
        </HStack>

        <VStack space="sm" className="mt-2">
            <Button
                className="h-14 rounded-2xl"
                style={{ backgroundColor: primaryColor }}
                onPress={() =>
                    router.push({
                    pathname: '/community-members',
                    params: selectedCity ? { city: selectedCity } : undefined,
                    })
                }
            >
                <HStack space="sm" className="items-center">
                    <IconSymbol name="person.2.fill" size={18} color="#FFFFFF" />
                    <ButtonText className="font-extrabold uppercase tracking-widest">View room members</ButtonText>
                </HStack>
            </Button>

            <Button
                variant="outline"
                className="h-14 rounded-2xl"
                style={{ borderColor, backgroundColor: cardColor }}
                onPress={() =>
                    router.push({
                    pathname: '/community-chat',
                    params: selectedCity ? { city: selectedCity } : undefined,
                    })
                }
            >
                <HStack space="sm" className="items-center">
                    <IconSymbol name="bubble.left.and.bubble.right.fill" size={18} color={primaryColor} />
                    <ButtonText className="font-extrabold uppercase tracking-widest" style={{ color: textColor }}>Back to chat room</ButtonText>
                </HStack>
            </Button>
        </VStack>

        <Box className="rounded-[24px] border p-6 mt-2" style={{ backgroundColor: cardColor, borderColor }}>
          <Text className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: subtextColor }}>
            What to share here
          </Text>
          <VStack space="md">
            <HStack space="sm" className="items-start">
                <IconSymbol name="questionmark.circle.fill" size={14} color={primaryColor} />
                <Text className="text-sm font-medium leading-5 flex-1" style={{ color: subtextColor }}>
                    Ask route questions and discuss pickup points.
                </Text>
            </HStack>
            <HStack space="sm" className="items-start">
                <IconSymbol name="clock.fill" size={14} color={primaryColor} />
                <Text className="text-sm font-medium leading-5 flex-1" style={{ color: subtextColor }}>
                    Share timing updates and traffic alerts.
                </Text>
            </HStack>
            <HStack space="sm" className="items-start">
                <IconSymbol name="hand.raised.fill" size={14} color={primaryColor} />
                <Text className="text-sm font-medium leading-5 flex-1" style={{ color: subtextColor }}>
                    Post safety notes for other riders.
                </Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}
