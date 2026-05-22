import { type DataTableColumn, type PaginatedResponse, ServerDataTable } from '@/components/datatable/server-data-table';
import FileLibraryPicker from '@/components/files/file-library-picker';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { useModalShortcuts } from '@/hooks/use-modal-shortcuts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FileSpreadsheet, ImageIcon, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';

export type FieldType = 'text' | 'email' | 'password' | 'textarea' | 'checkbox' | 'select' | 'datetime' | 'number' | 'media';

export type FormValue = string | boolean | number;

export interface FormFieldOption {
    value: string | number;
    label: string;
}
export interface FormField {
    name: string;
    label: string;
    type: FieldType;
    default: FormValue;
    required: boolean;
    placeholder?: string;
    options?: FormFieldOption[];
    help?: string;
}

export interface TableColumn {
    key: string;
    label: string;
    sortable: boolean;
    type: FieldType;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
}

export interface ResourceRoutes {
    index: string;
    create: string;
    store: string;
    export?: string | null;
    import?: string | null;
    import_template?: string | null;
}

export interface CrudPermissions {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
}

export interface ResourceMeta {
    name: string;
    singular: string;
    label: string;
    title: string;
    key: string;
    permission_prefix: string;
    routes: ResourceRoutes;
}

export interface CrudMeta {
    modal: boolean;
    mode: 'create' | 'edit' | null;
    open: boolean;
    permissions: CrudPermissions;
    resource: ResourceMeta;
    table: { columns: TableColumn[] };
    form_schema: { fields: FormField[] };
}

export interface DatatableMeta {
    per_page_options?: number[];
    sortable_columns?: string[];
}

export interface Filters {
    search?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    per_page?: number;
}

export type AnyRecord = Record<string, unknown> & { id?: number | string };

export interface CrudIndexProps {
    [key: string]: unknown;
    filters?: Filters;
    datatable?: DatatableMeta;
    crud?: CrudMeta;
    form?: Record<string, AnyRecord | null | undefined>;
}
function buildQueryString(query: Record<string, string | number | undefined>): string {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== '') {
            params.set(k, String(v));
        }
    });
    const s = params.toString();
    return s ? `?${s}` : '';
}

export function buildFormData(fields: FormField[], record: AnyRecord | null | undefined): Record<string, FormValue> {
    const data: Record<string, FormValue> = {};

    fields.forEach((field) => {
        const raw = record?.[field.name];

        if (field.type === 'checkbox') {
            data[field.name] = raw !== undefined ? Boolean(raw) : (field.default as boolean);
        } else if (field.type === 'number') {
            data[field.name] = raw !== undefined ? Number(raw) : ((field.default as number) ?? 0);
        } else {
            data[field.name] = raw !== undefined ? String(raw ?? '') : ((field.default as string) ?? '');
        }
    });

    return data;
}

export function formatCellValue(value: unknown, type: FieldType): React.ReactNode {
    if (value === null || value === undefined || value === '') {
        return <span className="text-muted-foreground text-xs">—</span>;
    }

    switch (type) {
        case 'checkbox': {
            const active = Boolean(value);
            return (
                <Badge variant={active ? 'default' : 'secondary'} className="text-xs">
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
                <a href={`mailto:${value}`} className="text-primary text-sm hover:underline">
                    {String(value)}
                </a>
            );

        case 'number':
            return <span className="text-sm tabular-nums">{Number(value).toLocaleString('id-ID')}</span>;

        case 'media':
            return <img src={String(value)} alt="" className="h-10 w-10 rounded-md border object-cover" loading="lazy" />;

        default:
            return <span className="text-sm">{String(value)}</span>;
    }
}

export interface FormFieldRendererProps {
    field: FormField;
    value: FormValue;
    error?: string;
    onChange: (name: string, value: FormValue) => void;
    disabled?: boolean;
}

export function FormFieldRenderer({ field, value, error, onChange, disabled = false }: FormFieldRendererProps) {
    const inputId = `crud-field-${field.name}`;
    const [pickerOpen, setPickerOpen] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    if (field.type === 'checkbox') {
        return (
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={inputId}
                        checked={Boolean(value)}
                        disabled={disabled}
                        onCheckedChange={(checked) => onChange(field.name, checked === true)}
                    />
                    <Label htmlFor={inputId} className="cursor-pointer font-normal">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                </div>
                {field.help && <p className="text-muted-foreground ml-6 text-xs">{field.help}</p>}
                {error && <p className="text-destructive ml-6 text-xs">{error}</p>}
            </div>
        );
    }

    if (field.type === 'media') {
        return (
            <div className="min-w-0 space-y-1.5">
                <Label htmlFor={inputId}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                <div className="flex min-w-0 flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center">
                    <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                        {previewUrl ? (
                            <img src={previewUrl} alt={field.label} className="h-full w-full object-cover" />
                        ) : (
                            <ImageIcon className="text-muted-foreground h-5 w-5" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="max-w-full truncate text-sm font-medium">{value ? `Media ID: ${String(value)}` : 'Belum ada media dipilih'}</p>
                        {field.help && <p className="text-muted-foreground mt-1 text-xs">{field.help}</p>}
                    </div>
                    <div className="flex shrink-0 gap-2">
                        {value && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={disabled}
                                onClick={() => {
                                    setPreviewUrl(null);
                                    onChange(field.name, '');
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        <Button type="button" variant="outline" disabled={disabled} onClick={() => setPickerOpen(true)}>
                            Pilih / Upload
                        </Button>
                    </div>
                </div>

                {error && <p className="text-destructive text-xs">{error}</p>}

                <FileLibraryPicker
                    open={pickerOpen}
                    onOpenChange={setPickerOpen}
                    onSelect={(item) => {
                        onChange(field.name, String(item.id));
                        setPreviewUrl(item.url);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-w-0 space-y-1.5">
            <Label htmlFor={inputId}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.type === 'textarea' && (
                <Textarea
                    id={inputId}
                    value={String(value)}
                    placeholder={field.placeholder}
                    rows={3}
                    disabled={disabled}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    className={error ? 'border-destructive resize-y' : 'resize-y'}
                />
            )}

            {field.type === 'select' && field.options && (
                <Select value={String(value)} disabled={disabled} onValueChange={(v) => onChange(field.name, v)}>
                    <SelectTrigger className={error ? 'border-destructive min-w-0' : 'min-w-0'}>
                        <SelectValue placeholder={field.placeholder ?? `Pilih ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map((opt) => (
                            <SelectItem key={opt.value} value={String(opt.value)}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {!['textarea', 'select', 'checkbox', 'media'].includes(field.type) && (
                <Input
                    id={inputId}
                    type={field.type === 'datetime' ? 'datetime-local' : field.type}
                    value={String(value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={disabled}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    className={error ? 'border-destructive min-w-0' : 'min-w-0'}
                />
            )}

            {field.help && <p className="text-muted-foreground text-xs">{field.help}</p>}
            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    );
}

export default function CrudIndex(props: CrudIndexProps) {
    const { t } = useLanguage();

    const crud = props.crud;
    const datatable = props.datatable;
    const filters = props.filters ?? {};
    const resource = crud?.resource;
    const formSchema = crud?.form_schema?.fields ?? [];
    const tableSchema = crud?.table?.columns ?? [];
    const routes = resource?.routes;

    const perms = crud?.permissions;
    const canCreate = perms?.create ?? false;
    const canUpdate = perms?.update ?? false;
    const canDelete = perms?.delete ?? false;
    const canExport = perms?.export ?? false;

    const singularKey = resource?.singular ?? 'record';
    const collKey = resource?.name ?? 'records';

    const collection = props[collKey] as PaginatedResponse<AnyRecord> | undefined;
    const formRecord = props.form?.[singularKey] as AnyRecord | null | undefined;

    const initialData = useMemo(() => buildFormData(formSchema, null), [collKey]);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm<Record<string, FormValue>>(initialData);
    const importInputRef = React.useRef<HTMLInputElement>(null);
    const [importing, setImporting] = React.useState(false);

    const activeQuery = useMemo(
        () => ({
            search: filters.search ?? '',
            sort_by: filters.sort_by ?? 'id',
            sort_dir: filters.sort_dir ?? 'desc',
            per_page: filters.per_page ?? collection?.per_page ?? 10,
        }),
        [filters, collection?.per_page],
    );

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);

    const isModalOpen = Boolean(crud?.modal && crud?.open);
    const isEdit = crud?.mode === 'edit' && Boolean(formRecord);
    useEffect(() => {
        if (!crud?.modal) return;

        clearErrors();
        const populated = buildFormData(formSchema, crud.mode === 'edit' ? formRecord : null);
        Object.entries(populated).forEach(([k, v]) => setData(k as never, v as never));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [crud?.modal, crud?.mode, formRecord?.id]);

    const handleModalClose = useCallback(() => {
        reset();
        clearErrors();
        if (routes?.index) {
            router.get(routes.index, activeQuery as Record<string, string | number>, { preserveScroll: true, replace: true });
        }
    }, [reset, clearErrors, routes?.index, activeQuery]);

    const handleModalOpenChange = useCallback(
        (open: boolean) => {
            if (!open) handleModalClose();
        },
        [handleModalClose],
    );

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

    const handleImportFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];

            if (!file || !routes?.import) return;

            setImporting(true);

            try {
                const csvContent = await file.text();

                router.post(
                    routes.import,
                    {
                        csv_content: csvContent,
                        filename: file.name,
                    },
                    {
                        preserveScroll: true,
                        onFinish: () => {
                            setImporting(false);
                            if (importInputRef.current) {
                                importInputRef.current.value = '';
                            }
                        },
                    },
                );
            } catch {
                setImporting(false);
                if (importInputRef.current) {
                    importInputRef.current.value = '';
                }
            }
        },
        [routes?.import],
    );

    // Keyboard shortcuts saat modal terbuka
    useModalShortcuts({
        open: isModalOpen,
        onSubmit: submitForm,
        onClose: handleModalClose,
        disabled: processing,
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: resource?.title ?? resource?.label ?? collKey,
                href: routes?.index ?? '#',
            },
        ],
        [resource, routes, collKey],
    );

    const sortableSet = useMemo(() => new Set(datatable?.sortable_columns ?? []), [datatable?.sortable_columns]);

    const columns: DataTableColumn<AnyRecord>[] = useMemo(() => {
        const schemaColumns: DataTableColumn<AnyRecord>[] = tableSchema.map((col) => ({
            key: col.key,
            label: col.label,
            sortable: col.sortable && sortableSet.has(col.key),
            width: col.width,
            minWidth: col.minWidth,
            maxWidth: col.maxWidth,
            render: (record: AnyRecord) => formatCellValue(record[col.key], col.type),
        }));

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
                                    onClick={() => router.get(`${recordUrl}/edit${activeQueryString}`, {}, { preserveScroll: true })}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span className="sr-only">{t('buttons.edit')}</span>
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
                                            <span className="sr-only">{t('buttons.delete')}</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('dialog.delete.title')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('dialog.delete.description', { item: resource?.label ?? singularKey })}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
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
    }, [tableSchema, sortableSet, canUpdate, canDelete, activeQueryString, processing, resource, routes]);

    if (!crud || !resource || !collection || !routes) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
                    No resource metadata received. Check controller configuration.
                </div>
            </AppLayout>
        );
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={resource.title} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{resource.title}</h1>
                    <p className="text-muted-foreground text-sm">
                        {t(`pages.${resource.name}.description`, {
                            fallback: `Manage ${resource.label}`,
                        })}
                    </p>
                </div>

                <ServerDataTable<AnyRecord>
                    endpoint={routes.index}
                    data={collection}
                    columns={columns}
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [10, 25, 50, 100]}
                    searchPlaceholder={t(`datatable.search`, { fallback: `Search ${resource.label}...` })}
                    emptyMessage={t(`datatable.empty`, { fallback: `No ${resource.label} found.` })}
                    exportEndpoint={canExport ? (routes.export ?? undefined) : undefined}
                    reloadOnly={[collKey, 'filters', 'datatable', 'crud']}
                    toolbarLeft={
                        canCreate ? (
                            <Button size="sm" onClick={() => router.get(`${routes.create}${activeQueryString}`, {}, { preserveScroll: true })}>
                                <Plus className="mr-1.5 h-4 w-4" />
                            </Button>
                        ) : undefined
                    }
                    toolbarRight={
                        canCreate && (routes.import || routes.import_template) ? (
                            <div className="flex items-center gap-2">
                                <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFileChange} />
                                {routes.import_template && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 px-3 font-medium"
                                        onClick={() => window.open(routes.import_template ?? '', '_blank')}
                                    >
                                        <FileSpreadsheet className="h-4 w-4" />
                                        Template CSV
                                    </Button>
                                )}
                                {routes.import && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 px-3 font-medium"
                                        disabled={importing}
                                        onClick={() => importInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4" />
                                        {importing ? 'Uploading...' : 'Import CSV'}
                                    </Button>
                                )}
                            </div>
                        ) : undefined
                    }
                />
            </div>

            {crud.modal && (
                <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                    <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-xl">
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

                        <form className="min-w-0 space-y-4" onSubmit={handleSubmit} noValidate>
                            {formSchema.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    {t('pages.crud.noFormFieldsBefore')} <code>$formFields</code> {t('pages.crud.noFormFieldsAfter')}
                                </p>
                            ) : (
                                formSchema.map((field) => (
                                    <FormFieldRenderer
                                        key={field.name}
                                        field={field}
                                        value={data[field.name] ?? field.default}
                                        error={errors[field.name]}
                                        disabled={processing}
                                        onChange={(name, value) => setData(name as never, value as never)}
                                    />
                                ))
                            )}

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="secondary" onClick={() => handleModalOpenChange(false)} disabled={processing}>
                                    {t('buttons.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('buttons.saving') : t('buttons.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
