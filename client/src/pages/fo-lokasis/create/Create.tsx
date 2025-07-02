// client/src/pages/fo-lokasis/create/Create.tsx

import React, { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useNavigate } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CreateFoLokasi } from '../common/components/CreateFoLokasi';
import { useQueryClient } from 'react-query';

interface FoLokasi {
    nama_lokasi: string;
    deskripsi?: string;
    latitude: number;
    longitude: number;
    city?: string;
    province?: string;
    country?: string;
    geocoded_at?: string;
}

export default function Create() {
    useTitle('New FO Lokasi');
    const [t] = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const pages = [
        { name: t('FO Lokasi')!, href: '/fo-lokasis' },
        { name: t('New FO Lokasi')!, href: '/fo-lokasis/create' },
    ];
    const [foLokasi, setFoLokasi] = useState<FoLokasi>({
        nama_lokasi: '',
        deskripsi: '',
        latitude: 0,
        longitude: 0,
    });
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);

    const handleSave = (event: FormEvent) => {
        event.preventDefault();
        if (isBusy) return;

        setIsBusy(true);
        request('POST', endpoint('/api/v1/fo-lokasis'), foLokasi)
            .then((response: GenericSingleResourceResponse<any>) => {
                toast.success('created_fo_lokasi');

                // Invalidate related queries
                queryClient.invalidateQueries(['/api/v1/fo-lokasis']);

                navigate(
                    route('/fo-lokasis/:id/edit', {
                        id: response.data.data.id,
                    }),
                    //adding this for pop up info
                    { state: { toast: 'created_fo_lokasi' } }
                );
            })
            .catch((error) => {
                if (error.response?.status === 422) {
                    setErrors(error.response.data);
                    toast.dismiss();
                } else {
                    toast.error('error_refresh_page');
                }
            })
            .finally(() => setIsBusy(false));
    };

    return (
        <Default
            title={t('New FO Lokasi')}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoLokasi
                        foLokasi={foLokasi}
                        setFoLokasi={setFoLokasi}
                        errors={errors}
                        setErrors={setErrors}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
