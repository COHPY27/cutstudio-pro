import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/lib/store";
import { Play, ChevronLeft, ShieldAlert, Zap, Users, BarChart3, ArrowRight, Eye, EyeOff } from "lucide-react";

const FEATURES_LEFT = [
  { icon: Zap, text: "Instant payment collection", color: "#e8a020" },
  { icon: Users, text: "Branded client portal", color: "#00e5dc" },
  { icon: BarChart3, text: "Revenue dashboard", color: "#e040a0" },
];

export default function Login() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { users, login, isProductionMode, setProductionMode, firebaseConfig, setFirebaseConfig } = useApp();

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

  const handleQuickLogin = (e: string, p: string) => {
    setEmail(e); setPassword(p);
    setLoading(true);
    setTimeout(() => {
      const user = users.find(u => u.email === e && u.password === p);
      if (user) {
        login(user);
        toast({ title: `Welcome, ${user.name.split(" ")[0]}`, className: "bg-[#0a0a16] border-[#e8a020] text-white" });
        setLocation("/dashboard");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#05050d] flex overflow-hidden">

      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12 login-left-pattern border-r border-[#1f1f2e]">
        {/* Corner marks */}
        <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-[#e8a020]/30" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-[#e8a020]/30" />

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e8a020] to-[#e040a0] flex items-center justify-center shadow-[0_0_24px_rgba(232,160,32,0.4)]">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display text-2xl tracking-wider">
            CUT<span className="text-gradient">STUDIO PRO</span>
          </span>
        </div>

        {/* Main copy */}
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

          {/* Feature pills */}
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

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-4 border-t border-[#1f1f2e]">
            <div className="flex -space-x-2">
              {["#e8a020", "#00e5dc", "#e040a0", "#00e57a"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#05050d] flex items-center justify-center text-[10px] font-bold text-black" style={{ background: c }}>
                  {["R", "P", "A", "K"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="text-white text-xs font-semibold">2,400+ editors</div>
              <div className="text-[#606070] text-[10px]">already using CutStudio Pro</div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="font-mono text-[10px] text-[#404050] tracking-wider">
          v2.1 · 256-bit SSL · Firebase Ready
        </div>
      </div>

      {/* ─── RIGHT PANEL (FORM) ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Mobile back */}
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
            <p className="text-[#606070] text-sm">Access your editor portal</p>
          </div>

          {/* Form card */}
          <div className="relative bg-[#0a0a16] rounded-2xl border border-[#1f1f2e] p-6 overflow-hidden">
            {/* Top gradient border */}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#909090] text-xs uppercase tracking-widest font-semibold">Password</Label>
                  <a href="#" className="text-[10px] text-[#e8a020]/60 hover:text-[#e8a020] transition-colors">Forgot?</a>
                </div>
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

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1f1f2e]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#0a0a16] px-3 text-[10px] uppercase tracking-[3px] text-[#404055] font-bold">
                  Quick Access
                </span>
              </div>
            </div>

            {/* Quick login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickLogin("admin@cutstudio.com", "admin123")}
                className="group flex flex-col items-start p-3 rounded-xl border border-[#1f1f2e] bg-[#05050d] hover:border-[#e8a020]/30 hover:bg-[#e8a020]/5 transition-all"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded bg-[#e8a020]/15 border border-[#e8a020]/20 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-[#e8a020]">A</span>
                  </div>
                  <span className="text-white text-xs font-semibold">Admin</span>
                </div>
                <span className="font-mono text-[9px] text-[#505060] group-hover:text-[#808090] transition-colors truncate w-full">admin@cutstudio.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin("client@test.com", "client123")}
                className="group flex flex-col items-start p-3 rounded-xl border border-[#1f1f2e] bg-[#05050d] hover:border-[#00e5dc]/30 hover:bg-[#00e5dc]/5 transition-all"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded bg-[#00e5dc]/15 border border-[#00e5dc]/20 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-[#00e5dc]">C</span>
                  </div>
                  <span className="text-white text-xs font-semibold">Client</span>
                </div>
                <span className="font-mono text-[9px] text-[#505060] group-hover:text-[#808090] transition-colors truncate w-full">client@test.com</span>
              </button>
            </div>

            {/* Production mode */}
            <div className="mt-5 pt-5 border-t border-[#1f1f2e]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#606070]" />
                  <span className="text-[#606070] text-xs">Production Mode</span>
                </div>
                <Switch
                  id="prod-mode" checked={isProductionMode} onCheckedChange={setProductionMode}
                  className="data-[state=checked]:bg-[#e8a020] scale-75"
                />
              </div>
              {isProductionMode && (
                <div className="space-y-2 p-3 bg-[#05050d] rounded-lg border border-[#1f1f2e]">
                  <p className="font-mono text-[10px] text-[#00e5dc] tracking-widest uppercase mb-2">Firebase Config</p>
                  {[
                    { placeholder: "Firebase API Key", key: "apiKey" },
                    { placeholder: "Firebase Project ID", key: "projectId" },
                    { placeholder: "Razorpay Key", key: "razorpayKey" },
                  ].map(({ placeholder, key }) => (
                    <Input
                      key={key}
                      value={(firebaseConfig as any)[key]}
                      onChange={e => setFirebaseConfig({ ...firebaseConfig, [key]: e.target.value })}
                      className="h-8 text-xs bg-[#0a0a16] border-[#1f1f2e] font-mono text-white placeholder:text-[#303040]"
                      placeholder={placeholder}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
