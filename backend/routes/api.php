<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/register', [\App\Http\Controllers\AuthController::class, 'register'])->middleware('throttle:login');
Route::get('/login', function() {
    return response()->json(['message' => 'Unauthorized'], 401);
})->name('login');




Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('ingredients', \App\Http\Controllers\IngredientController::class);
    Route::apiResource('categories', \App\Http\Controllers\CategoryController::class);
    Route::apiResource('menu-items', \App\Http\Controllers\MenuController::class);
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);

// Settings
Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index']);
Route::post('/settings', [\App\Http\Controllers\SettingsController::class, 'update']);
Route::post('/settings/seed', [\App\Http\Controllers\SettingsController::class, 'seedDefaults']);
Route::get('/sessions', [\App\Http\Controllers\SessionController::class, 'index']);
Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'index']);
Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
Route::put('/profile/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword']);

Route::get('/orders/next-id', [\App\Http\Controllers\OrderController::class, 'getNextId']);
    Route::apiResource('orders', \App\Http\Controllers\OrderController::class);
    Route::get('/dashboard-stats', [\App\Http\Controllers\ReportController::class, 'dashboardStats']);

    
    // Chat Routes
    Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'index']);
    Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'store']);
    Route::post('/messages/mark-read', [\App\Http\Controllers\MessageController::class, 'markAsRead']);
    Route::get('/contacts', [\App\Http\Controllers\MessageController::class, 'getContacts']);
    Route::get('/users', function() { return \App\Models\User::all(); });
});
