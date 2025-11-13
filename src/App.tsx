import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AI from "./pages/AI";
import NotFound from "./pages/NotFound";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { BarChart3, Home, Settings as SettingsIcon, Brain } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const queryClient = new QueryClient();

function TopBar() {
  const location = useLocation();
  const title = location.pathname === "/"
    ? "Dashboard"
    : location.pathname === "/analytics"
    ? "Analytics"
    : location.pathname === "/ai"
    ? "AI & Automation"
    : location.pathname === "/settings"
    ? "Settings"
    : "";
  return (
    <div className="sticky top-0 z-10 mb-8 border-b border-border/30 bg-background/50 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="rounded-lg hover:bg-secondary/50 transition-colors" />
          <span className="text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

function AppSidebar() {
  const location = useLocation();
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]" />
          <span className="text-base font-bold bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>SmartHome AI</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/"} className="h-10 rounded-lg hover:bg-sidebar-accent/60 transition-colors">
                  <Link to="/">
                    <Home className="h-4.5 w-4.5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith("/analytics")} className="h-10 rounded-lg hover:bg-sidebar-accent/60 transition-colors">
                  <Link to="/analytics">
                    <BarChart3 className="h-4.5 w-4.5" />
                    <span className="font-medium">Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith("/ai")} className="h-10 rounded-lg hover:bg-sidebar-accent/60 transition-colors">
                  <Link to="/ai">
                    <Brain className="h-4.5 w-4.5" />
                    <span className="font-medium">AI</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith("/settings")} className="h-10 rounded-lg hover:bg-sidebar-accent/60 transition-colors">
                  <Link to="/settings">
                    <SettingsIcon className="h-4.5 w-4.5" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 py-4 border-t border-sidebar-border">
        <Button asChild variant="outline" size="sm" className="w-full font-medium">
          <a href="https://builder.io" target="_blank" rel="noreferrer">Powered by Builder</a>
        </Button>
      </SidebarFooter>
      <SidebarSeparator />
    </Sidebar>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <TopBar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarInset>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
