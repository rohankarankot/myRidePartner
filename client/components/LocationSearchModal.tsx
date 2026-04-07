import React, { useState } from 'react';
import {
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from './ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';

interface LocationSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (address: string) => void;
    title: string;
}

export function LocationSearchModal({ visible, onClose, onSelectLocation, title }: LocationSearchModalProps) {
    const [query, setQuery] = useState('');

    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const subtextColor = useThemeColor({}, 'subtext');

    const handleConfirm = () => {
        if (query.trim()) {
            onSelectLocation(query);
            setQuery('');
            onClose();
        }
    };

    const handleClose = () => {
        setQuery('');
        onClose();
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
                            {/* Placeholder Map Area */}
                            <Box className="px-6 py-8">
                                <Box 
                                    className="h-44 rounded-[32px] border-2 border-dashed items-center justify-center p-8 bg-gray-50/30"
                                    style={{ borderColor: `${primaryColor}20` }}
                                >
                                    <Box className="w-12 h-12 rounded-2xl bg-white items-center justify-center mb-4 shadow-sm border" style={{ borderColor }}>
                                        <IconSymbol name="map.fill" size={20} color={primaryColor} />
                                    </Box>
                                    <Text className="text-[10px] font-extrabold uppercase tracking-widest text-center" style={{ color: subtextColor }}>
                                        Interactive map integration coming soon
                                    </Text>
                                </Box>
                            </Box>

                            {/* Search Box */}
                            <Box className="px-6 pb-6">
                                <VStack space="sm">
                                    <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
                                        Manual Search
                                    </Text>
                                    <HStack 
                                        className="items-center px-4 h-16 rounded-[24px] border-2 shadow-sm" 
                                        style={{ backgroundColor: cardColor, borderColor }}
                                        space="md"
                                    >
                                        <IconSymbol name="magnifyingglass" size={18} color={primaryColor} />
                                        <TextInput
                                            className="flex-1 text-[15px] font-medium"
                                            style={{ color: textColor }}
                                            placeholder="Area, landmark, or city..."
                                            placeholderTextColor={subtextColor}
                                            value={query}
                                            onChangeText={setQuery}
                                            autoFocus
                                        />
                                        {query.length > 0 && (
                                            <Pressable
                                                onPress={() => setQuery('')}
                                                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100"
                                            >
                                                <IconSymbol name="xmark" size={12} color={subtextColor} />
                                            </Pressable>
                                        )}
                                    </HStack>
                                </VStack>
                            </Box>

                            {/* Confirm Button Area */}
                            <Box className="px-6 pt-4">
                                {query.trim().length > 0 && (
                                    <Button 
                                        className="h-16 rounded-[24px] shadow-xl"
                                        style={{ backgroundColor: primaryColor }}
                                        onPress={handleConfirm}
                                    >
                                        <ButtonIcon as={() => <IconSymbol name="checkmark.circle.fill" size={18} color="#fff" />} className="mr-3" />
                                        <ButtonText className="text-xs font-extrabold uppercase tracking-widest">Confirm "{query}"</ButtonText>
                                    </Button>
                                )}
                            </Box>

                            <Box className="px-10 py-12 items-center">
                                <Text className="text-[11px] font-medium leading-5 text-center opacity-60 italic" style={{ color: subtextColor }}>
                                    Precision matters for a smooth pickup. Please type the full address or primary landmark.
                                </Text>
                            </Box>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Box>
        </Modal>
    );
}
