import React from 'react';
import { type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Text } from '@/components/ui/text';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'heading';
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className = '',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const getStyle = () => {
    switch (type) {
      case 'title':
        return 'text-3xl font-extrabold uppercase tracking-widest leading-9';
      case 'heading':
        return 'text-2xl font-extrabold uppercase tracking-widest leading-8';
      case 'subtitle':
        return 'text-xl font-bold leading-7';
      case 'defaultSemiBold':
        return 'text-base font-semibold leading-6';
      case 'link':
        return 'text-base font-medium text-primary-500 underline';
      case 'default':
      default:
        return 'text-base font-normal leading-6';
    }
  };

  return (
    <Text
      className={`${getStyle()} ${className}`}
      style={[{ color }, style]}
      {...rest}
    />
  );
}
