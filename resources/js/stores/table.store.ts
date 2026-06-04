import { create } from 'zustand';

export interface TableState {
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
    sorting: Array<{ id: string; desc: boolean }>;
    columnFilters: Array<{ id: string; value: unknown }>;
    columnVisibility: Record<string, boolean>;
    rowSelection: Record<string, boolean>;
    globalFilter: string;
}

export interface TableStore extends TableState {
    setPaginationPageIndex: (pageIndex: number) => void;
    setPaginationPageSize: (pageSize: number) => void;

    setSorting: (sorting: Array<{ id: string; desc: boolean }>) => void;

    setColumnFilters: (filters: Array<{ id: string; value: unknown }>) => void;
    setGlobalFilter: (filter: string) => void;

    setColumnVisibility: (visibility: Record<string, boolean>) => void;

    setRowSelection: (selection: Record<string, boolean>) => void;

    reset: () => void;
}

const initialState: TableState = {
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [],
    columnFilters: [],
    columnVisibility: {},
    rowSelection: {},
    globalFilter: '',
};

export const createTableStore = () =>
    create<TableStore>((set) => ({
        ...initialState,
        setPaginationPageIndex: (pageIndex) =>
            set((state) => ({
                pagination: { ...state.pagination, pageIndex },
            })),
        setPaginationPageSize: (pageSize) =>
            set((state) => ({
                pagination: { ...state.pagination, pageIndex: 0, pageSize },
            })),
        setSorting: (sorting) => set({ sorting }),
        setColumnFilters: (columnFilters) => set({ columnFilters }),
        setGlobalFilter: (globalFilter) => set({ globalFilter }),
        setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
        setRowSelection: (rowSelection) => set({ rowSelection }),
        reset: () => set(initialState),
    }));

export const createTableStateHook = (storeId: string) => {
    const stores = new Map();

    return () => {
        if (!stores.has(storeId)) {
            stores.set(storeId, createTableStore());
        }
        return stores.get(storeId);
    };
};
