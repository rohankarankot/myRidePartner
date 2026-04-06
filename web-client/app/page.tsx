export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,216,138,0.35),_transparent_28%),linear-gradient(160deg,_#fffaf1_0%,_#fff4e3_38%,_#f3f7ff_100%)] text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-700">
              My Ride Partner
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Shared rides for everyday city travel
            </p>
          </div>
          <a
            className="rounded-full border border-slate-300/70 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-sky-300 hover:text-sky-700"
            href="#download"
          >
            Download App
          </a>
        </header>

        <div className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-amber-300/70 bg-white/75 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm backdrop-blur">
              Publish rides, share links, and fill seats faster
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Plan city rides with people already going your way.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              My Ride Partner helps commuters connect around the same
              route, split travel costs fairly, and keep trip coordination in
              one simple app.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                id="download"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-sky-700"
                href="#"
              >
                Download APK Soon
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-7 py-4 text-base font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                href="mailto:hello@myridepartner.in"
              >
                Contact Us
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Download button is a placeholder for now. We can wire it to an
              APK or Play Store link later.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-x-10 top-4 h-32 rounded-full bg-sky-300/30 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.16)] backdrop-blur">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Today&apos;s featured ride</span>
                  <span>3 seats left</span>
                </div>
                <div className="mt-8">
                  <p className="text-sm uppercase tracking-[0.28em] text-sky-300">
                    Pune to Hinjawadi
                  </p>
                  <p className="mt-3 text-3xl font-semibold">8:30 AM pickup</p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                    Share ride details in WhatsApp or text, approve requests,
                    and manage fellow travelers from one place.
                  </p>
                </div>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Sharing
                    </p>
                    <p className="mt-2 text-lg font-semibold">Fast links</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Safety
                    </p>
                    <p className="mt-2 text-lg font-semibold">Profile checks</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Trips
                    </p>
                    <p className="mt-2 text-lg font-semibold">Live updates</p>
                  </div>
                </div>
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

        <section className="grid gap-4 border-t border-slate-200/80 py-8 text-sm text-slate-600 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-900">Built for commuters</p>
            <p className="mt-2">Designed for short-distance shared travel in Indian cities.</p>
          </div>
          <a
            className="text-left transition hover:text-sky-700"
            href="mailto:hello@myridepartner.in"
          >
            <p className="font-semibold text-slate-900">Early access</p>
            <p className="mt-2">Want test builds? Reach out and we can share the app manually.</p>
          </a>
          <div>
            <p className="font-semibold text-slate-900">Next up</p>
            <p className="mt-2">This site will also host shared trip pages for deep linking.</p>
          </div>
        </section>
      </section>
    </main>
  );
}
