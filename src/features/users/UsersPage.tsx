// src/features/users/UsersPage.tsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

import UsersTable from "./components/UsersTable";
import UserFormDialog from "./components/UserFormDialog";
import BulkUploadDialog from "./components/BulkUploadDialog";

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bulkOpen, setBulkOpen] = useState(false);

  // Default to "teacher" if no tab is set
  const tab = searchParams.get("tab") || "teacher";
  const isStudentTab = tab === "student";

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("tab", value);
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
      default: return "Users";
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
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

            <div className="flex gap-3 flex-wrap sm:flex-nowrap sm:justify-end shrink-0">
              {isStudentTab && (
                <Button onClick={() => setBulkOpen(true)} size="lg" className="w-full sm:w-auto">
                  <Upload className="mr-2 h-5 w-5" />
                  <span className="hidden sm:inline">Bulk Upload</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
              )}
              <Button
                onClick={() => {
                  setEditingUser(null);
                  setDialogOpen(true);
                }}
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                New {tab === "student" ? "Student" : tab === "teacher" ? "Teacher" : "Parent"}
              </Button>
            </div>
          </div>

          {/* Tabs — Only Teacher, Student, Parent */}
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3"> {/* Changed to 3 columns */}
              <TabsTrigger value="teacher">Teachers</TabsTrigger>
              <TabsTrigger value="student">Students</TabsTrigger>
              <TabsTrigger value="parent">Parents</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-8">
              <UsersTable
                role={tab as "teacher" | "student" | "parent"} // Explicitly typed
                showFilters={true}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
              />
            </TabsContent>
          </Tabs>

          {isStudentTab && <BulkUploadDialog open={bulkOpen} onOpenChange={setBulkOpen} />}

          <UserFormDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingUser(null);
            }}
            user={editingUser || undefined}
          />
        </div>
      </div>
    </div>
  );
}