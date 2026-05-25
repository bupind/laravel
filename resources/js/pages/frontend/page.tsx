import type React from 'react';
import FrontendLayout from '@/layouts/frontend-layout';
import { useLanguage } from '@/hooks/use-language';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

type TranslatableText = string | Record<string, string | null | undefined> | null | undefined;

interface PublicPage {
    id: string;
    title: TranslatableText;
    slug: string;
    media_id?: string | null;
    media_url?: string | null;
    excerpt?: TranslatableText;
    content?: TranslatableText;
    meta_title?: TranslatableText;
    meta_description?: TranslatableText;
    meta_keywords?: TranslatableText;
    url?: string | null;
}

interface PageProps extends SharedData {
    pageData: PublicPage;
}

function localized(value: TranslatableText, language: string, fallbackLocale = 'id'): string {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';

    const baseLanguage = language.split('-')[0];
    return String(value[language] ?? value[baseLanguage] ?? value[fallbackLocale] ?? Object.values(value).find((item) => item) ?? '');
}

export default function PageShow() {
    const { pageData, setting } = usePage<PageProps>().props;
    const { language } = useLanguage();
    const titleText = localized(pageData.title, language);
    const excerpt = localized(pageData.excerpt, language);
    const content = localized(pageData.content, language);
    const title = localized(pageData.meta_title, language) || titleText;
    const description = localized(pageData.meta_description, language) || excerpt || setting?.seo?.description;
    const keywords = localized(pageData.meta_keywords, language) || setting?.seo?.keywords;

    return (
        <>
            <Head title={title}>
                {description && <meta name="description" content={description} />}
                {keywords && <meta name="keywords" content={keywords} />}
            </Head>

            {/* ── Hero Banner ── */}
            <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 px-6 py-20 md:px-12 md:py-28">
                <div className="mx-auto max-w-4xl">
                    {/* Badge pill */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="10" opacity=".2" />
                            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                        </svg>
                        Page
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">{titleText}</h1>

                    {/* Excerpt */}
                    {excerpt && (
                        <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-blue-100">{excerpt}</p>
                    )}
                </div>
            </section>

            {/* ── Content Section ── */}
            <section className="bg-gray-50 px-6 py-16 md:px-12 md:py-20">
                <div className="mx-auto max-w-4xl">
                    {/* About badge */}
                    <div className="mb-8 flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Tentang Aplikasi
                        </div>
                    </div>

                    {/* Section heading */}
                    <h2 className="mb-6 text-center text-2xl font-bold uppercase tracking-wide text-teal-600 md:text-3xl">
                        {titleText}
                    </h2>

                    {/* Hero image */}
                    {pageData.media_url && (
                        <div className="mb-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            <img src={pageData.media_url} alt={titleText} className="h-auto w-full object-cover" loading="lazy" />
                        </div>
                    )}

                    {/* Content prose */}
                    <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl text-center leading-7 text-gray-600">
                        {content ? (
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        ) : (
                            <p className="text-muted-foreground">Content is not available yet.</p>
                        )}
                    </article>
                </div>
            </section>
        </>
    );
}

PageShow.layout = (page: React.ReactNode) => <FrontendLayout>{page}</FrontendLayout>;
