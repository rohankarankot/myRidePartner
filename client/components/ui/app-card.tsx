import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Radius, Shadows, Spacing } from '@/constants/ui';

type AppCardProps = ViewProps & {
  padded?: boolean;
};

export function AppCard({ style, padded = true, ...rest }: AppCardProps) {
  const backgroundColor = useThemeColor({}, 'card');

  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        { backgroundColor },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    ...Shadows.card,
  },
  padded: {
    padding: Spacing.lg,
  },
});
