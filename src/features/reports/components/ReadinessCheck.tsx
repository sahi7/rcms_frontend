// src/features/reports/components/ReadinessCheck.tsx
import { Button } from "@/components/ui/button";
import { ReadinessResponse } from "../types";

interface Props {
  data: ReadinessResponse;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ReadinessCheck = ({ data, onGenerate, isGenerating }: Props) => {
  if (data.ready) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-green-800 font-bold text-lg mb-2">
          Ready to generate!
        </h3>
        <p>{data.students_with_complete_marks} / {data.total_students} students have all marks</p>
        <p>Class Average: {data.class_average.toFixed(2)}</p>
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating}
          className="mt-4"
        >
          {isGenerating ? "Starting..." : "Generate Report Cards"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-red-800 font-bold text-lg mb-4">
        Not Ready — Missing Marks
      </h3>
      <ul className="space-y-2">
        {data.missing_marks.map(m => (
          <li key={m.student_id}>
            <strong>{m.full_name}</strong> ({m.registration_number}): missing {m.missing_count} subject(s)
          </li>
        ))}
      </ul>
    </div>
  );
};