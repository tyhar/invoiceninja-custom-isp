import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { useFoKabelOdcBulkAction } from '$app/common/queries/foKabelOdc';
import { CustomBulkAction } from '$app/components/DataTable2';

export const useFoKabelOdcBulkActions = (): CustomBulkAction<any>[] => {
    const [t] = useTranslation();
    const bulkAction = useFoKabelOdcBulkAction();

    return [
        ({ selectedIds, setSelected }) => (
            <>
                <DropdownElement
                    onClick={() => {
                        bulkAction(selectedIds, 'archive');
                        setSelected([]);
                    }}
                    icon={<Icon element={MdArchive} />}
                >
                    {t('archive')}
                </DropdownElement>

                <DropdownElement
                    onClick={() => {
                        bulkAction(selectedIds, 'delete');
                        setSelected([]);
                    }}
                    icon={<Icon element={MdDelete} />}
                >
                    {t('delete')}
                </DropdownElement>

                <DropdownElement
                    onClick={() => {
                        bulkAction(selectedIds, 'restore');
                        setSelected([]);
                    }}
                    icon={<Icon element={MdRestore} />}
                >
                    {t('restore')}
                </DropdownElement>
            </>
        ),
    ];
};
