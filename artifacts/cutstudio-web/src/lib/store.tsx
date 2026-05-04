import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { initFirebase, fsGetAll, fsSet, fsDelete, fsBatchWrite, fsListen, FirebaseConfig } from "./firebase";

export type Role = "admin" | "client";

export interface User {
  uid: string;
  email: string;
  password?: string; // Only for creation, never stored in Firestore!
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
  isLoading: boolean; // NEW: Track loading state
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
  refreshData: () => Promise<void>; // NEW: Manual refresh
}

// ✏️ Default admin user (for seeding only)
const defaultAdminUser: User = {
  uid: "admin-001",
  email: "admin@yourdomain.com",   // ← Change this
  password: "Change@Me123!",        // ← Change this
  name: "Admin",
  role: "admin",
};

// ❌ REMOVED: const LS_KEY = "cutstudio_state_v3"; 
// ❌ REMOVED: All localStorage logic

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Initial State: NO localStorage, fresh every time
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [], // Start empty, load from Firebase
    projects: [], // Start empty, load from Firebase
    isProductionMode: true,
    firebaseReady: false,
    isLoading: true, // NEW: Show loading spinner initially
    firebaseConfig: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      razorpayKey: import.meta.env.VITE_RAZORPAY_KEY || "",
    },
  });

  const { toast } = useToast();

  // ✅ REMOVED: localStorage persistence useEffect
  // Data now lives ONLY in Firebase + React state (memory)

  const update = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // ✅ Firebase: Initialize and sync (MAIN DATA SOURCE)
  useEffect(() => {
    if (!state.firebaseConfig.apiKey || !state.firebaseConfig.projectId) {
      console.warn("⚠️ Firebase config missing");
      update({ firebaseReady: false, isLoading: false });
      return;
    }

    let unsubUsers: (() => void) | undefined;
    let unsubProjects: (() => void) | undefined;

    const initializeAndSync = async () => {
      try {
        console.log("🔥 Initializing Firebase (NO localStorage)...");

        // Initialize Firebase SDK
        const ready = initFirebase(state.firebaseConfig);
        if (!ready) {
          throw new Error("Firebase initialization failed. Check API Key.");
        }

        // Check if collections exist and seed if needed
        const [fsUsers, fsProjects] = await Promise.all([
          fsGetAll<User>("users"),
          fsGetAll<Project>("projects"),
        ]);

        console.log(`📊 Found ${fsUsers.length} users, ${fsProjects.length} projects in Firestore`);

        // Seed default admin if no users exist (first time setup)
        if (fsUsers.length === 0) {
          console.log("🌱 Seeding default admin user...");
          await fsSet("users", { ...defaultAdminUser, createdAt: new Date().toISOString() });
        }

        // Use Firestore data (or empty arrays if first time)
        const usersToUse = fsUsers.length > 0 ? fsUsers : [defaultAdminUser];
        const projectsToUse = fsProjects.length > 0 ? fsProjects : [];

        // Update state with Firebase data
        update({ 
          users: usersToUse, 
          projects: projectsToUse, 
          firebaseReady: true,
          isLoading: false 
        });

        toast({ 
          title: "🔥 Firebase Connected", 
          description: `${usersToUse.length} users, ${projectsToUse.length} projects loaded`, 
          className: "bg-[#0a0a16] border-[#00e5dc] text-white" 
        });

        // ✅ REAL-TIME LISTENERS: Keep data synced with Firestore
        unsubUsers = fsListen<User>("users", (users) => {
          console.log("👥 Users updated from Firestore:", users.length);
          update({ users });
        });

        unsubProjects = fsListen<Project>("projects", (projects) => {
          console.log("📹 Projects updated from Firestore:", projects.length);
          update({ projects });
        });

      } catch (e: any) {
        console.error("❌ Firebase Error:", e);
        
        // Fallback: Use default admin in memory only (won't persist)
        update({
          users: [defaultAdminUser],
          projects: [],
          firebaseReady: false,
          isLoading: false
        });

        toast({ 
          variant: "destructive", 
          title: "Firebase Connection Failed", 
          description: e?.message || "Using demo mode. Data won't be saved.",
          className: "bg-[#0a0a16] border-[#ff3b5c] text-white" 
        });
      }
    };

    initializeAndSync();

    // Cleanup listeners on unmount
    return () => {
      unsubUsers?.();
      unsubProjects?.();
      console.log("🧹 Cleaned up Firebase listeners");
    };
  }, [state.firebaseConfig.apiKey, state.firebaseConfig.projectId]);

  // ✅ NEW: Manual refresh function
  const refreshData = async () => {
    try {
      update({ isLoading: true });
      const [fsUsers, fsProjects] = await Promise.all([
        fsGetAll<User>("users"),
        fsGetAll<Project>("projects"),
      ]);
      update({ 
        users: fsUsers, 
        projects: fsProjects, 
        isLoading: false 
      });
      toast({ title: "Data Refreshed ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
    } catch (e) {
      update({ isLoading: false });
      toast({ variant: "destructive", title: "Refresh Failed", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
    }
  };

  const value: AppContextType = {
    ...state,
    
    // Auth functions (in-memory only, no localStorage)
    login: (user) => {
      console.log("✅ User logged in:", user.email);
      update({ currentUser: user });
    },
    
    logout: () => {
      console.log("👋 User logged out (cleared memory)");
      update({ currentUser: null });
      // Note: No localStorage to clear! ✓
    },

    // ✅ CRUD Operations: Write to Firebase FIRST, then update local state
    addProject: async (project) => {
      try {
        if (state.firebaseReady) {
          await fsSet("projects", project); // Write to Firestore first
          console.log("💾 Project saved to Firestore:", project.id);
        }
        // Update local state for immediate UI feedback
        update({ projects: [project, ...state.projects] });
        toast({ title: "Project Created ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
      } catch (e) {
        toast({ variant: "destructive", title: "Failed to save project", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
        throw e;
      }
    },

    updateProject: async (project) => {
      try {
        if (state.firebaseReady) {
          await fsSet("projects", project); // Update in Firestore
          console.log("✏️ Project updated in Firestore:", project.id);
        }
        update({ projects: state.projects.map(p => p.id === project.id ? project : p) });
        toast({ title: "Project Updated ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
      } catch (e) {
        toast({ variant: "destructive", title: "Failed to update", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
        throw e;
      }
    },

    deleteProject: async (id) => {
      try {
        if (state.firebaseReady) {
          await fsDelete("projects", id); // Delete from Firestore
          console.log("🗑️ Project deleted from Firestore:", id);
        }
        update({ projects: state.projects.filter(p => p.id !== id) });
        toast({ title: "Project Deleted ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
      } catch (e) {
        toast({ variant: "destructive", title: "Failed to delete", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
        throw e;
      }
    },

    addUser: async (user) => {
      try {
        if (state.firebaseReady) {
          // Never store password in Firestore!
          const { password, ...safeUserData } = user;
          await fsSet("users", safeUserData); // Write to Firestore (without password)
          console.log("👤 User saved to Firestore:", user.uid);
        }
        update({ users: [...state.users, user] }); // Keep password in memory only
        toast({ title: "Client Added ✓", className: "bg-[#0a0a16] border-[#00e5dc] text-white" });
      } catch (e) {
        toast({ variant: "destructive", title: "Failed to add client", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
        throw e;
      }
    },

    deleteUser: async (uid) => {
      try {
        if (state.firebaseReady) {
          await fsDelete("users", uid); // Delete from Firestore
          console.log("🗑️ User deleted from Firestore:", uid);
        }
        update({ users: state.users.filter(u => u.uid !== uid) });
        toast({ title: "Client Deleted ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
      } catch (e) {
        toast({ variant: "destructive", title: "Failed to delete", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
        throw e;
      }
    },

    setProductionMode: (isProd) => update({ isProductionMode: isProd }),
    setFirebaseConfig: (config) => update({ firebaseConfig: config }),
    refreshData, // NEW: Expose refresh function
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
