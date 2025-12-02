// src/features/users/components/UserProfile/ProfileForm.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  firstname: z.string().min(2, "Too short"),
  lastname: z.string().min(2, "Too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// interface Props {
//   user: {
//     firstname: string;
//     lastname: string;
//     email: string;
//     phone: string | null;
//   };
//   onSubmit: (data: FormData) => Promise<void>;
//   isLoading: boolean;
// }
interface Props {
  user: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string | null;
  };
  onSubmit: (data: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export default function ProfileForm({ user, onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input {...register("firstname")} />
          {errors.firstname && <p className="text-sm text-destructive mt-1">{errors.firstname.message}</p>}
        </div>
        <div>
          <Label>Last Name</Label>
          <Input {...register("lastname")} />
          {errors.lastname && <p className="text-sm text-destructive mt-1">{errors.lastname.message}</p>}
        </div>
      </div>

      <div>
        <Label>Email</Label>
        <Input type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label>Phone Number (optional)</Label>
        <Input {...register("phone")} placeholder="+250..." />
      </div>

      <Button type="submit" disabled={isLoading} size="lg">
        {isLoading ? "Saving..." : "Update Profile"}
      </Button>
    </form>
  );
}