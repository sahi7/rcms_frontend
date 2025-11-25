import Sidebar from "@/app/layout/Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-0">
        <Outlet />
      </div>
    </div>
  );
}