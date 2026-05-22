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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    ChevronRight,
    Download,
    File,
    FileArchive,
    FileAudio,
    FileImage,
    FileText,
    FileVideo,
    Folder,
    FolderPlus,
    FolderRoot,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

interface FolderNode {
    id: number;
    name: string;
    parent_id: number | null;
    children: FolderNode[];
}

interface FileNode {
    id: number;
    name: string;
    mime_type: string;
    url: string;
    size: string;
    created_at: string;
}

interface Props {
    folders: FolderNode[];
    currentFolderId: number | null;
    currentFolder: FolderNode | null;
    files: FileNode[];
}

function buildFolderTree(flat: FolderNode[]): (FolderNode & { children: FolderNode[] })[] {
    const map = new Map<number, FolderNode & { children: FolderNode[] }>();
    const roots: (FolderNode & { children: FolderNode[] })[] = [];

    flat.forEach((folder) => {
        map.set(folder.id, { ...folder, children: [] });
    });

    flat.forEach((folder) => {
        if (folder.parent_id) {
            const parent = map.get(folder.parent_id);
            if (parent) {
                parent.children.push(map.get(folder.id)!);
            }
        } else {
            roots.push(map.get(folder.id)!);
        }
    });

    return roots;
}

function getFileIcon(mime: string) {
    if (mime.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-500" />;
    if (mime.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-500" />;
    if (mime.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-pink-500" />;
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('7z'))
        return <FileArchive className="h-5 w-5 text-yellow-500" />;
    if (mime.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mime.includes('text') || mime.includes('csv') || mime.includes('json')) return <FileText className="h-5 w-5 text-green-500" />;
    if (mime.includes('word')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (mime.includes('excel') || mime.includes('sheet')) return <FileText className="h-5 w-5 text-green-600" />;
    if (mime.includes('powerpoint') || mime.includes('presentation')) return <FileText className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
}

function isPreviewable(mime: string) {
    return mime.startsWith('image/') || mime.startsWith('text/') || mime.includes('pdf') || mime.includes('document');
}

export default function FileManager({ folders, currentFolderId, currentFolder, files }: Props) {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [deleteFolderId, setDeleteFolderId] = useState<number | null>(null);
    const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const confirmDeleteFolder = () => {
        if (!deleteFolderId) return;

        const deletingCurrent = deleteFolderId === currentFolderId;

        router.delete(`/backend/media/${deleteFolderId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteFolderId(null);

                if (deletingCurrent) {
                    router.visit('/backend/files', { replace: true });
                } else {
                    router.reload({ only: ['folders'] });
                }
            },
        });
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }
        if (currentFolderId) formData.append('folder_id', currentFolderId.toString());

        setUploading(true);
        router.post('/backend/files', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (fileInputRef.current) fileInputRef.current.value = '';
                router.reload({ only: ['files'] });
            },
            onFinish: () => setUploading(false),
        });
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) {
            toast.error(t('notifications.folder.empty_name'));
            return;
        }

        setIsCreatingFolder(true);
        router.post(
            '/backend/media',
            {
                name: newFolderName,
                parent_id: currentFolderId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewFolderName('');
                    setIsCreatingFolder(false);
                    router.reload({ only: ['folders'] });
                },
                onError: () => {
                    setIsCreatingFolder(false);
                },
            },
        );
    };

    const renderFolderTree = (nodes: (FolderNode & { children: FolderNode[] })[], level = 0) => {
        return nodes.map((folder) => (
            <div key={folder.id} style={{ marginLeft: level * 12 }} className="mb-1">
                <div
                    className={`flex cursor-pointer items-center gap-1 rounded p-1 hover:bg-gray-100 ${currentFolderId === folder.id ? 'bg-gray-100' : ''}`}
                    onClick={() => router.visit(`/backend/files?folder_id=${folder.id}`)}
                >
                    {folder.children.length > 0 && <ChevronRight className="h-4 w-4 text-gray-500" />}
                    {folder.children.length === 0 && <span className="h-4 w-4"></span>}

                    <Folder className="h-4 w-4 text-yellow-500" />
                    <span className="flex-1 truncate text-sm">{folder.name}</span>

                    <AlertDialog>
                        <AlertDialogTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-500 hover:text-red-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteFolderId(folder.id);
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('dialog.delete.title')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('dialog.delete.description', { item: folder.name })}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDeleteFolder} className="bg-red-600 hover:bg-red-700">
                                    {t('buttons.delete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                {folder.children.length > 0 && <div className="ml-4">{renderFolderTree(folder.children, level + 1)}</div>}
            </div>
        ));
    };

    return (
        <AppLayout breadcrumbs={[{ title: t('pages.files.title'), href: '/backend/files' }]}>
            <Head title={t('pages.files.title')} />
            <div className="grid flex-1 grid-cols-1 gap-6 p-4 md:grid-cols-4 md:p-6">
                {/* Sidebar Folder Tree */}
                <div className="rounded-lg border p-4 md:col-span-1">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold">{t('pages.files.folderStructure')}</h2>
                        <Button variant="outline" size="sm" onClick={() => setIsCreatingFolder(true)} className="gap-1">
                            <FolderPlus className="h-4 w-4" />
                            <span>{t('buttons.create')}</span>
                        </Button>
                    </div>

                    <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                        <div
                            className={`mb-2 flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-100 ${!currentFolderId ? 'bg-gray-100' : ''}`}
                            onClick={() => router.visit('/backend/files')}
                        >
                            <FolderRoot className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{t('pages.files.rootFolder')}</span>
                        </div>
                        {renderFolderTree(buildFolderTree(folders ?? []))}
                    </div>
                </div>

                {/* Main Panel File View */}
                <div className="space-y-4 md:col-span-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">{currentFolder ? currentFolder.name : t('pages.files.rootFolder')}</h2>
                            {currentFolder && (
                                <span className="text-sm text-gray-500">
                                    ({files.length} {t(files.length === 1 ? 'pages.files.item' : 'pages.files.items')})
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Input ref={fileInputRef} type="file" onChange={handleUpload} disabled={uploading} className="hidden" multiple />
                            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                                <UploadCloud className="h-4 w-4" />
                                {uploading ? t('buttons.uploading') : t('buttons.upload')}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {files.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-gray-500">
                            <Folder className="mb-2 h-12 w-12" />
                            <p>{t('pages.files.emptyFolder')}</p>
                            <Button variant="ghost" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                                {t('buttons.upload')}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="group cursor-pointer rounded-lg border p-4 transition-colors hover:border-blue-500"
                                    onClick={() => (isPreviewable(file.mime_type) ? setPreviewFile(file) : null)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.mime_type)}
                                            <div className="overflow-hidden">
                                                <p className="truncate font-medium">{file.name}</p>
                                                <p className="text-xs text-gray-500">{file.size}</p>
                                                <p className="text-xs text-gray-500">{file.created_at}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <a
                                                href={file.url}
                                                download={file.name}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1 text-gray-500 hover:text-blue-500"
                                            >
                                                <Download className="h-4 w-4" />
                                            </a>
                                            <AlertDialog>
                                                <AlertDialogTrigger>
                                                    <button className="p-1 text-gray-500 hover:text-red-500" onClick={(e) => e.stopPropagation()}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('dialog.delete.title')}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t('dialog.delete.description', { item: file.name })}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                router.delete(`/backend/files/${file.id}`, {
                                                                    preserveScroll: true,
                                                                    onSuccess: () => {
                                                                        setPreviewFile(null);
                                                                        router.reload({ only: ['files'] });
                                                                    },
                                                                })
                                                            }
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            {t('buttons.delete')}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Folder Dialog */}
            <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('form.createTitle', { resource: t('labels.folder') })}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder={t('pages.files.folderNamePlaceholder')}
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCreatingFolder(false)}>
                                {t('buttons.cancel')}
                            </Button>
                            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                                {t('buttons.create')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* File Preview Dialog */}
            <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
                <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
                    {previewFile && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="truncate">{previewFile.name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-auto p-4">
                                {previewFile.mime_type.startsWith('image/') ? (
                                    <img src={previewFile.url} alt={previewFile.name} className="mx-auto max-h-[70vh] max-w-full object-contain" />
                                ) : previewFile.mime_type.includes('pdf') ? (
                                    <iframe src={previewFile.url} className="h-[70vh] w-full rounded border" title={previewFile.name} />
                                ) : previewFile.mime_type.startsWith('text/') ? (
                                    <div className="h-[70vh] overflow-auto rounded bg-gray-100 p-4">
                                        <pre className="whitespace-pre-wrap">{/* Content would be loaded here */}</pre>
                                    </div>
                                ) : (
                                    <div className="flex h-64 flex-col items-center justify-center text-gray-500">
                                        <File className="mb-2 h-12 w-12" />
                                        <p>{t('pages.files.previewNotAvailable')}</p>
                                        <a href={previewFile.url} download={previewFile.name} className="mt-2 text-blue-500 hover:underline">
                                            {t('pages.files.downloadFile')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
