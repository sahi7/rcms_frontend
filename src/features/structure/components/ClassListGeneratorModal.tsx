import { useMemo, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { toast } from 'sonner'
import { Loader2Icon, DownloadIcon, FileTextIcon } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { SearchableSelect } from '@/components/SearchableSelect'
import { useStudentsList } from '@/features/students/hooks/useStudents'
import { useDepartments } from '@/features/structure/hooks/useDepartments'
import { useLetterhead } from '@/features/settings/hooks/useLetterhead'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { ClassRoom } from '@/types/structure'
import { ClassListPDF } from './pdf/ClassListPDF'
interface Props {
  isOpen: boolean
  onClose: () => void
  classroom: ClassRoom | null
}


export function ClassListGeneratorModal({ isOpen, onClose, classroom }: Props) {
  const { getLabel } = useInstitutionConfig()
  const [departmentId, setDepartmentId] = useState<string | number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { data: departmentsData } = useDepartments()
  const { letterhead } = useLetterhead()
  // Pull a single large page — classlists are bounded in size (one class).
  const { data, isLoading } = useStudentsList(
    classroom
      ? {
          page: 1,
          page_size: 1000,
          current_class: classroom.id,
          department: departmentId || undefined,
          enrollment_status: 'active',
        }
      : {
          page: 1,
          page_size: 0,
        },
  )
  const students = data?.data ?? []
  const sortedPreview = useMemo(
    () =>
      [...students]
        .sort((a, b) =>
          `${a.first_name} ${a.last_name}`
            .toLowerCase()
            .localeCompare(`${b.first_name} ${b.last_name}`.toLowerCase()),
        )
        .slice(0, 6),
    [students],
  )
  const departmentName = useMemo(() => {
    if (!departmentId) return null
    return (
      departmentsData?.data?.find((d: any) => d.id === departmentId)?.name ||
      null
    )
  }, [departmentId, departmentsData])
  const deptOptions = [
    {
      value: '',
      label: 'All departments',
    },
    ...(departmentsData?.data?.map((d: any) => ({
      value: d.id,
      label: d.name,
    })) || []),
  ]
  const classLabel = getLabel('class_progression_name')
  const title = classroom
    ? `${classLabel} List — ${classroom.name}`
    : 'Class List'
  const subtitle = departmentName ? `Department: ${departmentName}` : undefined
  const handleGenerate = async () => {
    if (!classroom) return
    setIsGenerating(true)
    try {
      const blob = await pdf(
        <ClassListPDF
          letterhead={letterhead}
          title={title}
          subtitle={subtitle}
          students={students}
        />,
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = classroom.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      a.download = `class-list-${safeName}${departmentName ? '-' + departmentName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() : ''}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Class list generated')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }
  const canGenerate =
    !!classroom && !isLoading && !isGenerating && students.length > 0
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Generate ${classLabel} List`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <FileTextIcon className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <div className="font-medium text-slate-800">
              {classroom?.name || '—'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Students are sorted by name. Only active students are included.
            </div>
          </div>
        </div>

        {classroom?.has_departments && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Department (optional)
            </label>
            <SearchableSelect
              options={deptOptions}
              value={departmentId ?? ''}
              onChange={(v) => setDepartmentId(v === '' ? null : v)}
              placeholder="All departments"
            />
          </div>
        )}

        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-600 flex items-center justify-between">
            <span>Preview</span>
            <span>
              {isLoading
                ? 'Loading…'
                : `${students.length} student${students.length === 1 ? '' : 's'}`}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {isLoading && (
              <div className="p-4 text-sm text-slate-400 text-center">
                Loading students…
              </div>
            )}
            {!isLoading && students.length === 0 && (
              <div className="p-4 text-sm text-slate-400 text-center">
                No students found for this selection.
              </div>
            )}
            {!isLoading &&
              sortedPreview.map((s, i) => (
                <div
                  key={String(s.id)}
                  className="px-3 py-2 text-sm flex items-center gap-3"
                >
                  <span className="text-xs text-slate-400 w-5">{i + 1}</span>
                  <span className="text-slate-500 w-28 truncate">
                    {s.registration_number || '—'}
                  </span>
                  <span className="text-slate-800 truncate">
                    {s.first_name} {s.last_name}
                  </span>
                </div>
              ))}
            {!isLoading && students.length > sortedPreview.length && (
              <div className="px-3 py-2 text-xs text-slate-400">
                + {students.length - sortedPreview.length} more…
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm shadow-orange-500/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <DownloadIcon className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
