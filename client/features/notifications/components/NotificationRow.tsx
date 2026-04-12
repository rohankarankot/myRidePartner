import React from 'react';
import { Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type NotificationRowProps = {
  borderColor: string;
  cardColor: string;
  confirmDelete: (documentId: string) => void;
  dangerColor: string;
  getIconForType: (type: string) => any;
  item: Notification;
  onPress: (notification: Notification) => void;
  primaryColor: string;
  subtextColor: string;
  swipeableRefs: React.MutableRefObject<Record<string, Swipeable | null>>;
  textColor: string;
};

export function NotificationRow({
  borderColor,
  cardColor,
  confirmDelete,
  getIconForType,
  item,
  onPress,
  primaryColor,
  subtextColor,
  swipeableRefs,
  textColor,
}: NotificationRowProps) {
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _drag: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1], extrapolate: 'clamp' });
    return (
      <Pressable
        style={{ backgroundColor: '#EF4444', width: 80, borderRadius: 28, marginBottom: 12, justifyContent: 'center', alignItems: 'center' }}
        onPress={() => confirmDelete(item.documentId)}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
          <IconSymbol name="trash.fill" size={24} color="#fff" />
          <Text className="text-[10px] font-extrabold uppercase mt-1 text-white">Delete</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={(ref) => {
        swipeableRefs.current[item.documentId] = ref;
      }}
      renderRightActions={renderRightActions}
      rightThreshold={60}
      overshootRight={false}
      friction={2}
    >
      <Pressable
        className="rounded-[32px] p-5 mb-3 border shadow-sm"
        style={{ backgroundColor: cardColor, borderColor }}
        onPress={() => onPress(item)}
      >
        <HStack className="items-start" space="md">
          <Box
            className="w-12 h-12 rounded-2xl items-center justify-center border shadow-sm"
            style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}
          >
            <IconSymbol name={getIconForType(item.type)} size={20} color={primaryColor} />
          </Box>

          <VStack className="flex-1">
            <HStack className="items-center justify-between mb-2">
              <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                {item.type.replace('_', ' ')}
              </Text>
              <Text className="text-[9px] font-bold uppercase" style={{ color: subtextColor }}>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </Text>
            </HStack>
            <Text className="text-sm font-medium leading-6" style={{ color: textColor }}>
              {item.message}
            </Text>
          </VStack>

          {!item.read ? (
            <Box className="w-2.5 h-2.5 rounded-full mt-1.5 shadow-sm border-2" style={{ backgroundColor: primaryColor, borderColor: '#fff' }} />
          ) : null}
        </HStack>
      </Pressable>
    </Swipeable>
  );
}
