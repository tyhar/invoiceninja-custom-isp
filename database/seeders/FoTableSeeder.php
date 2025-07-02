<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoTableSeeder extends Seeder
{
    public function run()
    {
        $this->disableForeignKeys();
        $this->truncateAll();
        $this->enableForeignKeys();

        // 1. Seed 3 main lokasi (for reference)
        $mainLokasis = $this->seedMainLokasis();

        // 2. Seed ODPs, each with its own lokasi
        $odpLokasis = $this->seedOdpLokasis();
        $odcs = $this->seedOdcs($mainLokasis); // ODCs still use mainLokasis
        $kabelOdcs = $this->seedKabelOdcs($odcs);
        $tubeOdcs = $this->seedKabelTubeOdcs($kabelOdcs);
        $coreOdcs = $this->seedKabelCoreOdcs($tubeOdcs);
        $odps = $this->seedOdps($odpLokasis, $coreOdcs);

        // 3. Seed Client FTTH, each with its own lokasi
        $clientLokasis = $this->seedClientLokasis();
        $this->seedClients($clientLokasis, $odps);

        $this->command->info('FoTableSeeder completed successfully.');
    }

    protected function disableForeignKeys()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    }

    protected function enableForeignKeys()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    protected function truncateAll()
    {
        foreach (
            [
                'fo_client_ftths',
                'fo_odps',
                'fo_kabel_core_odcs',
                'fo_kabel_tube_odcs',
                'fo_kabel_odcs',
                'fo_odcs',
                'fo_lokasis',
            ] as $table
        ) {
            DB::table($table)->truncate();
        }
    }

    protected function seedMainLokasis(): array
    {
        // 3 real Indonesian locations for reference
        $lokasis = [
            [
                'id' => 1,
                'nama_lokasi' => 'Monas',
                'deskripsi' => 'Monumen Nasional',
                'latitude' => -6.175392,
                'longitude' => 106.827153,
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'country' => 'Indonesia',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'nama_lokasi' => 'Gedung Sate',
                'deskripsi' => 'Kantor Gubernur Jawa Barat',
                'latitude' => -6.902477,
                'longitude' => 107.618782,
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'nama_lokasi' => 'Tugu Pahlawan',
                'deskripsi' => 'Monumen Pahlawan',
                'latitude' => -7.245971,
                'longitude' => 112.737797,
                'city' => 'Surabaya',
                'province' => 'Jawa Timur',
                'country' => 'Indonesia',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedOdpLokasis(): array
    {
        // 3 unique lokasi for ODPs
        $lokasis = [
            [
                'id' => 4,
                'nama_lokasi' => 'ODP Lokasi Jakarta Timur',
                'deskripsi' => 'ODP Area Jakarta Timur',
                'latitude' => -6.225,
                'longitude' => 106.900,
                'city' => 'Jakarta Timur',
                'province' => 'DKI Jakarta',
                'country' => 'Indonesia',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'nama_lokasi' => 'ODP Lokasi Cimahi',
                'deskripsi' => 'ODP Area Cimahi',
                'latitude' => -6.872,
                'longitude' => 107.542,
                'city' => 'Cimahi',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'nama_lokasi' => 'ODP Lokasi Sidoarjo',
                'deskripsi' => 'ODP Area Sidoarjo',
                'latitude' => -7.446,
                'longitude' => 112.718,
                'city' => 'Sidoarjo',
                'province' => 'Jawa Timur',
                'country' => 'Indonesia',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedClientLokasis(): array
    {
        // 3 unique lokasi for FTTH clients
        $lokasis = [
            [
                'id' => 7,
                'nama_lokasi' => 'Client Lokasi Depok',
                'deskripsi' => 'Client Area Depok',
                'latitude' => -6.402,
                'longitude' => 106.794,
                'city' => 'Depok',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'nama_lokasi' => 'Client Lokasi Bekasi',
                'deskripsi' => 'Client Area Bekasi',
                'latitude' => -6.238,
                'longitude' => 106.975,
                'city' => 'Bekasi',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'nama_lokasi' => 'Client Lokasi Gresik',
                'deskripsi' => 'Client Area Gresik',
                'latitude' => -7.156,
                'longitude' => 112.651,
                'city' => 'Gresik',
                'province' => 'Jawa Timur',
                'country' => 'Indonesia',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedOdcs(array $lokasis): array
    {
        $rows = [];
        $id = 1;
        foreach ($lokasis as $lokasi) {
            $rows[] = [
                'id' => $id,
                'lokasi_id' => $lokasi['id'],
                'nama_odc' => "ODC-{$lokasi['city']}",
                'tipe_splitter' => '1:8',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $id++;
        }
        DB::table('fo_odcs')->insert($rows);
        return $rows;
    }

    protected function seedKabelOdcs(array $odcs): array
    {
        $rows = [];
        $id = 1;
        // Fixed tube/core counts for reproducibility
        $tubeCounts = [2, 3, 4];
        $coreCounts = [4, 6, 8];
        foreach ($odcs as $i => $odc) {
            $jumlah_tube = $tubeCounts[$i];
            $jumlah_core_in_tube = $coreCounts[$i];
            $rows[] = [
                'id' => $id,
                'odc_id' => $odc['id'],
                'nama_kabel' => "KabelODC-{$odc['id']}",
                'tipe_kabel' => 'multicore',
                'panjang_kabel' => 200 + $i * 50,
                'jumlah_tube' => $jumlah_tube,
                'jumlah_core_in_tube' => $jumlah_core_in_tube,
                'jumlah_total_core' => $jumlah_tube * $jumlah_core_in_tube,
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $id++;
        }
        DB::table('fo_kabel_odcs')->insert($rows);
        return $rows;
    }

    protected function seedKabelTubeOdcs(array $kabelOdcs): array
    {
        $colors = ['biru', 'jingga', 'hijau', 'coklat', 'abu_abu', 'putih', 'merah', 'hitam', 'kuning', 'ungu', 'merah_muda', 'aqua'];
        $rows = [];
        $id = 1;
        foreach ($kabelOdcs as $kabel) {
            for ($i = 0; $i < $kabel['jumlah_tube']; $i++) {
                $rows[] = [
                    'id' => $id,
                    'kabel_odc_id' => $kabel['id'],
                    'warna_tube' => $colors[$i % count($colors)],
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $id++;
            }
        }
        DB::table('fo_kabel_tube_odcs')->insert($rows);
        return $rows;
    }

    protected function seedKabelCoreOdcs(array $tubeOdcs): array
    {
        $colors = ['biru', 'jingga', 'hijau', 'coklat', 'abu_abu', 'putih', 'merah', 'hitam', 'kuning', 'ungu', 'merah_muda', 'aqua'];
        $rows = [];
        $id = 1;
        // Map tube_id to jumlah_core_in_tube
        $tubeCoreMap = [1 => 4, 2 => 4, 3 => 6, 4 => 6, 5 => 8, 6 => 8, 7 => 8, 8 => 8, 9 => 8];
        foreach ($tubeOdcs as $tube) {
            $jumlah_core = $tubeCoreMap[$tube['id']] ?? 4;
            for ($i = 0; $i < $jumlah_core; $i++) {
                $rows[] = [
                    'id' => $id,
                    'kabel_tube_odc_id' => $tube['id'],
                    'warna_core' => $colors[$i % count($colors)],
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $id++;
            }
        }
        DB::table('fo_kabel_core_odcs')->insert($rows);
        return $rows;
    }

    protected function seedOdps(array $odpLokasis, array $coreOdcs): array
    {
        // Only 3 ODPs, each linked to a unique core and its own lokasi
        $rows = [];
        for ($i = 0; $i < 3; $i++) {
            $rows[] = [
                'id' => $i + 1,
                'kabel_core_odc_id' => $coreOdcs[$i]['id'],
                'lokasi_id' => $odpLokasis[$i]['id'],
                'nama_odp' => "ODP-{$odpLokasis[$i]['city']}",
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('fo_odps')->insert($rows);
        return $rows;
    }

    protected function seedClients(array $clientLokasis, array $odps): void
    {
        // Each ODP gets one FTTH client, each with its own lokasi (not shared)
        $rows = [];
        for ($i = 0; $i < 3; $i++) {
            $rows[] = [
                'id' => $i + 1,
                'lokasi_id' => $clientLokasis[$i]['id'],
                'odp_id' => $odps[$i]['id'],
                'client_id' => null,
                'company_id' => 1,
                'nama_client' => "Client-{$clientLokasis[$i]['city']}",
                'alamat' => "Alamat {$clientLokasis[$i]['city']}",
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('fo_client_ftths')->insert($rows);
    }
}
