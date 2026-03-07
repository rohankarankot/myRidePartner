import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from './ui/icon-symbol';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    primaryButton: {
        text: string;
        onPress: () => void;
    };
    secondaryButton?: {
        text: string;
        onPress: () => void;
    };
    onClose: () => void;
    icon?: any;
    dismissible?: boolean;
}

export function CustomAlert({
    visible,
    title,
    message,
    primaryButton,
    secondaryButton,
    onClose,
    icon = 'info.circle.fill',
    dismissible = true
}: CustomAlertProps) {
    const backgroundColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const overlayColor = 'rgba(0,0,0,0.5)';

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
            <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
                <View style={[styles.alertBox, { backgroundColor }]}>
                    <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}15` }]}>
                        <IconSymbol name={icon} size={40} color={primaryColor} />
                    </View>

                    <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                    <Text style={[styles.message, { color: subtextColor }]}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {secondaryButton && (
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton, { borderColor }]}
                                onPress={secondaryButton.onPress}
                            >
                                <Text style={[styles.buttonText, { color: textColor }]}>
                                    {secondaryButton.text}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, { backgroundColor: primaryColor }]}
                            onPress={primaryButton.onPress}
                        >
                            <Text style={[styles.buttonText, styles.primaryButtonText]}>
                                {primaryButton.text}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertBox: {
        width: Math.min(width - 40, 340),
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        // Background color from props
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    secondaryButton: {
        borderWidth: 1.5,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
