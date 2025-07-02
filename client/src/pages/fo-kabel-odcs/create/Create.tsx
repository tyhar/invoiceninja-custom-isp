// client/src/pages/fo-kabel-odcs/create/Create.tsx
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
import { CreateFoKabelOdc } from '../common/components/CreateFoKabelOdc';
import { useQueryClient } from 'react-query';

interface FoKabelOdcCreate {
    odc_id: number;
    nama_kabel: string;
    tipe_kabel: 'singlecore' | 'multicore';
    panjang_kabel: number;
    jumlah_tube: number;
    jumlah_core_in_tube: number;
    // jumlah_total_core: number;
}

interface OdcOption {
    id: number;
    nama_odc: string;
}

export default function Create() {
    useTitle('New FO Kabel ODC');
    const [t] = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const pages = [
        { name: t('FO Kabel ODC')!, href: '/fo-kabel-odcs' },
        { name: t('New FO Kabel ODC')!, href: '/fo-kabel-odcs/create' },
    ];

    const [form, setForm] = useState<FoKabelOdcCreate>({
        odc_id: 0,
        nama_kabel: '',
        tipe_kabel: 'singlecore',
        panjang_kabel: 0,
        jumlah_tube: 1,
        jumlah_core_in_tube: 1,
        // jumlah_total_core: 1,
    });
    const [odcs, setOdcs] = useState<OdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        request('GET', endpoint('/api/v1/fo-odcs')).then((res) => {
            setOdcs(
                res.data.data.map((o: any) => ({
                    id: o.id,
                    nama_odc: o.nama_odc,
                }))
            );
        });
    }, []);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;
        setIsBusy(true);

        request('POST', endpoint('/api/v1/fo-kabel-odcs'), form)
            .then((response: GenericSingleResourceResponse<any>) => {
                toast.success('created_kabel_odc');
                navigate(
                    route('/fo-kabel-odcs/:id/edit', {
                        id: response.data.data.id,
                    }),
                    { state: { toast: 'created_kabel_odc' } }
                );
                queryClient.invalidateQueries('fo-kabel-odcs');
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
            title={t('New FO Kabel ODC')}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoKabelOdc
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
