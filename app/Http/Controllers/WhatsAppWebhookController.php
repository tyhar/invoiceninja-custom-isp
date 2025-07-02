<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Models\Chatbot;
use App\Services\WhatsApp\WhatsappService;
use App\Models\Device;
use App\Models\Message;
use App\Models\FoClientFtth;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\AdminContact;
use Carbon\Carbon;
use Illuminate\Support\Facades\Blade;

class WhatsAppWebhookController extends Controller
{
    protected function renderTemplate($template, $data = [])
    {
        $php = Blade::compileString($template);
        ob_start();
        extract($data, EXTR_SKIP);
        eval ('?>' . $php);
        return ob_get_clean();
    }

    public function handleMessage(Request $request, WhatsappService $wa)
    {
        Carbon::setLocale('id');

        $message = $request->input('message');
        $from = $request->input('from');
        $session = $request->input('session');

        $device = Device::where('name', $session)->first();
        $phoneNumber = str_replace('@s.whatsapp.net', '', $from);

        $client = Client::where('phone', $phoneNumber)->first();

        $clientFtth = FoClientFtth::with(['client', 'lokasi', 'odp'])
            ->whereHas('client', function ($query) use ($phoneNumber) {
                $query->where('phone', $phoneNumber);
            })
            ->first();

        Message::create([
            'device_id' => $device->id,
            'client_id' => $client ? $client->id : null,
            'from' => $from,
            'message' => $message,
            'status' => 'received',
        ]);

        if (Cache::get("complaint:$from") === 'waiting') {
            $ticketNumber = 'TICKET-' . strtoupper(Str::random(6));

            $wa->sendMessage([
                'session' => $session,
                'to' => $from,
                'text' => "Terima kasih atas keluhan Anda.\nNomor tiket Anda: *$ticketNumber*.\nAdmin akan segera membalas anda.",
            ]);

            $adminContacts = AdminContact::where('device_id', $device->id)->pluck('phone_number');

            foreach ($adminContacts as $phone) {
                $adminPhone = $phone . '@s.whatsapp.net';

                $clientName = $clientFtth?->client?->name ?? 'Pelanggan';
                $lokasi = $clientFtth?->lokasi?->nama_lokasi ?? 'Tidak tersedia';
                $odp = $clientFtth?->odp?->nama_odp ?? 'Tidak tersedia';
                $alamat = $clientFtth?->alamat ?? '-';

                $wa->sendMessage([
                    'session' => $session,
                    'to' => $adminPhone,
                    'text' => "📨 *Keluhan Baru!*\n" .
                        "Dari: *$phoneNumber*\n" .
                        "Nama Client: *$clientName*\n" .
                        "Lokasi: *$lokasi*\n" .
                        "ODP: *$odp*\n" .
                        "Alamat: *$alamat*\n" .
                        "Nomor Tiket: *$ticketNumber*\n" .
                        "Isi Keluhan: \n$message",
                ]);
            }

            Cache::forget("complaint:$from");
            return response()->json(['status' => 'complaint_received']);
        }

        if (strtolower(trim($message)) === 'hubungi admin') {
            $wa->sendMessage([
                'session' => $session,
                'to' => $from,
                'text' => "Silakan sampaikan keluhan Anda secara detail.",
            ]);

            Cache::put("complaint:$from", 'waiting', now()->addMinutes(10));
            return response()->json(['status' => 'waiting_complaint']);
        }

        $chatbots = Chatbot::where('device_id', $device->id)->get();

        $matchedChatbot = $chatbots->first(function ($chatbot) use ($message) {
            $msg = strtolower(trim($message));
            $q = strtolower(trim($chatbot->question));

            if ($msg === $q)
                return true;

            similar_text($msg, $q, $percent);
            return $percent >= 80;
        });

        $invoice = null;
        if ($client) {
            $invoice = Invoice::where('client_id', $client->id)->latest()->first();
        }

        if ($matchedChatbot) {
            $questionKey = trim(strtolower($matchedChatbot->question));

            if ($questionKey === 'menu') {
                $answer = $matchedChatbot->answer;
            } elseif (!$client) {
                $answer = "Maaf, nomor Anda belum terdaftar di sistem kami.";
            } else {
                $invoice = Invoice::where('client_id', $client->id)->latest()->first();

                $data = [
                    'name' => $client->name,
                    'bulan' => $invoice?->due_date ? Carbon::parse($invoice->due_date)->translatedFormat('F Y') : '-',
                    'amount' => $invoice ? number_format($invoice->amount, 0, ',', '.') : '-',
                    'due_date' => $invoice?->due_date ? Carbon::parse($invoice->due_date)->translatedFormat('j F Y') : '-',
                    'status' => $invoice ? ($invoice->status_id == 4 ? 'Sudah Lunas' : 'Belum Lunas') : 'Tidak Diketahui',
                    'status_id' => $invoice->status_id ?? null,
                ];

                $answer = $this->renderTemplate($matchedChatbot->answer, $data);
            }
        } else {
            $answer = "Halo, selamat datang. Ini adalah *balasan otomatis* dari sistem kami.\n" .
                "Ada yang bisa kami bantu?\n\nKetik *menu* untuk melihat pilihan layanan.";
        }

        $wa->sendMessage([
            'session' => $session,
            'to' => $from,
            'text' => $answer,
        ]);

        return response()->json(['status' => 'ok']);
    }

    public function handleSession(Request $request)
    {
        $sessionName = $request->input('session');
        $status = $request->input('status');

        if (!$sessionName || !$status) {
            return response()->json(['error' => 'Invalid session or status'], 400);
        }

        $device = Device::where('name', $sessionName)->first();

        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $device->update(['status' => $status]);

        return response()->json(['message' => 'Device status updated']);
    }
}
