import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from './icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type HeaderRightProps = {
    type?: 'notifications' | 'settings';
};

export function HeaderRight({ type = 'notifications' }: HeaderRightProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const tintColor = Colors[colorScheme ?? 'light'].tint;

    const onPress = () => {
        if (type === 'notifications') {
            router.push('/notifications');
        } else {
            router.push('/settings');
        }
    };

    const iconName = type === 'notifications' ? 'bell.fill' : 'gearshape.fill';

    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={styles.container}
            activeOpacity={0.7}
        >
            <IconSymbol name={iconName} size={24} color={tintColor} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
