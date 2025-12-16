// src/features/users/components/UserFormDialog.tsx

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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useReferenceData } from "@/features/settings/subjects/hooks/useReferenceData";
import { useSubjects } from "@/features/settings/subjects/hooks/useSubjects";

// ── Extended Schemas with new fields ─────────────────────────────────────
const baseSchema = z.object({
  first_name: z.string().min(2, "Too short"),
  last_name: z.string().min(2, "Too short"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  date_of_birth: z.date().optional(),
  place_of_birth: z.string().optional(),
  phone_number: z.string().optional(),
  emergency_contact: z.string().optional(),
  enrollment_status: z.string().optional(),
  initials: z.string().optional(),
});

const teacherSchema = baseSchema.extend({
  department_id: z.number().optional(),
  subject_ids: z.array(z.number()).min(1, "Select at least one subject"),
});

const studentSchema = baseSchema.extend({
  registration_number: z.string().optional(),
  department_name: z.string().min(1, "Select department"),
  class_name: z.string().min(1, "Select class"),
});

type TeacherForm = z.infer<typeof teacherSchema>;
type StudentForm = z.infer<typeof studentSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
}

export default function UserFormDialog({ open, onOpenChange, user }: Props) {
  const queryClient = useQueryClient();
  const { data: ref } = useReferenceData();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();

  const isEdit = !!user;
  const initialRole = user?.role || "teacher";
  const [role, setRole] = useState<"teacher" | "student">(initialRole);

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

  // Prefill form
  useEffect(() => {
    if (!open) return;

    if (isEdit && user) {
      setRole(user.role);

      // const subjectIds = user.taught_subjects?.map((s: any) => s.id) || [];
      const deptId = user.department ? Number(user.department) : undefined;
      const subjectIds = user.taught_subjects ? Array.isArray(user.taught_subjects)
        ? user.taught_subjects.map((s: any) => typeof s === "object" ? s.id : s)
        : user.teacher_subjects || [] : [];

      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth) : undefined,
        place_of_birth: user.place_of_birth || "",
        phone_number: user.phone_number || "",
        emergency_contact: user.emergency_contact || "",
        enrollment_status: user.enrollment_status || "",
        initials: user.initials || "",
        // Teacher
        department_id: deptId,
        subject_ids: subjectIds,
        // Student
        registration_number: user.registration_number || "",
        department_name: user.department_name || "",
        class_name: user.class_name || "",
      });
    } else {
      setRole("teacher");
      reset();
    }
  }, [open, user, isEdit, reset, setValue]);

  const onSubmit = async (data: TeacherForm | StudentForm) => {
    try {
      // ── COMMON FIELDS (shared across all modes) ──
      const commonFields = {
        first_name: data.first_name,
        last_name: data.last_name,
        initials: data.initials || null,
        email: data.email || null,
        date_of_birth: data.date_of_birth ? format(data.date_of_birth, "yyyy-MM-dd") : null,
        place_of_birth: data.place_of_birth || null,
        phone_number: data.phone_number || null,
        emergency_contact: data.emergency_contact || null,
        enrollment_status: data.enrollment_status || null,
      };

      if (isEdit) {
        // ── EDIT MODE ──
        if (role === "teacher") {
          await api.patch(`/users/${user.id}/`, {
            ...commonFields,
            department: (data as TeacherForm).department_id,
            taught_subjects: (data as TeacherForm).subject_ids,
          });
          toast.success("Teacher updated successfully");
        } else {
          // Student edit
          await api.post("/student/create/", {
            update: true,
            id: user.id,
            ...commonFields,
            registration_number: (data as StudentForm).registration_number || null,
            department_name: (data as StudentForm).department_name,
            class_name: (data as StudentForm).class_name,
          });
          toast.success("Student updated successfully");
        }
      } else {
        // ── CREATE MODE ──
        if (role === "teacher") {
          await api.post("/auth/register/", {
            role: "teacher",
            ...commonFields,
            department_id: (data as TeacherForm).department_id,
            subject_ids: (data as TeacherForm).subject_ids,
          });
          toast.success("Teacher created! Password sent via email.");
        } else {
          await api.post("/student/create/", {
            ...commonFields,
            registration_number: (data as StudentForm).registration_number || null,
            department_name: (data as StudentForm).department_name,
            class_name: (data as StudentForm).class_name,
          });
          toast.success("Student created successfully!");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Operation failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selector */}
          <div>
            <Label>User Type</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)} disabled={isEdit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input {...register("first_name")} />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input {...register("last_name")} />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
            </div>
            {role === "teacher" && (
              <div className="space-y-2">
                <Label>Initials (optional)</Label>
                <Input
                  {...register("initials")}
                  placeholder="e.g. JKD"
                />
                {errors.initials && (
                  <p className="text-sm text-destructive">{errors.initials.message}</p>
                )}
              </div>)}

            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Controller
                control={control}
                name="date_of_birth"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Place of Birth</Label>
              <Input {...register("place_of_birth")} />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input {...register("phone_number")} />
            </div>

            <div className="space-y-2">
              <Label>{role === "student" ? "Gaurdian/Parent Address " : "Emergency Contact"}</Label>
              <Input {...register("emergency_contact")} />
              <p className="text-xs text-muted-foreground">Format: Phone - Address</p>
            </div>

            {isEdit && (
              <div className="space-y-2">
                <Label>Enrollment Status</Label>
                <Select onValueChange={(v) => setValue("enrollment_status", v)} value={watch("enrollment_status")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="abandoned">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Email {role === "student" ? "" : "(required)"}</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>


          {/* ── TEACHER FIELDS ── */}
          {role === "teacher" && (
            <>
              <div>
                <Label>Department</Label>
                <Controller
                  control={control}
                  name="department_id"
                  render={({ field }) => (
                    <Popover>
                      {/* <div className="text-xs text-gray-500">
                        Debug: field.value={field.value}, depts={ref?.departments?.length}
                      </div> */}
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {field.value && ref?.departments
                            ? ref.departments.find((d: any) => d.id === field.value)?.name || "Select department"
                            : "Select department"}

                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search department..." />
                          <CommandEmpty>No department found.</CommandEmpty>
                          <CommandGroup>
                            {ref?.departments.map((dept: any) => (
                              <CommandItem
                                key={dept.id}
                                onSelect={() => field.onChange(dept.id)}
                              >
                                <Check className={cn("mr-2 h-4 w-4", field.value === dept.id ? "opacity-100" : "opacity-0")} />
                                {dept.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div>
                <Label>Subjects</Label>
                <Controller
                  control={control}
                  name="subject_ids"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between" disabled={subjectsLoading}>
                          {subjectsLoading
                            ? "Loading..."
                            : watch("subject_ids")?.length
                              ? `${watch("subject_ids").length} selected`
                              : "Select subjects..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search subjects..." />
                          <CommandEmpty>No subjects found</CommandEmpty>
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
                                <Check className={cn("mr-2 h-4 w-4", field.value?.includes(sub.id) ? "opacity-100" : "opacity-0")} />
                                {sub.name} ({sub.code})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </>
          )}

          {/* ── STUDENT FIELDS ── */}
          {role === "student" && ref && (
            <>
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
                          <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
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
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Update User" : `Create ${role === "teacher" ? "Teacher" : "Student"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}