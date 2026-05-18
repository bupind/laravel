import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'id' | 'en';
type Dictionary = Record<string, string>;
type Dictionaries = Record<Language, Dictionary>;

export const defaultDictionaries: Dictionaries = {
    id: {
        'language.label': 'Bahasa',
        'language.indonesian': 'Bahasa Indonesia',
        'language.english': 'English',
        'theme.toggle': 'Ubah tema',
        'theme.light': 'Terang',
        'theme.dark': 'Gelap',
        'theme.system': 'Sistem',
        'datatable.search': 'Cari...',
        'datatable.searchButton': 'Cari',
        'datatable.empty': 'Data tidak tersedia.',
        'datatable.page': 'halaman',
        'datatable.rowsPerPage': 'Baris per halaman',
        'datatable.of': 'dari',
        'datatable.refresh': 'Muat Ulang',
        'datatable.exportCurrent': 'Export Halaman Ini',
        'datatable.exportAll': 'Export Semua',
        'datatable.showing': 'Menampilkan :from-:to dari :total data.',
        'users.title': 'Manajemen User',
        'users.description': 'Kelola data user dan role di dalam sistem.',
        'users.add': 'Tambah User',
        'users.edit': 'Ubah User',
        'users.create': 'Tambah User',
        'users.updateDescription': 'Perbarui data user dan role.',
        'users.createDescription': 'Isi data user dan pilih role.',
        'users.user': 'User',
        'users.role': 'Role',
        'users.noRole': 'Belum ada role',
        'users.createdAt': 'Dibuat',
        'users.actions': 'Aksi',
        'users.registered': 'Terdaftar',
        'users.editAction': 'Ubah',
        'users.reset': 'Reset',
        'users.delete': 'Hapus',
        'users.resetTitle': 'Reset password?',
        'users.resetDescription': 'Password untuk :name akan direset menjadi:',
        'users.deleteTitle': 'Hapus user?',
        'users.deleteDescription': 'User :name akan dihapus permanen.',
        'users.cancel': 'Batal',
        'users.confirmReset': 'Ya, reset',
        'users.confirmDelete': 'Ya, hapus',
        'users.name': 'Nama',
        'users.fullName': 'Nama lengkap',
        'users.email': 'Email',
        'users.emailAddress': 'Alamat email',
        'users.password': 'Password',
        'users.optional': 'opsional',
        'users.save': 'Simpan Perubahan',
        'users.saving': 'Menyimpan...',
        'users.empty': 'Data user tidak tersedia.',
        'users.search': 'Cari nama atau email...',
        'notifications.common.created': 'Data berhasil dibuat.',
        'notifications.common.updated': 'Data berhasil diperbarui.',
        'notifications.common.deleted': 'Data berhasil dihapus.',
        'notifications.common.file_not_found': 'File tidak ditemukan.',
        'notifications.common.failed': 'Terjadi kesalahan.',
        'notifications.backup.created': 'Backup berhasil dibuat.',
        'notifications.backup.deleted': 'Backup berhasil dihapus.',
        'notifications.backup.failed': 'Backup gagal dijalankan.',
        'notifications.backup.failed_with_reason': 'Backup gagal: :message',
        'notifications.menu.created': 'Menu berhasil ditambahkan.',
        'notifications.menu.updated': 'Menu berhasil diperbarui.',
        'notifications.menu.deleted': 'Menu berhasil dihapus.',
        'notifications.menu.order_saved': 'Urutan menu berhasil disimpan.',
        'notifications.role.created': 'Role berhasil dibuat.',
        'notifications.role.updated': 'Role berhasil diperbarui.',
        'notifications.role.deleted': 'Role berhasil dihapus.',
        'notifications.permission.created': 'Permission berhasil dibuat.',
        'notifications.permission.updated': 'Permission berhasil diperbarui.',
        'notifications.permission.deleted': 'Permission berhasil dihapus.',
        'notifications.user.created': 'User berhasil dibuat.',
        'notifications.user.updated': 'User berhasil diperbarui.',
        'notifications.user.deleted': 'User berhasil dihapus.',
        'notifications.user.password_reset': 'Password berhasil direset ke default.',
        'notifications.folder.created': 'Folder berhasil dibuat.',
        'notifications.folder.deleted': 'Folder berhasil dihapus.',
        'notifications.file.uploaded': 'File berhasil diunggah.',
        'notifications.file.deleted': 'File berhasil dihapus.',
        'notifications.settings.saved': 'Pengaturan berhasil disimpan.',
        'notifications.blog.created': 'Blog berhasil dibuat.',
        'notifications.blog.updated': 'Blog berhasil diperbarui.',
        'notifications.blog.deleted': 'Blog berhasil dihapus.',
        'notifications.category.in_use': 'Kategori sedang digunakan blog dan tidak bisa dihapus.',
        'notifications.permission.delete_success': 'Permission berhasil dihapus.',
        'notifications.permission.delete_failed': 'Gagal menghapus permission.',
        'notifications.file.upload_failed': 'Gagal mengunggah file.',
        'notifications.file.delete_failed': 'Gagal menghapus file.',
        'notifications.folder.create_failed': 'Gagal membuat folder.',
        'notifications.folder.delete_failed': 'Gagal menghapus folder.',
        'notifications.folder.empty_name': 'Nama folder tidak boleh kosong.',
        'notifications.menu.delete_failed': 'Gagal menghapus menu.',
        'notifications.menu.order_save_failed': 'Gagal menyimpan urutan menu.',
        'notifications.menu.order_save_success': 'Urutan menu berhasil disimpan.',
        'notifications.backup.create_success': 'Backup berhasil dibuat.',
        'notifications.backup.create_failed': 'Gagal membuat backup.',
        'notifications.backup.delete_success': 'Backup berhasil dihapus.',
        'notifications.backup.delete_failed': 'Gagal menghapus backup.',
        'settings.translations.title': 'Pengaturan Terjemahan',
        'settings.translations.description': 'Ubah value terjemahan untuk Indonesia dan English.',
        'settings.translations.save': 'Simpan Terjemahan',
        'settings.translations.saved': 'Terjemahan berhasil disimpan.',
        'settings.translations.search': 'Cari key translation...',
        'settings.translations.key': 'Key',
        'settings.translations.indonesian': 'Bahasa Indonesia',
        'settings.translations.english': 'English',
    },
    en: {
        'language.label': 'Language',
        'language.indonesian': 'Indonesian',
        'language.english': 'English',
        'theme.toggle': 'Change theme',
        'theme.light': 'Light',
        'theme.dark': 'Dark',
        'theme.system': 'System',
        'datatable.search': 'Search...',
        'datatable.searchButton': 'Search',
        'datatable.empty': 'No data available.',
        'datatable.page': 'page',
        'datatable.rowsPerPage': 'Rows per page',
        'datatable.of': 'of',
        'datatable.refresh': 'Refresh',
        'datatable.exportCurrent': 'Export Current Page',
        'datatable.exportAll': 'Export All',
        'datatable.showing': 'Showing :from-:to of :total items.',
        'users.title': 'User Management',
        'users.description': 'Manage user data and roles in the system.',
        'users.add': 'Add User',
        'users.edit': 'Edit User',
        'users.create': 'Create User',
        'users.updateDescription': 'Update user data and roles.',
        'users.createDescription': 'Fill in user data and select roles.',
        'users.user': 'User',
        'users.role': 'Roles',
        'users.noRole': 'No role',
        'users.createdAt': 'Created At',
        'users.actions': 'Actions',
        'users.registered': 'Registered',
        'users.editAction': 'Edit',
        'users.reset': 'Reset',
        'users.delete': 'Delete',
        'users.resetTitle': 'Reset password?',
        'users.resetDescription': 'Password for :name will be reset to:',
        'users.deleteTitle': 'Delete user?',
        'users.deleteDescription': 'User :name will be permanently deleted.',
        'users.cancel': 'Cancel',
        'users.confirmReset': 'Yes, reset',
        'users.confirmDelete': 'Yes, delete',
        'users.name': 'Name',
        'users.fullName': 'Full name',
        'users.email': 'Email',
        'users.emailAddress': 'Email address',
        'users.password': 'Password',
        'users.optional': 'optional',
        'users.save': 'Save Changes',
        'users.saving': 'Saving...',
        'users.empty': 'No user data available.',
        'users.search': 'Search by name or email...',
        'notifications.common.created': 'Data created successfully.',
        'notifications.common.updated': 'Data updated successfully.',
        'notifications.common.deleted': 'Data deleted successfully.',
        'notifications.common.file_not_found': 'File not found.',
        'notifications.common.failed': 'Something went wrong.',
        'notifications.backup.created': 'Backup created successfully.',
        'notifications.backup.deleted': 'Backup deleted successfully.',
        'notifications.backup.failed': 'Backup failed to run.',
        'notifications.backup.failed_with_reason': 'Backup failed: :message',
        'notifications.menu.created': 'Menu created successfully.',
        'notifications.menu.updated': 'Menu updated successfully.',
        'notifications.menu.deleted': 'Menu deleted successfully.',
        'notifications.menu.order_saved': 'Menu order saved successfully.',
        'notifications.role.created': 'Role created successfully.',
        'notifications.role.updated': 'Role updated successfully.',
        'notifications.role.deleted': 'Role deleted successfully.',
        'notifications.permission.created': 'Permission created successfully.',
        'notifications.permission.updated': 'Permission updated successfully.',
        'notifications.permission.deleted': 'Permission deleted successfully.',
        'notifications.user.created': 'User created successfully.',
        'notifications.user.updated': 'User updated successfully.',
        'notifications.user.deleted': 'User deleted successfully.',
        'notifications.user.password_reset': 'Password reset to default successfully.',
        'notifications.folder.created': 'Folder created successfully.',
        'notifications.folder.deleted': 'Folder deleted successfully.',
        'notifications.file.uploaded': 'File uploaded successfully.',
        'notifications.file.deleted': 'File deleted successfully.',
        'notifications.settings.saved': 'Settings saved successfully.',
        'notifications.blog.created': 'Blog created successfully.',
        'notifications.blog.updated': 'Blog updated successfully.',
        'notifications.blog.deleted': 'Blog deleted successfully.',
        'notifications.category.in_use': 'Category is used by blogs and cannot be deleted.',
        'notifications.permission.delete_success': 'Permission deleted successfully.',
        'notifications.permission.delete_failed': 'Failed to delete permission.',
        'notifications.file.upload_failed': 'Failed to upload file.',
        'notifications.file.delete_failed': 'Failed to delete file.',
        'notifications.folder.create_failed': 'Failed to create folder.',
        'notifications.folder.delete_failed': 'Failed to delete folder.',
        'notifications.folder.empty_name': 'Folder name cannot be empty.',
        'notifications.menu.delete_failed': 'Failed to delete menu.',
        'notifications.menu.order_save_failed': 'Failed to save menu order.',
        'notifications.menu.order_save_success': 'Menu order saved successfully.',
        'notifications.backup.create_success': 'Backup created successfully.',
        'notifications.backup.create_failed': 'Failed to create backup.',
        'notifications.backup.delete_success': 'Backup deleted successfully.',
        'notifications.backup.delete_failed': 'Failed to delete backup.',
        'settings.translations.title': 'Translation Settings',
        'settings.translations.description': 'Update translation values for Indonesian and English.',
        'settings.translations.save': 'Save Translations',
        'settings.translations.saved': 'Translations saved successfully.',
        'settings.translations.search': 'Search translation key...',
        'settings.translations.key': 'Key',
        'settings.translations.indonesian': 'Indonesian',
        'settings.translations.english': 'English',
    },
};

interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
    dictionaries: Dictionaries;
    keys: string[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
    children,
    overrides,
}: {
    children: React.ReactNode;
    overrides?: Partial<Record<Language, Record<string, string>>>;
}) {
    const [language, setLanguageState] = useState<Language>('id');

    useEffect(() => {
        const saved = localStorage.getItem('language');

        if (saved === 'id' || saved === 'en') {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (nextLanguage: Language) => {
        setLanguageState(nextLanguage);
        localStorage.setItem('language', nextLanguage);
        document.documentElement.lang = nextLanguage;
    };

    const dictionaries = useMemo<Dictionaries>(() => ({
        id: {
            ...defaultDictionaries.id,
            ...(overrides?.id ?? {}),
        },
        en: {
            ...defaultDictionaries.en,
            ...(overrides?.en ?? {}),
        },
    }), [overrides]);

    const keys = useMemo(
        () => Array.from(new Set([...Object.keys(defaultDictionaries.id), ...Object.keys(defaultDictionaries.en)])).sort(),
        [],
    );

    const value = useMemo<LanguageContextValue>(() => ({
        language,
        setLanguage,
        dictionaries,
        keys,
        t: (key, replacements = {}) => {
            let text = dictionaries[language][key] ?? dictionaries.id[key] ?? key;

            Object.entries(replacements).forEach(([placeholder, value]) => {
                text = text.replace(`:${placeholder}`, String(value));
            });

            return text;
        },
    }), [language, dictionaries, keys]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useLanguage must be used inside LanguageProvider');
    }

    return context;
}
