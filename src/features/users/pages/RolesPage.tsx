import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Shield,
  Trash2,
  Edit,
  Save,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/shared/useApiQuery'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'
interface Role {
  role_type: string
  name: string
  description: string
  is_system: boolean
  permissions: string[]
  created_at: string
  updated_at: string
}
// Helper to group permissions
const groupPermissions = (permissions: string[]) => {
  const groups: Record<string, string[]> = {}
  permissions.forEach((perm) => {
    // Extract category (e.g., 'add_user' -> 'user', 'view_marks' -> 'marks')
    const parts = perm.split('_')
    const category = parts.length > 1 ? parts.slice(1).join(' ') : 'other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(perm)
  })
  return groups
}
export function RolesPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    role_type: '',
    name: '',
    description: '',
  })
  const { data: rolesData, isLoading } = useListQuery<Role>(
    ['roles'],
    '/roles/',
  )
  const createMutation = useCreateMutation<Role, any>('/roles/', [['roles']])
  const updateMutation = useUpdateMutation<Role, any>(
    (id) => `/roles/${id}/`,
    // Assuming role_type is the ID for updates
    [['roles']],
  )
  const deleteMutation = useDeleteMutation((id) => `/roles/${id}/`, [['roles']])
  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        role_type: role.role_type,
        name: role.name,
        description: role.description,
      })
    } else {
      setEditingRole(null)
      setFormData({
        role_type: '',
        name: '',
        description: '',
      })
    }
    setIsModalOpen(true)
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingRole) {
        await updateMutation.mutateAsync({
          id: editingRole.role_type,
          data: formData,
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save role', error)
    }
  }
  const handleDelete = async (roleType: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteMutation.mutateAsync(roleType)
      } catch (error) {
        console.error('Failed to delete role', error)
      }
    }
  }
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Roles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define custom roles and their permissions.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Custom Role
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(rolesData?.results || []).map((role) => {
            const isExpanded = expandedRole === role.role_type
            const groupedPerms = groupPermissions(role.permissions || [])
            const categories = Object.keys(groupedPerms).sort()
            return (
              <div
                key={role.role_type}
                className={cn(
                  'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-300',
                  isExpanded ? 'md:col-span-2 lg:col-span-3' : '',
                )}
              >
                <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center',
                        role.is_system
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-purple-50 text-purple-600',
                      )}
                    >
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {role.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">
                        {role.role_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {role.is_system && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        System
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setExpandedRole(isExpanded ? null : role.role_type)
                      }
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      {isExpanded ? (
                        <>
                          Hide <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          View All ({role.permissions?.length || 0}){' '}
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1">
                  <p className="text-sm text-gray-600 mb-4">
                    {role.description || 'No description provided.'}
                  </p>

                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: 'auto',
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.3,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">
                            Permissions Breakdown
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {categories.map((category) => (
                              <div key={category} className="space-y-2">
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-1 capitalize">
                                  {category}
                                </h5>
                                <ul className="space-y-1.5">
                                  {groupedPerms[category].map((perm) => (
                                    <li
                                      key={perm}
                                      className="text-sm text-gray-700 flex items-start gap-2"
                                    >
                                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                      <span className="break-all">
                                        {perm.split('_')[0]}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                          Quick View
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions?.slice(0, 8).map((perm, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 border border-gray-200 text-gray-600"
                            >
                              {perm}
                            </span>
                          ))}
                          {(role.permissions?.length || 0) > 8 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                              +{(role.permissions?.length || 0) - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                {!role.is_system && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(role)}
                      className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(role.role_type)}
                      className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Edit Custom Role' : 'Create Custom Role'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Type (ID) *
            </label>
            <input
              type="text"
              required
              disabled={!!editingRole}
              value={formData.role_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role_type: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                })
              }
              placeholder="e.g. guest_lecturer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lowercase, no spaces. Used internally.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="e.g. Guest Lecturer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-70"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingRole ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
