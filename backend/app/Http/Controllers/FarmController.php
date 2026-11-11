<?php

namespace App\Http\Controllers;

use App\Models\Farm;
use App\Models\FarmPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FarmController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'region'           => 'required|string|max:100',
            'altitude_min'     => 'nullable|integer|min:0|max:5000',
            'altitude_max'     => 'nullable|integer|min:0|max:5000',
            'latitude'         => 'nullable|numeric|between:-90,90',
            'longitude'        => 'nullable|numeric|between:-180,180',
            'location_source'  => 'nullable|in:exif,map,manual',
            'size_hectares'    => 'nullable|numeric|min:0',
            'variety'          => 'nullable|string|max:255',
            'harvest_months'   => 'nullable|string|max:100',
            'photos'           => 'nullable|array',
            'photos.*.key'       => 'required|string',
            'photos.*.latitude'  => 'nullable|numeric|between:-90,90',
            'photos.*.longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $supplier = $request->attributes->get('supplier');

        $farm = Farm::create([
            'supplier_id'     => $supplier->id,
            'name'            => $data['name'],
            'region'          => $data['region'],
            'altitude_min'    => $data['altitude_min'] ?? null,
            'altitude_max'    => $data['altitude_max'] ?? null,
            'latitude'        => $data['latitude'] ?? null,
            'longitude'       => $data['longitude'] ?? null,
            'location_source' => $data['location_source'] ?? null,
            'size_hectares'   => $data['size_hectares'] ?? null,
            'variety'         => $data['variety'] ?? null,
            'harvest_months'  => $data['harvest_months'] ?? null,
            'state'           => 'draft',
        ]);

        foreach ($data['photos'] ?? [] as $photo) {
            FarmPhoto::create([
                'farm_id'   => $farm->id,
                's3_key'    => $photo['key'],
                's3_url'    => Storage::disk('s3')->url($photo['key']),
                'latitude'  => $photo['latitude'] ?? null,
                'longitude' => $photo['longitude'] ?? null,
            ]);
        }

        return response()->json([
            'id'   => $farm->id,
            'name' => $farm->name,
        ], 201);
    }

    public function index(Request $request)
    {
        $supplier = $request->attributes->get('supplier');

        $farms = $supplier->farms()
            ->with('photos')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($f) => $f->toPortalArray());

        return response()->json($farms);
    }
}
