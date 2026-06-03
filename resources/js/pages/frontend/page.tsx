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

function textFromHtml(html: string): string {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function truncate(value: string, max = 160): string {
    return value.length > max ? value.slice(0, max - 3).trim() + '...' : value;
}

export default function PageShow() {
    const { pageData, setting } = usePage<PageProps>().props;
    const { language } = useLanguage();
    const titleText = localized(pageData.title, language);
    const excerpt = localized(pageData.excerpt, language);
    const content = localized(pageData.content, language);
    const title = titleText;
    const description = excerpt || truncate(textFromHtml(content)) || setting?.seo?.description;

    return (
        <>
            <Head title={title}>
                {description && <meta name="description" content={description} />}
            </Head>

            <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 px-6 py-20 md:px-12 md:py-28">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-white uppercase backdrop-blur-sm">
                        Page
                    </div>
                    <h1 className="text-4xl leading-tight font-bold text-white md:text-5xl">{titleText}</h1>
                    {excerpt && <p className="mt-5 max-w-2xl text-base leading-relaxed font-medium text-blue-100">{excerpt}</p>}
                </div>
            </section>

            <section className="bg-gray-50 px-6 py-16 md:px-12 md:py-20">
                <div className="mx-auto max-w-4xl">
                    {pageData.media_url && (
                        <div className="mb-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            <img src={pageData.media_url} alt={titleText} className="h-auto w-full object-cover" loading="lazy" />
                        </div>
                    )}

                    <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl leading-7 text-gray-600">
                        {content ? <div dangerouslySetInnerHTML={{ __html: content }} /> : <p className="text-muted-foreground">Content is not available yet.</p>}
                    </article>
                </div>
            </section>
        </>
    );
}


