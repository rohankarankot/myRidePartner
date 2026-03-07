import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useThemeStore, ThemeMode } from '@/store/theme-store';

type SettingItemProps = {
    icon: any;
    label: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
};

const SettingItem = ({ icon, label, onPress, rightElement }: SettingItemProps) => {
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const borderColor = useThemeColor({}, 'border');

    return (
        <TouchableOpacity style={[styles.item, { borderBottomColor: borderColor }]} onPress={onPress}>
            <View style={styles.itemLeft}>
                <IconSymbol name={icon} size={22} color={textColor} />
                <Text style={[styles.itemLabel, { color: textColor }]}>{label}</Text>
            </View>
            {rightElement ? rightElement : <IconSymbol name="chevron.right" size={18} color={subtextColor} />}
        </TouchableOpacity>
    );
};

export default function SettingsScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const { theme, setTheme } = useThemeStore();
    const router = useRouter();

    return (
        <ScrollView style={[styles.container, { backgroundColor }]}>
            <View style={[styles.section, { backgroundColor: cardColor }]}>
                <Text style={[styles.sectionTitle, { color: useThemeColor({}, 'subtext') }]}>Personalization</Text>

                <View style={styles.themeSelector}>
                    {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                        <TouchableOpacity
                            key={mode}
                            style={[
                                styles.themeButton,
                                { borderColor },
                                theme === mode && { backgroundColor: primaryColor, borderColor: primaryColor }
                            ]}
                            onPress={() => setTheme(mode)}
                        >
                            <Text
                                style={[
                                    styles.themeButtonText,
                                    { color: textColor },
                                    theme === mode && { color: '#fff' }
                                ]}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <SettingItem icon="person.fill" label="Account Settings" onPress={() => router.push('/settings/account')} />
                <SettingItem icon="gearshape.fill" label="Notifications" onPress={() => router.push('/settings/notifications')} />
                <SettingItem icon="plus.circle.fill" label="Privacy & Security" onPress={() => router.push('/settings/privacy')} />
                <SettingItem icon="magnifyingglass" label="Help & Support" onPress={() => router.push('/settings/support')} />
                <SettingItem icon="list.bullet" label="About My Ride Partner" onPress={() => router.push('/settings/about')} />
            </View>

            <View style={styles.footer}>
                <Text style={[styles.version, { color: useThemeColor({}, 'subtext') }]}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemLabel: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    themeSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        marginTop: 4,
    },
    themeButton: {
        flex: 1,
        height: 38,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    version: {
        fontSize: 12,
    }
});
