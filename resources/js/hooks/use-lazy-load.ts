import { useCallback, useEffect, useRef, useState } from 'react';

export function useLazyLoad(
    callback: () => void | Promise<void>,
    options: {
        threshold?: number;
        enabled?: boolean;
    } = {},
) {
    const { threshold = 0.1, enabled = true } = options;
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled || !observerTarget.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    callback();
                }
            },
            { threshold },
        );

        observer.observe(observerTarget.current);

        return () => observer.disconnect();
    }, [callback, enabled, threshold]);

    return observerTarget;
}

export function useVirtualScroll(
    items: any[],
    options: {
        itemHeight: number;
        containerHeight: number;
        buffer?: number;
    },
) {
    const { itemHeight, containerHeight, buffer = 5 } = options;
    const [scrollTop, setScrollTop] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer);

    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight;
    const totalHeight = items.length * itemHeight;

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return {
        scrollRef,
        handleScroll,
        visibleItems,
        offsetY,
        totalHeight,
        startIndex,
        endIndex,
    };
}

export function usePaginatedData<T>(
    loadData: (page: number) => Promise<T[]>,
    options: {
        initialPage?: number;
        pageSize?: number;
        cachePages?: boolean;
    } = {},
) {
    const { initialPage = 1, pageSize = 20, cachePages = true } = options;

    const [data, setData] = useState<T[]>([]);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const cacheRef = useRef<Map<number, T[]>>(new Map());

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        if (cachePages && cacheRef.current.has(currentPage)) {
            const cachedData = cacheRef.current.get(currentPage)!;
            setData((prev) => [...prev, ...cachedData]);
            setCurrentPage((prev) => prev + 1);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const newData = await loadData(currentPage);

            if (newData.length < pageSize) {
                setHasMore(false);
            }

            if (cachePages) {
                cacheRef.current.set(currentPage, newData);
            }

            setData((prev) => [...prev, ...newData]);
            setCurrentPage((prev) => prev + 1);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load data'));
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, hasMore, isLoading, loadData, pageSize, cachePages]);

    const reset = useCallback(() => {
        setData([]);
        setCurrentPage(initialPage);
        setError(null);
        setHasMore(true);
        cacheRef.current.clear();
    }, [initialPage]);

    return {
        data,
        currentPage,
        isLoading,
        error,
        hasMore,
        loadMore,
        reset,
    };
}

export function useDebouncedLoad<T>(
    loadData: (query: string) => Promise<T[]>,
    options: {
        delay?: number;
        minChars?: number;
    } = {},
) {
    const { delay = 300, minChars = 1 } = options;

    const [query, setQuery] = useState('');
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const load = useCallback(
        (searchQuery: string) => {
            setQuery(searchQuery);

            if (searchQuery.length < minChars) {
                setData([]);
                return;
            }

            clearTimeout(timeoutRef.current);
            setIsLoading(true);
            setError(null);

            timeoutRef.current = setTimeout(async () => {
                try {
                    const result = await loadData(searchQuery);
                    setData(result);
                } catch (err) {
                    setError(err instanceof Error ? err : new Error('Failed to load data'));
                    setData([]);
                } finally {
                    setIsLoading(false);
                }
            }, delay);
        },
        [loadData, delay, minChars],
    );

    const clear = useCallback(() => {
        setQuery('');
        setData([]);
        setError(null);
        clearTimeout(timeoutRef.current);
    }, []);

    return {
        query,
        data,
        isLoading,
        error,
        load,
        clear,
    };
}

export function useLazyComponent(componentPath: string, componentName: string = 'default') {
    const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        import(componentPath)
            .then((module) => {
                setComponent(() => module[componentName] || module.default);
            })
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Failed to load component'));
            });
    }, [componentPath, componentName]);

    return { Component, error, isLoading: !Component && !error };
}
