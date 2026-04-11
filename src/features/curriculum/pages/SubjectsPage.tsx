// src/features/curriculum/pages/Subjects.tsx
import React, { useState } from 'react'
import { PlusIcon, BookOpenIcon } from 'lucide-react'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { Subject, SubjectPayload } from '@/types/curriculum'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from '../hooks/useSubjects'
import { toast } from 'sonner'
import { Can } from '@/hooks/shared/useHasPermission'

/**
 * Subjects Management Page
 *
 * Main page for CRUD operations on subjects.
 * All UI labels, titles, and descriptions are fully dynamic using:
 * - getPlural('subject_naming') for plural references (e.g. "Subjects", lists, summaries)
 * - getLabel('subject_naming') for singular references (e.g. "Subject", modals, delete confirmations)
 *
 * Permissions are enforced for every user action using the <Can> component:
 * - add.subject     → Add New button
 * - change.subject  → Edit / Save actions
 * - delete.subject  → Delete actions
 *
 * No hardcoded "Subject" / "Subjects" text remains in the UI.
 * All other functionality (search, pagination, form handling, error handling) is preserved exactly.
 */
export function Subjects() {
  // ========================
  // LOCAL STATE
  // ========================
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Modal & editing state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Subject | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Subject | null>(null)

  // Form state (controlled inputs)
  const [formData, setFormData] = useState<SubjectPayload>({
    name: '',
    code: '',
    credit_value: 1,
    max_score: 20,
  })

  // ========================
  // HOOKS & CONFIG
  // ========================
  const { getLabel, getPlural } = useInstitutionConfig()

  // Query & mutation hooks (React Query)
  const { data, isLoading } = useSubjects({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
  })

  const createMutation = useCreateSubject()
  const updateMutation = useUpdateSubject()
  const deleteMutation = useDeleteSubject()

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

  // ========================
  // HANDLERS
  // ========================

  /**
   * Opens the add/edit modal and pre-fills form when editing
   */
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
        max_score: 20,
      })
    }
    setIsModalOpen(true)
  }

  /**
   * Handles create / update submission
   * Permission-protected save button ensures only authorized users can submit
   */
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
    } catch (error: any) {
      console.error(`Failed to save ${getLabel('subject_naming')}`, error)

      const serverError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'An unexpected error occurred'

      toast.error(serverError)
    }
  }

  /**
   * Handles deletion with confirmation
   */
  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id)
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
      } catch (error: any) {
        console.error(`Failed to delete ${getLabel('subject_naming')}`, error)

        const serverError =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to delete'

        toast.error(serverError)
      }
    }
  }

  // ========================
  // SUMMARY CARDS
  // ========================
  const summaryCards = [
    {
      title: `Total ${getPlural('subject_naming')}`,
      value: data?.pagination.total_count || 0,
      icon: BookOpenIcon,
      color: 'blue' as const,
    },
  ]

  // ========================
  // RENDER
  // ========================
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {getPlural('subject_naming')}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage curriculum {getPlural('subject_naming')} and their properties.
          </p>
        </div>

        {/* Add New – protected by add.subject permission */}
        <Can permission="add.subject">
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-500/20"
          >
            <PlusIcon className="w-4 h-4" />
            Add New
          </button>
        </Can>
      </div>

      {/* Summary Cards (total count is dynamic) */}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? `Edit ${getLabel('subject_naming')}`
            : `Add ${getLabel('subject_naming')}`
        }
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
                    max_score: parseInt(e.target.value) || 20,
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

            {/* Save button protected by change.subject permission */}
            <Can permission="change.subject">
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
              {getLabel('subject_naming')}
            </span>{' '}
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

            {/* Delete button protected by delete.subject permission */}
            <Can permission="delete.subject">
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
  )
}