export type { InstitutionConfig } from '@/app/store/institutionConfigStore';
// In any component (e.g. DashboardSidebar, pages, etc.):
// tsximport { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';

// function MyComponent() {
//   const { getLabel, getPlural } = useInstitutionConfig();

//   return (
//     <div>
//       <h1>{getPlural('academic_period')}</h1>        {/* → "Semesters" or "Terms" */}
//       <h2>{getLabel('class_progression_name')}</h2> {/* → "Level" or "Year" */}
//     </div>
//   );
// }