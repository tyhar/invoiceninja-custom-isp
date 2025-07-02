<?php

namespace App\Jobs;

use App\Models\ScheduledMessage;
use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Invoice;
use App\Models\Client;
use Carbon\Carbon;

class SendScheduledMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $schedule;

    public function __construct(ScheduledMessage $schedule)
    {
        $this->schedule = $schedule;
    }

    protected function replacePlaceholders(string $template, Client $client, array $extraData = []): string
    {
        $replacements = array_merge([
            '{{name}}' => $client->name,
        ], [
            '{{amount}}' => $extraData['amount'] ?? '',
            '{{due_date}}' => $extraData['due_date'] ?? '',
            '{{bulan}}' => $extraData['bulan'] ?? '',
        ]);

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    public function handle()
    {
        $now = Carbon::now();
        $schedule = $this->schedule;

        $schedule->loadMissing('clients', 'device', 'messageTemplate');

        foreach ($schedule->clients as $client) {
            $text = $schedule->text ?? $schedule->messageTemplate?->content ?? '';

            $invoice = Invoice::where('client_id', $client->id)->latest()->first();

            $amount = $invoice ? number_format($invoice->amount, 0, ',', '.') : '0';

            if ($invoice && $invoice->due_date) {
                Carbon::setLocale('id');
                $due = Carbon::parse($invoice->due_date);
                $dueDate = $due->translatedFormat('d F Y');
                $bulan = $due->translatedFormat('F Y');
            } else {
                $dueDate = 'N/A';
                $bulan = 'N/A';
            }

            $extraData = [
                'amount' => $amount,
                'due_date' => $dueDate,
                'bulan' => $bulan,
            ];

            $finalText = $this->replacePlaceholders($text, $client, $extraData);

            try {
                $response = app('wa')->sendMessage([
                    'session' => $schedule->device->name,
                    'to' => $client->phone,
                    'text' => $finalText,
                    'is_group' => false,
                ]);

                Message::create([
                    'device_id' => $schedule->device_id,
                    'client_id' => $client->id,
                    'message_template_id' => $schedule->message_template_id,
                    'message' => $finalText,
                    'status' => $response['status'] ?? 'failed',
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to send scheduled message', [
                    'schedule_id' => $schedule->id,
                    'client_id' => $client->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $nextDate = match ($schedule->frequency) {
            'every_minute' => $now->copy()->addMinute(),
            'daily' => $now->copy()->addDay(),
            'weekly' => $now->copy()->addWeek(),
            'monthly' => $now->copy()->addMonthsNoOverflow(1),
            'yearly' => $now->copy()->addYear(),
            default => $now->copy()->addDay(),
        };

        $schedule->update(['next_run_date' => $nextDate]);
    }
}
