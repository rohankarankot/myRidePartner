import React from 'react';
import {
    Modal,
    Dimensions,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from './ui/icon-symbol';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    primaryButton: {
        text: string;
        onPress: () => void;
        style?: any;
    };
    secondaryButton?: {
        text: string;
        onPress: () => void;
    };
    tertiaryButton?: {
        text: string;
        onPress: () => void;
    };
    onClose: () => void;
    icon?: any;
    dismissible?: boolean;
}

const { width } = Dimensions.get('window');

export function CustomAlert({
    visible,
    title,
    message,
    primaryButton,
    secondaryButton,
    tertiaryButton,
    onClose,
    icon = 'info.circle.fill',
    dismissible = true
}: CustomAlertProps) {
    const backgroundColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const overlayColor = 'rgba(0,0,0,0.6)';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => {
                if (dismissible) {
                    onClose();
                }
            }}
        >
            <Box className="flex-1 justify-center items-center px-6" style={{ backgroundColor: overlayColor }}>
                <Box 
                    className="rounded-[32px] p-8 border-2 items-center" 
                    style={{ 
                        backgroundColor, 
                        borderColor: `${primaryColor}15`,
                        width: Math.min(width - 48, 380)
                    }}
                >
                    <Box className="w-16 h-16 rounded-[24px] bg-gray-50 items-center justify-center mb-6 border" style={{ borderColor }}>
                        <IconSymbol name={icon} size={30} color={primaryColor} />
                    </Box>

                    <VStack className="items-center mb-8" space="xs">
                        <Text className="text-xl font-extrabold text-center uppercase tracking-widest" style={{ color: textColor }}>
                            {title}
                        </Text>
                        <Text className="text-sm font-medium leading-6 text-center opacity-80" style={{ color: subtextColor }}>
                            {message}
                        </Text>
                    </VStack>

                    <HStack className="w-full" space="md">
                        {tertiaryButton && (
                            <Pressable
                                className="flex-1 h-12 rounded-2xl border-2 items-center justify-center"
                                style={{ borderColor }}
                                onPress={tertiaryButton.onPress}
                            >
                                <Text className="text-[10px] font-extrabold uppercase tracking-widest text-center" style={{ color: subtextColor }}>
                                    {tertiaryButton.text}
                                </Text>
                            </Pressable>
                        )}
                        {secondaryButton && (
                            <Pressable
                                className="flex-1 h-12 rounded-2xl border-2 items-center justify-center"
                                style={{ borderColor }}
                                onPress={secondaryButton.onPress}
                            >
                                <Text className="text-[10px] font-extrabold uppercase tracking-widest text-center" style={{ color: subtextColor }}>
                                    {secondaryButton.text}
                                </Text>
                            </Pressable>
                        )}
                        <Pressable
                            className="flex-1 h-12 rounded-2xl items-center justify-center border"
                            style={[
                                { 
                                    backgroundColor: primaryColor, 
                                    borderColor: `${primaryColor}20` 
                                },
                                primaryButton.style
                            ]}
                            onPress={primaryButton.onPress}
                        >
                            <Text className="text-[10px] font-extrabold uppercase tracking-widest text-white text-center">
                                {primaryButton.text}
                            </Text>
                        </Pressable>
                    </HStack>
                </Box>
            </Box>
        </Modal>
    );
}
