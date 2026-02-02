import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { BudgetEntryForm, BudgetEntry, InsertBudgetEntry } from "../../components/budget-entry-form";

import { queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { EncoderLayout } from "../../components/encoder-layout";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

// Backend API types
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

// Helper function to make API calls
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "API request failed");
  }

  return response.json();
}

// Convert backend format to frontend format
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

// Convert frontend format to backend format
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

  if (entryId) {
    return { ...backendData, id: entryId };
  }

  return backendData;
}

export default function ABO() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedEntry, setSelectedEntry] = useState<BudgetEntry | undefined>(
    undefined,
  );
  const [entryToDelete, setEntryToDelete] = useState<BudgetEntry | undefined>(
    undefined,
  );
  const { toast } = useToast();

  // TODO: Get this from your auth context/session
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
      
      // Handle different response structures
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        return data.map(backendToFrontend);
      }
      
      return [];
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["budget-entries"] });
      toast({
        title: "Budget Entry Added",
        description: "Budget entry has been successfully added to ABO.",
      });
      setDialogOpen(false);
      setSelectedEntry(undefined);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Adding Budget Entry",
        description:
          error.message || "Failed to add budget entry. Please try again.",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: InsertBudgetEntry;
    }) => {
      const backendData = frontendToBackend(data, currentUserId, allocationId, id);
      return apiFetch("/put-budget-entries", {
        method: "PUT",
        body: JSON.stringify(backendData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-entries"] });
      toast({
        title: "Budget Entry Updated",
        description: "Budget entry has been successfully updated.",
      });
      setDialogOpen(false);
      setSelectedEntry(undefined);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Updating Budget Entry",
        description:
          error.message || "Failed to update budget entry. Please try again.",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch("/delete-budget-entries", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-entries"] });
      toast({
        title: "Budget Entry Deleted",
        description: "Budget entry has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setEntryToDelete(undefined);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Budget Entry",
        description:
          error.message || "Failed to delete budget entry. Please try again.",
      });
    },
  });

  // Reset form when dialog closes
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

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalAllocated = entries.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0,
  );

  return (
    <EncoderLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-poppins">
              Annual Budget Ordinance (ABO)
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage annual budget allocations and appropriations
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={handleCreate}
            data-testid="button-add-entry"
          >
            <Plus className="h-4 w-4" />
            Add Budget Entry
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Total Budget Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold text-chart-1"
              data-testid="text-total-allocated"
            >
              {formatCurrency(totalAllocated.toString())}
            </p>
          </CardContent>
        </Card>

        {/* Budget Entries Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">
              Budget Entries - {new Date().getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-10 bg-muted rounded animate-pulse" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted/60 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No budget entries found</p>
                <p className="text-sm">
                  Click "Add Budget Entry" to create your first budget
                  allocation
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
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
                    {entries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        data-testid={`row-entry-${entry.id}`}
                      >
                        <TableCell className="font-medium">
                          {entry.transactionId}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(entry.transactionDate),
                            "MMM dd, yyyy",
                          )}
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
                      <TableCell
                        colSpan={5}
                        className="text-right font-semibold"
                      >
                        Total Budget Allocation:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totalAllocated.toString())}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this budget entry? This action
                cannot be undone.
                {entryToDelete && (
                  <div className="mt-4 p-3 bg-muted rounded-md space-y-1">
                    <div>
                      <strong>Transaction ID:</strong>{" "}
                      {entryToDelete.transactionId}
                    </div>
                    <div>
                      <strong>Amount:</strong>{" "}
                      {formatCurrency(entryToDelete.amount)}
                    </div>
                    <div>
                      <strong>Payee:</strong> {entryToDelete.payee}
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  entryToDelete && deleteMutation.mutate(entryToDelete.id)
                }
                className="bg-destructive hover:bg-destructive/90"
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