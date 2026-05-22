import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage<SharedData>().props;
    const permissions: string[] = (auth as any)?.permissions ?? [];

    const can = (permission: string): boolean => permissions.includes(permission);

    const canAny = (perms: string[]): boolean => perms.some((p) => permissions.includes(p));

    const canAll = (perms: string[]): boolean => perms.every((p) => permissions.includes(p));

    return { can, canAny, canAll, permissions };
}
