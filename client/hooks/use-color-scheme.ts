import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useThemeStore } from '@/store/theme-store';

export function useColorScheme() {
    const nativeColorScheme = useNativeColorScheme();
    const theme = useThemeStore((state) => state.theme);

    if (theme === 'system') {
        return nativeColorScheme ?? 'light';
    }

    return theme ?? 'light';
}
