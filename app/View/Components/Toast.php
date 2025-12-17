<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Toast extends Component
{
    public string  $title;
    public string  $message;
    public string  $type;
    public ?string $img;
    public ?string $time;

    public function __construct(
        string  $title = 'Bootstrap',
        string  $message = '',
        string  $type = 'primary',
        ?string $img = null,
        ?string $time = null
    )
    {
        $this->title   = $title;
        $this->message = $message;
        $this->type    = $type;
        $this->img     = $img;
        $this->time    = $time ?? 'just now';
    }

    public function render()
    {
        return view('components.toast');
    }
}
