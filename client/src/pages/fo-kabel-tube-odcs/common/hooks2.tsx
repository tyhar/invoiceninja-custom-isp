// client/src/pages/fo-kabel-tube-odcs/common/hooks2.tsx

import React from 'react';
import { EntityState } from '$app/common/enums/entity-state';
import { date, getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTranslation } from 'react-i18next';
// import { Dispatch, SetStateAction } from 'react';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

/**
 * Type FoKabelTubeOdc (API response).
 */
export interface FoKabelTubeOdc {
    id: number;
    kabel_odc_id: number;
    kabel_odc: { id: number; nama_kabel: string };
    warna_tube: string;
    status: 'active' | 'archived' | string;
    kabel_core_odc_ids: number[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

/**
 * Default visible columns.
 */
export const defaultColumns: string[] = ['kabel_odc', 'warna_tube', 'status'];

/**
 * All available columns for selection.
 */
export function useAllFoKabelTubeOdcColumns(): readonly string[] {
    return [
        'kabel_odc',
        'warna_tube',
        'status',
        'kabel_core_odc_ids',
        'created_at',
        'updated_at',
        'deleted_at',
    ] as const;
}

/**
 * Columns definition (formatters, labels).
 */
export function useFoKabelTubeOdcColumns() {
    const { t } = useTranslation();
    const { dateFormat } = useCurrentCompanyDateFormats();
    const reactSettings = useReactSettings();

    const columns = [
        {
            column: 'kabel_odc',
            id: 'kabel_odc',
            label: t('kabel_odc'),
            format: (_: any, k: FoKabelTubeOdc) => (
                <span>{k.kabel_odc.nama_kabel}</span>
            ),
        },
        {
            column: 'warna_tube',
            id: 'warna_tube',
            label: t('warna_tube'),
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
            column: 'kabel_core_odc_ids',
            id: 'kabel_core_odc_ids',
            label: t('jumlah_core_odc'),
            format: (_: any, k: FoKabelTubeOdc) => (
                <span>{k.kabel_core_odc_ids.length}</span>
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
        reactSettings?.react_table_columns?.['fo_kabel_tube_odc'] ||
        defaultColumns;

    return columns
        .filter((col) => list.includes(col.column))
        .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

/**
 * Row actions: Edit, Archive, Restore, Delete.
 */
export function useFoKabelTubeOdcActions() {
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
                url = route('/api/v1/fo-kabel-tube-odcs/:id/archive', { id });
                break;
            case 'restore':
                url = route('/api/v1/fo-kabel-tube-odcs/:id/restore', { id });
                break;
            case 'delete':
                method = 'DELETE';
                url = route('/api/v1/fo-kabel-tube-odcs/:id', { id });
                break;
        }

        toast.processing();
        try {
            await fetch(url, { method });
            toast.success(`${action}d_tube_odc`);
            $refetch(['fo-kabel-tube-odcs']);
        } catch {
            toast.error('error_action');
        }
    };

    return [
        (k: FoKabelTubeOdc) => (
            <DropdownElement
                key="edit"
                onClick={() =>
                    navigate(
                        route('/fo-kabel-tube-odcs/:id/edit', {
                            id: k.id.toString(),
                        })
                    )
                }
                icon={<Icon element={MdEdit} />}
            >
                {t('edit')}
            </DropdownElement>
        ),
        (k: FoKabelTubeOdc) =>
            getEntityState(k) === EntityState.Active && (
                <DropdownElement
                    key="archive"
                    onClick={() => handleAction('archive', k.id.toString())}
                    icon={<Icon element={MdArchive} />}
                >
                    {t('archive')}
                </DropdownElement>
            ),
        (k: FoKabelTubeOdc) =>
            getEntityState(k) === EntityState.Archived && (
                <DropdownElement
                    key="restore"
                    onClick={() => handleAction('restore', k.id.toString())}
                    icon={<Icon element={MdRestore} />}
                >
                    {t('restore')}
                </DropdownElement>
            ),
        (k: FoKabelTubeOdc) =>
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
}

/**
 * Bulk custom actions: Archive, Restore, Delete.
 */
export function useFoKabelTubeOdcCustomBulkActions() {
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
                    url = route('/api/v1/fo-kabel-tube-odcs/:id/archive', {
                        id,
                    });
                    break;
                case 'restore':
                    url = route('/api/v1/fo-kabel-tube-odcs/:id/restore', {
                        id,
                    });
                    break;
                case 'delete':
                    method = 'DELETE';
                    url = route('/api/v1/fo-kabel-tube-odcs/:id', { id });
                    break;
            }

            return fetch(url, { method });
        });

        try {
            await Promise.all(promises);
            toast.success(`${action}d_tube_odc`);
            $refetch(['fo-kabel-tube-odcs']);
        } catch {
            toast.error('error_bulk_action');
        }
    };

    return [
        ({ selectedIds }: { selectedIds: string[] }) => (
            <DropdownElement
                key="bulk-archive"
                onClick={() => bulkAction(selectedIds, 'archive')}
            >
                {t('archive')}
            </DropdownElement>
        ),
        ({ selectedIds }: { selectedIds: string[] }) => (
            <DropdownElement
                key="bulk-restore"
                onClick={() => bulkAction(selectedIds, 'restore')}
            >
                {t('restore')}
            </DropdownElement>
        ),
        ({ selectedIds }: { selectedIds: string[] }) => (
            <DropdownElement
                key="bulk-delete"
                onClick={() => bulkAction(selectedIds, 'delete')}
            >
                {t('delete')}
            </DropdownElement>
        ),
    ];
}
