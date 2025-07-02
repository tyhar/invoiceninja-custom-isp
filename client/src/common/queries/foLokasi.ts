// client/src/common/queries/foLokasi.ts
import { request } from '$app/common/helpers/request';
import { endpoint } from '../helpers';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';

export function useFoLokasiBulkAction() {
    const queryClient = useQueryClient();
    const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

    return async (ids: string[], action: 'archive' | 'delete' | 'restore') => {
        toast.processing();

        return request('POST', endpoint('/api/v1/fo-lokasis/bulk'), {
            ids,
            action,
        }).then(() => {
            toast.success(`${action}d_fo_lokasi`);

            // Invalidate specific query if available
            invalidateQueryValue &&
                queryClient.invalidateQueries([invalidateQueryValue]);

            // Invalidate all fo-lokasis related queries
            queryClient.invalidateQueries(['/api/v1/fo-lokasis']);
        });
    };
}

// Keep the old function for backward compatibility
export function bulk(ids: string[], action: 'archive' | 'delete' | 'restore') {
    //warp with endpoint() to using localhost:8000 instead :3000
    return request('POST', endpoint('/api/v1/fo-lokasis/bulk'), {
        ids,
        action,
    });
}
