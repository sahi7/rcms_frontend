import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { Upload, FileSpreadsheet } from "lucide-react";

export default function BulkUploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    } else {
      toast.error("Please upload a valid Excel or CSV file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/student/bulk-upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Students uploaded successfully!");
      onOpenChange(false);
      setFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
            
            <Label htmlFor="file" className="cursor-pointer block mt-4">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
            </Label>
            <p className="text-xs text-muted-foreground mt-1">CSV, XLSX, XLS files only</p>

            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
            />

            {file && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { onOpenChange(false); setFile(null); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="min-w-32"
            >
              {isUploading ? "Uploading..." : "Upload Students"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}