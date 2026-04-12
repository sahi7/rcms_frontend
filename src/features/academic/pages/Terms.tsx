// src/features/academic/pages/Terms.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, FilterIcon } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { Term, PaginatedResponse, AcademicYear } from '@/types/academic';
import { termsApi } from '../hooks/terms';
import { academicYearsApi } from '../hooks/academicyear';
import { Can } from '@/hooks/shared/useHasPermission';
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';
import { useGPA } from '@/features/settings/hooks/useInstitution';

/**
 * Zod schema for validating term form data.
 */
const termSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  academic_year: z.string().min(1, 'Academic year is required'),
  term_number: z.number().min(1).max(4, 'Term number must be between 1 and 4'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
});

/**
 * Main page for managing academic periods (terms).
 * Uses dynamic labeling based on institution configuration.
 */
export function Terms() {
  const [response, setResponse] = useState<PaginatedResponse<Term> | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Term | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Term | null>(null);

  // States for collapsible status section and sensitive completion confirmation
  const [isStatusesOpen, setIsStatusesOpen] = useState(false);
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);

  // Institution configuration for dynamic labeling
  const isGPA = useGPA()
  const { getPlural, getLabel } = useInstitutionConfig();

  const [formData, setFormData] = useState<Partial<Term>>({
    name: '',
    academic_year: '',
    term_number: 1,
    start_date: '',
    end_date: '',
    is_results_published: false,
    is_resit: false,
    is_completed: false,
  });

  /**
   * Finds the currently active academic year.
   */
  const currentAcademicYear = academicYears.find((ay) => ay.is_current);

  /**
   * Extracts a user-friendly error message from various error formats (Zod, server, etc.).
   */
  const getErrorMessage = (error: any): string => {
    if (!error) return 'An unexpected error occurred';

    // Zod validation error
    if (error.issues && Array.isArray(error.issues)) {
      return error.issues[0]?.message || 'Validation failed';
    }

    // Server error response
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
        return data.non_field_errors[0];
      }
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const value = data[firstKey];
        if (Array.isArray(value) && value.length > 0) return value[0];
        if (typeof value === 'string') return value;
      }
    }
    return error.message || 'An unexpected error occurred';
  };

  /**
   * Fetches all academic years for the filter dropdown and new term creation.
   */
  const fetchAcademicYears = useCallback(async () => {
    try {
      const data = await academicYearsApi.getAll('', 1, 100);
      setAcademicYears(data.data);
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
    }
  }, []);

  /**
   * Fetches terms with server-side filtering by search term, page, and academic year.
   */
  const fetchTerms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await termsApi.getAll(searchTerm, currentPage, pageSize, selectedYear);
      setResponse(data);
    } catch (error) {
      console.error('Failed to fetch terms:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, pageSize, selectedYear]);

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  /**
   * Opens the add or edit modal and pre-fills form data when editing.
   */
  const handleOpenModal = (item?: Term) => {
    setIsStatusesOpen(false);
    setShowCompletionConfirm(false);

    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        academic_year: currentAcademicYear?.id || '',
        term_number: 1,
        start_date: '',
        end_date: '',
        is_results_published: false,
        is_resit: false,
        is_completed: false,
      });
    }
    setIsModalOpen(true);
  };

  /**
   * Validates and saves (create or update) a term.
   * Includes date range validation against the academic year.
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Zod validation
    const validationResult = termSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues?.[0];
      toast.error(firstError?.message || 'Please check the form fields');
      return;
    }

    // Find selected academic year for date validation
    const selectedAY = academicYears.find((ay) => ay.id === formData.academic_year);
    if (!selectedAY) {
      toast.error('Selected academic year not found');
      return;
    }

    // Extra validation: Term dates must be inside academic year dates
    const termStart = new Date(formData.start_date!);
    const termEnd = new Date(formData.end_date!);
    const ayStart = new Date(selectedAY.start_date);
    const ayEnd = new Date(selectedAY.end_date);

    if (termStart < ayStart || termEnd > ayEnd) {
      toast.error(`${getLabel('academic_period')} dates must be within the academic year (${selectedAY.name})`);
      return;
    }

    try {
      if (editingItem?.id) {
        await termsApi.update(editingItem.id, formData);
        toast.success(`${getLabel('academic_period')} updated successfully`);
      } else {
        await termsApi.create(formData);
        toast.success(`${getLabel('academic_period')} created successfully`);
      }
      setIsModalOpen(false);
      fetchTerms();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  /**
   * Deletes the selected term after confirmation.
   */
  const handleDelete = async () => {
    if (!itemToDelete?.id) return;
    try {
      await termsApi.delete(itemToDelete.id);
      toast.success(`${getLabel('academic_period')} deleted successfully`);
      fetchTerms();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  /**
   * Sets a term as the current active term.
   */
  const handleSetAsCurrent = async (id: string) => {
    try {
      await termsApi.setAsCurrent(id);
      toast.success(`${getLabel('academic_period')} set as current successfully`);
      fetchTerms();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Fallback table response when data is not loaded
  const tableResponse: PaginatedResponse<Term> = response ?? {
    data: [],
    pagination: {
      current_page: currentPage,
      page_size: pageSize,
      total_count: 0,
      total_pages: 1,
      has_next: false,
      has_previous: false,
    },
    search: { term: searchTerm, has_results: false },
    filters: {},
  };

  // Dynamic header text using institution config
  const termHeader = `${getLabel('academic_period')}`;
  const modalTitle = editingItem
    ? `Edit ${termHeader}`
    : `Add ${termHeader}`;

  const columns = [
    {
      header: 'Name',
      accessor: (item: Term) => (
        <span className={item.is_completed ? 'line-through text-slate-400' : ''}>
          {item.name}
        </span>
      )
    },
    { header: 'Academic Year', accessor: 'academic_year_name' as keyof Term },
    {
      header: `${termHeader} #`,
      accessor: 'term_number' as keyof Term
    },
    { header: 'Start Date', accessor: 'start_date' as keyof Term },
    { header: 'End Date', accessor: 'end_date' as keyof Term },
    {
      header: 'Status',
      accessor: (item: Term) => (
        <div className="flex flex-wrap gap-1">
          {item.is_current && <StatusBadge status="current" />}
          {item.is_completed && <StatusBadge status="completed" />}
          {item.is_results_published && <StatusBadge status="published" />}
          {item.is_resit && <StatusBadge status="resit" />}
          {!item.is_current && !item.is_completed && <StatusBadge status="inactive" />}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (item: Term) => (
        <div className="flex items-center gap-2">
          {/* Set as Current - only for non-current and non-completed terms */}
          {!item.is_current && !item.is_completed && (
            <Can permission="set_current.term">
              <button
                onClick={() => handleSetAsCurrent(item.id)}
                className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                Set as Current
              </button>
            </Can>
          )}

          {/* Edit Term */}
          <Can permission="change.term">
            <button
              onClick={() => handleOpenModal(item)}
              className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              Edit
            </button>
          </Can>

          {/* Delete Term */}
          <Can permission="delete.term">
            <button
              onClick={() => {
                setItemToDelete(item);
                setIsDeleteModalOpen(true);
              }}
              className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">{getPlural('academic_period')}</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage academic {getPlural('academic_period').toLowerCase()} and their statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Academic Year Filter */}
          <div className="relative">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white appearance-none"
            >
              <option value="">All Academic Years</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add New Term - permission protected */}
          <Can permission="add.term">
            <button
              onClick={() => handleOpenModal()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-500/20"
            >
              <PlusIcon className="w-4 h-4" />
              Add New
            </button>
          </Can>
        </div>
      </div>

      {/* Main DataTable */}
      <div className="flex-1 min-h-0">
        <DataTable
          data={tableResponse}
          columns={columns}
          onPageChange={setCurrentPage}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          searchTerm={searchTerm}
          onEdit={handleOpenModal}
          onDelete={(item) => {
            setItemToDelete(item);
            setIsDeleteModalOpen(true);
          }}
          loading={loading}
          actions={false}
        />
      </div>

      {/* Add/Edit Term Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                required
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
              <select
                required
                value={formData.academic_year || ''}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="">Select Year</option>
                {currentAcademicYear && (
                  <option key={currentAcademicYear.id} value={currentAcademicYear.id}>
                    {currentAcademicYear.name}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {getLabel('academic_period')} Number
              </label>
              <input
                required
                type="number"
                min="1"
                max="4"
                value={formData.term_number || ''}
                onChange={(e) => setFormData({ ...formData, term_number: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                required
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                required
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Resit Term Toggle - always visible */}
          {isGPA && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="font-medium text-slate-700">Resit {getLabel('academic_period')}</div>
                <div className="text-xs text-slate-500">This {getLabel('academic_period')} is designated for resits only</div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_resit: !formData.is_resit })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${formData.is_resit ? 'bg-orange-500' : 'bg-slate-200'
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${formData.is_resit ? 'translate-x-5' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          )}

          {/* Status Settings - collapsible, shown only when editing */}
          {editingItem && (
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusesOpen(!isStatusesOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <span className="flex items-center gap-2">Status Settings</span>
                <span className={`text-xl transition-transform duration-300 ${isStatusesOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isStatusesOpen ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="space-y-3 px-1">
                  {/* Mark as Completed - sensitive toggle with confirmation */}
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      disabled={formData.is_completed || false}
                      onClick={() => {
                        if (formData.is_completed) return;
                        setShowCompletionConfirm(true);
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${(formData.is_completed || showCompletionConfirm) ? 'bg-emerald-500' : 'bg-slate-200'
                        } ${(formData.is_completed || false) ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${(formData.is_completed || showCompletionConfirm) ? 'translate-x-5' : 'translate-x-1'
                          }`}
                      />
                    </button>

                    <div className="flex-1 text-sm">
                      <div className="font-medium text-slate-700">Mark as completed</div>
                      <div className="text-xs text-slate-500">This {termHeader} has ended and is now closed</div>
                      <div className="text-xs text-amber-600 mt-px">This action cannot be undone.</div>
                    </div>

                    {showCompletionConfirm && !(formData.is_completed || false) && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCompletionConfirm(false)}
                          className="px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (editingItem?.id) {
                              try {
                                await termsApi.setAsCompleted(editingItem.id);
                              } catch (error) {
                                toast.error(getErrorMessage(error));
                                return;
                              }
                            }
                            setFormData({ ...formData, is_completed: true });
                            setShowCompletionConfirm(false);
                            toast.success('Term marked as completed');
                          }}
                          className="h-8 w-8 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors"
                        >
                          ✓
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Results Published Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="font-medium text-slate-700">Results Published</div>
                      <div className="text-xs text-slate-500">
                        Results for the {termHeader} is available and students can check their portal
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_results_published: !formData.is_results_published })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${formData.is_results_published ? 'bg-orange-500' : 'bg-slate-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${formData.is_results_published ? 'translate-x-5' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm shadow-orange-500/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete the {getLabel('academic_period')}{' '}
            <span className="font-semibold text-slate-800">{itemToDelete?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}