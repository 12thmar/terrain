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

    /**
     * Full farm shape for the supplier portal (dashboard list + farm profile).
     * Assumes the `photos` relation is eager-loaded by the caller.
     */
    public function toPortalArray(): array
    {
        $photos = $this->photos->map(fn($p) => [
            'url' => $p->s3_url,
            'key' => $p->s3_key,
        ]);

        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'region'          => $this->region,
            'zone'            => $this->zone,
            'altitude_min'    => $this->altitude_min,
            'altitude_max'    => $this->altitude_max,
            'latitude'        => $this->latitude,
            'longitude'       => $this->longitude,
            'location_source' => $this->location_source,
            'size_hectares'   => $this->size_hectares,
            'variety'         => $this->variety,
            'harvest_months'  => $this->harvest_months,
            'state'           => $this->state,
            'cover'           => $photos->first()['url'] ?? null,
            'photos'          => $photos,
        ];
    }
}
