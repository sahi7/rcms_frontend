// src/features/users/UsersPage.tsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

import UsersTable from "./components/UsersTable";
import CreateUserDialog from "./components/CreateUserDialog";
import BulkUploadDialog from "./components/BulkUploadDialog";

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const tab = searchParams.get("tab") || "all";
  const isStudentTab = tab === "student";

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (value === "all") p.delete("tab");
      else p.set("tab", value);
      // Clear all filters when switching tabs
      p.delete("page");
      p.delete("search");
      p.delete("department");
      p.delete("class");
      p.delete("academic_year");
      return p;
    });
  };

  const getTitle = () => {
    switch (tab) {
      case "student": return "Students";
      case "teacher": return "Teachers";
      case "parent": return "Parents";
      default: return "All Users";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          {/* Header — Perfect alignment: Title left, Buttons far right */}
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
  {/* Title + Description — takes available space, stays left */}
  <div className="flex-1 space-y-2 min-w-0">
    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight whitespace-normal">
      {getTitle()}
    </h1>
    <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
      {isStudentTab
        ? "Full student management with advanced filters, search, and bulk upload"
        : "Manage teachers, parents, and all users with powerful search and filters"}
    </p>
  </div>

  {/* Action Buttons — pushed to the far right */}
  <div className="flex gap-3 flex-wrap sm:flex-nowrap sm:justify-end shrink-0">
    {isStudentTab && (
      <Button onClick={() => setBulkOpen(true)} size="lg" className="w-full sm:w-auto">
        <Upload className="mr-2 h-5 w-5" />
        <span className="hidden sm:inline">Bulk Upload</span>
        <span className="sm:hidden">Upload</span>
      </Button>
    )}
    <Button onClick={() => setCreateOpen(true)} size="lg" className="w-full sm:w-auto">
      <Plus className="mr-2 h-5 w-5" />
      New {isStudentTab ? "Student" : tab === "teacher" ? "Teacher" : "User"}
    </Button>
  </div>
</div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="teacher">Teachers</TabsTrigger>
              <TabsTrigger value="student">Students</TabsTrigger>
              <TabsTrigger value="parent">Parents</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-8">
              <UsersTable
                role={tab === "all" ? null : (tab as "teacher" | "student" | "parent")}
                showFilters={true}   // Filters on EVERY tab
              />
            </TabsContent>
          </Tabs>

          <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
          {isStudentTab && <BulkUploadDialog open={bulkOpen} onOpenChange={setBulkOpen} />}
        </div>
      </div>
    </div>
  );
}