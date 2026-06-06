import Link from 'next/link';
import { ThemeModeToggle } from "@/src/backoffice/components/themes/theme-mode-toggle";

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      body: 'We collect information you provide directly to us, such as your name and email through Google Sign-In. To facilitate ride-sharing, we collect your precise geographical location (GPS) while the app is in use. This data is essential for matching you with nearby partners and calculating trip distances.',
    },
    {
      title: '2. Location Data & Permissions',
      body: 'Cab Collab requires access to your location to provide core carpooling features. We use this information to: (a) match you with nearby riders or drivers, (b) help you select accurate pickup and drop-off points, and (c) provide real-time trip tracking for safety. This data is only visible to your trip partners during a live ride.',
    },
    {
      title: '3. Data Usage & Advertising',
      body: 'Your data is used to facilitate communication between members and improve our services. We use Google AdMob to show ads. AdMob may use your device identifiers and location to serve relevant ads. You can manage your ad preferences in your device settings.',
    },
    {
      title: '4. Third-Party Services',
      body: 'We use Google Firebase for authentication and analytics. These services help us secure your account and understand app stability. By using Cab Collab, you also agree to the 3rd-party privacy policies of Google and AdMob.',
    },
    {
      title: '5. Account Deletion',
      body: 'You have the right to access, update, or delete your account information at any time. To request full deletion of your account and associated data, please visit our Account Deletion page or contact us at rohan.alwayscodes@gmail.com.',
    },
    {
      title: '6. Contact Us',
      body: 'If you have questions regarding this Privacy Policy or any technical issues, please contact us at rohan.alwayscodes@gmail.com.',
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col justify-between">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 flex-1 flex flex-col justify-between">
        {/* Header/Navbar */}
        <nav className="flex items-center justify-between py-8">
          <Link href="/" className="flex flex-col hover:opacity-95 transition-all">
            <span className="text-xl font-bold tracking-tight text-primary">
              Cab Collab
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Shared City Commute
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeModeToggle />
            <a
              href="https://play.google.com/store/apps/details?id=com.rohanalwayscodes.myridepartner"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </a>
          </div>
        </nav>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto py-12 sm:py-16">
          <div className="text-center sm:text-left mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              At Cab Collab, we are committed to protecting your privacy and
              ensuring a safe carpooling experience. This policy explains how we
              collect, use, and safeguard your data.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[2.5rem] border border-border bg-card/60 p-8 shadow-md backdrop-blur-md transition-all hover:shadow-lg lg:p-12"
              >
                <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
                  {section.title}
                </h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground lg:text-lg">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="text-center sm:text-left">
            <p className="font-bold text-foreground mb-1">Cab Collab</p>
            <p className="text-sm text-muted-foreground">© 2026 MH13 Community. All rights reserved.</p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/delete-account" className="hover:text-primary transition-colors">Delete Account</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <a href="mailto:rohan.alwayscodes@gmail.com" className="hover:text-primary transition-colors">Contact Support</a>
          </div>
        </footer>
      </div>

      {/* Mobile Floating Theme Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex sm:hidden items-center gap-2 rounded-2xl border border-border bg-background/60 p-1.5 backdrop-blur-xl shadow-2xl">
        <ThemeModeToggle />
      </div>
    </main>
  );
}
