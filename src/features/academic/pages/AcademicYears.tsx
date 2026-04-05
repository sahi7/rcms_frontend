// src/features/academic/pages/AcademicYears.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { AcademicYear, PaginatedResponse } from '@/types/academic';
import { academicYearsApi } from '../hooks/academicYear';
import { Can } from '@/hooks/shared/useHasPermission';

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

  const [formData, setFormData] = useState<Partial<AcademicYear>>({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  // Server-side fetch (pagination + search)
  const fetchAcademicYears = useCallback(async () => {
    try {
      setLoading(true);
      const data = await academicYearsApi.getAll(searchTerm, currentPage, pageSize);
      setResponse(data);
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
      // TODO: Add toast notification here if you have one
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, pageSize]);

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  const handleOpenModal = (item?: AcademicYear) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', start_date: '', end_date: '', is_current: false });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem?.id) {
        await academicYearsApi.update(editingItem.id, formData);
      } else {
        await academicYearsApi.create(formData);
      }
      setIsModalOpen(false);
      fetchAcademicYears(); // refresh list
    } catch (error) {
      console.error('Failed to save academic year:', error);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete?.id) return;
    try {
      await academicYearsApi.delete(itemToDelete.id);
      fetchAcademicYears();
    } catch (error) {
      console.error('Failed to delete academic year:', error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleSetAsCurrent = async (id: string) => {
    try {
      await academicYearsApi.setAsCurrent(id);
      fetchAcademicYears();
    } catch (error) {
      console.error('Failed to set academic year as current:', error);
    }
  };

  // Fallback while loading / first render
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
    { header: 'Name', accessor: 'name' as keyof AcademicYear },
    { header: 'Start Date', accessor: 'start_date' as keyof AcademicYear },
    { header: 'End Date', accessor: 'end_date' as keyof AcademicYear },
    {
      header: 'Status',
      accessor: (item: AcademicYear) => (
        <StatusBadge
          status={item.is_current ? 'current' : 'inactive'}
          label={item.is_current ? 'Current' : 'Past'}
        />
      ),
    },
    {
      header: 'Actions',
      accessor: (item: AcademicYear) => (
        <div className="flex items-center gap-2">
          {/* Set as Current – only for past years */}
          {!item.is_current && (
            <Can permission="set_current.academicyear">
              <button
                onClick={() => handleSetAsCurrent(item.id)}
                className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                Set as Current
              </button>
            </Can>
          )}

          {/* Edit – only for current year */}
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

          {/* Delete */}
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
          loading={loading} // ← DataTable can show a spinner if you add support for this prop
          actions={false}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Academic Year' : 'Add Academic Year'}
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
              placeholder="e.g. 2024/2025"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current || false}
              onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
              className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="is_current" className="text-sm text-slate-700">
              Set as current academic year
            </label>
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