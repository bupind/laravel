import { router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    PaginationState,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    from?: number;
    to?: number;
}

interface DataTableProps<TData, TValue> {
    endpoint: string;
    data: PaginatedResponse<TData>;
    columns: ColumnDef<TData, TValue>[];
    filters?: Record<string, string | number | boolean | null | undefined>;
    searchKey?: string;
    sortByKey?: string;
    sortDirKey?: string;
    perPageKey?: string;
    pageKey?: string;
    perPageOptions?: number[];
    searchPlaceholder?: string;
    emptyMessage?: string;
    toolbarLeft?: React.ReactNode;
    toolbarRight?: React.ReactNode;
    isLoading?: boolean;
    searchDebounce?: number;
    onDataFetch?: (params: Record<string, any>) => void;
}

const cleanQuery = (query: Record<string, unknown>): Record<string, unknown> => {
    return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== null && v !== undefined && v !== ''));
};

export function DataTable<TData extends { id: string | number }, TValue>({
    endpoint,
    data,
    columns,
    filters = {},
    searchKey = 'search',
    sortByKey = 'sort_by',
    sortDirKey = 'sort_dir',
    perPageKey = 'per_page',
    pageKey = 'page',
    perPageOptions = [10, 25, 50, 100],
    searchPlaceholder,
    emptyMessage,
    toolbarLeft,
    toolbarRight,
    isLoading,
    searchDebounce = 300,
    onDataFetch,
}: DataTableProps<TData, TValue>) {
    const { t } = useLanguage();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: (data.current_page || 1) - 1,
        pageSize: data.per_page || 10,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
    const table = useReactTable({
        data: data.data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        rowCount: data.total,
    });
    useEffect(() => {
        if (sorting.length > 0) {
            const [first] = sorting;
            const params = cleanQuery({
                [searchKey]: searchQuery,
                [sortByKey]: first.id,
                [sortDirKey]: first.desc ? 'desc' : 'asc',
                [perPageKey]: pagination.pageSize,
                [pageKey]: pagination.pageIndex + 1,
                ...filters,
            });

            router.visit(endpoint, {
                method: 'get',
                data: params,
                preserveState: true,
                preserveScroll: true,
            });

            onDataFetch?.(params);
        }
    }, [sorting]);
    useEffect(() => {
        const params = cleanQuery({
            [searchKey]: searchQuery,
            [sortByKey]: sorting[0]?.id,
            [sortDirKey]: sorting[0]?.desc ? 'desc' : 'asc',
            [perPageKey]: pagination.pageSize,
            [pageKey]: pagination.pageIndex + 1,
            ...filters,
        });

        router.visit(endpoint, {
            method: 'get',
            data: params,
            preserveState: true,
            preserveScroll: true,
        });

        onDataFetch?.(params);
    }, [pagination.pageIndex, pagination.pageSize]);
    const handleSearch = useCallback(
        (value: string) => {
            setSearchQuery(value);

            clearTimeout(searchTimeout);
            const timeout = setTimeout(() => {
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));

                const params = cleanQuery({
                    [searchKey]: value,
                    [sortByKey]: sorting[0]?.id,
                    [sortDirKey]: sorting[0]?.desc ? 'desc' : 'asc',
                    [perPageKey]: pagination.pageSize,
                    [pageKey]: 1,
                    ...filters,
                });

                router.visit(endpoint, {
                    method: 'get',
                    data: params,
                    preserveState: true,
                    preserveScroll: true,
                });

                onDataFetch?.(params);
            }, searchDebounce);

            setSearchTimeout(timeout);
        },
        [sorting, pagination.pageSize, searchDebounce, filters],
    );

    const handleRefresh = useCallback(() => {
        const params = cleanQuery({
            [searchKey]: searchQuery,
            [sortByKey]: sorting[0]?.id,
            [sortDirKey]: sorting[0]?.desc ? 'desc' : 'asc',
            [perPageKey]: pagination.pageSize,
            [pageKey]: pagination.pageIndex + 1,
            ...filters,
        });

        router.reload({ data: params });
    }, [searchQuery, sorting, pagination, filters]);

    const pageCount = useMemo(() => data.last_page || 1, [data.last_page]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder={searchPlaceholder || t('components.table.search', { fallback: 'Search...' })}
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8"
                            disabled={isLoading}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => handleSearch('')}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button size="icon" variant="outline" onClick={handleRefresh} disabled={isLoading} title={t('buttons.refresh')}>
                        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                    </Button>
                    {toolbarLeft}
                </div>
                {toolbarRight}
            </div>
            <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className={cn(header.column.columnDef.meta?.className, 'hover:bg-muted cursor-pointer')}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className="text-xs">
                                                        {header.column.getIsSorted() === 'asc' && '↑'}
                                                        {header.column.getIsSorted() === 'desc' && '↓'}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.className)}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        {emptyMessage || t('components.table.empty', { fallback: 'No data found.' })}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-muted-foreground text-sm">
                    {data.from && data.to ? (
                        <>
                            {t('components.table.showing', { fallback: 'Showing' })} <strong>{data.from}</strong>{' '}
                            {t('components.table.to', { fallback: 'to' })} <strong>{data.to}</strong> {t('components.table.of', { fallback: 'of' })}{' '}
                            <strong>{data.total}</strong>
                        </>
                    ) : null}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">{t('components.table.perPage', { fallback: 'Per page:' })}</span>
                        <Select
                            value={pagination.pageSize.toString()}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {perPageOptions.map((option) => (
                                    <SelectItem key={option} value={option.toString()}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage() || isLoading}
                            title={t('buttons.firstPage')}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || isLoading}
                            title={t('buttons.previousPage')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="text-muted-foreground px-2 text-sm">
                            {t('components.table.pageOf', { fallback: 'Page' })} {pagination.pageIndex + 1}{' '}
                            {t('components.table.of', { fallback: 'of' })} {pageCount}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || isLoading}
                            title={t('buttons.nextPage')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => table.setPageIndex(pageCount - 1)}
                            disabled={!table.getCanNextPage() || isLoading}
                            title={t('buttons.lastPage')}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
