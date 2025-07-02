// client/src/pages/fo-lokasis/common/hooks/useFoLokasiActions.tsx
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import {
    // MdEdit,
    MdArchive,
    MdRestore,
    // MdDelete
} from 'react-icons/md';
import { MdLocationOn } from 'react-icons/md';
import { getEntityState } from '$app/common/helpers2';
import { EntityState } from '$app/common/enums/entity-state';
import { useFoLokasiBulkAction } from '$app/common/queries/foLokasi';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from 'react-hot-toast';

export const useFoLokasiActions = (): Array<(res: any) => ReactElement> => {
    const [t] = useTranslation();
    const bulkAction = useFoLokasiBulkAction();

    const handleForceGeocode = async (id: string) => {
        try {
            const response = await request('POST', endpoint(`/api/v1/fo-lokasis/${id}/geocode`));

            if (response.data.status === 'success') {
                toast.success('Location geocoded successfully!');
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                toast.error('Failed to geocode location');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('Failed to geocode location. Please try again.');
        }
    };

    return [
        (res) => {
            // Force Geocode action - show if coordinates exist (regardless of previous geocoding)
            if (res.latitude && res.longitude) {
                return (
                    <DropdownElement
                        onClick={() => handleForceGeocode(res.id)}
                        icon={<Icon element={MdLocationOn} />}
                    >
                        {res.geocoded_at ? 'Re-geocode' : 'Force Geocode'}
                    </DropdownElement>
                );
            }

            return <></>;
        },

        (res) => {
            // 2) Archive or Restore
            const state = getEntityState(res);
            // console.log(state);

            if (state === EntityState.Active) {
                return (
                    <DropdownElement
                        onClick={() =>
                            bulkAction([res.id], 'archive')
                        }
                        icon={<Icon element={MdArchive} />}
                    >
                        {t('archive')!}
                    </DropdownElement>
                );
            }

            if (
                state === EntityState.Archived ||
                state === EntityState.Deleted
            ) {
                return (
                    <DropdownElement
                        onClick={() =>
                            bulkAction([res.id], 'restore')
                        }
                        icon={<Icon element={MdRestore} />}
                    >
                        {t('restore')!}
                    </DropdownElement>
                );
            }

            // placeholder to satisfy type
            return <></>;
        },

        // (res) => {
        //     // 1) Edit action
        //     return (
        //         <DropdownElement
        //             to={route('/fo-lokasis/:id/edit', { id: res.id })}
        //             icon={<Icon element={MdEdit} />}
        //         >
        //             {t('edit')!}
        //         </DropdownElement>
        //     );
        // },

        // (res) => {
        //     // 3) Delete (soft-delete)
        //     const state = getEntityState(res);

        //     if (state !== EntityState.Deleted) {
        //         return (
        //             <DropdownElement
        //                 onClick={() =>
        //                     bulk([res.id], 'delete').then(() =>
        //                         toast.success(t('deleted_lokasi')!)
        //                     )
        //                 }
        //                 icon={<Icon element={MdDelete} />}
        //             >
        //                 {t('delete')!}
        //             </DropdownElement>
        //         );
        //     }

        //     // placeholder
        //     return <></>;
        // },
    ];
};
