import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2Icon, ShieldCheckIcon, MailIcon } from 'lucide-react'
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  // isUni,
  useInstitution,
  useUpdateInstitution,
} from '../hooks/useInstitution'
import { InstitutionPayload } from '@/types/settings'


export function InstitutionSettings() {
  const { data, isLoading } = useInstitution()
  const updateMutation = useUpdateInstitution()
  const [form, setForm] = useState<InstitutionPayload>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (data) {
      setForm({
        institution_type: data.institution_type,
        code: data.code,
        identifier: data.identifier,
        max_score_default: data.max_score_default,
        passing_score: data.passing_score,
        subject_rotation: data.subject_rotation,
      })
      setHasChanges(false)
    }
  }, [data])
  const updateField = <K extends keyof InstitutionPayload>(
    key: K,
    value: InstitutionPayload[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
    setHasChanges(true)
  }
  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(form)
      toast.success('Institution settings saved')
      setHasChanges(false)
    } catch {
      toast.error('Failed to save institution settings')
    }
  }
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>
            Current status of your institution account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <ShieldCheckIcon className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">Account Status</span>
              <Badge variant={data?.is_active ? 'default' : 'destructive'}>
                {data?.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <MailIcon className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">Email Verification</span>
              <Badge
                variant={data?.is_email_verified ? 'default' : 'secondary'}
              >
                {data?.is_email_verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Institution Configuration</CardTitle>
          <CardDescription>Core settings for your institution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="institution_type">Institution Type</Label>
              <Select
                value={form.institution_type || ''}
                onValueChange={(v) => updateField('institution_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="scondary">College</SelectItem>
                  <SelectItem value="secondary">High School</SelectItem>
                  <SelectItem value="primary">Primary School</SelectItem>
                  <SelectItem value="university">Vocational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Institution Code</Label>
              <Input
                id="code"
                placeholder="e.g. UNI001"
                value={form.code || ''}
                onChange={(e) => updateField('code', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Identifier</Label>
              <Input
                id="identifier"
                placeholder="e.g. UN"
                value={form.identifier || ''}
                onChange={(e) => updateField('identifier', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject_rotation">Subject Rotation</Label>
              <Select
                value={form.subject_rotation || ''}
                onValueChange={(v) => updateField('subject_rotation', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rotation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_term">Per Term</SelectItem>
                  <SelectItem value="per_year">Per Year</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max_score_default">Max Score Default</Label>
              <Input
                id="max_score_default"
                type="number"
                placeholder="e.g. 100"
                value={form.max_score_default || ''}
                onChange={(e) =>
                  updateField('max_score_default', e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="passing_score">Passing Score</Label>
              <Input
                id="passing_score"
                type="number"
                placeholder="e.g. 50"
                value={form.passing_score || ''}
                onChange={(e) => updateField('passing_score', e.target.value)}
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
