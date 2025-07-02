// client/src/pages/fo-kabel-tube-odcs/create/Create.tsx
import React, { FormEvent, useState, useEffect } from 'react';
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
import { CreateFoKabelTubeOdc } from '../common/components/CreateFoKabelTubeOdc';
import { useQueryClient } from 'react-query';

interface FoKabelTubeOdcCreate {
    kabel_odc_id: number;
    warna_tube: string;
}

interface KabelOdcOption {
    id: number;
    nama_kabel: string;
}

export default function Create() {
    useTitle('New FO Kabel Tube ODC');
    const [t] = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const pages = [
        { name: t('FO Kabel Tube ODC')!, href: '/fo-kabel-tube-odcs' },
        {
            name: t('New FO Kabel Tube ODC')!,
            href: '/fo-kabel-tube-odcs/create',
        },
    ];

    const [form, setForm] = useState<FoKabelTubeOdcCreate>({
        kabel_odc_id: 0,
        warna_tube: '',
    });
    const [odcs, setOdcs] = useState<KabelOdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        request('GET', endpoint('/api/v1/fo-kabel-odcs')).then((res) => {
            setOdcs(
                res.data.data.map((o: any) => ({
                    id: o.id,
                    nama_kabel: o.nama_kabel,
                }))
            );
        });
    }, []);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;
        setIsBusy(true);

        request('POST', endpoint('/api/v1/fo-kabel-tube-odcs'), form)
            .then((response: GenericSingleResourceResponse<any>) => {
                toast.success('created tube odc');
                navigate(
                    route('/fo-kabel-tube-odcs/:id/edit', {
                        id: response.data.data.id,
                    }),
                    { state: { toast: 'created_tube_odc' } }
                );
                queryClient.invalidateQueries('fo-kabel-tube-odcs');
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
            title={t('New FO Kabel Tube ODC')}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoKabelTubeOdc
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        odcs={odcs}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
