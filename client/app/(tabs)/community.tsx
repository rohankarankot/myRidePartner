import React from 'react';
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLoader } from '@/components/app-loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  CommunityActionCard,
  CommunityHeroCard,
} from '@/features/chats/components/community-tab';
import { useCommunityTabScreen } from '@/features/chats/hooks/use-community-tab-screen';

export default function CommunityTabScreen() {
  const {
    isLoading,
    isCheckingConsent,
    isSavingConsent,
    showConsentPrompt,
    handleAcceptConsent,
    handleDeclineConsent,
    router,
    totalMembers,
  } = useCommunityTabScreen();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = '#18A957';
  const overlayColor = 'rgba(7, 10, 18, 0.56)';

  if (isCheckingConsent) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor }}
        edges={['left', 'right', 'bottom']}
      >
        <AppLoader message="Checking community access" />
      </SafeAreaView>
    );
  }

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

      <Modal visible={showConsentPrompt} transparent animationType="fade">
        <Box className="flex-1 justify-end px-5 pb-6" style={{ backgroundColor: overlayColor }}>
          <Box
            className="rounded-[34px] border px-6 pb-6 pt-5 shadow-2xl"
            style={{ backgroundColor: cardColor, borderColor: `${primaryColor}25` }}
          >
            <HStack className="items-center justify-between mb-5">
              <Box
                className="h-16 w-16 rounded-[24px] items-center justify-center"
                style={{ backgroundColor: `${primaryColor}12` }}
              >
                <IconSymbol name="person.2.fill" size={28} color={primaryColor} />
              </Box>
              <Box
                className="rounded-full px-3 py-2 border"
                style={{ backgroundColor: `${successColor}12`, borderColor: `${successColor}25` }}
              >
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: successColor }}>
                  Safe Preview
                </Text>
              </Box>
            </HStack>

            <VStack space="sm">
              <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
                Join the Community
              </Text>
              <Text className="text-sm leading-6 font-medium" style={{ color: subtextColor }}>
                This is an open community space. Before we show it, please confirm that you are comfortable being visible there.
              </Text>
            </VStack>

            <VStack className="mt-5 rounded-[28px] border p-4" space="md" style={{ borderColor, backgroundColor: backgroundColor }}>
              <HStack className="items-start" space="md">
                <Box className="h-9 w-9 rounded-full items-center justify-center" style={{ backgroundColor: `${primaryColor}14` }}>
                  <IconSymbol name="person.fill" size={16} color={primaryColor} />
                </Box>
                <VStack className="flex-1" space="xs">
                  <Text className="text-sm font-bold" style={{ color: textColor }}>
                    What others can see
                  </Text>
                  <Text className="text-xs leading-5 font-medium" style={{ color: subtextColor }}>
                    Only your name and the city you live in will be shown in the community.
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-start" space="md">
                <Box className="h-9 w-9 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(220, 38, 38, 0.10)' }}>
                  <IconSymbol name="phone.fill" size={15} color="#DC2626" />
                </Box>
                <VStack className="flex-1" space="xs">
                  <Text className="text-sm font-bold" style={{ color: textColor }}>
                    What stays private
                  </Text>
                  <Text className="text-xs leading-5 font-medium" style={{ color: subtextColor }}>
                    Your mobile number is not shown on this screen.
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-start" space="md">
                <Box className="h-9 w-9 rounded-full items-center justify-center" style={{ backgroundColor: `${successColor}12` }}>
                  <IconSymbol name="message.fill" size={15} color={successColor} />
                </Box>
                <VStack className="flex-1" space="xs">
                  <Text className="text-sm font-bold" style={{ color: textColor }}>
                    Community interaction
                  </Text>
                  <Text className="text-xs leading-5 font-medium" style={{ color: subtextColor }}>
                    Other users can message you inside the community if you choose to join.
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <Text className="text-xs leading-5 font-medium mt-5" style={{ color: subtextColor }}>
              Your choice will be saved so we do not ask again on every visit.
            </Text>

            <VStack className="mt-6" space="sm">
              <Pressable
                className="h-14 rounded-[22px] items-center justify-center"
                style={{ backgroundColor: primaryColor, opacity: isSavingConsent ? 0.7 : 1 }}
                onPress={() => {
                  if (!isSavingConsent) {
                    void handleAcceptConsent();
                  }
                }}
              >
                <Text className="text-sm font-extrabold uppercase tracking-widest text-white">
                  {isSavingConsent ? 'Saving Consent...' : 'Continue To Community'}
                </Text>
              </Pressable>

              <Pressable
                className="h-14 rounded-[22px] border items-center justify-center"
                style={{ borderColor }}
                onPress={handleDeclineConsent}
              >
                <Text className="text-sm font-bold" style={{ color: textColor }}>
                  Not Now
                </Text>
              </Pressable>
            </VStack>
          </Box>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}
