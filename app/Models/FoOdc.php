<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoLokasi;
use App\Models\FoKabelOdc;

class FoOdc extends Model
{
    use SoftDeletes;

    protected $table = 'fo_odcs';

    protected $fillable = [
        'lokasi_id',
        'nama_odc',
        'tipe_splitter',
        'status',    // allow "active" or "archived"
    ];

    protected $casts = [
        'status'     => 'string',
        'deleted_at' => 'datetime',
    ];

    /**
     * Each ODC belongs to exactly one Lokasi.
     */
    public function lokasi()
    {
        return $this->belongsTo(FoLokasi::class, 'lokasi_id');
    }

    /**
     * Each ODC can have many KabelOdcs.
     */
    public function kabelOdcs()
    {
        return $this->hasMany(FoKabelOdc::class, 'odc_id');
    }
}
