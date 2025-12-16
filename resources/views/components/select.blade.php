@props([
    'name',
    'options' => [],
    'value' => null,
    'placeholder' => null,
])

<select
    name="{{ $name }}"
    {{ $attributes->merge([
        'class' => 'form-select' . ($errors->has($name) ? ' is-invalid' : '')
    ]) }}
>
    @if($placeholder)
        <option value="">{{ $placeholder }}</option>
    @endif

    @foreach($options as $k => $v)
        <option value="{{ $k }}" @selected(old($name, $value) == $k)>
            {{ $v }}
        </option>
    @endforeach
</select>

@error($name)
<div class="invalid-feedback">{{ $message }}</div>
@enderror
