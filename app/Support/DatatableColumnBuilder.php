<?php

namespace App\Support;
class DatatableColumnBuilder
{
    public $name;
    public $callback;
    public $label;
    public $orderable  = true;
    public $searchable = true;
    public $visible    = true;
    public $className;
    public $width;
    public $classes;

    public function __construct($name, $callback)
    {
        $this->name     = $name;
        $this->callback = $callback;
        $this->label    = ucfirst($name);
    }

    public function label($label)
    {
        $this->label = $label;
        return $this;
    }

    public function orderable($orderable = true)
    {
        $this->orderable = $orderable;
        return $this;
    }

    public function searchable($searchable = true)
    {
        $this->searchable = $searchable;
        return $this;
    }

    public function visible($visible = true)
    {
        $this->visible = $visible;
        return $this;
    }

    public function className($className)
    {
        $this->className = $className;
        return $this;
    }

    public function width($width)
    {
        $this->width = $width;
        return $this;
    }

    public function classes($classes)
    {
        $this->classes = $classes;
        return $this;
    }
}
