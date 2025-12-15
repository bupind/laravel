<?php

namespace App\View\Components;

use Illuminate\View\Component;

class FormBuilder extends Component
{
    public $fields;
    public $item;

    public function __construct($fields = [], $item = null)
    {
        $this->fields = $fields;
        $this->item   = $item;
    }

    public function render()
    {
        return view('components.form-builder');
    }
}
