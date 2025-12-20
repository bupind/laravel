@php use App\Constants\DataConstant; @endphp

<div class="row g-2 py-0 mb-3">
    @foreach ($fields as $key => $field)
        @php
            $name  = $field['name'] ?? $key;
            $type  = $field['type'] ?? 'text';
            $label = $field['label'] ?? ucfirst(str_replace('_', ' ', $name));
            $col   = $field['col'] ?? 'col-12';
            $value = $field['value'] ?? ($item->$name ?? null);
        @endphp

        <div class="{{ $col }}">
            <x-label :value="$label"/>

            @switch($type)
                @case(DataConstant::TYPE_TEXTAREA)
                    <x-textarea :name="$name" :value="$value" :rows="$field['rows'] ?? 4"/>
                    @break

                @case(DataConstant::TYPE_SELECT)
                    <x-select :name="$name" :options="$field['options'] ?? []" :value="$value" :placeholder="$field['placeholder'] ?? null"/>
                    @break

                @case(DataConstant::TYPE_EMAIL)
                    <x-input type="email" :name="$name" :value="$value" autocomplete="email"/>
                    @break

                @case(DataConstant::TYPE_PHONE)
                    <x-input type="tel" :name="$name" :value="$value" placeholder="08xxxxxxxxxx"/>
                    @break

                @case(DataConstant::TYPE_PASSWORD)
                    <x-password :name="$name" :label="$label"/>
                    @break

                @case(DataConstant::TYPE_FILE)
                    <x-input type="file" :name="$name" :multiple="$field['multiple'] ?? false"/>
                    @break

                @case(DataConstant::TYPE_IMAGE)
                    <x-input type="file" accept="image/*" :name="$name" :multiple="$field['multiple'] ?? false"/>
                    @if(!empty($value))
                        <div class="mt-2">
                            <img src="{{ asset('storage/'.$value) }}" class="img-thumbnail" width="120">
                        </div>
                    @endif
                    @break

                @case(DataConstant::TYPE_CHECKBOX)
                    @php
                        $checkedValues = collect($value ?? [])->map(fn($v) => (string) $v)->toArray();
                    @endphp

                    <div class="row">
                        @foreach(($field['options'] ?? []) as $val => $text)
                            <div class="col-md-3">
                                <div class="form-check form-check-custom form-check-solid">
                                    <input class="form-check-input" type="checkbox" name="{{ $name }}[]" value="{{ $val }}"{{ in_array((string)$val, $checkedValues, true) ? 'checked' : '' }}>
                                    <label class="form-check-label">{{ $text }}</label>
                                </div>
                            </div>
                        @endforeach
                    </div>
                    @break

                @default
                    <x-input :type="$type" :name="$name" :value="$value"/>

            @endswitch
        </div>
    @endforeach
</div>
