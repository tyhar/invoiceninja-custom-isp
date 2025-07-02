<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FilterLokasi extends Model
{
    protected $table = 'filter_lokasi';

    protected $fillable = [
        'latitude',
        'longitude',
        'negara',
        'provinsi',
        'kota',
        'jalan',
        'desa',
        'kodepos',
    ];
}
