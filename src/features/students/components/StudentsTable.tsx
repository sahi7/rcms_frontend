// src/features/students/components/StudentsTable.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Trash2, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

interface Student {
    id: number;
    registration_number: string;
    first_name: string;
    last_name: string;
    department_name: string;
    class_name: string;
}

interface Pagination {
    current_page: number;
    page_size: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
}

interface ApiResponse {
    data: Student[];
    pagination: Pagination;
}

interface FilterOption {
    id: string;
    name: string;
}

export default function StudentsTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const [debouncedSearch] = useDebounce(searchInput, 400);

    const page = Number(searchParams.get("page")) || 1;
    const pageSize = 20;
    const department = searchParams.get("department") || "";
    const classId = searchParams.get("class") || "";
    const academicYear = searchParams.get("academic_year") || "";

    useEffect(() => {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            if (debouncedSearch) {
                p.set("search", debouncedSearch);
                p.set("page", "1");
            } else {
                p.delete("search");
            }
            return p;
        });
    }, [debouncedSearch, setSearchParams]);

    // Safe fetchers — this fixes ALL TypeScript errors
    const fetchList = async <T,>(url: string): Promise<T> => {
        const res = await api.get(url);
        return res.data as T;
    };

    const fetchStudents = async (): Promise<ApiResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
        });
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (department) params.append("department", department);
        if (classId) params.append("class", classId);
        if (academicYear) params.append("academic_year", academicYear);

        return fetchList<ApiResponse>(`/students/?${params.toString()}`);
    };

    // Fetch filters
    const { data: classes = [] } = useQuery<FilterOption[]>({
        queryKey: ["classes"],
        queryFn: () => fetchList<FilterOption[]>("/classrooms/"),
    });

    const { data: departments = [] } = useQuery<FilterOption[]>({
        queryKey: ["departments"],
        queryFn: () => fetchList<FilterOption[]>("/departments/"),
    });

    const { data: academicYears = [] } = useQuery<FilterOption[]>({
        queryKey: ["academic-years"],
        queryFn: () => fetchList<FilterOption[]>("/academic-years/"),
    });

    const { data, isLoading, isFetching } = useQuery<ApiResponse, Error>({
        queryKey: ["students", { page, debouncedSearch, department, classId, academicYear }],
        queryFn: fetchStudents,
        placeholderData: previousData => previousData,
    });

    const students = data?.data ?? [];
    const pagination = data?.pagination;

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/students/${id}/`);
        },
        onSuccess: () => {
            toast.success("Student deleted");
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: () => toast.error("Failed to delete"),
    });

    const updateFilter = (key: string, value: string) => {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            if (value) p.set(key, value);
            else p.delete(key);
            p.set("page", "1");
            return p;
        });
    };

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search students..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                />
                {isFetching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex flex-wrap gap-3">
                <Select value={classId || "all"} onValueChange={(v) => updateFilter("class", v === "all" ? "" : v)}>
                    <SelectTrigger className="w-48">
                        <SelectValue>
                            {classId
                                ? classes.find(c => String(c.id) === classId)?.name ?? "Class"
                                : "All Classes"
                            }
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={department || "all"} onValueChange={(v) => updateFilter("department", v === "all" ? "" : v)}>
                    <SelectTrigger className="w-56">
                        <SelectValue>
                            {department
                                ? departments.find(d => String(d.id) === department)?.name ?? "Department"
                                : "All Departments"
                            }
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(d => (
                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={academicYear || "all"} onValueChange={(v) => updateFilter("academic_year", v === "all" ? "" : v)}>
                    <SelectTrigger className="w-48">
                        <SelectValue>
                            {academicYear
                                ? academicYears.find(y => String(y.id) === academicYear)?.name ?? "Year"
                                : "Academic Year"
                            }
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {academicYears.map(y => (
                            <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* MOBILE FILTER SHEET – 100% WORKING */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden w-full">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters {classId || department || academicYear ? "•" : ""}
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-96">
                    <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>

                    <div className="mt-6 space-y-5">
                        {/* CLASS FILTER – MOBILE */}
                        <Select value={classId || "all"} onValueChange={(v) => updateFilter("class", v === "all" ? "" : v)}>
                            <SelectTrigger>
                                <SelectValue>
                                    {classId
                                        ? classes.find(c => String(c.id) === classId)?.name ?? "Class"
                                        : "All Classes"
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                {classes.map(c => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* DEPARTMENT FILTER – MOBILE */}
                        <Select value={department || "all"} onValueChange={(v) => updateFilter("department", v === "all" ? "" : v)}>
                            <SelectTrigger>
                                <SelectValue>
                                    {department
                                        ? departments.find(d => String(d.id) === department)?.name ?? "Department"
                                        : "All Departments"
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map(d => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* ACADEMIC YEAR FILTER – MOBILE */}
                        <Select value={academicYear || "all"} onValueChange={(v) => updateFilter("academic_year", v === "all" ? "" : v)}>
                            <SelectTrigger>
                                <SelectValue>
                                    {academicYear
                                        ? academicYears.find(y => String(y.id) === academicYear)?.name ?? "Year"
                                        : "Academic Year"
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {academicYears.map(y => (
                                    <SelectItem key={y.id} value={String(y.id)}>
                                        {y.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Loading / Empty */}
            {isLoading && <div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded" />)}</div>}

            {!isLoading && students.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">No students found</div>
            )}

            {/* Table / Cards */}
            <div className="space-y-4">
                {/* Desktop */}
                <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
                    <div className="grid grid-cols-10 gap-4 p-4 font-medium text-muted-foreground border-b">
                        <div className="col-span-2">Reg No</div>
                        <div className="col-span-4">Name</div>
                        <div className="col-span-2">Class</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {students.map(s => (
                        <div key={s.id} className="grid grid-cols-10 gap-4 p-4 border-b hover:bg-muted/50">
                            <div className="col-span-2 font-mono text-sm">{s.registration_number}</div>
                            <div className="col-span-4 font-medium">{s.first_name} {s.last_name}</div>
                            <div className="col-span-2"><Badge variant="secondary">{s.class_name}</Badge></div>
                            <div className="col-span-2 text-right">
                                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(s.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-4">
                    {students.map(s => (
                        <div key={s.id} className="rounded-lg border bg-card p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-mono text-sm text-muted-foreground">{s.registration_number}</div>
                                    <div className="font-semibold mt-1">{s.first_name} {s.last_name}</div>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="secondary">{s.class_name}</Badge>
                                        <Badge variant="outline">{s.department_name}</Badge>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(s.id)}>
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Button size="icon" variant="outline" disabled={!pagination.has_previous}
                        onClick={() => setSearchParams(p => { p.set("page", "1"); return p; })}>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" disabled={!pagination.has_previous}
                        onClick={() => setSearchParams(p => { p.set("page", String(page - 1)); return p; })}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-4 text-sm">Page {page} of {pagination.total_pages}</span>
                    <Button size="icon" variant="outline" disabled={!pagination.has_next}
                        onClick={() => setSearchParams(p => { p.set("page", String(page + 1)); return p; })}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" disabled={!pagination.has_next}
                        onClick={() => setSearchParams(p => { p.set("page", String(pagination.total_pages)); return p; })}>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}