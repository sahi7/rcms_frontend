import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/store/authStore";
import { LogOut, User, School } from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <School className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Report Card System</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium capitalize">
                {user?.first_name} {user?.last_name} ({user?.role})
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Welcome to your School Dashboard
          </h2>
          <p className="text-xl text-gray-600">
            You are logged in as <strong className="capitalize">{user?.role}</strong>
          </p>
          <div className="mt-8 text-6xl">Ready to build the full system!</div>
        </div>
      </main>
    </div>
  );
}