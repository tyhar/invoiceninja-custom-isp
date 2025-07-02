<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessagesTable extends Migration
{
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('device_id')->nullable()->constrained('devices')->onDelete('set null');
            $table->unsignedInteger('client_id')->nullable();
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreignId('message_template_id')->nullable()->constrained('message_templates')->onDelete('set null');

            $table->text('message')->nullable();
            $table->string('file')->nullable();
            $table->string('from')->nullable();
            $table->text('url')->nullable();
            $table->string('status')->default('sent');

            $table->timestamps();
        });

    }

    public function down()
    {
        Schema::dropIfExists('messages');
    }
}
