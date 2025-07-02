import { useEffect, useState } from "react";
import axios from "axios";
import { Default } from "$app/components/layouts/Default";
import { Page } from "$app/components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

interface AdminContact {
  id?: number;
  device_id: number;
  phone_number: string;
  device?: {
    phone: string;
  };
}

export default function WAChatbotAdmin() {
  const [t] = useTranslation();
  const { deviceId } = useParams<{ deviceId: string }>();
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<AdminContact>({
    phone_number: "",
    device_id: Number(deviceId),
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<AdminContact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const token = localStorage.getItem("X-API-TOKEN") ?? "";
  const api = "http://localhost:8000/api/v1/admin-contacts";
  const headers = { headers: { "X-API-TOKEN": token } };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(api, headers);
      const filtered = res.data.filter(
        (contact: AdminContact) => String(contact.device_id) === deviceId
      );
      setContacts(filtered);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [deviceId]);

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openDetailModal = (contact: AdminContact) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${api}/${editingId}`, form, headers);
      } else {
        await axios.post(api, form, headers);
      }
      resetForm();
      fetchContacts();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
    }
  };

  const handleEdit = (contact: AdminContact) => {
    setForm(contact);
    setEditingId(contact.id || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kontak ini?")) return;
    try {
      await axios.delete(`${api}/${id}`, headers);
      fetchContacts();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
    }
  };

  const resetForm = () => {
    setForm({ phone_number: "", device_id: Number(deviceId) });
    setEditingId(null);
  };

  const pages: Page[] = [
    { name: t("WhatsApp Gateway"), href: "/wa-gateway" },
    { name: t("Chatbot"), href: `/wa-gateway/chatbot/${deviceId}` },
    { name: t("Admin Contact"), href: `/wa-gateway/chatbot/${deviceId}/admin-contacts` },
  ];

  return (
    <Default title="Admin Contact" breadcrumbs={pages}>
      <div className="p-4">
        <div className="mb-4 flex justify-end">
          <button onClick={openModal} className="primary-btn">
            Tambah Admin Contact
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full text-sm table-auto">
              <thead className="bg-gray-100 text-left text-xs uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Device</th>
                  <th className="p-3">Nomor Admin</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? (
                  contacts.map((contact, index) => (
                    <tr key={contact.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{contact.device?.phone || "-"}</td>
                      <td className="p-3">{contact.phone_number}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openDetailModal(contact)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleEdit(contact)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id!)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Tidak ada data admin contact untuk device ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingId ? "Edit Admin Contact" : "Tambah Admin Contact"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Nomor Admin</label>
                  <input
                    type="text"
                    value={form.phone_number}
                    onChange={(e) =>
                      setForm({ ...form, phone_number: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>
                  <button type="submit" className="primary-btn">
                    {editingId ? "Update" : "Tambah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDetailModalOpen && selectedContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Detail Admin Contact</h2>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600">Nomor Admin:</p>
                <p className="text-gray-800">{selectedContact.phone_number}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedContact(null);
                    setIsDetailModalOpen(false);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        <style>
          {`
            .primary-btn {
              background-color: #007bff;
              color: white;
              padding: 10px 16px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background 0.2s ease;
              font-size: 14px;
            }
          `}
        </style>
      </div>
    </Default>
  );
}
