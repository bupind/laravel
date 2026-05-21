import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    permissions: string[];
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
    nama_app: string;
    deskripsi?: string;
    logo?: string;
    favicon?: string;
    warna?: string;
    translations?: {
        id?: Record<string, string>;
        en?: Record<string, string>;
    };
    seo?: {
        title?: string;
        description?: string;
        keywords?: string;
    };
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    setting?: Setting;
    flash?: {
        success?: string | { key?: string; replacements?: Record<string, string | number> };
        error?: string | { key?: string; replacements?: Record<string, string | number> };
    };
    menus?: MenuItem[];
    [key: string]: unknown;
}

export interface User {
    id: number;
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
    id: number;
    title: string;
    translation_key?: string | null;
    route: string | null;
    icon: string;
    parent_id?: number | null;
    order?: number;
    permission_name?: string | null;
    children?: MenuItem[];
}
