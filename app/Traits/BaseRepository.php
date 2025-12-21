<?php

namespace App\Traits;

use App\Constants\DataConstant;
use App\Support\ConfigDTO;
use Exception;
use Illuminate\Support\Facades\DB;

trait BaseRepository
{
    protected           $model;
    protected string    $orderBy     = 'created_at';
    protected string    $orderBySort = 'desc';
    protected ConfigDTO $config;

    public function setConfig(ConfigDTO $config): void
    {
        $this->config = $config;
    }

    public function config(): ConfigDTO
    {
        return $this->config;
    }

    public function getAll(array $filters = [])
    {
        $query = $this->model->newQuery();
        if(!empty($this->orderBy)) {
            $query->orderBy($this->orderBy, $this->orderBySort);
        }
        if(method_exists($this->model, 'scopeFilter')) {
            $query->filter($filters);
        }
        return $query->get();
    }

    public function getInstanceModel()
    {
        return $this->model;
    }

    public function create(array $data)
    {
        return $this->wrapTransaction(function() use ($data) {
            $data = $this->prepareSaveData($data, 'create');
            return $this->model::create($data);
        });
    }

    protected function wrapTransaction(callable $callback)
    {
        return rescue(function() use ($callback) {
            DB::beginTransaction();
            $result = $callback();
            DB::commit();
            return $result;
        }, function(Exception $e) {
            DB::rollBack();
            throw $e;
        });
    }

    public function prepareSaveData(array $data, string $method, $record = null): array
    {
        return $data;
    }

    public function update($id, array $data)
    {
        return $this->wrapTransaction(function() use ($id, $data) {
            $record = $this->getById($id);
            $data   = $this->prepareSaveData($data, 'update', $record);
            $record->update($data);
            return $record;
        });
    }

    public function getById($id)
    {
        return $this->model->findOrFail($id);
    }

    public function bulkDelete(array $ids): void
    {
        $this->model->whereIn('id', $ids)->delete();
    }

    public function delete($id)
    {
        return $this->wrapTransaction(function() use ($id) {
            $record = $this->getById($id);
            $record->delete();
            return $record;
        });
    }

    public function beforeAction($data, $method): array
    {
        return [
            'error' => 0,
            'data'  => $data
        ];
    }

    public function customExportWith(): array { return []; }

    public function formFields($item = null, string $scenario = 'default'): array
    {
        return $this->baseFormFields($item, $scenario);
    }

    protected function baseFormFields($item = null, string $scenario = 'default'): array
    {
        $fields = [];
        if(method_exists($this, 'formRules')) {
            foreach($this->formRules() as $key => $field) {
                if(isset($field['scenario']) && !in_array($scenario, $field['scenario'])) {
                    continue;
                }
                $field['name'] ??= $key;
                if($item && isset($item->{$field['name']})) {
                    $field['value'] = $item->{$field['name']};
                }
                $fields[] = $field;
            }
        } else {
            foreach($this->model->getFillable() as $col) {
                $fields[] = [
                    'name'  => $col,
                    'type'  => DataConstant::TYPE_TEXT,
                    'label' => ucfirst(str_replace('_', ' ', $col)),
                    'value' => $item->{$col} ?? null,
                    'col'   => 'col-12',
                ];
            }
        }
        return array_values($fields);
    }
}
