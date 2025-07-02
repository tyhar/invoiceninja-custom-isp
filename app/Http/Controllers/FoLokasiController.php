<?php
// app/Http/Controllers/FoLokasiController.php

namespace App\Http\Controllers;

use App\Models\FoLokasi;
use Illuminate\Http\Request;


class FoLokasiController extends Controller
{
    protected $model = FoLokasi::class;
    /**
     * List all FoLokasi entries with pagination, filtering, sorting, and status.
     *
     * GET /api/v1/fo-lokasis
     *
     * Query parameters (all optional):
     *  - filter=string                  // partial match on nama_lokasi or deskripsi
     *  - sort=column|asc|dsc            // e.g. sort=nama_lokasi|asc
     *  - per_page=int                   // items per page (default 15)
     *  - page=int                       // page number (handled by Laravel)
     *  - status=active,archived,deleted // comma‐separated list of statuses to include
     */
    public function index(Request $request)
    {
        // 1) Parse the "status" parameter (comma‐separated)
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

        // 2) Base query including trashed so we can handle "deleted"
        $query = FoLokasi::withTrashed();

        // 3) Filter by status:
        $query->where(function ($q) use ($statuses) {
            // a) If "deleted" is requested, include soft‐deleted rows
            if (in_array('deleted', $statuses, true)) {
                $q->orWhereNotNull('deleted_at');
            }

            // b) If "active" or "archived" is requested, include rows where deleted_at IS NULL AND status matches
            $nonDeleted = array_values(array_intersect($statuses, ['active', 'archived']));
            if (!empty($nonDeleted)) {
                $q->orWhere(function ($sub) use ($nonDeleted) {
                    $sub->whereNull('deleted_at')
                        ->whereIn('status', $nonDeleted);
                });
            }
        });

        // 4) Optional text filtering on nama_lokasi or deskripsi
        if ($request->filled('filter')) {
            $term = $request->query('filter');
            $query->where(function ($q) use ($term) {
                $q->where('nama_lokasi', 'LIKE', "%{$term}%")
                    ->orWhere('deskripsi',   'LIKE', "%{$term}%");
            });
        }

        // 5) Optional sorting: "sort=column|asc" or "sort=column|dsc"
        if ($request->filled('sort')) {
            [$column, $dir] = array_pad(explode('|', $request->query('sort')), 2, null);
            $dir = (strtolower($dir) === 'dsc') ? 'desc' : 'asc';

            $allowedSorts = ['id', 'nama_lokasi', 'created_at', 'updated_at', 'status'];
            if (in_array($column, $allowedSorts, true)) {
                $query->orderBy($column, $dir);
            }
        } else {
            $query->orderBy('id', 'desc'); // default: newest first
        }

        // 6) Pagination (default per_page=15)
        $perPage = (int) $request->query('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        }

        // 7) Eager‐load relationships, paginate, and append query params
        $paginator = $query
            ->with(['odcs', 'odps', 'clientFtths'])
            ->paginate($perPage)
            ->appends($request->only(['filter', 'sort', 'per_page', 'status']));

        // 8) Transform results into the desired JSON structure
        $data = array_map(function ($l) {
            return [
                'id'            => $l->id,
                'nama_lokasi'   => $l->nama_lokasi,
                'deskripsi'     => $l->deskripsi,
                'latitude'      => $l->latitude,
                'longitude'     => $l->longitude,
                'city'          => $l->city,
                'province'      => $l->province,
                'country'       => $l->country,
                'geocoded_at'   => $l->geocoded_at?->toDateTimeString(),
                'status'        => $l->status,
                'odcs'          => $l->odcs->map(fn($o) => [
                    'id'        => $o->id,
                    'nama_odc'  => $o->nama_odc,
                ])->toArray(),
                'odps'          => $l->odps->map(fn($o) => [
                    'id'       => $o->id,
                    'nama_odp' => $o->nama_odp,
                ])->toArray(),
                'clients'       => $l->clientFtths->map(fn($c) => [
                    'id'         => $c->id,
                    'nama_client' => $c->nama_client,
                ])->toArray(),
                'created_at'    => $l->created_at->toDateTimeString(),
                'updated_at'    => $l->updated_at->toDateTimeString(),
                'deleted_at'    => $l->deleted_at?->toDateTimeString(),
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
     * Create a new FoLokasi (default status = active).
     *
     * POST /api/v1/fo-lokasis
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_lokasi'  => 'required|string|max:255',
            'deskripsi'    => 'nullable|string|max:255',
            'latitude'     => 'required|numeric',
            'longitude'    => 'required|numeric',
            'status'       => 'sometimes|in:active,archived',
        ]);

        // Default to "active" if not provided
        if (! isset($data['status'])) {
            $data['status'] = 'active';
        }

        $lokasi = FoLokasi::create($data);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'            => $lokasi->id,
                'nama_lokasi'   => $lokasi->nama_lokasi,
                'deskripsi'     => $lokasi->deskripsi,
                'latitude'      => $lokasi->latitude,
                'longitude'     => $lokasi->longitude,
                'city'          => $lokasi->city,
                'province'      => $lokasi->province,
                'country'       => $lokasi->country,
                'geocoded_at'   => $lokasi->geocoded_at?->toDateTimeString(),
                'status'        => $lokasi->status,
                'created_at'    => $lokasi->created_at->toDateTimeString(),
                'updated_at'    => $lokasi->updated_at->toDateTimeString(),
            ],
            'message' => 'Lokasi created successfully. Use the geocode button to get geographic information.',
        ], 201);
    }

    /**
     * Show a single FoLokasi by ID (even if soft-deleted).
     *
     * GET /api/v1/fo-lokasis/{id}
     */
    public function show($id)
    {
        // Include trashed so that "deleted" entries can still be retrieved
        $lokasi = FoLokasi::withTrashed()->findOrFail($id);

        // Eager‐load related models
        $lokasi->load(['odcs', 'odps', 'clientFtths']);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'            => $lokasi->id,
                'nama_lokasi'   => $lokasi->nama_lokasi,
                'deskripsi'     => $lokasi->deskripsi,
                'latitude'      => $lokasi->latitude,
                'longitude'     => $lokasi->longitude,
                'city'          => $lokasi->city,
                'province'      => $lokasi->province,
                'country'       => $lokasi->country,
                'geocoded_at'   => $lokasi->geocoded_at?->toDateTimeString(),
                'status'        => $lokasi->status,
                'odcs'          => $lokasi->odcs->map(fn($o) => [
                    'id'        => $o->id,
                    'nama_odc'  => $o->nama_odc,
                ])->toArray(),
                'odps'          => $lokasi->odps->map(fn($o) => [
                    'id'       => $o->id,
                    'nama_odp' => $o->nama_odp,
                ])->toArray(),
                'clients'       => $lokasi->clientFtths->map(fn($c) => [
                    'id'         => $c->id,
                    'nama_client' => $c->nama_client,
                ])->toArray(),
                'created_at'    => $lokasi->created_at->toDateTimeString(),
                'updated_at'    => $lokasi->updated_at->toDateTimeString(),
                'deleted_at'    => $lokasi->deleted_at?->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Update an existing FoLokasi by ID (can also change status).
     *
     * PUT/PATCH /api/v1/fo-lokasis/{id}
     */
    public function update(Request $request, $id)
    {
        $lokasi = FoLokasi::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'nama_lokasi'  => 'sometimes|string|max:255',
            'deskripsi'    => 'sometimes|nullable|string|max:255',
            'latitude'     => 'sometimes|numeric',
            'longitude'    => 'sometimes|numeric',
            'status'       => 'sometimes|in:active,archived',
        ]);

        $lokasi->update($data);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'            => $lokasi->id,
                'nama_lokasi'   => $lokasi->nama_lokasi,
                'deskripsi'     => $lokasi->deskripsi,
                'latitude'      => $lokasi->latitude,
                'longitude'     => $lokasi->longitude,
                'city'          => $lokasi->city,
                'province'      => $lokasi->province,
                'country'       => $lokasi->country,
                'geocoded_at'   => $lokasi->geocoded_at?->toDateTimeString(),
                'status'        => $lokasi->status,
                'created_at'    => $lokasi->created_at->toDateTimeString(),
                'updated_at'    => $lokasi->updated_at->toDateTimeString(),
            ],
            'message' => 'Lokasi updated successfully. Use the geocode button to update geographic information if coordinates changed.',
        ], 200);
    }

    /**
     * Soft-delete a FoLokasi by ID (sets deleted_at).
     *
     * DELETE /api/v1/fo-lokasis/{id}
     */
    public function destroy($id)
    {
        $lokasi = FoLokasi::findOrFail($id);
        $lokasi->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Lokasi soft-deleted.',
        ], 200);
    }

    /**
     * Archive a FoLokasi (set status = "archived").
     *
     * PATCH /api/v1/fo-lokasis/{id}/archive
     */
    public function archive($id)
    {
        $lokasi = FoLokasi::withTrashed()->findOrFail($id);
        $lokasi->update(['status' => 'archived']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Lokasi archived.',
        ], 200);
    }

    /**
     * Unarchive a FoLokasi (set status = "active").
     *
     * PATCH /api/v1/fo-lokasis/{id}/unarchive
     */
    public function unarchive($id)
    {
        $lokasi = FoLokasi::withTrashed()->findOrFail($id);
        $lokasi->update(['status' => 'active']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Lokasi set to active.',
        ], 200);
    }

    /**
     * Restore a soft-deleted FoLokasi (deleted_at = NULL).
     *
     * PATCH /api/v1/fo-lokasis/{id}/restore
     */
    public function restore($id)
    {
        $lokasi = FoLokasi::onlyTrashed()->findOrFail($id);
        $lokasi->restore();

        return response()->json([
            'status'  => 'success',
            'message' => 'Lokasi restored from deletion.',
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

    /**
     * Force geocode a specific location.
     *
     * POST /api/v1/fo-lokasis/{id}/geocode
     */
    public function geocode($id)
    {
        $lokasi = FoLokasi::withTrashed()->findOrFail($id);

        if ($lokasi->forceGeocode()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Location geocoded successfully.',
                'data' => [
                    'city' => $lokasi->city,
                    'province' => $lokasi->province,
                    'country' => $lokasi->country,
                    'geocoded_at' => $lokasi->geocoded_at?->toDateTimeString(),
                ]
            ], 200);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to geocode location. Check coordinates and try again.',
            ], 422);
        }
    }

    /**
     * Bulk geocode multiple locations.
     *
     * POST /api/v1/fo-lokasis/bulk-geocode
     */
    public function bulkGeocode(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:fo_lokasis,id',
        ]);

        $ids = $data['ids'];
        $successCount = 0;
        $errorCount = 0;

        foreach ($ids as $id) {
            $lokasi = FoLokasi::withTrashed()->find($id);
            if ($lokasi && $lokasi->forceGeocode()) {
                $successCount++;
            } else {
                $errorCount++;
            }
            // Add delay to respect rate limits
            usleep(2000000); // 2 seconds
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Bulk geocoding completed.',
            'data' => [
                'total' => count($ids),
                'success' => $successCount,
                'failed' => $errorCount
            ],
        ], 200);
    }
}
