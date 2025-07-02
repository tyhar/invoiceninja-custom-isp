<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\FoLokasi;
use App\Services\GeocodingService;
use Illuminate\Support\Facades\Log;

class GeocodeLokasis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fo:geocode-lokasis';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reverse geocode all FoLokasi entries to fill city, province, and country fields.';

    /**
     * Execute the console command.
     */
    public function handle(GeocodingService $geocodingService)
    {
        $this->info('Starting geocoding of FoLokasi entries...');

        // Use the new model method
        $result = FoLokasi::geocodeAllPending();

        $this->info("Geocoding completed!");
        $this->info("Total locations processed: {$result['total']}");
        $this->info("Successfully geocoded: {$result['success']}");
        $this->info("Failed to geocode: {$result['failed']}");
    }
}
