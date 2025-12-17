// src/features/settings/subjects/components/SubjectForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateSubject, useUpdateSubject, Subject } from "../hooks/useSubjects";
import { useReferenceData } from "../hooks/useReferenceData";
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
import { useState } from "react";

const subjectSchema = z.object({
  name: z.string().min(2, "Name too short"),
  code: z.string().min(2, "Code required"),
  coefficient: z.string().regex(/^\d+(\.\d+)?$/, "Invalid number"),
  max_score: z.string().regex(/^\d+(\.\d+)?$/, "Invalid number"),
  departments: z.array(z.number()).min(1, "Select at least one department"),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface Props {
  subject?: Subject;
  mode: "create" | "edit";
  trigger: React.ReactNode;
}

export default function SubjectForm({ subject, mode, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null); // ← Show backend error

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  
  const { data: ref, isError: refError, error: refErrorData } = useReferenceData();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: subject
      ? {
          name: subject.name,
          code: subject.code,
          coefficient: String(subject.coefficient),
          max_score: String(subject.max_score),
          departments: subject.departments,
        }
      : { departments: [] },
  });

  const selectedDepts = watch("departments") || [];

  const onSubmit = (data: SubjectFormData) => {
    setSubmitError(null); // clear previous error

    const payload = {
      ...data,
      coefficient: String(data.coefficient),
      max_score: String(data.max_score),
    };

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
        onError: (error: any) => {
          setSubmitError(error?.response?.data?.detail || "Failed to create subject");
        },
      });
    } else {
      updateMutation.mutate(
        { id: subject!.id, data: payload },
        {
          onSuccess: () => setOpen(false),
          onError: (error: any) => {
            setSubmitError(error?.response?.data?.detail || "Failed to update subject");
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Subject" : "Edit Subject"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Backend error message */}
          {submitError && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
              {submitError}
            </div>
          )}

          <div>
            <Label>Subject Name</Label>
            <Input {...register("name")} placeholder="e.g. Mathematics" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Code</Label>
              <Input {...register("code")} placeholder="MATH101" />
              {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <Label>Coefficient</Label>
              <Input {...register("coefficient")} placeholder="3.00" />
              {errors.coefficient && <p className="text-sm text-destructive mt-1">{errors.coefficient.message}</p>}
            </div>
            <div>
              <Label>Max Score</Label>
              <Input {...register("max_score")} placeholder="20.00" />
              {errors.max_score && <p className="text-sm text-destructive mt-1">{errors.max_score.message}</p>}
            </div>
          </div>

          {/* Departments with error handling */}
          <div>
            <Label>Departments</Label>
            {refError ? (
              <div className="text-destructive text-sm mt-1">
                Failed to load departments{(refErrorData as any)?.message && `: ${(refErrorData as any).message}`}
              </div>
            ) : (
              <Popover open={deptOpen} onOpenChange={setDeptOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {selectedDepts.length === 0
                      ? "Select departments..."
                      : `${selectedDepts.length} selected`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search department..." />
                    <CommandEmpty>No department found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {ref?.departments.map((dept) => (
                        <CommandItem
                          key={dept.id}
                          onSelect={() => {
                            const newVals = selectedDepts.includes(dept.id)
                              ? selectedDepts.filter((d) => d !== dept.id)
                              : [...selectedDepts, dept.id];
                            setValue("departments", newVals, { shouldValidate: true });
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDepts.includes(dept.id) ? "opacity-100" : "opacity-0"
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
            {errors.departments && <p className="text-sm text-destructive mt-1">{errors.departments.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {mode === "create" ? "Create" : "Update"} Subject
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}