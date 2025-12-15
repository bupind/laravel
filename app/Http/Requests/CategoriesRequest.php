<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoriesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name'        => 'required|string|max:255',
            'slug'        => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')->ignore(request()->category),
            ],
            'description' => 'nullable|string',
        ];
        if(request()->isMethod('patch') || request()->isMethod('put')) {
            $rules['id'] = 'required';
        }
        return $rules;
    }
}
