import { create } from 'zustand';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => string;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = `${Date.now()}-${Math.random()}`;
        set((state) => ({
            notifications: [...state.notifications, { ...notification, id }],
        }));
        if (notification.duration) {
            setTimeout(
                () =>
                    set((state) => ({
                        notifications: state.notifications.filter((n) => n.id !== id),
                    })),
                notification.duration,
            );
        }
        return id;
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
    clearNotifications: () => set({ notifications: [] }),
}));
