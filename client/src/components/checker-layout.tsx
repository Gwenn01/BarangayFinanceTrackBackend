import { useLocation, Link } from "wouter";
import { FileText, TrendingUp, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { UserMenu } from "../components/user-menu";
//import logoPath from "@assets/570006557_1804615333498831_8118356708932147603_n_1762095297397.jpg";
import { apiRequest, queryClient } from "../lib/queryClient";

const checkerModules = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/checker/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "sre",
    title: "Statement of Receipts & Expenditures",
    abbreviation: "SRE",
    url: "/checker/sre",
    icon: FileText,
  },
  {
    id: "dfur",
    title: "Development Fund Utilization Report",
    abbreviation: "DFUR",
    url: "/checker/dfur",
    icon: TrendingUp,
  },
];

interface CheckerLayoutProps {
  children: React.ReactNode;
}

export function CheckerLayout({ children }: CheckerLayoutProps) {
  const [location, setLocation] = useLocation();
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.clear();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-card flex flex-col overflow-y-auto">
        {/* Barangay Header */}
        <div className="p-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-3">
            <img 
              //src={logoPath} 
              alt="Barangay San Agustin Logo" 
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-sm font-bold text-foreground font-poppins leading-tight">
                Barangay San Agustin
              </h2>
              <p className="text-xs text-muted-foreground">Financial Monitoring System</p>
              <p className="text-xs text-muted-foreground">Iba, Zambales</p>
            </div>
          </div>
        </div>

        {/* Role Header */}
        <div className="px-4 py-3 border-b bg-gradient-to-br from-chart-2/10 to-chart-2/5">
          <h3 className="text-sm font-bold font-poppins text-foreground">Checker Portal</h3>
          <p className="text-xs text-muted-foreground">Transaction Review</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {checkerModules.map((module) => {
            const Icon = module.icon;
            const isActive = location === module.url;
            
            return (
              <Link key={module.id} href={module.url}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-auto py-3 px-3 ${
                    isActive ? "bg-primary/10 text-primary font-medium" : ""
                  }`}
                  data-testid={`nav-${module.id}`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm leading-tight">{module.title}</div>
                    {module.abbreviation && (
                      <div className="text-xs text-muted-foreground mt-0.5">{module.abbreviation}</div>
                    )}
                  </div>
                </Button>
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-3 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
            <div className="flex-1 text-left">
              <div className="text-sm leading-tight font-medium">Logout</div>
            </div>
          </Button>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t">
          <UserMenu />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
