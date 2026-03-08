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
  Loader2,
  Menu,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  History,
  LogIn,
  LogOut as LogOutIcon,
  Monitor,
  Globe,
  User,
  Clock,
  Shield,
  Search,
  Filter,
} from "lucide-react";
import { UserMenu } from "../../components/user-menu";
import logoPath from "../../assets/san_agustin.jpg";
import { ThemeToggle } from "@/components/theme-toggle";

/* =======================
   TYPES
======================= */
interface HistoryLog {
  id: number;
  action: string;
  created_at: string;
  description: string;
  ip_address: string;
  module: string;
  user_agent: string;
  user_id: number;
  username: string;
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
  currentPage: "users" | "activity" | "history";
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

        <Link href="/admin/history-log">
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer ${
              currentPage === "history" ? "bg-blue-600 text-white" : "hover:bg-muted"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <History className="h-4 w-4 flex-shrink-0" />
            History Logs
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
      <aside className="hidden md:flex w-64 border-r bg-card flex-col overflow-y-auto flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-card flex-shrink-0">
          <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <img src={logoPath} alt="Barangay Logo" className="h-8 w-8 rounded-full flex-shrink-0" />
            <span className="text-sm font-bold truncate">History Logs</span>
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
const getActionConfig = (action: string) => {
  const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    login: {
      color: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
      icon: <LogIn className="h-3 w-3" />,
      label: "Login",
    },
    logout: {
      color: "bg-amber-500/15 text-amber-600 border border-amber-500/30",
      icon: <LogOutIcon className="h-3 w-3" />,
      label: "Logout",
    },
  };
  return (
    map[action.toLowerCase()] ?? {
      color: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
      icon: <Activity className="h-3 w-3" />,
      label: action,
    }
  );
};

const getModuleBadgeColor = (module: string) => {
  const map: Record<string, string> = {
    authentication: "bg-violet-500/15 text-violet-600 border border-violet-500/30",
    finance: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
    users: "bg-cyan-500/15 text-cyan-600 border border-cyan-500/30",
  };
  return map[module.toLowerCase()] ?? "bg-gray-500/15 text-gray-600 border border-gray-500/30";
};

const parseUserAgent = (ua: string): string => {
  if (ua.includes("PostmanRuntime")) return "Postman";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Unknown";
};

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
};

const getUsernameColor = (username: string) => {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-fuchsia-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

/* =======================
   MOBILE CARD
======================= */
function HistoryCard({ log }: { log: HistoryLog }) {
  const actionCfg = getActionConfig(log.action);
  const { date, time } = formatDateTime(log.created_at);
  const browser = parseUserAgent(log.user_agent);
  const avatarColor = getUsernameColor(log.username);

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-card shadow-sm hover:shadow-md transition-shadow">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-xs font-bold uppercase">
              {log.username.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate capitalize">{log.username}</p>
            <p className="text-xs text-muted-foreground">UID #{log.user_id}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${actionCfg.color}`}>
          {actionCfg.icon}
          {actionCfg.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-snug">{log.description}</p>

      {/* Meta Row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Globe className="h-3 w-3 flex-shrink-0" />
          <span className="truncate font-mono">{log.ip_address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Monitor className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{browser}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${getModuleBadgeColor(log.module)}`}>
          <Shield className="h-3 w-3" />
          {log.module}
        </span>
        <div className="text-right">
          <p className="text-xs font-medium">{date}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
}

/* =======================
   STATS CARDS
======================= */
function StatsBar({ logs }: { logs: HistoryLog[] }) {
  const logins = logs.filter((l) => l.action === "login").length;
  const logouts = logs.filter((l) => l.action === "logout").length;
  const uniqueUsers = new Set(logs.map((l) => l.user_id)).size;

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {[
        { label: "Total Events", value: logs.length, icon: <History className="h-4 w-4" />, color: "text-blue-600", bg: "bg-blue-500/10" },
        { label: "Logins", value: logins, icon: <LogIn className="h-4 w-4" />, color: "text-emerald-600", bg: "bg-emerald-500/10" },
        { label: "Active Users", value: uniqueUsers, icon: <User className="h-4 w-4" />, color: "text-violet-600", bg: "bg-violet-500/10" },
      ].map(({ label, value, icon, color, bg }) => (
        <div key={label} className="rounded-xl border bg-card p-3 md:p-4 flex items-center gap-3 shadow-sm">
          <div className={`h-9 w-9 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-lg md:text-2xl font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
          </div>
        </div>
      ))}
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
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
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
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-medium text-foreground">{startItem}–{endItem}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span> events
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
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
        <span className="sm:hidden text-sm font-medium px-2 select-none">{currentPage} / {totalPages}</span>
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* =======================
   PAGE
======================= */
export default function HistoryLogPage() {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [filtered, setFiltered] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<"all" | "login" | "logout">("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = [...logs];
    if (actionFilter !== "all") result = result.filter((l) => l.action === actionFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.username.toLowerCase().includes(q) ||
          l.ip_address.includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.module.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [logs, searchQuery, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://barangayfinancetrackbackenddeployment.onrender.com/api/get-activity-history-log"
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data: HistoryLog[] = await response.json();

      // Sort newest first
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLogs(data);
    } catch (err) {
      console.error("Error fetching history logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminLayout currentPage="history">
      <div className="p-4 md:p-6 space-y-4 md:space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-poppins">History Logs</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track user authentication and system activity
            </p>
          </div>
          <Button
            onClick={fetchLogs}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Stats */}
        {!loading && !error && <StatsBar logs={logs} />}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by username, IP, module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            {(["all", "login", "logout"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActionFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                  actionFilter === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-background hover:bg-muted border-border text-muted-foreground"
                }`}
              >
                {f === "all" ? "All Events" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600" />
                  Audit Trail
                </CardTitle>
                <CardDescription className="mt-0.5">
                  {loading
                    ? "Loading..."
                    : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 md:p-6 md:pt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">Loading history logs...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <p className="font-semibold text-destructive mb-1">Failed to load data</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchLogs} variant="outline" size="sm">Try Again</Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground px-4">
                <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No events found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 px-4 pt-3 pb-1">
                  {paginated.map((log) => (
                    <HistoryCard key={log.id} log={log} />
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">User</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Action</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Module</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Description</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">IP Address</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Browser</TableHead>
                        <TableHead className="font-semibold text-xs uppercase tracking-wide">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((log) => {
                        const actionCfg = getActionConfig(log.action);
                        const { date, time } = formatDateTime(log.created_at);
                        const browser = parseUserAgent(log.user_agent);
                        const avatarColor = getUsernameColor(log.username);

                        return (
                          <TableRow key={log.id} className="hover:bg-muted/30 transition-colors group">
                            {/* User */}
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <div className={`h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                                  <span className="text-white text-xs font-bold uppercase">
                                    {log.username.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium capitalize">{log.username}</p>
                                  <p className="text-xs text-muted-foreground">UID #{log.user_id}</p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Action */}
                            <TableCell>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${actionCfg.color}`}>
                                {actionCfg.icon}
                                {actionCfg.label}
                              </span>
                            </TableCell>

                            {/* Module */}
                            <TableCell>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${getModuleBadgeColor(log.module)}`}>
                                <Shield className="h-3 w-3" />
                                {log.module}
                              </span>
                            </TableCell>

                            {/* Description */}
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{log.description}</span>
                            </TableCell>

                            {/* IP */}
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                                <Globe className="h-3 w-3 flex-shrink-0" />
                                {log.ip_address}
                              </div>
                            </TableCell>

                            {/* Browser */}
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Monitor className="h-3 w-3 flex-shrink-0" />
                                {browser}
                              </div>
                            </TableCell>

                            {/* Timestamp */}
                            <TableCell>
                              <div className="flex items-start gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-medium">{date}</p>
                                  <p className="text-xs text-muted-foreground">{time}</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
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