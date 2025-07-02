// client/src/pages/fo-kabel-core-odcs/common/hooks/useFoKabelCoreOdcActions.tsx

import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdRestore } from 'react-icons/md';
import { getEntityState } from '$app/common/helpers2';
import { EntityState } from '$app/common/enums/entity-state';
import { useFoKabelCoreOdcBulkAction } from '$app/common/queries/foKabelCoreOdc';

export const useFoKabelCoreOdcActions = (): Array<
    (res: any) => ReactElement
> => {
    const [t] = useTranslation();
    const bulkAction = useFoKabelCoreOdcBulkAction();

    return [
        (res) => {
            const state = getEntityState(res);

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

            return <></>;
        },
    ];
};
