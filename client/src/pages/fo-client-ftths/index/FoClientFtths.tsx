import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { DataTable2 } from '$app/components/DataTable2';
import { useFoClientFtthColumns } from '../common/hooks2';
import { useFoClientFtthBulkActions } from '../common/hooks/useFoClientFtthBulkActions';
import { useFoClientFtthActions } from '../common/hooks/useFoClientFtthActions';
import { FoClientFtth } from '../common/hooks2';

// Main list/table page for FTTH clients
export default function FoClientFtths() {
    useTitle('Client FTTH');
    const [t] = useTranslation();
    const pages: Page[] = [{ name: t('Client FTTH'), href: '/fo-client-ftths' }];
    const columns = useFoClientFtthColumns();

    return (
        <Default title={t('Client FTTH')} breadcrumbs={pages}>
            <DataTable2<FoClientFtth>
                resource="fo-client-ftths"
                columns={columns}
                endpoint="/api/v1/fo-client-ftths"
                linkToCreate="/fo-client-ftths/create"
                linkToEdit="/fo-client-ftths/:id/edit"
                withResourcefulActions
                bulkRoute="/api/v1/fo-client-ftths/bulk"
                customBulkActions={useFoClientFtthBulkActions()}
                customActions={useFoClientFtthActions()}
                withoutDefaultBulkActions={true}
            />
        </Default>
    );
}
