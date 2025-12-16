@props([
    'type' => 'text',
    'name',
    'value' => null,
])

@php
    $val = old($name, $type === 'password' ? '' : $value);
@endphp

<input type="{{ $type }}" name="{{ $name }}" value="{{ $val }}"{{ $attributes->merge([
    'class' => 'form-control' . ($errors->has($name) ? ' is-invalid' : '')
    ]) }}>

@error($name)
<div class="invalid-feedback">{{ $message }}</div>
@enderror
