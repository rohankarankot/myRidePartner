import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CommunityInfoScreen() {
    const router = useRouter();
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: 'Community Info',
                    headerShown: true,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.container}>
                <Text style={[styles.title, { color: textColor }]}>Community options</Text>
                <Text style={[styles.subtitle, { color: subtextColor }]}>
                    Explore the shared public group and see everyone who is part of it.
                </Text>

                <TouchableOpacity
                    style={[styles.optionCard, { backgroundColor: cardColor, borderColor }]}
                    onPress={() => router.push('/community-members')}
                >
                    <View style={[styles.iconWrap, { backgroundColor: `${primaryColor}14` }]}>
                        <IconSymbol name="person.2.fill" size={22} color={primaryColor} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={[styles.optionTitle, { color: textColor }]}>Members</Text>
                        <Text style={[styles.optionSubtitle, { color: subtextColor }]}>
                            See all users who are part of the public community chat.
                        </Text>
                    </View>
                    <IconSymbol name="chevron.right" size={18} color={subtextColor} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    optionCard: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconWrap: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
});
