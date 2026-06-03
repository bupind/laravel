import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    permissions: string[];
    notifications?: NotificationState;
}

export interface NotificationItem {
    id: string;
    type: string;
    data: {
        status?: 'success' | 'error' | string;
        title?: string;
        message?: string;
        meta?: {
            imported?: number;
            error_count?: number;
            errors?: string[];
            [key: string]: unknown;
        };
        [key: string]: unknown;
    };
    read_at?: string | null;
    created_at?: string | null;
}

export interface NotificationState {
    unread_count: number;
    items: NotificationItem[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Setting {
    app_name: string;
    description?: string;
    logo?: string;
    favicon?: string;
    color?: string;
    seo?: {
        title?: string;
        description?: string;
        keywords?: string;
    };
    whatsapp?: Record<string, unknown>;
    email?: Record<string, unknown>;
    payment_gateway?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    setting?: Setting;
    translation_scope?: 'global' | 'common' | 'backend' | 'frontend' | 'api' | 'mobile' | 'auth' | 'validation';
    translations?: {
        [locale: string]: Record<string, string> | undefined;
    };
    translation_locales?: { code: string; label: string }[];
    flash?: {
        success?: string | { key?: string; replacements?: Record<string, string | number> };
        error?: string | { key?: string; replacements?: Record<string, string | number> };
    };
    menus?: MenuItem[];
    [key: string]: unknown;
}

export interface User {
    id: string | number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Role {
    id: number;
    name: string;
    permissions_count?: number;
    created_at?: string;
}

export interface Permission {
    id: number;
    name: string;
    group?: string | null;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface MenuItem {
    id: string;
    title: string;
    translation_key?: string | null;
    scope?: 'backend' | 'frontend';
    location?: 'sidebar' | 'header' | 'footer';
    route: string | null;
    icon: string;
    parent_id?: string | null;
    order?: number;
    permission_name?: string | null;
    children?: MenuItem[];
}
