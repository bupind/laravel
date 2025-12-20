@props([
    'name',
    'value' => null,
    'rows' => 4
])

<textarea
    name="{{ $name }}"
    rows="{{ $rows }}"
    {{ $attributes->merge([
        'class' => 'form-control ' . ($errors->has($name) ? 'is-invalid' : '')
    ]) }}
>{{ old($name, $value) }}</textarea>
