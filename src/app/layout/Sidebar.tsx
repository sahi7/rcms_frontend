import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import {
  Home, Users, User, FileText, Settings, LogOut, School,
  CalendarDays, BookOpen, CheckSquare, Download,
  ChevronLeft, ChevronRight, Pin, PinOff
} from "lucide-react";
import { useAuthStore } from "@/app/store/authStore";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Overview", path: "/" },
  { icon: Users, label: "Users & Teachers", path: "/users" },
  { icon: CheckSquare, label: "Marks", path: "/marks" },
  {
    icon: FileText,
    label: "Report Cards",
    path: "/reports",
    children: [{ icon: Download, label: "Downloads", path: "/reports/downloads" }],
  },
];

const settingsItem = {
  icon: Settings,
  label: "Settings",
  path: "/settings",
  children: [
    { icon: User, label: "My Profile", path: "/settings/profile" },
    { icon: BookOpen, label: "Assignments", path: "/settings/subjects" },
    { icon: CalendarDays, label: "Academic Years", path: "/academic/years" },
  ],
};

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set());

  const togglePin = (path: string) => {
    setPinnedItems(prev => {
      const newSet = new Set(prev);
      newSet.has(path) ? newSet.delete(path) : newSet.add(path);
      return newSet;
    });
  };

  const isPinned = (path: string) => pinnedItems.has(path);
  const isOpen = (path: string) => isPinned(path) || !isCollapsed;

  const NavContent = ({ showText = true }: { showText?: boolean }) => (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="p-5 border-b flex items-center gap-3">
        <School className="h-8 w-8 text-primary flex-shrink-0" />
        {showText && (
          <div className="transition-all duration-300">
            <h1 className="text-xl font-bold whitespace-nowrap">Report System</h1>
            <p className="text-xs text-muted-foreground">Principal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);
          const hasChildren = !!item.children;
          const open = isOpen(item.path);

          return (
            <div key={item.path} className="space-y-1">
              <div className="flex items-center group">
                <Link to={item.path} className="flex-1">
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-11",
                      !showText && "px-3 justify-center"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", !showText && "h-6 w-6")} />
                    {showText && (
                      <span className="ml-3 text-sm">{item.label}</span>
                    )}
                  </Button>
                </Link>

                {hasChildren && showText && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => togglePin(item.path)}
                  >
                    {isPinned(item.path) ? (
                      <Pin className="h-4 w-4 text-primary" />
                    ) : (
                      <PinOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>

              {hasChildren && open && showText && (
                <div className="space-y-1 pl-10">
                  {item.children!.map((child) => (
                    <Link key={child.path} to={child.path}>
                      <Button
                        variant={location.pathname === child.path ? "secondary" : "ghost"}
                        className="w-full justify-start h-10 text-sm"
                      >
                        <child.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="ml-3">{child.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Settings Group */}
        <div className="space-y-1">
          <div className="flex items-center group">
            <Link to="/settings" className="flex-1">
              <Button
                variant={
                  location.pathname.startsWith("/settings") ||
                    location.pathname.startsWith("/academic")
                    ? "secondary"
                    : "ghost"
                }
                className={cn("w-full justify-start h-11", !showText && "px-3 justify-center")}
              >
                <Settings className={cn("h-5 w-5 flex-shrink-0", !showText && "h-6 w-6")} />
                {showText && <span className="ml-3 text-sm">Settings</span>}
              </Button>
            </Link>

            {showText && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => togglePin("/settings")}
              >
                {isPinned("/settings") ? (
                  <Pin className="h-4 w-4 text-primary" />
                ) : (
                  <PinOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            )}
          </div>

          {isOpen("/settings") && showText && (
            <div className="space-y-1 pl-10">
              {settingsItem.children.map((child) => (
                <Link key={child.path} to={child.path}>
                  <Button
                    variant={location.pathname === child.path ? "secondary" : "ghost"}
                    className="w-full justify-start h-10 text-sm"
                  >
                    <child.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="ml-3">{child.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t">
        <Button onClick={logout} variant="outline" className={cn("w-full", !showText && "px-3 justify-center")}>
          <LogOut className={cn("h-4 w-4 flex-shrink-0", !showText && "h-5 w-5")} />
          {showText && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:border-r lg:bg-card h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:w-20" : "lg:w-64" // wider when collapsed to show text
        )}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => {
          if (pinnedItems.size === 0) setIsCollapsed(true);
        }}
      >
        <NavContent showText={!isCollapsed} />

        {/* Toggle Button — only on desktop */}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute -right-5 top-20 z-50 h-10 w-10 rounded-full bg-card border shadow-lg hidden lg:flex",
            "hover:scale-110 transition-transform duration-200"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </aside>

      {/* Mobile */}
      <div className="lg:hidden">
        {/* Bottom Navigation — Icons Only */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
          <div className="grid grid-cols-5 h-16">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center py-2"
                >
                  <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                </Link>
              );
            })}
            <Link
              to="/settings"
              className="flex flex-col items-center justify-center py-2"
            >
              <Settings className={cn(
                "h-6 w-6",
                location.pathname.startsWith("/settings") || location.pathname.startsWith("/academic")
                  ? "text-primary"
                  : "text-muted-foreground"
              )} />
            </Link>
          </div>
        </nav>

        {/* Hamburger → Full Sidebar Drawer */}
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
            <NavContent showText={true} /> {/* Full text in drawer */}
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content offset */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:pl-20" : "lg:pl-64",
        "pb-20 lg:pb-0"
      )}>
        <main className="min-h-screen">
          {/* Content */}
        </main>
      </div>
    </>
  );
}