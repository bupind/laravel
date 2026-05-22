<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">

@php
    $setting = $page['props']['setting'] ?? null;
    $favicon = data_get($setting, 'favicon');
@endphp

@if ($favicon)
    <link rel="icon" href="{{ asset('storage/' . $favicon) }}" type="image/png">
@else
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
@endif

<link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
<link rel="stylesheet" href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap">

@viteReactRefresh
@vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
@inertiaHead
