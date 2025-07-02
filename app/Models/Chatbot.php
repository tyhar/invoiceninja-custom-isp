<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chatbot extends Model
{
    protected $fillable = [
        'question',
        'answer',
        'device_id'
    ];
     public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
