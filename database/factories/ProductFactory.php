<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    private const NAME_PREFIXES = [
        'Starter',
        'Business',
        'Premium',
        'Essential',
        'Advanced',
        'Compact',
        'Classic',
        'Modern',
        'Pro',
        'Lite',
    ];

    private const PRODUCT_TYPES = [
        'Headphone',
        'Keyboard',
        'Mouse',
        'Monitor',
        'Speaker',
        'Camera',
        'Backpack',
        'Charger',
        'Notebook',
        'Desk Lamp',
    ];

    public function definition(): array
    {
        $number = (int) $this->faker->unique()->numberBetween(1, 999_999_999);

        return self::row($number);
    }

    public function active(): self
    {
        return $this->state(fn () => ['status' => Product::STATUS_ACTIVE]);
    }

    public function draft(): self
    {
        return $this->state(fn () => ['status' => Product::STATUS_DRAFT]);
    }

    public function inactive(): self
    {
        return $this->state(fn () => ['status' => Product::STATUS_INACTIVE]);
    }

    /**
     * Deterministic payload for high-volume seeders.
     *
     * This avoids Faker unique-memory growth and keeps SKU predictable,
     * so seeding 1,000,000 rows remains stable and can be resumed safely.
     */
    public static function row(int $number, ?string $timestamp = null): array
    {
        $prefix = self::NAME_PREFIXES[($number - 1) % count(self::NAME_PREFIXES)];
        $type   = self::PRODUCT_TYPES[($number - 1) % count(self::PRODUCT_TYPES)];
        $status = match (true) {
            $number % 15 === 0 => Product::STATUS_INACTIVE,
            $number % 10 === 0 => Product::STATUS_DRAFT,
            default            => Product::STATUS_ACTIVE,
        };

        $timestamp ??= now()->toDateTimeString();

        return [
            'id'          => (string) Str::uuid(),
            'name'        => sprintf('%s %s %07d', $prefix, $type, $number),
            'sku'         => sprintf('PRD-%07d', $number),
            'media_id'    => null,
            'description' => sprintf('Data produk dummy nomor %d untuk uji pagination, search, filter, API, dan frontend katalog.', $number),
            'price'       => number_format(25_000 + (($number % 2_000) * 1_250), 2, '.', ''),
            'stock'       => ($number * 7) % 1_000,
            'status'      => $status,
            'created_at'  => $timestamp,
            'updated_at'  => $timestamp,
        ];
    }

    /**
     * Build rows for bulk insert without instantiating Eloquent models.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function bulkRows(int $start, int $count, ?string $timestamp = null): array
    {
        $rows      = [];
        $timestamp ??= now()->toDateTimeString();
        $end       = $start + $count - 1;

        for ($number = $start; $number <= $end; $number++) {
            $rows[] = self::row($number, $timestamp);
        }

        return $rows;
    }
}
