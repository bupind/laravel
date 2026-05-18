import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import DataTable, { type PaginationComponentProps, type TableColumn } from 'react-data-table-component';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, RefreshCw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/use-language';

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
}

function cleanQuery(query: Record<string, unknown>) {
    const next: Record<string, unknown> = {};

    Object.entries(query).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
            return;
        }

        next[key] = value;
    });

    return next;
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
}: ServerDataTableProps<T>) {
    const { t } = useLanguage();
    const [search, setSearch] = useState(String(filters[searchKey] ?? ''));

    useEffect(() => {
        setSearch(String(filters[searchKey] ?? ''));
    }, [filters, searchKey]);

    const currentSortBy = String(filters[sortByKey] ?? '');
    const currentSortDir = String(filters[sortDirKey] ?? 'asc');
    const currentPerPage = Number(filters[perPageKey] ?? data.per_page ?? perPageOptions[0]);
    const baseQuery = useMemo(() => ({ ...filters }), [filters]);

    const visit = (next: Record<string, unknown>) => {
        router.get(endpoint, cleanQuery({ ...baseQuery, ...next }), {
            only: reloadOnly,
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const tableColumns = useMemo<TableColumn<T>[]>(
        () => columns.map((column) => ({
            id: column.key,
            name: column.label,
            sortable: Boolean(column.sortable),
            width: column.width,
            minWidth: column.minWidth,
            maxWidth: column.maxWidth,
            grow: column.grow,
            right: column.right,
            center: column.center,
            cell: (row) => column.render(row),
        })),
        [columns],
    );

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        visit({ [searchKey]: search, page: 1 });
    };

    const onSort = (column: TableColumn<T>, direction: 'asc' | 'desc') => {
        if (!column.id) {
            return;
        }

        visit({
            [sortByKey]: String(column.id),
            [sortDirKey]: direction,
            page: 1,
        });
    };

    const onPerPageChange = (value: string) => {
        visit({
            [perPageKey]: Number(value),
            page: 1,
        });
    };

    const onPageChange = (page: number) => {
        visit({ page });
    };

    const onRefresh = () => {
        visit({});
    };

    const onExport = (scope: 'all' | 'current') => {
        if (!exportEndpoint) {
            return;
        }

        const query = cleanQuery({
            ...baseQuery,
            [perPageKey]: currentPerPage,
            page: data.current_page,
            scope,
        });

        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            params.set(key, String(value));
        });

        const url = `${exportEndpoint}${exportEndpoint.includes('?') ? '&' : '?'}${params.toString()}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const paginationComponent = ({ currentPage, rowCount, rowsPerPage, onChangePage }: PaginationComponentProps) => {
        const totalPages = Math.max(1, Math.ceil(rowCount / rowsPerPage));
        const start = Math.max(1, currentPage - 4);
        const end = Math.min(totalPages, start + 9);
        const pages: number[] = [];

        for (let page = start; page <= end; page += 1) {
            pages.push(page);
        }

        return (
            <div className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="text-muted-foreground">
                    {t('datatable.showing', {
                        from: rowCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1,
                        to: Math.min(currentPage * rowsPerPage, rowCount),
                        total: rowCount,
                    })}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-md"
                        onClick={() => onChangePage(1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-md"
                        onClick={() => onChangePage(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {pages.map((page) => (
                        <Button
                            key={page}
                            type="button"
                            variant={page === currentPage ? 'default' : 'ghost'}
                            className={cn(
                                'h-8 min-w-8 rounded-md px-2',
                                page === currentPage ? '' : 'text-muted-foreground hover:text-foreground',
                            )}
                            onClick={() => onChangePage(page)}
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-md"
                        onClick={() => onChangePage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-md"
                        onClick={() => onChangePage(totalPages)}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronsRight className="h-4 w-4" />
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
                        <SelectTrigger className="h-9 w-[78px] rounded-md">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {perPageOptions.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {toolbarLeft}

                    <Button type="button" size="icon" variant="outline" className="h-9 w-9 rounded-md" onClick={onRefresh} aria-label={t('datatable.refresh')}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
                        <Input
                            className="h-9 w-[260px] rounded-md"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder ?? t('datatable.search')}
                        />
                        <Button type="submit" size="icon" variant="default" className="h-9 w-9 rounded-md" aria-label={t('datatable.searchButton')}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>

                    {toolbarRight}
                    {exportEndpoint ? (
                        <>
                            <Button
                                type="button"
                                variant="secondary"
                                className="h-9 rounded-md px-3 font-medium"
                                onClick={() => onExport('all')}
                            >
                                {t('datatable.exportAll')}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button type="button" size="icon" variant="outline" className="h-9 w-9 rounded-md">
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
                    ) : null}
                </div>
            </div>

            <DataTable
                columns={tableColumns}
                data={data.data}
                keyField={keyField}
                noDataComponent={emptyMessage ?? t('datatable.empty')}
                pagination
                paginationServer
                paginationTotalRows={data.total}
                paginationPerPage={currentPerPage}
                paginationDefaultPage={data.current_page}
                paginationRowsPerPageOptions={perPageOptions}
                paginationComponent={paginationComponent}
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
                            textTransform: 'none',
                            letterSpacing: '0',
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
