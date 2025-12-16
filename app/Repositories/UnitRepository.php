<?php

namespace App\Repositories;

use App\Models\Unit;
use App\Traits\BaseDatatable;
use App\Traits\BaseRepository;
use App\Traits\LogsActivity;

class UnitRepository
{
    use BaseRepository, BaseDatatable, LogsActivity;
    public function __construct(Unit $model)
    {
        $this->model = $model;
         $this->datatableColumns();
    }
    private function datatableColumns()
    {
        $this->addColumn('name');
        $this->addColumn('status', function($row) {
            $statuses = Unit::statuses();
            return $statuses[$row->status] ?? $row->status;
        });
    }
    public function formRules(): array
    {
        return [
            [
                'name'  => 'name',
                'label' => 'Name',
                'type'  => 'text',
                'col'   => 'col-6',
            ],
            [
                'name'    => 'status',
                'type'    => 'select',
                'label'   => 'Status',
                'col'     => 'col-6',
                'options' => Unit::statuses(),
            ],
        ];
    }
}
