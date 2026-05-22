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
import { type AnyRecord, buildFormData, type CrudMeta, FormFieldRenderer, type FormValue } from './Index';

export type {
    AnyRecord,
    CrudMeta,
    CrudPermissions,
    DatatableMeta,
    FieldType,
    Filters,
    FormField,
    FormFieldOption,
    FormValue,
    ResourceMeta,
    ResourceRoutes,
    TableColumn,
} from './Index';

interface CrudFormProps {
    [key: string]: unknown;
    crud?: CrudMeta;
    form?: Record<string, AnyRecord | null | undefined>;
}

export default function CrudForm(props: CrudFormProps) {
    const { t } = useLanguage();
    const crud = props.crud;
    const resource = crud?.resource;
    const formSchema = crud?.form_schema?.fields ?? [];
    const routes = resource?.routes;
    const mode = crud?.mode ?? 'create';
    const isEdit = mode === 'edit';

    const singularKey = resource?.singular ?? 'record';
    const formRecord = props.form?.[singularKey] as AnyRecord | null | undefined;

    const initialData = useMemo(
        () => buildFormData(formSchema, isEdit ? formRecord : null),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const { data, setData, post, put, processing, errors } = useForm<Record<string, FormValue>>(initialData);

    useEffect(() => {
        const populated = buildFormData(formSchema, isEdit ? formRecord : null);
        Object.entries(populated).forEach(([k, v]) => setData(k as never, v as never));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formRecord?.id, mode]);

    const goBack = useCallback(() => {
        if (routes?.index) {
            router.get(routes.index, {}, { preserveScroll: false });
        }
    }, [routes?.index]);

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

    useModalShortcuts({
        open: true,
        onSubmit: submitForm,
        onClose: goBack,
        disabled: processing,
    });

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

    if (!crud || !resource) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">{t('pages.crud.noMetadata')}</div>
            </AppLayout>
        );
    }

    const pageTitle = isEdit ? `${t('buttons.update')} ${resource.label}` : `${t('buttons.create')} ${resource.label}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-2xl space-y-6">
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
                                        {t('pages.crud.noFormFields')} <code>$formFields</code> {t('pages.crud.inController')}
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

                    <p className="text-muted-foreground text-center text-xs">
                        <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">Ctrl+S</kbd> {t('hints.ctrlSave')}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
