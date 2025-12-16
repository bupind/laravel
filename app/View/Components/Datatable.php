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
    public           $moreActions;
//[
//'label' => 'Import',
//'icon' => 'ki-upload',
//'url' => '#importModal',
//'class' => 'btn-warning',
//'attributes' => 'data-bs-toggle=modal',
//]

    public function __construct($id, $heads = [], $datas = [], $moreActions = [], $route = null, ConfigDTO $config)
    {
        $this->id          = $id;
        $this->heads       = $heads;
        $this->datas       = $datas;
        $this->route       = $route ?? ($datas['route'] ?? null);
        $this->config      = $config;
        $this->moreActions = $moreActions;
    }

    public function render()
    {
        return view('components.datatable');
    }
}
