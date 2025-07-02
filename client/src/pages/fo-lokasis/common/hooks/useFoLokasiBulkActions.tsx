// client/src/pages/fo-lokasis/common/hooks/useFoLokasiBulkActions.tsx
// import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import {
    MdDownload,
    MdLocationOn,
    //  MdRestore
} from 'react-icons/md';
import { toast } from '$app/common/helpers/toast/toast';
import { CustomBulkAction } from '$app/components/DataTable2';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';

export const useFoLokasiBulkActions = (): CustomBulkAction<any>[] => {
    const [t] = useTranslation();

        const handleBulkGeocode = async (selectedResources: any[], setSelected: (ids: string[]) => void) => {
        // Filter resources that have coordinates (regardless of previous geocoding)
        const resourcesToGeocode = selectedResources.filter(
            res => res.latitude && res.longitude
        );

        if (resourcesToGeocode.length === 0) {
            toast.error('No locations selected for geocoding. Make sure locations have coordinates.');
            return;
        }

        try {
            const ids = resourcesToGeocode.map(res => res.id);
            const response = await request('POST', endpoint('/api/v1/fo-lokasis/bulk-geocode'), { ids });

            if (response.data.status === 'success') {
                const { success, failed } = response.data.data;

                if (success > 0) {
                    toast.success(`Successfully geocoded ${success} location(s)`);
                }
                if (failed > 0) {
                    toast.error(`Failed to geocode ${failed} location(s)`);
                }

                setSelected([]);
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                toast.error('Failed to geocode locations');
            }
        } catch (error) {
            console.error('Bulk geocoding error:', error);
            toast.error('Failed to geocode locations. Please try again.');
        }
    };

    return [
        ({ selectedResources, setSelected }) => (
            <DropdownElement
                onClick={() => handleBulkGeocode(selectedResources, setSelected)}
                icon={<Icon element={MdLocationOn} />}
            >
                Bulk Geocode ({selectedResources.filter(r => r.latitude && r.longitude).length})
            </DropdownElement>
        ),

        ({ setSelected }) => (
            <DropdownElement
                onClick={() => {
                    // TODO: implement export logic
                    toast.success(t('exported_selected_lokasi')!);
                    setSelected([]);
                }}
                icon={<Icon element={MdDownload} />}
            >
                {t('export')!}
            </DropdownElement>
        ),

        // ({ setSelected }) => (
        //     <DropdownElement
        //         onClick={() => {
        //             // TODO: implement export logic
        //             toast.success(t('exported_selected_lokasi')!);
        //             setSelected([]);
        //         }}
        //         icon={<Icon element={MdRestore} />}
        //     >
        //         {t('restore')!}
        //     </DropdownElement>
        // ),
    ];
};
