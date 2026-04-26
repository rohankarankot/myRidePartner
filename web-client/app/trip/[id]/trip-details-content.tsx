'use client';

import { ThemeModeToggle } from "@/src/backoffice/components/themes/theme-mode-toggle";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  User,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Share2,
  ExternalLink,
  ChevronLeft,
  MessageSquare
} from "lucide-react";

type TripDetailsContentProps = {
  trip: any;
  id: string;
  appLink: string;
};

export default function TripDetailsContent({ trip, id, appLink }: TripDetailsContentProps) {
  const captainName = trip?.creator.fullName || trip?.creator.username || "Ride captain";

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Background Glows (Matching Landing Page) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <nav className="flex items-center justify-between py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <ChevronLeft className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-primary">
                  My Ride Partner
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  Back to Home
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <ThemeModeToggle />
            <a
              href="https://play.google.com/store/apps/details?id=com.rohanalwayscodes.myridepartner"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            >
              Get the App
            </a>
          </motion.div>
        </nav>

        {/* Content Section */}
        <section className="relative pt-8 pb-24 lg:pt-12">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
            {/* Main Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-blue-500/5 blur-3xl rounded-full" />
              <div className="relative z-10 p-8 sm:p-10 rounded-[2.5rem] border border-border bg-card/60 backdrop-blur-xl shadow-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {trip ? "Verified Ride Snapshot" : "Shared Link Preview"}
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl mb-6 leading-tight">
                  {trip ? (
                    <>
                      From <span className="text-primary">{trip.startingPoint}</span> <br />
                      to <span className="text-primary">{trip.destination}</span>
                    </>
                  ) : (
                    "Someone shared a ride with you"
                  )}
                </h1>

                <p className="text-lg leading-relaxed text-muted-foreground mb-10 max-w-2xl">
                  {trip
                    ? `A ride from ${trip.startingPoint} to ${trip.destination} is available. View the details below and open the app to join this trip.`
                    : "This link is a shortcut to a trip in My Ride Partner. If the details aren't loading, you can still use the ID below to find it in the app."}
                </p>

                {/* Info Grid */}
                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                  {trip ? (
                    <>
                      <div className="p-6 rounded-3xl bg-background/50 border border-border/50">
                        <div className="flex items-center gap-3 mb-3 text-primary">
                          <Calendar className="h-5 w-5" />
                          <span className="text-xs font-bold uppercase tracking-widest opacity-70">Schedule</span>
                        </div>
                        <p className="text-xl font-bold">{trip.date}</p>
                        <p className="text-sm text-muted-foreground">at {trip.time}</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-background/50 border border-border/50">
                        <div className="flex items-center gap-3 mb-3 text-primary">
                          <Users className="h-5 w-5" />
                          <span className="text-xs font-bold uppercase tracking-widest opacity-70">Availability</span>
                        </div>
                        <p className="text-xl font-bold">{trip.seatsRemaining} Seats</p>
                        <p className="text-sm text-muted-foreground">left of {trip.availableSeats} total</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-background/50 border border-border/50">
                        <div className="flex items-center gap-3 mb-3 text-primary">
                          <CreditCard className="h-5 w-5" />
                          <span className="text-xs font-bold uppercase tracking-widest opacity-70">Pricing</span>
                        </div>
                        <p className="text-xl font-bold">
                          {trip.pricePerSeat != null ? `₹${trip.pricePerSeat}` : "Fair Split"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {trip.isPriceCalculated ? "Final amount in app" : "Per person per seat"}
                        </p>
                      </div>
                      <div className="p-6 rounded-3xl bg-background/50 border border-border/50">
                        <div className="flex items-center gap-3 mb-3 text-primary">
                          <User className="h-5 w-5" />
                          <span className="text-xs font-bold uppercase tracking-widest opacity-70">Captain</span>
                        </div>
                        <p className="text-xl font-bold">{captainName}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Verified Member</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-2 p-8 rounded-3xl bg-background/50 border border-border/50 border-dashed">
                      <div className="flex items-center gap-3 mb-4 text-muted-foreground">
                        <Share2 className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Shared Trip ID</span>
                      </div>
                      <p className="font-mono text-lg break-all text-primary mb-4">{id}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The app uses this ID to locate the specific trip details. Even if the web preview is unavailable, the app link below will still work.
                      </p>
                    </div>
                  )}
                </div>

                {trip?.description && (
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Captain's Note</p>
                    <p className="text-muted-foreground leading-relaxed italic italic-font">"{trip.description}"</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* CTA Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6 lg:sticky lg:top-8"
            >
              <div className="p-8 rounded-[2.5rem] border border-border bg-card/80 backdrop-blur-xl shadow-xl">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">How to Join</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-none rounded-full bg-primary/10 p-1 h-6 w-6 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">1</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Download My Ride Partner</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-none rounded-full bg-primary/10 p-1 h-6 w-6 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">2</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Click the "Open in App" button below</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-none rounded-full bg-primary/10 p-1 h-6 w-6 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">3</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Tap "Join Trip" in the app</p>
                    </div>
                  </div>
                </div>

                <a
                  href={appLink}
                  className="flex items-center justify-center gap-3 w-full rounded-2xl bg-foreground text-background px-8 py-4 text-lg font-bold shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  <ExternalLink className="h-5 w-5" />
                  Open in App
                </a>

                <div className="mt-8 p-6 rounded-3xl bg-muted/50 border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Deep Link URL</p>
                  <p className="text-[11px] font-mono break-all text-muted-foreground opacity-70">
                    {appLink}
                  </p>
                </div>
              </div>

              {/* Benefits Section (Matching Landing Page) */}
              <div className="p-8 rounded-[2.5rem] border border-border bg-card/60 backdrop-blur-xl shadow-xl">
                <h3 className="text-xl font-bold mb-8">Ride Benefits</h3>
                <div className="grid gap-8">
                  {[
                    {
                      title: "Verified Community",
                      description: "Connect with verified commuters for safer shared travel.",
                      icon: ShieldCheck,
                    },
                    {
                      title: "Fair Pricing",
                      description: "Split travel costs transparently with other riders.",
                      icon: MapPin,
                    },
                    {
                      title: "Real-time Chat",
                      description: "Coordinate pickups and details without sharing numbers.",
                      icon: MessageSquare,
                    },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex-none w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <benefit.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="text-center sm:text-left">
            <p className="font-bold text-foreground mb-1">My Ride Partner</p>
            <p className="text-sm text-muted-foreground">© 2026 MH13 Community. All rights reserved.</p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="mailto:rohan.alwayscodes@gmail.com" className="hover:text-primary transition-colors">Support</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
