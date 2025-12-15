<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permissions;
use Yajra\DataTables\DataTables;
use Illuminate\Support\Facades\Input;

class PermissionsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $permissions = Permissions::all();
            return Datatables::of($permissions)
                    ->addIndexColumn()
                    ->addColumn('check', function($row){
                           $btn = '<div class="form-check form-check-sm form-check-custom form-check-solid">
                           <input class="form-check-input" type="checkbox" value="1" data-id="'.$row->id.'" />
                       </div>';
                            return $btn;
                    })
                    ->addColumn('buttons', function($row){
                        $btn = '<button data-id="'.$row->id.'" type="button" class="btn btn-active-light-success btn-sm" data-kt-permission-table-filter="edit" data-bs-toggle="tooltip" title="Editar">
                            <i class="ki-outline ki-pencil text-success fs-2">
                            </i>
                        </button>';
                        return $btn;
                    })
                    ->rawColumns(['check', 'buttons'])
                    ->make(true);
        }

        return view('admin/permissions');
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Permissions::updateOrCreate(

            ['id'=>$request->get('id_rol')],
            ['name' => $request->input('name'), 'guard_name' => 'web'],
        );
        return response()->json(["OK"=>"Se guardo correctamente"]);
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $rol=Permissions::find($id);

        return response()->json(['rol'=>$rol]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy_permissions(Request $request)
    {
        $ids = $request->input('ids');
        Permissions::whereIn('id', $ids)->delete();
        return response()->json(["OK"=>"Eliminados"]);
    }
}
