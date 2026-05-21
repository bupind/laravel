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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/layouts/app-layout';
import SortableMenuItem from '@/pages/backend/menus/SortableMenuItem';
import { type BreadcrumbItem, type MenuItem } from '@/types';
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Edit, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuOrderPayload {
    id: number;
    order: number;
    children: MenuOrderPayload[];
}

interface Props {
    menuItems: MenuItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildOrderPayload(items: MenuItem[]): MenuOrderPayload[] {
    return items.map((item, index) => ({
        id: item.id,
        order: index + 1,
        children: item.children ? buildOrderPayload(item.children) : [],
    }));
}

// ─── Sub-komponen MenuRow ─────────────────────────────────────────────────────

interface MenuRowProps {
    menu: MenuItem;
    level: number;
    isExpanded: boolean;
    sensors: ReturnType<typeof useSensors>;
    onToggleExpand: (id: number) => void;
    onDelete: (id: number) => void;
    onChildDragEnd: (parentId: number, event: DragEndEvent) => void;
}

const levelIndentClass = ['ml-0', 'ml-6', 'ml-12', 'ml-18'] as const;

function MenuRow({ menu, level, isExpanded, sensors, onToggleExpand, onDelete, onChildDragEnd }: MenuRowProps) {
    const hren = !!menu.children?.length;
    const indent = levelIndentClass[Math.min(level, levelIndentClass.length - 1)];

    return (
        <div>
            <div
                className={`bg-background flex items-center justify-between rounded-lg border px-4 py-1 shadow-sm transition-shadow hover:shadow ${indent}`}
            >
                <div className="flex flex-1 items-center gap-2">
                    {hren ? (
                        <button
                            type="button"
                            onClick={() => onToggleExpand(menu.id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    ) : (
                        <span className="w-4" aria-hidden />
                    )}

                    <SortableMenuItem id={menu.id.toString()} title={menu.title} />
                </div>

                <div className="flex items-center gap-1">
                    <Link href={`/backend/menus/${menu.id}/edit`}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title="Edit menu">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>

                    <AlertDialog>
                        <AlertDialogTrigger >
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" title="Hapus menu">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus menu ini?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Menu <strong>{menu.title}</strong> akan dihapus secara permanen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(menu.id)} className="bg-destructive hover:bg-destructive/90">
                                    Hapus
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {hren && isExpanded && (
                <div className="mt-1 space-y-1">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onChildDragEnd(menu.id, e)}>
                        <SortableContext items={menu.children!.map((c) => c.id.toString())} strategy={verticalListSortingStrategy}>
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

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Menu Management', href: '/backend/menus' }];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MenuIndex({ menuItems }: Props) {
    const { t } = useLanguage();
    const [menus, setMenus] = useState<MenuItem[]>(menuItems);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const toggleExpand = useCallback((id: number) => {
        setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = menus.findIndex((m) => m.id === Number(active.id));
        const newIndex = menus.findIndex((m) => m.id === Number(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        setMenus((prev) => arrayMove(prev, oldIndex, newIndex));
    };

    const handleChildDragEnd = useCallback((parentId: number, event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setMenus((prevMenus) =>
            prevMenus.map((menu) => {
                if (menu.id !== parentId || !menu.children) return menu;

                const oldIndex = menu.children.findIndex((m) => m.id === Number(active.id));
                const newIndex = menu.children.findIndex((m) => m.id === Number(over.id));
                if (oldIndex === -1 || newIndex === -1) return menu;

                return { ...menu, children: arrayMove(menu.children, oldIndex, newIndex) };
            }),
        );
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        // @ts-ignore
        router.post('/backend/menus/reorder', { menus: buildOrderPayload(menus) }, { onFinish: () => setIsSaving(false) });
    };

    const handleDelete = useCallback((id: number) => {
        router.delete(`/backend/menus/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setMenus((prev) => prev.map((m) => ({ ...m, children: m.children?.filter((c) => c.id !== id) })).filter((m) => m.id !== id));
            },
        });
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('pages.menus.title')} />

            <div className="flex-1 p-4 md:p-6">
                <Card className="w-full">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold tracking-tight">{t('pages.menus.title')}</CardTitle>
                                <p className="text-muted-foreground text-sm">{t('pages.menus.description')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button onClick={handleSave} disabled={isSaving}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaving ? t('buttons.saving') : t('buttons.save')}
                                </Button>
                                <Link href="/backend/menus/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />

                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>

                    <Separator />

                    <CardContent className="pt-6">
                        {menus.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-muted-foreground mb-4">{t('pages.menus.empty')}</p>
                                <Link href="/backend/menus/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />

                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={menus.map((m) => m.id.toString())} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-3">
                                        {menus.map((menu) => (
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
        </AppLayout>
    );
}
