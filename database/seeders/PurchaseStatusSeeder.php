<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseStatusSeeder extends Seeder
{
    public function run()
    {
        $batchSize = 1000;     // insert 1000 record per batch
        $total     = 1000000;  // total 1 juta data
        for($i = 0; $i < $total; $i += $batchSize) {
            $data = [];
            for($j = 0; $j < $batchSize; $j++) {
                $data[] = [
                    'id'            => Str::uuid(), // generate UUID
                    'latestStatus'  => fake()->randomElement(['pending', 'completed', 'failed']),
                    'currentStatus' => fake()->randomElement(['pending', 'completed', 'failed']),
                    'status'        => fake()->word(),
                    'createdAt'     => now(),
                    'updatedAt'     => now(),
                ];
            }
            DB::table('purchase_status')->insert($data);
        }
    }
}
