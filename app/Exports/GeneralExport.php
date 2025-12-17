<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class GeneralExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected $repository;
    protected $request;
    protected $columns;
    protected $headings;
    protected $sheetName;
    protected $with;

    public function __construct($repository, $request = [], $sheetName = null)
    {
        $this->repository = $repository;
        $this->request    = $request;
        $this->columns    = $this->repository->customExportColumns();
        if(empty($this->columns)) {
            $this->columns = $this->repository->getInstanceModel()->getFillable();
        }
        $this->headings  = $this->repository->customExportHeadings() ?: $this->columns;
        $this->sheetName = $sheetName ?: $this->repository->getInstanceModel()->getTable();
        $this->with      = $this->repository->customExportWith() ?: [];
    }

    public function collection()
    {
        $model = $this->repository->getInstanceModel();
        $query = $model->with($this->with);
        // Terapkan filter
        if(method_exists($model, 'scopeFilter')) {
            $query->filter($this->request['filters'] ?? []);
        }
        // Pagination jika page
        if(($this->request['scope'] ?? 'page') === 'page') {
            $start  = (int)($this->request['start'] ?? 0);
            $length = (int)($this->request['length'] ?? 10);
            $query->skip($start)->take($length);
        }
        return $query->get();
    }

    public function map($row): array
    {
        return array_map(function($column) use ($row) {
            if(str_contains($column, '.')) {
                $relations         = explode('.', $column);
                $relationName      = $relations[0];
                $relationAttribute = $relations[1];
                if($row->relationLoaded($relationName)) {
                    $relationData = $row->{$relationName};
                    if($relationData instanceof Collection) {
                        return (string)$relationData->pluck($relationAttribute)->implode(', ');
                    } elseif($relationData instanceof Model) {
                        return (string)$relationData->{$relationAttribute};
                    }
                }
            }
            return (string)$row->{$column};
        }, $this->columns);
    }

    public function headings(): array
    {
        return $this->headings;
    }

    public function title(): string
    {
        return $this->sheetName;
    }
}
