import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { userService } from '@/services/user-service';

export default function CommunityRoomScreen() {
    const router = useRouter();
    const { city } = useLocalSearchParams<{ city?: string }>();
    const selectedCity = city?.trim() || null;
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    const { data: roomMembersMeta } = useQuery({
        queryKey: ['community-room-members-summary', selectedCity],
        queryFn: () => userService.getCommunityMembers({
            page: 1,
            pageSize: 1,
            city: selectedCity || undefined,
        }),
        enabled: Boolean(selectedCity),
    });

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: selectedCity ? `${selectedCity} Room` : 'Community Room',
                    headerShown: true,
                    headerStyle: { backgroundColor },
                    headerTintColor: textColor,
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.container}>
                <View style={[styles.hero, { backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}20` }]}>
                    <View style={[styles.heroIcon, { backgroundColor: primaryColor }]}>
                        <IconSymbol name="message.fill" size={22} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.heroTitle, { color: textColor }]}>
                        {selectedCity ? `${selectedCity} Room` : 'Community Room'}
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: subtextColor }]}>
                        Keep the conversation local, helpful, and ride-related so people in this city actually benefit from it.
                    </Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
                        <Text style={[styles.statValue, { color: textColor }]}>
                            {roomMembersMeta?.meta.pagination.total ?? 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: subtextColor }]}>members</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
                        <Text style={[styles.statValue, { color: textColor }]}>Local</Text>
                        <Text style={[styles.statLabel, { color: subtextColor }]}>conversation</Text>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.88}
                    style={[styles.primaryAction, { backgroundColor: primaryColor }]}
                    onPress={() => router.push({
                        pathname: '/community-members',
                        params: selectedCity ? { city: selectedCity } : undefined,
                    })}
                >
                    <IconSymbol name="person.2.fill" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryActionText}>View room members</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.secondaryAction, { borderColor, backgroundColor: cardColor }]}
                    onPress={() => router.push({
                        pathname: '/community-chat',
                        params: selectedCity ? { city: selectedCity } : undefined,
                    })}
                >
                    <IconSymbol name="bubble.left.and.bubble.right.fill" size={18} color={primaryColor} />
                    <Text style={[styles.secondaryActionText, { color: textColor }]}>Back to chat room</Text>
                </TouchableOpacity>

                <View style={[styles.guidelinesCard, { backgroundColor: cardColor, borderColor }]}>
                    <Text style={[styles.guidelinesTitle, { color: textColor }]}>What to share here</Text>
                    <Text style={[styles.guidelinesText, { color: subtextColor }]}>
                        Ask route questions, discuss pickup points, share timing updates, and post safety notes that help riders around {selectedCity || 'your city'}.
                    </Text>
                </View>
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
    hero: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 18,
        alignItems: 'center',
    },
    heroIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
        marginBottom: 18,
    },
    statCard: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
    },
    primaryAction: {
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    primaryActionText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryAction: {
        marginTop: 12,
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    secondaryActionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    guidelinesCard: {
        marginTop: 18,
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
    },
    guidelinesTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6,
    },
    guidelinesText: {
        fontSize: 13,
        lineHeight: 19,
    },
});
