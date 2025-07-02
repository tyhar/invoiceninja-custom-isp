<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ScheduledMessage extends Model
{
    use HasFactory;

    protected $table = 'scheduled_messages';

    protected $fillable = [
        'device_id',
        'client_id',
        'message_template_id',
        'text',
        'frequency',
        'next_run_date',
    ];

    protected $dates = [
        'next_run_date',
        'created_at',
        'updated_at',
    ];
    public function clients()
    {
        return $this->belongsToMany(Client::class, 'client_scheduled_message');
    }

    public function messageTemplate()
    {
        return $this->belongsTo(MessageTemplate::class);
    }
     public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
