import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { Loader2Icon, CameraIcon, CalendarIcon, ShieldIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
// import { Separator } from '@/components/ui/Separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useProfile,
  useUpdateProfile,
  ProfilePayload,
} from '../hooks/useProfile'
import { useFileUpload } from '@/hooks/shared/useFileUpload'
import { useRoleType } from '@/hooks/shared/useUsers'
import { toSentenceCase } from '@/app/store/institutionConfigStore';

export function ProfilePage() {
  const { data: user, isLoading } = useProfile()
  const updateMutation = useUpdateProfile()
  const { upload, isUploading } = useFileUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<ProfilePayload>({})
  const [hasChanges, setHasChanges] = useState(false)

  const { roleType } = useRoleType(user?.role) // Resolve role_type from role(id)
  // const { userMe: user } = useAuthStore();
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number || '',
        place_of_birth: user.place_of_birth || '',
        date_of_birth: user.date_of_birth || '',
        initials: user.initials || '',
        profile_picture: user.profile_picture || '',
      })
      setHasChanges(false)
    }
  }, [user])
  const updateField = <K extends keyof ProfilePayload>(
    key: K,
    value: ProfilePayload[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
    setHasChanges(true)
  }
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await upload(file, 'internal')
      updateField('profile_picture', result.publicUrl)
      toast.success('Profile picture uploaded')
    } catch {
      toast.error('Failed to upload profile picture')
    }
  }
  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(form);
      setHasChanges(false);
      toast.success('Profile updated');
    } catch (error: any) {
      // Extract all error messages from the response
      const errors = error.response?.data;
      if (errors) {
        // Flatten all error messages into a single string
        const messages = Object.values(errors).flat().join('\n');
        toast.error(messages);
      } else {
        toast.error('Failed to update profile');
      }
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }
  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : '?'
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <Avatar size="lg" className="w-20 h-20">
                <AvatarImage
                  src={form.profile_picture || undefined}
                  alt="Profile"
                />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isUploading ? (
                  <Loader2Icon className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <CameraIcon className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-800">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldIcon className="w-3 h-3" />
                  {roleType ? toSentenceCase(roleType ?? 'User').replace('_', ' ') : 'User'}
                </Badge>
                {user?.enrollment_status && (
                  <Badge variant="outline">{user.enrollment_status}</Badge>
                )}
                {user?.username && (
                  <span className="text-xs text-slate-400">
                    @{user.username}
                  </span>
                )}
              </div>
            </div>
            {user?.date_joined && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarIcon className="w-3.5 h-3.5" />
                Joined {new Date(user.date_joined).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editable Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                placeholder="Enter first name"
                value={form.first_name || ''}
                onChange={(e) => updateField('first_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                placeholder="Enter last name"
                value={form.last_name || ''}
                onChange={(e) => updateField('last_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={form.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                placeholder="Enter phone number"
                value={form.phone_number || ''}
                onChange={(e) => updateField('phone_number', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                placeholder="Select date of birth"
                value={form.date_of_birth || ''}
                onChange={(e) => updateField('date_of_birth', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="place_of_birth">Place of Birth</Label>
              <Input
                id="place_of_birth"
                placeholder="Enter place of birth"
                value={form.place_of_birth || ''}
                onChange={(e) => updateField('place_of_birth', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="initials">Initials</Label>
              <Input
                id="initials"
                placeholder="e.g. JD"
                value={form.initials || ''}
                onChange={(e) => updateField('initials', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  )
}
