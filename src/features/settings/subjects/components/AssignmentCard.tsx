// src/features/settings/subjects/components/AssignmentCard.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Building2, Edit, Trash2 } from "lucide-react";
import AssignmentForm from "./AssignmentForm";
import { useDeleteAssignment } from "../hooks/useAssignments";

interface Assignment {
  id: number;
  subject: string;
  teacher: string;
  department: number;
  academic_year: string;
  class_rooms: number[];
}

interface RefData {
  departments: { id: number; name: string }[];
  classrooms: { id: number; name: string }[];
  academic_years: { id: string; name: string }[];
  teachers: { id: number; full_name: string }[];
}

interface Props {
  assignment: Assignment;
  refData: RefData;
  subjectName: string;
  subjectId: number;
}

export default function AssignmentCard({ assignment, refData, subjectName, subjectId }: Props) {
  const deleteMutation = useDeleteAssignment();

  // const deptName = assignment.department
  const deptName = refData.departments.find(d => d.id === assignment.department)?.name || "Unknown Dept";
  const academicYearName = refData.academic_years.find(y => y.id === assignment.academic_year)?.name || "Unknown Year";
  const teacherName = refData.teachers.find(t => t.id === Number(assignment.teacher))?.full_name || assignment.teacher;
  const classNames = assignment.class_rooms
    .map(id => refData.classrooms.find(c => c.id === id)?.name)
    .filter(Boolean);

  const handleDelete = () => {
    if (confirm(`Remove ${assignment.teacher} from ${subjectName}?`)) {
      deleteMutation.mutate(assignment.id);
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow border">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Teacher + Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-lg truncate">{teacherName}</h4>
          
          <div className="flex flex-wrap gap-3 mt-3 text-sm">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {academicYearName}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {deptName}
            </Badge>
          </div>

          {/* Classes as chips */}
          {classNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {classNames.map((name, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2 sm:flex-col sm:items-end">
          <AssignmentForm
            subjectId={subjectId} // not needed for edit
            subjectName={subjectName}
            assignment={assignment}
            refData={refData}
            trigger={
              <Button size="sm" variant="ghost">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Edit</span>
              </Button>
            }
          />

          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Remove</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}