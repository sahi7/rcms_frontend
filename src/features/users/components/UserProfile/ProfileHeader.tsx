// src/features/users/components/UserProfile/ProfileHeader.tsx

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface Props {
  user: {
    firstname: string;
    lastname: string;
    email: string;
    role: string;
  };
}

export default function ProfileHeader({ user }: Props) {
  const initials = `${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.toUpperCase();

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-24 w-24 text-2xl">
        <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
          {initials || <User className="h-12 w-12" />}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-3xl font-bold">
          {user.firstname} {user.lastname}
        </h1>
        <p className="text-lg text-muted-foreground capitalize">{user.role}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
}