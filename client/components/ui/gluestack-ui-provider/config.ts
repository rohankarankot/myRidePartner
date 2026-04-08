'use client';

import { vars } from 'nativewind';

import { getThemeColors, ThemePalette } from '@/constants/theme';

type RGB = { r: number; g: number; b: number };

const SHADE_STOPS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const LIGHT_TINTS = [0.94, 0.88, 0.76, 0.64, 0.48, 0.22, 0, 0.12, 0.26, 0.42, 0.58, 0.74] as const;
const DARK_TINTS = [0.74, 0.58, 0.42, 0.26, 0.12, 0, 0.22, 0.48, 0.64, 0.76, 0.88, 0.94] as const;

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex: string): RGB {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function mixColors(a: string, b: string, weight: number) {
  const start = hexToRgb(a);
  const end = hexToRgb(b);

  return {
    r: clampChannel(start.r * (1 - weight) + end.r * weight),
    g: clampChannel(start.g * (1 - weight) + end.g * weight),
    b: clampChannel(start.b * (1 - weight) + end.b * weight),
  };
}

function toRgbString(color: RGB) {
  return `${color.r} ${color.g} ${color.b}`;
}

function buildScale(prefix: string, base: string, isDark: boolean): Record<string, string> {
  const stops = isDark ? DARK_TINTS : LIGHT_TINTS;

  return Object.fromEntries(
    SHADE_STOPS.map((stop, index) => {
      const mixWith = index <= 5 ? '#FFFFFF' : '#000000';
      const value = toRgbString(mixColors(base, mixWith, stops[index]));
      return [`--color-${prefix}-${stop}`, value];
    })
  );
}

function buildNeutralScale(prefix: string, base: string, contrast: string, isDark: boolean) {
  const mixTargets = isDark
    ? ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', contrast, contrast, contrast, contrast, contrast, '#FFFFFF']
    : ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#000000', '#000000', '#000000', '#000000', contrast, '#000000'];

  const stops = isDark ? DARK_TINTS : LIGHT_TINTS;

  return Object.fromEntries(
    SHADE_STOPS.map((stop, index) => {
      const value = toRgbString(mixColors(base, mixTargets[index], stops[index]));
      return [`--color-${prefix}-${stop}`, value];
    })
  );
}

function paletteVars(palette: ThemePalette, mode: 'light' | 'dark') {
  const colors = getThemeColors(palette)[mode];
  const isDark = mode === 'dark';

  return vars({
    ...buildScale('primary', colors.primary, isDark),
    ...buildScale('secondary', colors.secondary, isDark),
    ...buildScale('tertiary', colors.tertiary, isDark),
    ...buildScale('error', colors.danger, isDark),
    ...buildScale('success', colors.success, isDark),
    ...buildScale('warning', colors.secondary, isDark),
    ...buildNeutralScale('info', colors.subtext, colors.text, isDark),
    ...buildNeutralScale('typography', colors.text, colors.background, isDark),
    ...buildNeutralScale('outline', colors.icon, colors.text, isDark),
    ...buildNeutralScale('background', colors.surfaceContainerLow, colors.text, isDark),

    '--color-background-error': toRgbString(hexToRgb(colors.danger)),
    '--color-background-warning': toRgbString(hexToRgb(colors.secondaryContainer)),
    '--color-background-success': toRgbString(hexToRgb(colors.secondaryContainer)),
    '--color-background-muted': toRgbString(hexToRgb(colors.surfaceContainer)),
    '--color-background-info': toRgbString(hexToRgb(colors.surfaceContainerHigh)),

    '--color-indicator-primary': toRgbString(hexToRgb(colors.primary)),
    '--color-indicator-info': toRgbString(hexToRgb(colors.labelAccent)),
    '--color-indicator-error': toRgbString(hexToRgb(colors.danger)),
  });
}

export function getGluestackConfig(palette: ThemePalette) {
  return {
    light: paletteVars(palette, 'light'),
    dark: paletteVars(palette, 'dark'),
  };
}
