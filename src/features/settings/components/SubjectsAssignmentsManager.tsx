// src/features/settings/components/SubjectsAssignmentsManager.tsx
import { useState } from "react";
import { BookOpen, Search, Plus, Filter } from "lucide-react";
import { useReferenceData } from "../subjects/hooks/useReferenceData";
import { useSubjects } from "../subjects/hooks/useSubjects";
import { useAssignments } from "../subjects/hooks/useAssignments";
import SubjectAccordion from "../subjects/components/SubjectAccordion";
import SubjectForm from "../subjects/components/SubjectForm";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SubjectsAssignmentsManager() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "code">("name");
  const [activeView, setActiveView] = useState<"subjects" | "assignments">("subjects");

  const { data: ref, isLoading: refLoading } = useReferenceData();
  const { data: subjects = [] } = useSubjects();
  const { data: assignments = [] } = useAssignments();

  if (!ref) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading reference data...</p>
      </div>
    </div>
  );
  
  if (refLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading settings...</p>
      </div>
    </div>
  );

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

  const totalAssignments = assignments.length;
  const totalSubjects = subjects.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Academic Management</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Manage subjects, assignments, and teacher allocations
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <SubjectForm
                mode="create"
                trigger={
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200">
                    <Plus className="mr-2 h-4 w-4" />
                    New Subject
                  </Button>
                }
              />
              
              <Button variant="outline" className="w-full sm:w-auto">
                <BookOpen className="mr-2 h-4 w-4" />
                Quick Guide
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Subjects</p>
                    <p className="text-2xl font-bold text-blue-700">{totalSubjects}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active Assignments</p>
                    <p className="text-2xl font-bold text-green-700">{totalAssignments}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Departments</p>
                    <p className="text-2xl font-bold text-purple-700">{ref.departments.length}</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Classes</p>
                    <p className="text-2xl font-bold text-amber-700">{ref.classrooms.length}</p>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Controls Bar */}
          <Card className="border shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subjects by name, code, or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 h-11 w-full rounded-lg"
                  />
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-3">
                  <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="subjects" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Subjects
                      </TabsTrigger>
                      <TabsTrigger value="assignments" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                        Assignments
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Select value={selectedDept} onValueChange={setSelectedDept}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Departments" />
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
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Classes" />
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
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={(v: "name" | "code") => setSortBy(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(selectedDept !== "all" || selectedClass !== "all" || search) && (
                  <>
                    <Badge variant="secondary" className="gap-1">
                      <Filter className="h-3 w-3" />
                      Active Filters:
                    </Badge>
                    
                    {selectedDept !== "all" && (
                      <Badge variant="outline">
                        Dept: {ref.departments.find(d => String(d.id) === selectedDept)?.name}
                      </Badge>
                    )}
                    
                    {selectedClass !== "all" && (
                      <Badge variant="outline">
                        Class: {ref.classrooms.find(c => String(c.id) === selectedClass)?.name}
                      </Badge>
                    )}
                    
                    {search && (
                      <Badge variant="outline">
                        Search: "{search}"
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDept("all");
                        setSelectedClass("all");
                        setSearch("");
                      }}
                      className="ml-auto text-xs"
                    >
                      Clear All
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Subjects ({filteredSubjects.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing {filteredSubjects.length} of {subjects.length} subjects
              </p>
            </div>

            <Separator />

            {/* Subjects List */}
            {filteredSubjects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No subjects found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Try adjusting your search or filters, or create a new subject to get started.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDept("all");
                        setSelectedClass("all");
                        setSearch("");
                      }}
                    >
                      Clear Filters
                    </Button>
                    <SubjectForm
                      mode="create"
                      trigger={
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Subject
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSubjects.map((subject) => (
                  <SubjectAccordion
                    key={subject.id}
                    subject={subject}
                    assignments={assignments.filter(a => a.subject === subject.name)}
                    refData={ref}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}