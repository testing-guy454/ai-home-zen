import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
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
import { BarChart3, Home, Settings as SettingsIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const queryClient = new QueryClient();

function TopBar() {
  const location = useLocation();
  const title = location.pathname === "/"
    ? "Dashboard"
    : location.pathname === "/analytics"
    ? "Analytics"
    : location.pathname === "/settings"
    ? "Settings"
    : "";
  return (
    <div className="sticky top-0 z-10 -mx-4 md:-mx-8 mb-6 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 md:px-8 py-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <span className="text-lg font-semibold bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="px-3 py-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary shadow-[var(--shadow-glow)]" />
                <span className="text-sm font-semibold">SmartHome AI</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                        <Link to="/">
                          <Home />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname.startsWith("/analytics")}>
                        <Link to="/analytics">
                          <BarChart3 />
                          <span>Analytics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname.startsWith("/settings")}>
                        <Link to="/settings">
                          <SettingsIcon />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="px-2 py-3">
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="https://builder.io" target="_blank" rel="noreferrer">Powered by Builder</a>
              </Button>
            </SidebarFooter>
            <SidebarSeparator />
          </Sidebar>
          <SidebarInset>
            <TopBar />
            <div className="p-4 md:p-8">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
