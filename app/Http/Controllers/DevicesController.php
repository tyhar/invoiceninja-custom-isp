<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Services\WhatsApp\WhatsappService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DevicesController extends Controller
{
    public function getAllDevices(): JsonResponse
    {
        return response()->json([
            'data' => Device::all(),
        ]);
    }

    public function addDevice(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:devices,name',
            'phone' => 'required|string|max:20|unique:devices,phone',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors(),
            ], 422);
        }

        $device = Device::create([
            'name' => $request->input('name'),
            'phone' => $request->input('phone'),
            'status' => 'inactive',
        ]);

        return response()->json([
            'message' => 'Device saved. Please connect to start session.',
            'data' => $device,
        ], 201);
    }

    public function updateDevice(Request $request, $id): JsonResponse
    {
        $device = Device::find($id);

        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:devices,name,' . $device->id,
            'phone' => 'required|string|max:20|unique:devices,phone,' . $device->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors(),
            ], 422);
        }

        $device->update([
            'name' => $request->input('name'),
            'phone' => $request->input('phone'),
        ]);

        return response()->json([
            'message' => 'Device updated successfully.',
            'data' => $device,
        ]);
    }

    public function connectDevice($id, WhatsappService $wa): JsonResponse
    {
        $device = Device::find($id);

        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $waResponse = $wa->startSession($device->name);
        $status = isset($waResponse['qr']) ? 'pending' : 'connected';

        $qrBase64 = $waResponse['qr_base64'] ?? null;

        $device->update([
            'status' => $status,
            'url' => $qrBase64,
        ]);

        return response()->json([
            'message' => 'Session started',
            'url' => $qrBase64,
            'data' => $device,
        ]);
    }


    public function disconnectDevice($id, WhatsappService $wa): JsonResponse
    {
        $device = Device::find($id);

        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $wa->logoutSession($device->name);
        $device->update(['status' => 'inactive']);

        return response()->json([
            'message' => 'Session disconnected',
        ]);
    }

    public function deleteDevice($id, WhatsappService $wa): JsonResponse
    {
        $device = Device::find($id);

        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $wa->logoutSession($device->name);
        $device->delete();

        return response()->json([
            'message' => 'Device deleted',
        ]);
    }
}
