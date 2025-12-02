// src/features/users/components/UserProfile/UserProfilePage.tsx

import { useUserProfile } from "./useUserProfile";
import ProfileHeader from "./ProfileHeader";
import ProfileForm from "./ProfileForm";
import TeacherScopeCard from "./TeacherScopeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function UserProfilePage() {
  const {
    me,
    scope,
    loadingMe,
    loadingScope,
    updateProfile,
    isUpdating,
  } = useUserProfile();

  // Loading state
  if (loadingMe) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-10">
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  // Error / no user
  if (!me) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-lg">Failed to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-10">
      {/* Header with avatar and name */}
      <ProfileHeader user={me} />

      {/* Editable personal info */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
        <ProfileForm
          user={me}
          onSubmit={updateProfile}
          isLoading={isUpdating}
        />
      </div>

      {/* Teaching Scope — only for teachers */}
      {me.role === "teacher" && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Teaching Scope</h2>
          {loadingScope ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : scope ? (
            <TeacherScopeCard scope={scope} />
          ) : (
            <p className="text-muted-foreground">No teaching assignments found.</p>
          )}
        </div>
      )}
    </div>
  );
}