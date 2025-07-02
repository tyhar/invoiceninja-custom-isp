// client/src/pages/fo-kabel-tube-odcs/index/FoKabelTubeOdcs.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2, DataTableColumns } from '$app/components/DataTable2';
import { useFoKabelTubeOdcActions } from '../common/hooks/useFoKabelTubeOdcActions';
import { useFoKabelTubeOdcBulkActions } from '../common/hooks/useFoKabelTubeOdcBulkActions';

interface FoKabelTubeOdc {
    id: string;
    kabel_odc_id: number;
    kabel_odc: { id: number; nama_kabel: string };
    warna_tube:
        | 'biru'
        | 'jingga'
        | 'hijau'
        | 'coklat'
        | 'abu_abu'
        | 'putih'
        | 'merah'
        | 'hitam'
        | 'kuning'
        | 'ungu'
        | 'merah_muda'
        | 'aqua';
    status: 'active' | 'archived';
    kabel_core_odc_ids: number[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export default function FoKabelTubeOdcs() {
    useTitle('FO Kabel Tube ODC');

    const [t] = useTranslation();
    const pages: Page[] = [
        { name: t('FO Kabel Tube ODC'), href: '/fo-kabel-tube-odcs' },
    ];

    const columns: DataTableColumns<FoKabelTubeOdc> = [
        { id: 'id', label: 'ID' },
        {
            id: 'kabel_odc',
            label: 'Kabel ODC',
            format: (_val, record) => record.kabel_odc.nama_kabel,
        },
        {
            id: 'warna_tube',
            label: 'Warna Tube',
            format: (val, record) => (
                <a
                    href={`/fo-kabel-tube-odcs/${record.id}/edit`}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        { id: 'status', label: 'Status' },
        {
            id: 'kabel_core_odc_ids',
            label: 'Jumlah Core ODC',
            format: (_val, record) => `${record.kabel_core_odc_ids.length}`,
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
        <Default title={t('FO Kabel Tube ODC')} breadcrumbs={pages}>
            <DataTable2<FoKabelTubeOdc>
                resource="FO Kabel Tube ODC"
                columns={columns}
                endpoint="/api/v1/fo-kabel-tube-odcs"
                linkToCreate="/fo-kabel-tube-odcs/create"
                linkToEdit="/fo-kabel-tube-odcs/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-kabel-tube-odcs/bulk"
                customBulkActions={useFoKabelTubeOdcBulkActions()}
                customActions={useFoKabelTubeOdcActions()}
                withoutDefaultBulkActions={true}
            />
        </Default>
    );
}
