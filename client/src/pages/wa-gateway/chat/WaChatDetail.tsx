import { useState, useEffect } from "react";
import axios from "axios";
import { Default } from "$app/components/layouts/Default";
import { Page } from "$app/components/Breadcrumbs";
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from "react-router-dom";

interface ChatDetail {
    id: number;
    device: {
        id: number;
        name: string;
        phone: string;
    } | null;
    client: {
        id: number;
        name: string;
        phone: string;
    } | null;
    message: string;
    file: string | null;
    url: string | null;
    status: string;
    created_at: string;
}

export default function WaChatDetail() {
    const [t] = useTranslation();

    const [chat, setChat] = useState<ChatDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();
    const { deviceId } = useParams<{ deviceId: string }>();

    const pages: Page[] = [
        { name: t('WhatsApp Gateway'), href: '/wa-gateway' },
        { name: t("Chats"), href: `/wa-gateway/chat/${deviceId}` },
        { name: t('Detail Chat'), href: `/wa-gateway/chat/detail/${chatId}` },
    ];

    useEffect(() => {
        const token = localStorage.getItem('X-API-TOKEN') ?? '';
        axios.get(`http://localhost:8000/api/v1/wa/message/${chatId}`, {
            headers: {
                'X-API-TOKEN': token,
                'Accept': 'application/json',
            },
        })
            .then(response => {
                setChat(response.data.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [chatId]);

    const statusLabel = (status: string) => {
        switch (status) {
            case 'sent': return t('Pesan Terkirim');
            case 'received': return t('Menerima Pesan');
            case 'failed': return t('Gagal Terkirim');
            default: return status;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <Default title={t("Detail Chat")} breadcrumbs={pages}>
            <div className="p-6 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    aria-label="Kembali"
                >
                    <span className="text-xl">&#8592;</span> {t('Kembali')}
                </button>

                {loading ? (
                    <div className="text-gray-500 text-center py-10">{t('Loading...')}</div>
                ) : error ? (
                    <div className="text-red-500 text-center py-10">{t('Error')}: {error}</div>
                ) : chat ? (
                    <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{t('Device Admin')}</h3>
                                <p className="text-gray-700">{chat.device?.phone ?? '-'} <span className="text-gray-500">({chat.device?.name ?? '-'})</span></p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{t('Client')}</h3>
                                <p className="text-gray-700">{chat.client?.phone ?? '-'} <span className="text-gray-500">({chat.client?.name ?? '-' })</span></p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">{t('Pesan')}</h3>
                            <div className="p-4 border rounded bg-gray-50 max-w-full break-words whitespace-pre-wrap text-gray-800 leading-relaxed">
                                {chat.message}
                            </div>
                        </div>
                        {chat.file && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">{t('File')}</h3>
                                <a
                                    href={chat.url ?? '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    {chat.file}
                                </a>
                            </div>
                        )}
                        <div className="mb-6 text-gray-700 max-w-max">
                            <h3 className="text-lg font-semibold mb-1">{t('Status')}</h3>
                            <span className="inline-block px-3 py-1 bg-gray-100 rounded-md font-medium text-sm select-none">
                                {statusLabel(chat.status)}
                            </span>
                            <h3 className="text-lg font-semibold mt-4 mb-1">{t('Waktu')}</h3>
                            <p className="text-sm">{formatDate(chat.created_at)}</p>
                        </div>

                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">{t('Tidak ada data chat.')}</div>
                )}
            </div>
        </Default>
    );
}
