// src/features/reports/pages/ReportsPage.tsx
import { useState } from "react";
import { ReportFilters } from "../components/ReportFilters";
import { ReadinessCheck } from "../components/ReadinessCheck";
import { GenerationProgress } from "../components/GenerationProgress";
import { useReportReadiness } from "../hooks/useReportReadiness";
import { useGenerateReport } from "../hooks/useGenerateReport";
import { useReportStatus } from "../hooks/useReportStatus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ReportsPage() {
  const [filters, setFilters] = useState<any>(null);
  // you'll type this properly later
  const [jobId, setJobId] = useState<string | null>(null);

  const readiness = useReportReadiness();
  const generate = useGenerateReport();
  const status = useReportStatus(jobId);

  const handleCheck = (data: any) => {
    setFilters(data);
    readiness.mutate(data);
  };

  const handleGenerate = () => {
    if (!filters) return;
    generate.mutate(filters, {
      onSuccess: (data) => {
        setJobId(data.job_id);
      },
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8">Generate Report Cards</h1>

      <Card className="p-6 mb-8">
        <ReportFilters onSubmit={handleCheck} />
      </Card>

      {readiness.isPending && <p>Checking readiness...</p>}

      {readiness.data && (
        <ReadinessCheck 
          data={readiness.data} 
          onGenerate={handleGenerate}
          isGenerating={generate.isPending}
        />
      )}

      {jobId && status.data && (
        <GenerationProgress 
          status={status.data} 
          isLoading={status.isFetching}
        />
      )}

      {generate.error && (
        <div className="text-red-600 mt-4">
          Error: {(generate.error as any).message}
        </div>
      )}
    </div>
  );
}