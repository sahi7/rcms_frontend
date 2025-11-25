import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  date_joined: string;
  department?: { name: string };
}

// This matches DRF's default response format
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export default function UsersTable({ role, search }: { role?: string; search: string }) {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ["users", role, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (role) params.append("type", role);
      if (search) params.append("search", search);
      params.append("ordering", "-date_joined");

      const res = await api.get<PaginatedResponse>(`/users/?${params}`);
      return res.data;
    },
  });

  const users = response?.results ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}/`);
    },
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-20 w-full rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        No users found
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block rounded-lg border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Department</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-muted/50">
                <td className="p-4 font-medium">
                  {user.first_name} {user.last_name}
                </td>
                <td className="p-4 text-muted-foreground">{user.email}</td>
                <td className="p-4">
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                </td>
                <td className="p-4">{user.department?.name || "-"}</td>
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
              <div className="space-y-2">
                <h3 className="font-semibold">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                  {user.department && (
                    <Badge variant="outline" className="text-xs">
                      {user.department.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Joined {format(new Date(user.date_joined), "MMM d, yyyy")}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteMutation.mutate(user.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}