// client/src/pages/fo-kabel-odcs/edit/Edit.tsx
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
import { CreateFoKabelOdc } from '../common/components/CreateFoKabelOdc';

interface FoKabelOdc {
    id: number;
    odc_id: number;
    nama_kabel: string;
    tipe_kabel: 'singlecore' | 'multicore';
    panjang_kabel: number;
    jumlah_tube: number;
    jumlah_core_in_tube: number;
    // jumlah_total_core: number;
    status: 'active' | 'archived';
    deleted_at?: string | null;
}

interface OdcOption {
    id: number;
    nama_odc: string;
}

export default function Edit() {
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useTitle('edit_kabel_odc');

    const [form, setForm] = useState<FoKabelOdc | null>(null);
    const [odcs, setOdcs] = useState<OdcOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-kabel-odcs/${id}`)),
            request('GET', endpoint('/api/v1/fo-odcs')),
        ])
            .then(([resKabel, resOdc]: any) => {
                setForm(resKabel.data.data);
                setOdcs(
                    resOdc.data.data.map((o: any) => ({
                        id: o.id,
                        nama_odc: o.nama_odc,
                    }))
                );
            })
            .catch(() => {
                toast.error('error_refresh_page');
                navigate('/fo-kabel-odcs');
            });
    }, [id, navigate]);

    if (!form) {
        return <Spinner />;
    }

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;

        setIsBusy(true);
        toast.processing();

        request('PUT', endpoint(`/api/v1/fo-kabel-odcs/${id}`), form)
            .then(() => {
                toast.success('updated_kabel_odc');
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
        { name: t('FO Kabel ODC')!, href: '/fo-kabel-odcs' },
        { name: t('edit kabel odc')!, href: `/fo-kabel-odcs/${id}/edit` },
    ];

    return (
        <Default
            title={t('edit kabel odc')!}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoKabelOdc
                        form={form}
                        setForm={setForm as any}
                        errors={errors}
                        odcs={odcs}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
