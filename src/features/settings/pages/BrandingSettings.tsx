import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { UploadIcon, Loader2Icon, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useBrandingSettings,
  useUpdateBrandingSettings,
} from '../hooks/useSettings'
import { useFileUpload } from '@/hooks/shared/useFileUpload'
import { BrandingSettingsPayload } from '@/types/settings'
interface ColorPickerFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  id: string
}
function ColorPickerField({
  label,
  value,
  onChange,
  id,
}: ColorPickerFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <label
            htmlFor={id}
            className="block w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer hover:border-slate-300 transition-colors shadow-sm"
            style={{
              backgroundColor: value,
            }}
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-32 font-mono text-sm"
        />
      </div>
    </div>
  )
}
interface LogoUploadProps {
  label: string
  currentUrl: string | null
  onUploaded: (url: string) => void
}
function LogoUpload({ label, currentUrl, onUploaded }: LogoUploadProps) {
  const { upload, isUploading } = useFileUpload()
  const inputRef = useRef<HTMLInputElement>(null)
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await upload(file, 'internal')
      onUploaded(result.publicUrl)
      toast.success(`${label} uploaded successfully`)
    } catch {
      toast.error(`Failed to upload ${label.toLowerCase()}`)
    }
  }
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50/50 transition-all group"
      >
        {isUploading ? (
          <Loader2Icon className="w-8 h-8 animate-spin text-slate-400" />
        ) : currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="max-h-28 max-w-full object-contain rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-slate-500 transition-colors">
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm font-medium">Click to upload</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  )
}
export function BrandingSettings() {
  const { data, isLoading } = useBrandingSettings()
  const updateMutation = useUpdateBrandingSettings()
  const [form, setForm] = useState<BrandingSettingsPayload>({})
  const [hasChanges, setHasChanges] = useState(false)
  useEffect(() => {
    if (data) {
      setForm({
        logo: data.logo,
        logo_dark: data.logo_dark,
        school_name: data.school_name,
        short_name: data.short_name,
        motto: data.motto,
        address: data.address,
        phone: data.phone,
        phone2: data.phone2,
        email: data.email,
        website: data.website,
        primary_color: data.primary_color,
        primary_dark: data.primary_dark,
        accent_color: data.accent_color,
        report_card_header_color: data.report_card_header_color,
        report_card_border_color: data.report_card_border_color,
        grade_a_color: data.grade_a_color,
        grade_f_color: data.grade_f_color,
        pdf_footer_text: data.pdf_footer_text,
      })
      setHasChanges(false)
    }
  }, [data])
  const updateField = <K extends keyof BrandingSettingsPayload>(
    key: K,
    value: BrandingSettingsPayload[K],
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
      toast.success('Branding settings saved')
      setHasChanges(false)
    } catch {
      toast.error('Failed to save branding settings')
    }
  }
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Logos */}
      <Card>
        <CardHeader>
          <CardTitle>Logos</CardTitle>
          <CardDescription>
            Upload your institution's logos for light and dark themes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LogoUpload
              label="Logo (Light)"
              currentUrl={form.logo || null}
              onUploaded={(url) => updateField('logo', url)}
            />
            <LogoUpload
              label="Logo (Dark)"
              currentUrl={form.logo_dark || null}
              onUploaded={(url) => updateField('logo_dark', url)}
            />
          </div>
        </CardContent>
      </Card>

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Basic details about your institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="school_name">School Name</Label>
              <Input
                id="school_name"
                placeholder="e.g. Gambi Chambers"
                value={form.school_name || ''}
                onChange={(e) => updateField('school_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="short_name">Short Name</Label>
              <Input
                id="short_name"
                placeholder="e.g. GCB"
                value={form.short_name || ''}
                onChange={(e) => updateField('short_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="motto">Motto</Label>
              <Input
                id="motto"
                placeholder="Enter institution motto"
                value={form.motto || ''}
                onChange={(e) => updateField('motto', e.target.value)}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter institution address"
                value={form.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="e.g. 685741252"
                value={form.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone2">Phone 2</Label>
              <Input
                id="phone2"
                placeholder="Secondary phone number"
                value={form.phone2 || ''}
                onChange={(e) => updateField('phone2', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. info@school.com"
                value={form.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="e.g. https://school.com"
                value={form.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>
            Customize the color scheme used across the platform and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Primary Colors
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ColorPickerField
                  id="primary_color"
                  label="Primary"
                  value={form.primary_color || '#1a56db'}
                  onChange={(v) => updateField('primary_color', v)}
                />
                <ColorPickerField
                  id="primary_dark"
                  label="Primary Dark"
                  value={form.primary_dark || '#163d80'}
                  onChange={(v) => updateField('primary_dark', v)}
                />
                <ColorPickerField
                  id="accent_color"
                  label="Accent"
                  value={form.accent_color || '#10b981'}
                  onChange={(v) => updateField('accent_color', v)}
                />
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Report Card Colors
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ColorPickerField
                  id="report_card_header_color"
                  label="Header"
                  value={form.report_card_header_color || '#1e40af'}
                  onChange={(v) => updateField('report_card_header_color', v)}
                />
                <ColorPickerField
                  id="report_card_border_color"
                  label="Border"
                  value={form.report_card_border_color || '#1e40af'}
                  onChange={(v) => updateField('report_card_border_color', v)}
                />
                <ColorPickerField
                  id="grade_a_color"
                  label="Grade A"
                  value={form.grade_a_color || '#10b981'}
                  onChange={(v) => updateField('grade_a_color', v)}
                />
                <ColorPickerField
                  id="grade_f_color"
                  label="Grade F"
                  value={form.grade_f_color || '#ef4444'}
                  onChange={(v) => updateField('grade_f_color', v)}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label htmlFor="pdf_footer_text">PDF Footer Text</Label>
              <Input
                id="pdf_footer_text"
                placeholder="e.g. Approved by the Ministry of Secondary Education"
                value={form.pdf_footer_text || ''}
                onChange={(e) => updateField('pdf_footer_text', e.target.value)}
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
