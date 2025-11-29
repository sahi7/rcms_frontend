// src/features/settings/components/SubjectsAssignmentsManager.tsx
import { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { useReferenceData } from "../subjects/hooks/useReferenceData";
import { useSubjects } from "../subjects/hooks/useSubjects";
import { useAssignments } from "../subjects/hooks/useAssignments";
import SubjectAccordion from "../subjects/components/SubjectAccordion";
import { Input } from "@/components/ui/input";

export default function SubjectsAssignmentsManager() {
  const [search, setSearch] = useState("");
  const { data: ref, isLoading: refLoading } = useReferenceData();
  const { data: subjects = [] } = useSubjects();
  const { data: assignments = [] } = useAssignments();

  if (!ref) return <div className="p-8 text-center">Loading reference data...</div>;
  if (refLoading) return <div className="p-8 text-center">Loading settings...</div>;

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8"> {/* ← This was missing! */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            Subjects & Assignments
          </h2>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects or codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No subjects found matching your search</p>
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