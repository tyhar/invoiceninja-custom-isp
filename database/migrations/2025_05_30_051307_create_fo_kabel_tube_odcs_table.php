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
        Schema::create('fo_kabel_tube_odcs', function (Blueprint $table) {
            $table->id();

            // Foreign key to fo_kabel_odcs.id
            $table->foreignId('kabel_odc_id')
                ->constrained('fo_kabel_odcs')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->enum('warna_tube', [
                'biru',
                'jingga',
                'hijau',
                'coklat',
                'abu_abu',
                'putih',
                'merah',
                'hitam',
                'kuning',
                'ungu',
                'merah_muda',
                'aqua'
            ]);

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
        Schema::dropIfExists('fo_kabel_tube_odcs');
    }
};
