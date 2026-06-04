import { usePage } from '@inertiajs/react';
import { useLanguage } from '@/hooks/use-language';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { t } = useLanguage();
    const props = usePage().props as {
        name?: string;
        setting?: {
            app_name?: string;
            logo?: string;
        } | null;
    };
    const setting = props.setting as {
        app_name?: string;
        logo?: string;
    } | null;

    const defaultLogo = '';

    const appName = setting?.app_name || props.name || '';
    const logo = setting?.logo || defaultLogo;

    return (
        <div className="flex items-center gap-2">
            {logo ? (
                <img src={`/storage/${logo}`} alt={appName || t('labels.logo')} className="h-8 w-8 rounded-md object-contain" />
            ) : (
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                    <AppLogoIcon className="size-[1.375rem] fill-current" />
                </div>
            )}
            <div className="grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{appName}</span>
            </div>
        </div>
    );
}
