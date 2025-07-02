import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Default } from "$app/components/layouts/Default";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useClientsQuery } from "$app/common/queries/clients";


interface Template {
    id: number;
    title: string;
    content: string;
}

interface Device {
    id: number;
    phone: string;
    name: string;
}

export default function WaChatSend() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { data: clients = [] } = useClientsQuery({ enabled: true });

    const [clientIds, setClientIds] = useState<string[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);

    const [useTemplate, setUseTemplate] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        device_id: "",
        client_id: [] as string[],
        text: "",
        message_template_id: "",
        image_url: "",
        document_url: "",
        document_name: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("X-API-TOKEN") ?? "";

        axios.get("http://localhost:8000/api/v1/templates", {
            headers: { "X-API-TOKEN": token }
        }).then(res => setTemplates(res.data || []));

        axios.get("http://localhost:8000/api/v1/devices", {
            headers: { "X-API-TOKEN": token }
        }).then(res => setDevices(res.data.data || []));
    }, []);

    useEffect(() => {
        const paramsClients = searchParams.get("clients");
        if (paramsClients) {
            setClientIds(paramsClients.split(","));
        }
    }, [searchParams]);

    useEffect(() => {
    }, [clients]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setForm(prev => ({ ...prev, [name]: val }));
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedTemplate = templates.find(tpl => tpl.id.toString() === selectedId);
        setForm(prev => ({
            ...prev,
            message_template_id: selectedId,
            text: selectedTemplate?.content || ""
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("X-API-TOKEN") ?? "";

            const payload = {
                ...form,
                device_id: Number(form.device_id),
                client_id: clientIds,
            };

            await axios.post("http://localhost:8000/api/v1/wa/message", payload, {
                headers: {
                    "X-API-TOKEN": token,
                    "Accept": "application/json"
                }
            });

            navigate(`/wa-gateway/chat/${form.device_id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Default title="Kirim Pesan WhatsApp" breadcrumbs={[{ name: "Kirim Pesan", href: "#" }]}>
            <div className="p-4 max-w-xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
                    &larr; Kembali
                </button>
                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">Client:</label>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                            {clientIds.map(id => {
                                const client = clients.find(c => c.id.toString() === id);
                                return (
                                    <li key={id}>
                                        {client? `${client.name} (${client.phone})` : `Client ID ${id} tidak ditemukan`}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>


                    <div>
                        <label className="block text-sm font-medium mb-1">Pilih Device Admin</label>
                        <select
                            name="device_id"
                            value={form.device_id}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            required
                        >
                            <option value="">-- Pilih Device --</option>
                            {devices.map(device => (
                                <option key={device.id} value={device.id}>
                                    {device.name} ({device.phone})
                                </option>
                            ))}
                        </select>
                    </div>

                    {useTemplate ? (
                        <div>
                            <label className="block text-sm font-medium mb-1">Template Pesan</label>
                            <select
                                name="message_template_id"
                                value={form.message_template_id}
                                onChange={handleTemplateChange}
                                className="w-full border rounded p-2"
                                required
                            >
                                <option value="">-- Pilih Template --</option>
                                {templates.map(tpl => (
                                    <option key={tpl.id} value={tpl.id}>
                                        {tpl.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium mb-1">Pesan Text</label>
                            <input
                                type="text"
                                name="text"
                                placeholder="Isi Pesan"
                                value={form.text}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={useTemplate}
                            onChange={() => setUseTemplate(prev => !prev)}
                        />
                        <label className="text-sm">Gunakan Template Pesan?</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Image URL (Opsional)</label>
                        <input
                            type="url"
                            name="image_url"
                            placeholder="URL direct image"
                            value={form.image_url}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Document URL (Opsional)</label>
                        <input
                            type="url"
                            name="document_url"
                            value={form.document_url}
                            placeholder="URL Download Dokumennya"
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Document Name (Opsional)</label>
                        <input
                            type="text"
                            name="document_name"
                            value={form.document_name}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            placeholder="Isi name dengan ekstensi nya, contoh dokumen.pdf"
                            required={!!form.document_url}
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            {loading ? "Mengirim..." : "Kirim"}
                        </button>
                    </div>
                </form>
            </div>
        </Default>
    );
}