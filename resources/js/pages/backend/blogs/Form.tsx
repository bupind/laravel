import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import FileLibraryPicker from '@/components/files/file-library-picker';

interface OptionItem {
    id: number;
    name: string;
}

interface BlogFormData {
    id: number;
    title: string;
    slug: string;
    category_id: number | null;
    image_media_id: number | null;
    image_url?: string | null;
    excerpt: string | null;
    content: string;
    status: 'draft' | 'published' | 'archived';
    is_featured: boolean;
    published_at: string | null;
    tag_ids?: number[];
}

interface Props {
    blog?: BlogFormData | null;
    categories: OptionItem[];
    tags: OptionItem[];
}

function toDateTimeLocal(dateValue?: string | null): string {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function BlogForm({ blog, categories, tags }: Props) {
    const isEdit = Boolean(blog?.id);
    const [filePickerOpen, setFilePickerOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>(blog?.image_url ?? '');

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Blogs', href: '/backend/blogs' },
        { title: isEdit ? 'Edit Blog' : 'Add Blog', href: '#' },
    ], [isEdit]);

    const { data, setData, post, put, processing, errors } = useForm({
        title: blog?.title ?? '',
        slug: blog?.slug ?? '',
        category_id: blog?.category_id ? String(blog.category_id) : '',
        image_media_id: blog?.image_media_id ?? null,
        excerpt: blog?.excerpt ?? '',
        content: blog?.content ?? '',
        status: blog?.status ?? 'draft',
        is_featured: blog?.is_featured ?? false,
        published_at: toDateTimeLocal(blog?.published_at),
        tag_ids: blog?.tag_ids ?? [],
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isEdit && blog?.id) {
            put(`/backend/blogs/${blog.id}`, { preserveScroll: true });
            return;
        }
        post('/backend/blogs', { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Blog' : 'Add Blog'} />

            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Blog' : 'Add Blog'}</h1>
                    <p className="text-muted-foreground">Create article with category, tags, and image from file management.</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 lg:grid-cols-3">
                        <div className="space-y-4 lg:col-span-2">
                            <div>
                                <Label htmlFor="title" className="mb-2 block">Title</Label>
                                <Input id="title" value={data.title} onChange={(event) => setData('title', event.target.value)} />
                                {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="slug" className="mb-2 block">Slug</Label>
                                <Input id="slug" value={data.slug} onChange={(event) => setData('slug', event.target.value)} placeholder="optional" />
                                {errors.slug && <p className="mt-2 text-sm text-red-500">{errors.slug}</p>}
                            </div>

                            <div>
                                <Label htmlFor="excerpt" className="mb-2 block">Excerpt</Label>
                                <Textarea id="excerpt" value={data.excerpt} onChange={(event) => setData('excerpt', event.target.value)} rows={3} />
                                {errors.excerpt && <p className="mt-2 text-sm text-red-500">{errors.excerpt}</p>}
                            </div>

                            <div>
                                <Label htmlFor="content" className="mb-2 block">Content</Label>
                                <Textarea id="content" value={data.content} onChange={(event) => setData('content', event.target.value)} rows={14} />
                                {errors.content && <p className="mt-2 text-sm text-red-500">{errors.content}</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="mb-2 block">Category</Label>
                                <Select value={data.category_id || '__NONE__'} onValueChange={(value) => setData('category_id', value === '__NONE__' ? '' : value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__NONE__">No category</SelectItem>
                                        {categories.map((item) => (
                                            <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && <p className="mt-2 text-sm text-red-500">{errors.category_id}</p>}
                            </div>

                            <div>
                                <Label className="mb-2 block">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value as 'draft' | 'published' | 'archived')}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="mt-2 text-sm text-red-500">{errors.status}</p>}
                            </div>

                            <div>
                                <Label htmlFor="published_at" className="mb-2 block">Published At</Label>
                                <Input id="published_at" type="datetime-local" value={data.published_at} onChange={(event) => setData('published_at', event.target.value)} />
                                {errors.published_at && <p className="mt-2 text-sm text-red-500">{errors.published_at}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_featured" checked={data.is_featured} onCheckedChange={(value) => setData('is_featured', value === true)} />
                                <Label htmlFor="is_featured" className="font-normal">Featured</Label>
                            </div>

                            <div>
                                <Label className="mb-2 block">Tags</Label>
                                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                                    {tags.map((tag) => (
                                        <div key={tag.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`tag-${tag.id}`}
                                                checked={data.tag_ids.includes(tag.id)}
                                                onCheckedChange={(value) => {
                                                    if (value === true) {
                                                        setData('tag_ids', [...data.tag_ids, tag.id]);
                                                        return;
                                                    }
                                                    setData('tag_ids', data.tag_ids.filter((id) => id !== tag.id));
                                                }}
                                            />
                                            <Label htmlFor={`tag-${tag.id}`} className="font-normal">{tag.name}</Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.tag_ids && <p className="mt-2 text-sm text-red-500">{errors.tag_ids}</p>}
                            </div>

                            <div className="space-y-2 rounded-md border border-border p-3">
                                <div className="text-sm font-medium">Image</div>
                                <div className="aspect-video overflow-hidden rounded border border-border bg-muted">
                                    {selectedImageUrl ? (
                                        <img src={selectedImageUrl} alt="Selected" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image selected</div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={() => setFilePickerOpen(true)}>Choose</Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setData('image_media_id', null);
                                            setSelectedImageUrl('');
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </div>
                                {data.image_media_id ? <Badge variant="secondary">media #{data.image_media_id}</Badge> : null}
                                {errors.image_media_id && <p className="text-sm text-red-500">{errors.image_media_id}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" asChild>
                            <Link href="/backend/blogs">Back</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>

            <FileLibraryPicker
                open={filePickerOpen}
                onOpenChange={setFilePickerOpen}
                onSelect={(item) => {
                    setData('image_media_id', item.id);
                    setSelectedImageUrl(item.url);
                }}
            />
        </AppLayout>
    );
}

