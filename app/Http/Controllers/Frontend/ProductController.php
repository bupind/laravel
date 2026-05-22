<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $products = Product::query()
            ->with('media')
            ->published()
            ->when($request->filled('search'), function($query) use ($request): void {
                $search = '%' . trim((string)$request->string('search')) . '%';
                $query->where(function($builder) use ($search): void {
                    $builder->where('name', 'like', $search)
                        ->orWhere('sku', 'like', $search)
                        ->orWhere('description', 'like', $search);
                });
            })
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();
        return Inertia::render('frontend/products', [
            'products' => $products,
            'filters'  => [
                'search' => (string)$request->string('search'),
            ],
        ]);
    }
}
