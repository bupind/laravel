import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export interface HeroSlide {
    id?: string;
    title: string;
    title_accent?: string | null;
    description?: string | null;
    image_url?: string | null;
    button_label?: string | null;
    button_url?: string | null;
}

interface FrontendHeroSliderProps {
    appDesc: string;
    primaryColor: string;
    slides?: HeroSlide[];
}

function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

export function FrontendHeroSlider({ appDesc, primaryColor, slides: databaseSlides = [] }: FrontendHeroSliderProps) {
    const { t } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const slides = useMemo(
        () =>
            databaseSlides.map((slide, index) => ({
                id: slide.id ?? `slide-${index}`,
                titleTop: slide.title,
                titleAccent: slide.title_accent ?? '',
                description: slide.description ?? appDesc,
                image: slide.image_url ?? '',
                buttonLabel: slide.button_label ?? '',
                buttonUrl: slide.button_url ?? '',
            })),
        [appDesc, databaseSlides],
    );

    const currentSlide = slides[activeIndex];
    const actionUrl = currentSlide?.buttonUrl ?? '';
    const actionLabel = currentSlide?.buttonLabel ?? '';
    const showAction = actionUrl !== '' && actionLabel !== '';

    useEffect(() => {
        if (activeIndex >= slides.length) {
            setActiveIndex(0);
        }
    }, [activeIndex, slides.length]);

    useEffect(() => {
        if (isPaused || slides.length < 2) return;

        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % slides.length);
        }, 5500);

        return () => window.clearInterval(timer);
    }, [isPaused, slides.length]);

    if (!currentSlide) {
        return null;
    }

    const goToPrevious = () => {
        setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
    };

    const goToNext = () => {
        setActiveIndex((current) => (current + 1) % slides.length);
    };

    return (
        <section
            className="relative isolate overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label={t('pages.home.slider')}
        >
            <div
                className="min-h-[420px] bg-cover bg-center transition-[background-image] duration-500 md:min-h-[480px]"
                style={{
                    backgroundImage: currentSlide.image
                        ? `linear-gradient(90deg, rgba(28, 55, 135, 0.86) 0%, rgba(45, 50, 126, 0.66) 44%, rgba(151, 53, 75, 0.44) 100%), url("${currentSlide.image}")`
                        : 'linear-gradient(90deg, rgba(28, 55, 135, 0.92) 0%, rgba(45, 50, 126, 0.76) 52%, rgba(151, 53, 75, 0.58) 100%)',
                }}
            >
                <div className="mx-auto flex min-h-[420px] max-w-6xl items-center px-4 py-14 md:min-h-[480px] md:px-6">
                    <div className="max-w-2xl text-white">
                        <h1 className="text-4xl leading-tight font-bold tracking-normal md:text-6xl">
                            <span className="block">{currentSlide.titleTop}</span>
                            <span className="block" style={{ color: primaryColor }}>
                                {currentSlide.titleAccent}
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-7 text-white/92 md:text-lg">{currentSlide.description}</p>

                        {showAction && (
                            <div className="mt-8 flex flex-wrap gap-3">
                                {isExternalUrl(actionUrl) ? (
                                    <Button asChild size="lg" className="border-0 text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
                                        <a href={actionUrl} target="_blank" rel="noreferrer">
                                            <ChevronRight className="h-4 w-4" />
                                            {actionLabel}
                                        </a>
                                    </Button>
                                ) : (
                                    <Button asChild size="lg" className="border-0 text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
                                        <Link href={actionUrl}>
                                            <ChevronRight className="h-4 w-4" />
                                            {actionLabel}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute right-6 bottom-9 flex items-center gap-2">
                {slides.map((slide, index) => (
                    <button
                        key={slide.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-10 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/75'}`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === activeIndex ? 'true' : undefined}
                    />
                ))}
            </div>
        </section>
    );
}
