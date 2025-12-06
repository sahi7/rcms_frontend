// src/features/marks/components/MarksGrid.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Undo2, Redo2, Save, Lock, Clock } from "lucide-react";

import type { BatchDetail } from "../types";

interface Props {
  batch: BatchDetail["batch"];
  pagination: BatchDetail["pagination"];
  marks: BatchDetail["marks"];
  isPrincipal: boolean;
  onSave: (updates: Array<{ id: string; score?: number | null; comment?: string }>) => Promise<void>;
  onBack: () => void;
  isSaving?: boolean;
}

export default function MarksGrid({
  batch,
  pagination,
  marks: initialMarks,
  isPrincipal,
  onSave,
  onBack,
  isSaving = false,
}: Props) {
  const [marks, setMarks] = useState(initialMarks);
  const [undoStack, setUndoStack] = useState<typeof marks[]>([]);
  const [redoStack, setRedoStack] = useState<typeof marks[]>([]);

  const isEditable = isPrincipal || batch.can_edit;
  const maxScore = batch.max_score;;

  useEffect(() => {
    setMarks(initialMarks.map(m => ({ ...m })));
    setUndoStack([]);
    setRedoStack([]);
  }, [initialMarks]);

  const pushUndo = () => {
    setUndoStack(prev => [...prev.slice(-30), marks]);
    setRedoStack([]);
  };

  const handleScoreChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;

    const value = e.target.value;
    const score = value === "" ? null : Number(value);

    if (score !== null && score > maxScore) {
      toast.error(`Score cannot exceed ${maxScore}`);
      return;
    }

    pushUndo();

    setMarks(prev =>
      prev.map((m, i) => {
        if (i !== index) return m;

        const percentage = score !== null ? (score / maxScore) * 100 : 0;
        const grade =
          score === null
            ? ""
            : percentage >= 80
            ? "A"
            : percentage >= 70
            ? "B"
            : percentage >= 60
            ? "C"
            : percentage >= 50
            ? "D"
            : percentage >= 40
            ? "E"
            : "F";

        const is_below_half = score !== null && score < maxScore * 0.5;

        return { ...m, score, grade, is_below_half };
      })
    );
  };

  const handleCommentChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    pushUndo();
    setMarks(prev => prev.map((m, i) => (i === index ? { ...m, comment: e.target.value } : m)));
  };

  const handleSave = async () => {
    const updates = marks
      .map((current, i) => {
        const original = initialMarks[i];
        if (current.score !== original.score || current.comment !== original.comment) {
          return {
            id: current.id,
            score: current.score,
            comment: current.comment || undefined,
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{ id: string; score?: number | null; comment?: string }>;

    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      await onSave(updates);
      toast.success("Marks saved successfully");
    } catch {
      toast.error("Failed to save marks");
    }
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(s => [...s, marks]);
    setMarks(prev);
    setUndoStack(s => s.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(s => [...s, marks]);
    setMarks(next);
    setRedoStack(s => s.slice(0, -1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">
            {batch.subject} — {batch.class_name}
          </h2>
          <p className="text-muted-foreground">
            Term: {batch.term} • {batch.total_students} students • {batch.academic_year}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isEditable && (
            <Badge variant="secondary" className="px-4 py-2">
              <Lock className="w-4 h-4 mr-2" />
              Locked
            </Badge>
          )}
          {isEditable && batch.time_left_hours !== null && batch.time_left_hours > 0 && (
            <Badge variant="default" className="px-4 py-2 bg-amber-600">
              <Clock className="w-4 h-4 mr-2" />
              {batch.time_left_hours.toFixed(1)}h left
            </Badge>
          )}
        </div>
      </div>

      {/* Pagination Info */}
      {pagination.total_pages > 1 && (
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.total_pages} • Showing {marks.length} of {pagination.total_count} students
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Marks</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={undo} disabled={undoStack.length === 0}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={redo} disabled={redoStack.length === 0}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button onClick={handleSave} disabled={!isEditable || isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    Reg No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {marks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      No students found
                    </td>
                  </tr>
                ) : (
                  marks.map((mark, index) => (
                    <tr key={mark.id} className={mark.is_below_half ? "bg-red-50" : ""}>
                      <td className="px-6 py-4 text-sm">{mark.registration_number}</td>
                      <td className="px-6 py-4 font-medium">{mark.full_name}</td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min="0"
                          max={maxScore}
                          step="0.5"
                          value={mark.score ?? ""}
                          onChange={handleScoreChange(index)}
                          className="w-24 mx-auto text-center"
                          disabled={!isEditable}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant={
                            mark.grade === "A" || mark.grade === "A+"
                              ? "default"
                              : mark.grade === "F"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-lg px-3"
                        >
                          {mark.grade || "—"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          value={mark.comment || ""}
                          onChange={handleCommentChange(index)}
                          placeholder="Optional..."
                          disabled={!isEditable}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}