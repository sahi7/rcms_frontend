// src/features/reports/components/ReadinessCheck.tsx
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ReadinessResponse } from "../types";

interface Props {
  data: ReadinessResponse;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ReadinessCheck = ({ data, onGenerate, isGenerating }: Props) => {
  const hasMissing = data.missing_marks && data.missing_marks.length > 0;

  if (data.ready) {
    return (
      <div className="flex items-center gap-4 p-6 bg-green-50 border-2 border-green-300 rounded-xl">
        <CheckCircle2 className="h-10 w-10 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-green-800">Ready to Generate!</h3>
          <p className="text-green-700">
            All {data.students_with_complete_marks} students have complete marks
          </p>
          <p className="font-medium">Class Average: {data.class_average.toFixed(2)} / 20</p>
        </div>
        <Button
          size="lg"
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-green-600 hover:bg-green-700"
        >
          {isGenerating ? "Starting..." : "Generate Report Cards"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-6 bg-red-50 border-2 border-red-300 rounded-xl">
      <AlertCircle className="h-10 w-10 text-red-600 flex-shrink-0 mt-1" />
      <div className="flex-1">
        <h3 className="text-xl font-bold text-red-800 mb-3">
          Not Ready — Missing Marks ({hasMissing ? data.missing_marks.length : 0} students)
        </h3>

        {hasMissing ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.missing_marks.map((m) => (
              <div key={m.student_id} className="text-sm">
                <strong>{m.full_name}</strong> ({m.registration_number})
                {" — missing "} 
                <span className="text-red-700 font-medium">
                  {m.missing_count} subject{m.missing_count > 1 ? "s" : ""}
                </span>
                {m.missing_subjects.length > 0 && (
                  <span>: {m.missing_subjects.join(", ")}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No specific missing marks reported.</p>
        )}

        <p className="mt-4 text-sm text-red-600">
          Please complete all marks before generating report cards.
        </p>
      </div>
    </div>
  );
};