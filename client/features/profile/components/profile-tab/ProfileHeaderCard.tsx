import React from 'react';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DUMMY_AVATAR } from '@/features/profile/utils/profile-screen';

type ProfileHeaderCardProps = {
  avatarUrl?: string;
  cardColor: string;
  dangerBgColor: string;
  dangerColor: string;
  hasProfile: boolean;
  initials: string;
  isOrganizationVerified: boolean;
  isOrganizationVerificationPending: boolean;
  isUploadingAvatar: boolean;
  isVerified: boolean;
  isVerifyingOrg: boolean;
  name: string;
  onCompleteProfile: () => void;
  onPickImage: () => void;
  onViewImage: () => void;
  onVerifyNow: () => void;
  primaryColor: string;
  successBgColor: string;
  successColor: string;
  subtextColor: string;
  textColor: string;
};

export function ProfileHeaderCard({
  avatarUrl,
  cardColor,
  dangerBgColor,
  dangerColor,
  hasProfile,
  initials,
  isOrganizationVerified,
  isOrganizationVerificationPending,
  isUploadingAvatar,
  isVerified,
  isVerifyingOrg,
  name,
  onCompleteProfile,
  onPickImage,
  onViewImage,
  onVerifyNow,
  primaryColor,
  successBgColor,
  successColor,
  subtextColor,
  textColor,
}: ProfileHeaderCardProps) {
  return (
    <VStack className="items-center py-10" space="lg">
      <Box className="relative">
        <Pressable onPress={onViewImage} disabled={isUploadingAvatar}>
          <Avatar size="2xl" className="border-4 shadow-xl" style={{ borderColor: cardColor }}>
            <AvatarFallbackText>{initials || 'MR'}</AvatarFallbackText>
            <AvatarImage
              source={avatarUrl ? { uri: avatarUrl } : { uri: DUMMY_AVATAR }}
              alt={name}
            />
          </Avatar>
        </Pressable>
        {isUploadingAvatar ? (
          <Box className="absolute inset-0 bg-black/40 rounded-full items-center justify-center">
            <Spinner color="#fff" size="small" />
          </Box>
        ) : (
          <Pressable
            onPress={onPickImage}
            className="absolute bottom-1 right-1 w-10 h-10 rounded-full border-4 items-center justify-center shadow-lg"
            style={{ backgroundColor: primaryColor, borderColor: cardColor }}
          >
            <IconSymbol name="camera.fill" size={16} color="#fff" />
          </Pressable>
        )}
      </Box>

      <VStack className="items-center" space="xs">
        <Text className="text-3xl font-extrabold text-center" style={{ color: textColor }}>
          {name}
        </Text>
      </VStack>

      {!hasProfile ? (
        <Pressable
          className="mt-2 rounded-2xl px-8 py-3 border shadow-sm"
          style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor }}
          onPress={onCompleteProfile}
        >
          <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
            Complete profile →
          </Text>
        </Pressable>
      ) : isOrganizationVerified ? (
        <VStack className="items-center" space="sm">
          <Box className="rounded-full px-5 py-1.5 border shadow-sm" style={{ backgroundColor: successBgColor, borderColor: `${successColor}20` }}>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: successColor }}>
              Workspace Verified
            </Text>
          </Box>
          <HStack
            space="xs"
            className="items-center rounded-full px-4 py-1.5 border shadow-sm"
            style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}
          >
            <IconSymbol name="briefcase.fill" size={12} color={primaryColor} />
            <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
              Workspace badge active
            </Text>
          </HStack>
        </VStack>
      ) : isVerified ? (
        <VStack className="items-center" space="sm">
          <Box className="rounded-full px-5 py-1.5 border shadow-sm" style={{ backgroundColor: successBgColor, borderColor: `${successColor}20` }}>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: successColor }}>
              Verified Account
            </Text>
          </Box>
          {isOrganizationVerificationPending ? (
            <HStack
              space="xs"
              className="items-center rounded-full px-4 py-1.5 border shadow-sm"
              style={{ backgroundColor: `${dangerColor}10`, borderColor: `${dangerColor}20` }}
            >
              <IconSymbol name="clock.fill" size={12} color={dangerColor} />
              <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>
                Workspace Verification Pending
              </Text>
            </HStack>
          ) : null}
        </VStack>
      ) : (
        <VStack className="items-center" space="md">
          <Box className="rounded-full px-5 py-1.5 border shadow-sm" style={{ backgroundColor: dangerBgColor, borderColor: `${dangerColor}20` }}>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>
              Unverified Status
            </Text>
          </Box>
          <Pressable
            className="px-6 py-2.5 rounded-2xl border-2 border-dashed"
            style={{ borderColor: primaryColor }}
            onPress={onVerifyNow}
            disabled={isVerifyingOrg}
          >
            {isVerifyingOrg ? (
              <HStack space="sm" className="items-center px-2">
                <Spinner size="small" color={primaryColor} />
                <Text className="text-xs font-bold uppercase tracking-tight" style={{ color: primaryColor }}>
                  Sending OTP...
                </Text>
              </HStack>
            ) : (
              <Text className="text-xs font-bold uppercase tracking-tight" style={{ color: primaryColor }}>
                {isOrganizationVerificationPending ? 'Continue Workspace Verification' : 'Verify Workspace now?'}
              </Text>
            )}
          </Pressable>
        </VStack>
      )}
    </VStack>
  );
}
