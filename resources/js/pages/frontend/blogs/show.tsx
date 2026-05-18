import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface BlogDetail {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    published_at: string;
    image_url?: string | null;
    category?: Category | null;
    tags: Tag[];
}

interface RelatedBlog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string;
    image_url?: string | null;
    category?: Category | null;
}

interface Props {
    blog: BlogDetail;
    relatedBlogs: RelatedBlog[];
}

export default function BlogFrontendShow({ blog, relatedBlogs }: Props) {
    return (
        <>
            <Head title={blog.title} />
            <div className="min-h-screen bg-background">
                <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-8">
                    <div className="mb-5 flex items-center justify-between">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/blogs">Back to Blogs</Link>
                        </Button>
                    </div>

                    <article className="space-y-5">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {blog.category ? <Badge variant="secondary">{blog.category.name}</Badge> : null}
                                {blog.tags.map((tag) => (
                                    <Badge key={tag.id} variant="outline">#{tag.name}</Badge>
                                ))}
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{blog.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                {new Date(blog.published_at).toLocaleString()}
                            </p>
                            {blog.excerpt ? <p className="text-muted-foreground">{blog.excerpt}</p> : null}
                        </div>

                        {blog.image_url ? (
                            <div className="overflow-hidden rounded-md border border-border">
                                <img src={blog.image_url} alt={blog.title} className="h-auto w-full object-cover" />
                            </div>
                        ) : null}

                        <div className="prose prose-sm max-w-none whitespace-pre-line text-foreground md:prose-base">
                            {blog.content}
                        </div>
                    </article>

                    {relatedBlogs.length > 0 ? (
                        <section className="mt-10 space-y-3">
                            <h2 className="text-lg font-semibold">Related Blogs</h2>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {relatedBlogs.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/blogs/${item.slug}`}
                                        className="flex gap-3 rounded-md border border-border p-3 transition hover:border-primary"
                                    >
                                        <div className="h-16 w-24 shrink-0 overflow-hidden rounded border border-border bg-muted">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                                            ) : null}
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(item.published_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : null}
                </div>
            </div>
        </>
    );
}

