import React from 'react';
import { JoinRequestStatus, GenderPreference, TripStatus } from '@/types/api';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type ActivityTripCardProps = {
  avatarUrl?: string;
  captainName?: string;
  date: string;
  documentId: string;
  from: string;
  genderPreference: GenderPreference;
  isPriceCalculated: boolean | null;
  onPress: (documentId: string) => void;
  pendingRequestsCount?: number;
  price?: number | null;
  status: TripStatus | JoinRequestStatus;
  to: string;
};

export function ActivityTripCard({
  avatarUrl,
  captainName,
  date,
  documentId,
  from,
  genderPreference,
  isPriceCalculated,
  onPress,
  pendingRequestsCount = 0,
  price,
  status,
  to,
}: ActivityTripCardProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const successColor = useThemeColor({}, 'success');
  const successBg = useThemeColor({}, 'successBg');
  const dangerColor = useThemeColor({}, 'danger');
  const dangerBg = useThemeColor({}, 'dangerBg');

  const getStatusStyle = () => {
    switch (status) {
      case 'APPROVED':
        return { bg: successBg, text: successColor };
      case 'PENDING':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'REJECTED':
      case 'CANCELLED':
        return { bg: dangerBg, text: dangerColor };
      case 'COMPLETED':
        return { bg: successBg, text: successColor };
      case 'STARTED':
        return { bg: `${primaryColor}15`, text: primaryColor };
      case 'PUBLISHED':
        return { bg: '#10B98115', text: '#10B981' };
      default:
        return { bg: borderColor, text: subtextColor };
    }
  };

  const statusStyle = getStatusStyle();
  const genderPalette =
    genderPreference === 'both'
      ? { bg: '#F3F4FB', text: '#6B7280', icon: 'person.2.fill' as const }
      : genderPreference === 'men'
        ? { bg: '#EBF5FF', text: '#3B82F6', icon: 'person.fill' as const }
        : { bg: '#FFF1F2', text: '#F43F5E', icon: 'person.fill' as const };

  return (
    <Pressable
      className="rounded-[32px] p-5 mb-4 border shadow-sm"
      style={{ backgroundColor: cardColor, borderColor }}
      onPress={() => onPress(documentId)}
    >
      <HStack className="items-start justify-between mb-6">
        <HStack className="flex-1 items-center" space="md">
          <Avatar size="md" className="border shadow-sm" style={{ borderColor }}>
            <AvatarFallbackText>{captainName || 'Captain'}</AvatarFallbackText>
            {avatarUrl ? <AvatarImage source={{ uri: avatarUrl }} alt={captainName || 'Captain'} /> : null}
          </Avatar>
          <VStack className="flex-1" space="xs">
            <Text className="text-base font-bold" style={{ color: textColor }}>
              {captainName || 'Captain'}
            </Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
              {date}
            </Text>
          </VStack>
        </HStack>

        <VStack className="items-end" space="xs">
          <Box className="rounded-full px-3 py-1 border shadow-sm" style={{ backgroundColor: statusStyle.bg, borderColor: `${statusStyle.text}20` }}>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: statusStyle.text }}>
              {status}
            </Text>
          </Box>
          {pendingRequestsCount > 0 ? (
            <Box className="rounded-full px-2 py-0.5 border shadow-sm" style={{ backgroundColor: primaryColor, borderColor: '#fff' }}>
              <Text className="text-[8px] font-extrabold uppercase tracking-widest text-white">
                {pendingRequestsCount} Pending
              </Text>
            </Box>
          ) : null}
        </VStack>
      </HStack>

      <HStack className="mb-6 items-start">
        <VStack className="items-center mr-4 pt-1">
          <Box className="h-2.5 w-2.5 rounded-full border-2" style={{ backgroundColor: primaryColor, borderColor: '#fff' }} />
          <Box className="w-1 flex-1 my-1 border-r border-dashed" style={{ borderColor }} />
          <Box className="h-2.5 w-2.5 rounded-full border-2" style={{ backgroundColor: '#10B981', borderColor: '#fff' }} />
        </VStack>

        <VStack className="flex-1 justify-between h-20">
          <Text className="text-sm font-bold" style={{ color: textColor }} numberOfLines={2}>
            {from}
          </Text>
          <Text className="text-sm font-bold" style={{ color: textColor }} numberOfLines={2}>
            {to}
          </Text>
        </VStack>

        <Box
          className="rounded-full px-3 py-1 ml-3 flex-row items-center border shadow-sm"
          style={{ backgroundColor: genderPalette.bg, borderColor: `${genderPalette.text}20` }}
        >
          <IconSymbol name={genderPalette.icon} size={10} color={genderPalette.text} />
          <Text className="text-[9px] font-extrabold uppercase tracking-widest ml-1.5" style={{ color: genderPalette.text }}>
            {genderPreference === 'both' ? 'All' : genderPreference === 'men' ? 'Men' : 'Women'}
          </Text>
        </Box>
      </HStack>

      <Divider style={{ backgroundColor: borderColor }} className="mb-4" />

      <HStack className="items-center justify-between">
        <Text className="font-extrabold" style={{ color: primaryColor, fontSize: isPriceCalculated ? 12 : 18 }}>
          {isPriceCalculated ? 'CALCULATED ON DEMAND' : `₹${price}`}
        </Text>
        <Box className="w-8 h-8 rounded-full items-center justify-center bg-gray-50 border shadow-sm" style={{ borderColor }}>
          <IconSymbol name="chevron.right" size={14} color={subtextColor} />
        </Box>
      </HStack>
    </Pressable>
  );
}
