import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
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
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function AppContent() {
  const { currentUser, isLoading, isSetupMode } = useApp();

  // ✅ LOADING STATE - LoadingScreen dikhao
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 9999 }}>
        <LoadingScreen />
      </div>
    );
  }

  // ✅ NOT LOADING - Actual content dikhao
  console.log("🎯 Rendering app content - User:", currentUser?.email || "None", "Setup:", isSetupMode);
  
  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Switch>
        <Route path="/">
          {isSetupMode ? (
            <Redirect to="/setup" />
          ) : currentUser ? (
            <Redirect to="/dashboard" />
          ) : (
            <Redirect to="/home" />
          )}
        </Route>
        
        <Route path="/home" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {/* ✅ Background effects - z-index ensure kiya */}
          <div className="noise-overlay" style={{ position: 'fixed', zIndex: 0 }} />
          <div className="orb orb-1" style={{ position: 'fixed', zIndex: 0 }} />
          <div className="orb orb-2" style={{ position: 'fixed', zIndex: 0 }} />
          <div className="orb orb-3" style={{ position: 'fixed', zIndex: 0 }} />
          
          {/* ✅ Content layer */}
          <AppContent />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
