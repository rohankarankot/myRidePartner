'use client';

import { usePathname } from 'next/navigation';
import { useThemeConfig } from '@bo/components/themes/active-theme';
import { Label } from '@bo/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@bo/components/ui/select';

import { Icons } from '../icons';
import { THEMES } from './theme.config';

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();
  const pathname = usePathname();

  const isBackoffice = pathname?.startsWith('/backoffice');
  const themesToShow = isBackoffice
    ? THEMES
    : THEMES.filter((t) => t.value === 'blues');

  return (
    <div className='flex items-center gap-2'>
      <Label htmlFor='theme-selector' className='sr-only'>
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={setActiveTheme}>
        <SelectTrigger
          id='theme-selector'
          className='justify-start *:data-[slot=select-value]:w-24'
        >
          <span className='text-muted-foreground'>
            <Icons.palette />
          </span>
          <SelectValue placeholder='Select a theme' />
        </SelectTrigger>
        <SelectContent align='end'>
          {themesToShow.length > 0 && (
            <>
              <SelectGroup>
                <SelectLabel>themes</SelectLabel>
                {themesToShow.map((theme) => (
                  <SelectItem key={theme.name} value={theme.value}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
