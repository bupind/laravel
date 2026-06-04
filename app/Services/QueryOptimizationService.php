<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Service untuk eager loading dan query optimization
 * Menghindari N+1 query problem
 */
class QueryOptimizationService
{
    /**
     * Eager load relationships berdasarkan requested fields
     */
    public static function eagerLoadByFields(Builder $query, array $requestedFields = []): Builder
    {
        if (empty($requestedFields)) {
            return $query;
        }

        $relations = self::extractRelations($requestedFields);
        
        return $query->with($relations);
    }

    /**
     * Extract relationship names dari dot notation fields
     * Contoh: ['user.name', 'user.roles.name'] -> ['user', 'user.roles']
     */
    public static function extractRelations(array $fields): array
    {
        $relations = [];

        foreach ($fields as $field) {
            if (strpos($field, '.') !== false) {
                $parts = explode('.', $field);
                $relation = $parts[0];
                
                // Add nested relations
                for ($i = 1; $i < count($parts) - 1; $i++) {
                    $relation .= '.' . $parts[$i];
                    $relations[] = $relation;
                }
            }
        }

        return array_unique($relations);
    }

    /**
     * Select only specified columns dan relationships
     */
    public static function selectFields(Builder $query, array $fields): Builder
    {
        $model = $query->getModel();
        $table = $model->getTable();
        
        // Collect columns untuk model ini
        $columns = [];
        $relationLoads = [];

        foreach ($fields as $field) {
            if (strpos($field, '.') === false) {
                // Direct column
                $columns[] = $table . '.' . $field;
            } else {
                // Relation field
                $relationLoads[] = $field;
            }
        }

        // Always include primary key dan foreign keys
        if (empty($columns)) {
            $columns[] = $table . '.*';
        } else {
            $columns[] = $table . '.' . $model->getKeyName();
        }

        $query->select(array_unique($columns));

        return $query;
    }

    /**
     * Optimize query dengan select dan eager load
     */
    public static function optimizeQuery(Builder $query, array $fields = []): Builder
    {
        if (empty($fields)) {
            return $query;
        }

        $query = self::selectFields($query, $fields);
        $query = self::eagerLoadByFields($query, $fields);

        return $query;
    }

    /**
     * Paginate dengan optimization
     */
    public static function paginateOptimized(Builder $query, array $fields = [], int $perPage = 15)
    {
        $query = self::optimizeQuery($query, $fields);
        
        return $query->paginate($perPage);
    }

    /**
     * Get all dengan optimization
     */
    public static function getAllOptimized(Builder $query, array $fields = [])
    {
        $query = self::optimizeQuery($query, $fields);
        
        return $query->get();
    }
}
