<?php

namespace App\Services\WhatsApp;
use Illuminate\Support\Facades\Http;

class WhatsappService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.wa_service.url');
    }

    public function getAllSessions()
    {
        return Http::get($this->baseUrl . '/session')->json();
    }

    public function startSession(string $session)
    {
        return Http::post($this->baseUrl . '/session/start', [
            'session' => $session,
        ])->json();
    }

    public function logoutSession(string $session)
    {
        return Http::get($this->baseUrl . '/session/logout', [
            'session' => $session,
        ])->json();
    }

    public function sendMessage(array $data)
    {
        if (isset($data['document_url'])) {
            return Http::post($this->baseUrl . '/message/send-document', $data)->json();
        }
        if (isset($data['image_url'])) {
            return Http::post($this->baseUrl . '/message/send-image', $data)->json();
        }
        
        return Http::post($this->baseUrl . '/message/send-text', $data)->json();
    }
}
