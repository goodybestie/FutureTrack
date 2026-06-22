"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Fingerprint, Wifi, ShieldAlert, BarChart2, CheckCircle, ArrowRight, ChevronDown, Lock, Smartphone, Activity, TrendingUp, Star, Play, Menu, X, Radio, Bell, FileSpreadsheet } from "lucide-react";

// ── Animated counter ──────────────────────────────────────────
function Counter({ to, suffix = "", duration = 1.5 }: { to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = (Date.now() - start) / (duration * 1000);
          const progress = Math.min(elapsed, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * to));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Section wrapper with fade-in ──────────────────────────────
function Section({ children, className = "", id = "" }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ── Feature card ──────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, accent, delay = 0 }: {
  icon: React.ElementType; title: string; description: string; accent: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", accent)}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </div>
    </motion.div>
  );
}

// ── Testimonial ───────────────────────────────────────────────
function Testimonial({ quote, name, role, company, stars = 5, delay = 0 }: {
  quote: string; name: string; role: string; company: string; stars?: number; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
    >
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{`"${quote}"`}</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
          {name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{name}</p>
          <p className="text-xs text-slate-400">{role} · {company}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── How it works step ─────────────────────────────────────────
function Step({ number, title, description, icon: Icon, delay = 0 }: {
  number: number; title: string; description: string; icon: React.ElementType; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex gap-5"
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-lg shadow-blue-600/30">
          {number}
        </div>
        {number < 4 && <div className="w-px flex-1 bg-gradient-to-b from-blue-600/40 to-transparent mt-2 min-h-8" />}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-blue-600" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">{title}</h4>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-800" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Fingerprint className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900 dark:text-white">FutureTrack</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.href} href={l.href}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/dashboard"
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25">
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button className="md:hidden w-8 h-8 flex items-center justify-center" onClick={() => setMobileOpen(s => !s)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
            <nav className="px-4 py-3 space-y-1">
              {links.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  {l.label}
                </a>
              ))}
              <Link href="/login" className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                Sign in
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── Main landing page ─────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30" />

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, hsl(221 70% 55% / 0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px" }} />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-400/15 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
          >
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Hackathon MVP 2025 · Built with Next.js + Supabase
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.08] tracking-tight mb-6"
          >
            <span className="text-slate-900 dark:text-white">Smart attendance</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent">
              powered by WiFi.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            FutureTrack automatically marks employees present the moment their device connects to your office WiFi.
            No check-ins. No apps. No friction.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-16"
          >
            <Link href="/dashboard"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5">
              Launch Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5">
              <Play className="w-3.5 h-3.5" />
              See how it works
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {[
              { value: 500, suffix: "+", label: "Companies" },
              { value: 50000, suffix: "+", label: "Employees tracked" },
              { value: 99.9, suffix: "%", label: "Uptime" },
              { value: 2, suffix: "s", label: "Detection speed" },
            ].map((s, i) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold font-display tabular-nums text-slate-900 dark:text-white">
                  <Counter to={s.value} suffix={s.suffix} duration={1.2} />
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <Section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mb-3">
            Everything at a glance
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
           {` A beautiful real-time dashboard that shows you exactly who's in, who's late, and who's a security risk.`}
          </p>
        </div>

        {/* Mock dashboard UI */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/20 dark:shadow-black/40"
        >
          {/* Browser chrome */}
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white dark:bg-slate-700 rounded-lg px-4 py-1 text-xs text-slate-400 flex items-center gap-2 max-w-xs w-full">
                <Lock className="w-3 h-3" />
                app.futuretrack.io/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard preview content */}
          <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6">
            {/* Mini stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Online Now",    value: "8",    color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
                { label: "Checked In",    value: "8",    color: "text-blue-600 dark:text-blue-400",     dot: "bg-blue-500" },
                { label: "Late Arrivals", value: "2",    color: "text-amber-600 dark:text-amber-400",   dot: "bg-amber-500" },
                { label: "Threats",       value: "3",    color: "text-red-600 dark:text-red-400",       dot: "bg-red-500" },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                    <span className="text-[10px] text-slate-400">{s.label}</span>
                  </div>
                  <p className={cn("text-2xl font-bold font-display", s.color)}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Mock chart bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Weekly Attendance</p>
              <div className="flex items-end gap-1 h-16">
                {[85, 92, 78, 96, 88, 22, 8].map((v, i) => (
                  <motion.div key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${v}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    className={cn("flex-1 rounded-t-sm",
                      v >= 80 ? "bg-blue-500" : v >= 50 ? "bg-amber-400" : "bg-slate-300 dark:bg-slate-600"
                    )}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[9px] text-slate-400">{d}</span>
                ))}
              </div>
            </div>

            {/* Mini user list */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {["Amara Okonkwo","Chidi Eze","Fatima Al-Hassan","Aisha Bello"].map((name, i) => (
                <div key={name} className="flex items-center gap-2.5 px-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0",
                    ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-pink-500"][i])}>
                    {name.split(" ").map(n=>n[0]).join("")}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">{name}</span>
                  <div className="flex items-center gap-1">
                    <span className={cn("w-1.5 h-1.5 rounded-full", i === 2 ? "bg-amber-500" : "bg-emerald-500")} />
                    <span className="text-[10px] text-slate-400">{i === 2 ? "Late" : "Present"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── FEATURES ── */}
      <Section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">Features</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mt-2 mb-3">
            Built for modern workplaces
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need to manage attendance, detect threats, and gain insights — all in one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard delay={0}    icon={Wifi}          accent="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"    title="Auto WiFi Check-in"     description="Employees are automatically marked present the second their device joins the corporate network. Zero manual input required." />
          <FeatureCard delay={0.06} icon={ShieldAlert}   accent="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"        title="Threat Detection"       description="Unknown devices are flagged instantly with threat level scoring — critical, high, medium, or low — with real-time alerts." />
          <FeatureCard delay={0.12} icon={BarChart2}     accent="bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400" title="Deep Analytics"     description="30-day trends, productivity heatmaps, late arrival patterns, department scores, and one-click CSV/JSON exports." />
          <FeatureCard delay={0.18} icon={Bell}          accent="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400" title="Realtime Alerts"        description="Instant toast notifications for late arrivals, unauthorized devices, and system events — with auto-dismiss timers." />
          <FeatureCard delay={0.24} icon={Radio}         accent="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" title="Live Monitoring"  description="Watch attendance happen in real-time with a live event feed, connection timeline, and signal strength indicators." />
          <FeatureCard delay={0.30} icon={FileSpreadsheet} accent="bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400"  title="Export Reports"         description="Download attendance logs, user directories, and trend data as CSV or JSON with one click — ready for payroll or HR." />
          <FeatureCard delay={0.36} icon={Lock}          accent="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"  title="Role-Based Access"      description="Admin, Manager, Staff, and Security roles with Supabase RLS — each role sees exactly what they're supposed to." />
          <FeatureCard delay={0.42} icon={Smartphone}    accent="bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400"    title="Device Management"      description="Approve, block, monitor, or convert unknown devices to registered users directly from the admin dashboard." />
          <FeatureCard delay={0.48} icon={Activity}      accent="bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400" title="Session Tracking"   description="Track work duration, reconnections, signal strength, and location — all updated live without a single page refresh." />
        </div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section id="how-it-works" className="py-20 bg-slate-100 dark:bg-slate-900/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mt-2 mb-3">
              Simple as connecting to WiFi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <Step number={1} delay={0}    icon={Wifi}       title="Employee connects to WiFi"       description="The moment an employee's registered device joins the corporate network, FutureTrack detects the connection." />
              <Step number={2} delay={0.1}  icon={CheckCircle} title="Automatic check-in recorded"    description="The system cross-references the device MAC address against the employee registry and logs a timestamped check-in." />
              <Step number={3} delay={0.2}  icon={Activity}   title="Live session tracked"            description="Work duration accumulates in real-time. Signal strength, location, and reconnections are all monitored continuously." />
              <Step number={4} delay={0.3}  icon={TrendingUp} title="Analytics updated instantly"     description="Dashboard stats, charts, heatmaps, and late arrival flags all update without a page refresh via Supabase Realtime." />
            </div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-display">FutureTrack-Corp-5GHz</p>
                    <p className="text-xs text-slate-400">3 events in last 60s</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                  </span>
                </div>
                {[
                  { name: "Amara Okonkwo",   event: "Checked in",    time: "08:47", color: "bg-blue-500",    status: "present" },
                  { name: "Kali-Linux-Box",  event: "⚠ Threat",     time: "09:12", color: "bg-red-500",     status: "threat" },
                  { name: "Fatima Al-Hassan",event: "Late check-in", time: "09:55", color: "bg-emerald-500", status: "late" },
                  { name: "Aisha Bello",     event: "Checked in",    time: "08:55", color: "bg-pink-500",    status: "present" },
                ].map((item, i) => (
                  <motion.div key={item.name}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-center gap-2.5 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0", item.color)}>
                      {item.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.event}</p>
                    </div>
                    <span className="text-[10px] font-mono-custom text-slate-400">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section id="testimonials" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mt-2">
            Trusted by growing teams
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Testimonial delay={0}    stars={5} quote="We used to waste 20 minutes every morning on manual roll calls. FutureTrack eliminated that completely. Our HR team is obsessed." name="Chidera Okonkwo" role="Head of HR" company="Fintract Africa" />
          <Testimonial delay={0.1}  stars={5} quote="The threat detection caught 3 unauthorized devices in our office within the first week. One turned out to be a rogue access point." name="David Mensah" role="IT Security Lead" company="PayLink Ghana" />
          <Testimonial delay={0.2}  stars={5} quote="The analytics dashboard gives us insights we never had before — late patterns, productivity scores, department comparisons. Incredible." name="Adaeze Nwosu" role="Operations Manager" company="Lagos Logistics" />
        </div>
      </Section>

      {/* ── PRICING ── */}
      <Section id="pricing" className="py-20 bg-slate-100 dark:bg-slate-900/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mt-2 mb-3">Simple, transparent pricing</h2>
            <p className="text-slate-500 dark:text-slate-400">Start free. Scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Starter", price: "$0", period: "forever", desc: "Perfect for small teams", features: ["Up to 10 employees","Basic attendance tracking","7-day history","Email support"], highlighted: false },
              { name: "Pro",     price: "$49", period: "per month", desc: "For growing businesses", features: ["Up to 100 employees","Advanced analytics & heatmaps","Unlimited history","Threat detection","Priority support","CSV exports"], highlighted: true },
              { name: "Enterprise", price: "Custom", period: "contact us", desc: "For large organizations", features: ["Unlimited employees","Custom integrations","SLA guarantee","Dedicated support","White-label option"], highlighted: false },
            ].map((plan, i) => (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "rounded-2xl p-6 border transition-all",
                  plan.highlighted
                    ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/30 scale-105"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                )}>
                <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", plan.highlighted ? "text-blue-200" : "text-slate-400")}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={cn("text-3xl font-bold font-display", plan.highlighted ? "text-white" : "text-slate-900 dark:text-white")}>{plan.price}</span>
                  <span className={cn("text-xs", plan.highlighted ? "text-blue-200" : "text-slate-400")}>{plan.period}</span>
                </div>
                <p className={cn("text-xs mb-5", plan.highlighted ? "text-blue-100" : "text-slate-500 dark:text-slate-400")}>{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <CheckCircle className={cn("w-3.5 h-3.5 shrink-0", plan.highlighted ? "text-blue-200" : "text-emerald-500")} />
                      <span className={plan.highlighted ? "text-blue-100" : "text-slate-600 dark:text-slate-400"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className={cn(
                  "w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                )}>
                  Get started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl" />
            <div className="relative w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-600/30">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
            Ready to track smarter?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of companies using FutureTrack to automate attendance, secure their network, and build better teams.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard"
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 text-sm">
              Launch the Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 px-6 py-3.5 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
              Sign in
            </Link>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Fingerprint className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 dark:text-white">FutureTrack</span>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Built for Hackathon 2025 · Next.js 15 · Supabase · Framer Motion · Zustand
          </p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Dashboard</Link>
            <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
