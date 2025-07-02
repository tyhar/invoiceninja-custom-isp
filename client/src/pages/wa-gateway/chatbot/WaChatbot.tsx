import { useEffect, useState } from "react";
import axios from "axios";
import { Default } from "$app/components/layouts/Default";
import { Page } from "$app/components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

interface Chat {
  id?: number;
  device_id: number;
  device?: {
    phone: string;
  };
  question: string;
  answer: string;
}

export default function WAChatbot() {
  const [t] = useTranslation();
  const { deviceId } = useParams<{ deviceId: string }>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Chat>({
    question: "",
    answer: "",
    device_id: Number(deviceId),
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const chatsPerPage = 5;

  const navigate = useNavigate();

  const token = localStorage.getItem("X-API-TOKEN") ?? "";
  const api = "http://localhost:8000/api/v1/chatbots";
  const headers = { headers: { "X-API-TOKEN": token } };

  const fetchChats = async () => {
    try {
      const res = await axios.get(api, headers);
      const filtered = res.data.filter((chat: Chat) => String(chat.device_id) === deviceId);
      setChats(filtered);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [deviceId]);

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openDetailModal = (chat: Chat) => {
    setSelectedChat(chat);
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
      fetchChats();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
    }
  };

  const handleEdit = (chat: Chat) => {
    setForm(chat);
    setEditingId(chat.id || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus chatbot ini?")) return;
    try {
      await axios.delete(`${api}/${id}`, headers);
      fetchChats();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
    }
  };

  const resetForm = () => {
    setForm({ question: "", answer: "", device_id: Number(deviceId) });
    setEditingId(null);
  };

  const placeholders = [
    "{{$name}}     = Nama client",
    "{{$bulan}}    = Bulan pada tanggal tagihan",
    "{{$amount}}   = Jumlah tagihan",
    "{{$due_date}} = Tanggal tagihan",
    "{{$status}}   = Status pembayaran",
    "▼ Template untuk cek tagihan ▼",
    "@if($status_id == 4 || !$status_id)\n(pesan tidak ada tagihan)\n@else\n(pesan ada tagihan)\n@endif"
  ];


  const pages: Page[] = [
    { name: t("WhatsApp Gateway"), href: "/wa-gateway" },
    { name: t("Chatbot"), href: `/wa-gateway/chatbot/${deviceId}` },
  ];

  const indexOfLastChat = currentPage * chatsPerPage;
  const indexOfFirstChat = indexOfLastChat - chatsPerPage;
  const currentChatbot = chats.slice(indexOfFirstChat, indexOfLastChat);
  const totalPages = Math.ceil(chats.length / chatsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <Default title={t("Daftar Chat")} breadcrumbs={pages}>
      <div className="p-4">
        <div className="mb-4 flex justify-end gap-2">
          <button
            onClick={() => navigate(`/wa-gateway/chatbot/${deviceId}/admin-contacts`)}
            className="primary-btn"
          >
            Admin Contact
          </button>
          <button onClick={() => setIsListModalOpen(true)} className="primary-btn">
            List Placeholder
          </button>
          <button onClick={openModal} className="primary-btn">
            Tambah Template Chatbot
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
                  <th className="p-3">Pertanyaan (kata kunci)</th>
                  <th className="p-3">Balasan Chatbot</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {chats.length > 0 ? (
                  currentChatbot.map((chat, index) => (
                    <tr key={chat.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{chat.device?.phone || "-"}</td>
                      <td className="p-3">{chat.question}</td>
                      <td className="p-3">
                        {chat.answer.length > 80
                          ? `${chat.answer.substring(0, 80)}...`
                          : chat.answer}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openDetailModal(chat)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleEdit(chat)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(chat.id!)}
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
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      Tidak ada data chatbot untuk device ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-between items-center p-4 border-t">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span>
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingId ? "Edit Chatbot" : "Tambah Chatbot"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Pertanyaan</label>
                  <input
                    type="text"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <label className="block text-sm font-medium mb-1">Jawaban</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2 resize-y"
                />
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

        {isDetailModalOpen && selectedChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Detail Chatbot</h2>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600">Kata Kunci:</p>
                <p className="text-gray-800">{selectedChat.question}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600">Balasan:</p>
                <div className="p-4 border rounded bg-gray-50 max-w-full break-words whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {selectedChat.answer}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedChat(null);
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

        {isListModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Daftar Placeholder</h2>

              <ul className="space-y-3 text-gray-700 mb-4">
                {placeholders.map((ph, index) => {
                  const isTemplate = ph.toLowerCase().includes('@if');
                  return (
                    <li key={index}>
                      {isTemplate ? (
                        <div className="bg-gray-100 rounded p-4 text-sm text-gray-800 font-mono whitespace-pre-wrap border border-gray-300">
                          {ph}
                        </div>
                      ) : (
                        <div className="whitespace-pre-line">{ph}</div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsListModalOpen(false)}
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