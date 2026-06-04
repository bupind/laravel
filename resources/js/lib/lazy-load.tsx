import React, { Suspense } from 'react';
import { useLanguage } from '@/hooks/use-language';

function LazyLoadingFallback() {
    const { t } = useLanguage();

    return <div>{t('labels.loading')}</div>;
}

export function withLazyLoad<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    fallback?: React.ReactNode,
) {
    const LazyComponent = React.lazy(importFunc);

    const fallbackNode = fallback === undefined ? <LazyLoadingFallback /> : fallback;

    return (props: React.ComponentProps<T>) => (
        <Suspense fallback={fallbackNode}>
            <LazyComponent {...props} />
        </Suspense>
    );
}

export function lazyLoadComponents(components: Record<string, () => Promise<any>>) {
    return Object.entries(components).reduce(
        (acc, [key, importFunc]) => {
            acc[key] = React.lazy(importFunc);
            return acc;
        },
        {} as Record<string, React.LazyExoticComponent<any>>,
    );
}

export function ConditionalLazyLoad({
    condition,
    Component,
    fallback = null,
}: {
    condition: boolean;
    Component: React.ComponentType<any>;
    fallback?: React.ReactNode;
}) {
    if (!condition) {
        return fallback;
    }

    return (
        <Suspense fallback={<LazyLoadingFallback />}>
            <Component />
        </Suspense>
    );
}
