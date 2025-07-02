<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FoLokasi;
use App\Models\FilterLokasi;
use App\Services\Mapping\GeocodeService;

class SyncGeocodeLocations extends Command
{
    protected $signature = 'sync:geocode-locations';
    protected $description = 'Sinkronisasi lokasi dengan reverse geocode dan simpan ke filter_lokasi';

    public function handle()
    {
        $lokasis = FoLokasi::all();

        foreach ($lokasis as $lokasi) {
            $lat = round($lokasi->latitude, 7);
            $lon = round($lokasi->longitude, 7);

            $exists = FilterLokasi::where('latitude', $lat)
                ->where('longitude', $lon)
                ->exists();

            if (! $exists) {
                GeocodeService::reverseAndSave($lat, $lon);
                $this->info("Processed lokasi ID: {$lokasi->id}");
            }
        }

        $this->info('✅ Sinkronisasi selesai.');
    }
}
