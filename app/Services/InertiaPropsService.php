<?php

namespace App\Services;

use Illuminate\Support\Arr;

/**
 * Service untuk optimize Inertia props
 * Kurangi ukuran data yang dikirim ke frontend
 */
class InertiaPropsService
{
    /**
     * Select only specific fields dari model/collection
     * Useful untuk reduce payload size
     */
    public static function selectFields($data, array $fields)
    {
        if (is_null($data)) {
            return null;
        }

        // Handle collection
        if (is_array($data) && isset($data[0])) {
            return array_map(fn($item) => self::selectFieldsFromItem($item, $fields), $data);
        }

        // Handle single model
        return self::selectFieldsFromItem($data, $fields);
    }

    /**
     * Select fields dari single item
     */
    private static function selectFieldsFromItem($item, array $fields)
    {
        if (is_object($item) && method_exists($item, 'only')) {
            // Eloquent model
            return $item->only($fields);
        }

        if (is_array($item)) {
            return Arr::only($item, $fields);
        }

        // Fallback
        return $item;
    }

    /**
     * Transform paginated response untuk reduce payload
     */
    public static function transformPaginatedData($paginated, array $fields)
    {
        $data = $paginated->getCollection()
            ->map(fn($item) => self::selectFieldsFromItem($item, $fields))
            ->all();

        return [
            'data' => $data,
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
            'from' => $paginated->firstItem(),
            'to' => $paginated->lastItem(),
            'links' => self::paginationLinks($paginated),
        ];
    }

    /**
     * Get pagination links
     */
    public static function paginationLinks($paginated)
    {
        return [
            'first' => $paginated->url(1),
            'last' => $paginated->url($paginated->lastPage()),
            'prev' => $paginated->previousPageUrl(),
            'next' => $paginated->nextPageUrl(),
        ];
    }

    /**
     * Lazy load relations - return only IDs untuk frontend-side loading
     */
    public static function lazyLoadRelation($item, array $relationIds)
    {
        if (is_object($item) && method_exists($item, 'toArray')) {
            $array = $item->toArray();
        } else {
            $array = (array)$item;
        }

        foreach ($relationIds as $relation) {
            if (isset($array[$relation])) {
                unset($array[$relation]);
                $array[$relation . '_ids'] = collect($array[$relation] ?? [])
                    ->pluck('id')
                    ->all();
            }
        }

        return $array;
    }

    /**
     * Merge shared props dengan page props
     */
    public static function mergeProps(array $sharedProps, array $pageProps): array
    {
        return array_merge($sharedProps, $pageProps);
    }

    /**
     * Create minimal props untuk list pages
     */
    public static function createListProps(
        array $data,
        array $filters = [],
        array $metadata = []
    ): array {
        return [
            'data' => $data,
            'filters' => $filters,
            'pagination' => [
                'current_page' => $metadata['current_page'] ?? 1,
                'per_page' => $metadata['per_page'] ?? 15,
                'total' => $metadata['total'] ?? 0,
                'last_page' => $metadata['last_page'] ?? 1,
            ],
        ];
    }

    /**
     * Create form props dengan minimal data
     */
    public static function createFormProps(
        ?array $item = null,
        array $relatedData = [],
        array $errors = []
    ): array {
        return [
            'item' => $item,
            'relatedData' => $relatedData,
            'errors' => $errors,
        ];
    }
}
