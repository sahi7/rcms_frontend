// src/features/users/pages/UserFormPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, Loader2, Upload, Info } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { cn } from '@/lib/utils'
import { MultiSelect } from '@/components/MultiSelect'
import { SearchableSelect } from '@/components/SearchableSelect'
import { useUserForm } from '@/hooks/shared/useUsers'
import { useFileUpload } from '@/hooks/shared/useFileUpload'

const userSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    role: z.string().min(1, 'Role is required'),
    phone_number: z.string().optional(),
    phone: z.string().optional(),
    department: z.number().nullable(),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    place_of_birth: z.string().min(1, 'Place of birth is required'),
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

type UserFormData = z.infer<typeof userSchema> & {
    profile_picture?: string
}

const initialData: UserFormData = {
    first_name: '',
    last_name: '',
    email: '',
    role: 'teacher',
    department: null,
}

export function UserForm() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const userId = searchParams.get('id')
    const { getLabel } = useInstitutionConfig()

    const [formData, setFormData] = useState<UserFormData>(initialData)
    const [subjectIds, setSubjectIds] = useState<(string | number)[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [serverError, setServerError] = useState<string>('')

    // Profile picture states
    const [selectedPicture, setSelectedPicture] = useState<File | null>(null)
    const [picturePreview, setPicturePreview] = useState<string | null>(null)

    // File upload hook
    const { upload: uploadProfilePicture, isUploading: isUploadingPicture } = useFileUpload()

    const {
        existingUser,
        isLoadingUser,
        createMutation,
        updateMutation,
        isEditing,
        departmentsData,
        rolesData,
        subjectsData,
    } = useUserForm(userId || undefined)

    const teacherRole = rolesData?.find((role: any) => role.role_type === 'teacher')

    // Ref for server error banner
    const serverErrorRef = useRef<HTMLDivElement>(null)

    // Populate form when editing
    useEffect(() => {
        if (existingUser) {
            setFormData({
                first_name: existingUser.first_name || '',
                last_name: existingUser.last_name || '',
                email: existingUser.email || '',
                role: existingUser.role || (teacherRole?.id || 'teacher'),
                phone_number: existingUser.phone_number || '',
                department: existingUser.department?.id || null,
                date_of_birth: existingUser.date_of_birth || '',
                place_of_birth: existingUser.place_of_birth || '',
                nationality: existingUser.nationality || '',
                preferred_language: existingUser.preferred_language || '',
                emergency_guardian_name: existingUser.emergency_guardian_name || '',
                emergency_guardian_email: existingUser.emergency_guardian_email || '',
                emergency_guardian_phone: existingUser.emergency_guardian_phone || '',
                emergency_guardian_address: existingUser.emergency_guardian_address || '',
                relationship_to_guardian: existingUser.relationship_to_guardian || '',
                profile_picture: existingUser.profile_picture || undefined,
            })

            if (existingUser.subject_ids && Array.isArray(existingUser.subject_ids)) {
                setSubjectIds(existingUser.subject_ids)
            }

            if (existingUser.profile_picture) {
                setPicturePreview(existingUser.profile_picture)
            }
        }
    }, [existingUser])

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    // Auto-scroll to first field error (Zod validation)
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0]
            const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement | null

            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                })
                element.focus()
            }
        }
    }, [errors])

    // Auto-scroll to server error banner
    useEffect(() => {
        if (serverError && serverErrorRef.current) {
            serverErrorRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }
    }, [serverError])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'department' ? (value ? Number(value) : null) : value,
        }))

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedPicture(file)
            const reader = new FileReader()
            reader.onload = (ev) => setPicturePreview(ev.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setServerError('')

        try {
            const validatedData = userSchema.parse(formData)

            const initials =
                `${validatedData.first_name[0] || ''}${validatedData.last_name[0] || ''}`.toUpperCase()

            let payload: any = {
                ...validatedData,
                initials,                   // ← send ID, not string
                subject_ids: validatedData.role === (teacherRole?.id || 'teacher') ? subjectIds.map(Number) : [],
            }

            // Upload profile picture if selected
            if (selectedPicture) {
                try {
                    const uploadResult = await uploadProfilePicture(selectedPicture, 'profile')
                    payload.profile_picture = uploadResult.publicUrl
                } catch (uploadError) {
                    console.error('Profile picture upload failed:', uploadError)
                }
            } else if (formData.profile_picture) {
                payload.profile_picture = formData.profile_picture
            }

            if (isEditing) {
                await updateMutation.mutateAsync({
                    id: userId!,
                    payload: {
                        ...payload,
                        update: 'True',
                    },
                })
                toast.success('User updated successfully')
            } else {
                await createMutation.mutateAsync(payload)
                toast.success('User created successfully')
            }

            // navigate('/dashboard/users')
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {}
                error.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        newErrors[issue.path[0].toString()] = issue.message
                    }
                })
                setErrors(newErrors)
            } else {
                const err = error as any
                const serverData = err?.response?.data

                // NEW: Handle server field errors like {"phone_number": ["msg"], "role": ["msg"]}
                if (serverData && typeof serverData === 'object' && !Array.isArray(serverData)) {
                    const fieldErrors: Record<string, string> = {}

                    Object.keys(serverData).forEach((field) => {
                        if (Array.isArray(serverData[field]) && serverData[field].length > 0) {
                            fieldErrors[field] = serverData[field][0]
                        }
                    })

                    if (Object.keys(fieldErrors).length > 0) {
                        setErrors(fieldErrors)
                        return
                    }
                }

                // Fallback to general server error
                const serverMsg =
                    err?.response?.data?.error ||
                    err?.response?.data?.detail ||
                    err?.response?.data?.non_field_errors?.[0] ||
                    err?.message ||
                    'An unexpected error occurred while saving the user.'

                setServerError(serverMsg)
                console.error('API Error:', error)
            }
        }
    }

    if (isEditing && isLoadingUser) {
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
                    onClick={() => navigate('/dashboard/users')}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit User' : 'Add New User'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isEditing
                            ? 'Update user information and records.'
                            : 'Create a new staff account and assign roles.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Server error banner */}
                {serverError && (
                    <div
                        ref={serverErrorRef}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                    >
                        {serverError}
                    </div>
                )}

                {/* Account Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Account Information
                        </h2>
                    </div>
                    <div className="p-6">
                        {/* Clickable Profile Picture */}
                        <div className="flex items-center gap-6 mb-8">
                            <label className="cursor-pointer flex-shrink-0 group relative">
                                {picturePreview ? (
                                    <img
                                        src={picturePreview}
                                        alt="Profile Preview"
                                        className="h-24 w-24 rounded-3xl object-cover border-2 border-gray-200 shadow-sm transition-all group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-24 w-24 rounded-3xl bg-orange-100 flex items-center justify-center text-5xl font-semibold text-orange-600 border-2 border-gray-200 shadow-sm transition-all group-hover:scale-105">
                                        {formData.first_name?.[0] || ''}
                                        {formData.last_name?.[0] || ''}
                                    </div>
                                )}

                                {isUploadingPicture && (
                                    <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePictureChange}
                                    className="hidden"
                                />
                            </label>

                            <div>
                                <div className="text-sm font-medium text-gray-700">Profile Picture</div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Click the image to upload a new photo.<br />
                                    Recommended: square JPG or PNG (max 2MB)
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        {rolesData && rolesData.length > 0 && (
                                            <>
                                                {/* Custom Roles Group */}
                                                {rolesData.filter((r: any) => !r.is_system).length > 0 && (
                                                    <optgroup label="Custom Roles">
                                                        {rolesData
                                                            .filter((r: any) => !r.is_system)
                                                            .map((role: any) => (
                                                                <option key={role.role_type} value={role.id}>
                                                                    {role.name}
                                                                </option>
                                                            ))}
                                                    </optgroup>
                                                )}

                                                {/* System Roles Group */}
                                                {rolesData.filter((r: any) => r.is_system).length > 0 && (
                                                    <optgroup label="System Roles">
                                                        {rolesData
                                                            .filter((r: any) => r.is_system)
                                                            .map((role: any) => (
                                                                <option key={role.role_type} value={role.id}>
                                                                    {role.name}
                                                                </option>
                                                            ))}
                                                    </optgroup>
                                                )}
                                            </>
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
                </div>

                {/* Role Specific Information */}
                {(formData.role === (teacherRole?.id || 'teacher') ||
                    formData.role === 'hod' ||
                    formData.role === 'dean') && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                                        value={formData.department}
                                        onChange={(val) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                department: val ? Number(val) : null,
                                            }))
                                        }
                                        placeholder={`Select ${getLabel('departmentLabel')}...`}
                                    />
                                </div>
                                {formData.role === (teacherRole?.id || 'teacher') && (
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                        onClick={() => navigate('/dashboard/users')}
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
                        {isEditing ? 'Save Changes' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    )
}