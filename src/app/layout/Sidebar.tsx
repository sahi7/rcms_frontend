import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

  const NavContent = () => (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="p-5 border-b flex items-center gap-3">
        <School className="h-8 w-8 text-primary flex-shrink-0" />
        <div className={cn("transition-all duration-300", isCollapsed && "w-0 opacity-0 overflow-hidden")}>
          <h1 className="text-xl font-bold whitespace-nowrap">Report System</h1>
          <p className="text-xs text-muted-foreground">Principal</p>
        </div>
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
                      isCollapsed && "px-3"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className={cn(
                      "ml-3 text-sm transition-all duration-300",
                      isCollapsed && "w-0 opacity-0 overflow-hidden"
                    )}>
                      {item.label}
                    </span>
                  </Button>
                </Link>

                {hasChildren && (
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

              {/* Sub-items — icons only when collapsed */}
              {hasChildren && open && (
                <div className={cn(
                  "space-y-1 transition-all duration-300",
                  isCollapsed ? "pl-0" : "pl-10"
                )}>
                  {item.children!.map((child) => (
                    <Link key={child.path} to={child.path}>
                      <Button
                        variant={location.pathname === child.path ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-10 text-sm",
                          isCollapsed && "px-3 justify-center"
                        )}
                      >
                        <child.icon className="h-4 w-4 flex-shrink-0" />
                        <span className={cn(
                          "ml-3 transition-all duration-300",
                          isCollapsed && "w-0 opacity-0 overflow-hidden"
                        )}>
                          {child.label}
                        </span>
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
                className={cn("w-full justify-start h-11", isCollapsed && "px-3")}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "ml-3 text-sm transition-all duration-300",
                  isCollapsed && "w-0 opacity-0 overflow-hidden"
                )}>
                  Settings
                </span>
              </Button>
            </Link>

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
          </div>

          {isOpen("/settings") && (
            <div className={cn(
              "space-y-1 transition-all duration-300",
              isCollapsed ? "pl-0" : "pl-10"
            )}>
              {settingsItem.children.map((child) => (
                <Link key={child.path} to={child.path}>
                  <Button
                    variant={location.pathname === child.path ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-10 text-sm",
                      isCollapsed && "px-3 justify-center"
                    )}
                  >
                    <child.icon className="h-4 w-4 flex-shrink-0" />
                    <span className={cn(
                      "ml-3 transition-all duration-300",
                      isCollapsed && "w-0 opacity-0 overflow-hidden"
                    )}>
                      {child.label}
                    </span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout — icon only when collapsed */}
      <div className="p-3 border-t">
        <Button onClick={logout} variant="outline" className={cn("w-full", isCollapsed && "px-3 justify-center")}>
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span className={cn(
            "ml-2 transition-all duration-300",
            isCollapsed && "w-0 opacity-0 overflow-hidden"
          )}>
            Logout
          </span>
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
          isCollapsed ? "lg:w-16" : "lg:w-64"
        )}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => {
          if (pinnedItems.size === 0) setIsCollapsed(true);
        }}
      >
        <NavContent />

        {/* Arrow Toggle — always visible, glued to edge */}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute -right-5 top-20 z-50 h-10 w-10 rounded-full bg-card border shadow-lg",
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

      {/* Mobile unchanged */}
      <div className="lg:hidden">
        {/* Your existing mobile code */}
      </div>

      {/* Main content offset */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <main className="min-h-screen pb-20 lg:pb-0">
          {/* Content */}
        </main>
      </div>
    </>
  );
}