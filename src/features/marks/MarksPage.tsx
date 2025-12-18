// src/features/marks/MarksPage.tsx

import { useState } from "react";
import { useMarks } from "./hooks/useMarks";
import MarksOverview from "./components/MarksOverview";
import MarksTable from "./components/MarksTable";
import MarksGrid from "./components/MarksGrid";
import MarksUploadModal from "./components/MarksUploadModal";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import type { BatchDetail } from "./types";
import { toast } from "sonner";

export default function MarksPage() {
    const [uploadOpen, setUploadOpen] = useState(false);

    const {
        recent,
        scope,
        isPrincipal,
        currentBatch,
        setCurrentBatch,
        isLoadingOverview,
        isLoadingRecent,
        isLoadingScope,
        uploadMarks,
        isUploading,
        saveBatch,
        isSaving,
    } = useMarks();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12 space-y-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {currentBatch ? (
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentBatch(null)}
                            className="mb-4"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Uploads
                        </Button>
                    ) : (
                        <h1 className="text-4xl font-bold tracking-tight">Marks Management</h1>
                    )}

                    {!currentBatch && (
                        <Button size="lg" onClick={() => setUploadOpen(true)} disabled={isLoadingScope}>
                            <Plus className="mr-2 h-5 w-5" />
                            Upload Marks
                        </Button>
                    )}
                </div>

                {/* Main Content */}
                {currentBatch ? (
                    <MarksGrid
                        batch={currentBatch.batch}
                        pagination={currentBatch.pagination}
                        marks={currentBatch.marks}
                        isPrincipal={isPrincipal}
                        onSave={async (updates) => {
                            await saveBatch({
                                groupKey: currentBatch.batch.group_key,
                                updates,
                            });
                        }}
                        onBack={() => setCurrentBatch(null)}
                        isSaving={isSaving}
                    />
                ) : (
                    <>
                        <MarksOverview
                            recentBatches={recent}
                            isLoading={isLoadingOverview}
                            isPrincipal={isPrincipal}
                        />

                        <MarksTable
                            data={recent}
                            isLoading={isLoadingRecent}
                            isPrincipal={isPrincipal}
                            onOpenGrid={async (batch) => {
                                try {
                                    const response = await api.get<BatchDetail>(`/marks/batch-det/${batch.group_key}/`);
                                    setCurrentBatch(response.data);
                                } catch (err) {
                                    console.error("Failed to load batch:", err);
                                    toast.error("Failed to open marks editor");
                                }
                            }}
                        />
                    </>
                )}

                {/* Upload Modal */}
                <MarksUploadModal
                    open={uploadOpen}
                    onOpenChange={(open) => {
                        setUploadOpen(open);
                        if (open) setCurrentBatch(null);
                    }}
                    scope={scope}
                    isPrincipal={isPrincipal}
                    isLoadingScope={isLoadingScope}
                    onUpload={uploadMarks}
                    isUploading={isUploading}
                />
            </div>
        </div>
    );
}