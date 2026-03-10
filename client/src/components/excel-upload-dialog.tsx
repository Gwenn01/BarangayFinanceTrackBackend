import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { api, apiCall } from "../utils/api";
import { queryClient } from "../lib/queryClient";

/* ── Types ── */
type UploadType = "collection" | "disbursement";

interface CollectionRow {
  date: string;
  nature_of_collection: string;
  payor: string;
  amount: number | string;
}

interface DisbursementRow {
  date: string;
  nature_of_disbursement: string;
  payee: string;
  amount: number | string;
}

type ParsedRow = CollectionRow | DisbursementRow;

interface RowResult {
  row: number;
  status: "success" | "error";
  message?: string;
  data?: ParsedRow;
}

/* ── Excel date helper ── */
function excelDateToISO(value: unknown): string {
  if (typeof value === "number") {
    // Excel serial date → JS Date
    const date = XLSX.SSF.parse_date_code(value);
    const y = date.y;
    const m = String(date.m).padStart(2, "0");
    const d = String(date.d).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value === "string") {
    // Try to parse common formats
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  }
  return String(value ?? "");
}

/* ── Column aliases ── */
const COLLECTION_ALIASES: Record<string, keyof CollectionRow> = {
  "date": "date",
  "transaction date": "date",
  "nature of collection": "nature_of_collection",
  "nature_of_collection": "nature_of_collection",
  "natureofcollection": "nature_of_collection",
  "payor": "payor",
  "amount": "amount",
};

const DISBURSEMENT_ALIASES: Record<string, keyof DisbursementRow> = {
  "date": "date",
  "transaction date": "date",
  "nature of disbursement": "nature_of_disbursement",
  "nature_of_disbursement": "nature_of_disbursement",
  "natureofdisbursement": "nature_of_disbursement",
  "payee": "payee",
  "amount": "amount",
};

/* ── Parse sheet rows ── */
function parseSheet(
  sheet: XLSX.WorkSheet,
  type: UploadType
): { rows: ParsedRow[]; errors: string[] } {
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const rows: ParsedRow[] = [];
  const errors: string[] = [];
  const aliases = type === "collection" ? COLLECTION_ALIASES : DISBURSEMENT_ALIASES;

  raw.forEach((rawRow, idx) => {
    const rowNum = idx + 2; // 1-indexed, header is row 1
    const normalized: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(rawRow)) {
      const mapped = aliases[key.toLowerCase().trim()];
      if (mapped) normalized[mapped] = val;
    }

    if (type === "collection") {
      const row = normalized as Partial<CollectionRow>;
      if (!row.nature_of_collection) {
        errors.push(`Row ${rowNum}: Missing Nature of Collection`);
        return;
      }
      if (!row.payor) {
        errors.push(`Row ${rowNum}: Missing Payor`);
        return;
      }
      if (!row.amount) {
        errors.push(`Row ${rowNum}: Missing Amount`);
        return;
      }

      rows.push({
        date: excelDateToISO(row.date),
        nature_of_collection: String(row.nature_of_collection),
        payor: String(row.payor),
        amount: Number(row.amount),
      } as CollectionRow);
    } else {
      const row = normalized as Partial<DisbursementRow>;
      if (!row.nature_of_disbursement) {
        errors.push(`Row ${rowNum}: Missing Nature of Disbursement`);
        return;
      }
      if (!row.payee) {
        errors.push(`Row ${rowNum}: Missing Payee`);
        return;
      }
      if (!row.amount) {
        errors.push(`Row ${rowNum}: Missing Amount`);
        return;
      }

      rows.push({
        date: excelDateToISO(row.date),
        nature_of_disbursement: String(row.nature_of_disbursement),
        payee: String(row.payee),
        amount: Number(row.amount),
      } as DisbursementRow);
    }
  });

  return { rows, errors };
}

/* ── Upload single row to API ── */
async function uploadCollectionRow(row: CollectionRow): Promise<void> {
  const result = await apiCall(api.collections.create, {
    method: "POST",
    body: JSON.stringify({
      transaction_date: row.date,
      nature_of_collection: row.nature_of_collection,
      payor: row.payor,
      amount: Number(row.amount),
      category: "Uncategorized",
      subcategory: "Uncategorized",
      fund_source: "General Fund",
    }),
  });
  if (result.error) throw new Error(result.error);
}

async function uploadDisbursementRow(row: DisbursementRow): Promise<void> {
  const result = await apiCall(api.disbursements.create, {
    method: "POST",
    body: JSON.stringify({
      transaction_date: row.date,
      nature_of_disbursement: row.nature_of_disbursement,
      payee: row.payee,
      amount: Number(row.amount),
      category: "Uncategorized",
      subcategory: "Uncategorized",
      fund_source: "General Fund",
    }),
  });
  if (result.error) throw new Error(result.error);
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
interface ExcelUploadDialogProps {
  type: UploadType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExcelUploadDialog({
  type,
  open,
  onOpenChange,
}: ExcelUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [results, setResults] = useState<RowResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const label = type === "collection" ? "Collection" : "Disbursement";

  /* Expected columns hint */
  const expectedCols =
    type === "collection"
      ? ["Date", "Nature of Collection", "Payor", "Amount"]
      : ["Date", "Nature of Disbursement", "Payee", "Amount"];

  /* Reset state */
  const resetState = () => {
    setFileName(null);
    setParsedRows([]);
    setParseErrors([]);
    setResults([]);
    setIsUploading(false);
    setIsDone(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  /* Process file */
  const processFile = (file: File) => {
    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".csv")
    ) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an Excel (.xlsx / .xls) or CSV file.",
      });
      return;
    }

    setFileName(file.name);
    setParseErrors([]);
    setParsedRows([]);
    setResults([]);
    setIsDone(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const { rows, errors } = parseSheet(sheet, type);
        setParsedRows(rows);
        setParseErrors(errors);
      } catch {
        toast({
          variant: "destructive",
          title: "Parse Error",
          description: "Failed to read the Excel file. Please check its format.",
        });
        setFileName(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  /* File input change */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  /* Drag & drop */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  /* Upload all rows */
  const handleUpload = async () => {
    if (parsedRows.length === 0) return;
    setIsUploading(true);
    setResults([]);

    const newResults: RowResult[] = [];

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      try {
        if (type === "collection") {
          await uploadCollectionRow(row as CollectionRow);
        } else {
          await uploadDisbursementRow(row as DisbursementRow);
        }
        newResults.push({ row: i + 2, status: "success" });
      } catch (err: unknown) {
        newResults.push({
          row: i + 2,
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
      // update results progressively
      setResults([...newResults]);
    }

    setIsUploading(false);
    setIsDone(true);

    const successCount = newResults.filter((r) => r.status === "success").length;
    const errorCount = newResults.filter((r) => r.status === "error").length;

    // Refresh data
    queryClient.invalidateQueries({
      queryKey: [type === "collection" ? "collections" : "disbursements"],
    });

    toast({
      title: "Upload Complete",
      description: `${successCount} row(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ""}.`,
    });
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto rounded-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Upload {label} Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to bulk-import {label.toLowerCase()} transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Expected columns hint */}
          <div className="rounded-md bg-muted px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Required columns (header row):
            </p>
            <div className="flex flex-wrap gap-1">
              {expectedCols.map((col) => (
                <span
                  key={col}
                  className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono"
                >
                  {col}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Transaction ID and {type === "collection" ? "OR Number" : "DV Number"} are auto-generated by the backend — do not include them.
            </p>
          </div>

          {/* Drop zone */}
          {!fileName && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drop your Excel file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse (.xlsx, .xls, .csv)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* File loaded state */}
          {fileName && !isDone && (
            <div className="space-y-3">
              {/* File info */}
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-muted/30">
                <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{fileName}</span>
                <button
                  onClick={resetState}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Parse errors */}
              {parseErrors.length > 0 && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 space-y-1 max-h-32 overflow-y-auto">
                  <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {parseErrors.length} row(s) skipped due to missing fields:
                  </p>
                  {parseErrors.map((err, i) => (
                    <p key={i} className="text-xs text-destructive/90">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Preview count */}
              {parsedRows.length > 0 && (
                <div className="rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    ✓ {parsedRows.length} valid row(s) ready to upload
                  </p>
                </div>
              )}

              {/* Upload progress */}
              {isUploading && results.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {results.map((r) => (
                    <div
                      key={r.row}
                      className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                        r.status === "success"
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {r.status === "success" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5" />
                      )}
                      Row {r.row}: {r.status === "success" ? "Uploaded" : r.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetState}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleUpload}
                  disabled={isUploading || parsedRows.length === 0}
                >
                  {isUploading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading {results.length}/{parsedRows.length}...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload {parsedRows.length} Row(s)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Done state */}
          {isDone && (
            <div className="space-y-3">
              <div
                className={`rounded-md px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                  errorCount === 0
                    ? "bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400"
                    : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {successCount} uploaded successfully
                {errorCount > 0 && `, ${errorCount} failed`}
              </div>

              {/* Error details */}
              {errorCount > 0 && (
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {results
                    .filter((r) => r.status === "error")
                    .map((r) => (
                      <div
                        key={r.row}
                        className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-destructive/10 text-destructive"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        Row {r.row}: {r.message}
                      </div>
                    ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={resetState}>
                  Upload Another
                </Button>
                <Button className="flex-1" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}