<?php

namespace App\Traits;

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

    public function getAll($data = [])
    {
        $query = $this->model->newQuery();
        if(!empty($this->orderBy)) {
            $query->orderBy($this->orderBy, $this->orderBySort);
        }
        if(method_exists($this->model, 'scopeFilter')) {
            $query->filter($data);
        }
        return $query->get();
    }

    public function getInstanceModel()
    {
        return $this->model;
    }

    public function create($data)
    {
        return rescue(function() use ($data) {
            DB::beginTransaction();
            $data   = $this->prepareSaveData($data, 'create');
            $record = $this->model::create($data);
            DB::commit();
            return $record;
        }, function(Exception $e) {
            DB::rollBack();
            throw $e;
        });
    }

    public function prepareSaveData($data, $method, $record = null)
    {
        return $data;
    }

    public function update($id, $data)
    {
        return rescue(function() use ($id, $data) {
            DB::beginTransaction();
            $record = $this->getById($id);
            $data   = $this->prepareSaveData($data, 'update', $record);
            $record->update($data);
            DB::commit();
            return $record;
        }, function(Exception $e) {
            DB::rollBack();
            throw $e;
        });
    }

    public function getById($id)
    {
        return $this->model->findOrFail($id);
    }

    public function bulkDelete(array $ids)
    {
        $this->model->whereIn('id', $ids)->delete();
    }

    public function delete($id)
    {
        return rescue(function() use ($id) {
            DB::beginTransaction();
            $record = $this->getById($id);
            $record->delete();
            DB::commit();
            return $record;
        }, function(Exception $e) {
            DB::rollBack();
            throw $e;
        });
    }


    public function beforeAction($data, $method)
    {
        return [
            'error' => 0,
            'data'  => $data
        ];
    }

    public function customExportColumns() { return []; }

    public function customExportHeadings() { return []; }

    public function customExportWith() { return []; }

    public function formFields($item = null, $scenario = 'default')
    {
        $fields = [];
        if(method_exists($this, 'formRules')) {
            $rules = $this->formRules();
            foreach($rules as $key => $field) {
                if(!isset($field['name'])) {
                    $field['name'] = $key;
                }
                if($item && isset($item->{$field['name']})) {
                    $field['value'] = $item->{$field['name']};
                }
                $fields[] = $field;
            }
        } else {
            foreach($this->model->getFillable() as $col) {
                $fields[] = [
                    'name'  => $col,
                    'type'  => 'text',
                    'label' => ucfirst(str_replace('_', ' ', $col)),
                    'value' => $item->{$col} ?? null,
                    'col'   => 'col-12',
                ];
            }
        }
        if(method_exists($this, 'scenarios')) {
            $scenarioFields = $this->scenarios()[$scenario] ?? [];
            $fields         = array_filter($fields, fn($f) => in_array($f['name'], $scenarioFields));
        }
        return array_values($fields);
    }
}
