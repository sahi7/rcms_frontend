import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu, Home, Users, User, GraduationCap, Settings, LogOut, School,
  CalendarDays, BookOpen
} from "lucide-react";
import { useAuthStore } from "@/app/store/authStore";

const navItems = [
  { icon: Home, label: "Overview", path: "/" },
  { icon: Users, label: "Users & Teachers", path: "/users" },
  // { icon: GraduationCap, label: "Students", path: "/students" },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b">
        <div className="flex items-center gap-3">
          <School className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Report System</h1>
            <p className="text-xs text-muted-foreground">Principal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start h-11"
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span className="text-sm">{item.label}</span>
              </Button>
            </Link>
          );
        })}

        {/* Settings Group - Always Expanded */}
        <div className="space-y-1 pt-3">
          <Link to="/settings">
            <Button
              variant={
                location.pathname.startsWith("/settings") ||
                  location.pathname.startsWith("/academic")
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start h-11"
            >
              <Settings className="mr-3 h-5 w-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </Link>
          {/* Sub-items - indented */}
          <div className="space-y-1 pl-10">
            <Link to="/settings/profile">
              <Button variant={location.pathname === "/settings/profile" ? "secondary" : "ghost"} className="w-full justify-start h-10 text-sm">
                <User className="mr-3 h-4 w-4" />
                My Profile
              </Button>
            </Link>


            <Link to="/settings/subjects">
              <Button
                variant={location.pathname.startsWith("/settings/subjects") ? "secondary" : "ghost"}
                className="w-full justify-start h-10 text-sm"
              >
                <BookOpen className="mr-3 h-4 w-4" />
                Assignments
              </Button>
            </Link>

            <Link to="/academic/years">
              <Button
                variant={location.pathname.startsWith("/academic") ? "secondary" : "ghost"}
                className="w-full justify-start h-10 text-sm"
              >
                <CalendarDays className="mr-3 h-4 w-4" />
                Academic Years
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="p-3 border-t">
        <Button onClick={logout} variant="outline" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card h-screen fixed left-0 top-0 z-40">
        <NavContent />
      </aside>

      {/* Mobile Bottom Bar + Sheet */}
      <div className="lg:hidden">
        {/* Bottom Navigation - Only main items */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
          <div className="grid grid-cols-4 h-16"> {/* 4 items now */}
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center">
                  <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs mt-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {item.label.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
            {/* Settings as 4th icon */}
            <Link to="/settings" className="flex flex-col items-center justify-center">
              <Settings className={`h-5 w-5 ${location.pathname.startsWith("/academic") || location.pathname.startsWith("/settings") ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs mt-1 ${location.pathname.startsWith("/academic") || location.pathname.startsWith("/settings") ? "text-primary" : "text-muted-foreground"}`}>
                Settings
              </span>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed left-4 top-4 z-50 rounded-full shadow-lg"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content offset */}
      <div className="lg:pl-64">
        <main className="min-h-screen pb-20 lg:pb-0">
          {/* Your page content goes here */}
        </main>
      </div>
    </>
  );
}