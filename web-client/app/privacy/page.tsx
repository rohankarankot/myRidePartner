import Link from 'next/link';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      body: 'We collect information you provide directly to us, such as your name, email, phone number, and profile picture. As a carpooling app, we also collect trip-related details, location data, and push notification tokens to match you with rides, track trips securely, and provide real-time updates.',
    },
    {
      title: '2. Location Data & Permissions',
      body: 'My Ride Partner requires access to your location to provide core carpooling features. We use this information to: (a) match you with nearby riders or drivers, (b) help you select accurate pickup and drop-off points, and (c) provide real-time trip tracking for safety. This data is only active and shared with your trip partners when you are participating in a live ride.',
    },
    {
      title: '3. How We Use Your Information',
      body: 'Your information is used to facilitate carpooling, ensure user safety, communicate ride updates, and improve our services. For your privacy, your precise location is only visible to others while a trip is in progress.',
    },
    {
      title: '4. Data Sharing and Security',
      body: 'We do not sell your personal data. Your profile information such as name, avatar, and ratings is visible to other users to build trust and safety in the community. We implement standard security measures to protect your data from unauthorized access.',
    },
    {
      title: '5. Your Rights',
      body: 'You have the right to access, update, or delete your account information at any time through the app\'s account settings. You can also withdraw consent for location tracking via your device settings, though this may limit app functionality.',
    },
    {
      title: '6. Contact Us',
      body: 'If you have questions regarding this Privacy Policy, please contact us at rohan.alwayscodes@gmail.com.',
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,216,138,0.3),_transparent_28%),linear-gradient(160deg,_#fffaf1_0%,_#fff4e3_38%,_#f3f7ff_100%)] text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10 lg:px-12 lg:py-20">
        <header className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all group-hover:border-sky-300 group-hover:bg-sky-50">
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
                className="text-slate-600 transition-colors group-hover:text-sky-600"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-sky-700">
              Back to Home
            </span>
          </Link>
          <div className="text-right">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.32em] text-sky-700">
              Legal
            </p>
          </div>
        </header>

        <div className="mt-16 sm:mt-24">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            At My Ride Partner, we are committed to protecting your privacy and
            ensuring a safe carpooling experience. This policy explains how we
            collect, use, and safeguard your data.
          </p>
        </div>

        <div className="mt-16 space-y-8 lg:mt-24">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-[0_15px_40px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)] lg:p-12"
            >
              <h2 className="text-xl font-semibold text-slate-900 lg:text-2xl">
                {section.title}
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-600 lg:text-lg">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-20 border-t border-slate-200/80 pt-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Last Updated: March 2026
          </p>
          <p className="mt-4 text-sm text-slate-400">
            &copy; 2026 My Ride Partner. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
