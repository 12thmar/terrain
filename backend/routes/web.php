<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/auth/google', [AuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

Route::get('/login', function () {
    if (session('supplier_id')) {
        return redirect('/dashboard');
    }
    return view('app', ['page' => 'login', 'error' => session('error')]);
});

Route::middleware('supplier.auth')->group(function () {
    Route::get('/', fn() => redirect('/dashboard'));
    Route::get('/dashboard', function (Request $request) {
        $supplier = $request->attributes->get('supplier');
        return view('app', ['page' => 'dashboard', 'supplier' => $supplier]);
    });
    Route::post('/upload/photo', [UploadController::class, 'photo']);
});

Route::get('/health', fn() => response()->json(['status' => 'ok']));
