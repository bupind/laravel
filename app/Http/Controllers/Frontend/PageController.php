<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(Page $page): Response
    {
        abort_unless($page->status === Page::STATUS_ACTIVE, 404);
        $page->loadMissing('media');
        return Inertia::render('frontend/page', [
            'pageData' => [
                'id'               => $page->id,
                'title'            => $page->title,
                'slug'             => $page->slug,
                'media_id'         => $page->media_id,
                'media_url'        => $page->media_url,
                'excerpt'          => $page->excerpt,
                'content'          => $page->content,
                'url'              => $page->url,
            ],
        ]);
    }
}
