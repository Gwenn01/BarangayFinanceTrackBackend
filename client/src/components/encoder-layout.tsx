import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  DollarSign,
  FileText,
  TrendingUp,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { UserMenu } from "../components/user-menu";
import logoPath from "../assets/san_agustin.jpg";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "./theme-toggle";

const encoderModules = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/encoder/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "abo",
    title: "Annual Budget Ordinance",
    abbreviation: "ABO",
    url: "/encoder/abo",
    icon: DollarSign,
  },
  {
    id: "sre",
    title: "Statement of Receipts & Expenditures",
    abbreviation: "SRE",
    url: "/encoder/sre",
    icon: FileText,
  },
  {
    id: "dfur",
    title: "Development Fund Utilization Report",
    abbreviation: "DFUR",
    url: "/encoder/dfur",
    icon: TrendingUp,
  },
];

interface EncoderLayoutProps {
  children: React.ReactNode;
}

export function EncoderLayout({ children }: EncoderLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout?.();
  };

  const SidebarContent = () => (
    <>
      {/* Barangay Header */}
      <div className="p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={logoPath}
            alt="Barangay San Agustin Logo"
            className="h-12 w-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground font-poppins leading-tight truncate">
              Barangay San Agustin
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              Financial Monitoring System
            </p>
            <p className="text-xs text-muted-foreground">Iba, Zambales</p>
          </div>
        </div>
      </div>

      {/* Role Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-br from-chart-1/10 to-chart-1/5">
        <h3 className="text-sm font-bold font-poppins text-foreground">
          Encoder Portal
        </h3>
        <p className="text-xs text-muted-foreground">Financial Data Entry</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {encoderModules.map((module) => {
          const Icon = module.icon;
          const isActive = location === module.url;

          return (
            <Link key={module.id} href={module.url}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-auto py-2.5 px-3 ${
                  isActive ? "bg-primary/10 text-primary font-medium" : ""
                }`}
                data-testid={`nav-${module.id}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm leading-tight truncate">
                    {module.title}
                  </div>
                  {module.abbreviation && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {module.abbreviation}
                    </div>
                  )}
                </div>
              </Button>
            </Link>
          );
        })}

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <div className="flex-1 text-left">
            <div className="text-sm leading-tight font-medium">Logout</div>
          </div>
        </Button>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t flex items-center justify-center flex-col">
        <ThemeToggle />
        <UserMenu />
      </div>
    </>
  );

  // Get current module title for mobile top bar
  const currentModule =
    encoderModules.find((m) => m.url === location)?.title || "Encoder Portal";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-1/6 min-w-[200px] max-w-[360px] border-r bg-card flex-col overflow-y-auto flex-shrink-0">
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

      {/* Main Content Area */}
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
            />
            <span className="text-sm font-bold truncate">{currentModule}</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}