<?php

namespace App\Repositories;

use App\Models\Categories;
use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;

class CategoriesRepository
{
    use BaseRepository, BaseDatatable;

    public function __construct(Categories $model)
    {
        $this->model     = $model;
        $this->withCount = ['products'];
    }

    public function customTables($table)
    {
        $table->name->label('Name');
        $table->add('products_count', function($model) {
            return $model->products_count;
        })->label('Products');
    }
}
