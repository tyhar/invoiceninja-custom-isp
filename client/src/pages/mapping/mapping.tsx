import { useEffect, useState } from 'react';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { MapCenterUpdater } from './utils/MapZoomer';
import { Polyline } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

type FormMode = 'client' | 'odp' | 'odc' | null;

interface MarkerData {
  id: number;
  lokasi_id: number;
  nama_lokasi: string;
  deskripsi: string;
  latitude: string;
  longitude: string;
  // client specific
  nama_client?: string;
  alamat?: string;
  odp_id?: string;
  client_id: number;
  // odp specific
  nama_odp?: string;
  tipe_splitter?: string;
  kabel_core_odc_id?: string;
  nama_odc?: string;
}

interface AddMarkerFormProps {

  mode: 'client' | 'odp' | 'odc';
  onSave: () => void;
  onCancel: () => void;
  initialData?: Partial<MarkerData>;
  editingId?: number;
}

const AddMarkerForm: React.FC<AddMarkerFormProps> = ({ mode, onSave, onCancel, initialData, editingId }) => {
  const [position, setPosition] = useState<LatLng | null>(
    initialData && initialData.latitude && initialData.longitude
      ? new L.LatLng(parseFloat(initialData.latitude), parseFloat(initialData.longitude))
      : null
  );

  const [form, setForm] = useState({
    nama_lokasi: initialData?.nama_lokasi || '',
    deskripsi: initialData?.deskripsi || '',
    nama: initialData?.nama_client || initialData?.nama_odp || initialData?.nama_odc || '',
    alamat: initialData?.alamat || '',
    odp_id: initialData?.odp_id || '',
    kabel_core_odc_id: initialData?.kabel_core_odc_id || '',
    tipe_splitter: initialData?.tipe_splitter || '1:8',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    client_id: initialData?.client_id || '',
  });

  const allowMapClick = !position && form.nama_lokasi.trim() === '' && form.nama.trim() === '';

  const [odpList, setOdpList] = useState<any[]>([]);
  const [odcCoreList, setOdcCoreList] = useState<any[]>([]);
  const [clientList, setClientList] = useState<any[]>([]);
  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      try {
        if (mode === 'client') {
          const [odpRes, clientRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/v1/fo-odps`, headers),
            axios.get(`${API_BASE_URL}/api/v1/clients`, headers),
          ]);
          setOdpList(odpRes.data.data);
          setClientList(clientRes.data.data);
        } else if (mode === 'odp') {
          const res = await axios.get(`${API_BASE_URL}/api/v1/fo-kabel-core-odcs/no-odp`, headers);
          setOdcCoreList(res.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [mode]);

  useMapEvents({
    click(e) {
      if (!allowMapClick) return;
      setPosition(e.latlng);
      setForm((f) => ({
        ...f,
        latitude: e.latlng.lat.toString(),
        longitude: e.latlng.lng.toString(),
      }));
    },
  });

  const onMarkerDragEnd = (e: L.DragEndEvent) => {
    const marker = e.target;
    const latLng = marker.getLatLng();
    setPosition(latLng);
    setForm((f) => ({ ...f, latitude: latLng.lat.toString(), longitude: latLng.lng.toString() }));
  };

  const handleLatLongChange = (field: 'latitude' | 'longitude', value: string) => {
    setForm((f) => {
      const newForm = { ...f, [field]: value };
      const lat = parseFloat(newForm.latitude);
      const lng = parseFloat(newForm.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const newPos = new L.LatLng(lat, lng);
        setPosition(newPos);
      }
      return newForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return alert('Klik lokasi di peta terlebih dahulu.');

    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/api/v1/fo-lokasis/${initialData?.lokasi_id}`,
          {
            nama_lokasi: form.nama_lokasi,
            deskripsi: form.deskripsi,
            latitude: position.lat,
            longitude: position.lng,
          },
          headers
        );

        if (mode === 'client') {
          await axios.put(
            `${API_BASE_URL}/api/v1/fo-client-ftths/${editingId}`,
            {
              lokasi_id: initialData?.lokasi_id,
              odp_id: form.odp_id,
              nama_client: form.nama,
              alamat: form.alamat,
            },
            headers
          );
        } else if (mode === 'odp') {
          await axios.put(
            `${API_BASE_URL}/api/v1/fo-odps/${editingId}`,
            {
              lokasi_id: initialData?.lokasi_id,
              kabel_core_odc_id: form.kabel_core_odc_id,
              nama_odp: form.nama,
              tipe_splitter: form.tipe_splitter,
            },
            headers
          );
        } else if (mode === 'odc') {
          await axios.put(
            `${API_BASE_URL}/api/v1/fo-odcs/${editingId}`,
            {
              lokasi_id: initialData?.lokasi_id,
              nama_odc: form.nama,
              tipe_splitter: form.tipe_splitter,
            },
            headers
          );
        }

        window.alert('Data berhasil diperbarui.');
      } else {
        const lokasiRes = await axios.post(
          '${API_BASE_URL}/api/v1/fo-lokasis',
          {
            nama_lokasi: form.nama_lokasi,
            deskripsi: form.deskripsi,
            latitude: position.lat,
            longitude: position.lng,
          },
          headers
        );

        const lokasi_id = lokasiRes.data.data.id;

        if (mode === 'client') {
          await axios.post(
            '${API_BASE_URL}/api/v1/fo-client-ftths',
            {
              lokasi_id,
              odp_id: form.odp_id || null,
              nama_client: form.nama,
              alamat: form.alamat,
              client_id: form.client_id || null,
            },
            headers
          );
        } else if (mode === 'odp') {
          await axios.post(
            '${API_BASE_URL}/api/v1/fo-odps',
            {
              lokasi_id,
              kabel_core_odc_id: form.kabel_core_odc_id,
              nama_odp: form.nama,
              tipe_splitter: form.tipe_splitter,
            },
            headers
          );
        } else if (mode === 'odc') {
          await axios.post(
            `${API_BASE_URL}/api/v1/fo-odcs`,
            {
              lokasi_id,
              nama_odc: form.nama,
              tipe_splitter: form.tipe_splitter,
            },
            headers
          );
        }

        window.alert('Data berhasil disimpan.');
      }

      onSave();
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan data.');
    }
  };

  return (
    <>
      {position && (
        <Marker position={position} draggable eventHandlers={{ dragend: onMarkerDragEnd }} />
      )}
      <div className="absolute top-16 right-4 bg-white p-4 shadow-md rounded z-[999] w-[320px] max-h-[80vh] overflow-auto">
        <h3 className="font-semibold mb-2">
          {editingId ? mode === 'client' ? 'Edit Client' : mode === 'odp' ? 'Edit ODP' : 'Edit ODC' : mode === 'client' ? 'Tambah Client' : mode === 'odp' ? 'Tambah ODP' : 'Tambah ODC'}</h3>
        <p className="mb-2 text-xs text-gray-600">Klik peta untuk memilih lokasi atau edit latitude dan longitude di bawah</p>
        <div className="max-h-[60vh] overflow-y-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="block mb-1">Nama Lokasi</label>
              <input
                type="text"
                className="w-full border p-1"
                placeholder="Nama Lokasi"
                value={form.nama_lokasi}
                onChange={(e) => setForm({ ...form, nama_lokasi: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-1">Deskripsi Lokasi</label>
              <input
                type="text"
                className="w-full border p-1"
                placeholder="Deskripsi Lokasi"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-1">
                {mode === 'client' ? 'Nama Client' : mode === 'odp' ? 'Nama ODP' : 'Nama ODC'}
              </label>
              <input
                type="text"
                className="w-full border p-1"
                placeholder="Nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>

            {mode === 'client' && (
              <>
                <div>
                  <label className="block mb-1">Alamat</label>
                  <input
                    type="text"
                    className="w-full border p-1"
                    placeholder="Alamat"
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block mb-1">ODP</label>
                  <select
                    className="w-full border p-1"
                    value={form.odp_id}
                    onChange={(e) => setForm({ ...form, odp_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih ODP</option>
                    {odpList.map((odp) => (
                      <option key={odp.id} value={odp.id}>
                        {odp.nama_odp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Client ID</label>
                  <select
                    className="w-full border p-1"
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  >
                    <option value="">Pilih Client ID</option>
                    {clientList.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name || client.nama_client || `Client #${client.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {mode === 'odp' && (
              <>
                <div>
                  <label className="block mb-1">Kabel Core ODC</label>
                  <select
                    className="w-full border p-1"
                    value={form.kabel_core_odc_id}
                    onChange={(e) => setForm({ ...form, kabel_core_odc_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Kabel Core ODC</option>
                    {odcCoreList.map((core) => (
                      <option key={core.id} value={core.id}>
                        {core.warna_core}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Tipe Splitter</label>
                  <select
                    className="w-full border p-1"
                    value={form.tipe_splitter}
                    onChange={(e) => setForm({ ...form, tipe_splitter: e.target.value })}
                  >
                    <option value="1:8">1:8</option>
                    <option value="1:16">1:16</option>
                    <option value="1:32">1:32</option>
                  </select>
                </div>
              </>
            )}

            {mode === 'odc' && (
              <div>
                <label className="block mb-1">Tipe Splitter</label>
                <select
                  className="w-full border p-1"
                  value={form.tipe_splitter}
                  onChange={(e) => setForm({ ...form, tipe_splitter: e.target.value })}
                >
                  <option value="1:8">1:8</option>
                  <option value="1:16">1:16</option>
                  <option value="1:32">1:32</option>
                </select>
              </div>
            )}

            <div>
              <label className="block mb-1">Koordinat</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  className="w-1/2 border p-1"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={(e) => handleLatLongChange('latitude', e.target.value)}
                  required
                />
                <input
                  type="number"
                  step="any"
                  className="w-1/2 border p-1"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={(e) => handleLatLongChange('longitude', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="bg-gray-300 px-2 py-1 rounded" onClick={onCancel}>
                Batal
              </button>
              <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};


const MappingPage: React.FC = () => {
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [odps, setOdps] = useState<any[]>([]);
  const [odcs, setOdcs] = useState<any[]>([]);
  const [editData, setEditData] = useState<{ mode: 'client' | 'odp' | 'odc'; data: MarkerData; } | null>(null);
  const [t] = useTranslation();
  const [selectedProvinsi, setSelectedProvinsi] = useState('');
  const [selectedKota, setSelectedKota] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<[number, number] | null>(null);
  const [showKabelModal, setShowKabelModal] = useState(false);
  const navigate = useNavigate();
  const [filterLokasi, setFilterLokasi] = useState<any[]>([]);
  const [statistikData, setStatistikData] = useState<any[]>([]);
  const [jumlahData, setJumlahData] = useState<{ client: number; odp: number; odc: number } | null>(null);
  
  const API_BASE_URL = 'http://localhost:8000';

  // Default CENTER MAP
  const mapDefaultCenter: [number, number] = [-7.56526, 110.81653];

  const pages: Page[] = [{ name: t('Mapping'), href: '/map' }];

  // GET DATA CLIENT,ODP,ODC DARI API
  const fetchData = async () => {
    const token = localStorage.getItem('X-API-TOKEN');
    const headers = { headers: { 'X-API-TOKEN': token || '' } };

    const [clientRes, odpRes, odcRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/v1/fo-client-ftths`, headers),
      axios.get(`${API_BASE_URL}/api/v1/fo-odps`, headers),
      axios.get(`${API_BASE_URL}/api/v1/fo-odcs`, headers),
    ]);

    setClients(clientRes.data.data);
    setOdps(odpRes.data.data);
    setOdcs(odcRes.data.data);
  };

  // GET DATA FILTER DARI API
  const fetchFilterLokasi = async () => {
    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      const res = await axios.get(`${API_BASE_URL}/api/v1/filter-lokasi`, headers);
      setFilterLokasi(res.data.data);
    } catch (err) {
      console.error('Gagal fetch filter lokasi:', err);
    }
  };

  const fetchStatistikData = async () => {
    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      const res = await axios.get(`${API_BASE_URL}/api/v1/filter-lokasi/statistik`, headers);
      setStatistikData(res.data.data);
    } catch (err) {
      console.error('Gagal fetch statistik lokasi:', err);
    }
  };


  useEffect(() => {
    fetchData();
    fetchFilterLokasi();
    fetchStatistikData();
  }, []);

  const provinsiOptionsFormatted = Array.from(
    new Set(filterLokasi.map(l => l.provinsi).filter(Boolean))
  ).map(p => ({ value: p, label: p }));

  const kotaOptionsFormatted = Array.from(
    new Set(filterLokasi
      .filter(l => !selectedProvinsi || l.provinsi === selectedProvinsi)
      .map(l => l.kota)
      .filter(Boolean))
  ).map(k => ({ value: k, label: k }));

  const updateJumlahByFilter = (prov: string, kota?: string) => {
    const match = statistikData.find(s =>
      s.provinsi === prov && (!kota || s.kota === kota)
    );

    if (match) {
      setJumlahData({
        client: match.total_client || 0,
        odp: match.total_odp || 0,
        odc: match.total_odc || 0,
      });
    } else {
      setJumlahData(null);
    }
  };

  const getTotalByProvinsi = (provinsi: string) => {
    const filtered = statistikData.filter(s => s.provinsi === provinsi);

    return {
      client: filtered.reduce((sum, item) => sum + (item.total_client || 0), 0),
      odp: filtered.reduce((sum, item) => sum + (item.total_odp || 0), 0),
      odc: filtered.reduce((sum, item) => sum + (item.total_odc || 0), 0),
    };
  };

  const handleProvinsiChange = (prov: string) => {
    setSelectedProvinsi(prov);
    setSelectedKota('');

    const total = getTotalByProvinsi(prov);
    setJumlahData(total);

    const target = filterLokasi.find(l => l.provinsi === prov);
    if (target?.latitude && target?.longitude) {
      setSelectedCenter([parseFloat(target.latitude), parseFloat(target.longitude)]);
    } else {
      setSelectedCenter(mapDefaultCenter);
    }
  };

  const handleKotaChange = (kota: string) => {
    setSelectedKota(kota);
    updateJumlahByFilter(selectedProvinsi || '', kota);

    const target = filterLokasi.find(
      l => l.kota === kota && (!selectedProvinsi || l.provinsi === selectedProvinsi)
    );
    if (target?.latitude && target?.longitude) {
      setSelectedCenter([parseFloat(target.latitude), parseFloat(target.longitude)]);
    } else {
      setSelectedCenter(mapDefaultCenter);
    }
  };

  const handleDelete = async (mode: 'client' | 'odp' | 'odc', id: number, lokasi_id: number) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;

    try {
      const token = localStorage.getItem('X-API-TOKEN');
      const headers = { headers: { 'X-API-TOKEN': token || '' } };

      // Hapus data client/odp
      if (mode === 'client') {
        await axios.delete(`${API_BASE_URL}/api/v1/fo-client-ftths/${id}`, headers);
      } else if (mode === 'odp') {
        await axios.delete(`${API_BASE_URL}/api/v1/fo-odps/${id}`, headers);
      } else if (mode === 'odc') {
        await axios.delete(`${API_BASE_URL}/api/v1/fo-odcs/${id}`, headers);
      }

      // Hapus lokasi terkait
      await axios.delete(`${API_BASE_URL}/api/v1/fo-lokasis/${lokasi_id}`, headers);

      alert('Data berhasil dihapus.');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus data.');
    }
  };


  const clientIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const odpIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const odcIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const getLatLng = (item: any): [number, number] | null => {
    if (!item?.lokasi) return null;
    const lat = parseFloat(item.lokasi.latitude);
    const lng = parseFloat(item.lokasi.longitude);
    return (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null;
  };


  // Menghitung Jarak
  const haversineDistance = (
    [lat1, lon1]: [number, number],
    [lat2, lon2]: [number, number]
  ): number => {
    const R = 6371; // Radius bumi dalam kilometer
    const toRad = (deg: number) => deg * (Math.PI / 180);

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Membuat Garis Melengkung
  const createSmoothArc = (start: [number, number], end: [number, number], segments = 10): [number, number][] => {
    const [lat1, lng1] = start;
    const [lat2, lng2] = end;

    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // untuk membuat lengkungan ke atas
    const offsetFactor = 0.4;
    const normX = -dy / distance;
    const normY = dx / distance;

    const controlLat = midLat + normY * distance * offsetFactor;
    const controlLng = midLng + normX * distance * offsetFactor;

    const curvePoints: [number, number][] = [];
    for (let t = 0; t <= 1; t += 1 / segments) {
      const x = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * controlLng + t * t * lng2;
      const y = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * controlLat + t * t * lat2;
      curvePoints.push([y, x]);
    }

    return curvePoints;
  };

  return (
    <Default title={t('Mapping')} breadcrumbs={pages}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('client')}
          >
            Add Client
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('odp')}
          >
            Add ODP
          </button>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => setFormMode('odc' as FormMode)}
          >
            Add ODC
          </button>
          <button
            className="bg-pink-600 text-white px-4 py-2 rounded"
            onClick={() => setShowKabelModal(true)}
          >
            Add Kabel
          </button>
        </div>
        <div className="flex gap-4 w-full max-w-2xl">
          <div className="w-1/2">
            <Select
              placeholder="Pilih Provinsi"
              options={provinsiOptionsFormatted}
              value={provinsiOptionsFormatted.find(opt => opt.value === selectedProvinsi) || null}
              onChange={(e) => handleProvinsiChange(e?.value || '')}
              isClearable
            />
          </div>

          <div className="w-1/2">
            <Select
              placeholder="Pilih Kota/Kab"
              options={kotaOptionsFormatted}
              value={kotaOptionsFormatted.find(opt => opt.value === selectedKota) || null}
              onChange={(e) => handleKotaChange(e?.value || '')}
              isClearable
            />
          </div>
        </div>
      </div>

      <div className="h-[80vh] relative z-0">
        {(selectedProvinsi || selectedKota) && jumlahData && (
          <div className="absolute top-4 right-4 z-[999] bg-white rounded shadow-md p-4 w-64">
            <h3 className="text-lg font-semibold mb-2">Statistik Daerah</h3>
            <p><b>Jumlah Client:</b> {jumlahData.client}</p>
            <p><b>Jumlah ODP:</b> {jumlahData.odp}</p>
            <p><b>Jumlah ODC:</b> {jumlahData.odc}</p>
          </div>
        )}
        <MapContainer center={mapDefaultCenter} zoom={13} className="h-full w-full">
          <MapCenterUpdater center={selectedCenter || mapDefaultCenter} />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {clients
            .filter(c => c.lokasi && !isNaN(parseFloat(c.lokasi.latitude)) && !isNaN(parseFloat(c.lokasi.longitude)))
            .map(client => {
              const lat = parseFloat(client.lokasi.latitude);
              const lng = parseFloat(client.lokasi.longitude);
              return (
                <Marker key={`client-${client.id}`} position={[lat, lng]} icon={clientIcon}
                >
                  <Popup>
                    <div>
                      <b>Client:</b> {client.nama_client}<br />
                      <b>Alamat:</b> {client.alamat}<br />
                      <b>ODC:</b> {client.odc?.nama_odc}<br />
                      <b>ODP:</b> {client.odp?.nama_odp}<br />
                      <b>Total Tagihan:</b>{' '}
                      {client.client?.invoices
                        ? client.client.invoices.reduce((total: number, inv: { amount: string; }) => total + parseFloat(inv.amount), 0).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })
                        : 'Rp0'}
                      <br />
                      <b>Nama Paket:</b>{' '}
                      {client.client?.invoices?.length > 0 && client.client.invoices[0].line_items?.length > 0
                        ? client.client.invoices[0].line_items[0].product_key
                        : '-'}
                      <br />
                      <b>Status Invoice:</b>{' '}
                      {client.client?.invoices?.length > 0
                        ? client.client.invoices[0].status_id === 4
                          ? 'Lunas'
                          : 'Belum Lunas'
                        : '-'}
                      <br />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="bg-yellow-400 px-2 py-1 rounded text-xs"
                          onClick={() => setEditData({
                            mode: 'client',
                            data: {
                              id: client.id,
                              lokasi_id: client.lokasi.id,
                              nama_lokasi: client.lokasi.nama_lokasi,
                              deskripsi: client.lokasi.deskripsi,
                              latitude: client.lokasi.latitude,
                              longitude: client.lokasi.longitude,
                              nama_client: client.nama_client,
                              alamat: client.alamat,
                              odp_id: client.odp_id,
                              client_id: client.client_id
                            }
                          })}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => handleDelete('client', client.id, client.lokasi.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {odps
            .filter(odp => odp.lokasi)
            .filter(odp => {
              const lat = parseFloat(odp.lokasi.latitude);
              const lng = parseFloat(odp.lokasi.longitude);
              return !isNaN(lat) && !isNaN(lng);
            })
            .map(odp => {
              const lat = parseFloat(odp.lokasi.latitude);
              const lng = parseFloat(odp.lokasi.longitude);
              return (
                <Marker key={`odp-${odp.id}`} position={[lat, lng]} icon={odpIcon}>
                  <Popup>
                    <div className="text-sm">
                      <strong>ODP:</strong> {odp.nama_odp}<br />
                      <strong>Lokasi:</strong> {odp.lokasi.nama_lokasi}<br />
                      <strong>Deskripsi:</strong> {odp.lokasi.deskripsi}<br />
                      <strong>Terhubung ke ODC:</strong> {odp.odc?.nama_odc}<br />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="bg-yellow-400 px-2 py-1 rounded text-xs"
                          onClick={() => setEditData({
                            mode: 'odp', data: {
                              id: odp.id,
                              lokasi_id: odp.lokasi.id,
                              nama_lokasi: odp.lokasi.nama_lokasi,
                              deskripsi: odp.lokasi.deskripsi,
                              latitude: odp.lokasi.latitude,
                              longitude: odp.lokasi.longitude,
                              nama_odp: odp.nama_odp,
                              tipe_splitter: odp.tipe_splitter,
                              kabel_core_odc_id: odp.kabel_core_odc_id,
                              client_id: 0
                            }
                          })}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => handleDelete('odp', odp.id, odp.lokasi.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {odcs
            .filter(odc => odc.lokasi && !isNaN(parseFloat(odc.lokasi.latitude)) && !isNaN(parseFloat(odc.lokasi.longitude)))
            .map(odc => {
              const lat = parseFloat(odc.lokasi.latitude);
              const lng = parseFloat(odc.lokasi.longitude);
              return (
                <Marker key={`odc-${odc.id}`} position={[lat, lng]} icon={odcIcon}>
                  <Popup>
                    <div className="text-sm">
                      <strong>ODC:</strong> {odc.nama_odc}<br />
                      <strong>Lokasi:</strong> {odc.lokasi.nama_lokasi}<br />
                      <strong>Deskripsi:</strong> {odc.lokasi.deskripsi}<br />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="bg-yellow-400 px-2 py-1 rounded text-xs"
                          onClick={() => setEditData({
                            mode: 'odc',
                            data: {
                              id: odc.id,
                              lokasi_id: odc.lokasi.id,
                              nama_lokasi: odc.lokasi.nama_lokasi,
                              deskripsi: odc.lokasi.deskripsi,
                              latitude: odc.lokasi.latitude,
                              longitude: odc.lokasi.longitude,
                              nama_odc: odc.nama_odc,
                              client_id: 0
                            }
                          })}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          onClick={() => handleDelete('odc' as any, odc.id, odc.lokasi.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {clients.map((client) => {
            const clientPos = getLatLng(client);
            const odpPos = getLatLng(client.odp);
            const odcPos = getLatLng(client.odc);

            if (!clientPos || !odpPos || !odcPos) return null;

            const distance = haversineDistance(clientPos, odpPos);

            return (
              <>
                {/* ODP → Client */}
                <Polyline
                  key={`line-odp-client-${client.id}`}
                  positions={createSmoothArc(odpPos, clientPos)}
                  pathOptions={{
                    color: 'rgba(0, 0, 230, 0.6)',
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div>
                      <strong>ODP ➝ Client</strong><br />
                      Dari: {client.odp?.nama_odp}<br />
                      Ke: {client.nama_client}<br />
                      <span>Jarak: {distance.toFixed(2)} km</span>
                    </div>
                  </Popup>
                </Polyline>
              </>
            );
          })}


          {odps.map((odp) => {
            const odpPos = getLatLng(odp);
            const odc = odp.odc;
            const odcPos = getLatLng(odc);

            if (!odpPos || !odcPos) return null;

            const distance = haversineDistance(odcPos, odpPos);

            return (
              <Polyline
                key={`line-odc-odp-${odp.id}`}
                positions={createSmoothArc(odcPos, odpPos)}
                pathOptions={{
                  color: 'rgba(0, 0, 230, 0.6)',
                  weight: 2,
                }}
              >
                <Popup>
                  <div>
                    <strong>ODC ➝ ODP</strong><br />
                    Dari: {odc?.nama_odc || 'ODC'}<br />
                    Ke: {odp?.nama_odp}<br />
                    <span>Jarak: {distance.toFixed(2)} km</span>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* Modal Kabel */}
          {showKabelModal && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-80 shadow-lg z-[1001]">
                <h2 className="text-lg font-semibold mb-4 text-center">Pilih Jenis Kabel</h2>
                <div className="flex flex-col gap-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate('/fo-kabel-odcs/create');
                      setShowKabelModal(false);
                    }}
                  >
                    Kabel ODC
                  </button>
                  <button
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate('/fo-kabel-tube-odcs/create');
                      setShowKabelModal(false);
                    }}
                  >
                    Kabel Tube ODC
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      navigate('/fo-kabel-core-odcs/create');
                      setShowKabelModal(false);
                    }}
                  >
                    Kabel Core ODC
                  </button>
                  <button
                    className="mt-2 text-gray-600 hover:underline"
                    onClick={() => setShowKabelModal(false)}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Add */}
          {formMode && !editData && (
            <AddMarkerForm
              mode={formMode}
              onCancel={() => setFormMode(null)}
              onSave={() => {
                setFormMode(null);
                fetchData();
              }}
            />
          )}

          {/* Form Edit */}
          {editData && (
            <AddMarkerForm
              mode={editData.mode}
              initialData={editData.data}
              editingId={editData.data.id}
              onCancel={() => setEditData(null)}
              onSave={() => {
                setEditData(null);
                fetchData();
              }}
            />
          )}
        </MapContainer>
      </div>
    </Default>
  );
};

export default MappingPage;