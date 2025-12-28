<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by controller (owner check)
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in(['pending', 'in_progress', 'done'])],
        ];
    }

    public function messages(): array
    {
        return [
            'title.max' => 'Task title cannot exceed 255 characters',
            'status.in' => 'Status must be one of: pending, in_progress, done',
        ];
    }
}
