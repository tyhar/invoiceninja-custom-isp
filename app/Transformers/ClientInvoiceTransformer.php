<?php

namespace App\Transformers;

use App\Models\Invoice;
use App\Utils\Traits\MakesHash;
use stdClass;

class ClientInvoiceTransformer extends EntityTransformer
{
    use MakesHash;

    /**
     * @param Invoice $invoice
     *
     * @return array
     */
    public function transform(Invoice $invoice)
    {
        return [
            'id' => $this->encodePrimaryKey($invoice->id),
            'user_id' => $this->encodePrimaryKey($invoice->user_id),
            'project_id' => $this->encodePrimaryKey($invoice->project_id),
            'assigned_user_id' => $this->encodePrimaryKey($invoice->assigned_user_id),
            'amount' => (float) $invoice->amount,
            'balance' => (float) $invoice->balance,
            'client_id' => $this->encodePrimaryKey($invoice->client_id),
            'vendor_id' => $this->encodePrimaryKey($invoice->vendor_id),
            'status_id' => (string) $invoice->status_id,
            'design_id' => $this->encodePrimaryKey($invoice->design_id),
            'recurring_id' => $this->encodePrimaryKey($invoice->recurring_id),
            'created_at' => (int) $invoice->created_at,
            'updated_at' => (int) $invoice->updated_at,
            'archived_at' => (int) $invoice->deleted_at,
            'is_deleted' => (bool) $invoice->is_deleted,
            'number' => (string) $invoice->number,
            'discount' => (float) $invoice->discount,
            'po_number' => (string) $invoice->po_number,
            'date' => (string) $invoice->date,
            'last_sent_date' => (string) $invoice->last_sent_date,
            'next_send_date' => (string) $invoice->next_send_date,
            'due_date' => (string) $invoice->due_date,
            'terms' => (string) $invoice->terms,
            'public_notes' => (string) $invoice->public_notes,
            'private_notes' => (string) $invoice->private_notes,
            'uses_inclusive_taxes' => (bool) $invoice->uses_inclusive_taxes,
            'tax_name1' => (string) $invoice->tax_name1,
            'tax_rate1' => (float) $invoice->tax_rate1,
            'tax_name2' => (string) $invoice->tax_name2,
            'tax_rate2' => (float) $invoice->tax_rate2,
            'tax_name3' => (string) $invoice->tax_name3,
            'tax_rate3' => (float) $invoice->tax_rate3,
            'total_taxes' => (float) $invoice->total_taxes,
            'is_amount_discount' => (bool) $invoice->is_amount_discount,
            'footer' => (string) $invoice->footer,
            'partial' => (float) $invoice->partial,
            'partial_due_date' => (string) $invoice->partial_due_date,
            'custom_value1' => (string) $invoice->custom_value1,
            'custom_value2' => (string) $invoice->custom_value2,
            'custom_value3' => (string) $invoice->custom_value3,
            'custom_value4' => (string) $invoice->custom_value4,
            'has_tasks' => (bool) $invoice->has_tasks,
            'has_expenses' => (bool) $invoice->has_expenses,
            'custom_surcharge1' => (float) $invoice->custom_surcharge1,
            'custom_surcharge2' => (float) $invoice->custom_surcharge2,
            'custom_surcharge3' => (float) $invoice->custom_surcharge3,
            'custom_surcharge4' => (float) $invoice->custom_surcharge4,
            'exchange_rate' => (float) $invoice->exchange_rate,
            'custom_surcharge_tax1' => (bool) $invoice->custom_surcharge_tax1,
            'custom_surcharge_tax2' => (bool) $invoice->custom_surcharge_tax2,
            'custom_surcharge_tax3' => (bool) $invoice->custom_surcharge_tax3,
            'custom_surcharge_tax4' => (bool) $invoice->custom_surcharge_tax4,
            'line_items' => $this->transformLineItems($invoice->line_items),
            'entity_type' => 'invoice',
            'reminder1_sent' => (string) $invoice->reminder1_sent,
            'reminder2_sent' => (string) $invoice->reminder2_sent,
            'reminder3_sent' => (string) $invoice->reminder3_sent,
            'reminder_last_sent' => (string) $invoice->reminder_last_sent,
            'paid_to_date' => (float) $invoice->paid_to_date,
            'subscription_id' => $this->encodePrimaryKey($invoice->subscription_id),
            'auto_bill_enabled' => (bool) $invoice->auto_bill_enabled,
            'tax_info' => $invoice->tax_data ?: new stdClass(),
            'e_invoice' => $invoice->e_invoice ?: new stdClass(),
            'backup' => $invoice->backup ?: new stdClass(),
            'invitations' => $this->transformInvitations($invoice->invitations),
            'documents' => $this->transformDocuments($invoice->documents),
        ];
    }

    private function transformLineItems($items)
    {
        return collect($items)->map(function ($item) {
            return [
                '_id' => $item->_id ?? null,
                'quantity' => (float) $item->quantity,
                'cost' => (float) $item->cost,
                'product_key' => (string) $item->product_key,
                'product_cost' => (float) ($item->product_cost ?? 0),
                'notes' => (string) $item->notes,
                'discount' => (float) $item->discount,
                'is_amount_discount' => (bool) $item->is_amount_discount,
                'tax_name1' => (string) $item->tax_name1,
                'tax_rate1' => (float) $item->tax_rate1,
                'tax_name2' => (string) $item->tax_name2,
                'tax_rate2' => (float) $item->tax_rate2,
                'tax_name3' => (string) $item->tax_name3,
                'tax_rate3' => (float) $item->tax_rate3,
                'sort_id' => (string) ($item->sort_id ?? ''),
                'line_total' => (float) $item->line_total,
                'tax_amount' => (float) $item->tax_amount,
                'gross_line_total' => (float) $item->gross_line_total,
                'date' => (string) ($item->date ?? ''),
                'custom_value1' => (string) ($item->custom_value1 ?? ''),
                'custom_value2' => (string) ($item->custom_value2 ?? ''),
                'custom_value3' => (string) ($item->custom_value3 ?? ''),
                'custom_value4' => (string) ($item->custom_value4 ?? ''),
                'type_id' => (string) ($item->type_id ?? ''),
                'tax_id' => (string) ($item->tax_id ?? ''),
                'task_id' => (string) ($item->task_id ?? ''),
                'expense_id' => (string) ($item->expense_id ?? ''),
                'unit_code' => (string) ($item->unit_code ?? ''),
            ];
        })->toArray();
    }

    private function transformInvitations($invitations)
    {
        if (empty($invitations)) {
            return [];
        }

        return collect($invitations)->map(function ($invitation) {
            return [
                'id' => $this->encodePrimaryKey($invitation->id),
                'client_contact_id' => $this->encodePrimaryKey($invitation->client_contact_id),
                'key' => (string) $invitation->key,
                'link' => (string) $invitation->link,
                'sent_date' => (string) $invitation->sent_date,
                'viewed_date' => (string) $invitation->viewed_date,
                'opened_date' => (string) $invitation->opened_date,
                'updated_at' => (int) $invitation->updated_at,
                'archived_at' => (int) $invitation->archived_at,
                'created_at' => (int) $invitation->created_at,
                'email_status' => (string) $invitation->email_status,
                'email_error' => (string) $invitation->email_error,
                'message_id' => (string) $invitation->message_id,
            ];
        })->toArray();
    }

    private function transformDocuments($documents)
    {
        if (empty($documents)) {
            return [];
        }

        return collect($documents)->map(function ($document) {
            return [
                'id' => $this->encodePrimaryKey($document->id),
                'name' => (string) $document->name,
                'size' => (int) $document->size,
                'type' => (string) $document->type,
                'path' => (string) $document->path,
                'url' => (string) $document->url,
                'created_at' => (int) $document->created_at,
                'updated_at' => (int) $document->updated_at,
            ];
        })->toArray();
    }
}
