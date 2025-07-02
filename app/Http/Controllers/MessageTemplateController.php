<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MessageTemplate;

class MessageTemplateController extends Controller
{
    public function index()
    {
        return response()->json(MessageTemplate::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
        ]);

        $template = MessageTemplate::create($validated);

        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }

    public function show($id)
    {
        $template = MessageTemplate::findOrFail($id);

        return response()->json($template);
    }

    public function update(Request $request, $id)
    {
        $template = MessageTemplate::findOrFail($id);

        $template->update($request->only(['title', 'content']));

        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }

    public function destroy($id)
    {
        $template = MessageTemplate::findOrFail($id);
        $template->delete();

        return response()->json(['success' => true]);
    }
}
