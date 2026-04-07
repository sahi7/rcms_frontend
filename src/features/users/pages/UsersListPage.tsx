// src/features/users/pages/UsersListPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Shield, Trash2, Eye } from 'lucide-react'
import { DataTable } from '@/components/DataTable'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { useUsersList, useDeleteUser } from '@/hooks/shared/useUsers'
import { useRoles } from '@/features/users/hooks/useRoles'
import { User } from '@/types/shared'
import { Can } from '@/hooks/shared/useHasPermission'

export function UsersList() {
  const navigate = useNavigate()
  const { data: rolesData } = useRoles()

  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | number; name: string } | null>(null)

  const { data, isLoading } = useUsersList({
    page,
    search: searchTerm || undefined,
  })

  const deleteMutation = useDeleteUser()

  const handleDeleteClick = (user: User) => {
    setDeleteConfirm({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id)
    } catch (error) {
      console.error('Failed to delete user', error)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const columns = [
    {
      header: 'User',
      accessor: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-xs">
            {user.first_name?.[0]}
            {user.last_name?.[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (user: User) => {
        // Use the reusable role logic (role ID → role_type)
        const roleObj = rolesData?.find((r: any) => String(r.id) === String(user.role))
        const displayRole = roleObj?.role_type || user.role || '—'

        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
            {displayRole.replace('_', ' ')}
          </span>
        )
      },
    },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/dashboard/users/${user.id}`)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <Can permission="delete_user">
            <button
              onClick={() => handleDeleteClick(user)}
              disabled={deleteMutation.isPending}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Can>
        </div>
      ),
    },
  ]

  const summaryCards = [
    {
      title: 'Total Users',
      value: data?.pagination?.total_count || 0,
      icon: Shield,
      color: 'purple' as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Access</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage staff accounts and system roles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Can permission="manage_roles">
            <button
              onClick={() => navigate('/dashboard/users/roles')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Manage Roles
            </button>
          </Can>
          <Can permission="add_user">
            <button
              onClick={() => navigate('/dashboard/users/create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </Can>
        </div>
      </div>

      <PageSummaryCards cards={summaryCards} />

      <DataTable<User>
        data={data ?? { data: [], pagination: { current_page: 1, page_size: 20, total_pages: 1, total_count: 0, has_next: false, has_previous: false }, search: { term: '', has_results: false }, filters: {} }}
        columns={columns}
        loading={isLoading}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        onPageChange={setPage}
        onEdit={(user) => navigate(`/dashboard/users/${user.id}`)}
        onDelete={handleDeleteClick}
        actions={false}
      />

      {/* Branded Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-medium text-gray-900">{deleteConfirm.name}</span>?
              </p>
              <p className="text-sm text-rose-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex border-t">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-4 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-4 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}