import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { FormField as FormFieldTokens } from '@/constants/ui';
import { Spinner } from '@/components/ui/spinner';
import { olaPlacesService, type OlaPlaceSuggestion } from '@/services/ola-places-service';
import { CONFIG } from '@/constants/config';
import type { LocationSelection } from '@/features/trips/types/location';

interface LocationSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (selection: LocationSelection) => void;
    title: string;
    allowCurrentLocation?: boolean;
}

const buildAddressFromGeocode = (result?: Location.LocationGeocodedAddress | null) => {
    if (!result) {
        return '';
    }

    const parts = [
        result.name,
        result.street,
        result.district,
        result.city,
        result.region,
        result.postalCode,
    ].filter(Boolean);

    return Array.from(new Set(parts)).join(', ');
};

export function LocationSearchModal({
    visible,
    onClose,
    onSelectLocation,
    title,
    allowCurrentLocation = false,
}: LocationSearchModalProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<OlaPlaceSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const requestSequenceRef = useRef(0);

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const subtextColor = useThemeColor({}, 'subtext');

    useEffect(() => {
        if (!visible) {
            setQuery('');
            setSuggestions([]);
            setIsLoading(false);
            setErrorMessage('');
            setHasSearched(false);
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) {
            return;
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            setErrorMessage('');
            setHasSearched(false);
            return;
        }

        const requestId = requestSequenceRef.current + 1;
        requestSequenceRef.current = requestId;
        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');
                const nextSuggestions = await olaPlacesService.autocomplete(trimmedQuery, controller.signal);

                if (requestSequenceRef.current === requestId) {
                    setSuggestions(nextSuggestions);
                    setHasSearched(true);
                }
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                if (requestSequenceRef.current === requestId) {
                    setSuggestions([]);
                    setHasSearched(true);
                    setErrorMessage(
                        error instanceof Error ? error.message : 'Unable to fetch place suggestions right now.'
                    );
                }
            } finally {
                if (requestSequenceRef.current === requestId) {
                    setIsLoading(false);
                }
            }
        }, 400);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [query, visible]);

    const handleConfirm = () => {
        if (query.trim()) {
            onSelectLocation({ address: query.trim() });
            setQuery('');
            onClose();
        }
    };

    const handleClose = () => {
        setQuery('');
        onClose();
    };

    const handleSuggestionSelect = (suggestion: OlaPlaceSuggestion) => {
        onSelectLocation({
            address: suggestion.address,
            latitude: suggestion.latitude,
            longitude: suggestion.longitude,
        });
        setQuery('');
        onClose();
    };

    const handleUseCurrentLocation = async () => {
        try {
            setIsFetchingCurrentLocation(true);
            setErrorMessage('');

            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted') {
                setErrorMessage('Allow location access to use your current pickup point.');
                return;
            }

            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const geocodeResults = await Location.reverseGeocodeAsync({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });

            const resolvedAddress = buildAddressFromGeocode(geocodeResults[0])
                || `Current location (${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)})`;

            onSelectLocation({
                address: resolvedAddress,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
            setQuery('');
            onClose();
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Unable to fetch your current location right now.'
            );
        } finally {
            setIsFetchingCurrentLocation(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
            <Box className="flex-1" style={{ backgroundColor }}>
                <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="flex-1"
                    >
                        {/* Header */}
                        <HStack className="items-center justify-between px-6 py-5 border-b" style={{ borderBottomColor: borderColor }}>
                            <Pressable
                                onPress={handleClose}
                                className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 border shadow-xs"
                                style={{ borderColor }}
                            >
                                <IconSymbol name="xmark" size={20} color={textColor} />
                            </Pressable>
                            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: textColor }}>{title}</Text>
                            <Box className="w-10" />
                        </HStack>

                        <ScrollView className="flex-1" bounces={false} keyboardShouldPersistTaps="handled">
                            {allowCurrentLocation ? (
                                <Box className="px-6 pt-6">
                                    <Pressable
                                        onPress={handleUseCurrentLocation}
                                        disabled={isFetchingCurrentLocation}
                                        className="rounded-[24px] border px-4 py-4"
                                        style={{ backgroundColor: cardColor, borderColor }}
                                    >
                                        <HStack space="md" className="items-center">
                                            <Box
                                                className="w-10 h-10 rounded-2xl items-center justify-center"
                                                style={{ backgroundColor }}
                                            >
                                                {isFetchingCurrentLocation ? (
                                                    <Spinner color={primaryColor} />
                                                ) : (
                                                    <IconSymbol name="location.fill" size={20} color={primaryColor} />
                                                )}
                                            </Box>
                                            <VStack className="flex-1">
                                                <Text className="text-[15px] font-semibold" style={{ color: textColor }}>
                                                    Use current location
                                                </Text>
                                                <Text className="text-[13px] leading-5 mt-1" style={{ color: subtextColor }}>
                                                    Use current location as the pickup point.
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Pressable>
                                </Box>
                            ) : null}

                            <Box className="px-6 py-6">
                                <VStack space="sm">
                                    <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
                                        Ola Places Search
                                    </Text>
                                    <HStack
                                        className="items-center px-4 h-14 rounded-[24px] border-2 shadow-sm"
                                        style={{ backgroundColor: cardColor, borderColor }}
                                        space="md"
                                    >
                                        <IconSymbol name="magnifyingglass" size={18} color={primaryColor} />
                                        <TextInput
                                            className="flex-1 font-medium"
                                            style={{ color: textColor, fontSize: FormFieldTokens.fontSize }}
                                            placeholder="Area, landmark, or city..."
                                            placeholderTextColor={subtextColor}
                                            value={query}
                                            onChangeText={setQuery}
                                            autoFocus
                                            maxLength={50}
                                        />
                                        {query.length > 0 && (
                                            <Pressable
                                                onPress={() => {
                                                    setQuery('');
                                                    setSuggestions([]);
                                                    setErrorMessage('');
                                                    setHasSearched(false);
                                                }}
                                                className="w-8 h-8 rounded-full items-center justify-center"
                                                style={{ backgroundColor }}
                                            >
                                                <IconSymbol name="xmark" size={12} color={subtextColor} />
                                            </Pressable>
                                        )}
                                    </HStack>
                                    <Text className="text-[11px] leading-5 ml-1" style={{ color: subtextColor }}>
                                        Start typing at least 2 characters to fetch autocomplete suggestions.
                                    </Text>
                                </VStack>
                            </Box>

                            <Box className="px-6">
                                <VStack space="sm">
                                    {isLoading ? (
                                        <HStack
                                            className="items-center rounded-[24px] border px-4 py-4"
                                            style={{ backgroundColor: cardColor, borderColor }}
                                            space="sm"
                                        >
                                            <Spinner color={primaryColor} />
                                            <Text className="text-sm font-medium" style={{ color: textColor }}>
                                                Searching Ola places...
                                            </Text>
                                        </HStack>
                                    ) : null}

                                    {!isLoading && errorMessage ? (
                                        <Box className="rounded-[24px] border px-4 py-4" style={{ backgroundColor: cardColor, borderColor }}>
                                            <Text className="text-sm font-semibold" style={{ color: textColor }}>
                                                {errorMessage}
                                            </Text>
                                        </Box>
                                    ) : null}

                                    {!isLoading && !errorMessage && suggestions.map((suggestion) => (
                                        <Pressable
                                            key={suggestion.id}
                                            onPress={() => handleSuggestionSelect(suggestion)}
                                            className="rounded-[24px] border px-4 py-4"
                                            style={{ backgroundColor: cardColor, borderColor }}
                                        >
                                            <HStack space="md" className="items-start">
                                                <Box
                                                    className="w-10 h-10 rounded-2xl items-center justify-center"
                                                    style={{ backgroundColor }}
                                                >
                                                    <IconSymbol name="mappin.circle.fill" size={20} color={primaryColor} />
                                                </Box>
                                                <VStack className="flex-1">
                                                    <Text className="text-[15px] font-semibold" style={{ color: textColor }}>
                                                        {suggestion.title}
                                                    </Text>
                                                    <Text className="text-[13px] leading-5 mt-1" style={{ color: subtextColor }}>
                                                        {suggestion.subtitle}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </Pressable>
                                    ))}

                                    {!isLoading && hasSearched && !errorMessage && suggestions.length === 0 ? (
                                        <Box className="rounded-[24px] border px-4 py-4" style={{ backgroundColor: cardColor, borderColor }}>
                                            <Text className="text-sm font-semibold" style={{ color: textColor }}>
                                                {`No matching Ola places found for "${query.trim()}".`}
                                            </Text>
                                        </Box>
                                    ) : null}
                                </VStack>
                            </Box>

                            <Box className="px-6 pt-4">
                                {query.trim().length > 0 && (
                                    <Button
                                        className="h-16 rounded-[24px] shadow-xl"
                                        style={{ backgroundColor: primaryColor }}
                                        onPress={handleConfirm}
                                    >
                                        <ButtonIcon as={() => <IconSymbol name="checkmark.circle.fill" size={18} color="#fff" />} className="mr-3" />
                                        <ButtonText className="text-xs font-extrabold uppercase tracking-widest">{`Use "${query.trim()}"`}</ButtonText>
                                    </Button>
                                )}
                            </Box>

                            <Box className="px-10 py-12 items-center">
                                <VStack space="xs" className="items-center">
                                    <Text className="text-[11px] font-medium leading-5 text-center opacity-60 italic" style={{ color: subtextColor }}>
                                        Precision matters for a smooth pickup. Pick a suggestion when possible, or use the typed address manually.
                                    </Text>
                                    {!CONFIG.OLA_MAPS_API_KEY ? (
                                        <Text className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: subtextColor }}>
                                            Missing `EXPO_PUBLIC_OLA_MAPS_API_KEY`
                                        </Text>
                                    ) : null}
                                </VStack>
                            </Box>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Box>
        </Modal>
    );
}
