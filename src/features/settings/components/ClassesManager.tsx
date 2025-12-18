// src/features/settings/components/ClassesManager.tsx
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
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

interface Class {
  id: string;
  name: string;
}

export default function ClassesManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Class | null>(null);
  const [name, setName] = useState("");
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const { data: classes = [], isLoading } = useQuery<Class[], Error>({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await api.get<{ results?: Class[]; data?: Class[] }>("/classrooms/");
      return (res.data.results ?? res.data.data ?? res.data ?? []) as Class[];
    },
    staleTime: Infinity,
  });

  const createMutation = useMutation<unknown, Error, { name: string }>({
    mutationFn: async (data) => {
      await api.post("/classrooms/", data);
    },
    onSuccess: () => {
      toast.success("Class created");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });

  const updateMutation = useMutation<unknown, Error, { id: string; data: { name: string } }>({
    mutationFn: async ({ id, data }) => {
      await api.patch(`/classrooms/${id}/`, data);
    },
    onSuccess: () => {
      toast.success("Class updated");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/classrooms/${id}/`);
    },
    onSuccess: () => {
      toast.success("Class deleted");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: () => toast.error("Failed to delete class"),
  });

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setName("");
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Class name is required");
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: { name } });
    } else {
      createMutation.mutate({ name });
    }
  };

  useEffect(() => {
    if (editing) {
      setName(editing.name);
    }
  }, [editing]);

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!classToDelete} onOpenChange={(open) => !open && setClassToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete the class "{classToDelete?.name}"?
              This action cannot be undone.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Note: Deleting a class will remove it from all departments and assignments.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (classToDelete) {
                  deleteMutation.mutate(classToDelete.id);
                  setClassToDelete(null);
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
                <Users className="h-6 w-6" />
                Classes
              </CardTitle>
              <CardDescription className="mt-1">
                Manage class levels (Form 1, Grade 10, etc.)
              </CardDescription>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit" : "New"} Class</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="e.g. Form 1, Grade 10, Year 11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
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
                  <TableHead>Class Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-12">
                      No classes created yet
                    </TableCell>
                  </TableRow>
                ) : (
                  classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(cls);
                            setOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setClassToDelete(cls)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-5">
                  <div className="h-6 bg-muted rounded w-40 animate-pulse" />
                </div>
              ))
            ) : classes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No classes created yet
              </div>
            ) : (
              classes.map((cls) => (
                <div key={cls.id} className="rounded-lg border bg-card p-5 shadow-sm">
                  <h4 className="font-semibold text-lg mb-4">{cls.name}</h4>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(cls);
                        setOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setClassToDelete(cls)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}