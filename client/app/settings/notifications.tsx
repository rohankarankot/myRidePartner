import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack } from 'expo-router';

export default function NotificationSettingsScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');

    return (
        <ScrollView style={[styles.container, { backgroundColor }]}>
            <Stack.Screen options={{ title: 'Notifications' }} />
            <View style={styles.content}>
                <Text style={[styles.text, { color: textColor }]}>Configure your push and email notification preferences.</Text>
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
    text: {
        fontSize: 16,
        lineHeight: 24,
    }
});
