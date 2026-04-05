import React, { useState } from 'react'
import { PlusIcon, BuildingIcon, UserCheckIcon } from 'lucide-react'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { SearchableSelect } from '@/components/SearchableSelect'
import { Faculty, FacultyPayload } from '@/types/structure'
import {
  useFaculties,
  useCreateFaculty,
  useUpdateFaculty,
  useDeleteFaculty,
} from '../hooks/useFaculties'
import { useUserSearch } from '@/hooks/shared/useUsers'


export function Faculties() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const { data, isLoading } = useFaculties({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
  })
  const createMutation = useCreateFaculty()
  const updateMutation = useUpdateFaculty()
  const deleteMutation = useDeleteFaculty()
  const {
    search: userSearch,
    setSearch: setUserSearch,
    options: userOptions,
    isLoading: isUsersLoading,
  } = useUserSearch()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Faculty | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Faculty | null>(null)
  const [formData, setFormData] = useState<FacultyPayload>({
    name: '',
    code: '',
    identifier: '',
    dean: null,
  })
  // In a real app, the API would return the resolved dean name, or we'd fetch it.
  // For display purposes, we'll just show the ID if we don't have the full object.
  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Faculty,
    },
    {
      header: 'Code',
      accessor: 'code' as keyof Faculty,
    },
    {
      header: 'Identifier',
      accessor: 'identifier' as keyof Faculty,
    },
    {
      header: 'Dean',
      accessor: (item: Faculty) =>
        item.dean ? (
          `User ID: ${item.dean}`
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        ),
    },
  ]
  const handleOpenModal = (item?: Faculty) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        code: item.code,
        identifier: item.identifier,
        dean: item.dean,
      })
      // If we had the dean's name, we could pre-populate the search term here
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        code: '',
        identifier: '',
        dean: null,
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
      console.error('Failed to save faculty', error)
    }
  }
  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id)
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
      } catch (error) {
        console.error('Failed to delete faculty', error)
      }
    }
  }
  const summaryCards = [
    {
      title: 'Total Faculties',
      value: data?.pagination.total_count || 0,
      icon: BuildingIcon,
      color: 'orange' as const,
    },
    {
      title: 'With Deans Assigned',
      value: data?.data.filter((f) => f.dean !== null).length || 0,
      icon: UserCheckIcon,
      color: 'blue' as const,
    },
  ]
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Faculties</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage faculties and their deans.
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
        title={editingItem ? 'Edit Faculty' : 'Add Faculty'}
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
              placeholder="e.g. Faculty of Science"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                placeholder="e.g. FS"
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
                placeholder="e.g. FAC-SCI"
              />
            </div>
          </div>

          <SearchableSelect
            label="Dean"
            options={userOptions}
            value={formData.dean}
            onChange={(val) =>
              setFormData({
                ...formData,
                dean: val as number | null,
              })
            }
            onSearch={setUserSearch}
            isLoading={isUsersLoading}
            placeholder="Search and select a user..."
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
