import Link from 'next/link';
import { ThemeModeToggle } from "@/src/backoffice/components/themes/theme-mode-toggle";
import { ThemeSelector } from "@/src/backoffice/components/themes/theme-selector";

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      body: 'We collect information you provide directly to us, such as your name and email through Google Sign-In. To facilitate ride-sharing, we collect your precise geographical location (GPS) while the app is in use. This data is essential for matching you with nearby partners and calculating trip distances.',
    },
    {
      title: '2. Location Data & Permissions',
      body: 'My Ride Partner requires access to your location to provide core carpooling features. We use this information to: (a) match you with nearby riders or drivers, (b) help you select accurate pickup and drop-off points, and (c) provide real-time trip tracking for safety. This data is only visible to your trip partners during a live ride.',
    },
    {
      title: '3. Data Usage & Advertising',
      body: 'Your data is used to facilitate communication between members and improve our services. We use Google AdMob to show ads. AdMob may use your device identifiers and location to serve relevant ads. You can manage your ad preferences in your device settings.',
    },
    {
      title: '4. Third-Party Services',
      body: 'We use Google Firebase for authentication and analytics. These services help us secure your account and understand app stability. By using My Ride Partner, you also agree to the 3rd-party privacy policies of Google and AdMob.',
    },
    {
      title: '5. Account Deletion',
      body: 'You have the right to access, update, or delete your account information at any time. To request full deletion of your account and associated data, please contact us at rohan.alwayscodes@gmail.com. We will process your request within 48 hours.',
    },
    {
      title: '6. Contact Us',
      body: 'If you have questions regarding this Privacy Policy or any technical issues, please contact us at rohan.alwayscodes@gmail.com.',
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10 lg:px-12 lg:py-20">
        <header className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground transition-colors group-hover:text-primary"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-primary">
              Back to Home
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <ThemeModeToggle />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.32em] text-primary">
                Legal
              </p>
            </div>
          </div>
        </header>

        <div className="mt-16 sm:mt-24">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            At My Ride Partner, we are committed to protecting your privacy and
            ensuring a safe carpooling experience. This policy explains how we
            collect, use, and safeguard your data.
          </p>
        </div>

        <div className="mt-16 space-y-8 lg:mt-24">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[2.5rem] border border-border bg-card/60 p-8 shadow-md backdrop-blur-md transition-all hover:shadow-lg lg:p-12"
            >
              <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                {section.title}
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground lg:text-lg">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-20 border-t border-border pt-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Last Updated: April 2026
          </p>
          <p className="mt-4 text-sm text-muted-foreground/60">
            &copy; 2026 My Ride Partner. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Mobile Floating Theme Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex sm:hidden items-center gap-2 rounded-2xl border border-border bg-background/60 p-1.5 backdrop-blur-xl shadow-2xl">
        <ThemeModeToggle />
      </div>
    </main>
  );
}
