import React from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

type CommunityActionCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  primaryColor: string;
  subtextColor: string;
  textColor: string;
  borderColor: string;
  onPress: () => void;
};

function CommunityActionCard({
  icon,
  title,
  subtitle,
  primaryColor,
  subtextColor,
  textColor,
  borderColor,
  onPress,
}: CommunityActionCardProps) {
  return (
    <Pressable
      className="rounded-[28px] border p-5 mb-4 shadow-sm"
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

export default function CommunityTabScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor }}
      edges={['left', 'right', 'bottom']}
    >
      <VStack className="p-6" space="xl">
        <Box
          className="rounded-[32px] border p-8 shadow-sm overflow-hidden"
          style={{ backgroundColor: cardColor, borderColor }}
        >
            <VStack space="lg">
              <HStack
                className="self-start items-center rounded-full px-3 py-1.5 border"
                space="xs"
                style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}
              >
                <IconSymbol
                  name="bubble.left.and.bubble.right.fill"
                  size={12}
                  color={primaryColor}
                />
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                  City community
                </Text>
              </HStack>

              <VStack space="sm">
                <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
                    Travellers Community
                </Text>
                <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
                    Talk routes, connect with nearby riders, and keep local travel
                    conversations in one place.
                </Text>
              </VStack>
              
              <HStack className="items-center" space="md">
                  <Box className="flex-row -space-x-4">
                      {[1,2,3].map(i => (
                          <Box key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden" style={{ borderColor: cardColor }}>
                              <Box className="w-full h-full bg-gray-200" />
                          </Box>
                      ))}
                  </Box>
                  <Text className="text-xs font-bold" style={{ color: primaryColor }}>+ 500 members active</Text>
              </HStack>
            </VStack>
        </Box>

        <VStack space="xs">
            <CommunityActionCard
                icon="message.fill"
                title="Open chat room"
                subtitle="Join the live public conversation in a dedicated chat screen."
                primaryColor={primaryColor}
                subtextColor={subtextColor}
                textColor={textColor}
                borderColor={borderColor}
                onPress={() => router.push('/community-chat')}
            />

            <CommunityActionCard
                icon="person.2.fill"
                title="Browse Members"
                subtitle="See all users who are part of the public community."
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
