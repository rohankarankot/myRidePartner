import { SessionProvider } from 'next-auth/react';
import { useTheme } from 'next-themes';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <SessionProvider basePath='/backoffice/api/auth'>
          {children}
        </SessionProvider>
      </ActiveThemeProvider>
    </>
  );
}
