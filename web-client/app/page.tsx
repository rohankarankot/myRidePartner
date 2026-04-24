'use client';

import { ThemeModeToggle } from "@/src/backoffice/components/themes/theme-mode-toggle";
import { ThemeSelector } from "@/src/backoffice/components/themes/theme-selector";
import { motion } from "motion/react";
import Image from "next/image";
import {
  Car,
  Share2,
  Users,
  ShieldCheck,
  MapPin,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Download
} from "lucide-react";

const features = [
  {
    title: "Publish Rides",
    description: "Add route, seats, timing, and price in a few taps. Keep it organized.",
    icon: Car,
    color: "amber"
  },
  {
    title: "Share Anywhere",
    description: "Send ride links through WhatsApp or regular text. No more back-and-forth.",
    icon: Share2,
    color: "sky"
  },
  {
    title: "Ride Together",
    description: "Keep trip requests and conversations organized in one central place.",
    icon: Users,
    color: "emerald"
  }
];

const benefits = [
  {
    title: "Verified Community",
    description: "Connect with verified commuters for safer shared travel.",
    icon: ShieldCheck
  },
  {
    title: "Fair Pricing",
    description: "Split travel costs transparently with other riders.",
    icon: MapPin
  },
  {
    title: "Real-time Chat",
    description: "Coordinate pickups and details without sharing numbers.",
    icon: MessageSquare
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Background Glows */}
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
            className="flex flex-col"
          >
            <span className="text-xl font-bold tracking-tight text-primary">
              My Ride Partner
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Shared City Commute
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="hidden sm:flex items-center gap-2">
              <ThemeModeToggle />
            </div>
            <a
              href="https://play.google.com/store/apps/details?id=com.rohanalwayscodes.myridepartner"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </a>
          </motion.div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-12 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now Live on Play Store
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8 leading-[1.1]">
                Plan city rides with <span className="text-primary">people</span> already going your way.
              </h1>

              <p className="text-lg leading-relaxed text-muted-foreground mb-10 max-w-xl">
                The smarter way to commute. Connect with fellow travelers, split costs fairly,
                and keep your coordination in one simple, secure app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://play.google.com/store/apps/details?id=com.rohanalwayscodes.myridepartner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 rounded-2xl bg-foreground text-background px-8 py-4 text-lg font-bold shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:translate-y-0"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.29 2.29 0 0 1-.61-1.637V3.451c0-.623.217-1.18.609-1.637zM14.749 12.957l3.112-3.113 3.569 2.028c.954.543.954 1.427 0 1.969l-3.569 2.028-3.112-3.112zm-1.84-1.84L4.852 3.06l12.126 6.892-4.069 4.069-4.069-4.069zm4.069 5.91l-12.126 6.892 8.057-8.057 4.069 4.069-4.069-2.904z" />
                  </svg>
                  Get it on Google Play
                </a>
                <a
                  href="mailto:rohan.alwayscodes@gmail.com"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/50 backdrop-blur px-8 py-4 text-lg font-semibold hover:bg-muted/50 transition-all"
                >
                  Contact Us
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="relative lg:ml-auto"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-3xl rounded-full" />
              <div className="relative z-10 p-4 sm:p-8 rounded-[3rem] border border-border bg-background/40 backdrop-blur-xl shadow-2xl">
                <Image
                  src="/app_mockup.png"
                  alt="App Mockup"
                  width={400}
                  height={800}
                  className="rounded-[2rem] shadow-2xl"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 border-t border-border">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Built for the modern commuter
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Join thousands of commuters who are already saving time and money while reducing traffic
                congestion in our cities.
              </p>

              <div className="grid gap-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex-none rounded-full bg-primary/10 p-1">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">{benefit.title}</h4>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />
              <div className="relative p-8 rounded-[2.5rem] border border-border bg-card/60 backdrop-blur-xl overflow-hidden min-h-[400px] flex flex-col justify-between">
                <div className="space-y-4">
                  {[
                    { user: "Rohan K.", action: "published a ride to", dest: "Hinjewadi phase 2", time: "2m ago", color: "blue" },
                    { user: "Shraddha K.", action: "found a seat for", dest: "Hinjewadi phase 2", time: "5m ago", color: "emerald" },
                    { user: "Rashmika M.", action: "joined a trip to", dest: "Magarpatta", time: "12m ago", color: "amber" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 shadow-sm"
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color === 'blue' ? 'bg-blue-500/10 text-blue-600' :
                        item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {item.user} <span className="font-normal text-muted-foreground">{item.action}</span> {item.dest}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-6 rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-16 w-16" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Community Impact</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black">₹4.2k</span>
                    <span className="text-sm font-medium mb-1 opacity-90">avg. monthly savings</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    1,200+ Verified Commuters
                  </div>
                </div>

                <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-border">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything you need for a better commute
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We've simplified the entire process from finding a ride to completing the trip.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-8 rounded-3xl border border-border bg-card/50 hover:bg-card transition-all hover:shadow-xl"
              >
                <div className={`mb-6 inline-flex p-3 rounded-2xl bg-${feature.color}-500/10 text-${feature.color}-600 dark:text-${feature.color}-400`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <motion.div
            whileInView={{ scale: [0.95, 1] }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] bg-foreground p-12 lg:p-24 text-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-blue-500 to-transparent" />

            <h2 className="relative z-10 text-4xl font-extrabold tracking-tight text-background sm:text-6xl mb-8 leading-tight">
              Ready to change the way <br className="hidden sm:block" /> you commute?
            </h2>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="https://play.google.com/store/apps/details?id=com.rohanalwayscodes.myridepartner"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-background text-foreground px-10 py-5 text-xl font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                <Download className="h-6 w-6" />
                Download Now
              </a>
            </div>

            <p className="relative z-10 mt-8 text-background/60 font-medium">
              Join the verified community of city travelers today.
            </p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="text-center sm:text-left">
            <p className="font-bold text-foreground mb-1">My Ride Partner</p>
            <p className="text-sm text-muted-foreground">© 2026 MH13 Community. All rights reserved.</p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
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
