<?php

namespace App\Repositories;

use App\Models\Menu;
use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;

class MenuRepository
{
    use BaseRepository;
    use BaseDatatable;
    public function __construct(Menu $model)
    {
        $this->model = $model;
        $this->with = ['roles'];
    }

    public function customTables($table)
    {
        $table->add('name', function ($model) {
            if ($model->header) {
                return $model->header . ' ' . badge('header', 'secondary');
            }
            return $model->text;
        })->label('Name');
        $table->add('roles', function ($model) {
            return collect($model->role)->map(fn($role) => badge($role))->join(' ');
        })->label('Roles')->searchable(false);
    }

    public function customCreateOrEdit($data, $item = null)
    {
        if ($item) {
            $data['is_header'] = !is_null($item->header);
            $data['name'] = $item->header ?? $item->text;
        }
        return $data;
    }

    public function beforeAction($data, $method)
    {
        if (isset($data['is_header']) && $data['is_header']) {
            $data['header'] = $data['name'];
            $data['text'] = null;
        } else {
            $data['text'] = $data['name'];
            $data['header'] = null;
        }
        unset($data['name']);
        unset($data['is_header']);

        return [
            'error' => 0,
            'message' => null,
            'data' => $data
        ];
    }
}
