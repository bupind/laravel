import { useLanguage } from '@/hooks/use-language';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface Props {
    id: string;
    title: string;
}

export default function SortableMenuItem({ id, title }: Props) {
    const { t } = useLanguage();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`bg-background flex items-center gap-3 rounded px-4 py-2 ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
        >
            <button
                type="button"
                {...listeners}
                className="text-muted-foreground hover:text-foreground cursor-grab touch-none"
                aria-label={t('pages.menus.dragToReorder')}
            >
                <GripVertical className="size-4" />
            </button>
            <span className="text-sm font-medium">{title}</span>
        </div>
    );
}
