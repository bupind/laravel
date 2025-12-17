<?php

namespace App\Imports;

use App\Models\Unit;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UnitImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    public function collection(Collection $rows)
    {
        $data = [];
        foreach($rows as $row) {
            $data[] = [
                'name'   => $row['name'],
                'status' => $row['status'],
            ];
        }
        DB::transaction(function() use ($data) {
            Unit::insert($data);
        });
    }

    public function chunkSize(): int
    {
        return 5000;
    }
}
