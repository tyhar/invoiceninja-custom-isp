<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoKabelOdc;
use App\Models\FoKabelCoreOdc;

class FoKabelTubeOdc extends Model
{
    use SoftDeletes;

    protected $table = 'fo_kabel_tube_odcs';

    protected $fillable = [
        'kabel_odc_id',
        'warna_tube',
        'status',             // allow setting "active" or "archived"
    ];

    protected $casts = [
        'status'     => 'string',
        'deleted_at' => 'datetime',
    ];

    /**
     * Belongs to one KabelOdc.
     */
    public function kabelOdc()
    {
        return $this->belongsTo(FoKabelOdc::class, 'kabel_odc_id');
    }

    /**
     * Has many KabelCoreOdcs.
     */
    public function kabelCoreOdcs()
    {
        return $this->hasMany(FoKabelCoreOdc::class, 'kabel_tube_odc_id');
    }
}
