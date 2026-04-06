// src/types/structure.ts
// ============ Faculty ============
export interface FacultyBase {
  id: number
  name: string
  code: string
  dean: number | null
  identifier: string
}

export type Faculty = FacultyBase
export type FacultyPayload = Omit<FacultyBase, 'id'>

// ============ Department ============
export interface DepartmentBase {
  id: number
  name: string
  code: string
  hod: number | null
  faculty: number | null
  parent: number | null
  type: 'department' | 'program' | 'option'
  class_rooms: number[]
  identifier: string
  tuition: string
}

export type Department = DepartmentBase
export type DepartmentPayload = Omit<DepartmentBase, 'id'>

// ============ ClassRoom ============
export interface ClassRoomBase {
  id: number
  name: string
  has_departments: boolean
  progression_level: number
}

export type ClassRoom = ClassRoomBase
export type ClassRoomPayload = Omit<ClassRoomBase, 'id'>