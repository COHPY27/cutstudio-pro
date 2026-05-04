import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/lib/store";
import { SetupWizard } from "@/components/ui/SetupWizard";
import NotFound from "@/pages/not-found";
import LoadingScreen from "@/pages/loading";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { currentUser, isLoading, firebaseReady } = useApp();
  
  if (isLoading || !firebaseReady) {
    return <LoadingScreen />;
  }
  
  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function AppRouter() {
  const { isLoading, isSetupMode, currentUser, firebaseReady } = useApp();

  if (isLoading || !firebaseReady) {
    return <LoadingScreen />;
  }

  if (isSetupMode && !currentUser) {
    return (
      <Switch>
        <Route path="/setup" component={SetupWizard} />
        <Route path="/home" component={Home} />
        <Route path="/">
          <Redirect to="/setup" />
        </Route>
        <Route component={() => <Redirect to="/setup" />} 
        />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/home" component={Home} />
      
      <Route 
        path="/login" 
        component={() => {
          if (currentUser) {
            return <Redirect to="/dashboard" />;
          }
          return <Login />;
        }} 
      />
      
      <Route 
        path="/setup" 
        component={() => {
          if (isSetupMode) {
            return <SetupWizard />;
          }
          return <Redirect to="/login" />;
        }} 
      />

      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      
      <Route path="/">
        {() => {
          if (currentUser) {
            return <Redirect to="/dashboard" />;
          }
          return <Redirect to="/login" />;
        }()}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const basePath = '';
  
  return (
    <AppProvider>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <div className="noise-overlay" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          
          <AppRouter />
        </WouterRouter>
        
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
