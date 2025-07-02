<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoLokasi;
use App\Models\FoKabelCoreOdc;
use App\Models\FoClientFtth;

class FoOdp extends Model
{
    use SoftDeletes;

    protected $table = 'fo_odps';

    protected $fillable = [
        'lokasi_id',
        'kabel_core_odc_id',
        'nama_odp',
        'status',   // 'active' or 'archived'
    ];

    protected $casts = [
        'status'     => 'string',
        'deleted_at' => 'datetime',
    ];

    /**
     * Each ODP belongs to one Lokasi.
     */
    public function lokasi()
    {
        return $this->belongsTo(FoLokasi::class, 'lokasi_id');
    }

    /**
     * Each ODP belongs to one KabelCoreOdc.
     */
    public function kabelCoreOdc()
    {
        return $this->belongsTo(FoKabelCoreOdc::class, 'kabel_core_odc_id');
    }

    /**
     * Each ODP has one ClientFtth (output port).
     */
    public function clientFtth()
    {
        return $this->hasOne(FoClientFtth::class, 'odp_id', 'id');
    }
}
