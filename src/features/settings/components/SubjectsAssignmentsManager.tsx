// src/features/settings/components/SubjectsAssignmentsManager.tsx
import { useState } from "react";
import { BookOpen, Search, Plus } from "lucide-react";
import { useReferenceData } from "../subjects/hooks/useReferenceData";
import { useSubjects } from "../subjects/hooks/useSubjects";
import { useAssignments } from "../subjects/hooks/useAssignments";
import SubjectAccordion from "../subjects/components/SubjectAccordion";
import SubjectForm from "../subjects/components/SubjectForm"; // ← NEW
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function SubjectsAssignmentsManager() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "code">("name");

  const { data: ref, isLoading: refLoading } = useReferenceData();
  const { data: subjects = [] } = useSubjects();
  const { data: assignments = [] } = useAssignments();

  if (!ref) return <div className="p-8 text-center">Loading reference data...</div>;
  if (refLoading) return <div className="p-8 text-center">Loading settings...</div>;

  let filteredSubjects = subjects.filter(subject => {
    const matchesSearch =
      subject.name.toLowerCase().includes(search.toLowerCase()) ||
      subject.code.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === "all" || 
      subject.departments.includes(Number(selectedDept));

    const matchesClass = selectedClass === "all" || 
      assignments.some(a => 
        a.subject === subject.name && 
        a.class_rooms.includes(Number(selectedClass))
      );

    return matchesSearch && matchesDept && matchesClass;
  });

  filteredSubjects = [...filteredSubjects].sort((a, b) => {
    return sortBy === "name" 
      ? a.name.localeCompare(b.name)
      : a.code.localeCompare(b.code);
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header + Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-7 w-7 sm:h-8 sm:w-8" />
            Subjects & Assignments
          </h2>

          {/* Add New Subject Button */}
          <SubjectForm
            mode="create"
            trigger={
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Subject
              </Button>
            }
          />
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects or codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {ref.departments.map((d: any) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {ref.classrooms.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v: "name" | "code") => setSortBy(v)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="code">Sort by Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No subjects found</p>
              <p className="text-sm mt-2">Try adjusting your filters or add a new subject</p>
            </div>
          ) : (
            filteredSubjects.map((subject) => (
              <SubjectAccordion
                key={subject.id}
                subject={subject}
                assignments={assignments.filter(a => a.subject === subject.name)}
                refData={ref}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}