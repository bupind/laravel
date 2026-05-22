<?php
/**
 * ImportProductsCsvJob
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Jobs;

use App\Jobs\Base\BaseQueueJob;
use App\Models\Product;
use App\Models\User;
use App\Notifications\DatabaseNotification;
use App\Support\Queues\QueueName;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Throwable;

class ImportProductsCsvJob extends BaseQueueJob
{
    private const HEADERS = [
        'name',
        'sku',
        'description',
        'price',
        'stock',
        'status',
        'media_id',
    ];

    public function __construct(
        private readonly string $path,
        private readonly string $userId,
    )
    {
        $this->onQueue(QueueName::IMPORT);
    }

    public function handle(): void
    {
        $user = $this->user();
        try {
            [
                $rows,
                $errors
            ] = $this->validatedRows();
            if($errors !== []) {
                $this->notify($user, 'error', 'Import produk gagal', 'Tidak ada data disimpan karena CSV masih memiliki error.', [
                    'errors'      => $errors,
                    'error_count' => count($errors),
                ]);
                return;
            }
            DB::transaction(function() use ($rows): void {
                foreach($rows as $row) {
                    Product::create($row);
                }
            });
            $this->notify($user, 'success', 'Import produk selesai', count($rows) . ' produk berhasil diimport.', [
                'imported' => count($rows),
            ]);
        } finally {
            Storage::disk('local')->delete($this->path);
        }
    }

    public function failed(Throwable $exception): void
    {
        parent::failed($exception);
        $this->notify($this->user(), 'error', 'Import produk error', 'Tidak ada data disimpan. ' . $exception->getMessage(), [
            'errors'      => [$exception->getMessage()],
            'error_count' => 1,
        ]);
        Storage::disk('local')->delete($this->path);
    }

    private function validatedRows(): array
    {
        $handle = Storage::disk('local')->readStream($this->path);
        if($handle === false) {
            return [
                [],
                ['File import tidak bisa dibaca.'],
            ];
        }
        $header = fgetcsv($handle);
        $header = is_array($header) ? $this->normalizeHeader($header) : [];
        if($header !== self::HEADERS) {
            fclose($handle);
            return [
                [],
                ['Header CSV harus: ' . implode(',', self::HEADERS)],
            ];
        }
        $rows      = [];
        $errors    = [];
        $rowNumber = 1;
        $skuRows   = [];
        while(($columns = fgetcsv($handle)) !== false) {
            $rowNumber++;
            if($this->isEmptyRow($columns)) {
                continue;
            }
            if(count($columns) !== count(self::HEADERS)) {
                $errors[] = "Baris {$rowNumber}: jumlah kolom tidak sesuai template.";
                continue;
            }
            $row       = $this->normalizeRow(array_combine(self::HEADERS, $columns), $rowNumber);
            $validator = Validator::make($row, $this->rowRules());
            if($validator->fails()) {
                foreach($validator->errors()->all() as $message) {
                    $errors[] = "Baris {$rowNumber}: {$message}";
                }
            }
            $skuKey             = mb_strtolower((string)$row['sku']);
            $skuRows[$skuKey][] = $rowNumber;
            $rows[]             = $row;
        }
        fclose($handle);
        if($rows === []) {
            $errors[] = 'CSV tidak memiliki data produk.';
        }
        foreach($skuRows as $sku => $lineNumbers) {
            if($sku !== '' && count($lineNumbers) > 1) {
                $errors[] = 'SKU duplikat di CSV pada baris: ' . implode(', ', $lineNumbers);
            }
        }
        $existingSkus = Product::query()
            ->whereIn('sku', array_column($rows, 'sku'))
            ->pluck('sku')
            ->all();
        foreach($existingSkus as $sku) {
            $errors[] = "SKU {$sku} sudah ada di database.";
        }
        return [
            $errors === [] ? $rows : [],
            $errors,
        ];
    }

    private function normalizeHeader(array $header): array
    {
        return array_map(
            fn(string $value): string => mb_strtolower(trim($this->removeBom($value))),
            $header,
        );
    }

    private function normalizeRow(array $row, int $rowNumber): array
    {
        return [
            'name'        => trim((string)$row['name']),
            'sku'         => trim((string)$row['sku']),
            'description' => trim((string)$row['description']) !== '' ? trim((string)$row['description']) : null,
            'price'       => trim((string)$row['price']),
            'stock'       => trim((string)$row['stock']),
            'status'      => mb_strtolower(trim((string)$row['status'])),
            'media_id'    => trim((string)$row['media_id']) !== '' ? trim((string)$row['media_id']) : null,
        ];
    }

    private function rowRules(): array
    {
        return [
            'name'        => [
                'required',
                'string',
                'max:255'
            ],
            'sku'         => [
                'required',
                'string',
                'max:100'
            ],
            'description' => [
                'nullable',
                'string'
            ],
            'price'       => [
                'required',
                'numeric',
                'min:0'
            ],
            'stock'       => [
                'required',
                'integer',
                'min:0'
            ],
            'status'      => [
                'required',
                Rule::in(Product::statuses())
            ],
            'media_id'    => [
                'nullable',
                'uuid',
                'exists:media,id'
            ],
        ];
    }

    private function isEmptyRow(array $columns): bool
    {
        return collect($columns)->every(fn(mixed $value): bool => trim((string)$value) === '');
    }

    private function removeBom(string $value): string
    {
        return preg_replace('/^\xEF\xBB\xBF/', '', $value) ?? $value;
    }

    private function user(): ?User
    {
        return User::query()->find($this->userId);
    }

    private function notify(?User $user, string $status, string $title, string $message, array $meta = []): void
    {
        $user?->notify(DatabaseNotification::make($status, $title, $message, $meta));
    }
}
