import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const CHARS = "CUTSTUDIO PRO".split("");

export default function LoadingScreen() {
  const [_, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [visibleChars, setVisibleChars] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Initialising workspace...");

  const STATUS_MSGS = [
    "Initialising workspace...",
    "Loading client portal...",
    "Syncing project data...",
    "Ready.",
  ];

  useEffect(() => {
    // Reveal characters one by one
    const charTimer = setInterval(() => {
      setVisibleChars(v => {
        if (v >= CHARS.length) { clearInterval(charTimer); return v; }
        return v + 1;
      });
    }, 80);

    // Progress bar
    let p = 0;
    const progTimer = setInterval(() => {
      p += Math.random() * 4 + 2;
      if (p >= 100) {
        p = 100;
        clearInterval(progTimer);
        setTimeout(() => {
          setOpacity(0);
          setTimeout(() => setLocation("/home"), 600);
        }, 300);
      }
      setProgress(p);
      // Update status messages
      if (p < 30) setStatusMsg(STATUS_MSGS[0]);
      else if (p < 60) setStatusMsg(STATUS_MSGS[1]);
      else if (p < 85) setStatusMsg(STATUS_MSGS[2]);
      else setStatusMsg(STATUS_MSGS[3]);
    }, 80);

    return () => { clearInterval(charTimer); clearInterval(progTimer); };
  }, [setLocation]);

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#05050d] text-white relative overflow-hidden"
      style={{ opacity, transition: "opacity 0.6s ease-out" }}
    >
      {/* Noise */}
      <div className="noise-overlay" />
      {/* Scan line */}
      <div className="scanline" />

      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Grid */}
      <div className="grid-bg" />

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-[#e8a020]/40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-[#e8a020]/40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-[#e8a020]/40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-[#e8a020]/40" />

      {/* Version tag */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-[10px] text-[#404055] tracking-[4px] uppercase">
        v2.1 · PROFESSIONAL EDITION
      </div>

      <div className="z-10 flex flex-col items-center gap-0">

        {/* Tagline above */}
        <p
          className="font-mono text-[10px] tracking-[6px] uppercase text-[#e8a020]/60 mb-6"
          style={{ opacity: visibleChars > 4 ? 1 : 0, transition: "opacity 0.5s" }}
        >
          Professional Video Editor Portal
        </p>

        {/* Main title — char by char */}
        <h1 className="font-display text-[clamp(3.5rem,12vw,9rem)] leading-none tracking-wider mb-2 flex overflow-hidden">
          {CHARS.map((ch, i) => (
            <span
              key={i}
              className="char-reveal inline-block"
              style={{
                animationDelay: `${i * 0.06}s`,
                opacity: i < visibleChars ? 1 : 0,
                background: i >= 3
                  ? "linear-gradient(135deg,#e8a020,#f5c060,#e040a0)"
                  : "none",
                WebkitBackgroundClip: i >= 3 ? "text" : undefined,
                WebkitTextFillColor: i >= 3 ? "transparent" : "#ffffff",
                backgroundClip: i >= 3 ? "text" : undefined,
                whiteSpace: ch === " " ? "pre" : undefined,
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        {/* Glow line under title */}
        <div
          className="hero-glow-line w-full max-w-lg mb-10 mt-2"
          style={{ opacity: visibleChars >= CHARS.length ? 1 : 0, transition: "opacity 0.6s" }}
        />

        {/* Progress bar */}
        <div className="w-72 md:w-96 space-y-3">
          <div className="relative h-[2px] rounded-full bg-white/5 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full progress-glow"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #e8a020, #f5c060, #00e5dc)",
                transition: "width 0.12s ease-out",
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#606070] tracking-wider">{statusMsg}</span>
            <span className="font-mono text-[11px] text-[#e8a020]/70">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Bouncing dots */}
        <div className="mt-8 flex gap-2">
          {["#e8a020", "#00e5dc", "#e040a0"].map((color, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ background: color, animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6">
        {["256-bit SSL", "Firebase Ready", "Razorpay Enabled"].map((label, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-[#404055]"
            style={{ opacity: progress > i * 30 + 10 ? 1 : 0, transition: "opacity 0.4s" }}
          >
            <div className="w-1 h-1 rounded-full bg-[#00e57a] status-live" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
