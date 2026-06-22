"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Eye, EyeOff, ArrowRight, Shield, Zap, Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/actions/auth";

const features = [
  { icon: Shield, label: "Enterprise Security", desc: "End-to-end encrypted" },
  { icon: Zap, label: "Real-time Tracking", desc: "Live attendance data" },
  { icon: Globe, label: "Multi-location", desc: "Anywhere access" },
];

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Decorative left panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-[hsl(var(--sidebar))] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>
        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl">FutureTrack</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
              <h1 className="text-4xl font-display font-bold text-white leading-tight mb-4">
                Intelligent<br />Attendance<br />Management
              </h1>
              <p className="text-[hsl(var(--sidebar-foreground))/70] text-base leading-relaxed max-w-sm">
                Track, manage, and analyze employee attendance with real-time insights and smart device recognition.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="flex flex-col gap-3 mt-10">
              {features.map((f, i) => (
                <motion.div key={f.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-xs text-[hsl(var(--sidebar-foreground))/60]">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <p className="text-xs text-[hsl(var(--sidebar-foreground))/40]">© 2025 FutureTrack Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 lg:max-w-[480px] flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">FutureTrack</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your admin dashboard</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5 p-3 bg-destructive/10 border border-destructive/30 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="email" label="Email address" type="email" placeholder="admin@company.com" required autoComplete="email" disabled={isPending} />
            <div>
              <Input
                name="password"
                label="Password"
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isPending}
                iconRight={
                  <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1} className="cursor-pointer">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="flex justify-end mt-1.5">
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={isPending} iconRight={!isPending && <ArrowRight className="w-4 h-4" />}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-xs font-semibold text-foreground mb-1.5">Demo credentials</p>
            <p className="text-xs text-muted-foreground">Email: <span className="font-mono-custom text-foreground">admin@futuretrack.io</span></p>
            <p className="text-xs text-muted-foreground">Password: <span className="font-mono-custom text-foreground">demo1234</span></p>
            <p className="text-[10px] text-muted-foreground/60 mt-2">Create this user in your Supabase Auth dashboard first.</p>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Need an account?{" "}
            <button className="text-primary hover:underline font-medium">Contact your admin</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
