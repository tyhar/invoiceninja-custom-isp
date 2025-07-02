import React from 'react';
import { useTranslation } from 'react-i18next';
import { date } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export interface FoClientFtth {
    id: string;
    nama_client: string | null;
    lokasi: {
        id: string;
        nama_lokasi: string;
        deskripsi: string | null;
        latitude: number | null;
        longitude: number | null;
        status: string;
        created_at: string | null;
        updated_at: string | null;
        deleted_at: string | null;
    } | null;
    odp: {
        id: string;
        nama_odp: string;
        status: string;
        created_at: string | null;
        updated_at: string | null;
        deleted_at: string | null;
        kabel_core_odc: {
            id: string;
            warna_core: string;
            status: string;
            created_at: string | null;
            updated_at: string | null;
            deleted_at: string | null;
            kabel_tube_odc: {
                id: string;
                warna_tube: string;
                status: string;
                created_at: string | null;
                updated_at: string | null;
                deleted_at: string | null;
            } | null;
            kabel_odc: {
                id: string;
                nama_kabel: string;
                tipe_kabel: string;
                panjang_kabel: number;
                jumlah_tube: number;
                jumlah_core_in_tube: number;
                jumlah_total_core: number;
                status: string;
                created_at: string | null;
                updated_at: string | null;
                deleted_at: string | null;
            } | null;
        } | null;
    } | null;
    odc: {
        id: string;
        nama_odc: string;
        tipe_splitter: string;
        status: string;
        created_at: string | null;
        updated_at: string | null;
        deleted_at: string | null;
        lokasi: {
            id: string;
            nama_lokasi: string;
            deskripsi: string | null;
            latitude: number | null;
            longitude: number | null;
            status: string;
        } | null;
        kabel_odcs: Array<{
            id: string;
            nama_kabel: string;
            tipe_kabel: string;
            panjang_kabel: number;
            jumlah_tube: number;
            jumlah_core_in_tube: number;
            jumlah_total_core: number;
            status: string;
            created_at: string | null;
            updated_at: string | null;
            deleted_at: string | null;
            kabel_tube_odcs: Array<{
                id: string;
                warna_tube: string;
                status: string;
                created_at: string | null;
                updated_at: string | null;
                deleted_at: string | null;
                kabel_core_odcs: Array<{
                    id: string;
                    warna_core: string;
                    status: string;
                    created_at: string | null;
                    updated_at: string | null;
                    deleted_at: string | null;
                    odp: {
                        id: string;
                        nama_odp: string;
                        status: string;
                        created_at: string | null;
                        updated_at: string | null;
                        deleted_at: string | null;
                        client_ftth: {
                            id: string;
                            nama_client: string;
                            alamat: string | null;
                            status: string;
                            created_at: string | null;
                            updated_at: string | null;
                            deleted_at: string | null;
                            lokasi: {
                                id: string;
                                nama_lokasi: string;
                                deskripsi: string | null;
                                latitude: number | null;
                                longitude: number | null;
                                status: string;
                            } | null;
                            client: {
                                id: string;
                                name: string;
                                phone: string | null;
                                email: string | null;
                                address1: string | null;
                                address2: string | null;
                                city: string | null;
                                state: string | null;
                                postal_code: string | null;
                                country_id: number | null;
                                status_id: number;
                            } | null;
                            company: {
                                id: string;
                                name: string;
                                settings: any;
                            } | null;
                        } | null;
                    } | null;
                }>;
            }>;
        }>;
    } | null;
    client: {
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        address1: string | null;
        address2: string | null;
        city: string | null;
        state: string | null;
        postal_code: string | null;
        country_id: number | null;
        status_id: number;
    } | null;
    company: {
        id: string;
        name: string;
        settings: any;
    } | null;
    alamat: string | null;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export const defaultColumns: string[] = [
    'nama_client',
    'lokasi',
    'lokasi_coordinates',
    'odp',
    'odp_core_tube',
    'odc',
    'odc_location',
    'client',
    'client_contact',
    'company',
    'alamat',
    'status',
    'created_at',
    'updated_at',
    'deleted_at',
];

export function useAllFoClientFtthColumns(): readonly string[] {
    return defaultColumns;
}

export function useFoClientFtthColumns() {
    const { t } = useTranslation();
    const { dateFormat } = useCurrentCompanyDateFormats();
    const reactSettings = useReactSettings();

    const columns = [
        {
            column: 'nama_client',
            id: 'nama_client',
            label: t('nama_client'),
            format: (val: string | number, ftth: FoClientFtth) => (
                <a
                    href={`/fo-client-ftths/${ftth.id}/edit`}
                    className="text-blue-600 hover:underline"
                >
                    {val ?? '-'}
                </a>
            ),
        },
        {
            column: 'lokasi',
            id: 'lokasi',
            label: t('lokasi'),
            format: (_val: string | number, ftth: FoClientFtth) => (
                <div>
                    <div className="font-medium">{ftth.lokasi?.nama_lokasi ?? '-'}</div>
                    {ftth.lokasi?.deskripsi && (
                        <div className="text-sm text-gray-500">{ftth.lokasi.deskripsi}</div>
                    )}
                </div>
            ),
        },
        {
            column: 'lokasi_coordinates',
            id: 'lokasi_coordinates',
            label: t('coordinates'),
            format: (_val: string | number, ftth: FoClientFtth) => {
                if (ftth.lokasi?.latitude && ftth.lokasi?.longitude) {
                    return (
                        <div className="text-sm">
                            <div>{ftth.lokasi.latitude.toFixed(6)}</div>
                            <div>{ftth.lokasi.longitude.toFixed(6)}</div>
                        </div>
                    );
                }
                return '-';
            },
        },
        {
            column: 'odp',
            id: 'odp',
            label: t('odp'),
            format: (_val: string | number, ftth: FoClientFtth) => (
                <div>
                    <div className="font-medium">{ftth.odp?.nama_odp ?? '-'}</div>
                    {ftth.odp?.status && (
                        <span className={`text-xs px-2 py-1 rounded ${
                            ftth.odp.status === 'active' ? 'bg-green-100 text-green-800' :
                            ftth.odp.status === 'archived' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {t(ftth.odp.status)}
                        </span>
                    )}
                </div>
            ),
        },
        {
            column: 'odp_core_tube',
            id: 'odp_core_tube',
            label: t('core_tube'),
            format: (_val: string | number, ftth: FoClientFtth) => {
                const core = ftth.odp?.kabel_core_odc;
                const tube = core?.kabel_tube_odc;
                const kabel = core?.kabel_odc;

                if (core && tube && kabel) {
                    return (
                        <div className="text-sm">
                            <div>Core: {core.warna_core}</div>
                            <div>Tube: {tube.warna_tube}</div>
                            <div>Kabel: {kabel.nama_kabel}</div>
                            <div className="text-xs text-gray-500">
                                {kabel.panjang_kabel}m, {kabel.jumlah_tube} tubes
                            </div>
                        </div>
                    );
                }
                return '-';
            },
        },
        {
            column: 'odc',
            id: 'odc',
            label: t('odc'),
            format: (_val: string | number, ftth: FoClientFtth) => (
                <div>
                    <div className="font-medium">{ftth.odc?.nama_odc ?? '-'}</div>
                    {ftth.odc?.tipe_splitter && (
                        <div className="text-sm text-gray-500">{ftth.odc.tipe_splitter}</div>
                    )}
                    {ftth.odc?.status && (
                        <span className={`text-xs px-2 py-1 rounded ${
                            ftth.odc.status === 'active' ? 'bg-green-100 text-green-800' :
                            ftth.odc.status === 'archived' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {t(ftth.odc.status)}
                        </span>
                    )}
                </div>
            ),
        },
        {
            column: 'odc_location',
            id: 'odc_location',
            label: t('odc_location'),
            format: (_val: string | number, ftth: FoClientFtth) => {
                if (ftth.odc?.lokasi) {
                    return (
                        <div className="text-sm">
                            <div className="font-medium">{ftth.odc.lokasi.nama_lokasi}</div>
                            {ftth.odc.lokasi.latitude && ftth.odc.lokasi.longitude && (
                                <div className="text-xs text-gray-500">
                                    {ftth.odc.lokasi.latitude.toFixed(6)}, {ftth.odc.lokasi.longitude.toFixed(6)}
                                </div>
                            )}
                        </div>
                    );
                }
                return '-';
            },
        },
        {
            column: 'client',
            id: 'client',
            label: t('client'),
            format: (_val: string | number, ftth: FoClientFtth) => (
                <div>
                    <div className="font-medium">{ftth.client?.name ?? '-'}</div>
                    {ftth.client?.email && (
                        <div className="text-sm text-gray-500">{ftth.client.email}</div>
                    )}
                </div>
            ),
        },
        {
            column: 'client_contact',
            id: 'client_contact',
            label: t('contact'),
            format: (_val: string | number, ftth: FoClientFtth) => {
                if (ftth.client?.phone || ftth.client?.email) {
                    return (
                        <div className="text-sm">
                            {ftth.client.phone && <div>{ftth.client.phone}</div>}
                            {ftth.client.email && <div className="text-gray-500">{ftth.client.email}</div>}
                        </div>
                    );
                }
                return '-';
            },
        },
        {
            column: 'company',
            id: 'company',
            label: t('company'),
            format: (_val: string | number, ftth: FoClientFtth) => ftth.company?.name ?? '-',
        },
        {
            column: 'alamat',
            id: 'alamat',
            label: t('alamat'),
            format: (val: string | number) => val ?? '-',
        },
        {
            column: 'status',
            id: 'status',
            label: t('status'),
            format: (val: string | number) => (
                <span className={`px-2 py-1 rounded text-xs ${
                    val === 'active' ? 'bg-green-100 text-green-800' :
                    val === 'archived' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {t(val as string)}
                </span>
            ),
        },
        {
            column: 'created_at',
            id: 'created_at',
            label: t('created_at'),
            format: (val: string | number) => date(val as string, dateFormat),
        },
        {
            column: 'updated_at',
            id: 'updated_at',
            label: t('updated_at'),
            format: (val: string | number) => date(val as string, dateFormat),
        },
        {
            column: 'deleted_at',
            id: 'deleted_at',
            label: t('deleted_at'),
            format: (val: string | number) => (val ? date(val as string, dateFormat) : '-'),
        },
    ];

    const list: string[] =
        (reactSettings?.react_table_columns as any)?.['fo_client_ftth'] || defaultColumns;

    return columns
        .filter((col) => list.includes(col.column))
        .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
