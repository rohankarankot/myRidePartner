import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DotLottie } from '@lottiefiles/dotlottie-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

type AppLoaderProps = {
    message?: string;
};

export function AppLoader({ message = 'Loading your ride...' }: AppLoaderProps) {
    const textColor = useThemeColor({}, 'text');

    return (
        <View style={styles.container}>
            <DotLottie
                source={require('@/assets/lotties/car-loading.lottie')}
                autoplay
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
