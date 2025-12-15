// src/features/reports/components/GenerationProgress.tsx
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusResponse } from "../types";

interface Props {
  status: StatusResponse;   // now required — no undefined
  isLoading?: boolean;      // optional, defaults to false
}

export const GenerationProgress = ({ status, isLoading = false }: Props) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Loading progress...</p>
      </div>
    );
  }

  if (status.status === "completed" && status.download_url) {
  const handleDownload = () => {
    if (!status.download_url) return; // extra safety
    const link = document.createElement("a");
    link.href = status.download_url;
    link.download = `report_cards_${new Date().toISOString().slice(0,10)}.zip`; // suggested filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-center py-12">
      <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-green-800 mb-4">
        Report Cards Ready!
      </h3>
      <Button
        size="lg"
        onClick={handleDownload}
        className="bg-green-600 hover:bg-green-700"
      >
        Download All Report Cards (ZIP)
      </Button>
      <p className="text-sm text-muted-foreground mt-4">
        {status.total_students || status.progress.split("/")[1] || "Many"} students included
      </p>
    </div>
  );
}

  return (
    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-lg font-medium text-blue-800 mb-2">
        Generating... {status.progress} ({status.percentage}%)
      </p>
      <div className="mt-4 bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-500"
          style={{ width: `${status.percentage}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">{status.message}</p>
    </div>
  );
};