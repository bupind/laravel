/**
 * resources/js/pages/backend/crud/Index.tsx
 *
 * Generic CRUD page — dipakai semua modul yang menggunakan BaseCrudController
 * dengan $componentName = 'backend/crud/Index' (default).
 *
 * Dua mode:
 *   modal = true  → tabel + Dialog form (default BaseCrudController)
 *   modal = false → tabel saja (form di halaman terpisah → Form.tsx)
 *
 * Semua konfigurasi (kolom, field form, route, permission) dari props `crud`
 * yang dikirim controller — tidak ada hardcode di sini.
 *
 * Shortcut keyboard di modal:
 *   Ctrl+S / Cmd+S  → submit form
 *   Escape          → tutup modal
 */

import {
    ServerDataTable,
    type DataTableColumn,
    type PaginatedResponse,
} from '@/components/datatable/server-data-table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { useModalShortcuts } from '@/hooks/use-modal-shortcuts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';

// =============================================================================
// Types — cermin dari BaseCrudController PHP
// =============================================================================

/** Tipe field form, sesuai guessFieldType() di BaseCrudController. */
export type FieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'checkbox'
    | 'select'
    | 'datetime'
    | 'number';

export interface FormFieldOption {
    value: string | number;
    label: string;
}

/** Skema satu field form — dari BaseCrudController::resolvedFormFields(). */
export interface FormField {
    name: string;
    label: string;
    type: FieldType;
    default: string | boolean | number;
    required: boolean;
    placeholder?: string;
    options?: FormFieldOption[];
    help?: string;
}

/** Definisi satu kolom tabel — dari BaseCrudController::resolvedTableColumns(). */
export interface TableColumn {
    key: string;
    label: string;
    sortable: boolean;
    type: FieldType;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
}

/** Route endpoints resource — dari BaseCrudController::resourceMetadata(). */
export interface ResourceRoutes {
    index: string;
    create: string;
    store: string;
    export?: string | null;
}

/** Permission flags — dari BaseCrudController::resolvedPermissions(). */
export interface CrudPermissions {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
}

/** Metadata resource — dari BaseCrudController::resourceMetadata(). */
export interface ResourceMeta {
    name: string;
    singular: string;
    label: string;
    title: string;
    key: string;
    permission_prefix: string;
    routes: ResourceRoutes;
}

/** Payload `crud` — dari BaseCrudController. */
export interface CrudMeta {
    modal: boolean;
    mode: 'create' | 'edit' | null;
    open: boolean;
    permissions: CrudPermissions;
    resource: ResourceMeta;
    table: { columns: TableColumn[] };
    form_schema: { fields: FormField[] };
}

/** Payload `datatable` — dari BaseCrudController. */
export interface DatatableMeta {
    per_page_options?: number[];
    sortable_columns?: string[];
}

/** Payload `filters` — dari BaseCrudController. */
export interface Filters {
    search?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    per_page?: number;
}

export type AnyRecord = Record<string, unknown> & { id?: number | string };

/** Props halaman dari Inertia. */
export interface CrudIndexProps {
    [key: string]: unknown;
    filters?: Filters;
    datatable?: DatatableMeta;
    crud?: CrudMeta;
    form?: Record<string, AnyRecord | null | undefined>;
}

// =============================================================================
// Helpers
// =============================================================================

function buildQueryString(
    query: Record<string, string | number | undefined>,
): string {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== '') {
            params.set(k, String(v));
        }
    });
    const s = params.toString();
    return s ? `?${s}` : '';
}

/**
 * Bangun initial form data dari schema field dan nilai record (saat edit).
 */
export function buildFormData(
    fields: FormField[],
    record: AnyRecord | null | undefined,
): Record<string, string | boolean | number> {
    const data: Record<string, string | boolean | number> = {};

    fields.forEach((field) => {
        const raw = record?.[field.name];

        if (field.type === 'checkbox') {
            data[field.name] =
                raw !== undefined ? Boolean(raw) : (field.default as boolean);
        } else if (field.type === 'number') {
            data[field.name] =
                raw !== undefined
                    ? Number(raw)
                    : ((field.default as number) ?? 0);
        } else {
            data[field.name] =
                raw !== undefined
                    ? String(raw ?? '')
                    : ((field.default as string) ?? '');
        }
    });

    return data;
}

/**
 * Format nilai sel tabel sesuai tipe kolom.
 */
export function formatCellValue(
    value: unknown,
    type: FieldType,
): React.ReactNode {
    if (value === null || value === undefined || value === '') {
        return (
            <span className="text-muted-foreground text-xs">—</span>
        );
    }

    switch (type) {
        case 'checkbox': {
            const active = Boolean(value);
            return (
                <Badge
                    variant={active ? 'default' : 'secondary'}
                    className="text-xs"
                >
                    {active ? 'Active' : 'Inactive'}
                </Badge>
            );
        }

        case 'datetime': {
            try {
                return (
                    <span className="text-muted-foreground text-xs tabular-nums">
                        {new Date(String(value)).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                );
            } catch {
                return String(value);
            }
        }

        case 'email':
            return (
                <a
                    href={`mailto:${value}`}
                    className="text-primary text-sm hover:underline"
                >
                    {String(value)}
                </a>
            );

        case 'number':
            return (
                <span className="text-sm tabular-nums">
                    {Number(value).toLocaleString('id-ID')}
                </span>
            );

        default:
            return <span className="text-sm">{String(value)}</span>;
    }
}

// =============================================================================
// FormFieldRenderer — render satu field form berdasarkan tipe
// =============================================================================

export interface FormFieldRendererProps {
    field: FormField;
    value: string | boolean | number;
    error?: string;
    onChange: (name: string, value: string | boolean | number) => void;
    disabled?: boolean;
}

export function FormFieldRenderer({
                                      field,
                                      value,
                                      error,
                                      onChange,
                                      disabled = false,
                                  }: FormFieldRendererProps) {
    const inputId = `crud-field-${field.name}`;

    if (field.type === 'checkbox') {
        return (
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={inputId}
                        checked={Boolean(value)}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                            onChange(field.name, checked === true)
                        }
                    />
                    <Label
                        htmlFor={inputId}
                        className="cursor-pointer font-normal"
                    >
                        {field.label}
                        {field.required && (
                            <span className="text-destructive ml-1">*</span>
                        )}
                    </Label>
                </div>
                {field.help && (
                    <p className="text-muted-foreground ml-6 text-xs">
                        {field.help}
                    </p>
                )}
                {error && (
                    <p className="text-destructive ml-6 text-xs">{error}</p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <Label htmlFor={inputId}>
                {field.label}
                {field.required && (
                    <span className="text-destructive ml-1">*</span>
                )}
            </Label>

            {field.type === 'textarea' && (
                <Textarea
                    id={inputId}
                    value={String(value)}
                    placeholder={field.placeholder}
                    rows={3}
                    disabled={disabled}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    className={error ? 'border-destructive' : ''}
                />
            )}

            {field.type === 'select' && field.options && (
                <Select
                    value={String(value)}
                    disabled={disabled}
                    onValueChange={(v) => onChange(field.name, v)}
                >
                    <SelectTrigger
                        className={error ? 'border-destructive' : ''}
                    >
                        <SelectValue
                            placeholder={
                                field.placeholder ?? `Pilih ${field.label}`
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map((opt) => (
                            <SelectItem
                                key={opt.value}
                                value={String(opt.value)}
                            >
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {!['textarea', 'select', 'checkbox'].includes(field.type) && (
                <Input
                    id={inputId}
                    type={
                        field.type === 'datetime'
                            ? 'datetime-local'
                            : field.type
                    }
                    value={String(value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={disabled}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    className={error ? 'border-destructive' : ''}
                />
            )}

            {field.help && (
                <p className="text-muted-foreground text-xs">{field.help}</p>
            )}
            {error && (
                <p className="text-destructive text-xs">{error}</p>
            )}
        </div>
    );
}

// =============================================================================
// Main Component
// =============================================================================

export default function CrudIndex(props: CrudIndexProps) {
    const { t } = useLanguage();

    // -------------------------------------------------------------------------
    // Destructure metadata dari props
    // -------------------------------------------------------------------------
    const crud = props.crud;
    const datatable = props.datatable;
    const filters = props.filters ?? {};
    const resource = crud?.resource;
    const formSchema = crud?.form_schema?.fields ?? [];
    const tableSchema = crud?.table?.columns ?? [];
    const routes = resource?.routes;

    // Permission dievaluasi di server PHP — aman dari manipulasi client
    const perms = crud?.permissions;
    const canCreate = perms?.create ?? false;
    const canUpdate = perms?.update ?? false;
    const canDelete = perms?.delete ?? false;
    const canExport = perms?.export ?? false;

    const singularKey = resource?.singular ?? 'record';
    const collKey = resource?.name ?? 'records';

    const collection = props[collKey] as PaginatedResponse<AnyRecord> | undefined;
    const formRecord = props.form?.[singularKey] as AnyRecord | null | undefined;

    // -------------------------------------------------------------------------
    // Form state via Inertia useForm
    // -------------------------------------------------------------------------
    const initialData = useMemo(
        () => buildFormData(formSchema, null),
        // rebuild hanya saat resource berganti
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [collKey],
    );

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<Record<string, string | boolean | number>>(initialData);

    // -------------------------------------------------------------------------
    // Active query — dipertahankan saat navigasi modal & pagination
    // -------------------------------------------------------------------------
    const activeQuery = useMemo(
        () => ({
            search: filters.search ?? '',
            sort_by: filters.sort_by ?? 'id',
            sort_dir: filters.sort_dir ?? 'desc',
            per_page: filters.per_page ?? collection?.per_page ?? 10,
        }),
        [filters, collection?.per_page],
    );

    const activeQueryString = useMemo(
        () => buildQueryString(activeQuery),
        [activeQuery],
    );

    // -------------------------------------------------------------------------
    // Modal state
    // -------------------------------------------------------------------------
    const isModalOpen = Boolean(crud?.modal && crud?.open);
    const isEdit = crud?.mode === 'edit' && Boolean(formRecord);

    // Isi / kosongkan form saat modal dibuka
    useEffect(() => {
        if (!crud?.modal) return;

        clearErrors();
        const populated = buildFormData(
            formSchema,
            crud.mode === 'edit' ? formRecord : null,
        );
        Object.entries(populated).forEach(([k, v]) =>
            setData(k as never, v as never),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [crud?.modal, crud?.mode, formRecord?.id]);

    const handleModalClose = useCallback(() => {
        reset();
        clearErrors();
        if (routes?.index) {
            router.get(
                routes.index,
                activeQuery as Record<string, string>,
                { preserveScroll: true, replace: true },
            );
        }
    }, [reset, clearErrors, routes?.index, activeQuery]);

    const handleModalOpenChange = useCallback(
        (open: boolean) => {
            if (!open) handleModalClose();
        },
        [handleModalClose],
    );

    // -------------------------------------------------------------------------
    // Form submit
    // -------------------------------------------------------------------------
    const submitForm = useCallback(() => {
        if (!routes) return;

        if (isEdit && formRecord?.id) {
            put(`${routes.index}/${formRecord.id}`, { preserveScroll: true });
            return;
        }

        post(routes.store, { preserveScroll: true });
    }, [isEdit, formRecord?.id, routes, post, put]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitForm();
    };

    // Keyboard shortcuts saat modal terbuka
    useModalShortcuts({
        open: isModalOpen,
        onSubmit: submitForm,
        onClose: handleModalClose,
        disabled: processing,
    });

    // -------------------------------------------------------------------------
    // Breadcrumbs
    // -------------------------------------------------------------------------
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: resource?.title ?? resource?.label ?? collKey,
                href: routes?.index ?? '#',
            },
        ],
        [resource, routes, collKey],
    );

    // -------------------------------------------------------------------------
    // Kolom tabel — di-generate dari tableSchema + permission
    // -------------------------------------------------------------------------
    const sortableSet = useMemo(
        () => new Set(datatable?.sortable_columns ?? []),
        [datatable?.sortable_columns],
    );

    const columns: DataTableColumn<AnyRecord>[] = useMemo(() => {
        const schemaColumns: DataTableColumn<AnyRecord>[] = tableSchema.map(
            (col) => ({
                key: col.key,
                label: col.label,
                sortable: col.sortable && sortableSet.has(col.key),
                width: col.width,
                minWidth: col.minWidth,
                maxWidth: col.maxWidth,
                render: (record: AnyRecord) =>
                    formatCellValue(record[col.key], col.type),
            }),
        );

        // Kolom Actions — hanya tampil jika ada permission update atau delete
        if (!canUpdate && !canDelete) return schemaColumns;

        const actionsCol: DataTableColumn<AnyRecord> = {
            key: 'actions',
            label: t('columns.actions'),
            width: '80px',
            minWidth: '80px',
            maxWidth: '80px',
            grow: 0,
            right: true,
            render: (record: AnyRecord) => {
                const recordId = record[resource?.key ?? 'id'];
                const recordUrl = `${routes?.index ?? ''}/${recordId}`;

                return (
                    <div className="flex justify-end">
                        <div className="border-border bg-background inline-flex overflow-hidden rounded-md border">
                            {canUpdate && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="border-border h-7 w-7 rounded-none border-r"
                                    title={t('buttons.edit')}
                                    onClick={() =>
                                        router.get(
                                            `${recordUrl}/edit${activeQueryString}`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span className="sr-only">
                                        {t('buttons.edit')}
                                    </span>
                                </Button>
                            )}

                            {canDelete && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive h-7 w-7 rounded-none"
                                            title={t('buttons.delete')}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span className="sr-only">
                                                {t('buttons.delete')}
                                            </span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                {t('dialog.delete.title', {
                                                    resource:
                                                        resource?.label ??
                                                        singularKey,
                                                })}
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t(
                                                    'dialog.delete.description',
                                                    {
                                                        resource:
                                                            resource?.label ??
                                                            singularKey,
                                                    },
                                                )}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                {t('buttons.cancel')}
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() =>
                                                    destroy(recordUrl, {
                                                        preserveScroll: true,
                                                    })
                                                }
                                                disabled={processing}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                {t('buttons.delete')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                );
            },
        };

        return [...schemaColumns, actionsCol];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        tableSchema,
        sortableSet,
        canUpdate,
        canDelete,
        activeQueryString,
        processing,
        resource,
        routes,
    ]);

    // -------------------------------------------------------------------------
    // Guard — metadata tidak lengkap
    // -------------------------------------------------------------------------
    if (!crud || !resource || !collection) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
                    No resource metadata received. Check controller
                    configuration.
                </div>
            </AppLayout>
        );
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={resource.title} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {resource.title}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {t(`pages.${resource.name}.description`, {
                            fallback: `Manage ${resource.label}`,
                        })}
                    </p>
                </div>

                {/* Data table */}
                <ServerDataTable<AnyRecord>
                    endpoint={routes.index}
                    data={collection}
                    columns={columns}
                    filters={activeQuery}
                    perPageOptions={
                        datatable?.per_page_options ?? [10, 25, 50, 100]
                    }
                    searchPlaceholder={t(
                        `pages.${resource.name}.search`,
                        { fallback: `Search ${resource.label}...` },
                    )}
                    emptyMessage={t(
                        `pages.${resource.name}.empty`,
                        { fallback: `No ${resource.label} found.` },
                    )}
                    exportEndpoint={
                        canExport ? (routes.export ?? undefined) : undefined
                    }
                    reloadOnly={[collKey, 'filters', 'datatable', 'crud']}
                    toolbarLeft={
                        canCreate ? (
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.get(
                                        `${routes.create}${activeQueryString}`,
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                            </Button>
                        ) : undefined
                    }
                />
            </div>

            {/* ----------------------------------------------------------------
                Modal form — hanya dirender jika crud.modal = true
                Keyboard: Ctrl+S = submit, Escape = tutup
            ---------------------------------------------------------------- */}
            {crud.modal && (
                <Dialog
                    open={isModalOpen}
                    onOpenChange={handleModalOpenChange}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>
                                {isEdit
                                    ? t('buttons.update', {
                                        resource: resource.label,
                                    })
                                    : t('buttons.create', {
                                        resource: resource.label,
                                    })}
                            </DialogTitle>
                            <DialogDescription>
                                {isEdit
                                    ? t('dialog.edit.description', {
                                        resource: resource.label,
                                    })
                                    : t('dialog.create.description', {
                                        resource: resource.label,
                                    })}
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            className="space-y-4"
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            {formSchema.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No form fields configured. Set{' '}
                                    <code>$formFields</code> in your
                                    controller.
                                </p>
                            ) : (
                                formSchema.map((field) => (
                                    <FormFieldRenderer
                                        key={field.name}
                                        field={field}
                                        value={data[field.name] ?? field.default}
                                        error={errors[field.name]}
                                        disabled={processing}
                                        onChange={(name, value) =>
                                            setData(
                                                name as never,
                                                value as never,
                                            )
                                        }
                                    />
                                ))
                            )}

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => handleModalOpenChange(false)}
                                    disabled={processing}
                                >
                                    {t('buttons.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? t('buttons.saving')
                                        : t('buttons.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
