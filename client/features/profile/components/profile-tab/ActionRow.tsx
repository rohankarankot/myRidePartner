import React from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type ActionRowProps = {
  chevronColor: string;
  icon: string;
  iconBackground: string;
  iconColor: string;
  label: string;
  onPress: () => void;
  showDivider?: boolean;
  textColor: string;
};

export function ActionRow({
  chevronColor,
  icon,
  iconBackground,
  iconColor,
  label,
  onPress,
  showDivider = true,
  textColor,
}: ActionRowProps) {
  const borderColor = useThemeColor({}, 'border');

  return (
    <VStack>
      <Pressable className="py-4 px-2" onPress={onPress}>
        <HStack className="items-center justify-between">
          <HStack space="md" className="items-center">
            <Box
              className="h-10 w-10 rounded-2xl items-center justify-center shadow-sm"
              style={{ backgroundColor: iconBackground }}
            >
              <IconSymbol name={icon as any} size={18} color={iconColor} />
            </Box>
            <Text className="text-base font-bold" style={{ color: textColor }}>
              {label}
            </Text>
          </HStack>
          <IconSymbol name="chevron.right" size={16} color={chevronColor} />
        </HStack>
      </Pressable>
      {showDivider ? <Divider className="mx-2" style={{ backgroundColor: borderColor }} /> : null}
    </VStack>
  );
}
