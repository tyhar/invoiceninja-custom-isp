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
}

export default function WaChatTemplate() {
    const [t] = useTranslation();
    const { deviceId } = useParams<{ deviceId: string }>();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const chatsPerPage = 5;

    const navigate = useNavigate();

    const pages: Page[] = [
        { name: t("WhatsApp Gateway"), href: "/wa-gateway" },
        { name: t("Chats"), href: `/wa-gateway/chat/${deviceId}` },
        { name: t("Template Pesan"), href: "/wa-gateway/chat/template" },
    ];

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = () => {
        setLoading(true);
        const token = localStorage.getItem("X-API-TOKEN") ?? "";

        axios
            .get("http://localhost:8000/api/v1/templates", {
                headers: {
                    "X-API-TOKEN": token,
                    Accept: "application/json",
                },
            })
            .then((res) => {
                setTemplates(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    const openAddModal = () => {
        setEditingTemplate(null);
        setTitle("");
        setContent("");
        setSubmitError(null);
        setShowModal(true);
    };

    const openEditModal = (template: Template) => {
        setEditingTemplate(template);
        setTitle(template.title);
        setContent(template.content);
        setSubmitError(null);
        setShowModal(true);
    };

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            setSubmitError(t("Judul dan isi pesan harus diisi."));
            return;
        }

        setSubmitLoading(true);
        setSubmitError(null);

        const token = localStorage.getItem("X-API-TOKEN") ?? "";

        if (editingTemplate) {
            axios
                .put(
                    `http://localhost:8000/api/v1/templates/${editingTemplate.id}`,
                    { title, content },
                    {
                        headers: {
                            "X-API-TOKEN": token,
                            Accept: "application/json",
                        },
                    }
                )
                .then(() => {
                    setSubmitLoading(false);
                    setShowModal(false);
                    fetchTemplates();
                })
                .catch((err) => {
                    setSubmitLoading(false);
                    setSubmitError(err.response?.data?.message || err.message);
                });
        } else {
            axios
                .post(
                    "http://localhost:8000/api/v1/templates",
                    { title, content },
                    {
                        headers: {
                            "X-API-TOKEN": token,
                            Accept: "application/json",
                        },
                    }
                )
                .then(() => {
                    setSubmitLoading(false);
                    setShowModal(false);
                    fetchTemplates();
                })
                .catch((err) => {
                    setSubmitLoading(false);
                    setSubmitError(err.response?.data?.message || err.message);
                });
        }
    };

    const handleDelete = (id: number) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus template ini?")) {
            return;
        }

        const token = localStorage.getItem("X-API-TOKEN") ?? "";
        axios
            .delete(`http://localhost:8000/api/v1/templates/${id}`, {
                headers: {
                    "X-API-TOKEN": token,
                    Accept: "application/json",
                },
            })
            .then(() => {
                fetchTemplates();
            })
            .catch((err) => {
                alert(t("Gagal menghapus template: ") + (err.response?.data?.message || err.message));
            });
    };

    const indexOfLastChat = currentPage * chatsPerPage;
    const indexOfFirstChat = indexOfLastChat - chatsPerPage;
    const currentTemplates = templates.slice(indexOfFirstChat, indexOfLastChat);
    const totalPages = Math.ceil(templates.length / chatsPerPage);

    const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    return (
        <Default title={t("Template Pesan WhatsApp")} breadcrumbs={pages}>
            <div className="p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    aria-label="Kembali"
                >
                    <span className="text-xl">&#8592;</span> {t("Kembali")}
                </button>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{t("Daftar Template Pesan")}</h2>
                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {t("Tambah Template")}
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="p-4 text-gray-500">{t("Loading...")}</div>
                    ) : error ? (
                        <div className="p-4 text-red-500">Error: {error}</div>
                    ) : templates.length === 0 ? (
                        <div className="p-4 text-gray-500">{t("Tidak ada template.")}</div>
                    ) : (
                        <>
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 text-left">
                                    <tr>
                                        <th className="p-3">#</th>
                                        <th className="p-3">{t("Nama Template")}</th>
                                        <th className="p-3">{t("Isi Pesan")}</th>
                                        <th className="p-3 text-center">{t("Aksi")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTemplates.map((template, idx) => (
                                        <tr key={template.id} className="border-t hover:bg-gray-50">
                                            <td className="p-3 text-center">{idx + 1}</td>
                                            <td className="p-3 font-medium">{template.title}</td>
                                            <td className="p-3 max-w-xs truncate">{template.content}</td>
                                            <td className="p-3 text-center space-x-1">
                                                <button
                                                    onClick={() => navigate(`/wa-gateway/chat/template/detail/${template.id}`)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                                >
                                                    {t("Detail")}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(template)}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                                >
                                                    {t("Edit")}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(template.id)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                                >
                                                    {t("Hapus")}
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

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {editingTemplate ? t("Edit Template Pesan") : t("Tambah Template Pesan")}
                            </h3>
                            {submitError && (
                                <div className="mb-4 text-red-600">{submitError}</div>
                            )}
                            <label className="block mb-2">
                                <span className="text-gray-700">{t("Judul Template")}</span>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </label>
                            <label className="block mb-4">
                                <span className="text-gray-700">{t("Isi Pesan")}</span>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </label>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    disabled={submitLoading}
                                >
                                    {t("Batal")}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitLoading}
                                    className={`px-4 py-2 rounded text-white ${submitLoading
                                        ? "bg-green-400"
                                        : "bg-green-600 hover:bg-green-700"
                                        }`}
                                >
                                    {submitLoading ? t("Menyimpan...") : t("Simpan")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Default>
    );
}
