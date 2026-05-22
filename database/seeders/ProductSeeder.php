<?php

namespace Database\Seeders;

use App\Models\Product;
use Database\Factories\ProductFactory;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $total = 400;

        for ($i = 1; $i <= $total; $i++) {
            $product = ProductFactory::row($i);
            unset($product['id'], $product['created_at'], $product['updated_at']);

            Product::updateOrCreate(
                ['sku' => $product['sku']],
                $product,
            );
        }
    }
}
