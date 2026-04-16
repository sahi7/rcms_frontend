// import { useEffect, useState } from 'react'
import { useDepartments } from '@/features/structure/hooks/useDepartments'
import { useClassRooms } from '@/features/structure/hooks/useClassRooms'
import { useFaculties } from '@/features/structure/hooks/useFaculties'
// import { studyLevelsApi } from '@/features/academic/hooks/studylevels'
import { useStudyLevels } from '@/features/academic/hooks/studylevels'

/**
 * Unified resolver for structure entities used across admissions pages.
 * Provides maps (id -> name) and lists for selects.
 */
export function useStructureLookups() {
    const departmentsQ = useDepartments()
    const classRoomsQ = useClassRooms()
    const facultiesQ = useFaculties()
    const studyLevelsQ = useStudyLevels()
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

    const departments =
        (departmentsQ.data as any)?.items ?? (departmentsQ.data as any) ?? []
    const classRooms =
        (classRoomsQ.data as any)?.items ?? (classRoomsQ.data as any) ?? []
    const faculties =
        (facultiesQ.data as any)?.items ?? (facultiesQ.data as any) ?? []
    const levels =
        (studyLevelsQ.data as any)?.items ?? (studyLevelsQ.data as any) ?? []

    console.log("study levels: ", levels);

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
            facultiesQ.isLoading ||
            studyLevelsQ.isLoading,
        //   levelsLoading,
        departments: regularDepartments,
        programs,
        classRooms,
        faculties,
        levels,
        departmentMap: makeMap(regularDepartments),
        programMap: makeMap(programs),
        classRoomMap: makeMap(classRooms),
        facultyMap: makeMap(faculties),
        levelMap: makeMap(levels),
    }
}
