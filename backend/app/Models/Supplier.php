<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Supplier extends Authenticatable
{
    protected $fillable = [
        'email',
        'name',
        'role',
        'odoo_id',
        'google_id',
        'avatar',
    ];

    protected $hidden = ['remember_token'];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function farms()
    {
        return $this->hasMany(Farm::class);
    }
}
