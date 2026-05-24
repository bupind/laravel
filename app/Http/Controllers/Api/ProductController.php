<?php
/**
 * ProductController
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Support\Api\Filters\ContentTypeFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends BaseResourceController
{
    protected int    $perPage           = 10;
    protected array  $searchableColumns = [
        'name',
        'sku',
        'description',
    ];
    protected array  $sortableColumns   = [
        'name',
        'sku',
        'price',
        'stock',
        'status',
        'created_at',
    ];
    protected string $orderBy           = 'created_at';

    public function behaviors(): array
    {
        $behaviors                        = parent::behaviors();
        $behaviors['content-type-filter'] = [
            'class'       => ContentTypeFilter::class,
            'contentType' => ContentTypeFilter::TYPE_APPLICATION_JSON,
            'only'        => [
                'store',
                'update',
                'change-status',
                'list-filter',
            ],
        ];
        return $behaviors;
    }

    public function index(Request $request): JsonResponse
    {
        $rows = $this->makeQuery($request)
            ->paginate($this->resolvedPerPage($request))
            ->withQueryString();
        return $this->respondList(
            $this->listName(),
            $rows,
            'Products successfully loaded.',
        );
    }

    protected function listName(): string
    {
        return 'Product List';
    }

    public function listFilter(Request $request): JsonResponse
    {
        return $this->respond(
            'Product Filter',
            'Product filters successfully loaded.',
            10001,
            200,
            [
                'Statuses' => Product::statuses(),
                'SortBy'   => $this->sortableColumns,
            ],
        );
    }

    public function changeStatus(Request $request, Product $product): JsonResponse
    {
        $validated = $this->validatePayload($request, [
            'status' => [
                'required',
                Rule::in(Product::statuses()),
            ],
        ]);
        if($validated instanceof JsonResponse) {
            return $validated;
        }
        $product->update(['status' => $validated['status']]);
        return $this->respondUpdated(
            'Product Change Status',
            $product->refresh(),
            'Product status successfully changed.',
        );
    }

    protected function modelClass(): string
    {
        return Product::class;
    }

    protected function resourceName(): string
    {
        return 'Product';
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if($request->filled('status')) {
            $query->where('status', (string)$request->string('status'));
        }
    }

    protected function rules(Request $request, ?Model $record = null): array
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

    protected function formSchema(Request $request, ?Model $record = null): array
    {
        return [
            [
                'name'     => 'name',
                'type'     => 'text',
                'required' => true,
            ],
            [
                'name'     => 'sku',
                'type'     => 'text',
                'required' => true,
            ],
            [
                'name'     => 'media_id',
                'type'     => 'media',
                'required' => false,
            ],
            [
                'name'     => 'description',
                'type'     => 'textarea',
                'required' => false,
            ],
            [
                'name'     => 'price',
                'type'     => 'number',
                'required' => true,
            ],
            [
                'name'     => 'stock',
                'type'     => 'number',
                'required' => true,
            ],
            [
                'name'     => 'status',
                'type'     => 'select',
                'required' => true,
                'options'  => Product::statuses(),
            ],
        ];
    }
}
