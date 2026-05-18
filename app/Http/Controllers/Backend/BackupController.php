<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class BackupController extends Controller
{
    protected function backupDisk(): string
    {
        return (string) (config('backup.backup.destination.disks.0') ?? config('filesystems.default', 'local'));
    }

    protected function backupDirectory(): string
    {
        return trim((string) config('backup.backup.name', config('app.name', 'laravel-backup')), '/');
    }

    protected function sanitizeFileName(string $file): string
    {
        return basename($file);
    }

    public function index(): Response
    {
        $diskName = $this->backupDisk();
        $directory = $this->backupDirectory();
        $disk = Storage::disk($diskName);
        $files = $disk->exists($directory) ? $disk->files($directory) : [];

        $backups = collect($files)
            ->filter(fn(string $path) => str_ends_with(strtolower($path), '.zip'))
            ->map(function (string $path) use ($disk) {
                $fileName = basename($path);

                return [
                    'name' => $fileName,
                    'size' => $disk->size($path),
                    'last_modified' => $disk->lastModified($path),
                    'download_url' => route('backup.download', ['file' => $fileName]),
                ];
            })
            ->sortByDesc('last_modified')
            ->values();

        return Inertia::render('backend/backup/Index', [
            'backups' => $backups,
        ]);
    }

    public function run(): RedirectResponse
    {
        try {
            $exitCode = Artisan::call('backup:run', [
                '--only-db' => true,
                '--disable-notifications' => true,
            ]);

            if ($exitCode !== 0) {
                $message = trim(Artisan::output());

                return redirect()->back()->with(
                    'error',
                    $this->flashMessage(
                        $message !== '' ? 'notifications.backup.failed_with_reason' : 'notifications.backup.failed',
                        ['message' => $message]
                    )
                );
            }

            return redirect()->back()->with('success', $this->flashMessage('notifications.backup.created'));
        } catch (Throwable $exception) {
            report($exception);

            return redirect()->back()->with(
                'error',
                $this->flashMessage('notifications.backup.failed_with_reason', ['message' => $exception->getMessage()])
            );
        }
    }

    public function download(string $file)
    {
        $fileName = $this->sanitizeFileName($file);
        if ($fileName === '') {
            abort(404, 'File tidak ditemukan.');
        }

        $disk = Storage::disk($this->backupDisk());
        $path = $this->backupDirectory() . '/' . $fileName;

        if (!$disk->exists($path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return $disk->download($path, $fileName);
    }

    public function delete(string $file): RedirectResponse
    {
        $fileName = $this->sanitizeFileName($file);
        if ($fileName === '') {
            return redirect()->back()->with('error', $this->flashMessage('notifications.common.file_not_found'));
        }

        $disk = Storage::disk($this->backupDisk());
        $path = $this->backupDirectory() . '/' . $fileName;

        if (!$disk->exists($path)) {
            return redirect()->back()->with('error', $this->flashMessage('notifications.common.file_not_found'));
        }

        $disk->delete($path);

        return redirect()->back()->with('success', $this->flashMessage('notifications.backup.deleted'));
    }
}



