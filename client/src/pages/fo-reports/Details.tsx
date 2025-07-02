import React, { useEffect, useState } from 'react';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards/Card';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ChevronDown, ChevronUp, Folder, Server, GitBranch, Layers, MapPin, Activity, Filter } from 'react-feather';
import { SelectField } from '$app/components/forms/SelectField';

function flattenForCSV(lokasis: any[]) {
  // Flatten nested structure for CSV export
  const rows: any[] = [];
  lokasis.forEach((lokasi) => {
    // Add Lokasi level
    rows.push({
      level: 'Lokasi',
      lokasi: lokasi.nama_lokasi,
      lokasi_deskripsi: lokasi.deskripsi,
      lokasi_lat: lokasi.latitude,
      lokasi_lng: lokasi.longitude,
      lokasi_city: lokasi.city,
      lokasi_province: lokasi.province,
      lokasi_country: lokasi.country,
      lokasi_status: lokasi.status,
      odc: '',
      odc_tipe_splitter: '',
      odc_status: '',
      kabel: '',
      kabel_tipe: '',
      kabel_panjang: '',
      kabel_status: '',
      tube: '',
      tube_warna: '',
      tube_status: '',
      core: '',
      core_warna: '',
      core_status: '',
      odp: '',
      odp_status: '',
      client: '',
      client_alamat: '',
      client_status: '',
    });

    // Add ODC level
    lokasi.odcs.forEach((odc: any) => {
      rows.push({
        level: 'ODC',
        lokasi: lokasi.nama_lokasi,
        lokasi_deskripsi: lokasi.deskripsi,
        lokasi_lat: lokasi.latitude,
        lokasi_lng: lokasi.longitude,
        lokasi_city: lokasi.city,
        lokasi_province: lokasi.province,
        lokasi_country: lokasi.country,
        lokasi_status: lokasi.status,
        odc: odc.nama_odc,
        odc_tipe_splitter: odc.tipe_splitter,
        odc_status: odc.status,
        kabel: '',
        kabel_tipe: '',
        kabel_panjang: '',
        kabel_status: '',
        tube: '',
        tube_warna: '',
        tube_status: '',
        core: '',
        core_warna: '',
        core_status: '',
        odp: '',
        odp_status: '',
        client: '',
        client_alamat: '',
        client_status: '',
      });

      // Add Kabel level
      odc.kabel_odcs.forEach((kabel: any) => {
        rows.push({
          level: 'Kabel',
          lokasi: lokasi.nama_lokasi,
          lokasi_deskripsi: lokasi.deskripsi,
          lokasi_lat: lokasi.latitude,
          lokasi_lng: lokasi.longitude,
          lokasi_city: lokasi.city,
          lokasi_province: lokasi.province,
          lokasi_country: lokasi.country,
          lokasi_status: lokasi.status,
          odc: odc.nama_odc,
          odc_tipe_splitter: odc.tipe_splitter,
          odc_status: odc.status,
          kabel: kabel.nama_kabel,
          kabel_tipe: kabel.tipe_kabel,
          kabel_panjang: kabel.panjang_kabel,
          kabel_status: kabel.status,
          tube: '',
          tube_warna: '',
          tube_status: '',
          core: '',
          core_warna: '',
          core_status: '',
          odp: '',
          odp_status: '',
          client: '',
          client_alamat: '',
          client_status: '',
        });

        // Add Tube level
        kabel.kabel_tube_odcs.forEach((tube: any) => {
          rows.push({
            level: 'Tube',
            lokasi: lokasi.nama_lokasi,
            lokasi_deskripsi: lokasi.deskripsi,
            lokasi_lat: lokasi.latitude,
            lokasi_lng: lokasi.longitude,
            lokasi_city: lokasi.city,
            lokasi_province: lokasi.province,
            lokasi_country: lokasi.country,
            lokasi_status: lokasi.status,
            odc: odc.nama_odc,
            odc_tipe_splitter: odc.tipe_splitter,
            odc_status: odc.status,
            kabel: kabel.nama_kabel,
            kabel_tipe: kabel.tipe_kabel,
            kabel_panjang: kabel.panjang_kabel,
            kabel_status: kabel.status,
            tube: tube.warna_tube,
            tube_warna: tube.warna_tube,
            tube_status: tube.status,
            core: '',
            core_warna: '',
            core_status: '',
            odp: '',
            odp_status: '',
            client: '',
            client_alamat: '',
            client_status: '',
          });

          // Add Core level
          tube.kabel_core_odcs.forEach((core: any) => {
            rows.push({
              level: 'Core',
              lokasi: lokasi.nama_lokasi,
              lokasi_deskripsi: lokasi.deskripsi,
              lokasi_lat: lokasi.latitude,
              lokasi_lng: lokasi.longitude,
              lokasi_city: lokasi.city,
              lokasi_province: lokasi.province,
              lokasi_country: lokasi.country,
              lokasi_status: lokasi.status,
              odc: odc.nama_odc,
              odc_tipe_splitter: odc.tipe_splitter,
              odc_status: odc.status,
              kabel: kabel.nama_kabel,
              kabel_tipe: kabel.tipe_kabel,
              kabel_panjang: kabel.panjang_kabel,
              kabel_status: kabel.status,
              tube: tube.warna_tube,
              tube_warna: tube.warna_tube,
              tube_status: tube.status,
              core: core.warna_core,
              core_warna: core.warna_core,
              core_status: core.status,
              odp: core.odp?.nama_odp || '',
              odp_status: core.odp?.status || '',
              client: core.odp?.client_ftth?.nama_client || '',
              client_alamat: core.odp?.client_ftth?.alamat || '',
              client_status: core.odp?.client_ftth?.status || '',
            });
          });
        });
      });
    });

    // Add standalone ODPs
    lokasi.odps.forEach((odp: any) => {
      rows.push({
        level: 'ODP',
        lokasi: lokasi.nama_lokasi,
        lokasi_deskripsi: lokasi.deskripsi,
        lokasi_lat: lokasi.latitude,
        lokasi_lng: lokasi.longitude,
        lokasi_city: lokasi.city,
        lokasi_province: lokasi.province,
        lokasi_country: lokasi.country,
        lokasi_status: lokasi.status,
        odc: '',
        odc_tipe_splitter: '',
        odc_status: '',
        kabel: '',
        kabel_tipe: '',
        kabel_panjang: '',
        kabel_status: '',
        tube: '',
        tube_warna: '',
        tube_status: '',
        core: '',
        core_warna: '',
        core_status: '',
        odp: odp.nama_odp,
        odp_status: odp.status,
        client: odp.client_ftth?.nama_client || '',
        client_alamat: odp.client_ftth?.alamat || '',
        client_status: odp.client_ftth?.status || '',
      });
    });

    // Add standalone Client FTTHs
    lokasi.client_ftths.forEach((client: any) => {
      rows.push({
        level: 'Client FTTH',
        lokasi: lokasi.nama_lokasi,
        lokasi_deskripsi: lokasi.deskripsi,
        lokasi_lat: lokasi.latitude,
        lokasi_lng: lokasi.longitude,
        lokasi_city: lokasi.city,
        lokasi_province: lokasi.province,
        lokasi_country: lokasi.country,
        lokasi_status: lokasi.status,
        odc: '',
        odc_tipe_splitter: '',
        odc_status: '',
        kabel: '',
        kabel_tipe: '',
        kabel_panjang: '',
        kabel_status: '',
        tube: '',
        tube_warna: '',
        tube_status: '',
        core: '',
        core_warna: '',
        core_status: '',
        odp: client.odp?.nama_odp || '',
        odp_status: client.odp?.status || '',
        client: client.nama_client,
        client_alamat: client.alamat,
        client_status: client.status,
      });
    });
  });
  return rows;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'deleted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      <Activity size={12} className="mr-1.5" />
      {status}
    </span>
  );
}

// Location card component
function LocationCard({ lokasi }: { lokasi: any }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  return (
    <Card className="mb-6">
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-lg">
              <Folder size={22} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{lokasi.nama_lokasi}</h3>
              <p className="text-sm text-gray-600">{lokasi.deskripsi}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={lokasi.status} />
            <button
              type="button"
              onClick={handleExpandClick}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{lokasi.odcs?.length || 0}</div>
            <div className="text-sm text-gray-600">ODCs</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{lokasi.odps?.length || 0}</div>
            <div className="text-sm text-gray-600">ODPs</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{lokasi.client_ftths?.length || 0}</div>
            <div className="text-sm text-gray-600">Clients</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {lokasi.odcs?.reduce((sum: number, odc: any) => sum + (odc.kabel_odcs?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Kabel</div>
          </div>
        </div>

        {/* Location details */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPin size={16} />
          <span>Lat: {lokasi.latitude}, Lng: {lokasi.longitude}</span>
          {lokasi.city && (
            <span className="text-blue-600">• {lokasi.city}</span>
          )}
          {lokasi.province && (
            <span className="text-green-600">• {lokasi.province}</span>
          )}
          {lokasi.country && (
            <span className="text-purple-600">• {lokasi.country}</span>
          )}
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t pt-4 space-y-4">
            {/* ODCs */}
            {lokasi.odcs?.map((odc: any, idx: number) => (
              <OdcCard key={odc.id || idx} odc={odc} />
            ))}

            {/* Standalone ODPs */}
            {lokasi.odps?.map((odp: any, idx: number) => (
              <OdpCard key={odp.id || idx} odp={odp} />
            ))}

            {/* Standalone Clients */}
            {lokasi.client_ftths?.map((client: any, idx: number) => (
              <ClientCard key={client.id || idx} client={client} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ODC card component
function OdcCard({ odc }: { odc: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ml-6 border-l-2 border-green-200 pl-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded">
            <Server size={18} className="text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{odc.nama_odc}</h4>
            <p className="text-sm text-gray-600">Splitter: {odc.tipe_splitter}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={odc.status} />
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3">
          {odc.kabel_odcs?.map((kabel: any, idx: number) => (
            <KabelCard key={kabel.id || idx} kabel={kabel} />
          ))}
        </div>
      )}
    </div>
  );
}

// Kabel card component
function KabelCard({ kabel }: { kabel: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ml-4 border-l-2 border-yellow-200 pl-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded">
            <GitBranch size={18} className="text-yellow-600" />
          </div>
          <div>
            <h6 className="font-medium text-gray-900">Kabel {kabel.nama_kabel}</h6>
            <p className="text-sm text-gray-600">{kabel.kabel_tube_odcs?.length || 0} tubes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={kabel.status} />
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3">
          {kabel.kabel_tube_odcs?.map((tube: any, idx: number) => (
            <TubeCard key={tube.id || idx} tube={tube} />
          ))}
        </div>
      )}
    </div>
  );
}

// Tube card component
function TubeCard({ tube }: { tube: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ml-6 border-l-2 border-orange-200 pl-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded">
            <Layers size={18} className="text-orange-600" />
          </div>
          <div>
            <h6 className="font-medium text-gray-900">Tube {tube.warna_tube}</h6>
            <p className="text-sm text-gray-600">{tube.kabel_core_odcs?.length || 0} cores</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={tube.status} />
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3">
          {tube.kabel_core_odcs?.map((core: any, idx: number) => (
            <CoreCard key={core.id || idx} core={core} />
          ))}
        </div>
      )}
    </div>
  );
}

// Core card component
function CoreCard({ core }: { core: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="ml-8 border-l-2 border-gray-200 pl-4 py-2">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center p-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Core {core.warna_core}</h4>
              <p className="text-sm text-gray-500">ID: {core.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={core.status} />
            {core.odp && (
              <button
                onClick={handleExpandClick}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {core.odp && isExpanded && (
          <div className="border-t border-gray-100 p-3">
            <OdpCard odp={core.odp} />
          </div>
        )}
      </div>
    </div>
  );
}

// ODP card component
function OdpCard({ odp }: { odp: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center p-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          <div>
            <h5 className="font-medium text-gray-900">ODP {odp.nama_odp}</h5>
            <p className="text-sm text-gray-500">ID: {odp.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={odp.status} />
          {odp.client_ftth && (
            <button
              onClick={handleExpandClick}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {odp.client_ftth && isExpanded && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <ClientCard client={odp.client_ftth} />
        </div>
      )}
    </div>
  );
}

// Client card component
function ClientCard({ client }: { client: any }) {
  return (
    <div className="bg-green-50 rounded-lg border border-green-200 p-3">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center p-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div>
          <h6 className="font-medium text-gray-900">{client.nama_client}</h6>
          <p className="text-sm text-gray-500">{client.alamat}</p>
          {client.client && (
            <p className="text-xs text-gray-400">
              Client: {client.client.name} • {client.client.phone}
            </p>
          )}
        </div>
        <StatusBadge status={client.status} />
      </div>
    </div>
  );
}

export default function Details() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lokasis, setLokasis] = useState<any[]>([]);
  const [filteredLokasis, setFilteredLokasis] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [groupBy, setGroupBy] = useState<'location' | 'city' | 'province' | 'country'>('location');

    // Get unique values for filters - only compute after data is loaded
  const countries = React.useMemo(() => {
    const result = [...new Set(lokasis.map(l => l.country).filter(Boolean))].sort();
    console.log('Countries found:', result);
    return result;
  }, [lokasis]);

  const provinces = React.useMemo(() => {
    // Filter provinces based on selected country
    let filteredLokasis = lokasis;
    if (selectedCountry) {
      filteredLokasis = lokasis.filter(l => l.country === selectedCountry);
    }
    const result = [...new Set(filteredLokasis.map(l => l.province).filter(Boolean))].sort();
    console.log('Provinces found for country', selectedCountry, ':', result);
    return result;
  }, [lokasis, selectedCountry]);

  const cities = React.useMemo(() => {
    // Filter cities based on selected country and province
    let filteredLokasis = lokasis;
    if (selectedCountry) {
      filteredLokasis = filteredLokasis.filter(l => l.country === selectedCountry);
    }
    if (selectedProvince) {
      filteredLokasis = filteredLokasis.filter(l => l.province === selectedProvince);
    }
    const result = [...new Set(filteredLokasis.map(l => l.city).filter(Boolean))].sort();
    console.log('Cities found for country', selectedCountry, 'province', selectedProvince, ':', result);
    return result;
  }, [lokasis, selectedCountry, selectedProvince]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    request('GET', endpoint('/api/v1/ftth-statistics'))
      .then((response) => {
        console.log('FTTH Statistics Response:', response.data.data.detailed);
        setLokasis(response.data.data.detailed);
      })
      .catch((error) => {
        console.error('Error loading FTTH details:', error);
        setError('Failed to load FTTH details.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter data based on selected filters
  useEffect(() => {
    let filtered = lokasis;

    if (selectedCountry) {
      filtered = filtered.filter(l => l.country === selectedCountry);
    }
    if (selectedProvince) {
      filtered = filtered.filter(l => l.province === selectedProvince);
    }
    if (selectedCity) {
      filtered = filtered.filter(l => l.city === selectedCity);
    }

    setFilteredLokasis(filtered);
  }, [lokasis, selectedCountry, selectedProvince, selectedCity]);

  // Group data based on selected grouping
  const groupedData = React.useMemo(() => {
    interface GroupData {
      key: string;
      title: string;
      subtitle: string;
      data: any[];
    }

    if (groupBy === 'location') {
      return filteredLokasis.map(lokasi => ({
        key: lokasi.nama_lokasi,
        title: lokasi.nama_lokasi,
        subtitle: lokasi.deskripsi,
        data: [lokasi]
      })) as GroupData[];
    } else if (groupBy === 'city') {
      const grouped = filteredLokasis.reduce((acc, lokasi) => {
        const city = lokasi.city || 'Unknown City';
        if (!acc[city]) {
          acc[city] = {
            key: city,
            title: city,
            subtitle: `${lokasi.province || 'Unknown Province'}, ${lokasi.country || 'Unknown Country'}`,
            data: []
          };
        }
        acc[city].data.push(lokasi);
        return acc;
      }, {} as Record<string, GroupData>);
      return Object.values(grouped);
    } else if (groupBy === 'province') {
      const grouped = filteredLokasis.reduce((acc, lokasi) => {
        const province = lokasi.province || 'Unknown Province';
        if (!acc[province]) {
          acc[province] = {
            key: province,
            title: province,
            subtitle: lokasi.country || 'Unknown Country',
            data: []
          };
        }
        acc[province].data.push(lokasi);
        return acc;
      }, {} as Record<string, GroupData>);
      return Object.values(grouped);
    } else if (groupBy === 'country') {
      const grouped = filteredLokasis.reduce((acc, lokasi) => {
        const country = lokasi.country || 'Unknown Country';
        if (!acc[country]) {
          acc[country] = {
            key: country,
            title: country,
            subtitle: `${acc[country]?.data?.length || 0} locations`,
            data: []
          };
        }
        acc[country].data.push(lokasi);
        return acc;
      }, {} as Record<string, GroupData>);
      return Object.values(grouped);
    }
    return [] as GroupData[];
  }, [filteredLokasis, groupBy]);

  const handleExportCSV = () => {
    const csv = Papa.unparse(flattenForCSV(filteredLokasis));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ftth-details.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const input = document.getElementById('ftth-details-dashboard');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape' });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('ftth-details.pdf');
  };

  const clearFilters = () => {
    setSelectedCountry('');
    setSelectedProvince('');
    setSelectedCity('');
  };

  // Reset dependent filters when parent filter changes
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedProvince(''); // Reset province when country changes
    setSelectedCity(''); // Reset city when country changes
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedCity(''); // Reset city when province changes
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FTTH Infrastructure Details</h1>
          <p className="text-gray-600 mt-1">Complete overview of all fiber optic infrastructure components</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Geographic Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Geographic Filters</h3>
          </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <SelectField
                value={groupBy}
                onValueChange={(value) => setGroupBy(value as any)}
              >
                <option value="location">By Location</option>
                <option value="city">By City</option>
                <option value="province">By Province</option>
                <option value="country">By Country</option>
              </SelectField>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <SelectField
                value={selectedCountry}
                onValueChange={handleCountryChange}
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </SelectField>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province
                {!selectedCountry && (
                  <span className="text-xs text-gray-500 ml-1">(Select country first)</span>
                )}
              </label>
              <SelectField
                value={selectedProvince}
                onValueChange={handleProvinceChange}
                disabled={!selectedCountry}
              >
                <option value="">
                  {selectedCountry ? 'All Provinces' : 'Select country first'}
                </option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </SelectField>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
                {!selectedProvince && (
                  <span className="text-xs text-gray-500 ml-1">(Select province first)</span>
                )}
              </label>
              <SelectField
                value={selectedCity}
                onValueChange={setSelectedCity}
                disabled={!selectedProvince}
              >
                <option value="">
                  {selectedProvince ? 'All Cities' : 'Select province first'}
                </option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </SelectField>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {filteredLokasis.length} of {lokasis.length} locations
            </div>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      <div id="ftth-details-dashboard">
        <div className="space-y-6">
          {groupedData.map((group: any, idx) => (
            <div key={group.key || idx} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                <p className="text-sm text-gray-600">{group.subtitle}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {group.data.length} location{group.data.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {group.data.map((lokasi: any, lokasiIdx: number) => (
                    <LocationCard key={lokasi.id || lokasiIdx} lokasi={lokasi} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
