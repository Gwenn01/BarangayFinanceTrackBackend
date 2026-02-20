import { z } from "zod";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FolderKanban } from "lucide-react";
import { EncoderLayout } from "../../components/encoder-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
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
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Badge } from "../../components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { api, apiCall } from "../../utils/api";

/* -------------------- TYPES -------------------- */

export type DfurProject = {
  id: string;
  transaction_id: string;
  transaction_date: string;
  name_of_collection: string;
  project: string;
  location: string;
  total_cost_approved: string;
  date_started: string;
  target_completion_date: string;
  status: "Planned" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  total_cost_incurred: string;
  no_extensions: number;
  remarks?: string;
  is_active: number;
};

export type InsertDfurProject = {
  transaction_id: string;
  transaction_date: string;
  name_of_collection: string;
  project: string;
  location: string;
  total_cost_approved: number;
  date_started: string;
  target_completion_date: string;
  status: "Planned" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  total_cost_incurred: number;
  no_extensions: number;
  remarks?: string;
};

/* -------------------- SCHEMA & OPTIONS -------------------- */

const insertDfurProjectSchema = z.object({
  transaction_id: z.string().min(1, "Transaction ID is required"),
  transaction_date: z.string(),
  name_of_collection: z.string().min(1, "Nature of collection is required"),
  project: z.string().min(1, "Project name is required"),
  location: z.string().min(1, "Location is required"),
  total_cost_approved: z.number().min(0, "Invalid amount"),
  date_started: z.string(),
  target_completion_date: z.string(),
  status: z.enum(["Planned", "In Progress", "Completed", "On Hold", "Cancelled"]),
  total_cost_incurred: z.number().min(0, "Invalid amount"),
  no_extensions: z.number().min(0),
  remarks: z.string().optional(),
});

const natureOfCollectionOptions = [
  "Infrastructure",
  "Health",
  "Peace and Order",
  "Appropriation & Education",
  "Agriculture",
  "Social Welfare",
  "Aquatic Resources",
];

const statusOptions = ["Planned", "In Progress", "Completed", "On Hold", "Cancelled"];

/* -------------------- HELPERS -------------------- */

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":   return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "In Progress": return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "Planned":     return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "On Hold":     return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "Cancelled":   return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:            return "bg-muted";
  }
};

const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/* -------------------- MOBILE PROJECT CARD -------------------- */

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: DfurProject;
  onEdit: (p: DfurProject) => void;
  onDelete: (p: DfurProject) => void;
}) {
  return (
    <div
      className="border rounded-lg p-4 space-y-3 bg-card"
      data-testid={`row-dfur-${project.id}`}
    >
      {/* Top: transaction ID + status badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground truncate">
          {project.transaction_id}
        </span>
        <Badge className={`${getStatusColor(project.status)} flex-shrink-0 text-xs`} variant="outline">
          {project.status}
        </Badge>
      </div>

      {/* Project name */}
      <p className="font-semibold text-sm leading-snug">{project.project}</p>

      {/* Nature + Location */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{project.name_of_collection}</span>
        <span>{project.location}</span>
      </div>

      {/* Cost row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/40 rounded p-2">
          <p className="text-muted-foreground mb-0.5">Approved Cost</p>
          <p className="font-semibold">{formatCurrency(project.total_cost_approved)}</p>
        </div>
        <div className="bg-muted/40 rounded p-2">
          <p className="text-muted-foreground mb-0.5">Incurred Cost</p>
          <p className="font-semibold">{formatCurrency(project.total_cost_incurred)}</p>
        </div>
      </div>

      {/* Extensions */}
      {project.no_extensions > 0 && (
        <p className="text-xs text-muted-foreground">
          Extensions: {project.no_extensions}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1"
          onClick={() => onEdit(project)}
          data-testid={`button-edit-${project.id}`}
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(project)}
          data-testid={`button-delete-${project.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function DFUR() {
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<DfurProject | null>(null);
  const [deleteProject, setDeleteProject] = useState<DfurProject | null>(null);
  const { toast } = useToast();

  /* Fetch projects */
  const { data: projectsResponse, isLoading } = useQuery({
    queryKey: ["dfur-projects"],
    queryFn: async () => {
      const response = await fetch(api.dfurProject.getAll);
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
  });

  const projects = projectsResponse?.data || [];

  /* Generate transaction ID */
  const { data: transactionIdData } = useQuery({
    queryKey: ["dfur-generate-id"],
    queryFn: async () => {
      const response = await fetch(api.dfurProject.generateId);
      if (!response.ok) {
        const year = new Date().getFullYear();
        const count = projects.length + 1;
        return { transaction_id: `DFUR-${year}-${String(count).padStart(3, "0")}` };
      }
      return response.json();
    },
    enabled: open && !editingProject,
  });

  /* Fetch totals */
  const { data: dfurTotalsResponse, isLoading: isTotalsLoading } = useQuery({
    queryKey: ["dfur-totals"],
    queryFn: async () => {
      const result = await apiCall<{
        overall_cost_approved: string;
        overall_cost_incurred: string;
        total_active: number;
        total_approved: number;
        total_data: number;
        total_flagged: number;
        total_pending: number;
      }>(api.dfurProject.getTotalData);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });

  const dfurTotals = {
    overallApproved: parseFloat(dfurTotalsResponse?.overall_cost_approved || "0"),
    overallIncurred: parseFloat(dfurTotalsResponse?.overall_cost_incurred || "0"),
    totalActive: dfurTotalsResponse?.total_active || 0,
    totalProjects: dfurTotalsResponse?.total_data || 0,
    totalPending: dfurTotalsResponse?.total_pending || 0,
  };

  /* Form */
  const form = useForm<InsertDfurProject>({
    resolver: zodResolver(insertDfurProjectSchema),
    defaultValues: {
      transaction_id: "",
      transaction_date: format(new Date(), "yyyy-MM-dd"),
      name_of_collection: "",
      project: "",
      location: "",
      total_cost_approved: 0,
      date_started: format(new Date(), "yyyy-MM-dd"),
      target_completion_date: format(new Date(), "yyyy-MM-dd"),
      status: "Planned",
      total_cost_incurred: 0,
      no_extensions: 0,
      remarks: "",
    },
  });

  useEffect(() => {
    if (transactionIdData && !editingProject) {
      form.setValue("transaction_id", transactionIdData.transaction_id);
    }
  }, [transactionIdData, editingProject, form]);

  useEffect(() => {
    if (editingProject) {
      form.reset({
        transaction_id: editingProject.transaction_id,
        transaction_date: format(new Date(editingProject.transaction_date), "yyyy-MM-dd"),
        name_of_collection: editingProject.name_of_collection,
        project: editingProject.project,
        location: editingProject.location,
        total_cost_approved: parseFloat(editingProject.total_cost_approved),
        date_started: format(new Date(editingProject.date_started), "yyyy-MM-dd"),
        target_completion_date: format(new Date(editingProject.target_completion_date), "yyyy-MM-dd"),
        status: editingProject.status,
        total_cost_incurred: parseFloat(editingProject.total_cost_incurred),
        no_extensions: editingProject.no_extensions,
        remarks: editingProject.remarks || "",
      });
    } else {
      form.reset({
        transaction_id: transactionIdData?.transaction_id || "",
        transaction_date: format(new Date(), "yyyy-MM-dd"),
        name_of_collection: "",
        project: "",
        location: "",
        total_cost_approved: 0,
        date_started: format(new Date(), "yyyy-MM-dd"),
        target_completion_date: format(new Date(), "yyyy-MM-dd"),
        status: "Planned",
        total_cost_incurred: 0,
        no_extensions: 0,
        remarks: "",
      });
    }
  }, [editingProject, form, transactionIdData]);

  /* Mutations */
  const createProject = useMutation({
    mutationFn: async (data: InsertDfurProject) => {
      const result = await apiCall(api.dfurProject.create, { method: "POST", body: JSON.stringify(data) });
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dfur-projects"] });
      queryClient.invalidateQueries({ queryKey: ["dfur-totals"] });
      queryClient.invalidateQueries({ queryKey: ["dfur-generate-id"] });
      toast({ title: "DFUR Project Added", description: "Development fund project has been successfully added." });
      setOpen(false);
      setEditingProject(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error Adding Project", description: error.message || "Failed to add DFUR project. Please try again." });
    },
  });

  const updateProject = useMutation({
    mutationFn: async (data: InsertDfurProject & { id: string }) => {
      const result = await apiCall(api.dfurProject.update, { method: "PUT", body: JSON.stringify({ ...data, is_active: 1 }) });
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dfur-totals"] });
      queryClient.invalidateQueries({ queryKey: ["dfur-projects"] });
      toast({ title: "Project Updated", description: "DFUR project has been successfully updated." });
      setOpen(false);
      setEditingProject(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error Updating Project", description: error.message || "Failed to update project. Please try again." });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiCall(api.dfurProject.delete, { method: "DELETE", body: JSON.stringify({ id }) });
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dfur-totals"] });
      queryClient.invalidateQueries({ queryKey: ["dfur-projects"] });
      toast({ title: "Project Deleted", description: "DFUR project has been successfully deleted." });
      setDeleteProject(null);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error Deleting Project", description: error.message || "Failed to delete project. Please try again." });
    },
  });

  const handleSubmit = (data: InsertDfurProject) => {
    if (editingProject) {
      updateProject.mutate({ ...data, id: editingProject.id });
    } else {
      createProject.mutate(data);
    }
  };

  const handleEdit = (project: DfurProject) => {
    setEditingProject(project);
    setOpen(true);
  };

  const handleDelete = (project: DfurProject) => setDeleteProject(project);

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      setEditingProject(null);
      form.reset();
    }
    setOpen(isOpen);
  };

  return (
    <EncoderLayout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-poppins leading-tight">
              Development Fund Utilization Report
              <span className="block md:inline md:ml-2 text-lg md:text-3xl">(DFUR)</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Track and manage development fund projects
            </p>
          </div>

          <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="gap-2 flex-shrink-0" size="sm" data-testid="button-add-dfur">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add DFUR Project</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[calc(100%-2rem)] max-w-[700px] mx-auto rounded-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-poppins">
                  {editingProject ? "Edit DFUR Project" : "Add DFUR Project"}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                  {/* Transaction ID + Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="transaction_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-muted" data-testid="input-transaction-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transaction_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-transaction-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="name_of_collection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nature of Collection - ECONOMIC SERVICES</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-nature-of-collection">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {natureOfCollectionOptions.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <FormControl>
                          <Input placeholder="Project name" {...field} data-testid="input-project" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Project location" {...field} data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Costs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="total_cost_approved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Cost Approved (₱)</FormLabel>
                          <FormControl>
                            <Input
                              type="number" step="0.01" placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              value={field.value}
                              data-testid="input-total-cost-approved"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="total_cost_incurred"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Cost Incurred (₱)</FormLabel>
                          <FormControl>
                            <Input
                              type="number" step="0.01" placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              value={field.value}
                              data-testid="input-total-cost-incurred"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date_started"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Started</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-date-started" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="target_completion_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Completion Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-target-completion" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Status + Extensions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="no_extensions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. of Extensions</FormLabel>
                          <FormControl>
                            <Input
                              type="number" min="0" step="1" placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value}
                              data-testid="input-extensions"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes or remarks"
                            className="resize-none"
                            rows={3}
                            {...field}
                            data-testid="input-remarks"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                      className="w-full sm:w-auto"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProject.isPending || updateProject.isPending}
                      className="w-full sm:w-auto"
                      data-testid="button-submit"
                    >
                      {createProject.isPending || updateProject.isPending
                        ? "Saving..."
                        : editingProject
                          ? "Update Project"
                          : "Add Project"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 md:gap-6 grid-cols-1 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-poppins text-sm md:text-base">
                <FolderKanban className="h-5 w-5 text-chart-1 flex-shrink-0" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl md:text-4xl font-bold text-foreground" data-testid="text-total-projects">
                {isTotalsLoading ? "—" : dfurTotals.totalProjects}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="font-poppins text-sm md:text-base">
                Total Approved Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-total-approved">
                {isTotalsLoading ? "—" : formatCurrency(dfurTotals.overallApproved)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="font-poppins text-sm md:text-base">
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl md:text-4xl font-bold text-foreground" data-testid="text-active-projects">
                {isTotalsLoading ? "—" : dfurTotals.totalActive}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="font-poppins text-base md:text-lg">DFUR Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            {isLoading ? (
              <div className="space-y-2 px-4 md:px-0 pb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Mobile: Card List */}
                <div className="md:hidden space-y-3 px-4 pt-2 pb-4">
                  {!projects || projects.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground text-sm">
                      No DFUR projects found
                    </p>
                  ) : (
                    projects.map((project: DfurProject) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>

                {/* Desktop: Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Nature</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Approved Cost</TableHead>
                        <TableHead className="text-right">Incurred Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Extensions</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!projects || projects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No DFUR projects found
                          </TableCell>
                        </TableRow>
                      ) : (
                        projects.map((project: DfurProject) => (
                          <TableRow key={project.id} data-testid={`row-dfur-${project.id}`}>
                            <TableCell className="font-mono text-sm">
                              {project.transaction_id}
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {project.project}
                            </TableCell>
                            <TableCell className="text-sm">{project.name_of_collection}</TableCell>
                            <TableCell className="text-sm">{project.location}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(project.total_cost_approved)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(project.total_cost_incurred)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(project.status)} variant="outline">
                                {project.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{project.no_extensions}</TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(project)}
                                  data-testid={`button-edit-${project.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(project)}
                                  data-testid={`button-delete-${project.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
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

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteProject} onOpenChange={(open) => !open && setDeleteProject(null)}>
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete DFUR Project?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete project "{deleteProject?.project}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel data-testid="button-cancel-delete" className="w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProject && deleteProjectMutation.mutate(deleteProject.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                data-testid="button-confirm-delete"
              >
                {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EncoderLayout>
  );
}