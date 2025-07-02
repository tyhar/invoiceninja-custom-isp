import { Card } from '$app/components/cards';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface FtthStat {
    id: number;
    client_count: number;
    odc_count: number;
    odp_count: number;
    kabel_odc_count: number;
    kabel_tube_odc_count: number;
    kabel_core_odc_count: number;
}

export function FtthStatistics() {
    const [t] = useTranslation();
    const [stats, setStats] = useState<FtthStat | null>(null);
    const API_BASE_URL = 'http://localhost:8000';

    useEffect(() => {
        const token = localStorage.getItem('X-API-TOKEN') ?? '';

        axios
            .get(`${API_BASE_URL}/api/v1/ftth-statistics`, {
                headers: {
                    'X-API-TOKEN': token,
                },
            })
            .then((response) => {
                setStats(response.data.data[0]);
            })
            .catch((error) => {
                console.error('Error fetching FTTH stats:', error);
            });
    }, []);

    return (
        <div className="h-[400px] relative p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">{t('Statistik FTTH')}</h2>

            {stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
                    <Card className="bg-white shadow rounded p-1" title="Jumlah Client">
                        <div className="text-center text-2xl font-bold">{stats.client_count}</div>
                    </Card>
                    <Card className="bg-white shadow rounded p-1" title="Jumlah ODC">
                        <div className="text-center text-2xl font-bold">{stats.odc_count}</div>
                    </Card>
                    <Card className="bg-white shadow rounded p-1" title="Jumlah ODP">
                        <div className="text-center text-2xl font-bold">{stats.odp_count}</div>
                    </Card>
                    <Card className="bg-white shadow rounded p-1" title="Jumlah Kabel ODC">
                        <div className="text-center text-2xl font-bold">{stats.kabel_odc_count}</div>
                    </Card>
                    <Card className="bg-white shadow rounded p-1" title="Jumlah Kabel Core ODC">
                        <div className="text-center text-2xl font-bold">{stats.kabel_core_odc_count}</div>
                    </Card>
                    <Card className="bg-white shadow rounded p-1" title="Jumlah Kabel Tube ODC">
                        <div className="text-center text-2xl font-bold">{stats.kabel_tube_odc_count}</div>
                    </Card>
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-300">Memuat data statistik...</p>
            )}
        </div>
    );
}
