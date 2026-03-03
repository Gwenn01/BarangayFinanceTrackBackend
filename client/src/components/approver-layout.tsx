import { useState } from "react";
import { useLocation, Link } from "wouter";
import { FileText, TrendingUp, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Button } from "../components/ui/button";
import logoPath from "../assets/san_agustin.jpg";
import { useAuth } from "@/contexts/auth-context";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";

const approverModules = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/approver/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "sre",
    title: "Statement of Receipts & Expenditures",
    abbreviation: "SRE",
    url: "/approver/sre",
    icon: FileText,
  },
  {
    id: "dfur",
    title: "Development Fund Utilization Report",
    abbreviation: "DFUR",
    url: "/approver/dfur",
    icon: TrendingUp,
  },
];

interface ApproverLayoutProps {
  children: React.ReactNode;
}

export function ApproverLayout({ children }: ApproverLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    logout?.();
    setLocation("/login");
  };

  const currentModule =
    approverModules.find((m) => m.url === location)?.title || "Approver Portal";

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img
            src={logoPath}
            alt="Barangay San Agustin Logo"
            className="h-12 w-12 rounded-full object-cover flex-shrink-0"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div className="min-w-0">
            <h2 className="text-sm font-bold leading-tight truncate">
              Barangay San Agustin
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              Financial Monitoring System
            </p>
            <p className="text-xs text-muted-foreground">Iba, Zambales</p>
          </div>
        </div>
      </div>

      {/* Role */}
      <div className="px-4 py-3 border-b bg-gradient-to-br from-chart-3/10 to-chart-3/5">
        <h3 className="text-sm font-bold">Approver Portal</h3>
        <p className="text-xs text-muted-foreground">Transaction Approval</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {approverModules.map((module) => {
          const Icon = module.icon;
          const isActive = location === module.url;

          return (
            <Link key={module.id} href={module.url}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 py-3 px-3 ${
                  isActive ? "bg-primary/10 text-primary font-medium" : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm truncate">{module.title}</div>
                  {module.abbreviation && (
                    <div className="text-xs text-muted-foreground">
                      {module.abbreviation}
                    </div>
                  )}
                </div>
              </Button>
            </Link>
          );
        })}

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 py-3 px-3 text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </nav>

      <div className="border-t p-3 flex items-center justify-center flex-col">
        <ThemeToggle />
        <UserMenu />
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-1/6 min-w-[200px] max-w-[360px] border-r bg-card flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-card border-r flex flex-col overflow-y-auto transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-2 border-b">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-card flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={logoPath}
              alt="Barangay Logo"
              className="h-8 w-8 rounded-full flex-shrink-0"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="text-sm font-bold truncate">{currentModule}</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}