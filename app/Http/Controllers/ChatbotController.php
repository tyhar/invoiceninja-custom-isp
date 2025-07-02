<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chatbot;

class ChatbotController extends Controller
{
    public function index()
    {
        return response()->json(Chatbot::with('device')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'question' => 'required|string',
            'answer' => 'required|string',
            'device_id' => 'required|integer',
        ]);

        $chatbot = Chatbot::create($request->all());

        return response()->json($chatbot, 201);
    }

    public function show($id)
    {
        $chatbot = Chatbot::with('device')->find($id);

        if (!$chatbot) {
            return response()->json(['message' => 'Chatbot not found'], 404);
        }

        return response()->json($chatbot);
    }

    public function update(Request $request, $id)
    {
        $chatbot = Chatbot::find($id);

        if (!$chatbot) {
            return response()->json(['message' => 'Chatbot not found'], 404);
        }

        $request->validate([
            'question' => 'sometimes|required|string',
            'answer' => 'sometimes|required|string',
            'device_id' => 'sometimes|required|integer',
        ]);

        $chatbot->update($request->all());

        return response()->json($chatbot);
    }

    public function destroy($id)
    {
        $chatbot = Chatbot::find($id);

        if (!$chatbot) {
            return response()->json(['message' => 'Chatbot not found'], 404);
        }

        $chatbot->delete();

        return response()->json(['message' => 'Chatbot deleted']);
    }
}