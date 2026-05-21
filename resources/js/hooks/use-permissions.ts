import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

/**
 * usePermissions
 *
 * Reads the `auth.permissions` array shared from the server
 * (HandleInertiaRequests) and exposes helper functions.
 *
 * Usage:
 *   const { can, canAny } = usePermissions();
 *   can('users-create')          → boolean
 *   canAny(['users-create', 'users-update']) → boolean
 */
export function usePermissions() {
    const { auth } = usePage<SharedData>().props;
    const permissions: string[] = (auth as any)?.permissions ?? [];

    /** Check a single permission */
    const can = (permission: string): boolean => permissions.includes(permission);

    /** Check if the user has at least one of the given permissions */
    const canAny = (perms: string[]): boolean => perms.some((p) => permissions.includes(p));

    /** Check if the user has all of the given permissions */
    const canAll = (perms: string[]): boolean => perms.every((p) => permissions.includes(p));

    return { can, canAny, canAll, permissions };
}
