/**
 * File: client/src/pages/fo-odcs/common/hooks2.tsx
 *
 * Hook dan definisi kolom/aksi untuk FO ODC.
 */

import React from 'react';
import { EntityState } from '$app/common/enums/entity-state';
import { date, getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

/**
 * Tipe FoOdc (sesuai respons API).
 */
export interface FoOdc {
    id: number;
    lokasi_id: number;
    lokasi: { id: number; nama_lokasi: string };
    nama_odc: string;
    tipe_splitter: string;
    status: 'active' | 'archived' | string;
    kabel_odcs: Array<{ id: number; nama_kabel_odc: string }>;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

/**
 * Default kolom yang tampil pertama kali.
 */
export const defaultColumns: string[] = [
    'nama_odc',
    'tipe_splitter',
    'status',
    'created_at',
];

/**
 * Semua kolom yang tersedia (untuk DataTableColumnsPicker).
 */
export function useAllFoOdcColumns(): readonly string[] {
    return [
        'lokasi',
        'nama_odc',
        'tipe_splitter',
        'status',
        'kabel_odcs',
        'created_at',
        'updated_at',
        'deleted_at',
    ] as const;
}

/**
 * Kolom yang dirender di tabel (format, label, id).
 */
export function useFoOdcColumns() {
    const { t } = useTranslation();
    const { dateFormat } = useCurrentCompanyDateFormats();
    const reactSettings = useReactSettings();

    const columns = [
        {
            column: 'lokasi',
            id: 'lokasi',
            label: t('lokasi'),
            format: (_val: any, odc: FoOdc) => (
                <span>{odc.lokasi.nama_lokasi}</span>
            ),
        },
        {
            column: 'nama_odc',
            id: 'nama_odc',
            label: t('nama_odc'),
            format: (val: string, odc: FoOdc) => (
                <a
                    href={route('/fo-odcs/:id/edit', { id: odc.id.toString() })}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        {
            column: 'tipe_splitter',
            id: 'tipe_splitter',
            label: t('tipe_splitter'),
        },
        {
            column: 'status',
            id: 'status',
            label: t('status'),
            format: (val: string) => (
                <span
                    className={
                        val === 'active'
                            ? 'text-green-600'
                            : val === 'archived'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                    }
                >
                    {t(val)}
                </span>
            ),
        },
        {
            column: 'kabel_odcs',
            id: 'kabel_odcs',
            label: t('jumlah_kabel_odc'),
            format: (_: any, odc: FoOdc) => (
                <span>{odc.kabel_odcs.length} Kabel</span>
            ),
        },
        {
            column: 'created_at',
            id: 'created_at',
            label: t('created_at'),
            format: (val: string) => date(val, dateFormat),
        },
        {
            column: 'updated_at',
            id: 'updated_at',
            label: t('updated_at'),
            format: (val: string) => date(val, dateFormat),
        },
        {
            column: 'deleted_at',
            id: 'deleted_at',
            label: t('deleted_at'),
            format: (val: string) => (val ? date(val, dateFormat) : '-'),
        },
    ];

    const list: string[] =
        reactSettings?.react_table_columns?.['fo_odc'] || defaultColumns;

    return columns
        .filter((col) => list.includes(col.column))
        .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

/**
 * Row actions: Edit, Archive, Restore, Delete (soft-delete).
 */
export function useFoOdcActions() {
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
                url = route('/api/v1/fo-odcs/:id/archive', { id });
                break;
            case 'restore':
                url = route('/api/v1/fo-odcs/:id/restore', { id });
                break;
            case 'delete':
                method = 'DELETE';
                url = route('/api/v1/fo-odcs/:id', { id });
                break;
        }

        toast.processing();

        try {
            await fetch(url, { method });
            toast.success(`${action}d_odc`);
            $refetch(['fo-odcs']);
        } catch {
            toast.error('error_action');
        }
    };

    const actions: Array<(odc: FoOdc) => React.ReactNode> = [
        (odc) => (
            <DropdownElement
                key="edit"
                onClick={() =>
                    navigate(
                        route('/fo-odcs/:id/edit', { id: odc.id.toString() })
                    )
                }
                icon={<Icon element={MdEdit} />}
            >
                {t('edit')}
            </DropdownElement>
        ),
        (odc) =>
            getEntityState(odc) === EntityState.Active && (
                <DropdownElement
                    key="archive"
                    onClick={() => handleAction('archive', odc.id.toString())}
                    icon={<Icon element={MdArchive} />}
                >
                    {t('archive')}
                </DropdownElement>
            ),
        (odc) =>
            getEntityState(odc) === EntityState.Archived && (
                <DropdownElement
                    key="restore"
                    onClick={() => handleAction('restore', odc.id.toString())}
                    icon={<Icon element={MdRestore} />}
                >
                    {t('restore')}
                </DropdownElement>
            ),
        (odc) =>
            (getEntityState(odc) === EntityState.Active ||
                getEntityState(odc) === EntityState.Archived) && (
                <DropdownElement
                    key="delete"
                    onClick={() => handleAction('delete', odc.id.toString())}
                    icon={<Icon element={MdDelete} />}
                >
                    {t('delete')}
                </DropdownElement>
            ),
    ];

    return actions;
}

/**
 * Bulk custom actions: Archive, Restore, Delete.
 */
export function useFoOdcCustomBulkActions() {
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
                    url = route('/api/v1/fo-odcs/:id/archive', { id });
                    break;
                case 'restore':
                    url = route('/api/v1/fo-odcs/:id/restore', { id });
                    break;
                case 'delete':
                    method = 'DELETE';
                    url = route('/api/v1/fo-odcs/:id', { id });
                    break;
            }

            return fetch(url, { method });
        });

        try {
            await Promise.all(promises);
            toast.success(`${action}d_odc`);
            $refetch(['fo-odcs']);
        } catch {
            toast.error('error_bulk_action');
        }
    };

    const customBulkActions: Array<
        (ctx: {
            selectedIds: string[];
            selectedResources: FoOdc[];
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
