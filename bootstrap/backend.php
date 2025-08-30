<?php

use Crud\Backend\Facades\Backend;
use Crud\Backend\Widgets\Navbar;
use Crud\Backend\Widgets\Navbar\Fullscreen;

Crud\Backend\Form::forget(['editor']);
Backend::navbar(function(Navbar $navbar) {
    $navbar->right(new Fullscreen());
});
