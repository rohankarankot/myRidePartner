import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Ride Partner",
  description: "Shared city rides made simpler with easy publishing, trip sharing, and rider coordination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
