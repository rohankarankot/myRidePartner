/**
 * Shared theme tokens for app-owned surfaces.
 */

import { Platform } from 'react-native';

export type ThemePalette = 'ember' | 'blue';

const emberColors = {
  light: {
    text: '#2F2320',
    background: '#F4E7DE',
    tint: '#F06539',
    icon: '#8A736B',
    tabIconDefault: '#8A736B',
    tabIconSelected: '#F06539',
    subtext: '#7E6760',
    card: '#FFF4EE',
    primary: '#F06539',
    success: '#C98B2C',
    successBg: 'rgba(255, 215, 153, 0.22)',
    danger: '#D96B5B',
    dangerBg: 'rgba(255, 179, 172, 0.24)',
    border: 'rgba(111, 88, 80, 0.15)',
  },
  dark: {
    text: '#E2E2E6',
    background: '#111316',
    tint: '#FFB59F',
    icon: '#A6948D',
    tabIconDefault: '#7D6B66',
    tabIconSelected: '#FFB59F',
    subtext: '#B6A39E',
    card: '#1B1F23',
    primary: '#F06539',
    success: '#FFD799',
    successBg: 'rgba(255, 215, 153, 0.16)',
    danger: '#FFB3AC',
    dangerBg: 'rgba(255, 179, 172, 0.16)',
    border: 'rgba(162, 124, 112, 0.15)',
  },
} as const;

const blueColors = {
  light: {
    text: '#11181C',
    background: '#F5F7FA',
    tint: '#0A7EA4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0A7EA4',
    subtext: '#6B7280',
    card: '#FFFFFF',
    primary: '#2563EB',
    success: '#16A34A',
    successBg: '#DCFCE7',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    border: '#E5E7EB',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#3B82F6',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#3B82F6',
    subtext: '#9CA3AF',
    card: '#1F2937',
    primary: '#3B82F6',
    success: '#22C55E',
    successBg: '#065F46',
    danger: '#EF4444',
    dangerBg: '#7F1D1D',
    border: '#374151',
  },
} as const;

export const ThemeColors = {
  ember: emberColors,
  blue: blueColors,
} as const;

export const Colors = emberColors;

export function getThemeColors(palette: ThemePalette = 'ember') {
  return ThemeColors[palette] ?? ThemeColors.ember;
}

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Plus Jakarta Sans',
    serif: 'serif',
    rounded: 'Plus Jakarta Sans',
    mono: 'monospace',
  },
  web: {
    sans: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Plus Jakarta Sans', 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
