<?php
/**
 * SettingAppController
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\SettingApp;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SettingAppController extends Controller
{
    public function edit()
    {
        return Inertia::render('backend/settingapp/Form', [
            'settings' => SettingApp::formRows(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings'         => 'required|array',
            'settings.*.key'   => 'required|string|max:100|regex:/^[A-Za-z0-9_.-]+$/',
            'settings.*.value' => 'nullable|string',
            'files'            => 'nullable|array',
            'files.logo'       => 'nullable|file|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
            'files.favicon'    => 'nullable|file|image|mimes:jpg,jpeg,png,webp,ico|max:1024',
        ]);
        $existingSettings = SettingApp::settings();
        $rows             = collect($request->input('settings', []))
            ->map(fn(array $row) => [
                'key'   => trim((string)($row['key'] ?? '')),
                'value' => (string)($row['value'] ?? ''),
            ])
            ->filter(fn(array $row) => $row['key'] !== '')
            ->unique('key')
            ->values();
        foreach([
                    'logo',
                    'favicon',
                ] as $fileKey) {
            $file = $request->file("files.{$fileKey}");
            if($file instanceof UploadedFile && $file->isValid()) {
                if(($existingSettings[$fileKey] ?? null) && Storage::disk('public')
                        ->exists($existingSettings[$fileKey])) {
                    Storage::disk('public')->delete($existingSettings[$fileKey]);
                }
                $uploadedPath = $this->uploadFile($file, $fileKey);
                $rows         = $rows
                    ->reject(fn(array $row) => $row['key'] === $fileKey)
                    ->push([
                        'key'   => $fileKey,
                        'value' => $uploadedPath,
                    ])
                    ->values();
            }
        }
        $existingKeys  = SettingApp::rows()->pluck('key')->all();
        $submittedKeys = $rows->pluck('key')->all();
        SettingApp::deleteKeys(array_values(array_diff($existingKeys, $submittedKeys)));
        SettingApp::setMany($rows->pluck('value', 'key')->all());
        Cache::forget('setting_app');
        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    private function uploadFile(UploadedFile $file, string $folder): string
    {
        $disk      = Storage::disk('public');
        $extension = $file->getClientOriginalExtension() ?: $file->guessExtension();
        $filename  = Str::uuid() . '.' . $extension;
        $destDir   = storage_path('app/public/' . $folder);
        if(!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }
        $file->move($destDir, $filename);
        return $folder . '/' . $filename;
    }
}
