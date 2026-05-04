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

function AppRoutes() {
  const { currentUser, isLoading, isSetupMode } = useApp();

  // LOADING STATE - Loading screen with white/visible background
  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: '#05050d', // Same as loading screen
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}>
        <LoadingScreen />
      </div>
    );
  }

  console.log("✅ App loaded! Redirecting...");

  return (
    <Switch>
      {/* Root redirect */}
      <Route path="/" component={() => {
        console.log("🔄 At root, user:", currentUser?.email || "none");
        
        if (isSetupMode) {
          return <Redirect to="/setup" />;
        }
        if (currentUser) {
          return <Redirect to="/dashboard" />;
        }
        return <Redirect to="/home" />; // Default for non-logged-in users
      }} />
      
      <Route path="/home">
        {() => {
          console.log("🏠 Rendering HOME page");
          return <Home />;
        }}
      </Route>
      
      <Route path="/login" component={Login} />
      
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {/* Background effects */}
          <div className="noise-overlay" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
          <div className="orb orb-1" style={{ position: 'fixed', zIndex: 0 }} />
          <div className="orb orb-2" style={{ position: 'fixed', zIndex: 0 }} />
          <div className="orb orb-3" style={{ position: 'fixed', zIndex: 0 }} />
          
          {/* Main content area with explicit background */}
          <div style={{
            position: 'relative', 
            zIndex: 1, 
            minHeight: '100vh',
            backgroundColor: '#05050d' // Force background color
          }}>
            <AppRoutes />
          </div>
        </WouterRouter>
        
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
