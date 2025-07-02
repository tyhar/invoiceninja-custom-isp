<?php

namespace App\Services\Mapping;

use Illuminate\Support\Facades\Http;
use App\Models\FilterLokasi;

class GeocodeService
{
    public static function reverseAndSave($lat, $lon): ?array
    {
        $lat = round($lat, 7);
        $lon = round($lon, 7);

        $existing = FilterLokasi::where('latitude', $lat)
            ->where('longitude', $lon)
            ->first();

        if ($existing) {
            return [
                'state' => $existing->provinsi,
                'city' => $existing->kota,
            ];
        }

        try {
            $response = Http::get('https://geocode.maps.co/reverse', [
                'lat' => $lat,
                'lon' => $lon,
                'api_key' => '686264e402f66410040826leo497fb0',
            ]);

            $address = $response->json()['address'] ?? [];

            FilterLokasi::create([
                'latitude' => $lat,
                'longitude' => $lon,
                'negara' => $address['country'] ?? null,
                'provinsi' => $address['state'] ?? null,
                'kota' => $address['city'] ?? $address['county'] ?? null,
                'kelurahan' => $address['village'] ?? $address['town'] ?? null,
                'jalan' => $address['road'] ?? null,
                'kodepos' => $address['postcode'] ?? null,
            ]);

            return $address;

        } catch (\Exception $e) {
            return null;
        }
    }
}
