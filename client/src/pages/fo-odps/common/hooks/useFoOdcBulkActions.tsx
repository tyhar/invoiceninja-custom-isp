import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdDownload } from 'react-icons/md';
import { toast } from '$app/common/helpers/toast/toast';
import { CustomBulkAction } from '$app/components/DataTable2';

export const useFoLokasiBulkActions = (): CustomBulkAction<any>[] => {
    const [t] = useTranslation();

    return [
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
    ];
};
