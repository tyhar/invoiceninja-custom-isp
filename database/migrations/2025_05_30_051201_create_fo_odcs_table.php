<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fo_odcs', function (Blueprint $table) {
            $table->id();
            // Foreign key referencing fo_lokasis.id
            $table->foreignId('lokasi_id')->constrained('fo_lokasis')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('nama_odc');
            $table->enum('tipe_splitter', ['1:2', '1:4', '1:8', '1:16', '1:32', '1:64', '1:128']);
            // Add status column (active or archived)
            $table->enum('status', ['active', 'archived'])->default('active');
            // Soft deletes (adds deleted_at)
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fo_odcs');
    }
};
