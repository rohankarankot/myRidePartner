import React from 'react';
import { StyleSheet } from 'react-native';
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
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: selectedCity ? `${selectedCity} Room` : 'Community Room',
          headerShown: true,
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      <VStack className="p-5" space="md">
        <Box
          className="rounded-3xl border items-center p-[18px]"
          style={{ backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}20` }}
        >
          <Box
            className="h-12 w-12 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: primaryColor }}
          >
            <IconSymbol name="message.fill" size={22} color="#FFFFFF" />
          </Box>
          <Text className="text-xl font-bold text-center mb-1" style={{ color: textColor }}>
            {selectedCity ? `${selectedCity} Room` : 'Community Room'}
          </Text>
          <Text className="text-sm leading-5 text-center" style={{ color: subtextColor }}>
            Keep the conversation local, helpful, and ride-related so people in this city
            actually benefit from it.
          </Text>
        </Box>

        <HStack space="md">
          <Box className="flex-1 rounded-2xl border py-4 items-center" style={{ backgroundColor: cardColor, borderColor }}>
            <Text className="text-lg font-bold mb-1" style={{ color: textColor }}>
              {roomMembersMeta?.meta.pagination.total ?? 0}
            </Text>
            <Text className="text-sm" style={{ color: subtextColor }}>
              members
            </Text>
          </Box>
          <Box className="flex-1 rounded-2xl border py-4 items-center" style={{ backgroundColor: cardColor, borderColor }}>
            <Text className="text-lg font-bold mb-1" style={{ color: textColor }}>
              Local
            </Text>
            <Text className="text-sm" style={{ color: subtextColor }}>
              conversation
            </Text>
          </Box>
        </HStack>

        <Button
          className="rounded-[18px]"
          onPress={() =>
            router.push({
              pathname: '/community-members',
              params: selectedCity ? { city: selectedCity } : undefined,
            })
          }
        >
          <IconSymbol name="person.2.fill" size={18} color="#FFFFFF" />
          <ButtonText>View room members</ButtonText>
        </Button>

        <Button
          variant="outline"
          className="rounded-[18px]"
          style={{ borderColor, backgroundColor: cardColor }}
          onPress={() =>
            router.push({
              pathname: '/community-chat',
              params: selectedCity ? { city: selectedCity } : undefined,
            })
          }
        >
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={18} color={primaryColor} />
          <ButtonText style={{ color: textColor }}>Back to chat room</ButtonText>
        </Button>

        <Box className="rounded-2xl border p-4" style={{ backgroundColor: cardColor, borderColor }}>
          <Text className="text-base font-bold mb-2" style={{ color: textColor }}>
            What to share here
          </Text>
          <Text className="text-sm leading-5" style={{ color: subtextColor }}>
            Ask route questions, discuss pickup points, share timing updates, and post
            safety notes that help riders around {selectedCity || 'your city'}.
          </Text>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
