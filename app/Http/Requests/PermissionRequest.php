<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string'
        ];
        if (request()->isMethod('patch') || request()->isMethod('put')) {
            $rules['id'] = 'required';
        }
        return $rules;
    }
}
