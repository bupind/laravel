import AppearanceDropdown from '@/components/appearance-dropdown';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLanguage } from '@/hooks/use-language';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { language, setLanguage, locales, t } = useLanguage();

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-4">
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[150px]">
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

                <AppearanceDropdown />
            </div>
        </header>
    );
}
