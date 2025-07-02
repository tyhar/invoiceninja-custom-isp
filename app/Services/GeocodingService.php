<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GeocodingService
{
    private const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
    private const CACHE_TTL = 86400; // 24 hours
    private const RATE_LIMIT_DELAY = 2; // 2 seconds between requests (Nominatim policy)

    /**
     * Reverse geocode coordinates to get address components
     */
    public function reverseGeocode(float $latitude, float $longitude): ?array
    {
        $cacheKey = "geocode_{$latitude}_{$longitude}";

        // Check cache first
        if (Cache::has($cacheKey)) {
            Log::info("Using cached result for coordinates: {$latitude}, {$longitude}");
            return Cache::get($cacheKey);
        }

        try {
            // Rate limiting - Nominatim allows 1 request per second
            $this->rateLimit();

            Log::info("Making API request to Nominatim for coordinates: {$latitude}, {$longitude}");

            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'InvoiceNinja-FTTH-App/1.0 (https://github.com/invoiceninja/invoice-isp)',
                    'Referer' => 'https://github.com/invoiceninja/invoice-isp'
                ])
                ->get(self::NOMINATIM_BASE_URL, [
                    'lat' => $latitude,
                    'lon' => $longitude,
                    'format' => 'json',
                    'addressdetails' => 1,
                    'accept-language' => 'en',
                ]);

            Log::info("Nominatim response status: " . $response->status());
            Log::info("Nominatim response body: " . $response->body());

            if ($response->successful()) {
                $data = $response->json();
                $address = $this->extractAddressComponents($data);

                Log::info("Extracted address components: " . json_encode($address));

                // Cache the result
                Cache::put($cacheKey, $address, self::CACHE_TTL);

                return $address;
            }

            Log::warning('Nominatim API request failed', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Geocoding service error', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    /**
     * Extract city, province, and country from Nominatim response
     */
    private function extractAddressComponents(array $data): array
    {
        $address = $data['address'] ?? [];

        return [
            'city' => $this->getCity($address),
            'province' => $this->getProvince($address),
            'country' => $this->getCountry($address),
        ];
    }

    /**
     * Get city from address components
     */
    private function getCity(array $address): ?string
    {
        // Try different possible city fields
        $cityFields = ['city', 'town', 'village', 'municipality', 'suburb'];

        foreach ($cityFields as $field) {
            if (isset($address[$field])) {
                return $address[$field];
            }
        }

        return null;
    }

    /**
     * Get province/state from address components
     */
    private function getProvince(array $address): ?string
    {
        // Try different possible province/state fields
        $provinceFields = ['state', 'province', 'region', 'county'];

        foreach ($provinceFields as $field) {
            if (isset($address[$field])) {
                return $address[$field];
            }
        }

        return null;
    }

    /**
     * Get country from address components
     */
    private function getCountry(array $address): ?string
    {
        return $address['country'] ?? null;
    }

    /**
     * Simple rate limiting for Nominatim API
     */
    private function rateLimit(): void
    {
        $lastRequestKey = 'nominatim_last_request';
        $lastRequest = Cache::get($lastRequestKey);

        if ($lastRequest) {
            $timeSinceLastRequest = time() - $lastRequest;
            if ($timeSinceLastRequest < self::RATE_LIMIT_DELAY) {
                $sleepTime = self::RATE_LIMIT_DELAY - $timeSinceLastRequest;
                sleep($sleepTime);
            }
        }

        Cache::put($lastRequestKey, time(), 60);
    }

    /**
     * Batch geocode multiple locations
     */
    public function batchGeocode(array $locations): array
    {
        $results = [];

        foreach ($locations as $location) {
            $results[] = [
                'id' => $location['id'],
                'geographic_data' => $this->reverseGeocode($location['latitude'], $location['longitude'])
            ];
        }

        return $results;
    }
}
