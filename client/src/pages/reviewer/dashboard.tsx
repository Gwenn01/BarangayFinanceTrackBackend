import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Flag,
  TrendingUp,
  ClipboardCheck,
  ArrowUpRight,
  Wallet,
  BarChart3,
} from "lucide-react";
import { ReviewerLayout } from "../../components/reviewer-layout";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { format } from "date-fns";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://barangayfinancetrackbackenddeployment.onrender.com/api";

export type DfurProject = {
  id: number;
  transaction_id: string;
  transaction_date: string | null;
  project: string;
  name_of_collection: string;
  location: string;
  total_cost_approved: string;
  total_cost_incurred: string;
  date_started: string | null;
  target_completion_date: string | null;
  no_extensions: number;
  status: string;
  review_status: "pending" | "approved" | "flagged";
  reviewed_by?: number | null;
  remarks?: string;
  review_comment?: string;
};

type ApiResponse = {
  data: DfurProject[];
  message: string;
};

type TotalDataResponse = {
  overall_cost_approved: string;
  overall_cost_incurred: string;
  total_active: number;
  total_approved: number;
  total_data: number;
  total_flagged: number;
  total_pending: number;
};

const getStatusColor = (status: string) => {
  const s = status?.toLowerCase() || "";
  switch (s) {
    case "completed":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "in progress":
    case "in_progress":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "planned":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "on hold":
    case "on_hold":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      return "bg-muted";
  }
};

const getReviewStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "flagged":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
  }
};

const formatStatusDisplay = (status: string) => {
  if (!status) return "N/A";
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

export default function ReviewerDashboard() {
  const [viewProject, setViewProject] = useState<DfurProject | null>(null);

  const { data: apiData, isLoading } = useQuery<ApiResponse>({
    queryKey: ["dfur-projects"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/get-dfur-project`);
      if (!res.ok) throw new Error("Failed to fetch DFUR projects");
      return res.json();
    },
  });

  const { data: totalData } = useQuery<TotalDataResponse>({
    queryKey: ["dfur-total-data"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/get-total-data-dfur-project`);
      if (!res.ok) throw new Error("Failed to fetch total data");
      return res.json();
    },
  });

  const projects = apiData?.data || [];

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return format(date, "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  // Utilization percentage
  const utilizationPct = (() => {
    const approved = parseFloat(totalData?.overall_cost_approved || "0");
    const incurred = parseFloat(totalData?.overall_cost_incurred || "0");
    if (!approved) return 0;
    return Math.min(100, Math.round((incurred / approved) * 100));
  })();

  // Mobile project card
  const ProjectCard = ({ project }: { project: DfurProject }) => (
    <div
      className="rounded-xl border bg-white p-4 space-y-3 shadow-sm"
      data-testid={`row-dfur-${project.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug line-clamp-2">
            {project.project}
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            {project.transaction_id}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(project.transaction_date)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge
            className={getReviewStatusColor(project.review_status)}
            variant="outline"
          >
            {project.review_status === "pending"
              ? "Pending"
              : project.review_status === "approved"
              ? "Approved"
              : "Flagged"}
          </Badge>
          <Badge className={getStatusColor(project.status)} variant="outline">
            {formatStatusDisplay(project.status)}
          </Badge>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Nature:</span>
          <span className="text-right truncate max-w-[60%]">
            {project.name_of_collection}
          </span>
        </div>
        <div className="flex justify-between gap-2 pt-1 border-t">
          <span className="text-muted-foreground shrink-0">Approved Cost:</span>
          <span className="font-semibold text-right">
            {formatCurrency(project.total_cost_approved)}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Incurred Cost:</span>
          <span className="text-right">
            {formatCurrency(project.total_cost_incurred)}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full touch-manipulation"
        onClick={() => setViewProject(project)}
        data-testid={`button-view-${project.id}`}
      >
        <Eye className="h-4 w-4 mr-1" />
        View Details
      </Button>
    </div>
  );

  return (
    <ReviewerLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-6 sm:p-8 text-white shadow-xl">
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-green-200 text-xs sm:text-sm font-medium mb-2">
                <ClipboardCheck className="h-4 w-4" />
                Barangay Kagawad — Committee Reviewer
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-poppins leading-tight">
                Reviewer Dashboard
              </h1>
              <p className="text-green-100 text-sm sm:text-base max-w-lg">
                Monitor and review Development Fund Utilization Reports for
                projects under your committee's jurisdiction.
              </p>
            </div>

            {/* Quick utilization pill */}
            <div className="self-start sm:self-center shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 min-w-[140px]">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-green-200" />
                <span className="text-xs text-green-200 font-medium">
                  Fund Utilization
                </span>
              </div>
              <p className="text-3xl font-bold">{utilizationPct}%</p>
              <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${utilizationPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total */}
          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-md border-chart-1/10 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <FolderKanban className="h-4 w-4 text-chart-1" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-foreground" data-testid="text-total-projects">
                {totalData?.total_data ?? 0}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Total Projects
              </p>
            </CardContent>
          </Card>

          {/* Approved */}
          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 shadow-md border-green-500/10 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-foreground" data-testid="text-approved-projects">
                {totalData?.total_approved ?? 0}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Approved
              </p>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 shadow-md border-yellow-500/10 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-foreground" data-testid="text-pending-projects">
                {totalData?.total_pending ?? 0}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Pending Review
              </p>
            </CardContent>
          </Card>

          {/* Flagged */}
          <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 shadow-md border-red-500/10 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Flag className="h-4 w-4 text-red-600" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-foreground" data-testid="text-flagged-projects">
                {totalData?.total_flagged ?? 0}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Flagged
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Financial Summary ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Total Approved Cost
                </p>
              </div>
              <p
                className="text-2xl sm:text-3xl font-bold text-foreground"
                data-testid="text-total-approved"
              >
                {formatCurrency(totalData?.overall_cost_approved || "0")}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Total Incurred Cost
                </p>
              </div>
              <p
                className="text-2xl sm:text-3xl font-bold text-foreground"
                data-testid="text-total-incurred"
              >
                {formatCurrency(totalData?.overall_cost_incurred || "0")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── DFUR Projects Table ── */}
        <Card className="shadow-md">
          <CardHeader className="p-5 sm:p-6 pb-3 border-b">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="font-poppins text-base sm:text-lg">
                  Development Fund Utilization Report (DFUR)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All projects assigned to your committee
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-4">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Mobile card list */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {projects.length === 0 ? (
                    <p className="text-center py-10 text-muted-foreground text-sm">
                      No DFUR projects found
                    </p>
                  ) : (
                    projects.map((p) => (
                      <ProjectCard key={p.id} project={p} />
                    ))
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Nature</TableHead>
                        <TableHead className="text-right">
                          Approved Cost
                        </TableHead>
                        <TableHead className="text-right">
                          Incurred Cost
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No DFUR projects found
                          </TableCell>
                        </TableRow>
                      ) : (
                        projects.map((project) => (
                          <TableRow
                            key={project.id}
                            className="hover:bg-muted/30 transition-colors"
                            data-testid={`row-dfur-${project.id}`}
                          >
                            <TableCell className="font-mono text-sm">
                              {project.transaction_id}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(project.transaction_date)}
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {project.project}
                            </TableCell>
                            <TableCell className="text-sm">
                              {project.name_of_collection}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(project.total_cost_approved)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(project.total_cost_incurred)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusColor(project.status)}
                                variant="outline"
                              >
                                {formatStatusDisplay(project.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getReviewStatusColor(
                                  project.review_status
                                )}
                                variant="outline"
                              >
                                {project.review_status === "pending"
                                  ? "Pending"
                                  : project.review_status === "approved"
                                  ? "Approved"
                                  : "Flagged"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewProject(project)}
                                  data-testid={`button-view-${project.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Info Banner ── */}
        <Card className="bg-muted/40 border-muted-foreground/15">
          <CardContent className="p-4 sm:p-5 pt-4 sm:pt-5">
            <div className="flex gap-3 items-start">
              <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Reviewer Role (Barangay Kagawad):</strong> As a
                committee member, you review development fund utilization
                reports for projects under your committee's jurisdiction.
                Ensure that projects align with committee objectives and proper
                fund utilization.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── View Project Dialog ── */}
      <Dialog
        open={!!viewProject}
        onOpenChange={(open) => !open && setViewProject(null)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins text-base sm:text-lg">
              Project Details
            </DialogTitle>
          </DialogHeader>
          {viewProject && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Transaction ID
                  </p>
                  <p className="font-mono font-medium break-all">
                    {viewProject.transaction_id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Transaction Date
                  </p>
                  <p className="font-medium">
                    {formatDate(viewProject.transaction_date)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Project</p>
                <p className="font-medium">{viewProject.project}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Nature of Collection
                  </p>
                  <p className="font-medium">{viewProject.name_of_collection}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{viewProject.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Cost Approved
                  </p>
                  <p className="font-semibold text-base sm:text-lg">
                    {formatCurrency(viewProject.total_cost_approved)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Cost Incurred
                  </p>
                  <p className="font-semibold text-base sm:text-lg">
                    {formatCurrency(viewProject.total_cost_incurred)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Date Started</p>
                  <p className="font-medium">
                    {formatDate(viewProject.date_started)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Target Completion
                  </p>
                  <p className="font-medium">
                    {formatDate(viewProject.target_completion_date)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    className={getStatusColor(viewProject.status)}
                    variant="outline"
                  >
                    {formatStatusDisplay(viewProject.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Review Status
                  </p>
                  <Badge
                    className={getReviewStatusColor(viewProject.review_status)}
                    variant="outline"
                  >
                    {viewProject.review_status === "pending"
                      ? "Pending"
                      : viewProject.review_status === "approved"
                      ? "Approved"
                      : "Flagged"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    No. of Extensions
                  </p>
                  <p className="font-medium">{viewProject.no_extensions}</p>
                </div>
                {viewProject.reviewed_by && (
                  <div>
                    <p className="text-xs text-muted-foreground">Reviewed By</p>
                    <p className="font-medium">
                      User #{viewProject.reviewed_by}
                    </p>
                  </div>
                )}
              </div>
              {viewProject.remarks && (
                <div>
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p className="font-medium">{viewProject.remarks}</p>
                </div>
              )}
              {viewProject.review_comment && (
                <div className="bg-muted p-3 sm:p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Review Comment
                  </p>
                  <p className="font-medium mt-1">
                    {viewProject.review_comment}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ReviewerLayout>
  );
}