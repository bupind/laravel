# LaraReact

Laravel 12 + React + Inertia

## Stack

- Laravel 12
- React + Inertia
- Tailwind CSS + shadcn/ui
- Spatie Permission
- Spatie Activity Log
- Media Library internal
- API credential

## Requirements

- PHP `>= 8.2`
- Composer
- Node.js `>= 18`
- NPM
- mySql

## Instalasi

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan storage:link
php artisan migrate --seed
```

Jalankan aplikasi:

```bash
php artisan serve
npm run dev
```

Build production:

```bash
npm run build
```

## API Client

Endpoint product API dilindungi middleware `api.client`. Request wajib mengirim header:

```http
X-Client-Key: client-key-dari-backend
X-Client-Secret: client-secret-dari-backend
Accept: application/json
Content-Type: application/json
```

# Contoh Membuat Modul Backend
1. Buat controller backend:

```php
namespace App\Http\Controllers\Backend;

use App\Models\Category;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class CategoryController extends BaseCrudController
{
    protected ?string $resourceRouteName = 'categories';
    protected ?string $resourceLabel = 'Categories';
    protected ?string $resourceTitle = 'Categories';
    protected string $orderBy = 'created_at';

    protected array $searchableColumns = ['name', 'slug'];
    protected array $sortableColumns = ['name', 'slug', 'status', 'created_at'];
    protected array $tableColumns = ['name', 'slug', 'status', ['key' => 'created_at', 'type' => 'datetime']];

    protected array $formFields = [
        ['name' => 'name', 'label' => 'Name', 'required' => true],
        ['name' => 'slug', 'label' => 'Slug', 'required' => true],
        ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => [
            ['value' => 'draft', 'label' => 'Draft'],
            ['value' => 'active', 'label' => 'Active'],
        ]],
    ];

    protected function modelClass(): string
    {
        return Category::class;
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($record?->getKey())],
            'status' => ['required', Rule::in(['draft', 'active'])],
        ];
    }
}
```

## Field Media di Backend

Untuk membuat field gambar/file yang memilih data dari media library, gunakan `media_id`:

```php
protected array $tableColumns = [
    'name',
    ['key' => 'image_url', 'label' => 'Image', 'type' => 'media'],
];

protected array $formFields = [
    ['name' => 'media_id', 'label' => 'Image', 'type' => 'media'],
];
```

## Contoh Membuat Modul API

1. Buat API controller yang extend `BaseResourceController`:

```php
namespace App\Http\Controllers\Api;

use App\Models\Category;use App\Support\Api\Filters\ContentTypeFilter;use Illuminate\Database\Eloquent\Model;use Illuminate\Http\JsonResponse;use Illuminate\Http\Request;use Illuminate\Validation\Rule;

class CategoryController extends BaseResourceController
{
    protected array $searchableColumns = ['name', 'slug'];
    protected array $sortableColumns = ['name', 'slug', 'status', 'created_at'];
    protected string $orderBy = 'created_at';

    public function behaviors(): array
    {
        $behaviors = parent::behaviors();
        $behaviors['content-type-filter'] = [
            'class' => ContentTypeFilter::class,
            'contentType' => [
                ContentTypeFilter::TYPE_APPLICATION_JSON,
                ContentTypeFilter::TYPE_MULTIPART_FORM_DATA,
            ],
            'only' => ['store', 'update', 'list-filter'],
        ];

        return $behaviors;
    }

    protected function modelClass(): string
    {
        return Category::class;
    }

    protected function resourceName(): string
    {
        return 'Category';
    }

    public function listFilter(Request $request): JsonResponse
    {
        return $this->respond(
            'Category Filter',
            'Category filters successfully loaded.',
            10001,
            200,
            [
                'Statuses' => ['draft', 'active'],
                'SortBy' => $this->sortableColumns,
            ],
        );
    }

    protected function rules(Request $request, ?Model $record = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($record?->getKey())],
            'status' => ['required', Rule::in(['draft', 'active'])],
        ];
    }

    protected function formSchema(Request $request, ?Model $record = null): array
    {
        return [
            ['name' => 'name', 'type' => 'text', 'required' => true],
            ['name' => 'slug', 'type' => 'text', 'required' => true],
            ['name' => 'status', 'type' => 'select', 'required' => true, 'options' => ['draft', 'active']],
        ];
    }
}
```
