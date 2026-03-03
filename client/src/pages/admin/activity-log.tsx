import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import {
  Users,
  Activity,
  LogOut,
  ArrowLeft,
  Loader2,
  Menu,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { UserMenu } from "../../components/user-menu";
import logoPath from "../../assets/san_agustin.jpg";
import { api } from "@/utils/api";
import { ThemeToggle } from "@/components/theme-toggle";

/* =======================
   TYPES
======================= */
type StatusKey = "pending" | "approved" | "flagged";

interface ActivityLog {
  id: string;
  transactionId: string;
  type: string;
  date: string;
  description: string;
  category: string;
  amount: string;
  status: StatusKey;
  payee?: string;
  payor?: string;
  reviewComment?: string;
}

/* =======================
   CONSTANTS
======================= */
const MOCK_ADMIN_USER = { role: "admin" };
const ROWS_PER_PAGE = 10;

/* =======================
   LAYOUT
======================= */
interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: "users" | "activity";
}

function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = MOCK_ADMIN_USER;

  const handleLogout = () => setLocation("/login");

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    setLocation("/login");
    return null;
  }

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={logoPath}
            alt="Barangay San Agustin Logo"
            className="h-12 w-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-bold font-poppins truncate">
              Barangay San Agustin
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              Financial Monitoring System
            </p>
            <p className="text-xs text-muted-foreground">Iba, Zambales</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-bold font-poppins">Admin Panel</h3>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link href="/admin/users">
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer ${
              currentPage === "users" ? "bg-blue-600 text-white" : "hover:bg-muted"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Users className="h-4 w-4 flex-shrink-0" />
            Users
          </div>
        </Link>

        <Link href="/admin/activity-log">
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer ${
              currentPage === "activity" ? "bg-blue-600 text-white" : "hover:bg-muted"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Activity className="h-4 w-4 flex-shrink-0" />
            Activity Log
          </div>
        </Link>

        <div className="border-t my-3" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-destructive hover:bg-destructive/10 rounded-md w-full"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Logout
        </button>
      </nav>

      <div className="border-t p-3 flex flex-col items-center justify-start">
        <ThemeToggle />
        <UserMenu />
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card flex-col overflow-y-auto flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 bg-card border-r flex flex-col overflow-y-auto transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-2 border-b">
          <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-card flex-shrink-0">
          <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <img src={logoPath} alt="Barangay Logo" className="h-8 w-8 rounded-full flex-shrink-0" />
            <span className="text-sm font-bold truncate">Activity Log</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}

/* =======================
   HELPERS
======================= */
const getTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    collection: "bg-green-600 text-white",
    disbursement: "bg-orange-600 text-white",
    budget_entry: "bg-blue-600 text-white",
    dfur: "bg-purple-600 text-white",
  };
  return map[type] ?? "bg-gray-400 text-white";
};

const getStatusBadge = (status: StatusKey) => {
  const map: Record<StatusKey, string> = {
    pending: "bg-gray-400 text-white",
    approved: "bg-green-600 text-white",
    flagged: "bg-red-600 text-white",
  };
  return map[status];
};

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date: string) =>
  date
    ? new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
    : "N/A";

/* =======================
   MOBILE ACTIVITY CARD
======================= */
function ActivityCard({ activity }: { activity: ActivityLog }) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground truncate">
          {activity.transactionId}
        </span>
        <Badge className={`${getStatusBadge(activity.status)} text-xs flex-shrink-0`}>
          {activity.status}
        </Badge>
      </div>

      <p className="text-sm font-medium leading-snug line-clamp-2">
        {activity.description || "—"}
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <Badge className={`${getTypeBadge(activity.type)} text-xs`}>
          {activity.type.replace("_", " ")}
        </Badge>
        {activity.category && (
          <span className="text-xs text-muted-foreground truncate">{activity.category}</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
        <span className="text-sm font-semibold">{formatCurrency(activity.amount)}</span>
      </div>
    </div>
  );
}

/* =======================
   PAGINATION
======================= */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) {
  const startItem = (currentPage - 1) * ROWS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ROWS_PER_PAGE, totalItems);

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (currentPage > 3) pages.push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-0 py-4 border-t mt-2">
      {/* Count label */}
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        Showing{" "}
        <span className="font-medium text-foreground">{startItem}–{endItem}</span>
        {" "}of{" "}
        <span className="font-medium text-foreground">{totalItems}</span> transactions
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          size="icon" variant="outline" className="h-8 w-8"
          onClick={() => onPageChange(1)} disabled={currentPage === 1} title="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="icon" variant="outline" className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} title="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Page numbers — hidden on xs */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, idx) =>
            page === "ellipsis" ? (
              <span key={`e-${idx}`} className="px-1.5 text-muted-foreground text-sm select-none">…</span>
            ) : (
              <Button
                key={page}
                size="icon"
                variant={page === currentPage ? "default" : "outline"}
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Compact label on very small screens */}
        <span className="sm:hidden text-sm font-medium px-2 select-none">
          {currentPage} / {totalPages}
        </span>

        <Button
          size="icon" variant="outline" className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} title="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="icon" variant="outline" className="h-8 w-8"
          onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} title="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* =======================
   PAGE
======================= */
export default function ActivityLogPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1);

      const response = await fetch("https://barangayfinancetrackbackenddeployment.onrender.com/api/get-all-docs");

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const transformedData: ActivityLog[] = data.map((item: any) => {
        let type = "collection";
        let description = "";
        let category = "";
        let amount = "0.00";
        let date = "";

        if (item.transaction_id?.startsWith("COLL-")) {
          type = "collection";
          description = item.nature_of_collection || "Collection";
          category = item.nature_of_collection || "Collection";
          amount = item.amount || "0.00";
          date = item.transaction_date || item.created_at;
        } else if (item.transaction_id?.startsWith("DISB-")) {
          type = "disbursement";
          description = item.nature_of_disbursement || "Disbursement";
          category = item.nature_of_disbursement || "Disbursement";
          amount = item.amount || "0.00";
          date = item.transaction_date || item.created_at;
        } else if (item.transaction_id?.startsWith("BUDG-")) {
          type = "budget_entry";
          description = item.expenditure_program || "Budget Entry";
          category = item.allocation_category || "Budget";
          amount = item.amount || "0.00";
          date = item.transaction_date || item.created_at;
        } else if (item.transaction_id?.startsWith("DFUR-")) {
          type = "dfur";
          description = item.project || "Development Fund Utilization";
          category = item.name_of_collection || "DFUR";
          amount = item.total_cost_incurred || item.total_cost_approved || "0.00";
          date = item.transaction_date || item.created_at;
        }

        let status: StatusKey = "pending";
        if (item.review_status === "approved") status = "approved";
        else if (item.is_flagged === 1) status = "flagged";

        return {
          id: String(item.id),
          transactionId: item.transaction_id || "N/A",
          type,
          date,
          description,
          category,
          amount,
          status,
          payee: item.payee,
          payor: item.payor,
          reviewComment: item.review_comment,
        };
      });

      transformedData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setActivityLogs(transformedData);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(activityLogs.length / ROWS_PER_PAGE));
  const paginatedLogs = activityLogs.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminLayout currentPage="activity">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold font-poppins">Activity Log</h1>
          <Button
            onClick={fetchActivityLogs}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Recent Transactions</CardTitle>
            <CardDescription>
              {loading
                ? "Loading transactions..."
                : `Showing ${activityLogs.length} transactions`}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 md:p-6 md:pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 px-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground text-sm">Loading activity logs...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-4">
                <p className="text-destructive font-semibold mb-2">Error loading data</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchActivityLogs} variant="outline">Try Again</Button>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground px-4">
                No transactions found
              </div>
            ) : (
              <>
                {/* Mobile: Card List */}
                <div className="md:hidden space-y-3 px-4 pt-2">
                  {paginatedLogs.map((activity) => (
                    <ActivityCard
                      key={`${activity.transactionId}-${activity.id}`}
                      activity={activity}
                    />
                  ))}
                </div>

                {/* Desktop: Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.map((activity) => (
                        <TableRow key={`${activity.transactionId}-${activity.id}`}>
                          <TableCell className="font-mono text-xs">
                            {activity.transactionId}
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeBadge(activity.type)}>
                              {activity.type.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(activity.date)}</TableCell>
                          <TableCell className="max-w-xs truncate">{activity.description}</TableCell>
                          <TableCell>{activity.category}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(activity.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(activity.status)}>
                              {activity.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination — both mobile & desktop */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={activityLogs.length}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}