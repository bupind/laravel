import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FrontendHeader } from '@/components/frontend-header';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Boxes, ChevronLeft, ChevronRight, ImageIcon, Search, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface Product {
    id: string;
    name: string;
    sku: string;
    media_id?: string | null;
    image_url?: string | null;
    description?: string | null;
    price: string | number;
    stock: number;
    status: string;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
}

interface ProductsPageProps {
    products: PaginatedProducts;
    filters: { search?: string };
}

function formatCurrency(value: string | number) {
    return Number(value).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    });
}

function ProductImage({ product }: { product: Product }) {
    const [failed, setFailed] = useState(false);

    if (!product.image_url || failed) {
        return (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
            </div>
        );
    }

    return (
        <img
            src={product.image_url}
            alt={product.name}
            className="h-16 w-16 shrink-0 rounded-md border object-cover"
            loading="lazy"
            onError={() => setFailed(true)}
        />
    );
}

export default function Products({ products, filters }: ProductsPageProps) {
    const { auth, setting } = usePage<SharedData>().props;
    const { t } = useLanguage();
    const [search, setSearch] = useState(filters.search ?? '');

    const summary = useMemo(() => {
        if (products.total === 0) return t('pages.products.empty', { fallback: 'Tidak ada product aktif' });
        return t('pages.products.summary', {
            fallback: `${products.total.toLocaleString('id-ID')} product aktif`,
            total: products.total.toLocaleString('id-ID'),
        });
    }, [products.total, t]);

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/products', { search: search.trim() }, { preserveScroll: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/products', {}, { preserveScroll: true, replace: true });
    };

    return (
        <>
            <Head title={t('pages.products.title', { fallback: 'Products' })} />

            <main className="bg-background min-h-screen text-foreground">
                <FrontendHeader setting={setting} auth={auth} />

                <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
                    {/* Header row */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Boxes className="h-4 w-4" />
                                {t('pages.products.category', { fallback: 'Product Catalog' })}
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight">
                                {t('pages.products.title', { fallback: 'Products' })}
                            </h1>
                        </div>

                        <Badge variant="outline" className="w-fit">{summary}</Badge>

                        {/* Search — same inline style as translations module */}
                        <form onSubmit={submitSearch} className="relative flex w-full items-center gap-2 md:w-[360px]">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('pages.products.search', { fallback: 'Cari nama, SKU...' })}
                                    className="h-9 pl-8 pr-8"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <Button type="submit" size="sm">
                                {t('buttons.search', { fallback: 'Cari' })}
                            </Button>
                        </form>
                    </div>

                    {/* Active filter chip */}
                    {filters.search && (
                        <div className="mb-4 flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                                {t('pages.products.filterActive', { fallback: 'Filter:' })}
                            </span>
                            <Badge variant="secondary" className="gap-1">
                                {filters.search}
                                <button type="button" onClick={clearSearch} className="ml-1 hover:opacity-70">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                            <span className="text-muted-foreground">
                                — {products.total.toLocaleString('id-ID')} {t('pages.products.results', { fallback: 'hasil' })}
                            </span>
                        </div>
                    )}

                    {/* Table */}
                    {products.data.length === 0 ? (
                        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                            {filters.search
                                ? t('pages.products.notFound', { fallback: 'Tidak ada product yang cocok.' })
                                : t('pages.products.empty', { fallback: 'Product aktif belum tersedia.' })}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/60 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            {t('columns.product', { fallback: 'Product' })}
                                        </th>
                                        <th className="px-4 py-3 font-medium">SKU</th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            {t('columns.price', { fallback: 'Harga' })}
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            {t('columns.stock', { fallback: 'Stok' })}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="border-t hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex min-w-[260px] items-center gap-3">
                                                    <ProductImage product={product} />
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">{product.name}</div>
                                                        {product.description && (
                                                            <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                                                {product.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{product.sku}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {product.stock.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                            {t('pagination.summary', {
                                fallback: `Page ${products.current_page} of ${products.last_page}`,
                                current: products.current_page,
                                total: products.last_page,
                            })}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!products.prev_page_url}
                                onClick={() => products.prev_page_url && router.visit(products.prev_page_url)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {t('buttons.previous', { fallback: 'Previous' })}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!products.next_page_url}
                                onClick={() => products.next_page_url && router.visit(products.next_page_url)}
                            >
                                {t('buttons.next', { fallback: 'Next' })}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
