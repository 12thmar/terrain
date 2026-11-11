<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('farms', function (Blueprint $table) {
            // How the farm's confirmed lat/lng was set: 'exif' (auto from photo),
            // 'map' (dropped a pin), 'manual' (typed in), or null (none yet).
            $table->string('location_source')->nullable()->after('longitude');
        });
    }

    public function down(): void
    {
        Schema::table('farms', function (Blueprint $table) {
            $table->dropColumn('location_source');
        });
    }
};
