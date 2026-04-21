import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import Providers from '@bo/components/layout/providers';
import { Toaster } from '@bo/components/ui/sonner';
import { fontVariables } from '@bo/components/themes/font.config';
import { DEFAULT_THEME } from '@bo/components/themes/theme.config';
import ThemeProvider from '@bo/components/themes/theme-provider';
import { cn } from '@bo/lib/utils';
import '../../src/backoffice/styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
};

export const metadata: Metadata = {
  title: 'My Ride Partner Backoffice',
  description: 'Backoffice admin dashboard for My Ride Partner',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
};

export default async function BackofficeLayout({
  children,
}: LayoutProps<'/backoffice'>) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const themeToApply = activeThemeValue || DEFAULT_THEME;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
              }
            } catch (_) {}
          `,
        }}
      />
      <div
        data-theme={themeToApply}
        className={cn(
          'bg-background min-h-screen overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables,
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </div>
    </>
  );
}
