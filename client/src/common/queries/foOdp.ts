// client/src/common/queries/foOdp.ts
import { request } from '$app/common/helpers/request';
import { endpoint } from '../helpers';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';

type Action = 'archive' | 'delete' | 'restore';

export function useFoOdpBulkAction() {
    const queryClient = useQueryClient();
    const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

    return async (ids: number[] | string[], action: Action) => {
        toast.processing();

        return request('POST', endpoint('/api/v1/fo-odps/bulk'), {
            ids,
            action,
        }).then(() => {
            toast.success(`${action}d_fo_odp`);

            // Invalidate specific query if available
            invalidateQueryValue &&
                queryClient.invalidateQueries([invalidateQueryValue]);

            // Invalidate all fo-odps related queries
            queryClient.invalidateQueries(['/api/v1/fo-odps']);
        });
    };
}

/**
 * Bulk action for FO ODP resources.
 * @param ids array of ODP IDs
 * @param action one of 'archive', 'delete', or 'restore'
 */
export function bulk(ids: number[] | string[], action: Action) {
    return request('POST', endpoint('/api/v1/fo-odps/bulk'), {
        ids,
        action,
    });
}
