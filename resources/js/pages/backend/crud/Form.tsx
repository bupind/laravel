/**
 * resources/js/pages/backend/crud/Form.tsx
 *
 * Generic CRUD form page — dipakai saat $modal = false di BaseCrudController.
 *
 * Dirender oleh:
 *   - create() → mode 'create', record = null
 *   - edit()   → mode 'edit',   record = {data}
 *
 * Props diterima dari BaseCrudController::formPagePayload() / crudPayload():
 *   crud.mode          → 'create' | 'edit'
 *   crud.resource      → metadata (routes, label, key, dsb)
 *   crud.form_schema   → definisi field form
 *   crud.permissions   → flag permission dari server
 *   form.{singular}    → record yang di-edit (null saat create)
 *
 * Shortcut keyboard:
 *   Ctrl+S / Cmd+S  → submit form
 *   Escape          → kembali ke index
 *
 * Untuk form sangat kustom (rich text, upload file, relasi kompleks),
 * buat komponen tersendiri dan set $formComponentName di controller turunan.
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { useModalShortcuts } from '@/hooks/use-modal-shortcuts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';

// Re-export shared types dari Index.tsx agar controller turunan bisa import
export type {
    AnyRecord,
    CrudMeta,
    CrudPermissions,
    DatatableMeta,
    FieldType,
    Filters,
    FormField,
    FormFieldOption,
    ResourceMeta,
    ResourceRoutes,
    TableColumn,
} from './Index';

import { type AnyRecord, type CrudMeta, FormFieldRenderer, buildFormData } from './Index';

// =============================================================================
// Types
// =============================================================================

interface CrudFormProps {
    [key: string]: unknown;
    crud?: CrudMeta;
    form?: Record<string, AnyRecord | null | undefined>;
}

// =============================================================================
// Main Component
// =============================================================================

export default function CrudForm(props: CrudFormProps) {
    const { t } = useLanguage();

    // -------------------------------------------------------------------------
    // Destructure props
    // -------------------------------------------------------------------------
    const crud = props.crud;
    const resource = crud?.resource;
    const formSchema = crud?.form_schema?.fields ?? [];
    const routes = resource?.routes;
    const mode = crud?.mode ?? 'create';
    const isEdit = mode === 'edit';

    const singularKey = resource?.singular ?? 'record';
    const formRecord = props.form?.[singularKey] as AnyRecord | null | undefined;

    // -------------------------------------------------------------------------
    // Form state
    // -------------------------------------------------------------------------
    const initialData = useMemo(
        () => buildFormData(formSchema, isEdit ? formRecord : null),
        // build sekali saat mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const { data, setData, post, put, processing, errors } = useForm<Record<string, string | boolean | number>>(initialData);

    // Sync form data saat formRecord berubah
    // (misal navigasi langsung antar halaman edit berbeda)
    useEffect(() => {
        const populated = buildFormData(formSchema, isEdit ? formRecord : null);
        Object.entries(populated).forEach(([k, v]) => setData(k as never, v as never));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formRecord?.id, mode]);

    // -------------------------------------------------------------------------
    // Navigasi kembali
    // -------------------------------------------------------------------------
    const goBack = useCallback(() => {
        if (routes?.index) {
            router.get(routes.index, {}, { preserveScroll: false });
        }
    }, [routes?.index]);

    // -------------------------------------------------------------------------
    // Submit
    // -------------------------------------------------------------------------
    const submitForm = useCallback(() => {
        if (!routes) return;

        if (isEdit && formRecord?.id) {
            put(`${routes.index}/${formRecord.id}`, {
                preserveScroll: true,
            });
            return;
        }

        post(routes.store, { preserveScroll: true });
    }, [isEdit, formRecord?.id, routes, post, put]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitForm();
    };

    // Keyboard shortcuts: Ctrl+S = submit, Escape = kembali
    useModalShortcuts({
        open: true, // selalu aktif di halaman form
        onSubmit: submitForm,
        onClose: goBack,
        disabled: processing,
    });

    // -------------------------------------------------------------------------
    // Breadcrumbs
    // -------------------------------------------------------------------------
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
        const items: BreadcrumbItem[] = [
            {
                title: resource?.title ?? resource?.label ?? singularKey,
                href: routes?.index ?? '#',
            },
        ];

        items.push({
            title: isEdit ? t('buttons.update') : t('buttons.create'),
            href: '#',
        });

        return items;
    }, [resource, routes, singularKey, isEdit, t]);

    // -------------------------------------------------------------------------
    // Guard
    // -------------------------------------------------------------------------
    if (!crud || !resource) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
                    No resource metadata received. Check controller configuration.
                </div>
            </AppLayout>
        );
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    const pageTitle = isEdit ? `${t('buttons.update')} ${resource.label}` : `${t('buttons.create')} ${resource.label}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Back button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground gap-1.5 pl-0"
                        onClick={goBack}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('buttons.back')}
                    </Button>

                    {/* Form card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle>{pageTitle}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {isEdit
                                            ? t('dialog.edit.description', {
                                                  resource: resource.label,
                                              })
                                            : t('dialog.create.description', { resource: resource.label })}
                                    </CardDescription>
                                </div>

                                <Badge variant={isEdit ? 'secondary' : 'default'} className="shrink-0 text-xs">
                                    {isEdit ? t('buttons.update') : t('buttons.create')}
                                </Badge>
                            </div>
                        </CardHeader>

                        <form onSubmit={handleSubmit} noValidate>
                            <CardContent className="space-y-5">
                                {formSchema.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        No form fields configured. Set <code>$formFields</code> in your controller.
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
                            </CardContent>

                            <CardFooter className="flex justify-between gap-3 border-t pt-6">
                                <Button type="button" variant="outline" onClick={goBack} disabled={processing}>
                                    {t('buttons.cancel')}
                                </Button>

                                <Button type="submit" disabled={processing} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {processing ? t('buttons.saving') : t('buttons.save')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Keyboard shortcut hint */}
                    <p className="text-muted-foreground text-center text-xs">
                        <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">Ctrl+S</kbd> untuk simpan &nbsp;·&nbsp;{' '}
                        <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">Esc</kbd> untuk kembali
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
