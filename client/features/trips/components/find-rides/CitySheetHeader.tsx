import React from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type CitySheetHeaderProps = {
  borderColor: string;
  cardColor: string;
  citySearch: string;
  onCitySearchChange: (value: string) => void;
  subtextColor: string;
  textColor: string;
};

function CitySheetHeaderComponent({
  borderColor,
  cardColor,
  citySearch,
  onCitySearchChange,
  subtextColor,
  textColor,
}: CitySheetHeaderProps) {
  return (
    <VStack className="px-6 py-5" space="md">
      <VStack space="xs">
        <Text className="text-2xl font-extrabold" style={{ color: textColor }}>
          Select City
        </Text>
        <Text className="text-xs font-medium" style={{ color: subtextColor }}>
          Choose your city to find nearby rides
        </Text>
      </VStack>

      <Box
        className="h-14 rounded-[24px] flex-row items-center px-4 border-2 shadow-sm"
        style={{ backgroundColor: cardColor, borderColor }}
      >
        <IconSymbol name="magnifyingglass" size={16} color={subtextColor} />
        <BottomSheetTextInput
          placeholder="Search your city..."
          placeholderTextColor={subtextColor}
          style={{ flex: 1, marginLeft: 12, color: textColor, fontSize: 15 }}
          value={citySearch}
          onChangeText={onCitySearchChange}
          autoCorrect={false}
          autoCapitalize="words"
        />
      </Box>
    </VStack>
  );
}

export const CitySheetHeader = React.memo(CitySheetHeaderComponent);
