export interface RoleScope {
  id: number
  role: number | string
  scope_type: string
  object_id: number | string
  created_at?: string
  updated_at?: string
}

export type RoleScopePayload = Omit<
  RoleScope,
  'id' | 'created_at' | 'updated_at'
>
