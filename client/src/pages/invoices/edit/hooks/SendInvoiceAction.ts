import axios from 'axios';
import { Invoice } from '$app/common/interfaces/invoice';

export async function handleSendInvoice(invoice: Invoice) {
  const token = localStorage.getItem('X-API-TOKEN') ?? '';

  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/wa/message/send-invoice/${invoice.id}`,
      {
        invoice_id: invoice.id,
        client_id: invoice.client_id,
      },
      {
        headers: {
          'X-API-TOKEN': token,
          'Accept': 'application/json',
        },
      }
    );

    alert('Invoice berhasil dikirim.');
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || 'Gagal mengirim Invoice.');
  }
}