// src/features/settings/subjects/components/SubjectAccordion.tsx
import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2, Plus, BookOpen, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AssignmentCard from "./AssignmentCard";
import SubjectForm from "./SubjectForm";
import AssignmentForm from "./AssignmentForm";
import type { RefData } from "../hooks/useReferenceData";

interface Subject {
  id: number;
  name: string;
  code: string;
  coefficient: string;
  max_score: string;
  departments: number[];
}

interface Assignment {
  id: number;
  subject: string;
  teacher: string;
  department: number;
  academic_year: string;
  class_rooms: number[];
}

interface Props {
  subject: Subject;
  assignments: Assignment[];
  assignmentsError?: boolean;        // ← NEW: did the query fail?
  assignmentsErrorMessage?: string; // ← NEW: optional message
  refData: RefData;
}

export default function SubjectAccordion({ 
  subject, 
  assignments, 
  assignmentsError = false,
  assignmentsErrorMessage,
  refData 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const subjectDeptNames = subject.departments
    .map(id => refData.departments.find(d => d.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 md:p-6 cursor-pointer bg-gradient-to-r from-primary/5 hover:from-primary/10 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">{subject.name}</h3>
            <p className="text-sm text-muted-foreground">
              {subject.code} • Coeff: {subject.coefficient} • Max: {subject.max_score}
              {subjectDeptNames && ` • ${subjectDeptNames}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Show error badge instead of count if failed */}
          {assignmentsError ? (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Failed to load
            </Badge>
          ) : (
            <Badge variant="secondary">
              {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
            </Badge>
          )}

          <SubjectForm subject={subject} mode="edit" trigger={
            <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
          } />

          <Button size="sm" variant="ghost" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="border-t bg-muted/20 p-4 md:p-6 space-y-4">
          {assignmentsError ? (
            <div className="text-center py-8 text-destructive flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8" />
              <p>Failed to load assignments</p>
              {assignmentsErrorMessage && (
                <p className="text-sm text-muted-foreground">{assignmentsErrorMessage}</p>
              )}
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No assignments yet</p>
          ) : (
            assignments.map(assignment => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                refData={refData}
                subjectName={subject.name}
                subjectId={subject.id}
              />
            ))
          )}

          <AssignmentForm
            subjectId={subject.id}
            subjectName={subject.name}
            refData={refData}
            trigger={
              <Button className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Assign Teacher
              </Button>
            }
          />
        </div>
      )}
    </Card>
  );
}