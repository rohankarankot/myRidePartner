import React from 'react';
import { GenderPreference } from '@/types/api';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatDisplayDate } from '@/features/trips/utils/find-rides';

type TripCardProps = {
  avatarUrl?: string;
  captainName?: string;
  date: string;
  documentId: string;
  from: string;
  genderPreference: GenderPreference;
  isCalculated: boolean;
  onPress: (id: string) => void;
  price?: string;
  status: string;
  time: string;
  to: string;
};

export function TripCard({
  avatarUrl,
  captainName,
  date,
  documentId,
  from,
  genderPreference,
  isCalculated,
  onPress,
  price,
  status,
  time,
  to,
}: TripCardProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const genderPalette =
    genderPreference === 'both'
      ? { bg: `${subtextColor}10`, icon: 'person.2.fill' as const, text: subtextColor }
      : genderPreference === 'men'
        ? { bg: '#EBF5FF', icon: 'person.fill' as const, text: '#3B82F6' }
        : { bg: '#FFF1F2', icon: 'person.fill' as const, text: '#F43F5E' };

  return (
    <Pressable
      className="rounded-[32px] p-5 mb-4 shadow-sm border"
      style={{ backgroundColor: cardColor, borderColor }}
      onPress={() => onPress(documentId)}
    >
      <HStack className="items-center justify-between mb-4">
        <HStack className="flex-1 items-center" space="md">
          <Avatar size="md" className="border shadow-sm" style={{ borderColor }}>
            <AvatarFallbackText>{captainName || 'Captain'}</AvatarFallbackText>
            {avatarUrl ? <AvatarImage source={{ uri: avatarUrl }} alt={captainName || 'Captain'} /> : null}
          </Avatar>
          <VStack className="flex-1" space="xs">
            <Text className="text-base font-bold" style={{ color: textColor }}>
              {captainName || 'Captain'}
            </Text>
            <Text className="text-xs font-medium" style={{ color: subtextColor }}>
              {formatDisplayDate(date)} • {time}
            </Text>
          </VStack>
        </HStack>

        <Box className="h-6 rounded-full px-3 flex-row items-center" style={{ backgroundColor: genderPalette.bg }}>
          <IconSymbol name={genderPalette.icon} size={10} color={genderPalette.text} />
          <Text className="text-[10px] font-bold ml-1 uppercase" style={{ color: genderPalette.text }}>
            {genderPreference === 'both' ? 'All' : genderPreference}
          </Text>
        </Box>
      </HStack>

      <HStack className="items-start mb-5" space="md">
        <VStack className="items-center pt-1" space="xs">
          <Box className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
          <Box className="w-0.5 h-10" style={{ backgroundColor: borderColor }} />
          <Box className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
        </VStack>
        <VStack className="flex-1 justify-between py-1">
          <Text className="text-sm font-bold" style={{ color: textColor }} numberOfLines={2}>
            {from}
          </Text>
          <Text className="text-sm font-bold" style={{ color: textColor }} numberOfLines={2}>
            {to}
          </Text>
        </VStack>
      </HStack>

      <Divider className="mb-4" style={{ backgroundColor: borderColor }} />

      <HStack className="items-center justify-between">
        <HStack className="items-center" space="xs">
          <IconSymbol name="car.fill" size={14} color={subtextColor} />
          <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
            {status}
          </Text>
        </HStack>
        <Text className="font-extrabold" style={{ color: primaryColor, fontSize: isCalculated ? 12 : 18 }}>
          {isCalculated ? 'CALCULATED ON DEMAND' : `₹${price}`}
        </Text>
      </HStack>
    </Pressable>
  );
}
