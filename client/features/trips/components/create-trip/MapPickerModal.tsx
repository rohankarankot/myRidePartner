import React from 'react';
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spinner } from '@/components/ui/spinner';
import { OlaMapView } from '@/features/trips/components/create-trip/OlaMapView';
import type { LocationCoordinate } from '@/features/trips/types/location';

type MapPickerModalProps = {
  backgroundColor: string;
  borderColor: string;
  cardColor: string;
  confirmLabel: string;
  fromCoordinate?: LocationCoordinate | null;
  isResolvingSelection: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSelectCoordinate: (coordinate: LocationCoordinate) => void;
  primaryColor: string;
  selectedCoordinate?: LocationCoordinate | null;
  textColor: string;
  title: string;
  toCoordinate?: LocationCoordinate | null;
  visible: boolean;
};

export function MapPickerModal({
  backgroundColor,
  borderColor,
  cardColor,
  confirmLabel,
  fromCoordinate,
  isResolvingSelection,
  onClose,
  onConfirm,
  onSelectCoordinate,
  primaryColor,
  selectedCoordinate,
  textColor,
  title,
  toCoordinate,
  visible,
}: MapPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Box className="flex-1" style={{ backgroundColor }}>
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <VStack className="flex-1 px-6 pt-4 pb-6" space="lg">
            <HStack className="items-center justify-between">
              <Pressable
                onPress={onClose}
                className="h-10 w-10 items-center justify-center rounded-full border"
                style={{ borderColor, backgroundColor: cardColor }}
              >
                <IconSymbol name="xmark" size={20} color={textColor} />
              </Pressable>
              <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                {title}
              </Text>
              <Box className="w-10" />
            </HStack>

            <VStack space="xs">
              <Text className="text-2xl font-extrabold" style={{ color: textColor }}>
                Tap the map to place your point
              </Text>
              <Text className="text-sm leading-6" style={{ color: textColor }}>
                We&apos;ll reverse-geocode the selected spot and use it in your trip form.
              </Text>
            </VStack>

            <OlaMapView
              borderColor={borderColor}
              fromCoordinate={fromCoordinate}
              height={420}
              interactive
              onMapPress={onSelectCoordinate}
              primaryColor={primaryColor}
              textColor={textColor}
              toCoordinate={toCoordinate}
            />

            {selectedCoordinate ? (
              <Box className="rounded-[24px] border px-4 py-4" style={{ borderColor, backgroundColor: cardColor }}>
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                  Selected Coordinates
                </Text>
                <Text className="mt-2 text-sm font-semibold" style={{ color: textColor }}>
                  {selectedCoordinate.latitude.toFixed(5)}, {selectedCoordinate.longitude.toFixed(5)}
                </Text>
              </Box>
            ) : null}

            <Button
              className="h-14 rounded-2xl"
              style={{ backgroundColor: primaryColor, opacity: !selectedCoordinate || isResolvingSelection ? 0.7 : 1 }}
              onPress={onConfirm}
              disabled={!selectedCoordinate || isResolvingSelection}
            >
              {isResolvingSelection ? (
                <Spinner color="#fff" />
              ) : (
                <ButtonText className="text-base font-extrabold uppercase tracking-widest text-white">
                  {confirmLabel}
                </ButtonText>
              )}
            </Button>
          </VStack>
        </SafeAreaView>
      </Box>
    </Modal>
  );
}
