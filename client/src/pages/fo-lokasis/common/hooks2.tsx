/**
 * File: client/src/pages/fo-lokasis/common/hooks2.tsx
 *
 * Hook dan definisi kolom/aksi untuk FO Lokasi.
 */

import React from 'react';
import { EntityState } from '$app/common/enums/entity-state';
import { date, getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
// import { Divider } from '$app/components/cards/Divider';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

/**
 * Tipe FoLokasi (sesuai respons API).
 */
export interface FoLokasi {
    id: string;
    nama_lokasi: string;
    deskripsi?: string;
    latitude: number;
    longitude: number;
    status: 'active' | 'archived' | string;
    odcs: Array<{ id: string; nama_odc: string }>;
    odps: Array<{ id: string; nama_odp: string }>;
    clients: Array<{ id: string; nama_client: string }>;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

/**
 * Kolom default yang tampil pertama kali (urutan).
 */
export const defaultColumns: string[] = [
    'nama_lokasi',
    'deskripsi',
    'status',
    'created_at',
];

/**
 * Semua kolom yang tersedia (untuk DataTableColumnsPicker).
 */
export function useAllFoLokasiColumns(): readonly string[] {
    return [
        'nama_lokasi',
        'deskripsi',
        'latitude',
        'longitude',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
    ] as const;
}

/**
 * Kolom yang dirender di tabel (format, label, id).
 */
export function useFoLokasiColumns() {
    const { t } = useTranslation();
    const { dateFormat } = useCurrentCompanyDateFormats();
    const reactSettings = useReactSettings();
    // const navigate = useNavigate();

    const columns: Array<{
        column: string;
        id: string;
        label: string;
        format?: (field: any, resource: FoLokasi) => React.ReactNode;
    }> = [
        {
            column: 'nama_lokasi',
            id: 'nama_lokasi',
            label: t('nama_lokasi'),
            format: (value: string, lokasi: FoLokasi) => (
                <a
                    href={route('/fo-lokasis/:id/edit', { id: lokasi.id })}
                    className="text-blue-600 hover:underline"
                >
                    {value}
                </a>
            ),
        },
        {
            column: 'deskripsi',
            id: 'deskripsi',
            label: t('deskripsi'),
            format: (value: string) => <span>{value || '-'}</span>,
        },
        {
            column: 'latitude',
            id: 'latitude',
            label: t('latitude'),
            format: (value: number) => value.toFixed(7),
        },
        {
            column: 'longitude',
            id: 'longitude',
            label: t('longitude'),
            format: (value: number) => value.toFixed(7),
        },
        {
            column: 'status',
            id: 'status',
            label: t('status'),
            format: (value: string) => (
                <span
                    className={
                        value === 'active'
                            ? 'text-green-600'
                            : value === 'archived'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                    }
                >
                    {t(value)}
                </span>
            ),
        },
        {
            column: 'created_at',
            id: 'created_at',
            label: t('created_at'),
            format: (value: string) => date(value, dateFormat),
        },
        {
            column: 'updated_at',
            id: 'updated_at',
            label: t('updated_at'),
            format: (value: string) => date(value, dateFormat),
        },
        {
            column: 'deleted_at',
            id: 'deleted_at',
            label: t('deleted_at'),
            format: (value: string) => (value ? date(value, dateFormat) : '-'),
        },
    ];

    // Ambil urutan kolom dari React settings, fallback ke defaultColumns
    const list: string[] =
        reactSettings?.react_table_columns?.['fo_lokasi'] || defaultColumns;

    return columns
        .filter((col) => list.includes(col.column))
        .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

/**
 * Row actions: Edit, Archive, Restore, Delete (soft-delete).
 */
export function useFoLokasiActions() {
    const [t] = useTranslation();
    const navigate = useNavigate();

    const handleAction = async (
        action: 'archive' | 'restore' | 'delete',
        id: string
    ) => {
        let url = '';
        let method: 'PATCH' | 'DELETE' = 'PATCH';

        switch (action) {
            case 'archive':
                url = route('/api/v1/fo-lokasis/:id/archive', { id });
                break;
            case 'restore':
                url = route('/api/v1/fo-lokasis/:id/restore', { id });
                break;
            case 'delete':
                method = 'DELETE';
                url = route('/api/v1/fo-lokasis/:id', { id });
                break;
        }

        toast.processing();

        try {
            await fetch(url, { method });
            toast.success(`${action}d_fo_lokasi`);
            $refetch(['fo-lokasis']);
        } catch {
            toast.error('error_action');
        }
    };

    const actions = [
        (lokasi: FoLokasi) => (
            <DropdownElement
                key="edit"
                onClick={() =>
                    navigate(route('/fo-lokasis/:id/edit', { id: lokasi.id }))
                }
                icon={<Icon element={MdEdit} />}
            >
                {t('edit')}
            </DropdownElement>
        ),
        (lokasi: FoLokasi) =>
            getEntityState(lokasi) === EntityState.Active && (
                <DropdownElement
                    key="archive"
                    onClick={() => handleAction('archive', lokasi.id)}
                    icon={<Icon element={MdArchive} />}
                >
                    {t('archive')}
                </DropdownElement>
            ),
        (lokasi: FoLokasi) =>
            getEntityState(lokasi) === EntityState.Archived && (
                <DropdownElement
                    key="restore"
                    onClick={() => handleAction('restore', lokasi.id)}
                    icon={<Icon element={MdRestore} />}
                >
                    {t('restore')}
                </DropdownElement>
            ),
        (lokasi: FoLokasi) =>
            (getEntityState(lokasi) === EntityState.Active ||
                getEntityState(lokasi) === EntityState.Archived) && (
                <DropdownElement
                    key="delete"
                    onClick={() => handleAction('delete', lokasi.id)}
                    icon={<Icon element={MdDelete} />}
                >
                    {t('delete')}
                </DropdownElement>
            ),
    ];

    return actions;
}

/**
 * Bulk actions (loop satu-per-satu): Archive, Restore, Delete.
 */
export function useFoLokasiCustomBulkActions() {
    const [t] = useTranslation();

    const bulkAction = async (
        selectedIds: string[],
        action: 'archive' | 'restore' | 'delete'
    ) => {
        toast.processing();

        const promises = selectedIds.map((id) => {
            let url = '';
            let method: 'PATCH' | 'DELETE' = 'PATCH';

            switch (action) {
                case 'archive':
                    url = route('/api/v1/fo-lokasis/:id/archive', { id });
                    break;
                case 'restore':
                    url = route('/api/v1/fo-lokasis/:id/restore', { id });
                    break;
                case 'delete':
                    method = 'DELETE';
                    url = route('/api/v1/fo-lokasis/:id', { id });
                    break;
            }

            return fetch(url, { method });
        });

        try {
            await Promise.all(promises);
            toast.success(`${action}d_fo_lokasi`);
            $refetch(['fo-lokasis']);
        } catch {
            toast.error('error_bulk_action');
        }
    };

    const customBulkActions: Array<
        (ctx: {
            selectedIds: string[];
            selectedResources: FoLokasi[];
            setSelected: Dispatch<SetStateAction<string[]>>;
        }) => React.ReactNode
    > = [
        ({ selectedIds }) => (
            <DropdownElement
                key="bulk-archive"
                onClick={() => bulkAction(selectedIds, 'archive')}
            >
                {t('archive')}
            </DropdownElement>
        ),
        ({ selectedIds }) => (
            <DropdownElement
                key="bulk-restore"
                onClick={() => bulkAction(selectedIds, 'restore')}
            >
                {t('restore')}
            </DropdownElement>
        ),
        ({ selectedIds }) => (
            <DropdownElement
                key="bulk-delete"
                onClick={() => bulkAction(selectedIds, 'delete')}
            >
                {t('delete')}
            </DropdownElement>
        ),
    ];

    return customBulkActions;
}
