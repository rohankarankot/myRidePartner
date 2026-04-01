import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, Switch, KeyboardAvoidingView } from 'react-native';
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

type FormErrors = Partial<Record<'from' | 'to' | 'date' | 'time' | 'seats' | 'price' | 'description', string>>;

const getStartOfDay = (value: Date) => {
    const next = new Date(value);
    next.setHours(0, 0, 0, 0);
    return next;
};

const addDays = (value: Date, days: number) => {
    const next = new Date(value);
    next.setDate(next.getDate() + days);
    return next;
};

const FormField = ({ label, placeholder, icon, value, onChangeText, keyboardType = 'default', editable = true, onPress, multiline = false, numberOfLines = 1, error }: {
    label: string,
    placeholder: string,
    icon: any,
    value: string,
    onChangeText?: (text: string) => void,
    keyboardType?: 'default' | 'numeric',
    editable?: boolean,
    onPress?: () => void,
    multiline?: boolean,
    numberOfLines?: number,
    error?: string,
}) => {
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');

    return (
        <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            <TouchableOpacity
                activeOpacity={onPress ? 0.7 : 1}
                onPress={onPress}
                style={[styles.inputContainer, { borderColor: error ? dangerColor : borderColor }]}
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
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'auto'}
                />
            </TouchableOpacity>
            {error ? <Text style={[styles.errorText, { color: dangerColor }]}>{error}</Text> : null}
        </View>
    );
};

export default function CreateScreen() {
    const today = getStartOfDay(new Date());
    const maxTripDate = addDays(today, 2);

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const [date, setDate] = useState(today);
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [seats, setSeats] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [isPriceCalculated, setIsPriceCalculated] = useState(true);
    const [genderPreference, setGenderPreference] = useState<'men' | 'women' | 'both'>('both');
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [showProfileAlert, setShowProfileAlert] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = getStartOfDay(selectedDate || date);
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setErrors((current) => ({ ...current, date: undefined }));
    };

    const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(Platform.OS === 'ios');
        setTime(currentTime);
        setErrors((current) => ({ ...current, time: undefined }));
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const validateForm = () => {
        const nextErrors: FormErrors = {};
        const trimmedFrom = from.trim();
        const trimmedTo = to.trim();
        const trimmedDescription = description.trim();
        const numericSeats = Number(seats);
        const numericPrice = Number(price);
        const selectedDate = getStartOfDay(date);
        const selectedDateTime = new Date(date);
        selectedDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
        const now = new Date();

        if (!trimmedFrom) {
            nextErrors.from = 'Starting point is required.';
        } else if (trimmedFrom.length > 20) {
            nextErrors.from = 'Starting point must be 20 characters or less.';
        }

        if (!trimmedTo) {
            nextErrors.to = 'Destination is required.';
        } else if (trimmedTo.length > 20) {
            nextErrors.to = 'Destination must be 20 characters or less.';
        }

        if (selectedDate < today || selectedDate > maxTripDate) {
            nextErrors.date = 'Ride date must be within the next 3 days.';
        }

        if (selectedDateTime.getTime() <= now.getTime()) {
            nextErrors.time = 'Ride time must be in the future.';
        }

        if (!seats.trim()) {
            nextErrors.seats = 'Available seats is required.';
        } else if (!Number.isInteger(numericSeats) || numericSeats < 1) {
            nextErrors.seats = 'Available seats must be at least 1.';
        } else if (numericSeats > 4) {
            nextErrors.seats = 'You can only publish a ride with up to 4 seats.';
        }

        if (!isPriceCalculated) {
            if (!price.trim()) {
                nextErrors.price = 'Price per seat is required when auto-calculate is off.';
            } else if (Number.isNaN(numericPrice)) {
                nextErrors.price = 'Price per seat must be a valid number.';
            } else if (numericPrice > 1000) {
                nextErrors.price = 'Price per seat must be 1000 or less.';
            } else if (numericPrice < 0) {
                nextErrors.price = 'Price per seat cannot be negative.';
            }
        }

        if (trimmedDescription.length > 200) {
            nextErrors.description = 'Trip description must be 200 characters or less.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { profile } = useUserStore();

    const isProfileIncomplete = !profile || !profile.fullName || !profile.phoneNumber || !profile.gender || !profile.city;

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
            const apiMessage =
                (error as any)?.response?.data?.message;
            const fallbackMessage = Array.isArray(apiMessage)
                ? apiMessage[0]
                : typeof apiMessage === 'string'
                    ? apiMessage
                    : 'Failed to publish ride. Please try again.';
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: fallbackMessage
            });
        }
    });

    const handlePublish = async () => {
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

        if (!validateForm()) {
            Toast.show({
                type: 'error',
                text1: 'Please fix the highlighted fields',
                text2: 'Your ride details need a few corrections before publishing.'
            });
            return;
        }

        publishMutation.mutate({
            startingPoint: from.trim(),
            destination: to.trim(),
            date: formatDate(date),
            time: formatTime(time),
            description: description.trim() || undefined,
            availableSeats: parseInt(seats),
            city: profile?.city,
            pricePerSeat: isPriceCalculated ? undefined : parseFloat(price),
            isPriceCalculated: isPriceCalculated,
            genderPreference: genderPreference,
            creator: user.id
        });
    };

    const resetForm = () => {
        setFrom('');
        setTo('');
        setDate(today);
        setTime(new Date());
        setSeats('');
        setPrice('');
        setDescription('');
        setIsPriceCalculated(false);
        setGenderPreference('both');
        setErrors({});
    };

    return (
        <>
            <LocationSearchModal
                visible={showFromPicker}
                onClose={() => setShowFromPicker(false)}
                onSelectLocation={(address: string) => {
                    setFrom(address);
                    setErrors((current) => ({ ...current, from: undefined }));
                }}
                title="Select Starting Point"
            />
            <LocationSearchModal
                visible={showToPicker}
                onClose={() => setShowToPicker(false)}
                onSelectLocation={(address: string) => {
                    setTo(address);
                    setErrors((current) => ({ ...current, to: undefined }));
                }}
                title="Select Destination"
            />
            <CustomAlert
                visible={showProfileAlert}
                title="Complete Your Profile"
                message="You need to provide your Name, Phone Number, Gender, and City before you can publish a ride."
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
            <KeyboardAvoidingView
                style={[styles.safe, { backgroundColor }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView contentContainerStyle={styles.container}>

                    <View style={[styles.card, { backgroundColor: cardColor }]}>
                        <FormField
                            label="Starting Point"
                            placeholder="Search pickup location..."
                            icon="house.fill"
                            value={from}
                            error={errors.from}
                            onPress={() => setShowFromPicker(true)}
                        />
                        <FormField
                            label="Destination"
                            placeholder="Search drop location..."
                            icon="location.fill"
                            value={to}
                            error={errors.to}
                            onPress={() => setShowToPicker(true)}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <FormField
                                    label="Date"
                                    placeholder="Select Date"
                                    icon="calendar"
                                    value={formatDate(date)}
                                    error={errors.date}
                                    onPress={() => setShowDatePicker(true)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormField
                                    label="Time"
                                    placeholder="Select Time"
                                    icon="clock.fill"
                                    value={formatTime(time)}
                                    error={errors.time}
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
                                minimumDate={today}
                                maximumDate={maxTripDate}
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
                            error={errors.seats}
                            onChangeText={(text) => {
                                setSeats(text.replace(/[^0-9]/g, ''));
                                setErrors((current) => ({ ...current, seats: undefined }));
                            }}
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
                                        error={errors.price}
                                        onChangeText={(text) => {
                                            setPrice(text.replace(/[^0-9.]/g, ''));
                                            setErrors((current) => ({ ...current, price: undefined }));
                                        }}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}
                        </View>

                        <View style={[styles.fieldContainer, { marginTop: 4 }]}>
                            <FormField
                                label="Trip Description & Rules"
                                placeholder="E.g. max 1 medium bag per person, etc."
                                icon="doc.text.fill"
                                value={description}
                                error={errors.description}
                                onChangeText={(text) => {
                                    setDescription(text);
                                    setErrors((current) => ({ ...current, description: undefined }));
                                }}
                                multiline={true}
                                numberOfLines={5}
                            />
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
                    <Text style={[styles.disclaimer, { color: subtextColor }]}>
                        By publishing, you agree to share the ride cost fairly with co-passengers.
                    </Text>
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


                </ScrollView>
            </KeyboardAvoidingView>
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
    errorText: {
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '500',
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
        marginTop: 20,
    },
    publishButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    disclaimer: {
        textAlign: 'center',
        fontSize: 12,
        paddingHorizontal: 20,
        lineHeight: 18,
    }
});
