import type { Metadata } from "next";
import Link from "next/link";

type TripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const APP_SCHEME = "myridepartner://trip";

export async function generateMetadata({
  params,
}: TripPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Trip ${id.slice(0, 8)} | My Ride Partner`,
    description:
      "Open this shared ride in My Ride Partner or continue on the web fallback page.",
  };
}

export default async function TripDetailsFallbackPage({
  params,
}: TripPageProps) {
  const { id } = await params;
  const appLink = `${APP_SCHEME}/${id}`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.18),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_48%,_#fff9ef_100%)] px-6 py-8 text-slate-900 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-between">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
              My Ride Partner
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Shared ride details
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
          >
            Back to home
          </Link>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="rounded-[2rem] border border-white/80 bg-white/88 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
              Web fallback preview
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-slate-950 sm:text-3xl">
              Someone shared a ride link with you
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              This page is the fallback destination for ride sharing. Once we
              connect the public trip API, it will show the actual route, date,
              time, seats, and captain details for this specific ride.
            </p>

            <div className="mt-8 rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-sky-300">
                Shared Trip ID
              </p>
              <p className="mt-3 break-all font-mono text-lg leading-7 text-slate-100 sm:text-xl">
                {id}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Keep this ID stable in your share links. Your mobile app already
                uses the same route shape at <span className="font-mono">/trip/[id]</span>.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-sky-50 p-5">
                <p className="text-sm font-semibold text-sky-900">
                  App installed?
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Tap the open button to jump straight into the trip details
                  screen in the mobile app.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-emerald-900">
                  App not installed?
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This website acts as the fallback so the shared link still has
                  somewhere meaningful to land.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Next action
            </p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">
              Open this ride in the app
            </h3>
            <p className="mt-4 text-base leading-7 text-slate-600">
              This button uses your custom deep link scheme for now. Later,
              we&apos;ll move your public share URL to verified universal links
              so the same HTTPS URL opens the app automatically when installed.
            </p>

            <a
              href={appLink}
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-700"
            >
              Open in My Ride Partner
            </a>

            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Current deep link
              </p>
              <p className="mt-3 break-all font-mono text-sm leading-6 text-slate-700">
                {appLink}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
