import React from 'react';
import { ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';

type AppCardProps = ViewProps & {
  padded?: boolean;
};

export function AppCard({ className, padded = true, style, ...rest }: AppCardProps) {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box
      className={`rounded-[32px] border-2 shadow-sm ${padded ? 'p-6' : ''} ${className || ''}`}
      style={[{ backgroundColor, borderColor }, style]}
      {...rest}
    />
  );
}
