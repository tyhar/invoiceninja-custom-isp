import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Default } from "$app/components/layouts/Default";
import { Page } from "$app/components/Breadcrumbs";
import { useClientsQuery } from "$app/common/queries/clients";
import axios from "axios";
import Select from "react-select";

interface Template {
  id: number;
  title: string;
  content: string;
}

export default function WaChatRecurring() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const { deviceId } = useParams<{ deviceId: string }>();

  const { data: clients = [], isLoading: loadingClients } = useClientsQuery({ enabled: true });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [useTemplate, setUseTemplate] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    device_id: "",
    client_id: [] as string[],
    text: "",
    message_template_id: "",
    frequency: "",
    next_run_date: "",
  });

  const pages: Page[] = [
    { name: t("WhatsApp Gateway"), href: "/wa-gateway" },
    { name: t("Chats"), href: `/wa-gateway/chat/${deviceId}` },
    { name: t("Pesan Berulang"), href: `/wa-gateway/chat/${deviceId}/recurring` },
    { name: t("Kirim Pesan Berulang"), href: "#" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("X-API-TOKEN") ?? "";
    if (deviceId) {
      setForm(prev => ({
        ...prev,
        device_id: deviceId,
      }));
    }
    axios
      .get("http://localhost:8000/api/v1/templates", {
        headers: { "X-API-TOKEN": token },
      })
      .then((res) => {
        setTemplates(res.data || []);
      });
  }, [deviceId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setForm(prev => ({
      ...prev,
      message_template_id: selectedId,
    }));

    const selectedTemplate = templates.find(tpl => tpl.id.toString() === selectedId);
    if (selectedTemplate) {
      setForm(prev => ({
        ...prev,
        text: selectedTemplate.content,
        message_template_id: selectedId,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        text: "",
        message_template_id: selectedId,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("X-API-TOKEN") ?? "";
      const payload = {
        device_id: Number(form.device_id),
        client_ids: form.client_id,
        text: form.text,
        message_template_id: form.message_template_id,
        frequency: form.frequency,
        next_run_date: form.next_run_date,
      };

      console.log("Payload yang dikirim:", payload);

      await axios.post("http://localhost:8000/api/v1/wa/schedules", payload, {
        headers: {
          "X-API-TOKEN": token,
          Accept: "application/json",
        },
      });

      navigate(`/wa-gateway/chat/${deviceId}/recurring`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingClients) {
    return <div className="p-4 text-center">{t("Loading...")}</div>;
  }

  return (
    <Default title={t("Kirim Pesan Berulang")} breadcrumbs={pages}>
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline"
        >
          &larr; {t("Kembali")}
        </button>
        <div className="bg-white shadow rounded-lg p-6 max-w-xl mx-auto space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <Select
                isMulti={isGroup}
                name="client_id"
                options={clients.map(client => ({
                  value: client.id,
                  label: client.name,
                }))}
                onChange={(selected) => {
                  if (isGroup) {
                    const selectedOptions = selected as { value: string; label: string }[];
                    setForm(prev => ({
                      ...prev,
                      client_id: selectedOptions.map(opt => opt.value),
                    }));
                  } else {
                    const selectedOption = selected as { value: string; label: string } | null;
                    setForm(prev => ({
                      ...prev,
                      client_id: selectedOption ? [selectedOption.value] : [],
                    }));
                  }
                }}
                value={
                  isGroup
                    ? clients
                      .filter(client => form.client_id.includes(client.id.toString()))
                      .map(client => ({
                        value: client.id.toString(),
                        label: client.name,
                      }))
                    : clients
                      .filter(client => form.client_id.includes(client.id.toString()))
                      .map(client => ({
                        value: client.id.toString(),
                        label: client.name,
                      }))[0] || null
                }
                className="w-full"
                placeholder="Cari dan pilih client..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isGroup}
                onChange={() => {
                  setIsGroup(!isGroup);
                  setForm(prev => ({
                    ...prev,
                    client_id: [],
                  }));
                }}
              />
              <label className="text-sm">Kirim ke banyak client (Broadcast)?</label>
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
                  <option value="" disabled>
                    -- Pilih Template --
                  </option>
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
                  placeholder="Isi Pesan yang mau dikirim"
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
              <label className="block text-sm font-medium mb-1">Tanggal Mulai (Next Run)</label>
              <input
                type="date"
                name="next_run_date"
                value={form.next_run_date}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Frekuensi Pengiriman</label>
              <select
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="">-- Pilih Frekuensi --</option>
                <option value="every_minute">Setiap 5 Menit</option>
                <option value="daily">Setiap Hari</option>
                <option value="weekly">Setiap Seminggu</option>
                <option value="monthly">Setiap Bulan</option>
                <option value="yearly">Setiap Tahun</option>
              </select>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Menyimpan..." : "Simpan Jadwal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Default>
  );
}
