<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoOdc;
use App\Models\FoOdp;
use App\Models\FoClientFtth;
use App\Services\GeocodingService;
use Illuminate\Support\Facades\Log;

class FoLokasi extends Model
{
    use SoftDeletes;

    protected $table = 'fo_lokasis';

    protected $fillable = [
        'nama_lokasi',
        'deskripsi',
        'latitude',
        'longitude',
        'city',
        'province',
        'country',
        'geocoded_at',
        'status', // 'active' or 'archived'
    ];

    protected $casts = [
        'latitude'   => 'float',
        'longitude'  => 'float',
        'geocoded_at' => 'datetime',
        'status'     => 'string',
        'deleted_at' => 'datetime',
    ];

    public function odcs()
    {
        return $this->hasMany(FoOdc::class, 'lokasi_id');
    }

    public function odps()
    {
        return $this->hasMany(FoOdp::class, 'lokasi_id');
    }

    public function clientFtths()
    {
        return $this->hasMany(FoClientFtth::class, 'lokasi_id');
    }

    /**
     * Automatically geocode the location (synchronous version for manual use)
     */
    public function autoGeocode()
    {
        try {
            // Only geocode if we have valid coordinates
            if ($this->latitude && $this->longitude) {
                $geocodingService = app(GeocodingService::class);
                $geo = $geocodingService->reverseGeocode($this->latitude, $this->longitude);

                if ($geo) {
                    $this->update([
                        'city' => $geo['city'] ?? null,
                        'province' => $geo['province'] ?? null,
                        'country' => $geo['country'] ?? null,
                        'geocoded_at' => now(),
                    ]);

                    Log::info("Auto-geocoded location {$this->id}: {$this->nama_lokasi}", $geo);
                    return true;
                } else {
                    Log::warning("Failed to auto-geocode location {$this->id}: {$this->nama_lokasi}");
                    return false;
                }
            }
            return false;
        } catch (\Exception $e) {
            Log::error("Error auto-geocoding location {$this->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Force geocode this location (ignores existing geocoding)
     */
    public function forceGeocode()
    {
        try {
            if ($this->latitude && $this->longitude) {
                $geocodingService = app(GeocodingService::class);
                $geo = $geocodingService->reverseGeocode($this->latitude, $this->longitude);

                if ($geo) {
                    $this->update([
                        'city' => $geo['city'] ?? null,
                        'province' => $geo['province'] ?? null,
                        'country' => $geo['country'] ?? null,
                        'geocoded_at' => now(),
                    ]);

                    Log::info("Force-geocoded location {$this->id}: {$this->nama_lokasi}", $geo);
                    return true;
                } else {
                    Log::warning("Failed to force-geocode location {$this->id}: {$this->nama_lokasi}");
                    return false;
                }
            }
            return false;
        } catch (\Exception $e) {
            Log::error("Error force-geocoding location {$this->id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Static method to geocode all locations that need it
     */
    public static function geocodeAllPending()
    {
        $pending = self::whereNull('geocoded_at')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $successCount = 0;
        $totalCount = $pending->count();

        foreach ($pending as $lokasi) {
            if ($lokasi->autoGeocode()) {
                $successCount++;
            }
            // Add a small delay to respect rate limits
            usleep(2000000); // 2 seconds
        }

        return [
            'total' => $totalCount,
            'success' => $successCount,
            'failed' => $totalCount - $successCount
        ];
    }
}
