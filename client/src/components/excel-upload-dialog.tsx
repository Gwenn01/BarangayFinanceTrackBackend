import { useRef, useState } from "react";
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
import { API_BASE_URL } from "../utils/api";
import { queryClient } from "../lib/queryClient";

type DataType = "budget_entries" | "collection" | "disbursement" | "dfur";

interface AboExcelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdBy?: number;
  /** Controls which data_type is sent to the backend.
   *  - "budget_entries" → ABO page
   *  - "collection"     → SRE page (Collection tab)
   *  - "disbursement"   → SRE page (Disbursement tab)
   *  - "dfur"           → DFUR page
   */
  type?: DataType;
}

const DATA_TYPE_LABELS: Record<DataType, string> = {
  budget_entries: "Budget Entries",
  collection: "Collection",
  disbursement: "Disbursement",
  dfur: "DFUR",
};

const QUERY_KEY_MAP: Record<DataType, string> = {
  budget_entries: "budget-entries",
  collection: "collections",
  disbursement: "disbursements",
  dfur: "dfur-projects",
};

export function AboExcelUploadDialog({
  open,
  onOpenChange,
  createdBy,
  type = "budget_entries",
}: AboExcelUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  const label = DATA_TYPE_LABELS[type];

  const resetState = () => {
    setFileName(null);
    setSelectedFile(null);
    setIsUploading(false);
    setIsDone(false);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const selectFile = (file: File) => {
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an .xlsx, .xls, or .csv file.",
      });
      return;
    }
    setFileName(file.name);
    setSelectedFile(file);
    setIsDone(false);
    setUploadResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("data_type", type);
      formData.append("created_by", String(createdBy));

      const response = await fetch(`${API_BASE_URL}/post-bulk`, {
        method: "POST",
        body: formData,
        // NOTE: Do NOT set Content-Type — browser sets it automatically with the multipart boundary
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || result.error || `Upload failed (HTTP ${response.status})`);
      }

      setUploadResult({ success: true, message: result.message || "Upload successful!" });
      setIsDone(true);

      // Invalidate the correct query key based on data type
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_MAP[type]] });

      toast({
        title: "Upload Complete",
        description: result.message || `${label} entries uploaded successfully.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadResult({ success: false, message });
      setIsDone(true);
      toast({ variant: "destructive", title: "Upload Failed", description: message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto rounded-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Upload {label} Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file and the server will process all {label.toLowerCase()} entries automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Info box */}
          <div className="rounded-md bg-muted px-3 py-2.5 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">How it works:</p>
            <p className="text-xs text-muted-foreground">
              Select your Excel file and click Upload. The server will extract all{" "}
              {label.toLowerCase()} rows automatically.
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted formats:{" "}
              <span className="font-mono">.xlsx</span>,{" "}
              <span className="font-mono">.xls</span>,{" "}
              <span className="font-mono">.csv</span>
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
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Drop your Excel file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse (.xlsx, .xls, .csv)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* File selected */}
          {fileName && !isDone && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-muted/30">
                <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{fileName}</span>
                <button
                  onClick={resetState}
                  disabled={isUploading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={resetState} disabled={isUploading}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Done state */}
          {isDone && uploadResult && (
            <div className="space-y-3">
              <div className={`rounded-md px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                uploadResult.success
                  ? "bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 border border-destructive/30 text-destructive"
              }`}>
                {uploadResult.success
                  ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                {uploadResult.message}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={resetState}>Upload Another</Button>
                <Button className="flex-1" onClick={handleClose}>Done</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}