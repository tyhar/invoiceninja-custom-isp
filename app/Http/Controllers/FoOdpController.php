<?php

namespace App\Http\Controllers;

use App\Models\FoOdp;
use Illuminate\Http\Request;

class FoOdpController extends Controller
{
    protected $model = FoOdp::class;
    /**
     * List all ODP entries with pagination, filtering, sorting, and status.
     *
     * GET /api/v1/fo-odps
     *
     * Query string parameters (all optional):
     *   • page (int)
     *   • per_page (int)
     *   • filter (string)      // partial match on nama_odp
     *   • sort (string)        // format "column|asc" or "column|dsc"
     *   • status (string)      // comma-separated: "active,archived,deleted"
     */
    public function index(Request $request)
    {
        // 1) Parse 'status' parameter into an array
        $statusParam = $request->query('status', 'active');
        $requested = collect(explode(',', $statusParam))
            ->map(fn($s) => trim(strtolower($s)))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $validStatuses = ['active', 'archived', 'deleted'];
        $statuses = array_values(array_intersect($requested, $validStatuses));
        if (empty($statuses)) {
            $statuses = ['active'];
        }

        // 2) Base query including soft-deleted rows
        $query = FoOdp::withTrashed();

        // 3) Filter by status
        $query->where(function ($q) use ($statuses) {
            // a) include soft-deleted if 'deleted' requested
            if (in_array('deleted', $statuses, true)) {
                $q->orWhereNotNull('deleted_at');
            }
            // b) include active/archived where deleted_at IS NULL
            $nonDeleted = array_values(array_intersect($statuses, ['active', 'archived']));
            if (!empty($nonDeleted)) {
                $q->orWhere(function ($sub) use ($nonDeleted) {
                    $sub->whereNull('deleted_at')
                        ->whereIn('status', $nonDeleted);
                });
            }
        });

        // 4) Optional text filtering on nama_odp or related kabelCoreOdc (and even its tube)
        if ($request->filled('filter')) {
            $term = $request->query('filter');

            $query->where(function ($q) use ($term) {
                // a) match on the ODP name
                $q->where('nama_odp', 'LIKE', "%{$term}%")
                    // b) or on the core's own warna_core
                    ->orWhereHas('kabelCoreOdc', function ($q2) use ($term) {
                        $q2->where('warna_core', 'LIKE', "%{$term}%")
                            // c) optionally also on the parent tube's warna_tube
                            ->orWhereHas('kabelTubeOdc', function ($q3) use ($term) {
                                $q3->where('warna_tube', 'LIKE', "%{$term}%");
                            });
                    });
            });
        }


        // 5) Optional sorting: "column|asc" or "column|dsc"
        if ($request->filled('sort')) {
            [$column, $dir] = array_pad(explode('|', $request->query('sort')), 2, null);
            $dir = (strtolower($dir) === 'dsc') ? 'desc' : 'asc';

            $allowedSorts = [
                'id',
                'nama_odp',
                'created_at',
                'updated_at',
                'status',
            ];
            if (in_array($column, $allowedSorts, true)) {
                $query->orderBy($column, $dir);
            }
        } else {
            // Default: newest first by id
            $query->orderBy('id', 'desc');
        }

        // 6) Pagination (default 15 per page)
        $perPage = max(1, (int) $request->query('per_page', 15));

        // 7) Eager-load relationships and paginate
        $paginator = $query
            ->with([
                'lokasi',
                'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc.lokasi',
                'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc.kabelOdcs.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.lokasi',
                'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc.kabelOdcs.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.client',
                'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc.kabelOdcs.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.company',
                'clientFtth.lokasi',
                'clientFtth.client',
                'clientFtth.company'
            ])
            ->paginate($perPage)
            ->appends($request->only(['filter', 'sort', 'per_page', 'status']));

        // 8) Transform each FoOdp into JSON structure
        $items = array_map(function ($o) {
            $core = $o->kabelCoreOdc;
            $tube = $core?->kabelTubeOdc;
            $kabelOdc = $tube?->kabelOdc;
            $topOdc = $kabelOdc?->odc;

            return [
                'id'         => $o->id,
                'nama_odp'   => $o->nama_odp,
                'lokasi'     => $o->lokasi ? [
                    'id'          => $o->lokasi->id,
                    'nama_lokasi' => $o->lokasi->nama_lokasi,
                    'deskripsi'   => $o->lokasi->deskripsi,
                    'latitude'    => $o->lokasi->latitude,
                    'longitude'   => $o->lokasi->longitude,
                    'status'      => $o->lokasi->status,
                    'created_at'  => $o->lokasi->created_at?->toDateTimeString(),
                    'updated_at'  => $o->lokasi->updated_at?->toDateTimeString(),
                    'deleted_at'  => $o->lokasi->deleted_at?->toDateTimeString(),
                ] : null,

                'kabel_core_odc' => $core ? [
                    'id'         => $core->id,
                    'warna_core' => $core->warna_core,
                    'status'     => $core->status,
                    'created_at' => $core->created_at?->toDateTimeString(),
                    'updated_at' => $core->updated_at?->toDateTimeString(),
                    'deleted_at' => $core->deleted_at?->toDateTimeString(),
                    'kabel_tube_odc' => $tube ? [
                        'id'         => $tube->id,
                        'warna_tube' => $tube->warna_tube,
                        'status'     => $tube->status,
                        'created_at' => $tube->created_at?->toDateTimeString(),
                        'updated_at' => $tube->updated_at?->toDateTimeString(),
                        'deleted_at' => $tube->deleted_at?->toDateTimeString(),
                    ] : null,
                    'kabel_odc' => $kabelOdc ? [
                        'id'          => $kabelOdc->id,
                        'nama_kabel'  => $kabelOdc->nama_kabel,
                        'tipe_kabel'  => $kabelOdc->tipe_kabel,
                        'panjang_kabel' => $kabelOdc->panjang_kabel,
                        'jumlah_tube' => $kabelOdc->jumlah_tube,
                        'jumlah_core_in_tube' => $kabelOdc->jumlah_core_in_tube,
                        'jumlah_total_core' => $kabelOdc->jumlah_total_core,
                        'status'      => $kabelOdc->status,
                        'created_at'  => $kabelOdc->created_at?->toDateTimeString(),
                        'updated_at'  => $kabelOdc->updated_at?->toDateTimeString(),
                        'deleted_at'  => $kabelOdc->deleted_at?->toDateTimeString(),
                    ] : null,
                ] : null,

                'odc' => $topOdc ? [
                    'id'       => $topOdc->id,
                    'nama_odc' => $topOdc->nama_odc,
                    'tipe_splitter' => $topOdc->tipe_splitter,
                    'status'   => $topOdc->status,
                    'created_at' => $topOdc->created_at?->toDateTimeString(),
                    'updated_at' => $topOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $topOdc->deleted_at?->toDateTimeString(),
                    'lokasi'   => $topOdc->lokasi ? [
                        'id'          => $topOdc->lokasi->id,
                        'nama_lokasi' => $topOdc->lokasi->nama_lokasi,
                        'deskripsi'   => $topOdc->lokasi->deskripsi,
                        'latitude'    => $topOdc->lokasi->latitude,
                        'longitude'   => $topOdc->lokasi->longitude,
                        'status'      => $topOdc->lokasi->status,
                    ] : null,
                    'kabel_odcs' => $topOdc->kabelOdcs->map(function ($k) {
                        return [
                            'id'                   => $k->id,
                            'nama_kabel'           => $k->nama_kabel,
                            'tipe_kabel'           => $k->tipe_kabel,
                            'panjang_kabel'        => $k->panjang_kabel,
                            'jumlah_tube'          => $k->jumlah_tube,
                            'jumlah_core_in_tube'  => $k->jumlah_core_in_tube,
                            'jumlah_total_core'    => $k->jumlah_total_core,
                            'status'               => $k->status,
                            'created_at'           => $k->created_at?->toDateTimeString(),
                            'updated_at'           => $k->updated_at?->toDateTimeString(),
                            'deleted_at'           => $k->deleted_at?->toDateTimeString(),
                            'kabel_tube_odcs'      => $k->kabelTubeOdcs->map(function ($t) {
                                return [
                                    'id'                 => $t->id,
                                    'warna_tube'         => $t->warna_tube,
                                    'status'             => $t->status,
                                    'created_at'         => $t->created_at?->toDateTimeString(),
                                    'updated_at'         => $t->updated_at?->toDateTimeString(),
                                    'deleted_at'         => $t->deleted_at?->toDateTimeString(),
                                    'kabel_core_odcs'    => $t->kabelCoreOdcs->map(function ($c) {
                                        return [
                                            'id'                => $c->id,
                                            'warna_core'        => $c->warna_core,
                                            'status'            => $c->status,
                                            'created_at'        => $c->created_at?->toDateTimeString(),
                                            'updated_at'        => $c->updated_at?->toDateTimeString(),
                                            'deleted_at'        => $c->deleted_at?->toDateTimeString(),
                                            'odp'               => $c->odp ? [
                                                'id'             => $c->odp->id,
                                                'nama_odp'       => $c->odp->nama_odp,
                                                'status'         => $c->odp->status,
                                                'created_at'     => $c->odp->created_at?->toDateTimeString(),
                                                'updated_at'     => $c->odp->updated_at?->toDateTimeString(),
                                                'deleted_at'     => $c->odp->deleted_at?->toDateTimeString(),
                                                'client_ftth'    => $c->odp->clientFtth ? [
                                                    'id'           => $c->odp->clientFtth->id,
                                                    'nama_client'  => $c->odp->clientFtth->nama_client,
                                                    'alamat'       => $c->odp->clientFtth->alamat,
                                                    'status'       => $c->odp->clientFtth->status,
                                                    'created_at'   => $c->odp->clientFtth->created_at?->toDateTimeString(),
                                                    'updated_at'   => $c->odp->clientFtth->updated_at?->toDateTimeString(),
                                                    'deleted_at'   => $c->odp->clientFtth->deleted_at?->toDateTimeString(),
                                                    'lokasi'       => $c->odp->clientFtth->lokasi ? [
                                                        'id'           => $c->odp->clientFtth->lokasi->id,
                                                        'nama_lokasi'  => $c->odp->clientFtth->lokasi->nama_lokasi,
                                                        'deskripsi'    => $c->odp->clientFtth->lokasi->deskripsi,
                                                        'latitude'     => $c->odp->clientFtth->lokasi->latitude,
                                                        'longitude'    => $c->odp->clientFtth->lokasi->longitude,
                                                        'status'       => $c->odp->clientFtth->lokasi->status,
                                                    ] : null,
                                                    'client'       => $c->odp->clientFtth->client ? [
                                                        'id'           => $c->odp->clientFtth->client->id,
                                                        'name'         => $c->odp->clientFtth->client->name,
                                                        'phone'        => $c->odp->clientFtth->client->phone,
                                                        'email'        => $c->odp->clientFtth->client->email,
                                                        'address1'     => $c->odp->clientFtth->client->address1,
                                                        'address2'     => $c->odp->clientFtth->client->address2,
                                                        'city'         => $c->odp->clientFtth->client->city,
                                                        'state'        => $c->odp->clientFtth->client->state,
                                                        'postal_code'  => $c->odp->clientFtth->client->postal_code,
                                                        'country_id'   => $c->odp->clientFtth->client->country_id,
                                                        'status_id'    => $c->odp->clientFtth->client->status_id,
                                                    ] : null,
                                                    'company'      => $c->odp->clientFtth->company ? [
                                                        'id'           => $c->odp->clientFtth->company->id,
                                                        'name'         => $c->odp->clientFtth->company->name,
                                                    ] : null,
                                                ] : null,
                                            ] : null,
                                        ];
                                    })->toArray(),
                                ];
                            })->toArray(),
                        ];
                    })->toArray(),
                ] : null,

                'client_ftth' => $o->clientFtth ? [
                    'id'          => $o->clientFtth->id,
                    'nama_client' => $o->clientFtth->nama_client,
                    'alamat'      => $o->clientFtth->alamat,
                    'status'      => $o->clientFtth->status,
                    'created_at'  => $o->clientFtth->created_at?->toDateTimeString(),
                    'updated_at'  => $o->clientFtth->updated_at?->toDateTimeString(),
                    'deleted_at'  => $o->clientFtth->deleted_at?->toDateTimeString(),
                    'lokasi'      => $o->clientFtth->lokasi ? [
                        'id'          => $o->clientFtth->lokasi->id,
                        'nama_lokasi' => $o->clientFtth->lokasi->nama_lokasi,
                        'deskripsi'   => $o->clientFtth->lokasi->deskripsi,
                        'latitude'    => $o->clientFtth->lokasi->latitude,
                        'longitude'   => $o->clientFtth->lokasi->longitude,
                        'status'      => $o->clientFtth->lokasi->status,
                    ] : null,
                    'client'      => $o->clientFtth->client ? [
                        'id'           => $o->clientFtth->client->id,
                        'name'         => $o->clientFtth->client->name,
                        'phone'        => $o->clientFtth->client->phone,
                        'email'        => $o->clientFtth->client->email,
                        'address1'     => $o->clientFtth->client->address1,
                        'address2'     => $o->clientFtth->client->address2,
                        'city'         => $o->clientFtth->client->city,
                        'state'        => $o->clientFtth->client->state,
                        'postal_code'  => $o->clientFtth->client->postal_code,
                        'country_id'   => $o->clientFtth->client->country_id,
                        'status_id'    => $o->clientFtth->client->status_id,
                    ] : null,
                    'company'     => $o->clientFtth->company ? [
                        'id'           => $o->clientFtth->company->id,
                        'name'         => $o->clientFtth->company->name,
                    ] : null,
                ] : null,

                'status'     => $o->status,
                'created_at' => $o->created_at->toDateTimeString(),
                'updated_at' => $o->updated_at->toDateTimeString(),
                'deleted_at' => $o->deleted_at?->toDateTimeString(),
            ];
        }, $paginator->items());

        return response()->json([
            'status' => 'success',
            'data'   => $items,
            'meta'   => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ], 200);
    }

    /**
     * Create a new ODP (default status = active).
     *
     * POST /api/v1/fo-odps
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'lokasi_id'         => 'required|exists:fo_lokasis,id',
            'kabel_core_odc_id' => 'nullable|exists:fo_kabel_core_odcs,id',
            'nama_odp'          => 'required|string|max:255',
            'status'            => 'sometimes|in:active,archived',
        ]);

        // Check if the kabel_core_odc_id already has an associated FoOdp
        if (isset($data['kabel_core_odc_id'])) {
            $exists = FoOdp::where('kabel_core_odc_id', $data['kabel_core_odc_id'])->exists();
            if ($exists) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'This core is already associated with another ODP.',
                    'errors'  => [
                        'kabel_core_odc_id' => ['This core is already associated with another ODP.'],
                    ],
                ], 422);
            }
        }

        $data['status'] = $data['status'] ?? 'active';

        // 1) Create
        $o = FoOdp::create($data);

        // 2) Eager‑load the full chain: Lokasi, Core→Tube→ODC, and clientFtth
        $o->load([
            'lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc.lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc.kabelOdcs.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc.kabelOdcs.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.client',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc.kabelOdcs.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.company',
            'clientFtth.lokasi',
            'clientFtth.client',
            'clientFtth.company'
        ]);

        // 3) Build the response exactly like in update()
        // Build same mapping as index
        $core = $o->kabelCoreOdc;
        $tube = $core?->kabelTubeOdc;
        $kabelOdc = $tube?->kabelOdc;
        $topOdc = $kabelOdc?->odc;

        $responseData = [
            'id'           => $o->id,
            'nama_odp'     => $o->nama_odp,
            'lokasi'       => $o->lokasi ? [
                'id'          => $o->lokasi->id,
                'nama_lokasi' => $o->lokasi->nama_lokasi,
                'deskripsi'   => $o->lokasi->deskripsi,
                'latitude'    => $o->lokasi->latitude,
                'longitude'   => $o->lokasi->longitude,
                'status'      => $o->lokasi->status,
                'created_at'  => $o->lokasi->created_at?->toDateTimeString(),
                'updated_at'  => $o->lokasi->updated_at?->toDateTimeString(),
                'deleted_at'  => $o->lokasi->deleted_at?->toDateTimeString(),
            ] : null,

            'kabel_core_odc' => $core ? [
                'id'         => $core->id,
                'warna_core' => $core->warna_core,
                'status'     => $core->status,
                'created_at' => $core->created_at?->toDateTimeString(),
                'updated_at' => $core->updated_at?->toDateTimeString(),
                'deleted_at' => $core->deleted_at?->toDateTimeString(),
                'kabel_tube_odc' => $tube ? [
                    'id'         => $tube->id,
                    'warna_tube' => $tube->warna_tube,
                    'status'     => $tube->status,
                    'created_at' => $tube->created_at?->toDateTimeString(),
                    'updated_at' => $tube->updated_at?->toDateTimeString(),
                    'deleted_at' => $tube->deleted_at?->toDateTimeString(),
                ] : null,
                'kabel_odc' => $kabelOdc ? [
                    'id'          => $kabelOdc->id,
                    'nama_kabel'  => $kabelOdc->nama_kabel,
                    'tipe_kabel'  => $kabelOdc->tipe_kabel,
                    'panjang_kabel' => $kabelOdc->panjang_kabel,
                    'jumlah_tube' => $kabelOdc->jumlah_tube,
                    'jumlah_core_in_tube' => $kabelOdc->jumlah_core_in_tube,
                    'jumlah_total_core' => $kabelOdc->jumlah_total_core,
                    'status'      => $kabelOdc->status,
                    'created_at'  => $kabelOdc->created_at?->toDateTimeString(),
                    'updated_at'  => $kabelOdc->updated_at?->toDateTimeString(),
                    'deleted_at'  => $kabelOdc->deleted_at?->toDateTimeString(),
                ] : null,
            ] : null,

            'odc' => $topOdc ? [
                'id'       => $topOdc->id,
                'nama_odc' => $topOdc->nama_odc,
                'tipe_splitter' => $topOdc->tipe_splitter,
                'status'   => $topOdc->status,
                'created_at' => $topOdc->created_at?->toDateTimeString(),
                'updated_at' => $topOdc->updated_at?->toDateTimeString(),
                'deleted_at' => $topOdc->deleted_at?->toDateTimeString(),
                'lokasi'   => $topOdc->lokasi ? [
                    'id'          => $topOdc->lokasi->id,
                    'nama_lokasi' => $topOdc->lokasi->nama_lokasi,
                    'deskripsi'   => $topOdc->lokasi->deskripsi,
                    'latitude'    => $topOdc->lokasi->latitude,
                    'longitude'   => $topOdc->lokasi->longitude,
                    'status'      => $topOdc->lokasi->status,
                ] : null,
                'kabel_odcs' => $topOdc->kabelOdcs->map(function ($k) {
                    return [
                        'id'                   => $k->id,
                        'nama_kabel'           => $k->nama_kabel,
                        'tipe_kabel'           => $k->tipe_kabel,
                        'panjang_kabel'        => $k->panjang_kabel,
                        'jumlah_tube'          => $k->jumlah_tube,
                        'jumlah_core_in_tube'  => $k->jumlah_core_in_tube,
                        'jumlah_total_core'    => $k->jumlah_total_core,
                        'status'               => $k->status,
                        'created_at'           => $k->created_at?->toDateTimeString(),
                        'updated_at'           => $k->updated_at?->toDateTimeString(),
                        'deleted_at'           => $k->deleted_at?->toDateTimeString(),
                        'kabel_tube_odcs'      => $k->kabelTubeOdcs->map(function ($t) {
                            return [
                                'id'                 => $t->id,
                                'warna_tube'         => $t->warna_tube,
                                'status'             => $t->status,
                                'created_at'         => $t->created_at?->toDateTimeString(),
                                'updated_at'         => $t->updated_at?->toDateTimeString(),
                                'deleted_at'         => $t->deleted_at?->toDateTimeString(),
                                'kabel_core_odcs'    => $t->kabelCoreOdcs->map(function ($c) {
                                    return [
                                        'id'                => $c->id,
                                        'warna_core'        => $c->warna_core,
                                        'status'            => $c->status,
                                        'created_at'        => $c->created_at?->toDateTimeString(),
                                        'updated_at'        => $c->updated_at?->toDateTimeString(),
                                        'deleted_at'        => $c->deleted_at?->toDateTimeString(),
                                        'odp'               => $c->odp ? [
                                            'id'             => $c->odp->id,
                                            'nama_odp'       => $c->odp->nama_odp,
                                            'status'         => $c->odp->status,
                                            'created_at'     => $c->odp->created_at?->toDateTimeString(),
                                            'updated_at'     => $c->odp->updated_at?->toDateTimeString(),
                                            'deleted_at'     => $c->odp->deleted_at?->toDateTimeString(),
                                            'client_ftth'    => $c->odp->clientFtth ? [
                                                'id'           => $c->odp->clientFtth->id,
                                                'nama_client'  => $c->odp->clientFtth->nama_client,
                                                'alamat'       => $c->odp->clientFtth->alamat,
                                                'status'       => $c->odp->clientFtth->status,
                                                'created_at'   => $c->odp->clientFtth->created_at?->toDateTimeString(),
                                                'updated_at'   => $c->odp->clientFtth->updated_at?->toDateTimeString(),
                                                'deleted_at'   => $c->odp->clientFtth->deleted_at?->toDateTimeString(),
                                                'lokasi'       => $c->odp->clientFtth->lokasi ? [
                                                    'id'           => $c->odp->clientFtth->lokasi->id,
                                                    'nama_lokasi'  => $c->odp->clientFtth->lokasi->nama_lokasi,
                                                    'deskripsi'    => $c->odp->clientFtth->lokasi->deskripsi,
                                                    'latitude'     => $c->odp->clientFtth->lokasi->latitude,
                                                    'longitude'    => $c->odp->clientFtth->lokasi->longitude,
                                                    'status'       => $c->odp->clientFtth->lokasi->status,
                                                ] : null,
                                                'client'       => $c->odp->clientFtth->client ? [
                                                    'id'           => $c->odp->clientFtth->client->id,
                                                    'name'         => $c->odp->clientFtth->client->name,
                                                    'phone'        => $c->odp->clientFtth->client->phone,
                                                    'email'        => $c->odp->clientFtth->client->email,
                                                    'address1'     => $c->odp->clientFtth->client->address1,
                                                    'address2'     => $c->odp->clientFtth->client->address2,
                                                    'city'         => $c->odp->clientFtth->client->city,
                                                    'state'        => $c->odp->clientFtth->client->state,
                                                    'postal_code'  => $c->odp->clientFtth->client->postal_code,
                                                    'country_id'   => $c->odp->clientFtth->client->country_id,
                                                    'status_id'    => $c->odp->clientFtth->client->status_id,
                                                ] : null,
                                                'company'      => $c->odp->clientFtth->company ? [
                                                    'id'           => $c->odp->clientFtth->company->id,
                                                    'name'         => $c->odp->clientFtth->company->name,
                                                ] : null,
                                            ] : null,
                                        ] : null,
                                    ];
                                })->toArray(),
                            ];
                        })->toArray(),
                    ];
                })->toArray(),
            ] : null,

            'client_ftth' => $o->clientFtth ? [
                'id'          => $o->clientFtth->id,
                'nama_client' => $o->clientFtth->nama_client,
                'alamat'      => $o->clientFtth->alamat,
                'status'      => $o->clientFtth->status,
                'created_at'  => $o->clientFtth->created_at?->toDateTimeString(),
                'updated_at'  => $o->clientFtth->updated_at?->toDateTimeString(),
                'deleted_at'  => $o->clientFtth->deleted_at?->toDateTimeString(),
                'lokasi'      => $o->clientFtth->lokasi ? [
                    'id'          => $o->clientFtth->lokasi->id,
                    'nama_lokasi' => $o->clientFtth->lokasi->nama_lokasi,
                    'deskripsi'   => $o->clientFtth->lokasi->deskripsi,
                    'latitude'    => $o->clientFtth->lokasi->latitude,
                    'longitude'   => $o->clientFtth->lokasi->longitude,
                    'status'      => $o->clientFtth->lokasi->status,
                ] : null,
                'client'      => $o->clientFtth->client ? [
                    'id'           => $o->clientFtth->client->id,
                    'name'         => $o->clientFtth->client->name,
                    'phone'        => $o->clientFtth->client->phone,
                    'email'        => $o->clientFtth->client->email,
                    'address1'     => $o->clientFtth->client->address1,
                    'address2'     => $o->clientFtth->client->address2,
                    'city'         => $o->clientFtth->client->city,
                    'state'        => $o->clientFtth->client->state,
                    'postal_code'  => $o->clientFtth->client->postal_code,
                    'country_id'   => $o->clientFtth->client->country_id,
                    'status_id'    => $o->clientFtth->client->status_id,
                ] : null,
                'company'     => $o->clientFtth->company ? [
                    'id'           => $o->clientFtth->company->id,
                    'name'         => $o->clientFtth->company->name,
                ] : null,
            ] : null,

            'status'     => $o->status,
            'created_at' => $o->created_at->toDateTimeString(),
            'updated_at' => $o->updated_at->toDateTimeString(),
        ];

        return response()->json([
            'status'  => 'success',
            'data'    => $responseData,
            'message' => 'ODP created.',
        ], 201);
    }

    /**
     * Show a single ODP by ID (including soft-deleted).
     *
     * GET /api/v1/fo-odps/{id}
     */
    public function show($id)
    {
        $o = FoOdp::withTrashed()->findOrFail($id);
        $o->load([
            'lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc',
            'clientFtth',
        ]);

        // Null‐safety chain
        $core     = $o->kabelCoreOdc;
        $tube     = $core?->kabelTubeOdc;
        $kabelOdc = $tube?->kabelOdc;
        $topOdc   = $kabelOdc?->odc;

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'       => $o->id,
                'nama_odp' => $o->nama_odp,

                'lokasi'   => $o->lokasi ? [
                    'id'          => $o->lokasi->id,
                    'nama_lokasi' => $o->lokasi->nama_lokasi,
                ] : null,

                'kabel_core_odc' => $core ? [
                    'id'         => $core->id,
                    'warna_core' => $core->warna_core,
                    'kabel_tube_odc' => $tube ? [
                        'id'         => $tube->id,
                        'warna_tube' => $tube->warna_tube,
                    ] : null,
                    'kabel_odc' => $kabelOdc ? [
                        'id'         => $kabelOdc->id,
                        'nama_kabel' => $kabelOdc->nama_kabel,
                    ] : null,
                ] : null,

                'odc' => $topOdc ? [
                    'id'      => $topOdc->id,
                    'nama_odc' => $topOdc->nama_odc,
                ] : null,

                'client_ftth' => $o->clientFtth ? [
                    'id'          => $o->clientFtth->id,
                    'nama_client' => $o->clientFtth->nama_client,
                    'alamat'      => $o->clientFtth->alamat,
                ] : null,

                'status'     => $o->status,
                'created_at' => $o->created_at->toDateTimeString(),
                'updated_at' => $o->updated_at->toDateTimeString(),
                'deleted_at' => $o->deleted_at?->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Update an existing ODP by ID (can also change status and unlink core).
     *
     * PUT/PATCH /api/v1/fo-odps/{id}
     */
    public function update(Request $request, $id)
    {
        $odp = FoOdp::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'lokasi_id'         => 'sometimes|exists:fo_lokasis,id',
            'kabel_core_odc_id' => 'nullable|exists:fo_kabel_core_odcs,id',
            'nama_odp'          => 'sometimes|string|max:255',
            'status'            => 'sometimes|in:active,archived',
        ]);

        // Check core linkage conflict
        if (array_key_exists('kabel_core_odc_id', $data) && $data['kabel_core_odc_id'] !== null) {
            $conflict = FoOdp::where('kabel_core_odc_id', $data['kabel_core_odc_id'])
                ->where('id', '!=', $odp->id)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'This core is already associated with another ODP.',
                    'errors'  => [
                        'kabel_core_odc_id' => ['This core is already associated with another ODP.'],
                    ],
                ], 422);
            }
        }

        // Perform update (allows unlinking if null)
        $odp->update($data);

        // Reload nested relations
        $odp->refresh()->load([
            'lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odc',
            'clientFtth',
        ]);

        // Safely build JSON, guarding against null relations
        $core = $odp->kabelCoreOdc;
        $tube = $core?->kabelTubeOdc;
        $kabelOdc = $tube?->kabelOdc;
        $topOdc = $kabelOdc?->odc;

        return response()->json([
            'status'  => 'success',
            'data'    => [
                'id'                 => $odp->id,
                'nama_odp'           => $odp->nama_odp,
                'lokasi'             => $odp->lokasi ? [
                    'id'            => $odp->lokasi->id,
                    'nama_lokasi'   => $odp->lokasi->nama_lokasi,
                ] : null,

                // core/tube/odc chain
                'kabel_core_odc'     => $core ? [
                    'id'         => $core->id,
                    'warna_core' => $core->warna_core,
                    'kabel_tube_odc' => $tube ? [
                        'id'         => $tube->id,
                        'warna_tube' => $tube->warna_tube,
                    ] : null,
                    'kabel_odc' => $kabelOdc ? [
                        'id'          => $kabelOdc->id,
                        'nama_kabel'  => $kabelOdc->nama_kabel,
                    ] : null,
                ] : null,

                // top-level ODC via tube -> kabelOdc -> odc
                'odc'                => $topOdc ? [
                    'id'      => $topOdc->id,
                    'nama_odc' => $topOdc->nama_odc,
                ] : null,

                'client_ftth'        => $odp->clientFtth ? [
                    'id'          => $odp->clientFtth->id,
                    'nama_client' => $odp->clientFtth->nama_client,
                    'alamat'      => $odp->clientFtth->alamat,
                ] : null,

                'status'             => $odp->status,
                'created_at'         => $odp->created_at->toDateTimeString(),
                'updated_at'         => $odp->updated_at->toDateTimeString(),
            ],
            'message' => 'ODP updated successfully.',
        ], 200);
    }

    /**
     * Soft‐delete an ODP by ID.
     *
     * DELETE /api/v1/fo-odps/{id}
     */
    public function destroy($id)
    {
        $o = FoOdp::findOrFail($id);
        $o->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'ODP soft-deleted.',
        ], 200);
    }

    /**
     * Archive an ODP (set status = "archived").
     *
     * PATCH /api/v1/fo-odps/{id}/archive
     */
    public function archive($id)
    {
        $o = FoOdp::withTrashed()->findOrFail($id);
        $o->update(['status' => 'archived']);

        return response()->json([
            'status'  => 'success',
            'message' => 'ODP archived.',
        ], 200);
    }

    /**
     * Unarchive an ODP (set status = "active").
     *
     * PATCH /api/v1/fo-odps/{id}/unarchive
     */
    public function unarchive($id)
    {
        $o = FoOdp::withTrashed()->findOrFail($id);
        $o->update(['status' => 'active']);

        return response()->json([
            'status'  => 'success',
            'message' => 'ODP set to active.',
        ], 200);
    }

    /**
     * Restore a soft‐deleted ODP (deleted_at = NULL).
     *
     * PATCH /api/v1/fo-odps/{id}/restore
     */
    public function restore($id)
    {
        $o = FoOdp::onlyTrashed()->findOrFail($id);
        $o->restore();

        return response()->json([
            'status'  => 'success',
            'message' => 'ODP restored from deletion.',
        ], 200);
    }

    /**
     * Bulk operation: archive | delete | restore.
     *
     * POST /api/v1/…/bulk
     * {
     *   "action":  "archive"|"delete"|"restore",
     *   "ids":      [1,2,3]
     * }
     */
    public function bulk(Request $request)
    {
        $data = $request->validate([
            'action' => 'required|in:archive,delete,restore',
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer|distinct',
        ]);

        $ids    = $data['ids'];
        $action = $data['action'];

        switch ($action) {
            case 'archive':
                // Set status = 'archived'
                $this->model::withTrashed()
                    ->whereIn('id', $ids)
                    ->update(['status' => 'archived']);
                $message = 'Items archived.';
                break;

            case 'delete':
                // Soft‐delete all (mark deleted_at)
                $this->model::whereIn('id', $ids)->delete();
                $message = 'Items soft‐deleted.';
                break;

            case 'restore':
                // First restore soft‐deleted
                $this->model::onlyTrashed()
                    ->whereIn('id', $ids)
                    ->restore();
                // Then set status back to 'active'
                $this->model::whereIn('id', $ids)
                    ->update(['status' => 'active']);
                $message = 'Items restored to active.';
                break;

            default:
                // Should never happen due to validation
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Invalid action.',
                ], 422);
        }

        return response()->json([
            'status'  => 'success',
            'message' => $message,
        ], 200);
    }
}
