// src/features/academic/pages/AcademicYears.tsx
import { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { AcademicYear, PaginatedResponse } from '@/types/academic';
import { academicYearsApi } from '../hooks/academicyear';
import { Can } from '@/hooks/shared/useHasPermission';
import { toast } from 'sonner';

const academicYearSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    is_completed: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.end_date) > new Date(data.start_date);
    },
    {
      message: 'End date must be after start date',
      path: ['end_date'],
    }
  );

type FormData = z.infer<typeof academicYearSchema>;

export function AcademicYears() {
  const [response, setResponse] = useState<PaginatedResponse<AcademicYear> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AcademicYear | null>(null);
  const [serverError, setServerError] = useState<string>('');
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      is_completed: false,
    },
  });

  const watchedIsCompleted = watch('is_completed') ?? false;

  // Fetch data
  const fetchAcademicYears = useCallback(async () => {
    try {
      setLoading(true);
      const data = await academicYearsApi.getAll(searchTerm, currentPage, pageSize);
      setResponse(data);
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
      toast.error('Failed to load academic years');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, pageSize]);

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  // Open modal
  const handleOpenModal = (item?: AcademicYear) => {
    setServerError('');
    setShowCompletionConfirm(false);
    if (item) {
      setEditingItem(item);
      setValue('name', item.name);
      setValue('start_date', item.start_date);
      setValue('end_date', item.end_date);
      setValue('is_completed', item.is_completed ?? false);
    } else {
      setEditingItem(null);
      reset({ name: '', start_date: '', end_date: '', is_completed: false });
    }
    setIsModalOpen(true);
  };

  // Save (create or update)
  const onSubmit = async (formData: FormData) => {
    setServerError('');
    try {
      if (editingItem?.id) {
        await academicYearsApi.update(editingItem.id, formData);
        toast.success('Academic year updated successfully');
      } else {
        await academicYearsApi.create(formData);
        toast.success('Academic year created successfully');
      }
      setIsModalOpen(false);
      fetchAcademicYears(); // refresh list
    } catch (error: any) {
      console.error('Save error:', error);

      if (error.response?.data) {
        const serverData = error.response.data;

        if (serverData.non_field_errors && Array.isArray(serverData.non_field_errors)) {
          setServerError(serverData.non_field_errors[0]);
          return;
        }

        if (serverData.start_date) setServerError(serverData.start_date[0]);
        else if (serverData.end_date) setServerError(serverData.end_date[0]);
        else if (serverData.name) setServerError(serverData.name[0]);
        else if (typeof serverData === 'string') setServerError(serverData);
        else setServerError('An unexpected error occurred. Please try again.');
      } else {
        setServerError('Failed to save. Please check your connection.');
      }
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!itemToDelete?.id) return;
    try {
      await academicYearsApi.delete(itemToDelete.id);
      toast.success('Academic year deleted');
      fetchAcademicYears();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete');
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Set as Current (only for past years)
  const handleSetAsCurrent = async (id: string) => {
    try {
      await academicYearsApi.setAsCurrent(id);
      toast.success('Academic year set as current');
      fetchAcademicYears();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to set as current');
    }
  };

  // Fallback table data
  const tableResponse: PaginatedResponse<AcademicYear> = response ?? {
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

  const columns = [
    { 
      header: 'Name', 
      accessor: (item: AcademicYear) => (
        <span className={item.is_completed ? 'line-through text-slate-400' : ''}>
          {item.name}
        </span>
      ) 
    },
    { header: 'Start Date', accessor: 'start_date' as keyof AcademicYear },
    { header: 'End Date', accessor: 'end_date' as keyof AcademicYear },
    {
      header: 'Status',
      accessor: (item: AcademicYear) => {
        if (item.is_completed) {
          return (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              Completed
            </span>
          );
        }
        return (
          <StatusBadge status={item.is_current ? 'current' : 'inactive'} label={item.is_current ? 'Current' : 'Past'} />
        );
      },
    },
    {
      header: 'Actions',
      accessor: (item: AcademicYear) => (
        <div className="flex items-center gap-2">
          {!item.is_current && !item.is_completed && (
            <Can permission="set_current.academicyear">
              <button
                onClick={() => handleSetAsCurrent(item.id)}
                className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                Set as Current
              </button>
            </Can>
          )}

          {item.is_current && (
            <Can permission="change.academicyear">
              <button
                onClick={() => handleOpenModal(item)}
                className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
              >
                Edit
              </button>
            </Can>
          )}

          <Can permission="delete.academicyear">
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
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Academic Years</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage academic years and their durations.</p>
        </div>

        <Can permission="add.academicyear">
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-500/20"
          >
            <PlusIcon className="w-4 h-4" />
            Add New
          </button>
        </Can>
      </div>

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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setServerError('');
        }}
        title={editingItem ? 'Edit Academic Year' : 'Add Academic Year'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              placeholder="e.g. 2024/2025"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                {...register('end_date')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
            </div>
          </div>

          {/* is_completed Toggle - Edit only */}
          {editingItem && (
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Completed</label>
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <button
                  type="button"
                  disabled={watchedIsCompleted}
                  onClick={() => {
                    if (watchedIsCompleted) return;
                    setShowCompletionConfirm(true);
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                    watchedIsCompleted || showCompletionConfirm ? 'bg-emerald-500' : 'bg-slate-200'
                  } ${watchedIsCompleted ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      watchedIsCompleted || showCompletionConfirm ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>

                <div className="flex-1 text-sm">
                  <div className="font-medium text-slate-700">Mark as completed</div>
                  <div className="text-xs text-amber-600">This action cannot be undone.</div>
                </div>

                {showCompletionConfirm && !watchedIsCompleted && (
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
                      onClick={() => {
                        setValue('is_completed', true);
                        setShowCompletionConfirm(false);
                        toast.success('Academic year marked as completed');
                      }}
                      className="h-8 w-8 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors"
                    >
                      ✓
                    </button>
                  </div>
                )}
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
            Are you sure you want to delete the academic year{' '}
            <span className="font-semibold text-slate-800">{itemToDelete?.name}</span>? This action cannot be undone.
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