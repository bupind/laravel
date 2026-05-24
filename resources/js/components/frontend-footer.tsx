import { type PublicPageLink, type Setting } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { memo } from 'react';

interface FrontendFooterProps {
    setting?: Setting;
}

export const FrontendFooter = memo(function FrontendFooter({ setting }: FrontendFooterProps) {
    const props = usePage().props as { name?: string; global_pages?: { footer?: PublicPageLink[] } };
    const appName = setting?.nama_app ?? props.name ?? '';
    const appDesc = setting?.deskripsi;
    const primaryColor = setting?.warna || '#ef3b2d';
    const footerPages = props.global_pages?.footer ?? [];

    return (
        <footer className="border-border bg-card text-card-foreground border-t">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-7 text-sm md:flex-row md:items-center md:justify-between md:px-6">
                <Link href="/" className="flex min-w-0 items-center gap-3">
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

                <nav className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-xs" aria-label="Footer navigation">
                    <Link href="/contact" className="hover:text-foreground">
                        Contact
                    </Link>
                    {footerPages.length > 0 ? (
                        footerPages.map((page) => (
                            <Link key={page.id} href={page.url} className="hover:text-foreground">
                                {page.title}
                            </Link>
                        ))
                    ) : (
                        <>
                            <Link href="/pages/privacy-policy" className="hover:text-foreground">
                                Privacy Policy
                            </Link>
                            <Link href="/pages/about-us" className="hover:text-foreground">
                                About Us
                            </Link>
                        </>
                    )}
                </nav>

                <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} All rights reserved.</p>
            </div>
        </footer>
    );
});
