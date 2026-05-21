import { useEffect } from 'react';

interface ModalShortcutOptions {
    open: boolean;
    onSubmit?: () => void;
    onClose?: () => void;
    disabled?: boolean;
}

export function useModalShortcuts({ open, onSubmit, onClose, disabled = false }: ModalShortcutOptions) {
    useEffect(() => {
        if (!open || disabled) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                onSubmit?.();
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                onClose?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [disabled, onClose, onSubmit, open]);
}
