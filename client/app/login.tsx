import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    View,
    ActivityIndicator,
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
    withTiming,
    withDelay
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
    }, []);

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
            await GoogleSignin.signOut();
            await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
            const data = await authService.googleLogin(tokens.accessToken);

            if (data.jwt) {
                await signIn(data.jwt, data.user);
                router.replace('/(tabs)');
            } else {
                console.error('Login failed', data);
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Signin in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available or outdated');
            } else {
                console.error('Google Sign-In Error', error);
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            {/* Background Decorative Elements */}
            <View style={[styles.bgCircle, { top: -height * 0.1, right: -width * 0.2, backgroundColor: primaryColor + '10' }]} />
            <View style={[styles.bgCircle, { bottom: height * 0.1, left: -width * 0.3, backgroundColor: primaryColor + '05', width: 300, height: 300 }]} />

            <Animated.View exiting={FadeInUp} style={styles.content}>
                {/* Branding Section */}
                <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.brandContainer}>
                    <Animated.View style={[styles.logoContainer, { backgroundColor: primaryColor }, animatedLogoStyle]}>
                        <IconSymbol name="car.fill" size={40} color="#fff" />
                    </Animated.View>
                    <Text style={[styles.title, { color: textColor }]}>My Ride Partner</Text>
                    <Text style={[styles.tagline, { color: subtextColor }]}>
                        commuting made
                    </Text>
                    <Text style={[styles.tagline, { color: subtextColor }]}>
                        simplified and affordable
                    </Text>

                </Animated.View>

                {/* Login Card */}
                <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.cardWrapper}>
                    {Platform.OS === 'ios' ? (
                        <BlurView intensity={colorScheme === 'dark' ? 20 : 40} style={styles.blurContainer}>
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
                        <View style={[styles.androidCard, { backgroundColor: cardColor, borderColor: textColor + '10' }]}>
                            <LoginCardContent
                                isLoggingIn={isLoggingIn}
                                isTermsAccepted={isTermsAccepted}
                                onLogin={handleGoogleLogin}
                                textColor={textColor}
                                subtextColor={subtextColor}
                                primaryColor={primaryColor}
                            />
                        </View>
                    )}
                </Animated.View>

                {/* Footer Section */}
                <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
                    <View style={styles.termsRow}>
                        <TouchableOpacity
                            onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                            style={styles.checkbox}
                            activeOpacity={0.7}
                        >
                            <IconSymbol
                                name={isTermsAccepted ? "checkmark.circle.fill" : "checkmark.circle"}
                                size={22}
                                color={isTermsAccepted ? primaryColor : subtextColor}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/terms')} style={{ display: 'flex' }}>
                            <Text style={[styles.footerText, { color: subtextColor }]}>
                                By continuing, you agree to
                            </Text>
                            <Text style={{ color: primaryColor, textDecorationLine: 'underline' }}>Terms and Privacy Policy.</Text>

                        </TouchableOpacity>
                    </View>
                </Animated.View>

            </Animated.View>
            <View style={{ display: 'flex', alignItems: 'center', position: 'absolute', bottom: 70, left: 0, right: 0 }}>
                <Text style={{ color: textColor, fontSize: 14 }}>🚩 An initiative by MH13 Community 🚩</Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://github.com/rohankarankot/myRidePartner')}>
                    <Text style={{ color: primaryColor, fontSize: 12, marginTop: 10, width: '100%', textAlign: 'center', textDecorationLine: 'underline' }}>Contributions are welcomed</Text>
                </TouchableOpacity>

            </View>
        </View >
    );
}

const LoginCardContent = ({ isLoggingIn, isTermsAccepted, onLogin, textColor, subtextColor, primaryColor }: any) => (
    <View style={styles.cardInner}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Sign In</Text>
        <Text style={[styles.cardSubtitle, { color: subtextColor }]}>
            Join the community of verified travelers.
        </Text>

        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: primaryColor },
                (!isTermsAccepted || isLoggingIn) && styles.buttonDisabled
            ]}
            onPress={onLogin}
            disabled={isLoggingIn || !isTermsAccepted}
            activeOpacity={0.8}
        >
            {isLoggingIn ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <View style={styles.buttonContent}>
                    <IconSymbol name={"google.logo" as any} size={20} color="#fff" style={styles.googleIcon} />
                    <Text style={styles.buttonText}>Continue with Google</Text>
                </View>
            )}
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    bgCircle: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 16,
        marginTop: 8,
        fontWeight: '500',
    },
    cardWrapper: {
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    blurContainer: {
        padding: 30,
        borderRadius: 28,
    },
    androidCard: {
        padding: 30,
        borderRadius: 28,
        borderWidth: 1,
    },
    cardInner: {
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 35,
        lineHeight: 20,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    googleIcon: {
        marginRight: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    checkbox: {
        marginRight: 10,
    },
    footerText: {
        fontSize: 14,
        textAlign: 'left',
        opacity: 0.8,
        lineHeight: 20,
    },
});
