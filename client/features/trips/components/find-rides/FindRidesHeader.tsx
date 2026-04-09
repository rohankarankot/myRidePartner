import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { format } from 'date-fns';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DiscoveryBannerAd } from '@/features/ads/components/discovery-banner-ad';

type FindRidesHeaderProps = {
  cardColor: string;
  date?: Date;
  fromSearch: string;
  hasActiveRouteSearch: boolean;
  onFromSearchChange: (value: string) => void;
  onToSearchChange: (value: string) => void;
  primaryColor: string;
  searchInputRef: React.RefObject<RNTextInput | null>;
  selectedCity: string;
  subtextColor: string;
  textColor: string;
  toSearch: string;
  borderColor: string;
};

export function FindRidesHeader({
  borderColor,
  cardColor,
  date,
  fromSearch,
  hasActiveRouteSearch,
  onFromSearchChange,
  onToSearchChange,
  primaryColor,
  searchInputRef,
  selectedCity,
  subtextColor,
  textColor,
  toSearch,
}: FindRidesHeaderProps) {
  return (
    <VStack className="pb-4" space="lg">
      <VStack space="xs">
        <Text className="text-lg font-extrabold" style={{ color: textColor }}>
          {hasActiveRouteSearch ? `Matching routes in ${selectedCity}` : date ? `Rides in ${selectedCity}` : 'Nearby Rides'}
        </Text>
        <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
          {hasActiveRouteSearch
            ? 'Published rides matching your route search'
            : date
              ? format(date, 'MMM d, yyyy')
              : `Upcoming in ${selectedCity || 'your city'}`}
        </Text>
      </VStack>

      <VStack space="md">
        <Box className="h-14 rounded-2xl flex-row items-center px-4 border" style={{ backgroundColor: cardColor, borderColor }}>
          <IconSymbol name="location.fill" size={18} color={primaryColor} />
          <RNTextInput
            ref={searchInputRef}
            placeholder="From"
            placeholderTextColor={subtextColor}
            style={{ flex: 1, marginLeft: 10, color: textColor, fontSize: 16 }}
            value={fromSearch}
            onChangeText={onFromSearchChange}
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </Box>

        <Box className="h-14 rounded-2xl flex-row items-center px-4 border" style={{ backgroundColor: cardColor, borderColor }}>
          <IconSymbol name="mappin.and.ellipse" size={18} color="#10B981" />
          <RNTextInput
            placeholder="To"
            placeholderTextColor={subtextColor}
            style={{ flex: 1, marginLeft: 10, color: textColor, fontSize: 16 }}
            value={toSearch}
            onChangeText={onToSearchChange}
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="search"
          />
        </Box>
      </VStack>

      <DiscoveryBannerAd />
    </VStack>
  );
}
