<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoKabelTubeOdc;
use App\Models\FoKabelOdc;
use App\Models\FoOdp;

class FoKabelCoreOdc extends Model
{
    use SoftDeletes;

    protected $table = 'fo_kabel_core_odcs';

    protected $fillable = [
        'kabel_tube_odc_id',
        'warna_core',
        'status',   // 'active' or 'archived'
    ];

    protected $casts = [
        'status'     => 'string',
        'deleted_at' => 'datetime',
    ];

    /**
     * Belongs to one KabelTubeOdc.
     */
    public function kabelTubeOdc()
    {
        return $this->belongsTo(FoKabelTubeOdc::class, 'kabel_tube_odc_id');
    }

    /**
     * Has one ODP.
     */
    public function odp()
    {
        return $this->hasOne(FoOdp::class, 'kabel_core_odc_id', 'id');
    }
}
