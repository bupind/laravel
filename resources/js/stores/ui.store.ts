import { create } from 'zustand';

export interface DialogState {
    isOpen: boolean;
    title?: string;
    description?: string;
}

export interface ModalState {
    dialogs: Record<string, DialogState>;
}

export interface UIState extends ModalState {
    openDialog: (dialogId: string, title?: string, description?: string) => void;
    closeDialog: (dialogId: string) => void;
    isDialogOpen: (dialogId: string) => boolean;
    closeAllDialogs: () => void;

    loadingStates: Record<string, boolean>;
    setLoading: (key: string, isLoading: boolean) => void;
    isLoading: (key: string) => boolean;

    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
    toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    dialogs: {},
    openDialog: (dialogId: string, title?: string, description?: string) =>
        set((state) => ({
            dialogs: {
                ...state.dialogs,
                [dialogId]: { isOpen: true, title, description },
            },
        })),
    closeDialog: (dialogId: string) =>
        set((state) => ({
            dialogs: {
                ...state.dialogs,
                [dialogId]: { isOpen: false },
            },
        })),
    isDialogOpen: (dialogId: string) => get().dialogs[dialogId]?.isOpen ?? false,
    closeAllDialogs: () => set({ dialogs: {} }),

    loadingStates: {},
    setLoading: (key: string, isLoading: boolean) =>
        set((state) => ({
            loadingStates: {
                ...state.loadingStates,
                [key]: isLoading,
            },
        })),
    isLoading: (key: string) => get().loadingStates[key] ?? false,

    isSidebarOpen: true,
    setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
