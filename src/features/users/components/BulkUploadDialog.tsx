import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function BulkUploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message?: string;
    errors?: string[];
    created?: number;
    updated?: number;
    sample?: any[];
    error_count?: number;
    success_count?: number;
  } | null>(null);

  interface UploadResponse {
    message?: string;
    error?: string;
    errors?: string[];
    created?: number;
    updated?: number;
    results?: any[];
    sample?: any[];
    error_count?: number;
    success_count?: number;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.includes("spreadsheet") || droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
      setFile(droppedFile);
      setUploadResult(null); // Clear previous results
    } else {
      toast.error("Please upload a valid Excel or CSV file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post<UploadResponse>("/student/bulk-upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result: UploadResponse = response.data;
      const status = response.status;

      // Determine if partial success (207) or full success (200/201)
      const isPartialSuccess = status === 207;

      setUploadResult({
        success: !isPartialSuccess, // false for partial success
        message: result.message || (isPartialSuccess ? "Partial success - some records failed" : "Upload completed successfully"),
        errors: result.errors || [],
        created: result.created,
        updated: result.updated,
        success_count: result.success_count || (result.created || result.updated || 0),
        error_count: result.error_count,
        sample: result.sample || result.results,
      });

      // Show appropriate toast
      if (isPartialSuccess) {
        toast.warning(
          `Partial success: ${result.success_count || 0} succeeded, ${result.error_count || 0} failed`,
          { duration: 6000 }
        );
      } else {
        const successMsg = result.message ||
          `${result.created ? `${result.created} created` : ''}${result.created && result.updated ? ', ' : ''}${result.updated ? `${result.updated} updated` : ''}`;
        toast.success(successMsg || "Upload completed successfully!", { duration: 5000 });
      }

    } catch (err: any) {
      const errorData: UploadResponse = err.response?.data;
      const status = err.response?.status;

      // Handle different error statuses
      if (status === 207) {
        // Partial success from backend
        setUploadResult({
          success: false,
          message: errorData?.message || "Partial success - some records failed",
          errors: errorData?.errors || [],
          created: errorData?.created,
          updated: errorData?.updated,
          success_count: errorData?.success_count,
          error_count: errorData?.error_count,
          sample: errorData?.sample,
        });
        toast.warning(
          `Partial success: ${errorData?.success_count || 0} succeeded, ${errorData?.error_count || 0} failed`,
          { duration: 6000 }
        );
      } else {
        // Complete failure
        setUploadResult({
          success: false,
          message: errorData?.message || errorData?.error || "Upload failed",
          errors: errorData?.errors || (errorData?.error ? [errorData.error] : []),
          error_count: errorData?.error_count,
          success_count: errorData?.success_count,
          created: errorData?.created,
          updated: errorData?.updated,
          sample: errorData?.sample,
        });

        const errorMsg = errorData?.message || errorData?.error || "Upload failed";
        toast.error(errorMsg, { duration: 5000 });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setUploadResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Students
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file with student data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-hidden flex flex-col h-full">
          {/* File Upload Area */}
          {!uploadResult && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors flex-1 flex flex-col justify-center ${isDragging ? "border-primary bg-primary/5" : "border-muted"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="mx-auto h-16 w-16 text-muted-foreground" />

              <Label htmlFor="file" className="cursor-pointer block mt-4">
                <span className="text-primary font-medium">Click to upload</span> or drag and drop
              </Label>
              <p className="text-sm text-muted-foreground mt-1">CSV, XLSX, XLS files only</p>

              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                    setUploadResult(null);
                  }
                }}
              />

              {file && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Display Area */}
          {uploadResult && (
            <div className="space-y-4 flex-1 overflow-hidden">
              {/* Summary Card */}
              <div className={`rounded-lg border p-4 ${uploadResult.success ? 'bg-green-50 border-green-200' :
                  uploadResult.errors && uploadResult.errors.length > 0 ? 'bg-amber-50 border-amber-200' :
                    'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-center gap-3">
                  {uploadResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : uploadResult.errors && uploadResult.errors.length > 0 ? (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {uploadResult.success ? "Upload Completed" :
                        uploadResult.errors && uploadResult.errors.length > 0 ? "Partial Success" :
                          "Upload Failed"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {uploadResult.message}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {uploadResult.success_count !== undefined && uploadResult.success_count > 0 && (
                      <Badge variant={uploadResult.success ? "default" : "secondary"} className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {uploadResult.success_count} succeeded
                      </Badge>
                    )}
                    {uploadResult.error_count !== undefined && uploadResult.error_count > 0 && (
                      <Badge variant={uploadResult.success ? "secondary" : "destructive"} className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {uploadResult.error_count} errors
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Errors Display */}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Error Details</h4>
                    <Badge variant="destructive" className="text-xs">
                      {uploadResult.errors.length} error{uploadResult.errors.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <ScrollArea className="h-60 border rounded-md">
                    <div className="p-4 space-y-3">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="flex gap-3 p-3 bg-red-50 rounded border border-red-100">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700 break-words">{error}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Sample Results */}
              {uploadResult.sample && uploadResult.sample.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Sample Results</h4>
                  <ScrollArea className="h-40 border rounded-md">
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-muted-foreground border-b">
                          <tr>
                            <th className="text-left pb-2">Row</th>
                            <th className="text-left pb-2">Registration</th>
                            <th className="text-left pb-2">Name</th>
                            <th className="text-left pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResult.sample.map((item, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="py-2 font-mono text-xs">{item.row}</td>
                              <td className="py-2">{item.registration_number}</td>
                              <td className="py-2">{item.first_name} {item.last_name}</td>
                              <td className="py-2">
                                <Badge variant="outline" className="text-xs">
                                  {uploadResult.success ? "Created" : "Updated"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 pt-4 border-t">
            {uploadResult ? (
              <>
                <Button variant="outline" onClick={resetDialog}>
                  Close
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setUploadResult(null)}>
                    Upload Another
                  </Button>
                  <Button onClick={resetDialog}>
                    Done
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={resetDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="min-w-32"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Uploading...
                    </>
                  ) : (
                    "Upload Students"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}