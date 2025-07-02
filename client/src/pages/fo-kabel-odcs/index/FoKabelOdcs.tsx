// client/src/pages/fo-kabel-odcs/index/FoKabelOdcs.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2, DataTableColumns } from '$app/components/DataTable2';
import { useFoKabelOdcActions } from '../common/hooks/useFoKabelOdcActions';
import { useFoKabelOdcBulkActions } from '../common/hooks/useFoKabelOdcBulkActions';

interface FoKabelOdc {
    id: string;
    odc_id: number;
    odc: { id: number; nama_odc: string };
    nama_kabel: string;
    tipe_kabel: 'singlecore' | 'multicore';
    panjang_kabel: number;
    jumlah_tube: number;
    jumlah_core_in_tube: number;
    jumlah_total_core: number;
    status: 'active' | 'archived';
    kabel_tube_odcs?: { id: number }[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export default function FoKabelOdcs() {
    useTitle('FO Kabel ODC');

    const [t] = useTranslation();
    const pages: Page[] = [{ name: t('FO Kabel ODC'), href: '/fo-kabel-odcs' }];

    const columns: DataTableColumns<FoKabelOdc> = [
        { id: 'id', label: 'ID' },
        {
            id: 'odc',
            label: 'ODC',
            format: (_val, record) => record.odc.nama_odc,
        },
        {
            id: 'nama_kabel',
            label: 'Nama Kabel',
            format: (val, record) => (
                <a
                    href={`/fo-kabel-odcs/${record.id}/edit`}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        { id: 'tipe_kabel', label: 'Tipe Kabel' },
        {
            id: 'panjang_kabel',
            label: 'Panjang (m)',
            format: (val) => `${val}`,
        },
        { id: 'jumlah_tube', label: 'Jumlah Tube' },
        { id: 'jumlah_core_in_tube', label: 'Core per Tube' },
        { id: 'jumlah_total_core', label: 'Total Core' },
        { id: 'status', label: 'Status' },
        {
            id: 'kabel_tube_odcs',
            label: 'Tube Count',
            format: (_val, record) => `${record.kabel_tube_odcs?.length ?? 0}`,
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
        <Default title={t('FO Kabel ODC')} breadcrumbs={pages}>
            <DataTable2<FoKabelOdc>
                resource="FO Kabel ODC"
                columns={columns}
                endpoint="/api/v1/fo-kabel-odcs"
                linkToCreate="/fo-kabel-odcs/create"
                linkToEdit="/fo-kabel-odcs/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-kabel-odcs/bulk"
                customBulkActions={useFoKabelOdcBulkActions()}
                customActions={useFoKabelOdcActions()}
                withoutDefaultBulkActions={true}
            />
        </Default>
    );
}
