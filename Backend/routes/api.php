<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

// All routes are prefixed with /api automatically.

// Public Routes (No authentication required)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected Routes (Authentication required)
Route::middleware('auth:sanctum')->group(function () {

    // Auth routes that require authentication
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // that will include all RESTful routes for tasks
    Route::apiResource('tasks', TaskController::class);
});
