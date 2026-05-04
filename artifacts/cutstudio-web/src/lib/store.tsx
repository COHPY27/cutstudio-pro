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
  assignedToAdmin?: string;
  createdAt?: string;
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
  createdBy?: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  isProductionMode: boolean;
  firebaseReady: boolean;
  isLoading: boolean;
  isSetupMode: boolean;
  firebaseConfig: FirebaseConfig;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  createFirstAdmin: (adminData: Omit<User, 'uid' | 'role'>) => Promise<void>;
  setProductionMode: (isProd: boolean) => void;
  setFirebaseConfig: (config: FirebaseConfig) => void;
  refreshData: () => Promise<void>;
  myClients: User[];
  myProjects: Project[];
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    projects: [],
    isProductionMode: true,
    firebaseReady: false,
    isLoading: true,
    isSetupMode: false,
    firebaseConfig: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      razorpayKey: import.meta.env.VITE_RAZORPAY_KEY || "",
    },
  });

  const { toast } = useToast();

  const update = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize Firebase and load data
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
        console.log("🔥 Initializing Firebase...");

        const ready = initFirebase(state.firebaseConfig);
        if (!ready) {
          throw new Error("Firebase initialization failed");
        }

        const [fsUsers, fsProjects] = await Promise.all([
          fsGetAll<User>("users"),
          fsGetAll<Project>("projects"),
        ]);

        console.log(`📊 Loaded ${fsUsers.length} users, ${fsProjects.length} projects`);

        const admins = fsUsers.filter(u => u.role === "admin");
        
        if (admins.length === 0 && fsUsers.length === 0) {
          console.log("🌱 Setup Mode: No users found.");
          
          update({ 
            isSetupMode: true, 
            firebaseReady: true, 
            isLoading: false,
            users: [], 
            projects: [] 
          });
          
          return;
        }

        update({ 
          users: fsUsers, 
          projects: fsProjects, 
          isSetupMode: false,
          firebaseReady: true,
          isLoading: false 
        });

        if (admins.length > 0) {
          console.log(`✅ System ready: ${admins.length} admin(s), ${fsUsers.length - admins.length} client(s)`);
        }

        unsubUsers = fsListen<User>("users", (users) => {
          console.log("👥 Users updated:", users.length);
          update({ users });
          
          const adminCount = users.filter(u => u.role === "admin").length;
          if (adminCount === 0 && users.length === 0) {
            update({ isSetupMode: true });
          } else {
            update({ isSetupMode: false });
          }
        });

        unsubProjects = fsListen<Project>("projects", (projects) => {
          console.log("📹 Projects updated:", projects.length);
          update({ projects });
        });

      } catch (e: any) {
        console.error("❌ Firebase Error:", e);
        
        update({
          users: [],
          projects: [],
          firebaseReady: false,
          isLoading: false,
          isSetupMode: false
        });

        toast({ 
          variant: "destructive", 
          title: "Connection Failed", 
          description: e?.message || "Check your configuration",
          className: "bg-[#0a0a16] border-[#ff3b5c] text-white" 
        });
      }
    };

    initializeAndSync();

    return () => {
      unsubUsers?.();
      unsubProjects?.();
    };
  }, [state.firebaseConfig.apiKey, state.firebaseConfig.projectId]);

  // ✅✅✅ FIXED LOGIN FUNCTION ✅✅✅
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 === LOGIN ATTEMPT ===");
      console.log("📧 Email:", email.trim());
      console.log("🔑 Password length:", password.length);

      // Find user (case-insensitive, trimmed)
      const user = state.users.find(u => 
        u.email && u.email.toLowerCase().trim() === email.toLowerCase().trim()
      );

      if (!user) {
        console.log("❌ User not found. Available:", state.users.map(u => u.email));
        
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "User not found. Contact your administrator.",
          className: "bg-[#0a0a16] border-[#ff3b5c] text-white"
        });
        return false;
      }

      // ✅ FIXED: Proper comparison with trimming
      const storedPass = (user.password || "").trim();
      const inputPass = password.trim();

      console.log("🔒 Stored pass:", JSON.stringify(storedPass));
      console.log("⌨️ Input pass:", JSON.stringify(inputPass));
      console.log("⚖️ Match:", storedPass === inputPass);

      if (storedPass !== inputPass) {
        console.log("❌ PASSWORD MISMATCH!");
        
        toast({
          variant: "destructive",
          title: "Invalid Password",
          description: "Please check your credentials.",
          className: "bg-[#0a0a16] border-[#ff3b5c] text-white"
        });
        return false;
      }

      // Success!
      console.log(`✅ LOGIN SUCCESS: ${user.email} (${user.role})`);
      
      update({ currentUser: user });
      
      toast({
        title: `Welcome back, ${user.name}!`,
        description: `Logged in as ${user.role}`,
        className: "bg-[#0a0a16] border-[#00e57a] text-white"
      });
      
      return true;

    } catch (e) {
      console.error("❌ Login error:", e);
      return false;
    }
  };

  // ✅✅✅ FIXED CREATE FIRST ADMIN ✅✅✅
  const createFirstAdmin = async (adminData: Omit<User, 'uid' | 'role'>) => {
    if (!state.isSetupMode) {
      throw new Error("Setup already completed. Use normal user creation.");
    }

    try {
      const newAdmin: User = {
        uid: `admin-${Date.now()}`,
        ...adminData,
        role: "admin",
        createdAt: new Date().toISOString(),
      };

      // ✅✅✅ CRITICAL FIX: Save WITH password! ✅✅✅
      console.log("💾 Saving admin with password:", { 
        email: newAdmin.email, 
        hasPassword: !!newAdmin.password,
        passwordLength: newAdmin.password?.length 
      });
      
      await fsSet("users", newAdmin); // Save complete object with password!
      
      console.log("✅ First admin created:", newAdmin.email);
      
      toast({
        title: "🎉 Admin Created!",
        description: `Account ready. You can now log in.`,
        className: "bg-[#0a0a16] border-[#00e57a] text-white"
      });

      // Mark setup as complete
      update({ isSetupMode: false });

    } catch (e) {
      console.error("❌ Error creating admin:", e);
      throw e;
    }
  };

  // Logout
  const logout = () => {
    console.log("👋 Logged out");
    update({ currentUser: null });
  };

  // CRUD Operations
  const addProject = async (project: Project) => {
    try {
      const projectWithMeta = {
        ...project,
        createdBy: state.currentUser?.uid,
        createdAt: project.createdAt || new Date().toISOString(),
      };
      
      await fsSet("projects", projectWithMeta);
      toast({ title: "Project Created ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to save", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
      throw e;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      await fsSet("projects", project);
      toast({ title: "Project Updated ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update failed", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
      throw e;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await fsDelete("projects", id);
      toast({ title: "Project Deleted ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete failed", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
      throw e;
    }
  };

  const addUser = async (user: User) => {
    try {
      if (user.role === "client" && state.currentUser?.role === "admin") {
        user.assignedToAdmin = state.currentUser.uid;
      }

      // Note: For adding users (not first admin), we keep existing behavior
      // But ensure password is saved for login to work
      await fsSet("users", user); // ✅ Save complete user object
      toast({ title: `${user.role === 'admin' ? 'Admin' : 'Client'} Added ✓`, className: "bg-[#0a0a16] border-[#00e5dc] text-white" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to add user", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
      throw e;
    }
  };

  const deleteUser = async (uid: string) => {
    try {
      await fsDelete("users", uid);
      toast({ title: "User Deleted ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete failed", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
      throw e;
    }
  };

  const refreshData = async () => {
    try {
      update({ isLoading: true });
      const [fsUsers, fsProjects] = await Promise.all([
        fsGetAll<User>("users"),
        fsGetAll<Project>("projects"),
      ]);
      update({ users: fsUsers, projects: fsProjects, isLoading: false });
      toast({ title: "Data Refreshed ✓", className: "bg-[#0a0a16] border-[#00e57a] text-white" });
    } catch (e) {
      update({ isLoading: false });
      toast({ variant: "destructive", title: "Refresh Failed", className: "bg-[#0a0a16] border-[#ff3b5c] text-white" });
    }
  };

  // Filtered data
  const myClients = state.currentUser?.role === "admin"
    ? state.users.filter(u => u.role === "client" && u.assignedToAdmin === state.currentUser?.uid)
    : [];

  const myProjects = state.currentUser?.role === "admin"
    ? state.projects.filter(p => p.createdBy === state.currentUser?.uid)
    : state.projects.filter(p => p.clientEmail === state.currentUser?.email);

  const value: AppContextType = {
    ...state,
    login,
    logout,
    addProject,
    updateProject,
    deleteProject,
    addUser,
    deleteUser,
    createFirstAdmin,
    setProductionMode: (isProd) => update({ isProductionMode: isProd }),
    setFirebaseConfig: (config) => update({ firebaseConfig: config }),
    refreshData,
    myClients,
    myProjects,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
