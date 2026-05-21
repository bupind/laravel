import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// ── CSRF helper ───────────────────────────────────────────────────────────────
// Baca dari meta tag (sudah ada di backend/app.blade.php).
// Dipanggil setiap kali dibutuhkan agar selalu fresh (Laravel merotasi token
// setelah tiap request di beberapa konfigurasi).
function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

// ── Shared fetch defaults ─────────────────────────────────────────────────────
// credentials: 'same-origin' wajib agar session cookie (laravel_session) ikut
// dikirim — tanpanya server tidak mengenali session dan CSRF tidak bisa diverifikasi.
function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
        },
    });
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface FolderItem {
    id: number;
    name: string;
    parent_id: number | null;
}

interface FileLibraryItem {
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

interface FileLibraryPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (item: FileLibraryItem) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FileLibraryPicker({ open, onOpenChange, onSelect }: FileLibraryPickerProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [search, setSearch] = useState('');
    const [folderId, setFolderId] = useState<string>('__ROOT__');
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState<FileLibraryItem[]>([]);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [lastPage, setLastPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);

    const query = useMemo(() => {
        const params = new URLSearchParams();
        params.set('per_page', '20');
        params.set('page', String(page));
        if (folderId !== '__ROOT__') params.set('folder_id', folderId);
        if (search.trim() !== '') params.set('search', search.trim());
        return params.toString();
    }, [page, search, folderId]);

    // Load folders
    useEffect(() => {
        if (!open) return;
        let isActive = true;

        // credentials: 'same-origin' diurus oleh apiFetch
        apiFetch('/backend/files/library/folders')
            .then((res) => res.json())
            .then((payload: { data?: FolderItem[] }) => {
                if (!isActive) return;
                setFolders(payload.data ?? []);
            })
            .catch(() => {
                /* silent – folders tidak kritis */
            });

        return () => {
            isActive = false;
        };
    }, [open]);

    // Load files
    useEffect(() => {
        if (!open) return;
        let isActive = true;

        setLoading(true);
        setErrorMessage('');

        apiFetch(`/backend/files/library?${query}`)
            .then(async (res) => {
                if (!res.ok) throw new Error('Gagal memuat file.');
                return res.json();
            })
            .then((payload: FileLibraryResponse) => {
                if (!isActive) return;
                setRows(payload.data ?? []);
                setLastPage(payload.meta?.last_page ?? 1);
            })
            .catch((error: unknown) => {
                if (!isActive) return;
                setErrorMessage(error instanceof Error ? error.message : 'Gagal memuat file.');
            })
            .finally(() => {
                if (!isActive) return;
                setLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [open, query, reloadKey]);

    // Upload
    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i += 1) {
            formData.append('files[]', files[i]);
        }
        if (folderId !== '__ROOT__') {
            formData.append('folder_id', folderId);
        }

        setUploading(true);
        setErrorMessage('');

        try {
            const response = await apiFetch('/backend/files', {
                method: 'POST',
                body: formData,
                headers: {
                    // Jangan set Content-Type — browser yang set multipart/form-data + boundary
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!response.ok) {
                const maybeJson = (await response.json().catch(() => null)) as { message?: string } | null;
                throw new Error(maybeJson?.message ?? 'Upload gagal.');
            }

            setPage(1);
            setReloadKey((v) => v + 1);
        } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : 'Upload gagal.');
        } finally {
            setUploading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Select Image From File Management</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Select
                            value={folderId}
                            onValueChange={(value) => {
                                setFolderId(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="h-9 w-[220px]">
                                <SelectValue placeholder="Root folder" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__ROOT__">Root folder</SelectItem>
                                {folders.map((folder) => (
                                    <SelectItem key={folder.id} value={String(folder.id)}>
                                        {folder.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search file name..."
                            className="h-9"
                        />
                        <Button type="button" size="icon" className="h-9 w-9">
                            <Search className="h-4 w-4" />
                        </Button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={(event) => {
                                void handleUpload(event.target.files);
                                event.currentTarget.value = '';
                            }}
                        />
                        <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="mr-1 h-4 w-4" />
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>

                    {errorMessage !== '' && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{errorMessage}</div>
                    )}

                    <div className="text-muted-foreground text-xs">
                        Pilih gambar: klik tombol Upload untuk tambah file baru, atau klik salah satu kartu gambar untuk memilih.
                    </div>

                    <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto md:grid-cols-4">
                        {loading ? (
                            <div className="text-muted-foreground col-span-full text-sm">Loading files...</div>
                        ) : rows.length === 0 ? (
                            <div className="text-muted-foreground col-span-full text-sm">No files found.</div>
                        ) : (
                            rows.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className="border-border bg-card hover:border-primary overflow-hidden rounded-md border text-left transition"
                                    onClick={() => {
                                        onSelect(item);
                                        onOpenChange(false);
                                    }}
                                >
                                    <div className="bg-muted aspect-video w-full">
                                        {item.mime_type.startsWith('image/') ? (
                                            <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">File</div>
                                        )}
                                    </div>
                                    <div className="space-y-1 p-2">
                                        <p className="truncate text-xs font-medium">{item.name}</p>
                                        <p className="text-muted-foreground truncate text-[11px]">{item.size}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                            Prev
                        </Button>
                        <div className="text-muted-foreground text-xs">
                            Page {page} / {lastPage}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                            disabled={page >= lastPage}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
