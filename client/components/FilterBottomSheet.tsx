import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useThemeColor } from '@/hooks/use-theme-color';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

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
                backgroundStyle={{ backgroundColor }}
                handleIndicatorStyle={{ backgroundColor: borderColor }}
            >
                <BottomSheetView style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: textColor }]}>Filters</Text>
                        <TouchableOpacity onPress={onReset}>
                            <Text style={[styles.resetText, { color: primaryColor }]}>Reset All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: subtextColor }]}>GENDER PREFERENCE</Text>
                        <View style={styles.genderRow}>
                            {['both', 'men', 'women'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.genderButton,
                                        { borderColor },
                                        gender === option && { backgroundColor: primaryColor, borderColor: primaryColor },
                                    ]}
                                    onPress={() => setGender(option)}
                                >
                                    <Text
                                        style={[
                                            styles.genderButtonText,
                                            gender === option ? { color: '#fff' } : { color: textColor },
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: subtextColor }]}>DATE</Text>
                        <View style={styles.dateContainer}>
                            {Platform.OS === 'android' ? (
                                <>
                                    <TouchableOpacity
                                        style={[styles.dateButton, { borderColor }]}
                                        onPress={() => setShowPicker(true)}
                                    >
                                        <Text style={{ color: date ? textColor : subtextColor }}>
                                            {date ? format(date, 'MMM d, yyyy') : 'Select Date'}
                                        </Text>
                                    </TouchableOpacity>
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
                                <DateTimePicker
                                    value={date || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeDate}
                                    minimumDate={new Date()}
                                    themeVariant={useThemeColor({}, 'background') === '#000000' ? 'dark' : 'light'}
                                />
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.applyButton, { backgroundColor: primaryColor }]}
                        onPress={onApply}
                    >
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    content: {
        padding: 24,
        gap: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    resetText: {
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    genderRow: {
        flexDirection: 'row',
        gap: 10,
    },
    genderButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genderButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    dateButton: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        justifyContent: 'center',
        paddingHorizontal: 16,
        width: '100%',
    },
    applyButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
