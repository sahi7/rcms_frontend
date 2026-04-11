// src/hooks/shared/useHasPermission.ts
import { useAuthStore } from '@/app/store/authStore';

// Top-level roles that have FULL access to everything
const FULL_ACCESS_ROLES = ['chancelor', 'pricipal' ];

// Helper to normalize permission string (handles both "add.user" and "add_user")
const normalizePermission = (perm: string): string => {
  return perm.toLowerCase().replace(/\./g, '_');
};

export function useHasPermission(requiredPermission: string): boolean {
  const { user, permissions } = useAuthStore();

  // 1. Top-level roles have access to EVERYTHING
  if (user?.role && FULL_ACCESS_ROLES.includes(user?.role.toLowerCase())) {
    return true;
  }

  if (!permissions || permissions.length === 0) {
    return false;
  }

  const normalizedRequired = normalizePermission(requiredPermission);

  // 2. Check against stored permissions (both formats supported)
  return permissions.some((p) => normalizePermission(p) === normalizedRequired);
}

// Optional clean component for JSX
export function Can({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const hasPermission = useHasPermission(permission);
  return hasPermission ? <>{children}</> : null;
}