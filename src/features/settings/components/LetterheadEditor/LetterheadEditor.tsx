// src/features/settings/components/LetterheadEditor/LetterheadEditor.tsx
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2Icon, FileTextIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Can } from '@/hooks/shared/useHasPermission'
import { Letterhead } from '@/types/letterhead'
import { useLetterhead, useUpdateLetterhead } from '../../hooks/useLetterhead'
import { RichTextEditor } from './RichTextEditor'
import { LetterheadPreview } from './LetterheadPreview'

type Side = 'left' | 'center' | 'right'
const SIDE_CONFIG: {
  key: Side
  label: string
  field: keyof Letterhead
  placeholder: string
}[] = [
  {
    key: 'left',
    label: 'Left',
    field: 'left_html',
    placeholder: 'e.g. Ministry of Education',
  },
  {
    key: 'center',
    label: 'Center',
    field: 'center_html',
    placeholder: 'e.g. Institution name & motto',
  },
  {
    key: 'right',
    label: 'Right',
    field: 'right_html',
    placeholder: 'e.g. Contact info, website',
  },
]

export function LetterheadEditor() {
  const { letterhead, isLoading } = useLetterhead()
  const update = useUpdateLetterhead()
  const [form, setForm] = useState<Letterhead>(letterhead)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setForm(letterhead)
    setHasChanges(false)
  }, [letterhead])

  const setField = (field: keyof Letterhead, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      await update.mutateAsync(form)
      toast.success('Letterhead saved')
      setHasChanges(false)
    } catch {
      toast.error('Failed to save letterhead')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <FileTextIcon className="w-4 h-4" />
          </div>
          <div>
            <CardTitle>Letterhead</CardTitle>
            <CardDescription>
              Content shown at the top of every generated PDF (class lists,
              transcripts, etc.)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mobile: tabs. Desktop: 3-column */}
        <div className="md:hidden">
          <Tabs defaultValue="left">
            <TabsList className="grid w-full grid-cols-3">
              {SIDE_CONFIG.map((s) => (
                <TabsTrigger key={s.key} value={s.key}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {SIDE_CONFIG.map((s) => (
              <TabsContent key={s.key} value={s.key} className="mt-3">
                <RichTextEditor
                  value={form[s.field]}
                  onChange={(v) => setField(s.field, v)}
                  placeholder={s.placeholder}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {SIDE_CONFIG.map((s) => (
            <div key={s.key} className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">
                {s.label}
              </label>
              <RichTextEditor
                value={form[s.field]}
                onChange={(v) => setField(s.field, v)}
                placeholder={s.placeholder}
              />
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700">Preview</h4>
            <span className="text-xs text-slate-400">
              Rendered at the top of PDFs
            </span>
          </div>
          <LetterheadPreview letterhead={form} />
        </div>

        <Can permission="change_institution">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || update.isPending}
            >
              {update.isPending ? (
                <>
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Letterhead'
              )}
            </Button>
          </div>
        </Can>
      </CardContent>
    </Card>
  )
}