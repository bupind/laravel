import { FrontendHeroSlider, type HeroSlide } from '@/components/frontend-hero-slider';
import { iconMapper } from '@/lib/iconMapper';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface ServiceCard {
    id?: string;
    title: string;
    description?: string | null;
    icon?: string | null;
    link_url?: string | null;
}

interface WelcomeProps {
    sliders?: HeroSlide[];
    services?: ServiceCard[];
}

function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

export default function Welcome({ sliders = [], services = [] }: WelcomeProps) {
    const { setting } = usePage<SharedData>().props;

    const primaryColor = setting?.color || '#ef3b2d';
    const appName = setting?.app_name ?? '';
    const appDesc = setting?.description ?? '';
    const title = setting?.seo?.title ?? appName;

    return (
        <>
            <Head title={title}>
                {setting?.seo?.description && <meta name="description" content={setting.seo.description} />}
                {setting?.seo?.keywords && <meta name="keywords" content={setting.seo.keywords} />}
            </Head>

            <main>
                <FrontendHeroSlider appDesc={appDesc} primaryColor={primaryColor} slides={sliders} />
                {services.length > 0 && (
                    <section className={cn('relative z-10 mx-auto max-w-6xl px-4 pb-14 md:px-6', sliders.length > 0 && '-mt-8 md:-mt-12')}>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {services.map((card) => {
                                const Icon = card.icon ? iconMapper(card.icon) : null;
                                const key = card.id ?? card.title;
                                const content = (
                                    <article className="border-border bg-card text-card-foreground h-full rounded-lg border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                        {Icon && (
                                            <div
                                                className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-red-50"
                                                style={{ color: primaryColor }}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>
                                        )}
                                        <h2 className="text-base font-semibold">{card.title}</h2>
                                        {card.description && <p className="text-muted-foreground mt-4 text-sm leading-6">{card.description}</p>}
                                    </article>
                                );

                                if (!card.link_url) {
                                    return <div key={key}>{content}</div>;
                                }

                                return isExternalUrl(card.link_url) ? (
                                    <a key={key} href={card.link_url} target="_blank" rel="noreferrer" className="block">
                                        {content}
                                    </a>
                                ) : (
                                    <Link key={key} href={card.link_url} className="block">
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}
