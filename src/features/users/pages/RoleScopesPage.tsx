import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldIcon,
  PlusIcon,
  Trash2Icon,
  Loader2Icon,
  AlertTriangleIcon,
  BuildingIcon,
  GraduationCapIcon,
  UsersIcon,
} from 'lucide-react'
import { SearchableSelect } from '@/components/SearchableSelect'
import { Modal } from '@/components/Modal'
import {
  useScopes,
  useCreateScope,
  useDeleteScope,
} from '@/features/users/hooks/scopesApi'
import { useListQuery } from '@/hooks/shared/useApiQuery'
import type { Faculty, Department, ClassRoom } from '@/types/structure'
import type { User } from '@/types/shared'
type ScopeType = 'faculty' | 'department' | 'classroom'
const scopeTypeConfig: Record<
  ScopeType,
  {
    label: string
    icon: React.ElementType
    color: string
  }
> = {
  faculty: {
    label: 'Faculty',
    icon: BuildingIcon,
    color: 'text-blue-600 bg-blue-50',
  },
  department: {
    label: 'Department',
    icon: GraduationCapIcon,
    color: 'text-purple-600 bg-purple-50',
  },
  classroom: {
    label: 'Classroom',
    icon: UsersIcon,
    color: 'text-emerald-600 bg-emerald-50',
  },
}
export function RoleScopesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedRole, setSelectedRole] = useState<number | string | null>(null)
  const [selectedScopeType, setSelectedScopeType] = useState<ScopeType | null>(
    null,
  )
  const [selectedObjectId, setSelectedObjectId] = useState<
    number | string | null
  >(null)
  const [deleteId, setDeleteId] = useState<number | string | null>(null)
  const { data: scopesData, isLoading } = useScopes()
  const createMutation = useCreateScope()
  const deleteMutation = useDeleteScope()
  // Reference data
  const { data: usersData } = useListQuery<User>('users', '/users/', {
    page_size: 200,
  })
  const { data: facultiesData } = useListQuery<Faculty>(
    'faculties',
    '/faculties/',
    {
      page_size: 100,
    },
  )
  const { data: deptsData } = useListQuery<Department>(
    'departments',
    '/departments/',
    {
      page_size: 200,
    },
  )
  const { data: classesData } = useListQuery<ClassRoom>(
    'classrooms',
    '/classrooms/',
    {
      page_size: 200,
    },
  )
  const scopes = scopesData?.results || []
  // Lookup maps
  const userMap = useMemo(() => {
    const m = new Map<number | string, string>()
    usersData?.data?.forEach((u) =>
      m.set(u.id, `${u.first_name} ${u.last_name} (${u.role})`),
    )
    return m
  }, [usersData])
  const objectMap = useMemo(() => {
    const m = new Map<string, string>()
    facultiesData?.data?.forEach((f) => m.set(`faculty-${f.id}`, f.name))
    deptsData?.data?.forEach((d) => m.set(`department-${d.id}`, d.name))
    classesData?.data?.forEach((c) => m.set(`classroom-${c.id}`, c.name))
    return m
  }, [facultiesData, deptsData, classesData])
  const userOptions = useMemo(
    () =>
      usersData?.data?.map((u) => ({
        value: u.id,
        label: `${u.first_name} ${u.last_name} (${u.role})`,
      })) || [],
    [usersData],
  )
  const scopeTypeOptions = [
    {
      value: 'faculty',
      label: 'Faculty',
    },
    {
      value: 'department',
      label: 'Department',
    },
    {
      value: 'classroom',
      label: 'Classroom',
    },
  ]
  const objectOptions = useMemo(() => {
    if (!selectedScopeType) return []
    if (selectedScopeType === 'faculty') {
      return (
        facultiesData?.data?.map((f) => ({
          value: f.id,
          label: `${f.name} (${f.code})`,
        })) || []
      )
    }
    if (selectedScopeType === 'department') {
      return (
        deptsData?.data?.map((d) => ({
          value: d.id,
          label: `${d.name} (${d.code})`,
        })) || []
      )
    }
    if (selectedScopeType === 'classroom') {
      return (
        classesData?.data?.map((c) => ({
          value: c.id,
          label: c.name,
        })) || []
      )
    }
    return []
  }, [selectedScopeType, facultiesData, deptsData, classesData])
  const handleCreate = async () => {
    if (!selectedRole || !selectedScopeType || !selectedObjectId) return
    await createMutation.mutateAsync({
      role: selectedRole,
      scope_type: selectedScopeType,
      object_id: selectedObjectId,
    })
    setShowCreate(false)
    setSelectedRole(null)
    setSelectedScopeType(null)
    setSelectedObjectId(null)
  }
  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setDeleteId(null)
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Role Scopes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Assign organizational scopes to user roles
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Assign Scope
        </button>
      </div>

      {/* Scopes list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2Icon className="w-7 h-7 animate-spin text-orange-500" />
        </div>
      ) : scopes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ShieldIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No scopes assigned yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Click "Assign Scope" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scopes.map((scope, i) => {
            const config =
              scopeTypeConfig[scope.scope_type as ScopeType] ||
              scopeTypeConfig.department
            const Icon = config.icon
            const objectName =
              objectMap.get(`${scope.scope_type}-${scope.object_id}`) ||
              `#${scope.object_id}`
            const roleName = userMap.get(scope.role) || `Role #${scope.role}`
            return (
              <motion.div
                key={scope.id}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: i * 0.04,
                }}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {roleName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="capitalize">{scope.scope_type}</span>:{' '}
                    <span className="font-medium text-slate-600">
                      {objectName}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setDeleteId(scope.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Assign Role Scope"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Assign a user to a specific organizational unit. For example, an HOD
            can be scoped to a particular department.
          </p>
          <SearchableSelect
            label="User (Role)"
            required
            options={userOptions}
            value={selectedRole}
            onChange={(v) => setSelectedRole(v)}
            placeholder="Select user..."
          />
          <SearchableSelect
            label="Scope Type"
            required
            options={scopeTypeOptions}
            value={selectedScopeType}
            onChange={(v) => {
              setSelectedScopeType(v as ScopeType | null)
              setSelectedObjectId(null)
            }}
            placeholder="Select scope type..."
          />
          {selectedScopeType && (
            <SearchableSelect
              label={`Select ${scopeTypeConfig[selectedScopeType]?.label || 'Instance'}`}
              required
              options={objectOptions}
              value={selectedObjectId}
              onChange={(v) => setSelectedObjectId(v)}
              placeholder={`Choose a ${selectedScopeType}...`}
            />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={
                !selectedRole ||
                !selectedScopeType ||
                !selectedObjectId ||
                createMutation.isPending
              }
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {createMutation.isPending && (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              )}
              Assign Scope
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remove Scope"
      >
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangleIcon className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="text-slate-800 font-medium">Are you sure?</p>
            <p className="text-sm text-slate-500 mt-1">
              This will remove the scope assignment. The user will lose access
              to the scoped resources.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {deleteMutation.isPending && (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              )}
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
