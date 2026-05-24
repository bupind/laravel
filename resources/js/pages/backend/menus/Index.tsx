import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import BackendLayout from '@/layouts/backend-layout';
import SortableMenuItem from '@/pages/backend/menus/SortableMenuItem';
import { type MenuItem } from '@/types';
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Edit, Globe2, Plus, Save, Search, Server, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

type MenuScope = 'backend' | 'frontend';

interface MenuOrderPayload {
    id: string;
    order: number;
    children: MenuOrderPayload[];
}

interface Props {
    menuItems: MenuItem[];
}

function buildOrderPayload(items: MenuItem[]): MenuOrderPayload[] {
    return items.map((item, index) => ({
        id: item.id,
        order: index + 1,
        children: item.children ? buildOrderPayload(item.children) : [],
    }));
}

interface MenuRowProps {
    menu: MenuItem;
    level: number;
    isExpanded: boolean;
    sensors: ReturnType<typeof useSensors>;
    onToggleExpand: (id: string) => void;
    onDelete: (id: string) => void;
    onChildDragEnd: (parentId: string, event: DragEndEvent) => void;
}

const levelIndentClass = ['ml-0', 'ml-6', 'ml-12', 'ml-18'] as const;

function MenuRow({ menu, level, isExpanded, sensors, onToggleExpand, onDelete, onChildDragEnd }: MenuRowProps) {
    const { t } = useLanguage();
    const hasChildren = !!menu.children?.length;
    const indent = levelIndentClass[Math.min(level, levelIndentClass.length - 1)];

    return (
        <div>
            <div
                className={`bg-background flex items-center justify-between rounded-lg border px-4 py-1 shadow-sm transition-shadow hover:shadow ${indent}`}
            >
                <div className="flex flex-1 items-center gap-2">
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={() => onToggleExpand(menu.id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label={isExpanded ? t('pages.menus.collapse') : t('pages.menus.expand')}
                        >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    ) : (
                        <span className="w-4" aria-hidden />
                    )}

                    <SortableMenuItem id={menu.id} title={menu.title} />
                </div>

                <div className="flex items-center gap-1">
                    <Link href={`/backend/menus/${menu.id}/edit`}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title={t('buttons.edit')}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" title={t('buttons.delete')}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('dialog.delete.title')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('dialog.delete.description', { item: menu.title })}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(menu.id)} className="bg-destructive hover:bg-destructive/90">
                                    {t('buttons.delete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="mt-1 space-y-1">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => onChildDragEnd(menu.id, event)}>
                        <SortableContext items={menu.children!.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                            {menu.children!.map((child) => (
                                <MenuRow
                                    key={child.id}
                                    menu={child}
                                    level={level + 1}
                                    isExpanded={false}
                                    sensors={sensors}
                                    onToggleExpand={onToggleExpand}
                                    onDelete={onDelete}
                                    onChildDragEnd={onChildDragEnd}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
}

export default function MenuIndex({ menuItems }: Props) {
    const { t } = useLanguage();
    const [menus, setMenus] = useState<MenuItem[]>(menuItems);
    const [activeScope, setActiveScope] = useState<MenuScope>('backend');
    const [isSaving, setIsSaving] = useState(false);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [keyword, setKeyword] = useState('');

    const menusByScope = useMemo(
        () => ({
            backend: menus.filter((m) => (m.scope ?? 'backend') === 'backend'),
            frontend: menus.filter((m) => m.scope === 'frontend'),
        }),
        [menus],
    );

    // Filter menus by keyword (title match)
    const activeMenus = useMemo(() => {
        const scope = menusByScope[activeScope];
        if (!keyword.trim()) return scope;
        const q = keyword.toLowerCase();
        return scope.filter((m) => m.title.toLowerCase().includes(q));
    }, [menusByScope, activeScope, keyword]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const base = menusByScope[activeScope];
        const oldIndex = base.findIndex((m) => m.id === String(active.id));
        const newIndex = base.findIndex((m) => m.id === String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(base, oldIndex, newIndex);
        setMenus((prev) => [...prev.filter((m) => (m.scope ?? 'backend') !== activeScope), ...reordered]);
    };

    const handleChildDragEnd = useCallback((parentId: string, event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setMenus((prev) =>
            prev.map((menu) => {
                if (menu.id !== parentId || !menu.children) return menu;
                const oldIdx = menu.children.findIndex((c) => c.id === String(active.id));
                const newIdx = menu.children.findIndex((c) => c.id === String(over.id));
                if (oldIdx === -1 || newIdx === -1) return menu;
                return { ...menu, children: arrayMove(menu.children, oldIdx, newIdx) };
            }),
        );
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        router.post('/backend/menus/reorder', { menus: buildOrderPayload(menusByScope[activeScope]) }, { onFinish: () => setIsSaving(false) });
    };

    const handleDelete = useCallback((id: string) => {
        router.delete(`/backend/menus/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setMenus((prev) => prev.map((m) => ({ ...m, children: m.children?.filter((c) => c.id !== id) })).filter((m) => m.id !== id));
            },
        });
    }, []);

    const activeScopeLabel = activeScope === 'backend' ? t('pages.menus.scopeBackend') : t('pages.menus.scopeFrontend');

    return (
        <BackendLayout breadcrumbs={[{ title: t('pages.menus.breadcrumb'), href: '/backend/menus' }]}>
            <Head title={t('pages.menus.title', { fallback: 'Menu Management' })} />

            <div className="flex-1 p-4 md:p-6">
                <Card className="w-full">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight">{t('pages.menus.title', { fallback: 'Menu Management' })}</CardTitle>
                                <p className="text-muted-foreground text-sm">{t('pages.menus.description', { fallback: 'Arrange backend and frontend navigation menus.' })}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button onClick={handleSave} disabled={isSaving}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaving ? t('buttons.saving') : t('buttons.save')}
                                </Button>
                                <Link href={`/backend/menus/create?scope=${activeScope}`}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('buttons.add')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-6">
                        {/* Scope selector */}
                        <div className="mb-6 grid gap-3 md:grid-cols-2">
                            {(['backend', 'frontend'] as MenuScope[]).map((scope) => (
                                <button
                                    key={scope}
                                    type="button"
                                    onClick={() => {
                                        setActiveScope(scope);
                                        setKeyword('');
                                    }}
                                    className={`rounded-lg border p-4 text-left transition-colors ${
                                        activeScope === scope ? 'border-primary bg-primary/5' : 'bg-background hover:bg-muted/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            {scope === 'backend' ? (
                                                <Server className="text-muted-foreground h-5 w-5" />
                                            ) : (
                                                <Globe2 className="text-muted-foreground h-5 w-5" />
                                            )}
                                            <div>
                                                <p className="font-semibold">
                                                    {scope === 'backend' ? t('pages.menus.scopeBackend') : t('pages.menus.scopeFrontend')}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    {scope === 'backend' ? 'Menu sidebar area admin' : 'Menu navigasi halaman publik'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={activeScope === scope ? 'default' : 'secondary'}>{menusByScope[scope].length}</Badge>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Search bar — same pattern as translations module */}
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="font-semibold">{activeScopeLabel}</h2>
                                <p className="text-muted-foreground text-sm">
                                    {activeScope === 'backend' ? 'Sedang mengelola menu backend.' : 'Sedang mengelola menu frontend.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder={t('pages.menus.search', { fallback: 'Cari menu...' })}
                                        className="h-9 w-[220px] pl-8"
                                    />
                                </div>
                                <Badge variant="outline" className="rounded-md">
                                    {activeMenus.length} / {menusByScope[activeScope].length}
                                </Badge>
                            </div>
                        </div>

                        {/* Menu list */}
                        {activeMenus.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-muted-foreground mb-4">
                                    {keyword ? t('pages.menus.noResults', { fallback: 'Menu tidak ditemukan.' }) : t('pages.menus.empty')}
                                </p>
                                {!keyword && (
                                    <Link href={`/backend/menus/create?scope=${activeScope}`}>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            {t('buttons.add')}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={activeMenus.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-3">
                                        {activeMenus.map((menu) => (
                                            <MenuRow
                                                key={menu.id}
                                                menu={menu}
                                                level={0}
                                                isExpanded={expandedIds.includes(menu.id)}
                                                sensors={sensors}
                                                onToggleExpand={toggleExpand}
                                                onDelete={handleDelete}
                                                onChildDragEnd={handleChildDragEnd}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </CardContent>
                </Card>
            </div>
        </BackendLayout>
    );
}
