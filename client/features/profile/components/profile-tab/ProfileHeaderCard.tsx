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
  email?: string;
  hasProfile: boolean;
  initials: string;
  isGovernmentIdVerified: boolean;
  isUploadingAvatar: boolean;
  isVerified: boolean;
  isVerifyingGovernmentId: boolean;
  name: string;
  onCompleteProfile: () => void;
  onPickImage: () => void;
  onViewImage: () => void;
  onVerifyNow: () => void;
  primaryColor: string;
  profileCity?: string;
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
  email,
  hasProfile,
  initials,
  isGovernmentIdVerified,
  isUploadingAvatar,
  isVerified,
  isVerifyingGovernmentId,
  name,
  onCompleteProfile,
  onPickImage,
  onViewImage,
  onVerifyNow,
  primaryColor,
  profileCity,
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
        {profileCity ? (
          <HStack space="xs" className="items-center px-3 py-1 rounded-full border border-dashed" style={{ borderColor: primaryColor }}>
            <IconSymbol name="mappin.circle.fill" size={12} color={primaryColor} />
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
              {profileCity}
            </Text>
          </HStack>
        ) : (
          <Text className="text-sm font-medium" style={{ color: subtextColor }}>
            {email}
          </Text>
        )}
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
      ) : isVerified ? (
        <VStack className="items-center" space="sm">
          <Box className="rounded-full px-5 py-1.5 border shadow-sm" style={{ backgroundColor: successBgColor, borderColor: `${successColor}20` }}>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: successColor }}>
              Verified Account
            </Text>
          </Box>
          {isGovernmentIdVerified ? (
            <HStack
              space="xs"
              className="items-center rounded-full px-4 py-1.5 border shadow-sm"
              style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}
            >
              <IconSymbol name="checkmark.shield.fill" size={12} color={primaryColor} />
              <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                Government ID confirmed
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
            disabled={isVerifyingGovernmentId}
          >
            {isVerifyingGovernmentId ? (
              <HStack space="sm" className="items-center px-2">
                <Spinner size="small" color={primaryColor} />
                <Text className="text-xs font-bold uppercase tracking-tight" style={{ color: primaryColor }}>
                  Processing ID...
                </Text>
              </HStack>
            ) : (
              <Text className="text-xs font-bold uppercase tracking-tight" style={{ color: primaryColor }}>
                Verify Identity now?
              </Text>
            )}
          </Pressable>
        </VStack>
      )}
    </VStack>
  );
}
