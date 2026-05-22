<?php
/**
 * ProductController
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Http\Controllers\Backend;

use App\Jobs\ImportProductsCsvJob;
use App\Models\Product;
use App\Notifications\DatabaseNotification;
use App\Support\Queues\QueueName;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ProductController extends BaseCrudController
{
    protected bool    $useTransactions   = true;
    protected bool    $searchPrefix      = true;
    protected ?string $resourceRouteName = 'products';
    protected ?string $resourceLabel     = 'Products';
    protected ?string $resourceTitle     = 'Products';
    protected string  $orderBy           = 'created_at';
    protected array   $with              = ['media'];
    protected array   $searchableColumns = [
        'name',
        'sku',
        'description',
    ];
    protected array   $sortableColumns   = [
        'name',
        'sku',
        'price',
        'stock',
        'status',
        'created_at',
    ];
    protected array   $tableColumns      = [
        'name',
        'sku',
        [
            'key'   => 'image_url',
            'label' => 'Image',
            'type'  => 'media',
        ],
        [
            'key'   => 'price',
            'label' => 'Price',
            'type'  => 'number',
        ],
        [
            'key'   => 'stock',
            'label' => 'Stock',
            'type'  => 'number',
        ],
        'status',
        [
            'key'   => 'created_at',
            'label' => 'Created At',
            'type'  => 'datetime',
        ],
    ];
    protected array   $formFields        = [
        [
            'name'     => 'name',
            'label'    => 'Name',
            'required' => true,
        ],
        [
            'name'     => 'sku',
            'label'    => 'SKU',
            'required' => true,
        ],
        [
            'name'  => 'media_id',
            'label' => 'Image',
            'type'  => 'media',
        ],
        [
            'name'  => 'description',
            'label' => 'Description',
            'type'  => 'textarea',
        ],
        [
            'name'    => 'price',
            'label'   => 'Price',
            'type'    => 'number',
            'default' => 0,
        ],
        [
            'name'    => 'stock',
            'label'   => 'Stock',
            'type'    => 'number',
            'default' => 0,
        ],
        [
            'name'    => 'status',
            'label'   => 'Status',
            'type'    => 'select',
            'default' => Product::STATUS_DRAFT,
            'options' => [
                [
                    'value' => Product::STATUS_DRAFT,
                    'label' => 'Draft',
                ],
                [
                    'value' => Product::STATUS_ACTIVE,
                    'label' => 'Active',
                ],
                [
                    'value' => Product::STATUS_INACTIVE,
                    'label' => 'Inactive',
                ],
            ],
        ],
    ];

    protected function modelClass(): string
    {
        return Product::class;
    }

    public function importTemplate(): StreamedResponse
    {
        $this->authorize('create');

        return response()->streamDownload(function(): void {
            $output = fopen('php://output', 'w');

            if($output === false) {
                return;
            }

            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, [
                'name',
                'sku',
                'description',
                'price',
                'stock',
                'status',
                'media_id',
            ]);
            fclose($output);
        }, 'products_import_template.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorize('create');

        $validated = $request->validate([
            'csv_content' => [
                'required_without:file',
                'string',
                'max:5242880',
            ],
            'filename'    => [
                'nullable',
                'string',
                'max:255',
            ],
            'file'        => [
                'required_without:csv_content',
                'file',
                'mimes:csv,txt',
                'max:5120',
            ],
        ]);

        try {
            if($request->filled('csv_content')) {
                $path    = 'imports/products/' . Str::uuid() . '.csv';
                $written = Storage::disk('local')->put($path, (string)$validated['csv_content']);

                if(!$written) {
                    $this->notifyImportError(
                        $request,
                        'Upload import produk gagal',
                        'Content CSV gagal disimpan sebelum masuk queue.'
                    );

                    return $this->redirectToIndex('Upload import gagal. Detailnya sudah masuk ke inbox notifikasi.', $request);
                }
            } else {
                $file = $request->file('file');

                if($file === null || !$file->isValid() || !$file->getRealPath()) {
                    $this->notifyImportError(
                        $request,
                        'Upload import produk gagal',
                        'File CSV tidak bisa dibaca dari temporary upload. Upload akan lebih stabil jika browser mengirim content CSV langsung.'
                    );

                    return $this->redirectToIndex('Upload import gagal. Detailnya sudah masuk ke inbox notifikasi.', $request);
                }

                $path = $file->store('imports/products');
            }
        } catch(Throwable $exception) {
            $this->notifyImportError(
                $request,
                'Upload import produk error',
                'File CSV gagal disimpan sebelum masuk queue. ' . $exception->getMessage()
            );

            return $this->redirectToIndex('Upload import gagal. Detailnya sudah masuk ke inbox notifikasi.', $request);
        }

        ImportProductsCsvJob::dispatch($path, (string)$request->user()->getKey())
            ->onQueue(QueueName::IMPORT);

        return $this->redirectToIndex('Import produk sedang diproses. Hasilnya akan masuk ke notifikasi.', $request);
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'name'        => [
                'required',
                'string',
                'max:255',
            ],
            'sku'         => [
                'required',
                'string',
                'max:100',
                Rule::unique('products', 'sku')->ignore($record?->getKey()),
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'media_id'    => [
                'nullable',
                'uuid',
                'exists:media,id',
            ],
            'price'       => [
                'required',
                'numeric',
                'min:0',
            ],
            'stock'       => [
                'required',
                'integer',
                'min:0',
            ],
            'status'      => [
                'required',
                Rule::in(Product::statuses()),
            ],
        ];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if($request->filled('status')) {
            $query->where('status', (string)$request->string('status'));
        }
    }

    protected function resourceMetadata(Request $request): array
    {
        $metadata = parent::resourceMetadata($request);

        $metadata['routes']['import']          = $this->routePath('products.import');
        $metadata['routes']['import_template'] = $this->routePath('products.import-template');

        return $metadata;
    }

    private function notifyImportError(Request $request, string $title, string $message): void
    {
        $request->user()?->notify(DatabaseNotification::error($title, $message, [
            'errors'      => [$message],
            'error_count' => 1,
        ]));
    }
}
