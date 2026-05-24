import BackendLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import React from 'react';

interface BackendLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export default function BackendLayout({ children, breadcrumbs, title }: BackendLayoutProps) {
    return (
        <BackendLayoutTemplate breadcrumbs={breadcrumbs} title={title}>
            {children}
        </BackendLayoutTemplate>
    );
}
