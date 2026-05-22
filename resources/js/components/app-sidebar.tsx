import { NavUser } from '@/components/nav-user';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useLanguage } from '@/hooks/use-language';
import { iconMapper } from '@/lib/iconMapper';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { memo, useState } from 'react';
import AppLogo from './app-logo';

export interface MenuItem {
    id: number;
    title: string;
    translation_key?: string | null;
    route: string | null;
    icon: string;
    children?: MenuItem[];
}

function getMenuTitle(menu: MenuItem, t: (key: string) => string): string {
    if (!menu.translation_key) return menu.title;
    const translated = t(menu.translation_key);
    return translated === menu.translation_key ? menu.title : translated;
}

function hasActiveChild(items: MenuItem[], currentUrl: string): boolean {
    return items.some((item) => (item.route && currentUrl.startsWith(item.route)) || (item.children && hasActiveChild(item.children, currentUrl)));
}

interface CollapsibleMenuItemProps {
    menu: MenuItem;
    level: number;
    currentUrl: string;
}

const CollapsibleMenuItem = memo(function CollapsibleMenuItem({ menu, level, currentUrl }: CollapsibleMenuItemProps) {
    const { t } = useLanguage();
    const Icon = iconMapper(menu.icon || 'Folder') as LucideIcon;
    const children = (menu.children ?? []).filter(Boolean);
    const [open, setOpen] = useState(() => hasActiveChild(children, currentUrl));

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="w-full">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        className={cn(
                            'group flex w-full items-center justify-between rounded-md transition-colors',
                            level === 0 ? 'my-1 px-4 py-3' : 'px-3 py-2',
                            open ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                    >
                        <div className="flex items-center">
                            <Icon className="mr-3 size-4 opacity-80 group-hover:opacity-100" />
                            <span>{getMenuTitle(menu, t)}</span>
                        </div>
                        <ChevronDown
                            className={cn('size-4 opacity-50 transition-transform duration-200 group-hover:opacity-70', open && 'rotate-180')}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarMenuSub>
                        <RenderMenu items={children} level={level + 1} />
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
});

interface RenderMenuProps {
    items: MenuItem[];
    level?: number;
}

function RenderMenu({ items, level = 0 }: RenderMenuProps) {
    const { url: currentUrl } = usePage();
    const { t } = useLanguage();

    if (!Array.isArray(items) || items.length === 0) return null;

    return (
        <>
            {items.map((menu) => {
                if (!menu) return null;

                const Icon = iconMapper(menu.icon || 'Folder') as LucideIcon;
                const children = Array.isArray(menu.children) ? menu.children.filter(Boolean) : [];
                const hasChildren = children.length > 0;

                if (!menu.route && !hasChildren) return null;

                if (hasChildren) {
                    return <CollapsibleMenuItem key={menu.id} menu={menu} level={level} currentUrl={currentUrl} />;
                }

                const isActive = Boolean(menu.route && currentUrl.startsWith(menu.route));

                if (level === 0) {
                    return (
                        <SidebarMenuItem key={menu.id}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                className={cn(
                                    'group my-1 flex items-center rounded-md px-4 py-3 transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                <Link href={menu.route ?? '#'} prefetch>
                                    <Icon className="mr-3 size-4 opacity-80 group-hover:opacity-100" />
                                    <span>{getMenuTitle(menu, t)}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                }

                return (
                    <SidebarMenuSubItem key={menu.id}>
                        <SidebarMenuSubButton asChild isActive={isActive}>
                            <Link href={menu.route ?? '#'} prefetch>
                                <Icon className="size-4" />
                                <span>{getMenuTitle(menu, t)}</span>
                            </Link>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                );
            })}
        </>
    );
}

export function AppSidebar() {
    const { menus = [] } = usePage().props as { menus?: MenuItem[] };

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-r backdrop-blur">
            <SidebarHeader className="border-b px-4 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href="/backend/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                <SidebarMenu>
                    <RenderMenu items={menus} />
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
