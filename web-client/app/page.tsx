'use client';

import { ThemeModeToggle } from "@/src/backoffice/components/themes/theme-mode-toggle";
import { ThemeSelector } from "@/src/backoffice/components/themes/theme-selector";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">
              My Ride Partner
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Shared rides for everyday city travel
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSelector />
            <ThemeModeToggle />
            <a
              className="hidden rounded-full border border-slate-300/70 bg-secondary/70 px-5 py-3 text-sm font-semibold text-secondary-foreground shadow-sm backdrop-blur transition hover:border-primary/50 hover:text-primary sm:block"
              href="#download"
            >
              Download App
            </a>
          </div>
        </header>

        <div className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">

          <div className="max-w-2xl">

            <div className="inline-flex rounded-full border border-amber-300/70 bg-amber-50/10 px-4 py-2 text-sm font-medium text-amber-600 shadow-sm backdrop-blur dark:bg-amber-900/20 dark:text-amber-400">
              Publish rides, share links, and fill seats faster
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Plan city rides with people already going your way.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              My Ride Partner helps commuters connect around the same
              route, split travel costs fairly, and keep trip coordination in
              one simple app.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Download button is a placeholder for now. We can wire it to an
              APK or Play Store link later.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-x-10 top-4 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-border bg-card/80 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.1)] backdrop-blur">
              <div className="mt-10 flex flex-col justify-between gap-4 w-full">
                <a
                  id="download"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:opacity-90"
                  href="#"
                >
                  Download APK Soon
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-full border border-input bg-secondary/50 px-7 py-4 text-base font-semibold text-secondary-foreground transition hover:bg-secondary"
                  href="mailto:rohan.alwayscodes@gmail.com"
                >
                  Contact Us
                </a>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-amber-50 p-5">
                  <p className="text-sm font-semibold text-amber-900">
                    Publish rides
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Add route, seats, timing, and price in a few taps.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-sky-50 p-5">
                  <p className="text-sm font-semibold text-sky-900">
                    Share anywhere
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Send ride links through WhatsApp or regular text.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-emerald-50 p-5">
                  <p className="text-sm font-semibold text-emerald-900">
                    Ride together
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Keep trip requests and conversations organized.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 border-t border-border py-8 text-sm text-muted-foreground sm:grid-cols-4">
          <div>
            <p className="font-semibold text-foreground">Built for commuters</p>
            <p className="mt-2 text-balance">Designed for short-distance shared travel in Indian cities.</p>
          </div>
          <a
            className="text-left transition hover:text-primary"
            href="mailto:rohan.alwayscodes@gmail.com"
          >
            <p className="font-semibold text-foreground">Early access</p>
            <p className="mt-2">Want test builds? Reach out and we can share the app manually.</p>
          </a>
          <div>
            <p className="font-semibold text-foreground">Privacy & Policy</p>
            <p className="mt-2 text-balance">Read how we protect your data in our <a href="/privacy" className="font-medium text-primary underline underline-offset-4 transition-colors hover:opacity-80">Privacy Policy</a>.</p>
          </div>
          <div className="sm:text-right">
            <p className="font-semibold text-foreground">Next up</p>
            <p className="mt-2 text-balance">This site will also host shared trip pages for deep linking.</p>
          </div>
        </section>
      </section>
    </main>
  );
}
