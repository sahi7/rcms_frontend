// src/features/users/components/UserProfile/UserProfilePage.tsx

import { useUserProfile } from "./useUserProfile";
import ProfileHeader from "./ProfileHeader";
import ProfileForm from "./ProfileForm";
import TeacherScopeCard from "./TeacherScopeCard";
import ChangePasswordPage from "@/features/auth/ChangePasswordPage";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, UserCog } from "lucide-react";

export default function UserProfilePage() {
  const {
    me,
    scope,
    loadingMe,
    loadingScope,
    updateProfile,
    isUpdating,
  } = useUserProfile();

  if (loadingMe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
          {me?.role === "teacher" && <Skeleton className="h-80 rounded-3xl" />}
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold">Profile not found</h2>
          <p className="text-muted-foreground">Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-16">

        {/* Header */}
        <ProfileHeader user={me} />

        {/* Personal Information */}
        <section className="rounded-3xl bg-card/95 backdrop-blur border shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-8 py-6 border-b">
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <UserCog className="h-7 w-7 text-primary" />
              Personal Information
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Update your name, email, and contact details
            </p>
          </div>
          <div className="p-8 lg:p-10">
            <ProfileForm user={me} onSubmit={updateProfile} isLoading={isUpdating} />
          </div>
        </section>

        {/* Teaching Scope - Only for Teachers */}
        {me.role === "teacher" && (
          <section className="rounded-3xl bg-card/95 backdrop-blur border shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-primary/90 px-8 py-6 text-primary-foreground">
              <h2 className="text-2xl font-bold">Teaching Scope</h2>
              <p className="mt-1 text-sm opacity-90">Your current assignments across classes</p>
            </div>
            <div className="p-8">
              {loadingScope ? (
                <div className="space-y-6">
                  <Skeleton className="h-32 rounded-2xl" />
                  <Skeleton className="h-40 rounded-2xl" />
                </div>
              ) : scope ? (
                <TeacherScopeCard scope={scope} />
              ) : (
                <p className="text-center py-12 text-muted-foreground">
                  No teaching assignments found
                </p>
              )}
            </div>
          </section>
        )}

        {/* Change Password - Clean, no card wrapper */}
        <section>
          <ChangePasswordPage />
        </section>

      </div>
    </div>
  );
}