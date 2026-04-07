import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
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
      className="rounded-3xl border p-4"
      style={{ borderColor }}
      onPress={onPress}
    >
      <HStack className="items-center" space="md">
        <Box
          className="h-[46px] w-[46px] rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}14` }}
        >
          <IconSymbol name={icon as any} size={22} color={primaryColor} />
        </Box>

        <VStack className="flex-1" space="xs">
          <Text className="text-base font-bold" style={{ color: textColor }}>
            {title}
          </Text>
          <Text className="text-sm leading-5" style={{ color: subtextColor }}>
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
      style={[styles.safe, { backgroundColor }]}
      edges={['left', 'right', 'bottom']}
    >
      <VStack className="p-5" space="md">
        <Box
          className="rounded-[24px] border p-[18px]"
          style={{ backgroundColor: cardColor, borderColor }}
        >
          <HStack className="items-center" space="md">
            <VStack className="flex-1" space="sm">
              <HStack
                className="self-start items-center rounded-full px-3 py-2"
                space="xs"
                style={{ backgroundColor: `${primaryColor}14` }}
              >
                <IconSymbol
                  name="bubble.left.and.bubble.right.fill"
                  size={14}
                  color={primaryColor}
                />
                <Text className="text-xs font-bold" style={{ color: primaryColor }}>
                  City community
                </Text>
              </HStack>

              <Text className="text-2xl font-extrabold" style={{ color: textColor }}>
                Travellers Community
              </Text>

              <Text className="text-sm leading-6" style={{ color: subtextColor }}>
                Talk routes, connect with nearby riders, and keep local travel
                conversations in one place.
              </Text>
            </VStack>

            <Box
              className="h-14 w-14 rounded-[18px] items-center justify-center"
              style={{ backgroundColor: `${primaryColor}12` }}
            >
              <IconSymbol name="person.2.fill" size={28} color={primaryColor} />
            </Box>
          </HStack>
        </Box>

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
          title="Members"
          subtitle="Browse all users who are part of the public community."
          primaryColor={primaryColor}
          subtextColor={subtextColor}
          textColor={textColor}
          borderColor={borderColor}
          onPress={() => router.push('/community-members')}
        />
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
