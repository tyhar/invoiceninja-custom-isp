<?php

namespace App\Http\Controllers;

use App\Models\FoKabelOdc;
use Illuminate\Http\Request;

class FoKabelOdcController extends Controller
{
    protected $model = FoKabelOdc::class;
    /**
     * List all Kabel ODC entries with pagination, filtering, sorting, and status.
     *
     * GET /api/v1/fo-kabel-odcs
     *
     * Query parameters (all optional):
     *   - page (int)
     *   - per_page (int)
     *   - filter (string)           // searches nama_kabel OR tipe_kabel
     *   - sort (string)             // format "column|asc" or "column|dsc"
     *   - status (string)           // comma-separated: "active,archived,deleted"
     */
    public function index(Request $request)
    {
        // 1) Parse `status` into an array of valid statuses
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

        // 2) Base query including trashed, so we can catch "deleted"
        $query = FoKabelOdc::withTrashed();

        // 3) Filter by status
        $query->where(function ($q) use ($statuses) {
            // a) include soft‐deleted rows if "deleted" is requested
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

        // 4) Optional text filtering on nama_kabel or tipe_kabel
        // if ($request->filled('filter')) {
        //     $term = $request->query('filter');
        //     $query->where(function ($q) use ($term) {
        //         $q->where('nama_kabel', 'LIKE', "%{$term}%")
        //             ->orWhere('tipe_kabel', 'LIKE', "%{$term}%");
        //     });
        // }

        // 4) Optional text filtering on nama_kabel, tipe_kabel, or related odc.nama_odc
        if ($request->filled('filter')) {
            $term = $request->query('filter');
            $query->where(function ($q) use ($term) {
                $q->where('nama_kabel', 'LIKE', "%{$term}%")
                    ->orWhere('tipe_kabel', 'LIKE', "%{$term}%")
                    ->orWhereHas('odc', function ($q2) use ($term) {
                        $q2->where('nama_odc', 'LIKE', "%{$term}%");
                    });
            });
        }

        // 5) Optional sorting: e.g. "sort=nama_kabel|asc" or "sort=created_at|dsc"
        if ($request->filled('sort')) {
            [$column, $dir] = array_pad(explode('|', $request->query('sort')), 2, null);
            $dir = (strtolower($dir) === 'dsc') ? 'desc' : 'asc';

            $allowedSorts = [
                'id',
                'nama_kabel',
                'tipe_kabel',
                'panjang_kabel',
                'jumlah_tube',
                'jumlah_core_in_tube',
                'jumlah_total_core',
                'created_at',
                'updated_at',
                'status'
            ];
            if (in_array($column, $allowedSorts, true)) {
                $query->orderBy($column, $dir);
            }
        } else {
            // Default ordering: newest ID first
            $query->orderBy('id', 'desc');
        }

        // 6) Pagination: default 15 items per page
        $perPage = (int) $request->query('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        }

        // 7) Eager‐load 'odc' and 'kabelTubeOdcs', then paginate
        $paginator = $query
            ->with(['odc', 'kabelTubeOdcs'])
            ->paginate($perPage)
            ->appends($request->only(['filter', 'sort', 'per_page', 'status']));

        // 8) Transform results into the desired JSON structure
        $items = array_map(function ($k) {
            return [
                'id'                   => $k->id,
                'odc_id'               => $k->odc_id,
                'odc'                  => [
                    'id'               => $k->odc->id,
                    'nama_odc'         => $k->odc->nama_odc,
                ],
                'nama_kabel'           => $k->nama_kabel,
                'tipe_kabel'           => $k->tipe_kabel,
                'panjang_kabel'        => $k->panjang_kabel,
                'jumlah_tube'          => $k->jumlah_tube,
                'jumlah_core_in_tube'  => $k->jumlah_core_in_tube,
                'jumlah_total_core'    => $k->jumlah_total_core,
                'status'               => $k->status,
                'kabel_tube_odcs'      => $k->kabelTubeOdcs->map(function ($t) {
                    return [
                        'id'                     => $t->id,
                        // If FoKabelTubeOdc has a 'nama_tube' or similar, you can add it here.
                        // For now, we only include 'id'. Adjust as needed:
                        // 'nama_tube'            => $t->nama_tube,
                    ];
                })->toArray(),
                'created_at'           => $k->created_at->toDateTimeString(),
                'updated_at'           => $k->updated_at->toDateTimeString(),
                'deleted_at'           => $k->deleted_at?->toDateTimeString(),
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
     * Create a new Kabel ODC (default status = active).
     *
     * POST /api/v1/fo-kabel-odcs
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'odc_id'               => 'required|exists:fo_odcs,id',
            'nama_kabel'           => 'required|string|max:255',
            'tipe_kabel'           => 'required|in:singlecore,multicore',
            'panjang_kabel'        => 'required|numeric',
            'jumlah_tube'          => 'required|integer',
            'jumlah_core_in_tube'  => 'required|integer',
            // 'jumlah_total_core'    => 'required|integer',
            'status'               => 'sometimes|in:active,archived',
        ]);

        if (!isset($data['status'])) {
            $data['status'] = 'active';
        }

        $k = FoKabelOdc::create($data);
        $k->load(['odc', 'kabelTubeOdcs']);

        return response()->json([
            'status'  => 'success',
            'data'    => [
                'id'                   => $k->id,
                'odc_id'               => $k->odc_id,
                'odc'                  => [
                    'id'               => $k->odc->id,
                    'nama_odc'         => $k->odc->nama_odc,
                ],
                'nama_kabel'           => $k->nama_kabel,
                'tipe_kabel'           => $k->tipe_kabel,
                'panjang_kabel'        => $k->panjang_kabel,
                'jumlah_tube'          => $k->jumlah_tube,
                'jumlah_core_in_tube'  => $k->jumlah_core_in_tube,
                'jumlah_total_core'    => $k->jumlah_total_core,
                'status'               => $k->status,
                'kabel_tube_odcs'      => $k->kabelTubeOdcs->map(function ($t) {
                    return [
                        'id' => $t->id,
                    ];
                })->toArray(),
                'created_at'           => $k->created_at->toDateTimeString(),
                'updated_at'           => $k->updated_at->toDateTimeString(),
            ],
            'message' => 'Kabel ODC created.',
        ], 201);
    }

    /**
     * Show a single Kabel ODC by ID (including soft‐deleted).
     *
     * GET /api/v1/fo-kabel-odcs/{id}
     */
    public function show($id)
    {
        $k = FoKabelOdc::withTrashed()->findOrFail($id);
        $k->load(['odc', 'kabelTubeOdcs']);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'                   => $k->id,
                'odc_id'               => $k->odc_id,
                'odc'                  => [
                    'id'               => $k->odc->id,
                    'nama_odc'         => $k->odc->nama_odc,
                ],
                'nama_kabel'           => $k->nama_kabel,
                'tipe_kabel'           => $k->tipe_kabel,
                'panjang_kabel'        => $k->panjang_kabel,
                'jumlah_tube'          => $k->jumlah_tube,
                'jumlah_core_in_tube'  => $k->jumlah_core_in_tube,
                'jumlah_total_core'    => $k->jumlah_total_core,
                'status'               => $k->status,
                'kabel_tube_odcs'      => $k->kabelTubeOdcs->map(function ($t) {
                    return [
                        'id' => $t->id,
                    ];
                })->toArray(),
                'created_at'           => $k->created_at->toDateTimeString(),
                'updated_at'           => $k->updated_at->toDateTimeString(),
                'deleted_at'           => $k->deleted_at?->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Update an existing Kabel ODC by ID (can also change status).
     *
     * PUT/PATCH /api/v1/fo-kabel-odcs/{id}
     */
    public function update(Request $request, $id)
    {
        $k = FoKabelOdc::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'odc_id'               => 'sometimes|exists:fo_odcs,id',
            'nama_kabel'           => 'sometimes|string|max:255',
            'tipe_kabel'           => 'sometimes|in:singlecore,multicore',
            'panjang_kabel'        => 'sometimes|numeric',
            'jumlah_tube'          => 'sometimes|integer',
            'jumlah_core_in_tube'  => 'sometimes|integer',
            // 'jumlah_total_core'    => 'sometimes|integer',
            'status'               => 'sometimes|in:active,archived',
        ]);

        $k->update($data);
        $k->refresh()->load(['odc', 'kabelTubeOdcs']);

        return response()->json([
            'status'  => 'success',
            'data'    => [
                'id'                   => $k->id,
                'odc_id'               => $k->odc_id,
                'odc'                  => [
                    'id'               => $k->odc->id,
                    'nama_odc'         => $k->odc->nama_odc,
                ],
                'nama_kabel'           => $k->nama_kabel,
                'tipe_kabel'           => $k->tipe_kabel,
                'panjang_kabel'        => $k->panjang_kabel,
                'jumlah_tube'          => $k->jumlah_tube,
                'jumlah_core_in_tube'  => $k->jumlah_core_in_tube,
                'jumlah_total_core'    => $k->jumlah_total_core,
                'status'               => $k->status,
                'kabel_tube_odcs'      => $k->kabelTubeOdcs->map(function ($t) {
                    return [
                        'id' => $t->id,
                    ];
                })->toArray(),
                'created_at'           => $k->created_at->toDateTimeString(),
                'updated_at'           => $k->updated_at->toDateTimeString(),
            ],
            'message' => 'Kabel ODC updated.',
        ], 200);
    }

    /**
     * Soft‐delete a Kabel ODC by ID.
     *
     * DELETE /api/v1/fo-kabel-odcs/{id}
     */
    public function destroy($id)
    {
        $k = FoKabelOdc::findOrFail($id);
        $k->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Kabel ODC soft-deleted.',
        ], 200);
    }

    /**
     * Archive a Kabel ODC (set status = "archived").
     *
     * PATCH /api/v1/fo-kabel-odcs/{id}/archive
     */
    public function archive($id)
    {
        $k = FoKabelOdc::withTrashed()->findOrFail($id);
        $k->update(['status' => 'archived']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Kabel ODC archived.',
        ], 200);
    }

    /**
     * Unarchive a Kabel ODC (set status = "active").
     *
     * PATCH /api/v1/fo-kabel-odcs/{id}/unarchive
     */
    public function unarchive($id)
    {
        $k = FoKabelOdc::withTrashed()->findOrFail($id);
        $k->update(['status' => 'active']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Kabel ODC set to active.',
        ], 200);
    }

    /**
     * Restore a soft‐deleted Kabel ODC (deleted_at = NULL).
     *
     * PATCH /api/v1/fo-kabel-odcs/{id}/restore
     */
    public function restore($id)
    {
        $k = FoKabelOdc::onlyTrashed()->findOrFail($id);
        $k->restore();

        return response()->json([
            'status'  => 'success',
            'message' => 'Kabel ODC restored from deletion.',
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
