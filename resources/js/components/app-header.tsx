import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu, Search, type LucideIcon } from 'lucide-react';
import { memo } from 'react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

interface HeaderNavItem {
    translationKey: string;

    url: string;
    icon: LucideIcon;
    external?: boolean;
}

const MAIN_NAV_ITEMS: HeaderNavItem[] = [
    {
        translationKey: 'pages.dashboard.title',
        url: '/backend/dashboard',
        icon: LayoutGrid,
    },
];

const RIGHT_NAV_ITEMS: HeaderNavItem[] = [
    {
        translationKey: 'navigation.repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
        external: true,
    },
    {
        translationKey: 'navigation.documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
        external: true,
    },
];

const ACTIVE_ITEM_STYLES = 'bg-accent text-accent-foreground';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export const AppHeader = memo(function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { t } = useLanguage();

    return (
        <>
            <div className="border-sidebar-border/80 border-b">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">{t('navigation.menu')}</span>
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="left"
                                className="bg-background text-foreground flex h-full w-64 flex-col items-stretch justify-between"
                            >
                                <SheetTitle className="sr-only">{t('navigation.menu')}</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="text-foreground h-6 w-6 fill-current" />
                                </SheetHeader>

                                <div className="mt-6 flex h-full flex-1 flex-col justify-between space-y-4 text-sm">
                                    <div className="flex flex-col space-y-4">
                                        {MAIN_NAV_ITEMS.map((item) => (
                                            <Link key={item.translationKey} href={item.url} className="flex items-center space-x-2 font-medium">
                                                <Icon iconNode={item.icon} className="h-5 w-5" />
                                                <span>{t(item.translationKey, { fallback: item.translationKey === 'pages.dashboard.title' ? 'Dashboard' : undefined })}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="flex flex-col space-y-4">
                                        {RIGHT_NAV_ITEMS.map((item) => (
                                            <a
                                                key={item.translationKey}
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 font-medium"
                                            >
                                                <Icon iconNode={item.icon} className="h-5 w-5" />
                                                <span>{t(item.translationKey, { fallback: item.translationKey === 'pages.dashboard.title' ? 'Dashboard' : undefined })}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/backend/dashboard" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {MAIN_NAV_ITEMS.map((item) => {
                                    const isActive = page.url === item.url;
                                    return (
                                        <NavigationMenuItem key={item.translationKey} className="relative flex h-full items-center">
                                            <Link
                                                href={item.url}
                                                className={cn(
                                                    navigationMenuTriggerStyle(),
                                                    isActive && ACTIVE_ITEM_STYLES,
                                                    'h-9 cursor-pointer px-3',
                                                )}
                                            >
                                                <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />
                                                {t(item.translationKey, { fallback: item.translationKey === 'pages.dashboard.title' ? 'Dashboard' : undefined })}
                                            </Link>
                                            {isActive && <div className="bg-foreground absolute bottom-0 left-0 h-0.5 w-full translate-y-px" />}
                                        </NavigationMenuItem>
                                    );
                                })}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="group h-9 w-9">
                            <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                            <span className="sr-only">{t('navigation.search')}</span>
                        </Button>

                        <div className="hidden lg:flex">
                            {RIGHT_NAV_ITEMS.map((item) => (
                                <TooltipProvider key={item.translationKey} delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group text-accent-foreground ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                <span className="sr-only">{t(item.translationKey, { fallback: item.translationKey === 'pages.dashboard.title' ? 'Dashboard' : undefined })}</span>
                                                <Icon iconNode={item.icon} className="size-5 opacity-80 group-hover:opacity-100" />
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t(item.translationKey, { fallback: item.translationKey === 'pages.dashboard.title' ? 'Dashboard' : undefined })}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="bg-muted text-foreground rounded-lg">{getInitials(auth.user.name)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="text-muted-foreground mx-auto flex h-12 w-full items-center justify-start px-4 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
});
