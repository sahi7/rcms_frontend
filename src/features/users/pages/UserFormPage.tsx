// src/features/users/pages/UserFormPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react'
import { z } from 'zod'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { cn } from '@/lib/utils'
import { MultiSelect } from '@/components/MultiSelect'
import { SearchableSelect } from '@/components/SearchableSelect'
import { useUserForm } from '@/hooks/shared/useUsers'

const userSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    role: z.string().min(1, 'Role is required'),
    phone_number: z.string().optional(),
    phone: z.string().optional(),
    department_id: z.number().nullable(),
    date_of_birth: z.string().optional(),
    place_of_birth: z.string().optional(),
    nationality: z.string().optional(),
    preferred_language: z.string().optional(),
    emergency_contact: z.string().optional(),
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

type UserFormData = z.infer<typeof userSchema>

const initialData: UserFormData = {
    first_name: '',
    last_name: '',
    email: '',
    role: 'teacher',
    department_id: null,
}

const predefinedRoles = [
    'chancellor',
    'principal',
    'headteacher',
    'vice_chancellor',
    'dean',
    'hod',
    'teacher',
    'student',
]

export function UserForm() {
    const navigate = useNavigate()
    const { getLabel } = useInstitutionConfig()

    const [formData, setFormData] = useState<UserFormData>(initialData)
    const [subjectIds, setSubjectIds] = useState<(string | number)[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})

    const {
        departmentsData,
        rolesData,
        subjectsData,
        createMutation,
    } = useUserForm()

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'department_id' ? (value ? Number(value) : null) : value,
        }))

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
            const validatedData = userSchema.parse(formData)

            const initials =
                `${validatedData.first_name[0] || ''}${validatedData.last_name[0] || ''}`.toUpperCase()

            const payload = {
                ...validatedData,
                initials,
                subject_ids: formData.role === 'teacher' ? subjectIds.map(Number) : [],
            }

            await createMutation.mutateAsync(payload)
            navigate('/users')
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

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/users')}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Create a new staff account and assign roles.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Account Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Account Information
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
                                Email *
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
                                Role *
                            </label>
                            <div className="flex gap-2">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                                >
                                    <optgroup label="System Roles">
                                        {predefinedRoles.map((role) => (
                                            <option key={role} value={role}>
                                                {role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </optgroup>
                                    {rolesData?.data && rolesData.data.length > 0 && (
                                        <optgroup label="Custom Roles">
                                            {rolesData.data
                                                .filter((r: any) => !r.is_system)
                                                .map((role: any) => (
                                                    <option key={role.role_type} value={role.role_type}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                        </optgroup>
                                    )}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => navigate('/users/roles')}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Manage Custom Roles"
                                >
                                    Custom
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role Specific Information */}
                {(formData.role === 'teacher' ||
                    formData.role === 'hod' ||
                    formData.role === 'dean') && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Academic Assignments
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        value={formData.department_id}
                                        onChange={(val) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                department_id: val ? Number(val) : null,
                                            }))
                                        }
                                        placeholder={`Select ${getLabel('departmentLabel')}...`}
                                    />
                                </div>
                                {formData.role === 'teacher' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Subjects Taught
                                        </label>
                                        <MultiSelect
                                            options={(subjectsData?.data || []).map((s) => ({
                                                value: s.id,
                                                label: `${s.name} (${s.code})`,
                                            }))}
                                            value={subjectIds}
                                            onChange={setSubjectIds}
                                            placeholder="Select subjects..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Info className="h-3 w-3" /> You can add specific classes later in the user's profile.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                {/* Additional Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Additional Information (Optional)
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alternative Phone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth || ''}
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
                                value={formData.place_of_birth || ''}
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
                                value={formData.nationality || ''}
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
                                value={formData.preferred_language || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Emergency Contact
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Emergency Contact Name
                            </label>
                            <input
                                type="text"
                                name="emergency_guardian_name"
                                value={formData.emergency_guardian_name || ''}
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
                                value={formData.relationship_to_guardian || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Emergency Phone
                            </label>
                            <input
                                type="text"
                                name="emergency_guardian_phone"
                                value={formData.emergency_guardian_phone || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Emergency Email
                            </label>
                            <input
                                type="email"
                                name="emergency_guardian_email"
                                value={formData.emergency_guardian_email || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Emergency Address
                            </label>
                            <textarea
                                name="emergency_guardian_address"
                                value={formData.emergency_guardian_address || ''}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/users')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 shadow-sm"
                    >
                        {createMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Create User
                    </button>
                </div>
            </form>
        </div>
    )
}