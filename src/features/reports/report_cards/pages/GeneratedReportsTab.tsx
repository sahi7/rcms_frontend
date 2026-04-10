import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
    DownloadIcon,
    CalendarIcon,
    UsersIcon,
    FilterIcon,
    FileArchiveIcon,
    InboxIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useTerms } from '@/features/academic/hooks/terms'
import { useClassRooms } from '@/features/structure/hooks/useClassRooms'
import { useDepartments } from '@/features/structure/hooks/useDepartments'
import { useUsersList } from '@/hooks/shared/useUsers'
import { useGeneratedReports } from '../hooks/useReports'
import { GeneratedReport } from '@/types/reports'
import { Term } from '@/types/academic'
import { ClassRoom, Department } from '@/types/structure'
import { User } from '@/types/shared'
import { formatDate } from '@/lib/utils'

function resolveName<
    T extends {
        id: number | string
    },
>(items: T[], id: number | string | null, nameKey: keyof T): string {
    if (!id) return '—'
    const item = items.find((i) => String(i.id) === String(id))
    return item ? String(item[nameKey]) : `#${id}`
}


export function GeneratedReportsTab() {
    const [filterTermId, setFilterTermId] = useState<string>('')
    const [filterClassId, setFilterClassId] = useState<string>('')
    const [filterDeptId, setFilterDeptId] = useState<string>('')
    const { data: termsData } = useTerms()
    const { data: classRoomsData } = useClassRooms()
    const { data: departmentsData } = useDepartments()
    const { data: usersData } = useUsersList()
    const terms: Term[] = termsData?.data ?? []
    const classRooms: ClassRoom[] = classRoomsData?.data ?? []
    const departments: Department[] = departmentsData?.data ?? []
    const users: User[] = usersData?.data ?? []
    const queryParams = useMemo(() => {
        const p: Record<string, any> = {}
        if (filterTermId) p.term_id = filterTermId
        if (filterClassId) p.class_room_id = filterClassId
        if (filterDeptId) p.department_id = filterDeptId
        return p
    }, [filterTermId, filterClassId, filterDeptId])
    const {
        data: reportsData,
        isLoading,
        isError,
    } = useGeneratedReports(queryParams)
    const reports: GeneratedReport[] = reportsData?.results ?? []
    const clearFilters = () => {
        setFilterTermId('')
        setFilterClassId('')
        setFilterDeptId('')
    }


    const resolveUserName = React.useMemo(() => {
        const map = new Map<number, string>()
        users.forEach((u) =>
            map.set(u.id, `${u.first_name} ${u.last_name}`)
        )

        return (id: number | null) => {
            if (!id) return '—'
            return map.get(id) ?? `User #${id}`
        }
    }, [usersData])

    const hasFilters = filterTermId || filterClassId || filterDeptId
    return (
        <div className="space-y-5">
            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FilterIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Filters</span>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="ml-auto text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Select value={filterTermId} onValueChange={setFilterTermId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Terms" />
                            </SelectTrigger>
                            <SelectContent>
                                {terms.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterClassId} onValueChange={setFilterClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Classes" />
                            </SelectTrigger>
                            <SelectContent>
                                {classRooms.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterDeptId} onValueChange={setFilterDeptId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="py-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-72" />
                                    </div>
                                    <Skeleton className="h-9 w-28" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Error */}
            {isError && !isLoading && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="py-6 text-center">
                        <p className="text-sm text-red-600">
                            Failed to load generated reports. Please try again.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Empty */}
            {!isLoading && !isError && reports.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <InboxIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-500">
                            No generated reports found
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {hasFilters
                                ? 'Try adjusting your filters'
                                : 'Generate your first report card from the Generate tab'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Reports List */}
            {!isLoading && !isError && reports.length > 0 && (
                <div className="space-y-3">
                    {reports.map((report, index) => (
                        <motion.div
                            key={report.id}
                            initial={{
                                opacity: 0,
                                y: 10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: 0.2,
                                delay: index * 0.04,
                            }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                            <FileArchiveIcon className="w-5 h-5 text-orange-500" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-slate-800">
                                                    {resolveName(classRooms, report.class_room_id, 'name')}
                                                </span>
                                                {report.department_id && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {resolveName(
                                                            departments,
                                                            report.department_id,
                                                            'name',
                                                        )}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    {resolveName(terms, report.term_id, 'name')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <UsersIcon className="w-3 h-3" />
                                                    {report.num_students} students
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {formatDate(report.created_at, true)}
                                                </span>
                                                <span>
                                                    By {resolveUserName(report.created_by_id)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Download */}
                                        <a
                                            href={report.download_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="outline" size="sm">
                                                <DownloadIcon className="w-3.5 h-3.5 mr-1.5" />
                                                Download
                                            </Button>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
