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
        Schema::create('fo_kabel_odcs', function (Blueprint $table) {
            $table->id();

            // Foreign key to fo_odcs.id
            $table->foreignId('odc_id')
                ->constrained('fo_odcs')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->string('nama_kabel');
            $table->enum('tipe_kabel', ['singlecore', 'multicore']);
            $table->decimal('panjang_kabel', 8, 2);
            $table->integer('jumlah_tube');
            $table->integer('jumlah_core_in_tube');
            $table->integer('jumlah_total_core');

            // NEW: add "status" column (active or archived)
            $table->enum('status', ['active', 'archived'])->default('active');

            // NEW: soft deletes (adds deleted_at)
            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fo_kabel_odcs');
    }
};
