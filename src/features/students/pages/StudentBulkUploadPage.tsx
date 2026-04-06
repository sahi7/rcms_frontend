// src/features/students/pages/StudentBulkUploadPage.tsx
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { useStudentBulkUpload, type BulkUploadResponse } from '../hooks/useStudentBulkUpload'
import * as XLSX from 'xlsx' // ← Added for Excel preview (chosen because it supports future editable columns via Handsontable / react-spreadsheet)

export function StudentBulkUpload() {
  const navigate = useNavigate()
  const { getPlural } = useInstitutionConfig()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mode, setMode] = useState<'create' | 'update'>('create')
  const [previewData, setPreviewData] = useState<string[][]>([])
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const uploadMutation = useStudentBulkUpload()
  const requiredColumns = ['first_name', 'last_name', 'class_name', 'department_name']
  const studentPlural = getPlural('student')

  const handleDownloadTemplate = () => {
    const headers = [
      'registration_number',
      'first_name',
      'last_name',
      'class_name',
      'department_name',
      'email',
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `student_${getPlural('student')}_template.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const validateHeaders = (headers: string[]) => {
    const missing = requiredColumns.filter(
      (col) => !headers.some((h) => h.toLowerCase().trim() === col.toLowerCase())
    )
    if (missing.length > 0) {
      setValidationError(`Missing required columns: ${missing.join(', ')}`)
      return false
    }
    setValidationError(null)
    return true
  }

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      alert('Only CSV or Excel files are allowed.')
      return
    }

    setFile(selectedFile)
    setUploadResult(null)
    setValidationError(null)

    const reader = new FileReader()

    if (selectedFile.name.toLowerCase().endsWith('.csv')) {
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n').slice(0, 6)
        const parsed = lines.map((line) =>
          line.split(',').map((cell) => cell.trim())
        )
        setPreviewData(parsed.filter((row) => row.length > 1))
        if (parsed.length > 0) {
          validateHeaders(parsed[0])
        }
      }
      reader.readAsText(selectedFile)
    } else {
      // Excel support using xlsx library
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const parsed = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as string[][]

        // Show only first 6 rows for preview
        const preview = parsed.slice(0, 6)
        setPreviewData(preview)

        if (preview.length > 0) {
          validateHeaders(preview[0])
        }
      }
      reader.readAsArrayBuffer(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) processFile(e.dataTransfer.files[0])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFile(e.target.files[0])
  }

  const clearFile = () => {
    setFile(null)
    setPreviewData([])
    setUploadResult(null)
    setValidationError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)
    try {
      const result = await uploadMutation.mutateAsync(formData)
      setUploadResult(result)
    } catch (error: any) {
      const serverData = error.response?.data || {}
      setUploadResult({
        message: serverData.error || 'Upload failed',
        error_count: 1,
        success_count: 0,
        errors: serverData.note
          ? [serverData.note]
          : [error.message || 'Unknown error'],
      } as BulkUploadResponse)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/students')}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#1a1a2e] truncate">
            Bulk Upload {studentPlural}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Import multiple {studentPlural.toLowerCase()} using CSV or Excel
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-semibold text-slate-800">Upload File</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownloadTemplate}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium whitespace-nowrap"
                >
                  Download Template
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 whitespace-nowrap">Mode:</span>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'create' | 'update')}
                    className="text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 py-1 px-3"
                  >
                    <option value="create">Create New</option>
                    <option value="update">Update Existing</option>
                  </select>
                </div>
              </div>
            </div>

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                  isDragging
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/50'
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                />
                <div className="mx-auto h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-base font-medium text-slate-900">Click or drag &amp; drop</p>
                <p className="text-sm text-slate-500 mt-1">CSV or Excel files only</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={clearFile}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white text-sm font-medium rounded-2xl hover:bg-orange-600 disabled:opacity-70 transition-all shadow-sm whitespace-nowrap"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Start Import
                  </button>
                </div>
              </div>
            )}

            {/* Validation message */}
            {validationError && (
              <div className="mt-4 text-amber-600 text-sm flex items-center gap-2 bg-amber-50 p-3 rounded-xl">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {validationError}
              </div>
            )}
          </div>

          {/* Preview Area – now always visible after file selection */}
          {previewData.length > 0 && !uploadResult && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Data Preview</h2>
                  <p className="text-xs text-slate-500">First 5 rows shown</p>
                </div>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full border-collapse border border-slate-300">
                  <thead className="bg-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="w-10 border border-slate-300 bg-slate-200 px-2 py-1 text-center text-xs font-medium text-slate-600"></th>
                      {previewData[0].map((_, i) => (
                        <th
                          key={i}
                          className="border border-slate-300 bg-slate-200 px-4 py-1 text-center text-xs font-medium text-slate-600"
                        >
                          {String.fromCharCode(65 + i)}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="w-10 border border-slate-300 bg-slate-100 px-2 py-2 text-center text-xs font-medium text-slate-500">1</th>
                      {previewData[0].map((header, i) => (
                        <th
                          key={i}
                          className="border border-slate-300 px-4 py-2 text-left text-xs font-bold text-slate-700 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {previewData.slice(1).map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                      >
                        <td className="w-10 border border-slate-300 bg-slate-100 px-2 py-2 text-center text-xs font-medium text-slate-500">
                          {rowIndex + 2}
                        </td>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border border-slate-300 px-4 py-2 whitespace-nowrap text-sm text-slate-800 font-mono"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results Area – now correctly shows server errors */}
          {uploadResult && (
            <div
              className={cn(
                'rounded-2xl shadow-sm border overflow-hidden',
                uploadResult.error_count > 0 && (uploadResult.success_count || 0) === 0
                  ? 'border-rose-200'
                  : uploadResult.error_count > 0
                  ? 'border-amber-200'
                  : 'border-emerald-200'
              )}
            >
              <div
                className={cn(
                  'px-6 py-4 border-b flex items-center gap-3',
                  uploadResult.error_count > 0 && (uploadResult.success_count || 0) === 0
                    ? 'bg-rose-50 border-rose-100'
                    : uploadResult.error_count > 0
                    ? 'bg-amber-50 border-amber-100'
                    : 'bg-emerald-50 border-emerald-100'
                )}
              >
                {uploadResult.error_count > 0 && (uploadResult.success_count || 0) === 0 ? (
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                ) : uploadResult.error_count > 0 ? (
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                )}
                <h2 className="text-lg font-semibold text-slate-800">{uploadResult.message}</h2>
              </div>
              <div className="p-6 bg-white space-y-6">
                <div className="flex gap-8">
                  {uploadResult.success_count !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Successfully {mode === 'create' ? 'Created' : 'Updated'}
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {uploadResult.success_count}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-500">Errors</p>
                    <p className="text-3xl font-bold text-rose-600">
                      {uploadResult.error_count}
                    </p>
                  </div>
                </div>
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 mb-2">Error Details</h3>
                    <div className="bg-rose-50 rounded-2xl p-4 max-h-60 overflow-y-auto">
                      <ul className="list-disc list-inside space-y-1 text-sm text-rose-700">
                        {uploadResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Required Format</h3>
            <p className="text-sm text-slate-600 mb-4">
              Your file must include the following columns exactly as written:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 font-mono bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <li>registration_number <span className="text-slate-400 text-xs">(optional)</span></li>
              <li>first_name <span className="text-rose-500">*</span></li>
              <li>last_name <span className="text-rose-500">*</span></li>
              <li>class_name <span className="text-rose-500">*</span></li>
              <li>department_name <span className="text-slate-400 text-xs">(optional)</span></li>
              <li>email <span className="text-slate-400 text-xs">(optional)</span></li>
            </ul>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Example Row</h4>
              <div className="bg-slate-900 text-slate-300 p-3 rounded-2xl text-xs font-mono overflow-x-auto whitespace-nowrap">
                S2025-001,John,Doe,Form 2,Electricity,john@school.cm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}