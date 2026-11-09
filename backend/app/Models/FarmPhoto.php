<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmPhoto extends Model
{
    protected $fillable = [
        'farm_id',
        's3_key',
        's3_url',
        'latitude',
        'longitude',
    ];

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }
}
