// client/src/common/queries/foKabelTubeOdc.ts

import { request } from '$app/common/helpers/request';
import { endpoint } from '../helpers';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';

type Action = 'archive' | 'delete' | 'restore';

export function useFoKabelTubeOdcBulkAction() {
    const queryClient = useQueryClient();
    const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

    return async (ids: number[] | string[], action: Action) => {
        toast.processing();

        return request('POST', endpoint('/api/v1/fo-kabel-tube-odcs/bulk'), {
            ids,
            action,
        }).then(() => {
            toast.success(`${action}d_fo_kabel_tube_odc`);

            // Invalidate specific query if available
            invalidateQueryValue &&
                queryClient.invalidateQueries([invalidateQueryValue]);

            // Invalidate all fo-kabel-tube-odcs related queries
            queryClient.invalidateQueries(['/api/v1/fo-kabel-tube-odcs']);
        });
    };
}

/**
 * Bulk action for FO Kabel Tube ODC resources.
 * @param ids array of Kabel Tube ODC IDs
 * @param action one of 'archive', 'delete', or 'restore'
 */
export function bulk(ids: number[] | string[], action: Action) {
    return request('POST', endpoint('/api/v1/fo-kabel-tube-odcs/bulk'), {
        ids,
        action,
    });
}
