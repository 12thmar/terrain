<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('region');
            $table->string('zone')->nullable();
            $table->integer('altitude_min')->nullable();
            $table->integer('altitude_max')->nullable();
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->decimal('size_hectares', 8, 2)->nullable();
            $table->string('variety')->nullable();
            $table->string('harvest_months')->nullable();
            $table->string('state')->default('draft');
            $table->unsignedBigInteger('odoo_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farms');
    }
};
