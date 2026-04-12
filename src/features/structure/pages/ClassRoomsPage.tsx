// src/features/academic/pages/ClassRooms.tsx
import React, { useState } from 'react';
import { PlusIcon, Building2Icon, LayersIcon, SchoolIcon } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { PageSummaryCards } from '@/components/PageSummaryCards';
import { ClassRoom, ClassRoomPayload } from '@/types/structure';
import {
  useClassRooms,
  useCreateClassRoom,
  useUpdateClassRoom,
  useDeleteClassRoom,
} from '../hooks/useClassRooms';
import { Can } from '@/hooks/shared/useHasPermission';
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';

/**
 * Main component for managing classrooms / class progression levels.
 * Uses dynamic labeling via institution configuration.
 */
export function ClassRooms() {
  // Institution configuration for dynamic naming (e.g., Classroom → Form, Grade, Class, etc.)
  const { getLabel, getPlural } = useInstitutionConfig();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Data fetching with React Query hooks
  const { data, isLoading } = useClassRooms({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
  });

  const createMutation = useCreateClassRoom();
  const updateMutation = useUpdateClassRoom();
  const deleteMutation = useDeleteClassRoom();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassRoom | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ClassRoom | null>(null);

  // Local form state (uncontrolled by react-hook-form in this component)
  const [formData, setFormData] = useState<ClassRoomPayload>({
    name: '',
    progression_level: 1,
    has_departments: false,
  });

  /**
   * Table columns definition.
   * Note: Headers that are not dynamic are kept as-is; only classroom-related labels are generic.
   */
  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof ClassRoom,
    },
    {
      header: 'Progression Level',
      accessor: 'progression_level' as keyof ClassRoom,
    },
    {
      header: 'Has Departments',
      accessor: (item: ClassRoom) => (
        <StatusBadge
          status={item.has_departments ? 'active' : 'inactive'}
          label={item.has_departments ? 'Yes' : 'No'}
        />
      ),
    },
  ];

  /**
   * Opens the add or edit modal and populates form data accordingly.
   */
  const handleOpenModal = (item?: ClassRoom) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        progression_level: item.progression_level,
        has_departments: item.has_departments,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        progression_level: 1,
        has_departments: false,
      });
    }
    setIsModalOpen(true);
  };

  /**
   * Handles form submission for creating or updating a classroom.
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          payload: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save classroom', error);
    }
  };

  /**
   * Deletes the selected classroom after confirmation.
   */
  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Failed to delete classroom', error);
      }
    }
  };

  /**
   * Summary cards displayed at the top of the page.
   * Values are derived from the fetched data.
   */
  const summaryCards = [
    {
      title: `Total ${getPlural('class_progression_name')}`,
      value: data?.pagination.total_count || 0,
      icon: Building2Icon,
      color: 'blue' as const,
    },
    {
      title: `With Departments`,
      value: data?.data.filter((c) => c.has_departments).length || 0,
      icon: LayersIcon,
      color: 'emerald' as const,
    },
    {
      title: 'Avg Progression Level',
      value: data?.data.length
        ? (
            data.data.reduce((acc, c) => acc + c.progression_level, 0) /
            data.data.length
          ).toFixed(1)
        : 0,
      icon: SchoolIcon,
      color: 'purple' as const,
    },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {getPlural('class_progression_name')}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage {getPlural('class_progression_name')} and their progression levels.
          </p>
        </div>

        {/* Add New Button - permission protected */}
        <Can permission="add.classroom">
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-500/20"
          >
            <PlusIcon className="w-4 h-4" />
            Add New
          </button>
        </Can>
      </div>

      {/* Summary Cards */}
      <PageSummaryCards cards={summaryCards} />

      {/* Main Data Table */}
      <div className="flex-1 min-h-0">
        {isLoading && !data ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            Loading...
          </div>
        ) : data ? (
          <DataTable
            data={data}
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
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Failed to load data
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit ${getLabel('class_progression_name')}` : `Add ${getLabel('class_progression_name')}`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              placeholder={`e.g. ${getLabel('class_progression_name')} 1`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Progression Level
            </label>
            <input
              required
              type="number"
              min="1"
              value={formData.progression_level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  progression_level: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="has_departments"
              checked={formData.has_departments}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  has_departments: e.target.checked,
                })
              }
              className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="has_departments" className="text-sm text-slate-700">
              Has Departments
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

            {/* Save button protected by change permission */}
            <Can permission="change.classroom">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </Can>
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
            Are you sure you want to delete the{' '}
            <span className="font-semibold text-slate-800">
              {getLabel('class_progression_name')}{' '}
              {itemToDelete?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>

            {/* Delete button protected by delete permission */}
            <Can permission="delete.classroom">
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </Can>
          </div>
        </div>
      </Modal>
    </div>
  );
}