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
        title: 'Categories',
        href: '/backend/categories',
    },
];

interface Category {
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
    category?: Category | null;
}

interface DatatableState {
    per_page_options?: number[];
    sortable_columns?: string[];
}

interface Props {
    categories: PaginatedResponse<Category>;
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

export default function CategoryIndex({ categories, filters = {}, datatable, crud, form }: Props) {
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
        per_page: filters.per_page ?? categories.per_page,
    }), [filters, categories.per_page]);

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);
    const canSort = (column: string) => datatable?.sortable_columns?.includes(column) ?? false;
    const isModalOpen = Boolean(crud?.modal && crud?.open);
    const isEdit = crud?.mode === 'edit' && Boolean(form?.category?.id);

    useEffect(() => {
        if (!crud?.modal) return;
        setData({
            name: form?.category?.name ?? '',
            slug: form?.category?.slug ?? '',
            description: form?.category?.description ?? '',
            is_active: form?.category?.is_active ?? true,
        });
    }, [crud?.modal, crud?.mode, form?.category?.id, form?.category?.name, form?.category?.slug, form?.category?.description, form?.category?.is_active, setData]);

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            reset();
            router.get('/backend/categories', activeQuery, { preserveScroll: true, replace: true });
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isEdit && form?.category?.id) {
            put(`/backend/categories/${form.category.id}`, { preserveScroll: true });
            return;
        }
        post('/backend/categories', { preserveScroll: true });
    };

    const columns: DataTableColumn<Category>[] = [
        {
            key: 'name',
            label: 'Category',
            sortable: canSort('name'),
            render: (category) => (
                <div className="space-y-1">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">{category.slug}</div>
                </div>
            ),
        },
        {
            key: 'blogs_count',
            label: 'Blogs',
            sortable: canSort('blogs_count'),
            render: (category) => <Badge variant="secondary">{category.blogs_count}</Badge>,
        },
        {
            key: 'is_active',
            label: 'Status',
            sortable: canSort('is_active'),
            render: (category) => (
                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                    {category.is_active ? 'Active' : 'Inactive'}
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
            render: (category) => (
                <div className="flex justify-end">
                    <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
                        <Button asChild size="icon" variant="ghost" className="h-7 w-7 rounded-none border-r border-border">
                            <Link href={`/backend/categories/${category.id}/edit${activeQueryString}`}>
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
                                    <AlertDialogTitle>Delete category?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Category <strong>{category.name}</strong> will be deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => destroy(`/backend/categories/${category.id}`, { preserveScroll: true })}
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
            <Head title="Categories" />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">Manage blog categories.</p>
                </div>

                <ServerDataTable<Category>
                    endpoint="/backend/categories"
                    data={categories}
                    columns={columns}
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [25, 50, 100]}
                    searchPlaceholder="Search category..."
                    emptyMessage="No categories."
                    exportEndpoint="/backend/categories/export"
                    reloadOnly={['categories', 'filters', 'datatable', 'crud']}
                    toolbarLeft={(
                        <Button asChild size="sm">
                            <Link href={`/backend/categories/create${activeQueryString}`}>
                                <Plus className="h-4 w-4" />
                                Add Category
                            </Link>
                        </Button>
                    )}
                />
            </div>

            <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
                        <DialogDescription>Set category name, slug, and status.</DialogDescription>
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

