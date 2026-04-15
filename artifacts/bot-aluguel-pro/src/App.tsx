import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import BotsPage from "@/pages/bots";
import BotDetailPage from "@/pages/bot-detail";
import BuilderPage from "@/pages/builder";
import PlansPage from "@/pages/plans";
import PaymentsPage from "@/pages/payments";
import AdminPage from "@/pages/admin";
import SettingsPage from "@/pages/settings";
import HostedBotsPage from "@/pages/hosted-bots";
import ProfilePage from "@/pages/profile";

setAuthTokenGetter(() => localStorage.getItem("bot_token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/bots" component={BotsPage} />
      <Route path="/dashboard/bots/:botId" component={BotDetailPage} />
      <Route path="/dashboard/builder" component={BuilderPage} />
      <Route path="/dashboard/plans" component={PlansPage} />
      <Route path="/dashboard/payments" component={PaymentsPage} />
      <Route path="/dashboard/settings" component={SettingsPage} />
      <Route path="/dashboard/hosted" component={HostedBotsPage} />
      <Route path="/dashboard/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
