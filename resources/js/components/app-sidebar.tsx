import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import { NavUser } from '@/components/nav-user';
import { iconMapper } from '@/lib/iconMapper';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import AppLogo from './app-logo';

interface MenuItem {
    id: number;
    title: string;
    route: string | null;
    icon: string;
    children?: MenuItem[];
}

function RenderMenu({ items, level = 0 }: { items: MenuItem[]; level?: number }) {
    const { url: currentUrl } = usePage();

    if (!Array.isArray(items)) return null;

    return (
        <>
            {items.map((menu) => {
                if (!menu) return null;
                const Icon = iconMapper(menu.icon || 'Folder') as LucideIcon;
                const children = Array.isArray(menu.children) ? menu.children.filter(Boolean) : [];
                const hasChildren = children.length > 0;
                const isActive = menu.route && currentUrl.startsWith(menu.route);
                const indentClass = level > 0 ? `pl-${4 + level * 3}` : '';

                const activeClass = isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';

                if (!menu.route && !hasChildren) return null;

                return (
                    <SidebarMenuItem key={menu.id}>
                        {hasChildren ? (
                            <>
                                <SidebarMenuButton
                                    className={cn(
                                        `group flex items-center justify-between rounded-md transition-colors ${indentClass}`,
                                        activeClass,
                                        level === 0 ? 'my-1 px-4 py-3' : 'px-3 py-2',
                                    )}
                                >
                                    <div className="flex items-center">
                                        <Icon className="mr-3 size-4 opacity-80 group-hover:opacity-100" />
                                        <span>{menu.title}</span>
                                    </div>
                                    <ChevronDown className="size-4 opacity-50 transition-transform group-hover:opacity-70 group-data-[state=open]:rotate-180" />
                                </SidebarMenuButton>
                                <SidebarMenu className="border-muted ml-2 border-l pl-2">
                                    <RenderMenu items={children} level={level + 1} />
                                </SidebarMenu>
                            </>
                        ) : (
                            <SidebarMenuButton
                                asChild
                                className={cn(
                                    `group flex items-center rounded-md transition-colors ${indentClass}`,
                                    activeClass,
                                    level === 0 ? 'my-1 px-4 py-3' : 'px-3 py-2',
                                )}
                            >
                                <Link href={menu.route || '#'} prefetch>
                                    <Icon className="mr-3 size-4 opacity-80 group-hover:opacity-100" />
                                    <span>{menu.title}</span>
                                    {level > 0 && <ChevronRight className="ml-auto size-4 opacity-0 group-hover:opacity-50" />}
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
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
