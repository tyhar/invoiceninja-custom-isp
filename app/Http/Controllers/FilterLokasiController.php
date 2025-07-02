<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FilterLokasi;
use Illuminate\Support\Facades\DB;

class FilterLokasiController extends Controller
{
    public function index(Request $request)
    {
        $lokasi = FilterLokasi::select(
            'latitude',
            'longitude',
            'negara',
            'provinsi',
            'kota',
            'jalan',
            'desa',
            'kodepos'
        )->get();

        return response()->json([
            'status' => 'success',
            'data' => $lokasi
        ]);
    }

    public function statistikPerDaerah()
    {
        $data = DB::table('filter_lokasi')
            ->leftJoin('fo_lokasis', function ($join) {
                $join->on('filter_lokasi.latitude', '=', 'fo_lokasis.latitude')
                    ->on('filter_lokasi.longitude', '=', 'fo_lokasis.longitude');
            })
            ->leftJoin('fo_client_ftths', function ($join) {
                $join->on('fo_client_ftths.lokasi_id', '=', 'fo_lokasis.id')
                    ->whereNull('fo_client_ftths.deleted_at');
            })
            ->leftJoin('fo_odps', function ($join) {
                $join->on('fo_odps.lokasi_id', '=', 'fo_lokasis.id')
                    ->whereNull('fo_odps.deleted_at');
            })
            ->leftJoin('fo_odcs', function ($join) {
                $join->on('fo_odcs.lokasi_id', '=', 'fo_lokasis.id')
                    ->whereNull('fo_odcs.deleted_at');
            })
            ->select(
                'filter_lokasi.provinsi',
                'filter_lokasi.kota',
                DB::raw('COUNT(DISTINCT fo_client_ftths.id) as total_client'),
                DB::raw('COUNT(DISTINCT fo_odps.id) as total_odp'),
                DB::raw('COUNT(DISTINCT fo_odcs.id) as total_odc')
            )
            ->groupBy('filter_lokasi.provinsi', 'filter_lokasi.kota')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
}