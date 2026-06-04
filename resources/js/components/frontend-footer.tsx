import { useLanguage } from '@/hooks/use-language';
import { type MenuItem, type Setting } from '@/types';
import { Link } from '@inertiajs/react';
import { memo } from 'react';

interface FrontendFooterProps {
    appName: string;
    setting?: Setting;
    menus: MenuItem[];
}

function menuTitle(menu: MenuItem, t: (key: string) => string): string {
    if (!menu.translation_key) return menu.title;
    const translated = t(menu.translation_key);
    return translated === menu.translation_key ? menu.title : translated;
}

function FooterMenuLinks({ menus, t }: { menus: MenuItem[]; t: (key: string) => string }) {
    return (
        <>
            {menus.map((menu) => (
                <span key={menu.id} className="inline-flex flex-wrap items-center gap-x-6 gap-y-2">
                    {menu.route && menu.route !== '#' && (
                        <Link href={menu.route} prefetch={['mount', 'hover']} cacheFor="2m" className="hover:text-foreground">
                            {menuTitle(menu, t)}
                        </Link>
                    )}
                    {menu.children && menu.children.length > 0 && <FooterMenuLinks menus={menu.children} t={t} />}
                </span>
            ))}
        </>
    );
}

export const FrontendFooter = memo(function FrontendFooter({ appName, setting, menus }: FrontendFooterProps) {
    const { t } = useLanguage();
    const appDesc = setting?.description;
    const primaryColor = setting?.color || '#ef3b2d';

    return (
        <footer className="border-border bg-card text-card-foreground border-t">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-7 text-sm md:flex-row md:items-center md:justify-between md:px-6">
                <Link href="/" prefetch={['mount', 'hover']} cacheFor="2m" className="flex min-w-0 items-center gap-3">
                    {setting?.logo ? (
                        <img src={`/storage/${setting.logo}`} alt={appName} className="h-9 max-w-36 object-contain" loading="lazy" />
                    ) : (
                        <span
                            className="text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold"
                            style={{ backgroundColor: primaryColor }}
                            aria-hidden="true"
                        >
                            {appName.charAt(0).toUpperCase()}
                        </span>
                    )}
                    <span className="min-w-0">
                        <span className="text-foreground block truncate font-semibold">{appName}</span>
                        {appDesc && <span className="text-muted-foreground block truncate text-xs">{appDesc}</span>}
                    </span>
                </Link>

                {menus.length > 0 && (
                    <nav className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-xs" aria-label={t('navigation.footer')}>
                        <FooterMenuLinks menus={menus} t={t} />
                    </nav>
                )}

                <p className="text-muted-foreground text-xs">
                    © {new Date().getFullYear()} {t('footer.rightsReserved')}
                </p>
            </div>
        </footer>
    );
});
