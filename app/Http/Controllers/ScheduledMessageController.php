<?php

namespace App\Http\Controllers;

use App\Models\ScheduledMessage;
use App\Models\Client;
use Illuminate\Http\Request;
use App\Utils\Traits\MakesHash;


class ScheduledMessageController extends Controller
{
    use MakesHash;
    public function index()
    {
        $schedules = ScheduledMessage::with(['device', 'clients', 'messageTemplate'])->get();
        return response()->json($schedules);
    }

    public function getByDevice($deviceId)
    {
        $schedules = ScheduledMessage::with(['device', 'clients', 'messageTemplate'])
            ->where('device_id', $deviceId)
            ->orderByDesc('next_run_date')
            ->get();

        return response()->json([
            'message' => 'Schedules retrieved successfully',
            'data' => $schedules
        ]);
    }


    public function show(ScheduledMessage $scheduledMessage)
    {
        $scheduledMessage->load(['device', 'clients', 'messageTemplate']);

        return response()->json([
            'message' => 'Schedule retrieved successfully',
            'data' => $scheduledMessage,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|exists:devices,id',
            'client_ids' => 'required|array|min:1',
            'client_ids.*' => 'required|string',
            'message_template_id' => 'nullable|exists:message_templates,id',
            'text' => 'nullable|string',
            'frequency' => 'required|in:every_minute,daily,weekly,monthly,yearly',
            'next_run_date' => 'required|date|after_or_equal:today',
        ]);

        $decodedClientIds = array_map(fn($hashedId) => $this->decodePrimaryKey($hashedId), $validated['client_ids']);

        if (in_array(null, $decodedClientIds, true)) {
            return response()->json(['message' => 'Invalid client ID detected'], 422);
        }

        $foundClientsCount = Client::whereIn('id', $decodedClientIds)->count();
        if ($foundClientsCount !== count($decodedClientIds)) {
            return response()->json(['message' => 'Some client IDs not found'], 422);
        }

        $schedule = ScheduledMessage::create([
            'device_id' => $validated['device_id'],
            'message_template_id' => $validated['message_template_id'] ?? null,
            'text' => $validated['text'] ?? null,
            'frequency' => $validated['frequency'],
            'next_run_date' => $validated['next_run_date'],
        ]);

        $schedule->clients()->attach($decodedClientIds);

        return response()->json([
            'message' => 'Schedule created successfully',
            'data' => $schedule->load(['clients']),
        ], 201);
    }


    public function update(Request $request, ScheduledMessage $scheduledMessage)
    {
        $validated = $request->validate([
            'device_id' => 'sometimes|exists:devices,id',
            'client_ids' => 'sometimes|array|min:1',
            'client_ids.*' => 'required|string',
            'message_template_id' => 'nullable|exists:message_templates,id',
            'text' => 'nullable|string',
            'frequency' => 'sometimes|in:every_minute,daily,weekly,monthly,yearly',
            'next_run_date' => 'sometimes|date|after_or_equal:today',
        ]);

        if (isset($validated['client_ids'])) {
            $decodedClientIds = array_map(fn($hashedId) => $this->decodePrimaryKey($hashedId), $validated['client_ids']);

            if (in_array(null, $decodedClientIds, true)) {
                return response()->json(['message' => 'Invalid client ID detected'], 422);
            }

            $foundClientsCount = Client::whereIn('id', $decodedClientIds)->count();
            if ($foundClientsCount !== count($decodedClientIds)) {
                return response()->json(['message' => 'Some client IDs not found'], 422);
            }

            $scheduledMessage->clients()->sync($decodedClientIds);
        }

        $scheduledMessage->update($validated);

        return response()->json([
            'message' => 'Schedule updated successfully',
            'data' => $scheduledMessage->load(['clients']),
        ]);
    }

    public function destroy(ScheduledMessage $scheduledMessage)
    {
        $scheduledMessage->delete();

        return response()->json(['message' => 'Schedule deleted successfully']);
    }
}
