<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('chatbots', function (Blueprint $table) {
            $table->id(); 
            $table->text('question');
            $table->text('answer');

            $table->foreignId('device_id')->nullable()->constrained('devices')->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('chatbots');
    }
};
