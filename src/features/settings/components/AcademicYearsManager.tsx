// src/features/settings/components/AcademicYearsManager.tsx
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
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
import { Plus, Edit, Trash2, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface AcademicYear {
  id: string;
  name: string;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  is_current: boolean;
}

interface Term {
  id: string;
  name: string;
  term_number: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
  academic_year: string; // year ID
}

export default function AcademicYearsManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicYear | null>(null);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [expandedYearIds, setExpandedYearIds] = useState<Set<string>>(new Set());

  const [termDialogOpen, setTermDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [selectedYearForTerm, setSelectedYearForTerm] = useState<string>("");
  const [termNumber, setTermNumber] = useState<string>("");
  const [termName, setTermName] = useState("");
  const [termStartDate, setTermStartDate] = useState<Date | undefined>(undefined);
  const [termEndDate, setTermEndDate] = useState<Date | undefined>(undefined);
  const [termToDelete, setTermToDelete] = useState<Term | null>(null);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);


  const { data: years = [], isLoading } = useQuery<AcademicYear[]>({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const res = await api.get("/academic-years/");
      // Your backend returns a plain array directly in res.data
      const years = res.data as AcademicYear[];
      console.log("Fetched academic years:", years);
      return years;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: allTerms = [], isLoading: termsLoading } = useQuery<Term[]>({
    queryKey: ["terms"],
    queryFn: async () => {
      const res = await api.get("/terms/");
      return res.data as Term[];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; start_date: string; end_date: string }) => {
      await api.post("/academic-years/", data);
    },
    onSuccess: () => {
      toast.success("Academic year created");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
    onError: () => toast.error("Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AcademicYear> }) => {
      await api.patch(`/academic-years/${id}/`, data);
    },
    onSuccess: () => {
      toast.success("Academic year updated");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/academic-years/${id}/`);
    },
    onSuccess: () => {
      toast.success("Academic year deleted");
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const setCurrentMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post("/academic-years/set-current/", { id });
    },
    onSuccess: () => {
      toast.success("Current academic year updated");
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
    onError: () => toast.error("Failed to set current year"),
  });

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setName("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getTermsForYear = (yearId: string): Term[] => {
    return allTerms.filter(term => term.academic_year === yearId);
  };


  // Add this function to toggle expansion
  const toggleYearExpansion = (yearId: string) => {
    setExpandedYearIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(yearId)) {
        newSet.delete(yearId);
      } else {
        newSet.add(yearId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!startDate || !endDate) return toast.error("Both dates are required");
    if (endDate <= startDate) return toast.error("End date must be after start date");

    const payload = {
      name,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Add these mutations after your other mutations
  const createTermMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post("/terms/", data);
    },
    onSuccess: () => {
      toast.success("Term created");
      queryClient.invalidateQueries({ queryKey: ["terms"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to create term");
    },
  });

  const updateTermMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Term> }) => {
      await api.patch(`/terms/${id}/`, data);
    },
    onSuccess: () => {
      toast.success("Term updated");
      queryClient.invalidateQueries({ queryKey: ["terms"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update term");
    },
  });

  const deleteTermMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/terms/${id}/`);
    },
    onSuccess: () => {
      toast.success("Term deleted");
      queryClient.invalidateQueries({ queryKey: ["terms"] });
    },
    onError: () => toast.error("Failed to delete term"),
  });

  const setCurrentTermMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post("/terms/set-current/", { id });
    },
    onSuccess: () => {
      toast.success("Current term updated");
      queryClient.invalidateQueries({ queryKey: ["terms"] });
    },
    onError: () => toast.error("Failed to set current term"),
  });

  const resetTermForm = () => {
    setTermDialogOpen(false);
    setEditingTerm(null);
    setSelectedYearForTerm("");
    setTermNumber("");
    setTermName("");
    setTermStartDate(undefined);
    setTermEndDate(undefined);
  };

  const handleSaveTerm = () => {
    if (!selectedYearForTerm) return toast.error("Please select an academic year");
    if (!termNumber) return toast.error("Please select a term number");
    if (!termName.trim()) return toast.error("Term name is required");
    if (!termStartDate || !termEndDate) return toast.error("Both dates are required");
    if (termEndDate <= termStartDate) return toast.error("End date must be after start date");

    const payload = {
      academic_year: selectedYearForTerm,
      term_number: parseInt(termNumber),
      name: termName,
      start_date: format(termStartDate, "yyyy-MM-dd"),
      end_date: format(termEndDate, "yyyy-MM-dd"),
    };

    if (editingTerm) {
      updateTermMutation.mutate({ id: editingTerm.id, data: payload as any });
    } else {
      createTermMutation.mutate(payload);
    }
    resetTermForm();
  };

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setStartDate(editing.start_date ? new Date(editing.start_date) : undefined);
      setEndDate(editing.end_date ? new Date(editing.end_date) : undefined);
    }
  }, [editing]);

  useEffect(() => {
    if (editingTerm) {
      setSelectedYearForTerm(editingTerm.academic_year);
      setTermNumber(editingTerm.term_number.toString());
      setTermName(editingTerm.name);
      setTermStartDate(editingTerm.start_date ? new Date(editingTerm.start_date) : undefined);
      setTermEndDate(editingTerm.end_date ? new Date(editingTerm.end_date) : undefined);
    }
  }, [editingTerm]);

  return (
    <>

      {/* Term Dialog */}
      <Dialog open={termDialogOpen} onOpenChange={setTermDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTerm ? "Edit" : "New"} Term</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Academic Year Select (pre-filled when adding from a specific year) */}
            <div className="space-y-2">
              <Label>Academic Year *</Label>
              <Select
                value={selectedYearForTerm}
                onValueChange={setSelectedYearForTerm}
                disabled={!!editingTerm} // Disable if editing (can't change year)
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term Number Select */}
            <div className="space-y-2">
              <Label>Term Number *</Label>
              <Select
                value={termNumber}
                onValueChange={setTermNumber}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select term number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Term 1</SelectItem>
                  <SelectItem value="2">Term 2</SelectItem>
                  <SelectItem value="3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Term Name Input */}
            <div className="space-y-2">
              <Label>Term Name *</Label>
              <Input
                placeholder="e.g. First Term 2025"
                value={termName}
                onChange={(e) => setTermName(e.target.value)}
              />
            </div>

            {/* Start Date Picker */}
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {termStartDate ? format(termStartDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={termStartDate}
                    onSelect={setTermStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date Picker */}
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {termEndDate ? format(termEndDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={termEndDate}
                    onSelect={setTermEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Set Current Term Checkbox (only for editing) */}
            {editingTerm && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-current"
                  checked={editingTerm?.is_current}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCurrentTermMutation.mutate(editingTerm.id);
                    }
                  }}
                  disabled={setCurrentTermMutation.isPending}
                />
                <Label htmlFor="is-current" className="text-sm">
                  Set as current term
                </Label>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetTermForm}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTerm}
                disabled={createTermMutation.isPending || updateTermMutation.isPending}
              >
                {createTermMutation.isPending || updateTermMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Academic Year Delete Confirmation Dialog */}
      <Dialog open={!!yearToDelete} onOpenChange={(open) => !open && setYearToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Academic Year</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-2">
              Are you sure you want to delete the academic year "{yearToDelete?.name}"?
            </p>
            <p className="text-sm text-muted-foreground">
              This action will also delete all associated terms and cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setYearToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (yearToDelete) {
                  deleteMutation.mutate(yearToDelete.id);
                  setYearToDelete(null);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Term Delete Confirmation Dialog */}
      <Dialog open={!!termToDelete} onOpenChange={(open) => !open && setTermToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Term</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete term "{termToDelete?.name}"?
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTermToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (termToDelete) {
                  deleteTermMutation.mutate(termToDelete.id);
                  setTermToDelete(null);
                }
              }}
              disabled={deleteTermMutation.isPending}
            >
              {deleteTermMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Year
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit" : "New"} Academic Year</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g. 2025/2026"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          // captionLayout="dropdown" // Add dropdowns for year/month navigation
                          showOutsideDays={true}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          // captionLayout="dropdown" // Add dropdowns for year/month navigation
                          showOutsideDays={true}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                      Save
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
                  <TableHead>Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-48 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-48 animate-pulse" /></TableCell>
                      <TableCell><div className="h-6 bg-muted rounded w-20 animate-pulse" /></TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : years.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No academic years created yet
                    </TableCell>
                  </TableRow>
                ) : (
                  years.map((year) => {
                    const yearTerms = getTermsForYear(year.id);
                    const isExpanded = expandedYearIds.has(year.id);

                    return (
                      <React.Fragment key={year.id}>
                        {/* Year row */}
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleYearExpansion(year.id)}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              {year.name}
                            </div>
                          </TableCell>
                          <TableCell>{year.start_date ? format(new Date(year.start_date), "MMM d, yyyy") : "Not set"}</TableCell>
                          <TableCell>{year.end_date ? format(new Date(year.end_date), "MMM d, yyyy") : "Not set"}</TableCell>
                          <TableCell>
                            {year.is_current ? (
                              <Badge>Current</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            {!year.is_current && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentMutation.mutate(year.id);
                                }}
                                disabled={setCurrentMutation.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Set as Current
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditing(year);
                                setOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setYearToDelete(year); // Changed from deleteMutation.mutate(year.id)
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Terms row - expanded content */}
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0 border-t-0">
                              <div className="p-4 bg-muted/30">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-medium">Terms</h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedYearForTerm(year.id);
                                      setTermDialogOpen(true);
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Term
                                  </Button>
                                </div>
                                {termsLoading ? (
                                  <div className="text-center py-4">Loading terms...</div>
                                ) : yearTerms.length === 0 ? (
                                  <div className="text-center py-4 text-muted-foreground">
                                    No terms created for this academic year
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {yearTerms.map((term) => (
                                      <div key={term.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                        <div>
                                          <div className="font-medium">{term.name}</div>
                                          <div className="text-sm text-muted-foreground">
                                            {format(new Date(term.start_date), "MMM d, yyyy")} - {format(new Date(term.end_date), "MMM d, yyyy")}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {term.is_current && <Badge>Current Term</Badge>}
                                          <Button size="sm" variant="ghost" onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingTerm(term);
                                            setTermDialogOpen(true);
                                          }}>
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <Button size="sm" variant="ghost" onClick={(e) => {
                                            e.stopPropagation();
                                            setTermToDelete(term);
                                          }}>
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
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
              years.map((year) => {
                const yearTerms = getTermsForYear(year.id);
                const isExpanded = expandedYearIds.has(year.id);

                return (
                  <Collapsible
                    key={year.id}
                    open={isExpanded}
                    onOpenChange={() => toggleYearExpansion(year.id)}
                    className="rounded-lg border bg-card"
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="p-5 cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            <h4 className="font-semibold text-lg">{year.name}</h4>
                          </div>
                          {year.is_current ? (
                            <Badge>Current</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>Start: {year.start_date ? format(new Date(year.start_date), "MMM d, yyyy") : "Not set"}</p>
                          <p>End: {year.end_date ? format(new Date(year.end_date), "MMM d, yyyy") : "Not set"}</p>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-5 pb-5">
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Terms</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedYearForTerm(year.id);
                                setTermDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Term
                            </Button>
                          </div>
                          {termsLoading ? (
                            <div className="text-center py-4">Loading terms...</div>
                          ) : yearTerms.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              No terms created for this academic year
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {yearTerms.map((term) => (
                                <div key={term.id} className="p-3 bg-muted/30 rounded">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium">{term.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {format(new Date(term.start_date), "MMM d, yyyy")} - {format(new Date(term.end_date), "MMM d, yyyy")}
                                      </div>
                                    </div>
                                    {term.is_current && <Badge>Current</Badge>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}