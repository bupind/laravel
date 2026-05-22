<?php

namespace App\Console\Commands;

use App\Services\Translations\TranslationSyncService;
use Illuminate\Console\Command;

class SyncTranslations extends Command
{
    protected $signature = 'translations:sync {--dry-run : Show changes without writing to database} {--keep-unused : Keep unused translation rows}';
    protected $description = 'Scan source translation keys, add missing rows, and delete unused rows.';

    public function handle(TranslationSyncService $syncService): int
    {
        $result = $syncService->sync(
            deleteUnused: !$this->option('keep-unused'),
            dryRun      : (bool)$this->option('dry-run'),
        );
        $this->info('Translations sync complete.');
        $this->table([
            'Scanned keys',
            'Added rows',
            'Deleted rows',
            'Kept rows',
            'Dry run',
        ], [
            [
                $result['scanned'],
                $result['added'],
                $result['deleted'],
                $result['kept'],
                $result['dry_run'] ? 'yes' : 'no',
            ]
        ]);
        return self::SUCCESS;
    }
}
