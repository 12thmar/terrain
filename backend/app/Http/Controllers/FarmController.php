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
            'name'           => 'required|string|max:255',
            'region'         => 'required|string|max:100',
            'altitude_min'   => 'nullable|integer|min:0|max:5000',
            'altitude_max'   => 'nullable|integer|min:0|max:5000',
            'latitude'       => 'nullable|numeric|between:-90,90',
            'longitude'      => 'nullable|numeric|between:-180,180',
            'size_hectares'  => 'nullable|numeric|min:0',
            'variety'        => 'nullable|string|max:255',
            'harvest_months' => 'nullable|string|max:100',
            'photo_keys'     => 'nullable|array',
            'photo_keys.*'   => 'string',
        ]);

        $supplier = $request->attributes->get('supplier');

        $farm = Farm::create([
            'supplier_id'    => $supplier->id,
            'name'           => $data['name'],
            'region'         => $data['region'],
            'altitude_min'   => $data['altitude_min'] ?? null,
            'altitude_max'   => $data['altitude_max'] ?? null,
            'latitude'       => $data['latitude'] ?? null,
            'longitude'      => $data['longitude'] ?? null,
            'size_hectares'  => $data['size_hectares'] ?? null,
            'variety'        => $data['variety'] ?? null,
            'harvest_months' => $data['harvest_months'] ?? null,
            'state'          => 'draft',
        ]);

        foreach ($data['photo_keys'] ?? [] as $key) {
            FarmPhoto::create([
                'farm_id' => $farm->id,
                's3_key'  => $key,
                's3_url'  => Storage::disk('s3')->url($key),
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
            ->map(fn($f) => [
                'id'             => $f->id,
                'name'           => $f->name,
                'region'         => $f->region,
                'altitude_min'   => $f->altitude_min,
                'altitude_max'   => $f->altitude_max,
                'latitude'       => $f->latitude,
                'longitude'      => $f->longitude,
                'size_hectares'  => $f->size_hectares,
                'variety'        => $f->variety,
                'harvest_months' => $f->harvest_months,
                'state'          => $f->state,
                'photos'         => $f->photos->map(fn($p) => [
                    'url' => $p->s3_url,
                    'key' => $p->s3_key,
                ]),
            ]);

        return response()->json($farms);
    }
}
