<?php
/**
 * BaseCrudController
 * @author  bupind
 * @created 2026-05-20
 */

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
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

abstract class BaseCrudController extends Controller
{
    protected static array $schemaColumnsCache     = [];
    protected bool         $modal                  = true;
    protected ?string      $componentName          = 'backend/crud/Index';
    protected ?string      $indexComponentName     = null;
    protected ?string      $formComponentName      = null;
    protected ?string      $resourceRouteName      = null;
    protected ?string      $resourceLabel          = null;
    protected ?string      $resourceTitle          = null;
    protected ?string      $permissionPrefix       = null;
    protected array        $permissionMap          = [];
    protected array        $select                 = [];
    protected array        $with                   = [];
    protected array        $withCount              = [];
    protected int          $perPage                = 10;
    protected array        $perPageOptions         = [
        10,
        25,
        50,
        100,
    ];
    protected array        $searchableColumns      = [];
    protected bool         $searchPrefix           = true;
    protected ?string      $slugSourceColumn       = null;
    protected string       $slugColumn             = 'slug';
    protected bool         $useTransactions        = false;
    protected string       $orderBy                = 'id';
    protected string       $orderDirection         = 'desc';
    protected array        $sortableColumns        = [];
    protected array        $excludeSortableColumns = [];
    protected array        $sortColumnMap          = [];
    protected array        $tableColumns           = [];
    protected array        $formFields             = [];
    protected array        $exportColumns          = [];
    protected array        $excludeExportColumns   = [];
    protected array        $exportColumnLabels     = [];
    protected array        $excludeTableColumns    = [
        'deleted_at',
        'updated_at',
    ];
    protected array        $excludeFormFields      = [
        'id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function index(Request $request): Response
    {
        $this->authorize('view');
        return Inertia::render($this->indexComponent(), $this->indexPayload($request));
    }

    protected function authorize(string $action, mixed $record = null): void
    {
        if(!$this->userCan($action)) {
            abort(403, "Unauthorized: {$this->permission($action)}");
        }
    }

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
            return false;
        }
    }

    protected function permission(string $action): string
    {
        return $this->permissionMap[$action] ?? ($this->resolvedPermissionPrefix() . '-' . $action);
    }

    protected function resolvedPermissionPrefix(): string
    {
        return $this->permissionPrefix ?? $this->routeName();
    }

    protected function routeName(): string
    {
        return $this->resourceRouteName
               ?? Str::plural(Str::kebab(class_basename($this->modelClass())));
    }

    abstract protected function modelClass(): string;

    protected function indexComponent(): string
    {
        return $this->indexComponentName ?? $this->componentName();
    }

    protected function componentName(): string
    {
        return $this->componentName ?? 'backend/crud/Index';
    }

    protected function indexPayload(Request $request): array
    {
        return array_merge([
            $this->collectionProp() => $this->indexCollection($request),
            'filters'               => $this->filters($request),
            'datatable'             => $this->datatablePayload($request),
            'crud'                  => $this->crudIndexPayload($request),
        ], $this->additionalIndexProps($request));
    }

    protected function collectionProp(): string
    {
        return $this->routeName();
    }

    protected function indexCollection(Request $request): mixed
    {
        return $this->makeQuery($request)
            ->paginate($this->resolvedPerPage($request))
            ->withQueryString();
    }

    protected function makeQuery(Request $request): Builder
    {
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

    protected function applyFilters(Builder $query, Request $request): void { }

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
            'desc',
        ], true)) {
            $sortDir = $this->orderDirection;
        }
        $query->orderBy($this->sortColumnMap[$sortBy] ?? $sortBy, $sortDir);
    }

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

    private function schemaColumns(): array
    {
        $model = new ($this->modelClass())();
        $table = $model->getTable();
        return self::$schemaColumnsCache[$table] ??= Schema::getColumnListing($table);
    }

    protected function resolvedPerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', $this->perPage);
        return in_array($perPage, $this->perPageOptions, true) ? $perPage : $this->perPage;
    }

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

    protected function humanize(string $value): string
    {
        return Str::of($value)->replace([
            '_',
            '-',
        ], ' ')->headline()->toString();
    }

    protected function resourceTitle(): string
    {
        return $this->resourceTitle ?? $this->resourceLabel();
    }

    protected function recordKeyName(): string
    {
        $model = new ($this->modelClass())();
        return $model->getRouteKeyName();
    }

    protected function routePath(string $name, array $parameters = []): string
    {
        $url = route($name, $parameters);
        return parse_url($url, PHP_URL_PATH) ?: $url;
    }

    protected function indexRouteParameters(?Request $request = null): array
    {
        return [];
    }

    protected function routePathIfExists(string $name, array $parameters = []): ?string
    {
        if(!Route::has($name)) {
            return null;
        }
        return $this->routePath($name, $parameters);
    }

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
                'remarks',
            ], true)                                                        => 'textarea',
            str_ends_with($name, '_id')                                     => 'select',
            default                                                         => 'text',
        };
    }

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

    protected function additionalIndexProps(Request $request): array
    {
        return [];
    }

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

    protected function formComponent(): string
    {
        return $this->formComponentName ?? $this->componentName();
    }

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

    protected function usesGenericComponent(): bool
    {
        return $this->indexComponent() === $this->componentName()
               && $this->formComponent() === $this->componentName();
    }

    protected function formPayload(Request $request, mixed $record = null): array
    {
        return array_merge(
            [$this->recordProp() => $record],
            ($record instanceof Model || $record === null)
                ? $this->additionalFormProps($request, $record)
                : []
        );
    }

    protected function recordProp(): string
    {
        return $this->resourceSingular();
    }

    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        return [];
    }

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

    protected function storeRules(Request $request): array
    {
        return $this->rules();
    }

    protected function rules(?Model $record = null): array
    {
        return [];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        return $this->applyGeneratedSlug($validated);
    }

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

    protected function slugModelClass(): string
    {
        return $this->modelClass();
    }

    protected function performStore(array $validated, Request $request): Model
    {
        $run = function() use ($validated, $request): Model {
            $record = new ($this->modelClass())();
            $record->fill($validated);
            $record->save();
            $this->afterStore($record, $validated, $request);
            return $record;
        };
        return $this->useTransactions ? DB::transaction($run) : $run();
    }

    protected function afterStore(Model $record, array $validated, Request $request): void { }

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

    protected function resolveFlashMessage(string $key): string
    {
        $translated = __($key);
        return $translated !== $key ? $translated : $key;
    }

    protected function storeSuccessMessage(): string
    {
        return 'notifications.common.saved';
    }

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

    protected function resolveFormRecord(mixed $value): mixed
    {
        return $this->resolveRecord($value);
    }

    protected function resolveRecord(mixed $value): Model
    {
        if($value instanceof Model) {
            return $value;
        }
        $model  = new ($this->modelClass())();
        $record = $model->resolveRouteBinding($value);
        abort_unless($record !== null, 404);
        return $record;
    }

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

    protected function updateRules(Request $request, Model $record): array
    {
        return $this->rules($record);
    }

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

    protected function afterUpdate(Model $record, array $validated, Request $request): void { }

    protected function updateSuccessMessage(): string
    {
        return 'notifications.common.saved';
    }

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

    protected function beforeDestroy(Model $record): ?RedirectResponse
    {
        return null;
    }

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

    protected function afterDestroy(Model $record): void { }

    protected function deleteSuccessMessage(): string
    {
        return 'notifications.common.deleted';
    }

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
                fwrite($output, "\xEF\xBB\xBF");
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
            'current',
        ], true) ? $scope : 'all';
    }

    protected function exportColumnLabel(string $column): string
    {
        return $this->exportColumnLabels[$column] ?? $column;
    }

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

    protected function exportValue(Model $record, string $column): mixed
    {
        return data_get($record, $column);
    }

    protected function exportFileName(): string
    {
        return $this->routeName() . '_' . now()->format('Ymd_His') . '.csv';
    }

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

    protected function beforeRecordAction(string $action, Model $record, Request $request): ?RedirectResponse
    {
        return null;
    }

    protected function afterRecordAction(string $action, Model $record, Request $request, mixed $result = null): void { }

    protected function actionSuccessMessage(string $action): string
    {
        return 'notifications.common.saved';
    }

    protected function redirectToIndexWithError(string $message, ?Request $request = null): RedirectResponse
    {
        return redirect()
            ->route($this->routeName() . '.index', $this->indexRouteParameters($request))
            ->with('error', $this->resolveFlashMessage($message));
    }
}
