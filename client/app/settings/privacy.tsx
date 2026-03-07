import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';

export default function PrivacySettingsScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');

    return (
        <ScrollView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen options={{ title: 'Privacy & Policy' }} />
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: cardColor }]}>
                    <Text style={[styles.heading, { color: textColor, marginTop: 0 }]}>1. Information We Collect</Text>
                    <Text style={[styles.text, { color: subtextColor }]}>
                        We collect information you provide directly to us, such as your name, email, phone number, and profile picture. As a carpooling app, we also collect trip-related details and location data to match you with rides and track trips securely.
                    </Text>

                    <Text style={[styles.heading, { color: textColor }]}>2. How We Use Your Information</Text>
                    <Text style={[styles.text, { color: subtextColor }]}>
                        Your information is used to facilitate carpooling, ensure user safety, communicate ride updates, and improve our services. Location data is shared with other users only when you actively participate in a trip.
                    </Text>

                    <Text style={[styles.heading, { color: textColor }]}>3. Data Sharing and Security</Text>
                    <Text style={[styles.text, { color: subtextColor }]}>
                        We do not sell your personal data. Your profile information (name, avatar, ratings) is visible to other users to build trust and safety in the community. We implement standard security measures to protect your data from unauthorized access.
                    </Text>

                    <Text style={[styles.heading, { color: textColor }]}>4. Your Rights</Text>
                    <Text style={[styles.text, { color: subtextColor }]}>
                        You have the right to access, update, or delete your account information at any time through the app 'Account Settings'. You can also withdraw consent for location tracking via your device settings, though this may limit app functionality.
                    </Text>

                    <Text style={[styles.heading, { color: textColor }]}>5. Contact Us</Text>
                    <Text style={[styles.text, { color: subtextColor }]}>
                        If you have questions regarding this Privacy Policy, please contact us at privacy@myridepartner.com.
                    </Text>
                </View>
                <Text style={[styles.lastUpdated, { color: subtextColor }]}>Last Updated: March 2026</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    heading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        lineHeight: 22,
    },
    lastUpdated: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    }
});
