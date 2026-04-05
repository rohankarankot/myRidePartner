import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';

type SkeletonProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = '100%',
  height,
  borderRadius = 12,
  style,
}: SkeletonProps) {
  const baseColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'border');
  const highlightColor = useThemeColor({ light: '#F8FAFC', dark: '#4B5563' }, 'border');
  const shimmerX = useSharedValue(-140);
  const [containerWidth, setContainerWidth] = useState(0);
  const shimmerWidth = 120;

  useEffect(() => {
    if (!containerWidth) {
      return;
    }

    shimmerX.value = -shimmerWidth;
    shimmerX.value = withRepeat(
      withTiming(containerWidth + shimmerWidth, {
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
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
    transform: [{ translateX: shimmerX.value }, { rotate: '14deg' }],
  }));

  const containerStyle = useMemo(
    () => [
      styles.base,
      {
        width,
        height,
        borderRadius,
        backgroundColor: baseColor,
      },
      style,
    ],
    [baseColor, borderRadius, height, style, width]
  );

  return (
    <View style={containerStyle} onLayout={handleLayout}>
      {containerWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmer,
            {
              width: shimmerWidth,
              backgroundColor: highlightColor,
            },
            shimmerStyle,
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: -24,
    bottom: -24,
    opacity: 0.55,
  },
});
