import React from 'react';
import { useRouter } from 'expo-router';
import { IconSymbol } from './icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getThemeColors } from '@/constants/theme';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { notificationService } from '@/services/notification-service';
import { useThemeStore } from '@/store/theme-store';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

type HeaderRightProps = {
    type?: 'notifications' | 'settings' | 'chats';
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
        } else if (type === 'settings') {
            router.push('/settings');
        } else if (type === 'chats') {
            router.push('/chats');
        }
    };

    const iconName = 
        type === 'notifications' 
            ? 'bell.fill' 
            : type === 'settings' 
                ? 'gearshape.fill' 
                : 'bubble.left.and.bubble.right.fill';

    return (
        <Pressable
            onPress={onPress}
            className="mr-4 w-10 h-10 rounded-full items-center justify-center border shadow-xs"
            style={{ backgroundColor: `${colors.primary}10`, borderColor: colors.border }}
        >
            <IconSymbol name={iconName} size={20} color={tintColor} />
            {type === 'notifications' && unreadCount > 0 && (
                <Box 
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full items-center justify-center px-1 border-2"
                    style={{ backgroundColor: colors.primary, borderColor: colors.background }}
                >
                    <Text className="text-white text-[9px] font-extrabold uppercase">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                </Box>
            )}
        </Pressable>
    );
}
