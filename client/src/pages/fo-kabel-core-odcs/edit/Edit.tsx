// ----------------------
// client/src/pages/fo-kabel-core-odcs/edit/Edit.tsx
// ----------------------
import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useNavigate, useParams } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CreateFoKabelCoreOdc } from '../common/components/CreateFoKabelCoreOdc';

interface FoKabelCoreOdcForm {
    kabel_tube_odc_id: number;
    warna_core: string;
}

interface TubeOdcOption {
    id: number;
    warna_tube: string;
    kabel_odc_id: number;
    nama_kabel: string;
}

export default function Edit() {
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useTitle('edit_core_odc');

    const [form, setForm] = useState<FoKabelCoreOdcForm>({
        kabel_tube_odc_id: 0,
        warna_core: '',
    });
    const [tubes, setTubes] = useState<TubeOdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [selectedCable, setSelectedCable] = useState<number>(0);

    useEffect(() => {
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-kabel-core-odcs/${id}`)),
            request('GET', endpoint('/api/v1/fo-kabel-tube-odcs')),
        ])
            .then(([resCore, resTube]: any) => {
                const data = (resCore as GenericSingleResourceResponse<any>)
                    .data.data;

                // load form values
                setForm({
                    kabel_tube_odc_id: data.kabel_tube_odc_id,
                    warna_core: data.warna_core,
                });

                // map tube options
                const list: TubeOdcOption[] = (
                    resTube as GenericSingleResourceResponse<any>
                ).data.data.map((o: any) => ({
                    id: o.id,
                    warna_tube: o.warna_tube,
                    kabel_odc_id: o.kabel_odc?.id,
                    nama_kabel: o.kabel_odc?.nama_kabel,
                }));
                setTubes(list);

                const selected = list.find(
                    (l) => l.id === data.kabel_tube_odc_id
                );
                if (selected) setSelectedCable(selected.kabel_odc_id);
            })
            .catch(() => {
                toast.error('error_refresh_page');
                navigate('/fo-kabel-core-odcs');
            });
    }, [id, navigate]);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;

        setIsBusy(true);
        toast.processing();

        request('PUT', endpoint(`/api/v1/fo-kabel-core-odcs/${id}`), form)
            .then(() => {
                toast.success('updated_core_odc');
                navigate(route('/fo-kabel-core-odcs/:id/edit', { id }), {
                    state: { toast: 'updated_core_odc' },
                });
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
        { name: t('FO Kabel Core ODC')!, href: '/fo-kabel-core-odcs' },
        { name: t('edit_core_odc')!, href: `/fo-kabel-core-odcs/${id}/edit` },
    ];

    // show spinner until form is initialized
    if (form.kabel_tube_odc_id === 0 && form.warna_core === '') {
        return <Spinner />;
    }

    return (
        <Default
            title={t('edit_core_odc')!}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoKabelCoreOdc
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        tubes={tubes}
                        selectedCable={selectedCable}
                        setSelectedCable={setSelectedCable}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
