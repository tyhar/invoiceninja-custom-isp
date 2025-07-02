// client/src/common/queries/foKabelCoreOdc.ts

import { request } from '$app/common/helpers/request';
import { endpoint } from '../helpers';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';

type Action = 'archive' | 'delete' | 'restore';

export function useFoKabelCoreOdcBulkAction() {
    const queryClient = useQueryClient();
    const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

    return async (ids: number[] | string[], action: Action) => {
        toast.processing();

        return request('POST', endpoint('/api/v1/fo-kabel-core-odcs/bulk'), {
            ids,
            action,
        }).then(() => {
            toast.success(`${action}d_fo_kabel_core_odc`);

            // Invalidate specific query if available
            invalidateQueryValue &&
                queryClient.invalidateQueries([invalidateQueryValue]);

            // Invalidate all fo-kabel-core-odcs related queries
            queryClient.invalidateQueries(['/api/v1/fo-kabel-core-odcs']);
        });
    };
}

/**
 * Bulk action for FO Kabel Core ODC resources.
 * @param ids array of Kabel Core ODC IDs
 * @param action one of 'archive', 'delete', or 'restore'
 */
export function bulk(ids: number[] | string[], action: Action) {
    return request('POST', endpoint('/api/v1/fo-kabel-core-odcs/bulk'), {
        ids,
        action,
    });
}
