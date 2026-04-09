import React from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type SettingItemProps = {
  danger?: boolean;
  icon: string;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showDivider?: boolean;
};

export function SettingItem({
  danger = false,
  icon,
  label,
  onPress,
  rightElement,
  showDivider = true,
}: SettingItemProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');
  const iconColor = danger ? dangerColor : textColor;
  const labelColor = danger ? dangerColor : textColor;

  return (
    <VStack>
      <Pressable className="py-4 px-2" onPress={onPress}>
        <HStack className="items-center justify-between">
          <HStack space="md" className="items-center">
            <Box className="w-8 h-8 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColor}10` }}>
              <IconSymbol name={icon as any} size={18} color={iconColor} />
            </Box>
            <Text className="text-base font-bold" style={{ color: labelColor }}>
              {label}
            </Text>
          </HStack>
          {rightElement || <IconSymbol name="chevron.right" size={16} color={subtextColor} />}
        </HStack>
      </Pressable>
      {showDivider ? <Divider style={{ backgroundColor: borderColor }} className="mx-2" /> : null}
    </VStack>
  );
}
