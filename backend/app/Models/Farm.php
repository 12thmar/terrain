<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Farm extends Model
{
    protected $fillable = [
        'supplier_id',
        'name',
        'region',
        'zone',
        'altitude_min',
        'altitude_max',
        'latitude',
        'longitude',
        'location_source',
        'size_hectares',
        'variety',
        'harvest_months',
        'state',
        'odoo_id',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function photos()
    {
        return $this->hasMany(FarmPhoto::class);
    }
}
