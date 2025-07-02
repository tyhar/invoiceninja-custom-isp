<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'status',
        'url'
    ];
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function adminContacts()
    {
        return $this->hasMany(AdminContact::class);
    }

}
