// src/features/settings/components/AcademicYearsManager.tsx
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
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
  start_date?: string;
  end_date?: string;
}

export default function AcademicYearsManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicYear | null>(null);
  const [name, setName] = useState("");

  const { data: years = [], isLoading } = useQuery<AcademicYear[], Error>({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const res = await api.get<{ results?: AcademicYear[]; data?: AcademicYear[] }>("/academic-years/");
      return (res.data.results ?? res.data.data ?? res.data ?? []) as AcademicYear[];
    },
  });

  const createMutation = useMutation<unknown, Error, { name: string }>({
    mutationFn: async (data) => {
      await api.post("/academic-years/", data);
    },
    onSuccess: () => {
      toast.success("Academic year created");
      setOpen(false);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
  });

  const updateMutation = useMutation<unknown, Error, { id: string; data: Partial<AcademicYear> }>({
    mutationFn: async ({ id, data }) => {
      await api.patch(`/academic-years/${id}/`, data);
    },
    onSuccess: () => {
      toast.success("Academic year updated");
      setEditing(null);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
  });

  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/academic-years/${id}/`);
    },
    onSuccess: () => {
      toast.success("Academic year deleted");
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
  });

  const handleSave = () => {
    if (!name.trim()) return toast.error("Academic year name is required");
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
              <Calendar className="h-6 w-6" />
              Academic Years
            </CardTitle>
            <CardDescription className="mt-1">
              Manage school academic sessions
            </CardDescription>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" onClick={() => { setEditing(null); setName(""); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Year
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "New"} Academic Year</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="e.g. 2024-2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
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
                <TableHead>Academic Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : years.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                    No academic years created yet
                  </TableCell>
                </TableRow>
              ) : (
                years.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">{year.name}</TableCell>
                    <TableCell>
                      {year.is_current ? (
                        <Badge>Current</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(year);
                          setName(year.name);
                          setOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(year.id)}
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
            [...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-5">
                <div className="h-6 bg-muted rounded w-40 animate-pulse mb-3" />
                <div className="h-5 bg-muted rounded w-24 animate-pulse" />
              </div>
            ))
          ) : years.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No academic years created yet
            </div>
          ) : (
            years.map((year) => (
              <div key={year.id} className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-lg">{year.name}</h4>
                  {year.is_current ? (
                    <Badge>Current</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(year);
                      setName(year.name);
                      setOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(year.id)}
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