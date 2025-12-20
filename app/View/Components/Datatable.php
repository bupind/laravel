<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Datatable extends Component
{
    public $id;
    public $permissions;
    public $table;
    public $route;

    public function __construct($id, $route, $permissions = [], $table = [])
    {
        $this->id          = $id;
        $this->permissions = $permissions;
        $this->table       = $table;
        $this->route       = $route ?? ($datas['route'] ?? null);
    }

    public function render()
    {
        return view('components.datatable');
    }
}
