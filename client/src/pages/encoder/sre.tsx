import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Flag,
  Check,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { EncoderLayout } from "../../components/encoder-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

import { format, startOfMonth, endOfMonth } from "date-fns";
import { CollectionForm } from "../../components/collection-form";
import { DisbursementForm } from "../../components/disbursement-form";
import { ExcelUploadDialog } from "../../components/excel-upload-dialog";
import { queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { api, apiCall } from "../../utils/api";
import { exportSREToPDF } from "../../utils/exportSREToPDF";

/* -------------------- BACKEND TYPES -------------------- */

type BackendCollection = {
  id: number;
  transaction_id: string;
  transaction_date: string;
  nature_of_collection: string;
  category: string;
  subcategory: string;
  purpose?: string;
  fund_source: string;
  amount: number;
  payor: string;
  or_number: string;
  remarks?: string;
  is_flagged?: boolean;
};

type BackendDisbursement = {
  id: number;
  transaction_id: string;
  transaction_date: string;
  nature_of_disbursement: string;
  category: string;
  subcategory: string;
  program_description?: string;
  fund_source: string;
  amount: number;
  payee: string;
  or_number: string;
  remarks?: string;
  is_flagged?: boolean;
};

/* -------------------- FRONTEND TYPES -------------------- */

export type Collection = {
  id: string;
  transactionId: string;
  transactionDate: string;
  natureOfCollection: string;
  payor: string;
  orNumber: string;
  amount: string;
  category: string;
  subcategory: string;
  purpose?: string;
  fundSource: string;
  remarks?: string;
  is_flagged?: boolean;
};

export type Disbursement = {
  id: string;
  transactionId: string;
  transactionDate: string;
  natureOfDisbursement: string;
  payee: string;
  dvNumber: string;
  amount: string;
  category: string;
  subcategory: string;
  programDescription?: string;
  fundSource: string;
  remarks?: string;
  is_flagged?: boolean;
};

type ViewType = "collection" | "disbursement";

/* -------------------- CONVERTERS -------------------- */

function backendCollectionToFrontend(backend: BackendCollection): Collection {
  return {
    id: backend.id.toString(),
    transactionId: backend.transaction_id,
    transactionDate: backend.transaction_date,
    natureOfCollection: backend.nature_of_collection,
    payor: backend.payor,
    orNumber: backend.or_number,
    amount: backend.amount.toString(),
    category: backend.category,
    subcategory: backend.subcategory,
    purpose: backend.purpose,
    fundSource: backend.fund_source,
    remarks: backend.remarks,
    is_flagged: backend.is_flagged,
  };
}

function backendDisbursementToFrontend(
  backend: BackendDisbursement
): Disbursement {
  return {
    id: backend.id.toString(),
    transactionId: backend.transaction_id,
    transactionDate: backend.transaction_date,
    natureOfDisbursement: backend.nature_of_disbursement,
    payee: backend.payee,
    dvNumber: backend.or_number,
    amount: backend.amount.toString(),
    category: backend.category,
    subcategory: backend.subcategory,
    programDescription: backend.program_description,
    fundSource: backend.fund_source,
    remarks: backend.remarks,
    is_flagged: backend.is_flagged,
  };
}

/* -------------------- HELPERS -------------------- */

const formatCurrency = (value: number) =>
  `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* -------------------- MOBILE COLLECTION CARD -------------------- */

function CollectionCard({
  collection,
  onDelete,
}: {
  collection: Collection;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`  border rounded-lg p-4 space-y-3 ${collection.is_flagged === true ? "bg-red-500/20 border-red-500" : ""}`}
      data-testid={`row-collection-${collection.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-mono text-xs text-muted-foreground truncate"
          data-testid={`text-transaction-id-${collection.id}`}
        >
          {collection.transactionId}
        </span>
        <span
          className="font-bold text-sm text-chart-1 flex-shrink-0"
          data-testid={`text-amount-${collection.id}`}
        >
          {formatCurrency(parseFloat(collection.amount))}
        </span>
      </div>

      <p
        className="text-sm font-medium leading-snug"
        data-testid={`text-nature-${collection.id}`}
      >
        {collection.natureOfCollection}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span
          className="truncate"
          data-testid={`text-payor-${collection.id}`}
        >
          {collection.payor}
        </span>
        <span
          className="flex-shrink-0"
          data-testid={`text-date-${collection.id}`}
        >
          {format(new Date(collection.transactionDate), "MMM dd, yyyy")}
        </span>
      </div>

      {collection.orNumber && (
        <p
          className="text-xs text-muted-foreground"
          data-testid={`text-or-number-${collection.id}`}
        >
          OR: {collection.orNumber}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <CollectionForm
          collection={collection}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              data-testid={`button-edit-collection-${collection.id}`}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          }
        />
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(collection.id)}
          data-testid={`button-delete-collection-${collection.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

/* -------------------- MOBILE DISBURSEMENT CARD -------------------- */

function DisbursementCard({
  disbursement,
  onDelete,
}: {
  disbursement: Disbursement;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`border rounded-lg p-4 space-y-3 ${disbursement.is_flagged === true ? "bg-red-500/20 border-red-500" : ""}`}
      data-testid={`row-disbursement-${disbursement.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-mono text-xs text-muted-foreground truncate"
          data-testid={`text-transaction-id-${disbursement.id}`}
        >
          {disbursement.transactionId}
        </span>
        <span
          className="font-bold text-sm text-destructive flex-shrink-0"
          data-testid={`text-amount-${disbursement.id}`}
        >
          {formatCurrency(parseFloat(disbursement.amount))}
        </span>
      </div>

      <p
        className="text-sm font-medium leading-snug"
        data-testid={`text-nature-${disbursement.id}`}
      >
        {disbursement.natureOfDisbursement}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span
          className="truncate"
          data-testid={`text-payee-${disbursement.id}`}
        >
          {disbursement.payee}
        </span>
        <span
          className="flex-shrink-0"
          data-testid={`text-date-${disbursement.id}`}
        >
          {format(new Date(disbursement.transactionDate), "MMM dd, yyyy")}
        </span>
      </div>

      {disbursement.dvNumber && (
        <p
          className="text-xs text-muted-foreground"
          data-testid={`text-dv-number-${disbursement.id}`}
        >
          DV: {disbursement.dvNumber}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <DisbursementForm
          disbursement={disbursement}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              data-testid={`button-edit-disbursement-${disbursement.id}`}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          }
        />
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(disbursement.id)}
          data-testid={`button-delete-disbursement-${disbursement.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function SRE() {
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(
    format(startOfMonth(currentDate), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(currentDate), "yyyy-MM-dd")
  );
  const [activeView, setActiveView] = useState<ViewType>("collection");
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);
  const [deleteDisbursementId, setDeleteDisbursementId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  /* Fetch collections */
  const { data: collections = [], isLoading: isLoadingCollections } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const result = await apiCall<{ data: BackendCollection[] }>(api.collections.getAll);
      if (result.error) throw new Error(result.error);
      const data = result.data?.data || result.data || [];
      if (Array.isArray(data)) return data.map(backendCollectionToFrontend);
      return [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  /* Fetch disbursements */
  const { data: disbursements = [], isLoading: isLoadingDisbursements } = useQuery<Disbursement[]>({
    queryKey: ["disbursements"],
    queryFn: async () => {
      const result = await apiCall<{ data: BackendDisbursement[] }>(api.disbursements.getAll);
      if (result.error) throw new Error(result.error);
      const data = result.data?.data || result.data || [];
      if (Array.isArray(data)) return data.map(backendDisbursementToFrontend);
      return [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  /* Delete collection */
  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiCall(api.collections.delete, {
        method: "DELETE",
        body: JSON.stringify({ collection_id: parseInt(id) }),
      });
      if (result.error) throw new Error(result.error);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["collections"], (old: Collection[] = []) =>
        old.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({
        title: "Collection Deleted",
        description: "Collection transaction has been successfully deleted.",
      });
      setDeleteCollectionId(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Collection",
        description: error.message,
      });
    },
  });

  /* Delete disbursement */
  const deleteDisbursement = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiCall(api.disbursements.delete, {
        method: "DELETE",
        body: JSON.stringify({ disbursement_id: parseInt(id) }),
      });
      if (result.error) throw new Error(result.error);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["disbursements"], (old: Disbursement[] = []) =>
        old.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
      toast({
        title: "Disbursement Deleted",
        description: "Disbursement transaction has been successfully deleted.",
      });
      setDeleteDisbursementId(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Disbursement",
        description: error.message,
      });
    },
  });

  /* Filtered data */
  const filteredCollections = collections.filter((c) => {
    const date = new Date(c.transactionDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const filteredDisbursements = disbursements.filter((d) => {
    const date = new Date(d.transactionDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const totalReceipts = filteredCollections.reduce((sum, c) => sum + parseFloat(c.amount), 0);
  const totalExpenditures = filteredDisbursements.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  const netBalance = totalReceipts - totalExpenditures;

  /* Export */
  const handleExport = () => {
    try {
      setIsExporting(true);
      exportSREToPDF({
        startDate,
        endDate,
        collections: filteredCollections,
        disbursements: filteredDisbursements,
        totalReceipts,
        totalExpenditures,
        netBalance,
      });
      toast({ title: "Export Successful", description: "SRE report has been downloaded successfully." });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({ variant: "destructive", title: "Export Failed", description: "Failed to export SRE report. Please try again." });
    } finally {
      setIsExporting(false);
    }
  };

  const skeletonRows = [1, 2, 3, 4];

  return (
    <EncoderLayout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground font-poppins leading-tight">
              Statement of Receipts &amp; Expenditures
              <span className="block md:inline md:ml-2 text-lg md:text-3xl">(SRE)</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              View and encode financial statements for the selected period
            </p>
          </div>
          <Button
            className="gap-2 flex-shrink-0"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            data-testid="button-export"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : "Export SRE"}
            </span>
            <span className="sm:hidden">
              {isExporting ? "..." : "Export"}
            </span>
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-3">
          <Button
            variant={activeView === "collection" ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={() => setActiveView("collection")}
            data-testid="button-collection"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Collection</span>
          </Button>
          <Button
            variant={activeView === "disbursement" ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={() => setActiveView("disbursement")}
            data-testid="button-disbursement"
          >
            <TrendingDown className="h-4 w-4" />
            <span>Disbursement</span>
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-poppins text-base md:text-lg">
              <Calendar className="h-5 w-5" />
              Report Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="start-date" className="text-sm">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="input-start-date"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="input-end-date"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-3 md:gap-6 grid-cols-2 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Receipts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-lg md:text-3xl font-bold text-chart-1 text-wrap"
                data-testid="text-total-receipts"
              >
                {formatCurrency(totalReceipts)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Expenditures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-lg md:text-3xl font-bold text-destructive text-wrap"
                data-testid="text-total-expenditures"
              >
                {formatCurrency(totalExpenditures)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-lg md:text-3xl font-bold ${netBalance >= 0 ? "text-chart-1" : "text-destructive"} text-wrap`}
                data-testid="text-net-balance"
              >
                {formatCurrency(netBalance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Form Button + Upload Excel */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsUploadDialogOpen(true)}
            data-testid="button-upload-excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span className="hidden sm:inline">Upload Excel</span>
            <span className="sm:hidden">Upload</span>
          </Button>
          {activeView === "collection" ? (
            <CollectionForm />
          ) : (
            <DisbursementForm />
          )}
        </div>

        {/* Excel Upload Dialog */}
        <ExcelUploadDialog
          type={activeView}
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
        />

        {/* ==================== COLLECTION TABLE/CARDS ==================== */}
        {activeView === "collection" && (
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="font-poppins text-base md:text-lg">
                Collection Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              {isLoadingCollections ? (
                <div className="space-y-3 px-4 md:px-0 pb-4">
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  {skeletonRows.map((i) => (
                    <div key={i} className="h-12 bg-muted/60 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="md:hidden space-y-3 px-4 pt-2 pb-4">
                    {filteredCollections.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground text-sm">
                        No collection transactions recorded for this period
                      </p>
                    ) : (
                      <>
                        {filteredCollections.map((collection) => (
                          <CollectionCard
                            key={collection.id}
                            collection={collection}
                            onDelete={setDeleteCollectionId}
                          />
                        ))}
                        <div className="border rounded-lg px-4 py-3 bg-muted/40 flex justify-between items-center">
                          <span className="text-sm font-semibold">Total Collections</span>
                          <span className="font-bold text-chart-1">
                            {formatCurrency(totalReceipts)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Nature of Collection</TableHead>
                          <TableHead>Payor</TableHead>
                          <TableHead>OR Number</TableHead>
                          <TableHead className="text-center">Is Flagged</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCollections.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No collection transactions recorded for this period
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCollections.map((collection) => (
                            <TableRow key={collection.id} data-testid={`row-collection-${collection.id}`} className={`${collection.is_flagged === true ? "bg-red-500/20" : ""}`}>
                              <TableCell className="font-medium" data-testid={`text-transaction-id-${collection.id}`}>
                                {collection.transactionId}
                              </TableCell>
                              <TableCell data-testid={`text-date-${collection.id}`}>
                                {format(new Date(collection.transactionDate), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell data-testid={`text-nature-${collection.id}`}>
                                {collection.natureOfCollection}
                              </TableCell>
                              <TableCell data-testid={`text-payor-${collection.id}`}>
                                {collection.payor}
                              </TableCell>
                              <TableCell data-testid={`text-or-number-${collection.id}`}>
                                {collection.orNumber}
                              </TableCell>
                              <TableCell className="text-center">{collection.is_flagged === true ? <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Flag className="h-4 w-4 text-red-500" /> Flagged</p> : <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Check className="h-4 w-4 text-green-500" /> Not Flagged</p>}</TableCell>
                              <TableCell className="text-right font-semibold text-chart-1" data-testid={`text-amount-${collection.id}`}>
                                {formatCurrency(parseFloat(collection.amount))}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                  <CollectionForm
                                    collection={collection}
                                    trigger={
                                      <Button variant="ghost" size="icon" data-testid={`button-edit-collection-${collection.id}`}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    }
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteCollectionId(collection.id)}
                                    data-testid={`button-delete-collection-${collection.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={6} className="font-semibold">
                            Total Collections
                          </TableCell>
                          <TableCell className="text-right font-bold text-chart-1">
                            {formatCurrency(totalReceipts)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ==================== DISBURSEMENT TABLE/CARDS ==================== */}
        {activeView === "disbursement" && (
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="font-poppins text-base md:text-lg">
                Disbursement Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              {isLoadingDisbursements ? (
                <div className="space-y-3 px-4 md:px-0 pb-4">
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  {skeletonRows.map((i) => (
                    <div key={i} className="h-12 bg-muted/60 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="md:hidden space-y-3 px-4 pt-2 pb-4">
                    {filteredDisbursements.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground text-sm">
                        No disbursement transactions recorded for this period
                      </p>
                    ) : (
                      <>
                        {filteredDisbursements.map((disbursement) => (
                          <DisbursementCard
                            key={disbursement.id}
                            disbursement={disbursement}
                            onDelete={setDeleteDisbursementId}
                          />
                        ))}
                        <div className="border rounded-lg px-4 py-3 bg-muted/40 flex justify-between items-center">
                          <span className="text-sm font-semibold">Total Disbursements</span>
                          <span className="font-bold text-destructive">
                            {formatCurrency(totalExpenditures)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Nature of Disbursement</TableHead>
                          <TableHead>Payee</TableHead>
                          <TableHead>DV Number</TableHead>
                          <TableHead className="text-center">Is Flagged</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDisbursements.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No disbursement transactions recorded for this period
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDisbursements.map((disbursement) => (
                            <TableRow key={disbursement.id} data-testid={`row-disbursement-${disbursement.id}`} className={`${disbursement.is_flagged === true ? "bg-red-500/20" : ""}`}>
                              <TableCell className="font-medium" data-testid={`text-transaction-id-${disbursement.id}`}>
                                {disbursement.transactionId}
                              </TableCell>
                              <TableCell data-testid={`text-date-${disbursement.id}`}>
                                {format(new Date(disbursement.transactionDate), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell data-testid={`text-nature-${disbursement.id}`}>
                                {disbursement.natureOfDisbursement}
                              </TableCell>
                              <TableCell data-testid={`text-payee-${disbursement.id}`}>
                                {disbursement.payee}
                              </TableCell>
                              <TableCell data-testid={`text-dv-number-${disbursement.id}`}>
                                {disbursement.dvNumber}
                              </TableCell>
                              <TableCell className="text-center">{disbursement.is_flagged === true ? <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Flag className="h-4 w-4 text-red-500" /> Flagged</p> : <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Check className="h-4 w-4 text-green-500" /> Not Flagged</p>}</TableCell>
                              <TableCell className="text-right font-semibold text-destructive" data-testid={`text-amount-${disbursement.id}`}>
                                {formatCurrency(parseFloat(disbursement.amount))}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                  <DisbursementForm
                                    disbursement={disbursement}
                                    trigger={
                                      <Button variant="ghost" size="icon" data-testid={`button-edit-disbursement-${disbursement.id}`}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    }
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteDisbursementId(disbursement.id)}
                                    data-testid={`button-delete-disbursement-${disbursement.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={6} className="font-semibold">
                            Total Disbursements
                          </TableCell>
                          <TableCell className="text-right font-bold text-destructive">
                            {formatCurrency(totalExpenditures)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Collection Dialog */}
        <AlertDialog
          open={!!deleteCollectionId}
          onOpenChange={(open) => !open && setDeleteCollectionId(null)}
        >
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Collection Transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                collection transaction.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel
                data-testid="button-cancel-delete-collection"
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteCollectionId &&
                  deleteCollection.mutate(deleteCollectionId)
                }
                data-testid="button-confirm-delete-collection"
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
              >
                {deleteCollection.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Disbursement Dialog */}
        <AlertDialog
          open={!!deleteDisbursementId}
          onOpenChange={(open) => !open && setDeleteDisbursementId(null)}
        >
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Disbursement Transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                disbursement transaction.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel
                data-testid="button-cancel-delete-disbursement"
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteDisbursementId &&
                  deleteDisbursement.mutate(deleteDisbursementId)
                }
                data-testid="button-confirm-delete-disbursement"
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
              >
                {deleteDisbursement.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EncoderLayout>
  );
}