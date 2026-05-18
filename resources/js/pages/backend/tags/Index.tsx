import React, { useEffect, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { ServerDataTable, type DataTableColumn, type PaginatedResponse } from '@/components/datatable/server-data-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tags',
        href: '/backend/tags',
    },
];

interface Tag {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    blogs_count: number;
    created_at: string;
}

interface CrudState {
    modal: boolean;
    mode: 'create' | 'edit' | null;
    open: boolean;
}

interface FormState {
    tag?: Tag | null;
}

interface DatatableState {
    per_page_options?: number[];
    sortable_columns?: string[];
}

interface Props {
    tags: PaginatedResponse<Tag>;
    filters?: {
        search?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
        per_page?: number;
    };
    datatable?: DatatableState;
    crud?: CrudState;
    form?: FormState;
}

function buildQueryString(query: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        params.set(key, String(value));
    });
    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
}

export default function TagIndex({ tags, filters = {}, datatable, crud, form }: Props) {
    const { delete: destroy, data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        description: '',
        is_active: true,
    });

    const activeQuery = useMemo(() => ({
        search: filters.search ?? '',
        sort_by: filters.sort_by ?? 'created_at',
        sort_dir: filters.sort_dir ?? 'desc',
        per_page: filters.per_page ?? tags.per_page,
    }), [filters, tags.per_page]);

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);
    const canSort = (column: string) => datatable?.sortable_columns?.includes(column) ?? false;
    const isModalOpen = Boolean(crud?.modal && crud?.open);
    const isEdit = crud?.mode === 'edit' && Boolean(form?.tag?.id);

    useEffect(() => {
        if (!crud?.modal) return;
        setData({
            name: form?.tag?.name ?? '',
            slug: form?.tag?.slug ?? '',
            description: form?.tag?.description ?? '',
            is_active: form?.tag?.is_active ?? true,
        });
    }, [crud?.modal, crud?.mode, form?.tag?.id, form?.tag?.name, form?.tag?.slug, form?.tag?.description, form?.tag?.is_active, setData]);

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            reset();
            router.get('/backend/tags', activeQuery, { preserveScroll: true, replace: true });
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isEdit && form?.tag?.id) {
            put(`/backend/tags/${form.tag.id}`, { preserveScroll: true });
            return;
        }
        post('/backend/tags', { preserveScroll: true });
    };

    const columns: DataTableColumn<Tag>[] = [
        {
            key: 'name',
            label: 'Tag',
            sortable: canSort('name'),
            render: (tag) => (
                <div className="space-y-1">
                    <div className="font-medium">{tag.name}</div>
                    <div className="text-xs text-muted-foreground">{tag.slug}</div>
                </div>
            ),
        },
        {
            key: 'blogs_count',
            label: 'Blogs',
            sortable: canSort('blogs_count'),
            render: (tag) => <Badge variant="secondary">{tag.blogs_count}</Badge>,
        },
        {
            key: 'is_active',
            label: 'Status',
            sortable: canSort('is_active'),
            render: (tag) => (
                <Badge variant={tag.is_active ? 'default' : 'secondary'}>
                    {tag.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '72px',
            minWidth: '72px',
            maxWidth: '72px',
            grow: 0,
            right: true,
            render: (tag) => (
                <div className="flex justify-end">
                    <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
                        <Button asChild size="icon" variant="ghost" className="h-7 w-7 rounded-none border-r border-border">
                            <Link href={`/backend/tags/${tag.id}/edit${activeQueryString}`}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-none text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete tag?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tag <strong>{tag.name}</strong> will be deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => destroy(`/backend/tags/${tag.id}`, { preserveScroll: true })}
                                        disabled={processing}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tags" />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
                    <p className="text-muted-foreground">Manage blog tags.</p>
                </div>

                <ServerDataTable<Tag>
                    endpoint="/backend/tags"
                    data={tags}
                    columns={columns}
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [25, 50, 100]}
                    searchPlaceholder="Search tag..."
                    emptyMessage="No tags."
                    exportEndpoint="/backend/tags/export"
                    reloadOnly={['tags', 'filters', 'datatable', 'crud']}
                    toolbarLeft={(
                        <Button asChild size="sm">
                            <Link href={`/backend/tags/create${activeQueryString}`}>
                                <Plus className="h-4 w-4" />
                                Add Tag
                            </Link>
                        </Button>
                    )}
                />
            </div>

            <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
                        <DialogDescription>Set tag name, slug, and status.</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="name" className="mb-2 block">Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="slug" className="mb-2 block">Slug</Label>
                            <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="optional" />
                            {errors.slug && <p className="mt-2 text-sm text-red-500">{errors.slug}</p>}
                        </div>
                        <div>
                            <Label htmlFor="description" className="mb-2 block">Description</Label>
                            <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                            {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(value) => setData('is_active', value === true)}
                            />
                            <Label htmlFor="is_active" className="font-normal">Active</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => handleModalOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

