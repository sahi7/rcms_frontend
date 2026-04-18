import React, { useEffect, useMemo, useState } from 'react'
// src/features/settings/components/LetterheadEditor/LetterheadEditor.tsx
//
// Adds per-column width sliders. Widths are stored on the Letterhead record
// as optional fields (left_width / center_width / right_width, percent).
//
// NOTE on persistence:
// Your `Letterhead` type file wasn't provided so I couldn't add the fields to
// the type itself. The form is cast via `as any` where those extra keys are
// read/written. To make them persist end-to-end, add this to
// `src/types/letterhead.ts`:
//
//   export interface Letterhead {
//     left_html: string
//     center_html: string
//     right_html: string
//     left_width?: number   // percent, 10–80
//     center_width?: number
//     right_width?: number
//   }
//
// And include the same three keys in EMPTY_LETTERHEAD (defaults below: 33/34/33).
// The backend JSON column already accepts arbitrary keys, so no migration is
// needed beyond the type.

import { toast } from 'sonner'
import { Loader2Icon, FileTextIcon, ColumnsIcon } from 'lucide-react'
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
  htmlField: keyof Letterhead
  widthField: 'left_width' | 'center_width' | 'right_width'
  placeholder: string
}[] = [
  {
    key: 'left',
    label: 'Left',
    htmlField: 'left_html',
    widthField: 'left_width',
    placeholder: 'e.g. Ministry of Education',
  },
  {
    key: 'center',
    label: 'Center',
    htmlField: 'center_html',
    widthField: 'center_width',
    placeholder: 'e.g. Institution name & motto',
  },
  {
    key: 'right',
    label: 'Right',
    htmlField: 'right_html',
    widthField: 'right_width',
    placeholder: 'e.g. Contact info, website',
  },
]
const DEFAULT_WIDTHS = {
  left: 33,
  center: 34,
  right: 33,
}
export function LetterheadEditor() {
  const { letterhead, isLoading } = useLetterhead()
  const update = useUpdateLetterhead()
  // We extend the form with optional width fields. Cast to `any` at boundaries.
  const [form, setForm] = useState<Letterhead>(letterhead)
  const [hasChanges, setHasChanges] = useState(false)
  useEffect(() => {
    setForm(letterhead)
    setHasChanges(false)
  }, [letterhead])
  const widths = useMemo(() => {
    const f = form as any
    return {
      left:
        typeof f.left_width === 'number' ? f.left_width : DEFAULT_WIDTHS.left,
      center:
        typeof f.center_width === 'number'
          ? f.center_width
          : DEFAULT_WIDTHS.center,
      right:
        typeof f.right_width === 'number'
          ? f.right_width
          : DEFAULT_WIDTHS.right,
    }
  }, [form])
  const setField = (field: keyof Letterhead, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHasChanges(true)
  }
  // When the user drags a slider, proportionally rebalance the other two so
  // the total always sums to 100. This keeps the row from overflowing.
  const setWidth = (side: Side, next: number) => {
    const clamped = Math.max(10, Math.min(80, Math.round(next)))
    const current = widths
    const others: Side[] = (['left', 'center', 'right'] as const).filter(
      (s) => s !== side,
    )
    const remaining = 100 - clamped
    const otherTotal = current[others[0]] + current[others[1]] || 1
    const next0 = Math.round((current[others[0]] / otherTotal) * remaining)
    const next1 = 100 - clamped - next0
    setForm(
      (prev) =>
        ({
          ...prev,
          [`${side}_width`]: clamped,
          [`${others[0]}_width`]: Math.max(5, next0),
          [`${others[1]}_width`]: Math.max(5, next1),
        }) as any,
    )
    setHasChanges(true)
  }
  const resetWidths = () => {
    setForm(
      (prev) =>
        ({
          ...prev,
          left_width: DEFAULT_WIDTHS.left,
          center_width: DEFAULT_WIDTHS.center,
          right_width: DEFAULT_WIDTHS.right,
        }) as any,
    )
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
                  value={form[s.htmlField] as string}
                  onChange={(v) => setField(s.htmlField, v)}
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
                value={form[s.htmlField] as string}
                onChange={(v) => setField(s.htmlField, v)}
                placeholder={s.placeholder}
              />
            </div>
          ))}
        </div>

        {/* Column width sliders */}
        <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ColumnsIcon className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-medium text-slate-700">
                Column widths
              </h4>
            </div>
            <button
              type="button"
              onClick={resetWidths}
              className="text-xs text-orange-600 hover:underline"
            >
              Reset to equal
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SIDE_CONFIG.map((s) => (
              <div key={s.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{s.label}</span>
                  <span className="tabular-nums text-slate-500">
                    {widths[s.key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={widths[s.key]}
                  onChange={(e) => setWidth(s.key, Number(e.target.value))}
                  className="w-full accent-orange-500"
                  aria-label={`${s.label} column width`}
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Adjusting one column proportionally resizes the others so the row
            always totals 100%.
          </p>
        </div>

        {/* Live preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700">Preview</h4>
            <span className="text-xs text-slate-400">
              Rendered at the top of PDFs
            </span>
          </div>
          <LetterheadPreview letterhead={form} widths={widths} />
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
