<?php

namespace App\Http\Controllers;

use App\Models\AdminContact;
use App\Models\Device;
use Illuminate\Http\Request;

class AdminContactController extends Controller
{
    /**
     * Display a listing of the admin contacts.
     */
    public function index()
    {
        $adminContacts = AdminContact::with('device')->get();
        return response()->json($adminContacts);
    }

    /**
     * Store a newly created admin contact.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'nullable|exists:devices,id',
            'phone_number' => 'required|string',
        ]);

        $adminContact = AdminContact::create($validated);

        return response()->json([
            'message' => 'Admin contact created successfully!',
            'data' => $adminContact,
        ]);
    }

    /**
     * Display the specified admin contact.
     */
    public function show($id)
    {
        $adminContact = AdminContact::with('device')->findOrFail($id);
        return response()->json($adminContact);
    }

    /**
     * Update the specified admin contact.
     */
    public function update(Request $request, $id)
    {
        $adminContact = AdminContact::findOrFail($id);

        $validated = $request->validate([
            'device_id' => 'nullable|exists:devices,id',
            'phone_number' => 'required|string',
        ]);

        $adminContact->update($validated);

        return response()->json([
            'message' => 'Admin contact updated successfully!',
            'data' => $adminContact,
        ]);
    }

    /**
     * Remove the specified admin contact.
     */
    public function destroy($id)
    {
        $adminContact = AdminContact::findOrFail($id);
        $adminContact->delete();

        return response()->json([
            'message' => 'Admin contact deleted successfully!',
        ]);
    }
}