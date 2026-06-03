import { FrontendFooter } from '@/components/frontend-footer';
import { FrontendHeader } from '@/components/frontend-header';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';

interface FrontendLayoutProps {
    children: ReactNode;
}

export default function FrontendLayout({ children }: FrontendLayoutProps) {
    const page = usePage<SharedData>();
    const { auth, menus, name, setting } = page.props;
    const primaryColor = setting?.color || '#ef3b2d';
    const currentPath = page.url.split('?')[0];
    const appName = setting?.app_name ?? name ?? '';
    const frontendMenus = useMemo(() => (menus ?? []).filter((menu) => menu.scope === 'frontend'), [menus]);
    const headerMenus = useMemo(() => frontendMenus.filter((menu) => (menu.location ?? 'header') === 'header'), [frontendMenus]);
    const footerMenus = useMemo(() => frontendMenus.filter((menu) => menu.location === 'footer'), [frontendMenus]);
    const shellRef = useRef({
        appName,
        headerMenus,
        footerMenus,
        setting,
    });

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary', primaryColor);
    }, [primaryColor]);

    const shell = shellRef.current;

    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col">
            <FrontendHeader
                appName={shell.appName}
                setting={shell.setting}
                auth={auth}
                menus={shell.headerMenus}
                currentPath={currentPath}
            />
            <div className="flex-1">{children}</div>
            <FrontendFooter appName={shell.appName} setting={shell.setting} menus={shell.footerMenus} />
        </div>
    );
}
