// src/features/reports/pages/ReportsPage.tsx
import { useState } from "react";
import { ReportFilters } from "../components/ReportFilters";
import { ReadinessCheck } from "../components/ReadinessCheck";
import { GenerationProgress } from "../components/GenerationProgress";
import { useReportReadiness } from "../hooks/useReportReadiness";
import { useGenerateReport } from "../hooks/useGenerateReport";
import { useReportStatus } from "../hooks/useReportStatus";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ReportsPage() {
    const [filters, setFilters] = useState<any>(null);
    const [jobId, setJobId] = useState<string | null>(null);

    const readiness = useReportReadiness();
    const generate = useGenerateReport();
    const status = useReportStatus(jobId);

    const handleCheck = (data: any) => {
        setFilters(data);
        readiness.mutate(data, { onError: () => { } }); // reset error on new check
    };

    const handleGenerate = () => {
        if (!filters) return;
        generate.mutate(filters, {
            onSuccess: (data) => setJobId(data.job_id),
        });
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8">
            <h1 className="text-4xl font-bold">Generate Report Cards</h1>

            {/* Readiness Result */}
            {readiness.data && !readiness.isPending && (
                <ReadinessCheck
                    data={readiness.data}
                    onGenerate={handleGenerate}
                    isGenerating={generate.isPending}
                />
            )}

            {/* Filters */}
            <div className="bg-card rounded-lg border  border-dashed p-1">
                <ReportFilters onSubmit={handleCheck} />
            </div>

            {/* Global Error / Success Messages */}
            {readiness.error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                        <p className="font-medium">Failed to check readiness</p>
                        <p className="text-sm">{(readiness.error as any).message || "Unknown error"}</p>
                    </div>
                </div>
            )}

            {generate.error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                        <p className="font-medium">Failed to start generation</p>
                        <p className="text-sm">{(generate.error as any).message}</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {readiness.isPending && (
                <div className="text-center py-8">
                    <p className="text-lg">Checking marks completeness...</p>
                </div>
            )}

            

            {/* Generation Progress */}
            {jobId && (
                <>
                    {status.isPending && (
                        <p className="text-center py-8 text-muted-foreground">
                            Loading progress...
                        </p>
                    )}

                    {status.error && (
                        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <p className="font-medium">Failed to check progress</p>
                            <p className="text-sm">{(status.error as any).message}</p>
                        </div>
                    )}

                    {status.data && (
                        <GenerationProgress
                            status={status.data}
                            isLoading={status.isFetching}
                        />
                    )}
                </>
            )}
        </div>
    );
}