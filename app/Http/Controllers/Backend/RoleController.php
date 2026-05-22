<?php
/**
 * RoleController
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Http\Controllers\Backend;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends BaseCrudController
{
    protected bool $modal = false;
    protected bool $useTransactions = true;
    protected int $perPage = 10;
    protected array $select = [
        'id',
        'name',
        'created_at',
    ];
    protected array $withCount = ['permissions'];
    protected array $searchableColumns = ['name'];
    protected bool $searchPrefix = true;
    protected array $sortableColumns = [
        'name',
        'permissions_count',
        'created_at',
    ];
    protected string $orderBy = 'created_at';
    protected string $orderDirection = 'desc';
    private array $permissionsToSync = [];

    protected function modelClass(): string
    {
        return Role::class;
    }

    protected function routeName(): string
    {
        return 'roles';
    }

    protected function indexComponent(): string
    {
        return 'backend/roles/Index';
    }

    protected function formComponent(): string
    {
        return 'backend/roles/Form';
    }

    protected function rules(?Model $record = null): array
    {
        return [
            'name'          => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($record?->getKey()),
            ],
            'permissions'   => [
                'nullable',
                'array',
            ],
            'permissions.*' => [
                'string',
                Rule::exists('permissions', 'name'),
            ],
        ];
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        return $this->extractPermissions($validated);
    }

    private function extractPermissions(array $validated): array
    {
        $this->permissionsToSync = $validated['permissions'] ?? [];
        unset($validated['permissions']);
        return $validated;
    }

    protected function afterStore(Model $record, array $validated, Request $request): void
    {
        $record->syncPermissions($this->permissionsToSync);
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        return $this->extractPermissions($validated);
    }

    protected function afterUpdate(Model $record, array $validated, Request $request): void
    {
        $record->syncPermissions($this->permissionsToSync);
    }

    protected function resolveFormRecord(mixed $value): mixed
    {
        return Role::with('permissions:id,name,group')->findOrFail($value);
    }

    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        return [
            'groupedPermissions' => Permission::query()
                ->select([
                    'id',
                    'name',
                    'group',
                ])
                ->orderBy('group')
                ->orderBy('name')
                ->get()
                ->groupBy(fn(Permission $p) => $p->group ?: 'ungrouped'),
        ];
    }
}
