// src/features/academic/pages/StudyLevels.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { StudyLevel, PaginatedResponse } from '@/types/academic';
import { studyLevelsApi } from '../hooks/studylevels';
import { Can } from '@/hooks/shared/useHasPermission';

// Zod validation schema
const studyLevelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  duration_years: z.number().min(1, 'Duration must be at least 1 year'),
});

export function StudyLevels() {
  const [response, setResponse] = useState<PaginatedResponse<StudyLevel> | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudyLevel | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StudyLevel | null>(null);

  const [formData, setFormData] = useState<Partial<StudyLevel>>({
    name: '',
    code: '',
    duration_years: 1,
    is_active: true,
  });

  const getErrorMessage = (error: any): string => {
    if (!error) return 'An unexpected error occurred';

    // Zod validation error
    if (error.issues && Array.isArray(error.issues)) {
      return error.issues[0]?.message || 'Validation failed';
    }

    // Server error
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

  const fetchStudyLevels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await studyLevelsApi.getAll(searchTerm, currentPage, pageSize);
      setResponse(data);
    } catch (error) {
      console.error('Failed to fetch study levels:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, pageSize]);

  useEffect(() => {
    fetchStudyLevels();
  }, [fetchStudyLevels]);

  const handleOpenModal = (item?: StudyLevel) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        code: '',
        duration_years: 1,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = studyLevelSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues?.[0];
      toast.error(firstError?.message || 'Please check the form fields');
      return;
    }

    try {
      if (editingItem?.id) {
        await studyLevelsApi.update(editingItem.id, formData);
        toast.success('Study level updated successfully');
      } else {
        await studyLevelsApi.create(formData);
        toast.success('Study level created successfully');
      }
      setIsModalOpen(false);
      fetchStudyLevels();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete?.id) return;
    try {
      await studyLevelsApi.delete(itemToDelete.id);
      toast.success('Study level deleted successfully');
      fetchStudyLevels();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const tableResponse: PaginatedResponse<StudyLevel> = response ?? {
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
    { header: 'Name', accessor: 'name' as keyof StudyLevel },
    { header: 'Code', accessor: 'code' as keyof StudyLevel },
    { header: 'Duration (Years)', accessor: 'duration_years' as keyof StudyLevel },
    {
      header: 'Status',
      accessor: (item: StudyLevel) => (
        <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      header: 'Actions',
      accessor: (item: StudyLevel) => (
        <div className="flex items-center gap-2">
          <Can permission="change.study_level">
            <button
              onClick={() => handleOpenModal(item)}
              className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              Edit
            </button>
          </Can>
          <Can permission="delete.study_level">
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
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Study Levels</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage educational levels and grades.</p>
        </div>

        <Can permission="add.study_level">
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
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Study Level' : 'Add Study Level'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              required
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              placeholder="e.g. Undergraduate"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
              <input
                required
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="e.g. G1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Years)</label>
              <input
                required
                type="number"
                min="1"
                value={formData.duration_years || ''}
                onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
          </div>
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
            Are you sure you want to delete the study level{' '}
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