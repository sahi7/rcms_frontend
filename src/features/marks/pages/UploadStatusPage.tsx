// src/features/marks/pages/UploadStatusPage.tsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2Icon,
  FilterIcon,
  ClipboardCheckIcon,
  XIcon,
  CalendarIcon,
  UserIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { SearchableSelect } from '@/components/SearchableSelect';
import { useUploadStatus } from '@/features/marks/hooks/useMarks';
import { useListQuery } from '@/hooks/shared/useApiQuery';
import type { Sequence } from '@/types/academic';
import { useTerms } from '@/features/academic/hooks/terms';
import { useDepartments } from '../../structure/hooks/useDepartments';
import { useSubjects } from '@/features/curriculum/hooks/useSubjects';
import { useClassRooms } from '../../structure/hooks/useClassRooms';
import { useTeachers } from '@/hooks/shared/useUsers';
import { formatDate } from '@/lib/utils';
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';
import { useAuthStore } from '@/app/store/authStore';  

/**
 * Page that displays the status of mark uploads across subjects, teachers, classes, etc.
 * Supports filtering and infinite scrolling with enriched display names.
 */
export function UploadStatusPage() {
  const navigate = useNavigate();

  // Get current user and check role
  const { user } = useAuthStore();
  const isTeacher = user?.role?.toLowerCase() === 'teacher';

  // Institution configuration for dynamic labeling
  const { getLabel, getPlural } = useInstitutionConfig();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    term?: string;
    department?: string;
    teacher?: string;
    subject?: string;
    class?: string;
    sequence?: string;
  }>({
    // Default teacher filter for teachers (sent to backend)
    ...(isTeacher && user?.id ? { teacher: String(user.id) } : {}),
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Supporting data fetches
  const { data: termsData } = useTerms();
  const { data: sequencesData } = useListQuery<Sequence>('sequences', '/sequence/', { page_size: 100 });
  const { data: deptsData } = useDepartments();
  const { data: subjectsData } = useSubjects();
  const { data: classroomsData } = useClassRooms();
  // Do NOT run useTeachers when user is teacher
  const { data: teachersData } = isTeacher 
    ? { data: undefined } 
    : useTeachers({ page_size: 300 });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useUploadStatus({
    ...filters,
  });

  /**
   * Flattens all paginated results into a single array.
   */
  const allResults = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.results);
  }, [data]);

  /**
   * Enriches raw upload records with human-readable names from related entities.
   */
  const enrichedResults = useMemo(() => {
    return allResults.map((item) => {
      const subject = subjectsData?.data?.find((s: any) => s.id === item.subject_id);
      const classroom = classroomsData?.data?.find((c: any) => c.id === item.class_room_id);
      const department = deptsData?.data?.find((d: any) => d.id === item.department_id);

      // ONLY CHANGE: teacher and createdBy lookups are removed for teacher mode
      const teacher = !isTeacher ? teachersData?.data?.find((t: any) => t.id === item.teacher_id) : null;
      const createdBy = !isTeacher ? teachersData?.data?.find((t: any) => t.id === item.created_by_id) : null;

      return {
        ...item,
        subjectName: subject
          ? `${subject.name} (${subject.code})`
          : `${getLabel('subject_naming')} #${item.subject_id}`,
        // teacherName is now direct from current user when in teacher mode
        teacherName: isTeacher
          ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Teacher'
          : teacher
            ? `${teacher.first_name} ${teacher.last_name}`
            : `${getLabel('instructor_title')} #${item.teacher_id}`,
        className: classroom
          ? classroom.name
          : `${getLabel('class_progression_name')} #${item.class_room_id}`,
        departmentName: department ? department.name : null,
        createdByName: item.created_by_id === user?.id
          ? 'You'
          : createdBy
            ? `${createdBy.first_name} ${createdBy.last_name}`
            : `User #${item.created_by_id}`,
      };
    });
  }, [allResults, subjectsData, classroomsData, deptsData, getLabel, isTeacher, user, teachersData]);

  /**
   * Handles infinite scroll: loads more data when user scrolls near the bottom.
   */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (
        el.scrollHeight - el.scrollTop - el.clientHeight < 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Filter options (memoized for performance)
  const termOptions = useMemo(
    () =>
      termsData?.data?.map((t: any) => ({
        value: String(t.id),
        label: t.name,
      })) || [],
    [termsData]
  );

  const seqOptions = useMemo(
    () =>
      sequencesData?.data?.map((s: any) => ({
        value: String(s.id),
        label: `${s.name} (${s.code})`,
      })) || [],
    [sequencesData]
  );

  const deptOptions = useMemo(
    () =>
      deptsData?.data?.map((d: any) => ({
        value: String(d.id),
        label: `${d.name} (${d.code})`,
      })) || [],
    [deptsData]
  );

  const subjectOptions = useMemo(
    () =>
      subjectsData?.data?.map((s: any) => ({
        value: String(s.id),
        label: `${s.name} (${s.code})`,
      })) || [],
    [subjectsData]
  );

  const classOptions = useMemo(
    () =>
      classroomsData?.data?.map((c: any) => ({
        value: String(c.id),
        label: c.name,
      })) || [],
    [classroomsData]
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Current term for preview link
  const currentTermId = filters.term || termsData?.data?.[0]?.id;

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Upload Status</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track {getPlural('subject_naming').toLowerCase()} mark upload progress
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 text-sm border rounded-lg flex items-center gap-2 transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'border-orange-300 bg-orange-50 text-orange-600'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FilterIcon className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-700">Filter Results</p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({})}
                className="text-xs text-orange-500 hover:text-orange-700 flex items-center gap-1"
              >
                <XIcon className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SearchableSelect
              label={getLabel('academic_period')}
              options={termOptions}
              value={filters.term || null}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  term: v ? String(v) : undefined,
                }))
              }
              placeholder={`All ${getPlural('academic_period').toLowerCase()}`}
            />

            <SearchableSelect
              label="Department"
              options={deptOptions}
              value={filters.department || null}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  department: v ? String(v) : undefined,
                }))
              }
              placeholder="All departments"
            />

            <SearchableSelect
              label="Sequence"
              options={seqOptions}
              value={filters.sequence || null}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  sequence: v ? String(v) : undefined,
                }))
              }
              placeholder="All sequences"
            />

            <SearchableSelect
              label={getLabel('subject_naming')}
              options={subjectOptions}
              value={filters.subject || null}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  subject: v ? String(v) : undefined,
                }))
              }
              placeholder={`All ${getPlural('subject_naming').toLowerCase()}`}
            />

            <SearchableSelect
              label={getLabel('class_progression_name')}
              options={classOptions}
              value={filters.class || null}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  class: v ? String(v) : undefined,
                }))
              }
              placeholder={`All ${getPlural('class_progression_name').toLowerCase()}`}
            />
          </div>
        </motion.div>
      )}

      {/* Main Scrollable Results Table */}
      <div ref={scrollRef} className="flex-1 overflow-auto rounded-xl bg-white border border-slate-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2Icon className="w-7 h-7 animate-spin text-orange-500" />
            <span className="ml-3 text-slate-500">Loading status...</span>
          </div>
        ) : enrichedResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardCheckIcon className="w-10 h-10 mb-2" />
            <p className="text-sm">No upload records found</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-full">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-slate-500">
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">#</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  {getLabel('subject_naming')}
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  {getLabel('instructor_title')}
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  {getLabel('class_progression_name')}
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody>
              {enrichedResults.map((item, i) => (
                <React.Fragment key={item.id}>
                  {/* Main clickable row */}
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{item.id}</td>
                    <td className="px-5 py-3.5 text-slate-800 font-medium">{item.subjectName}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-2xl bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-700 flex-shrink-0">
                          {item.teacherName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="text-slate-700">{item.teacherName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{item.className}</td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge
                        status={item.is_resit ? 'resit' : 'active'}
                        label={item.is_resit ? 'Resit' : 'Regular'}
                      />
                    </td>
                  </motion.tr>

                  {/* Expanded details row */}
                  {expandedId === item.id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-slate-50"
                    >
                      <td colSpan={5} className="px-5 py-4">
                        <motion.div
                          initial={{ y: -8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                            {/* Created at */}
                            <div>
                              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                                <CalendarIcon className="w-3 h-3" />
                                CREATED
                              </div>
                              <div className="font-medium text-slate-800">
                                {formatDate(item.created_at, true)}
                              </div>
                            </div>

                            {/* Updated at */}
                            <div>
                              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                                <CalendarIcon className="w-3 h-3" />
                                LAST UPDATED
                              </div>
                              <div className="font-medium text-slate-800">
                                {formatDate(item.updated_at, true)}
                              </div>
                            </div>

                            {/* Created by */}
                            <div>
                              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                                <UserIcon className="w-3 h-3" />
                                CREATED BY
                              </div>
                              <div className="font-medium text-slate-800">{item.createdByName}</div>
                            </div>

                            {/* Department */}
                            {item.departmentName && (
                              <div>
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                                  DEPARTMENT
                                </div>
                                <div className="font-medium text-slate-800">{item.departmentName}</div>
                              </div>
                            )}

                            {/* Preview link */}
                            <div className="md:col-span-3 pt-4 border-t border-slate-100">
                              <button
                                onClick={() => {
                                  navigate(
                                    `/dashboard/marks/preview/${item.assignment_id}__${item.sequence_id}__${item.class_room_id}?term_id=${currentTermId}`
                                  );
                                }}
                                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer p-0"
                              >
                                <ExternalLinkIcon className="w-4 h-4" />
                                Preview this upload
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              ))}

              {isFetchingNextPage && (
                <tr>
                  <td colSpan={5} className="py-4 text-center">
                    <Loader2Icon className="w-5 h-5 animate-spin text-orange-500 mx-auto" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}