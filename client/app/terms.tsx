import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';

export default function TermsScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');

    return (
        <ScrollView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen options={{ title: 'Terms & Privacy', headerBackTitle: 'Back', headerRight: () => null }} />
            <View style={styles.content}>
                <View style={[styles.section, { backgroundColor: cardColor }]}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>1. Acceptance of Terms</Text>
                    <Text style={[styles.text, { color: subtextColor }]}>
                        By using My Ride Partner, you agree to these terms. If you do not agree, please do not use the service.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: textColor }]}>2. User Responsibilities</Text>
                    <Text style={[styles.text, { color: subtextColor }]}>
                        Users are responsible for their own safety and behavior. My Ride Partner is a platform to connect riders and drivers.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: textColor }]}>3. Privacy Policy</Text>
                    <Text style={[styles.text, { color: subtextColor }]}>
                        We value your privacy. Your data is used only to facilitate ride sharing and improve our services.
                    </Text>

                    <Text style={[styles.sectionTitle, { color: textColor }]}>4. Verification</Text>
                    <Text style={[styles.text, { color: subtextColor }]}>
                        While we strive for a safe community, users should verify each other's identity before starting a ride.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: subtextColor }]}>
                        Last updated: March, 2026
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    section: {
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
        marginTop: 15,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 13,
        opacity: 0.6,
    },
});
