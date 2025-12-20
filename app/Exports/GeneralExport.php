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
        $this->columns    = $request['columns'] ?? $this->repository->getInstanceModel()->getFillable();
        $this->headings   = array_map(fn($col) => ucwords(str_replace('_', ' ', $col)), $this->columns);
        $this->sheetName  = $sheetName ?: $this->repository->getInstanceModel()->getTable();
        $this->with       = $this->repository->customExportWith() ?: [];
    }

    public function collection()
    {
        $model = $this->repository->getInstanceModel();
        $query = $model->with($this->with);
        if(method_exists($model, 'scopeFilter')) {
            $query->filter($this->request['filters'] ?? []);
        }
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
                $parts = explode('.', $column);
                $value = $row;
                foreach($parts as $part) {
                    if(is_null($value)) break;
                    if($value instanceof Collection) {
                        $value = $value->map(fn($item) => $item->{$part} ?? null)->filter()->values();
                    } elseif($value instanceof Model) {
                        $value = $value->{$part} ?? null;
                    } else {
                        $value = null;
                    }
                }
                if($value instanceof Collection) {
                    return $value->implode(', ');
                }
                return (string)($value ?? '');
            }
            return (string)($row->{$column} ?? '');
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
