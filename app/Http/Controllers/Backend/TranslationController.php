<?php
/**
 * TranslationController
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Translation;
use App\Services\Translations\TranslationService;
use App\Services\Translations\TranslationSyncService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TranslationController extends Controller
{
    public function edit(TranslationService $translationService): Response
    {
        $this->authorizeTranslation('view');
        $translations = Translation::query()
            ->orderBy('scope')
            ->orderBy('namespace')
            ->orderBy('key')
            ->orderBy('locale')
            ->get([
                'id',
                'locale',
                'scope',
                'namespace',
                'key',
                'value',
                'is_active',
            ]);
        $rows         = $translations
            ->groupBy(fn(Translation $translation) => "{$translation->namespace}|{$translation->key}")
            ->map(function($items) {
                $scopeRank = [
                    'global'     => 0,
                    'common'     => 1,
                    'auth'       => 2,
                    'validation' => 3,
                    'api'        => 4,
                    'backend'    => 5,
                    'frontend'   => 6,
                    'mobile'     => 7,
                ];
                $sorted    = $items->sortBy(fn(Translation $item) => $scopeRank[$item->scope] ?? 99)->values();
                $first     = $sorted->first();
                $values    = [];
                foreach($sorted as $item) {
                    if(!array_key_exists($item->locale, $values) && $item->value !== '') {
                        $values[$item->locale] = $item->value;
                    }
                }
                return [
                    'scope'     => $first->scope,
                    'namespace' => $first->namespace,
                    'key'       => $first->key,
                    'full_key'  => "{$first->namespace}.{$first->key}",
                    'is_active' => $items->contains(fn(Translation $item) => $item->is_active),
                    'values'    => $values,
                ];
            })
            ->values()
            ->all();
        return Inertia::render('backend/translations/Index', [
            'rows'          => $rows,
            'scopes'        => [
                'global',
                'common',
                'backend',
                'frontend',
                'api',
                'mobile',
                'auth',
                'validation',
            ],
            'locales'       => $translationService->locales(),
            'localeOptions' => $translationService->localeOptions(),
            'defaultLocale' => $translationService->defaultLocale(),
            'crud'          => $this->crudPayload(),
        ]);
    }

    private function authorizeTranslation(string $action): void
    {
        abort_unless($this->userCanTranslation($action), 403);
    }

    private function userCanTranslation(string $action): bool
    {
        $permissions = match ($action) {
            'view'   => [
                'translations-view',
                'settings-view',
            ],
            'update' => [
                'translations-update',
                'settings-update',
            ],
            default  => ["translations-{$action}"],
        };
        $user        = request()->user();
        if($user === null) {
            return false;
        }
        foreach($permissions as $permission) {
            try {
                if($user->can($permission)) {
                    return true;
                }
            } catch(Throwable) {
            }
        }
        return false;
    }

    private function crudPayload(): array
    {
        return [
            'modal'       => false,
            'mode'        => null,
            'open'        => false,
            'permissions' => [
                'view'   => $this->userCanTranslation('view'),
                'create' => false,
                'update' => $this->userCanTranslation('update'),
                'delete' => false,
                'export' => false,
                'sync'   => $this->userCanTranslation('update'),
            ],
            'resource'    => [
                'name'              => 'translations',
                'singular'          => 'translation',
                'label'             => 'Translations',
                'title'             => 'Translations',
                'permission_prefix' => 'translations',
                'routes'            => [
                    'index'  => route('translations.edit', absolute: false),
                    'update' => route('translations.update', absolute: false),
                    'sync'   => route('translations.sync', absolute: false),
                ],
            ],
        ];
    }

    public function update(Request $request, TranslationService $translationService): RedirectResponse
    {
        $this->authorizeTranslation('update');
        $validated     = $request->validate([
            'rows'             => [
                'required',
                'array',
            ],
            'rows.*.scope'     => [
                'required',
                'string',
                'max:50',
            ],
            'rows.*.namespace' => [
                'required',
                'string',
                'max:100',
            ],
            'rows.*.key'       => [
                'required',
                'string',
                'max:255',
            ],
            'rows.*.is_active' => [
                'nullable',
                'boolean',
            ],
            'rows.*.values'    => [
                'required',
                'array',
            ],
            'rows.*.values.*'  => [
                'nullable',
                'string',
            ],
            'locales'          => [
                'nullable',
                'array',
            ],
            'locales.*.code'   => [
                'required_with:locales',
                'string',
                'max:20',
            ],
            'locales.*.label'  => [
                'nullable',
                'string',
                'max:80',
            ],
        ]);
        $localeOptions = $validated['locales'] ?? [];
        $activeLocales = collect($localeOptions)
            ->map(fn(array $locale): string => str_replace('_', '-', strtolower(trim((string)($locale['code'] ?? '')))))
            ->filter(fn(string $locale): bool => preg_match('/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/', $locale) === 1)
            ->unique()
            ->values()
            ->all();
        if($activeLocales === []) {
            $activeLocales = $translationService->locales();
        }
        DB::transaction(function() use ($validated, $translationService, $localeOptions, $activeLocales) {
            $translationService->saveLocaleOptions($localeOptions, $activeLocales[0] ?? null);
            Translation::query()->whereNotIn('locale', $activeLocales)->delete();
            foreach($validated['rows'] as $row) {
                foreach($row['values'] as $locale => $rawValue) {
                    $locale = str_replace('_', '-', strtolower(trim((string)$locale)));
                    if(!in_array($locale, $activeLocales, true)) {
                        continue;
                    }
                    if(!preg_match('/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/', $locale)) {
                        continue;
                    }
                    $value = trim((string)$rawValue);
                    if($value === '') {
                        Translation::query()
                            ->where('locale', $locale)
                            ->where('scope', $row['scope'])
                            ->where('namespace', $row['namespace'])
                            ->where('key', $row['key'])
                            ->delete();
                        continue;
                    }
                    Translation::query()->updateOrCreate(
                        [
                            'locale'    => $locale,
                            'scope'     => $row['scope'],
                            'namespace' => $row['namespace'],
                            'key'       => $row['key'],
                        ],
                        [
                            'value'     => $value,
                            'is_active' => (bool)($row['is_active'] ?? true),
                        ],
                    );
                }
            }
        });
        $translationService->flush();
        return redirect()->back()->with('success', $this->flashMessage('notifications.common.saved'));
    }

    public function sync(TranslationSyncService $translationSyncService): RedirectResponse
    {
        $this->authorizeTranslation('update');
        $result = $translationSyncService->sync();
        return redirect()
            ->route('translations.edit')
            ->with('success', sprintf(
                'Translations synchronized. Scanned %d keys, added %d rows, consolidated %d duplicate keys, deleted %d unused rows.',
                $result['scanned'],
                $result['added'],
                $result['consolidated'] ?? 0,
                $result['deleted'],
            ));
    }
}
