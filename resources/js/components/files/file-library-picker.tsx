import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import { AlertCircle, File, Loader2, Search, UploadCloud } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface FolderItem {
    id: number;
    name: string;
    parent_id: string | null;
}

export interface FileLibraryItem {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: string;
    url: string;
    created_at: string | null;
}

interface FileLibraryResponse {
    data: FileLibraryItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface FileLibraryPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (item: FileLibraryItem) => void;
    accept?: string;
}
function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers ?? {}),
        },
    });
}

interface FileCardProps {
    item: FileLibraryItem;
    onSelect: (item: FileLibraryItem) => void;
}

function FileCard({ item, onSelect }: FileCardProps) {
    const isImage = item.mime_type.startsWith('image/');

    return (
        <button
            type="button"
            className="border-border bg-card hover:border-primary focus-visible:ring-ring overflow-hidden rounded-md border text-left transition focus-visible:ring-2 focus-visible:outline-none"
            onClick={() => onSelect(item)}
            title={item.name}
        >
            <div className="bg-muted aspect-video w-full overflow-hidden">
                {isImage ? (
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                        <File className="h-8 w-8 opacity-40" />
                    </div>
                )}
            </div>
            <div className="space-y-0.5 p-2">
                <p className="truncate text-xs font-medium">{item.name}</p>
                <p className="text-muted-foreground truncate text-[11px]">{item.size}</p>
            </div>
        </button>
    );
}

export default function FileLibraryPicker({ open, onOpenChange, onSelect, accept = 'image/*' }: FileLibraryPickerProps) {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [folderId, setFolderId] = useState<string>('__ROOT__');
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState<FileLibraryItem[]>([]);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [lastPage, setLastPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);

    const query = useMemo(() => {
        const params = new URLSearchParams({ per_page: '20', page: String(page) });
        if (folderId !== '__ROOT__') params.set('folder_id', folderId);
        if (search.trim()) params.set('search', search.trim());
        return params.toString();
    }, [page, search, folderId]);

    useEffect(() => {
        if (!open) return;
        let active = true;

        apiFetch('/backend/files/library/folders')
            .then((r) => r.json())
            .then((payload: { data?: FolderItem[] }) => {
                if (active) setFolders(payload.data ?? []);
            })
            .catch(() => {
                /* silent */
            });

        return () => {
            active = false;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        let active = true;

        setLoading(true);
        setError('');

        apiFetch(`/backend/files/library?${query}`)
            .then(async (res) => {
                if (!res.ok) throw new Error(t('notifications.load_failed'));
                return res.json() as Promise<FileLibraryResponse>;
            })
            .then((payload) => {
                if (!active) return;
                setRows(payload.data ?? []);
                setLastPage(payload.meta?.last_page ?? 1);
            })
            .catch((err: unknown) => {
                if (!active) return;
                setError(err instanceof Error ? err.message : t('notifications.load_failed'));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [open, query, reloadKey, t]);

    const handleUpload = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) return;

            const token = getCsrfToken();

            const formData = new FormData();
            Array.from(files).forEach((file) => formData.append('files[]', file));

            if (folderId !== '__ROOT__') {
                formData.append('folder_id', folderId);
            }

            if (token) {
                formData.append('_token', token);
            }

            setUploading(true);
            setError('');

            try {
                const res = await apiFetch('/backend/files', {
                    method: 'POST',
                    body: formData,
                    headers: token ? { 'X-CSRF-TOKEN': token } : undefined,
                });

                if (!res.ok) {
                    const json = (await res.json().catch(() => null)) as { message?: string } | null;
                    throw new Error(json?.message ?? t('notifications.upload_failed'));
                }

                setPage(1);
                setReloadKey((v) => v + 1);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : t('notifications.upload_failed'));
            } finally {
                setUploading(false);
            }
        },
        [folderId, t],
    );

    const handleSelect = useCallback(
        (item: FileLibraryItem) => {
            onSelect(item);
            onOpenChange(false);
        },
        [onSelect, onOpenChange],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{t('filePicker.title')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={folderId}
                            onValueChange={(value) => {
                                setFolderId(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[200px]">
                                <SelectValue placeholder={t('pages.files.rootFolder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__ROOT__">{t('pages.files.rootFolder')}</SelectItem>
                                {folders.map((folder) => (
                                    <SelectItem key={folder.id} value={String(folder.id)}>
                                        {folder.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="relative flex-1">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder={t('filePicker.searchPlaceholder')}
                                className="h-9 pl-8"
                            />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept={accept}
                            multiple
                            onChange={(e) => {
                                void handleUpload(e.target.files);
                                e.currentTarget.value = '';
                            }}
                        />
                        <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            {uploading ? t('buttons.uploading') : t('buttons.upload')}
                        </Button>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <p className="text-muted-foreground text-xs">{t('filePicker.hint')}</p>
                    <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto md:grid-cols-4">
                        {loading ? (
                            <div className="text-muted-foreground col-span-full flex items-center justify-center gap-2 py-10 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('filePicker.loading')}
                            </div>
                        ) : rows.length === 0 ? (
                            <div className="text-muted-foreground col-span-full py-10 text-center text-sm">{t('filePicker.empty')}</div>
                        ) : (
                            rows.map((item) => <FileCard key={item.id} item={item} onSelect={handleSelect} />)
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t pt-3">
                        <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                            {t('buttons.previous')}
                        </Button>
                        <span className="text-muted-foreground text-xs">
                            {t('pagination.page')} {page} / {lastPage}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                            disabled={page >= lastPage}
                        >
                            {t('buttons.next')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
