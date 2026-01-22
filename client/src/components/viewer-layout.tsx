import { Link, useLocation } from "wouter";
import { FileText, Home, Eye, LogOut, Shield, ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";
import { UserMenu } from "../components/user-menu";
import { useAuth } from "../contexts/auth-context";
import logoPath from "../assets/san_agustin.jpg";
import { apiRequest, queryClient } from "../lib/queryClient";

interface ViewerLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { path: "/viewer/dashboard", label: "Dashboard", icon: Home },
];

export function ViewerLayout({ children }: ViewerLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
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
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border sticky top-0 z-10 bg-card">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={logoPath} 
              alt="Barangay San Agustin Logo" 
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-base font-bold text-foreground font-poppins leading-tight">
                Barangay San Agustin
              </h2>
              <p className="text-xs text-muted-foreground">Financial Monitoring System</p>
              <p className="text-xs text-muted-foreground">Iba, Zambales</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border border-emerald-200 dark:border-emerald-800">
            <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">Viewer Access</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Read-only</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Navigation
          </p>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-foreground hover-elevate active-elevate-2"
                    )}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Divider */}
          <div className="my-3 border-t border-border"></div>
          
          {/* Actions */}
          <div className="space-y-1">
            {/* Back to Main Page Button */}
            <Link href="/">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  "text-foreground hover-elevate active-elevate-2"
                )}
                data-testid="button-back-to-main"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main Page
              </div>
            </Link>
            
            {/* Admin Login Button - Only show if user is NOT logged in */}
            {!user && (
              <Link href="/login">
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  )}
                  data-testid="button-admin-login"
                >
                  <Shield className="h-4 w-4" />
                  Admin Login
                </div>
              </Link>
            )}
            
            {/* Logout Button - Only show if user is logged in */}
            {user && (
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left",
                  "text-destructive hover:text-destructive hover:bg-destructive/10"
                )}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </nav>

        {/* Footer - Only show UserMenu if user is logged in */}
        {user && (
          <div className="p-3 border-t border-border">
            <UserMenu />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-muted/30">
        {children}
      </div>
    </div>
  );
}
