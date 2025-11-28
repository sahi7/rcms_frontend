import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
}

export default function DepartmentsManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");

  const { data: departments = [], isLoading } = useQuery<Department[], Error>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get<Department[]>("/departments/");
      return res.data ?? [];
    },
  });

  const createMutation = useMutation<unknown, Error, { name: string }>({
    mutationFn: async (data) => {
      await api.post("/departments/", data);
    },
    onSuccess: () => {
      toast.success("Department created");
      setOpen(false);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const updateMutation = useMutation<unknown, Error, { id: string; data: { name: string } }>({
    mutationFn: async ({ id, data }) => {
      await api.patch(`/departments/${id}/`, data);
    },
    onSuccess: () => {
      toast.success("Department updated");
      setEditing(null);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["departments"] });
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
  });

  const handleSave = () => {
    if (!name.trim()) return toast.error("Name is required");
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: { name } });
    } else {
      createMutation.mutate({ name });
    }
    setName("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Building2 className="h-6 w-6" />
              Departments
            </CardTitle>
            <CardDescription className="mt-1">
              Manage academic departments
            </CardDescription>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" onClick={() => { setEditing(null); setName(""); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "New"} Department</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="e.g. Science"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save</Button>
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
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded w-48 animate-pulse" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-12">
                    No departments yet
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(dept);
                          setName(dept.name);
                          setOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(dept.id)}
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
            [...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-5">
                <div className="h-6 bg-muted rounded w-40 animate-pulse" />
              </div>
            ))
          ) : departments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No departments yet
            </div>
          ) : (
            departments.map((dept) => (
              <div key={dept.id} className="rounded-lg border bg-card p-5 shadow-sm">
                <h4 className="font-semibold text-lg mb-4">{dept.name}</h4>
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(dept);
                      setName(dept.name);
                      setOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(dept.id)}
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
  );
}