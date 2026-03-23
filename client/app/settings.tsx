import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useThemeStore, ThemeMode } from '@/store/theme-store';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/context/auth-context';
import { userService } from '@/services/user-service';
import { CustomAlert } from '@/components/CustomAlert';

type SettingItemProps = {
    icon: any;
    label: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
};

const SettingItem = ({ icon, label, onPress, rightElement, danger = false }: SettingItemProps) => {
    const textColor = useThemeColor({}, 'text');
    const subtextColor = useThemeColor({}, 'subtext');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = useThemeColor({}, 'danger');
    const iconColor = danger ? dangerColor : textColor;
    const labelColor = danger ? dangerColor : textColor;

    return (
        <TouchableOpacity style={[styles.item, { borderBottomColor: borderColor }]} onPress={onPress}>
            <View style={styles.itemLeft}>
                <IconSymbol name={icon} size={22} color={iconColor} />
                <Text style={[styles.itemLabel, { color: labelColor }]}>{label}</Text>
            </View>
            {rightElement ? rightElement : <IconSymbol name="chevron.right" size={18} color={subtextColor} />}
        </TouchableOpacity>
    );
};

export default function SettingsScreen() {
    const { signOut } = useAuth();
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const subtextColor = useThemeColor({}, 'subtext');
    const { theme, setTheme } = useThemeStore();
    const router = useRouter();
    const [showAccountActionAlert, setShowAccountActionAlert] = useState(false);
    const [showPauseConfirmAlert, setShowPauseConfirmAlert] = useState(false);
    const [showDeleteConfirmAlert, setShowDeleteConfirmAlert] = useState(false);

    const pauseAccountMutation = useMutation({
        mutationFn: () => userService.pauseMyAccount(),
        onSuccess: async () => {
            Toast.show({
                type: 'success',
                text1: 'Account Paused',
                text2: 'Your account is paused. Sign in again anytime to reactivate it.'
            });
            await signOut();
        },
        onError: () => {
            Toast.show({
                type: 'error',
                text1: 'Pause Failed',
                text2: 'We could not pause your account right now.'
            });
        }
    });

    const deleteAccountMutation = useMutation({
        mutationFn: () => userService.deleteMyAccount(),
        onSuccess: async () => {
            Toast.show({
                type: 'success',
                text1: 'Account Deleted',
                text2: 'Your account has been permanently removed.'
            });
            await signOut();
        },
        onError: () => {
            Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: 'We could not delete your account right now.'
            });
        }
    });

    const handleAccountAction = () => {
        setShowAccountActionAlert(true);
    };

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

                <SettingItem icon="bell.fill" label="Notifications" onPress={() => router.push('/notifications')} />
                <SettingItem icon="plus.circle.fill" label="Privacy & Security" onPress={() => router.push('/settings/privacy')} />
                <SettingItem icon="hand.raised.fill" label="Blocked Users" onPress={() => router.push('/settings/blocked-users')} />
                <SettingItem icon="magnifyingglass" label="Help & Support" onPress={() => router.push('/settings/support')} />
                <SettingItem icon="list.bullet" label="About My Ride Partner" onPress={() => router.push('/settings/about')} />
            </View>

            <View style={[styles.section, { backgroundColor: cardColor }]}>
                <Text style={[styles.sectionTitle, { color: subtextColor }]}>Account</Text>
                <SettingItem
                    icon="trash.fill"
                    label={
                        pauseAccountMutation.isPending
                            ? 'Pausing Account...'
                            : deleteAccountMutation.isPending
                                ? 'Deleting Account...'
                                : 'Pause or Delete Account'
                    }
                    onPress={handleAccountAction}
                    danger
                />
            </View>

            <View style={styles.footer}>
                <Text style={[styles.version, { color: subtextColor }]}>Version 1.0.0</Text>
            </View>
            <CustomAlert
                visible={showAccountActionAlert}
                title="Leave your account?"
                message="You can pause your account and come back later, or permanently delete everything now."
                icon="trash.fill"
                onClose={() => setShowAccountActionAlert(false)}
                primaryButton={{
                    text: 'Pause Account',
                    onPress: () => {
                        setShowAccountActionAlert(false);
                        setShowPauseConfirmAlert(true);
                    },
                }}
                secondaryButton={{
                    text: 'Delete Permanently',
                    onPress: () => {
                        setShowAccountActionAlert(false);
                        setShowDeleteConfirmAlert(true);
                    },
                }}
                tertiaryButton={{
                    text: 'Cancel',
                    onPress: () => setShowAccountActionAlert(false),
                }}
            />

            <CustomAlert
                visible={showPauseConfirmAlert}
                title="Pause account?"
                message="Your account will be hidden and you will be signed out. Logging in again will reactivate it."
                icon="person.fill"
                onClose={() => setShowPauseConfirmAlert(false)}
                primaryButton={{
                    text: 'Pause',
                    onPress: () => {
                        setShowPauseConfirmAlert(false);
                        pauseAccountMutation.mutate();
                    },
                }}
                secondaryButton={{
                    text: 'Cancel',
                    onPress: () => setShowPauseConfirmAlert(false),
                }}
            />

            <CustomAlert
                visible={showDeleteConfirmAlert}
                title="Delete account permanently?"
                message="This will permanently remove your account and related data. This action cannot be undone."
                icon="trash.fill"
                onClose={() => setShowDeleteConfirmAlert(false)}
                primaryButton={{
                    text: 'Delete',
                    onPress: () => {
                        setShowDeleteConfirmAlert(false);
                        deleteAccountMutation.mutate();
                    },
                }}
                secondaryButton={{
                    text: 'Cancel',
                    onPress: () => setShowDeleteConfirmAlert(false),
                }}
            />
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
        marginBottom: 4,
    },
    creatorLine: {
        fontSize: 11,
    }
});
