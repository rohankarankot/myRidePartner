import React from 'react';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type CommunityCitySheetHeaderProps = {
  borderColor: string;
  cardColor: string;
  citySearch: string;
  setCitySearch: (value: string) => void;
  subtextColor: string;
  textColor: string;
};

function CommunityCitySheetHeaderComponent({
  borderColor,
  cardColor,
  citySearch,
  setCitySearch,
  subtextColor,
  textColor,
}: CommunityCitySheetHeaderProps) {
  return (
    <VStack className="px-6 py-5" space="md">
      <VStack space="xs">
        <Text className="text-2xl font-extrabold" style={{ color: textColor }}>Select City</Text>
        <Text className="text-xs font-medium" style={{ color: subtextColor }}>
          Filter community members by city
        </Text>
      </VStack>
      <Box className="h-14 rounded-[24px] flex-row items-center px-4 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
        <IconSymbol name="magnifyingglass" size={16} color={subtextColor} />
        <BottomSheetTextInput
          placeholder="Search city..."
          placeholderTextColor={subtextColor}
          style={{ flex: 1, marginLeft: 12, fontSize: 15, color: textColor }}
          value={citySearch}
          onChangeText={setCitySearch}
          autoCorrect={false}
          autoCapitalize="words"
        />
      </Box>
    </VStack>
  );
}

export const CommunityCitySheetHeader = React.memo(CommunityCitySheetHeaderComponent);
