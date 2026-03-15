import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { tripService } from '@/services/trip-service';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { LocationSearchModal } from '@/components/LocationSearchModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/user-store';
import { useFocusEffect } from 'expo-router';
import { CustomAlert } from '@/components/CustomAlert';

const FormField = ({ label, placeholder, icon, value, onChangeText, keyboardType = 'default', editable = true, onPress }: {
    label: string,
    placeholder: string,
    icon: any,
    value: string,
    onChangeText?: (text: string) => void,
    keyboardType?: 'default' | 'numeric',
    editable?: boolean,
    onPress?: () => void
}) => {
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const borderColor = useThemeColor({}, 'border');

    return (
        <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            <TouchableOpacity
                activeOpacity={onPress ? 0.7 : 1}
                onPress={onPress}
                style={[styles.inputContainer, { borderColor }]}
            >
                <IconSymbol name={icon} size={18} color={subtextColor} />
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={subtextColor}
                    style={[styles.input, { color: textColor }]}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    editable={editable && !onPress}
                    pointerEvents={onPress ? 'none' : 'auto'}
                />
            </TouchableOpacity>
        </View>
    );
};

export default function CreateScreen() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [seats, setSeats] = useState('');
    const [price, setPrice] = useState('');
    const [isPriceCalculated, setIsPriceCalculated] = useState(true);
    const [genderPreference, setGenderPreference] = useState<'men' | 'women' | 'both'>('both');
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [showProfileAlert, setShowProfileAlert] = useState(false);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(Platform.OS === 'ios');
        setTime(currentTime);
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { profile } = useUserStore();

    const isProfileIncomplete = !profile || !profile.fullName || !profile.phoneNumber || !profile.gender;

    useFocusEffect(
        React.useCallback(() => {
            if (isProfileIncomplete) {
                setShowProfileAlert(true);
            }
        }, [isProfileIncomplete])
    );

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    const publishMutation = useMutation({
        mutationFn: (tripData: any) => tripService.createTrip(tripData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips', user?.id] });
            Toast.show({
                type: 'success',
                text1: 'Ride Published! 🚗',
                text2: 'Your ride has been successfully published.'
            });

            setTimeout(() => {
                router.push('/(tabs)/activity');
            }, 1000);

            resetForm();
        },
        onError: (error) => {
            console.error('Publish error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to publish ride. Please try again.'
            });
        }
    });

    const handlePublish = async () => {
        if (!from || !to || !seats || (!isPriceCalculated && !price)) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all the details to publish your ride.'
            });
            return;
        }

        if (Number(seats) > 4) {
            Toast.show({
                type: 'error',
                text1: 'Too many seats',
                text2: 'You can only publish a ride with up to 4 seats.'
            });
            return;
        }

        if (isProfileIncomplete) {
            Toast.show({
                type: 'error',
                text1: 'Profile Incomplete',
                text2: 'Please update your profile details to publish a ride.'
            });
            router.push('/(tabs)/profile');
            return;
        }

        if (!user) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'You must be logged in to publish a ride.'
            });
            return;
        }

        publishMutation.mutate({
            startingPoint: from,
            destination: to,
            date: formatDate(date),
            time: formatTime(time),
            availableSeats: parseInt(seats),
            pricePerSeat: isPriceCalculated ? undefined : parseFloat(price),
            isPriceCalculated: isPriceCalculated,
            genderPreference: genderPreference,
            creator: user.id
        });
    };

    const resetForm = () => {
        setFrom('');
        setTo('');
        setDate(new Date());
        setTime(new Date());
        setSeats('');
        setPrice('');
        setIsPriceCalculated(false);
        setGenderPreference('both');
    };

    return (
        <>
            <LocationSearchModal
                visible={showFromPicker}
                onClose={() => setShowFromPicker(false)}
                onSelectLocation={(address: string) => setFrom(address)}
                title="Select Starting Point"
            />
            <LocationSearchModal
                visible={showToPicker}
                onClose={() => setShowToPicker(false)}
                onSelectLocation={(address: string) => setTo(address)}
                title="Select Destination"
            />
            <CustomAlert
                visible={showProfileAlert}
                title="Complete Your Profile"
                message="You need to provide your Name, Phone Number, and Gender before you can publish a ride."
                primaryButton={{
                    text: "Go to Profile",
                    onPress: () => {
                        setShowProfileAlert(false);
                        router.push('/(tabs)/profile');
                    }
                }}

                onClose={() => setShowProfileAlert(false)}
                icon="person.crop.circle.badge.exclamationmark"
                dismissible={false}
            />
            <View style={[styles.safe, { backgroundColor }]} >
                <ScrollView contentContainerStyle={styles.container}>

                    <View style={[styles.card, { backgroundColor: cardColor }]}>
                        <FormField
                            label="Starting Point"
                            placeholder="Search pickup location..."
                            icon="house.fill"
                            value={from}
                            onPress={() => setShowFromPicker(true)}
                        />
                        <FormField
                            label="Destination"
                            placeholder="Search drop location..."
                            icon="location.fill"
                            value={to}
                            onPress={() => setShowToPicker(true)}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <FormField
                                    label="Date"
                                    placeholder="Select Date"
                                    icon="calendar"
                                    value={formatDate(date)}
                                    onPress={() => setShowDatePicker(true)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormField
                                    label="Time"
                                    placeholder="Select Time"
                                    icon="clock.fill"
                                    value={formatTime(time)}
                                    onPress={() => setShowTimePicker(true)}
                                />
                            </View>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onTimeChange}
                            />
                        )}

                        <FormField
                            label="Available Seats"
                            placeholder="Max 4"
                            icon="person.fill"
                            value={seats}
                            onChangeText={setSeats}
                            keyboardType="numeric"
                        />

                        <View style={styles.fieldContainer}>
                            <View style={styles.switchRow}>
                                <Text style={[styles.label, { color: textColor, marginBottom: 0, flex: 1 }]}>
                                    Calculate price on completion
                                </Text>
                                <Switch
                                    value={isPriceCalculated}
                                    onValueChange={setIsPriceCalculated}
                                    trackColor={{ false: borderColor, true: primaryColor }}
                                />
                            </View>
                            {!isPriceCalculated && (
                                <View style={{ marginTop: 10 }}>
                                    <FormField
                                        label="Price per Seat (₹)"
                                        placeholder="e.g. 200"
                                        icon="indianrupeesign.circle.fill"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: textColor }]}>Gender Preference</Text>
                            <View style={styles.genderRow}>
                                {(['men', 'women', 'both'] as const).map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.genderButton,
                                            { borderColor },
                                            genderPreference === option && { backgroundColor: primaryColor, borderColor: primaryColor }
                                        ]}
                                        onPress={() => setGenderPreference(option)}
                                    >
                                        <Text
                                            style={[
                                                styles.genderButtonText,
                                                { color: textColor },
                                                genderPreference === option && { color: '#fff' }
                                            ]}
                                        >
                                            {option === 'men' ? 'Only Men' : option === 'women' ? 'Only Women' : 'Both'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.publishButton, { backgroundColor: primaryColor, opacity: publishMutation.isPending ? 0.7 : 1 }]}
                        onPress={handlePublish}
                        disabled={publishMutation.isPending}
                    >
                        {publishMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.publishButtonText}>Create Trip</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={[styles.disclaimer, { color: subtextColor }]}>
                        By publishing, you agree to share the ride cost fairly with co-passengers.
                    </Text>
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: 20,
    },
    container: {
        paddingRight: 20,
        paddingLeft: 20,
        paddingBottom: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    card: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
    },
    row: {
        flexDirection: 'row',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 8,
    },
    genderButton: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        paddingVertical: 10,
        justifyContent: 'center',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    genderButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    publishButton: {
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    publishButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    disclaimer: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 12,
        paddingHorizontal: 20,
        lineHeight: 18,
    }
});
