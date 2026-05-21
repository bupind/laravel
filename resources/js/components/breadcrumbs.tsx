import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useLanguage } from '@/hooks/use-language';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Fragment } from 'react';

const breadcrumbTranslationKeys: Record<string, string> = {
    'Audit Logs': 'pages.auditLogs.title',
    Backup: 'pages.backup.title',
    Categories: 'pages.categories.title',
    'File Management': 'pages.files.title',
    'File Manager': 'pages.files.title',
    'Menu Management': 'pages.menus.title',
    'Permission Management': 'pages.permissions.title',
    'Role Management': 'pages.roles.title',
    Tags: 'pages.tags.title',
    Translations: 'settings.translations.title',
    'Manajemen User': 'users.title',
};

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    const { t } = useLanguage();
    const getTitle = (title: string) => {
        const key = breadcrumbTranslationKeys[title];

        return key ? t(key) : title;
    };

    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{getTitle(item.title)}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={item.href}>{getTitle(item.title)}</BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}
