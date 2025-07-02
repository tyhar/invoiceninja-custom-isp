<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminContact extends Model
{
    protected $fillable = [
        'device_id',
        'phone_number',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
