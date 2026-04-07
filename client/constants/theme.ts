/**
 * Shared theme tokens for app-owned surfaces.
 */

import { Platform } from 'react-native';

export type ThemePalette = 'ember' | 'blue' | 'cyber' | 'forest';

type ThemeColorTokens = {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  subtext: string;
  card: string;
  primary: string;
  primaryDim: string;
  primaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  tertiary: string;
  tertiaryContainer: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  border: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceVariant: string;
  surfaceVariantMuted: string;
  outlineVariant: string;
  glassStroke: string;
  innerGlow: string;
  glow: string;
  labelAccent: string;
};

type ThemePaletteConfig = {
  light: ThemeColorTokens;
  dark: ThemeColorTokens;
};

export const PaletteOptions: ReadonlyArray<{
  id: ThemePalette;
  label: string;
  swatch: string;
}> = [
  { id: 'blue', label: 'Blue', swatch: '#2563EB' },
  { id: 'forest', label: 'Forest', swatch: '#4EDEA3' },
  { id: 'cyber', label: 'Cyber Pulse', swatch: '#F382FF' },
  { id: 'ember', label: 'Orange', swatch: '#F06539' },
] as const;

const emberColors: ThemePaletteConfig = {
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
    primaryDim: '#F58257',
    primaryContainer: '#FFD6C7',
    secondary: '#C98B2C',
    secondaryContainer: '#FFE7B8',
    tertiary: '#D96B5B',
    tertiaryContainer: '#FFD4CE',
    success: '#C98B2C',
    successBg: 'rgba(255, 215, 153, 0.22)',
    danger: '#D96B5B',
    dangerBg: 'rgba(255, 179, 172, 0.24)',
    border: 'rgba(111, 88, 80, 0.15)',
    surface: '#F4E7DE',
    surfaceContainerLow: '#FAEFE8',
    surfaceContainer: '#FFF4EE',
    surfaceContainerHigh: '#FFF8F4',
    surfaceContainerHighest: '#FFFFFF',
    surfaceVariant: 'rgba(255, 244, 238, 0.72)',
    surfaceVariantMuted: 'rgba(244, 231, 222, 0.58)',
    outlineVariant: 'rgba(111, 88, 80, 0.18)',
    glassStroke: 'rgba(255, 255, 255, 0.65)',
    innerGlow: 'rgba(255, 255, 255, 0.28)',
    glow: 'rgba(240, 101, 57, 0.16)',
    labelAccent: '#F06539',
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
    primaryDim: '#F58257',
    primaryContainer: '#FFB59F',
    secondary: '#FFD799',
    secondaryContainer: '#5A3E12',
    tertiary: '#FFB3AC',
    tertiaryContainer: '#5A2422',
    success: '#FFD799',
    successBg: 'rgba(255, 215, 153, 0.16)',
    danger: '#FFB3AC',
    dangerBg: 'rgba(255, 179, 172, 0.16)',
    border: 'rgba(162, 124, 112, 0.15)',
    surface: '#111316',
    surfaceContainerLow: '#161A1E',
    surfaceContainer: '#1B1F23',
    surfaceContainerHigh: '#252A30',
    surfaceContainerHighest: '#2E343B',
    surfaceVariant: 'rgba(27, 31, 35, 0.72)',
    surfaceVariantMuted: 'rgba(37, 42, 48, 0.58)',
    outlineVariant: 'rgba(162, 124, 112, 0.18)',
    glassStroke: 'rgba(255, 234, 226, 0.12)',
    innerGlow: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(240, 101, 57, 0.18)',
    labelAccent: '#FFD799',
  },
};

const blueColors: ThemePaletteConfig = {
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
    primaryDim: '#3B82F6',
    primaryContainer: '#BFDBFE',
    secondary: '#0EA5E9',
    secondaryContainer: '#DBEAFE',
    tertiary: '#14B8A6',
    tertiaryContainer: '#CCFBF1',
    success: '#16A34A',
    successBg: '#DCFCE7',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    border: '#E5E7EB',
    surface: '#F5F7FA',
    surfaceContainerLow: '#EDF2F7',
    surfaceContainer: '#FFFFFF',
    surfaceContainerHigh: '#F8FAFC',
    surfaceContainerHighest: '#FFFFFF',
    surfaceVariant: 'rgba(255, 255, 255, 0.72)',
    surfaceVariantMuted: 'rgba(237, 242, 247, 0.72)',
    outlineVariant: 'rgba(148, 163, 184, 0.22)',
    glassStroke: 'rgba(255, 255, 255, 0.7)',
    innerGlow: 'rgba(255, 255, 255, 0.32)',
    glow: 'rgba(37, 99, 235, 0.12)',
    labelAccent: '#0EA5E9',
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
    primaryDim: '#60A5FA',
    primaryContainer: '#1D4ED8',
    secondary: '#38BDF8',
    secondaryContainer: '#0C4A6E',
    tertiary: '#2DD4BF',
    tertiaryContainer: '#134E4A',
    success: '#22C55E',
    successBg: '#065F46',
    danger: '#EF4444',
    dangerBg: '#7F1D1D',
    border: '#374151',
    surface: '#151718',
    surfaceContainerLow: '#1B2028',
    surfaceContainer: '#1F2937',
    surfaceContainerHigh: '#253043',
    surfaceContainerHighest: '#2E3B52',
    surfaceVariant: 'rgba(31, 41, 55, 0.72)',
    surfaceVariantMuted: 'rgba(37, 48, 67, 0.58)',
    outlineVariant: 'rgba(148, 163, 184, 0.18)',
    glassStroke: 'rgba(191, 219, 254, 0.12)',
    innerGlow: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(59, 130, 246, 0.16)',
    labelAccent: '#38BDF8',
  },
};

const cyberColors: ThemePaletteConfig = {
  light: {
    text: '#21162C',
    background: '#F7F1FB',
    tint: '#ED69FF',
    icon: '#6B6076',
    tabIconDefault: '#81768C',
    tabIconSelected: '#ED69FF',
    subtext: '#6D6278',
    card: '#FFF8FF',
    primary: '#F382FF',
    primaryDim: '#ED69FF',
    primaryContainer: '#FAD0FF',
    secondary: '#3ADFFA',
    secondaryContainer: '#C6F8FF',
    tertiary: '#8E7CFF',
    tertiaryContainer: '#E0DBFF',
    success: '#3ADFFA',
    successBg: 'rgba(58, 223, 250, 0.14)',
    danger: '#FF6FAE',
    dangerBg: 'rgba(255, 111, 174, 0.16)',
    border: 'rgba(61, 37, 87, 0.12)',
    surface: '#F7F1FB',
    surfaceContainerLow: '#EFE5F8',
    surfaceContainer: '#FFF8FF',
    surfaceContainerHigh: '#FFFFFF',
    surfaceContainerHighest: '#FFFFFF',
    surfaceVariant: 'rgba(255, 248, 255, 0.62)',
    surfaceVariantMuted: 'rgba(239, 229, 248, 0.72)',
    outlineVariant: 'rgba(61, 37, 87, 0.16)',
    glassStroke: 'rgba(255, 255, 255, 0.72)',
    innerGlow: 'rgba(255, 255, 255, 0.35)',
    glow: 'rgba(243, 130, 255, 0.18)',
    labelAccent: '#3ADFFA',
  },
  dark: {
    text: '#F2DFFF',
    background: '#0E0E0E',
    tint: '#F382FF',
    icon: '#AFA1BC',
    tabIconDefault: '#7B7286',
    tabIconSelected: '#F382FF',
    subtext: '#B7ABC3',
    card: '#1A1919',
    primary: '#F382FF',
    primaryDim: '#ED69FF',
    primaryContainer: '#D14BFF',
    secondary: '#3ADFFA',
    secondaryContainer: '#113842',
    tertiary: '#8E7CFF',
    tertiaryContainer: '#241D4B',
    success: '#3ADFFA',
    successBg: 'rgba(58, 223, 250, 0.12)',
    danger: '#FF7AAA',
    dangerBg: 'rgba(255, 122, 170, 0.14)',
    border: 'rgba(242, 223, 255, 0.06)',
    surface: '#0E0E0E',
    surfaceContainerLow: '#131313',
    surfaceContainer: '#1A1919',
    surfaceContainerHigh: '#201F1F',
    surfaceContainerHighest: '#292727',
    surfaceVariant: 'rgba(26, 25, 25, 0.6)',
    surfaceVariantMuted: 'rgba(19, 19, 19, 0.82)',
    outlineVariant: 'rgba(242, 223, 255, 0.15)',
    glassStroke: 'rgba(58, 223, 250, 0.24)',
    innerGlow: 'rgba(242, 223, 255, 0.14)',
    glow: 'rgba(243, 130, 255, 0.2)',
    labelAccent: '#3ADFFA',
  },
};

const forestColors: ThemePaletteConfig = {
  light: {
    text: '#162033',
    background: '#EDF4EE',
    tint: '#10B981',
    icon: '#647287',
    tabIconDefault: '#738197',
    tabIconSelected: '#10B981',
    subtext: '#5E6A7E',
    card: '#F7FBF8',
    primary: '#4EDEA3',
    primaryDim: '#10B981',
    primaryContainer: '#0F9F71',
    secondary: '#FFB95F',
    secondaryContainer: '#EE9800',
    tertiary: '#F97316',
    tertiaryContainer: '#FED7AA',
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.14)',
    danger: '#F97352',
    dangerBg: 'rgba(249, 115, 82, 0.14)',
    border: 'rgba(22, 32, 51, 0.1)',
    surface: '#EDF4EE',
    surfaceContainerLow: '#E4EDE6',
    surfaceContainer: '#F7FBF8',
    surfaceContainerHigh: '#FFFFFF',
    surfaceContainerHighest: '#FFFFFF',
    surfaceVariant: 'rgba(247, 251, 248, 0.7)',
    surfaceVariantMuted: 'rgba(228, 237, 230, 0.76)',
    outlineVariant: 'rgba(22, 32, 51, 0.16)',
    glassStroke: 'rgba(255, 255, 255, 0.72)',
    innerGlow: 'rgba(255, 255, 255, 0.34)',
    glow: 'rgba(78, 222, 163, 0.18)',
    labelAccent: '#D97706',
  },
  dark: {
    text: '#DAE2FD',
    background: '#0B1326',
    tint: '#4EDEA3',
    icon: '#97A5C2',
    tabIconDefault: '#697791',
    tabIconSelected: '#4EDEA3',
    subtext: '#A6B3D0',
    card: '#171F33',
    primary: '#4EDEA3',
    primaryDim: '#10B981',
    primaryContainer: '#0E9F6E',
    secondary: '#FFB95F',
    secondaryContainer: '#EE9800',
    tertiary: '#FB923C',
    tertiaryContainer: '#7C2D12',
    success: '#4EDEA3',
    successBg: 'rgba(78, 222, 163, 0.14)',
    danger: '#FF8B5E',
    dangerBg: 'rgba(255, 139, 94, 0.14)',
    border: 'rgba(218, 226, 253, 0.08)',
    surface: '#0B1326',
    surfaceContainerLow: '#111A2D',
    surfaceContainer: '#171F33',
    surfaceContainerHigh: '#222A3D',
    surfaceContainerHighest: '#2A3348',
    surfaceVariant: 'rgba(23, 31, 51, 0.6)',
    surfaceVariantMuted: 'rgba(17, 26, 45, 0.82)',
    outlineVariant: 'rgba(218, 226, 253, 0.15)',
    glassStroke: 'rgba(218, 226, 253, 0.14)',
    innerGlow: 'rgba(218, 226, 253, 0.12)',
    glow: 'rgba(78, 222, 163, 0.18)',
    labelAccent: '#FFB95F',
  },
};

export const ThemeColors = {
  ember: emberColors,
  blue: blueColors,
  cyber: cyberColors,
  forest: forestColors,
} as const;

export const Colors = blueColors;

export function getThemeColors(palette: ThemePalette = 'blue') {
  return ThemeColors[palette] ?? ThemeColors.blue;
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
