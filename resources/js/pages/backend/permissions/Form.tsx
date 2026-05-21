import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModalShortcuts } from '@/hooks/use-modal-shortcuts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';

const NONE_GROUP = '__NONE__';

export interface PermissionChild {
    id: string;
    name: string;
    action: string;
    label: string;
    group: string | null;
    created_at?: string;
}

export interface PermissionModuleForm {
    key: string;
    module: string;
    module_label: string;
    group: string;
    children: PermissionChild[];
    created_at?: string;
}

interface PermissionFormFieldsProps {
    permission?: PermissionModuleForm | null;
    groups?: string[];
    standardActions?: string[];
    onCancel?: () => void;
    onSuccess?: () => void;
    shortcutOpen?: boolean;
}

interface PermissionFormPageProps {
    permission?: PermissionModuleForm | null;
    groups?: string[];
    standardActions?: string[];
}

export function PermissionFormFields({
    permission = null,
    groups = [],
    standardActions = [],
    onCancel,
    onSuccess,
    shortcutOpen = false,
}: PermissionFormFieldsProps) {
    const isEdit = Boolean(permission?.module);
    const groupOptions = useMemo(
        () => (permission?.group && !groups.includes(permission.group) ? [permission.group, ...groups] : groups),
        [groups, permission?.group],
    );

    const { data, setData, post, put, processing, errors } = useForm({
        module: permission?.module ?? '',
        group: permission?.group ?? '',
        new_group: '',
        privileges: permission?.children.map((child) => child.action) ?? [],
        custom_privilege: '',
    });

    useEffect(() => {
        setData({
            module: permission?.module ?? '',
            group: permission?.group ?? '',
            new_group: '',
            privileges: permission?.children.map((child) => child.action) ?? [],
            custom_privilege: '',
        });
    }, [permission?.module]);

    const addPrivilege = (value: string) => {
        const privilege = value.trim().toLowerCase();
        if (!privilege || data.privileges.includes(privilege)) {
            return;
        }

        setData({
            ...data,
            privileges: [...data.privileges, privilege],
            custom_privilege: '',
        });
    };

    const removePrivilege = (value: string) => {
        setData('privileges', data.privileges.filter((privilege) => privilege !== value));
    };

    const submitForm = () => {
        if (!data.module.trim() || data.privileges.length === 0) {
            return;
        }

        const options = {
            preserveScroll: true,
            onSuccess,
        };

        if (isEdit && permission?.module) {
            put(`/backend/permissions/${encodeURIComponent(permission.module)}`, options);
            return;
        }

        post('/backend/permissions', options);
    };

    useModalShortcuts({
        open: shortcutOpen,
        onSubmit: submitForm,
        onClose: onCancel,
        disabled: processing,
    });

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                submitForm();
            }}
        >
            <div className="space-y-1.5">
                <Label htmlFor="module">
                    Path <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="module"
                    placeholder="users"
                    value={data.module}
                    disabled={isEdit}
                    onChange={(event) => setData('module', event.target.value)}
                />
                {errors.module && <p className="text-sm text-red-500">{errors.module}</p>}
            </div>

            <div className="space-y-1.5">
                <Label>Group</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                    <Select
                        value={data.group || NONE_GROUP}
                        onValueChange={(value) => {
                            setData({
                                ...data,
                                group: value === NONE_GROUP ? '' : value,
                                new_group: '',
                            });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih grup" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE_GROUP}>Tanpa grup</SelectItem>
                            {groupOptions.map((group) => (
                                <SelectItem key={group} value={group}>
                                    {group}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Grup baru"
                        value={data.new_group}
                        onChange={(event) => {
                            setData({
                                ...data,
                                group: '',
                                new_group: event.target.value,
                            });
                        }}
                    />
                </div>
                {(errors.group || errors.new_group) && <p className="text-sm text-red-500">{errors.group || errors.new_group}</p>}
            </div>

            <div className="space-y-2">
                <Label>
                    Privileges <span className="text-destructive">*</span>
                </Label>

                {data.privileges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 rounded-md border p-2">
                        {data.privileges.map((privilege) => (
                            <span key={privilege} className="bg-muted flex items-center gap-1 rounded-md px-2 py-0.5 text-sm">
                                {privilege}
                                <button
                                    type="button"
                                    onClick={() => removePrivilege(privilege)}
                                    className="text-muted-foreground hover:text-foreground ml-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                    {standardActions
                        .filter((action) => !data.privileges.includes(action))
                        .map((action) => (
                            <button
                                key={action}
                                type="button"
                                onClick={() => addPrivilege(action)}
                                className="border-border text-muted-foreground hover:border-primary hover:text-primary rounded-full border px-2.5 py-0.5 text-xs transition-colors"
                            >
                                + {action}
                            </button>
                        ))}
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="Privilege custom"
                        value={data.custom_privilege}
                        onChange={(event) => setData('custom_privilege', event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                addPrivilege(data.custom_privilege);
                            }
                        }}
                    />
                    <Button type="button" variant="secondary" onClick={() => addPrivilege(data.custom_privilege)} disabled={!data.custom_privilege.trim()}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {errors.privileges && <p className="text-sm text-red-500">{errors.privileges}</p>}
            </div>

            {data.module.trim() && data.privileges.length > 0 && (
                <div className="bg-muted/40 rounded-md p-3">
                    <div className="flex flex-wrap gap-1">
                        {data.privileges.map((privilege) => (
                            <Badge key={privilege} variant="outline" className="font-mono text-xs">
                                {data.module.trim()}-{privilege}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
                {onCancel ? (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                ) : (
                    <Button type="button" variant="secondary" asChild>
                        <Link href="/backend/permissions">Back</Link>
                    </Button>
                )}
                <Button type="submit" disabled={processing || !data.module.trim() || data.privileges.length === 0}>
                    {processing ? 'Menyimpan...' : 'Save'}
                </Button>
            </div>
        </form>
    );
}

export default function PermissionForm({ permission = null, groups = [], standardActions = [] }: PermissionFormPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Permission Management', href: '/backend/permissions' },
        { title: permission ? 'Update' : 'Create', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={permission ? 'Update Permission' : 'Create Permission'} />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{permission ? 'Update Permission' : 'Create Permission'}</h1>
                    <p className="text-muted-foreground">Define module path, group, and privileges.</p>
                </div>

                <div className="max-w-2xl">
                    <PermissionFormFields permission={permission} groups={groups} standardActions={standardActions} />
                </div>
            </div>
        </AppLayout>
    );
}
