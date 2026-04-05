import React, { useState } from 'react'
import { PlusIcon, BookOpenIcon, AwardIcon } from 'lucide-react'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { Subject, SubjectPayload } from '@/types/curriculum'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from '../hooks/useSubjects'


export function Subjects() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const { data, isLoading } = useSubjects({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
  })
  const createMutation = useCreateSubject()
  const updateMutation = useUpdateSubject()
  const deleteMutation = useDeleteSubject()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Subject | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Subject | null>(null)
  const [formData, setFormData] = useState<SubjectPayload>({
    name: '',
    code: '',
    credit_value: 1,
    max_score: 100,
  })

  const { getLabel, getPlural } = useInstitutionConfig();
  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Subject,
    },
    {
      header: 'Code',
      accessor: 'code' as keyof Subject,
    },
    {
      header: 'Credit Value',
      accessor: 'credit_value' as keyof Subject,
    },
    {
      header: 'Max Score',
      accessor: 'max_score' as keyof Subject,
    },
  ]
  const handleOpenModal = (item?: Subject) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        code: item.code,
        credit_value: item.credit_value,
        max_score: item.max_score,
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        code: '',
        credit_value: 1,
        max_score: 100,
      })
    }
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
      console.error(`Failed to save ${getLabel('subject_naming')}`, error)
    }
  }
  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id)
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
      } catch (error) {
        console.error(`Failed to delete ${getLabel('subject_naming')}`, error)
      }
    }
  }
  const summaryCards = [
    {
      title: `Total ${getPlural('subject_naming')}`,
      value: data?.pagination.total_count || 0,
      icon: BookOpenIcon,
      color: 'blue' as const,
    },
    {
      title: 'Avg Credit Value',
      value: data?.data.length
        ? (
            data.data.reduce((acc, s) => acc + s.credit_value, 0) /
            data.data.length
          ).toFixed(1)
        : 0,
      icon: AwardIcon,
      color: 'emerald' as const,
    },
  ]
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">{getPlural('subject_naming')}</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage curriculum {getPlural('subject_naming')} and their properties.
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
        title={editingItem ? 'Edit Subject' : 'Add Subject'}
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
              placeholder="e.g. Mathematics"
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
              placeholder="e.g. MATH101"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Credit Value
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.credit_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credit_value: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Max Score
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.max_score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_score: parseInt(e.target.value) || 100,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
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
