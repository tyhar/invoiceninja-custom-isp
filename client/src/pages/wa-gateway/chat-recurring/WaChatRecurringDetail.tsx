import { useState, useEffect } from "react";
import axios from "axios";
import { Default } from "$app/components/layouts/Default";
import { Page } from "$app/components/Breadcrumbs";
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from "react-router-dom";

interface ScheduleDetail {
    id: number;
    device: {
        id: number;
        phone: string;
        name: string;
    };
    clients: {
        id: number;
        phone: string;
        name: string;
    }[];
    text: string;
    frequency: string;
    next_run_date: string;
    created_at: string;
}

export default function WaChatRecurringDetail() {
    const [t] = useTranslation();
    const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { deviceId, scheduleId } = useParams<{ deviceId: string; scheduleId: string }>();

    const pages: Page[] = [
        { name: t('WhatsApp Gateway'), href: '/wa-gateway' },
        { name: t("Chats"), href: `/wa-gateway/chat/${deviceId}` },
        { name: t('Pesan Berulang'), href: `/wa-gateway/chat/${deviceId}/recurring` },
        { name: t('Detail Pesan Berulang'), href: '#' },
    ];

    useEffect(() => {
        const token = localStorage.getItem("X-API-TOKEN") ?? "";
        axios.get(`http://localhost:8000/api/v1/wa/schedules/${scheduleId}`, {
            headers: {
                "X-API-TOKEN": token,
                "Accept": "application/json",
            }
        }).then(res => {
            setSchedule(res.data.data || null);
            setLoading(false);
        }).catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }, [scheduleId]);

    const formatDate = (dateStr: string) => {
        const isoDateStr = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T") + "Z";
        return new Date(isoDateStr).toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const frequencyLabel = (freq: string) => {
        switch (freq) {
            case 'every_minute':
                return 'Setiap 5 Menit';
            case 'daily':
                return 'Setiap Hari';
            case 'weekly':
                return 'Setiap Minggu';
            case 'monthly':
                return 'Setiap Bulan';
            case 'yearly':
                return 'Setiap Tahun';
            default:
                return freq;
        }
    };

    return (
        <Default title={t("Detail Pesan Berulang")} breadcrumbs={pages}>
            <div className="p-6 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                    <span className="text-xl">&#8592;</span> {t('Kembali')}
                </button>

                {loading ? (
                    <div className="text-gray-500 text-center py-10">{t('Loading...')}</div>
                ) : error ? (
                    <div className="text-red-500 text-center py-10">{t('Error')}: {error}</div>
                ) : schedule ? (
                    <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-1">{t("Device Admin")}</h3>
                            <p className="text-gray-700">{schedule.device.phone} ({schedule.device.name})</p>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-1">{t("Client")}</h3>
                            {schedule.clients.length > 0 ? (
                                <ul className="list-disc pl-5 text-gray-700">
                                    {schedule.clients.map(c => (
                                        <li key={c.id}>{c.phone} ({c.name})</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">[Kosong]</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-1">{t("Pesan")}</h3>
                            <div className="p-4 border rounded bg-gray-50 whitespace-pre-wrap text-gray-800">{schedule.text}</div>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-1">{t("Frekuensi")}</h3>
                            <p className="text-gray-700">{frequencyLabel(schedule.frequency)}</p>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-1">{t("Next Run")}</h3>
                            <p className="text-gray-700">{formatDate(schedule.next_run_date)}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1">{t("Dibuat")}</h3>
                            <p className="text-gray-700">{formatDate(schedule.created_at)}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">{t('Tidak ada data.')}</div>
                )}
            </div>
        </Default>
    );
}
