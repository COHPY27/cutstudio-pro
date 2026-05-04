import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/lib/store";
import { SetupWizard } from "@/components/ui/SetupWizard"; // Your path
import NotFound from "@/pages/not-found";
import LoadingScreen from "@/pages/loading";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";

/**
 * ─── PROTECTED ROUTE ───
 * Only shows component if user is logged in AND firebase is ready
 */
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { currentUser, isLoading, firebaseReady } = useApp();
  
  // ⭐ CRITICAL: Wait for Firebase + data to load
  if (isLoading || !firebaseReady) {
    return <LoadingScreen />;
  }
  
  // Not authenticated → redirect to login
  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  
  // Authenticated → show the protected page
  return <Component {...rest} />;
}

/**
 * ─── MAIN ROUTER COMPONENT ───
 * Handles ALL routing scenarios intelligently
 */
function AppRouter() {
  const { isLoading, isSetupMode, currentUser, firebaseReady } = useApp();

  // ─── PHASE 1: LOADING STATE ───
  // Show loading spinner until Firebase connects and data loads
  if (isLoading || !firebaseReady) {
    return <LoadingScreen />;
  }

  // ─── PHASE 2: SETUP MODE (No users in Firestore yet) ───
  if (isSetupMode && !currentUser) {
    return (
      <Switch>
        {/* Setup wizard route */}
        <Route path="/setup" component={SetupWizard} />
        
        {/* Home page still accessible during setup */}
        <Route path="/home" component={Home} />
        
        {/* ⭐ ROOT URL + ALL OTHERS → Redirect to /setup */}
        <Route path="/">
          <Redirect to="/setup" />
        </Route>
        
        {/* Catch-all: any unknown route → setup */}
        <Route component={() => <Redirect to="/setup" />} 
        />
      </Switch>
    );
  }

  // ─── PHASE 3: NORMAL MODE (Users exist in Firestore) ───
  return (
    <Switch>
      {/* PUBLIC PAGES */}
      <Don't touch home page */}
      <Route path="/home" component={Home} />
      
      {/* Login page - smart redirect if already logged in */}
      <Route 
        path="/login" 
        component={() => {
          // If user visits /login but is already logged in → send to dashboard
          if (currentUser) {
            return <Redirect to="/dashboard" />;
          }
          // Otherwise show login form
          return <Login />;
        }} 
      />
      
      {/* Setup page - only accessible in setup mode */}
      <Route 
        path="/setup" 
        component={() => {
          // If somehow accessing /setup when not in setup mode
          if (isSetupMode) {
            return <SetupWizard />;
          }
          // Otherwise redirect to login
          return <Redirect to="/login" />;
        }} 
      />

      {/* PROTECTED: Dashboard - requires auth */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      
      {/* ⭐⭐⭐ ROOT URL "/" - THE MOST IMPORTANT ROUTE ⭐⭐⭐ */}
      <Route path="/">
        {(() => {
          // Smart redirect based on authentication state
          
          // Priority 1: User is logged in → go to dashboard
          if (currentUser) {
            return <Redirect to="/dashboard" />;
          }
          
          // Priority 2: Not logged in → go to login
          return <Redirect to="/login" />;
          
        })()}
      </Route>

      {/* 404 CATCH-ALL - Only for truly unknown paths like /xyz123 */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * ─── ROOT APP COMPONENT ───
 * Wraps everything with providers and renders router
 */
function App() {
  // Safe base path configuration for GitHub Pages
  const basePath = ''; // Empty string = relative paths
  
  return (
    <AppProvider>
      <TooltipProvider>
        {/* Wouter Router with base path */}
        <WouterRouter base={basePath}>
          {/* Decorative background effects */}
          <div className="noise-overlay" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          
          {/* Main application router with all logic */}
          <AppRouter />
        </WouterRouter>
        
        {/* Global toast notification system */}
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
