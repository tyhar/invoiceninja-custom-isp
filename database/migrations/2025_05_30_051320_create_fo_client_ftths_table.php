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
            Schema::create('fo_client_ftths', function (Blueprint $table) {
                $table->id();

                // Foreign key to fo_lokasis.id
                $table->foreignId('lokasi_id')
                    ->constrained('fo_lokasis')
                    ->cascadeOnDelete()
                    ->cascadeOnUpdate();

                // Foreign key to fo_odps.id
                $table->foreignId('odp_id')
                    ->constrained('fo_odps')
                    ->cascadeOnDelete()
                    ->cascadeOnUpdate();

                // Foreign key to clients.id (InvoiceNinja) - now nullable
                $table->unsignedInteger('client_id')->nullable();
                $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade')->onUpdate('cascade');

                // Foreign key to companies.id (for scoping) - auto-set by user
                $table->unsignedInteger('company_id');
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade')->onUpdate('cascade');

                $table->string('nama_client')->nullable();
                $table->string('alamat')->nullable();

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
            Schema::dropIfExists('fo_client_ftths');
        }
    };
