// src/features/marks/pages/GenerateReportTab.tsx
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileTextIcon,
  DownloadIcon,
  Loader2Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  SchoolIcon,
  BuildingIcon,
  CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTerms } from '@/features/academic/hooks/terms';
import { useClassRooms } from '@/features/structure/hooks/useClassRooms';
import { useDepartments } from '@/features/structure/hooks/useDepartments';
import { useGenerateReport } from '../hooks/useReports';
import { Can } from '@/hooks/shared/useHasPermission';
import { ClassRoom } from '@/types/structure';
import { GenerateReportResponse } from '@/types/reports';
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';

/**
 * Tab component for generating student report cards.
 * Allows selection of term, class, and optional department, then triggers report generation.
 */
export function GenerateReportTab() {
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [lastResult, setLastResult] = useState<GenerateReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Institution configuration for dynamic labeling
  const { getLabel, getPlural } = useInstitutionConfig();

  const { data: termsData, isLoading: termsLoading } = useTerms();
  const { data: classRoomsData, isLoading: classRoomsLoading } = useClassRooms();
  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments();

  const generateMutation = useGenerateReport(selectedTermId);

  const terms = termsData?.data ?? [];
  const classRooms = classRoomsData?.data ?? [];
  const departments = departmentsData?.data ?? [];

  const selectedClass: ClassRoom | undefined = classRooms.find(
    (c) => String(c.id) === selectedClassId
  );

  const needsDepartment = selectedClass?.has_departments ?? false;

  const filteredDepartments = departments.filter((d) =>
    selectedClass ? d.class_rooms.includes(selectedClass.id) : false
  );

  const canGenerate =
    selectedTermId &&
    selectedClassId &&
    (!needsDepartment || selectedDepartmentId);

  /**
   * Handles class selection and resets dependent fields.
   */
  const handleClassChange = useCallback((value: string) => {
    setSelectedClassId(value);
    setSelectedDepartmentId('');
    setLastResult(null);
    setError(null);
  }, []);

  /**
   * Prepares payload and triggers report generation.
   */
  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    setError(null);
    setLastResult(null);

    const payload: {
      class_id: number;
      department_id?: number;
    } = {
      class_id: Number(selectedClassId),
    };

    if (needsDepartment && selectedDepartmentId) {
      payload.department_id = Number(selectedDepartmentId);
    }

    generateMutation.mutate(payload, {
      onSuccess: (data) => setLastResult(data),
      onError: (err: any) => {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          `Failed to generate ${getPlural('class_progression_name').toLowerCase()} reports`;
        setError(msg);
      },
    });
  }, [
    canGenerate,
    selectedClassId,
    needsDepartment,
    selectedDepartmentId,
    generateMutation,
    getPlural,
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-orange-500" />
            Generate Report Cards
          </CardTitle>
          <CardDescription>
            Select a {getLabel('academic_period').toLowerCase()}, {getLabel('class_progression_name').toLowerCase()}, and optionally a department to generate
            student report cards as a downloadable ZIP file.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Term Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              {getLabel('academic_period')} <span className="text-red-400">*</span>
            </label>
            <Select
              value={selectedTermId}
              onValueChange={(v) => {
                setSelectedTermId(v);
                setLastResult(null);
                setError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    termsLoading
                      ? `Loading ${getPlural('academic_period').toLowerCase()}...`
                      : `Select a ${getLabel('academic_period').toLowerCase()}`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={String(term.id)}>
                    {term.name}
                    {term.is_current ? ' (Current)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <SchoolIcon className="w-3.5 h-3.5 text-slate-400" />
              {getLabel('class_progression_name')} <span className="text-red-400">*</span>
            </label>
            <Select value={selectedClassId} onValueChange={handleClassChange}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    classRoomsLoading
                      ? `Loading ${getPlural('class_progression_name').toLowerCase()}...`
                      : `Select a ${getLabel('class_progression_name').toLowerCase()}`
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {classRooms.map((cr) => (
                  <SelectItem key={cr.id} value={String(cr.id)}>
                    {cr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Selection (conditional) */}
          <AnimatePresence>
            {needsDepartment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <BuildingIcon className="w-3.5 h-3.5 text-slate-400" />
                  Department <span className="text-red-400">*</span>
                </label>
                <Select
                  value={selectedDepartmentId}
                  onValueChange={(v) => {
                    setSelectedDepartmentId(v);
                    setLastResult(null);
                    setError(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        departmentsLoading
                          ? 'Loading...'
                          : 'Select a department'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={String(dept.id)}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filteredDepartments.length === 0 && !departmentsLoading && (
                  <p className="text-xs text-amber-600">
                    No departments found for this {getLabel('class_progression_name').toLowerCase()}.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button - permission protected */}
          <Can permission="generate_reports.term">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || generateMutation.isPending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  Generating Reports...
                </>
              ) : (
                <>
                  <FileTextIcon className="w-4 h-4 mr-2" />
                  Generate Report Cards
                </>
              )}
            </Button>
          </Can>
        </CardContent>
      </Card>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4 flex items-center gap-3">
                <AlertCircleIcon className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Generation Failed
                  </p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success State with Download */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          >
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-800">
                      Reports Generated Successfully!
                    </p>
                    <p className="text-sm text-emerald-600 mt-0.5">
                      {lastResult.message}
                    </p>
                    <a
                      href={lastResult.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3"
                    >
                      <Button
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download ZIP
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}