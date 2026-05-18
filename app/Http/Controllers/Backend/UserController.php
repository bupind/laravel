<?php

namespace App\Http\Controllers\Backend;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends BaseCrudController
{
    protected int $perPage = 25;
    protected array $with = ['roles:id,name'];
    protected array $select = ['id', 'name', 'email', 'created_at'];
    protected array $searchableColumns = ['name', 'email'];
    protected bool $searchPrefix = true;
    protected array $excludeSortableColumns = ['password', 'remember_token', 'email_verified_at'];
    protected array $exportColumns = ['id', 'name', 'email', 'roles', 'created_at'];
    protected array $excludeExportColumns = ['password', 'remember_token'];
    protected array $exportColumnLabels = [
        'id' => 'ID',
        'name' => 'Name',
        'email' => 'Email',
        'roles' => 'Roles',
        'created_at' => 'Created At',
    ];
    protected string $orderBy = 'created_at';

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

    protected function rules(?Model $record = null): array
    {
        $passwordRule = $record
            ? [
                'nullable',
                'string',
                'min:6'
            ]
            : [
                'required',
                'string',
                'min:6'
            ];
        return [
            'name'     => [
                'required',
                'string',
                'max:255'
            ],
            'email'    => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($record?->getKey())
            ],
            'password' => $passwordRule,
            'roles'    => [
                'required',
                'array',
                'min:1'
            ],
            'roles.*'  => [
                'required',
                Rule::exists('roles', 'name')
            ],
        ];
    }

    protected function additionalIndexProps(Request $request): array
    {
        return [
            'roles' => $this->roleOptions(),
        ];
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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        $roles     = $validated['roles'];
        unset($validated['roles']);
        $validated['password'] = Hash::make((string)$validated['password']);
        $user = User::create($validated);
        $user->assignRole($roles);
        return redirect()->route('users.index')->with('success', $this->flashMessage($this->storeSuccessMessage()));
    }

    public function update(Request $request, mixed $record): RedirectResponse
    {
        $user      = $this->resolveRecord($record);
        $validated = $request->validate($this->rules($user));
        $roles     = $validated['roles'];
        unset($validated['roles']);
        if(!empty($validated['password'])) {
            $validated['password'] = Hash::make((string)$validated['password']);
        } else {
            unset($validated['password']);
        }
        $user->update($validated);
        $user->syncRoles($roles);
        return redirect()->route('users.index')->with('success', $this->flashMessage($this->updateSuccessMessage()));
    }

    public function resetPassword(User $user): RedirectResponse
    {
        $user->update([
            'password' => Hash::make('ResetPasswordNya'),
        ]);
        return redirect()->back()->with('success', $this->flashMessage('notifications.user.password_reset'));
    }

    protected function roleOptions()
    {
        return Role::query()->select(['id', 'name'])->orderBy('name')->get();
    }

    protected function exportValue(Model $record, string $column): mixed
    {
        if($column === 'roles' && $record instanceof User) {
            $record->loadMissing('roles');
            return $record->roles->pluck('name')->implode(' | ');
        }

        return parent::exportValue($record, $column);
    }

    protected function storeSuccessMessage(): string
    {
        return 'notifications.user.created';
    }

    protected function updateSuccessMessage(): string
    {
        return 'notifications.user.updated';
    }

    protected function deleteSuccessMessage(): string
    {
        return 'notifications.user.deleted';
    }
}
