<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoOdc;
use App\Models\FoKabelTubeOdc;

class FoKabelOdc extends Model
{
    use SoftDeletes;

    protected $table = 'fo_kabel_odcs';

    // Remove jumlah_total_core from fillable
    protected $fillable = [
        'odc_id',
        'nama_kabel',
        'tipe_kabel',
        'panjang_kabel',
        'jumlah_tube',
        'jumlah_core_in_tube',
        'status',
    ];

    protected $casts = [
        'panjang_kabel' => 'float',
        'status'        => 'string',
        'deleted_at'    => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        // Before every save (create or update), recalc jumlah_total_core
        static::saving(function (FoKabelOdc $model) {
            $model->jumlah_total_core = $model->jumlah_tube * $model->jumlah_core_in_tube;
        });
    }

    public function odc()
    {
        return $this->belongsTo(FoOdc::class, 'odc_id');
    }

    public function kabelTubeOdcs()
    {
        return $this->hasMany(FoKabelTubeOdc::class, 'kabel_odc_id');
    }
}
