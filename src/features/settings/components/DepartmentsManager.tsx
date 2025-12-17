// src/features/settings/components/DepartmentsManager.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Classroom {
  id: number;
  name: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  class_rooms: number[]; // Array of classroom IDs
  student_count: number;
}

interface DepartmentCreateDTO {
  name: string;
  code: string;
  class_rooms: number[];
}

export default function DepartmentsManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedClassrooms, setSelectedClassrooms] = useState<number[]>([]);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [classroomSearch, setClassroomSearch] = useState("");

  // Fetch departments
  const { data: departments = [], isLoading } = useQuery<Department[], Error>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get<Department[]>("/departments/");
      return res.data ?? [];
    },
  });

  // Fetch classrooms for selection
  const { data: classrooms = [], isLoading: classroomsLoading } = useQuery<Classroom[], Error>({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const res = await api.get<Classroom[]>("/classrooms/");
      return res.data ?? [];
    },
  });

  // Get classroom names from IDs
  const getClassroomNames = (classroomIds: number[]): string[] => {
    return classroomIds
      .map(id => classrooms.find(c => c.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const createMutation = useMutation<unknown, Error, DepartmentCreateDTO>({
    mutationFn: async (data) => {
      await api.post("/departments/", data);
    },
    onSuccess: () => {
      toast.success("Department created");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create department");
    },
  });

  const updateMutation = useMutation<unknown, Error, { id: string; data: Partial<DepartmentCreateDTO> }>({
    mutationFn: async ({ id, data }) => {
      await api.patch(`/departments/${id}/`, data);
    },
    onSuccess: () => {
      toast.success("Department updated");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update department");
    },
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/departments/${id}/`);
    },
    onSuccess: () => {
      toast.success("Department deleted");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: () => toast.error("Failed to delete department"),
  });

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setName("");
    setCode("");
    setSelectedClassrooms([]);
    setClassroomSearch("");
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!code.trim()) return toast.error("Code is required");
    if (code.length > 6) return toast.error("Code must be 6 characters or less");

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      class_rooms: selectedClassrooms,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Set form values when editing
  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setCode(editing.code);
      setSelectedClassrooms(editing.class_rooms || []);
    }
  }, [editing]);

  // Filter classrooms based on search
  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(classroomSearch.toLowerCase())
  );

  const toggleClassroom = (classroomId: number) => {
    setSelectedClassrooms(prev =>
      prev.includes(classroomId)
        ? prev.filter(id => id !== classroomId)
        : [...prev, classroomId]
    );
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!departmentToDelete} onOpenChange={(open) => !open && setDepartmentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete the department "{departmentToDelete?.name}" ({departmentToDelete?.code})?
              This action cannot be undone.
            </p>
            {departmentToDelete && departmentToDelete.student_count > 0 && (
              <div className="mt-3 p-3 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Warning: This department has {departmentToDelete.student_count} student(s).
                  Deleting it may affect their records.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepartmentToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (departmentToDelete) {
                  deleteMutation.mutate(departmentToDelete.id);
                  setDepartmentToDelete(null);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Building2 className="h-6 w-6" />
                Departments
              </CardTitle>
              <CardDescription className="mt-1">
                Manage academic departments and their classroom assignments
              </CardDescription>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit" : "New"} Department</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label>Department Name *</Label>
                    <Input
                      placeholder="e.g. Accounting"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Code Input */}
                  <div className="space-y-2">
                    <Label>Department Code *</Label>
                    <Input
                      placeholder="e.g. ACC (max 6 characters)"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Short code for the department (e.g., ACC for Accounting)
                    </p>
                  </div>

                  {/* Classrooms Multi-select */}
                  <div className="space-y-2">
                    <Label>Assigned Classrooms</Label>
                    <div className="border rounded-md p-1">
                      <Command className="rounded-lg border shadow-md">
                        <CommandInput
                          placeholder="Search classrooms..."
                          value={classroomSearch}
                          onValueChange={setClassroomSearch}
                        />
                        <CommandEmpty>No classrooms found.</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-auto">
                          {filteredClassrooms.map((classroom) => (
                            <CommandItem
                              key={classroom.id}
                              onSelect={() => toggleClassroom(classroom.id)}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                <span>{classroom.name}</span>
                              </div>
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  selectedClassrooms.includes(classroom.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </div>
                    {selectedClassrooms.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedClassrooms.map(id => {
                          const classroom = classrooms.find(c => c.id === id);
                          return (
                            <Badge key={id} variant="secondary" className="gap-1">
                              <BookOpen className="h-3 w-3" />
                              {classroom?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop: Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Classrooms</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-48 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      No departments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => {
                    const classroomNames = getClassroomNames(dept.class_rooms);
                    return (
                      <TableRow key={dept.id}>
                        <TableCell className="font-mono font-bold">{dept.code}</TableCell>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {classroomNames.length > 0 ? (
                              classroomNames.slice(0, 3).map((name, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                            {classroomNames.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{classroomNames.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{dept.student_count}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditing(dept);
                              setOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDepartmentToDelete(dept)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-5">
                  <div className="h-6 bg-muted rounded w-40 animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                </div>
              ))
            ) : departments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No departments yet
              </div>
            ) : (
              departments.map((dept) => {
                const classroomNames = getClassroomNames(dept.class_rooms);
                return (
                  <div key={dept.id} className="rounded-lg border bg-card p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="font-mono">{dept.code}</Badge>
                          {dept.student_count > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <Users className="h-3 w-3" />
                              {dept.student_count}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-lg">{dept.name}</h4>
                      </div>
                    </div>

                    {/* Classrooms */}
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-2">Classrooms:</div>
                      <div className="flex flex-wrap gap-1">
                        {classroomNames.length > 0 ? (
                          classroomNames.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs gap-1">
                              <BookOpen className="h-3 w-3" />
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No classrooms assigned</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(dept);
                          setOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDepartmentToDelete(dept)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}