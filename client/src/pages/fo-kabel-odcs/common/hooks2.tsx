// client/src/pages/fo-kabel-odcs/common/hooks2.tsx

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
 * Type FoKabelOdc (API response).
 */
export interface FoKabelOdc {
    id: number;
    odc_id: number;
    odc: { id: number; nama_odc: string };
    nama_kabel: string;
    tipe_kabel: 'singlecore' | 'multicore';
    panjang_kabel: number;
    jumlah_tube: number;
    jumlah_core_in_tube: number;
    jumlah_total_core: number;
    status: 'active' | 'archived' | string;
    kabel_tube_odcs: Array<{ id: number }>;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

/**
 * Default visible columns.
 */
export const defaultColumns: string[] = [
    'odc',
    'nama_kabel',
    'tipe_kabel',
    'status',
];

/**
 * All available columns for selection.
 */
export function useAllFoKabelOdcColumns(): readonly string[] {
    return [
        'odc',
        'nama_kabel',
        'tipe_kabel',
        'panjang_kabel',
        'jumlah_tube',
        'jumlah_core_in_tube',
        'jumlah_total_core',
        'status',
        'kabel_tube_odcs',
        'created_at',
        'updated_at',
        'deleted_at',
    ] as const;
}

/**
 * Columns definition (formatters, labels).
 */
export function useFoKabelOdcColumns() {
    const { t } = useTranslation();
    const { dateFormat } = useCurrentCompanyDateFormats();
    const reactSettings = useReactSettings();

    const columns = [
        {
            column: 'odc',
            id: 'odc',
            label: t('odc'),
            format: (_: any, k: FoKabelOdc) => <span>{k.odc.nama_odc}</span>,
        },
        {
            column: 'nama_kabel',
            id: 'nama_kabel',
            label: t('nama_kabel'),
            format: (val: string, k: FoKabelOdc) => (
                <a
                    href={route('/fo-kabel-odcs/:id/edit', {
                        id: k.id.toString(),
                    })}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        { column: 'tipe_kabel', id: 'tipe_kabel', label: t('tipe_kabel') },
        {
            column: 'panjang_kabel',
            id: 'panjang_kabel',
            label: t('panjang_kabel'),
            format: (val: number) => val,
        },
        { column: 'jumlah_tube', id: 'jumlah_tube', label: t('jumlah_tube') },
        {
            column: 'jumlah_core_in_tube',
            id: 'jumlah_core_in_tube',
            label: t('jumlah_core_in_tube'),
        },
        {
            column: 'jumlah_total_core',
            id: 'jumlah_total_core',
            label: t('jumlah_total_core'),
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
            column: 'kabel_tube_odcs',
            id: 'kabel_tube_odcs',
            label: t('jumlah_tube'),
            format: (_: any, k: FoKabelOdc) => (
                <span>{k.kabel_tube_odcs.length}</span>
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
        reactSettings?.react_table_columns?.['fo_kabel_odc'] || defaultColumns;

    return columns
        .filter((col) => list.includes(col.column))
        .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

/**
 * Row actions: Edit, Archive, Restore, Delete.
 */
export function useFoKabelOdcActions() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleAction = async (
        action: 'archive' | 'restore' | 'delete',
        id: string
    ) => {
        let url = '';
        let method: 'PATCH' | 'DELETE' = 'PATCH';

        switch (action) {
            case 'archive':
                url = route('/api/v1/fo-kabel-odcs/:id/archive', { id });
                break;
            case 'restore':
                // handles both unarchive and restore trashed
                url = route('/api/v1/fo-kabel-odcs/:id/restore', { id });
                break;
            case 'delete':
                method = 'DELETE';
                url = route('/api/v1/fo-kabel-odcs/:id', { id });
                break;
        }

        toast.processing();
        try {
            await fetch(url, { method });
            toast.success(`${action}d_kabel_odc`);
            $refetch(['fo-kabel-odcs']);
        } catch {
            toast.error('error_action');
        }
    };

    const actions: Array<(k: FoKabelOdc) => React.ReactNode> = [
        (k) => (
            <DropdownElement
                key="edit"
                onClick={() =>
                    navigate(
                        route('/fo-kabel-odcs/:id/edit', {
                            id: k.id.toString(),
                        })
                    )
                }
                icon={<Icon element={MdEdit} />}
            >
                {t('edit')}
            </DropdownElement>
        ),
        (k) =>
            getEntityState(k) === EntityState.Active && (
                <DropdownElement
                    key="archive"
                    onClick={() => handleAction('archive', k.id.toString())}
                    icon={<Icon element={MdArchive} />}
                >
                    {t('archive')}
                </DropdownElement>
            ),
        (k) =>
            getEntityState(k) === EntityState.Archived && (
                <DropdownElement
                    key="restore"
                    onClick={() => handleAction('restore', k.id.toString())}
                    icon={<Icon element={MdRestore} />}
                >
                    {t('restore')}
                </DropdownElement>
            ),
        (k) =>
            (getEntityState(k) === EntityState.Active ||
                getEntityState(k) === EntityState.Archived) && (
                <DropdownElement
                    key="delete"
                    onClick={() => handleAction('delete', k.id.toString())}
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
export function useFoKabelOdcCustomBulkActions() {
    const { t } = useTranslation();

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
                    url = route('/api/v1/fo-kabel-odcs/:id/archive', { id });
                    break;
                case 'restore':
                    url = route('/api/v1/fo-kabel-odcs/:id/restore', { id });
                    break;
                case 'delete':
                    method = 'DELETE';
                    url = route('/api/v1/fo-kabel-odcs/:id', { id });
                    break;
            }

            return fetch(url, { method });
        });

        try {
            await Promise.all(promises);
            toast.success(`${action}d_kabel_odc`);
            $refetch(['fo-kabel-odcs']);
        } catch {
            toast.error('error_bulk_action');
        }
    };

    const customBulkActions: Array<
        (ctx: {
            selectedIds: string[];
            selectedResources: FoKabelOdc[];
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
