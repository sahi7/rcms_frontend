// src/features/students/pages/StudentFormPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
// import { Student } from '@/types/academic'
import { cn } from '@/lib/utils'
import { SearchableSelect } from '@/components/SearchableSelect'
import { useStudentForm } from '../hooks/useStudentForm'

// Validation schema (unchanged from your original)
const studentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  registration_number: z.string().optional(),
  current_class: z.number().optional(),
  department: z.number().optional(),
  phone_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  place_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  preferred_language: z.string().optional(),
  enrollment_status: z.string().default('active'),
  emergency_guardian_name: z.string().optional(),
  emergency_guardian_email: z
    .string()
    .email('Invalid email')
    .optional()
    .or(z.literal('')),
  emergency_guardian_phone: z.string().optional(),
  emergency_guardian_address: z.string().optional(),
  relationship_to_guardian: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

const initialData: StudentFormData = {
  first_name: '',
  last_name: '',
  email: '',
  registration_number: '',
  enrollment_status: 'active',
}


export function StudentForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get('id')
  const { getLabel } = useInstitutionConfig()

  const [formData, setFormData] = useState<StudentFormData>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    existingStudent,
    isLoadingStudent,
    createMutation,
    updateMutation,
    isEditing,
    classroomsData,
    departmentsData,
  } = useStudentForm(studentId || undefined)

  // Populate form when editing
  useEffect(() => {
    if (existingStudent) {
      setFormData({
        first_name: existingStudent.first_name || '',
        last_name: existingStudent.last_name || '',
        email: existingStudent.email || '',
        registration_number: existingStudent.registration_number || '',
        current_class: existingStudent.current_class,
        department: existingStudent.department,
        phone_number: existingStudent.phone_number || '',
        date_of_birth: existingStudent.date_of_birth || '',
        place_of_birth: existingStudent.place_of_birth || '',
        nationality: existingStudent.nationality || '',
        preferred_language: existingStudent.preferred_language || '',
        enrollment_status: existingStudent.enrollment_status || 'active',
        emergency_guardian_name: existingStudent.emergency_guardian_name || '',
        emergency_guardian_email: existingStudent.emergency_guardian_email || '',
        emergency_guardian_phone: existingStudent.emergency_guardian_phone || '',
        emergency_guardian_address: existingStudent.emergency_guardian_address || '',
        relationship_to_guardian: existingStudent.relationship_to_guardian || '',
      })
    }
  }, [existingStudent])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'current_class' || name === 'department'
          ? value
            ? Number(value)
            : undefined
          : value,
    }))

    // Clear field error
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const validatedData = studentSchema.parse(formData)

      const initials =
        `${validatedData.first_name[0] || ''}${validatedData.last_name[0] || ''}`.toUpperCase()

      const payload = {
        ...validatedData,
        initials,
      }

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: studentId!,
          payload: {
            ...payload,
            update: 'True',
          },
        })
      } else {
        await createMutation.mutateAsync(payload)
      }

      navigate('/students')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(newErrors)
      } else {
        console.error('API Error:', error)
      }
    }
  }

  if (isEditing && isLoadingStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/students')}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Student' : 'Add New Student'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing
              ? 'Update student information and records.'
              : 'Enter details to enroll a new student.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">
              Personal Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all',
                  errors.first_name
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-gray-300'
                )}
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-rose-500">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all',
                  errors.last_name
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-gray-300'
                )}
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-rose-500">{errors.last_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place of Birth
              </label>
              <input
                type="text"
                name="place_of_birth"
                value={formData.place_of_birth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Language
              </label>
              <input
                type="text"
                name="preferred_language"
                value={formData.preferred_language}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">
              Academic Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                placeholder="Leave blank to auto-generate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Status
              </label>
              <select
                name="enrollment_status"
                value={formData.enrollment_status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getLabel('classLabel')}
              </label>
              <SearchableSelect
                options={
                  classroomsData?.data?.map((c: any) => ({
                    value: c.id,
                    label: c.name,
                  })) || []
                }
                value={formData.current_class || ''}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    current_class: val ? Number(val) : undefined,
                  }))
                }
                placeholder={`Select ${getLabel('classLabel')}...`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getLabel('departmentLabel')}
              </label>
              <SearchableSelect
                options={
                  departmentsData?.data?.map((d: any) => ({
                    value: d.id,
                    label: d.name,
                  })) || []
                }
                value={formData.department || ''}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: val ? Number(val) : undefined,
                  }))
                }
                placeholder={`Select ${getLabel('departmentLabel')}...`}
              />
            </div>
          </div>
        </div>

        {/* Contact & Emergency Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">
              Contact & Emergency
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all',
                  errors.email
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-gray-300'
                )}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Phone
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-gray-100 mt-2">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Guardian Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                name="emergency_guardian_name"
                value={formData.emergency_guardian_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <input
                type="text"
                name="relationship_to_guardian"
                value={formData.relationship_to_guardian}
                onChange={handleChange}
                placeholder="e.g. Mother, Father, Uncle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Phone
              </label>
              <input
                type="text"
                name="emergency_guardian_phone"
                value={formData.emergency_guardian_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Email
              </label>
              <input
                type="email"
                name="emergency_guardian_email"
                value={formData.emergency_guardian_email}
                onChange={handleChange}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all',
                  errors.emergency_guardian_email
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-gray-300'
                )}
              />
              {errors.emergency_guardian_email && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.emergency_guardian_email}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Address
              </label>
              <textarea
                name="emergency_guardian_address"
                value={formData.emergency_guardian_address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'Save Changes' : 'Create Student'}
          </button>
        </div>
      </form>
    </div>
  )
}