import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { ActionRow } from '@/features/profile/components/profile-tab/ActionRow';

type ProfileActionsCardProps = {
  cardColor: string;
  dangerColor: string;
  onEditProfile: () => void;
  onNotifications: () => void;
  onSignOut: () => void;
  primaryColor: string;
  subtextColor: string;
  textColor: string;
  hasProfile: boolean;
};

export function ProfileActionsCard({
  cardColor,
  dangerColor,
  hasProfile,
  onEditProfile,
  onNotifications,
  onSignOut,
  primaryColor,
  subtextColor,
  textColor,
}: ProfileActionsCardProps) {
  return (
    <Box className="mx-6 rounded-[32px] p-4 shadow-sm border" style={{ backgroundColor: cardColor }}>
      <Text className="text-[10px] font-extrabold uppercase tracking-widest mt-2 ml-4 mb-2" style={{ color: subtextColor }}>
        Actions
      </Text>
      <ActionRow
        icon="pencil"
        label={!hasProfile ? 'Complete Profile' : 'Edit Profile Information'}
        iconColor={primaryColor}
        iconBackground={`${primaryColor}10`}
        textColor={textColor}
        chevronColor={subtextColor}
        onPress={onEditProfile}
      />
      <ActionRow
        icon="bell.fill"
        label="Notification Preferences"
        iconColor="#F87171"
        iconBackground="#F8717110"
        textColor={textColor}
        chevronColor={subtextColor}
        onPress={onNotifications}
      />
      <ActionRow
        icon="rectangle.portrait.and.arrow.right"
        label="Sign Out"
        iconColor={dangerColor}
        iconBackground={`${dangerColor}10`}
        textColor={dangerColor}
        chevronColor={subtextColor}
        onPress={onSignOut}
        showDivider={false}
      />
    </Box>
  );
}
