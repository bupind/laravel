<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Queue job untuk export data ke Excel
 */
class ExportDataToExcel implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public int $timeout = 300;
    public int $retries = 2;

    public function __construct(
        private string $modelClass,
        private array $filters = [],
        private string $fileName = 'export.xlsx',
        private ?string $userEmail = null
    ) {
    }

    public function handle(): void
    {
        try {
            // Get data
            $query = $this->modelClass::query();

            // Apply filters
            foreach ($this->filters as $column => $value) {
                $query->where($column, $value);
            }

            $data = $query->get();

            // Export logic (implement your exporter)
            // Excel::store(new DataExport($data), $this->fileName);

            Log::info("Data exported successfully", [
                'file' => $this->fileName,
                'record_count' => count($data),
            ]);

            // Send notification if email provided
            if ($this->userEmail) {
                $url = Storage::disk('local')->url($this->fileName);
                // Send email with download link
            }
        } catch (\Exception $e) {
            Log::error("Export failed", [
                'file' => $this->fileName,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("ExportDataToExcel job failed", [
            'exception' => $exception->getMessage(),
            'file' => $this->fileName,
        ]);
    }
}
