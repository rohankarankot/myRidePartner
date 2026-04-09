import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { VStack } from '@/components/ui/vstack';
import {
  CommunityActionCard,
  CommunityHeroCard,
} from '@/features/chats/components/community-tab';
import { useCommunityTabScreen } from '@/features/chats/hooks/use-community-tab-screen';

export default function CommunityTabScreen() {
  const { isLoading, router, totalMembers } = useCommunityTabScreen();

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
        <CommunityHeroCard
          borderColor={borderColor}
          cardColor={cardColor}
          isLoading={isLoading}
          primaryColor={primaryColor}
          subtextColor={subtextColor}
          textColor={textColor}
          totalMembers={totalMembers}
        />

        <VStack space="xs">
          <CommunityActionCard
            icon="message.fill"
            title="Open chat room"
            subtitle="Join the live public conversation in a dedicated chat screen."
            cardColor={cardColor}
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
            cardColor={cardColor}
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
