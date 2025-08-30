<?php

use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
\Crud\Backend\Facades\Backend::routes();

Route::group([
    'prefix'        => config('backend.route.prefix'),
    'namespace'     => config('backend.route.namespace'),
    'middleware'    => config('backend.route.middleware'),
    'as'            => config('backend.route.prefix') . '.',
], function (Router $router) {
    $router->get('/', 'HomeController@index')->name('home');
});
