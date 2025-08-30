<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use Crud\Backend\Backend;
use Crud\Backend\Controllers\Dashboard;
use Crud\Backend\Layout\Column;
use Crud\Backend\Layout\Content;
use Crud\Backend\Layout\Row;

class HomeController extends Controller
{
    public function index(Content $content)
    {
        return $content
            ->css_file(Backend::asset("crud/css/pages/dashboard.css"))
            ->title('Dashboard')
            ->description('Description...')
            ->row(Dashboard::title());
    }
}
