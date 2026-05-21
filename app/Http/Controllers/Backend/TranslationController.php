<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\SettingApp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class TranslationController extends Controller
{
    public function edit(): Response
    {
        $this->authorizeTranslation('view');

        $setting = SettingApp::first();

        return Inertia::render('backend/translations/Index', [
            'translations' => $setting?->translations ?? [],
            'crud' => $this->crudPayload(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $this->authorizeTranslation('update');

        $validated = $request->validate([
            'translations' => [
                'required',
                'array',
            ],
            'translations.id' => [
                'required',
                'array',
            ],
            'translations.en' => [
                'required',
                'array',
            ],
        ]);
        $setting = SettingApp::firstOrNew();
        if (! $setting->exists && empty($setting->nama_app)) {
            $setting->nama_app = (string) config('app.name', 'Laravel');
        }
        $setting->fill([
            'translations' => [
                'id' => $validated['translations']['id'],
                'en' => $validated['translations']['en'],
            ],
        ])->save();
        Cache::forget('setting_app');

        return redirect()->back()->with('success', $this->flashMessage('notifications.common.saved'));
    }

    private function crudPayload(): array
    {
        return [
            'modal' => false,
            'mode' => null,
            'open' => false,
            'permissions' => [
                'view' => $this->userCanTranslation('view'),
                'create' => false,
                'update' => $this->userCanTranslation('update'),
                'delete' => false,
                'export' => false,
                'sync' => $this->userCanTranslation('update'),
            ],
            'resource' => [
                'name' => 'translations',
                'singular' => 'translation',
                'label' => 'Translations',
                'title' => 'Translations',
                'permission_prefix' => 'translations',
                'routes' => [
                    'index' => route('translations.edit', absolute: false),
                    'update' => route('translations.update', absolute: false),
                ],
            ],
        ];
    }

    private function authorizeTranslation(string $action): void
    {
        abort_unless($this->userCanTranslation($action), 403);
    }

    private function userCanTranslation(string $action): bool
    {
        $permissions = match ($action) {
            'view' => [
                'translations-view',
                'settings-view',
            ],
            'update' => [
                'translations-update',
                'settings-update',
            ],
            default => ["translations-{$action}"],
        };

        $user = request()->user();
        if ($user === null) {
            return false;
        }

        foreach ($permissions as $permission) {
            try {
                if ($user->can($permission)) {
                    return true;
                }
            } catch (\Throwable) {
                //
            }
        }

        return false;
    }
}
