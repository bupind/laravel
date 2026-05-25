import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { type MenuItem, type PublicPageLink, type Setting, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LayoutDashboard, LogIn, Menu, UserCircle, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

interface FrontendHeaderProps {
    setting?: Setting;
    auth?: { user?: User | null };
}

function menuTitle(menu: MenuItem, t: (key: string) => string): string {
    if (!menu.translation_key) return menu.title;
    const translated = t(menu.translation_key);
    return translated === menu.translation_key ? menu.title : translated;
}

function hasNavigableRoute(menu: MenuItem): boolean {
    return Boolean(menu.route && menu.route !== '#');
}

function isRouteActive(route: string | null | undefined, currentPath: string): boolean {
    if (!route || route === '#') return false;
    if (route === '/') return currentPath === '/';
    return currentPath === route || currentPath.startsWith(`${route}/`);
}

function hasActiveChild(menu: MenuItem, currentPath: string): boolean {
    return (menu.children ?? []).some((child) => isRouteActive(child.route, currentPath) || hasActiveChild(child, currentPath));
}

interface NavLinkProps {
    menu: MenuItem;
    currentPath: string;
    t: (key: string) => string;
    onNavigate?: () => void;
    className?: string;
}

function NavLink({ menu, currentPath, t, onNavigate, className }: NavLinkProps) {
    return (
        <Link
            href={menu.route ?? '#'}
            prefetch={['mount', 'hover']}
            cacheFor="2m"
            preserveScroll
            onClick={onNavigate}
            className={cn(
                'text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isRouteActive(menu.route, currentPath) && 'bg-muted text-foreground',
                className,
            )}
        >
            {menuTitle(menu, t)}
        </Link>
    );
}

function DesktopSubMenuItems({ items, currentPath, t }: { items: MenuItem[]; currentPath: string; t: (key: string) => string }) {
    return (
        <>
            {items.map((item) => {
                const children = (item.children ?? []).filter(Boolean);

                if (children.length > 0) {
                    return (
                        <DropdownMenuSub key={item.id}>
                            <DropdownMenuSubTrigger
                                className={cn(
                                    (isRouteActive(item.route, currentPath) || hasActiveChild(item, currentPath)) &&
                                        'bg-accent text-accent-foreground',
                                )}
                            >
                                {menuTitle(item, t)}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {hasNavigableRoute(item) && (
                                    <DropdownMenuItem asChild>
                                        <Link href={item.route ?? '#'}>{menuTitle(item, t)}</Link>
                                    </DropdownMenuItem>
                                )}
                                <DesktopSubMenuItems items={children} currentPath={currentPath} t={t} />
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    );
                }

                if (!hasNavigableRoute(item)) return null;

                return (
                    <DropdownMenuItem
                        key={item.id}
                        asChild
                        className={cn(isRouteActive(item.route, currentPath) && 'bg-accent text-accent-foreground')}
                    >
                        <Link href={item.route ?? '#'}>{menuTitle(item, t)}</Link>
                    </DropdownMenuItem>
                );
            })}
        </>
    );
}

function DesktopMenuItem({ menu, currentPath, t }: { menu: MenuItem; currentPath: string; t: (key: string) => string }) {
    const children = (menu.children ?? []).filter(Boolean);
    const isActive = isRouteActive(menu.route, currentPath) || hasActiveChild(menu, currentPath);

    if (children.length === 0) {
        return hasNavigableRoute(menu) ? <NavLink menu={menu} currentPath={currentPath} t={t} /> : null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive && 'bg-muted text-foreground',
                    )}
                >
                    {menuTitle(menu, t)}
                    <ChevronDown className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
                {hasNavigableRoute(menu) && (
                    <DropdownMenuItem asChild>
                        <Link href={menu.route ?? '#'}>{menuTitle(menu, t)}</Link>
                    </DropdownMenuItem>
                )}
                <DesktopSubMenuItems items={children} currentPath={currentPath} t={t} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function MobileMenuItem({ menu, currentPath, t, onNavigate }: NavLinkProps) {
    const children = (menu.children ?? []).filter(Boolean);

    if (children.length === 0) {
        return hasNavigableRoute(menu) ? <NavLink menu={menu} currentPath={currentPath} t={t} onNavigate={onNavigate} className="w-full" /> : null;
    }

    return (
        <Collapsible defaultOpen={isRouteActive(menu.route, currentPath) || hasActiveChild(menu, currentPath)}>
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        (isRouteActive(menu.route, currentPath) || hasActiveChild(menu, currentPath)) && 'bg-muted text-foreground',
                    )}
                >
                    {menuTitle(menu, t)}
                    <ChevronDown className="h-4 w-4" />
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1 border-l pl-3">
                {hasNavigableRoute(menu) && <NavLink menu={menu} currentPath={currentPath} t={t} onNavigate={onNavigate} className="w-full" />}
                {children.map((child) => (
                    <MobileMenuItem key={child.id} menu={child} currentPath={currentPath} t={t} onNavigate={onNavigate} />
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}

export const FrontendHeader = memo(function FrontendHeader({ setting, auth }: FrontendHeaderProps) {
    const { language, setLanguage, locales, t } = useLanguage();
    const page = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const sharedName = (page.props as { name?: string }).name;

    const appName = setting?.app_name ?? sharedName ?? '';
    const primaryColor = setting?.color || '#2563eb';
    const isAuthenticated = Boolean(auth?.user);
    const currentPath = page.url.split('?')[0];

    const menus = useMemo(() => ((page.props as { menus?: MenuItem[] }).menus ?? []).filter((m) => m.scope === 'frontend'), [page.props]);
    const headerPages = useMemo(() => ((page.props as { global_pages?: { header?: PublicPageLink[] } }).global_pages?.header ?? []), [page.props]);

    return (
        <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/82 sticky top-0 z-40 border-b backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
                <Link href="/" prefetch={['mount', 'hover']} cacheFor="2m" preserveScroll className="flex min-w-0 items-center gap-3 font-semibold">
                    {setting?.logo ? (
                        <img src={`/storage/${setting.logo}`} alt={appName} className="h-8 max-w-40 object-contain" loading="eager" />
                    ) : (
                        <span
                            className="text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold"
                            style={{ backgroundColor: primaryColor }}
                            aria-hidden="true"
                        >
                            {appName.charAt(0).toUpperCase()}
                        </span>
                    )}
                    <span className="truncate">{appName}</span>
                </Link>

                <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2">
                    {(menus.length > 0 || headerPages.length > 0) && (
                        <nav className="hidden min-w-0 items-center justify-end gap-1 md:flex" aria-label={t('navigation.main')}>
                            {menus.map((menu) => (
                                <DesktopMenuItem key={menu.id} menu={menu} currentPath={currentPath} t={t} />
                            ))}
                            {headerPages.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.url}
                                    prefetch={['mount', 'hover']}
                                    cacheFor="2m"
                                    preserveScroll
                                    className={cn(
                                        'text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        isRouteActive(item.url, currentPath) && 'bg-muted text-foreground',
                                    )}
                                >
                                    {item.title_translations?.[language] ?? item.title}
                                </Link>
                            ))}
                        </nav>
                    )}

                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-9 w-[96px] shrink-0">
                            <SelectValue placeholder={t('language.label')} />
                        </SelectTrigger>
                        <SelectContent>
                            {locales.map((locale) => (
                                <SelectItem key={locale.code} value={locale.code}>
                                    {locale.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {!isAuthenticated && (
                        <Button asChild size="sm" className="shrink-0 text-white" style={{ backgroundColor: primaryColor }}>
                            <Link href={route('login')}>
                                <UserCircle className="h-4 w-4" />
                                {t('buttons.login')}
                            </Link>
                        </Button>
                    )}

                    {isAuthenticated && (
                        <Button asChild size="sm" variant="default" className="shrink-0 text-white" style={{ backgroundColor: primaryColor }}>
                            <Link href={route('dashboard')}>
                                <LayoutDashboard className="h-4 w-4" />
                                {t('pages.dashboard.title', { fallback: 'Dashboard' })}
                            </Link>
                        </Button>
                    )}

                    {(menus.length > 0 || headerPages.length > 0) && (
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0 md:hidden" aria-label={t('navigation.openMenu')}>
                                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="right" className="bg-background text-foreground w-72">
                                <SheetHeader className="mb-6 text-left">
                                    <SheetTitle>{appName}</SheetTitle>
                                </SheetHeader>

                                <nav className="flex flex-col gap-1" aria-label={t('navigation.mobile')}>
                                    {menus.map((menu) => (
                                        <MobileMenuItem
                                            key={menu.id}
                                            menu={menu}
                                            currentPath={currentPath}
                                            t={t}
                                            onNavigate={() => setMobileOpen(false)}
                                        />
                                    ))}
                                    {headerPages.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.url}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                'text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                                isRouteActive(item.url, currentPath) && 'bg-muted text-foreground',
                                            )}
                                        >
                                            {item.title_translations?.[language] ?? item.title}
                                        </Link>
                                    ))}
                                </nav>

                                <div className="mt-6 flex flex-col gap-2 border-t pt-6">
                                    {!isAuthenticated && (
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={route('login')} onClick={() => setMobileOpen(false)}>
                                                <LogIn className="h-4 w-4" />
                                                {t('buttons.login')}
                                            </Link>
                                        </Button>
                                    )}
                                    {isAuthenticated && (
                                        <Button asChild size="sm" style={{ backgroundColor: primaryColor }}>
                                            <Link href={route('dashboard')} onClick={() => setMobileOpen(false)}>
                                                <LayoutDashboard className="h-4 w-4" />
                                                {t('pages.dashboard.title', { fallback: 'Dashboard' })}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </header>
    );
});
