<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\SettingApp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TranslationController extends Controller
{
    public function edit(): Response
    {
        $setting = SettingApp::first();

        return Inertia::render('backend/settings/translations', [
            'translations' => $setting?->translations ?? [],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'translations' => ['required', 'array'],
            'translations.id' => ['required', 'array'],
            'translations.en' => ['required', 'array'],
        ]);

        $setting = SettingApp::firstOrNew();
        if (!$setting->exists && empty($setting->nama_app)) {
            $setting->nama_app = (string) config('app.name', 'Laravel');
        }

        $setting->fill([
            'translations' => $validated['translations'],
        ])->save();

        return redirect()->back()->with('success', $this->flashMessage('settings.translations.saved'));
    }
}
