/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { getThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/store/theme-store';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ReturnType<typeof getThemeColors>['light'] & keyof ReturnType<typeof getThemeColors>['dark']
) {
  const theme = useColorScheme();
  const palette = useThemeStore((state) => state.palette);
  const activeTheme = theme === 'dark' ? 'dark' : 'light';
  const colors = getThemeColors(palette);
  const colorFromProps = props[activeTheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[activeTheme][colorName];
  }
}
