/**
 * File: client/src/pages/fo-odps/common/hooks.tsx
 *
 * Hook and column/action definitions for FO ODP.
 */

import React from 'react';
import { EntityState } from '$app/common/enums/entity-state';
import { date, getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

/**
 * Type FoOdp (matching API response).
 */
export interface FoOdp {
    [x: string]: any;
    id: number;
    nama_odp: string;
    lokasi: {
        id: number;
        nama_lokasi: string;
        latitude: number;
        longitude: number;
    };
    kabel_core_odc: {
        id: number;
        warna_core: string;
        kabel_odc: { id: number; nama_kabel: string };
        kabel_tube_odc: { id: number; warna_tube: string };
    };
    client_ftth: { id: number; nama_client: string; alamat: string } | null;
    status: 'active' | 'archived' | string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

/**
 * Default columns initially displayed.
 */
export const defaultColumns: string[] = ['nama_odp', 'status', 'created_at'];

/**
 * All available columns (for DataTableColumnsPicker).
 */
export function useAllFoOdpColumns(): readonly string[] {
    return [
        'lokasi',
        'nama_odp',
        'odc',
        'kabel_odc',
        'kabel_tube_odc',
        'kabel_core_odc',
        'client_ftth',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
    ] as const;
}

/**
 * Columns rendered in the table (format, label, id).
 */
export function useFoOdpColumns() {
    const { t } = useTranslation();
    const { dateFormat } = useCurrentCompanyDateFormats();
    const reactSettings = useReactSettings();

    const columns = [
        {
            column: 'lokasi',
            id: 'lokasi',
            label: t('lokasi'),
            format: (_val: any, odp: FoOdp) => (
                <span>{odp.lokasi.nama_lokasi}</span>
            ),
        },
        {
            column: 'nama_odp',
            id: 'nama_odp',
            label: t('nama_odp'),
            format: (val: string, odp: FoOdp) => (
                <a
                    href={route('/fo-odps/:id/edit', { id: odp.id.toString() })}
                    className="text-blue-600 hover:underline"
                >
                    {val}
                </a>
            ),
        },
        {
            column: 'odc',
            id: 'odc',
            label: t('odc'),
            format: (_: any, odp: FoOdp) => (
                <span>{odp.odc?.nama_odc ?? '-'}</span>
            ),
        },
        {
            column: 'kabel_odc',
            id: 'kabel_odc',
            label: t('kabel_odc'),
            format: (_: any, odp: FoOdp) => (
                <span>{odp.kabel_core_odc.kabel_odc.nama_kabel}</span>
            ),
        },
        {
            column: 'kabel_tube_odc',
            id: 'kabel_tube_odc',
            label: t('kabel_tube_odc'),
            format: (_: any, odp: FoOdp) => (
                <span>{odp.kabel_core_odc.kabel_tube_odc.warna_tube}</span>
            ),
        },
        {
            column: 'kabel_core_odc',
            id: 'kabel_core_odc',
            label: t('kabel_core_odc'),
            format: (_: any, odp: FoOdp) => (
                <span>
                    {odp.kabel_core_odc?.warna_core ?? t('unassigned_core')}
                </span>
            ),
        },
        {
            column: 'client_ftth',
            id: 'client_ftth',
            label: t('client_ftth'),
            format: (_val: any, odp: FoOdp) => (
                <span>
                    {odp.client_ftth ? odp.client_ftth.nama_client : '-'}
                </span>
            ),
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
        reactSettings?.react_table_columns?.['fo_odp'] || defaultColumns;

    return columns
        .filter((col) => list.includes(col.column))
        .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

/**
 * Row actions: Edit, Archive, Restore, Delete (soft-delete).
 */
export function useFoOdpActions() {
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
                url = route('/api/v1/fo-odps/:id/archive', { id });
                break;
            case 'restore':
                url = route('/api/v1/fo-odps/:id/restore', { id });
                break;
            case 'delete':
                method = 'DELETE';
                url = route('/api/v1/fo-odps/:id', { id });
                break;
        }

        toast.processing();

        try {
            await fetch(url, { method });
            toast.success(t(`${action}d_odp`) as string);
            $refetch(['fo-odps']);
        } catch {
            toast.error('error_action');
        }
    };

    const actions: Array<(odp: FoOdp) => React.ReactNode> = [
        (odp) => (
            <DropdownElement
                key="edit"
                onClick={() =>
                    navigate(
                        route('/fo-odps/:id/edit', { id: odp.id.toString() })
                    )
                }
                icon={<Icon element={MdEdit} />}
            >
                {t('edit')}
            </DropdownElement>
        ),
        (odp) =>
            getEntityState(odp) === EntityState.Active && (
                <DropdownElement
                    key="archive"
                    onClick={() => handleAction('archive', odp.id.toString())}
                    icon={<Icon element={MdArchive} />}
                >
                    {t('archive')}
                </DropdownElement>
            ),
        (odp) =>
            getEntityState(odp) === EntityState.Archived && (
                <DropdownElement
                    key="restore"
                    onClick={() => handleAction('restore', odp.id.toString())}
                    icon={<Icon element={MdRestore} />}
                >
                    {t('restore')}
                </DropdownElement>
            ),
        (odp) =>
            (getEntityState(odp) === EntityState.Active ||
                getEntityState(odp) === EntityState.Archived) && (
                <DropdownElement
                    key="delete"
                    onClick={() => handleAction('delete', odp.id.toString())}
                    icon={<Icon element={MdDelete} />}
                >
                    {t('delete')}
                </DropdownElement>
            ),
    ];

    return actions;
}
