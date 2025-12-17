<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Maatwebsite\Excel\Facades\Excel;

class ImportBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public function __construct(
        public string $path,
        public string $importClass
    )
    {
    }

    public function handle(): void
    {
        Excel::queueImport(
            new $this->importClass,
            $this->path,
            'public'
        );
    }
}
