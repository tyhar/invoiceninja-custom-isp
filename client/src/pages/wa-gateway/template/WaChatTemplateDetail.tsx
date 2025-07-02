import { useState, useEffect } from "react";
import axios from "axios";
import { Default } from "$app/components/layouts/Default";
import { Page } from "$app/components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

interface Template {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export default function WaChatTemplateDetail() {
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("X-API-TOKEN") ?? "";
        setLoading(true);

        axios
            .get(`http://localhost:8000/api/v1/templates/${id}`, {
                headers: {
                    "X-API-TOKEN": token,
                    Accept: "application/json",
                },
            })
            .then((res) => {
                setTemplate(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const pages: Page[] = [
        { name: t("WhatsApp Gateway"), href: "/wa-gateway" },
        { name: t("Template Pesan"), href: "/wa-gateway/chat/template" },
        { name: t("Detail Template"), href: `/wa-gateway/chat/template/detail/${id}` },
    ];

    return (
        <Default title={t("Detail Template Pesan")} breadcrumbs={pages}>
            <div className="p-6 max-w-2xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:underline font-semibold"
                    aria-label="Kembali"
                >
                    <span className="text-2xl leading-none">&#8592;</span> {t("Kembali")}
                </button>

                {loading ? (
                    <div className="text-center text-gray-500">{t("Loading...")}</div>
                ) : error ? (
                    <div className="text-center text-red-600 font-medium">Error: {error}</div>
                ) : !template ? (
                    <div className="text-center text-gray-500 font-medium">{t("Template tidak ditemukan.")}</div>
                ) : (
                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">{template.title}</h2>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">{t('Isi Pesan')}</h3>
                            <div className="p-4 border rounded bg-gray-50 max-w-full break-words whitespace-pre-wrap text-gray-800 leading-relaxed">
                                {template.content}
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1 border-t border-gray-200 pt-4">
                            <p>
                                <strong>{t("Tanggal Dibuat")}:</strong> {formatDate(template.created_at)}
                            </p>
                            <p>
                                <strong>{t("Terakhir Diperbarui")}:</strong> {formatDate(template.updated_at)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Default>
    );
}
