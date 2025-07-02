// client/src/pages/fo-kabel-tube-odcs/edit/Edit.tsx
import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { useNavigate, useParams } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CreateFoKabelTubeOdc } from '../common/components/CreateFoKabelTubeOdc';

interface FoKabelTubeOdcForm {
    kabel_odc_id: number;
    warna_tube: string;
}

interface KabelOdcOption {
    id: number;
    nama_kabel: string;
}

export default function Edit() {
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useTitle('edit_tube_odc');

    const [form, setForm] = useState<FoKabelTubeOdcForm>({
        kabel_odc_id: 0,
        warna_tube: '',
    });
    const [odcs, setOdcs] = useState<KabelOdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-kabel-tube-odcs/${id}`)),
            request('GET', endpoint('/api/v1/fo-kabel-odcs')),
        ])
            .then(([resTube, resOdc]: any) => {
                setForm({
                    kabel_odc_id: resTube.data.data.kabel_odc_id,
                    warna_tube: resTube.data.data.warna_tube,
                });
                setOdcs(
                    resOdc.data.data.map((o: any) => ({
                        id: o.id,
                        nama_kabel: o.nama_kabel,
                    }))
                );
            })
            .catch(() => {
                toast.error('error_refresh_page');
                navigate('/fo-kabel-tube-odcs');
            });
    }, [id, navigate]);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;

        setIsBusy(true);
        toast.processing();

        request('PUT', endpoint(`/api/v1/fo-kabel-tube-odcs/${id}`), form)
            .then(() => {
                toast.success('updated_tube_odc');
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

    const pages = [
        { name: t('FO Kabel Tube ODC')!, href: '/fo-kabel-tube-odcs' },
        { name: t('edit tube odc')!, href: `/fo-kabel-tube-odcs/${id}/edit` },
    ];

    if (!form.kabel_odc_id && !form.warna_tube) {
        return <Spinner />;
    }

    return (
        <Default
            title={t('edit tube odc')!}
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
