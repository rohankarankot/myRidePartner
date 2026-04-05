import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function CommunityTabScreen() {
    const router = useRouter();
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['left', 'right', 'bottom']}>
            <View style={styles.container}>
                <View style={[styles.appBar, { backgroundColor: cardColor, borderColor }]}>
                    <View style={styles.appBarCopy}>
                        <View style={[styles.appBarPill, { backgroundColor: `${primaryColor}14` }]}>
                            <IconSymbol name="bubble.left.and.bubble.right.fill" size={14} color={primaryColor} />
                            <Text style={[styles.appBarPillText, { color: primaryColor }]}>City community</Text>
                        </View>
                        <Text style={[styles.title, { color: textColor }]}>Travellers Community</Text>
                        <Text style={[styles.subtitle, { color: subtextColor }]}>
                            Talk routes, connect with nearby riders, and keep local travel conversations in one place.
                        </Text>
                    </View>
                    <View style={[styles.appBarIconWrap, { backgroundColor: `${primaryColor}12` }]}>
                        <IconSymbol name="person.2.fill" size={28} color={primaryColor} />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.optionCard, { backgroundColor: cardColor, borderColor }]}
                    onPress={() => router.push('/community-chat')}
                >
                    <View style={[styles.iconWrap, { backgroundColor: `${primaryColor}14` }]}>
                        <IconSymbol name="message.fill" size={22} color={primaryColor} />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={[styles.optionTitle, { color: textColor }]}>Open chat room</Text>
                        <Text style={[styles.optionSubtitle, { color: subtextColor }]}>
                            Join the live public conversation in a dedicated chat screen.
                        </Text>
                    </View>
                    <IconSymbol name="chevron.right" size={18} color={subtextColor} />
                </TouchableOpacity>

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
                            Browse all users who are part of the public community.
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
        gap: 14,
    },
    appBar: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    appBarCopy: {
        flex: 1,
    },
    appBarPill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    appBarPillText: {
        fontSize: 12,
        fontWeight: '700',
    },
    appBarIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 21,
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
