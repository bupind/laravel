import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { type MenuItem, type Setting, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FrontendHeaderProps {
    setting?: Setting;
    auth?: { user?: User | null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function menuTitle(menu: MenuItem, t: (key: string) => string): string {
    if (!menu.translation_key) return menu.title;
    const translated = t(menu.translation_key);
    return translated === menu.translation_key ? menu.title : translated;
}

/** Flatten nested menus, keeping only items with a real navigable route. */
function flattenMenus(items: MenuItem[]): MenuItem[] {
    return items.flatMap((item) => {
        const children = item.children ? flattenMenus(item.children) : [];
        return item.route && item.route !== '#' ? [item, ...children] : children;
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavLinksProps {
    menus: MenuItem[];
    currentPath: string;
    t: (key: string) => string;
    onNavigate?: () => void;
}

function NavLinks({ menus, currentPath, t, onNavigate }: NavLinksProps) {
    return (
        <>
            {menus.map((menu) => (
                <Link
                    key={menu.id}
                    href={menu.route ?? '#'}
                    onClick={onNavigate}
                    className={cn(
                        'text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        currentPath === menu.route && 'bg-muted text-foreground',
                    )}
                >
                    {menuTitle(menu, t)}
                </Link>
            ))}
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const FrontendHeader = memo(function FrontendHeader({ setting, auth }: FrontendHeaderProps) {
    const { language, setLanguage, locales, t } = useLanguage();
    const page = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const appName = setting?.nama_app ?? 'Laravel Starter';
    const primaryColor = setting?.warna || '#2563eb';
    const isAuthenticated = Boolean(auth?.user);
    const currentPath = page.url.split('?')[0];

    // Ambil menu frontend dari shared props — sudah dari database via HandleInertiaRequests
    const sharedMenus = ((page.props as { menus?: MenuItem[] }).menus ?? []).filter((m) => m.scope === 'frontend');

    // Flatten di-memo berdasarkan referensi sharedMenus (bukan hanya .length)
    // agar update dari database langsung ter-reflect tanpa perlu reload
    const menus = useMemo(() => flattenMenus(sharedMenus), [sharedMenus]);

    return (
        <header className="border-border border-b">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex min-w-0 items-center gap-3 font-semibold">
                    {setting?.logo ? (
                        <img src={`/storage/${setting.logo}`} alt={appName} className="h-8 max-w-40 object-contain" loading="eager" />
                    ) : (
                        <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white"
                            style={{ backgroundColor: primaryColor }}
                            aria-hidden="true"
                        >
                            {appName.charAt(0).toUpperCase()}
                        </span>
                    )}
                    <span className="truncate">{appName}</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 md:flex" aria-label={t('navigation.main')}>
                    <NavLinks menus={menus} currentPath={currentPath} t={t} />
                </nav>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                    {/* Language selector */}
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-9 w-[112px]">
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
                        <Button asChild size="sm" variant="outline" className="hidden sm:flex">
                            <Link href={route('login')}>
                                <LogIn className="h-4 w-4" />
                                {t('buttons.login')}
                            </Link>
                        </Button>
                    )}

                    <Button asChild size="sm" variant="default" className="hidden sm:flex" style={{ backgroundColor: primaryColor }}>
                        <Link href={route('dashboard')}>
                            <LayoutDashboard className="h-4 w-4" />
                            {t('pages.dashboard.title')}
                        </Link>
                    </Button>

                    {/* Mobile hamburger */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('navigation.openMenu')}>
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-72">
                            <SheetHeader className="mb-6 text-left">
                                <SheetTitle>{appName}</SheetTitle>
                            </SheetHeader>

                            <nav className="flex flex-col gap-1" aria-label={t('navigation.mobile')}>
                                <NavLinks menus={menus} currentPath={currentPath} t={t} onNavigate={() => setMobileOpen(false)} />
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
                                <Button asChild size="sm" style={{ backgroundColor: primaryColor }}>
                                    <Link href={route('dashboard')} onClick={() => setMobileOpen(false)}>
                                        <LayoutDashboard className="h-4 w-4" />
                                        {t('pages.dashboard.title')}
                                    </Link>
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Mobile sticky nav tabs */}
            {menus.length > 0 && (
                <nav className="border-border flex gap-1 overflow-x-auto border-t px-4 py-2 md:hidden" aria-label={t('navigation.tabs')}>
                    {menus.map((menu) => (
                        <Link
                            key={menu.id}
                            href={menu.route ?? '#'}
                            className={cn(
                                'text-muted-foreground rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                                currentPath === menu.route && 'bg-muted text-foreground',
                            )}
                        >
                            {menuTitle(menu, t)}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
});
