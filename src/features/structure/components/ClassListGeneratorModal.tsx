import { useMemo, useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { toast } from 'sonner'
import { Loader2Icon, DownloadIcon, FileTextIcon, FileSpreadsheetIcon } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { SearchableSelect } from '@/components/SearchableSelect'
import { useStudentsList } from '@/features/students/hooks/useStudents'
import { useDepartments } from '@/features/structure/hooks/useDepartments'
import { useLetterhead } from '@/features/settings/hooks/useLetterhead'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { ClassRoom } from '@/types/structure'
import { ClassListPDF } from './pdf/ClassListPDF'
import * as XLSX from 'xlsx'
import type { PaginatedResponse } from '@/types/academic'
import api from '@/lib/api'   

interface Props {
    isOpen: boolean
    onClose: () => void
    classroom: ClassRoom | null
}

export function ClassListGeneratorModal({ isOpen, onClose, classroom }: Props) {
    const { getLabel } = useInstitutionConfig()
    const [departmentId, setDepartmentId] = useState<string | number | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isExportingExcel, setIsExportingExcel] = useState(false)

    const { data: departmentsData } = useDepartments()
    const { letterhead } = useLetterhead()

    // ONE source of truth for every filter
    const baseParams = useMemo(() => {
        if (!classroom) return null
        return {
            current_class: classroom.id,
            department: departmentId || undefined,
            enrollment_status: 'active',
            fields: 'registration_number,user.first_name,user.last_name',
        }
    }, [classroom?.id, departmentId])

    // Preview only – tiny page size keeps UI lightning fast
    const params = baseParams
        ? {
            ...baseParams,
            page: 1,
            page_size: 100,
        }
        : undefined

    const { data, isLoading } = useStudentsList(params, {
        enabled: !!params,
    })

    const previewStudents = data?.data ?? []
    const totalCount = data?.pagination?.total_count ?? 0

    // This is the ONLY place we ever fetch the full list
    const fetchAllStudents = useCallback(async (): Promise<any[]> => {
        if (!baseParams) return []

        let allStudents: any[] = []
        let page = 1
        let hasNext = true

        while (hasNext) {
            const response = await api.get<PaginatedResponse<any>>('/students/', {
                params: {
                    ...baseParams,
                    page,
                    page_size: 500,
                },
            })

            const pageData = response.data
            allStudents = [...allStudents, ...(pageData.data || [])]
            hasNext = pageData.pagination?.has_next ?? false
            page++
        }

        // Sort students by Name  ASC
        return allStudents.sort((a, b) =>
            `${a.user__first_name || ''} ${a.user__last_name || ''}`
                .toLowerCase()
                .localeCompare(`${b.user__first_name || ''} ${b.user__last_name || ''}`.toLowerCase()),
        )
    }, [baseParams])

    const sortedPreview = useMemo(
        () =>
            [...previewStudents]
                .sort((a, b) =>
                    `${a.user__first_name} ${a.user__last_name}`
                        .toLowerCase()
                        .localeCompare(`${b.user__first_name} ${b.user__last_name}`.toLowerCase()),
                )
                .slice(0, 6),
        [previewStudents],
    )

    const departmentName = useMemo(() => {
        if (!departmentId) return null
        return (
            departmentsData?.data?.find((d: any) => d.id === departmentId)?.name || null
        )
    }, [departmentId, departmentsData])

    const deptOptions = [
        { value: '', label: 'All departments' },
        ...(departmentsData?.data?.map((d: any) => ({ value: d.id, label: d.name })) || []),
    ]

    const classLabel = getLabel('class_progression_name')
    const title = classroom ? `${classLabel} List — ${classroom.name}` : 'Class List'
    const subtitle = departmentName ? `Department: ${departmentName}` : undefined

    // PDF
    const handleGeneratePDF = async () => {
        if (!classroom) return
        setIsGenerating(true)
        try {
            const allStudents = await fetchAllStudents()

            const blob = await pdf(
                <ClassListPDF
                    letterhead={letterhead}
                    title={title}
                    subtitle={subtitle}
                    students={allStudents}
                />,
            ).toBlob()

            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const safeName = classroom.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
            a.download = `class-list-${safeName}${departmentName ? '-' + departmentName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() : ''
                }.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)

            toast.success('Class list PDF generated')
            onClose()
        } catch (err) {
            console.error(err)
            toast.error('Failed to generate PDF')
        } finally {
            setIsGenerating(false)
        }
    }

    // EXCEL 
    const handleExportExcel = async () => {
        if (!classroom) return
        setIsExportingExcel(true)
        try {
            const allStudents = await fetchAllStudents()

            const exportData = allStudents.map((s: any) => ({
                'Registration Number': s.registration_number || '-',
                'name': `${s.user__first_name || ''} ${s.user__last_name || ''}`.trim(),
            }))

            const worksheet = XLSX.utils.json_to_sheet(exportData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Class List')
            worksheet['!cols'] = [{ wch: 20 }, { wch: 35 }]

            const safeName = classroom.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
            const deptSuffix = departmentName
                ? `-${departmentName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
                : ''
            XLSX.writeFile(workbook, `class-list-${safeName}${deptSuffix}.xlsx`)

            toast.success('Excel file downloaded')
        } catch (err) {
            console.error(err)
            toast.error('Failed to export Excel')
        } finally {
            setIsExportingExcel(false)
        }
    }

    const canExport = !!classroom && !isLoading && totalCount > 0

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
                                : `${totalCount} student${totalCount === 1 ? '' : 's'}`}
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {isLoading && (
                            <div className="p-4 text-sm text-slate-400 text-center">
                                Loading students…
                            </div>
                        )}
                        {!isLoading && previewStudents.length === 0 && (
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
                                        {s.user__first_name} {s.user__last_name}
                                    </span>
                                </div>
                            ))}
                        {!isLoading && previewStudents.length > sortedPreview.length && (
                            <div className="px-3 py-2 text-xs text-slate-400">
                                + {previewStudents.length - sortedPreview.length} more…
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
                        onClick={handleExportExcel}
                        disabled={!canExport || isExportingExcel}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                    >
                        {isExportingExcel ? (
                            <Loader2Icon className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileSpreadsheetIcon className="w-4 h-4" />
                        )}
                        {isExportingExcel ? 'Exporting…' : 'Download Excel'}
                    </button>
                    <button
                        type="button"
                        onClick={handleGeneratePDF}
                        disabled={!canExport || isGenerating}
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