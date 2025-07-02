// client/src/common/queries/foOdc.ts
import { request } from '$app/common/helpers/request';
import { endpoint } from '../helpers';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';

type Action = 'archive' | 'delete' | 'restore';

export function useFoOdcBulkAction() {
    const queryClient = useQueryClient();
    const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

    return async (ids: number[] | string[], action: Action) => {
        toast.processing();

        return request('POST', endpoint('/api/v1/fo-odcs/bulk'), {
            ids,
            action,
        }).then(() => {
            toast.success(`${action}d_fo_odc`);

            // Invalidate specific query if available
            invalidateQueryValue &&
                queryClient.invalidateQueries([invalidateQueryValue]);

            // Invalidate all fo-odcs related queries
            queryClient.invalidateQueries(['/api/v1/fo-odcs']);
        });
    };
}

/**
 * Bulk action for FO ODC resources.
 * @param ids array of ODC IDs
 * @param action one of 'archive', 'delete', or 'restore'
 */
export function bulk(ids: number[] | string[], action: Action) {
    return request('POST', endpoint('/api/v1/fo-odcs/bulk'), {
        ids,
        action,
    });
}
