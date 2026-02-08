import { useLocation, Link } from "wouter";
import { FileText, TrendingUp, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import logoPath from "../assets/san_agustin.jpg";
import { useAuth } from "@/contexts/auth-context";
import { UserMenu } from "./user-menu";

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
  const [location, setLocation] = useLocation(); // ✅ FIXED
  const { logout } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    logout?.();
    setLocation("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-1/6 border-r bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img
              src={logoPath}
              alt="Barangay San Agustin Logo"
              className="h-12 w-12 rounded-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")} // fallback
            />
            <div>
              <h2 className="text-sm font-bold leading-tight">
                Barangay San Agustin
              </h2>
              <p className="text-xs text-muted-foreground">
                Financial Monitoring System
              </p>
              <p className="text-xs text-muted-foreground">Iba, Zambales</p>
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="px-4 py-3 border-b bg-gradient-to-br from-chart-3/10 to-chart-3/5">
          <h3 className="text-sm font-bold">Approver Portal</h3>
          <p className="text-xs text-muted-foreground">
            Transaction Approval
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {approverModules.map((module) => {
            const Icon = module.icon;
            const isActive = location === module.url; // ✅ now works

            return (
              <Link key={module.id} href={module.url}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 py-3 px-3 ${
                    isActive ? "bg-primary/10 text-primary font-medium" : ""
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />

                  <div className="flex-1 text-left">
                    <div className="text-sm">{module.title}</div>
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
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </nav>

                <div className="border-t p-3 flex items-center justify-start">
                  <UserMenu />
                </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
