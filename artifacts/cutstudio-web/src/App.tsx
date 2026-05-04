import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/lib/store";
import { SetupWizard } from "@/components/ui/SetupWizard"; // NEW: Import setup wizard
import NotFound from "@/pages/not-found";
import LoadingScreen from "@/pages/loading";
import Home from "@/pages/home";
import Login from "@/pages/login"; // Your updated login (from previous message)
import Dashboard from "@/pages/dashboard";

/**
 * Protected Route Component
 * Redirects to login if user not authenticated
 */
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { currentUser, isLoading, firebaseReady } = useApp();
  
  // Still loading or Firebase not ready
  if (isLoading || !firebaseReady) {
    return <LoadingScreen />;
  }
  
  // Not logged in → redirect to login
  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

/**
 * Public Route Component  
 * Redirects to dashboard if already logged in (optional)
 */
function PublicRoute({ component: Component, ...rest }: any) {
  const { currentUser, isLoading, firebaseReady, isSetupMode } = useApp();
  
  // Show loading while connecting
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // If in setup mode and trying to access login, show setup instead
  if (isSetupMode && rest.path === "/login") {
    return <Component {...rest} />; // Login.tsx handles setup mode UI internally
  }
  
  // Already logged in → redirect to dashboard (optional - remove if you want users to access login when logged in)
  if (currentUser && (rest.path === "/login" || rest.path === "/")) {
    return <Redirect to="/dashboard" />;
  }
  
  return <Component {...rest} />;
}

/**
 * Main Router Configuration
 */
function Router() {
  const { isLoading, isSetupMode, currentUser, firebaseReady } = useApp();

  return (
    <Switch>
      {/* ─── PUBLIC ROUTES ─── */}
      
      {/* Home/Landing Page */}
      <Route path="/home" component={Home} />
      
      {/* Login Page - handles setup mode internally */}
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      
      {/* NEW: Setup Wizard Route */}
      {isSetupMode && (
        <Route path="/setup" component={SetupWizard} />
      )}
      
      {/* ─── PROTECTED ROUTES ─── */}
      
      {/* Dashboard - requires authentication */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      
      {/* Default redirect */}
      <Route path="/" component={LoadingScreen} />
      
      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Root App Component
 * Provides global state via AppProvider
 */
function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {/* Background Effects */}
          <div className="noise-overlay" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          
          {/* Main Router */}
          <Router />
        </WouterRouter>
        
        {/* Global Toast Notifications */}
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
