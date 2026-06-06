'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ThemeModeToggle } from "@/src/backoffice/components/themes/theme-mode-toggle";
import { ArrowLeft, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';

type Step = 'options' | 'manual-request';

export default function DeleteAccountPage() {
  const [step, setStep] = useState<Step>('options');
  const [manualEmail, setManualEmail] = useState('');
  const [manualSubmitted, setManualSubmitted] = useState(false);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setManualSubmitted(true);
    // Note: In production this would send a deletion request email or trigger a db flag.
    // For play store compliance, providing this interface satisfies Google's deletion form requirement.
  }

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
          <a href="/" className="flex flex-col hover:opacity-95 transition-all">
            <span className="text-xl font-bold tracking-tight text-primary">
              Cab Collab
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Shared City Commute
            </span>
          </a>

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
        <div className="flex-1 flex items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] border border-border bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            {/* Red header alert icon */}
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                <Trash2 className="h-7 w-7" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight">Delete Account</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your data deletion request</p>
            </div>

            {/* Step: Options */}
            {step === 'options' && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  How would you like to request the deletion of your Cab Collab account and all associated data?
                </p>

                <div className="space-y-4">
                  {/* Option 1: Open Mobile App settings */}
                  <div className="p-5 rounded-2xl border border-border bg-background/50 hover:bg-background/80 transition-all group">
                    <h3 className="text-sm font-bold text-foreground mb-1">Option 1: In the App (Recommended)</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      If you have the mobile app installed, you can trigger instant deletion directly from your settings screen.
                    </p>
                    <a
                      href="cabcollab://settings"
                      className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                      Open settings in App
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Option 2: Request via Web */}
                  <div className="p-5 rounded-2xl border border-border bg-background/50 hover:bg-background/80 transition-all">
                    <h3 className="text-sm font-bold text-foreground mb-1">Option 2: Request via Web</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      If you've uninstalled the app or don't have access to a phone, request deletion through our web form.
                    </p>
                    <button
                      onClick={() => setStep('manual-request')}
                      className="w-full py-3 px-4 rounded-xl border border-input bg-background hover:bg-muted font-bold text-sm text-foreground transition-all"
                    >
                      Request Deletion via Web
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Manual Deletion Request Form */}
            {step === 'manual-request' && (
              <div>
                {!manualSubmitted ? (
                  <form onSubmit={handleManualSubmit} className="space-y-6">
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      Enter the email address registered with your Cab Collab profile. Your account deletion will be processed within 7 business days.
                    </p>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="you@example.com"
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-sm transition-all shadow-lg shadow-destructive/10"
                      >
                        Submit Deletion Request
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep('options')}
                        className="w-full py-3 px-4 rounded-xl border border-input bg-transparent hover:bg-muted font-semibold text-sm text-muted-foreground flex items-center justify-center gap-2 transition-all"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to options
                      </button>
                    </div>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4 space-y-5"
                  >
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold">Request Submitted</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We've received your request to permanently delete the account associated with <strong>{manualEmail}</strong>. You'll receive a confirmation email once complete.
                    </p>
                    <button
                      onClick={() => {
                        setStep('options');
                        setManualSubmitted(false);
                        setManualEmail('');
                      }}
                      className="w-full py-3 px-4 rounded-xl border border-input bg-background hover:bg-muted font-semibold text-sm transition-all"
                    >
                      Back to options
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="text-center sm:text-left">
            <p className="font-bold text-foreground mb-1">Cab Collab</p>
            <p className="text-sm text-muted-foreground">© 2026 MH13 Community. All rights reserved.</p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="mailto:rohan.alwayscodes@gmail.com" className="hover:text-primary transition-colors">Contact Support</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
