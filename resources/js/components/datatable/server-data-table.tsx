import { router } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, ChevronRight, Download, RefreshCw, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DataTable, { type PaginationComponentProps, type TableColumn } from 'react-data-table-component';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

export interface DataTableColumn<T> {
    key: string;
    label: string;
    sortable?: boolean;
    className?: string;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    grow?: number;
    right?: boolean;
    center?: boolean;
    render: (row: T) => React.ReactNode;
}

interface ServerDataTableProps<T> {
    endpoint: string;
    data: PaginatedResponse<T>;
    columns: DataTableColumn<T>[];
    filters?: Record<string, string | number | boolean | null | undefined>;
    searchKey?: string;
    sortByKey?: string;
    sortDirKey?: string;
    perPageKey?: string;
    perPageOptions?: number[];
    searchPlaceholder?: string;
    emptyMessage?: string;
    keyField?: string;
    toolbarLeft?: React.ReactNode;
    toolbarRight?: React.ReactNode;
    exportEndpoint?: string;
    reloadOnly?: string[];
    searchDebounce?: number;
}

function cleanQuery(query: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== null && v !== undefined && v !== ''));
}

export function ServerDataTable<T>({
    endpoint,
    data,
    columns,
    filters = {},
    searchKey = 'search',
    sortByKey = 'sort_by',
    sortDirKey = 'sort_dir',
    perPageKey = 'per_page',
    perPageOptions = [10, 25, 50, 100],
    searchPlaceholder,
    emptyMessage,
    keyField = 'id',
    toolbarLeft,
    toolbarRight,
    exportEndpoint,
    reloadOnly,
    searchDebounce = 400,
}: ServerDataTableProps<T>) {
    const { t } = useLanguage();

    const [search, setSearch] = useState(String(filters[searchKey] ?? ''));
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const committedSearch = useRef(String(filters[searchKey] ?? ''));

    useEffect(() => {
        const serverValue = String(filters[searchKey] ?? '');
        setSearch(serverValue);
        committedSearch.current = serverValue;
    }, [filters, searchKey]);

    const currentSortBy = String(filters[sortByKey] ?? '');
    const currentSortDir = String(filters[sortDirKey] ?? 'asc');
    const currentPerPage = Number(filters[perPageKey] ?? data.per_page ?? perPageOptions[0]);
    const baseQuery = useMemo(() => ({ ...filters }), [filters]);

    const visit = useCallback(
        (next: Record<string, unknown>) => {
            router.get(endpoint, cleanQuery({ ...baseQuery, ...next }), {
                only: reloadOnly,
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [endpoint, baseQuery, reloadOnly],
    );

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (searchDebounce <= 0) {
            committedSearch.current = value;
            visit({ [searchKey]: value, page: 1 });
            return;
        }

        debounceRef.current = setTimeout(() => {
            if (value !== committedSearch.current) {
                committedSearch.current = value;
                visit({ [searchKey]: value, page: 1 });
            }
        }, searchDebounce);
    };

    const clearSearch = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSearch('');
        committedSearch.current = '';
        visit({ [searchKey]: '', page: 1 });
    };

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        committedSearch.current = search;
        visit({ [searchKey]: search, page: 1 });
    };

    const onSort = (column: TableColumn<T>, direction: 'asc' | 'desc') => {
        if (!column.id) return;
        visit({ [sortByKey]: String(column.id), [sortDirKey]: direction, page: 1 });
    };

    const onPerPageChange = (value: string) => {
        visit({ [perPageKey]: Number(value), page: 1 });
    };

    const onPageChange = (page: number) => {
        const nextPage = Math.min(Math.max(1, page), data.last_page || 1);
        if (nextPage === data.current_page) return;
        visit({ page: nextPage });
    };

    const onExport = (scope: 'all' | 'current') => {
        if (!exportEndpoint) return;
        const query = cleanQuery({
            ...baseQuery,
            [perPageKey]: currentPerPage,
            page: data.current_page,
            scope,
        });
        const params = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]));
        const separator = exportEndpoint.includes('?') ? '&' : '?';
        window.open(`${exportEndpoint}${separator}${params}`, '_blank', 'noopener,noreferrer');
    };

    const tableColumns = useMemo<TableColumn<T>[]>(
        () =>
            columns.map((col) => ({
                id: col.key,
                name: col.label,
                sortable: Boolean(col.sortable),
                width: col.width,
                minWidth: col.minWidth,
                maxWidth: col.maxWidth,
                grow: col.grow,
                right: col.right,
                center: col.center,
                cell: (row) => col.render(row),
            })),
        [columns],
    );

    const CustomPagination = (_props: PaginationComponentProps) => {
        const totalPages = Math.max(1, data.last_page);
        const currentPage = data.current_page;
        const rowCount = data.total;
        const rowsPerPage = data.per_page;

        const from = rowCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
        const to = Math.min(currentPage * rowsPerPage, rowCount);

        const goToPage = (page: number) => {
            if (page < 1 || page > totalPages || page === currentPage) return;

            onPageChange(page);
        };

        const pages = Array.from(new Set([1, 2, currentPage - 1, currentPage, currentPage + 1, totalPages - 1, totalPages]))
            .filter((page) => page >= 1 && page <= totalPages)
            .sort((a, b) => a - b);

        return (
            <div className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm">
                <p className="text-muted-foreground">
                    {t('datatable.showingRange', { from, to, total: rowCount })}
                </p>

                <div className="border-border bg-background inline-flex shrink-0 items-center overflow-hidden rounded-md border shadow-sm">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-none border-r"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label={t('datatable.prevPage')}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {pages.map((page, index) => {
                        const previousPage = pages[index - 1];
                        const hasGap = previousPage !== undefined && page - previousPage > 1;
                        const isActive = page === currentPage;

                        return (
                            <React.Fragment key={page}>
                                {hasGap && (
                                    <span className="text-muted-foreground flex h-9 min-w-9 items-center justify-center border-r px-3 text-sm">
                                        ...
                                    </span>
                                )}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className={cn(
                                        'h-9 min-w-9 rounded-none border-r px-3 text-sm font-normal tabular-nums',
                                        isActive
                                            ? 'bg-muted text-foreground font-semibold'
                                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                    )}
                                    onClick={() => goToPage(page)}
                                    aria-label={`${t('datatable.page')} ${page}`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {page}
                                </Button>
                            </React.Fragment>
                        );
                    })}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-none"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        aria-label={t('datatable.nextPage')}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={String(currentPerPage)} onValueChange={onPerPageChange}>
                        <SelectTrigger className="h-9 w-[78px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {perPageOptions.map((opt) => (
                                <SelectItem key={opt} value={String(opt)}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {toolbarLeft}

                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-9 w-9"
                        onClick={() => visit({})}
                        aria-label={t('datatable.refresh')}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1">
                    <form onSubmit={onSearchSubmit} className="relative" role="search">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                        <Input
                            className="h-9 w-[260px] pr-8 pl-8"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder={searchPlaceholder ?? t('datatable.search')}
                            aria-label={t('datatable.search')}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                                aria-label={t('datatable.clearSearch')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </form>

                    {toolbarRight}

                    {exportEndpoint && (
                        <>
                            <Button type="button" variant="secondary" className="h-9 px-3 font-medium" onClick={() => onExport('all')}>
                                {t('datatable.exportAll')}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" size="icon" variant="outline" className="h-9 w-9">
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onExport('current')}>
                                        <Download className="h-4 w-4" />
                                        {t('datatable.exportCurrent')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onExport('all')}>
                                        <Download className="h-4 w-4" />
                                        {t('datatable.exportAll')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </div>

            <DataTable
                columns={tableColumns}
                data={data.data}
                keyField={keyField}
                noDataComponent={<div className="text-muted-foreground w-full py-10 text-center text-sm">{emptyMessage ?? t('datatable.empty')}</div>}
                pagination
                paginationServer
                paginationTotalRows={data.total}
                paginationPerPage={currentPerPage}
                paginationDefaultPage={data.current_page}
                paginationRowsPerPageOptions={perPageOptions}
                paginationComponent={CustomPagination}
                paginationComponentOptions={{
                    rowsPerPageText: t('datatable.rowsPerPage'),
                    rangeSeparatorText: t('datatable.of'),
                    noRowsPerPage: true,
                }}
                sortServer
                defaultSortFieldId={currentSortBy}
                defaultSortAsc={currentSortDir === 'asc'}
                onSort={onSort}
                onChangePage={onPageChange}
                customStyles={{
                    table: {
                        style: {
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                            backgroundColor: 'var(--card)',
                        },
                    },
                    headRow: {
                        style: {
                            backgroundColor: 'var(--muted)',
                            color: 'var(--muted-foreground)',
                            minHeight: '40px',
                            borderBottom: '1px solid var(--border)',
                        },
                    },
                    headCells: {
                        style: {
                            color: 'var(--muted-foreground)',
                            fontSize: '12px',
                            fontWeight: 600,
                        },
                    },
                    rows: {
                        style: {
                            backgroundColor: 'var(--card)',
                            color: 'var(--card-foreground)',
                            minHeight: '44px',
                            borderBottom: '1px solid var(--border)',
                            fontSize: '14px',
                        },
                        highlightOnHoverStyle: {
                            backgroundColor: 'var(--accent)',
                            color: 'var(--accent-foreground)',
                        },
                    },
                    cells: {
                        style: {
                            paddingTop: '0.75rem',
                            paddingBottom: '0.75rem',
                        },
                    },
                    noData: {
                        style: {
                            backgroundColor: 'var(--card)',
                            color: 'var(--muted-foreground)',
                            borderBottom: '1px solid var(--border)',
                        },
                    },
                    pagination: {
                        style: {
                            borderTop: '1px solid var(--border)',
                            minHeight: '56px',
                            backgroundColor: 'var(--card)',
                        },
                    },
                }}
            />
        </div>
    );
}
