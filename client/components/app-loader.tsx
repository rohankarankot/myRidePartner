import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

type AppLoaderProps = {
    message?: string;
};

export function AppLoader({ message = '' }: AppLoaderProps) {
    const textColor = useThemeColor({}, 'text');

    return (
        <View style={styles.container}>
            <LottieView
                source={require('@/assets/lotties/car-loading.json')}
                autoPlay
                loop
                style={styles.animation}
            />
            <Text style={[styles.message, { color: textColor }]}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    animation: {
        width: 180,
        height: 180,
    },
    message: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
