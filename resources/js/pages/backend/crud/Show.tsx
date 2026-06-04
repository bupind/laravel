import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useMemo } from 'react';
import { type AnyRecord, type CrudMeta, RecordDetails } from './Index';

interface CrudShowProps {
    crud?: CrudMeta;
    form?: Record<string, AnyRecord | null | undefined>;

    [key: string]: unknown;
}

export default function CrudShow(props: CrudShowProps) {
    const { t } = useLanguage();
    const crud = props.crud;
    const resource = crud?.resource;
    const routes = resource?.routes;
    const singularKey = resource?.singular ?? 'record';
    const record = props.form?.[singularKey] as AnyRecord | null | undefined;
    const fields = crud?.view_schema?.fields ?? crud?.table?.columns ?? [];
    const recordIdValue = record?.[resource?.key ?? 'id'];
    const recordId = recordIdValue === null || recordIdValue === undefined ? '' : String(recordIdValue);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: resource?.title ?? resource?.label ?? singularKey,
                href: routes?.index ?? '#',
            },
            {
                title: t('buttons.view', { fallback: 'View' }),
                href: '#',
            },
        ],
        [resource, routes, singularKey, t],
    );

    if (!crud || !resource || !routes) {
        return (
            <BackendLayout breadcrumbs={[]}>
                <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">{t('pages.crud.noMetadata')}</div>
            </BackendLayout>
        );
    }

    const pageTitle = `${t('buttons.view', { fallback: 'View' })} ${resource.label}`;

    return (
        <BackendLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground gap-1.5 pl-0"
                        onClick={() => router.get(routes.index, {}, { preserveScroll: false })}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('buttons.back')}
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle>{pageTitle}</CardTitle>
                            <CardDescription>
                                {t('dialog.view.description', {
                                    resource: resource.label,
                                    fallback: `Detail ${resource.label.toLowerCase()} record.`,
                                })}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <RecordDetails record={record} fields={fields} />
                        </CardContent>

                        <CardFooter className="flex justify-end border-t pt-6">
                            <div className="inline-flex overflow-hidden rounded-md border">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="rounded-none border-0"
                                    onClick={() => router.get(routes.index, {}, { preserveScroll: false })}
                                >
                                    {t('buttons.back')}
                                </Button>

                                {crud.permissions.update && recordId && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="gap-2 rounded-none border-l"
                                        onClick={() => router.get(`${routes.index}/${recordId}/edit`)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        {t('buttons.edit')}
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </BackendLayout>
    );
}
