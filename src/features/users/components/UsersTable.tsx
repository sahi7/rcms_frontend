// src/features/users/components/UsersTable.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { useUsers } from "../hooks/useUsers";
import { useReferenceData } from "@/features/settings/subjects/hooks/useReferenceData";

interface Props {
  role?: "teacher" | "student" | "parent" | null;
  showFilters?: boolean;
}

export default function UsersTable({ role, showFilters = false }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: ref, isLoading: refLoading } = useReferenceData();

  // URL params

  const urlSearch = searchParams.get("search") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Number(searchParams.get("page_size")) || 20;
  const departmentFilter = searchParams.get("department") || "";
  const classFilter = searchParams.get("class") || "";
  const yearFilter = searchParams.get("academic_year") || "";

  // Local search input (controlled by user typing)
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch] = useDebounce(searchInput, 500);

  // Sync debounced search → URL
  useEffect(() => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (debouncedSearch.trim()) {
        p.set("search", debouncedSearch.trim());
        p.set("page", "1");
      } else {
        p.delete("search");
      }
      return p;
    });
  }, [debouncedSearch, setSearchParams]);
  
  useEffect(() => {
    if (!ref || yearFilter) return;

    const currentYear = ref.academic_years.find((y: any) => y.is_current);
    const yearToSelect = currentYear || ref.academic_years[0];

    if (yearToSelect) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("academic_year", String(yearToSelect.id));
        p.set("page", "1");
        return p;
      });
    }
  }, [ref, yearFilter, setSearchParams]);

  const { data, isLoading, isFetching, deleteUser, isDeleting } = useUsers({
    role,
    search: debouncedSearch || undefined,
    page,
    pageSize,
    department: departmentFilter || undefined,
    classId: classFilter || undefined,
    academicYear: yearFilter || undefined,
  });

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const updateFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (value && value !== "all") p.set(key, value);
      else p.delete(key);
      p.set("page", "1");
      return p;
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete("search");
      p.delete("department");
      p.delete("class");
      p.delete("academic_year");
      p.set("page", "1");
      return p;
    });
  };

  // Loading state
  if (isLoading || refLoading) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* SEARCH — ALWAYS VISIBLE */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, registration number..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10"
        />
        {isFetching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>

      {/* FILTERS — Desktop */}
      {showFilters && ref && (
        <div className="hidden md:flex flex-wrap gap-3">
          {/* Class Filter */}
          <Select value={classFilter || "all"} onValueChange={(v) => updateFilter("class", v === "all" ? "" : v)}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {classFilter
                  ? ref.classrooms.find((c: any) => String(c.id) === classFilter)?.name || "Class"
                  : "All Classes"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {ref.classrooms.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Department Filter */}
          <Select value={departmentFilter || "all"} onValueChange={(v) => updateFilter("department", v === "all" ? "" : v)}>
            <SelectTrigger className="w-56">
              <SelectValue>
                {departmentFilter
                  ? ref.departments.find((d: any) => String(d.id) === departmentFilter)?.name || "Department"
                  : "All Departments"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {ref.departments.map((d: any) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Academic Year Filter */}
          <Select value={yearFilter || "all"} onValueChange={(v) => updateFilter("academic_year", v === "all" ? "" : v)}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {yearFilter
                  ? ref.academic_years.find((y: any) => String(y.id) === yearFilter)?.name || "Year"
                  : "All Years"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {ref.academic_years.map((y: any) => (
                <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* MOBILE FILTER SHEET */}
      {showFilters && ref && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden w-full justify-start">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {(classFilter || departmentFilter || yearFilter) && (
                <span className="ml-2 text-primary font-medium">• Active</span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Filter Users</SheetTitle>
            </SheetHeader>

            <div className="space-y-6">

              {/* Class Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Class</label>
                <Select value={classFilter || "all"} onValueChange={(v) => updateFilter("class", v === "all" ? "" : v)}>
                  <SelectTrigger>
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

              {/* Department Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Select value={departmentFilter || "all"} onValueChange={(v) => updateFilter("department", v === "all" ? "" : v)}>
                  <SelectTrigger>
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

              {/* Academic Year Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Academic Year</label>
                <Select value={yearFilter || "all"} onValueChange={(v) => updateFilter("academic_year", v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {ref.academic_years.map((y: any) => (
                      <SelectItem key={y.id} value={String(y.id)}>
                        {y.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear button inside sheet */}
              {(classFilter || departmentFilter || yearFilter) && (
                <Button variant="destructive" className="w-full" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* CLEAR FILTERS BUTTON — always visible when needed */}
      {(debouncedSearch || departmentFilter || classFilter || yearFilter || page > 1) && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear all filters
        </Button>
      )}

      {/* EMPTY STATE — SEARCH BAR STAYS ALIVE */}
      {users.length === 0 && (
        <div className="text-center py-20 rounded-xl border bg-muted/30">
          <p className="text-xl text-muted-foreground mb-8">
            {debouncedSearch
              ? `No results found for "${debouncedSearch}"`
              : "No users match the current filters"}
          </p>
          <Button size="lg" onClick={clearFilters}>
            Clear filters and try again
          </Button>
        </div>
      )}

      {/* ONLY RENDER TABLE/CARDS WHEN THERE ARE USERS */}
      {users.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block rounded-lg border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {role === "student" ? (
                    <>
                      <th className="text-left p-4 font-medium">Reg No</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Class</th>
                      <th className="text-left p-4 font-medium">Department</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Department</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                    </>
                  )}
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-t hover:bg-muted/50">
                    {role === "student" ? (
                      <>
                        <td className="p-4 font-mono text-sm">{user.registration_number || "-"}</td>
                        <td className="p-4 font-medium">{user.first_name} {user.last_name}</td>
                        <td className="p-4"><Badge variant="secondary">{user.class_name}</Badge></td>
                        <td className="p-4">{user.department_name || "-"}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 font-medium">{user.first_name} {user.last_name}</td>
                        <td className="p-4 text-muted-foreground">{user.email || "-"}</td>
                        <td className="p-4"><Badge variant="secondary" className="capitalize">{user.role}</Badge></td>
                        <td className="p-4">{user.department?.name || user.department_name || "-"}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {user.date_joined ? format(new Date(user.date_joined), "MMM d, yyyy") : "-"}
                        </td>
                      </>
                    )}
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteUser(user.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {users.map((user: any) => (
              <Card key={user.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                    {role === "student" ? (
                      <>
                        <p className="text-sm text-muted-foreground">Reg: {user.registration_number}</p>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{user.class_name}</Badge>
                          <Badge variant="outline">{user.department_name}</Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                          {user.department?.name && <Badge variant="outline">{user.department.name}</Badge>}
                        </div>
                        {user.date_joined && (
                          <p className="text-xs text-muted-foreground">
                            Joined {format(new Date(user.date_joined), "MMM d, yyyy")}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteUser(user.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, pagination.total_count)} of {pagination.total_count} users
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(v) => {
                    setSearchParams((p) => {
                      p.set("page_size", v);
                      p.set("page", "1");
                      return p;
                    });
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()}>{size} per page</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setSearchParams((p) => { p.set("page", "1"); return p; })}
                    disabled={!pagination.has_previous}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setSearchParams((p) => { p.set("page", String(page - 1)); return p; })}
                    disabled={!pagination.has_previous}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-sm font-medium">
                    Page {page} / {pagination.total_pages}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setSearchParams((p) => { p.set("page", String(page + 1)); return p; })}
                    disabled={!pagination.has_next}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setSearchParams((p) => { p.set("page", String(pagination.total_pages)); return p; })}
                    disabled={!pagination.has_next}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}