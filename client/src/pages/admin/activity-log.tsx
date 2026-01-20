import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../../lib/queryClient";
import { useAuth } from "../../contexts/auth-context";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Users, Activity, LogOut, ArrowLeft } from "lucide-react";
import { UserMenu } from "../../components/user-menu";
//import logoPath from "@/src/assets/react.svg";
import type { ActivityLog } from "server/storage";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: "users" | "activity";
}

function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.clear();
      setLocation("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLocation("/login");
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r bg-card flex flex-col overflow-y-auto">
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

        <div className="px-4 py-3 border-b bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <h3 className="text-sm font-bold font-poppins text-foreground">Admin Panel</h3>
          <p className="text-xs text-muted-foreground">
            {currentPage === "users" ? "User Management" : "Activity Log"}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Navigation
          </p>
          <div className="space-y-1">
            <Link href="/admin/users">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === "users"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-foreground hover-elevate active-elevate-2"
                }`}
                data-testid="nav-users"
              >
                <Users className="h-4 w-4" />
                Users
              </div>
            </Link>

            <Link href="/admin/activity-log">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === "activity"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-foreground hover-elevate active-elevate-2"
                }`}
                data-testid="nav-activity-log"
              >
                <Activity className="h-4 w-4" />
                Activity Log
              </div>
            </Link>
          </div>
          
          <div className="my-3 border-t border-border"></div>
          
          <div className="space-y-1">
            <Link href="/">
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-foreground hover-elevate active-elevate-2"
                data-testid="button-back-to-main"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main Page
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left text-destructive hover:text-destructive hover:bg-destructive/10"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>

        <div className="p-3 border-t">
          <UserMenu />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}

export default function ActivityLogPage() {
  const [limit] = useState(100);
  const { user } = useAuth();

  // Only fetch if user is admin/superadmin
  const { data: activities, isLoading, error } = useQuery<ActivityLog[]>({
    queryKey: [`/api/activity-log?limit=${limit}`],
    enabled: !!(user && (user.role === "admin" || user.role === "superadmin")),
  });

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      collection: { label: "Collection", className: "bg-green-600 text-white" },
      disbursement: { label: "Disbursement", className: "bg-orange-600 text-white" },
      dfur: { label: "DFUR", className: "bg-purple-600 text-white" },
      budget_entry: { label: "Budget Entry", className: "bg-blue-600 text-white" },
    };
    return badges[type as keyof typeof badges] || badges.budget_entry;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { className: "bg-gray-400 text-white" },
      approved: { className: "bg-green-600 text-white" },
      flagged: { className: "bg-red-600 text-white" },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <AdminLayout currentPage="activity">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-foreground">Activity Log</h1>
          <p className="text-muted-foreground mt-1">Recent transactions across all modules</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <CardDescription>Latest {limit} transactions from all system modules</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground" data-testid="loading-activity-log">
                Loading activity log...
              </div>
            ) : error ? (
              <div className="py-8 text-center text-destructive" data-testid="error-activity-log">
                Error loading activity log. Please try again.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Transaction ID</TableHead>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities && activities.length > 0 ? (
                      activities.map((activity, index) => {
                        const typeBadge = getTypeBadge(activity.type);
                        const statusBadge = getStatusBadge(activity.status);
                        return (
                          <TableRow key={activity.id} data-testid={`row-activity-${index}`}>
                            <TableCell className="font-mono text-xs" data-testid={`text-transaction-id-${index}`}>
                              {activity.transactionId}
                            </TableCell>
                            <TableCell>
                              <Badge className={typeBadge.className} data-testid={`badge-type-${index}`}>
                                {typeBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {new Date(activity.date).toLocaleDateString('en-PH', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={activity.description}>
                              {activity.description}
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={activity.category}>
                              {activity.category}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(activity.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusBadge.className}>
                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          No activity logs available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
