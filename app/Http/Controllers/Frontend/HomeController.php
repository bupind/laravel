<?php
/**
 * HomeController
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Slider;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $sliders = Slider::query()
            ->with('media')
            ->active()
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get();
        $services = Service::query()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get([
                'id',
                'title',
                'description',
                'icon',
                'link_url',
                'sort_order',
            ]);
        return Inertia::render('frontend/welcome', [
            'sliders'  => $sliders,
            'services' => $services,
        ]);
    }
}
