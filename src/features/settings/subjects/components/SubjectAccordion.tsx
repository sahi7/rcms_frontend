// src/features/settings/subjects/components/SubjectAccordion.tsx
import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2, Plus, BookOpen, AlertCircle, Users, Hash, Award, Layers } from "lucide-react";
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
  assignmentsError?: boolean;
  assignmentsErrorMessage?: string;
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

  const departmentCount = subject.departments.length;

  return (
    <Card className="overflow-hidden border hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
      {/* Header */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 cursor-pointer bg-gradient-to-r from-white to-primary/5 hover:from-primary/5 hover:to-primary/10 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex items-start md:items-center gap-4">
          {/* Subject Icon */}
          <div className="p-3 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>

          {/* Subject Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h3 className="text-lg md:text-xl font-semibold text-foreground">{subject.name}</h3>
              <Badge variant="outline" className="w-fit">
                <Hash className="h-3 w-3 mr-1" />
                {subject.code}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>Coefficient: {subject.coefficient}</span>
              </div>
              
              <div className="hidden sm:block">•</div>
              
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>Max Score: {subject.max_score}</span>
              </div>
              
              {departmentCount > 0 && (
                <>
                  <div className="hidden sm:block">•</div>
                  <div className="flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    <span>{departmentCount} department{departmentCount !== 1 ? 's' : ''}</span>
                  </div>
                </>
              )}
            </div>
            
            {subjectDeptNames && (
              <div className="mt-2 flex flex-wrap gap-1">
                {subject.departments.map(deptId => {
                  const dept = refData.departments.find(d => d.id === deptId);
                  return dept ? (
                    <Badge key={deptId} variant="secondary" className="text-xs">
                      {dept.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions & Stats */}
        <div className="flex items-center justify-between md:justify-end gap-3 mt-4 md:mt-0">
          {/* Assignment Count */}
          <div className="hidden md:block">
            {assignmentsError ? (
              <Badge variant="destructive" className="gap-1 px-3 py-1.5">
                <AlertCircle className="h-3 w-3" />
                Failed
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                <Users className="h-3 w-3" />
                {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <SubjectForm subject={subject} mode="edit" trigger={
              <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            } />

            <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              className="h-9 w-9 p-0 ml-2"
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsOpen(!isOpen); 
              }}
            >
              {isOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Collapsible Body */}
      {isOpen && (
        <div className="border-t bg-gradient-to-b from-muted/20 to-transparent">
          <div className="p-4 md:p-6 space-y-4">
            {/* Mobile Stats */}
            <div className="md:hidden flex items-center justify-between mb-4">
              {assignmentsError ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Failed to load assignments
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {/* Error State */}
            {assignmentsError ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-3">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <h4 className="font-semibold text-destructive mb-1">Failed to load assignments</h4>
                  {assignmentsErrorMessage && (
                    <p className="text-sm text-muted-foreground">{assignmentsErrorMessage}</p>
                  )}
                  <Button variant="outline" size="sm" className="mt-4">
                    Retry
                  </Button>
                </div>
              </Card>
            ) : assignments.length === 0 ? (
              <Card className="border-dashed">
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold mb-1">No assignments yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Assign teachers to this subject to get started
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Current Assignments</h4>
                  <Badge variant="outline">{assignments.length} total</Badge>
                </div>
                
                <div className="grid gap-3">
                  {assignments.map(assignment => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      refData={refData}
                      subjectName={subject.name}
                      subjectId={subject.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add Assignment Button */}
            <div className="pt-4 border-t">
              <AssignmentForm
                subjectId={subject.id}
                subjectName={subject.name}
                refData={refData}
                trigger={
                  <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Teacher
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}