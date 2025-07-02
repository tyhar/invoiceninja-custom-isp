// client/src/pages/fo-kabel-core-odcs/common/hooks2.tsx

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
 * Type FoKabelCoreOdc (API response).
 */
export interface FoKabelCoreOdc {
    id: number;
    kabel_tube_odc_id: number;
    kabel_tube_odc: { id: number; warna_tube: string };
    warna_core: string;
    status: 'active' | 'archived' | string;
    odp_ids: number[];
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

/**
 * Default visible columns.
 */
export const defaultColumns: string[] = [
    'kabel_tube_odc',
    'warna_core',
    'status',
];

/**
 * All available columns for selection.
 */
export function useAllFoKabelCoreOdcColumns(): readonly string[] {
    return [
        'kabel_tube_odc',
        'warna_core',
        'status',
        'odp_ids',
        'created_at',
        'updated_at',
        'deleted_at',
    ] as const;
}

/**
 * Columns definition (formatters, labels).
 */
export function useFoKabelCoreOdcColumns() {
    const { t } = useTranslation();
    const { dateFormat } = useCurrentCompanyDateFormats();
    const reactSettings = useReactSettings();

    const columns = [
        {
            column: 'kabel_tube_odc',
            id: 'kabel_tube_odc',
            label: t('warna_tube'),
            format: (_: any, c: FoKabelCoreOdc) => (
                <span>{c.kabel_tube_odc.warna_tube}</span>
            ),
        },
        {
            column: 'warna_core',
            id: 'warna_core',
            label: t('warna_core'),
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
            column: 'odp_ids',
            id: 'odp_ids',
            label: t('jumlah_odp'),
            format: (_: any, c: FoKabelCoreOdc) => (
                <span>{c.odp_ids.length}</span>
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
        reactSettings?.react_table_columns?.['fo_kabel_core_odc'] ||
        defaultColumns;

    return columns
        .filter((col) => list.includes(col.column))
        .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}

/**
 * Row actions: Edit, Archive, Restore, Delete.
 */
export function useFoKabelCoreOdcActions() {
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
                url = route('/api/v1/fo-kabel-core-odcs/:id/archive', { id });
                break;
            case 'restore':
                url = route('/api/v1/fo-kabel-core-odcs/:id/restore', { id });
                break;
            case 'delete':
                method = 'DELETE';
                url = route('/api/v1/fo-kabel-core-odcs/:id', { id });
                break;
        }

        toast.processing();
        try {
            await fetch(url, { method });
            toast.success(`${action}d_core_odc`);
            $refetch(['fo-kabel-core-odcs']);
        } catch {
            toast.error('error_action');
        }
    };

    return [
        (c: FoKabelCoreOdc) => (
            <DropdownElement
                key="edit"
                onClick={() =>
                    navigate(
                        route('/fo-kabel-core-odcs/:id/edit', {
                            id: c.id.toString(),
                        })
                    )
                }
                icon={<Icon element={MdEdit} />}
            >
                {t('edit')}
            </DropdownElement>
        ),
        (c: FoKabelCoreOdc) =>
            getEntityState(c) === EntityState.Active && (
                <DropdownElement
                    key="archive"
                    onClick={() => handleAction('archive', c.id.toString())}
                    icon={<Icon element={MdArchive} />}
                >
                    {t('archive')}
                </DropdownElement>
            ),
        (c: FoKabelCoreOdc) =>
            getEntityState(c) === EntityState.Archived && (
                <DropdownElement
                    key="restore"
                    onClick={() => handleAction('restore', c.id.toString())}
                    icon={<Icon element={MdRestore} />}
                >
                    {t('restore')}
                </DropdownElement>
            ),
        (c: FoKabelCoreOdc) =>
            (getEntityState(c) === EntityState.Active ||
                getEntityState(c) === EntityState.Archived) && (
                <DropdownElement
                    key="delete"
                    onClick={() => handleAction('delete', c.id.toString())}
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
export function useFoKabelCoreOdcCustomBulkActions() {
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
                    url = route('/api/v1/fo-kabel-core-odcs/:id/archive', {
                        id,
                    });
                    break;
                case 'restore':
                    url = route('/api/v1/fo-kabel-core-odcs/:id/restore', {
                        id,
                    });
                    break;
                case 'delete':
                    method = 'DELETE';
                    url = route('/api/v1/fo-kabel-core-odcs/:id', { id });
                    break;
            }

            return fetch(url, { method });
        });

        try {
            await Promise.all(promises);
            toast.success(`${action}d_core_odc`);
            $refetch(['fo-kabel-core-odcs']);
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
