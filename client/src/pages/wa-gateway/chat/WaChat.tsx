import { useState, useEffect } from "react";
import axios from "axios";
import { Default } from "$app/components/layouts/Default";
import { Page } from "$app/components/Breadcrumbs";
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from "react-router-dom";
import { MdSearch } from "react-icons/md";

interface Chat {
  id: number;
  device: {
    id: number;
    phone: string;
  } | null;
  client: {
    id: number;
    phone: string;
  } | null;
  message: string;
  status: string;
  created_at: string;
}

export default function WAChat() {
  const [t] = useTranslation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const chatsPerPage = 10;

  const navigate = useNavigate();
  const { deviceId } = useParams<{ deviceId: string }>();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const pages: Page[] = [
    { name: t('WhatsApp Gateway'), href: '/wa-gateway' },
    { name: t('Chats'), href: `/wa-gateway/chat/${deviceId}` },
  ];

  const fetchChats = async () => {
    const token = localStorage.getItem('X-API-TOKEN') ?? '';
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/wa/messages/device/${deviceId}`, {
        headers: {
          'X-API-TOKEN': token,
          'Accept': 'application/json',
        },
      });
      setChats(response.data.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleResend = async (messageId: number) => {
    const token = localStorage.getItem('X-API-TOKEN') ?? '';
    try {
      await axios.post(
        `http://localhost:8000/api/v1/wa/message/resend/${messageId}`,
        {},
        {
          headers: {
            'X-API-TOKEN': token,
            'Accept': 'application/json',
          },
        }
      );
      alert("Pesan berhasil dikirim ulang!");
      fetchChats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim ulang pesan.');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value.toLowerCase());
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Pesan Terkirim';
      case 'received':
        return 'Menerima Pesan';
      case 'failed':
        return 'Gagal Terkirim';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredChats = chats.filter((chat) =>
    `${chat.message ?? ''} ${chat.client?.phone ?? ''}`.toLowerCase().includes(searchKeyword)
  );

  const sortedChats = [...filteredChats].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(sortedChats.length / chatsPerPage);
  const currentChats = sortedChats.slice(
    (currentPage - 1) * chatsPerPage,
    currentPage * chatsPerPage
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <Default title={t("Daftar Chat")} breadcrumbs={pages}>
      <div className="p-4">
        <div className="mb-4 flex flex-col">
          <div className="flex justify-end space-x-2 mb-2">
            <button
              onClick={() => navigate(`/wa-gateway/chat/template`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Template
            </button>
            <button
              onClick={() => navigate(`/wa-gateway/chat/${deviceId}/recurring`)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Kirim Pesan Berulang
            </button>
            <button
              onClick={() => navigate(`/wa-gateway/chat/${deviceId}/create`)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Kirim Pesan
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <h2 className="text-lg font-semibold">History Pesan</h2>
            <div className="relative w-[300px]">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
              <input
                type="text"
                placeholder="Cari pesan atau nomor WA"
                value={searchKeyword}
                onChange={handleSearchChange}
                className="border pl-10 pr-3 py-2 rounded w-full"
              />
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-4 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-red-500">Error: {error}</div>
          ) : (
            <>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-3">No</th>
                    <th className="p-3">Device Admin</th>
                    <th className="p-3">Nomor WA Client</th>
                    <th className="p-3">Pesan</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 cursor-pointer" onClick={toggleSortOrder}>
                      Waktu {sortOrder === 'asc' ? '\u2191' : '\u2193'}
                    </th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentChats.map((chat, index) => (
                    <tr key={chat.id} className="border-t">
                      <td className="p-3">{(currentPage - 1) * chatsPerPage + index + 1}</td>
                      <td className="p-3">{chat.device?.phone ?? '-'}</td>
                      <td className="p-3">{chat.client?.phone ?? 'Bukan Pelanggan'}</td>
                      <td className="p-3">
                        {chat.message
                          ? (chat.message.length > 20
                            ? `${chat.message.slice(0, 20)}...`
                            : chat.message)
                          : <span className="text-gray-400 italic">[Kosong]</span>}
                      </td>
                      <td className="p-3">{statusLabel(chat.status)}</td>
                      <td className="p-3">{formatDate(chat.created_at)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/wa-gateway/chat/detail/${chat.id}`)}
                          className="px-3 py-1 mr-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-200"
                        >
                          Detail
                        </button>
                        {chat.status === 'failed' && (
                          <button
                            onClick={() => handleResend(chat.id)}
                            className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-red-700 transition duration-200"
                          >
                            Resend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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
            </>
          )}
        </div>
      </div>
    </Default>
  );
}
