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
  showRouteInputs: boolean;
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
  showRouteInputs,
  onFromSearchChange,
  onToSearchChange,
  primaryColor,
  searchInputRef,
  selectedCity,
  subtextColor,
  textColor,
  toSearch,
}: FindRidesHeaderProps) {
  const title = hasActiveRouteSearch
    ? `Matching routes in ${selectedCity}`
    : date
      ? `Rides in ${selectedCity}`
      : null;

  const subtitle = hasActiveRouteSearch
    ? 'Published rides matching your route search'
    : date
      ? format(date, 'MMM d, yyyy')
      : null;

  return (
    <VStack className="pb-4" space="lg">
      {title && subtitle ? (
        <VStack space="xs">
          <Text className="text-lg font-extrabold" style={{ color: textColor }}>
            {title}
          </Text>
          <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
            {subtitle}
          </Text>
        </VStack>
      ) : null}

      {showRouteInputs ? (
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
            <IconSymbol name="flag.checkered" size={18} color={primaryColor} />
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
      ) : null}

      <DiscoveryBannerAd />
    </VStack>
  );
}
