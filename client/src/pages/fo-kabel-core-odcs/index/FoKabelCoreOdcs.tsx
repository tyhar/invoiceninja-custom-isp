// client/src/pages/fo-kabel-core-odcs/index/FoKabelCoreOdcs.tsx

import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2, DataTableColumns } from '$app/components/DataTable2';
import { useFoKabelCoreOdcActions } from '../common/hooks/useFoKabelCoreOdcActions';
import { useFoKabelCoreOdcBulkActions } from '../common/hooks/useFoKabelCoreOdcBulkActions';

interface FoKabelCoreOdc {
    id: string;
    kabel_tube_odc_id: number;
    kabel_tube_odc: {
        id: number;
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
    };
    kabel_odc: {
        id: number;
        nama_kabel: string;
    };
    warna_core:
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
    odp_ids: number[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export default function FoKabelCoreOdcs() {
    useTitle('FO Kabel Core ODC');

    const [t] = useTranslation();
    const pages: Page[] = [
        { name: t('FO Kabel Core ODC'), href: '/fo-kabel-core-odcs' },
    ];

    const columns: DataTableColumns<FoKabelCoreOdc> = [
        { id: 'id', label: 'ID' },
        {
            id: 'kabel_odc',
            label: 'Kabel ODC',
            format: (_val, rec) => rec.kabel_odc.nama_kabel,
        },
        {
            id: 'kabel_tube_odc',
            label: 'Warna Tube',
            format: (_val, rec) => rec.kabel_tube_odc.warna_tube,
        },
        { id: 'warna_core', label: 'Warna Core' },
        { id: 'status', label: 'Status' },
        {
            id: 'odp_ids',
            label: 'Jumlah ODP',
            format: (_val, rec) => `${rec.odp_ids.length}`,
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
        <Default title={t('FO Kabel Core ODC')} breadcrumbs={pages}>
            <DataTable2<FoKabelCoreOdc>
                resource="FO Kabel Core ODC"
                columns={columns}
                endpoint="/api/v1/fo-kabel-core-odcs"
                linkToCreate="/fo-kabel-core-odcs/create"
                linkToEdit="/fo-kabel-core-odcs/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-kabel-core-odcs/bulk"
                customBulkActions={useFoKabelCoreOdcBulkActions()}
                customActions={useFoKabelCoreOdcActions()}
                withoutDefaultBulkActions={true}
            />
        </Default>
    );
}
