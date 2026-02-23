import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { useToast } from "../../hooks/use-toast";
import { Flag } from "lucide-react";
import { queryClient } from "../../lib/queryClient";
import { format } from "date-fns";
import { CheckerLayout } from "../../components/checker-layout";
import { useAuth } from "@/contexts/auth-context";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://barangayfinancetrackbackenddeployment.onrender.com/api";

/* -------------------- TYPES -------------------- */

type ReviewStatus = "pending" | "approved" | "flagged";

type Collection = {
  id: string;
  transaction_id: string;
  transaction_date: string | null;
  nature_of_collection: string;
  payor: string;
  or_number: string;
  amount: string;
  review_status: ReviewStatus;
  review_comment?: string;
};

type Disbursement = {
  id: string;
  transaction_id: string;
  transaction_date: string | null;
  nature_of_disbursement: string;
  payee: string;
  or_number: string;
  amount: string;
  review_status: ReviewStatus;
  review_comment?: string;
};

/* -------------------- HELPERS -------------------- */

const formatCurrency = (amount: string) =>
  `₱${parseFloat(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Approved
        </Badge>
      );
    case "flagged":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Flagged
        </Badge>
      );
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
};

/* -------------------- MOBILE COLLECTION CARD -------------------- */

function CollectionCard({
  collection,
  onFlag,
}: {
  collection: Collection;
  onFlag: (c: Collection) => void;
}) {
  return (
    <div
      className={`border rounded-lg p-4 space-y-3 ${
        collection.review_status === "flagged" ? "bg-red-50 border-red-200" : "bg-card"
      }`}
      data-testid={`row-collection-${collection.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground truncate">
          {collection.transaction_id}
        </span>
        {getStatusBadge(collection.review_status)}
      </div>

      <p className="text-sm font-medium leading-snug">
        {collection.nature_of_collection}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span className="truncate">{collection.payor}</span>
        <span className="flex-shrink-0">{formatDate(collection.transaction_date)}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">OR: {collection.or_number}</span>
        <span className="font-bold text-sm">{formatCurrency(collection.amount)}</span>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full gap-1.5 text-red-600 border-red-300 hover:bg-red-50"
        onClick={() => onFlag(collection)}
        data-testid={`button-flag-collection-${collection.id}`}
      >
        <Flag className="h-3.5 w-3.5" />
        Flag Transaction
      </Button>
    </div>
  );
}

/* -------------------- MOBILE DISBURSEMENT CARD -------------------- */

function DisbursementCard({
  disbursement,
  onFlag,
}: {
  disbursement: Disbursement;
  onFlag: (d: Disbursement) => void;
}) {
  return (
    <div
      className={`border rounded-lg p-4 space-y-3 ${
        disbursement.review_status === "flagged" ? "bg-red-50 border-red-200" : "bg-card"
      }`}
      data-testid={`row-disbursement-${disbursement.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground truncate">
          {disbursement.transaction_id}
        </span>
        {getStatusBadge(disbursement.review_status)}
      </div>

      <p className="text-sm font-medium leading-snug">
        {disbursement.nature_of_disbursement}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span className="truncate">{disbursement.payee}</span>
        <span className="flex-shrink-0">{formatDate(disbursement.transaction_date)}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          OR: {disbursement.or_number || "N/A"}
        </span>
        <span className="font-bold text-sm">{formatCurrency(disbursement.amount)}</span>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full gap-1.5 text-red-600 border-red-300 hover:bg-red-50"
        onClick={() => onFlag(disbursement)}
        data-testid={`button-flag-disbursement-${disbursement.id}`}
      >
        <Flag className="h-3.5 w-3.5" />
        Flag Transaction
      </Button>
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function CheckerSRE() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"collections" | "disbursements">("collections");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    | ((Collection | Disbursement) & { type: "collection" | "disbursement" })
    | null
  >(null);
  const [reviewComment, setReviewComment] = useState("");

  /* Fetch collections */
  const { data: collections = [], isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/get-collection`);
      if (!response.ok) throw new Error("Failed to fetch collections");
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  /* Fetch disbursements */
  const { data: disbursements = [], isLoading: disbursementsLoading } = useQuery<Disbursement[]>({
    queryKey: ["disbursements"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/get-disbursement`);
      if (!response.ok) throw new Error("Failed to fetch disbursements");
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  /* Flag mutation */
  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      type,
      comment,
    }: {
      id: string;
      type: "collection" | "disbursement";
      comment: string;
    }) => {
      const reviewedBy = user?.id.toString() || "0";
      const payload =
        type === "collection"
          ? { collection_id: parseInt(id), reviewed_by: parseInt(reviewedBy), comment, flag_type: "collection" }
          : { disbursement_id: parseInt(id), reviewed_by: parseInt(reviewedBy), comment, flag_type: "disbursement" };

      const response = await fetch(`${API_BASE_URL}/put-flag-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to flag transaction. Please try again.");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: variables.type === "collection" ? ["collections"] : ["disbursements"],
      });
      toast({ title: "Transaction Flagged", description: "The transaction has been flagged for review by the Approver." });
      setReviewDialogOpen(false);
      setReviewComment("");
      setSelectedTransaction(null);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Review Failed", description: error.message || "Failed to flag transaction. Please try again." });
    },
  });

  const handleReviewClick = (
    transaction: Collection | Disbursement,
    type: "collection" | "disbursement"
  ) => {
    setSelectedTransaction({ ...transaction, type });
    setReviewComment(transaction.review_comment || "");
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedTransaction) return;
    if (!reviewComment.trim()) {
      toast({ variant: "destructive", title: "Comment Required", description: "Please provide a comment explaining why this transaction is being flagged." });
      return;
    }
    reviewMutation.mutate({ id: selectedTransaction.id, type: selectedTransaction.type, comment: reviewComment.trim() });
  };

  const totalCollections = collections.reduce((sum, c) => sum + parseFloat(c.amount), 0);
  const totalDisbursements = disbursements.reduce((sum, d) => sum + parseFloat(d.amount), 0);

  return (
    <CheckerLayout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-poppins leading-tight">
            Statement of Receipts &amp; Expenditures
            <span className="block md:inline md:ml-2 text-lg md:text-3xl">(SRE)</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Flag transactions with errors for review
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Transaction Review</CardTitle>
            <CardDescription>
              Review transactions and flag any errors for correction
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "collections" | "disbursements")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="collections" data-testid="tab-collections">
                  Collections
                </TabsTrigger>
                <TabsTrigger value="disbursements" data-testid="tab-disbursements">
                  Disbursements
                </TabsTrigger>
              </TabsList>

              {/* ========== COLLECTIONS TAB ========== */}
              <TabsContent value="collections" className="mt-4 md:mt-6">
                {collectionsLoading ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Loading collections...
                  </div>
                ) : collections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No collection transactions found
                  </div>
                ) : (
                  <>
                    {/* Mobile: Cards */}
                    <div className="md:hidden space-y-3">
                      {collections.map((collection) => (
                        <CollectionCard
                          key={collection.id}
                          collection={collection}
                          onFlag={(c) => handleReviewClick(c, "collection")}
                        />
                      ))}
                      {/* Mobile total */}
                      <div className="border rounded-lg px-4 py-3 bg-muted/40 flex justify-between items-center">
                        <span className="text-sm font-semibold">Total Collections</span>
                        <span className="font-bold">{formatCurrency(totalCollections.toString())}</span>
                      </div>
                    </div>

                    {/* Desktop: Table */}
                    <div className="hidden md:block border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Nature</TableHead>
                            <TableHead>Payor</TableHead>
                            <TableHead>OR Number</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {collections.map((collection) => (
                            <TableRow
                              key={collection.id}
                              className={collection.review_status === "flagged" ? "bg-red-50" : ""}
                              data-testid={`row-collection-${collection.id}`}
                            >
                              <TableCell className="font-medium">{collection.transaction_id}</TableCell>
                              <TableCell>{formatDate(collection.transaction_date)}</TableCell>
                              <TableCell className="max-w-xs truncate">{collection.nature_of_collection}</TableCell>
                              <TableCell>{collection.payor}</TableCell>
                              <TableCell>{collection.or_number}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(collection.amount)}</TableCell>
                              <TableCell className="text-center">{getStatusBadge(collection.review_status)}</TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                  onClick={() => handleReviewClick(collection, "collection")}
                                  data-testid={`button-flag-collection-${collection.id}`}
                                >
                                  <Flag className="h-4 w-4 mr-1" />
                                  Flag
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={5} className="text-right font-semibold">
                              Total Collections:
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(totalCollections.toString())}
                            </TableCell>
                            <TableCell colSpan={2} />
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ========== DISBURSEMENTS TAB ========== */}
              <TabsContent value="disbursements" className="mt-4 md:mt-6">
                {disbursementsLoading ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Loading disbursements...
                  </div>
                ) : disbursements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No disbursement transactions found
                  </div>
                ) : (
                  <>
                    {/* Mobile: Cards */}
                    <div className="md:hidden space-y-3">
                      {disbursements.map((disbursement) => (
                        <DisbursementCard
                          key={disbursement.id}
                          disbursement={disbursement}
                          onFlag={(d) => handleReviewClick(d, "disbursement")}
                        />
                      ))}
                      {/* Mobile total */}
                      <div className="border rounded-lg px-4 py-3 bg-muted/40 flex justify-between items-center">
                        <span className="text-sm font-semibold">Total Disbursements</span>
                        <span className="font-bold">{formatCurrency(totalDisbursements.toString())}</span>
                      </div>
                    </div>

                    {/* Desktop: Table */}
                    <div className="hidden md:block border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Nature</TableHead>
                            <TableHead>Payee</TableHead>
                            <TableHead>OR Number</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {disbursements.map((disbursement) => (
                            <TableRow
                              key={disbursement.id}
                              className={disbursement.review_status === "flagged" ? "bg-red-50" : ""}
                              data-testid={`row-disbursement-${disbursement.id}`}
                            >
                              <TableCell className="font-medium">{disbursement.transaction_id}</TableCell>
                              <TableCell>{formatDate(disbursement.transaction_date)}</TableCell>
                              <TableCell className="max-w-xs truncate">{disbursement.nature_of_disbursement}</TableCell>
                              <TableCell>{disbursement.payee}</TableCell>
                              <TableCell>{disbursement.or_number || "N/A"}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(disbursement.amount)}</TableCell>
                              <TableCell className="text-center">{getStatusBadge(disbursement.review_status)}</TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                  onClick={() => handleReviewClick(disbursement, "disbursement")}
                                  data-testid={`button-flag-disbursement-${disbursement.id}`}
                                >
                                  <Flag className="h-4 w-4 mr-1" />
                                  Flag
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={5} className="text-right font-semibold">
                              Total Disbursements:
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(totalDisbursements.toString())}
                            </TableCell>
                            <TableCell colSpan={2} />
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Flag Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-lg"
          data-testid="dialog-review"
        >
          <DialogHeader>
            <DialogTitle>Flag Transaction</DialogTitle>
            <DialogDescription>
              Please explain what issues you found with this transaction.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-sm font-medium flex-shrink-0">Transaction ID:</span>
                  <span className="text-sm text-right truncate">{selectedTransaction.transaction_id}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-sm font-medium flex-shrink-0">Amount:</span>
                  <span className="text-sm">{formatCurrency(selectedTransaction.amount)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-sm font-medium flex-shrink-0">
                    {selectedTransaction.type === "collection" ? "Payor:" : "Payee:"}
                  </span>
                  <span className="text-sm text-right truncate">
                    {selectedTransaction.type === "collection"
                      ? (selectedTransaction as Collection).payor
                      : (selectedTransaction as Disbursement).payee}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-comment">
                  Comment <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="review-comment"
                  placeholder="Explain what errors or issues you found"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  data-testid="input-review-comment"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              className="w-full sm:w-auto"
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewMutation.isPending}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              data-testid="button-confirm-review"
            >
              {reviewMutation.isPending ? "Submitting..." : "Flag Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckerLayout>
  );
}