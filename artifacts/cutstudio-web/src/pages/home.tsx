import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Play, ChevronRight, Zap, Shield, LayoutDashboard, Users, BarChart3, CheckCircle, Star, ArrowUpRight, Video, IndianRupee, Clock, TrendingUp } from "lucide-react";

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ value, suffix, label, color, started }: { value: number; suffix: string; label: string; color: string; started: boolean }) {
  const count = useCountUp(value, 1600, started);
  return (
    <div className="stat-counter-card rounded-2xl p-6 text-center">
      <div className={`font-mono text-4xl md:text-5xl font-bold mb-2`} style={{ color }}>
        {count.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="text-[#808090] text-xs uppercase tracking-widest font-semibold">{label}</div>
    </div>
  );
}

const FEATURES = [
  { icon: Video, title: "Client Video Portal", desc: "A branded, password-protected space for clients to view your edits in cinematic quality. No more Google Drive links.", tag: "Core", color: "#e8a020", delay: 0 },
  { icon: Zap, title: "Instant Payments", desc: "Collect full payment via UPI, Cards, and Netbanking before releasing the final 4K master. Zero chasing invoices.", tag: "Revenue", color: "#00e5dc", delay: 0.1 },
  { icon: Shield, title: "Watermark Protection", desc: "Your work stays yours. Dynamic watermarks auto-apply to every preview until the client pays in full.", tag: "Security", color: "#e040a0", delay: 0.2 },
  { icon: LayoutDashboard, title: "Smart Dashboard", desc: "Every project, every payment, every pending action — visible at a glance. The control room for your business.", tag: "Workflow", color: "#e8a020", delay: 0.3 },
  { icon: Users, title: "Client Management", desc: "A full CRM built for editors. Track every client, their history, outstanding dues, and lifetime value.", tag: "CRM", color: "#00e5dc", delay: 0.4 },
  { icon: BarChart3, title: "Revenue Analytics", desc: "Know your monthly income, average project value, your fastest-paying clients, and where to grow next.", tag: "Growth", color: "#e040a0", delay: 0.5 },
];

const STEPS = [
  { num: "01", title: "Add your client", desc: "Create a client profile in seconds. They get their own secure portal login.", icon: Users },
  { num: "02", title: "Upload watermarked preview", desc: "Add your preview URL. The client sees your work — but protected.", icon: Video },
  { num: "03", title: "Client pays online", desc: "UPI, card, or netbanking. Money hits your account before the HD file unlocks.", icon: IndianRupee },
  { num: "04", title: "Download final HD", desc: "Payment confirmed = file unlocked. Clean, professional, automatic.", icon: CheckCircle },
];

const TESTIMONIALS = [
  { name: "Rahul Verma", role: "Wedding Editor, Mumbai", rating: 5, text: "Ek baar try kiya aur bhai — no more WhatsApp pe 'bhai payment kab?'. Client khud portal pe jaata hai aur pay kar deta hai." },
  { name: "Priya Singh", role: "Corporate Video Editor, Delhi", rating: 5, text: "My clients think I have a whole team. CutStudio Pro makes me look like a studio, not a freelancer." },
  { name: "Arjun Mehta", role: "Reels Creator, Bangalore", rating: 5, text: "Revenue doubled in 3 months. Seriously. Clients pay faster when the portal looks this premium." },
];

export default function Home() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsStarted(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#05050d] text-white">

      {/* ─── NAVBAR ─── */}
      <nav className="nav-glass fixed top-0 w-full z-50 relative">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e8a020] to-[#e040a0] flex items-center justify-center shadow-[0_0_20px_rgba(232,160,32,0.4)]">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display text-2xl tracking-wider pt-0.5">
              CUT<span className="text-gradient">STUDIO PRO</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="hidden md:block text-[#808090] hover:text-white text-sm font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="hidden md:block text-[#808090] hover:text-white text-sm font-medium transition-colors">How It Works</a>
            <Link href="/login">
              <button className="btn-gold rounded-full px-5 py-2 text-sm font-bold relative overflow-hidden">
                <span>Launch App</span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 overflow-hidden">
        <div className="grid-bg" />

        {/* Parallax orb */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(232,160,32,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.3}px))`,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Badge */}
          <div className="float-in float-in-1 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#e8a020]/10 border border-[#e8a020]/25 text-[#e8a020] text-sm mb-8 font-semibold">
            <span className="pulse-dot w-2 h-2 rounded-full bg-[#e8a020] inline-block" />
            Trusted by 2,400+ Indian Video Editors
            <span className="text-[#e8a020]/50">✦</span>
          </div>

          {/* Main headline */}
          <h1 className="float-in float-in-2 font-display leading-[0.9] tracking-tight mb-6">
            <span
              className="block text-white"
              style={{ fontSize: "clamp(4rem, 13vw, 10rem)" }}
            >
              THE PORTAL
            </span>
            <span
              className="block shimmer-text"
              style={{ fontSize: "clamp(4rem, 13vw, 10rem)" }}
            >
              THAT PAYS YOU
            </span>
          </h1>

          {/* Subheadline */}
          <p className="float-in float-in-3 text-[#a0a0b0] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Share watermarked previews. Collect payments online. Deliver final files automatically.{" "}
            <span className="text-white font-semibold">Stop chasing clients on WhatsApp.</span>
          </p>

          {/* CTAs */}
          <div className="float-in float-in-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login">
              <button className="btn-gold rounded-2xl px-8 py-4 text-base font-bold flex items-center gap-2 relative overflow-hidden group">
                <span>Get Started Free</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </Link>
            <Link href="/login">
              <button className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-[#1f1f2e] bg-white/[0.02] text-[#a0a0b0] hover:text-white hover:border-[#e8a020]/30 hover:bg-[#e8a020]/5 transition-all text-base font-semibold">
                <Play className="w-4 h-4 fill-current" />
                View Live Demo
              </button>
            </Link>
          </div>

          {/* Hero glow line */}
          <div className="float-in float-in-4 hero-glow-line mb-12" />

          {/* Stats */}
          <div ref={statsRef} className="float-in float-in-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={2400} suffix="+" label="Active Editors" color="#e8a020" started={statsStarted} />
            <StatCard value={12000} suffix="+" label="Projects Delivered" color="#f5c060" started={statsStarted} />
            <StatCard value={98} suffix="%" label="Client Satisfaction" color="#00e5dc" started={statsStarted} />
            <StatCard value={60} suffix="/min" label="Avg ₹ Rate" color="#e040a0" started={statsStarted} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#606070]">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#e8a020]/60 to-transparent" />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00e5dc]/10 border border-[#00e5dc]/20 text-[#00e5dc] text-xs font-semibold uppercase tracking-widest mb-4">
              Features
            </div>
            <h2 className="font-display text-5xl md:text-7xl tracking-tight mb-4">
              BUILT FOR <span className="text-gradient-cyan">INDIAN</span><br />
              <span className="text-gradient">FREELANCE EDITORS</span>
            </h2>
            <p className="text-[#808090] max-w-xl mx-auto text-lg">
              Stop managing clients in WhatsApp threads and Google Drive folders. You deserve a real business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="feat-card bg-[#0a0a16] border border-[#1f1f2e] rounded-2xl p-7 glow-border"
                  style={{ animationDelay: `${f.delay}s` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="feat-icon w-13 h-13 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${f.color}18, ${f.color}08)`,
                        border: `1px solid ${f.color}25`,
                        width: 52, height: 52,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: f.color }} />
                    </div>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
                      style={{
                        background: `${f.color}12`,
                        color: f.color,
                        border: `1px solid ${f.color}22`,
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl tracking-wide text-white mb-3">{f.title}</h3>
                  <p className="text-[#707080] text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-28 bg-[#080812] border-y border-[#1f1f2e] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8a020]/10 border border-[#e8a020]/20 text-[#e8a020] text-xs font-semibold uppercase tracking-widest mb-4">
              How It Works
            </div>
            <h2 className="font-display text-5xl md:text-6xl tracking-tight">
              FOUR STEPS TO <br /><span className="text-gradient">GET PAID FASTER</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-0 md:gap-2 relative">
            {/* Connector line desktop */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#e8a020]/30 via-[#00e5dc]/30 to-[#e040a0]/30 z-0" />

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const colors = ["#e8a020", "#00e5dc", "#e040a0", "#00e57a"];
              return (
                <div key={i} className="flex flex-col items-center text-center p-6 relative z-10">
                  <div
                    className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center mb-6 relative"
                    style={{
                      background: `linear-gradient(135deg, ${colors[i]}15, ${colors[i]}06)`,
                      border: `1px solid ${colors[i]}30`,
                      boxShadow: `0 0 30px ${colors[i]}15`,
                    }}
                  >
                    <Icon className="w-8 h-8 mb-1" style={{ color: colors[i] }} />
                    <span className="font-mono text-[10px] font-bold" style={{ color: colors[i] + "80" }}>{step.num}</span>
                  </div>
                  <h3 className="font-display text-xl tracking-wide text-white mb-2">{step.title}</h3>
                  <p className="text-[#707080] text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-28 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e040a0]/10 border border-[#e040a0]/20 text-[#e040a0] text-xs font-semibold uppercase tracking-widest mb-4">
              Testimonials
            </div>
            <h2 className="font-display text-5xl md:text-6xl tracking-tight">
              EDITORS WHO <span className="text-gradient">SWEAR BY IT</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card rounded-2xl p-7">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#e8a020] text-[#e8a020]" />
                  ))}
                </div>
                <p className="text-[#a0a0b0] text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#1f1f2e]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8a020] to-[#e040a0] flex items-center justify-center text-black text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-[#606070] text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-28 relative overflow-hidden">
        <div className="cta-glow absolute inset-0 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8a020]/40 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8a020]/10 border border-[#e8a020]/20 text-[#e8a020] text-xs font-semibold uppercase tracking-widest mb-6">
            <TrendingUp className="w-3.5 h-3.5" /> Grow Your Editing Business
          </div>
          <h2 className="font-display text-6xl md:text-8xl tracking-tight mb-6">
            READY TO LOOK<br />
            <span className="text-gradient">LIKE A STUDIO?</span>
          </h2>
          <p className="text-[#a0a0b0] text-lg mb-10 max-w-xl mx-auto">
            Join 2,400+ editors who stopped chasing payments and started running a real business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <button className="btn-gold rounded-2xl px-10 py-4 text-lg font-bold flex items-center gap-2 relative overflow-hidden group">
                <span>Start Free Today</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform relative z-10" />
              </button>
            </Link>
          </div>
          <p className="text-[#404050] text-xs mt-4 font-mono">No credit card required · Demo data pre-loaded · 2 min setup</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#1f1f2e] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e8a020] to-[#e040a0] flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-display text-xl tracking-wider pt-0.5 text-white/40">
              CUT<span className="text-[#e8a020]/40">STUDIO PRO</span>
            </span>
          </div>
          <div className="flex items-center gap-8 text-[#404050] text-xs font-mono">
            <span>© {new Date().getFullYear()} CutStudio Pro</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">Made for Indian Editors</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e57a] inline-block status-live" />
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
