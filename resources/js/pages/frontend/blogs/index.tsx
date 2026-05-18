import { Head, Link, router, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Tag {
    id: number;
    name: string;
    slug: string;
}

interface BlogItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string;
    image_url?: string | null;
    category?: Category | null;
    tags: Tag[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedBlogs {
    data: BlogItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    blogs: PaginatedBlogs;
    categories: Category[];
    tags: Tag[];
    filters: {
        search?: string;
        category?: string;
        tag?: string;
        per_page?: number;
    };
}

export default function BlogFrontendIndex({ blogs, categories, tags, filters }: Props) {
    const { auth, setting } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const appName = setting?.nama_app ?? 'Blog';
    const quickTags = useMemo(() => tags.slice(0, 12), [tags]);

    const applyFilter = (next: Record<string, string | number>) => {
        router.get('/blogs', {
            search: filters.search ?? '',
            category: filters.category ?? '',
            tag: filters.tag ?? '',
            per_page: filters.per_page ?? 12,
            ...next,
            page: 1,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Blogs" />

            <div className="min-h-screen bg-background">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <Link href="/" className="text-lg font-semibold">{appName}</Link>
                            <p className="text-sm text-muted-foreground">Latest published articles</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild size="sm">
                                <Link href="/">Home</Link>
                            </Button>
                            {auth.user ? (
                                <Button asChild size="sm">
                                    <Link href="/backend/dashboard">Dashboard</Link>
                                </Button>
                            ) : (
                                <Button asChild size="sm">
                                    <Link href="/backend/login">Sign In</Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mb-5 flex flex-wrap items-center gap-2">
                        <form
                            className="flex items-center gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                applyFilter({ search });
                            }}
                        >
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search blogs..."
                                className="h-9 w-[240px]"
                            />
                            <Button type="submit" size="sm">Search</Button>
                        </form>

                        <Select
                            value={filters.category && filters.category !== '' ? filters.category : '__all__'}
                            onValueChange={(value) => applyFilter({ category: value === '__all__' ? '' : value })}
                        >
                            <SelectTrigger className="h-9 w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All category</SelectItem>
                                {categories.map((item) => (
                                    <SelectItem key={item.id} value={item.slug}>{item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.tag && filters.tag !== '' ? filters.tag : '__all__'}
                            onValueChange={(value) => applyFilter({ tag: value === '__all__' ? '' : value })}
                        >
                            <SelectTrigger className="h-9 w-[180px]">
                                <SelectValue placeholder="Tag" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All tag</SelectItem>
                                {tags.map((item) => (
                                    <SelectItem key={item.id} value={item.slug}>{item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                        {quickTags.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`rounded-md border px-2 py-1 text-xs ${filters.tag === item.slug ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}
                                onClick={() => applyFilter({ tag: item.slug })}
                            >
                                #{item.name}
                            </button>
                        ))}
                    </div>

                    {blogs.data.length === 0 ? (
                        <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
                            No blog found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {blogs.data.map((blog) => (
                                <article key={blog.id} className="overflow-hidden rounded-md border border-border bg-card">
                                    <Link href={`/blogs/${blog.slug}`} className="block">
                                        <div className="aspect-[16/9] bg-muted">
                                            {blog.image_url ? (
                                                <img src={blog.image_url} alt={blog.title} className="h-full w-full object-cover" />
                                            ) : null}
                                        </div>
                                    </Link>
                                    <div className="space-y-3 p-4">
                                        <div className="flex items-center gap-2">
                                            {blog.category ? <Badge variant="secondary">{blog.category.name}</Badge> : null}
                                            <span className="text-xs text-muted-foreground">{new Date(blog.published_at).toLocaleDateString()}</span>
                                        </div>
                                        <Link href={`/blogs/${blog.slug}`} className="line-clamp-2 text-base font-semibold hover:text-primary">
                                            {blog.title}
                                        </Link>
                                        <p className="line-clamp-3 text-sm text-muted-foreground">
                                            {blog.excerpt ?? ''}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {blogs.links.map((link, index) => (
                            <Button
                                key={`${link.label}-${index}`}
                                type="button"
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => {
                                    if (!link.url) return;
                                    router.visit(link.url, { preserveScroll: true, preserveState: true });
                                }}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

