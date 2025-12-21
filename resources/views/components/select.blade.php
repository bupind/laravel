@props([
    'name',
    'options' => [],
    'value' => null,
    'placeholder' => null,
    'multiple' => false,
])

@php
    $selectedValues = collect(old($name, $value))
        ->map(fn($v) => (string) $v)
        ->toArray();
@endphp

<select
    name="{{ $multiple ? $name.'[]' : $name }}"
    {{ $multiple ? 'multiple' : '' }}
    {{ $attributes->merge([
        'class' => 'form-select' . ($errors->has($name) ? ' is-invalid' : '')
    ]) }}
>
    @if($placeholder && !$multiple)
        <option value="">{{ $placeholder }}</option>
    @endif

    @foreach($options as $k => $v)
        <option value="{{ $k }}"
            {{ in_array((string) $k, $selectedValues, true) ? 'selected' : '' }}>
            {{ $v }}
        </option>
    @endforeach
</select>

@error($name)
<div class="invalid-feedback">{{ $message }}</div>
@enderror
