import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';

type SkeletonProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function Skeleton({
  width = '100%',
  height,
  borderRadius = 12,
  style,
  className,
}: SkeletonProps) {
  const baseColor = useThemeColor({ light: '#E5E7EB', dark: '#1F2937' }, 'border');
  const highlightColor = useThemeColor({ light: '#F9FAFB', dark: '#374151' }, 'border');
  const shimmerX = useSharedValue(-140);
  const [containerWidth, setContainerWidth] = useState(0);
  const shimmerWidth = 140;

  useEffect(() => {
    if (!containerWidth) {
      return;
    }

    shimmerX.value = -shimmerWidth;
    shimmerX.value = withRepeat(
      withTiming(containerWidth + shimmerWidth, {
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(shimmerX);
    };
  }, [containerWidth, shimmerWidth, shimmerX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth && nextWidth !== containerWidth) {
      setContainerWidth(nextWidth);
    }
  };

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }, { rotate: '15deg' }],
  }));

  return (
    <Box 
        onLayout={handleLayout}
        className={`overflow-hidden ${className || ''}`}
        style={[{
            width,
            height,
            borderRadius,
            backgroundColor: baseColor,
        }, style]}
    >
      {containerWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[{
                position: 'absolute',
                top: -30,
                bottom: -30,
                opacity: 0.5,
                width: shimmerWidth,
                backgroundColor: highlightColor,
              },
            shimmerStyle,
          ]}
        />
      ) : null}
    </Box>
  );
}
