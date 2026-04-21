import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import ThemeProvider from "@/src/backoffice/components/themes/theme-provider";
import { ActiveThemeProvider } from "@/src/backoffice/components/themes/active-theme";

export const metadata: Metadata = {
  title: "My Ride Partner",
  description: "Shared city rides made simpler with easy publishing, trip sharing, and rider coordination.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeTheme = cookieStore.get("active_theme")?.value;

  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ActiveThemeProvider initialTheme={activeTheme}>
            {children}
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
