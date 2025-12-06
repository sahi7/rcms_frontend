// src/features/marks/components/MarksUploadModal.tsx

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

import type { UploadScope } from "../types";

const schema = z.object({
    assignment_id: z.string().min(1, "Please select a subject assignment"),
    term_id: z.string().min(1, "Please select a term"),
    class_id: z.string().min(1, "Please select a class"),
    file: z.any().refine((f) => f?.[0] instanceof File, "Please upload a file"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scope?: UploadScope;
    isPrincipal: boolean;
    isLoadingScope: boolean;
    onUpload: (formData: FormData) => Promise<any>;
    isUploading?: boolean;
}

export default function MarksUploadModal({
    open,
    onOpenChange,
    scope,
    isPrincipal,
    isLoadingScope,
    onUpload,
}: Props) {
    const [dragActive, setDragActive] = useState(false);
    //   const [serverError, setServerError] = useState<string | null>(null);
    const [serverError, setServerError] = useState<
        string | { message: string; details: string[] } | null
    >(null);
    const [headerError, setHeaderError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const selectedFile = watch("file")?.[0] as File | undefined;

    const validateHeaders = async (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            if (file.name.endsWith(".csv")) {
                Papa.parse(file, {
                    preview: 1,
                    complete: (result) => {
                        const headers = result.data[0] as string[];
                        const hasReg = headers.some((h) => h.toLowerCase().includes("registration"));
                        const hasScore = headers.some((h) => h.toLowerCase().includes("score"));
                        if (!hasReg || !hasScore) {
                            setHeaderError("File must contain 'registration_number' and 'score' columns");
                            resolve(false);
                        } else {
                            setHeaderError(null);
                            resolve(true);
                        }
                    },
                });
            } else {
                // Excel
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    const headers = json[0] as string[];

                    const hasReg = headers.some((h) => typeof h === "string" && h.toLowerCase().includes("registration"));
                    const hasScore = headers.some((h) => typeof h === "string" && h.toLowerCase().includes("score"));

                    if (!hasReg || !hasScore) {
                        setHeaderError("Excel must have columns: registration_number and score");
                        resolve(false);
                    } else {
                        setHeaderError(null);
                        resolve(true);
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDropOrChange = async (files: FileList | null) => {
        if (!files?.[0]) return;

        const file = files[0];
        const isValidType = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(file.type) ||
            file.name.match(/\.(csv|xlsx|xls)$/i);

        if (!isValidType) {
            toast.error("Please upload a CSV or Excel file");
            return;
        }

        // Validate headers before accepting
        const valid = await validateHeaders(file);
        if (valid) {
            setValue("file", files);
            setServerError(null);
            setHeaderError(null);
        }
    };

    const onSubmit = async (data: FormValues) => {
        setServerError(null);

        const formData = new FormData();
        formData.append("assignment_id", data.assignment_id);
        formData.append("term_id", data.term_id);
        formData.append("class_id", data.class_id);
        formData.append("file", data.file[0]);

        try {
            await onUpload(formData);  // ← Just call, do NOTHING else
            reset();
            onOpenChange(false);       // ← Close modal
            // NO toast.success here!
        } catch (error: any) {
            const errorData = error?.response?.data;

            let mainMessage = errorData?.error || errorData?.detail || error?.message || "Upload failed";

            let details: string[] = [];

            if (Array.isArray(errorData?.details) && errorData.details.length > 0) {
                details = errorData.details;
            }

            if (details.length > 0) {
                setServerError({ message: mainMessage, details });
            } else {
                setServerError(mainMessage);
            }

            //   toast.error(mainMessage);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Upload Marks</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Select Fields */}
                    <div className="space-y-2">
                        <Label>Subject Assignment</Label>
                        <Select disabled={isLoadingScope} onValueChange={(v) => setValue("assignment_id", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingScope ? "Loading..." : "Select subject & class"} />
                            </SelectTrigger>
                            <SelectContent>
                                {scope?.assignments?.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{a.subject_name} ({a.subject_code})</span>
                                            <span className="text-xs text-muted-foreground">{a.class_name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.assignment_id && <p className="text-sm text-destructive">{errors.assignment_id.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Term</Label>
                            <Select onValueChange={(v) => setValue("term_id", v)}>
                                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                                <SelectContent>
                                    {scope?.terms?.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.term_id && <p className="text-sm text-destructive">{errors.term_id.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Class</Label>
                            <Select onValueChange={(v) => setValue("class_id", v)}>
                                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                                <SelectContent>
                                    {scope?.classes?.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.class_id && <p className="text-sm text-destructive">{errors.class_id.message}</p>}
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-3">
                        <Label>File (CSV or Excel)</Label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragActive(false);
                                handleDropOrChange(e.dataTransfer.files);
                            }}
                        >
                            <input
                                {...register("file")}
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                className="hidden"
                                onChange={(e) => handleDropOrChange(e.target.files)}
                            />

                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-4">
                                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                                    <div className="text-center">
                                        <p className="font-semibold text-lg">{selectedFile.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setValue("file", null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                            setHeaderError(null);
                                        }}
                                    >
                                        <X className="mr-2 h-4 w-4" /> Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <FileSpreadsheet className="mx-auto h-16 w-16 text-muted-foreground" />
                                    <div>
                                        <p className="text-lg font-medium">Drop file here</p>
                                        <p className="text-sm text-muted-foreground">or click to browse</p>
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" /> Choose File
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Header validation error */}
                        {headerError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{headerError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Server error */}
                        {serverError && (
                            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                                <p className="font-medium text-destructive">
                                    {typeof serverError === "string" ? serverError : serverError.message}
                                </p>

                                {typeof serverError === "object" && serverError.details?.length > 0 && (
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {serverError.details.map((detail, index) => (
                                            <li key={index} className="flex items-center gap-2 text-destructive">
                                                <span>•</span>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !selectedFile || !!headerError}
                        >
                            {isSubmitting ? "Uploading..." : "Upload & Edit"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}