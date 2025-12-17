<?php

namespace App\Repositories;

use App\Models\Product;
use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;

class ProductRepository
{
    use BaseRepository, BaseDatatable;

    private $categoriesRepository;

    public function __construct(Product $model, CategoriesRepository $categoriesRepository)
    {
        $this->model                = $model;
        $this->categoriesRepository = $categoriesRepository;
        $this->with                 = ['category'];
    }

    public function customCreateOrEdit($data, $item = null)
    {
        $data['categories'] = $this->categoriesRepository->getAll()->pluck('name', 'id')->toArray();
        return $data;
    }

    public function customIndex($data)
    {
        $data['categories'] = $this->categoriesRepository->getAll()->pluck('name', 'id')->toArray();
        return $data;
    }

    public function customTables($table)
    {
        $table->name->label('Name');
        $table->add('category', function($model) {
            return $model->category->name ?? '-';
        })->label('Category');
        $table->add('price', function($model) {
            return 'Rp ' . number_format($model->price, 2, ',', '.');
        })->label('Price');
        $table->stock->label('Stock');
    }

    public function customExportHeadings()
    {
        return [
            'Name',
            'Category',
            'Description',
            'Price',
            'Stock'
        ];
    }

    public function customExportColumns()
    {
        return [
            'name',
            'category.name',
            'description',
            'price',
            'stock'
        ];
    }

    public function customExportWith()
    {
        return ['category'];
    }
}
