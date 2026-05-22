<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

/**
 * BaseCrudController
 *
 * ============================================================================
 * CARA PAKAI
 * ============================================================================
 *
 * 1. Buat controller baru dan implement modelClass():
 *
 *    class ProductController extends BaseCrudController
 *    {
 *        protected function modelClass(): string { return Product::class; }
 *    }
 *
 * 2. Daftarkan di routes/backend.php:
 *
 *    Route::resource('products', ProductController::class);
 *    Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
 *
 * ============================================================================
 * FITUR BAWAAN
 * ============================================================================
 *
 *  ✅  CRUD lengkap       — index, create, store, edit, update, destroy
 *  ✅  Permission         — view, create, update, delete, export (auto-check)
 *  ✅  Validasi           — rules(), storeRules(), updateRules()
 *  ✅  Lifecycle hooks    — before/after per operasi CRUD + custom action
 *  ✅  Pagination         — per_page configurable, whitelist-safe
 *  ✅  Search             — multi-kolom, mode contains/prefix
 *  ✅  Sorting            — multi-kolom, alias map, whitelist
 *  ✅  Export CSV         — scope all/current, UTF-8 BOM, cursor-based
 *  ✅  DB Transaction     — opsional, wrap store/update/destroy
 *  ✅  Auto Slug          — generate slug unik dari kolom sumber
 *  ✅  Modal / Page       — form sebagai modal atau halaman terpisah
 *  ✅  Inertia            — integrasi native, props terstruktur
 *  ✅  Flash message      — i18n-ready via __()
 *  ✅  Query preservation — filter/sort/page dipertahankan saat redirect
 *
 * ============================================================================
 * KUSTOMISASI CEPAT
 * ============================================================================
 *
 * Override property:
 *   protected bool   $modal             = false;
 *   protected array  $searchableColumns = ['name', 'email'];
 *   protected int    $perPage           = 25;
 *   protected bool   $useTransactions   = true;
 *
 * Override method:
 *   protected function rules(?Model $record = null): array { ... }
 *   protected function beforeStore(array $validated, Request $request): array { ... }
 *   protected function afterStore(Model $record, array $validated, Request $request): void { ... }
 *   protected function additionalIndexProps(Request $request): array { ... }
 *   protected function additionalFormProps(Request $request, ?Model $record = null): array { ... }
 *   protected function applyFilters(Builder $query, Request $request): void { ... }
 *
 * Custom action (di luar CRUD standar):
 *   public function approve(Request $request, mixed $id): RedirectResponse
 *   {
 *       return $this->recordAction(
 *           $request, $id, 'approve',
 *           fn (Model $r) => $r->update(['status' => 'approved']),
 *           'notifications.product.approved',
 *       );
 *   }
 *
 * Nested resource:
 *   protected function indexRouteParameters(?Request $request = null): array
 *   {
 *       return ['category' => $request?->route('category')];
 *   }
 */
abstract class BaseCrudController extends Controller
{
    // =========================================================================
    // Static cache
    // =========================================================================
    /** @var array<string, string[]> Cache kolom schema per tabel */
    protected static array $schemaColumnsCache = [];
    // =========================================================================
    // Tampilan
    // =========================================================================
    /**
     * true  → form tampil sebagai Dialog modal di atas halaman index.
     * false → form tampil sebagai halaman terpisah (create/edit page).
     */
    protected bool $modal = true;
    /** Komponen Inertia default untuk index dan form (generic CRUD view). */
    protected ?string $componentName = 'backend/crud/Index';
    /** Override komponen khusus untuk halaman index saja. */
    protected ?string $indexComponentName = null;
    /** Override komponen khusus untuk halaman form create/edit saja. */
    protected ?string $formComponentName = null;
    // =========================================================================
    // Resource
    // =========================================================================
    /**
     * Nama route resource (plural, kebab-case).
     * Default: otomatis dari nama model. ProductCategory → 'product-categories'.
     */
    protected ?string $resourceRouteName = null;
    /**
     * Label human-readable resource.
     * Default: dari routeName(). 'product-categories' → 'Product Categories'.
     */
    protected ?string $resourceLabel = null;
    /**
     * Judul halaman (<title> dan breadcrumb).
     * Default: sama dengan resourceLabel.
     */
    protected ?string $resourceTitle = null;
    // =========================================================================
    // Permission
    // =========================================================================
    /**
     * Prefix permission.
     * Default: dari routeName().
     * Konvensi: '{prefix}-view', '{prefix}-create', '{prefix}-update',
     *           '{prefix}-delete', '{prefix}-export'.
     *
     * Set null untuk menonaktifkan auto-check (kelola sendiri di controller turunan).
     */
    protected ?string $permissionPrefix = null;
    /**
     * Override nama permission per action.
     *
     * @example
     *   protected array $permissionMap = [
     *       'export' => 'admin-export-data',
     *   ];
     */
    protected array $permissionMap = [];
    // =========================================================================
    // Query
    // =========================================================================
    /**
     * Kolom yang di-SELECT. Kosong = SELECT *.
     *
     * @example ['id', 'name', 'email', 'created_at']
     */
    protected array $select = [];
    /**
     * Relasi yang di-eager load.
     *
     * @example ['roles:id,name', 'category:id,name']
     */
    protected array $with = [];
    /**
     * Relasi yang dihitung jumlahnya (withCount).
     * Tersedia sebagai kolom `{relation}_count`.
     *
     * @example ['posts', 'comments']
     */
    protected array $withCount = [];
    protected int   $perPage   = 10;
    /**
     * Pilihan baris yang bisa dipilih user.
     * Nilai di luar daftar ini akan di-ignore.
     *
     * @var int[]
     */
    protected array $perPageOptions = [
        10,
        25,
        50,
        100
    ];
    /**
     * Kolom yang ikut dicari (?search=). Pencarian OR.
     *
     * @example ['name', 'email', 'phone']
     */
    protected array $searchableColumns = [];
    /**
     * Mode pencarian:
     *   false → '%keyword%'  (contains, default)
     *   true  → 'keyword%'   (prefix, lebih cepat untuk kolom berindeks)
     */
    protected bool $searchPrefix = true;
    /**
     * @example ['name', 'created_at', 'status']
     */
    protected array $sortableColumns = [];
    /**
     * Kolom yang dikecualikan dari auto-detect sortable.
     *
     * @example ['password', 'remember_token']
     */
    protected array $excludeSortableColumns = [];
    /**
     * Alias kolom sort → kolom DB aktual.
     * Berguna untuk sort berdasarkan kolom JOIN atau relasi.
     *
     * @example ['category_name' => 'categories.name']
     */
    protected array $sortColumnMap = [];
    /** Kolom sort default. */
    protected string $orderBy = 'id';
    /** Arah sort default. */
    protected string $orderDirection = 'desc';
    // =========================================================================
    // Kolom Tabel (UI)
    // =========================================================================
    /**
     * Definisi kolom tabel. Bisa string sederhana atau array lengkap.
     * Kosong = auto-detect dari schema dikurangi $excludeTableColumns.
     *
     * @example
     *   // Sederhana
     *   protected array $tableColumns = ['name', 'email', 'created_at'];
     *
     *   // Lengkap
     *   protected array $tableColumns = [
     *       ['key' => 'name',       'label' => 'Nama',   'sortable' => true],
     *       ['key' => 'created_at', 'label' => 'Dibuat', 'type' => 'datetime'],
     *   ];
     */
    protected array $tableColumns = [];
    /**
     * Kolom yang dikecualikan dari tabel auto-detect.
     * Tidak berlaku jika $tableColumns di-set eksplisit.
     */
    protected array $excludeTableColumns = [
        'deleted_at',
        'updated_at'
    ];
    // =========================================================================
    // Form Fields
    // =========================================================================
    /**
     * Definisi field form. Bisa string sederhana atau array lengkap.
     * Kosong = auto-detect dari schema dikurangi $excludeFormFields.
     *
     * @example
     *   // Sederhana
     *   protected array $formFields = ['name', 'email', 'description'];
     *
     *   // Lengkap
     *   protected array $formFields = [
     *       ['name' => 'name',   'label' => 'Nama',  'required' => true],
     *       ['name' => 'status', 'type'  => 'select', 'options' => [
     *           ['value' => 'active',   'label' => 'Active'],
     *           ['value' => 'inactive', 'label' => 'Inactive'],
     *       ]],
     *   ];
     */
    protected array $formFields = [];
    /**
     * Field yang dikecualikan dari form auto-detect.
     * Tidak berlaku jika $formFields di-set eksplisit.
     */
    protected array $excludeFormFields = [
        'id',
        'created_at',
        'updated_at',
        'deleted_at'
    ];
    // =========================================================================
    // Export CSV
    // =========================================================================
    /**
     * Kolom yang di-export. Kosong = semua kolom schema.
     *
     * @example ['id', 'name', 'email', 'created_at']
     */
    protected array $exportColumns = [];
    /**
     * Kolom yang dikecualikan dari export.
     *
     * @example ['password', 'remember_token']
     */
    protected array $excludeExportColumns = [];
    /**
     * Override label header kolom di CSV.
     *
     * @example ['created_at' => 'Tanggal Dibuat']
     */
    protected array $exportColumnLabels = [];
    // =========================================================================
    // Auto Slug
    // =========================================================================
    /**
     * Kolom sumber slug. null = fitur dinonaktifkan.
     * Membutuhkan method resolveUniqueSlug() di controller turunan.
     *
     * @example 'name'  → slug di-generate dari nilai kolom `name`
     */
    protected ?string $slugSourceColumn = null;
    /** Nama kolom slug di database. */
    protected string $slugColumn = 'slug';
    // =========================================================================
    // DB Transaction
    // =========================================================================
    /**
     * Bungkus store/update/destroy dalam DB transaction.
     * Aktifkan jika satu action melibatkan lebih dari satu operasi DB.
     */
    protected bool $useTransactions = false;
    // =========================================================================
    // Abstract
    // =========================================================================
    /**
     * GET /resources
     *
     * Halaman daftar dengan pagination, search, dan sorting.
     *
     * @permission view
     */
    public function index(Request $request): Response
    {
        $this->authorize('view');
        return Inertia::render($this->indexComponent(), $this->indexPayload($request));
    }

    // =========================================================================
    // Permission
    // =========================================================================
    /**
     * Authorize action — abort(403) jika user tidak punya permission.
     *
     * @throws AuthorizationException
     */
    protected function authorize(string $action, mixed $record = null): void
    {
        if(!$this->userCan($action)) {
            abort(403, "Unauthorized: {$this->permission($action)}");
        }
    }

    /**
     * Cek apakah user memiliki permission tertentu.
     * Kompatibel dengan: Spatie laravel-permission, Laravel Gate, method can().
     *
     * Spatie melempar PermissionDoesNotExist jika permission belum ada di DB.
     * Di sini kita tangkap exception tersebut dan kembalikan false — lebih aman
     * daripada crash, terutama untuk permission opsional seperti 'export'.
     */
    protected function userCan(string $action): bool
    {
        $name = $this->permission($action);
        try {
            if(Gate::has($name)) {
                return Gate::allows($name);
            }
            $user = request()->user();
            if($user === null) {
                return false;
            }
            if(method_exists($user, 'hasPermissionTo')) {
                return $user->hasPermissionTo($name);
            }
            return method_exists($user, 'can') && $user->can($name);
        } catch(Throwable) {
            // Permission tidak ada di DB (misal Spatie PermissionDoesNotExist)
            // → anggap tidak punya permission, jangan crash
            return false;
        }
    }

    /**
     * Nama permission penuh untuk suatu action.
     * Override via $permissionMap untuk nama kustom.
     */
    protected function permission(string $action): string
    {
        return $this->permissionMap[$action] ?? ($this->resolvedPermissionPrefix() . '-' . $action);
    }

    /** Prefix permission aktif. Fallback ke routeName(). */
    protected function resolvedPermissionPrefix(): string
    {
        return $this->permissionPrefix ?? $this->routeName();
    }

    // =========================================================================
    // Routing
    // =========================================================================
    /**
     * Nama resource route (plural, kebab-case).
     * Contoh: ProductCategory → 'product-categories'.
     */
    protected function routeName(): string
    {
        return $this->resourceRouteName
               ?? Str::plural(Str::kebab(class_basename($this->modelClass())));
    }

    /**
     * Kembalikan FQCN model Eloquent yang dikelola.
     *
     * @return class-string<Model>
     *
     * @example return Product::class;
     */
    abstract protected function modelClass(): string;

    protected function indexComponent(): string
    {
        return $this->indexComponentName ?? $this->componentName();
    }

    protected function componentName(): string
    {
        return $this->componentName ?? 'backend/crud/Index';
    }

    /**
     * Payload utama untuk halaman index:
     *   {resourceName} → paginated collection
     *   filters        → filter aktif
     *   datatable      → config UI tabel
     *   crud           → metadata CRUD (permissions, routes, kolom, form schema)
     *   ...additionalIndexProps()
     */
    protected function indexPayload(Request $request): array
    {
        return array_merge([
            $this->collectionProp() => $this->indexCollection($request),
            'filters'               => $this->filters($request),
            'datatable'             => $this->datatablePayload($request),
            'crud'                  => $this->crudIndexPayload($request),
        ], $this->additionalIndexProps($request));
    }

    /** Key prop koleksi di Inertia (= routeName). */
    protected function collectionProp(): string
    {
        return $this->routeName();
    }

    // =========================================================================
    // CRUD Actions
    // =========================================================================

    /** Jalankan query dan kembalikan paginated collection. */
    protected function indexCollection(Request $request): mixed
    {
        return $this->makeQuery($request)
            ->paginate($this->resolvedPerPage($request))
            ->withQueryString();
    }

    /**
     * Bangun Eloquent Builder dengan semua konfigurasi.
     * Override untuk query sangat kustom,
     * atau override applyFilters() untuk tambahan WHERE.
     */
    protected function makeQuery(Request $request): Builder
    {
        /** @var class-string<Model> $modelClass */
        $modelClass = $this->modelClass();
        $query      = $modelClass::query();
        if($this->with !== []) {
            $query->with($this->with);
        }
        if($this->withCount !== []) {
            $query->withCount($this->withCount);
        }
        if($this->select !== []) {
            $query->select($this->select);
        }
        $this->applyFilters($query, $request);
        $this->applySearch($query, $request);
        $this->applySorting($query, $request);
        return $query;
    }

    /**
     * Override untuk menambahkan filter kustom.
     *
     * @example
     *   protected function applyFilters(Builder $query, Request $request): void
     *   {
     *       if ($status = $request->string('status')->toString()) {
     *           $query->where('status', $status);
     *       }
     *   }
     */
    protected function applyFilters(Builder $query, Request $request): void
    {
        // Implementasi di controller turunan
    }

    protected function applySearch(Builder $query, Request $request): void
    {
        $search = trim((string)$request->string('search'));
        if($search === '' || $this->searchableColumns === []) {
            return;
        }
        $pattern = $this->searchPrefix ? $search . '%' : '%' . $search . '%';
        $query->where(function(Builder $builder) use ($pattern): void {
            foreach($this->searchableColumns as $column) {
                $builder->orWhere($column, 'like', $pattern);
            }
        });
    }

    protected function applySorting(Builder $query, Request $request): void
    {
        $sortableColumns = $this->resolvedSortableColumns();
        $sortBy          = (string)$request->string('sort_by', $this->orderBy);
        // Fallback ke default jika kolom tidak ada di whitelist
        if(!in_array($sortBy, $sortableColumns, true)) {
            $sortBy = in_array($this->orderBy, $sortableColumns, true)
                ? $this->orderBy
                : ($sortableColumns[0] ?? '');
        }
        if($sortBy === '') {
            return;
        }
        $sortDir = strtolower((string)$request->string('sort_dir', $this->orderDirection));
        if(!in_array($sortDir, [
            'asc',
            'desc'
        ], true)) {
            $sortDir = $this->orderDirection;
        }
        $query->orderBy($this->sortColumnMap[$sortBy] ?? $sortBy, $sortDir);
    }

    /**
     * Daftar kolom sortable.
     * Auto-detect dari schema jika $sortableColumns kosong.
     * Dikurangi $excludeSortableColumns, ditambah alias dari $sortColumnMap.
     */
    protected function resolvedSortableColumns(): array
    {
        $columns = $this->sortableColumns !== []
            ? $this->sortableColumns
            : $this->schemaColumns();
        $columns = array_values(array_unique(
            array_merge($columns, array_keys($this->sortColumnMap))
        ));
        return array_values(array_diff($columns, $this->excludeSortableColumns));
    }

    // =========================================================================
    // Custom Action Helper
    // =========================================================================

    /**
     * Daftar kolom dari schema database.
     * Di-cache per tabel (satu request).
     *
     * @return string[]
     */
    private function schemaColumns(): array
    {
        /** @var Model $model */
        $model = new ($this->modelClass())();
        $table = $model->getTable();
        return self::$schemaColumnsCache[$table] ??= Schema::getColumnListing($table);
    }

    // =========================================================================
    // Export CSV
    // =========================================================================

    /** Validasi per_page dari request — hanya izinkan nilai dari $perPageOptions. */
    protected function resolvedPerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', $this->perPage);
        return in_array($perPage, $this->perPageOptions, true) ? $perPage : $this->perPage;
    }

    // =========================================================================
    // Payload Builders
    // =========================================================================

    /** Nilai filter aktif — dikirim ke frontend dan dipakai untuk redirect. */
    protected function filters(Request $request): array
    {
        return [
            'search'   => (string)$request->string('search'),
            'sort_by'  => (string)$request->string('sort_by', $this->orderBy),
            'sort_dir' => strtolower((string)$request->string('sort_dir', $this->orderDirection)),
            'per_page' => $this->resolvedPerPage($request),
        ];
    }

    protected function datatablePayload(Request $request): array
    {
        return [
            'per_page_options' => $this->perPageOptions,
            'sortable_columns' => $this->resolvedSortableColumns(),
        ];
    }

    /**
     * Payload `crud` untuk index (modal tertutup, mode = null).
     */
    protected function crudIndexPayload(Request $request): array
    {
        return array_merge([
            'modal'       => $this->usesModal(),
            'mode'        => null,
            'open'        => false,
            'permissions' => $this->resolvedPermissions(),
        ], $this->crudMetadata($request));
    }

    protected function usesModal(): bool
    {
        return $this->modal;
    }

    /**
     * Permission flags yang dikirim ke frontend.
     * Dievaluasi di server PHP — aman dari manipulasi client.
     */
    protected function resolvedPermissions(): array
    {
        return [
            'view'   => $this->userCan('view'),
            'create' => $this->userCan('create'),
            'update' => $this->userCan('update'),
            'delete' => $this->userCan('delete'),
            'export' => $this->userCan('export'),
        ];
    }

    /** Metadata resource yang dikirim ke semua view. */
    protected function crudMetadata(Request $request): array
    {
        return [
            'resource'    => $this->resourceMetadata($request),
            'table'       => ['columns' => $this->resolvedTableColumns()],
            'form_schema' => ['fields' => $this->resolvedFormFields()],
        ];
    }

    protected function resourceMetadata(Request $request): array
    {
        $routeName = $this->routeName();
        return [
            'name'              => $routeName,
            'singular'          => $this->resourceSingular(),
            'label'             => $this->resourceLabel(),
            'title'             => $this->resourceTitle(),
            'key'               => $this->recordKeyName(),
            'permission_prefix' => $this->resolvedPermissionPrefix(),
            'routes'            => [
                'index'  => $this->routePath($routeName . '.index', $this->indexRouteParameters($request)),
                'create' => $this->routePath($routeName . '.create', $this->indexRouteParameters($request)),
                'store'  => $this->routePath($routeName . '.store', $this->indexRouteParameters($request)),
                'export' => $this->routePathIfExists($routeName . '.export', $this->indexRouteParameters($request)),
            ],
        ];
    }

    protected function resourceSingular(): string
    {
        return Str::singular($this->routeName());
    }

    protected function resourceLabel(): string
    {
        return $this->resourceLabel ?? $this->humanize($this->routeName());
    }

    /** Konversi snake_case / kebab-case ke Title Case yang manusiawi. */
    protected function humanize(string $value): string
    {
        return Str::of($value)->replace([
            '_',
            '-'
        ], ' ')->headline()->toString();
    }

    // =========================================================================
    // Query Builder
    // =========================================================================

    protected function resourceTitle(): string
    {
        return $this->resourceTitle ?? $this->resourceLabel();
    }

    protected function recordKeyName(): string
    {
        /** @var Model $model */
        $model = new ($this->modelClass())();
        return $model->getRouteKeyName();
    }

    /** Kembalikan path URL (tanpa domain) dari nama route. */
    protected function routePath(string $name, array $parameters = []): string
    {
        $url = route($name, $parameters);
        return parse_url($url, PHP_URL_PATH) ?: $url;
    }

    /**
     * Parameter route untuk index dan redirect.
     * Override untuk nested resource yang memerlukan parent ID.
     *
     * @example
     *   protected function indexRouteParameters(?Request $request = null): array
     *   {
     *       return ['category' => $request?->route('category')];
     *   }
     */
    protected function indexRouteParameters(?Request $request = null): array
    {
        return [];
    }

    /** Sama seperti routePath() tapi null jika route tidak terdaftar. */
    protected function routePathIfExists(string $name, array $parameters = []): ?string
    {
        if(!Route::has($name)) {
            return null;
        }
        return $this->routePath($name, $parameters);
    }

    // =========================================================================
    // Extension Points
    // =========================================================================

    /** Daftar kolom tabel yang dinormalisasi ke array definisi lengkap. */
    protected function resolvedTableColumns(): array
    {
        $columns = $this->tableColumns !== []
            ? $this->tableColumns
            : $this->defaultTableColumns();
        return array_values(array_map(
            fn(string|array $col) => $this->normalizeTableColumn($col),
            $columns
        ));
    }

    protected function defaultTableColumns(): array
    {
        $columns = $this->select !== [] ? $this->select : $this->schemaColumns();
        foreach($this->withCount as $relation) {
            $columns[] = $relation . '_count';
        }
        return array_values(array_diff(array_unique($columns), $this->excludeTableColumns));
    }

    // =========================================================================
    // Validasi
    // =========================================================================

    protected function normalizeTableColumn(string|array $column): array
    {
        if(is_string($column)) {
            $column = ['key' => $column];
        }
        $key = (string)($column['key'] ?? $column['name'] ?? '');
        return array_merge([
            'key'      => $key,
            'label'    => $this->humanize($key),
            'sortable' => in_array($key, $this->resolvedSortableColumns(), true),
            'type'     => $this->guessFieldType($key),
        ], $column);
    }

    /**
     * Tebak tipe field dari nama kolom.
     * Override untuk kustomisasi per resource.
     *
     * @example
     *   protected function guessFieldType(string $name): string
     *   {
     *       if ($name === 'content') return 'richtext';
     *       return parent::guessFieldType($name);
     *   }
     */
    protected function guessFieldType(string $name): string
    {
        return match (true) {
            str_starts_with($name, 'is_') || str_starts_with($name, 'has_') => 'checkbox',
            str_contains($name, 'email')                                    => 'email',
            str_contains($name, 'password')                                 => 'password',
            str_ends_with($name, '_at') || str_contains($name, 'date')      => 'datetime',
            str_ends_with($name, '_count')                                  => 'number',
            in_array($name, [
                'description',
                'excerpt',
                'content',
                'body',
                'notes',
                'address',
                'remarks'
            ], true)                                                        => 'textarea',
            str_ends_with($name, '_id')                                     => 'select',
            default                                                         => 'text',
        };
    }

    /** Daftar field form yang dinormalisasi ke array definisi lengkap. */
    protected function resolvedFormFields(): array
    {
        $fields = $this->formFields !== []
            ? $this->formFields
            : $this->defaultFormFields();
        return array_values(array_map(
            fn(string|array $field) => $this->normalizeFormField($field),
            $fields
        ));
    }

    protected function defaultFormFields(): array
    {
        return array_values(array_diff($this->schemaColumns(), $this->excludeFormFields));
    }

    protected function normalizeFormField(string|array $field): array
    {
        if(is_string($field)) {
            $field = ['name' => $field];
        }
        $name = (string)($field['name'] ?? $field['key'] ?? '');
        $type = (string)($field['type'] ?? $this->guessFieldType($name));
        return array_merge([
            'name'     => $name,
            'label'    => $this->humanize($name),
            'type'     => $type,
            'default'  => $type === 'checkbox' ? false : '',
            'required' => false,
        ], $field);
    }

    // =========================================================================
    // Lifecycle Hooks — Store
    // =========================================================================

    /**
     * Props tambahan untuk halaman index.
     *
     * @example
     *   protected function additionalIndexProps(Request $request): array
     *   {
     *       return ['categories' => Category::orderBy('name')->get(['id', 'name'])];
     *   }
     */
    protected function additionalIndexProps(Request $request): array
    {
        return [];
    }

    /**
     * GET /resources/create
     *
     * Tampilkan form untuk membuat record baru.
     * Modal = true  → overlay di atas halaman index.
     * Modal = false → halaman form terpisah.
     *
     * @permission create
     */
    public function create(Request $request): Response
    {
        $this->authorize('create');
        if(!$this->usesModal()) {
            return Inertia::render($this->formComponent(), $this->formPagePayload($request, null));
        }
        return Inertia::render(
            $this->indexComponent(),
            array_merge($this->indexPayload($request), $this->crudPayload('create', null, $request))
        );
    }

    // =========================================================================
    // Lifecycle Hooks — Update
    // =========================================================================

    protected function formComponent(): string
    {
        return $this->formComponentName ?? $this->componentName();
    }

    /**
     * Payload untuk halaman form terpisah (modal = false).
     * Komponen generik: dibungkus dalam 'crud' + 'form'.
     * Komponen kustom: langsung formPayload().
     */
    protected function formPagePayload(Request $request, mixed $record = null): array
    {
        if($this->usesGenericComponent()) {
            return [
                'crud' => array_merge([
                    'modal'       => false,
                    'mode'        => $record === null ? 'create' : 'edit',
                    'open'        => true,
                    'permissions' => $this->resolvedPermissions(),
                ], $this->crudMetadata($request)),
                'form' => $this->formPayload($request, $record),
            ];
        }
        return $this->formPayload($request, $record);
    }

    // =========================================================================
    // Lifecycle Hooks — Destroy
    // =========================================================================

    /** True jika index dan form menggunakan komponen generik yang sama. */
    protected function usesGenericComponent(): bool
    {
        return $this->indexComponent() === $this->componentName()
               && $this->formComponent() === $this->componentName();
    }

    /**
     * Payload form (create atau edit).
     *   {singular}  → record yang di-edit (null saat create)
     *   ...additionalFormProps()
     */
    protected function formPayload(Request $request, mixed $record = null): array
    {
        return array_merge(
            [$this->recordProp() => $record],
            ($record instanceof Model || $record === null)
                ? $this->additionalFormProps($request, $record)
                : []
        );
    }

    // =========================================================================
    // Lifecycle Hooks — Custom Action
    // =========================================================================
    /** Key prop record tunggal di Inertia (= singular routeName). */
    protected function recordProp(): string
    {
        return $this->resourceSingular();
    }

    /**
     * Props tambahan untuk form create/edit.
     *
     * @example
     *   protected function additionalFormProps(Request $request, ?Model $record = null): array
     *   {
     *       return ['statuses' => ['active', 'inactive', 'pending']];
     *   }
     */
    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        return [];
    }

    // =========================================================================
    // Perform Operations
    // =========================================================================
    /**
     * Payload `crud` saat modal dibuka.
     * Di-merge ke atas indexPayload() — tabel tetap terload.
     */
    protected function crudPayload(string $mode, mixed $record, Request $request): array
    {
        return [
            'crud' => array_merge([
                'modal'       => true,
                'mode'        => $mode,
                'open'        => true,
                'permissions' => $this->resolvedPermissions(),
            ], $this->crudMetadata($request)),
            'form' => $this->formPayload($request, $record),
        ];
    }

    /**
     * POST /resources
     *
     * Simpan record baru.
     * Alur: authorize → validate → beforeStore → performStore → afterStore → redirect
     *
     * @permission create
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create');
        $validated = $this->validateStore($request);
        $validated = $this->beforeStore($validated, $request);
        $this->performStore($validated, $request);
        return $this->redirectToIndex($this->storeSuccessMessage(), $request);
    }

    protected function validateStore(Request $request): array
    {
        return $request->validate($this->storeRules($request));
    }

    // =========================================================================
    // Record Resolution
    // =========================================================================
    /**
     * Aturan validasi khusus untuk CREATE.
     * Default: memanggil rules() tanpa record.
     *
     * @example
     *   protected function storeRules(Request $request): array
     *   {
     *       return array_merge($this->rules(), ['password' => 'required|min:8|confirmed']);
     *   }
     */
    protected function storeRules(Request $request): array
    {
        return $this->rules();
    }

    /**
     * Aturan validasi untuk store DAN update.
     *
     * $record = null  → dipanggil saat store
     * $record = Model → dipanggil saat update (gunakan untuk Rule::unique->ignore)
     *
     * @example
     *   protected function rules(?Model $record = null): array
     *   {
     *       return [
     *           'name'  => 'required|string|max:255',
     *           'email' => ['required', 'email', Rule::unique('users')->ignore($record?->getKey())],
     *       ];
     *   }
     */
    protected function rules(?Model $record = null): array
    {
        return [];
    }

    // =========================================================================
    // Resolvers
    // =========================================================================
    /**
     * SETELAH validasi, SEBELUM simpan (store).
     * Kembalikan array $validated yang dimodifikasi.
     *
     * Gunakan untuk: hash password, sisipkan created_by, generate slug, dsb.
     *
     * @example
     *   protected function beforeStore(array $validated, Request $request): array
     *   {
     *       $validated['password']   = Hash::make($validated['password']);
     *       $validated['created_by'] = $request->user()->id;
     *       return $validated;
     *   }
     */
    protected function beforeStore(array $validated, Request $request): array
    {
        return $this->applyGeneratedSlug($validated);
    }

    /**
     * Generate slug unik dan sisipkan ke $validated.
     * Dipanggil otomatis di beforeStore() dan beforeUpdate().
     *
     * Membutuhkan:
     *   1. $slugSourceColumn di-set (kolom sumber, misal: 'name')
     *   2. Method resolveUniqueSlug() di controller turunan
     *
     * @example
     *   class ArticleController extends BaseCrudController
     *   {
     *       use HasUniqueSlug;
     *       protected ?string $slugSourceColumn = 'title';
     *   }
     */
    protected function applyGeneratedSlug(array $validated, ?Model $record = null): array
    {
        if($this->slugSourceColumn === null || !method_exists($this, 'resolveUniqueSlug')) {
            return $validated;
        }
        $source = (string)(
            $validated[$this->slugColumn]
            ?? $validated[$this->slugSourceColumn]
               ?? ''
        );
        if($source === '') {
            return $validated;
        }
        $validated[$this->slugColumn] = $this->resolveUniqueSlug(
            $this->slugModelClass(),
            $source,
            $record ? (string)$record->getKey() : null
        );
        return $validated;
    }

    /**
     * Model untuk cek keunikan slug.
     * Override jika slug disimpan di model berbeda dari modelClass().
     */
    protected function slugModelClass(): string
    {
        return $this->modelClass();
    }

    protected function performStore(array $validated, Request $request): Model
    {
        $run = function() use ($validated, $request): Model {
            /** @var Model $record */
            $record = new ($this->modelClass())();
            $record->fill($validated);
            $record->save();
            $this->afterStore($record, $validated, $request);
            return $record;
        };
        return $this->useTransactions ? DB::transaction($run) : $run();
    }

    /**
     * SETELAH record berhasil disimpan (store).
     *
     * Gunakan untuk: sync relasi, upload file, kirim notifikasi, log.
     *
     * @example
     *   protected function afterStore(Model $record, array $validated, Request $request): void
     *   {
     *       $record->roles()->sync($this->rolesToSync);
     *       event(new UserCreated($record));
     *   }
     */
    protected function afterStore(Model $record, array $validated, Request $request): void
    {
        // Override di controller turunan
    }

    /**
     * Redirect ke index dengan flash success.
     * Query string dipertahankan jika preserveQueryOnRedirect() = true.
     */
    protected function redirectToIndex(string $message, ?Request $request = null): RedirectResponse
    {
        $redirect = redirect()->route(
            $this->routeName() . '.index',
            $this->indexRouteParameters($request)
        );
        if($request !== null && $this->preserveQueryOnRedirect()) {
            $query = $this->redirectQuery($request);
            if($query !== []) {
                $redirect->setTargetUrl(
                    $redirect->getTargetUrl() . '?' . http_build_query($query)
                );
            }
        }
        return $redirect->with('success', $this->resolveFlashMessage($message));
    }

    /**
     * Pertahankan query string saat redirect.
     * Override ke false jika tidak diinginkan.
     */
    protected function preserveQueryOnRedirect(): bool
    {
        return true;
    }

    protected function redirectQuery(Request $request): array
    {
        return collect($request->only(array_keys($this->filters($request))))
            ->reject(fn(mixed $v) => $v === null || $v === '')
            ->all();
    }

    /**
     * Resolve flash message: coba terjemahkan via __(), fallback ke string asli.
     */
    protected function resolveFlashMessage(string $key): string
    {
        $translated = __($key);
        return $translated !== $key ? $translated : $key;
    }

    protected function storeSuccessMessage(): string
    {
        return 'notifications.common.saved';
    }

    /**
     * GET /resources/{id}/edit
     *
     * Tampilkan form edit record.
     * Modal = true  → overlay di atas halaman index.
     * Modal = false → halaman form terpisah.
     *
     * @permission update
     */
    public function edit(Request $request, mixed $id): Response
    {
        $this->authorize('update');
        $record = $this->resolveFormRecord($id);
        if(!$this->usesModal()) {
            return Inertia::render($this->formComponent(), $this->formPagePayload($request, $record));
        }
        return Inertia::render(
            $this->indexComponent(),
            array_merge($this->indexPayload($request), $this->crudPayload('edit', $record, $request))
        );
    }

    /**
     * Override jika form edit memerlukan eager load tambahan yang tidak
     * diperlukan di operasi update/destroy.
     *
     * @example
     *   protected function resolveFormRecord(mixed $value): mixed
     *   {
     *       return Product::with(['images', 'variants'])->findOrFail($value);
     *   }
     */
    protected function resolveFormRecord(mixed $value): mixed
    {
        return $this->resolveRecord($value);
    }

    /**
     * Resolve model dari route parameter (ID, UUID, slug, custom binding).
     * Abort 404 jika tidak ditemukan.
     */
    protected function resolveRecord(mixed $value): Model
    {
        if($value instanceof Model) {
            return $value;
        }
        /** @var Model $model */
        $model  = new ($this->modelClass())();
        $record = $model->resolveRouteBinding($value);
        abort_unless($record !== null, 404);
        return $record;
    }

    /**
     * PUT/PATCH /resources/{id}
     *
     * Update record yang ada.
     * Alur: authorize → resolve → validate → beforeUpdate → performUpdate → afterUpdate → redirect
     *
     * @permission update
     */
    public function update(Request $request, mixed $id): RedirectResponse
    {
        $this->authorize('update');
        $record    = $this->resolveRecord($id);
        $validated = $this->validateUpdate($request, $record);
        $validated = $this->beforeUpdate($validated, $request, $record);
        $this->performUpdate($record, $validated, $request);
        return $this->redirectToIndex($this->updateSuccessMessage(), $request);
    }

    protected function validateUpdate(Request $request, Model $record): array
    {
        return $request->validate($this->updateRules($request, $record));
    }

    /**
     * Aturan validasi khusus untuk UPDATE.
     * Default: memanggil rules($record) agar unique bisa exclude ID.
     *
     * @example
     *   protected function updateRules(Request $request, Model $record): array
     *   {
     *       return array_merge($this->rules($record), ['password' => 'nullable|min:8']);
     *   }
     */
    protected function updateRules(Request $request, Model $record): array
    {
        return $this->rules($record);
    }

    // =========================================================================
    // Resource Naming
    // =========================================================================
    /**
     * SETELAH validasi, SEBELUM update ke DB.
     * Kembalikan array $validated yang dimodifikasi.
     *
     * @example
     *   protected function beforeUpdate(array $validated, Request $request, Model $record): array
     *   {
     *       if (empty($validated['password'])) {
     *           unset($validated['password']);
     *       } else {
     *           $validated['password'] = Hash::make($validated['password']);
     *       }
     *       return $validated;
     *   }
     */
    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        return $this->applyGeneratedSlug($validated, $record);
    }

    protected function performUpdate(Model $record, array $validated, Request $request): Model
    {
        $run = function() use ($record, $validated, $request): Model {
            $record->fill($validated);
            $record->save();
            $this->afterUpdate($record, $validated, $request);
            return $record;
        };
        return $this->useTransactions ? DB::transaction($run) : $run();
    }

    /**
     * SETELAH record berhasil diupdate.
     *
     * @example
     *   protected function afterUpdate(Model $record, array $validated, Request $request): void
     *   {
     *       $record->roles()->sync($this->rolesToSync);
     *   }
     */
    protected function afterUpdate(Model $record, array $validated, Request $request): void
    {
        // Override di controller turunan
    }

    protected function updateSuccessMessage(): string
    {
        return 'notifications.common.saved';
    }

    /**
     * DELETE /resources/{id}
     *
     * Hapus record.
     * Alur: authorize → resolve → beforeDestroy → performDestroy → afterDestroy → redirect
     * BeforeDestroy() bisa mengembalikan RedirectResponse untuk memblokir penghapusan.
     *
     * @permission delete
     */
    public function destroy(mixed $id): RedirectResponse
    {
        $this->authorize('delete');
        $record  = $this->resolveRecord($id);
        $blocked = $this->beforeDestroy($record);
        if($blocked instanceof RedirectResponse) {
            return $blocked;
        }
        $this->performDestroy($record);
        return $this->redirectToIndex($this->deleteSuccessMessage());
    }

    /**
     * SEBELUM record dihapus.
     * Return RedirectResponse → BLOKIR penghapusan.
     * Return null            → LANJUTKAN penghapusan.
     *
     * @example
     *   protected function beforeDestroy(Model $record): ?RedirectResponse
     *   {
     *       if ($record->orders()->active()->exists()) {
     *           return $this->redirectToIndexWithError('errors.has_active_orders');
     *       }
     *       return null;
     *   }
     */
    protected function beforeDestroy(Model $record): ?RedirectResponse
    {
        return null;
    }

    // =========================================================================
    // Route Helpers
    // =========================================================================
    protected function performDestroy(Model $record): void
    {
        $run = function() use ($record): void {
            $record->delete();
            $this->afterDestroy($record);
        };
        if($this->useTransactions) {
            DB::transaction($run);
            return;
        }
        $run();
    }

    /**
     * SETELAH record berhasil dihapus.
     *
     * @example
     *   protected function afterDestroy(Model $record): void
     *   {
     *       Storage::delete($record->avatar_path);
     *   }
     */
    protected function afterDestroy(Model $record): void
    {
        // Override di controller turunan
    }

    protected function deleteSuccessMessage(): string
    {
        return 'notifications.common.deleted';
    }

    // =========================================================================
    // Redirect Helpers
    // =========================================================================
    /**
     * GET /resources/export
     *
     * Download data sebagai CSV (UTF-8 BOM untuk kompatibilitas Excel).
     *
     * Query params:
     *   ?scope=all     → semua record sesuai filter (default)
     *   ?scope=current → hanya halaman aktif
     *
     * Route harus didaftarkan manual:
     *   Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
     *
     * @permission export
     */
    public function export(Request $request): StreamedResponse
    {
        $this->authorize('export');
        $columns = $this->resolvedExportColumns();
        $scope   = $this->resolvedExportScope($request);
        return response()->streamDownload(
            function() use ($request, $columns, $scope): void {
                $output = fopen('php://output', 'w');
                if($output === false) {
                    return;
                }
                // BOM agar Excel membaca UTF-8 dengan benar
                fwrite($output, "\xEF\xBB\xBF");
                // Header row
                fputcsv($output, array_map(
                    fn(string $col) => $this->exportColumnLabel($col),
                    $columns
                ));
                $query = $this->makeExportQuery($request);
                if($scope === 'current') {
                    $page = max(1, $request->integer('page', 1));
                    $rows = $query->forPage($page, $this->resolvedPerPage($request))->get();
                    foreach($rows as $row) {
                        fputcsv($output, $this->transformExportRow($row, $columns));
                    }
                } else {
                    // cursor() efisien untuk dataset besar
                    foreach($query->cursor() as $row) {
                        fputcsv($output, $this->transformExportRow($row, $columns));
                    }
                }
                fclose($output);
            },
            $this->exportFileName(),
            ['Content-Type' => 'text/csv; charset=UTF-8']
        );
    }

    /** Daftar kolom untuk export CSV. */
    protected function resolvedExportColumns(): array
    {
        $columns = $this->exportColumns !== []
            ? $this->exportColumns
            : $this->schemaColumns();
        $columns = array_values(array_unique(
            array_merge($columns, array_keys($this->exportColumnLabels))
        ));
        return array_values(array_diff($columns, $this->excludeExportColumns));
    }

    protected function resolvedExportScope(Request $request): string
    {
        $scope = strtolower((string)$request->string('scope', 'all'));
        return in_array($scope, [
            'all',
            'current'
        ], true) ? $scope : 'all';
    }

    protected function exportColumnLabel(string $column): string
    {
        return $this->exportColumnLabels[$column] ?? $column;
    }

    // =========================================================================
    // Flash Messages
    // =========================================================================
    /**
     * Query untuk export.
     * Override untuk menambahkan filter atau relasi khusus.
     * Default: sama dengan makeQuery().
     */
    protected function makeExportQuery(Request $request): Builder
    {
        return $this->makeQuery($request);
    }

    protected function transformExportRow(Model $record, array $columns): array
    {
        return array_map(function(string $column) use ($record): mixed {
            $value = $this->exportValue($record, $column);
            if(is_scalar($value) || $value === null) {
                return $value;
            }
            return json_encode($value, JSON_UNESCAPED_UNICODE);
        }, $columns);
    }

    /**
     * Nilai yang ditulis untuk kolom tertentu di CSV.
     * Override untuk transformasi kustom per kolom.
     *
     * @example
     *   protected function exportValue(Model $record, string $column): mixed
     *   {
     *       if ($column === 'roles') {
     *           return $record->roles->pluck('name')->join(', ');
     *       }
     *       return parent::exportValue($record, $column);
     *   }
     */
    protected function exportValue(Model $record, string $column): mixed
    {
        return data_get($record, $column);
    }

    protected function exportFileName(): string
    {
        return $this->routeName() . '_' . now()->format('Ymd_His') . '.csv';
    }

    /**
     * Helper untuk custom action di luar CRUD standar.
     * Menyediakan lifecycle hook, permission check, dan DB transaction yang konsisten.
     *
     * @param callable(Model, Request): mixed $callback
     * @example
     *           public function publish(Request $request, mixed $id): RedirectResponse
     *           {
     *           return $this->recordAction(
     *           $request, $id, 'publish',
     *           fn (Model $r) => $r->update(['published_at' => now()]),
     *           'notifications.post.published',
     *           );
     *           }
     *
     */
    protected function recordAction(
        Request  $request,
        mixed    $id,
        string   $action,
        callable $callback,
        ?string  $successMessage = null,
        bool     $checkPermission = true,
    ): RedirectResponse
    {
        if($checkPermission) {
            $this->authorize($action);
        }
        $record  = $this->resolveRecord($id);
        $blocked = $this->beforeRecordAction($action, $record, $request);
        if($blocked instanceof RedirectResponse) {
            return $blocked;
        }
        $run = function() use ($callback, $record, $request, $action): void {
            $result = $callback($record, $request);
            $this->afterRecordAction($action, $record, $request, $result);
        };
        $this->useTransactions ? DB::transaction($run) : $run();
        return $this->redirectToIndex(
            $successMessage ?? $this->actionSuccessMessage($action),
            $request
        );
    }

    // =========================================================================
    // Auto Slug
    // =========================================================================
    /**
     * SEBELUM custom action (via recordAction()).
     * Return RedirectResponse untuk memblokir.
     */
    protected function beforeRecordAction(string $action, Model $record, Request $request): ?RedirectResponse
    {
        return null;
    }

    /**
     * SETELAH custom action selesai.
     *
     * @param mixed $result nilai return dari callback
     */
    protected function afterRecordAction(string $action, Model $record, Request $request, mixed $result = null): void
    {
        // Override di controller turunan
    }

    // =========================================================================
    // Utilities
    // =========================================================================
    protected function actionSuccessMessage(string $action): string
    {
        return 'notifications.common.saved';
    }

    /**
     * Redirect ke index dengan flash error.
     * Biasanya dipakai di beforeDestroy() untuk memblokir penghapusan.
     *
     * @example
     *   return $this->redirectToIndexWithError('errors.cannot_delete');
     */
    protected function redirectToIndexWithError(string $message, ?Request $request = null): RedirectResponse
    {
        return redirect()
            ->route($this->routeName() . '.index', $this->indexRouteParameters($request))
            ->with('error', $this->resolveFlashMessage($message));
    }
}
