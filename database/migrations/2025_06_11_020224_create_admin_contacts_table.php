<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminContactsTable extends Migration
{
    public function up()
    {
        Schema::create('admin_contacts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('device_id')->nullable()->index();
            $table->string('phone_number');
            $table->timestamps();

        });
    }

    public function down()
    {
        Schema::dropIfExists('admin_contacts');
    }
}
