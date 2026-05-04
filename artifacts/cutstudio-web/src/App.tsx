import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/lib/store";
import NotFound from "@/pages/not-found";
import LoadingScreen from "@/pages/loading";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    window.location.href = "/login";
    return null;
  }
  
  return <Component {...rest} />;
}

function AppRoutes() {
  const { currentUser, isLoading, isSetupMode } = useApp();

  // LOADING STATE
  if (isLoading) {
    console.log("⏳ Showing loading screen...");
    return <LoadingScreen />;
  }

  console.log("🎯 DECIDING ROUTE:", { 
    user: currentUser?.email || "NONE", 
    setup: isSetupMode 
  });

  // ✅ DIRECT RENDER - No redirect component at all!
  if (isSetupMode) {
    console.log("🔧 Setup mode - showing setup");
    return <div style={{ color: 'white', padding: 50 }}>Setup Page Coming Soon</div>;
  }

  if (currentUser) {
    console.log("👤 User logged in - showing Dashboard");
    return <ProtectedRoute component={Dashboard} />;
  }

  // DEFAULT: Show HOME directly
  console.log("🏠 NO USER - Rendering HOME directly!!!!");
  return <Home />;
}

function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {/* Background */}
          <div className="noise-overlay" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
          <div className="orb orb-1" style={{ position: 'fixed', zIndex: 0 }} />
          <div className="orb orb-2" style={{ position: 'fixed', zIndex: 0 }} />
          <div className="orb orb-3" style={{ position: 'fixed', zIndex: 0 }} />
          
          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            minHeight: '100vh',
            backgroundColor: '#05050d'
          }}>
            {/* REMOVED Switch/Route - Direct render logic */}
            <AppRoutes />
          </div>
        </WouterRouter>
        
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
