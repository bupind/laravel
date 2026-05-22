<?php

namespace App\Http\Controllers\Backend;

use App\Models\Permission;
use App\Support\Permissions\PermissionCatalog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;
use Throwable;

class PermissionController extends BaseCrudController
{
    private const STANDARD_ACTIONS = [
        'view',
        'create',
        'update',
        'delete',
        'reset',
        'publish',
        'export',
        'import',
        'approve',
    ];
    protected bool    $modal             = true;
    protected bool    $searchPrefix      = true;
    protected string  $orderBy           = 'created_at';
    protected ?string $permissionPrefix  = 'permission';
    protected array   $sortableColumns   = [
        'name',
        'group',
        'created_at',
    ];
    protected array   $searchableColumns = [
        'name',
        'group',
    ];
    protected array   $select            = [
        'id',
        'name',
        'group',
        'created_at',
    ];

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create');
        $validated = $this->normalizeModulePayload($this->validateStore($request));
        $validated = $this->beforeStore($validated, $request);
        $this->persistModule(null, $validated);
        return $this->redirectToIndex($this->storeSuccessMessage(), $request);
    }

    private function normalizeModulePayload(array $validated): array
    {
        $module   = trim((string)$validated['module']);
        $newGroup = trim((string)($validated['new_group'] ?? ''));
        $group    = $newGroup !== '' ? $newGroup : trim((string)($validated['group'] ?? ''));
        return [
            'module'     => $module,
            'group'      => $group,
            'privileges' => collect($validated['privileges'])
                ->map(fn(mixed $action) => str(trim((string)$action))->lower()->toString())
                ->filter()
                ->unique()
                ->values()
                ->all(),
        ];
    }

    private function persistModule(?string $oldModule, array $validated): void
    {
        DB::transaction(function() use ($oldModule, $validated): void {
            if($oldModule !== null) {
                Permission::query()
                    ->whereIn('id', $this->modulePermissions($oldModule)->pluck('id'))
                    ->delete();
            }
            foreach($validated['privileges'] as $action) {
                Permission::firstOrCreate(
                    [
                        'name'       => "{$validated['module']}-{$action}",
                        'guard_name' => 'web',
                    ],
                    ['group' => $validated['group'] !== '' ? $validated['group'] : null]
                );
            }
        });
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    private function modulePermissions(string $module): Collection
    {
        return Permission::query()
            ->select([
                'id',
                'name',
                'group',
                'created_at',
            ])
            ->get()
            ->filter(fn(Permission $permission) => $this->splitPermissionName($permission->name)['module'] === $module)
            ->values();
    }

    private function splitPermissionName(string $name): array
    {
        $parts = explode('-', $name);
        if(count($parts) < 2) {
            return [
                'module' => $name,
                'action' => 'view',
            ];
        }
        $action = array_pop($parts);
        return [
            'module' => implode('-', $parts),
            'action' => $action,
        ];
    }

    public function update(Request $request, mixed $record): RedirectResponse
    {
        $this->authorize('update');
        $module     = (string)$record;
        $permission = $this->moduleModel($module);
        abort_unless($permission !== null, 404);
        $validated = $request->validate($this->updateRules($request, $permission));
        $validated = $this->normalizeModulePayload($validated);
        $validated = $this->beforeUpdate($validated, $request, $permission);
        $this->persistModule($module, $validated);
        return $this->redirectToIndex($this->updateSuccessMessage(), $request);
    }

    private function moduleModel(string $module): ?Permission
    {
        return $this->modulePermissions($module)->first();
    }

    public function storeBulk(Request $request): RedirectResponse
    {
        $this->authorize('create');
        $request->validate([
            'permissions'   => 'required|array|min:1',
            'permissions.*' => 'required|string|max:255|distinct',
            'group'         => 'nullable|string|max:100',
        ]);
        $existing = Permission::query()->pluck('name')->flip();
        $created  = 0;
        $group    = trim((string)$request->input('group'));
        foreach($request->input('permissions', []) as $name) {
            $name = trim((string)$name);
            if($name === '' || $existing->has($name)) {
                continue;
            }
            Permission::create([
                'name'       => $name,
                'guard_name' => 'web',
                'group'      => $group !== '' ? $group : $this->groupFromName($name),
            ]);
            $created++;
        }
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        return $this->redirectToIndex($created > 0 ? 'notifications.common.saved' : 'notifications.common.failed', $request);
    }

    private function groupFromName(string $name): ?string
    {
        try {
            foreach(PermissionCatalog::grouped() as $group => $permissions) {
                if(in_array($name, $permissions, true)) {
                    return $group;
                }
            }
        } catch(Throwable) {
        }
        return null;
    }

    public function destroyModule(Request $request, string $module): RedirectResponse
    {
        $this->authorize('delete');
        $ids = $this->modulePermissions($module)->pluck('id');
        if($ids->isEmpty()) {
            return $this->redirectToIndexWithError('notifications.common.failed', $request);
        }
        Permission::query()->whereIn('id', $ids)->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        return $this->redirectToIndex($this->deleteSuccessMessage(), $request);
    }

    protected function modelClass(): string
    {
        return Permission::class;
    }

    protected function routeName(): string
    {
        return 'permissions';
    }

    protected function indexComponent(): string
    {
        return 'backend/permissions/Index';
    }

    protected function formComponent(): string
    {
        return 'backend/permissions/Form';
    }

    protected function userCan(string $action): bool
    {
        return parent::userCan($action) || $this->userCanLegacyPermission($action);
    }

    private function userCanLegacyPermission(string $action): bool
    {
        $user = request()->user();
        if($user === null) {
            return false;
        }
        $permission = "permissions-{$action}";
        try {
            if(method_exists($user, 'hasPermissionTo')) {
                return $user->hasPermissionTo($permission);
            }
            return method_exists($user, 'can') && $user->can($permission);
        } catch(Throwable) {
            return false;
        }
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'module'       => [
                'required',
                'string',
                'max:120',
                'regex:/^[A-Za-z0-9][A-Za-z0-9._-]*$/',
            ],
            'group'        => [
                'nullable',
                'string',
                'max:100',
            ],
            'new_group'    => [
                'nullable',
                'string',
                'max:100',
            ],
            'privileges'   => [
                'required',
                'array',
                'min:1',
            ],
            'privileges.*' => [
                'required',
                'string',
                'max:80',
                'distinct',
            ],
        ];
    }

    protected function indexCollection(Request $request): mixed
    {
        return $this->modulePaginator($request);
    }

    private function modulePaginator(Request $request): LengthAwarePaginator
    {
        $rows    = $this->moduleRows($this->makeQuery($request)->get())->values();
        $sortBy  = (string)$request->string('sort_by', 'module');
        $sortDir = strtolower((string)$request->string('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortKey = in_array($sortBy, [
            'module',
            'group',
            'created_at',
        ], true) ? $sortBy : 'module';
        $rows    = $sortDir === 'desc'
            ? $rows->sortByDesc($sortKey)->values()
            : $rows->sortBy($sortKey)->values();
        $page    = max(1, $request->integer('page', 1));
        $perPage = $this->resolvedPerPage($request);
        return new LengthAwarePaginator(
            $rows->forPage($page, $perPage)->values(),
            $rows->count(),
            $perPage,
            $page,
            [
                'path'  => $request->url(),
                'query' => $request->query(),
            ],
        );
    }

    private function moduleRows(Collection $permissions): Collection
    {
        return $permissions
            ->groupBy(fn(Permission $permission) => $this->splitPermissionName($permission->name)['module'])
            ->map(function(Collection $items, string $module): array {
                $children = $items
                    ->map(function(Permission $permission): array {
                        $parts = $this->splitPermissionName($permission->name);
                        return [
                            'id'         => $permission->id,
                            'name'       => $permission->name,
                            'action'     => $parts['action'],
                            'label'      => $this->permissionLabel($parts['action']),
                            'group'      => $permission->group,
                            'created_at' => optional($permission->created_at)->toISOString(),
                        ];
                    })
                    ->sortBy(fn(array $child) => $this->actionSortValue($child['action']))
                    ->values();
                return [
                    'key'          => $module,
                    'module'       => $module,
                    'module_label' => $this->permissionLabel($module),
                    'group'        => $items->pluck('group')->filter()->unique()->implode(', '),
                    'children'     => $children,
                    'created_at'   => optional($items->sortByDesc('created_at')->first()?->created_at)->toISOString(),
                ];
            });
    }

    private function permissionLabel(string $value): string
    {
        return str($value)->replace([
            '-',
            '_',
        ], ' ')->title()->toString();
    }

    private function actionSortValue(string $action): string
    {
        $order = [
            'view'   => '01',
            'create' => '02',
            'update' => '03',
            'edit'   => '03',
            'delete' => '04',
            'reset'  => '05',
        ];
        return ($order[$action] ?? '99') . $action;
    }

    protected function datatablePayload(Request $request): array
    {
        return [
            'per_page_options' => $this->perPageOptions,
            'sortable_columns' => [
                'module',
                'group',
                'created_at',
            ],
        ];
    }

    protected function filters(Request $request): array
    {
        return [
            'search'   => (string)$request->string('search'),
            'group'    => $request->filled('group') ? (string)$request->string('group') : '',
            'sort_by'  => (string)$request->string('sort_by', 'module'),
            'sort_dir' => strtolower((string)$request->string('sort_dir', 'asc')),
            'per_page' => $this->resolvedPerPage($request),
        ];
    }

    protected function additionalIndexProps(Request $request): array
    {
        return [
            'groups'          => $this->groupOptions(),
            'standardActions' => self::STANDARD_ACTIONS,
        ];
    }

    private function groupOptions(): Collection
    {
        return Permission::query()
            ->select('group')
            ->distinct()
            ->orderBy('group')
            ->pluck('group')
            ->filter()
            ->values();
    }

    protected function resolveFormRecord(mixed $value): mixed
    {
        $permission = $this->moduleRecord((string)$value);
        abort_unless($permission !== null, 404);
        return $permission;
    }

    private function moduleRecord(string $module): ?array
    {
        return $this->moduleRows($this->modulePermissions($module))->first();
    }

    protected function formPayload(Request $request, mixed $record = null): array
    {
        return $this->permissionFormPayload(is_array($record) ? $record : null);
    }

    private function permissionFormPayload(?array $permission): array
    {
        return [
            'permission'      => $permission,
            'groups'          => $this->groupOptions(),
            'standardActions' => self::STANDARD_ACTIONS,
        ];
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if($request->filled('group')) {
            $query->where('group', (string)$request->string('group'));
        }
    }
}
