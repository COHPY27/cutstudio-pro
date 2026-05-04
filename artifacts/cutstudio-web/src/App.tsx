import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
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
 * Protected Route - Requires authentication
 */
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { currentUser, isLoading, firebaseReady } = useApp();
  
  // Still loading or Firebase not ready
  if (isLoading || !firebaseReady) {
    return <LoadingScreen />;
  }
  
  // Not authenticated → redirect to login
  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  
  // Authenticated → show component
  return <Component {...rest} />;
}

/**
 * Main Application Router
 * Handles all routing scenarios including root URL
 */
function AppRouter() {
  const { isLoading, isSetupMode, currentUser, firebaseReady } = useApp();

  // ─── LOADING STATE ───
  if (isLoading || !firebaseReady) {
    return <LoadingScreen />;
  }

  // ─── SCENARIO A: SETUP MODE (No users exist yet) ───
  if (isSetupMode && !currentUser) {
    return (
      <Switch>
        {/* Setup wizard page */}
        <Route path="/setup" component={SetupWizard} />
        
        {/* Home page still accessible */}
        <Route path="/home" component={Home} />
        
        {/* ⭐ ROOT URL + ALL OTHERS → Redirect to /setup */}
        <Route path="/">
          <Redirect to="/setup" />
        </Route>
        
        {/* Catch unknown routes → also go to setup */}
        <Route component={() => <Redirect to="/setup" />} 
        />
      </Switch>
    );
  }

  // ─── SCENARIO B: NORMAL MODE (Users exist) ───
  return (
    <Switch>
      {/* PUBLIC PAGES */}
      <Route path="/home" component={Home} />
      
      {/* Login page - redirect if already logged in */}
      <Route 
        path="/login" 
        component={() => {
          // If already logged in and visits /login, send to dashboard
          if (currentUser) {
            return <Redirect to="/dashboard" />;
          }
          return <Login />;
        }} 
      />
      
      {/* Setup page - redirect to login if not in setup mode */}
      <Route 
        path="/setup" 
        component={() => {
          if (isSetupMode) {
            return <SetupWizard />;
          }
          return <Redirect to="/login" />;
        }} 
      />

      {/* PROTECTED: Dashboard */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      
      {/* ⭐⭐⭐ ROOT URL "/" - SMART REDIRECT ⭐⭐⭐ */}
      <Route path="/">
        {(() => {
          // Priority 1: If logged in → dashboard
          if (currentUser) {
            return <Redirect to="/dashboard" />;
          }
          
          // Priority 2: Not logged in → login page
          return <Redirect to="/login" />;
        })()}
      </Route>

      {/* 404 Catch-All - Only for truly unknown paths */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Root App Component
 */
function App() {
  // Base path configuration
  const basePath = ''; // Empty for relative paths on GitHub Pages
  
  return (
    <AppProvider>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          {/* Background decorative elements */}
          <div className="noise-overlay" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          
          {/* Main application router */}
          <AppRouter />
        </WouterRouter>
        
        {/* Global toast notifications */}
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
