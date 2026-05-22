<?php

namespace App\Http\Controllers\Backend;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends BaseCrudController
{
    protected array  $with                   = ['roles:id,name'];
    protected array  $select                 = [
        'id',
        'name',
        'email',
        'created_at',
    ];
    protected array  $searchableColumns      = [
        'name',
        'email',
    ];
    protected array  $excludeSortableColumns = [
        'password',
        'remember_token',
        'email_verified_at',
    ];
    protected array  $exportColumns          = [
        'id',
        'name',
        'email',
        'roles',
        'created_at',
    ];
    protected array  $excludeExportColumns   = [
        'password',
        'remember_token',
    ];
    protected array  $exportColumnLabels     = [
        'id'         => 'ID',
        'name'       => 'Name',
        'email'      => 'Email',
        'roles'      => 'Roles',
        'created_at' => 'Created At',
    ];
    protected string $orderBy                = 'created_at';
    private array    $rolesToSync            = [];

    public function resetPassword(User $user): RedirectResponse
    {
        $this->authorize('reset');
        $user->update([
            'password' => Hash::make('ResetPasswordNya'),
        ]);
        return redirect()->back()->with('success', $this->flashMessage('notifications.common.saved'));
    }

    protected function beforeStore(array $validated, Request $request): array
    {
        $this->rolesToSync = $validated['roles'];
        unset($validated['roles']);
        $validated['password'] = Hash::make((string)$validated['password']);
        return $validated;
    }

    protected function afterStore(Model $record, array $validated, Request $request): void
    {
        /** @var User $record */
        $record->assignRole($this->rolesToSync);
    }

    protected function rules(?Model $record = null): array
    {
        $passwordRule = $record
            ? [
                'nullable',
                'string',
                'min:6',
            ]
            : [
                'required',
                'string',
                'min:6',
            ];
        return [
            'name'     => [
                'required',
                'string',
                'max:255',
            ],
            'email'    => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($record?->getKey()),
            ],
            'password' => $passwordRule,
            'roles'    => [
                'required',
                'array',
                'min:1',
            ],
            'roles.*'  => [
                'required',
                Rule::exists('roles', 'name'),
            ],
        ];
    }

    protected function beforeUpdate(array $validated, Request $request, Model $record): array
    {
        $this->rolesToSync = $validated['roles'];
        unset($validated['roles']);
        if(!empty($validated['password'])) {
            $validated['password'] = Hash::make((string)$validated['password']);
        } else {
            unset($validated['password']);
        }
        return $validated;
    }

    protected function afterUpdate(Model $record, array $validated, Request $request): void
    {
        /** @var User $record */
        $record->syncRoles($this->rolesToSync);
    }

    protected function modelClass(): string
    {
        return User::class;
    }

    protected function routeName(): string
    {
        return 'users';
    }

    protected function indexComponent(): string
    {
        return 'backend/users/Index';
    }

    protected function formComponent(): string
    {
        return 'backend/users/Form';
    }

    protected function additionalIndexProps(Request $request): array
    {
        return [
            'roles' => $this->roleOptions(),
        ];
    }

    protected function roleOptions()
    {
        return Role::query()->select([
            'id',
            'name',
        ])->orderBy('name')->get();
    }

    protected function resolvedPermissions(): array
    {
        return array_merge(parent::resolvedPermissions(), [
            'reset' => $this->userCan('reset'),
        ]);
    }

    protected function additionalFormProps(Request $request, ?Model $record = null): array
    {
        $currentRoles = [];
        if($record instanceof User) {
            $record->loadMissing('roles');
            $currentRoles = $record->roles->pluck('name')->values()->all();
        }
        return [
            'roles'        => $this->roleOptions(),
            'currentRoles' => $currentRoles,
        ];
    }

    protected function exportValue(Model $record, string $column): mixed
    {
        if($column === 'roles' && $record instanceof User) {
            $record->loadMissing('roles');
            return $record->roles->pluck('name')->implode(' | ');
        }
        return parent::exportValue($record, $column);
    }
}
