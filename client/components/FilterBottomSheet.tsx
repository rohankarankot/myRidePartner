import React, { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useThemeColor } from '@/hooks/use-theme-color';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface FilterBottomSheetProps {
    gender: string;
    setGender: (gender: string) => void;
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    onApply: () => void;
    onReset: () => void;
}

export const FilterBottomSheet = React.forwardRef<BottomSheetModal, FilterBottomSheetProps>(
    ({ gender, setGender, date, setDate, onApply, onReset }, ref) => {
        const backgroundColor = useThemeColor({}, 'card');
        const textColor = useThemeColor({}, 'text');
        const subtextColor = useThemeColor({}, 'subtext');
        const primaryColor = useThemeColor({}, 'primary');
        const borderColor = useThemeColor({}, 'border');

        const [showPicker, setShowPicker] = React.useState(false);

        const snapPoints = useMemo(() => ['50%'], []);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                />
            ),
            []
        );

        const onChangeDate = (event: any, selectedDate?: Date) => {
            if (Platform.OS === 'android') {
                setShowPicker(false);
                if (event.type === 'set' && selectedDate) {
                    setDate(selectedDate);
                }
            } else {
                if (selectedDate) setDate(selectedDate);
            }
        };

        return (
            <BottomSheetModal
                ref={ref}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor, borderRadius: 32 }}
                handleIndicatorStyle={{ backgroundColor: borderColor, width: 40 }}
            >
                <BottomSheetView>
                    <Box className="p-8 pb-10">
                        <HStack className="justify-between items-center mb-10">
                            <Text className="text-2xl font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                                Filter Rides
                            </Text>
                            <Pressable 
                                onPress={onReset}
                                className="px-4 py-2 rounded-xl bg-gray-50 border shadow-xs"
                                style={{ borderColor }}
                            >
                                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                                    Reset All
                                </Text>
                            </Pressable>
                        </HStack>

                        <VStack space="xl">
                            <VStack space="sm">
                                <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
                                    Gender Preference
                                </Text>
                                <HStack space="md">
                                    {['both', 'men', 'women'].map((option) => {
                                        const isActive = gender === option;
                                        return (
                                            <Pressable
                                                key={option}
                                                className="flex-1 h-12 rounded-2xl border-2 items-center justify-center shadow-sm"
                                                style={{ 
                                                    backgroundColor: isActive ? primaryColor : 'transparent',
                                                    borderColor: isActive ? primaryColor : borderColor
                                                }}
                                                onPress={() => setGender(option)}
                                            >
                                                <Text
                                                    className="text-[11px] font-extrabold uppercase tracking-tight"
                                                    style={{ color: isActive ? '#fff' : textColor }}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            </VStack>

                            <VStack space="sm">
                                <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
                                    Departure Date
                                </Text>
                                <Box className="w-full">
                                    {Platform.OS === 'android' ? (
                                        <>
                                            <Pressable
                                                className="h-14 rounded-2xl border-2 justify-center px-4 shadow-sm"
                                                style={{ borderColor, backgroundColor: 'transparent' }}
                                                onPress={() => setShowPicker(true)}
                                            >
                                                <HStack className="items-center" space="sm">
                                                    <IconSymbol name="calendar" size={18} color={primaryColor} />
                                                    <Text className="text-sm font-medium" style={{ color: date ? textColor : subtextColor }}>
                                                        {date ? format(date, 'MMM d, yyyy') : 'Pick a journey date'}
                                                    </Text>
                                                </HStack>
                                            </Pressable>
                                            {showPicker && (
                                                <DateTimePicker
                                                    value={date || new Date()}
                                                    mode="date"
                                                    display="default"
                                                    onChange={onChangeDate}
                                                    minimumDate={new Date()}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <Box className="items-start">
                                            <DateTimePicker
                                                value={date || new Date()}
                                                mode="date"
                                                display="default"
                                                onChange={onChangeDate}
                                                minimumDate={new Date()}
                                                textColor={textColor}
                                                themeVariant={useThemeColor({}, 'background') === '#000000' ? 'dark' : 'light'}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </VStack>

                            <Button 
                                className="h-14 rounded-2xl shadow-xl mt-4"
                                style={{ backgroundColor: primaryColor }}
                                onPress={onApply}
                            >
                                <ButtonText className="text-xs font-extrabold uppercase tracking-widest">Show matches</ButtonText>
                            </Button>
                        </VStack>
                    </Box>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);
