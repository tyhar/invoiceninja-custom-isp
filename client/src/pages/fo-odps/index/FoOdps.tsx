// client/src/pages/fo-odps/index/FoOdps.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2, DataTableColumns } from '$app/components/DataTable2';
import { useFoOdpActions } from '../common/hooks/useFoOdpActions';
import { useFoOdpBulkActions } from '../common/hooks/useFoOdpBulkActions';

interface FoOdp {
    id: string;
    nama_odp: string;
    lokasi: { id: number; nama_lokasi: string };
    odc?: { id: number; nama_odc: string };
    kabel_core_odc?: {
        id: number;
        warna_core: string;
        kabel_odc?: { id: number; nama_kabel: string };
        kabel_tube_odc?: { id: number; warna_tube: string };
    };
    client_ftth: { id: number; nama_client: string } | null;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export default function FoOdps() {
    useTitle('FO ODP');
    const [t] = useTranslation();
    const pages: Page[] = [{ name: t('FO ODP'), href: '/fo-odps' }];

    const columns: DataTableColumns<FoOdp> = [
        { id: 'string', label: 'ID' },
        {
            id: 'lokasi',
            label: t('lokasi'),
            format: (_v, r) => r.lokasi.nama_lokasi,
        },
        {
            id: 'nama_odp',
            label: t('nama_odp'),
            format: (val, r) => (
                <a
                    href={`/fo-odps/${r.id}/edit`}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        {
            id: 'odc',
            label: t('odc'),
            format: (_v, r) => r.odc?.nama_odc ?? '-',
        },
        {
            id: 'kabel_odc',
            label: t('kabel_odc'),
            format: (_v, r) => r.kabel_core_odc?.kabel_odc?.nama_kabel ?? '-',
        },
        {
            id: 'kabel_tube_odc',
            label: t('kabel_tube_odc'),
            format: (_v, r) =>
                r.kabel_core_odc?.kabel_tube_odc?.warna_tube ?? '-',
        },
        {
            id: 'kabel_core_odc',
            label: t('kabel_core_odc'),
            format: (_v, r) => r.kabel_core_odc?.warna_core ?? '-',
        },
        {
            id: 'client_ftth',
            label: t('client_ftth'),
            format: (_v, r) => r.client_ftth?.nama_client ?? '-',
        },
        { id: 'status', label: t('status') },
        {
            id: 'created_at',
            label: t('created_at'),
            format: (v) => v,
        },
        {
            id: 'updated_at',
            label: t('updated_at'),
            format: (v) => v,
        },
        {
            id: 'deleted_at',
            label: t('deleted_at'),
            format: (v) => v ?? '-',
        },
    ];

    return (
        <Default title={t('FO ODP')} breadcrumbs={pages}>
            <DataTable2<FoOdp>
                resource="fo-odps"
                columns={columns}
                endpoint="/api/v1/fo-odps"
                linkToCreate="/fo-odps/create"
                linkToEdit="/fo-odps/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-odps/bulk"
                customBulkActions={useFoOdpBulkActions()}
                customActions={useFoOdpActions()}
                withoutDefaultBulkActions={true}
            />
        </Default>
    );
}
