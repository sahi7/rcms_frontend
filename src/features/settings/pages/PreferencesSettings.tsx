import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Loader2Icon,
  PlusIcon,
  XIcon,
  EyeIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { usePreferences, useUpdatePreferences } from '../hooks/usePreferences'
import { useIsUni } from '../hooks/useInstitution'
import {
  PreferencesPayload,
  GradeRange,
  GpaRanges,
  IdFormatTemplates,
  ResitPreferences,
} from '@/types/settings'


// ─── ID Format Builder ───────────────────────────────────────────────
const ID_TOKENS = [
  {
    key: '{inst}',
    label: 'Institution',
  },
  {
    key: '{prefix}',
    label: 'Prefix',
  },
  {
    key: '{year}',
    label: 'Year',
  },
  {
    key: '{seq}',
    label: 'Sequence',
  },
  {
    key: '{dept}',
    label: 'Department',
  },
]
interface IdFormatBuilderProps {
  label: string
  value: string
  onChange: (val: string) => void
}

function IdFormatBuilder({
  label,
  value,
  onChange,
  yearIdentifier = 'Long', // defaults to Long for backward compatibility
}: IdFormatBuilderProps & { yearIdentifier?: 'Short' | 'Long' }) {
  // ✅ Keep the improved parsing from last fix (consecutive tokens stay separate)
  const parseValue = (val: string) =>
    val ? (val.match(/({[^}]+}|-)/g) || []) : []

  const [items, setItems] = useState<string[]>(parseValue(value))

  useEffect(() => {
    setItems(parseValue(value))
  }, [value])

  const syncToParent = useCallback(
    (newItems: string[]) => {
      setItems(newItems)
      onChange(newItems.join(''))
    },
    [onChange],
  )

  const addToken = (token: string) => {
    const newItems = [...items, token]
    syncToParent(newItems)
  }

  const addSeparator = () => {
    if (items.length > 0 && items[items.length - 1] !== '-') {
      syncToParent([...items, '-'])
    }
  }

  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)

    // Clean up double separators, leading/trailing separators
    const cleaned = newItems.filter((item, i) => {
      if (item === '-' && i === 0) return false
      if (item === '-' && i === newItems.length - 1) return false
      if (item === '-' && newItems[i - 1] === '-') return false
      return true
    })

    syncToParent(cleaned)
  }

  // ✅ REACTIVE & ANIMATED year preview
  // Changes instantly when form.year_identifier updates
  const previewText = items
    .map((item) => {
      if (item === '-') return '-'
      const token = ID_TOKENS.find((t) => t.key === item)
      if (token) {
        switch (item) {
          case '{inst}':
            return 'UN'
          case '{prefix}':
            return 'ST'
          case '{year}':
            return yearIdentifier === 'Short' ? '26' : '2026'
          case '{seq}':
            return '0001'
          case '{dept}':
            return 'CS'
          default:
            return item
        }
      }
      return item
    })
    .join('')

  const usedTokens = items.filter((i) => i !== '-')

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* Current format display */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[44px] p-3 bg-slate-50 border border-slate-200 rounded-lg">
        {items.length === 0 ? (
          <span className="text-sm text-slate-400">
            Click tokens below to build format
          </span>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={`${item}-${index}`}
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${item === '-' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}
            >
              {item === '-' ? (
                <span className="px-1">—</span>
              ) : (
                <span>
                  {ID_TOKENS.find((t) => t.key === item)?.label || item}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-0.5 p-0.5 rounded hover:bg-black/10 transition-colors"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Token buttons */}
      <div className="flex flex-wrap gap-2">
        {ID_TOKENS.map((token) => (
          <button
            key={token.key}
            type="button"
            disabled={usedTokens.includes(token.key)}
            onClick={() => addToken(token.key)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {token.label}
          </button>
        ))}
        <button
          type="button"
          onClick={addSeparator}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-dashed border-slate-300 bg-white text-slate-500 hover:bg-slate-50 transition-all"
        >
          + Separator
        </button>
      </div>

      {/* Preview – now reactive + animated */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
        <EyeIcon className="w-4 h-4 text-emerald-600 shrink-0" />
        <AnimatePresence mode="wait">
          <motion.span
            key={previewText} // forces smooth exit/enter animation when year format changes
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-sm text-emerald-700 font-mono"
          >
            {previewText || '—'}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Grade Range Editor ──────────────────────────────────────────────
interface GradeRangeEditorProps {
  value: GradeRange
  onChange: (val: GradeRange) => void
}
function GradeRangeEditor({ value, onChange }: GradeRangeEditorProps) {
  const entries = Object.entries(value).sort((a, b) => b[1][0] - a[1][0])
  const updateGrade = (
    oldKey: string,
    newKey: string,
    range: [number, number],
  ) => {
    const newVal = {
      ...value,
    }
    if (oldKey !== newKey) {
      delete newVal[oldKey]
    }
    newVal[newKey] = range
    onChange(newVal)
  }
  const removeGrade = (key: string) => {
    const newVal = {
      ...value,
    }
    delete newVal[key]
    onChange(newVal)
  }
  const addGrade = () => {
    const newVal = {
      ...value,
      '': [0, 0] as [number, number],
    }
    onChange(newVal)
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[80px_1fr_1fr_40px] gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider px-1">
        <span>Grade</span>
        <span>Min Score</span>
        <span>Max Score</span>
        <span />
      </div>
      <div className="space-y-2">
        {entries.map(([grade, [min, max]], index) => (
          <div
            key={`${grade}-${index}`}
            className="grid grid-cols-[80px_1fr_1fr_40px] gap-2 items-center"
          >
            <Input
              value={grade}
              onChange={(e) =>
                updateGrade(grade, e.target.value.toUpperCase(), [min, max])
              }
              placeholder="A"
              className="text-center font-semibold"
            />
            <Input
              type="number"
              value={min}
              onChange={(e) =>
                updateGrade(grade, grade, [
                  parseFloat(e.target.value) || 0,
                  max,
                ])
              }
              placeholder="0"
            />
            <Input
              type="number"
              value={max}
              onChange={(e) =>
                updateGrade(grade, grade, [
                  min,
                  parseFloat(e.target.value) || 0,
                ])
              }
              placeholder="100"
            />
            <button
              type="button"
              onClick={() => removeGrade(grade)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addGrade}>
        <PlusIcon className="w-4 h-4 mr-1" />
        Add Grade
      </Button>
    </div>
  )
}
// ─── GPA Range Editor ────────────────────────────────────────────────
interface GpaRangeEditorProps {
  value: GpaRanges
  onChange: (val: GpaRanges) => void
}
function GpaRangeEditor({ value, onChange }: GpaRangeEditorProps) {
  const entries = Object.entries(value).sort((a, b) => b[1] - a[1])
  const updateGpa = (oldKey: string, newKey: string, gpa: number) => {
    const newVal = {
      ...value,
    }
    if (oldKey !== newKey) {
      delete newVal[oldKey]
    }
    newVal[newKey] = gpa
    onChange(newVal)
  }
  const removeGpa = (key: string) => {
    const newVal = {
      ...value,
    }
    delete newVal[key]
    onChange(newVal)
  }
  const addGpa = () => {
    onChange({
      ...value,
      '': 0,
    })
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[100px_1fr_40px] gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider px-1">
        <span>Grade</span>
        <span>GPA Value</span>
        <span />
      </div>
      <div className="space-y-2">
        {entries.map(([grade, gpa], index) => (
          <div
            key={`${grade}-${index}`}
            className="grid grid-cols-[100px_1fr_40px] gap-2 items-center"
          >
            <Input
              value={grade}
              onChange={(e) =>
                updateGpa(grade, e.target.value.toUpperCase(), gpa)
              }
              placeholder="A"
              className="text-center font-semibold"
            />
            <Input
              type="number"
              step="0.1"
              value={gpa}
              onChange={(e) =>
                updateGpa(grade, grade, parseFloat(e.target.value) || 0)
              }
              placeholder="4.0"
            />
            <button
              type="button"
              onClick={() => removeGpa(grade)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addGpa}>
        <PlusIcon className="w-4 h-4 mr-1" />
        Add Grade
      </Button>
    </div>
  )
}


// ─── Main Component ──────────────────────────────────────────────────
export function PreferencesSettings() {
  const { data, isLoading } = usePreferences()
  const [form, setForm] = useState<PreferencesPayload>({})
  const [hasChanges, setHasChanges] = useState(false)
  const updateMutation = useUpdatePreferences()
  const isUni = useIsUni()

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
      })
      setHasChanges(false)
    }
  }, [data])
  const updateField = <K extends keyof PreferencesPayload>(
    key: K,
    value: PreferencesPayload[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
    setHasChanges(true)
  }
  const updateIdTemplate = (role: string, value: string) => {
    const templates = {
      ...(form.id_format_templates || {}),
      [role]: value,
    }
    updateField('id_format_templates', templates as IdFormatTemplates)
  }
  const updateResitPref = <K extends keyof ResitPreferences>(
    key: K,
    value: ResitPreferences[K],
  ) => {
    const prefs = {
      ...(form.resit_preferences || {}),
      [key]: value,
    } as ResitPreferences
    updateField('resit_preferences', prefs)
  }
  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(form)
      toast.success('Preferences saved')
      setHasChanges(false)
    } catch {
      toast.error('Failed to save preferences')
    }
  }
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Academic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Configuration</CardTitle>
          <CardDescription>
            Configure how your institution organizes academic activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Academic Period</Label>
              <Select
                value={form.academic_period || ''}
                onValueChange={(v) => updateField('academic_period', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term">Term</SelectItem>
                  <SelectItem value="semester">Semester</SelectItem>
                  <SelectItem value="trimester">Trimester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subject Naming</Label>
              <Select
                value={form.subject_naming || ''}
                onValueChange={(v) => updateField('subject_naming', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select naming" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subjects">Subjects</SelectItem>
                  <SelectItem value="courses/modules">
                    Courses / Modules
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Student Grouping</Label>
              <Select
                value={form.student_grouping || ''}
                onValueChange={(v) => updateField('student_grouping', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher_course">
                    Teacher / Course
                  </SelectItem>
                  <SelectItem value="class_based">Class Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Instructor Title</Label>
              <Select
                value={form.instructor_title || ''}
                onValueChange={(v) => updateField('instructor_title', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Evaluation Type</Label>
              <Select
                value={form.evaluation_type || ''}
                onValueChange={(v) => updateField('evaluation_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ca_exam">CA + Exam</SelectItem>
                  <SelectItem value="exam_only">Exam Only</SelectItem>
                  <SelectItem value="continuous">Continuous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Class Progression</Label>
              <Select
                value={form.class_progression_name || ''}
                onValueChange={(v) => updateField('class_progression_name', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select progression" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="levels">Levels</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                  <SelectItem value="grades">Grades</SelectItem>
                  <SelectItem value="forms">Forms</SelectItem>
                  <SelectItem value="classes">Classes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Grading Scheme</Label>
              <Select
                value={form.grading_scheme || ''}
                onValueChange={(v) => updateField('grading_scheme', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpa_4">GPA 4.0</SelectItem>
                  <SelectItem value="gpa_5">GPA 5.0</SelectItem>
                  <SelectItem value="grades_af">Grades A - F</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Credit Handling</Label>
              <Select
                value={form.credit_handling || ''}
                onValueChange={(v) => updateField('credit_handling', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select handling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zero_missing">Zero Missing</SelectItem>
                  <SelectItem value="exclude_missing">
                    Exclude Missing
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isUni && (
              <div className="space-y-1.5">
                <Label>Resit Process</Label>
                <Select
                  value={form.resit_process || ''}
                  onValueChange={(v) => updateField('resit_process', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select process" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resit_as_semester">
                      Resit as Semester
                    </SelectItem>
                    <SelectItem value="resit_separate">Resit Separate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Identifiers */}
      <Card>
        <CardHeader>
          <CardTitle>Identifiers</CardTitle>
          <CardDescription>
            Prefixes used for generating IDs across the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Year Identifier</Label>
              <Select
                value={form.year_identifier || ''}
                onValueChange={(v) => updateField('year_identifier', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short">Short (26)</SelectItem>
                  <SelectItem value="Long">Full (2026)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Student Prefix</Label>
              <Input
                placeholder="e.g. ST"
                value={form.student_identifier || ''}
                onChange={(e) =>
                  updateField('student_identifier', e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teacher Prefix</Label>
              <Input
                placeholder="e.g. TC"
                value={form.teacher_identifier || ''}
                onChange={(e) =>
                  updateField('teacher_identifier', e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Staff Prefix</Label>
              <Input
                placeholder="e.g. SF"
                value={form.staff_identifier || ''}
                onChange={(e) =>
                  updateField('staff_identifier', e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Document Prefix</Label>
              <Input
                placeholder="e.g. DOC"
                value={form.document_identifier || ''}
                onChange={(e) =>
                  updateField('document_identifier', e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ID Format Templates */}
      <Card>
        <CardHeader>
          <CardTitle>ID Format Templates</CardTitle>
          <CardDescription>
            Define how IDs are generated by clicking tokens to build the format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <IdFormatBuilder
              label="Student ID Format"
              value={form.id_format_templates?.student || ''}
              onChange={(v) => updateIdTemplate('student', v)}
              yearIdentifier={form.year_identifier as "Short" | "Long" | undefined}
            />
            <Separator />
            <IdFormatBuilder
              label="Teacher ID Format"
              value={form.id_format_templates?.teacher || ''}
              onChange={(v) => updateIdTemplate('teacher', v)}
              yearIdentifier={form.year_identifier as "Short" | "Long" | undefined}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grade Ranges */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Ranges</CardTitle>
          <CardDescription>
            Define score ranges for each letter grade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GradeRangeEditor
            value={form.grade_ranges || {}}
            onChange={(v) => updateField('grade_ranges', v)}
          />
        </CardContent>
      </Card>

      {/* GPA Ranges */}
      {isUni && (
        <Card>
          <CardHeader>
            <CardTitle>GPA Values</CardTitle>
            <CardDescription>
              Map letter grades to GPA point values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GpaRangeEditor
              value={form.gpa_ranges || {}}
              onChange={(v) => updateField('gpa_ranges', v)}
            />
          </CardContent>
        </Card>
      )}

      {/* Resit Preferences */}
      {isUni && (
        <Card>
          <CardHeader>
            <CardTitle>Resit Preferences</CardTitle>
            <CardDescription>
              Configure how resit examinations are handled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Resit Max Score</Label>
                <Input
                  type="number"
                  placeholder="e.g. 20"
                  value={form.resit_preferences?.resit_max_score ?? ''}
                  onChange={(e) =>
                    updateResitPref(
                      'resit_max_score',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cutoff Resit Score</Label>
                <Input
                  type="number"
                  placeholder="e.g. 7"
                  value={form.resit_preferences?.cutoff_resit_score ?? ''}
                  onChange={(e) =>
                    updateResitPref(
                      'cutoff_resit_score',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price Per Unit</Label>
                <Input
                  type="number"
                  placeholder="e.g. 0"
                  value={form.resit_preferences?.price_per_unit ?? ''}
                  onChange={(e) =>
                    updateResitPref(
                      'price_per_unit',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div />
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <Label className="cursor-pointer">Resit is Payable</Label>
                <Switch
                  checked={form.resit_preferences?.is_resit_payable ?? false}
                  onCheckedChange={(v) => updateResitPref('is_resit_payable', v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <Label className="cursor-pointer">Balance Resit Score</Label>
                <Switch
                  checked={form.resit_preferences?.balance_resit_score ?? false}
                  onCheckedChange={(v) =>
                    updateResitPref('balance_resit_score', v)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <Label className="cursor-pointer">Cutoff by Core Subject</Label>
                <Switch
                  checked={
                    form.resit_preferences?.cutoff_by_core_subject ?? false
                  }
                  onCheckedChange={(v) =>
                    updateResitPref('cutoff_by_core_subject', v)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <Label className="cursor-pointer">
                  Allow Resit Without Payment
                </Label>
                <Switch
                  checked={
                    form.resit_preferences?.allow_resit_without_payment ?? false
                  }
                  onCheckedChange={(v) =>
                    updateResitPref('allow_resit_without_payment', v)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
