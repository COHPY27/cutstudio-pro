import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/lib/store";
import { Play, ChevronLeft, Zap, Users, BarChart3, ArrowRight, Eye, EyeOff } from "lucide-react";

const FEATURES_LEFT = [
  { icon: Zap, text: "Instant payment collection", color: "#e8a020" },
  { icon: Users, text: "Branded client portal", color: "#00e5dc" },
  { icon: BarChart3, text: "Revenue dashboard", color: "#e040a0" },
];

export default function Login() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { users, login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        login(user);
        toast({ title: `Welcome back, ${user.name.split(" ")[0]}`, className: "bg-[#0a0a16] border-[#e8a020] text-white" });
        setLocation("/dashboard");
      } else {
        toast({ variant: "destructive", title: "Invalid credentials", description: "Check your email and password", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#05050d] flex overflow-hidden">

      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12 login-left-pattern border-r border-[#1f1f2e]">
        <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-[#e8a020]/30" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-[#e8a020]/30" />

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8a020] to-[#e040a0] flex items-center justify-center shadow-[0_0_24px_rgba(232,160,32,0.4)]">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display text-2xl tracking-wider">
            CUT<span className="text-gradient">STUDIO PRO</span>
          </span>
        </div>

        <div className="space-y-8">
          <div>
            <div className="font-mono text-[10px] tracking-[4px] uppercase text-[#e8a020]/50 mb-4">
              Professional Editor Portal
            </div>
            <h2 className="font-display text-6xl leading-[0.9] tracking-tight text-white mb-4">
              YOUR<br />
              <span className="text-gradient">CLIENTS</span><br />
              DESERVE<br />
              THIS.
            </h2>
            <p className="text-[#606070] text-sm leading-relaxed max-w-xs">
              The premium portal used by India's top video editors to share work, collect payments, and grow their business.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES_LEFT.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-3 group">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <span className="text-[#a0a0b0] text-sm group-hover:text-white transition-colors">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="font-mono text-[10px] text-[#404050] tracking-wider">
          v2.1 · 256-bit SSL · Firebase Ready
        </div>
      </div>

      {/* ─── RIGHT PANEL (FORM) ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <button
          className="absolute top-6 left-6 flex items-center gap-1.5 text-[#808090] hover:text-white text-sm transition-colors"
          onClick={() => setLocation("/home")}
        >
          <ChevronLeft className="w-4 h-4" /> Home
        </button>

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e8a020] to-[#e040a0] flex items-center justify-center shadow-[0_0_30px_rgba(232,160,32,0.35)] mb-3">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="font-display text-3xl tracking-widest">CUT<span className="text-gradient">STUDIO PRO</span></span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl tracking-tight text-white mb-1">Sign in</h1>
            <p className="text-[#606070] text-sm">Access your portal</p>
          </div>

          <div className="relative bg-[#0a0a16] rounded-2xl border border-[#1f1f2e] p-6 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#e8a020]/60 to-transparent" />

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#909090] text-xs uppercase tracking-widest font-semibold">Email</Label>
                <Input
                  id="email" type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  className="bg-[#05050d] border-[#1f1f2e] focus-visible:ring-[#e8a020]/50 focus-visible:border-[#e8a020]/40 text-white h-11 text-sm"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#909090] text-xs uppercase tracking-widest font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password" type={showPass ? "text" : "password"} value={password} required
                    onChange={e => setPassword(e.target.value)}
                    className="bg-[#05050d] border-[#1f1f2e] focus-visible:ring-[#e8a020]/50 focus-visible:border-[#e8a020]/40 text-white h-11 text-sm pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606070] hover:text-white transition-colors"
                    onClick={() => setShowPass(s => !s)}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-btn" type="submit" disabled={loading}
                className="btn-gold w-full rounded-xl h-11 flex items-center justify-center gap-2 text-sm font-bold relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4 relative z-10" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
