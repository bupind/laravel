<?php

namespace App\Http\Controllers\Backend;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends BaseCrudController
{
    protected bool $modal = false;
    protected int $perPage = 25;
    protected array $searchableColumns = ['name'];
    protected bool $searchPrefix = true;
    protected array $sortableColumns = ['name', 'permissions_count', 'created_at'];
    protected array $select = ['id', 'name', 'created_at'];
    protected array $withCount = ['permissions'];
    protected string $orderBy = 'created_at';
    protected string $orderDirection = 'desc';

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
            'name' => [
                'required',
                'string',
                Rule::unique('roles', 'name')->ignore($record?->getKey()),
            ],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ];
    }

    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        if ($record instanceof Role) {
            $record->loadMissing('permissions:id,name,group');
        }

        return [
            'groupedPermissions' => Permission::query()
                ->select(['id', 'name', 'group'])
                ->orderBy('group')
                ->orderBy('name')
                ->get()
                ->groupBy(fn (Permission $permission) => $permission->group ?: 'ungrouped'),
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $role = Role::create(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', $this->flashMessage('notifications.role.created'));
    }

    public function update(Request $request, mixed $record): RedirectResponse
    {
        /** @var Role $role */
        $role = $this->resolveRecord($record);
        $validated = $request->validate($this->rules($role));

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', $this->flashMessage('notifications.role.updated'));
    }

    protected function deleteSuccessMessage(): string
    {
        return 'notifications.role.deleted';
    }
}
