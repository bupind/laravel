import type React from 'react';
import FrontendLayout from '@/layouts/frontend-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface PublicPage {
    id: string;
    title: string;
    slug: string;
    media_id?: string | null;
    media_url?: string | null;
    excerpt?: string | null;
    content?: string | null;
    template?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    url?: string | null;
}

interface PageProps extends SharedData {
    pageData: PublicPage;
}

function templateLabel(template?: string | null): string {
    switch (template) {
        case 'contact':
            return 'Contact';
        case 'privacy':
            return 'Privacy Policy';
        case 'about':
            return 'About Us';
        case 'faqs':
            return 'FAQs';
        default:
            return 'Page';
    }
}

export default function PageShow() {
    const { pageData, setting } = usePage<PageProps>().props;
    const title = pageData.meta_title || pageData.title;
    const description = pageData.meta_description || pageData.excerpt || setting?.seo?.description;
    const keywords = pageData.meta_keywords || setting?.seo?.keywords;

    return (
        <>
            <Head title={title}>
                {description && <meta name="description" content={description} />}
                {keywords && <meta name="keywords" content={keywords} />}
            </Head>

            <main className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 md:py-16">
                <div className="mb-8 space-y-3 text-center md:mb-10">
                    <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">{templateLabel(pageData.template)}</p>
                    <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">{pageData.title}</h1>
                    {pageData.excerpt && <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-7">{pageData.excerpt}</p>}
                </div>

                {pageData.media_url && (
                    <div className="border-border bg-card mb-8 overflow-hidden rounded-xl border shadow-sm">
                        <img src={pageData.media_url} alt={pageData.title} className="h-auto w-full object-cover" loading="lazy" />
                    </div>
                )}

                <article className="prose prose-neutral dark:prose-invert border-border bg-card text-card-foreground max-w-none rounded-xl border p-6 shadow-sm md:p-8">
                    {pageData.content ? (
                        <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
                    ) : (
                        <p className="text-muted-foreground">Content is not available yet.</p>
                    )}
                </article>
            </main>
        </>
    );
}

PageShow.layout = (page: React.ReactNode) => <FrontendLayout>{page}</FrontendLayout>;
