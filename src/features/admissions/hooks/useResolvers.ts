// import { useEffect, useState } from 'react'
import { useDepartments } from '@/features/structure/hooks/useDepartments'
import { useClassRooms } from '@/features/structure/hooks/useClassRooms'
import { useFaculties } from '@/features/structure/hooks/useFaculties'
// import { studyLevelsApi } from '@/features/academic/hooks/studylevels'
import { useStudyLevels } from '@/features/academic/hooks/studylevels'
import { useIsUni } from '@/features/settings/hooks/useInstitution'

/**
 * Unified resolver for structure entities used across admissions pages.
 * Provides maps (id -> name) and lists for selects.
 */
export function useStructureLookups() {
    const isUni = useIsUni()
    const departmentsQ = useDepartments()
    const classRoomsQ = useClassRooms()
    const facultiesQ = useFaculties(undefined, isUni)
    const studyLevelsQ = useStudyLevels(isUni)


    //   const [levels, setLevels] = useState<any[]>([])
    //   const [levelsLoading, setLevelsLoading] = useState(true)

    //   useEffect(() => {
    //     let cancelled = false
    //     studyLevelsApi
    //       .getAll()
    //       .then((res: any) => {
    //         if (cancelled) return
    //         const items = Array.isArray(res) ? res : (res?.items ?? res?.data ?? [])
    //         setLevels(items)
    //       })
    //       .catch(() => setLevels([]))
    //       .finally(() => !cancelled && setLevelsLoading(false))
    //     return () => {
    //       cancelled = true
    //     }
    //   }, [])

    const extractList = (res: any) =>
        res?.data ?? []

    const departments = extractList(departmentsQ.data)
    const classRooms = extractList(classRoomsQ.data)

    // Faculties + Study Levels are only fetched/used for universities
    const faculties = isUni ? extractList(facultiesQ.data) : []
    const levels = isUni ? extractList(studyLevelsQ.data) : []

    // Programs = departments with type === 'program'
    const programs = (departments as any[]).filter(
        (d) => (d.type || '').toLowerCase() === 'program',
    )
    // Regular departments = not programs
    const regularDepartments = (departments as any[]).filter(
        (d) => (d.type || '').toLowerCase() !== 'program',
    )

    const makeMap = (arr: any[]) => {
        const m = new Map<string | number, string>()
        arr.forEach((i) => m.set(i.id, i.name))
        return m
    }

    return {
        isLoading:
            departmentsQ.isLoading ||
            classRoomsQ.isLoading ||
            (isUni ? facultiesQ.isLoading : false) ||
            (isUni ? studyLevelsQ.isLoading : false),
        //   levelsLoading,
        departments: regularDepartments,
        programs,
        classRooms,
        faculties,
        levels,
        departmentMap: makeMap(regularDepartments),
        programMap: makeMap(programs),
        classRoomMap: makeMap(classRooms),
        ...(isUni && {
            facultyMap: makeMap(faculties),
            levelMap: makeMap(levels),
        }),
    }
}