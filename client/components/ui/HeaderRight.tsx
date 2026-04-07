import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from './icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getThemeColors } from '@/constants/theme';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { notificationService } from '@/services/notification-service';
import { useThemeStore } from '@/store/theme-store';

type HeaderRightProps = {
    type?: 'notifications' | 'settings';
};

export function HeaderRight({ type = 'notifications' }: HeaderRightProps) {
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const palette = useThemeStore((state) => state.palette);
    const colors = getThemeColors(palette)[colorScheme ?? 'light'];
    const tintColor = colors.tint;

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['unread-notifications-count', user?.id],
        queryFn: () => notificationService.getUnreadCount(user!.id),
        enabled: !!user?.id && type === 'notifications',
    });

    const onPress = () => {
        if (type === 'notifications') {
            router.push('/notifications');
        } else {
            router.push('/settings');
        }
    };

    const iconName = type === 'notifications' ? 'bell.fill' : 'gearshape.fill';

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.container}
            activeOpacity={0.7}
        >
            <IconSymbol name={iconName} size={24} color={tintColor} />
            {type === 'notifications' && unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
});
