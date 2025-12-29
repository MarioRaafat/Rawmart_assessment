<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private TaskService $taskService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 10);
        $status = $request->query('status');

        if ($status && !in_array($status, ['pending', 'in_progress', 'done'])) {
            return response()->json([
                'message' => 'Invalid status parameter',
            ], 400);
        }

        $tasks = $this->taskService->findAll($request->user(), $limit, $status);

        return response()->json([
            'tasks' => $tasks,
        ]);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->create(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $task = $this->taskService->findOne($request->user(), $id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'task' => $task,
        ]);
    }

    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->findOne($request->user(), $id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found',
            ], 404);
        }

        $updatedTask = $this->taskService->update($task, $request->validated());

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $updatedTask,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $task = $this->taskService->findOne($request->user(), $id);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found',
            ], 404);
        }

        $this->taskService->delete($task);

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }
}
