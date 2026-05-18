import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ServerDataTable, type DataTableColumn, type PaginatedResponse } from '@/components/datatable/server-data-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Blogs',
        href: '/backend/blogs',
    },
];

interface OptionItem {
    id: number;
    name: string;
}

interface BlogItem {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    is_featured: boolean;
    published_at: string | null;
    created_at: string;
    image_url?: string | null;
    category?: OptionItem | null;
    tags: OptionItem[];
}

interface DatatableState {
    per_page_options?: number[];
    sortable_columns?: string[];
}

interface Props {
    blogs: PaginatedResponse<BlogItem>;
    categories: OptionItem[];
    tags: OptionItem[];
    filters?: {
        search?: string;
        status?: string;
        category_id?: number;
        tag_id?: number;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
        per_page?: number;
    };
    datatable?: DatatableState;
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

export default function BlogIndex({ blogs, categories, tags, filters = {}, datatable }: Props) {
    const activeQuery = useMemo(() => ({
        search: filters.search ?? '',
        status: filters.status ?? '',
        category_id: filters.category_id ?? '',
        tag_id: filters.tag_id ?? '',
        sort_by: filters.sort_by ?? 'created_at',
        sort_dir: filters.sort_dir ?? 'desc',
        per_page: filters.per_page ?? blogs.per_page,
    }), [filters, blogs.per_page]);

    const activeQueryString = useMemo(() => buildQueryString(activeQuery), [activeQuery]);
    const canSort = (column: string) => datatable?.sortable_columns?.includes(column) ?? false;

    const columns: DataTableColumn<BlogItem>[] = [
        {
            key: 'title',
            label: 'Blog',
            sortable: canSort('title'),
            render: (blog) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-16 overflow-hidden rounded border border-border bg-muted">
                        {blog.image_url ? (
                            <img src={blog.image_url} alt={blog.title} className="h-full w-full object-cover" />
                        ) : null}
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium">{blog.title}</div>
                        <div className="text-xs text-muted-foreground">{blog.slug}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            render: (blog) => blog.category?.name ?? '-',
        },
        {
            key: 'tags',
            label: 'Tags',
            render: (blog) => (
                <div className="flex flex-wrap gap-1">
                    {blog.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">-</span>
                    ) : (
                        blog.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>
                        ))
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: canSort('status'),
            render: (blog) => (
                <Badge
                    variant={blog.status === 'published' ? 'default' : 'secondary'}
                    className={blog.status === 'archived' ? 'bg-muted text-muted-foreground' : ''}
                >
                    {blog.status}
                </Badge>
            ),
        },
        {
            key: 'published_at',
            label: 'Published',
            sortable: canSort('published_at'),
            render: (blog) => (blog.published_at ? new Date(blog.published_at).toLocaleString() : '-'),
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '72px',
            minWidth: '72px',
            maxWidth: '72px',
            grow: 0,
            right: true,
            render: (blog) => (
                <div className="flex justify-end">
                    <div className="inline-flex overflow-hidden rounded-md border border-border bg-background">
                        <Button asChild size="icon" variant="ghost" className="h-7 w-7 rounded-none border-r border-border">
                            <Link href={`/backend/blogs/${blog.id}/edit${activeQueryString}`}>
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
                                    <AlertDialogTitle>Delete blog?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Blog <strong>{blog.title}</strong> will be deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => router.delete(`/backend/blogs/${blog.id}`, { preserveScroll: true })}
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
            <Head title="Blogs" />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>
                    <p className="text-muted-foreground">Manage blog posts with category, tags, and image reference.</p>
                </div>

                <ServerDataTable<BlogItem>
                    endpoint="/backend/blogs"
                    data={blogs}
                    columns={columns}
                    filters={activeQuery}
                    perPageOptions={datatable?.per_page_options ?? [25, 50, 100]}
                    searchPlaceholder="Search title or slug..."
                    emptyMessage="No blogs."
                    exportEndpoint="/backend/blogs/export"
                    reloadOnly={['blogs', 'categories', 'tags', 'filters', 'datatable']}
                    toolbarLeft={(
                        <Button asChild size="sm">
                            <Link href={`/backend/blogs/create${activeQueryString}`}>
                                <Plus className="h-4 w-4" />
                                Add Blog
                            </Link>
                        </Button>
                    )}
                    toolbarRight={(
                        <>
                            <Select
                                value={activeQuery.status || '__ALL__'}
                                onValueChange={(value) => {
                                    const status = value === '__ALL__' ? '' : value;
                                    router.get('/backend/blogs', { ...activeQuery, status, page: 1 }, {
                                        only: ['blogs', 'categories', 'tags', 'filters', 'datatable'],
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    });
                                }}
                            >
                                <SelectTrigger className="h-9 w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__ALL__">All status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={activeQuery.category_id ? String(activeQuery.category_id) : '__ALL__'}
                                onValueChange={(value) => {
                                    const category_id = value === '__ALL__' ? '' : Number(value);
                                    router.get('/backend/blogs', { ...activeQuery, category_id, page: 1 }, {
                                        only: ['blogs', 'categories', 'tags', 'filters', 'datatable'],
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    });
                                }}
                            >
                                <SelectTrigger className="h-9 w-[170px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__ALL__">All category</SelectItem>
                                    {categories.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={activeQuery.tag_id ? String(activeQuery.tag_id) : '__ALL__'}
                                onValueChange={(value) => {
                                    const tag_id = value === '__ALL__' ? '' : Number(value);
                                    router.get('/backend/blogs', { ...activeQuery, tag_id, page: 1 }, {
                                        only: ['blogs', 'categories', 'tags', 'filters', 'datatable'],
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    });
                                }}
                            >
                                <SelectTrigger className="h-9 w-[170px]">
                                    <SelectValue placeholder="Tag" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__ALL__">All tag</SelectItem>
                                    {tags.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}
                />
            </div>
        </AppLayout>
    );
}

