<?php

namespace App\Http\Controllers;

use App\Models\FoKabelTubeOdc;
use Illuminate\Http\Request;

class FoKabelTubeOdcController extends Controller
{
    protected $model = FoKabelTubeOdc::class;
    /**
     * List all Kabel‐Tube‐ODC entries with pagination, filtering, sorting, and status.
     *
     * GET /api/v1/fo-kabel-tube-odcs
     *
     * Query string parameters (all optional):
     *   • page (int)
     *   • per_page (int)
     *   • filter (string)           // matches warna_tube
     *   • sort (string)             // format: "column|asc" or "column|dsc"
     *   • status (string)           // comma-separated: "active,archived,deleted"
     */
    public function index(Request $request)
    {
        // 1) Parse `status` parameter into an array
        $statusParam = $request->query('status', 'active');
        $requested   = collect(explode(',', $statusParam))
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

        // 2) Base query including soft‐deleted rows
        $query = FoKabelTubeOdc::withTrashed();

        // 3) Filter by status
        $query->where(function ($q) use ($statuses) {
            // a) include soft‐deleted if "deleted" requested
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

        // 4) Optional text filter on warna_tube
        // if ($request->filled('filter')) {
        //     $term = $request->query('filter');
        //     $query->where('warna_tube', 'LIKE', "%{$term}%");
        // }

        // 4) Optional text filter on warna_tube or related kabelOdc.nama_kabel
        if ($request->filled('filter')) {
            $term = $request->query('filter');
            $query->where(function ($q) use ($term) {
                $q->where('warna_tube', 'LIKE', "%{$term}%")
                    ->orWhereHas('kabelOdc', function ($q2) use ($term) {
                        $q2->where('nama_kabel', 'LIKE', "%{$term}%");
                    });
            });
        }

        // 5) Optional sorting: "column|asc" or "column|dsc"
        if ($request->filled('sort')) {
            [$column, $dir] = array_pad(explode('|', $request->query('sort')), 2, null);
            $dir = (strtolower($dir) === 'dsc') ? 'desc' : 'asc';

            $allowedSorts = [
                'id',
                'warna_tube',
                'created_at',
                'updated_at',
                'status',
            ];
            if (in_array($column, $allowedSorts, true)) {
                $query->orderBy($column, $dir);
            }
        } else {
            // Default ordering: newest ID first
            $query->orderBy('id', 'desc');
        }

        // 6) Pagination (default 15 per page)
        $perPage = (int) $request->query('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        }

        // 7) Eager‐load relationships and paginate
        $paginator = $query
            ->with(['kabelOdc', 'kabelCoreOdcs'])
            ->paginate($perPage)
            ->appends($request->only(['filter', 'sort', 'per_page', 'status']));

        // 8) Transform each entry into JSON structure
        $data = array_map(function ($t) {
            return [
                'id'                 => $t->id,
                'kabel_odc_id'       => $t->kabel_odc_id,
                'kabel_odc'          => [
                    'id'           => $t->kabelOdc->id,
                    'nama_kabel'   => $t->kabelOdc->nama_kabel,
                ],
                'warna_tube'         => $t->warna_tube,
                'status'             => $t->status,
                'kabel_core_odc_ids' => $t->kabelCoreOdcs->pluck('id')->toArray(),
                'created_at'         => $t->created_at->toDateTimeString(),
                'updated_at'         => $t->updated_at->toDateTimeString(),
                'deleted_at'         => $t->deleted_at?->toDateTimeString(),
            ];
        }, $paginator->items());

        return response()->json([
            'status' => 'success',
            'data'   => $data,
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
     * Create a new Kabel‐Tube‐ODC (default status = active).
     *
     * POST /api/v1/fo-kabel-tube-odcs
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'kabel_odc_id'    => 'required|exists:fo_kabel_odcs,id',
            'warna_tube'      => 'required|in:biru,jingga,hijau,coklat,abu_abu,putih,merah,hitam,kuning,ungu,merah_muda,aqua',
            'status'          => 'sometimes|in:active,archived',
        ]);

        if (!isset($data['status'])) {
            $data['status'] = 'active';
        }

        $t = FoKabelTubeOdc::create($data);
        $t->load(['kabelOdc', 'kabelCoreOdcs']);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'                 => $t->id,
                'kabel_odc_id'       => $t->kabel_odc_id,
                'kabel_odc'          => [
                    'id'           => $t->kabelOdc->id,
                    'nama_kabel'   => $t->kabelOdc->nama_kabel,
                ],
                'warna_tube'         => $t->warna_tube,
                'status'             => $t->status,
                'kabel_core_odc_ids' => $t->kabelCoreOdcs->pluck('id')->toArray(),
                'created_at'         => $t->created_at->toDateTimeString(),
                'updated_at'         => $t->updated_at->toDateTimeString(),
            ],
            'message' => 'Tube ODC created.',
        ], 201);
    }

    /**
     * Show a single Kabel‐Tube‐ODC by ID (including soft‐deleted).
     *
     * GET /api/v1/fo-kabel-tube-odcs/{id}
     */
    public function show($id)
    {
        $t = FoKabelTubeOdc::withTrashed()->findOrFail($id);
        $t->load(['kabelOdc', 'kabelCoreOdcs']);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'                 => $t->id,
                'kabel_odc_id'       => $t->kabel_odc_id,
                'kabel_odc'          => [
                    'id'           => $t->kabelOdc->id,
                    'nama_kabel'   => $t->kabelOdc->nama_kabel,
                ],
                'warna_tube'         => $t->warna_tube,
                'status'             => $t->status,
                'kabel_core_odc_ids' => $t->kabelCoreOdcs->pluck('id')->toArray(),
                'created_at'         => $t->created_at->toDateTimeString(),
                'updated_at'         => $t->updated_at->toDateTimeString(),
                'deleted_at'         => $t->deleted_at?->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Update an existing Kabel‐Tube‐ODC by ID (can also change status).
     *
     * PUT/PATCH /api/v1/fo-kabel-tube-odcs/{id}
     */
    public function update(Request $request, $id)
    {
        $t = FoKabelTubeOdc::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'kabel_odc_id'    => 'sometimes|exists:fo_kabel_odcs,id',
            'warna_tube'      => 'sometimes|in:biru,jingga,hijau,coklat,abu_abu,putih,merah,hitam,kuning,ungu,merah_muda,aqua',
            'status'          => 'sometimes|in:active,archived',
        ]);

        $t->update($data);
        $t->refresh()->load(['kabelOdc', 'kabelCoreOdcs']);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'                 => $t->id,
                'kabel_odc_id'       => $t->kabel_odc_id,
                'kabel_odc'          => [
                    'id'           => $t->kabelOdc->id,
                    'nama_kabel'   => $t->kabelOdc->nama_kabel,
                ],
                'warna_tube'         => $t->warna_tube,
                'status'             => $t->status,
                'kabel_core_odc_ids' => $t->kabelCoreOdcs->pluck('id')->toArray(),
                'created_at'         => $t->created_at->toDateTimeString(),
                'updated_at'         => $t->updated_at->toDateTimeString(),
            ],
            'message' => 'Tube ODC updated.',
        ], 200);
    }

    /**
     * Soft‐delete a Kabel‐Tube‐ODC by ID.
     *
     * DELETE /api/v1/fo-kabel-tube-odcs/{id}
     */
    public function destroy($id)
    {
        $t = FoKabelTubeOdc::findOrFail($id);
        $t->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Tube ODC soft-deleted.',
        ], 200);
    }

    /**
     * Archive a Kabel‐Tube‐ODC (set status = "archived").
     *
     * PATCH /api/v1/fo-kabel-tube-odcs/{id}/archive
     */
    public function archive($id)
    {
        $t = FoKabelTubeOdc::withTrashed()->findOrFail($id);
        $t->update(['status' => 'archived']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Tube ODC archived.',
        ], 200);
    }

    /**
     * Unarchive a Kabel‐Tube‐ODC (set status = "active").
     *
     * PATCH /api/v1/fo-kabel-tube-odcs/{id}/unarchive
     */
    public function unarchive($id)
    {
        $t = FoKabelTubeOdc::withTrashed()->findOrFail($id);
        $t->update(['status' => 'active']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Tube ODC set to active.',
        ], 200);
    }

    /**
     * Restore a soft‐deleted Kabel‐Tube‐ODC (deleted_at = NULL).
     *
     * PATCH /api/v1/fo-kabel-tube-odcs/{id}/restore
     */
    public function restore($id)
    {
        $t = FoKabelTubeOdc::onlyTrashed()->findOrFail($id);
        $t->restore();

        return response()->json([
            'status'  => 'success',
            'message' => 'Tube ODC restored from deletion.',
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
