'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { NavItem } from '@/types';

/**
 * Hook to filter navigation items based on RBAC using NextAuth session
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  const { data: session } = useSession();

  // Memoize context and permissions
  const accessContext = useMemo(() => {
    const user = session?.user;
    const role = (user as any)?.role;

    return {
      user: user ?? undefined,
      role: role ?? undefined,
    };
  }, [session]);

  // Filter items synchronously
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // No access restrictions
        if (!item.access) {
          return true;
        }

        // Check role
        if (item.access.role) {
          if (accessContext.role !== item.access.role) {
            return false;
          }
        }

        return true;
      })
      .map((item) => {
        // Recursively filter child items
        if (item.items && item.items.length > 0) {
          const filteredChildren = item.items.filter((childItem) => {
            // No access restrictions
            if (!childItem.access) {
              return true;
            }

            // Check role
            if (childItem.access.role) {
              if (accessContext.role !== childItem.access.role) {
                return false;
              }
            }

            return true;
          });

          return {
            ...item,
            items: filteredChildren
          };
        }

        return item;
      });
  }, [items, accessContext]);

  return filteredItems;
}
