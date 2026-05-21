<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\SettingApp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SettingAppController extends Controller
{
    public function edit()
    {
        $setting = SettingApp::first();
        return Inertia::render('backend/settingapp/Form', ['setting' => $setting]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'nama_app'     => 'required|string|max:255',
            'deskripsi'    => 'nullable|string',
            'logo'         => 'nullable|file|image|max:2048',
            'favicon'      => 'nullable|file|image|max:1024',
            'warna'        => 'nullable|string|max:20',
            'seo'          => 'nullable|array',
            'translations' => 'nullable|array',
        ]);
        $setting = SettingApp::firstOrNew();
        if($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('logo', 'public');
        } else {
            unset($data['logo']);
        }
        if($request->hasFile('favicon')) {
            $data['favicon'] = $request->file('favicon')->store('favicon', 'public');
        } else {
            unset($data['favicon']);
        }
        $setting->fill($data)->save();
        Cache::forget('setting_app');
        return redirect()->back()->with('success', $this->flashMessage('notifications.common.saved'));
    }
}



