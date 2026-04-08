import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '@/context/auth-context';
import { CONFIG } from '@/constants/config';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth-service';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Toast from 'react-native-toast-message';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const { signIn } = useAuth();
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);

    const textColor = useThemeColor({}, 'text');
    const primaryColor = useThemeColor({}, 'primary');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const backgroundColor = useThemeColor({}, 'background');
    const floatValue = useSharedValue(0);

    useEffect(() => {
        floatValue.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 1500 }),
                withTiming(0, { duration: 1500 })
            ),
            -1,
            true
        );
    }, [floatValue]);

    const animatedLogoStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: floatValue.value }],
    }));

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID,
            offlineAccess: true,
        });
    }, []);

    const handleGoogleLogin = async () => {
        if (isLoggingIn || !isTermsAccepted) return;

        setIsLoggingIn(true);
        try {
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
            if (!tokens.idToken) {
                throw new Error("No ID Token found from Google Sign-In");
            }
            const data = await authService.googleLogin(tokens.idToken);

            const token = data.jwt || data.access_token;

            if (token) {
                await signIn(token, data.user);
                router.replace('/(tabs)');
            } else {
                console.error('Login failed', data);
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Signin in progress');
                Toast.show({
                    type: 'info',
                    text1: 'Google Sign-In in progress',
                    text2: 'Please wait for the current sign-in attempt to finish.',
                });
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available or outdated');
                Toast.show({
                    type: 'error',
                    text1: 'Google Play Services unavailable',
                    text2: 'Use an Android emulator with Google Play and make sure Play Services is updated.',
                });
            } else {
                console.error('Google Sign-In Error', error);
                const isNetworkError =
                    error?.code === 'NETWORK_ERROR' ||
                    error?.message?.includes('NETWORK_ERROR');

                Toast.show({
                    type: 'error',
                    text1: isNetworkError ? 'Google Sign-In failed on emulator' : 'Google Sign-In failed',
                    text2: isNetworkError
                        ? 'Check that the emulator has Google Play, internet access, and a signed-in Google account.'
                        : 'Please try again. If this keeps happening, restart the app or emulator.',
                });
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <Box className="flex-1 overflow-hidden" style={{ backgroundColor }}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            
            {/* Background Decorative Elements */}
            <Box 
              className="absolute rounded-full" 
              style={{ 
                top: -height * 0.1, 
                right: -width * 0.2, 
                backgroundColor: primaryColor + '10',
                width: 400,
                height: 400
              }} 
            />
            <Box 
              className="absolute rounded-full" 
              style={{ 
                bottom: height * 0.1, 
                left: -width * 0.3, 
                backgroundColor: primaryColor + '05', 
                width: 300, 
                height: 300 
              }} 
            />

            <Animated.View exiting={FadeInUp} style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 30 }}>
                {/* Branding Section */}
                <Animated.View entering={FadeInUp.delay(200).duration(800)} style={{ alignItems: 'center', marginBottom: 50 }}>
                    <Animated.View 
                      style={[
                        { 
                          width: 80, 
                          height: 80, 
                          borderRadius: 24, 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          marginBottom: 20,
                          backgroundColor: primaryColor,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.15,
                          shadowRadius: 15,
                          elevation: 10,
                        }, 
                        animatedLogoStyle
                      ]}
                    >
                        <IconSymbol name="car.fill" size={40} color="#fff" />
                    </Animated.View>
                    <Text className="text-3xl font-extrabold tracking-tighter" style={{ color: textColor }}>
                      My Ride Partner
                    </Text>
                    <VStack className="items-center mt-2">
                        <Text className="text-base font-medium" style={{ color: subtextColor }}>
                            commuting made
                        </Text>
                        <Text className="text-base font-medium" style={{ color: subtextColor }}>
                            simplified and affordable
                        </Text>
                    </VStack>
                </Animated.View>

                {/* Login Card */}
                <Animated.View entering={FadeInDown.delay(400).duration(800)} style={{ borderRadius: 28, overflow: 'hidden', elevation: 5 }}>
                    {Platform.OS === 'ios' ? (
                        <BlurView intensity={colorScheme === 'dark' ? 20 : 40} style={{ padding: 30 }}>
                            <LoginCardContent
                                isLoggingIn={isLoggingIn}
                                isTermsAccepted={isTermsAccepted}
                                onLogin={handleGoogleLogin}
                                textColor={textColor}
                                subtextColor={subtextColor}
                                primaryColor={primaryColor}
                            />
                        </BlurView>
                    ) : (
                        <Box 
                          className="p-8 rounded-[28px] border" 
                          style={{ backgroundColor: cardColor, borderColor: textColor + '10' }}
                        >
                            <LoginCardContent
                                isLoggingIn={isLoggingIn}
                                isTermsAccepted={isTermsAccepted}
                                onLogin={handleGoogleLogin}
                                textColor={textColor}
                                subtextColor={subtextColor}
                                primaryColor={primaryColor}
                            />
                        </Box>
                    )}
                </Animated.View>

                {/* Footer Section */}
                <Animated.View entering={FadeIn.delay(800)} style={{ marginTop: 30, alignItems: 'center' }}>
                    <HStack className="items-center justify-center" space="sm">
                        <Pressable
                            onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                            className="p-1"
                        >
                            <IconSymbol
                                name={isTermsAccepted ? "checkmark.circle.fill" : "checkmark.circle"}
                                size={22}
                                color={isTermsAccepted ? primaryColor : subtextColor}
                            />
                        </Pressable>
                        <Pressable onPress={() => router.push('/terms')}>
                            <VStack className="items-center">
                                <Text className="text-sm opacity-80 text-center" style={{ color: subtextColor }}>
                                    By continuing, you agree to
                                </Text>
                                <Text className="text-sm font-semibold underline text-center" style={{ color: primaryColor }}>
                                  Terms and Privacy Policy.
                                </Text>
                            </VStack>
                        </Pressable>
                    </HStack>
                </Animated.View>

            </Animated.View>
            
            <VStack className="absolute bottom-16 left-0 right-0 items-center" space="xs">
                <Text className="text-sm font-medium" style={{ color: textColor }}>
                  🚩 An initiative by MH13 Community 🚩
                </Text>
                <Pressable onPress={() => Linking.openURL('https://github.com/rohankarankot/myRidePartner')}>
                    <Text className="text-xs underline text-center" style={{ color: primaryColor }}>
                      Contributions are welcomed
                    </Text>
                </Pressable>
            </VStack>
        </Box >
    );
}

const LoginCardContent = ({ isLoggingIn, isTermsAccepted, onLogin, textColor, subtextColor, primaryColor }: any) => (
    <VStack className="items-center" space="lg">
        <VStack className="items-center mb-2" space="xs">
            <Text className="text-2xl font-extrabold" style={{ color: textColor }}>Sign In</Text>
            <Text className="text-sm text-center px-4" style={{ color: subtextColor }}>
                Join the community of verified travelers.
            </Text>
        </VStack>

        <Button
            size="xl"
            onPress={onLogin}
            disabled={isLoggingIn || !isTermsAccepted}
            className="w-full rounded-2xl h-14"
            style={{ 
              backgroundColor: primaryColor,
              opacity: (isLoggingIn || !isTermsAccepted) ? 0.4 : 1 
            }}
        >
            {isLoggingIn ? (
                <Spinner color="#fff" />
            ) : (
                <HStack className="items-center" space="md">
                    <IconSymbol name={"google.logo" as any} size={20} color="#fff" />
                    <ButtonText className="text-white font-bold text-lg">Continue with Google</ButtonText>
                </HStack>
            )}
        </Button>
    </VStack>
);
