<?php

namespace App\View\Components;

use App\Support\ConfigDTO;
use Illuminate\View\Component;

class Datatable extends Component
{
    public           $id;
    public ConfigDTO $config;
    public           $heads;
    public           $datas;
    public           $route;

    public function __construct($id, $heads = [], $datas = [], $route = null, ConfigDTO $config)
    {
        $this->id     = $id;
        $this->heads  = $heads;
        $this->datas  = $datas;
        $this->route  = $route ?? ($datas['route'] ?? null);
        $this->config = $config;
    }

    public function render()
    {
        return view('components.datatable');
    }
}
