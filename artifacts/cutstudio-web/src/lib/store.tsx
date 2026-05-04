import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { initFirebase, fsGetAll, fsSet, fsDelete, fsBatchWrite, fsListen, FirebaseConfig } from "./firebase";

export type Role = "admin" | "client";

export interface User {
  uid: string;
  email: string;
  password?: string;
  name: string;
  role: Role;
  phone?: string;
}

export interface Project {
  id: string;
  title: string;
  clientEmail: string;
  price: number;
  duration: number;
  status: "preview" | "paid";
  previewUrl: string;
  finalUrl: string;
  desc: string;
  createdAt: string;
  paidAt?: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  isProductionMode: boolean;
  firebaseReady: boolean;
  firebaseConfig: FirebaseConfig;
}

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  setProductionMode: (isProd: boolean) => void;
  setFirebaseConfig: (config: FirebaseConfig) => void;
}

// ✏️ CHANGE THIS: Replace with your real admin email and password
const defaultUsers: User[] = [
  {
    uid: "admin-001",
    email: "admin@yourdomain.com",   // ← apni email yahan
    password: "Change@Me123!",        // ← apna strong password yahan
    name: "Admin",
    role: "admin",
  },
];

const LS_KEY = "cutstudio_state_v3"; // bumped to reset stale localStorage

const getInitialState = (): AppState => {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        // Always use fresh defaultUsers — never stale localStorage users
        users: defaultUsers,
        // Always load Firebase config from env vars (never from localStorage)
        firebaseConfig: {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY || parsed.firebaseConfig?.apiKey || "",
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || parsed.firebaseConfig?.projectId || "",
          razorpayKey: import.meta.env.VITE_RAZORPAY_KEY || parsed.firebaseConfig?.razorpayKey || "",
        },
        isProductionMode: true,
      };
    }
  } catch {}
  return {
    currentUser: null,
    users: defaultUsers,
    projects: [],
    isProductionMode: true,
    firebaseReady: false,
    firebaseConfig: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      razorpayKey: import.meta.env.VITE_RAZORPAY_KEY || "",
    },
  };
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(getInitialState);
  const { toast } = useToast();

  // Persist to localStorage (but NOT firebase config — that comes from env)
  useEffect(() => {
    const { firebaseConfig, ...rest } = state;
    localStorage.setItem(LS_KEY, JSON.stringify(rest));
  }, [state]);

  const update = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Firebase: initialize and sync
  useEffect(() => {
    if (!state.firebaseConfig.apiKey || !state.firebaseConfig.projectId) {
      update({ firebaseReady: false });
      return;
    }

    const ready = initFirebase(state.firebaseConfig);
    if (!ready) {
      toast({ variant: "destructive", title: "Firebase Error", description: "Check your API Key and Project ID.", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
      return;
    }

    const seedAndListen = async () => {
      try {
        const [fsUsers, fsProjects] = await Promise.all([
          fsGetAll<User>("users"),
          fsGetAll<Project>("projects"),
        ]);

        if (fsUsers.length === 0) await fsBatchWrite("users", state.users);
        if (fsProjects.length === 0 && state.projects.length > 0) await fsBatchWrite("projects", state.projects);

        const usersToUse = fsUsers.length > 0 ? fsUsers : state.users;
        const projectsToUse = fsProjects.length > 0 ? fsProjects : state.projects;
        update({ users: usersToUse, projects: projectsToUse, firebaseReady: true });

        toast({ title: "🔥 Firebase Connected", description: "Data syncing in real-time.", className: "bg-[#0a0a16] border-[#00e5dc] text-white" });

        const unsubUsers = fsListen<User>("users", users => update({ users }));
        const unsubProjects = fsListen<Project>("projects", projects => update({ projects }));
        return () => { unsubUsers(); unsubProjects(); };
      } catch (e: any) {
        toast({ variant: "destructive", title: "Firestore Error", description: e?.message || "Connection failed", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
        update({ firebaseReady: false });
      }
    };

    let cleanup: (() => void) | undefined;
    seedAndListen().then(fn => { cleanup = fn; });
    return () => cleanup?.();
  }, [state.firebaseConfig.apiKey, state.firebaseConfig.projectId]);

  const value: AppContextType = {
    ...state,
    login: user => update({ currentUser: user }),
    logout: () => update({ currentUser: null }),
    addProject: async (project) => {
      update({ projects: [project, ...state.projects] });
      if (state.firebaseReady) await fsSet("projects", project);
    },
    updateProject: async (project) => {
      update({ projects: state.projects.map(p => p.id === project.id ? project : p) });
      if (state.firebaseReady) await fsSet("projects", project);
    },
    deleteProject: async (id) => {
      update({ projects: state.projects.filter(p => p.id !== id) });
      if (state.firebaseReady) await fsDelete("projects", id);
    },
    addUser: async (user) => {
      update({ users: [...state.users, user] });
      if (state.firebaseReady) await fsSet("users", user);
    },
    deleteUser: async (uid) => {
      update({ users: state.users.filter(u => u.uid !== uid) });
      if (state.firebaseReady) await fsDelete("users", uid);
    },
    setProductionMode: (isProd) => update({ isProductionMode: isProd }),
    setFirebaseConfig: (config) => update({ firebaseConfig: config }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
