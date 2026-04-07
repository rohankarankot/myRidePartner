import React from 'react';
import LottieView from 'lottie-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type AppLoaderProps = {
    message?: string;
};

export function AppLoader({ message = '' }: AppLoaderProps) {
    const textColor = useThemeColor({}, 'text');

    return (
        <Box className="flex-1 items-center justify-center px-6">
            <VStack className="items-center" space="xs">
                <Box className="w-44 h-44 items-center justify-center">
                    <LottieView
                        source={require('@/assets/lotties/car-loading.json')}
                        autoPlay
                        loop
                        style={{ width: '100%', height: '100%' }}
                    />
                </Box>
                {message ? (
                    <Text 
                        className="text-[10px] font-extrabold uppercase tracking-widest text-center" 
                        style={{ color: textColor }}
                    >
                        {message}
                    </Text>
                ) : null}
            </VStack>
        </Box>
    );
}
