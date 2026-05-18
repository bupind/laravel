<?php

namespace App\Http\Controllers\Backend;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends BaseCrudController
{
    protected bool $modal = false;
    protected int $perPage = 25;
    protected array $searchableColumns = ['name', 'group'];
    protected bool $searchPrefix = true;
    protected array $sortableColumns = ['name', 'group', 'created_at'];
    protected array $select = ['id', 'name', 'group', 'created_at'];
    protected string $orderBy = 'created_at';
    protected string $orderDirection = 'desc';

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

    protected function rules(?Model $record = null): array
    {
        $ignoreId = $record?->getKey();
        return [
            'name'  => 'required|string|max:255|unique:permissions,name' . ($ignoreId ? ',' . $ignoreId : ''),
            'group' => 'nullable|string|max:255',
        ];
    }

    protected function filters(Request $request): array
    {
        return array_merge(parent::filters($request), [
            'group' => $request->filled('group') ? (string) $request->string('group') : '',
        ]);
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('group')) {
            $query->where('group', (string) $request->string('group'));
        }
    }

    protected function additionalIndexProps(Request $request): array
    {
        return [
            'groups' => $this->groupOptions(),
        ];
    }

    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        return [
            'groups' => $this->groupOptions(),
        ];
    }

    protected function groupOptions()
    {
        return Permission::query()
            ->select('group')
            ->distinct()
            ->orderBy('group')
            ->pluck('group')
            ->filter()
            ->values();
    }

    protected function storeSuccessMessage(): string
    {
        return 'notifications.permission.created';
    }

    protected function updateSuccessMessage(): string
    {
        return 'notifications.permission.updated';
    }

    protected function deleteSuccessMessage(): string
    {
        return 'notifications.permission.deleted';
    }
}
