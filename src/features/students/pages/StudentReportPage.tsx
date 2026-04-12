import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  SearchIcon,
  Loader2Icon,
  GraduationCapIcon,
  TrophyIcon,
  BookOpenIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertTriangleIcon,
} from 'lucide-react'
import { SearchableSelect } from '@/components/SearchableSelect'
import { useStudentReport } from '@/features/marks/hooks/useMarks'
import { useParams } from 'react-router-dom';
import { useTerms } from '@/features/academic/hooks/terms'
import { useSequence } from '@/features/academic/hooks/sequence'
import type {
  StudentReportTermResponse,
  StudentReportSequenceResponse,
  SubjectReport,
  SequenceSubjectReport,
} from '@/types/marks'
import { useGPA } from '@/features/settings/hooks/useInstitution'


function isTermResponse(r: any): r is StudentReportTermResponse {
  return (
    r &&
    'term' in r &&
    'subjects' in r &&
    typeof r.subjects === 'object' &&
    'core' in r.subjects
  )
}
function GradeChip({ grade, passed }: { grade: string; passed?: boolean }) {
  const colors: Record<string, string> = {
    'A+': 'bg-emerald-100 text-emerald-800',
    A: 'bg-emerald-100 text-emerald-700',
    'A-': 'bg-emerald-50 text-emerald-700',
    'B+': 'bg-blue-100 text-blue-700',
    B: 'bg-blue-100 text-blue-700',
    'B-': 'bg-blue-50 text-blue-600',
    'C+': 'bg-amber-100 text-amber-700',
    C: 'bg-amber-100 text-amber-700',
    D: 'bg-orange-100 text-orange-700',
    F: 'bg-red-100 text-red-700',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${colors[grade] || 'bg-slate-100 text-slate-700'}`}
    >
      {grade}
    </span>
  )
}

type Props = {
  studentId?: string
}

export function StudentReportPage({ studentId: propStudentId }: Props) {
  // This should work on for props and standalone page
  const { studentId: paramStudentId } = useParams<{ studentId: string }>()
  const resolvedStudentId = propStudentId || paramStudentId || ''
  const [inputStudentId, setInputStudentId] = useState(resolvedStudentId)

  const isLocked = !!propStudentId

  // Important: sync when prop/URL changes
  useEffect(() => {
    setInputStudentId(resolvedStudentId)
  }, [resolvedStudentId])



  const [mode, setMode] = useState<'term' | 'sequence'>('term')
  const [termId, setTermId] = useState<string | null>(null)
  const [sequenceId, setSequenceId] = useState<string | null>(null)
  const { data: termsData } = useTerms()
  const { data: seqData } = useSequence()
  const isGPA = useGPA()

  const sequenceMap = React.useMemo(() => {
    const map = new Map<number, string>()
    seqData?.data.forEach(seq => {
      map.set(seq.id as unknown as number, seq.code);
    })
    return map
  }, [seqData])

  const queryParams = useMemo(() => {
    if (mode === 'term' && termId)
      return {
        term_id: termId,
      }
    if (mode === 'sequence' && sequenceId)
      return {
        sequence_id: sequenceId,
      }
    return {}
  }, [mode, termId, sequenceId])
  const canFetch = !!inputStudentId && (mode === 'term' ? !!termId : !!sequenceId)
  const {
    data: report,
    isLoading,
    error,
  } = useStudentReport(inputStudentId, queryParams, canFetch)
  const termOptions = useMemo(
    () =>
      termsData?.data?.map((t) => ({
        value: t.id,
        label: t.name,
      })) || [],
    [termsData],
  )
  const seqOptions = useMemo(
    () =>
      seqData?.data?.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.code})`,
      })) || [],
    [seqData],
  )
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Student Performance Report
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View detailed academic performance for a student
        </p>
      </div>

      {/* Search controls */}
      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {!isLocked && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Student ID <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  disabled={isLocked}
                  value={inputStudentId}
                  onChange={(e) => setInputStudentId(e.target.value)}
                  placeholder="Enter student ID or registration number..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          )}
          <div className="w-40">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              View by
            </label>
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setMode('term')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${mode === 'term' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                Term
              </button>
              <button
                onClick={() => setMode('sequence')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${mode === 'sequence' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                Sequence
              </button>
            </div>
          </div>
          <div className=" flex  gap-4">
            {mode === 'term' ? (
              <SearchableSelect
                label="Term"
                required
                options={termOptions}
                value={termId}
                onChange={(v) => setTermId(v ? String(v) : null)}
                placeholder="Select term..."
              />
            ) : (
              <SearchableSelect
                label="Sequence"
                required
                options={seqOptions}
                value={sequenceId}
                onChange={(v) => setSequenceId(v ? String(v) : null)}
                placeholder="Select sequence..."
              />
            )}
          </div>
        </div>

      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2Icon className="w-7 h-7 animate-spin text-orange-500" />
          <span className="ml-3 text-slate-500">Loading report...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangleIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-700 font-medium">
            {(error as any)?.response?.data?.error || 'Failed to load report'}
          </p>
        </div>
      )}

      {/* Report */}
      {report && !isLoading && (
        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="space-y-6"
        >
          {/* Overall summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-emerald-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrophyIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  {isGPA
                    ? 'GPA'
                    : 'AVERAGE'}
                  
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {isGPA
                    ? report.overall.grade
                    : report.overall.average.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-blue-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <BarChart3Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Grade
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {report.overall.grade}
                </p>
              </div>
            </div>
            {isTermResponse(report) && (
              <>
                <div className="bg-white rounded-xl border border-purple-100 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Credits
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      {report.overall.earned_credits}/
                      {report.overall.attempted_credits}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-orange-100 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <GraduationCapIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Period
                    </p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {report.term.name}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Term mode: core + elective tables */}
          {isTermResponse(report) ? (
            <>
              <SubjectTable
                title="Core Subjects"
                subjects={report.subjects.core}
                icon={BookOpenIcon}
                sequenceMap={sequenceMap}
              />
              {report.subjects.elective.length > 0 && (
                <SubjectTable
                  title="Elective Subjects"
                  subjects={report.subjects.elective}
                  icon={GraduationCapIcon}
                  sequenceMap={sequenceMap}
                />
              )}
            </>
          ) : (
            <SequenceTable
              subjects={(report as StudentReportSequenceResponse).subjects}
            />
          )}
        </motion.div>
      )}
    </div>
  )
}
function SubjectTable({
  title,
  subjects,
  icon: Icon,
  sequenceMap,
}: {
  title: string
  subjects: SubjectReport[]
  icon: React.ElementType
  sequenceMap: Map<number, string>
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <Icon className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-400 ml-auto">
          {subjects.length} subject(s)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Subject
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Credits
              </th>
              {subjects[0]?.sequences_marks?.map((m, i) => {
                const seqName = sequenceMap.get(m.seq_id) || `Seq ${i + 1}`

                return (
                  <th
                    key={i}
                    className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider"
                  >
                    {seqName}
                  </th>
                )
              })}
              <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Final
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Grade
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub) => (
              <tr
                key={sub.subject_code}
                className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-800">{sub.subject}</p>
                  <p className="text-xs text-slate-400">{sub.subject_code}</p>
                </td>
                <td className="px-5 py-3.5 text-center text-slate-600">
                  {sub.credit_value}
                </td>
                {sub.sequences_marks.map((sm, i) => (
                  <td key={i} className="px-5 py-3.5 text-center">
                    <span
                      className={`font-medium ${sm.score !== null ? 'text-slate-700' : 'text-slate-300'}`}
                    >
                      {sm.score !== null ? sm.score : '—'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      /{sm.max_score}
                    </span>
                  </td>
                ))}
                <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                  {sub.final_mark.toFixed(1)}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <GradeChip grade={sub.grade} passed={sub.passed} />
                </td>
                <td className="px-5 py-3.5 text-center">
                  {sub.passed ? (
                    <CheckCircle2Icon className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-400 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
function SequenceTable({ subjects }: { subjects: SequenceSubjectReport[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <BookOpenIcon className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-semibold text-slate-800">Subjects</h3>
        <span className="text-xs text-slate-400 ml-auto">
          {subjects.length} subject(s)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Subject
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Code
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Credits
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Score
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Grade
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider">
                GP
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Comment
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub) => (
              <tr
                key={sub.code}
                className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-5 py-3.5 font-medium text-slate-800">
                  {sub.subject}
                </td>
                <td className="px-5 py-3.5 text-center text-slate-500 font-mono text-xs">
                  {sub.code}
                </td>
                <td className="px-5 py-3.5 text-center text-slate-600">
                  {sub.credit_value}
                </td>
                <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                  {sub.score ?? '—'}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <GradeChip grade={sub.grade} />
                </td>
                <td className="px-5 py-3.5 text-center text-slate-600">
                  {sub.grade_point.toFixed(1)}
                </td>
                <td className="px-5 py-3.5 text-slate-500 text-xs">
                  {sub.comment || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
