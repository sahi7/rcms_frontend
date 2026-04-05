import React, { useState } from 'react'
import { PlusIcon, Building2Icon, LayersIcon } from 'lucide-react'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { SearchableSelect } from '@/components/SearchableSelect'
import { MultiSelect } from '@/components/MultiSelect'
import { Department, DepartmentPayload } from '@/types/structure'
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '../hooks/useDepartments'
import { useUserSearch } from '@/hooks/shared/useUsers'
import { useFaculties } from '../hooks/useFaculties'
import { useClassRooms } from '../hooks/useClassRooms'


export function Departments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const { data, isLoading } = useDepartments({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
  })
  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment()
  const deleteMutation = useDeleteDepartment()
  const {
    search: userSearch,
    setSearch: setUserSearch,
    options: userOptions,
    isLoading: isUsersLoading,
  } = useUserSearch()
  const { data: facultiesData, isLoading: isFacultiesLoading } = useFaculties({
    page_size: 100,
  })
  const { data: classroomsData, isLoading: isClassroomsLoading } =
    useClassRooms({
      page_size: 100,
    })
  const facultyOptions =
    facultiesData?.data.map((f) => ({
      value: f.id,
      label: f.name,
    })) || []
  const classroomOptions =
    classroomsData?.data.map((c) => ({
      value: c.id,
      label: c.name,
    })) || []
  const parentOptions =
    data?.data.map((d) => ({
      value: d.id,
      label: d.name,
    })) || []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Department | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Department | null>(null)
  const [formData, setFormData] = useState<DepartmentPayload>({
    name: '',
    code: '',
    class_rooms: [],
    hod: null,
    faculty: null,
    parent: null,
    identifier: '',
    tuition: '',
    type: 'department',
  })
  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Department,
    },
    {
      header: 'Code',
      accessor: 'code' as keyof Department,
    },
    {
      header: 'Type',
      accessor: (item: Department) => (
        <span className="capitalize">{item.type}</span>
      ),
    },
    {
      header: 'Tuition',
      accessor: (item: Department) => `$${item.tuition}`,
    },
    {
      header: 'HOD',
      accessor: (item: Department) =>
        item.hod ? (
          `User ID: ${item.hod}`
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        ),
    },
  ]
  const handleOpenModal = (item?: Department) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        code: item.code,
        class_rooms: item.class_rooms,
        hod: item.hod,
        faculty: item.faculty,
        parent: item.parent,
        identifier: item.identifier,
        tuition: item.tuition,
        type: item.type,
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        code: '',
        class_rooms: [],
        hod: null,
        faculty: null,
        parent: null,
        identifier: '',
        tuition: '',
        type: 'department',
      })
    }
    setUserSearch('')
    setIsModalOpen(true)
  }
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          payload: formData,
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save department', error)
    }
  }
  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id)
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
      } catch (error) {
        console.error('Failed to delete department', error)
      }
    }
  }
  const summaryCards = [
    {
      title: 'Total Departments',
      value: data?.pagination.total_count || 0,
      icon: Building2Icon,
      color: 'blue' as const,
    },
    {
      title: 'Programs',
      value: data?.data.filter((d) => d.type === 'program').length || 0,
      icon: LayersIcon,
      color: 'emerald' as const,
    },
  ]
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            Departments & Programs
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage academic departments, programs, and options.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-500/20"
        >
          <PlusIcon className="w-4 h-4" />
          Add New
        </button>
      </div>

      <PageSummaryCards cards={summaryCards} />

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
              setSearchTerm(term)
              setCurrentPage(1)
            }}
            searchTerm={searchTerm}
            onEdit={handleOpenModal}
            onDelete={(item) => {
              setItemToDelete(item)
              setIsDeleteModalOpen(true)
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Failed to load data
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Department' : 'Add Department'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                placeholder="e.g. Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Code
              </label>
              <input
                required
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="e.g. CS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Identifier
              </label>
              <input
                required
                type="text"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identifier: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="e.g. DEPT-CS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tuition
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.tuition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tuition: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="e.g. 1500.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="department">Department</option>
                <option value="program">Program</option>
                <option value="option">Option</option>
              </select>
            </div>
            <SearchableSelect
              label="Faculty"
              options={facultyOptions}
              value={formData.faculty}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  faculty: val as number | null,
                })
              }
              isLoading={isFacultiesLoading}
              placeholder="Select faculty..."
            />
            <SearchableSelect
              label="Parent Department"
              options={parentOptions}
              value={formData.parent}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  parent: val as number | null,
                })
              }
              placeholder="Select parent..."
            />
            <SearchableSelect
              label="Head of Department (HOD)"
              options={userOptions}
              value={formData.hod}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  hod: val as number | null,
                })
              }
              onSearch={setUserSearch}
              isLoading={isUsersLoading}
              placeholder="Search user..."
            />
          </div>

          <MultiSelect
            label="Classrooms"
            options={classroomOptions}
            value={formData.class_rooms}
            onChange={(val) =>
              setFormData({
                ...formData,
                class_rooms: val as number[],
              })
            }
            isLoading={isClassroomsLoading}
            placeholder="Select classrooms..."
          />

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
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-800">
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
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
