<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageTemplate extends Model
{
    protected $fillable = ['title', 'content'];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

}
