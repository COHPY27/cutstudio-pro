import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useApp, Project, User } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  Play, LogOut, Plus, CheckCircle2, Download, CreditCard,
  Trash2, AlertTriangle, Video, IndianRupee, ChevronRight,
  Zap, Shield, Users, TrendingUp, Clock,
  Wallet, Layers, ArrowUpRight,
  ChevronDown, Check, Flame, Wifi, WifiOff
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── HELPERS ─── */
const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
const formatRupee = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

/* ─── CLIENT SELECT DROPDOWN ─── */
function ClientSelect({ clients, value, onChange }: { clients: User[]; value: string; onChange: (email: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = clients.find(c => c.email === value);

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full flex items-center justify-between h-10 px-3 py-2 rounded-lg bg-[#05050d] border border-[#1f1f2e] text-sm text-left hover:border-[#e8a020]/40 focus:border-[#e8a020]/60 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e8a020] to-[#e040a0] flex items-center justify-center text-[9px] font-bold text-black flex-shrink-0">
              {getInitials(selected.name)}
            </span>
            <span className="text-white font-medium">{selected.name}</span>
            <span className="text-[#606070] font-mono text-xs truncate">· {selected.email}</span>
          </span>
        ) : (
          <span className="text-[#505060]">Select a client…</span>
        )}
        <ChevronDown className={`w-4 h-4 text-[#606070] transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[#0a0a16] border border-[#1f1f2e] rounded-xl shadow-2xl overflow-hidden">
          {clients.length === 0 ? (
            <div className="px-4 py-6 text-center text-[#606070] text-sm">No clients added yet</div>
          ) : (
            <div className="max-h-56 overflow-y-auto">
              {clients.map(c => (
                <button
                  key={c.uid}
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1f1f2e] transition-colors text-left"
                  onClick={() => { onChange(c.email); setOpen(false); }}
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8a020]/60 to-[#e040a0]/60 flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                    {getInitials(c.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold leading-none mb-0.5">{c.name}</p>
                    <p className="text-[#606070] font-mono text-xs truncate">{c.email}</p>
                  </div>
                  {value === c.email && <Check className="w-4 h-4 text-[#e8a020] ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── STAT CARD ─── */
function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string; sub?: string; icon: any; color: string; trend?: string;
}) {
  return (
    <div className="relative bg-[#0a0a16] border border-[#1f1f2e] rounded-2xl p-5 overflow-hidden group hover:border-opacity-60 transition-all" style={{ borderTopColor: color, borderTopWidth: 2 }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}22` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#00e57a] bg-[#00e57a]/10 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="font-mono text-3xl font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-[#808090] text-xs font-semibold uppercase tracking-wider">{label}</p>
      {sub && <p className="text-[#505060] text-xs font-mono mt-1">{sub}</p>}
    </div>
  );
}

/* ─── PROJECT CARD ─── */
function ProjectCard({ project, onClick, onDelete, isAdmin }: { project: Project; onClick: () => void; onDelete?: (e: React.MouseEvent) => void; isAdmin: boolean }) {
  const isPaid = project.status === "paid";
  return (
    <div
      className="group relative bg-[#0a0a16] border border-[#1f1f2e] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#e8a020]/30 hover:shadow-[0_0_30px_rgba(232,160,32,0.08)] hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#080810] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 thumbnail-gradient" />
        {/* Center play button */}
        <div className="relative z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#e8a020]/20 group-hover:border-[#e8a020]/40 transition-all duration-300 shadow-xl">
          <Play className="w-5 h-5 text-white fill-white ml-1" />
        </div>
        {/* Watermark overlay for preview */}
        {!isPaid && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-display text-[10px] tracking-[6px] text-white/10 rotate-12 uppercase">Preview Only</span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isPaid ? (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00e57a] text-black">
              <CheckCircle2 className="w-3 h-3" /> PAID
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#e8a020] text-black shadow-[0_0_12px_rgba(232,160,32,0.5)]">
              <Clock className="w-3 h-3" /> PREVIEW
            </span>
          )}
        </div>
        {/* Duration */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-mono rounded-lg">
          {project.duration}m
        </div>
        {/* Admin delete */}
        {isAdmin && onDelete && (
          <button
            className="absolute top-3 right-3 w-8 h-8 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-[#ff3b5c] transition-all opacity-0 group-hover:opacity-100"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {isAdmin && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#e8a020]/60 to-[#e040a0]/60 flex items-center justify-center text-[7px] font-bold text-black flex-shrink-0">
              {project.clientEmail[0].toUpperCase()}
            </div>
            <p className="text-xs font-mono text-[#606070] truncate">{project.clientEmail}</p>
          </div>
        )}
        <h3 className="font-display text-xl text-white mb-1.5 line-clamp-1 group-hover:text-[#e8a020] transition-colors">{project.title}</h3>
        <p className="text-sm text-[#606070] line-clamp-2 mb-4 leading-relaxed">{project.desc || "No description provided."}</p>
        <div className="flex items-center justify-between pt-3 border-t border-[#1a1a28]">
          <span className="font-mono text-lg font-bold text-white">{formatRupee(project.price)}</span>
          <span className={`text-sm font-semibold flex items-center gap-1 transition-all group-hover:translate-x-0.5 ${isPaid ? "text-[#00e5dc]" : "text-[#e8a020]"}`}>
            {isPaid ? "Download" : "Pay & Unlock"} <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN DASHBOARD ─── */
export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { currentUser, logout, projects, users, addProject, addUser, updateProject, deleteProject, deleteUser, isProductionMode, firebaseReady, firebaseConfig } = useApp();
  const { toast } = useToast();

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<string | null>("upi");

  const clientUsers = users.filter(u => u.role === "client");
  const paidProjects = projects.filter(p => p.status === "paid");
  const pendingProjects = projects.filter(p => p.status === "preview");
  const totalRevenue = paidProjects.reduce((s, p) => s + p.price, 0);
  const displayProjects = currentUser?.role === "admin" ? projects : projects.filter(p => p.clientEmail === currentUser?.email);

  const [newProject, setNewProject] = useState<Partial<Project>>({ title: "", clientEmail: "", price: 0, duration: 0, status: "preview", previewUrl: "", finalUrl: "", desc: "" });
  const [newClient, setNewClient] = useState<Partial<User>>({ name: "", email: "", password: "client123", phone: "", role: "client" });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.clientEmail) { toast({ variant: "destructive", title: "Select a client first", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" }); return; }
    const p: Project = { id: Math.random().toString(36).substr(2, 9), title: newProject.title || "Untitled", clientEmail: newProject.clientEmail, price: Number(newProject.price) || 0, duration: Number(newProject.duration) || 0, status: "preview", previewUrl: newProject.previewUrl || "", finalUrl: newProject.finalUrl || "", desc: newProject.desc || "", createdAt: new Date().toISOString() };
    addProject(p);
    setIsAddProjectOpen(false);
    setNewProject({ title: "", clientEmail: "", price: 0, duration: 0, status: "preview", previewUrl: "", finalUrl: "", desc: "" });
    toast({ title: "Project Created!", description: `Assigned to ${p.clientEmail}`, className: "bg-[#0a0a16] border-[#e8a020] text-white" });
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const c: User = { uid: Math.random().toString(36).substr(2, 9), name: newClient.name || "Unknown", email: newClient.email || "", password: newClient.password || "client123", phone: newClient.phone || "", role: "client" };
    addUser(c);
    setIsAddClientOpen(false);
    setNewClient({ name: "", email: "", password: "client123", phone: "", role: "client" });
    toast({ title: "Client Added!", description: `${c.name} added successfully`, className: "bg-[#0a0a16] border-[#00e5dc] text-white" });
  };

  const handleMarkPaid = (project: Project) => {
    const updated = { ...project, status: "paid" as const, paidAt: new Date().toISOString() };
    updateProject(updated);
    if (selectedProject?.id === project.id) setSelectedProject(updated);
    toast({ title: "Payment Recorded ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
  };

  const handlePayNow = () => {
    // Always read from env var directly — firebaseConfig in localStorage may be stale
    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY || firebaseConfig?.razorpayKey;
    // Use real Razorpay if key is configured
    if (rzpKey && selectedProject && typeof window.Razorpay !== "undefined") {
      const rzp = new window.Razorpay({
        key: rzpKey,
        amount: selectedProject.price * 100, // paise
        currency: "INR",
        name: "CutStudio Pro",
        description: selectedProject.title,
        handler: (response) => {
          setIsPaymentOpen(false);
          handleMarkPaid(selectedProject);
          toast({
            title: "Payment Successful! 🎉",
            description: `Payment ID: ${response.razorpay_payment_id}`,
            className: "bg-[#0a0a16] border-[#00e57a] text-white",
          });
        },
        prefill: { name: currentUser?.name, email: currentUser?.email },
        theme: { color: "#e8a020" },
        modal: { ondismiss: () => {} },
      });
      rzp.open();
    } else {
      // Razorpay not configured or not loaded
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Razorpay is not configured. Please contact support.",
        className: "bg-[#0a0a16] border-[#ff3b5c] text-white",
      });
    }
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this project? This cannot be undone.")) {
      deleteProject(id);
      toast({ title: "Project Deleted", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
    }
  };

  if (!currentUser) return null;

  const isAdmin = currentUser.role === "admin";
  const hasRazorpay = !!(import.meta.env.VITE_RAZORPAY_KEY || firebaseConfig?.razorpayKey);

  return (
    <div className="min-h-screen bg-[#05050d] text-white pb-20">

      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 nav-glass px-5 md:px-8 h-16 flex items-center justify-between relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e8a020] to-[#e040a0] flex items-center justify-center shadow-[0_0_16px_rgba(232,160,32,0.35)]">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display text-xl tracking-wider hidden sm:inline-block">CUT<span className="text-gradient">STUDIO PRO</span></span>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setIsAddClientOpen(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#1f1f2e] bg-[#0a0a16] text-white text-xs font-semibold hover:border-[#00e5dc]/30 hover:bg-[#00e5dc]/5 hover:text-[#00e5dc] transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Client
              </button>
              <button
                onClick={() => setIsAddProjectOpen(true)}
                className="btn-gold flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold relative overflow-hidden"
              >
                <span className="flex items-center gap-1.5 relative z-10"><Plus className="w-3.5 h-3.5" /> New Project</span>
              </button>
            </div>
          )}

          {/* Firebase / Demo status pill */}
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold ${firebaseReady ? "bg-[#00e57a]/8 border-[#00e57a]/20 text-[#00e57a]" : "bg-[#1f1f2e] border-[#2a2a3a] text-[#505060]"}`}>
            {firebaseReady ? <><Flame className="w-3 h-3" /> Firebase Live</> : <><WifiOff className="w-3 h-3" /> Demo Mode</>}
          </div>

          <div className="flex items-center gap-2.5 bg-[#0a0a16] border border-[#1f1f2e] rounded-full px-3 py-1.5">
            <Avatar className="h-7 w-7 border-2" style={{ borderColor: isAdmin ? "#e8a020" : "#00e5dc" }}>
              <AvatarFallback className="bg-[#0a0a16] text-xs font-bold" style={{ color: isAdmin ? "#e8a020" : "#00e5dc" }}>{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs font-semibold text-white">{currentUser.name}</span>
              <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: isAdmin ? "#e8a020" : "#00e5dc" }}>{currentUser.role}</span>
            </div>
          </div>

          <button onClick={() => { logout(); setLocation("/login"); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#606070] hover:text-white hover:bg-[#ff3b5c]/20 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">

        {/* ─── ADMIN STATS ─── */}
        {isAdmin && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total Projects" value={String(projects.length)} icon={Layers} color="#e8a020" trend="+12%" />
            <StatCard label="Clients" value={String(clientUsers.length)} icon={Users} color="#00e5dc" />
            <StatCard label="Paid" value={String(paidProjects.length)} icon={CheckCircle2} color="#00e57a" sub={`${projects.length > 0 ? Math.round(paidProjects.length / projects.length * 100) : 0}% conversion`} />
            <StatCard label="Revenue" value={formatRupee(totalRevenue)} icon={Wallet} color="#e8a020" trend="+8%" />
            <StatCard label="Pending" value={String(pendingProjects.length)} icon={Clock} color="#ff3b5c" sub="awaiting payment" />
          </div>
        )}

        {/* ─── CLIENT WELCOME ─── */}
        {!isAdmin && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[#606070] text-sm font-mono mb-1">Welcome back,</p>
              <h1 className="font-display text-5xl leading-none">
                {currentUser.name.split(" ")[0].toUpperCase()}<span className="text-gradient">.</span>
              </h1>
              <p className="text-[#808090] text-sm mt-2">
                {displayProjects.length} project{displayProjects.length !== 1 ? "s" : ""} · {displayProjects.filter(p => p.status === "paid").length} paid · {displayProjects.filter(p => p.status === "preview").length} awaiting payment
              </p>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              <div className="bg-[#0a0a16] border border-[#1f1f2e] rounded-xl p-4 text-center">
                <p className="font-mono text-2xl font-bold text-[#00e57a]">{displayProjects.filter(p => p.status === "paid").length}</p>
                <p className="text-[#606070] text-xs uppercase tracking-wider mt-0.5">Paid</p>
              </div>
              <div className="bg-[#0a0a16] border border-[#1f1f2e] rounded-xl p-4 text-center">
                <p className="font-mono text-2xl font-bold text-[#e8a020]">{formatRupee(displayProjects.filter(p => p.status === "preview").reduce((s, p) => s + p.price, 0))}</p>
                <p className="text-[#606070] text-xs uppercase tracking-wider mt-0.5">Due</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── ADMIN TABS ─── */}
        {isAdmin ? (
          <Tabs defaultValue="projects">
            <div className="flex items-center justify-between mb-5">
              <TabsList className="bg-[#0a0a16] border border-[#1f1f2e] p-1 rounded-xl h-auto gap-1">
                <TabsTrigger value="projects" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#e8a020] data-[state=active]:text-black data-[state=active]:font-bold text-[#808090] transition-all">
                  <Layers className="w-4 h-4 mr-1.5 inline-block" />Projects ({projects.length})
                </TabsTrigger>
                <TabsTrigger value="clients" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#e8a020] data-[state=active]:text-black data-[state=active]:font-bold text-[#808090] transition-all">
                  <Users className="w-4 h-4 mr-1.5 inline-block" />Clients ({clientUsers.length})
                </TabsTrigger>
              </TabsList>
              {/* Mobile add buttons */}
              <div className="flex md:hidden items-center gap-2">
                <button onClick={() => setIsAddClientOpen(true)} className="w-8 h-8 rounded-lg border border-[#1f1f2e] bg-[#0a0a16] flex items-center justify-center text-[#00e5dc]"><Users className="w-4 h-4" /></button>
                <button onClick={() => setIsAddProjectOpen(true)} className="btn-gold w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden"><span className="relative z-10"><Plus className="w-4 h-4" /></span></button>
              </div>
            </div>

            <TabsContent value="projects">
              {displayProjects.length === 0 ? (
                <EmptyState onAdd={() => setIsAddProjectOpen(true)} isAdmin={true} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayProjects.map(p => (
                    <ProjectCard key={p.id} project={p} isAdmin={true} onClick={() => { setSelectedProject(p); setIsDetailOpen(true); }} onDelete={(e) => handleDeleteProject(p.id, e)} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="clients">
              <ClientsTable clients={clientUsers} projects={projects} onDelete={deleteUser} onAddProject={(email) => { setNewProject(prev => ({ ...prev, clientEmail: email })); setIsAddProjectOpen(true); }} />
            </TabsContent>
          </Tabs>
        ) : (
          /* ─── CLIENT VIEW ─── */
          displayProjects.length === 0 ? (
            <EmptyState isAdmin={false} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayProjects.map(p => (
                <ProjectCard key={p.id} project={p} isAdmin={false} onClick={() => { setSelectedProject(p); setIsDetailOpen(true); }} />
              ))}
            </div>
          )
        )}
      </div>

      {/* ─── ADD PROJECT MODAL ─── */}
      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="bg-[#0a0a16] border-[#1f1f2e] text-white max-w-2xl p-0 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#e8a020]/60 to-transparent" />
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="font-display text-3xl tracking-wide">New Project</DialogTitle>
              <p className="text-[#606070] text-sm">Fill in the project details and assign it to a client.</p>
            </DialogHeader>
            <form onSubmit={handleAddProject} className="space-y-4">
              {/* Client Select — full width, prominent */}
              <div className="space-y-1.5">
                <Label className="text-[#a0a0b0] text-xs uppercase tracking-widest font-semibold">Assign to Client <span className="text-[#ff3b5c]">*</span></Label>
                <ClientSelect clients={clientUsers} value={newProject.clientEmail || ""} onChange={email => setNewProject(p => ({ ...p, clientEmail: email }))} />
                {clientUsers.length === 0 && (
                  <p className="text-xs text-[#e8a020]/70 font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> No clients yet — add a client first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[#a0a0b0] text-xs uppercase tracking-widest font-semibold">Project Title</Label>
                  <Input required value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} className="bg-[#05050d] border-[#1f1f2e] focus-visible:ring-[#e8a020]/40 focus-visible:border-[#e8a020]/40 text-white" placeholder="Wedding Highlights Reel" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#a0a0b0] text-xs uppercase tracking-widest font-semibold">Duration (mins)</Label>
                  <Input type="number" required min={1} value={newProject.duration || ""} onChange={e => setNewProject(p => ({ ...p, duration: Number(e.target.value) }))} className="bg-[#05050d] border-[#1f1f2e] focus-visible:ring-[#e8a020]/40 focus-visible:border-[#e8a020]/40 text-white font-mono" placeholder="5" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[#a0a0b0] text-xs uppercase tracking-widest font-semibold">Price (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e8a020]" />
                    <Input type="number" required min={0} value={newProject.price || ""} onChange={e => setNewProject(p => ({ ...p, price: Number(e.target.value) }))} className="bg-[#05050d] border-[#1f1f2e] focus-visible:ring-[#e8a020]/40 focus-visible:border-[#e8a020]/40 text-white font-mono pl-9" placeholder="8500" />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[#a0a0b0] text-xs uppercase tracking-widest font-semibold">Preview Video URL</Label>
                  <Input required value={newProject.previewUrl} onChange={e => setNewProject(p => ({ ...p, previewUrl: e.target.value }))} className="bg-[#05050d] border-[#1f1f2e] focus-visible:ring-[#e8a020]/40 focus-visible:border-[#e8a020]/40 text-white font-mono text-xs" placeholder="https://your-cdn.com/preview.mp4" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[#a0a0b0] text-xs uppercase tracking-widest font-semibold">Final HD URL</Label>
                  <Input required value={newProject.finalUrl} onChange={e => setNewProject(p => ({ ...p, finalUrl: e.target.value }))} className="bg-[#05050d] border-[#1f1f2e] focus-visible:ring-[#e8a020]/40 focus-visible:border-[#e8a020]/40 text-white font-mono text-xs" placeholder="https://your-cdn.com/final_hd.mp4" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[#a0a0b0] text-xs uppercase tracking-widest font-semibold">Description</Label>
                  <Textarea value={newProject.desc} onChange={e => setNewProject(p => ({ ...p, desc: e.target.value }))} className="bg-[#05050d] border-[#1f1f2e] focus-visible:ring-[#e8a020]/40 text-white resize-none" rows={2} placeholder="Brief project description…" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddProjectOpen(false)} className="flex-1 h-11 rounded-xl border border-[#1f1f2e] bg-transparent text-[#808090] hover:bg-[#1f1f2e] hover:text-white transition-all text-sm font-semibold">Cancel</button>
                <button type="submit" className="btn-gold flex-1 h-11 rounded-xl font-bold text-sm relative overflow-hidden"><span className="relative z-10">Create Project</span></button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── ADD CLIENT MODAL ─── */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="bg-[#0a0a16] border-[#1f1f2e] text-white max-w-md p-0 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00e5dc]/60 to-transparent" />
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="font-display text-3xl tracking-wide">Add Client</DialogTitle>
              <p className="text-[#606070] text-sm">Create a client account. They can log in with these credentials.</p>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "Rahul Verma" },
                { label: "Email Address", key: "email", type: "email", placeholder: "rahul@example.com" },
                { label: "Phone (optional)", key: "phone", type: "tel", placeholder: "+91 98765 43210" },
                { label: "Default Password", key: "password", type: "text", placeholder: "client123" },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-[#a0a0b0] text-xs uppercase tracking-widest font-semibold">{f.label}</Label>
                  <Input
                    type={f.type} required={f.key !== "phone"}
                    value={(newClient as any)[f.key]}
                    onChange={e => setNewClient(c => ({ ...c, [f.key]: e.target.value }))}
                    className="bg-[#05050d] border-[#1f1f2e] focus-visible:ring-[#00e5dc]/40 focus-visible:border-[#00e5dc]/40 text-white"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddClientOpen(false)} className="flex-1 h-11 rounded-xl border border-[#1f1f2e] bg-transparent text-[#808090] hover:bg-[#1f1f2e] hover:text-white transition-all text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 h-11 rounded-xl font-bold text-sm bg-[#00e5dc] text-black hover:bg-[#00e5dc]/80 transition-all">Save Client</button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── PROJECT DETAIL MODAL ─── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[#0a0a16] border-[#1f1f2e] text-white max-w-4xl p-0 overflow-hidden">
          {selectedProject && (
            <>
              {/* Video area */}
              <div className="relative aspect-video bg-black">
                {selectedProject.status === "preview" ? (
                  <>
                    <video src={selectedProject.previewUrl} className="w-full h-full object-cover opacity-80" controls />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="font-display text-5xl text-white/[0.07] rotate-12 tracking-[12px] uppercase border-4 border-white/[0.07] px-8 py-3">PREVIEW ONLY</span>
                    </div>
                  </>
                ) : (
                  <video src={selectedProject.finalUrl} className="w-full h-full object-cover" controls />
                )}
              </div>

              <div className="p-6 md:p-8 grid md:grid-cols-[1fr_280px] gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${selectedProject.status === "paid" ? "bg-[#00e57a]/15 text-[#00e57a] border border-[#00e57a]/25" : "bg-[#e8a020]/15 text-[#e8a020] border border-[#e8a020]/25"}`}>
                      {selectedProject.status === "paid" ? <><CheckCircle2 className="w-3.5 h-3.5" /> PAID</> : <><Clock className="w-3.5 h-3.5" /> AWAITING PAYMENT</>}
                    </span>
                    <span className="text-[#505060] text-xs font-mono">{format(new Date(selectedProject.createdAt), "MMM dd, yyyy")}</span>
                  </div>
                  <h2 className="font-display text-4xl leading-tight">{selectedProject.title}</h2>
                  {selectedProject.desc && <p className="text-[#a0a0b0] leading-relaxed text-sm">{selectedProject.desc}</p>}
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f2e] text-[#a0a0b0] text-xs font-mono"><Video className="w-3.5 h-3.5" /> {selectedProject.duration} mins</span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f2e] text-[#a0a0b0] text-xs font-mono">ID: {selectedProject.id.toUpperCase()}</span>
                    {isAdmin && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f2e] text-[#a0a0b0] text-xs font-mono"><Users className="w-3.5 h-3.5" /> {selectedProject.clientEmail}</span>}
                  </div>
                </div>

                {/* Right — payment panel */}
                <div className="bg-[#05050d] rounded-2xl border border-[#1f1f2e] p-5 flex flex-col gap-4">
                  <div>
                    <p className="text-[#606070] text-xs uppercase tracking-wider font-semibold mb-1">Project Value</p>
                    <p className="font-mono text-3xl font-bold text-gradient-gold">{formatRupee(selectedProject.price)}</p>
                  </div>
                  <div className="h-px bg-[#1f1f2e]" />
                  {selectedProject.status === "paid" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#00e57a] bg-[#00e57a]/10 px-3 py-2.5 rounded-xl text-sm font-semibold border border-[#00e57a]/20">
                        <CheckCircle2 className="w-4 h-4" /> Payment Received
                      </div>
                      {selectedProject.paidAt && <p className="text-xs font-mono text-[#505060]">Paid on {format(new Date(selectedProject.paidAt), "dd MMM yyyy, h:mm a")}</p>}
                      <a href={selectedProject.finalUrl} target="_blank" rel="noreferrer" download className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#00e5dc] text-black font-bold text-sm hover:bg-[#00e5dc]/80 transition-all">
                        <Download className="w-4 h-4" /> Download HD Final
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-[#e8a020] bg-[#e8a020]/8 p-3 rounded-xl text-xs border border-[#e8a020]/15">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>Watermark active until payment cleared.</span>
                      </div>
                      {!isAdmin ? (
                        <button className="btn-gold w-full h-12 rounded-xl font-bold text-base relative overflow-hidden shadow-[0_0_24px_rgba(232,160,32,0.35)]" onClick={() => setIsPaymentOpen(true)}>
                          <span className="relative z-10 flex items-center justify-center gap-2"><IndianRupee className="w-4 h-4" /> {hasRazorpay ? "Pay via Razorpay" : "Pay Now to Unlock"}</span>
                        </button>
                      ) : (
                        <button className="w-full h-11 rounded-xl border border-[#00e57a]/40 text-[#00e57a] hover:bg-[#00e57a]/10 transition-all font-bold text-sm" onClick={() => handleMarkPaid(selectedProject)}>
                          Mark as Paid Manually
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── PAYMENT MODAL ─── */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="bg-[#0a0a16] border-[#1f1f2e] text-white sm:max-w-sm p-0 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#e8a020]/60 to-transparent" />
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="font-display text-3xl">Pay Securely</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div className="bg-[#05050d] rounded-xl border border-[#1f1f2e] p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[#606070] text-xs uppercase tracking-wider font-semibold mb-0.5">Amount Due</p>
                    <p className="font-mono text-2xl font-bold text-[#e8a020]">{selectedProject ? formatRupee(selectedProject.price) : "₹0"}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#e8a020]/10 border border-[#e8a020]/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#e8a020]" />
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: Zap, label: "UPI / QR Code", color: "#e8a020", id: "upi" },
                    { icon: CreditCard, label: "Credit / Debit Card", color: "#00e5dc", id: "card" },
                    { icon: IndianRupee, label: "Net Banking", color: "#e040a0", id: "netbanking" },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`w-full flex items-center gap-3 h-13 px-4 py-3.5 rounded-xl border transition-all ${paymentMethod === m.id ? "border-[#e8a020]/50 bg-[#e8a020]/5" : "border-[#1f1f2e] bg-[#05050d] hover:border-[#1f1f2e] hover:bg-[#1f1f2e]"}`}
                      onClick={() => setPaymentMethod(m.id)}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${m.color}15`, border: `1px solid ${m.color}22` }}>
                        <m.icon className="w-4 h-4" style={{ color: m.color }} />
                      </div>
                      <span className="text-white font-semibold text-sm">{m.label}</span>
                      {paymentMethod === m.id && <Check className="w-4 h-4 text-[#e8a020] ml-auto" />}
                    </button>
                  ))}
                </div>

                <button className="btn-gold w-full h-12 rounded-xl font-bold relative overflow-hidden" onClick={handlePayNow}>
                  <span className="relative z-10 flex items-center justify-center gap-2">Pay Now <ArrowUpRight className="w-4 h-4" /></span>
                </button>
                <p className="text-center text-[#404050] text-xs flex items-center justify-center gap-1.5">
                  <Shield className="w-3 h-3" /> Secured by Razorpay · 256-bit SSL
                </p>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── CLIENTS TABLE ─── */
function ClientsTable({ clients, projects, onDelete, onAddProject }: { clients: User[]; projects: Project[]; onDelete: (uid: string) => void; onAddProject: (email: string) => void }) {
  if (clients.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-[#1f1f2e] rounded-2xl bg-[#0a0a16]">
        <div className="w-14 h-14 mx-auto bg-[#1f1f2e] rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-[#505060]" />
        </div>
        <h3 className="font-display text-2xl text-white mb-2">No clients yet</h3>
        <p className="text-[#606070] text-sm">Add your first client to start assigning projects.</p>
      </div>
    );
  }
  return (
    <div className="bg-[#0a0a16] border border-[#1f1f2e] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f1f2e] bg-[#080812]">
              {["Client", "Contact", "Projects", "Revenue", "Status", ""].map((h, i) => (
                <th key={i} className="px-6 py-4 text-left text-[#505060] text-xs uppercase tracking-widest font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => {
              const cp = projects.filter(p => p.clientEmail === c.email);
              const paid = cp.filter(p => p.status === "paid");
              const rev = paid.reduce((s, p) => s + p.price, 0);
              return (
                <tr key={c.uid} className={`border-b border-[#1f1f2e] hover:bg-[#1f1f2e]/30 transition-colors ${i === clients.length - 1 ? "border-0" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8a020]/60 to-[#e040a0]/60 flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="text-white font-semibold leading-none mb-0.5">{c.name}</p>
                        {c.phone && <p className="text-[#505060] text-xs font-mono">{c.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[#808090]">{c.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-mono font-bold">{paid.length}</div>
                      <div className="text-[#505060] text-xs">/ {cp.length} total</div>
                      {cp.length > 0 && (
                        <div className="h-1.5 w-16 rounded-full bg-[#1f1f2e] overflow-hidden">
                          <div className="h-full rounded-full bg-[#00e57a]" style={{ width: `${cp.length > 0 ? (paid.length / cp.length) * 100 : 0}%` }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-[#e8a020]">{rev > 0 ? formatRupee(rev) : <span className="text-[#404050]">—</span>}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit bg-[#00e57a]/10 text-[#00e57a] border border-[#00e57a]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e57a] status-live" /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-[#1f1f2e] text-[#e8a020] text-xs font-semibold hover:bg-[#e8a020]/10 hover:border-[#e8a020]/30 transition-all whitespace-nowrap"
                        onClick={() => onAddProject(c.email)}
                      >
                        <Plus className="w-3 h-3" /> Project
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#505060] hover:text-[#ff3b5c] hover:bg-[#ff3b5c]/10 transition-all"
                        onClick={() => onDelete(c.uid)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── EMPTY STATE ─── */
function EmptyState({ onAdd, isAdmin }: { onAdd?: () => void; isAdmin: boolean }) {
  return (
    <div className="py-24 text-center border border-dashed border-[#1f1f2e] rounded-2xl bg-[#0a0a16]">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1f1f2e] flex items-center justify-center mb-5">
        <Video className="w-8 h-8 text-[#505060]" />
      </div>
      <h3 className="font-display text-3xl text-white mb-2">No Projects Yet</h3>
      <p className="text-[#606070] max-w-sm mx-auto text-sm mb-6">{isAdmin ? "Create your first project and assign it to a client to get started." : "Your editor hasn't added any projects for you yet."}</p>
      {isAdmin && onAdd && (
        <button className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm relative overflow-hidden" onClick={onAdd}>
          <span className="relative z-10 flex items-center gap-2"><Plus className="w-4 h-4" /> Create First Project</span>
        </button>
      )}
    </div>
  );
}
