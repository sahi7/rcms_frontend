import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const schema = z.object({
  role: z.enum(["teacher", "student", "parent"]),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function CreateUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const role = watch("role");

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/auth/register/", data);
      toast.success("User created successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input {...register("first_name")} />
              {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <Label>Last Name</Label>
              <Input {...register("last_name")} />
              {errors.last_name && <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label>Role</Label>
            <Select onValueChange={(v) => register("role").onChange({ target: { value: v } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}