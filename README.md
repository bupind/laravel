# LaraReact Admin Starter

Starter kit **Laravel 12 + React + Inertia + Tailwind + Shadcn UI** untuk aplikasi admin/manajemen data.

## Ringkasan

Project ini menyediakan fondasi backend + frontend modern dengan:

- Autentikasi dan otorisasi (Spatie Permission)
- UI admin berbasis React/Inertia
- Data table server-side (pagination, search, sort, export)
- Audit log
- Backup database

## Requirements

- PHP `>= 8.2`
- Composer
- Node.js `>= 18`
- NPM
- MySQL / MariaDB

## Instalasi

1. Install dependency backend

```bash
composer install
npm install
```

2. Siapkan environment

```bash
cp .env.example .env
php artisan key:generate
```

5. Konfigurasi database di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=larareact
DB_USERNAME=root
DB_PASSWORD=
```

6. Jalankan migrasi

```bash
php artisan migrate
```

7. Jalankan aplikasi

```bash
php artisan serve
npm run dev
php artisan config:clear
php artisan storage:link
```

## Build Production

```bash
npm run build
```

