// src/features/users/components/UsersTable.tsx
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  date_joined: string;
  department?: { name: string } | null;
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
  data: User[];
  pagination: Pagination;
  search?: { term: string; has_results: boolean };
}

export default function UsersTable({ role }: { role?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const urlSearch = searchParams.get("search") || "";
  const urlPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const urlPageSize = Number(searchParams.get("page_size")) || 20;

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [page, setPage] = useState(urlPage);
  const [pageSize, setPageSize] = useState(urlPageSize);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (searchInput.trim()) {
          newParams.set("search", searchInput.trim());
          newParams.set("page", "1");
        } else {
          newParams.delete("search");
        }
        return newParams;
      });
    }, 400);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchInput]);

  // Sync page & pageSize to URL
  useEffect(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", page.toString());
      newParams.set("page_size", pageSize.toString());
      return newParams;
    });
  }, [page, pageSize, setSearchParams]);

  const { data: response, isLoading, isFetching } = useQuery<ApiResponse>({
    queryKey: ["users", role, urlSearch, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ordering: "-date_joined",
      });
      if (role) params.append("type", role);
      if (urlSearch) params.append("search", urlSearch);

      const res = await api.get(`/users/?${params.toString()}`);
      return res.data as ApiResponse; // Safe: your backend returns exact shape
    },
    placeholderData: previousData => previousData || undefined,
  });

  const users = response?.data ?? [];
  const pagination = response?.pagination;

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}/`);
    },
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to delete user"),
  });

  return (
    <div className="space-y-6">
      {/* Search + Clear */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
          {isFetching && urlSearch && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        {(urlSearch || page > 1) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setPage(1);
              setSearchParams(new URLSearchParams({ page_size: pageSize.toString() }));
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && users.length === 0 && (
        <Card className="p-16 text-center">
          <p className="text-xl text-muted-foreground">
            {urlSearch ? `No users found for "${urlSearch}"` : "No users in this category"}
          </p>
        </Card>
      )}

      {/* Table - Desktop */}
      {!isLoading && users.length > 0 && (
        <>
          <div className="hidden lg:block rounded-lg border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/50">
                    <td className="p-4 font-medium">{user.first_name} {user.last_name}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                    </td>
                    <td className="p-4">{user.department?.name || "-"}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(user.date_joined), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(user.id)}
                        disabled={deleteMutation.isPending}
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
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">{user.role}</Badge>
                      {user.department && <Badge variant="outline" className="text-xs">{user.department.name}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {format(new Date(user.date_joined), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(user.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, pagination.total_count)} of {pagination.total_count} users
          </div>

          <div className="flex items-center gap-3">
            <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
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
              <Button size="icon" variant="outline" onClick={() => setPage(1)} disabled={!pagination.has_previous}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setPage(page - 1)} disabled={!pagination.has_previous}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm font-medium">Page {page} / {pagination.total_pages}</span>
              <Button size="icon" variant="outline" onClick={() => setPage(page + 1)} disabled={!pagination.has_next}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setPage(pagination.total_pages)} disabled={!pagination.has_next}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}