import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type FindRidesEmptyStateProps = {
  date?: Date;
  gender: string;
  hasActiveRouteSearch: boolean;
  onClearFilters: () => void;
  onCreateRide: () => void;
  primaryColor: string;
  selectedCity: string;
  subtextColor: string;
  textColor: string;
};

export function FindRidesEmptyState({
  date,
  gender,
  hasActiveRouteSearch,
  onClearFilters,
  onCreateRide,
  primaryColor,
  selectedCity,
  subtextColor,
  textColor,
}: FindRidesEmptyStateProps) {
  const hasActiveFilters = gender !== 'both' || date !== undefined;

  return (
    <VStack className="items-center justify-center py-20 px-10" space="lg">
      <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3 shadow-xl">
        <IconSymbol name="car.fill" size={40} color={subtextColor} />
      </Box>

      <VStack space="xs">
        <Text className="text-3xl font-extrabold text-center" style={{ color: textColor }}>
          {selectedCity
            ? hasActiveRouteSearch
              ? `No matching routes in ${selectedCity}`
              : `No rides in ${selectedCity}`
            : 'Select a city'}
        </Text>
        <Text className="text-sm font-medium text-center leading-6" style={{ color: subtextColor }}>
          {hasActiveRouteSearch
            ? 'Try changing your start or destination search to discover more published rides.'
            : 'Be the first one to create a ride in this city and help others!'}
        </Text>
      </VStack>

      {selectedCity ? (
        <Button className="h-14 rounded-2xl w-full" style={{ backgroundColor: primaryColor }} onPress={onCreateRide}>
          <ButtonText className="text-white font-extrabold uppercase tracking-widest">Create a Ride</ButtonText>
        </Button>
      ) : null}

      {hasActiveFilters ? (
        <Pressable onPress={onClearFilters} className="mt-2">
          <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
            Clear Filters
          </Text>
        </Pressable>
      ) : null}
    </VStack>
  );
}
