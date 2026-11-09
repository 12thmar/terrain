<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FarmController;
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
        $farms = $supplier->farms()->with('photos')->orderByDesc('created_at')->get()
            ->map(fn($f) => [
                'id'     => $f->id,
                'name'   => $f->name,
                'region' => $f->region,
                'state'  => $f->state,
                'cover'  => $f->photos->first()?->s3_url,
            ]);
        return view('app', ['page' => 'dashboard', 'supplier' => $supplier, 'farms' => $farms]);
    });
    Route::post('/upload/photo', [UploadController::class, 'photo']);
    Route::post('/farms', [FarmController::class, 'store']);
    Route::get('/farms', [FarmController::class, 'index']);
});

Route::get('/health', fn() => response()->json(['status' => 'ok']));
