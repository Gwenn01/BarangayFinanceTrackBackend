import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
  TableFooter,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  BudgetEntryForm,
  BudgetEntry,
  InsertBudgetEntry,
} from "../../components/budget-entry-form";

import { queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format, isValid, parseISO } from "date-fns";
import { EncoderLayout } from "../../components/encoder-layout";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://barangayfinancetrackbackenddeployment.onrender.com/api";

const ROWS_PER_PAGE = 10;

/* -------------------- TYPES -------------------- */

type BackendBudgetEntry = {
  id: string;
  transaction_id: string;
  transaction_date: string;
  category: string;
  subcategory: string;
  payee: string;
  dv_number: string;
  amount: number;
  fund_source: string;
  expenditure_program: string;
  program_description?: string;
  remarks?: string;
  allocation_id: number;
  created_by: number;
};

type BackendInsertBudgetEntry = {
  created_by: number;
  transaction_id: string;
  transaction_date: string;
  category: string;
  subcategory: string;
  amount: number;
  fund_source: string;
  payee: string;
  dv_number: string;
  expenditure_program: string;
  program_description?: string;
  remarks?: string;
  allocation_id: number;
};

/* -------------------- HELPERS -------------------- */

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "API request failed");
  }
  return response.json();
}

function backendToFrontend(backendEntry: BackendBudgetEntry): BudgetEntry {
  return {
    id: backendEntry.id,
    transactionId: backendEntry.transaction_id,
    transactionDate: backendEntry.transaction_date,
    category: backendEntry.category,
    subcategory: backendEntry.subcategory,
    payee: backendEntry.payee,
    dvNumber: backendEntry.dv_number,
    amount: backendEntry.amount.toString(),
    fundSource: backendEntry.fund_source,
    expenditureProgram: backendEntry.expenditure_program,
    programDescription: backendEntry.program_description,
    remarks: backendEntry.remarks,
  };
}

function frontendToBackend(
  frontendEntry: InsertBudgetEntry,
  createdBy: number,
  allocationId: number = 1,
  entryId?: string
): BackendInsertBudgetEntry & { id?: string } {
  const backendData: BackendInsertBudgetEntry = {
    created_by: createdBy,
    transaction_id: frontendEntry.transactionId,
    transaction_date: frontendEntry.transactionDate,
    category: frontendEntry.category,
    subcategory: frontendEntry.subcategory,
    amount: parseFloat(frontendEntry.amount),
    fund_source: frontendEntry.fundSource,
    payee: frontendEntry.payee,
    dv_number: frontendEntry.dvNumber,
    expenditure_program: frontendEntry.expenditureProgram,
    program_description: frontendEntry.programDescription || "",
    remarks: frontendEntry.remarks || "",
    allocation_id: allocationId,
  };
  if (entryId) return { ...backendData, id: entryId };
  return backendData;
}

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "₱0.00";
  return `₱${num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Safely formats a date string. Returns a fallback string if the date is
 * null, undefined, empty, or not a valid date.
 */
function safeFormatDate(dateStr: string | null | undefined, fallback = "—"): string {
  if (!dateStr) return fallback;
  let date = parseISO(dateStr);
  if (!isValid(date)) date = new Date(dateStr);
  if (!isValid(date)) return fallback;
  return format(date, "MMM dd, yyyy");
}

/* -------------------- PAGINATION COMPONENT -------------------- */

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Build page number array with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 border-t">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-medium">{startItem}</span>–
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> entries
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="h-8 w-8 flex items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0 text-sm"
              onClick={() => onPageChange(page as number)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* -------------------- MOBILE ENTRY CARD -------------------- */

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: BudgetEntry;
  onEdit: (e: BudgetEntry) => void;
  onDelete: (e: BudgetEntry) => void;
}) {
  return (
    <div
      className="border rounded-lg p-4 space-y-3 bg-card"
      data-testid={`row-entry-${entry.id}`}
    >
      {/* Top row: transaction ID + amount */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground truncate">
          {entry.transactionId}
        </span>
        <span className="font-bold text-sm text-chart-1 flex-shrink-0">
          {formatCurrency(entry.amount)}
        </span>
      </div>

      {/* Category / subcategory */}
      <div>
        <p className="font-medium text-sm leading-snug">{entry.category}</p>
        {entry.subcategory && (
          <p className="text-xs text-muted-foreground truncate">
            {entry.subcategory}
          </p>
        )}
      </div>

      {/* Payee + date row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span className="truncate">{entry.payee}</span>
        <span className="flex-shrink-0">
          {safeFormatDate(entry.transactionDate)}
        </span>
      </div>

      {/* DV Number */}
      {entry.dvNumber && (
        <p className="text-xs text-muted-foreground">DV: {entry.dvNumber}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1"
          onClick={() => onEdit(entry)}
          data-testid={`button-edit-entry-${entry.id}`}
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(entry)}
          data-testid={`button-delete-entry-${entry.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function ABO() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedEntry, setSelectedEntry] = useState<BudgetEntry | undefined>(undefined);
  const [entryToDelete, setEntryToDelete] = useState<BudgetEntry | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const currentUserId = 1;
  const allocationId = 1;

  // Fetch budget entries
  const { data: entries = [], isLoading } = useQuery<BudgetEntry[]>({
    queryKey: ["budget-entries"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const response = await apiFetch("/get-budget-entries", {
        method: "POST",
        body: JSON.stringify({ year: currentYear }),
      });
      const data = response.data || response;
      if (Array.isArray(data)) return data.map(backendToFrontend);
      return [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Reset to page 1 whenever entries change (e.g. after add/delete)
  useEffect(() => {
    setCurrentPage(1);
  }, [entries.length]);

  // Pagination calculations
  const totalPages = Math.ceil(entries.length / ROWS_PER_PAGE);
  const paginatedEntries = entries.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertBudgetEntry) => {
      const backendData = frontendToBackend(data, currentUserId, allocationId);
      return apiFetch("/post-budget-entries", {
        method: "POST",
        body: JSON.stringify(backendData),
      });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["budget-entries"] });
      toast({ title: "Budget Entry Added", description: "Budget entry has been successfully added to ABO." });
      setDialogOpen(false);
      setSelectedEntry(undefined);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error Adding Budget Entry", description: error.message || "Failed to add budget entry. Please try again." });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertBudgetEntry }) => {
      const backendData = frontendToBackend(data, currentUserId, allocationId, id);
      return apiFetch("/put-budget-entries", { method: "PUT", body: JSON.stringify(backendData) });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["budget-entries"] });
      toast({ title: "Budget Entry Updated", description: "Budget entry has been successfully updated." });
      setDialogOpen(false);
      setSelectedEntry(undefined);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error Updating Budget Entry", description: error.message || "Failed to update budget entry. Please try again." });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch("/delete-budget-entries", { method: "DELETE", body: JSON.stringify({ id }) });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["budget-entries"] });
      toast({ title: "Budget Entry Deleted", description: "Budget entry has been successfully deleted." });
      setDeleteDialogOpen(false);
      setEntryToDelete(undefined);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error Deleting Budget Entry", description: error.message || "Failed to delete budget entry. Please try again." });
    },
  });

  useEffect(() => {
    if (!dialogOpen) {
      setSelectedEntry(undefined);
      setMode("create");
    }
  }, [dialogOpen]);

  const handleCreate = () => {
    setMode("create");
    setSelectedEntry(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (entry: BudgetEntry) => {
    setMode("edit");
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleDelete = (entry: BudgetEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (data: InsertBudgetEntry) => {
    if (mode === "create") {
      createMutation.mutate(data);
    } else if (mode === "edit" && selectedEntry) {
      updateMutation.mutate({ id: selectedEntry.id, data });
    }
  };

  const totalAllocated = entries.reduce((sum, e) => {
    const num = parseFloat(e.amount);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <EncoderLayout>
      <div className="px-4 py-4 md:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-poppins leading-tight">
              Annual Budget Ordinance
              <span className="block md:inline md:ml-2 text-lg md:text-3xl">(ABO)</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage annual budget allocations and appropriations
            </p>
          </div>
          <Button
            className="gap-2 flex-shrink-0"
            size="sm"
            onClick={handleCreate}
            data-testid="button-add-entry"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Budget Entry</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base font-medium text-muted-foreground">
              Total Budget Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl md:text-3xl font-bold text-chart-1"
              data-testid="text-total-allocated"
            >
              {formatCurrency(totalAllocated.toString())}
            </p>
          </CardContent>
        </Card>

        {/* Budget Entries */}
        <Card className="border-none p-0">
          <CardHeader className="pb-3 px-0 md:px-6">
            <CardTitle className="font-poppins text-base md:text-lg">
              Budget Entries — {new Date().getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            {isLoading ? (
              <div className="space-y-3 px-4 md:px-0 pb-4">
                <div className="h-10 bg-muted rounded animate-pulse" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted/60 rounded animate-pulse" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground px-4">
                <p className="text-base md:text-lg mb-2">No budget entries found</p>
                <p className="text-sm">
                  Click "Add Budget Entry" to create your first budget allocation
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: Card List */}
                <div className="md:hidden space-y-3 px-0 pt-2 pb-2">
                  {paginatedEntries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Mobile pagination */}
                <div className="md:hidden">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={entries.length}
                    itemsPerPage={ROWS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </div>

                {/* Mobile total footer */}
                <div className="md:hidden border rounded-lg px-4 py-3 mt-3 bg-muted/40 flex justify-between items-center">
                  <span className="text-sm font-semibold">Total Budget Allocation</span>
                  <span className="font-bold text-chart-1">
                    {formatCurrency(totalAllocated.toString())}
                  </span>
                </div>

                {/* Desktop: Table */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Expenditure Program</TableHead>
                        <TableHead>Payee</TableHead>
                        <TableHead>DV Number</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntries.map((entry) => (
                        <TableRow key={entry.id} data-testid={`row-entry-${entry.id}`}>
                          <TableCell className="font-medium">
                            {entry.transactionId}
                          </TableCell>
                          <TableCell>
                            {safeFormatDate(entry.transactionDate)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="font-medium">{entry.category}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {entry.subcategory}
                            </div>
                          </TableCell>
                          <TableCell>{entry.payee}</TableCell>
                          <TableCell>{entry.dvNumber}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(entry.amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(entry)}
                                data-testid={`button-edit-entry-${entry.id}`}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(entry)}
                                data-testid={`button-delete-entry-${entry.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right font-semibold">
                          Total Budget Allocation:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(totalAllocated.toString())}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableFooter>
                  </Table>

                  {/* Desktop pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={entries.length}
                    itemsPerPage={ROWS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-[600px] mx-auto rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                {mode === "create" ? "Add Budget Entry" : "Edit Budget Entry"}
              </DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "Enter the details for the new budget allocation entry."
                  : "Update the details of this budget allocation entry."}
              </DialogDescription>
            </DialogHeader>
            <BudgetEntryForm
              mode={mode}
              entry={selectedEntry}
              onSubmit={handleSubmit}
              isPending={createMutation.isPending || updateMutation.isPending}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this budget entry? This action
                cannot be undone.
                {entryToDelete && (
                  <div className="mt-4 p-3 bg-muted rounded-md space-y-1 text-left">
                    <div>
                      <strong>Transaction ID:</strong> {entryToDelete.transactionId}
                    </div>
                    <div>
                      <strong>Amount:</strong> {formatCurrency(entryToDelete.amount)}
                    </div>
                    <div>
                      <strong>Payee:</strong> {entryToDelete.payee}
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel
                data-testid="button-cancel-delete"
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => entryToDelete && deleteMutation.mutate(entryToDelete.id)}
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EncoderLayout>
  );
}