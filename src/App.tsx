// src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuthStore } from "@/app/store/authStore";
import { DashboardLayout } from "@/app/layout/DashboardLayout";
import { DashboardOverview } from "@/app/layout/DashboardOverview";
// import { PlaceholderPage } from "@/pages/dashboard/PlaceholderPage";

import { AcademicYears } from "@/features/academic/pages/AcademicYears";
import { Terms } from "@/features/academic/pages/Terms";
import { Sequences } from "@/features/academic/pages/Sequences";
import { StudyLevels } from "@/features/academic/pages/StudyLevels";

import { ClassAssignments } from "@/features/curriculum/pages/ClassAssignmentsPage";
import { CurriculumSubjects } from "@/features/curriculum/pages/CurriculumSubjectsPage";
import { SubjectAssignments } from "@/features/curriculum/pages/SubjectAssignmentsPage";
import { Subjects } from "@/features/curriculum/pages/SubjectsPage";

import { Departments } from "@/features/structure/pages/DepartmentsPage";
import { ClassRooms } from "@/features/structure/pages/ClassRoomsPage";
import { Faculties } from "@/features/structure/pages/FacultiesPage";

import { StudentBulkUpload } from "@/features/students/pages/StudentBulkUploadPage";
import { StudentsList } from "@/features/students/pages/StudentsListPage";
import { StudentDetails } from "@/features/students/pages/StudentDetailsPage";
import { StudentForm } from "@/features/students/pages/StudentFormPage";

import { Roles } from "@/features/users/pages/RolesPage";
import { UsersList } from "@/features/users/pages/UsersListPage";
import { UserDetails } from "@/features/users/pages/UserDetailsPage";
import { UserForm } from "@/features/users/pages/UserFormPage";
import { RoleScopesPage } from '@/features/users/pages/RoleScopesPage'

import { MarkUploadPage } from '@/features/marks/pages/MarkUploadPage'
import { MarkPreviewPage } from '@/features/marks/pages/MarkPreviewPage'
import { UploadStatusPage } from '@/features/marks/pages/UploadStatusPage'
import { StudentReportPage } from '@/features/students/pages/StudentReportPage'



export default function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token && !isAuthenticated) {
      fetchMe().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchMe]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-gray-500">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated users get the dashboard layout
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />

        <Route path="academic-years" element={<AcademicYears />} />
        <Route path="terms" element={<Terms />} />
        <Route path="sequences" element={<Sequences />} />
        <Route path="study-levels" element={<StudyLevels />} />

        <Route path="class-assignments" element={<ClassAssignments />} />
        <Route path="curriculum-subjects" element={<CurriculumSubjects />} />
        <Route path="subject-assignments" element={<SubjectAssignments />} />
        <Route path="subjects" element={<Subjects />} />

        <Route path="departments" element={<Departments />} />
        <Route path="classrooms" element={<ClassRooms />} />
        <Route path="faculties" element={<Faculties />} />

        <Route path="students/bulk-upload" element={<StudentBulkUpload />} />
        <Route path="students" element={<StudentsList />} />
        <Route path="students/create" element={<StudentForm/>} />   {/* Create new student */}
        <Route path="students/:id" element={<StudentDetails/>} />  {/* Edit existing student (by ID) */}
        <Route path="students/report" element={<StudentReportPage />} />
        <Route path="students/report/:studentId" element={<StudentReportPage />} />
        {/* <Route path="students" element={<StudentDetails />} />
        <Route path="students" element={<StudentForm />} /> */}

        <Route path="roles" element={<Roles />} />
        <Route path="users" element={<UsersList />} />
        <Route path="users/detail" element={<UserDetails />} />
        <Route path="users/form" element={<UserForm />} />
        <Route path="users/scopes" element={<RoleScopesPage />} />

        <Route path="marks/upload" element={<MarkUploadPage />} />
        <Route path="marks/preview" element={<MarkPreviewPage />} />
        <Route path="marks/preview/:groupKey" element={<MarkPreviewPage />} />
        <Route path="marks/upload-status" element={<UploadStatusPage />} />
        
        {/* <Route path="*" element={<PlaceholderPage />} /> */}
      </Route>

      {/* Fallback: any other protected route goes to dashboard */}
      <Route path="/*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}