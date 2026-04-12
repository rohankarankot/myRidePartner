import { useEffect } from 'react';
import type { MutableRefObject, PropsWithChildren, ReactElement } from 'react';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';

type Props = PropsWithChildren<{
  contentClassName?: string;
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  headerHeight?: number;
  scrollRefOverride?: MutableRefObject<{
    scrollTo?: (options: { x?: number; y?: number; animated?: boolean }) => void;
    scrollToEnd?: (options?: { animated?: boolean }) => void;
  } | null>;
}>;

export default function ParallaxScrollView({
  contentClassName = 'flex-1 p-8 pb-10',
  children,
  headerImage,
  headerBackgroundColor,
  headerHeight = 250,
  scrollRefOverride,
}: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  useEffect(() => {
    if (!scrollRefOverride) {
      return;
    }

    scrollRefOverride.current = {
      scrollTo: (options) => scrollRef.current?.scrollTo(options),
      scrollToEnd: (options) => scrollRef.current?.scrollToEnd(options),
    };

    return () => {
      scrollRefOverride.current = null;
    };
  }, [scrollRef, scrollRefOverride]);
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [-headerHeight / 2, 0, headerHeight * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-headerHeight, 0, headerHeight], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}
    >
      <Animated.View
        className="overflow-hidden"
        style={[
          { height: headerHeight, backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}
      >
        {headerImage}
      </Animated.View>
      <Box className={contentClassName} style={{ gap: 16 }}>
        {children}
      </Box>
    </Animated.ScrollView>
  );
}
