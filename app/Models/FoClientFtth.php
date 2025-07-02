<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoLokasi;
use App\Models\FoOdp;
use App\Models\Client;
use App\Models\Company;

class FoClientFtth extends Model
{
    use SoftDeletes;

    protected $table = 'fo_client_ftths';

    protected $fillable = [
        'lokasi_id',
        'odp_id',
        'client_id',     // now nullable
        'company_id',    // auto-set by user
        'nama_client',
        'alamat',
        'status',     // 'active' or 'archived'
    ];

    protected $casts = [
        'status'     => 'string',
        'deleted_at' => 'datetime',
    ];

    /**
     * Each client belongs to one Lokasi.
     */
    public function lokasi()
    {
        return $this->belongsTo(FoLokasi::class, 'lokasi_id');
    }

    /**
     * Each client belongs to one ODP.
     */
    public function odp()
    {
        return $this->belongsTo(FoOdp::class, 'odp_id');
    }

    /**
     * Each client belongs to one InvoiceNinja Client (nullable).
     */
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    /**
     * Each client belongs to one Company.
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
