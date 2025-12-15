<?php

namespace App\Http\Controllers;

use App\Models\Permissions;
use Illuminate\Http\Request;
use App\Models\Roles;
use Yajra\DataTables\DataTables;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $roles = Roles::with('permissions');
            return Datatables::of($roles)
                    ->addIndexColumn()
                    ->addColumn('check', function($row){
                           $btn = '<div class="form-check form-check-sm form-check-custom form-check-solid">
                           <input class="form-check-input" type="checkbox" value="1" data-id="'.$row->id.'" />
                       </div>';
                            return $btn;
                    })
                    ->addColumn('permissions', function($row){
                        $permissions = $row->permissions->pluck('name')->toArray();
                        $html = '';
                        foreach ($permissions as $permission) {
                            $html .= '<span class="badge badge-light-success">' . htmlspecialchars($permission) . '</span> ';
                        }
                        return $html;
                    })
                    ->addColumn('buttons', function($row){
                        $btn = '<button data-id="'.$row->id.'" type="button" class="btn btn-active-light-success btn-sm" data-kt-role-table-filter="edit" data-bs-toggle="tooltip" title="Editar">
                            <i class="ki-outline ki-pencil text-success fs-2">
                            </i>
                        </button>';
                        return $btn;
                    })
                    ->rawColumns(['check', 'buttons', 'permissions'])
                    ->make(true);
        }

        $permissions = Permissions::select("name")->get();
        return view('admin/roles', compact('permissions'));
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $role = Role::updateOrCreate(

            ['id'=>$request->get('id_rol')],
            ['name' => $request->input('name'), 'guard_name' => 'web'],
        );
        $data = json_decode($request->get('permissions'), true);
        $values = array_map(fn($item) => $item['value'], $data);
        $role->syncPermissions($values);
        return response()->json(["OK"=>$values]);
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $rol=Roles::with('permissions')->where('id', $id)->first();

        return response()->json(['rol'=>$rol]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy_roles(Request $request)
    {
        $ids = $request->input('ids');
        Roles::whereIn('id', $ids)->delete();
        return response()->json(["OK"=>"Eliminados"]);
    }
}
