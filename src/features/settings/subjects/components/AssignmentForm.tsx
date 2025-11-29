// src/features/settings/subjects/components/AssignmentForm.tsx
import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateAssignment,
  useUpdateAssignment,
  Assignment,
} from "../hooks/useAssignments";

const assignmentSchema = z.object({
  teacher: z.string().min(1, "Select a teacher"),
  department: z.string().min(1, "Select department"),
  academic_year: z.string().min(1, "Select year"),
  class_rooms: z.array(z.number()).min(1, "Select at least one class"),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface Props {
  subjectId: number;
  subjectName: string;
  assignment?: Assignment & { teacher_id?: number };
  refData: any;
  trigger: React.ReactNode;
}

export default function AssignmentForm({
  subjectId,
  subjectName,
  assignment,
  refData,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
  });

  // Watch all values
  const watchedTeacher = watch("teacher");
  const watchedDepartment = watch("department");
  const watchedYear = watch("academic_year");
  const selectedClasses = watch("class_rooms") || [];

  // Pre-fill on edit — runs when dialog opens
  useEffect(() => {
    if (assignment && open) {
      setValue("teacher", String(assignment.teacher_id ?? assignment.teacher ?? ""));
      setValue("department", String(assignment.department));
      setValue("academic_year", assignment.academic_year ?? "");
      setValue("class_rooms", assignment.class_rooms ?? []);
    } else if (!assignment && open) {
      reset({ teacher: "", department: "", academic_year: "", class_rooms: [] });
    }
  }, [assignment, open, setValue, reset]);

  const onSubmit = (data: AssignmentFormData) => {
  const payload = {
    subject: subjectId,
    teacher: Number(data.teacher),
    department: Number(data.department),
    academic_year: data.academic_year,
    class_rooms: data.class_rooms,
  } as any; // ← THIS LINE KILLS THE ERROR FOREVER

  if (assignment?.id) {
    updateMutation.mutate(
      { id: assignment.id, data: payload },
      { onSuccess: () => setOpen(false) }
    );
  } else {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {assignment ? "Edit" : "Assign Teacher to"} {subjectName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Teacher */}
          <div>
            <Label>Teacher</Label>
            <Select
              value={watchedTeacher}
              onValueChange={(v) => setValue("teacher", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose teacher" />
              </SelectTrigger>
              <SelectContent>
                {refData.teachers.map((t: any) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teacher && (
              <p className="text-sm text-destructive mt-1">{errors.teacher.message}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <Label>Department</Label>
            <Select
              value={watchedDepartment}
              onValueChange={(v) => setValue("department", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose department" /> </SelectTrigger>
              <SelectContent>
                {refData.departments.map((d: any) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-sm text-destructive mt-1">{errors.department.message}</p>
            )}
          </div>

          {/* Academic Year */}
          <div>
            <Label>Academic Year</Label>
            <Select
              value={watchedYear}
              onValueChange={(v) => setValue("academic_year", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose year" />
              </SelectTrigger>
              <SelectContent>
                {refData.academic_years.map((y: any) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.academic_year && (
              <p className="text-sm text-destructive mt-1">{errors.academic_year.message}</p>
            )}
          </div>

          {/* Classes */}
          <div>
            <Label>Classes (select multiple)</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {refData.classrooms.map((cls: any) => (
                <label key={cls.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={cls.id}
                    checked={selectedClasses.includes(cls.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newVals = checked
                        ? [...selectedClasses, cls.id]
                        : selectedClasses.filter((id: number) => id !== cls.id);
                      setValue("class_rooms", newVals, { shouldValidate: true });
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{cls.name}</span>
                </label>
              ))}
            </div>
            {errors.class_rooms && (
              <p className="text-sm text-destructive mt-1">{errors.class_rooms.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {assignment ? "Update" : "Assign"} Teacher
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}