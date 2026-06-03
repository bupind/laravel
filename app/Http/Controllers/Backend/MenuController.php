<?php
/**
 * MenuController
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $menus = Menu::with([
            'children' => fn($q) => $q->orderBy('order')->with([
                'children' => fn($q2) => $q2->orderBy('order'),
            ]),
        ])
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();
        if(!Schema::hasColumn('menus', 'location')) {
            $menus->each(fn(Menu $menu) => $this->applyLegacyLocation($menu));
        }
        return Inertia::render('backend/menus/Index', [
            'menuItems' => $menus,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'           => 'required|string',
            'translation_key' => 'nullable|string|max:255',
            'scope'           => 'required|in:backend,frontend',
            'location'        => 'nullable|in:sidebar,header,footer',
            'icon'            => 'nullable|string',
            'route'           => 'nullable|string',
            'parent_id'       => 'nullable|exists:menus,id',
            'order'           => 'nullable|integer',
            'permission_name' => 'nullable|string|exists:permissions,name',
        ]);
        $data = $this->normalizeMenuLocation($data);
        if(!isset($data['order'])) {
            $query = Menu::where('scope', $data['scope'])
                ->where('parent_id', $data['parent_id'] ?? null);
            if(Schema::hasColumn('menus', 'location')) {
                $query->where('location', $data['location']);
            }
            $data['order'] = $query->max('order') + 1;
        }
        if(!Schema::hasColumn('menus', 'location')) {
            unset($data['location']);
        }
        Menu::create($data);
        return redirect()->route('menus.index')->with('success', $this->flashMessage('notifications.common.saved'));
    }

    public function create(Request $request)
    {
        $menus        = Menu::orderBy('title')->get();
        if(!Schema::hasColumn('menus', 'location')) {
            $menus->each(fn(Menu $menu) => $this->applyLegacyLocation($menu));
        }
        $permissions  = Permission::orderBy('name')->pluck('name');
        $initialScope = $request->string('scope', 'backend')->toString();
        $initialLocation = $request->string('location', 'header')->toString();
        return Inertia::render('backend/menus/Form', [
            'parentMenus'     => $menus,
            'permissions'     => $permissions,
            'initialScope'    => in_array($initialScope, [
                'backend',
                'frontend',
            ], true) ? $initialScope : 'backend',
            'initialLocation' => in_array($initialLocation, [
                'header',
                'footer',
            ], true) ? $initialLocation : 'header',
        ]);
    }

    public function edit(Menu $menu)
    {
        $menus       = Menu::where('id', '!=', $menu->id)->orderBy('title')->get();
        if(!Schema::hasColumn('menus', 'location')) {
            $this->applyLegacyLocation($menu);
            $menus->each(fn(Menu $item) => $this->applyLegacyLocation($item));
        }
        $permissions = Permission::orderBy('name')->pluck('name');
        return Inertia::render('backend/menus/Form', [
            'menu'        => $menu,
            'parentMenus' => $menus,
            'permissions' => $permissions,
        ]);
    }

    public function destroy(Menu $menu)
    {
        $menu->children()->delete();
        $menu->delete();
        return redirect()->route('menus.index')->with('success', $this->flashMessage('notifications.common.deleted'));
    }

    public function reorder(Request $request)
    {
        $menus       = $request->input('menus');
        $updateOrder = function($items, $parentId = null) use (&$updateOrder) {
            foreach($items as $index => $item) {
                Menu::where('id', $item['id'])->update([
                    'order'     => $index + 1,
                    'parent_id' => $parentId,
                ]);
                if(!empty($item['children'])) {
                    $updateOrder($item['children'], $item['id']);
                }
            }
        };
        $updateOrder($menus);
        return redirect()->back()->with('success', $this->flashMessage('notifications.common.saved'));
    }

    public function update(Request $request, Menu $menu)
    {
        $data = $request->validate([
            'title'           => 'required|string',
            'translation_key' => 'nullable|string|max:255',
            'scope'           => 'required|in:backend,frontend',
            'location'        => 'nullable|in:sidebar,header,footer',
            'icon'            => 'nullable|string',
            'route'           => 'nullable|string',
            'parent_id'       => 'nullable|exists:menus,id|not_in:' . $menu->id,
            'order'           => 'nullable|integer',
            'permission_name' => 'nullable|string|exists:permissions,name',
        ]);
        $data = $this->normalizeMenuLocation($data);
        if(!isset($data['order'])) {
            $query = Menu::where('scope', $data['scope'])
                ->where('parent_id', $data['parent_id'] ?? null);
            if(Schema::hasColumn('menus', 'location')) {
                $query->where('location', $data['location']);
            }
            $data['order'] = $query->max('order') + 1;
        }
        if(!Schema::hasColumn('menus', 'location')) {
            unset($data['location']);
        }
        $menu->update($data);
        return redirect()->route('menus.index')->with('success', $this->flashMessage('notifications.common.saved'));
    }

    private function normalizeMenuLocation(array $data): array
    {
        $data['location'] = ($data['scope'] ?? 'backend') === 'frontend'
            ? ($data['location'] ?? 'header')
            : 'sidebar';

        if(!empty($data['parent_id'])) {
            $parent = Menu::query()->find($data['parent_id']);
            if($parent !== null) {
                $data['scope']    = $parent->scope;
                $data['location'] = $parent->location ?? 'sidebar';
            }
        }

        return $data;
    }

    private function applyLegacyLocation(Menu $menu): void
    {
        $menu->setAttribute('location', $menu->scope === 'frontend' ? 'header' : 'sidebar');
        $menu->children?->each(fn(Menu $child) => $this->applyLegacyLocation($child));
    }
}
