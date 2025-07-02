import { useState, useEffect } from "react";
import axios from "axios";
import { Default } from "$app/components/layouts/Default";
import { Page } from "$app/components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

interface Schedule {
    id: number;
    device: {
        id: number;
        phone: string;
    } | null;
    clients: {
        id: number;
        phone: string;
    }[] | null;
    text: string | null;
    frequency: string;
    next_run_date: string;
    created_at: string;
}

export default function WaChatRecurring() {
    const [t] = useTranslation();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const schedulesPerPage = 10;

    const navigate = useNavigate();
    const { deviceId } = useParams<{ deviceId: string }>();

    const pages: Page[] = [
        { name: t("WhatsApp Gateway"), href: "/wa-gateway" },
        { name: t("Chats"), href: `/wa-gateway/chat/${deviceId}` },
        { name: t("Pesan Berulang"), href: "#" },
    ];

    useEffect(() => {
        const token = localStorage.getItem("X-API-TOKEN") ?? "";

        axios
            .get(`http://localhost:8000/api/v1/wa/schedules/device/${deviceId}`, {
                headers: {
                    "X-API-TOKEN": token,
                    Accept: "application/json",
                },
            })
            .then((response) => {
                setSchedules(response.data.data || []);
                setLoading(false);
            })

            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

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

    const handleDelete = (id: number) => {
        const token = localStorage.getItem("X-API-TOKEN") ?? "";

        if (!window.confirm("Yakin ingin menghapus pesan berulang ini?")) return;

        axios
            .delete(`http://localhost:8000/api/v1/wa/schedules/${id}`, {
                headers: {
                    "X-API-TOKEN": token,
                    Accept: "application/json",
                },
            })
            .then(() => {
                setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
                alert("Pesan berulang berhasil dihapus.");
            })
            .catch((err) => {
                alert("Gagal menghapus pesan: " + err.message);
            });
    };

    const indexOfLastSchedule = currentPage * schedulesPerPage;
    const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
    const currentSchedules = schedules.slice(indexOfFirstSchedule, indexOfLastSchedule);
    const totalPages = Math.ceil(schedules.length / schedulesPerPage);

    const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    const truncate = (text: string, max = 30): string => {
        return text.length > max ? text.slice(0, max) + "..." : text;
    };


    return (
        <Default title={t("Pesan Berulang")} breadcrumbs={pages}>
            <div className="p-4">
                <div className="mb-4 flex flex-col">
                    <div className="flex justify-end space-x-2 mb-2">
                        <button
                            onClick={() => navigate(`/wa-gateway/chat/${deviceId}/recurring/create`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Tambah Pesan Berulang
                        </button>
                    </div>
                    <h2 className="text-lg font-semibold">{t("Daftar Pesan Berulang")}</h2>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="p-4 text-gray-500">{t("Loading...")}</div>
                    ) : error ? (
                        <div className="p-4 text-red-500">Error: {error}</div>
                    ) : (
                        <>
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 text-left">
                                    <tr>
                                        <th className="p-3">No</th>
                                        <th className="p-3">Device Admin</th>
                                        <th className="p-3">Client</th>
                                        <th className="p-3">Pesan</th>
                                        <th className="p-3">Frekuensi</th>
                                        <th className="p-3">Next Run</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentSchedules.map((schedule, index) => (
                                        <tr key={schedule.id} className="border-t">
                                            <td className="p-3">{(currentPage - 1) * schedulesPerPage + index + 1}</td>
                                            <td className="p-3">{schedule.device?.phone ?? <span className="text-gray-400 italic">[Kosong]</span>}</td>
                                            <td className="p-3" title={schedule.clients?.map(c => c.phone).join(", ") ?? ""}>
                                                {schedule.clients && schedule.clients.length > 0
                                                    ? truncate(schedule.clients.map(c => c.phone).join(", "), 30)
                                                    : <span className="text-gray-400 italic">[Kosong]</span>}
                                            </td>
                                            <td className="p-3" title={schedule.text ?? ""}>
                                                {schedule.text
                                                    ? truncate(schedule.text, 20)
                                                    : <span className="text-gray-400 italic">[Kosong]</span>}
                                            </td>
                                            <td className="p-3">{frequencyLabel(schedule.frequency)}</td>
                                            <td className="p-3">{schedule.next_run_date ? formatDate(schedule.next_run_date) : "-"}</td>
                                            <td className="p-3 space-x-1">
                                                <button
                                                    onClick={() => navigate(`/wa-gateway/chat/${deviceId}/recurring/detail/${schedule.id}`)}
                                                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-200"
                                                >
                                                    Detail
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/wa-gateway/chat/${deviceId}/recurring/edit/${schedule.id}`)}
                                                    className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600 transition duration-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(schedule.id)}
                                                    className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition duration-200"
                                                >
                                                    Hapus
                                                </button>
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
                                    {t("Sebelumnya")}
                                </button>
                                <span>
                                    {t("Halaman")} {currentPage} {t("dari")} {totalPages}
                                </span>
                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                    {t("Selanjutnya")}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Default>
    );
}
