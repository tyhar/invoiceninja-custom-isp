// client/src/pages/fo-lokasis/index/FoLokasis.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2, DataTableColumns } from '$app/components/DataTable2';
import { useFoLokasiBulkActions } from '../common/hooks/useFoLokasiBulkActions';
import { useFoLokasiActions } from '../common/hooks/useFoLokasiActions';

interface FoLokasi {
    id: string;
    nama_lokasi: string;
    deskripsi: string | null;
    latitude: number;
    longitude: number;
    city?: string;
    province?: string;
    country?: string;
    geocoded_at?: string;
    odcs?: { id: string; nama_odc: string }[];
    odps?: { id: string; nama_odp: string }[];
    clients?: { id: string; nama_client: string }[];
    //this
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
    // archived_at?: number;
    // is_deleted?: boolean;
    deleted_at?: string | null;
}

export default function FoLokasis() {
    useTitle('FO Lokasi');

    const [t] = useTranslation();
    const pages: Page[] = [{ name: t('FO Lokasi'), href: '/fo-lokasis' }];

    const columns: DataTableColumns<FoLokasi> = [
        {
            id: 'nama_lokasi',
            label: 'Nama Lokasi',
            format: (val, resource) => (
                <a
                    href={`/fo-lokasis/${resource.id}/edit`}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        { id: 'deskripsi', label: 'Deskripsi' },
        { id: 'latitude', label: 'Latitude' },
        { id: 'longitude', label: 'Longitude' },
        {
            id: 'odcs',
            label: 'Jumlah ODC',
            format: (_f, resource) => `${resource.odcs?.length ?? 0} ODC`,
        },
        {
            id: 'odps',
            label: 'Jumlah ODP',
            format: (_f, resource) => `${resource.odps?.length ?? 0} ODP`,
        },
        {
            id: 'clients',
            label: 'Jumlah Client',
            format: (_f, resource) => `${resource.clients?.length ?? 0} Client`,
        },
        {
            id: 'geocoding',
            label: 'Geocoding Status',
            format: (_f, resource) => {
                if (!resource.latitude || !resource.longitude) {
                    return <span className="text-gray-500">No coordinates</span>;
                }
                if (resource.geocoded_at) {
                    return <span className="text-green-600">✓ Geocoded ({resource.city || 'No city'})</span>;
                }
                return <span className="text-orange-600">⚠ Needs geocoding</span>;
            },
        },
    ];

    return (
        <Default title={t('FO Lokasi')} breadcrumbs={pages}>
            <DataTable2<FoLokasi>
                // resource="fo_lokasi"
                resource="FO Lokasi"
                columns={columns}
                endpoint="/api/v1/fo-lokasis"
                linkToCreate="/fo-lokasis/create"
                linkToEdit="/fo-lokasis/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-lokasis/bulk"
                customBulkActions={useFoLokasiBulkActions()}
                customActions={useFoLokasiActions()}
                withoutDefaultBulkActions={false}
            />
        </Default>
    );
}
