<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class TaskService
{
    public function create(User $user, array $data): Task
    {
        return $user->tasks()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'pending',
        ]);
    }

    public function findAll(User $user)
    {
        return $user->tasks()->orderBy('created_at', 'desc')->paginate(10);
    }

    public function findOne(User $user, int $taskId): ?Task
    {
        return $user->tasks()->find($taskId);
    }

    public function update(Task $task, array $data): Task
    {
        $task->update(array_filter([
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? null,
        ], fn($value) => $value !== null));

        return $task->fresh();
    }

    public function delete(Task $task): bool
    {
        return $task->delete();
    }
}
