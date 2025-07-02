// client/src/pages/fo-odcs/index/FoOdcs.tsx

// import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2, DataTableColumns } from '$app/components/DataTable2';
import { useFoOdcBulkActions } from '../common/hooks/useFoOdcBulkActions';
import { useFoOdcActions } from '../common/hooks/useFoOdcActions';

interface FoOdc {
    id: string;
    lokasi_id: number;
    lokasi: { id: number; nama_lokasi: string };
    nama_odc: string;
    tipe_splitter: string;
    status: 'active' | 'archived';
    kabel_odcs?: { id: number; nama_kabel_odc: string }[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export default function FoOdcs() {
    useTitle('FO ODC');

    const [t] = useTranslation();
    const pages: Page[] = [{ name: t('FO ODC'), href: '/fo-odcs' }];

    const columns: DataTableColumns<FoOdc> = [
        { id: 'id', label: 'ID' },
        {
            id: 'lokasi',
            label: 'Lokasi',
            format: (_val, record) => record.lokasi.nama_lokasi,
        },
        {
            id: 'nama_odc',
            label: 'Nama ODC',
            format: (val, record) => (
                <a
                    href={`/fo-odcs/${record.id}/edit`}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        { id: 'tipe_splitter', label: 'Tipe Splitter' },
        { id: 'status', label: 'Status' },
        {
            id: 'kabel_odcs',
            label: 'Jumlah Kabel ODC',
            format: (_f, record) => `${record.kabel_odcs?.length ?? 0} Kabel`,
        },
        {
            id: 'created_at',
            label: 'Dibuat Pada',
            format: (val) => val,
        },
        {
            id: 'updated_at',
            label: 'Diubah Pada',
            format: (val) => val,
        },
        {
            id: 'deleted_at',
            label: 'Dihapus Pada',
            format: (val) => val || '-',
        },
    ];

    return (
        <Default title={t('FO ODC')} breadcrumbs={pages}>
            <DataTable2<FoOdc>
                resource="FO ODC"
                columns={columns}
                endpoint="/api/v1/fo-odcs"
                linkToCreate="/fo-odcs/create"
                linkToEdit="/fo-odcs/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-odcs/bulk"
                customBulkActions={useFoOdcBulkActions()}
                customActions={useFoOdcActions()}
                withoutDefaultBulkActions={true}
            />
        </Default>
    );
}
