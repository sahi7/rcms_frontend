// src/features/users/components/CreateUserDialog.tsx
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useReferenceData } from "@/features/settings/subjects/hooks/useReferenceData";
import { useSubjects } from "@/features/settings/subjects/hooks/useSubjects";

// ── Schemas ─────────────────────────────────────
const teacherSchema = z.object({
  email: z.string().email("Invalid email"),
  first_name: z.string().min(2, "Too short"),
  last_name: z.string().min(2, "Too short"),
  department_id: z.number(),
  subject_ids: z.array(z.number()).min(1, "Select at least one subject"),
});

const studentSchema = z.object({
  first_name: z.string().min(2, "Too short"),
  last_name: z.string().min(2, "Too short"),
  email: z.string().email().optional().or(z.literal("")),
  registration_number: z.string().optional(),
  department_name: z.string().min(1, "Select department"),
  class_name: z.string().min(1, "Select class"),
  graduated: z.boolean().optional(),
});

type TeacherForm = z.infer<typeof teacherSchema>;
type StudentForm = z.infer<typeof studentSchema>;

// ── Component ───────────────────────────────────
export default function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { data: ref } = useReferenceData();
  const [role, setRole] = useState<"teacher" | "student">("teacher");

  const schema = role === "teacher" ? teacherSchema : studentSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TeacherForm | StudentForm>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    reset();
  }, [role, reset]);

  const selectedDeptId = watch("department_id");
  const selectedSubjects = (watch("subject_ids") as number[] | undefined) || [];

  const onSubmit = async (data: TeacherForm | StudentForm) => {
    try {
      if (role === "teacher") {
        const payload = {
          role: "teacher",
          email: (data as TeacherForm).email,
          first_name: data.first_name,
          last_name: data.last_name,
          department_id: (data as TeacherForm).department_id,
          subject_ids: (data as TeacherForm).subject_ids,
        };
        await api.post("/auth/register/", payload);
        toast.success("Teacher created! Temporary password sent to their email.");
      } else {
        const payload = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: (data as StudentForm).email || undefined,
          registration_number: (data as StudentForm).registration_number || undefined,
          department_name: (data as StudentForm).department_name,
          class_name: (data as StudentForm).class_name,
          graduated: !!(data as StudentForm).graduated,
        };
        await api.post("/student/create/", payload);
        toast.success("Student created successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Role */}
          <div>
            <Label>User Type</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input {...register("first_name")} />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label>Last Name</Label>
              <Input {...register("last_name")} />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* ── TEACHER ONLY ── */}
          {role === "teacher" && ref && (
            <>
              <div>
                <Label>Email (required)</Label>
                <Input type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label>Department</Label>
                <Controller
                  control={control}
                  name="department_id"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {field.value
                            ? ref.departments.find((d: any) => d.id === field.value)?.name
                            : "Select department"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search..." />
                          <CommandEmpty>No department found.</CommandEmpty>
                          <CommandGroup>
                            {ref.departments.map((dept: any) => (
                              <CommandItem
                                key={dept.id}
                                onSelect={() => field.onChange(dept.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === dept.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {dept.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {"department_id" in errors && (
                  <p className="text-sm text-destructive">Department required</p>
                )}
              </div>

              <div>
                <Label>Subjects</Label>
                <Controller
                  control={control}
                  name="subject_ids"
                  render={({ field }) => {
                    const { data: subjects = [], isLoading } = useSubjects();

                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
                            {isLoading
                              ? "Loading subjects..."
                              : field.value?.length
                                ? `${field.value.length} selected`
                                : "Select subjects..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search subjects..." />
                            <CommandEmpty>
                              {isLoading ? "Loading..." : "No subjects found"}
                            </CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {subjects.map((sub) => (
                                <CommandItem
                                  key={sub.id}
                                  onSelect={() => {
                                    const newVal = field.value?.includes(sub.id)
                                      ? field.value.filter((id: number) => id !== sub.id)
                                      : [...(field.value || []), sub.id];
                                    field.onChange(newVal);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(sub.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {sub.name} ({sub.code})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                {"subject_ids" in errors && (
                  <p className="text-sm text-destructive">
                    {(errors as any).subject_ids?.message || "Select at least one subject"}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── STUDENT ONLY ── */}
          {role === "student" && ref && (
            <>
              <div>
                <Label>Email (optional)</Label>
                <Input type="email" {...register("email")} />
              </div>

              <div>
                <Label>Registration Number (optional)</Label>
                <Input {...register("registration_number")} />
              </div>

              <div>
                <Label>Department</Label>
                <Controller
                  control={control}
                  name="department_name"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {ref.departments.map((d: any) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {"department_name" in errors && (
                  <p className="text-sm text-destructive">Department required</p>
                )}
              </div>

              <div>
                <Label>Class</Label>
                <Controller
                  control={control}
                  name="class_name"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {ref.classrooms.map((c: any) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {"class_name" in errors && (
                  <p className="text-sm text-destructive">Class required</p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : `Create ${role === "teacher" ? "Teacher" : "Student"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}