<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function photo(Request $request)
    {
        $request->validate([
            'file' => 'required|file|image|max:10240',
        ]);

        $file      = $request->file('file');
        $ext       = $file->getClientOriginalExtension() ?: 'jpg';
        $key       = 'photos/' . Str::uuid() . '.' . $ext;

        Storage::disk('s3')->put($key, file_get_contents($file->getRealPath()), 'public');

        return response()->json([
            'url' => Storage::disk('s3')->url($key),
            'key' => $key,
        ]);
    }
}
