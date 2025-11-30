import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import StudentsTable from "./components/StudentsTable";
import BulkUploadDialog from "../users/components/BulkUploadDialog";
import { useState } from "react";

export default function StudentsPage() {
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Padding that scales nicely on mobile */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Header Section – Fully Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Students
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                Full student management with filters, search, and bulk upload
              </p>
            </div>

            {/* Button – Full width on mobile, normal on desktop */}
            <Button
              onClick={() => setBulkOpen(true)}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-5 w-5" />
              <span className="hidden xxs:inline">Bulk Upload</span>
              <span className="xxs:hidden">Upload</span>
            </Button>
          </div>

          {/* Main Content */}
          <div className="mt-6 sm:mt-8">
            <StudentsTable />
          </div>

          {/* Dialog */}
          <BulkUploadDialog open={bulkOpen} onOpenChange={setBulkOpen} />
        </div>
      </div>
    </div>
  );
}