<?php
// ----------------------------------------------
// File: database/migrations/2025_05_30_051154_create_fo_lokasis_table.php
// ----------------------------------------------

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
        Schema::create('fo_lokasis', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lokasi');
            $table->string('deskripsi')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            // status: active or archived (default: active)
            $table->enum('status', ['active', 'archived'])->default('active');

            // Soft deletes: adds `deleted_at` column
            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fo_lokasis');
    }
};
