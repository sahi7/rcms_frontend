// src/features/marks/pages/MarkUploadPage.tsx
import React, { useMemo, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UploadCloudIcon,
  FileSpreadsheetIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  InfoIcon,
  Loader2Icon,
  XIcon,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { SearchableSelect } from '@/components/SearchableSelect'
import { Modal } from '@/components/Modal'
import { Label } from '@/components/ui/label'
import { useUploadScope, useUploadMarks } from '@/features/marks/hooks/useMarks'
import { useListQuery } from '@/hooks/shared/useApiQuery'
import type { Term, Sequence } from '@/types/academic'
import type { ClassRoom } from '@/types/structure'
import type { Subject } from '@/types/curriculum'
import { useTerms } from '@/features/academic/hooks/terms'

export function MarkUploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [assignmentId, setAssignmentId] = useState<number | string | null>(null)
  const [sequenceId, setSequenceId] = useState<number | string | null>(null)
  const [classId, setClassId] = useState<number | string | null>(null)
  const [termId, setTermId] = useState<number | string | null>(null)
  const [isResit, setIsResit] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [successModal, setSuccessModal] = useState<{
    groupKey: string
    skipped: number
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [errorMs, setErrorMs] = useState<string[]>([])

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false)

  // Excel/CSV preview (first 8 rows)
  const [previewRows, setPreviewRows] = useState<any[][]>([])

  // Fetch scope
  const { data: scope, isLoading: scopeLoading } = useUploadScope()

  // Fetch reference data
  const { data: termsData } = useTerms()
  const { data: sequencesData } = useListQuery<Sequence>(
    'sequences',
    '/sequence/',
    { page_size: 100 },
  )
  const { data: classesData } = useListQuery<ClassRoom>(
    'classrooms',
    '/classrooms/',
    { page_size: 200 },
  )
  const { data: subjectsData } = useListQuery<Subject>(
    'subjects',
    '/subjects/',
    { page_size: 200 },
  )

  const uploadMutation = useUploadMarks()

  // Build lookup maps
  const termMap = useMemo(() => {
    const m = new Map<number, string>()
    termsData?.data?.forEach((t) => m.set(Number(t.id), t.name))
    return m
  }, [termsData])

  const seqMap = useMemo(() => {
    const m = new Map<number, string>()
    sequencesData?.data?.forEach((s) =>
      m.set(Number(s.id), `${s.name} (${s.code})`),
    )
    return m
  }, [sequencesData])

  const classMap = useMemo(() => {
    const m = new Map<number, string>()
    classesData?.data?.forEach((c) => m.set(Number(c.id), c.name))
    return m
  }, [classesData])

  const subjectMap = useMemo(() => {
    const m = new Map<number, string>()
    subjectsData?.data?.forEach((s) =>
      m.set(Number(s.id), `${s.name} (${s.code})`),
    )
    return m
  }, [subjectsData])

  // Deduplicated assignments (no duplicate subjects)
  // We use assignment.id as value, but group by subject_id to avoid duplicates
  const assignmentOptions = useMemo(() => {
    if (!scope?.assignments) return []

    const seen = new Map<number, any>()

    scope.assignments.forEach((a: any) => {
      if (!seen.has(a.subject_id)) {
        seen.set(a.subject_id, {
          value: a.id,
          label: subjectMap.get(a.subject_id) || `Subject #${a.subject_id}`,
          subject_id: a.subject_id,  // Store the subject_id too
        })
      }
    })

    return Array.from(seen.values())
  }, [scope, subjectMap])

  // Get ALL classrooms for the selected subject
  const classOptions = useMemo(() => {
    if (!scope?.assignments || !assignmentId) return []

    // Find the selected option to get its subject_id
    const selectedOption = assignmentOptions.find(
      (opt) => opt.value === Number(assignmentId)
    )

    if (!selectedOption) return []

    // Find ALL assignments with this subject_id
    const assignmentsForSubject = scope.assignments.filter(
      (a: any) => a.subject_id === selectedOption.subject_id
    )

    // Get unique classroom IDs from all these assignments
    const uniqueClassIds = [...new Set(
      assignmentsForSubject
        .map((a: any) => a.class_rooms__id)
        .filter((id: number) => id != null)
    )]

    // Return all classes as options
    return uniqueClassIds.map((classId: number) => ({
      value: classId,
      label: classMap.get(classId) || `Class #${classId}`,
    }))
  }, [scope, assignmentId, assignmentOptions, classMap])

  const termOptions = useMemo(() => {
    if (!scope) return []
    const scopeIds = new Set(scope.terms.map((t) => t.id))
    return Array.from(scopeIds).map((id) => ({
      value: id,
      label: termMap.get(id) || `Term #${id}`,
    }))
  }, [scope, termMap])

  const sequenceOptions = useMemo(() => {
    if (!scope) return []
    return scope.sequences.map((s) => ({
      value: s.id,
      label: seqMap.get(s.id) || `Sequence #${s.id}`,
    }))
  }, [scope, seqMap])

  // Parse file for preview (first 8 rows)
  const parseFileForPreview = useCallback((f: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][]
        setPreviewRows(json.slice(0, 8))
      } catch (err) {
        console.error('Preview parse error', err)
        setPreviewRows([])
      }
    }
    reader.readAsArrayBuffer(f)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const ext = f.name.split('.').pop()?.toLowerCase()
      if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
        setErrorMsg('Only CSV or Excel (.xlsx, .xls) files are accepted.')
        setFile(null)
        setPreviewRows([])
        return
      }
      setErrorMsg('')
      setFile(f)
      parseFileForPreview(f)
    }
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const ext = droppedFile.name.split('.').pop()?.toLowerCase()
      if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
        setErrorMsg('Only CSV or Excel (.xlsx, .xls) files are accepted.')
        setFile(null)
        setPreviewRows([])
        return
      }
      setErrorMsg('')
      setFile(droppedFile)
      parseFileForPreview(droppedFile)
    }
  }

  const canSubmit =
    assignmentId &&
    sequenceId &&
    classId &&
    termId &&
    file &&
    !uploadMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setErrorMsg('')
    const formData = new FormData()
    formData.append('assignment_id', String(assignmentId))
    formData.append('sequence_id', String(sequenceId))
    formData.append('class_id', String(classId))
    formData.append('term_id', String(termId))
    formData.append('is_resit', String(isResit))
    formData.append('file', file!)

    try {
      const result = await uploadMutation.mutateAsync(formData)
      setSuccessModal({
        groupKey: result.group_key,
        skipped: result.skipped_errors,
      })
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.error ||
        err?.message ||
        'Upload failed.',
      )
      const raw =
        err?.response?.data?.details ||
        err?.message ||
        'Upload failed. Please try again.'

      let errorsArray: string[] = []

      if (typeof raw === 'string') {
        errorsArray = raw
          .split(/(?=Row \d+:)/g)
          .map((e) => e.trim())
          .filter(Boolean)
      } else if (Array.isArray(raw)) {
        errorsArray = raw
      } else {
        errorsArray = ['Upload failed. Please try again.']
      }

      setErrorMs(errorsArray)
    }
  }

  const handleGoToPreview = () => {
    if (successModal) {
      navigate(
        `/dashboard/marks/preview/${encodeURIComponent(successModal.groupKey)}?term_id=${termId}`,
      )
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Marks</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload student marks from a CSV or Excel file
        </p>
      </div>

      {/* Instructions card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3"
      >
        <InfoIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <p className="font-medium">File Format Requirements</p>
          <p>
            Your file must be a <strong>CSV</strong> or{' '}
            <strong>Excel (.xlsx/.xls)</strong> with the following columns:
          </p>
          <ul className="list-disc ml-4 space-y-0.5">
            <li>
              <code className="bg-blue-100 px-1 rounded text-xs">
                registration_number
              </code>{' '}
              — Student registration number (required)
            </li>
            <li>
              <code className="bg-blue-100 px-1 rounded text-xs">score</code> —
              Numeric score (required)
            </li>
            <li>
              <code className="bg-blue-100 px-1 rounded text-xs">remarks</code>{' '}
              — Optional comments
            </li>
          </ul>
        </div>
      </motion.div>

      {scopeLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2Icon className="w-7 h-7 animate-spin text-orange-500" />
          <span className="ml-3 text-slate-500">
            Loading your upload scope...
          </span>
        </div>
      ) : !scope || scope.assignments.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertTriangleIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-amber-800 font-medium">No Upload Permissions</p>
          <p className="text-sm text-amber-600 mt-1">
            You don't have any subject assignments to upload marks for. Contact
            your administrator.
          </p>
        </div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="p-6 space-y-5">
            <SearchableSelect
              label="Subject (Assignment)"
              required
              options={assignmentOptions}
              value={assignmentId}
              onChange={(v) => setAssignmentId(v)}
              placeholder="Select subject assignment..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SearchableSelect
                label="Term"
                required
                options={termOptions}
                value={termId}
                onChange={(v) => setTermId(v)}
                placeholder="Select term..."
              />
              <SearchableSelect
                label="Sequence"
                required
                options={sequenceOptions}
                value={sequenceId}
                onChange={(v) => setSequenceId(v)}
                placeholder="Select sequence..."
              />
            </div>

            {/* Class dropdown now filtered to only the class of the selected assignment */}
            <SearchableSelect
              label="Class"
              required
              options={classOptions}
              value={classId}
              onChange={(v) => setClassId(v)}
              placeholder="Select class..."
            />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isResit}
                onChange={(e) => setIsResit(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500/30"
              />
              <span className="text-sm text-slate-700 font-medium">
                This is a resit examination
              </span>
            </label>

            {/* File upload with drag & drop */}
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1">
                File <span className="text-red-400">*</span>
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragging
                    ? 'border-orange-400 bg-orange-50'
                    : file
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheetIcon className="w-8 h-8 text-emerald-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        setPreviewRows([])
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <XIcon className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloudIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      Click or drag &amp; drop a <strong>CSV</strong> or{' '}
                      <strong>Excel</strong> file
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Max file size: 10MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Excel/CSV Preview */}
            {file && previewRows.length > 0 && (
              <div className="mt-4">
                <Label className="text-xs text-slate-500 mb-2 block">
                  Preview (first 8 rows)
                </Label>
                <div className="border border-slate-200 rounded-xl overflow-auto max-h-64 bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        {previewRows[0] &&
                          previewRows[0].map((cell: any, i: number) => (
                            <th
                              key={i}
                              className="px-3 py-2 text-left font-medium text-slate-600 border-b"
                            >
                              {String(cell || '')}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b last:border-0">
                          {row.map((cell: any, i: number) => (
                            <td
                              key={i}
                              className="px-3 py-2 text-slate-700 border-r last:border-r-0"
                            >
                              {String(cell || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            {errorMs.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-1 max-h-48 overflow-y-auto">
                {errorMs.map((err, i) => (
                  <div key={i} className="text-sm text-red-700">
                    {err}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloudIcon className="w-4 h-4" />
                  Upload Marks
                </>
              )}
            </button>
          </div>
        </motion.form>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={!!successModal}
        onClose={() => setSuccessModal(null)}
        title="Upload Successful"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2Icon className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">
              Marks Uploaded Successfully!
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Your marks have been processed and saved.
            </p>
          </div>
          {successModal && successModal.skipped > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                <strong>{successModal.skipped}</strong> row(s) were skipped due
                to errors.
              </p>
            </div>
          )}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Group Key
            </p>
            <p className="text-sm font-mono text-slate-700">
              {successModal?.groupKey}
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setSuccessModal(null)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleGoToPreview}
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              View Uploaded Marks
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}